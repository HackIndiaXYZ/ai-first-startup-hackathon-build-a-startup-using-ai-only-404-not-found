// Which language model the server talks to, picked from environment variables.
//
//   XAI_API_KEY (or GROK_API_KEY)  → xAI Grok      (model: XAI_MODEL,  default grok-4)
//   GROQ_API_KEY                   → GroqCloud     (model: GROQ_MODEL, default openai/gpt-oss-120b)
//   ANTHROPIC_API_KEY              → Claude        (see claude.ts)
//
// The first one set wins. With none set, the site runs fully on-device.
// xAI and Groq both speak the OpenAI chat-completions format, so one client
// serves both. Keys are read here, on the server, and never sent to a browser.
//
// As in claude.ts, the model only chooses tools and writes prose: every rupee,
// kW and unit figure comes from runTool(), the tested engine.

import * as claude from "./claude";
import { runTool, TOOL_SCHEMAS } from "../src/ai/tools";

export type Provider = "xai" | "groq" | "anthropic";
export type ChatTurn = claude.ChatTurn;
export type AgentResult = claude.AgentResult;
export type TraceStep = claude.TraceStep;
export type ExtractKind = claude.ExtractKind;
export const EXTRACT_SCHEMAS = claude.EXTRACT_SCHEMAS;

const env = (k: string) => (typeof process !== "undefined" ? process.env[k]?.trim() : undefined) || undefined;

interface OpenAIConfig {
  provider: "xai" | "groq";
  baseUrl: string;
  key: string;
  model: string;
  /** Model used for photos; null when the provider's default can't read images */
  visionModel: string | null;
}

function openAIConfig(): OpenAIConfig | null {
  const xai = env("XAI_API_KEY") ?? env("GROK_API_KEY");
  if (xai) {
    const model = env("XAI_MODEL") ?? "grok-4";
    return { provider: "xai", baseUrl: "https://api.x.ai/v1", key: xai, model, visionModel: env("XAI_VISION_MODEL") ?? model };
  }
  const groq = env("GROQ_API_KEY");
  if (groq) {
    return {
      provider: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      key: groq,
      model: env("GROQ_MODEL") ?? "openai/gpt-oss-120b",
      visionModel: env("GROQ_VISION_MODEL") ?? null,
    };
  }
  return null;
}

export function provider(): Provider | null {
  if (openAIConfig()) return openAIConfig()!.provider;
  if (claude.hasKey()) return "anthropic";
  return null;
}

export function hasKey(): boolean {
  return provider() !== null;
}

export function modelName(): string | null {
  const c = openAIConfig();
  if (c) return c.model;
  return claude.hasKey() ? claude.MODEL : null;
}

/** An upstream API answered with an error status. */
export class UpstreamError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/* -------------------------------------------------------------------------- */
/* OpenAI-compatible client (xAI, Groq)                                       */
/* -------------------------------------------------------------------------- */

type OAToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type OAMessage =
  | { role: "system" | "user"; content: string | unknown[] }
  | { role: "assistant"; content: string | null; tool_calls?: OAToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

interface OAResponse {
  model?: string;
  choices: { finish_reason: string; message: { content: string | null; tool_calls?: OAToolCall[] } }[];
}

const TIMEOUT_MS = 25_000;

async function chat(c: OpenAIConfig, body: Record<string, unknown>): Promise<OAResponse> {
  const res = await fetch(`${c.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${c.key}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    // The body can name the model or the problem; it never holds our key.
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new UpstreamError(res.status, detail || res.statusText);
  }
  return (await res.json()) as OAResponse;
}

const OA_TOOLS = TOOL_SCHEMAS.map((t) => ({
  type: "function" as const,
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}));

const SYSTEM = `You are Chhat, an independent rooftop-solar advisor for Indian homes. You don't sell panels.

How you work:
- Every rupee figure, kW size, unit count, subsidy or payback you state must come from a tool result in this conversation. Call size_system, compute_subsidy, finance_options, audit_quote, audit_bill or get_irradiance instead of estimating. Never do the arithmetic yourself.
- For rules and process questions (subsidy rules, DCR, ALMM, net metering, loans, vendors, GST, timelines, maintenance, wrong bills), call search_knowledge first and cite the source it returns.
- If you need a number the user hasn't given (city, monthly units), ask one short question. If they give a bill amount instead of units, you may estimate units by dividing by the state tariff and say you did. Don't ask which month a bill is from; use the current month.
- Reply in the language and script of the user's latest message. Default to English: a city name or an Indian context is not a reason to switch. Hindi in Devanagari only if the message is written in Hindi; Hinglish only if it is written in Hinglish. Use gender-neutral Hindi phrasing for yourself.
- Be brief and concrete: 2 to 6 sentences, or a short list. Indian number formatting (₹1,23,456; lakh).
- Mention that figures are estimates when giving money projections, once, briefly.
- When a quote or bill needs a full audit, suggest the Quote Check or Bill Audit page in the app.`;

function parseArgs(raw: string): Record<string, unknown> {
  try {
    const v: unknown = JSON.parse(raw || "{}");
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function runOpenAIAgent(c: OpenAIConfig, history: ChatTurn[]): Promise<AgentResult> {
  const turns = claude.toMessages(history) as { role: "user" | "assistant"; content: string }[];
  if (!turns.length) throw new Error("empty_conversation");
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const messages: OAMessage[] = [{ role: "system", content: `${SYSTEM}\n\nToday is ${today} (India). The current month number is ${Number(new Date().toLocaleDateString("en-US", { month: "numeric", timeZone: "Asia/Kolkata" }))}.` }, ...turns];
  const trace: TraceStep[] = [];
  let model = c.model;

  for (let step = 0; step < 8; step++) {
    const r = await chat(c, { model: c.model, messages, tools: OA_TOOLS, tool_choice: "auto", max_tokens: 1500, temperature: 0.2 });
    model = r.model ?? model;
    const msg = r.choices[0]?.message;
    if (!msg) throw new UpstreamError(502, "no_choices");
    const calls = msg.tool_calls ?? [];
    if (!calls.length) return { text: (msg.content ?? "").trim() || "Done.", trace, model };

    messages.push({ role: "assistant", content: msg.content ?? null, tool_calls: calls });
    for (const call of calls) {
      const args = parseArgs(call.function.arguments);
      const result = runTool(call.function.name, args);
      trace.push({ tool: call.function.name, args, summary: result.summary, ok: result.ok });
      messages.push({ role: "tool", tool_call_id: call.id, content: result.summary });
    }
  }
  return { text: "That took too many steps. Try asking one thing at a time.", trace, model };
}

const INSTRUCTIONS: Record<ExtractKind, string> = {
  bill: "This is an Indian electricity (DISCOM) bill.",
  "solar-bill":
    "This is an Indian net-metered electricity bill for a home with rooftop solar. Import is energy drawn from the grid, export is energy injected, previous_credit is banked units carried forward, net_units_billed is the units actually charged.",
  quote:
    "This is a rooftop-solar installation quotation from an Indian vendor. Map structure: hot-dip galvanized/GI → hdg, ZAM → zam, aluminium → aluminium, painted MS/mild steel → ms-painted, otherwise unknown.",
};

async function extractOpenAI(c: OpenAIConfig, kind: ExtractKind, input: { mediaType: string; data: string } | { text: string }) {
  const schema = EXTRACT_SCHEMAS[kind];
  const ask = `${INSTRUCTIONS[kind]} Extract the fields as one JSON object with exactly these keys: ${Object.keys(schema.properties).join(", ")}. Use null for anything not printed. Do not guess numbers. Reply with the JSON object only.`;
  let model = c.model;
  let content: string | unknown[];
  if ("text" in input) {
    content = `<document>\n${input.text}\n</document>\n\n${ask}`;
  } else {
    // PDFs are turned into text in the browser before they reach us.
    if (input.mediaType === "application/pdf" || !c.visionModel) throw new UpstreamError(415, "unsupported_media");
    model = c.visionModel;
    content = [
      { type: "image_url", image_url: { url: `data:${input.mediaType};base64,${input.data}` } },
      { type: "text", text: ask },
    ];
  }
  const r = await chat(c, { model, messages: [{ role: "user", content }], response_format: { type: "json_object" }, max_tokens: 1024, temperature: 0 });
  const text = r.choices[0]?.message.content ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json) as Record<string, unknown>;
  // Keep only the schema's keys, so a chatty model can't add fields.
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(schema.properties)) out[k] = parsed[k] ?? null;
  return out;
}

/* -------------------------------------------------------------------------- */
/* Public entry points                                                        */
/* -------------------------------------------------------------------------- */

export function runAgent(history: ChatTurn[]): Promise<AgentResult> {
  const c = openAIConfig();
  return c ? runOpenAIAgent(c, history) : claude.runAgent(history);
}

export function extractDocument(kind: ExtractKind, input: { mediaType: string; data: string } | { text: string }): Promise<Record<string, unknown>> {
  const c = openAIConfig();
  return c ? extractOpenAI(c, kind, input) : claude.extractDocument(kind, input);
}

/** Map any upstream failure onto a small JSON error for the browser. */
export function errorResponse(err: unknown, fallback: string): Response {
  const status = (err as { status?: number })?.status;
  if ((err as Error)?.name === "TimeoutError") return Response.json({ error: "timeout" }, { status: 504 });
  if (status === 429) return Response.json({ error: "rate_limited" }, { status: 429 });
  if (status === 415) return Response.json({ error: "unsupported_media" }, { status: 415 });
  if (typeof status === "number") return Response.json({ error: "upstream", status }, { status: 502 });
  if ((err as Error)?.message === "empty_conversation") return Response.json({ error: "empty" }, { status: 400 });
  return Response.json({ error: fallback }, { status: 500 });
}
