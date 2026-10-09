import { hasKey, MODEL } from "../server/claude";

export function GET(): Response {
  return Response.json({ live: hasKey(), model: hasKey() ? MODEL : null });
}
