import { expect, open, scrollToY, test } from "./fixtures";

test.describe("landing story", () => {
  test("preloader shows real progress, then hands over to the hero", async ({ page, problems }) => {
    void problems;
    await page.goto("/#/?quality=low");
    const pre = page.locator(".pre");
    await expect(pre).toBeVisible();
    await expect(pre.locator(".pre__deva")).toHaveText("छत");
    await expect(pre).toBeHidden({ timeout: 90_000 });
    await expect(page.locator(".hero__title")).toBeVisible();
    // Returning in the same session gets the short version: no counter.
    expect(await page.evaluate(() => localStorage.getItem("chhat:intro"))).toBe("1");
    await page.reload();
    await expect(page.locator(".pre__count")).toHaveCount(0);
  });

  test("scrolling walks the day: clock, chapters, panels, night", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    const label = page.locator(".story__chapter");
    await expect(label).toHaveText(/01 \/ 07 · Dawn/);
    const story = await page.locator(".story").boundingBox();
    const total = story!.height - 800;

    await scrollToY(page, total * 0.5);
    await expect(label).toHaveText(/04 \/ 07 · Noon/);
    await expect(page.locator(".step[data-active='true'] .step__title")).toHaveText(/Six panels/);
    const clock = await page.locator(".hud__v--big").innerText();
    expect(clock).toMatch(/^1[2-3]:\d\d$/);
    // The panels land during the noon chapter; once they're down the roof produces.
    await scrollToY(page, total * 0.595, 3);
    await expect(label).toHaveText(/04 \/ 07 · Noon/);
    await expect.poll(async () => Number(await page.locator(".hud .hud__cell:nth-child(3) .hud__v span").innerText())).toBeGreaterThan(0.5);

    await scrollToY(page, total * 0.99);
    await expect(label).toHaveText(/07 \/ 07 · Night/);
    await expect(page.locator("html")).toHaveAttribute("data-hero", "dark");

    // Past the story the nav goes back to its normal, solid style.
    await scrollToY(page, story!.height + 400);
    await expect(page.locator("html")).not.toHaveAttribute("data-hero", /.+/);
  });

  test("hidden chapters are inert, so keyboard focus can't land on invisible buttons", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    const inert = await page.locator(".step").evaluateAll((els) => els.map((e) => e.hasAttribute("inert")));
    expect(inert[0]).toBe(false);
    expect(inert.slice(1).every(Boolean)).toBe(true);
  });

  test("the quick Roof Report on the landing recomputes as you type", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    await page.locator("#tools").scrollIntoViewIfNeeded();
    const size = page.locator(".quick .stat").first().locator(".stat__value");
    const before = await size.innerText();
    await page.locator(".quick input[type='number']").fill("900");
    await expect(size).not.toHaveText(before);
    await expect(page.locator(".quick .link-arrow")).toHaveAttribute("href", /units=900/);
  });

  test("count-up facts land exactly on their sourced values", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    const grid = page.locator(".proof__grid");
    const y = await grid.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await scrollToY(page, y - 200);
    // Retries until the reveal and the count-ups have finished.
    await expect(page.locator(".fact__big")).toHaveText(["51 lakh", "5%", "₹78,000", "Jul 2026", "1 Jun 2026", "8.9%", "$53M", "0.727"], { timeout: 45_000 });
    for (const href of await page.locator(".fact").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toMatch(/^https:\/\//);
    }
  });

  test("the hero CTA opens the Roof Report through the route curtain", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    await page.getByRole("link", { name: /Read my roof/ }).click();
    await expect(page.locator(".curtain")).toBeVisible();
    await expect(page).toHaveURL(/#\/report$/);
    await expect(page.locator("h1")).toHaveText(/What your roof is worth/);
    await expect(page.locator(".curtain")).toBeHidden();
  });

  test("'Try a sample house' loads the Delhi sample into the report", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    await page.getByRole("button", { name: "Try a sample house" }).click();
    await expect(page).toHaveURL(/sample=delhi-may/);
    await expect(page.locator(".chip", { hasText: "Delhi" }).first()).toBeVisible();
  });
});
