const { test, expect } = require("@playwright/test");

const storyUrl =
  "/iframe.html?id=chef-design-system-shared-ui-forms--unified-select-popup&viewMode=story";
const placeholderStoryUrl =
  "/iframe.html?id=chef-design-system-shared-ui-forms--empty-select-placeholder&viewMode=story";

function center(rect, axis) {
  return axis === "x" ? rect.x + rect.width / 2 : rect.y + rect.height / 2;
}

async function textRect(locator) {
  return locator.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();

    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  });
}

test.describe("JacoSelect visual contract", () => {
  test("centers the empty select placeholder", async ({ page }) => {
    await page.goto(placeholderStoryUrl);

    const select = page.locator('[role="combobox"]');
    const control = select.locator("xpath=..");
    const label = page.locator(".MuiInputLabel-root", { hasText: "Часы" });
    const controlBox = await control.boundingBox();
    const labelTextBox = await textRect(label);

    expect(Math.abs(center(labelTextBox, "y") - center(controlBox, "y"))).toBeLessThanOrEqual(0.5);
    await expect(page).toHaveScreenshot("jaco-select-placeholder.png", {
      animations: "disabled",
    });
  });

  test("keeps label and value aligned in the closed state", async ({ page }) => {
    await page.goto(storyUrl);
    await expect(page.getByRole("listbox", { name: "Месяц" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox", { name: "Месяц" })).toBeHidden();

    const select = page.locator('[role="combobox"]');
    const control = select.locator("xpath=..");
    const label = page.locator(".MuiInputLabel-root", { hasText: "Месяц" });
    const controlBox = await control.boundingBox();
    const valueTextBox = await textRect(select);
    const labelTextBox = await textRect(label);

    expect(controlBox.height).toBe(44);
    expect(Math.abs(center(valueTextBox, "y") - center(controlBox, "y"))).toBeLessThanOrEqual(0.75);
    expect(Math.abs(valueTextBox.x - labelTextBox.x)).toBeLessThanOrEqual(0.5);
    await expect(page).toHaveScreenshot("jaco-select-closed.png", { animations: "disabled" });
  });

  test("attaches and aligns the open menu with the field", async ({ page }) => {
    await page.goto(storyUrl);

    const select = page.locator('[role="combobox"]');
    const control = select.locator("xpath=..");
    const menu = page.locator(".MuiMenu-paper");
    const firstOption = page.locator(".MuiMenuItem-root").first();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("opacity", "1");
    await expect(menu).toHaveCSS("transform", "none");
    const controlBox = await control.boundingBox();
    const menuBox = await menu.boundingBox();
    const valueTextBox = await textRect(select);
    const optionTextBox = await textRect(firstOption);

    expect(Math.abs(menuBox.x - controlBox.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(menuBox.width - controlBox.width)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(menuBox.y - (controlBox.y + controlBox.height - 1))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(valueTextBox.x - optionTextBox.x)).toBeLessThanOrEqual(0.5);
    await expect(page).toHaveScreenshot("jaco-select-open.png", { animations: "disabled" });
  });
});
