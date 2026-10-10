import { expect, noHorizontalOverflow, open, test } from "./fixtures";

const ROUTES: [string, RegExp][] = [
  ["/", /Every Indian roof/],
  ["/report", /What your roof is worth/],
  ["/quote", /Is this quote fair/],
  ["/bill", /Is your DISCOM billing you right/],
  ["/ask", /Ask anything about going solar/],
  ["/built-with-ai", /Two briefs in/],
  ["/deck", /Solar, without the sales pitch/],
  ["/no-such-page", /Nothing on this roof/],
];

for (const [route, h1] of ROUTES) {
  test(`${route} renders its heading with no errors`, async ({ page, problems }) => {
    void problems;
    await open(page, route);
    await expect(page.locator("h1").first()).toHaveText(h1);
    await expect(page).toHaveTitle(/Chhat/);
    await noHorizontalOverflow(page);
  });
}

test("every route sets a distinct document title", async ({ page, problems }) => {
  void problems;
  const titles = new Set<string>();
  for (const [route] of ROUTES) {
    await open(page, route);
    await page.waitForTimeout(300);
    titles.add(await page.title());
  }
  expect(titles.size).toBeGreaterThanOrEqual(6);
});
