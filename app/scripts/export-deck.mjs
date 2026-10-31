// Exports the /deck route to pitch/Chhat-pitch-deck.pdf and a PNG per slide.
// Usage: node scripts/export-deck.mjs [baseUrl]   (needs `vite preview` running)
// Set CHROME_PATH to use a local Chrome or Edge (e.g. on Windows or macOS).
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:4173/";
const outDir = fileURLToPath(new URL("../../pitch/", import.meta.url));
mkdirSync(`${outDir}slides`, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(`${base}#/deck?print=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.addStyleTag({ content: ".grain{display:none!important}" });
const slides = await page.$$(".slide");
for (let i = 0; i < slides.length; i++) {
  await slides[i].screenshot({ path: `${outDir}slides/slide-${String(i + 1).padStart(2, "0")}.png` });
}
await page.pdf({ path: `${outDir}Chhat-pitch-deck.pdf`, width: "1600px", height: "900px", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
console.log(`exported ${slides.length} slides`);
await browser.close();
