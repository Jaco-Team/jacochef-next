const { test, expect } = require("@playwright/test");

const storyUrl =
  "/iframe.html?id=chef-design-system-shared-ui-forms--work-time-range&viewMode=story";

test.use({ viewport: { width: 800, height: 500 } });

test("keeps start and end time in one aligned range", async ({ page }) => {
  await page.goto(storyUrl);

  const fields = page.locator(".MuiPickersOutlinedInput-root");
  const startField = fields.nth(0);
  const endField = fields.nth(1);
  const startBox = await startField.boundingBox();
  const endBox = await endField.boundingBox();

  expect(Math.abs(startBox.y - endBox.y)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(startBox.height - endBox.height)).toBeLessThanOrEqual(0.5);
  expect(endBox.x).toBeGreaterThan(startBox.x + startBox.width);
  await expect(page.getByText("Продолжительность смены · 12 ч")).toBeVisible();
});

test("opens the clock view instead of the browser time list", async ({ page }) => {
  await page.goto(storyUrl);

  await page
    .getByRole("button", { name: /Выберите время/ })
    .first()
    .click();

  await expect(page.locator(".MuiTimeClock-root")).toBeVisible();
  await expect(page.locator(".MuiMultiSectionDigitalClock-root")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Отмена" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Выбрать" })).toBeVisible();
});
