// Packages the static site and the three API functions in Vercel's Build
// Output API v3 format (.vercel/output). Each function is a self-contained
// esbuild bundle behind a tiny Node (req, res) → web Request/Response adapter,
// so deploys don't depend on how the platform compiles TypeScript.
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, ".vercel/output");
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "static"), { recursive: true });
cpSync(join(root, "dist"), join(out, "static"), { recursive: true });

for (const name of ["health", "agent", "extract"]) {
  const dir = join(out, "functions/api", `${name}.func`);
  mkdirSync(dir, { recursive: true });
  const entry = join(root, `.vercel-entry-${name}.mjs`);
  writeFileSync(
    entry,
    `import * as h from "./api/${name}.ts";
export default async function handler(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const method = req.method || "GET";
  const fn = h[method];
  if (!fn) { res.statusCode = 405; res.end(); return; }
  const request = new Request("https://local" + req.url, {
    method,
    headers: { "content-type": req.headers["content-type"] || "application/json" },
    body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
  });
  const response = await fn(request);
  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await response.arrayBuffer()));
}
`,
  );
  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    outfile: join(dir, "index.mjs"),
    banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
    logLevel: "warning",
  });
  rmSync(entry);
  writeFileSync(
    join(dir, ".vc-config.json"),
    JSON.stringify({ runtime: "nodejs20.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 60 }, null, 2),
  );
}
writeFileSync(join(out, "config.json"), JSON.stringify({ version: 3 }, null, 2));
console.log("wrote", out);
