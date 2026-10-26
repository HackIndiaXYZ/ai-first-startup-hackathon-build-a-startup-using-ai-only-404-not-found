import { mkdirSync } from "node:fs";
import { noHorizontalOverflow, open, test } from "./fixtures";

// A viewport sweep for review, not pixel diffing: WebGL output differs by GPU.
const WIDTHS: [number, number][] = [
  [375, 812],
  [768, 1024],
  [1280, 800],
  [1920, 1080],
];
const ROUTES = ["/", "/report", "/quote?sample=overcharger", "/bill?sample=import-billed", "/built-with-ai", "/no-such-page"];

mkdirSync("test-results/screens", { recursive: true });

for (const [w, h] of WIDTHS) {
  test.describe(`${w}px`, () => {
    test.use({ viewport: { width: w, height: h } });
    for (const route of ROUTES) {
      test(`${route} at ${w}×${h}`, async ({ page, problems }) => {
        void problems;
        await open(page, route);
        await page.waitForTimeout(1200);
        await noHorizontalOverflow(page);
        const name = (route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home").slice(0, 30);
        await page.screenshot({ path: `test-results/screens/${name}-${w}.png` });
      });
    }
  });
}
