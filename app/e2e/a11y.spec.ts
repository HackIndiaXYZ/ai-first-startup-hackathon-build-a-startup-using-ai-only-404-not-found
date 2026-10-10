import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { expect, open, test } from "./fixtures";

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const ROUTES = ["/", "/report", "/quote?sample=overcharger", "/bill?sample=import-billed", "/ask", "/built-with-ai", "/deck", "/no-such-page"];

interface AxeResult {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

for (const route of ROUTES) {
  test(`axe: ${route} has no serious or critical WCAG 2.1 AA violations`, async ({ page, problems }) => {
    void problems;
    await open(page, route);
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: AXE });
    const violations: AxeResult[] = await page.evaluate(async () => {
      // @ts-expect-error axe is injected above
      const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
      return r.violations.map((v: AxeResult) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => ({ target: n.target })) }));
    });
    mkdirSync("test-results/axe", { recursive: true });
    writeFileSync(`test-results/axe/${route.replace(/[^a-z0-9]+/gi, "_") || "home"}.json`, JSON.stringify(violations, null, 2));
    const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("keyboard: the skip link is the first stop and lands on main content", async ({ page, problems }) => {
  void problems;
  await open(page, "/quote");
  await page.keyboard.press("Tab");
  const first = page.locator(":focus");
  await expect(first).toHaveText(/Skip to content/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main|#\/quote/);
});

test("keyboard: every focusable control on the landing shows a visible focus ring", async ({ page, problems }) => {
  void problems;
  await open(page, "/");
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return "none-focused";
      const s = getComputedStyle(el);
      if (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) return "ok";
      // Text fields draw their ring on the wrapper (:focus-within).
      const wrap = el.closest(".input-wrap");
      if (wrap && getComputedStyle(wrap).boxShadow !== "none") return "ok";
      return `${el.tagName}.${el.className}`;
    });
    expect(ring).toBe("ok");
  }
});
