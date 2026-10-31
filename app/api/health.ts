import { hasKey, modelName, provider } from "../server/llm";

export function GET(): Response {
  return Response.json({ live: hasKey(), provider: provider(), model: modelName() });
}
