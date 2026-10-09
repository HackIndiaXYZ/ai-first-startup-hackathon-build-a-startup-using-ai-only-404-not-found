import { expect, open, test } from "./fixtures";

test.describe("Roof Report", () => {
  test("the Delhi sample produces a sized system with savings and payback", async ({ page, problems }) => {
    void problems;
    await open(page, "/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may");
    const system = page.locator(".stat", { hasText: "System" }).first().locator(".stat__value");
    await expect(system).toHaveText(/\d\.\d+ kWp/);
    await expect(page.locator(".stat", { hasText: "Saves a year" }).first().locator(".stat__value")).toHaveText(/₹[\d,]+/);
    await expect(page.locator(".stat", { hasText: "Pays back" }).first().locator(".stat__value")).toHaveText(/\d/);
    await expect(page.locator(".stage canvas")).toHaveCount(1);
    await expect(page.locator(".stage__kw")).toHaveText(/\d\.\d\d kW/);
  });
});

test.describe("Quote Check", () => {
  test("flags the overcharger and passes the fair deal", async ({ page, problems }) => {
    void problems;
    await open(page, "/quote?sample=overcharger");
    await expect(page.locator(".verdict .grade")).toHaveText("F");
    await expect(page.locator(".verdict__title")).toHaveText(/Don't sign/);
    await page.getByRole("button", { name: /The fair deal/ }).click();
    await expect(page.locator(".verdict .grade")).toHaveText(/A|B/);
  });

  test("drafts the vendor message in Hindi on request", async ({ page, problems }) => {
    void problems;
    await open(page, "/quote?sample=overcharger");
    const msg = page.getByLabel("Message to the vendor");
    await expect(msg).toContainText(/[A-Za-z]/);
    await page.getByRole("radio", { name: "हिंदी" }).click();
    await expect(msg).toContainText(/[ऀ-ॿ]/);
  });
});

test.describe("Bill Audit", () => {
  test("catches import-only billing and drafts a correction letter", async ({ page, problems }) => {
    void problems;
    await open(page, "/bill?sample=import-billed");
    await expect(page.locator(".verdict__title")).toHaveText(/looks wrong/i);
    await expect(page.getByLabel("Correction letter")).toContainText(/export/i);
  });

  test("passes a correct bill", async ({ page, problems }) => {
    void problems;
    await open(page, "/bill?sample=import-billed");
    await page.getByRole("button", { name: /Correct bill/ }).click();
    await expect(page.locator(".verdict__title")).not.toHaveText(/looks wrong/i);
  });
});

test.describe("Ask Chhat", () => {
  test("answers a Hindi subsidy question with numbers from its tools", async ({ page, problems }) => {
    void problems;
    await open(page, "/ask");
    const input = page.getByLabel("Ask Chhat").last();
    await input.fill("दिल्ली में 3 kW पर कितनी सब्सिडी?");
    await page.getByRole("button", { name: "Send" }).last().click();
    const answer = page.locator(".msg--assistant .msg__bubble").last();
    await expect(answer).toContainText("₹", { timeout: 30_000 });
    await expect(page.locator(".trace summary").last()).toContainText(/tool call/);
  });

  test("the drawer opens from the nav and closes with Escape", async ({ page, problems }) => {
    void problems;
    await open(page, "/quote");
    await page.getByRole("button", { name: /Ask Chhat/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("Pitch deck", () => {
  test("arrow keys move through the slides", async ({ page, problems }) => {
    void problems;
    await open(page, "/deck");
    const counter = page.locator(".deck__bar .mono").first();
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(/^3 \/ \d+$/);
    await page.keyboard.press("Home");
    await expect(counter).toHaveText(/^1 \/ \d+$/);
  });
});
