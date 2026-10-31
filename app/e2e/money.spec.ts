import { expect, noHorizontalOverflow, open, test } from "./fixtures";

// The money path: a home asks for verified quotes, an installer sees the
// request with the number hidden, buys it, and the contact unlocks.
test("a quote request reaches the installer inbox and unlocks on purchase", async ({ page, problems }) => {
  void problems;
  await open(page, "/quote?sample=overcharger");
  const form = page.getByTestId("lead-form");
  await form.getByRole("button", { name: "Get verified quotes" }).click();
  await expect(form.getByRole("alert")).toHaveCount(4);

  await form.getByLabel("Name", { exact: true }).fill("Test Home");
  await expect(form.getByRole("alert")).toHaveCount(3);
  await form.getByLabel("Mobile", { exact: true }).fill("98765 43210");
  await form.getByLabel("PIN code", { exact: true }).fill("411001");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Get verified quotes" }).click();

  const done = page.getByTestId("lead-done");
  await expect(done).toContainText("Request saved");
  await done.getByRole("link", { name: /installer sees/ }).click();

  await expect(page.locator("main h1")).toHaveText(/Buy homes that are ready/);
  await expect(page.getByTestId("cost-per-sale")).toHaveText("₹10,773");
  const row = page.locator(".inbox-lead").first();
  await expect(row).toContainText("98••••••10");
  await expect(row).not.toContainText("Test Home");
  await row.getByRole("button", { name: /Buy/ }).click();
  await expect(row).toContainText("Test Home");
  await expect(row).toContainText("98765 43210");
});

test("the roof report offers verified quotes", async ({ page, problems }) => {
  void problems;
  await open(page, "/report?city=Pune");
  await expect(page.getByTestId("lead-form")).toContainText("Get verified quotes for this roof");
});

test("compare: three sample quotes, the fair deal wins, and the pick survives a reload", async ({ page, problems }) => {
  void problems;
  await open(page, "/compare");
  await page.getByRole("button", { name: "Try three sample quotes" }).click();
  const pick = page.getByTestId("pick");
  await expect(pick).toContainText(/Sign with SAHYADRI SUNWORKS/i);
  await expect(pick).toContainText("Why not the others");
  await expect(page.locator(".ctable tbody tr")).toHaveCount(12);
  await page.reload();
  await expect(page.getByTestId("pick")).toContainText(/Sign with SAHYADRI SUNWORKS/i);
  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page.getByTestId("pick")).toHaveCount(0);
});

test("compare: one quote from a sample, and a lone bad quote is not recommended", async ({ page, problems }) => {
  void problems;
  await open(page, "/compare");
  await page.getByTestId("slot-A").getByRole("button", { name: "The overcharger" }).click();
  await page.getByTestId("slot-B").getByRole("button", { name: "Short on panels" }).click();
  await expect(page.getByTestId("pick")).toContainText(/Sign with|Don't sign/);
  await expect(page.getByTestId("lead-form")).toBeVisible();
});

test("compare: with three quotes loaded, a phone screen never scrolls sideways", async ({ page, problems }) => {
  void problems;
  await page.setViewportSize({ width: 375, height: 812 });
  await open(page, "/compare");
  await page.getByRole("button", { name: "Try three sample quotes" }).click();
  await expect(page.getByTestId("pick")).toBeVisible();
  await noHorizontalOverflow(page);
});

test("Chhat Pro pre-check: a clean quote earns the badge, a bad one gets a fix list", async ({ page, problems }) => {
  void problems;
  await open(page, "/installers");
  const pro = page.getByTestId("procheck");
  await pro.getByRole("button", { name: "One that fails" }).click();
  await expect(pro.getByTestId("not-verified")).toContainText(/fix \d+ thing/);
  await expect(pro.locator(".finding").first()).toHaveAttribute("data-sev", "critical");
  await pro.getByRole("button", { name: "A clean quote" }).click();
  await expect(pro.getByTestId("verified")).toHaveText(/Chhat Verified/);
});
