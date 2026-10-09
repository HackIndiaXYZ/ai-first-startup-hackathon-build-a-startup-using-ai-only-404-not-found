import { expect, open, test } from "./fixtures";

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the story becomes a still page: every chapter readable, no cursor, no curtain", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    await expect(page.locator(".story")).toHaveClass(/story--static/);
    for (const title of ["637 GW of roofs", "Your roof already gets the energy", "Six panels", "Then it reads the quote", "And every bill after", "Read your roof."]) {
      await expect(page.locator(".step", { hasText: title }).first()).toBeVisible();
    }
    expect(await page.locator(".step[inert]").count()).toBe(0);
    await expect(page.locator(".cursor")).toBeHidden();
    await page.getByRole("link", { name: /Read my roof/ }).click();
    await expect(page).toHaveURL(/#\/report/);
    await expect(page.locator(".curtain")).toBeHidden();
  });
});

test.describe("no WebGL", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // @ts-expect-error narrowing the overloads is not the point here
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
        // @ts-expect-error pass-through
        return orig.call(this, type, ...rest);
      };
    });
  });

  test("the landing shows the still poster and still works", async ({ page, problems }) => {
    void problems;
    await open(page, "/");
    await expect(page.locator(".story__poster--img")).toBeVisible();
    await expect(page.locator(".story canvas")).toHaveCount(0);
    await expect(page.locator(".hero__title")).toBeVisible();
  });

  test("the Roof Report still computes every number", async ({ page, problems }) => {
    void problems;
    await open(page, "/report?city=Pune&units=380");
    await expect(page.locator(".stage canvas")).toHaveCount(0);
    await expect(page.locator(".stat", { hasText: "System" }).first().locator(".stat__value")).toHaveText(/kWp/);
  });
});
