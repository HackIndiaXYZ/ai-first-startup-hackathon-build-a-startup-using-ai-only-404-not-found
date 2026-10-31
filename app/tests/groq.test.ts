// The OpenAI-compatible path (Groq, xAI Grok) with fetch mocked: provider
// choice, the tool loop, document extraction, and error mapping.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as agentPOST } from "../api/agent";
import { POST as extractPOST } from "../api/extract";
import { GET as healthGET } from "../api/health";
import { extractDocument, hasKey, modelName, provider, runAgent } from "../server/llm";

const KEYS = ["GROQ_API_KEY", "GROQ_MODEL", "GROQ_VISION_MODEL", "XAI_API_KEY", "XAI_MODEL", "GROK_API_KEY", "ANTHROPIC_API_KEY"];
const fetchMock = vi.fn();

type Call = { id: string; name: string; args: Record<string, unknown> | string };
const answer = (content: string | null, calls: Call[] = []) =>
  new Response(
    JSON.stringify({
      model: "openai/gpt-oss-120b",
      choices: [
        {
          finish_reason: calls.length ? "tool_calls" : "stop",
          message: {
            content,
            tool_calls: calls.length
              ? calls.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: typeof c.args === "string" ? c.args : JSON.stringify(c.args) } }))
              : undefined,
          },
        },
      ],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
const body = (i: number) => JSON.parse(fetchMock.mock.calls[i][1].body as string);

let ip = 0;
const post = (b: unknown) => new Request("http://x/api", { method: "POST", headers: { "x-forwarded-for": `10.9.0.${++ip % 250}` }, body: JSON.stringify(b) });

beforeEach(() => {
  for (const k of KEYS) delete process.env[k];
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("provider choice", () => {
  it("is off with no key", () => {
    expect(provider()).toBeNull();
    expect(hasKey()).toBe(false);
  });
  it("prefers xAI, then Groq, then Claude", () => {
    process.env.ANTHROPIC_API_KEY = "a";
    expect(provider()).toBe("anthropic");
    process.env.GROQ_API_KEY = "g";
    expect(provider()).toBe("groq");
    expect(modelName()).toBe("openai/gpt-oss-120b");
    process.env.GROK_API_KEY = "x";
    expect(provider()).toBe("xai");
    process.env.XAI_MODEL = "grok-test";
    expect(modelName()).toBe("grok-test");
  });
  it("ignores a blank key", () => {
    process.env.GROQ_API_KEY = "   ";
    expect(provider()).toBeNull();
  });
  it("health names the provider and model", async () => {
    process.env.GROQ_API_KEY = "g";
    process.env.GROQ_MODEL = "openai/gpt-oss-120b";
    expect(await healthGET().json()).toEqual({ live: true, provider: "groq", model: "openai/gpt-oss-120b" });
  });
});

describe("Groq agent loop", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "gsk_test";
  });

  it("sends tools in OpenAI format, runs them, and returns the final reply", async () => {
    fetchMock
      .mockResolvedValueOnce(answer(null, [{ id: "c1", name: "compute_subsidy", args: { kw: 3, state_code: "DL" } }]))
      .mockResolvedValueOnce(answer("You get the central subsidy."));
    const r = await runAgent([{ role: "user", text: "Delhi 3 kW subsidy?" }]);
    expect(r.text).toBe("You get the central subsidy.");
    expect(r.trace).toEqual([expect.objectContaining({ tool: "compute_subsidy", ok: true })]);
    expect(r.trace[0].summary).toMatch(/₹/);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer gsk_test");
    const first = body(0);
    expect(first.tools).toHaveLength(7);
    expect(first.tools[0]).toMatchObject({ type: "function", function: { name: "get_irradiance" } });
    expect(first.messages[0]).toMatchObject({ role: "system" });
    expect(first.messages[0].content).toMatch(/Never do the arithmetic yourself/);

    const second = body(1).messages;
    expect(second.at(-2)).toMatchObject({ role: "assistant", tool_calls: [{ id: "c1" }] });
    expect(second.at(-1)).toMatchObject({ role: "tool", tool_call_id: "c1" });
  });

  it("survives malformed tool arguments and unknown tools", async () => {
    fetchMock
      .mockResolvedValueOnce(answer(null, [{ id: "a", name: "size_system", args: "{oops" }, { id: "b", name: "no_such_tool", args: {} }]))
      .mockResolvedValueOnce(answer("Tell me your city."));
    const r = await runAgent([{ role: "user", text: "size it" }]);
    expect(r.trace.map((t) => t.ok)).toEqual([false, false]);
    expect(r.text).toBe("Tell me your city.");
  });

  it("stops after 8 steps", async () => {
    fetchMock.mockImplementation(async () => answer(null, [{ id: "x", name: "search_knowledge", args: { query: "dcr" } }]));
    const r = await runAgent([{ role: "user", text: "loop" }]);
    expect(fetchMock).toHaveBeenCalledTimes(8);
    expect(r.text).toMatch(/too many steps/);
  });

  it("never returns an empty answer", async () => {
    fetchMock.mockResolvedValueOnce(answer("   "));
    expect((await runAgent([{ role: "user", text: "?" }])).text).toBe("Done.");
  });

  it("uses xAI's endpoint for a Grok key", async () => {
    process.env.XAI_API_KEY = "xai-test";
    fetchMock.mockResolvedValueOnce(answer("ok"));
    await runAgent([{ role: "user", text: "hi" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.x.ai/v1/chat/completions");
    expect(body(0).model).toBe("grok-4");
  });
});

describe("Groq document extraction", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "gsk_test";
  });

  it("asks for JSON and keeps only the schema's keys", async () => {
    fetchMock.mockResolvedValueOnce(answer('Here you go: {"system_kw": 3, "total_price": 195000, "hacked": true}'));
    const f = await extractDocument("quote", { text: "3 kW for Rs 1,95,000" });
    expect(f.system_kw).toBe(3);
    expect(f.total_price).toBe(195000);
    expect(f.dcr).toBeNull();
    expect(f).not.toHaveProperty("hacked");
    const b = body(0);
    expect(b.response_format).toEqual({ type: "json_object" });
    expect(b.messages[0].content).toContain("<document>");
  });

  it("refuses PDFs and photos it can't read, so the browser reads them instead", async () => {
    await expect(extractDocument("bill", { mediaType: "application/pdf", data: "JVBERi0=" })).rejects.toMatchObject({ status: 415 });
    await expect(extractDocument("bill", { mediaType: "image/png", data: "iVBORw0=" })).rejects.toMatchObject({ status: 415 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends photos when a vision model is set", async () => {
    process.env.GROQ_VISION_MODEL = "vision-model";
    fetchMock.mockResolvedValueOnce(answer('{"units": 412}'));
    const f = await extractDocument("bill", { mediaType: "image/png", data: "iVBORw0=" });
    expect(f.units).toBe(412);
    expect(body(0).model).toBe("vision-model");
    expect(body(0).messages[0].content[0]).toMatchObject({ type: "image_url" });
  });
});

describe("HTTP handlers on Groq", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "gsk_secret_value";
  });

  it("answers through the agent", async () => {
    fetchMock.mockResolvedValueOnce(answer("Namaste"));
    const r = await agentPOST(post({ messages: [{ role: "user", text: "hi" }] }));
    expect(r.status).toBe(200);
    expect((await r.json()).text).toBe("Namaste");
  });

  it("maps upstream errors without leaking the key or the provider's message", async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"error":{"message":"Invalid API Key gsk_secret_value"}}', { status: 401 }));
    const r = await agentPOST(post({ messages: [{ role: "user", text: "a" }] }));
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toMatch(/gsk_|Invalid/);

    fetchMock.mockResolvedValueOnce(new Response("slow down", { status: 429 }));
    expect((await agentPOST(post({ messages: [{ role: "user", text: "a" }] }))).status).toBe(429);

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("timed out"), { name: "TimeoutError" }));
    expect((await agentPOST(post({ messages: [{ role: "user", text: "a" }] }))).status).toBe(504);
  });

  it("extract: 415 for a PDF, so the browser falls back", async () => {
    const r = await extractPOST(post({ kind: "bill", mediaType: "application/pdf", data: "JVBERi0=" }));
    expect(r.status).toBe(415);
  });
});
