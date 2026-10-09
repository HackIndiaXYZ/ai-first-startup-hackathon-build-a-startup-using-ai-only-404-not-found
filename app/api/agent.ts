import Anthropic from "@anthropic-ai/sdk";
import { hasKey, runAgent, type ChatTurn } from "../server/claude";
import { allow, clientIp } from "../server/limit";

const MAX_TEXT = 4000;

export async function POST(request: Request): Promise<Response> {
  if (!hasKey()) return Response.json({ error: "no_key" }, { status: 503 });
  if (!allow(`agent:${clientIp(request)}`, 20)) return Response.json({ error: "rate_limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const raw = body && typeof body === "object" ? (body as { messages?: unknown }).messages : undefined;
  if (!Array.isArray(raw)) return Response.json({ error: "bad_messages" }, { status: 400 });
  const messages: ChatTurn[] = raw
    .slice(-40)
    .filter((m): m is ChatTurn => Boolean(m) && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_TEXT) }));
  if (!messages.some((m) => m.role === "user" && m.text.trim())) return Response.json({ error: "empty" }, { status: 400 });
  try {
    return Response.json(await runAgent(messages));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "rate_limited" }, { status: 429 });
    if (err instanceof Anthropic.APIError) return Response.json({ error: "upstream", status: err.status }, { status: 502 });
    if ((err as Error).message === "empty_conversation") return Response.json({ error: "empty" }, { status: 400 });
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
