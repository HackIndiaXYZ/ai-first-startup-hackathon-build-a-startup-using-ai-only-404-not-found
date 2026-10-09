// Screenshot helper: node scripts/shoot.mjs <url> <out.png> [width] [height] [scrollY] [waitMs]
import { chromium } from "playwright-core";

const [, , url, out, w = "1440", h = "900", scrollY = "0", wait = "2500"] = process.argv;
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(+wait);
if (+scrollY) {
  await page.evaluate((y) => window.scrollTo(0, y), +scrollY);
  await page.waitForTimeout(+wait);
}
await page.screenshot({ path: out });
console.log(logs.slice(0, 12).join("\n") || "no console errors");
await browser.close();
