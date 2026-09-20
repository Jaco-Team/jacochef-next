import { expect, test } from "@playwright/test";

const storyUrl =
  "/iframe.html?id=chef-design-system-shared-ui-controls--selection-controls&viewMode=story";

test.use({ viewport: { width: 440, height: 720 } });

test("places the contextual action next to the field label", async ({ page }) => {
  await page.goto(storyUrl);

  const label = page.getByText("Показывать только активных", { exact: true });
  const helpButton = page.getByRole("button", { name: "Подробнее о фильтре" });
  const toggle = page.locator(".MuiSwitch-root").first();
  const labelBox = await label.boundingBox();
  const helpBox = await helpButton.boundingBox();
  const toggleBox = await toggle.boundingBox();

  expect(helpBox.x - (labelBox.x + labelBox.width)).toBeGreaterThanOrEqual(0);
  expect(helpBox.x - (labelBox.x + labelBox.width)).toBeLessThanOrEqual(8);
  expect(toggleBox.x - (helpBox.x + helpBox.width)).toBeGreaterThan(24);
});
