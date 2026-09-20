import { expect, test } from "@playwright/test";

const storyUrl =
  "/iframe.html?id=chef-design-system-shared-ui-jacoperiodswitch--default&viewMode=story";

const multipleItemsStoryUrl =
  "/iframe.html?id=chef-design-system-shared-ui-jacoperiodswitch--multiple-items&viewMode=story";

test("animates the period thumb smoothly in both directions and respects reduced motion", async ({
  page,
}) => {
  await page.goto(storyUrl);

  const switcher = page.getByRole("tablist");
  const firstHalf = switcher.getByRole("tab", { name: "01.09–15.09" });
  const secondHalf = switcher.getByRole("tab", { name: "16.09–30.09" });
  const restingThumb = switcher.locator("[data-jaco-period-thumb]");
  const restingBox = await restingThumb.boundingBox();

  await expect(firstHalf).toHaveAttribute("aria-selected", "true");
  await secondHalf.click();
  await expect(secondHalf).toHaveAttribute("aria-selected", "true");
  await expect(switcher.locator(".MuiTouchRipple-root")).toHaveCount(0);

  const movingThumb = switcher.locator("[data-jaco-period-thumb]");
  await expect
    .poll(() => movingThumb.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0);

  const stretchedBox = await movingThumb.evaluate((element) => {
    element.getAnimations().forEach((animation) => {
      animation.currentTime = 190;
      animation.pause();
    });

    const box = element.getBoundingClientRect();

    return { x: box.x, width: box.width };
  });

  expect(stretchedBox.width).toBeGreaterThan(restingBox.width * 1.55);

  await movingThumb.evaluate((element) =>
    element.getAnimations().forEach((animation) => animation.play()),
  );

  await movingThumb.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );

  await firstHalf.click();
  await expect(firstHalf).toHaveAttribute("aria-selected", "true");
  await expect(movingThumb).toHaveAttribute("data-direction", "backward");

  const reverseBox = await movingThumb.evaluate((element) => {
    element.getAnimations().forEach((animation) => {
      animation.currentTime = 190;
      animation.pause();
    });

    const box = element.getBoundingClientRect();

    return { x: box.x, width: box.width };
  });

  expect(reverseBox.x).toBeLessThan(stretchedBox.x);
  expect(reverseBox.width).toBeGreaterThan(restingBox.width * 1.55);

  await movingThumb.evaluate((element) =>
    element.getAnimations().forEach((animation) => animation.play()),
  );
  await movingThumb.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );

  const returnedBox = await movingThumb.boundingBox();

  expect(returnedBox.x).toBeCloseTo(restingBox.x, 0);
  expect(returnedBox.width).toBeCloseTo(restingBox.width, 0);

  await secondHalf.click();
  await page.waitForTimeout(120);
  await firstHalf.click();
  await movingThumb.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );

  const interruptedReturnBox = await movingThumb.boundingBox();

  expect(interruptedReturnBox.x).toBeCloseTo(restingBox.x, 0);
  expect(interruptedReturnBox.width).toBeCloseTo(restingBox.width, 0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await secondHalf.click();
  await expect(secondHalf).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() =>
      switcher
        .locator("[data-jaco-period-thumb]")
        .evaluate((element) => element.getAnimations().length),
    )
    .toBe(0);
});

test("supports reusable multi-item choices", async ({ page }) => {
  await page.goto(multipleItemsStoryUrl);

  const switcher = page.getByRole("tablist");
  const cityTabs = switcher.getByRole("tab");

  await expect(cityTabs).toHaveCount(3);
  await switcher.getByRole("tab", { name: "Тольятти" }).click();
  await expect(switcher.getByRole("tab", { name: "Тольятти" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(switcher.locator(".MuiTouchRipple-root")).toHaveCount(0);
});
