// Renders the still images the site and deck use, at full render quality,
// on the virtual clock (see lib/virtual-time.mjs):
//   public/poster.jpg       the no-WebGL fallback behind the landing story
//   public/og.png           the social share card
//   public/deck/report.jpg  Roof Report screenshot for the deck
//   public/deck/quote.jpg   Quote Check screenshot for the deck
// Usage: node scripts/shoot-stills.mjs [baseUrl] [poster|og|report|quote ...]
//        (needs `vite preview`; with no names, renders all four)

import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { VIRTUAL_TIME } from "./lib/virtual-time.mjs";

const BASE = process.argv[2] ?? "http://localhost:4173/";
const ONLY = process.argv.slice(3);
const want = (name) => !ONLY.length || ONLY.includes(name);
const PUB = new URL("../public/", import.meta.url).pathname;
const CHROME = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath: CHROME, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"] });

async function page(width, height, hash) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  await ctx.addInitScript(VIRTUAL_TIME);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("pageerror:", e.message));
  await p.goto(`${BASE}${hash}`, { waitUntil: "load" });
  const step = async (sec) => {
    for (let i = 0; i < sec * 30; i++) await p.evaluate(() => window.__vt.step(1000 / 30));
  };
  // Run the clock until the preloader (if any) has gone and things have settled.
  // (The route must have mounted first, or "no preloader" is true immediately.)
  for (let i = 0; i < 900 && !(await p.evaluate(() => !!document.querySelector("main h1") && !document.querySelector(".pre"))); i++) await p.evaluate(() => window.__vt.step(1000 / 30));
  await step(2.5);
  await p.addStyleTag({ content: ".grain,.cursor{display:none!important}" });
  // Playwright's own screenshot waits for an animation frame that the frozen
  // clock never delivers, so capture through DevTools directly.
  const cdp = await ctx.newCDPSession(p);
  const shot = async (path) => {
    const format = path.endsWith(".png") ? "png" : "jpeg";
    const { data } = await cdp.send("Page.captureScreenshot", format === "png" ? { format } : { format, quality: 84 });
    writeFileSync(path, Buffer.from(data, "base64"));
  };
  return { p, step, ctx, shot };
}

// Poster: the dawn rooftop alone, no text.
if (want("poster")) {
  const { p, step, ctx, shot } = await page(1600, 1000, "#/");
  await p.addStyleTag({ content: ".story__scrim,.hud,.chapters,.story__foot,.story__dial,.nav{visibility:hidden!important}" });
  await p.evaluate(() => window.scrollTo(0, 260));
  await step(2);
  await shot(`${PUB}poster.jpg`);
  await ctx.close();
  console.log("poster.jpg");
}

// Social card: the hero as people first see it.
if (want("og")) {
  const { p, ctx, shot } = await page(1200, 630, "#/");
  await p.addStyleTag({ content: ".story__foot,.story__dial{visibility:hidden!important} .hero__lede,.hero__ctas,.hero__fact{display:none!important}" });
  await shot(`${PUB}og.png`);
  await ctx.close();
  console.log("og.png");
}

// Deck screenshots.
for (const [file, hash, y] of [
  ["deck/report.jpg", "#/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may", 0],
  ["deck/quote.jpg", "#/quote?sample=overcharger", 0],
].filter(([f]) => want(f.split("/")[1].split(".")[0]))) {
  const { p, step, ctx, shot } = await page(1440, 900, hash);
  if (y) await p.evaluate((v) => window.scrollTo(0, v), y);
  await step(1.5);
  await shot(`${PUB}${file}`);
  await ctx.close();
  console.log(file);
}

await browser.close();
