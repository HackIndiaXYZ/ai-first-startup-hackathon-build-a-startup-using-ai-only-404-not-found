import { test as base, expect, type Page } from "@playwright/test";

/** Messages a software-rendered WebGL context prints that say nothing about the app. */
const BENIGN = [/GPU stall due to ReadPixels/i, /WebGL.*performance/i, /swiftshader/i, /Automatic fallback to software WebGL/i, /speechSynthesis|SpeechRecognition/i];

export interface Problems {
  errors: string[];
  failed: string[];
}

export const test = base.extend<{ problems: Problems }>({
  problems: async ({ page }, use) => {
    const problems: Problems = { errors: [], failed: [] };
    page.on("pageerror", (e) => problems.errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = m.text();
      if (BENIGN.some((r) => r.test(t))) return;
      problems.errors.push(`console: ${t}`);
    });
    page.on("response", (r) => {
      const u = new URL(r.url());
      if (u.hostname === "localhost" && r.status() >= 400) problems.failed.push(`${r.status()} ${u.pathname}`);
    });
    await use(problems);
    expect(problems.errors, "no page or console errors").toEqual([]);
    expect(problems.failed, "no failed same-origin requests").toEqual([]);
  },
});

export { expect };

/** Load a route. Landing loads in the low render tier so CI frames stay fast. */
export async function open(page: Page, route: string) {
  const sep = route.includes("?") ? "&" : "?";
  const url = route === "/" || route.startsWith("/?") ? `/#${route}${sep}quality=low` : `/#${route}`;
  await page.goto(url);
  // The route must have mounted (its h1 exists) and the preloader, if any, gone.
  // Checking only for "no preloader" passes before React has rendered at all.
  await page.waitForFunction(() => !!document.querySelector("main h1") && !document.querySelector(".pre"), null, { timeout: 90_000 });
}

/** Scroll in small steps so scrubbed and once-only scroll triggers all fire. */
export async function scrollToY(page: Page, y: number, steps = 8) {
  const from = await page.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), Math.round(from + ((y - from) * i) / steps));
    await page.waitForTimeout(120);
  }
}

export async function noHorizontalOverflow(page: Page) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, "page must not scroll sideways").toBeLessThanOrEqual(iw + 1);
}
