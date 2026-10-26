// Bundle budget for the production build (run after `npm run build`).
// Fails if the first paint gets heavier than it needs to be.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

const DIST = new URL("../dist/", import.meta.url).pathname;
const html = readFileSync(`${DIST}index.html`, "utf8");
const assets = readdirSync(`${DIST}assets`);
const gz = (f) => gzipSync(readFileSync(`${DIST}assets/${f}`)).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

// What index.html loads before anything else (entry script, preloads, CSS).
const entry = [...html.matchAll(/(?:src|href)="\.\/assets\/([^"]+)"/g)].map((m) => m[1]);
const entryJs = entry.filter((f) => f.endsWith(".js")).reduce((n, f) => n + gz(f), 0);
const entryCss = entry.filter((f) => f.endsWith(".css")).reduce((n, f) => n + gz(f), 0);
const landing = assets.filter((f) => /^Landing-.*\.js$/.test(f)).reduce((n, f) => n + gz(f), 0);
const three = assets.filter((f) => /^(assets|RoofScene)-.*\.js$/.test(f)).reduce((n, f) => n + gz(f), 0);
const models = readdirSync(new URL("../public/models/", import.meta.url).pathname)
  .filter((f) => f.endsWith(".glb"))
  .reduce((n, f) => n + statSync(new URL(`../public/models/${f}`, import.meta.url)).size, 0);

const rows = [
  ["Entry JS (gzip)", entryJs, 200 * 1024],
  ["Entry CSS (gzip)", entryCss, 50 * 1024],
  ["Landing route JS (gzip)", landing, 30 * 1024],
  ["3D chunks, lazy (gzip)", three, 450 * 1024],
  ["CC0 models (meshopt)", models, 700 * 1024],
];
let fail = false;
for (const [name, size, max] of rows) {
  const ok = size <= max;
  fail ||= !ok;
  console.log(`${ok ? "ok  " : "FAIL"} ${name.padEnd(26)} ${kb(size).padStart(10)}  budget ${kb(max)}`);
}
// three.js must not be on the critical path.
const threeOnEntry = entry.some((f) => /^(assets|RoofScene)-/.test(f));
console.log(`${threeOnEntry ? "FAIL" : "ok  "} three.js stays off the entry path`);
if (fail || threeOnEntry) process.exit(1);
