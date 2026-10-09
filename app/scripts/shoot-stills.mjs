// Renders the still images the site and deck use, at full render quality,
// on the virtual clock (see lib/virtual-time.mjs):
//   public/poster.jpg       the no-WebGL fallback behind the landing story
//   public/og.png           the social share card
//   public/deck/report.jpg  Roof Report screenshot for the deck
//   public/deck/quote.jpg   Quote Check screenshot for the deck
// Usage: node scripts/shoot-stills.mjs [baseUrl]   (needs `vite preview` on :4173)

import { chromium } from "playwright-core";
import { VIRTUAL_TIME } from "./lib/virtual-time.mjs";

const BASE = process.argv[2] ?? "http://localhost:4173/";
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
  for (let i = 0; i < 900 && (await p.evaluate(() => !!document.querySelector(".pre"))); i++) await p.evaluate(() => window.__vt.step(1000 / 30));
  await step(2.5);
  await p.addStyleTag({ content: ".grain,.cursor{display:none!important}" });
  return { p, step, ctx };
}

// Poster: the dawn rooftop alone, no text.
{
  const { p, step, ctx } = await page(1600, 1000, "#/");
  await p.addStyleTag({ content: ".story__scrim,.hud,.chapters,.story__foot,.story__dial,.nav{visibility:hidden!important}" });
  await p.evaluate(() => window.scrollTo(0, 260));
  await step(2);
  await p.locator(".story__stage").screenshot({ path: `${PUB}poster.jpg`, type: "jpeg", quality: 82 });
  await ctx.close();
  console.log("poster.jpg");
}

// Social card: the hero as people first see it.
{
  const { p, ctx } = await page(1200, 630, "#/");
  await p.addStyleTag({ content: ".story__foot,.story__dial{visibility:hidden!important} .hero__lede,.hero__ctas,.hero__fact{display:none!important}" });
  await p.screenshot({ path: `${PUB}og.png` });
  await ctx.close();
  console.log("og.png");
}

// Deck screenshots.
for (const [file, hash, y] of [
  ["deck/report.jpg", "#/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may", 0],
  ["deck/quote.jpg", "#/quote?sample=overcharger", 0],
]) {
  const { p, step, ctx } = await page(1440, 900, hash);
  if (y) await p.evaluate((v) => window.scrollTo(0, v), y);
  await step(1.5);
  await p.screenshot({ path: `${PUB}${file}`, type: "jpeg", quality: 84 });
  await ctx.close();
  console.log(file);
}

await browser.close();
