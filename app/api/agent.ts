import Anthropic from "@anthropic-ai/sdk";
import { hasKey, runAgent } from "../server/claude";

export async function POST(request: Request): Promise<Response> {
  if (!hasKey()) return Response.json({ error: "no_key" }, { status: 503 });
  let body: { messages?: { role: "user" | "assistant"; text: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const messages = (body.messages ?? []).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.length < 4000,
  );
  if (!messages.length) return Response.json({ error: "empty" }, { status: 400 });
  try {
    return Response.json(await runAgent(messages));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "rate_limited" }, { status: 429 });
    if (err instanceof Anthropic.APIError) return Response.json({ error: "upstream", status: err.status }, { status: 502 });
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
