// Runs the live AI path once, with whatever key is in the environment
// (GROQ_API_KEY, XAI_API_KEY or ANTHROPIC_API_KEY). Prints OK or FAIL per call
// and never prints the key.
//
//   npm run smoke:llm
import { build } from "esbuild";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("..", import.meta.url));
// Keys in app/.env.local win over stale ones left in the terminal.
const envFile = join(root, ".env.local");
if (existsSync(envFile)) Object.assign(process.env, parseEnv(readFileSync(envFile, "utf8")));
const dir = mkdtempSync(join(tmpdir(), "chhat-smoke-"));
const out = join(dir, "llm.mjs");
await build({
  entryPoints: [join(root, "server/llm.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
  logLevel: "error",
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
});
const llm = await import(pathToFileURL(out).href);

console.log(`provider: ${llm.provider() ?? "none"} · model: ${llm.modelName() ?? "-"}`);
if (!llm.hasKey()) {
  console.log("FAIL no key: set GROQ_API_KEY (or XAI_API_KEY) in this terminal or in .env.local first");
  process.exit(1);
}

let failed = 0;
async function step(name, fn) {
  const t0 = Date.now();
  try {
    const detail = await fn();
    console.log(`OK   ${name} (${Date.now() - t0} ms) ${detail}`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}: ${err.status ? `HTTP ${err.status} ` : ""}${String(err.message).slice(0, 200)}`);
  }
}

await step("agent: Pune, 420 units a month", async () => {
  const r = await llm.runAgent([{ role: "user", text: "Pune, 420 units a month, 600 sq ft roof. Is solar worth it?" }]);
  if (!r.trace.length) throw new Error(`no tool was called. Reply: ${r.text.slice(0, 120)}`);
  return `tools: ${r.trace.map((t) => t.tool).join(", ")} · reply: ${r.text.replace(/\s+/g, " ").slice(0, 100)}…`;
});

await step("extract: quote text", async () => {
  const f = await llm.extractDocument("quote", {
    text: "SunRise Solar (fictional). 3 kW on-grid system, 6 x 540 W DCR panels, Growatt 3 kW inverter, HDG structure. Total Rs 1,95,000 incl. GST @ 8.9%. 50% advance.",
  });
  if (f.system_kw !== 3) throw new Error(`system_kw read as ${f.system_kw}`);
  return `system_kw=${f.system_kw} total_price=${f.total_price} dcr=${f.dcr}`;
});

rmSync(dir, { recursive: true, force: true });
console.log(failed ? `${failed} failed` : "all OK");
process.exit(failed ? 1 : 0);
