import { expect, noHorizontalOverflow, open, scrollToY, test } from "./fixtures";

test("landing on a phone: text sits under the scene, menu opens, no sideways scroll", async ({ page, problems }) => {
  void problems;
  await open(page, "/");
  await expect(page.locator(".hero__title")).toBeVisible();
  const title = await page.locator(".hero__title").boundingBox();
  const vh = page.viewportSize()!.height;
  expect(title!.y).toBeGreaterThan(vh * 0.3);
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator(".nav__sheet")).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  // Stacking cards fall back to a plain column on phones.
  const y = await page.locator("#tools").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await scrollToY(page, y + 200);
  const pos = await page.locator(".stack-card").first().evaluate((el) => getComputedStyle(el).position);
  expect(pos).toBe("relative");
});

for (const route of ["/report", "/quote?sample=overcharger", "/bill?sample=import-billed", "/built-with-ai", "/installers", "/compare"]) {
  test(`${route} fits a phone screen`, async ({ page, problems }) => {
    void problems;
    await open(page, route);
    await expect(page.locator("h1")).toBeVisible();
    await noHorizontalOverflow(page);
  });
}
