// Records the demo walkthrough to pitch/chhat-demo.mp4 with virtual time.
//
// A software GPU renders the rooftop at about one frame a second, so a real-
// time screen recording stutters. Instead, an init script takes over the
// page's clock (performance.now, Date.now, requestAnimationFrame and timers).
// The recorder advances it exactly 1/FPS of a second, screenshots, repeats.
// GSAP, Lenis and the 3D scene all run on that clock, so the video plays
// back at a smooth, constant frame rate at full render quality. CSS
// transitions run on the compositor's own clock; the Animation domain's
// playback rate is scaled to match the measured frame cost.
//
// Usage (needs `vite preview` on :4173):
//   node scripts/record-demo.mjs                 record every segment, then join
//   node scripts/record-demo.mjs landing report  record only these segments
//   node scripts/record-demo.mjs --join          join recorded segments into the mp4

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { VIRTUAL_TIME } from "./lib/virtual-time.mjs";

const BASE = process.env.DEMO_BASE ?? "http://localhost:4173/";
const FPS = 30;
const W = 1280;
const H = 720;
const OUT = new URL("../../pitch/", import.meta.url).pathname;
const TMP = `${OUT}.video-tmp`;
const CHROME = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";



const OVERLAY_CSS = `
#demo-cap{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:9999;max-width:1000px;
  background:rgba(13,20,40,.9);color:#f3f1ea;font:600 20px/1.4 "Archivo Variable",Archivo,sans-serif;
  padding:12px 20px;border-radius:14px;text-align:center;letter-spacing:-.01em;transition:opacity .3s}
#demo-cap:empty{opacity:0}
#demo-card{position:fixed;inset:0;z-index:10000;background:#121a33;color:#f3f1ea;display:grid;place-content:center;
  text-align:center;gap:18px;font-family:"Archivo Variable",Archivo,sans-serif;transition:opacity .6s}
#demo-card h1{font-size:76px;letter-spacing:-.045em;line-height:.95;margin:0;font-weight:760}
#demo-card p{font-size:24px;opacity:.75;margin:0}
#demo-card .d{font-family:"Tiro Devanagari Hindi",serif;color:#f2b632;font-size:120px;line-height:1}
html.has-cursor,html.has-cursor *{cursor:none!important}`;

/* ------------------------------------------------------------------ */
/* The director: every helper advances time and captures frames        */
/* ------------------------------------------------------------------ */

class Director {
  constructor(page, cdp, dir) {
    this.page = page;
    this.cdp = cdp;
    this.dir = dir;
    this.n = 0;
    this.ema = 1000;
    this.last = Date.now();
    this.captions = [];
  }
  async frame() {
    await this.page.evaluate((ms) => window.__vt.step(ms), 1000 / FPS);
    const { data } = await this.cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 88 });
    writeFileSync(`${this.dir}/f${String(this.n++).padStart(6, "0")}.jpg`, Buffer.from(data, "base64"));
    const t = Date.now();
    this.ema = this.ema * 0.8 + (t - this.last) * 0.2;
    this.last = t;
    const rate = Math.max(0.005, Math.min(1, 1000 / FPS / this.ema));
    await this.cdp.send("Animation.setPlaybackRate", { playbackRate: rate }).catch(() => {});
    if (this.n % 150 === 0) console.log(`  ${this.dir.split("/").pop()}: ${this.n} frames (${(this.n / FPS).toFixed(1)} s), ${Math.round(this.ema)} ms/frame`);
  }
  async hold(sec) {
    for (let i = 0, k = Math.round(sec * FPS); i < k; i++) await this.frame();
  }
  /** Advance until a condition holds in the page (or give up after maxSec). */
  async until(fn, maxSec = 20) {
    for (let i = 0; i < maxSec * FPS; i++) {
      if (await this.page.evaluate(fn)) return;
      await this.frame();
    }
  }
  /** Scroll by `px` with the wheel, spread over `sec` seconds. */
  async wheel(px, sec) {
    const k = Math.max(1, Math.round(sec * FPS));
    for (let i = 0; i < k; i++) {
      await this.page.mouse.wheel(0, px / k);
      await this.frame();
    }
  }
  async glide(x0, y0, x1, y1, sec) {
    const k = Math.max(1, Math.round(sec * FPS));
    for (let i = 1; i <= k; i++) {
      const e = 0.5 - Math.cos((Math.PI * i) / k) / 2;
      await this.page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
      await this.frame();
    }
  }
  async type(text, cps = 14) {
    const every = Math.max(1, Math.round(FPS / cps));
    for (const ch of text) {
      await this.page.keyboard.type(ch);
      for (let i = 0; i < every; i++) await this.frame();
    }
  }
  async css() {
    await this.page.evaluate((c) => {
      if (document.getElementById("demo-css")) return;
      const s = document.createElement("style");
      s.id = "demo-css";
      s.textContent = c;
      document.head.appendChild(s);
    }, OVERLAY_CSS);
  }
  async cap(text) {
    if (text) this.captions.push({ t: +(this.n / FPS).toFixed(2), text });
    await this.css();
    await this.page.evaluate((t) => {
      let el = document.getElementById("demo-cap");
      if (!el) {
        el = document.createElement("div");
        el.id = "demo-cap";
        document.body.appendChild(el);
      }
      el.textContent = t;
    }, text);
  }
  async card(html, sec) {
    await this.css();
    await this.page.evaluate((h) => {
      const el = document.createElement("div");
      el.id = "demo-card";
      el.innerHTML = h;
      document.body.appendChild(el);
    }, html);
    await this.hold(sec);
    await this.page.evaluate(() => (document.getElementById("demo-card").style.opacity = "0"));
    await this.hold(0.6);
    await this.page.evaluate(() => document.getElementById("demo-card")?.remove());
  }
}

async function session(name, url, fn) {
  const dir = `${TMP}/${name}`;
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--hide-scrollbars"] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await ctx.addInitScript(VIRTUAL_TIME);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  [${name}] pageerror: ${e.message}`));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  await page.goto(`${BASE}${url}`, { waitUntil: "load" });
  await page.mouse.move(W * 0.62, H * 0.45);
  const d = new Director(page, cdp, dir);
  const t0 = Date.now();
  await fn(d, page);
  await browser.close();
  writeFileSync(`${TMP}/${name}.captions.json`, JSON.stringify({ frames: d.n, seconds: d.n / FPS, captions: d.captions }, null, 1));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/f%06d.jpg`, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", `${TMP}/${name}.mp4`]);
  console.log(`${name}: ${d.n} frames, ${(d.n / FPS).toFixed(1)} s of video in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
}

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

const preGone = () => !document.querySelector(".pre");
const curtainDone = () => {
  const c = document.querySelector(".curtain");
  return !c || getComputedStyle(c).display === "none";
};

const SEGMENTS = {
  async landing(d, page) {
    // Scroll targets are chapter midpoints (see src/lib/story.ts), measured
    // from the real story height, so captions always match the chapter.
    let range = 0;
    let at = 0;
    const to = async (p, sec) => {
      const y = Math.round(p * range);
      await d.wheel(y - at, sec);
      at = y;
    };
    await d.card(`<div class="d">छत</div><h1>Solar, without<br/>the sales pitch.</h1><p>Chhat · HackIndia AI-First Startup Hackathon 2026 · Team 404 not found</p>`, 4.2);
    await d.until(() => !!document.querySelector("main h1") && !document.querySelector(".pre"), 30);
    range = await page.evaluate(() => document.querySelector(".story").offsetHeight - window.innerHeight);
    await d.hold(1.2);
    await d.cap("Every Indian roof has a number. Chhat finds it from one bill and 20 years of NASA sunlight.");
    await d.glide(W * 0.62, H * 0.45, W * 0.7, H * 0.4, 2.5);
    await d.hold(2.5);
    await d.cap("The sunlight is there. Trust isn't: only 5% of households say they'd install.");
    await to(0.205, 2.2);
    await d.hold(3);
    await d.cap("A real NOAA sun path for Delhi in mid-April. Watch the clock, the sun dial and the shadows.");
    await to(0.365, 2.4);
    await d.hold(2.8);
    await d.cap("Noon: Chhat sizes the system, stacks ₹78,000 + ₹30,000 of subsidy, and the panels go up.");
    await to(0.585, 4.2);
    await d.hold(3.2);
    await d.cap("Then it reads the installer's quote: ₹57,710 over, subsidy-killing panels, 0.3 kW missing.");
    await to(0.685, 2.2);
    await d.hold(3.6);
    await d.cap("After install, it audits every DISCOM bill. MNRE admitted wrong bills in July 2026.");
    await to(0.86, 2.8);
    await d.hold(3);
    await d.cap("Sunset. The lantern and the Diwali lights come on. Two minutes, one bill, no login.");
    await to(0.97, 2.4);
    await d.hold(3.4);
    await d.cap("");
    await d.wheel(900, 2);
    await d.cap("Why it exists: the same 3 kW system is quoted anywhere from ₹1.35 to ₹2.1 lakh.");
    await d.wheel(700, 3);
    await d.hold(1.4);
    await d.cap("NASA yield for 72 cities; the marquee speeds up with your scroll.");
    await d.wheel(900, 2.2);
    await d.hold(1.5);
    await d.cap("Four checks between a family and a bad deal.");
    await d.wheel(2600, 6);
    await d.hold(1.2);
    await d.cap("");
  },

  async report(d, page) {
    await d.until(curtainDone, 4);
    await d.hold(1.5);
    await d.cap("The Roof Report reads a sample Delhi bill on-device: 476 units in May.");
    await d.hold(3);
    await d.wheel(380, 1.6);
    await d.cap("The 3D roof uses the real sun path. Scrub the day and the output meter follows.");
    await page.focus('[aria-label="Time of day"]');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("PageDown");
      await d.hold(0.5);
    }
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("PageUp");
      await d.hold(0.4);
    }
    await page.focus('[aria-label="Month"]');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowRight");
      await d.hold(0.45);
    }
    await d.cap("Change the panel count and every number updates.");
    await d.wheel(560, 1.6);
    await page.focus('[aria-label="Number of panels"]');
    for (const k of ["ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"]) {
      await page.keyboard.press(k);
      await d.hold(0.7);
    }
    await d.cap("Generation vs. use, month by month, from 20 years of NASA data.");
    await d.wheel(380, 1.4);
    await d.glide(640, 400, 900, 520, 1.5);
    await d.hold(1.5);
    await d.cap("Subsidy, net cost and the loan: the EMI after subsidy is below the monthly saving.");
    await d.wheel(600, 2);
    await d.hold(2.5);
    await d.cap("25-year cash flow with an inverter swap, then the seven steps on the national portal.");
    await d.wheel(700, 2);
    await d.hold(2);
    await d.cap("");
  },

  async quote(d, page) {
    await d.until(curtainDone, 4);
    await d.hold(1.2);
    await d.cap("Quote Check: 14 checks on the installer's quote. This one gets an F.");
    await d.hold(3.5);
    await d.wheel(300, 1.2);
    await d.cap("₹1.6 lakh at risk: overpriced, non-DCR panels, short capacity, old GST, 70% advance.");
    await d.hold(4);
    await d.wheel(700, 2);
    await d.cap("Every finding cites its rule, and Chhat writes the reply to the vendor, in Hindi too.");
    await d.wheel(900, 2);
    await page.getByRole("radio", { name: "हिंदी" }).click().catch(() => {});
    await d.hold(3.5);
    await d.wheel(-2400, 1.6);
    await d.cap("The fair deal passes. Chhat isn't against installers, only against bad quotes.");
    await page.getByRole("button", { name: /The fair deal/ }).click().catch(() => {});
    await d.hold(4.5);
    await d.cap("Bill Audit next: this DISCOM billed 410 import units and ignored 236 units of export.");
    await page.evaluate(() => (location.hash = "#/bill?sample=import-billed"));
    await d.hold(0.5);
    await d.until(curtainDone, 4);
    await d.hold(3.5);
    await d.wheel(500, 1.6);
    await d.cap("Chhat flags it, plus an unexplained ₹1,180 charge, and drafts the correction letter.");
    await d.hold(3);
    await d.wheel(800, 2);
    await d.hold(2.5);
    await d.wheel(-1300, 1.4);
    await d.cap("A correct bill gets a clean pass, with the arithmetic shown.");
    await page.getByRole("button", { name: /Correct bill/ }).click().catch(() => {});
    await d.hold(4);
    await d.cap("");
  },

  async ask(d, page) {
    await d.until(curtainDone, 4);
    await d.hold(1);
    await d.cap("Ask Chhat in Hindi, Hinglish or English. Every number comes from a tool.");
    const input = page.locator('input[aria-label="Ask Chhat"]').last();
    await input.click();
    await d.type("दिल्ली में 3 kW पर कितनी सब्सिडी मिलेगी?", 16);
    await page.keyboard.press("Enter");
    await d.hold(2.4);
    await page.locator(".trace summary").last().click().catch(() => {});
    await d.hold(2.2);
    await input.click();
    await d.type("Pune, 420 units a month. Worth it?", 18);
    await page.keyboard.press("Enter");
    await d.hold(2.2);
    await page.locator(".trace summary").last().click().catch(() => {});
    await d.cap("Open the trace: the model decides, the tested engine computes. Nothing is invented.");
    await d.hold(4);
    await input.click();
    await d.type("Do I need a battery?", 18);
    await page.keyboard.press("Enter");
    await d.cap("Questions outside the calculator come from a sourced knowledge base, in the same voice.");
    await d.hold(4.5);
    await d.cap("Claude Code built all of it from two briefs. Zero lines of code written by hand.");
    await page.evaluate(() => (location.hash = "#/built-with-ai"));
    await d.hold(0.5);
    await d.until(curtainDone, 4);
    await d.hold(3);
    await d.wheel(1400, 3);
    await d.cap("Research, a 25-idea tournament, plan, code, 3D, tests, financial model, deck: AI-first.");
    await d.hold(2.5);
    await d.wheel(1600, 3);
    await d.hold(1.5);
    await d.cap("");
  },

  async deck(d, page) {
    await d.hold(1.5);
    const notes = {
      1: "The pitch deck is a route in the app (/deck) and exports to PDF.",
      2: "The problem: rooftop solar is subsidised, but the homeowner has no one on their side.",
      4: "The product: an independent second opinion at every step, from first bill to every bill after.",
      6: "How the AI works: Claude decides, the tested engine computes.",
      8: "Free for homes. Paid by installers, lenders and states.",
      10: "A formula-driven five-year model: EBITDA positive in FY29 in the base case.",
      11: "The moat: real quotes and real bills from real roofs.",
      14: "Two briefs in. A startup out.",
      15: "The ask: ₹6 crore seed for 15%.",
    };
    for (let n = 1; n <= 15; n++) {
      await d.cap(notes[n] ?? "");
      await d.hold(notes[n] ? 3.6 : 2.4);
      if (n < 15) await page.keyboard.press("ArrowRight");
    }
    await d.cap("");
    await d.card(`<div class="d">छत</div><h1>Read your roof.</h1><p>Free for homes · paid by installers, lenders and states · raising ₹6 crore seed</p>`, 4.5);
  },
};

const START = {
  landing: "#/?quality=medium",
  report: "#/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may",
  quote: "#/quote?sample=overcharger",
  ask: "#/ask",
  deck: "#/deck",
};

function join() {
  const names = Object.keys(SEGMENTS).filter((n) => existsSync(`${TMP}/${n}.mp4`));
  const files = names.map((n) => `${TMP}/${n}.mp4`);
  const durs = files.map((f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString()));
  // Short crossfades between segments instead of hard cuts.
  const F = 0.35;
  let filter = "";
  let last = "[0:v]";
  let offset = 0;
  for (let i = 1; i < files.length; i++) {
    offset += durs[i - 1] - F;
    filter += `${last}[${i}:v]xfade=transition=fade:duration=${F}:offset=${offset.toFixed(3)}[v${i}];`;
    last = `[v${i}]`;
  }
  const args = ["-y", "-loglevel", "error", ...files.flatMap((f) => ["-i", f])];
  if (files.length > 1) args.push("-filter_complex", filter.replace(/;$/, ""), "-map", last);
  args.push("-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${OUT}chhat-demo.mp4`);
  execFileSync("ffmpeg", args);
  const total = durs.reduce((a, b) => a + b, 0) - F * (files.length - 1);
  console.log(`saved ${OUT}chhat-demo.mp4 (${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}) from ${names.join(", ")}`);
}

const argv = process.argv.slice(2);
if (argv.includes("--join")) {
  join();
} else {
  const want = argv.length ? argv : Object.keys(SEGMENTS);
  mkdirSync(TMP, { recursive: true });
  for (const name of want) await session(name, START[name], SEGMENTS[name]);
  if (!argv.length) {
    join();
    for (const f of readdirSync(TMP)) if (!f.endsWith(".mp4")) rmSync(`${TMP}/${f}`, { recursive: true, force: true });
  }
}
