import Anthropic from "@anthropic-ai/sdk";
import { EXTRACT_SCHEMAS, extractDocument, hasKey, type ExtractKind } from "../server/claude";
import { allow, clientIp } from "../server/limit";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
// Vercel caps request bodies at 4.5 MB; base64 adds a third.
const MAX_B64 = 4_400_000;

export async function POST(request: Request): Promise<Response> {
  if (!hasKey()) return Response.json({ error: "no_key" }, { status: 503 });
  if (!allow(`extract:${clientIp(request)}`, 10)) return Response.json({ error: "rate_limited" }, { status: 429 });
  let body: { kind?: unknown; mediaType?: unknown; data?: unknown; text?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object") throw new Error();
    body = parsed as typeof body;
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const kind = body.kind;
  if (typeof kind !== "string" || !Object.hasOwn(EXTRACT_SCHEMAS, kind)) return Response.json({ error: "bad_kind" }, { status: 400 });
  try {
    if (typeof body.text === "string" && body.text.trim()) {
      return Response.json({ fields: await extractDocument(kind as ExtractKind, { text: body.text.slice(0, 20000) }) });
    }
    const { data, mediaType } = body;
    if (typeof data !== "string" || !data || typeof mediaType !== "string" || !ALLOWED.has(mediaType)) return Response.json({ error: "bad_file" }, { status: 400 });
    if (data.length > MAX_B64) return Response.json({ error: "too_large" }, { status: 413 });
    return Response.json({ fields: await extractDocument(kind as ExtractKind, { mediaType, data }) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "rate_limited" }, { status: 429 });
    if (err instanceof Anthropic.APIError) return Response.json({ error: "upstream", status: err.status }, { status: 502 });
    return Response.json({ error: "extract_failed" }, { status: 500 });
  }
}
