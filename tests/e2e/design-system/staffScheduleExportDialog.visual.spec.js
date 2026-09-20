const { test, expect } = require("@playwright/test");

const storyUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--health-journal-export-dialog&viewMode=story";
const holidayStripeStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--holiday-stripe-continuity&viewMode=story";
const colorLegendStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--color-legend-dialog&viewMode=story";
const fastActionStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--fast-action-schedule-dialog&viewMode=story";
const employeeDayStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--employee-day-dialog&viewMode=story";
const mobileTableTypographyStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--mobile-schedule-table-typography&viewMode=story";
const employeeSearchStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--employee-search-filter&viewMode=story";
const desktopSalaryHeaderStoryUrl =
  "/iframe.html?id=chef-design-system-modules-staff-schedule--desktop-salary-header-typography&viewMode=story";

test.use({ viewport: { width: 1400, height: 800 } });

test("aligns export actions with the date fields", async ({ page }) => {
  await page.goto(storyUrl);

  const dialog = page.getByRole("dialog", { name: "Журнал здоровья" });
  const startField = page
    .getByLabel("Дата от")
    .locator("xpath=ancestor::*[contains(@class,'MuiPickersOutlinedInput-root')][1]");
  const endField = page
    .getByLabel("Дата до")
    .locator("xpath=ancestor::*[contains(@class,'MuiPickersOutlinedInput-root')][1]");
  const downloadButton = page.getByRole("button", { name: "Скачать" });
  const cancelButton = page.getByRole("button", { name: "Отмена" });

  await expect(dialog).toBeVisible();

  const startFieldBox = await startField.boundingBox();
  const endFieldBox = await endField.boundingBox();
  const downloadButtonBox = await downloadButton.boundingBox();
  const cancelButtonBox = await cancelButton.boundingBox();

  expect(Math.abs(downloadButtonBox.x - startFieldBox.x)).toBeLessThanOrEqual(0.5);
  expect(
    Math.abs(cancelButtonBox.x + cancelButtonBox.width - (endFieldBox.x + endFieldBox.width)),
  ).toBeLessThanOrEqual(0.5);
  await expect(page).toHaveScreenshot("staff-schedule-health-journal-dialog.png", {
    animations: "disabled",
  });
});

test("localizes and styles the date picker popup", async ({ page }) => {
  await page.goto(storyUrl);

  await page
    .getByRole("button", { name: /Выберите дату/ })
    .first()
    .click();

  const calendar = page.getByRole("grid", { name: "сентябрь 2026" });
  const actionBar = page.locator(".MuiPickersLayout-actionBar");
  const selectedDay = calendar.getByRole("gridcell", { name: "16" });

  await expect(calendar).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(actionBar.getByRole("button", { name: "Отмена" })).toBeVisible();
  await expect(actionBar.getByRole("button", { name: "Выбрать" })).toBeVisible();
  await expect(selectedDay).toHaveCSS("background-color", "rgb(201, 21, 42)");
  await expect(page).toHaveScreenshot("staff-schedule-health-journal-calendar.png", {
    animations: "disabled",
  });
});

test("keeps the compact holiday stripes continuous between day cells", async ({ page }) => {
  await page.goto(holidayStripeStoryUrl);

  const firstCell = page.getByTestId("holiday-day-0");
  const secondCell = page.getByTestId("holiday-day-1");

  await expect(firstCell).toHaveCSS("background-position", "0px 0px");
  await expect(secondCell).toHaveCSS("background-position", "-42px 0px");
  await expect(page).toHaveScreenshot("staff-schedule-holiday-stripe-continuity.png", {
    animations: "disabled",
  });
});

test("centers color swatches against the complete legend item", async ({ page }) => {
  await page.goto(colorLegendStoryUrl);

  const item = page.getByTestId("color-legend-item-7");
  const swatch = page.getByTestId("color-legend-swatch-7");
  const itemBox = await item.boundingBox();
  const swatchBox = await swatch.boundingBox();

  expect(
    Math.abs(swatchBox.y + swatchBox.height / 2 - (itemBox.y + itemBox.height / 2)),
  ).toBeLessThanOrEqual(0.5);
  await expect(page).toHaveScreenshot("staff-schedule-color-legend-dialog.png", {
    animations: "disabled",
  });
});

test("uses a flat fast-action form with employee data in the header", async ({ page }) => {
  await page.goto(fastActionStoryUrl);

  const dialog = page.getByRole("dialog");
  const title = page.getByTestId("fast-actions-title");
  const panel = page.getByTestId("fast-actions-panel");
  const scopeTabs = page.getByTestId("fast-actions-scope-tabs");
  const activeScopeTab = scopeTabs.getByRole("tab", { name: "На 2 недели" });
  const scopeThumb = scopeTabs.locator("[data-jaco-period-thumb]");
  const scheduleLabel = page.getByText("Выбери часовой график", { exact: true });
  const scheduleSelect = page.getByRole("combobox", { name: "Часы" }).locator("xpath=..");
  const actions = page.getByTestId("fast-actions-buttons");
  const cancelButton = page.getByRole("button", { name: "Отмена" });
  const doneButton = page.getByRole("button", { name: "Готово" });

  await expect(dialog).toBeVisible();
  await expect(title).toContainText("Юкова В. Л.");
  await expect(title).toContainText("Менеджер");
  await expect(title).toContainText("Август 2026");
  await expect(title).not.toContainText("Редактирование");
  await expect(page.getByRole("button", { name: "Назад" })).toBeVisible();
  await expect(panel).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(activeScopeTab).toHaveCSS("color", "rgb(221, 26, 50)");

  const panelBox = await panel.boundingBox();
  const scopeTabsBox = await scopeTabs.boundingBox();
  const scopeThumbBox = await scopeThumb.boundingBox();
  const scheduleLabelBox = await scheduleLabel.boundingBox();
  const scheduleSelectBox = await scheduleSelect.boundingBox();
  const actionsBox = await actions.boundingBox();
  const cancelBox = await cancelButton.boundingBox();
  const doneBox = await doneButton.boundingBox();

  expect(Math.abs(scopeTabsBox.width - panelBox.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(scopeThumbBox.width * 2 + 16 - scopeTabsBox.width)).toBeLessThanOrEqual(1);
  expect(
    scheduleSelectBox.y - (scheduleLabelBox.y + scheduleLabelBox.height),
  ).toBeGreaterThanOrEqual(12);
  expect(Math.abs(cancelBox.x - actionsBox.x)).toBeLessThanOrEqual(0.5);
  expect(
    Math.abs(doneBox.x + doneBox.width - (actionsBox.x + actionsBox.width)),
  ).toBeLessThanOrEqual(0.5);
  await expect(page).toHaveScreenshot("staff-schedule-fast-action-dialog.png", {
    animations: "disabled",
  });
});

test("keeps the fast-action header readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fastActionStoryUrl);

  const title = page.getByTestId("fast-actions-title");

  await expect(title).toContainText("Юкова В. Л.");
  await expect(title).toContainText("Менеджер");
  await expect(title).toContainText("Август 2026");
  await expect(title).not.toContainText("Редактирование");
  await expect(page.getByRole("button", { name: "Назад" })).toBeVisible();
  await expect(page).toHaveScreenshot("staff-schedule-fast-action-dialog-mobile.png", {
    animations: "disabled",
  });
});

test("keeps mobile schedule table text at least 13px", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto(mobileTableTypographyStoryUrl);

  for (const label of ["Ср", "16", "Менеджер", "08:00", "За часы", "1 200"]) {
    const fontSize = await page
      .getByText(label, { exact: true })
      .first()
      .evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize));

    expect(fontSize).toBeGreaterThanOrEqual(13);
  }
});

test("synchronizes every mobile schedule table horizontally", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto(mobileTableTypographyStoryUrl);

  const scrollContainers = page.locator("[data-mobile-synced-scroll]");

  await expect(scrollContainers).toHaveCount(3);
  await scrollContainers.first().evaluate((element) => {
    element.scrollLeft = 24;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect
    .poll(() => scrollContainers.evaluateAll((elements) => elements.map((item) => item.scrollLeft)))
    .toEqual([24, 24, 24]);

  await scrollContainers.last().evaluate((element) => {
    element.scrollLeft = 8;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect
    .poll(() => scrollContainers.evaluateAll((elements) => elements.map((item) => item.scrollLeft)))
    .toEqual([8, 8, 8]);
});

test("hides mobile selection column and fixes employee during horizontal scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto(mobileTableTypographyStoryUrl);

  const scrollContainer = page.locator("[data-mobile-synced-scroll]").first();
  const selectionColumn = page.locator("[data-mobile-selection-column]").first();
  const employeeColumn = page.locator("[data-mobile-employee-column]").first();
  const containerLeft = await scrollContainer.evaluate(
    (element) => element.getBoundingClientRect().left,
  );

  await scrollContainer.evaluate((element) => {
    element.scrollLeft = 120;
    element.dispatchEvent(new Event("scroll"));
  });

  await expect
    .poll(() => selectionColumn.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThanOrEqual(1);
  await expect(selectionColumn).toHaveCSS("opacity", "0");
  await expect
    .poll(() => employeeColumn.evaluate((element) => element.getBoundingClientRect().left))
    .toBeCloseTo(containerLeft, 1);
});

test("keeps mobile schedule and summary columns on the same grid", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto(mobileTableTypographyStoryUrl);

  const dayColumns = page.locator("[data-mobile-day-column]");
  const firstSelectionColumn = page.locator("[data-mobile-selection-column]").first();
  const firstEmployeeColumn = page.locator("[data-mobile-employee-column]").first();
  const summaryLabelColumn = page.locator("[data-mobile-summary-label-column]");

  await expect(dayColumns).toHaveCount(3);
  await expect(page.getByText("2026-09-16", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Ср", { exact: true })).toHaveCount(3);
  await expect(page.getByText("16", { exact: true })).toHaveCount(3);

  const dayColumnWidths = await dayColumns.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );
  const selectionColumnWidth = await firstSelectionColumn.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  const employeeColumnWidth = await firstEmployeeColumn.evaluate(
    (element) => element.getBoundingClientRect().width,
  );
  const summaryLabelWidth = await summaryLabelColumn.evaluate(
    (element) => element.getBoundingClientRect().width,
  );

  expect(new Set(dayColumnWidths.map((width) => Math.round(width * 100) / 100)).size).toBe(1);
  expect(summaryLabelWidth).toBeCloseTo(selectionColumnWidth + employeeColumnWidth, 1);
});

test("filters schedule employees by full name without a request", async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto(employeeSearchStoryUrl);

  const search = page.getByRole("searchbox", { name: "Поиск по ФИО" });

  await expect(page.getByText("Беседина Г. М.", { exact: true })).toBeVisible();
  await expect(page.getByText("Орифов Д. О.", { exact: true })).toBeVisible();
  await expect(page.getByText("Юкова В. Л.", { exact: true })).toBeVisible();
  await expect(page.getByText("Показано • 2 смен", { exact: true })).toBeVisible();

  await search.fill("орифов");
  await expect(page.getByText("Орифов Д. О.", { exact: true })).toBeVisible();
  await expect(page.getByText("Беседина Г. М.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Юкова В. Л.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Показано • 1 смен", { exact: true })).toBeVisible();

  await search.fill("г м");
  await expect(page.getByText("Беседина Г. М.", { exact: true })).toBeVisible();
  await expect(page.getByText("Орифов Д. О.", { exact: true })).toHaveCount(0);

  await search.fill("несуществующий сотрудник");
  await expect(page.getByText("Сотрудники не найдены", { exact: true })).toBeVisible();
});

test("keeps the desktop salary header compact and readable", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(desktopSalaryHeaderStoryUrl);

  const salaryHeaders = page.locator("[data-salary-header-cell]");
  const searchField = page.locator("[data-employee-search-field]");

  await expect(salaryHeaders).toHaveCount(12);
  await expect(searchField).toHaveCSS("padding-top", "12px");

  const fontSizes = await salaryHeaders.evaluateAll((elements) =>
    elements.map((element) => Number.parseFloat(window.getComputedStyle(element).fontSize)),
  );
  const headerHeight = await salaryHeaders
    .first()
    .evaluate((element) => element.closest("tr").getBoundingClientRect().height);

  expect(Math.min(...fontSizes)).toBeGreaterThanOrEqual(12);
  expect(headerHeight).toBeLessThanOrEqual(56);
});

test("uses the shared control radius for temperature and health fields", async ({ page }) => {
  await page.goto(employeeDayStoryUrl);

  const title = page.getByTestId("employee-day-title");
  const assignmentSelect = page.getByRole("combobox", { name: "Кем работает" });
  const temperatureInput = page.getByRole("combobox", { name: "Температура" });
  const temperatureField = page
    .getByRole("combobox", { name: "Температура" })
    .locator("xpath=ancestor::*[contains(@class,'MuiOutlinedInput-root')][1]");
  const temperatureLabel = page.locator("label").filter({ hasText: /^Температура$/ });
  const healthField = page
    .getByRole("combobox", { name: "Здоровье" })
    .locator("xpath=ancestor::*[contains(@class,'MuiOutlinedInput-root')][1]");

  await expect(title).toContainText("Беседина Г. М.");
  await expect(title).toContainText("Менеджер");
  await expect(title).toContainText("16 сентября 2026");
  await expect(title).not.toContainText("Сведения о сотруднике");
  await expect(assignmentSelect).not.toContainText("None");
  await assignmentSelect.click();
  await expect(page.getByRole("option", { name: "None" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(temperatureInput).toBeVisible();
  await expect(temperatureField).toHaveCSS("border-radius", "12px");
  await expect(healthField).toHaveCSS("border-radius", "12px");

  const temperatureFieldBox = await temperatureField.boundingBox();
  const temperatureLabelBox = await temperatureLabel.boundingBox();

  expect(
    Math.abs(
      temperatureLabelBox.y +
        temperatureLabelBox.height / 2 -
        (temperatureFieldBox.y + temperatureFieldBox.height / 2),
    ),
  ).toBeLessThanOrEqual(1);

  await temperatureField.locator(".MuiAutocomplete-popupIndicator").click();
  await page.getByRole("option", { name: "36,6" }).click();
  await expect(temperatureInput).toHaveValue("36,6");
});

test("shows the complete employee edit history as a table", async ({ page }) => {
  await page.goto(employeeDayStoryUrl);
  await page.getByRole("button", { name: "История" }).click();

  const dialog = page.getByRole("dialog", { name: "История редактирования" });
  const table = page.getByRole("table", { name: "История редактирования сотрудника" });

  await expect(dialog).toBeVisible();
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText([
    "Дата изменения",
    "Автор",
    "Рабочее время",
    "Должность",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table.getByText("07.08.2026 09:07:58")).toBeVisible();
  await expect(table.getByText("Беседина Г. М.")).toBeVisible();
  await expect(table.getByText("09:00:00 - 15:00:00")).toBeVisible();
  await expect(table.getByText("16:00:00 - 22:00:00")).toBeVisible();
});
