// Records the demo walkthrough to pitch/chhat-demo.mp4.
// Frames come from the Chrome DevTools screencast and are encoded with the
// system ffmpeg, timed by each frame's real timestamp.
// Usage: node scripts/record-demo.mjs [baseUrl]  (needs `vite preview` running)
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:4173/";
const out = new URL("../../pitch/", import.meta.url).pathname;
const tmp = `${out}.video-tmp`;
mkdirSync(tmp, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const frames = [];
const cdp = await ctx.newCDPSession(page);
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const file = `${tmp}/f${String(frames.length).padStart(6, "0")}.jpg`;
  writeFileSync(file, Buffer.from(data, "base64"));
  frames.push({ file, t: metadata.timestamp });
  try {
    await cdp.send("Page.screencastFrameAck", { sessionId });
  } catch {
    /* session closing */
  }
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 82, maxWidth: 1280, maxHeight: 800, everyNthFrame: 1 });

const OVERLAY_CSS = `
#demo-cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;max-width:980px;
  background:rgba(13,20,40,.88);color:#f3f1ea;font:600 21px/1.4 "Archivo Variable",Archivo,sans-serif;
  padding:12px 20px;border-radius:14px;text-align:center;letter-spacing:-.01em;transition:opacity .25s}
#demo-card{position:fixed;inset:0;z-index:10000;background:#121a33;color:#f3f1ea;display:grid;place-content:center;
  text-align:center;gap:18px;font-family:"Archivo Variable",Archivo,sans-serif;transition:opacity .5s}
#demo-card h1{font-size:76px;letter-spacing:-.045em;line-height:.95;margin:0;font-weight:750}
#demo-card p{font-size:24px;opacity:.75;margin:0}
#demo-card .d{font-family:"Tiro Devanagari Hindi",serif;color:#f2b632;font-size:120px;line-height:1}`;

async function ensureCss() {
  await page.evaluate((css) => {
    if (!document.getElementById("demo-css")) {
      const s = document.createElement("style");
      s.id = "demo-css";
      s.textContent = css;
      document.head.appendChild(s);
    }
  }, OVERLAY_CSS);
}
async function cap(text) {
  await ensureCss();
  await page.evaluate((t) => {
    let el = document.getElementById("demo-cap");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-cap";
      document.body.appendChild(el);
    }
    el.style.opacity = t ? "1" : "0";
    if (t) el.textContent = t;
  }, text);
}
async function card(html, ms) {
  await ensureCss();
  await page.evaluate((h) => {
    const el = document.createElement("div");
    el.id = "demo-card";
    el.innerHTML = h;
    document.body.appendChild(el);
  }, html);
  await wait(ms);
  await page.evaluate(() => {
    const el = document.getElementById("demo-card");
    if (el) {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 600);
    }
  });
  await wait(600);
}
async function wheel(total, step = 110, pause = 90) {
  for (let y = 0; Math.abs(y) < Math.abs(total); y += step * Math.sign(total)) {
    await page.mouse.wheel(0, step * Math.sign(total));
    await wait(pause);
  }
}
async function go(hash) {
  await page.evaluate((h) => (location.hash = h), hash);
  await wait(1800);
}

// ---------------------------------------------------------------- title
await page.goto(base, { waitUntil: "networkidle" });
await page.mouse.move(640, 400);
await card(`<div class="d">छत</div><h1>Solar, without<br/>the sales pitch.</h1><p>Chhat · HackIndia AI-First Startup Hackathon 2026 · Team 404 not found</p>`, 5200);

// ---------------------------------------------------------------- landing story
await cap("Every Indian roof has a number. Chhat finds it from one bill and 20 years of NASA sunlight.");
await wait(6000);
await cap("The sunlight is there. Trust isn't: only 5% of households say they'd install.");
await wheel(900, 100, 110);
await wait(3500);
await cap("A real sun path for Delhi, mid-April. The roof warms up as the morning goes.");
await wheel(900, 100, 110);
await wait(2500);
await cap("Noon: Chhat sizes the system and stacks ₹78,000 central + ₹30,000 Delhi subsidy.");
await wheel(1000, 100, 110);
await wait(3500);
await cap("Then it reads the installer's quote: ₹57,710 over, subsidy-killing panels, 0.3 kW missing.");
await wheel(900, 100, 110);
await wait(4000);
await cap("After install, it audits every DISCOM bill. MNRE admitted wrong bills in July 2026.");
await wheel(900, 100, 110);
await wait(3500);
await wheel(800, 100, 110);
await cap("Night over the city. Two minutes, one bill, no login.");
await wait(3000);

// ---------------------------------------------------------------- roof report
await cap("");
await go("#/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may");
await cap("The Roof Report reads a sample Delhi bill on-device: 476 units in May.");
await wait(3500);
await wheel(420, 70, 80);
await wait(1500);
await cap("The 3D roof uses the actual sun path. Scrub the day and the output meter follows.");
await page.focus('[aria-label="Time of day"]');
for (let i = 0; i < 4; i++) {
  await page.keyboard.press("PageDown");
  await wait(450);
}
for (let i = 0; i < 9; i++) {
  await page.keyboard.press("PageUp");
  await wait(380);
}
await page.focus('[aria-label="Month"]');
for (let i = 0; i < 4; i++) {
  await page.keyboard.press("ArrowRight");
  await wait(450);
}
await wait(800);
await cap("Change the panel count and every number updates.");
await wheel(560, 80, 80);
await page.focus('[aria-label="Number of panels"]');
for (const k of ["ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft"]) {
  await page.keyboard.press(k);
  await wait(700);
}
await cap("Generation vs. use, month by month, from 20 years of NASA data.");
await wheel(380, 80, 80);
await page.mouse.move(820, 520);
await wait(900);
await page.mouse.move(900, 520);
await wait(2200);
await cap("Subsidy, net cost, and the loan: EMI after subsidy is below the monthly saving.");
await wheel(600, 80, 80);
await wait(3500);
await cap("25-year cash flow, including an inverter swap, then the seven steps on the national portal.");
await wheel(700, 80, 80);
await wait(3000);
await wheel(800, 100, 80);
await wait(2000);

// ---------------------------------------------------------------- quote check
await cap("");
await go("#/quote?sample=overcharger");
await cap("Quote Check: 14 checks on the installer's quote. This one gets an F.");
await wait(4000);
await wheel(300, 60, 90);
await cap("₹1.6 lakh at risk: overpriced, non-DCR panels, short capacity, old GST, 70% advance.");
await wait(4500);
await wheel(700, 80, 90);
await wait(2000);
await cap("Every finding cites its rule, and Chhat writes the reply to the vendor, in Hindi too.");
await wheel(900, 100, 90);
await page.getByRole("radio", { name: "हिंदी" }).click().catch(() => {});
await wait(4000);

// ---------------------------------------------------------------- bill audit
await cap("");
await go("#/bill?sample=import-billed");
await cap("Bill Audit: this DISCOM billed 410 import units and ignored 236 units of export.");
await wait(4500);
await wheel(500, 80, 90);
await cap("Chhat flags it, plus an unexplained ₹1,180 charge, and drafts the correction letter.");
await wait(3500);
await wheel(800, 100, 90);
await wait(3000);

// ---------------------------------------------------------------- ask
await cap("");
await go("#/ask");
await cap("Ask Chhat in Hindi, Hinglish or English. Every number comes from a tool.");
const input = page.locator('input[aria-label="Ask Chhat"]');
await input.click();
await input.pressSequentially("दिल्ली में 3 kW पर कितनी सब्सिडी मिलेगी?", { delay: 45 });
await page.keyboard.press("Enter");
await wait(2200);
await page.locator(".trace summary").last().click().catch(() => {});
await wait(2500);
await input.click();
await input.pressSequentially("Pune, 420 units a month. Worth it?", { delay: 40 });
await page.keyboard.press("Enter");
await wait(2200);
await page.locator(".trace summary").last().click().catch(() => {});
await cap("Open the trace: the model decides, the tested engine computes. Nothing is invented.");
await wait(4500);

// ---------------------------------------------------------------- built with AI
await cap("");
await go("#/built-with-ai");
await cap("Claude Code built all of it from one brief. Zero lines of code written by hand.");
await wait(3500);
await wheel(1400, 100, 90);
await cap("Research, a 25-idea tournament, plan, code, 3D, tests, financial model, deck: AI-first.");
await wait(3000);
await wheel(1600, 120, 90);
await wait(2000);

// ---------------------------------------------------------------- end
await cap("");
await card(`<div class="d">छत</div><h1>Read your roof.</h1><p>Free for homes · paid by installers, lenders and states · raising ₹6 crore seed</p>`, 5000);

await cdp.send("Page.stopScreencast");
await ctx.close();
await browser.close();

// ffconcat list with real per-frame durations, then a constant 30 fps H.264 mp4.
const lines = ["ffconcat version 1.0"];
for (let i = 0; i < frames.length; i++) {
  const dur = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - frames[i].t) : 0.5;
  lines.push(`file '${frames[i].file}'`, `duration ${dur.toFixed(4)}`);
}
lines.push(`file '${frames[frames.length - 1].file}'`);
writeFileSync(`${tmp}/list.txt`, lines.join("\n"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-vf", "fps=30,scale=1280:800:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-movflags", "+faststart", `${out}chhat-demo.mp4`]);
rmSync(tmp, { recursive: true, force: true });
console.log(`saved ${out}chhat-demo.mp4 from ${frames.length} frames`);
