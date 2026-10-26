// End-to-end checks in headless Chromium against the production build.
//   npm run build && node scripts/e2e.mjs
// Starts `vite preview`, drives every route and control, and fails on page
// errors, console errors, "NaN"/"undefined" in visible text, horizontal
// overflow, WebGL context leaks and broken fallbacks.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = Number(process.env.E2E_PORT ?? 4183);
const BASE = `http://localhost:${PORT}/`;
// The cloud sandbox ships its own Chromium; elsewhere use Playwright's managed one.
const LOCAL_CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const CHROME = process.env.CHROME_PATH ?? (existsSync(LOCAL_CHROME) ? LOCAL_CHROME : undefined);
const OUT = process.env.E2E_OUT ?? "e2e-out";
mkdirSync(OUT, { recursive: true });

const results = [];
const fail = (name, detail) => results.push({ name, ok: false, detail });
const pass = (name, detail = "") => results.push({ name, ok: true, detail });
const check = (name, cond, detail = "") => (cond ? pass(name, detail) : fail(name, detail));

// ---------------------------------------------------------------- server
// Run vite's own entry (not npx) so kill() reaches the server process.
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--port", String(PORT), "--strictPort"], { stdio: "pipe" });
process.on("exit", () => server.kill());
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("preview did not start")), 20000);
  server.stdout.on("data", (d) => String(d).includes(String(PORT)) && (clearTimeout(t), resolve()));
  server.stderr.on("data", (d) => process.stderr.write(d));
  server.on("exit", (code) => code && (clearTimeout(t), reject(new Error(`preview exited with ${code}; is port ${PORT} free?`))));
});

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const launch = (extra = []) =>
  chromium.launch({ executablePath: CHROME, proxy, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", ...extra] });

const IGNORED = [/Download the React DevTools/, /GPU stall due to ReadPixels/];
async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, ...opts });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error" && !(m.type() === "warning" && /WebGL|context/i.test(m.text()))) return;
    if (IGNORED.some((re) => re.test(m.text()))) return;
    page.errors.push(`${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith(BASE)) page.errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
  });
  return { ctx, page };
}

const LEAK = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object Object\]/;
async function visibleLeak(page) {
  const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
  const m = text.match(LEAK);
  return m ? text.slice(Math.max(0, m.index - 60), m.index + 40).replace(/\s+/g, " ") : null;
}
async function go(page, path, wait = 1200) {
  await page.goto(`${BASE}#${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(wait);
}

const browser = await launch();

// ---------------------------------------------------------------- 1. every route renders cleanly
const ROUTES = ["/", "/report", "/quote", "/bill", "/ask", "/built-with-ai", "/deck", "/no-such-page"];
for (const r of ROUTES) {
  const { ctx, page } = await open(browser);
  await go(page, r, 2500);
  // The landing intro holds the headline hidden until the scene is ready (capped at 12 s).
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  const h1 = await page.locator("h1").first().innerText().catch(() => "");
  const leak = await visibleLeak(page);
  check(`route ${r}: renders a heading`, h1.trim().length > 0, h1.slice(0, 60));
  check(`route ${r}: no NaN/undefined in text`, !leak, leak ?? "");
  check(`route ${r}: no page or console errors`, page.errors.length === 0, page.errors.join(" | "));
  await page.screenshot({ path: `${OUT}/route${r.replace(/\W+/g, "-") || "-home"}.png` });
  await ctx.close();
}

// ---------------------------------------------------------------- 2. no horizontal overflow at any width
for (const w of [320, 375, 414, 768, 1024, 1280, 1440, 1920]) {
  const { ctx, page } = await open(browser, { viewport: { width: w, height: 800 } });
  const wide = [];
  for (const r of ["/", "/report", "/quote", "/bill", "/ask", "/built-with-ai", "/no-such-page"]) {
    await go(page, r, 900);
    const over = await page.evaluate(() => {
      const doc = document.documentElement;
      if (doc.scrollWidth <= window.innerWidth + 1) return null;
      const culprit = [...document.querySelectorAll("body *")].find((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed");
      return `${doc.scrollWidth}px; e.g. ${culprit ? culprit.tagName.toLowerCase() + "." + [...culprit.classList].join(".") : "?"}`;
    });
    if (over) wide.push(`${r} ${over}`);
  }
  check(`width ${w}px: no horizontal scroll on any page`, wide.length === 0, wide.join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- 3. hostile URL parameters
const HOSTILE = [
  "/report?units=abc&month=99&roof=-1&shade=bogus&panels=999&price=NaN&tariff=Infinity&load=x&period=7",
  "/report?city=Atlantis&units=1e99",
  "/report?units=0&panels=0&price=1",
  "/report?city=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
  "/quote?kw=abc&state=zz",
  "/quote?kw=-3&state=dl",
  "/quote?sample=nope",
  "/bill?sample=nope",
  "/bill?sample=zero-export",
];
for (const u of HOSTILE) {
  const { ctx, page } = await open(browser);
  await go(page, u, 1500);
  const leak = await visibleLeak(page);
  check(`params ${u.slice(0, 60)}: renders without NaN`, !leak, leak ?? "");
  check(`params ${u.slice(0, 60)}: no errors`, page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}
{
  const { ctx, page } = await open(browser);
  await go(page, "/quote?kw=abc", 1200);
  const verdict = await page.locator(".verdict__title").innerText();
  check("empty quote is not called fair", !/fair deal/i.test(verdict), verdict);
  await go(page, "/bill?sample=nope", 1200);
  const bv = await page.locator(".verdict__title").innerText();
  check("empty bill does not 'check out'", !/checks out/i.test(bv), bv);
  await ctx.close();
}

// ---------------------------------------------------------------- 4. Report: every control
{
  const { ctx, page } = await open(browser);
  await go(page, "/report?city=Delhi&units=450", 3000);
  const kpi = () => page.locator(".kpis").innerText();
  const before = await kpi();
  await page.selectOption("#city", "Chennai");
  await page.waitForTimeout(800);
  check("report: city change updates the KPIs", (await kpi()) !== before);
  await page.fill("#units", "");
  await page.waitForTimeout(300);
  check("report: clearing units leaves no NaN", !(await visibleLeak(page)), (await visibleLeak(page)) ?? "");
  await page.fill("#units", "980");
  await page.selectOption("#bm", "4");
  await page.getByRole("radio", { name: "Two-month bill" }).click();
  await page.getByRole("radio", { name: "Heavy" }).click();
  await page.fill("#tariff", "9.5");
  await page.fill("#load", "3");
  const panels = page.getByRole("slider", { name: "Number of panels" });
  await panels.focus();
  for (let i = 0; i < 40; i++) await page.keyboard.press("ArrowRight");
  const roofS = page.getByRole("slider", { name: "Roof area in square feet" });
  await roofS.focus();
  for (let i = 0; i < 80; i++) await page.keyboard.press("ArrowLeft");
  const hourS = page.getByRole("slider", { name: "Time of day" });
  await hourS.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await page.waitForTimeout(600);
  check("report: extreme slider and input values leave no NaN", !(await visibleLeak(page)), (await visibleLeak(page)) ?? "");
  const url = page.url();
  check("report: URL keeps the state", /units=980/.test(url) && /city=Chennai/.test(url) && /shade=heavy/.test(url), url);
  // Sample bill intake
  await page.getByRole("tab", { name: /Sample bills/ }).click();
  await page.locator(".sample").first().click();
  await page.waitForTimeout(800);
  check("report: sample bill is read", /Read:/.test(await page.locator(".report__inputs").innerText()));
  // Paste intake
  await page.getByRole("tab", { name: /Paste text/ }).click();
  await page.locator("textarea").fill("TATA POWER-DDL\nBill Month: Jun 2026\nUnits Consumed: 612\nEnergy Charges: Rs 4,590");
  await page.getByRole("button", { name: /Read this bill/ }).click();
  await page.waitForTimeout(800);
  check("report: pasted bill sets units", (await page.inputValue("#units")) === "612", await page.inputValue("#units"));
  // Upload: a text file, a PDF and a non-document
  await page.getByRole("tab", { name: /Upload/ }).click();
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: "bill.txt", mimeType: "text/plain", buffer: Buffer.from("BSES Rajdhani\nUnits consumed: 333\nBill month: Mar 2026") });
  await page.waitForTimeout(1200);
  check("report: uploaded text bill is read", (await page.inputValue("#units")) === "333", await page.inputValue("#units"));
  await input.setInputFiles({ name: "notes.zip", mimeType: "application/zip", buffer: Buffer.from("PK\u0003\u0004") });
  await page.waitForTimeout(800);
  const status = await page.locator(".intake__status").innerText().catch(() => "");
  check("report: unsupported file shows a clear error", /photos|PDF/i.test(status), status);
  await input.setInputFiles("../pitch/Chhat-pitch-deck.pdf");
  await page.waitForTimeout(6000);
  const pdfStatus = await page.locator(".intake__status").innerText().catch(() => "");
  check("report: PDF is read on-device", /PDF text|check the fields/i.test(pdfStatus), pdfStatus);
  check("report: no errors through every control", page.errors.length === 0, page.errors.join(" | "));
  await page.screenshot({ path: `${OUT}/report-controls.png`, fullPage: false });
  await ctx.close();
}

// ---------------------------------------------------------------- 5. Quote and Bill: samples, edits, links
{
  const { ctx, page } = await open(browser);
  await go(page, "/quote", 1500);
  await page.locator(".sample").first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  const samples = await page.locator(".sample").count();
  check("quote: sample documents are listed", samples >= 3, `${samples} samples`);
  for (let i = 0; i < samples; i++) {
    await page.locator(".sample").nth(i).click();
    await page.waitForTimeout(500);
    const g = await page.locator(".grade").innerText();
    check(`quote sample ${i + 1}: graded`, /^[A-F?]$/.test(g.trim()), g);
  }
  await page.getByRole("radio", { name: "हिंदी" }).click();
  check("quote: Hindi message renders", /[ऀ-ॿ]/.test(await page.locator(".msgbox").innerText()));
  const link = page.getByRole("link", { name: /See payback at this price/ });
  if (await link.count()) {
    await link.click();
    await page.waitForTimeout(1500);
    check("quote → report carries panels and price", /panels=\d+/.test(page.url()) && /price=\d+/.test(page.url()), page.url());
  }
  check("quote: no errors", page.errors.length === 0, page.errors.join(" | "));

  await go(page, "/bill", 1500);
  await page.locator(".sample").first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  const bs = await page.locator(".sample").count();
  check("bill: sample documents are listed", bs >= 3, `${bs} samples`);
  for (let i = 0; i < bs; i++) {
    await page.locator(".sample").nth(i).click();
    await page.waitForTimeout(500);
    check(`bill sample ${i + 1}: verdict`, (await page.locator(".verdict__title").innerText()).length > 5);
  }
  check("bill: no NaN after samples", !(await visibleLeak(page)), (await visibleLeak(page)) ?? "");
  check("bill: no errors", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- 6. Same-route navigation picks up new parameters
{
  const { ctx, page } = await open(browser);
  await go(page, "/report?city=Delhi&units=450", 2000);
  await page.evaluate(() => (location.hash = "#/report?city=Pune&units=380"));
  await page.waitForTimeout(1500);
  check("report: link to new params re-initialises", (await page.inputValue("#city")) === "Pune" && (await page.inputValue("#units")) === "380", `${await page.inputValue("#city")} ${await page.inputValue("#units")}`);
  await page.goBack();
  await page.waitForTimeout(1500);
  check("report: back button restores the previous city", (await page.inputValue("#city")) === "Delhi", await page.inputValue("#city"));
  await ctx.close();
}

// ---------------------------------------------------------------- 6b. Route curtain: no navigation is lost mid-transition
{
  const { ctx, page } = await open(browser);
  const navLink = (name) => page.getByRole("link", { name, exact: true }).first();
  const landedOn = async (path) => {
    await page.waitForTimeout(3000);
    return new URL(page.url()).hash.startsWith(`#${path}`);
  };
  await go(page, "/quote", 1500);
  await navLink("Roof Report").click();
  await page.waitForTimeout(150);
  await navLink("Bill Audit").click({ force: true });
  check("curtain: a second click during the transition wins", await landedOn("/bill"), page.url());
  await go(page, "/quote", 1500);
  await navLink("Roof Report").click();
  await page.waitForTimeout(200);
  await page.evaluate(() => (location.hash = "#/ask"));
  check("curtain: an address-bar navigation during the transition is kept", await landedOn("/ask"), page.url());
  await go(page, "/report?city=Delhi&units=450", 2000);
  await page.fill("#units", "512");
  await navLink("Bill Audit").click();
  check("curtain: the page rewriting its URL does not cancel a click", await landedOn("/bill"), page.url());
  check("curtain: no errors", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- 7. Ask: on-device conversation
{
  const { ctx, page } = await open(browser);
  await go(page, "/ask", 1500);
  const box = page.locator('input[aria-label="Ask Chhat"]').first();
  const ANSWER = ".msg--assistant .msg__bubble:not(.msg__typing)";
  for (const q of ["Lucknow, 420 units", "subsidy for 3 kW in Assam", "quote for 3kw is 250000", "मैं दिल्ली में रहता हूँ, बिल 600 यूनिट आता है", "<img src=x onerror=alert(1)>"]) {
    const n = await page.locator(ANSWER).count();
    await box.fill(q);
    await box.press("Enter");
    await page.waitForFunction(([sel, k]) => document.querySelectorAll(sel).length > k, [ANSWER, n], { timeout: 8000 }).catch(() => {});
    check(`ask "${q.slice(0, 28)}": answered`, (await page.locator(ANSWER).count()) > n);
  }
  check("ask: HTML in a message is shown as text", (await page.locator("main img[src=x]").count()) === 0);
  check("ask: no NaN", !(await visibleLeak(page)), (await visibleLeak(page)) ?? "");
  check("ask: no errors", page.errors.length === 0, page.errors.join(" | "));
  await page.screenshot({ path: `${OUT}/ask.png` });
  await ctx.close();
}

// ---------------------------------------------------------------- 8. Deck: every slide
{
  const { ctx, page } = await open(browser);
  await go(page, "/deck", 1500);
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(120);
  }
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowLeft");
  check("deck: arrow through all slides without errors", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}

// ---------------------------------------------------------------- 9. WebGL contexts are released on route churn
{
  const { ctx, page } = await open(browser);
  await go(page, "/", 2500);
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => (location.hash = "#/report"));
    await page.waitForTimeout(900);
    await page.evaluate(() => (location.hash = "#/"));
    await page.waitForTimeout(900);
  }
  const lost = page.errors.filter((e) => /too many active webgl contexts|context lost/i.test(e));
  check("webgl: 24 scene mounts without exhausting contexts", lost.length === 0, lost.slice(0, 2).join(" | "));
  const canvases = await page.locator("canvas").count();
  check("webgl: only the current page's canvas remains", canvases <= 1, `${canvases} canvases`);
  await ctx.close();
}

// ---------------------------------------------------------------- 10. Reduced motion
{
  const { ctx, page } = await open(browser, { reducedMotion: "reduce" });
  await go(page, "/", 2000);
  const visible = await page.evaluate(() => [...document.querySelectorAll("main h2")].filter((h) => +getComputedStyle(h).opacity > 0.5).length);
  check("reduced motion: landing content is visible without scrolling animations", visible >= 3, `${visible} visible h2`);
  check("reduced motion: no errors", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}
await browser.close();

// ---------------------------------------------------------------- 11. No WebGL at all
{
  const b = await launch(["--disable-webgl", "--disable-3d-apis"]);
  const { ctx, page } = await open(b);
  await go(page, "/", 1500);
  check("no webgl: landing shows the poster", (await page.locator(".story__poster--img").count()) === 1);
  check("no webgl: landing has no canvas", (await page.locator("canvas").count()) === 0);
  await go(page, "/report", 1500);
  check("no webgl: report explains and still computes", /needs WebGL/.test(await page.locator(".stage").innerText()) && /kWp/.test(await page.locator(".kpis").innerText()));
  const three = await page.evaluate(() => performance.getEntriesByType("resource").some((r) => /RoofScene/.test(r.name)));
  check("no webgl: three.js is never downloaded", !three);
  check("no webgl: no errors", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
  await b.close();
}

// ---------------------------------------------------------------- 12. Offline after load, and a missing chunk
{
  const b = await launch();
  const { ctx, page } = await open(b);
  await go(page, "/report", 2500);
  await ctx.setOffline(true);
  await page.selectOption("#city", "Jaipur");
  await page.waitForTimeout(1500);
  check("offline: report keeps computing on bundled climate", /kWp/.test(await page.locator(".kpis").innerText()) && !(await visibleLeak(page)));
  page.errors.length = 0;
  await page.evaluate(() => (location.hash = "#/built-with-ai"));
  await page.waitForTimeout(2500);
  const alert = await page.locator("[role=alert]").innerText().catch(() => "");
  check("offline: an unloaded page shows a reload message, not a blank screen", /connection dropped/i.test(alert) && /Reload/i.test(alert), alert.slice(0, 80).replace(/\s+/g, " "));
  await ctx.setOffline(false);
  await ctx.close();
  await b.close();
}

// ---------------------------------------------------------------- 13. First-load weight
{
  const b = await launch();
  const { ctx, page } = await open(b);
  await go(page, "/report", 1500);
  const js = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".js") && !/RoofScene/.test(r.name))
      .reduce((a, r) => a + (r.transferSize || r.encodedBodySize), 0),
  );
  check("weight: report page JS before the 3D chunk under 450 KB", js < 450_000, `${Math.round(js / 1024)} KB`);
  await ctx.close();
  await b.close();
}

server.kill();

const failed = results.filter((r) => !r.ok);
const lines = results.map((r) => `${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
writeFileSync(`${OUT}/report.txt`, lines.join("\n") + "\n");
console.log(lines.join("\n"));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
