import { defineConfig, type Plugin, type ViteDevServer } from "vitest/config";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

// Serves /api/* from the same web-standard handlers Vercel runs, so live AI
// mode works under `npm run dev` when ANTHROPIC_API_KEY is set.
function localApi(): Plugin {
  return {
    name: "chhat-local-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? "";
        const match = url.match(/^\/api\/(health|agent|extract)\b/);
        if (!match) return next();
        const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
        const handler = mod[req.method ?? "GET"];
        if (!handler) {
          res.statusCode = 405;
          return res.end();
        }
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const request = new Request(`http://localhost${url}`, {
          method: req.method,
          headers: { "content-type": req.headers["content-type"] ?? "application/json" },
          body: req.method === "GET" ? undefined : Buffer.concat(chunks),
        });
        const response: Response = await handler(request);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), localApi()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          motion: ["gsap", "lenis"],
        },
      },
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
