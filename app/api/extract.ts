import Anthropic from "@anthropic-ai/sdk";
import { EXTRACT_SCHEMAS, extractDocument, hasKey, type ExtractKind } from "../server/claude";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export async function POST(request: Request): Promise<Response> {
  if (!hasKey()) return Response.json({ error: "no_key" }, { status: 503 });
  let body: { kind?: string; mediaType?: string; data?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const kind = body.kind as ExtractKind;
  if (!(kind in EXTRACT_SCHEMAS)) return Response.json({ error: "bad_kind" }, { status: 400 });
  try {
    if (body.text) return Response.json({ fields: await extractDocument(kind, { text: body.text.slice(0, 20000) }) });
    if (!body.data || !body.mediaType || !ALLOWED.has(body.mediaType)) return Response.json({ error: "bad_file" }, { status: 400 });
    return Response.json({ fields: await extractDocument(kind, { mediaType: body.mediaType, data: body.data }) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return Response.json({ error: "rate_limited" }, { status: 429 });
    if (err instanceof Anthropic.APIError) return Response.json({ error: "upstream", status: err.status }, { status: 502 });
    return Response.json({ error: "extract_failed", message: (err as Error).message }, { status: 500 });
  }
}
