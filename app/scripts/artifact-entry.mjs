// Writes dist/artifact.html: the entry fragment used for the claude.ai live
// preview (the host supplies <html>/<head>/<body>). Also escapes a raw ESC
// byte that pdf.js ships inside a string literal, which the host rejects.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const html = readFileSync(join(dist, "index.html"), "utf8");
const pick = (re) => [...html.matchAll(re)].map((m) => m[1]);
const css = pick(/<link rel="stylesheet"[^>]*href="([^"]+)"/g);
const js = pick(/<script type="module"[^>]*src="([^"]+)"/g);
const pre = pick(/<link rel="modulepreload"[^>]*href="([^"]+)"/g);
const out = [
  "<title>Chhat</title>",
  '<meta name="description" content="Independent AI solar advisor for Indian homes: roof report, quote check, bill audit.">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Geist+Mono:wght@400;600&family=Tiro+Devanagari+Hindi&display=swap">',
  ...pre.map((p) => `<link rel="modulepreload" crossorigin href="${p}">`),
  ...css.map((c) => `<link rel="stylesheet" crossorigin href="${c}">`),
  '<div id="root"></div>',
  ...js.map((s) => `<script type="module" crossorigin src="${s}"></script>`),
].join("\n");
writeFileSync(join(dist, "artifact.html"), out + "\n");

for (const f of readdirSync(join(dist, "assets"))) {
  if (!/\.(m?js|css)$/.test(f)) continue;
  const p = join(dist, "assets", f);
  const s = readFileSync(p, "latin1");
  if (s.includes("\x1b")) writeFileSync(p, s.replaceAll('"\x1b"', '"\\x1b"'), "latin1");
}
console.log("wrote dist/artifact.html");
