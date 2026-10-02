const { test, expect } = require("@playwright/test");
const { FULL_ACCESS, installSkladMock } = require("./support/skladMock");

async function expandWarehouseGroups(page) {
  const expand = page.getByRole("button", { name: "Развернуть все", exact: true });
  await expect(page.locator('[data-testid^="warehouse-category-"]').first()).toBeVisible();
  if (await expand.count()) await expand.click();
}

async function expectConnectedPopup(page, input) {
  let lastGeometry;
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect
    .poll(async () => {
      const control = await input.evaluate((node) => {
        const root = node.closest(".MuiInputBase-root") || node;
        const rect = root.getBoundingClientRect();
        const style = getComputedStyle(root);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          bottom: rect.bottom,
          topRadius: style.borderTopLeftRadius,
          bottomRadius: style.borderBottomLeftRadius,
        };
      });
      const popup = await listbox.evaluate((node) => {
        const paper = node.closest(".MuiPaper-root") || node;
        const rect = paper.getBoundingClientRect();
        const style = getComputedStyle(paper);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          bottom: rect.bottom,
          topRadius: style.borderTopLeftRadius,
          bottomRadius: style.borderBottomLeftRadius,
        };
      });
      const above = popup.y < control.y;
      const seam = above ? popup.bottom - control.y : popup.y - control.bottom;
      lastGeometry = { control, popup, above, seam };
      return (
        Math.abs(popup.x - control.x) <= 1 &&
        Math.abs(popup.width - control.width) <= 1 &&
        Math.abs(seam) <= 2 &&
        (above
          ? control.topRadius === "0px" && popup.bottomRadius === "0px"
          : control.bottomRadius === "0px" && popup.topRadius === "0px") &&
        popup.y >= 0 &&
        popup.bottom <= page.viewportSize().height + 1
      );
    })
    .toBeTruthy()
    .catch((error) => {
      throw new Error(`${error.message}\nGeometry: ${JSON.stringify(lastGeometry)}`);
    });
}

const SITE_ITEM_MODAL_ACCESS = {
  ...FULL_ACCESS,
  date_start_edit: 0,
  site_items_date_start_edit: 0,
  date_end_view: 0,
  date_end_edit: 0,
  site_items_date_end_view: 0,
  site_items_date_end_edit: 0,
  short_name_view: 0,
  short_name_edit: 0,
  site_items_short_name_view: 0,
  site_items_short_name_edit: 0,
  art_view: 0,
  art_edit: 0,
  site_items_art_view: 0,
  site_items_art_edit: 0,
  category_id_view: 0,
  category_id_edit: 0,
  site_items_category_id_view: 0,
  site_items_category_id_edit: 0,
  stol_view: 0,
  stol_edit: 0,
  site_items_stol_view: 0,
  site_items_stol_edit: 0,
  marc_view: 0,
  marc_edit: 0,
  site_items_marc_view: 0,
  site_items_marc_edit: 0,
  portion_view: 0,
  portion_edit: 0,
  site_items_portion_view: 0,
  site_items_portion_edit: 0,
  bju_view: 0,
  bju_edit: 0,
  site_items_bju_view: 0,
  site_items_bju_edit: 0,
  description_view: 0,
  description_edit: 0,
  site_items_description_view: 0,
  site_items_description_edit: 0,
  composition_view: 0,
  composition_edit: 0,
  site_items_composition_view: 0,
  site_items_composition_edit: 0,
};

const SITE_ITEM_READ_ONLY_ACCESS = {
  site_items_view: 1,
  name_view: 1,
  name_edit: 0,
  activity_view: 1,
  activity_edit: 0,
};

test("connected controls: категории, маркировка, этапы и многострочные теги", async ({
  page,
}, testInfo) => {
  const tags = Array.from({ length: 4 }, (_, index) => ({
    id: 31 + index,
    name: `E2E_SKLAD_Длинный тег для проверки переноса ${index + 1}`,
  }));
  await installSkladMock(page, { access: FULL_ACCESS, catalogs: { tags } });
  await page.goto("/sklad_items/site-items");
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();
  const dialog = page.getByRole("dialog");
  for (const [label, option] of [
    ["Старая категория", "E2E_SKLAD_Старая категория"],
    ["Новая категория", "E2E_SKLAD_Салаты и закуски"],
    ["Маркировка", "Обычный товар"],
  ]) {
    const input = dialog.getByRole("combobox", { name: label });
    await input.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await input.click();
    await expectConnectedPopup(page, input);
    await page.screenshot({
      path: testInfo.outputPath(`connected-${label}.png`),
      animations: "disabled",
    });
    await page.getByRole("option", { name: option, exact: true }).click();
  }
  await dialog
    .locator('[role="tab"]:visible, button:visible')
    .filter({ hasText: /^Состав/ })
    .last()
    .click();
  const preparation = dialog.getByRole("combobox").first();
  await preparation.fill("пиццы");
  await expectConnectedPopup(page, preparation);
  await page.getByRole("option", { name: "Коробка для пиццы 35 см", exact: true }).click();
  const stage = page.locator('[role="dialog"] .MuiSelect-select:visible').first();
  await stage.click();
  await expectConnectedPopup(page, stage);
  await page.screenshot({
    path: testInfo.outputPath("connected-stage.png"),
    animations: "disabled",
  });
  await page.getByRole("option").first().click();

  await dialog
    .locator('button:visible, [role="tab"]:visible')
    .filter({ hasText: /^Теги/ })
    .last()
    .click();
  const tagInput = dialog.getByRole("combobox", { name: "Теги", exact: true });
  for (const tag of tags) {
    await tagInput.fill(tag.name);
    await expectConnectedPopup(page, tagInput);
    await page.getByRole("option", { name: tag.name, exact: true }).click();
  }
  const tagControl = tagInput.locator(
    "xpath=ancestor::*[contains(@class,'MuiAutocomplete-root')][1]",
  );
  await expect(tagControl.locator(".MuiChip-root")).toHaveCount(5);
  expect(
    await tagInput.evaluate(
      (input) => input.closest(".MuiInputBase-root").getBoundingClientRect().height,
    ),
  ).toBeGreaterThan(44);
  expect(
    await tagControl.evaluate((element) => {
      const control = element.querySelector(".MuiInputBase-root").getBoundingClientRect();
      return [...element.querySelectorAll(".MuiChip-root")].every((chip) => {
        const box = chip.getBoundingClientRect();
        return (
          box.left >= control.left && box.right <= control.right && box.bottom <= control.bottom
        );
      });
    }),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("connected-tags-wrapped.png"),
    animations: "disabled",
  });
  await tagInput.click();
  await tagControl.getByRole("button", { name: /^(Clear|Очистить)$/ }).click();
  await expect(tagControl.locator(".MuiChip-root")).toHaveCount(0);
});

test("connected controls: текст состава и складские связи сохраняют значения", async ({
  page,
}, testInfo) => {
  const allergens = Array.from({ length: 4 }, (_, index) => ({
    id: 71 + index,
    name: `E2E_SKLAD_Длинное название аллергена ${index + 1}`,
  }));
  const storages = [{ id: 81, name: "Сухой склад" }],
    accounting_systems = [{ id: 91, name: "Меркурий" }];
  const state = await installSkladMock(page, {
    access: FULL_ACCESS,
    catalogs: { allergens, storages, accounting_systems },
  });
  Object.assign(state.warehouseItems[0], {
    allergens: [{ id: 71 }, { id: "72" }],
    allergens_possible: [{ id: 73 }],
  });
  state.semiFinished[0].structure = "Томат (красный, спелый), Соль";
  await page.goto("/sklad_items/production");
  await page
    .getByRole("row", { name: /E2E_SKLAD_Полуфабрикат/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  const dialog = page.getByRole("dialog");
  const summary = dialog.getByRole("textbox", { name: "Состав", exact: true });
  await expect(summary).toHaveValue("Томат (красный, спелый), Соль");
  await expect(summary).toHaveJSProperty("tagName", "TEXTAREA");
  const structure = "Томат (красный, спелый), Соль\nПерец, соль  ";
  await summary.fill(structure);
  await summary.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.screenshot({
    path: testInfo.outputPath("production-structure-textarea.png"),
    animations: "disabled",
  });
  const allergenInput = dialog.getByRole("combobox", { name: "Аллергены", exact: true });
  for (const allergen of allergens) {
    await allergenInput.fill(allergen.name);
    await expectConnectedPopup(page, allergenInput);
    await page.getByRole("option", { name: allergen.name, exact: true }).click();
  }
  expect(
    await allergenInput.evaluate(
      (input) => input.closest(".MuiInputBase-root").getBoundingClientRect().height,
    ),
  ).toBeGreaterThan(44);
  await dialog.getByRole("button", { name: "Сохранить изменения" }).click();
  expect(
    state.requests.findLast(({ method }) => method === "semi-finished/save_edit").data.structure,
  ).toBe(structure);

  await page.goto("/sklad_items/warehouse-items");
  await expandWarehouseGroups(page);
  await page
    .getByRole("row", { name: /E2E_SKLAD_Коробка для пиццы/ })
    .getByRole("button")
    .first()
    .click();
  for (const label of ["Категория", "Единица измерения"]) {
    const input = dialog.getByRole("combobox", { name: new RegExp(label) });
    await expect(input).toHaveAttribute("required", "");
    await input.click();
    await expectConnectedPopup(page, input);
    await page.getByRole("option").first().click();
  }
  for (const name of ["Аллергены", "Возможные аллергены"])
    await expect(dialog.getByRole("combobox", { name, exact: true })).toHaveCount(0);
  const storage = dialog.getByRole("combobox", { name: "Места хранения", exact: true });
  await storage.click();
  await page.getByRole("option", { name: "Сухой склад", exact: true }).click();
  const accounting = dialog.getByRole("combobox", { name: "Системы учёта", exact: true });
  await accounting.click();
  await page.getByRole("option", { name: "Меркурий", exact: true }).click();
  await accounting.blur();
  await accounting.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await expect(dialog.getByText("Хранение и учёт", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-storage-accounting.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data).toMatchObject({
    allergens: [71, 72],
    allergens_possible: [73],
    storages: [81],
    accounting_systems: [91],
  });
});

test("полный доступ: все разделы открываются, VK отсутствует", async ({ page }, testInfo) => {
  const state = await installSkladMock(page);

  await page.goto("/sklad_items");
  await expect(page.getByRole("heading", { name: "Склад" })).toBeVisible();

  const tabs = ["Рецепты и полуфабрикаты", "Товары склада", "Товары сайта", "Единицы измерения"];
  for (const [index, tab] of tabs.entries()) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    await page.getByRole("tab", { name: tab }).click();
    await expect(page.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true");
    if (tab === "Товары склада") await expandWarehouseGroups(page);
    await expect(
      page.getByText(
        [
          "E2E_SKLAD_Очень длинное название рецепта для проверки адаптивной таблицы",
          "E2E_SKLAD_Коробка для пиццы",
          "Каталог, сгруппированный по категориям",
          "Грамм",
        ][index],
        { exact: true },
      ),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(1);
    await page.screenshot({
      path: testInfo.outputPath(`sklad-${index + 1}-${tab.replaceAll(" ", "-")}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }

  await expect(page.getByRole("tab", { name: "Архив" })).toHaveCount(0);

  await expect(page.getByText("Синхронизировать VK")).toHaveCount(0);
  expect(state.requests.some((request) => request.method.includes("sync_vk"))).toBeFalsy();

  await page.screenshot({ path: testInfo.outputPath("sklad-full-access.png"), fullPage: true });
});

test("товары склада: вкладка, фильтр и независимый редактор", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары склада" }).click();
  await expandWarehouseGroups(page);

  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toBeVisible();
  await page.waitForTimeout(750);
  expect(state.requests.filter((request) => request.method === "items/list")).toHaveLength(1);
  const warehouseSearch = page.getByRole("textbox", { name: "Поиск", exact: true });
  expect((await warehouseSearch.boundingBox())?.height || 0).toBeLessThanOrEqual(44);
  await warehouseSearch.fill("не существует");
  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toHaveCount(0);
  await warehouseSearch.fill("");

  await page.getByRole("button", { name: "Добавить товар" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Новый товар склада", { exact: true })).toBeVisible();
  const save = dialog.getByRole("button", { name: "Сохранить изменения", exact: true });
  await expect(save).toBeDisabled();
  await expect(save).toHaveCSS("border-radius", "12px");
  await expect(dialog.getByRole("tab", { name: "Карточка", exact: true })).toHaveCSS(
    "text-transform",
    "none",
  );
  await expect(
    dialog.getByRole("tab", { name: "Карточка", exact: true }).locator("svg"),
  ).toHaveCount(1);
  const nameControl = dialog
    .getByLabel("Наименование")
    .locator("xpath=ancestor::*[contains(@class,'MuiOutlinedInput-root')][1]");
  await expect(nameControl).toHaveCSS("border-radius", "12px");
  await expect(nameControl).toHaveCSS("min-height", "44px");
  const paper = dialog;
  await expect(paper).toHaveCSS(
    "border-top-left-radius",
    testInfo.project.name.startsWith("mobile") ? "24px" : "16px",
  );
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-create.png"),
    animations: "disabled",
  });
  expect((await dialog.getByLabel("Наименование").boundingBox())?.height || 0).toBeLessThanOrEqual(
    44,
  );
  const startsAt = dialog.getByRole("group", { name: "Действует с" });
  for (const label of ["Действует с", "Действует по"]) {
    const date = dialog.getByRole("group", { name: label, exact: true });
    await date.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await expect
      .poll(() =>
        date.evaluate((node) => {
          const label = node.closest(".MuiPickersTextField-root").querySelector("label");
          const l = label.getBoundingClientRect(),
            r = node.getBoundingClientRect();
          return Math.abs(l.y + l.height / 2 - r.y - r.height / 2);
        }),
      )
      .toBeLessThanOrEqual(2);
  }
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-empty-dates.png"),
    animations: "disabled",
  });
  await expect(startsAt.getByRole("spinbutton", { name: "Год" })).toHaveText("ГГГГ");
  await expect(
    dialog.getByLabel("Время разгрузки 1 ед. товара (ММ:СС)", { exact: true }),
  ).toHaveValue("");
  await dialog.getByLabel("Наименование").fill("E2E_SKLAD_Новый товар склада");
  await expect(save).toHaveCSS("background-color", "rgb(22, 163, 74)");
  const closeBox = await dialog.getByRole("button", { name: "Закрыть", exact: true }).boundingBox(),
    saveBox = await save.boundingBox();
  expect(closeBox.x + closeBox.width).toBeLessThan(saveBox.x);
  await dialog.getByRole("combobox", { name: "Категория" }).click();
  await page.getByRole("option", { name: /E2E_SKLAD_Упаковка/ }).click();
  await dialog.getByRole("combobox", { name: "Единица измерения" }).click();
  await page.getByRole("option", { name: "Грамм" }).click();
  await startsAt.getByRole("spinbutton", { name: "Год" }).fill("2026");
  await startsAt.getByRole("spinbutton", { name: "Месяц" }).fill("09");
  await startsAt.getByRole("spinbutton", { name: "День" }).fill("01");
  await dialog.getByLabel("Количество в упаковке").fill("100abc#50");
  await expect(dialog.getByLabel("Количество в упаковке")).toHaveValue("100#50");
  await dialog
    .getByLabel("Время разгрузки 1 ед. товара (ММ:СС)", { exact: true })
    .fill("000000000");
  await expect(
    dialog.getByLabel("Время разгрузки 1 ед. товара (ММ:СС)", { exact: true }),
  ).toHaveValue("00:00");
  await expect(dialog.getByLabel("Состав", { exact: true })).toHaveCount(0);
  await dialog.getByLabel("Для поставщика", { exact: true }).fill("Поставка коробок");
  for (const label of ["Активность", "Показывать в заявке", "Показывать в ревизии"])
    await expect(dialog.getByRole("checkbox", { name: label, exact: true })).not.toBeChecked();
  await dialog.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(() => state.requests.filter(({ method }) => method === "items/list").length)
    .toBeGreaterThan(2);
  await expandWarehouseGroups(page);
  await expect(page.getByText("E2E_SKLAD_Новый товар склада")).toBeVisible();
  const created = state.requests.find((request) => request.method === "items/save_new");
  expect(created?.data).toMatchObject({
    name: "E2E_SKLAD_Новый товар склада",
    category_id: 41,
    ed_izmer_id: 1,
    date_start: "2026-09-01",
    name_for_vendor: "Поставка коробок",
    pf_id: "",
    pq: "100#50",
    time_min: "",
    time_dop_min: "",
    time_min_other: "00:00",
    is_show: "",
    show_in_order: "",
    show_in_rev: "",
  });
  await page
    .getByRole("row", { name: /E2E_SKLAD_Новый товар склада/ })
    .getByRole("button")
    .first()
    .click();
  const editDialog = page.getByRole("dialog");
  await expect(editDialog.getByLabel("Наименование")).toHaveValue("E2E_SKLAD_Новый товар склада");
  await editDialog.getByLabel("Наименование").fill("E2E_SKLAD_Товар склада изменён");
  await editDialog.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByText("E2E_SKLAD_Товар склада изменён")).toBeVisible();
  expect(state.requests.some((request) => request.method === "items/save_edit")).toBeTruthy();
});

test("warehouse modal canonical edit, cancel, history and read-only fields", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
  Object.assign(state.warehouseItems[0], {
    pf_id: 17,
    pq: "24#12",
    name_for_vendor: "Исходный поставщик",
    w_pf: 1,
    two_user: 1,
    allergens: [{ id: 71 }],
    storages: [{ id: 81 }],
    accounting_systems: [{ id: 91 }],
  });
  await page.goto("/sklad_items/warehouse-items");
  await expandWarehouseGroups(page);
  const row = page.getByRole("row", { name: /E2E_SKLAD_Коробка для пиццы/ }),
    dialog = page.getByRole("dialog");
  await row.getByRole("button").first().click();
  await expect(dialog.getByLabel("Наименование")).toHaveValue("E2E_SKLAD_Коробка для пиццы");
  await expect(dialog.getByLabel("Состав", { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("checkbox", { name: "Активность", exact: true })).toBeChecked();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-edit.png"),
    animations: "disabled",
  });
  await dialog
    .getByRole("checkbox", { name: "Показывать в ревизии", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-edit-lower.png"),
    animations: "disabled",
  });
  await dialog.getByLabel("Наименование").fill("Несохранённое имя");
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.some(({ method }) => method === "items/save_edit")).toBeFalsy();
  await row.getByRole("button").first().click();
  await expect(dialog.getByLabel("Наименование")).toHaveValue("E2E_SKLAD_Коробка для пиццы");
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data).toMatchObject({
    id: 51,
    category_id: 41,
    ed_izmer_id: 1,
    pf_id: 17,
    pq: "24#12",
    w_pf: 1,
    two_user: 1,
    allergens: [71],
    storages: [81],
    accounting_systems: [91],
    is_show: 1,
    show_in_order: 1,
    show_in_rev: 0,
  });
  for (const key of Object.keys(state.access))
    if (key.startsWith("warehouse_items_") && key.endsWith("_edit")) state.access[key] = 0;
  state.access.warehouse_items_edit = 1;
  await page.reload();
  await expandWarehouseGroups(page);
  await row.getByRole("button").first().click();
  for (const label of ["Наименование", "Для поставщика", "Количество в упаковке"])
    await expect(dialog.getByRole("textbox", { name: label, exact: true })).toBeDisabled();
  for (const label of ["Категория", "Единица измерения"])
    await expect(dialog.getByRole("combobox", { name: label, exact: true })).toBeDisabled();
  for (const label of ["Активность", "Показывать в заявке", "Показывать в ревизии"])
    await expect(dialog.getByRole("checkbox", { name: label, exact: true })).toBeDisabled();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-readonly.png"),
    animations: "disabled",
  });
  await dialog.getByRole("tab", { name: "История", exact: true }).click();
  await expect(dialog.getByRole("tab", { name: "История", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    dialog.getByRole("button", { name: "Сохранить изменения", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("warehouse-modal-history.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
});

test("warehouse unloading role and minute-second time preserve hidden legacy fields", async ({
  page,
}, testInfo) => {
  const apps = [
    { id: 61, name: "Кладовщик" },
    { id: 62, name: "Кассир" },
  ];
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS }, catalogs: { apps } });
  Object.assign(state.warehouseItems[0], {
    app_id: 61,
    time_min_other: "27:45",
    pf_id: 17,
    time_min: "03:20",
    time_dop_min: "00:10",
  });
  await page.goto("/sklad_items/warehouse-items");
  await expandWarehouseGroups(page);
  const row = page.getByRole("row", { name: /E2E_SKLAD_Коробка для пиццы/ }),
    dialog = page.getByRole("dialog");
  const role = dialog.getByRole("combobox", { name: "Должность в кафе", exact: true });
  const time = dialog.getByRole("textbox", {
    name: "Время разгрузки 1 ед. товара (ММ:СС)",
    exact: true,
  });
  const open = () => row.getByRole("button").first().click();
  await open();
  await expect(role).toHaveText("Кладовщик");
  await expect(time).toHaveValue("27:45");
  for (const name of ["Состав", "Время", "Доп. время", "Другое время"])
    await expect(dialog.getByRole("textbox", { name, exact: true })).toHaveCount(0);
  await time.fill("3045");
  await expect(time).toHaveValue("30:45");
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  expect(state.requests.some(({ method }) => method === "items/save_edit")).toBeFalsy();
  await open();
  await expect(time).toHaveValue("27:45");
  await role.click();
  await page.getByRole("option", { name: "Кассир", exact: true }).click();
  await time.fill("3045");
  await expect(dialog.getByText("За 1 кг / 1 шт / 1 л товара.", { exact: true })).toBeVisible();
  await time.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.screenshot({
    path: testInfo.outputPath("warehouse-unloading.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data).toMatchObject({
    app_id: 62,
    time_min_other: "30:45",
    pf_id: 17,
    time_min: "03:20",
    time_dop_min: "00:10",
  });
  state.access.warehouse_items_apps_edit = 0;
  state.access.warehouse_items_time_edit = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await open();
  await expect(role).toBeDisabled();
  await expect(time).toBeDisabled();
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  state.access.warehouse_items_apps_view = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await open();
  await expect(role).toHaveCount(0);
  await expect(time).toBeVisible();
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  state.access.warehouse_items_time_view = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await open();
  await expect(time).toHaveCount(0);
  await expect(dialog.getByText("Разгрузка", { exact: true })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
});

test("warehouse pack separators hint and labels preserve unchanged legacy values", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
  Object.assign(state.warehouseItems[0], { pq: "legacy ; 2||3", max_count_in_m: "" });
  await page.goto("/sklad_items/warehouse-items");
  await expandWarehouseGroups(page);
  const row = page.getByRole("row", { name: /E2E_SKLAD_Коробка для пиццы/ }),
    dialog = page.getByRole("dialog");
  const save = dialog.getByRole("button", { name: "Сохранить изменения", exact: true });
  await row.getByRole("button").first().click();
  const max = dialog.getByRole("spinbutton", {
    name: "Максимальное количество веса за последние 30 дней",
    exact: true,
  });
  await max.scrollIntoViewIfNeeded();
  expect(
    await max
      .locator("xpath=ancestor::*[contains(@class,'MuiFormControl-root')][1]")
      .locator("label")
      .evaluate((label) => label.scrollWidth <= label.clientWidth + 1),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-weight-label.png"),
    animations: "disabled",
  });
  await expect(dialog.getByRole("checkbox", { name: "Активность", exact: true })).toBeChecked();
  await expect(dialog.getByRole("checkbox", { name: "Активен", exact: true })).toHaveCount(0);
  await save.click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data.pq).toBe(
    "legacy ; 2||3",
  );
  await row.getByRole("button").first().click();
  const pq = dialog.getByRole("textbox", { name: "Количество в упаковке", exact: true });
  await pq.fill("# 0.5 ; 1 / 2 | 3, 4 # 5 ;");
  await expect(pq).toHaveValue("# 0.5 ; 1 / 2 | 3, 4 # 5 ;");
  const hint = dialog.getByRole("button", {
    name: "Подсказка о количестве в упаковке",
    exact: true,
  });
  await hint.scrollIntoViewIfNeeded();
  await hint.click();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Несколько значений можно указать через #, ;, /, | или запятую. Дробные значения — через точку, например 0.5#1.",
  );
  await page.screenshot({
    path: testInfo.outputPath("warehouse-pack-hint.png"),
    animations: "disabled",
  });
  await pq.focus();
  await save.click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data.pq).toBe(
    "0.5#1#2#3#4#5",
  );
  state.warehouseItems[0].pq = " 10 ; 20|30 ";
  state.access.warehouse_items_pq_edit = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await row.getByRole("button").first().click();
  await expect(pq).toBeDisabled();
  await save.click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data.pq).toBe(
    " 10 ; 20|30 ",
  );
});

test("warehouse accounting systems use one relation control and preserve legacy flags", async ({
  page,
}, testInfo) => {
  const accounting_systems = [
    { id: 91, name: "Меркурий" },
    { id: 92, name: "Честный ЗНАК" },
  ];
  const state = await installSkladMock(page, {
    access: { ...FULL_ACCESS },
    catalogs: { accounting_systems },
  });
  Object.assign(state.warehouseItems[0], {
    accounting_systems: [{ id: 91 }, { id: 92 }],
    honest_sign: 1,
    mercury: 0,
  });
  await page.goto("/sklad_items/warehouse-items");
  await expandWarehouseGroups(page);
  const row = page.getByRole("row", { name: /E2E_SKLAD_Коробка для пиццы/ });
  const dialog = page.getByRole("dialog");
  await row.getByRole("button").first().click();
  const systems = dialog.getByRole("combobox", { name: "Системы учёта", exact: true });
  await expect(systems).toHaveCount(1);
  const control = systems.locator("xpath=ancestor::*[contains(@class,'MuiAutocomplete-root')][1]");
  await expect(control.locator(".MuiChip-label")).toHaveText(["Меркурий", "Честный ЗНАК"]);
  for (const name of ["Меркурий", "Честный ЗНАК"])
    await expect(dialog.getByRole("switch", { name, exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("switch")).toHaveCount(4);
  await systems.scrollIntoViewIfNeeded();
  await systems.click();
  await expect(page.getByRole("option", { name: "Честный ЗНАК", exact: true })).toBeVisible();
  await page.getByRole("option", { name: "Меркурий", exact: true }).click();
  await systems.blur();
  await expect(control.locator(".MuiChip-label")).toHaveText(["Честный ЗНАК"]);
  await page.screenshot({
    path: testInfo.outputPath("warehouse-accounting-systems.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "items/save_edit").data).toMatchObject({
    accounting_systems: [92],
    honest_sign: 1,
    mercury: 0,
  });
  state.access.warehouse_items_accounting_systems_edit = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await row.getByRole("button").first().click();
  await expect(systems).toBeDisabled();
  await expect(control.locator(".MuiChip-label")).toHaveText(["Честный ЗНАК"]);
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  state.access.warehouse_items_accounting_systems_view = 0;
  await page.reload();
  await expandWarehouseGroups(page);
  await row.getByRole("button").first().click();
  await expect(systems).toHaveCount(0);
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
});

test("warehouse category tree preserves hierarchy, counts and independent pages", async ({
  page,
}, testInfo) => {
  const categories = [
    { id: 40, name: "Продукты", parent_id: -1, is_group: true },
    { id: 43, name: "Сухие продукты", parent_id: 40, is_group: true },
    { id: 41, name: "Упаковка", parent_id: 43 },
    { id: 42, name: "Упаковка", parent_id: 40 },
    { id: 60, name: "Самоссылка", parent_id: 60 },
    { id: 61, name: "Цикл А", parent_id: 62 },
    { id: 62, name: "Цикл Б", parent_id: 61 },
    { id: 63, name: "Потерянный родитель", parent_id: 999 },
    { id: 70, name: "Категория перед циклом", parent_id: 71 },
    { id: 71, name: "Пустой цикл А", parent_id: 72 },
    { id: 72, name: "Пустой цикл Б", parent_id: 71 },
  ].map((row) => ({
    ...row,
    source_type: "warehouse_item",
    category_key: `warehouse_item:${row.id}`,
  }));
  const state = await installSkladMock(page, { catalogs: { categories } });
  const base = state.warehouseItems[0];
  state.warehouseItems = [
    ...Array.from({ length: 28 }, (_, index) => ({
      ...base,
      id: 100 + index,
      name: `Страница ${String(index + 1).padStart(2, "0")}`,
      delete_state: index === 0 ? "blocked" : "allowed",
    })),
    ...[40, 42, 60, 61, 62, 63, 99, null, 0, 70].map((category_id, index) => ({
      ...base,
      id: 200 + index,
      category_id,
      category_name: category_id === 99 ? "Вне справочника / Не дерево" : "Прежнее название",
      name: `Особый товар ${index}`,
    })),
  ];
  await page.goto("/sklad_items/warehouse-items");
  const root = page.getByTestId("warehouse-category-40"),
    leaf = page.getByTestId("warehouse-category-41");
  await expect(
    root.getByRole("button", { name: "Продукты. Категория 40. Товаров: 30", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(leaf).toHaveCount(0);
  await expect(
    page.getByTestId("warehouse-category-none").getByRole("button", { name: /Товаров: 2$/ }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-tree-collapsed.png"),
    fullPage: true,
    animations: "disabled",
  });
  await expandWarehouseGroups(page);
  await expect(
    root
      .getByTestId("warehouse-category-43")
      .getByRole("button", { name: "Сухие продукты. Категория 43. Товаров: 28", exact: true }),
  ).toBeVisible();
  await expect(root.getByTestId("warehouse-category-41")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-tree-nesting.png"),
    fullPage: true,
    animations: "disabled",
  });
  await expect(
    root
      .getByTestId("warehouse-category-42")
      .getByRole("button", { name: "Упаковка. Категория 42. Товаров: 1", exact: true }),
  ).toBeVisible();
  for (const id of [60, 61, 62, 63, 99])
    await expect(page.getByTestId(`warehouse-category-${id}`)).toBeVisible();
  await expect(page.getByTestId("warehouse-category-70")).toBeVisible();
  for (const id of [71, 72])
    await expect(page.getByTestId(`warehouse-category-${id}`)).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Вне справочника / Не дерево. Категория 99. Товаров: 1",
      exact: true,
    }),
  ).toBeVisible();
  await expect(leaf.getByRole("row")).toHaveCount(26);
  const table = leaf.getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveCount(8);
  await expect(table.getByRole("columnheader", { name: "Категория", exact: true })).toHaveCount(0);
  for (const name of [
    "Название",
    "Единица",
    "Действует с",
    "Действует по",
    "Статус",
    "Заявка",
    "Ревизия",
    "Действия",
  ]) {
    await expect(table.getByRole("columnheader", { name, exact: true })).toHaveCount(1);
  }
  await expect(table.getByRole("row").nth(1).getByRole("cell")).toHaveCount(8);
  await leaf.getByRole("button", { name: "Go to next page" }).click();
  await expect(leaf.getByRole("row")).toHaveCount(4);
  await expect(leaf.getByText("Страница 28", { exact: true })).toBeVisible();
  await expect(root.getByText("Особый товар 0", { exact: true })).toBeVisible();
  await leaf.getByRole("combobox").click();
  await page.getByRole("option", { name: "50", exact: true }).click();
  await expect(leaf.getByRole("row")).toHaveCount(29);
  await leaf.getByRole("combobox").click();
  await page.getByRole("option", { name: "100", exact: true }).click();
  await expect(leaf.getByRole("row")).toHaveCount(29);
  const blocked = leaf.getByRole("row", { name: /^Страница 01 / });
  await expect(blocked.getByRole("button").last()).toBeDisabled();
  expect(state.requests.some(({ method }) => method === "items/delete")).toBeFalsy();
  await leaf.evaluate((node) => node.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -100));
  await table.evaluate((node) => {
    node.parentElement.scrollTop = 0;
    node.parentElement.scrollLeft = 0;
  });
  await page.screenshot({
    path: testInfo.outputPath("warehouse-eight-columns.png"),
    animations: "disabled",
  });
  await table.evaluate((node) => {
    node.parentElement.scrollLeft = node.parentElement.scrollWidth - node.parentElement.clientWidth;
  });
  await expect(table.getByRole("columnheader", { name: "Действия", exact: true })).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-eight-columns-actions.png"),
    animations: "disabled",
  });
  await page.screenshot({
    path: testInfo.outputPath("warehouse-tree-expanded.png"),
    animations: "disabled",
  });
  await blocked.getByRole("button").nth(1).click();
  await expect(
    page.getByRole("dialog").getByRole("tab", { name: "История", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("dialog").getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Свернуть все", exact: true }).click();
  await expect(
    root.getByRole("button", { name: "Продукты. Категория 40. Товаров: 30", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);
});

test("warehouse leaf-only bootstrap restores confirmed parent groups", async ({
  page,
}, testInfo) => {
  const categories = [
    { id: 41, name: "Прочее", parent_id: 40, parent_name: "Хозяйственные товары" },
    { id: 42, name: "Инвентарь / расходники", parent_id: 40, parent_name: "Хозяйственные товары" },
    { id: 51, name: "Прочее", parent_id: 50, parent_name: "Продукты" },
    { id: 61, name: "Без известного родителя", parent_id: 999, parent_name: null },
  ].map((row) => ({
    ...row,
    source_type: "warehouse_item",
    category_key: `warehouse_item:${row.id}`,
  }));
  const state = await installSkladMock(page, { catalogs: { categories } });
  const base = state.warehouseItems[0];
  state.warehouseItems = categories.map((category, index) => ({
    ...base,
    id: 100 + index,
    name: `Bootstrap товар ${index + 1}`,
    category_id: category.id,
    category_name: category.name,
  }));
  await page.goto("/sklad_items/warehouse-items");
  const root = page.getByTestId("warehouse-category-40");
  const products = page.getByTestId("warehouse-category-50");
  await expect(
    root.getByRole("button", {
      name: "Хозяйственные товары. Категория 40. Товаров: 2",
      exact: true,
    }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    products.getByRole("button", { name: "Продукты. Категория 50. Товаров: 1", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("warehouse-category-999")).toHaveCount(0);
  await expect(page.getByTestId("warehouse-category-61")).toBeVisible();
  await expect(page.getByText("4 категорий · 4 товаров", { exact: true })).toBeVisible();
  await root
    .getByRole("button", { name: "Хозяйственные товары. Категория 40. Товаров: 2", exact: true })
    .click();
  await products
    .getByRole("button", { name: "Продукты. Категория 50. Товаров: 1", exact: true })
    .click();
  await expect(
    root.getByRole("button", { name: "Прочее. Категория 41. Товаров: 1", exact: true }),
  ).toBeVisible();
  await expect(
    root.getByRole("button", {
      name: "Инвентарь / расходники. Категория 42. Товаров: 1",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    products.getByRole("button", { name: "Прочее. Категория 51. Товаров: 1", exact: true }),
  ).toBeVisible();
  await root.evaluate((node) => node.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -100));
  await page.screenshot({
    path: testInfo.outputPath("warehouse-bootstrap-tree.png"),
    animations: "disabled",
  });
  const category = page.getByRole("combobox", { name: "Категория", exact: true });
  await category.fill("Прочее");
  await expectConnectedPopup(page, category);
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(page.getByRole("option", { name: "Продукты / Прочее", exact: true })).toBeVisible();
  await page.getByRole("option", { name: "Хозяйственные товары / Прочее", exact: true }).click();
  await expect
    .poll(() => state.requests.findLast(({ method }) => method === "items/list")?.data.category_key)
    .toBe("warehouse_item:41");
  await expect(
    root.getByRole("button", {
      name: "Хозяйственные товары. Категория 40. Товаров: 1",
      exact: true,
    }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Bootstrap товар 1", { exact: true })).toBeVisible();
  await expect(page.getByText("1 категорий · 1 товаров", { exact: true })).toBeVisible();
  await expect(root.getByTestId("warehouse-category-41")).toHaveCount(1);
  const categoryControl = category.locator(
    "xpath=ancestor::*[contains(@class,'MuiAutocomplete-root')][1]",
  );
  await category.click();
  await categoryControl.getByRole("button", { name: /^(Clear|Очистить)$/ }).click();
  await expect
    .poll(() => state.requests.findLast(({ method }) => method === "items/list")?.data.category_key)
    .toBeNull();
  await expect(page.getByText("4 категорий · 4 товаров", { exact: true })).toBeVisible();
  await category.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expandWarehouseGroups(page);
  for (let index = 1; index <= 4; index++)
    await expect(page.getByText(`Bootstrap товар ${index}`, { exact: true })).toHaveCount(1);
  await expect(page.locator('[data-testid^="warehouse-category-"]')).toHaveCount(6);
  await page.getByRole("textbox", { name: "Поиск", exact: true }).fill("Bootstrap товар 3");
  await expect(page.getByText("Bootstrap товар 3", { exact: true })).toBeVisible();
  await expect(
    products.getByRole("button", { name: "Прочее. Категория 51. Товаров: 1", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("1 категорий · 1 товаров", { exact: true })).toBeVisible();
});

test("warehouse category search reveals ancestors and preserves filter payload", async ({
  page,
}, testInfo) => {
  const categories = [
    { id: 40, name: "Хозяйственные товары", parent_id: -1, is_group: true },
    { id: 41, name: "Упаковка", parent_id: 40 },
    { id: 42, name: "Посуда", parent_id: 40 },
  ].map((row) => ({
    ...row,
    source_type: "warehouse_item",
    category_key: `warehouse_item:${row.id}`,
  }));
  const state = await installSkladMock(page, { catalogs: { categories } });
  state.warehouseItems.push({
    ...state.warehouseItems[0],
    id: 52,
    name: "E2E_SKLAD_Тарелка",
    category_id: 42,
    category_name: "Посуда",
    is_active: 0,
  });
  await page.goto("/sklad_items/warehouse-items");
  const category = page.getByRole("combobox", { name: "Категория", exact: true });
  await category.fill("упаков");
  await expectConnectedPopup(page, category);
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath("warehouse-category-search.png"),
    animations: "disabled",
  });
  await page.getByRole("option", { name: "Хозяйственные товары / Упаковка", exact: true }).click();
  await expect
    .poll(() => state.requests.findLast(({ method }) => method === "items/list")?.data.category_key)
    .toBe("warehouse_item:41");
  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы", { exact: true })).toBeVisible();
  const rootButton = page.getByRole("button", {
    name: "Хозяйственные товары. Категория 40. Товаров: 1",
    exact: true,
  });
  await rootButton.click();
  const beforeRefresh = state.requests.filter(({ method }) => method === "items/list").length;
  await page.getByRole("button", { name: "Обновить", exact: true }).click();
  await expect
    .poll(() => state.requests.filter(({ method }) => method === "items/list").length)
    .toBeGreaterThan(beforeRefresh);
  await expect(rootButton).toHaveAttribute("aria-expanded", "false");
  const categoryControl = category.locator(
    "xpath=ancestor::*[contains(@class,'MuiAutocomplete-root')][1]",
  );
  await category.click();
  await categoryControl.getByRole("button", { name: /^(Clear|Очистить)$/ }).click();
  await expect
    .poll(() => state.requests.findLast(({ method }) => method === "items/list")?.data.category_key)
    .toBeNull();
  await category.click();
  await page.getByRole("option", { name: "Все категории", exact: true }).click();
  await page.getByRole("textbox", { name: "Поиск", exact: true }).fill("Тарелка");
  await expect(page.getByText("E2E_SKLAD_Тарелка", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Посуда. Категория 42. Товаров: 1", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("combobox", { name: "Показать", exact: true }).click();
  await page.getByRole("option", { name: "Активные", exact: true }).click();
  await expect(page.getByText("Товары не найдены", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Показать", exact: true }).click();
  await page.getByRole("option", { name: "Неактивные", exact: true }).click();
  await expect(page.getByText("E2E_SKLAD_Тарелка", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("warehouse-filtered-tree.png"),
    animations: "disabled",
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);
});

test("production append row contains only nomenclature", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items/production");
  await page
    .getByRole("row", { name: /E2E_SKLAD_Полуфабрикат/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  const dialog = page.getByRole("dialog"),
    append = dialog.getByPlaceholder("Выберите номенклатуру", { exact: true });
  const appendRow = append.locator("xpath=ancestor::tr[1]");
  await expect(appendRow.getByRole("cell")).toHaveCount(1);
  await expect(appendRow).toHaveText("");
  await append.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.screenshot({
    path: testInfo.outputPath("production-append-only.png"),
    animations: "disabled",
  });
  await append.fill("Рис вареный");
  await page.getByRole("option", { name: "Рис вареный НЕЗАПРАВЛЕННЫЙ", exact: true }).click();
  const composition = dialog.getByRole("table").first(),
    itemRow = composition.getByRole("row").nth(1);
  for (const label of ["Брутто", "Нетто", "Выход"])
    await expect(composition.getByRole("columnheader", { name: label, exact: true })).toBeVisible();
  await itemRow.getByRole("textbox").nth(0).fill("10");
  await itemRow.getByRole("textbox").nth(1).fill("10");
  await itemRow.getByRole("textbox").nth(3).fill("10");
  await expect(itemRow.getByRole("textbox").nth(2)).toHaveValue("9");
  await expect(itemRow.getByRole("textbox").nth(4)).toHaveValue("8.1");
  await expect(appendRow.getByRole("cell")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    state.requests.findLast(({ method }) => method === "semi-finished/save_edit").data,
  ).toMatchObject({
    all_w: 8.1,
    all_w_brutto: 10,
    all_w_netto: 9,
    items: [
      { item_id: 1, type_rec: "item", brutto: "10", pr_1: "10", netto: 9, pr_2: "10", res: 8.1 },
    ],
  });
});

test("production appointments exclusivity and multiline structure", async ({ page }, testInfo) => {
  const apps = [
    { id: 901, name: " Не ТРЕБУЕТСЯ " },
    { id: 902, name: "Повар" },
    { id: 903, name: "Кассир" },
  ];
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS }, catalogs: { apps } });
  Object.assign(state.semiFinished[0], {
    apps: [901, 902],
    structure: "Исходный состав\nБез изменений",
  });
  await page.goto("/sklad_items/production");
  const row = page.getByRole("row", { name: /E2E_SKLAD_Полуфабрикат/ });
  await row.getByRole("button", { name: "Редактировать" }).click();
  const dialog = page.getByRole("dialog"),
    roles = dialog.getByRole("combobox", { name: "Должности в кафе", exact: true });
  const control = roles.locator("xpath=ancestor::*[contains(@class, 'MuiAutocomplete-root')][1]");
  await expect(control.locator(".MuiChip-root")).toHaveCount(2);
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    state.requests.findLast(({ method }) => method === "semi-finished/save_edit").data,
  ).toMatchObject({
    apps: [{ id: 901 }, { id: 902 }],
    structure: "Исходный состав\nБез изменений",
  });
  await row.getByRole("button", { name: "Редактировать" }).click();
  const selectRole = async (name) => {
    await roles.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await roles.fill(name);
    await page.getByRole("option", { name: new RegExp(name, "i") }).click();
  };
  await selectRole("Кассир");
  await expect(control.locator(".MuiChip-root")).toHaveCount(2);
  await expect(control.getByText(/не требуется/i)).toHaveCount(0);
  await selectRole("не требуется");
  await expect(control.locator(".MuiChip-root")).toHaveCount(1);
  await expect(control.getByText(/не требуется/i)).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("production-appointments-none.png"),
    animations: "disabled",
  });
  await selectRole("Повар");
  await expect(control.locator(".MuiChip-root")).toHaveCount(1);
  await expect(control.getByText(/не требуется/i)).toHaveCount(0);
  await selectRole("Кассир");
  await expect(control.locator(".MuiChip-root")).toHaveCount(2);
  await control
    .locator(".MuiChip-root")
    .filter({ hasText: "Повар" })
    .locator(".MuiChip-deleteIcon")
    .click();
  await expect(control.locator(".MuiChip-root")).toHaveCount(1);
  await control.hover();
  await control.locator(".MuiAutocomplete-clearIndicator").click();
  await expect(control.locator(".MuiChip-root")).toHaveCount(0);
  await selectRole("не требуется");
  const structure = dialog.getByRole("textbox", { name: "Состав", exact: true });
  await expect(structure).toHaveJSProperty("tagName", "TEXTAREA");
  const text = "  Томат (красный, спелый), соль\nДобавить ПЕРЕЦ, соль  ";
  await structure.fill(text);
  expect(
    await structure.evaluate(
      (node) => node.clientHeight / parseFloat(getComputedStyle(node).lineHeight),
    ),
  ).toBeGreaterThanOrEqual(3);
  await structure.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.screenshot({
    path: testInfo.outputPath("production-multiline-structure.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    state.requests.findLast(({ method }) => method === "semi-finished/save_edit").data,
  ).toMatchObject({ apps: [{ id: "901" }], structure: text });
  state.access.production_apps_edit = 0;
  state.access.production_structure_edit = 0;
  await page.reload();
  await row.getByRole("button", { name: "Редактировать" }).click();
  await expect(roles).toBeDisabled();
  await expect(structure).toBeDisabled();
  await expect(structure).toHaveValue(text);
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page
    .getByRole("row", { name: /E2E_SKLAD_Очень длинное название рецепта/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  await expect(dialog.getByRole("textbox", { name: "Состав", exact: true })).toHaveCount(0);
});

test("production category add button radius", async ({ page }, testInfo) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  const categories = [],
    created = [];
  await page.route("**/api/sklad_items/categories/**", async (route) => {
    if (route.request().url().endsWith("/save_new")) {
      const data = JSON.parse(new URLSearchParams(route.request().postData()).get("data"));
      created.push(data);
      categories.push({ id: 50, ...data });
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ st: true, list: categories }),
    });
  });
  await page.goto("/sklad_items/production");
  await page.getByRole("button", { name: "Управление категориями" }).click();
  const dialog = page.getByRole("dialog"),
    add = dialog.getByRole("button", { name: "Добавить", exact: true });
  await expect(add).toBeDisabled();
  await expect(add).toHaveCSS("border-radius", "12px");
  await dialog
    .getByRole("textbox", { name: "Новая категория", exact: true })
    .fill("E2E_SKLAD_Category");
  await expect(add).toBeEnabled();
  await expect(add).toHaveCSS("border-radius", "12px");
  await page.screenshot({
    path: testInfo.outputPath("category-add-radius.png"),
    animations: "disabled",
  });
  await add.click();
  await expect(dialog.getByText("E2E_SKLAD_Category", { exact: true })).toBeVisible();
  expect(created).toEqual([
    { name: "E2E_SKLAD_Category", source_type: "semi_finished", parent_id: 0 },
  ]);
  await expect(add).toBeDisabled();
});

test("production creates inactive by default and preserves saved activity", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
  await page.goto("/sklad_items/production");
  const dialog = page.getByRole("dialog"),
    activity = dialog.getByRole("checkbox", { name: "Активность", exact: true });
  for (const [entity, addLabel] of [
    ["recipes", "Добавить рецепт"],
    ["semi-finished", "Добавить полуфабрикат"],
  ]) {
    await page.getByRole("button", { name: addLabel, exact: true }).click();
    await expect(activity).not.toBeChecked();
    await expect(activity).toBeEnabled();
    await activity.check();
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    for (const enabled of [0, 1]) {
      await page.getByRole("button", { name: addLabel, exact: true }).click();
      await expect(activity).not.toBeChecked();
      const name = `E2E_SKLAD_Activity ${entity} ${enabled}`;
      await dialog.getByRole("textbox", { name: "Название", exact: true }).fill(name);
      await dialog.getByRole("textbox", { name: "Срок годности", exact: true }).fill("24 часа");
      const date = dialog.getByRole("group", { name: "Действует С", exact: true });
      await date.getByRole("spinbutton", { name: "Год" }).fill("2026");
      await date.getByRole("spinbutton", { name: "Месяц" }).fill("10");
      await date.getByRole("spinbutton", { name: "День" }).fill("02");
      if (enabled) await activity.check();
      else {
        await activity.evaluate((node) =>
          node.closest("label").scrollIntoView({ block: "center" }),
        );
        await page.screenshot({
          path: testInfo.outputPath(`production-inactive-default-${entity}.png`),
          animations: "disabled",
        });
      }
      await dialog.getByRole("button", { name: "Создать", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      expect(
        state.requests.findLast(({ method }) => method === `${entity}/save_new`).data.is_show,
      ).toBe(enabled);
      await page
        .getByRole("row", { name: new RegExp(name) })
        .getByRole("button", { name: "Редактировать", exact: true })
        .click();
      if (enabled) await expect(activity).toBeChecked();
      else await expect(activity).not.toBeChecked();
      await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      expect(
        state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.is_show,
      ).toBe(enabled);
    }
  }
  state.access.production_activity_edit = 0;
  await page.reload();
  for (const [entity, addLabel] of [
    ["recipes", "Добавить рецепт"],
    ["semi-finished", "Добавить полуфабрикат"],
  ]) {
    await page.getByRole("button", { name: addLabel, exact: true }).click();
    await expect(activity).not.toBeChecked();
    await expect(activity).toBeDisabled();
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page
      .getByRole("row", { name: new RegExp(`E2E_SKLAD_Activity ${entity} 1`) })
      .getByRole("button", { name: "Редактировать", exact: true })
      .click();
    await expect(activity).toBeChecked();
    await expect(activity).toBeDisabled();
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test("production unit autocomplete searches single IDs and preserves fallback", async ({
  page,
}, testInfo) => {
  const units = [
    { id: 1, name: "Грамм" },
    { id: "2", name: "Литр" },
    { id: 3, name: "Грамм" },
  ];
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS }, catalogs: { units } });
  Object.assign(state.semiFinished[0], { ed_izmer_id: 88, unit_name: "Историческая единица" });
  await page.goto("/sklad_items/production");
  const dialog = page.getByRole("dialog"),
    input = dialog.getByRole("combobox", { name: "Единица измерения", exact: true });
  const control = input.locator("xpath=ancestor::*[contains(@class, 'MuiAutocomplete-root')][1]");
  for (const [entity, addLabel, oldName, oldUnit, oldId] of [
    ["recipes", "Добавить рецепт", /E2E_SKLAD_Очень длинное/, "Грамм", 1],
    [
      "semi-finished",
      "Добавить полуфабрикат",
      /E2E_SKLAD_Полуфабрикат/,
      "Историческая единица",
      88,
    ],
  ]) {
    await page
      .getByRole("row", { name: oldName })
      .getByRole("button", { name: "Редактировать", exact: true })
      .click();
    await expect(input).toHaveValue(oldUnit);
    await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.ed_izmer_id,
    ).toBe(oldId);
    await page.getByRole("button", { name: addLabel, exact: true }).click();
    await expect(input).toHaveValue("");
    const name = `E2E_SKLAD_SearchUnit ${entity}`;
    await dialog.getByRole("textbox", { name: "Название", exact: true }).fill(name);
    await dialog.getByRole("textbox", { name: "Срок годности", exact: true }).fill("24 часа");
    const date = dialog.getByRole("group", { name: "Действует С", exact: true });
    await date.getByRole("spinbutton", { name: "Год" }).fill("2026");
    await date.getByRole("spinbutton", { name: "Месяц" }).fill("10");
    await date.getByRole("spinbutton", { name: "День" }).fill("02");
    await input.evaluate(async (node) => {
      const surface = node.closest(".MuiDrawer-paper, .MuiDialog-paper");
      await Promise.all(
        (surface?.getAnimations({ subtree: true }) ?? []).map((animation) =>
          animation.finished.catch(() => {}),
        ),
      );
    });
    await input.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await input.fill("Лит");
    await expect(page.getByRole("option")).toHaveCount(1);
    await expectConnectedPopup(page, input);
    await page.screenshot({
      path: testInfo.outputPath(`production-unit-search-${entity}.png`),
      animations: "disabled",
    });
    await page.getByRole("option", { name: "Литр", exact: true }).click();
    await expect(input).toHaveValue("Литр");
    await expect(control.locator(".MuiChip-root")).toHaveCount(0);
    await dialog.getByRole("button", { name: "Создать", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_new`).data.ed_izmer_id,
    ).toBe(2);
    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: "Редактировать", exact: true }).click();
    await expect(input).toHaveValue("Литр");
    await input.fill("Грамм");
    await expect(page.getByRole("option", { name: "Грамм", exact: true })).toHaveCount(2);
    await page.getByRole("option", { name: "Грамм", exact: true }).last().click();
    await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.ed_izmer_id,
    ).toBe(3);
    await row.getByRole("button", { name: "Редактировать", exact: true }).click();
    await input.click();
    await expect(page.getByRole("option", { name: "Грамм", exact: true }).first()).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(page.getByRole("option", { name: "Грамм", exact: true }).last()).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("Escape");
    await control.hover();
    await control.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(input).toHaveValue("");
    await input.fill("Неизвестная единица");
    await expect(page.getByRole("option")).toHaveCount(0);
    await dialog.getByRole("textbox", { name: "Название", exact: true }).click();
    await expect(input).toHaveValue("");
    await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.ed_izmer_id,
    ).toBeNull();
  }
  state.access.production_unit_edit = 0;
  await page.reload();
  await page
    .getByRole("row", { name: /E2E_SKLAD_Очень длинное/ })
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await expect(input).toHaveValue("Грамм");
  await expect(input).toBeDisabled();
});

test("production employee selector starts empty only for new records", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
  await page.goto("/sklad_items/production");
  const dialog = page.getByRole("dialog");
  const employees = dialog.getByRole("combobox", { name: "Количество сотрудников", exact: true });
  const choose = async (label) => {
    await employees.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await employees.click();
    await expect(page.getByRole("option")).toHaveCount(2);
    await page.getByRole("option", { name: label, exact: true }).click();
    await expect(employees).toHaveText(label);
  };
  for (const [entity, addLabel] of [
    ["recipes", "Добавить рецепт"],
    ["semi-finished", "Добавить полуфабрикат"],
  ]) {
    await page.getByRole("button", { name: addLabel, exact: true }).click();
    await expect(employees).not.toContainText(/Один сотрудник|Два сотрудника/);
    await choose("Два сотрудника");
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    for (const selection of [null, "Один сотрудник", "Два сотрудника"]) {
      await page.getByRole("button", { name: addLabel, exact: true }).click();
      await expect(employees).not.toContainText(/Один сотрудник|Два сотрудника/);
      const name = `E2E_SKLAD_Employees ${entity} ${selection ?? "empty"}`;
      await dialog.getByRole("textbox", { name: "Название", exact: true }).fill(name);
      await dialog.getByRole("textbox", { name: "Срок годности", exact: true }).fill("24 часа");
      const start = dialog.getByRole("group", { name: "Действует С", exact: true });
      await start.getByRole("spinbutton", { name: "Год" }).fill("2026");
      await start.getByRole("spinbutton", { name: "Месяц" }).fill("10");
      await start.getByRole("spinbutton", { name: "День" }).fill("02");
      if (selection) await choose(selection);
      else {
        await employees.evaluate((node) => node.scrollIntoView({ block: "center" }));
        await page.screenshot({
          path: testInfo.outputPath(`production-employees-empty-${entity}.png`),
          animations: "disabled",
        });
      }
      await dialog.getByRole("button", { name: "Создать", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      const expected = selection === "Два сотрудника" ? 1 : 0;
      expect(
        state.requests.findLast(({ method }) => method === `${entity}/save_new`).data.two_user,
      ).toBe(expected);
      await page
        .getByRole("row", { name: new RegExp(name) })
        .getByRole("button", { name: "Редактировать", exact: true })
        .click();
      await expect(employees).toHaveText(expected ? "Два сотрудника" : "Один сотрудник");
      await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      expect(
        state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.two_user,
      ).toBe(expected);
    }
  }
  state.access.production_two_user_edit = 0;
  await page.reload();
  await page
    .getByRole("row", { name: /E2E_SKLAD_Employees recipes Два сотрудника/ })
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await expect(employees).toHaveText("Два сотрудника");
  await expect(employees).toHaveAttribute("aria-disabled", "true");
});

for (const [entity, addLabel] of [
  ["recipes", "Добавить рецепт"],
  ["semi-finished", "Добавить полуфабрикат"],
]) {
  test(`production modal presentation: ${entity}`, async ({ page }, testInfo) => {
    const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
    await page.goto("/sklad_items/production");
    await page.getByRole("button", { name: addLabel, exact: true }).click();
    const dialog = page.getByRole("dialog");
    const name = `E2E_SKLAD_Presentation ${entity}`;
    for (const label of ["Брутто", "Нетто", "Выход"])
      await expect(dialog.getByRole("textbox", { name: label, exact: true })).toHaveCount(0);
    const shelfText =
      "Хранить в закрытой ёмкости при температуре +2…+6 °C не более 48 часов после приготовления.\nПосле вскрытия использовать в течение 12 часов.";
    const shelf = dialog.getByRole("textbox", { name: "Срок годности", exact: true });
    await expect(shelf).toHaveJSProperty("tagName", "TEXTAREA");
    await shelf.fill(shelfText);
    expect(
      await shelf.evaluate(
        (node) => node.clientHeight / parseFloat(getComputedStyle(node).lineHeight),
      ),
    ).toBeGreaterThanOrEqual(3);
    await dialog.getByRole("textbox", { name: "Название", exact: true }).fill(name);
    const dates = [
      dialog.getByRole("group", { name: "Действует С", exact: true }),
      dialog.getByRole("group", { name: "Действует по", exact: true }),
    ];
    const geometry = (field) =>
      field.evaluate((node) => {
        const label = node.closest(".MuiPickersTextField-root").querySelector("label");
        const l = label.getBoundingClientRect(),
          r = node.getBoundingClientRect();
        return {
          shrink: label.dataset.shrink,
          center: Math.abs(l.y + l.height / 2 - r.y - r.height / 2),
          floating: Math.abs(l.y + l.height / 2 - r.y),
        };
      });
    for (const field of dates) {
      await field.evaluate((node) => node.scrollIntoView({ block: "center" }));
      await expect.poll(async () => (await geometry(field)).shrink).toBe("false");
      await expect.poll(async () => (await geometry(field)).center).toBeLessThanOrEqual(2);
    }
    await page.screenshot({
      path: testInfo.outputPath("production-empty-dates.png"),
      animations: "disabled",
    });
    for (const [index, field] of dates.entries()) {
      await field.getByRole("spinbutton", { name: "Год" }).click();
      await expect.poll(async () => (await geometry(field)).shrink).toBe("true");
      await expect.poll(async () => (await geometry(field)).floating).toBeLessThanOrEqual(3);
      await field.getByRole("spinbutton", { name: "Год" }).fill("2026");
      await field.getByRole("spinbutton", { name: "Месяц" }).fill("10");
      await field.getByRole("spinbutton", { name: "День" }).fill(index ? "03" : "02");
    }
    await shelf.click();
    for (const field of dates) {
      await expect.poll(async () => (await geometry(field)).shrink).toBe("true");
      await expect.poll(async () => (await geometry(field)).floating).toBeLessThanOrEqual(3);
    }
    const create = dialog.getByRole("button", { name: "Создать", exact: true });
    await expect(create).toHaveCSS("background-color", "rgb(22, 163, 74)");
    const dateRoot = (field) =>
      field.locator("xpath=ancestor::*[contains(@class, 'MuiPickersTextField-root')][1]");
    for (const [field, disabledDay, allowedDay] of [
      [dates[0], "4", "3"],
      [dates[1], "1", "2"],
    ]) {
      await dateRoot(field).locator('[data-mui-picker-open-button="true"]').click();
      const calendar = page.locator(".MuiDayCalendar-root");
      await expect(
        calendar.locator("button").filter({ hasText: new RegExp(`^${disabledDay}$`) }),
      ).toBeDisabled();
      await expect(
        calendar.locator("button").filter({ hasText: new RegExp(`^${allowedDay}$`) }),
      ).toBeEnabled();
      await page.keyboard.press("Escape");
      await expect(calendar).toHaveCount(0);
    }
    await dates[1].getByRole("spinbutton", { name: "День" }).fill("01");
    await shelf.click();
    await expect(
      dialog.getByText("Дата окончания не может быть раньше даты начала", { exact: true }),
    ).toBeVisible();
    await expect(create).toBeDisabled();
    await dates[1].evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.screenshot({
      path: testInfo.outputPath("production-invalid-range.png"),
      animations: "disabled",
    });
    expect(state.requests.filter(({ method }) => method === `${entity}/save_new`)).toHaveLength(0);
    await dates[1].getByRole("spinbutton", { name: "День" }).fill("02");
    await shelf.click();
    await expect(create).toBeEnabled();
    await expect(
      dialog.getByText("Дата окончания не может быть раньше даты начала", { exact: true }),
    ).toHaveCount(0);
    await dateRoot(dates[1]).hover();
    await dateRoot(dates[1])
      .getByRole("button", { name: "Очистить значение", exact: true })
      .click();
    await expect(create).toBeEnabled();
    await dateRoot(dates[0]).locator('[data-mui-picker-open-button="true"]').click();
    await expect(
      page.locator(".MuiDayCalendar-root button").filter({ hasText: /^4$/ }),
    ).toBeEnabled();
    await page.keyboard.press("Escape");
    await dates[1].getByRole("spinbutton", { name: "Год" }).fill("2026");
    await dates[1].getByRole("spinbutton", { name: "Месяц" }).fill("10");
    await dates[1].getByRole("spinbutton", { name: "День" }).fill("03");
    const employees = page.getByRole("combobox", {
      name: "Количество сотрудников",
      exact: true,
      includeHidden: true,
    });
    await expect(employees).not.toContainText(/Один сотрудник|Два сотрудника/);
    await employees.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await employees.click();
    await expectConnectedPopup(page, employees);
    await expect(page.getByRole("option")).toHaveCount(2);
    await page.screenshot({
      path: testInfo.outputPath("production-employees-menu.png"),
      animations: "disabled",
    });
    await page.getByRole("option", { name: "Два сотрудника", exact: true }).click();
    await expect(employees).toHaveText("Два сотрудника");
    if (entity === "semi-finished") {
      const composition = dialog.getByRole("textbox", { name: "Состав", exact: true });
      await expect(composition).toHaveJSProperty("tagName", "TEXTAREA");
      await expect(dialog.getByRole("combobox", { name: "Состав", exact: true })).toHaveCount(0);
    }
    await shelf.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.screenshot({
      path: testInfo.outputPath("production-filled-dates.png"),
      animations: "disabled",
    });
    await create.click();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_new`).data.shelf_life,
    ).toBe(shelfText);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_new`).data,
    ).toMatchObject({ all_w: 0, all_w_brutto: 0, all_w_netto: 0, items: [], two_user: 1 });
    const source = entity === "recipes" ? state.recipes : state.semiFinished;
    source.find((row) => row.name === name).items = [
      {
        item_id: 1,
        type_rec: "item",
        name: "Рис вареный НЕЗАПРАВЛЕННЫЙ",
        brutto: 10,
        pr_1: 10,
        netto: 9,
        pr_2: 10,
        res: 8.1,
      },
    ];
    Object.assign(
      source.find((row) => row.name === name),
      { date_start: "2026-08-01", date_end: "2026-07-31" },
    );

    await page
      .getByRole("row", { name: new RegExp(name) })
      .getByRole("button", { name: "Редактировать" })
      .click();
    for (const label of ["Брутто", "Нетто", "Выход"]) {
      await expect(dialog.getByRole("textbox", { name: label, exact: true })).toHaveCount(0);
      await expect(dialog.getByRole("columnheader", { name: label, exact: true })).toHaveCount(1);
    }
    await expect(dialog.getByRole("textbox", { name: "Срок годности", exact: true })).toHaveValue(
      shelfText,
    );
    await expect(
      dialog.getByText("Дата окончания не может быть раньше даты начала", { exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Сохранить изменения", exact: true }),
    ).toBeDisabled();
    await dates[1].getByRole("spinbutton", { name: "Месяц" }).fill("08");
    await dates[1].getByRole("spinbutton", { name: "День" }).fill("01");
    await shelf.click();
    await expect(
      dialog.getByRole("button", { name: "Сохранить изменения", exact: true }),
    ).toBeEnabled();
    await expect(employees).toHaveText("Два сотрудника");
    await employees.click();
    await page.getByRole("option", { name: "Один сотрудник", exact: true }).click();
    let releaseSave;
    const saveReady = new Promise((resolve) => {
      releaseSave = resolve;
    });
    await page.route(`**/api/sklad_items/${entity}/save_edit`, async (route) => {
      await saveReady;
      await route.fallback();
    });
    const save = dialog.getByRole("button", { name: "Сохранить изменения", exact: true });
    await expect(save).toHaveCSS("background-color", "rgb(22, 163, 74)");
    await save.click();
    const saving = dialog.locator('button[aria-busy="true"]');
    await expect(saving).toBeDisabled();
    await expect(saving).toHaveCSS("background-color", "rgb(22, 163, 74)");
    await expect(saving.getByRole("progressbar")).toBeVisible();
    releaseSave();
    await expect(dialog).toHaveCount(0);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data.shelf_life,
    ).toBe(shelfText);
    expect(
      state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data,
    ).toMatchObject({
      all_w: 8.1,
      all_w_brutto: 10,
      all_w_netto: 9,
      two_user: 0,
      date_start: "2026-08-01",
      date_end: "2026-08-01",
      items: [{ item_id: 1, type_rec: "item", brutto: 10, netto: 9, res: 8.1 }],
    });
    for (const key of Object.keys(state.access))
      if (key.startsWith("production_") && (key.endsWith("_edit") || key === "production_create"))
        state.access[key] = 0;
    await page.reload();
    await page
      .getByRole("row", { name: new RegExp(name) })
      .getByRole("button", { name: "Редактировать" })
      .click();
    await expect(
      dialog.getByRole("textbox", { name: "Срок годности", exact: true }),
    ).toBeDisabled();
    await expect(employees).toHaveAttribute("aria-disabled", "true");
    await expect(
      dialog.getByRole("button", { name: "Сохранить изменения", exact: true }),
    ).toBeDisabled();
    await expect(
      dialog.getByRole("button", { name: "Сохранить изменения", exact: true }),
    ).toHaveCSS("background-color", "rgb(248, 248, 248)");
  });
}

test("производство: фильтр, сортировка, создание и редактирование рецепта", async ({ page }) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items");

  const longName = "E2E_SKLAD_Очень длинное название рецепта для проверки адаптивной таблицы";
  await expect(page.getByText(longName)).toBeVisible();
  await page.getByRole("button", { name: "Название" }).click();

  const search = page.getByPlaceholder("Название рецепта или полуфабриката");
  await search.fill("не существует");
  await expect(page.getByText(longName)).toHaveCount(0);
  await search.fill("");

  await page.getByRole("button", { name: "Добавить рецепт" }).click();
  await expect(page.getByRole("dialog").getByText("Новый рецепт", { exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Новый рецепт");
  await page.getByLabel("Срок годности").fill("48 часов");
  const startsAt = page.getByRole("group", { name: "Действует С" });
  await startsAt.getByRole("spinbutton", { name: "Год" }).fill("2026");
  await startsAt.getByRole("spinbutton", { name: "Месяц" }).fill("08");
  await startsAt.getByRole("spinbutton", { name: "День" }).fill("01");
  await page.getByRole("button", { name: "Создать", exact: true }).click();
  await expect(page.getByText("E2E_SKLAD_Новый рецепт")).toBeVisible();

  await page
    .getByRole("row", { name: /E2E_SKLAD_Новый рецепт/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  await expect(
    page.getByRole("dialog").getByText(/Редактирование: E2E_SKLAD_Новый рецепт/),
  ).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Рецепт изменён");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByText("E2E_SKLAD_Рецепт изменён")).toBeVisible();
});

test("рецепты: поиск номенклатуры учитывает словоформы и убирает нерелевантное", async ({
  page,
}) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items");
  await page
    .getByRole("row", { name: /E2E_SKLAD_Очень длинное название рецепта/ })
    .getByRole("button", { name: "Редактировать" })
    .click();

  const nomenclature = page.getByPlaceholder("Выберите номенклатуру");
  await nomenclature.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await nomenclature.fill("салат");
  await expectConnectedPopup(page, nomenclature);
  await expect(page.getByRole("option", { name: "Салат Айсберг", exact: true })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Салат Айсберг нарезанный П/Ф", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: "Салатник 750 мл", exact: true })).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Стикер для салатника", exact: true })).toHaveCount(
    0,
  );

  await nomenclature.fill("пиццы");
  await expect(page.getByRole("option", { name: "Пицца Маргарита", exact: true })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Рис вареный НЕЗАПРАВЛЕННЫЙ", exact: true }),
  ).toHaveCount(0);
});

test("товары сайта: даты и все края области загрузки", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  Object.assign(
    state.siteItems.find((item) => item.id === 21),
    { date_start: "", date_end: "" },
  );
  await page.goto("/sklad_items/site-items");
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();
  const dialog = page.getByRole("dialog");
  const nameField = dialog.getByRole("textbox", { name: "Наименование" });
  await nameField.click();
  const startsAt = dialog.getByRole("group", { name: "Действует С", exact: true });
  const endsAt = dialog.getByRole("group", { name: "Действует по", exact: true });
  const header = dialog.locator(".MuiDialogTitle-root");
  const dateGeometry = (field) =>
    field.evaluate((input) => {
      const label = input.closest(".MuiPickersTextField-root").querySelector("label");
      const labelRect = label.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      return {
        shrink: label.dataset.shrink,
        centerOffset: Math.abs(
          labelRect.y + labelRect.height / 2 - inputRect.y - inputRect.height / 2,
        ),
        floatingOffset: Math.abs(labelRect.y + labelRect.height / 2 - inputRect.y),
      };
    });
  for (const field of [startsAt, endsAt]) {
    await expect(field).toBeVisible();
    await expect.poll(async () => (await dateGeometry(field)).shrink).toBe("false");
    expect((await dateGeometry(field)).centerOffset).toBeLessThanOrEqual(2);
  }
  expect(
    await header.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: testInfo.outputPath("site-item-empty-dates.png"),
    animations: "disabled",
  });

  await startsAt.getByRole("spinbutton", { name: "Год" }).click();
  await expect.poll(async () => (await dateGeometry(startsAt)).shrink).toBe("true");
  await expect
    .poll(async () => (await dateGeometry(startsAt)).floatingOffset)
    .toBeLessThanOrEqual(3);
  for (const [field, day] of [
    [startsAt, "02"],
    [endsAt, "03"],
  ]) {
    await field.getByRole("spinbutton", { name: "Год" }).fill("2026");
    await field.getByRole("spinbutton", { name: "Месяц" }).fill("10");
    await field.getByRole("spinbutton", { name: "День" }).fill(day);
  }
  await nameField.click();
  for (const field of [startsAt, endsAt]) {
    await expect.poll(async () => (await dateGeometry(field)).shrink).toBe("true");
    expect((await dateGeometry(field)).floatingOffset).toBeLessThanOrEqual(3);
    await expect(field.getByRole("spinbutton", { name: "Год" })).toHaveText("2026");
    expect(
      await field.evaluate((element) => {
        const container = element
          .querySelector(".MuiPickersInputBase-sectionsContainer")
          .getBoundingClientRect();
        return [...element.querySelectorAll('[role="spinbutton"]')].every((section) => {
          const rect = section.getBoundingClientRect();
          return rect.left >= container.left - 1 && rect.right <= container.right + 1;
        });
      }),
    ).toBeTruthy();
  }
  expect(
    await header.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: testInfo.outputPath("site-item-filled-dates.png"),
    animations: "disabled",
  });

  const dropzone = dialog.locator(".dropzone");
  await dropzone.scrollIntoViewIfNeeded();
  const frame = dropzone.locator("..");
  await expect(dropzone).toHaveCSS("border-top-width", "0px");
  for (const edge of ["top", "right", "bottom", "left"]) {
    await expect(frame).toHaveCSS(`border-${edge}-width`, "1px");
    await expect(frame).toHaveCSS(`border-${edge}-style`, "dashed");
  }
  const visibleEdges = await frame.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const content = element.closest(".MuiDialogContent-root").getBoundingClientRect();
    const footer = element
      .closest(".MuiDialog-paper")
      .querySelector(".MuiDialogActions-root")
      .getBoundingClientRect();
    const points = [
      [rect.x + rect.width / 2, rect.y + 0.5],
      [rect.right - 0.5, rect.y + rect.height / 2],
      [rect.x + rect.width / 2, rect.bottom - 0.5],
      [rect.x + 0.5, rect.y + rect.height / 2],
    ];
    return (
      rect.y >= content.y &&
      rect.bottom <= Math.min(content.bottom, footer.y) + 1 &&
      points.every(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        return hit === element || element.contains(hit);
      })
    );
  });
  expect(visibleEdges).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("site-item-dropzone.png"),
    animations: "disabled",
  });

  const chooserReady = page.waitForEvent("filechooser");
  await dropzone.click();
  const chooser = await chooserReady;
  await chooser.setFiles({
    name: "E2E_SKLAD_image.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZioAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(dropzone.locator(".dz-preview")).toHaveCount(1);
  await dropzone.locator(".dz-remove").click();
  await expect(dropzone.locator(".dz-preview")).toHaveCount(0);
  await expect(dialog.getByText("Перетащите изображение сюда", { exact: true })).toBeVisible();
  expect(
    state.requests.some(
      ({ method }) => method.includes("save_") || method.includes("upload_image"),
    ),
  ).toBeFalsy();
});

test("товары сайта: фильтр, создание и редактирование карточки", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, {
    access: {
      ...SITE_ITEM_MODAL_ACCESS,
      date_start_edit: 1,
      category_id_view: 1,
      category_id_edit: 1,
      site_items_date_start_edit: 1,
      site_items_category_id_view: 1,
      site_items_category_id_edit: 1,
    },
  });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();

  const longName = "E2E_SKLAD_Товар сайта с длинным названием для визуальной проверки";
  await expect(page.getByText("Каталог, сгруппированный по категориям")).toBeVisible();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await expect(
    page.locator('[data-testid="site-item-21"]:visible').getByText(new RegExp(longName)),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("site-items-category-catalog.png") });
  const quickControls = page.locator('[data-testid="site-item-21"]:visible').getByRole("checkbox");
  await expect(quickControls).toHaveCount(2);
  await quickControls.nth(1).click();
  await expect
    .poll(() =>
      state.requests.some(
        (request) =>
          request.method === "site-items/save_flag" &&
          request.data?.type === "show_program" &&
          request.data?.value === 0,
      ),
    )
    .toBeTruthy();
  const search = page.getByPlaceholder("Поиск по названию");
  await search.fill("не существует");
  await expect(page.locator('[data-testid="site-item-21"]:visible')).toHaveCount(0);
  await search.fill("");

  await page.getByRole("button", { name: "Новый товар", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Новый товар сайта" })).toBeVisible();
  await page.getByRole("textbox", { name: "Наименование" }).fill("E2E_SKLAD_Новый товар сайта");
  const siteStartsAt = page.getByRole("group", { name: "Действует С" });
  await siteStartsAt.getByRole("spinbutton", { name: "Год" }).fill("2026");
  await siteStartsAt.getByRole("spinbutton", { name: "Месяц" }).fill("09");
  await siteStartsAt.getByRole("spinbutton", { name: "День" }).fill("01");
  await page.getByRole("combobox", { name: "Старая категория" }).click();
  await page.getByRole("option", { name: "E2E_SKLAD_Старая категория" }).click();
  await page.getByRole("combobox", { name: "Новая категория" }).click();
  await page.getByRole("option", { name: "E2E_SKLAD_Салаты и закуски" }).click();
  await page.getByRole("button", { name: "Создать товар" }).click();
  await expect(
    page.locator('[data-testid="site-item-300"]:visible').getByText(/E2E_SKLAD_Новый товар сайта/),
  ).toBeVisible();

  await page
    .locator('[data-testid="site-item-300"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Редактирование: E2E_SKLAD_Новый товар сайта/ }),
  ).toBeVisible();
  await page.locator("button:visible", { hasText: "Теги" }).last().click();
  for (const label of ["Хит", "Обновлено", "Острый"]) {
    const flag = page.getByRole("checkbox", { name: new RegExp(label) });
    await flag.click();
    await expect(flag).toHaveAttribute("aria-checked", "true");
  }
  await page.locator("button:visible", { hasText: "Активность" }).click();
  const priceFlag = page.getByRole("checkbox", { name: /Установить цену/ });
  await priceFlag.click();
  await expect(priceFlag).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: /В архив/ })).toHaveCount(0);
  await page.locator("button:visible", { hasText: "Основные" }).click();
  await page.getByRole("textbox", { name: "Наименование" }).fill("E2E_SKLAD_Товар изменён");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(
    page.locator('[data-testid="site-item-300"]:visible').getByText(/E2E_SKLAD_Товар изменён/),
  ).toBeVisible();

  const saveRequest = state.requests.findLast(
    (request) => request.method === "site-items/save_edit",
  );
  expect(saveRequest?.data).toMatchObject({
    is_hit: 1,
    is_updated: 1,
    is_spicy: 1,
    is_price: 1,
  });
});

test("товары сайта: поиск в составе исключает постороннюю номенклатуру", async ({ page }) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .locator('[role="tab"]:visible, button:visible')
    .filter({ hasText: /^Состав/ })
    .last()
    .click();

  const preparationSearch = page.getByRole("combobox").first();
  await preparationSearch.fill("пиццы");
  await expect(
    page.getByRole("option", { name: "Коробка для пиццы 35 см", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: "Пакет для пиццы", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Рис вареный П/Ф", exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("option", { name: "Сахар пакетированный (5гр) П/Ф", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("option", { name: "Служебная позиция 001" })).toHaveCount(0);

  await page.getByRole("option", { name: "Коробка для пиццы 35 см", exact: true }).click();
  await expect(preparationSearch).toHaveValue("Коробка для пиццы 35 см");
});

test("товары сайта: редактор тегов переименовывает тег с отдельным правом", async ({ page }) => {
  const state = await installSkladMock(page, { access: SITE_ITEM_MODAL_ACCESS });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();

  await page.getByRole("button", { name: "Редактировать теги" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Редактирование тегов", { exact: true })).toBeVisible();

  await dialog.getByRole("combobox", { name: "Тег" }).click();
  await page.getByRole("option", { name: "E2E_SKLAD_Тег", exact: true }).click();
  await dialog.getByRole("textbox", { name: "Новое название" }).fill("E2E_SKLAD_Новый тег");
  await dialog.getByRole("button", { name: "Сохранить" }).click();

  await expect
    .poll(() =>
      state.requests.some(
        (request) =>
          request.method === "site-items/tags/save_edit" &&
          request.data?.tag_id === 20 &&
          request.data?.name === "E2E_SKLAD_Новый тег",
      ),
    )
    .toBeTruthy();
  await expect(dialog).toHaveCount(0);
});

test("товары сайта: изображение показывается локально и загружается только после сохранения", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: SITE_ITEM_MODAL_ACCESS });
  const itemName = "E2E_SKLAD_Товар сайта с длинным названием для визуальной проверки";
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );

  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();

  const imageInput = page.locator('input[type="file"][accept*="image/jpeg"]');
  await expect(imageInput).toHaveAttribute("accept", /image\/webp.*image\/gif.*image\/bmp/);
  await expect(page.getByText(/Сервер преобразует изображение в JPG и WebP/)).toBeVisible();
  await imageInput.setInputFiles({
    name: "E2E_SKLAD_invalid.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await expect(page.locator(".dz-error-message")).toContainText(
    "Допустимы только JPG, PNG, WebP, GIF, BMP",
  );
  await page.locator(".dz-remove").click();
  await imageInput.setInputFiles({
    name: "E2E_SKLAD_large.gif",
    mimeType: "image/gif",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.locator(".dz-error-message")).toContainText(
    "Размер изображения не должен превышать 10 МБ",
  );
  await page.locator(".dz-remove").click();
  await imageInput.setInputFiles({
    name: "E2E_SKLAD_Фото-1.png",
    mimeType: "image/png",
    buffer: png,
  });

  const preview = page.getByRole("img", { name: "E2E_SKLAD_Фото-1.png" });
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute("src", /^(blob:|data:image\/)/);
  await expect(page.getByText("E2E_SKLAD_Фото-1.png")).toBeVisible();
  expect(
    state.requests.some((request) => request.method === "site-items/upload_image"),
  ).toBeFalsy();

  await imageInput.setInputFiles({
    name: "E2E_SKLAD_Фото-2.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"),
  });
  await expect(page.getByText("E2E_SKLAD_Фото-2.gif")).toBeVisible();
  await expect(page.getByText("E2E_SKLAD_Фото-1.png")).toHaveCount(0);
  const replacementPreview = page.getByRole("img", { name: "E2E_SKLAD_Фото-2.gif" });
  await expect(replacementPreview).toBeVisible();
  await expect
    .poll(() => replacementPreview.evaluate((image) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  await expect(page.getByText("Не удалось загрузить изображение", { exact: true })).toHaveCount(0);
  expect(
    state.requests.some((request) => request.method === "site-items/upload_image"),
  ).toBeFalsy();
  await replacementPreview.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("site-item-selected-image-preview.png") });

  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(
    page.getByRole("heading", { name: new RegExp(`Редактирование: ${itemName}`) }),
  ).toHaveCount(0);

  const saveIndex = state.requests.findIndex(
    (request) => request.method === "site-items/save_edit",
  );
  const uploadIndex = state.requests.findIndex(
    (request) => request.method === "site-items/upload_image",
  );
  expect(saveIndex).toBeGreaterThanOrEqual(0);
  expect(uploadIndex).toBeGreaterThan(saveIndex);
});

test("товары сайта: старая и новая категории независимы и используют общие права", async ({
  page,
}) => {
  const state = await installSkladMock(page, {
    access: {
      ...SITE_ITEM_MODAL_ACCESS,
      category_id_view: 1,
      category_id_edit: 1,
    },
  });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();

  await expect(page.getByRole("combobox", { name: "Старая категория" })).toHaveValue(
    "E2E_SKLAD_Старая категория",
  );
  await expect(page.getByRole("combobox", { name: "Новая категория" })).toHaveValue(
    "E2E_SKLAD_Салаты и закуски",
  );

  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect
    .poll(() => {
      const request = [...state.requests]
        .reverse()
        .find((item) => item.method === "site-items/save_edit");
      return [request?.data?.category_id, request?.data?.category_id2];
    })
    .toEqual([7, 30]);
});

test("товары сайта: красный фокус полей описания и read-only права", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, { access: { ...FULL_ACCESS } });
  const openDescription = async () => {
    await page.goto("/sklad_items/site-items");
    await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
    await page
      .locator('[data-testid="site-item-21"]:visible')
      .getByRole("button", { name: "Редактировать" })
      .click();
    await page
      .getByRole("dialog")
      .locator('button:visible, [role="tab"]:visible')
      .filter({ hasText: /^Описание/ })
      .last()
      .click();
  };
  const labels = ["Состав", "Полное описание (в карточке)", "Короткое описание (в списке)"];
  const getStyle = (input) =>
    input.evaluate((node) => {
      const field = node.closest(".MuiFormControl-root");
      const border = getComputedStyle(field.querySelector("fieldset"));
      return {
        border: border.borderTopColor,
        width: border.borderTopWidth,
        label: getComputedStyle(field.querySelector("label")).color,
      };
    });
  await openDescription();
  const dialog = page.getByRole("dialog");
  const save = dialog.getByRole("button", { name: "Сохранить изменения" });
  await expect(save).toBeEnabled();
  await expect(save).toHaveCSS("background-color", "rgb(22, 163, 74)");
  await expect(save).toHaveCSS("min-height", "44px");
  await expect(save).toHaveCSS("border-radius", "8px");
  await expect(save).toHaveCSS("padding-left", "20px");
  await save.hover();
  await expect(save).toHaveCSS("background-color", "rgb(21, 128, 61)");
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).hover();
  await expect(save).toHaveCSS("background-color", "rgb(22, 163, 74)");
  for (const label of labels) {
    const input = dialog.getByRole("textbox", { name: label, exact: true });
    const value = await input.inputValue();
    await input.evaluate((node) => node.scrollIntoView({ block: "center" }));
    const before = await getStyle(input);
    await input.focus();
    await expect
      .poll(() => getStyle(input))
      .toEqual({ border: "rgb(221, 26, 50)", width: "1px", label: "rgb(221, 26, 50)" });
    await expect(input).toHaveValue(value);
    await page.screenshot({
      path: testInfo.outputPath(`description-focus-${labels.indexOf(label)}.png`),
      animations: "disabled",
    });
    await input.blur();
    await expect.poll(() => getStyle(input)).toEqual(before);
  }
  state.access = { ...SITE_ITEM_READ_ONLY_ACCESS, description_view: 1, description_edit: 0 };
  await page.reload();
  await openDescription();
  for (const label of labels) {
    const input = page.getByRole("dialog").getByRole("textbox", { name: label, exact: true });
    await expect(input).toBeDisabled();
    await input.evaluate((node) => node.focus());
    await expect(input).not.toBeFocused();
    expect((await getStyle(input)).border).not.toBe("rgb(221, 26, 50)");
  }
  const disabledSave = page
    .getByRole("dialog")
    .getByRole("button", { name: "Сохранить изменения" });
  await expect(disabledSave).toBeDisabled();
  await expect(disabledSave).toHaveCSS("background-color", "rgb(248, 248, 248)");
  await page.screenshot({
    path: testInfo.outputPath("site-item-save-disabled.png"),
    animations: "disabled",
  });
});

test("товары сайта: детальные права ограничивают разделы и сохранение модалки", async ({
  page,
}) => {
  await installSkladMock(page, { access: SITE_ITEM_READ_ONLY_ACCESS });

  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox", { name: "Наименование" })).toBeDisabled();
  await expect(dialog.getByText("Теги", { exact: true })).toHaveCount(0);
  await dialog.locator("button:visible", { hasText: "Активность" }).click();
  await expect(
    dialog
      .locator('[role="checkbox"]', { hasText: "Активность" })
      .locator('input[type="checkbox"]'),
  ).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Сохранить изменения" })).toBeDisabled();
});

test("товары сайта: независимая модалка истории загружает выбранную и предыдущую версии", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });

  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "История" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: /История версий/ })).toBeVisible();
  await expect(dialog.getByText("Сохранения", { exact: true })).toBeVisible();
  await expect(dialog.getByText("E2E_SKLAD_Товар сайта обновлённый")).toBeVisible();
  await expect
    .poll(
      () =>
        state.requests.filter(
          (request) =>
            request.method === "history/get_one" && request.data?.entity_type === "site_item",
        ).length,
    )
    .toBe(2);

  const onlyChanges = dialog.getByRole("switch", { name: "Только изменения" });
  await expect(onlyChanges).toBeEnabled();
  await onlyChanges.check();
  await dialog.locator("button:visible", { hasText: "Состав" }).first().click();
  await expect(dialog.getByText("Новая позиция товара", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Удалённая позиция товара", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("site-item-history-dialog.png") });
});

test("матрица прав: без доступа разделы скрыты", async ({ page }) => {
  await installSkladMock(page, { access: {} });

  await page.goto("/sklad_items");

  await expect(page.getByText("Нет доступных разделов")).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(0);
});

test("матрица прав: просмотр единиц не разрешает изменения", async ({ page }) => {
  await installSkladMock(page, { access: { units_view: 1 } });

  await page.goto("/sklad_items");

  await expect(page.getByRole("tab", { name: "Единицы измерения" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Добавить" })).toBeDisabled();

  const row = page.getByRole("row", { name: /Грамм/ });
  await expect(row.locator("button").first()).toBeDisabled();
  await expect(row.locator("button")).toHaveCount(2);
  await expect(row.getByRole("button", { name: "История", exact: true })).toBeEnabled();
});

test("матрица прав: редактор без create/delete может только редактировать", async ({ page }) => {
  await installSkladMock(page, { access: { units_view: 1, units_edit: 1 } });

  await page.goto("/sklad_items");

  await expect(page.getByRole("button", { name: "Добавить" })).toBeDisabled();
  const row = page.getByRole("row", { name: /Грамм/ });
  await expect(row.locator("button").first()).toBeEnabled();
  await expect(row.locator("button")).toHaveCount(2);
});

test("матрица прав: архивирование наследует редактирование активности", async ({ page }) => {
  await installSkladMock(page, {
    access: {
      production_view: 1,
      production_edit: 1,
      production_name_view: 1,
      production_name_edit: 1,
      production_date_start_view: 1,
      production_date_start_edit: 0,
      production_activity_view: 1,
      production_activity_edit: 0,
    },
  });

  await page.goto("/sklad_items");
  const row = page.getByRole("row", { name: /E2E_SKLAD_Очень длинное название рецепта/ });
  await expect(row.getByRole("button", { name: "Архивировать" })).toHaveCount(0);
  await row.getByRole("button", { name: "Редактировать" }).click();

  await expect(page.getByRole("textbox", { name: "Название" })).toBeEnabled();
  await expect(
    page.getByRole("group", { name: "Действует С" }).locator("input").first(),
  ).toBeDisabled();
});

test("field access: создание не обходит права обязательных полей", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, {
    access: { production_view: 1, production_create: 1, site_items_view: 1, site_items_create: 1 },
  });
  await page.goto("/sklad_items/production");
  for (const name of ["Добавить рецепт", "Добавить полуфабрикат"]) {
    await page.getByRole("button", { name, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText(
        /Для создания недостаточно прав на обязательные поля: Название, Срок годности, Действует С/,
      ),
    ).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Название", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Создать", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "Закрыть", exact: true }).last().click();
  }
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: "Новый товар", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(/Для создания недостаточно прав на обязательные поля/),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Наименование" })).toBeHidden();
  await expect(dialog.getByRole("combobox", { name: "Старая категория" })).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Создать товар", exact: true })).toBeDisabled();
  await expect(dialog.getByText("БЖУ", { exact: true })).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("missing-create-access.png"),
    animations: "disabled",
  });
  expect(state.requests.filter(({ method }) => method.endsWith("/save_new"))).toHaveLength(0);
});

test("field access: production mixed editor preserves withheld fields and category rights", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, {
    access: {
      production_view: 1,
      production_edit: 1,
      production_create: 1,
      production_delete: 1,
      production_name_view: 1,
      production_unit_view: 1,
      production_time_edit: 1,
      production_categories_view: 1,
    },
    productionDetailOmissions: ["shelf_life", "date_start", "date_end", "categories", "items"],
  });
  await page.goto("/sklad_items/production");
  for (const [entity, source] of [
    ["recipes", state.recipes],
    ["semi-finished", state.semiFinished],
  ]) {
    const original = { ...source[0] };
    await page
      .getByRole("row", { name: new RegExp(original.name) })
      .getByRole("button", { name: "Редактировать", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("textbox", { name: "Название", exact: true })).toBeDisabled();
    await expect(
      dialog.getByRole("combobox", { name: "Единица измерения", exact: true }),
    ).toBeDisabled();
    await expect(dialog.getByRole("textbox", { name: "Срок годности", exact: true })).toHaveCount(
      0,
    );
    await expect(dialog.getByRole("group", { name: "Действует С", exact: true })).toHaveCount(0);
    await expect(dialog.getByRole("checkbox", { name: "Активность", exact: true })).toHaveCount(0);
    await expect(
      dialog.getByRole("heading", { name: /^(Состав|Номенклатура)$/, exact: true }),
    ).toHaveCount(0);
    const time = dialog.getByRole("textbox", { name: "Время приготовления", exact: true });
    await expect(time).toBeEnabled();
    await time.fill("0123");
    await time.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await page.screenshot({
      path: testInfo.outputPath("production-mixed-access.png"),
      animations: "disabled",
    });
    await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const saved = state.requests.findLast(({ method }) => method === `${entity}/save_edit`).data;
    expect(saved).toMatchObject({ id: original.id, time_min: "01:23" });
    for (const field of [
      "name",
      "shelf_life",
      "date_start",
      "ed_izmer_id",
      "categories",
      "items",
      "is_show",
    ])
      expect(saved).not.toHaveProperty(field);
    expect(source[0]).toMatchObject({
      name: original.name,
      shelf_life: original.shelf_life,
      date_start: original.date_start,
      ed_izmer_id: original.ed_izmer_id,
    });
  }
  await page.getByRole("button", { name: "Категории", exact: true }).click();
  const categories = page.getByRole("dialog");
  await expect(
    categories.getByRole("textbox", { name: "Новая категория", exact: true }),
  ).toHaveCount(0);
  await expect(
    categories.getByRole("button", { name: /Редактировать|Удалить|Добавить/ }),
  ).toHaveCount(0);
  expect(
    state.requests.filter(({ method }) => /categories\/save_|categories\/delete/.test(method)),
  ).toHaveLength(0);
});

test("field access: site siblings keep individual rights and sparse writes", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, {
    access: {
      site_items_view: 1,
      site_items_edit: 1,
      tmp_desc_edit: 1,
      marc_desc_full_view: 1,
      protein_edit: 1,
      fat_view: 1,
      count_part_view: 1,
      time_stage_1_edit: 1,
      time_stage_2_view: 1,
      is_new_edit: 1,
      is_hit_view: 1,
      is_show_view: 1,
      show_site_edit: 1,
    },
    siteDetailOmissions: [
      "name",
      "date_start",
      "date_end",
      "category_id",
      "category_id2",
      "carbohydrates",
      "weight",
      "marc_desc",
      "time_stage_3",
    ],
  });
  const original = { ...state.siteItems[0] };
  await page.goto("/sklad_items/site-items");
  await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
  await page
    .locator('[data-testid="site-item-21"]:visible')
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const section = async (name) =>
    dialog
      .locator('button:visible,[role="tab"]:visible')
      .filter({ hasText: new RegExp(`^${name}`) })
      .last()
      .click();
  await section("Описание");
  await expect(dialog.getByRole("textbox", { name: "Состав", exact: true })).toBeEnabled();
  await expect(
    dialog.getByRole("textbox", { name: "Полное описание (в карточке)", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("textbox", { name: "Короткое описание (в списке)", exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole("textbox", { name: "Состав", exact: true }).fill("Разрешённое описание");
  await page.screenshot({
    path: testInfo.outputPath("site-description-mixed-access.png"),
    animations: "disabled",
  });
  await section("БЖУ");
  await expect(dialog.getByRole("spinbutton", { name: "Белки", exact: true })).toBeEnabled();
  await expect(dialog.getByRole("spinbutton", { name: "Жиры", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("spinbutton", { name: "Углеводы", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("textbox", { name: /Калорийность/ })).toHaveCount(0);
  await expect(dialog.getByRole("spinbutton", { name: "Вес", exact: true })).toHaveCount(0);
  await dialog.getByRole("spinbutton", { name: "Белки", exact: true }).fill("12.5");
  await section("Состав");
  const timing = dialog.getByRole("textbox", { name: "Время на 1 этап MM:SS", exact: true });
  await expect(timing).toBeEnabled();
  await timing.fill("0130");
  await expect(
    dialog.getByRole("textbox", { name: "Время на 2 этап MM:SS", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("textbox", { name: "Время на 3 этап MM:SS", exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const saved = state.requests.findLast(({ method }) => method === "site-items/save_edit").data;
  expect(saved).toMatchObject({
    id: 21,
    tmp_desc: "Разрешённое описание",
    protein: "12.5",
    time_stage_1: "01:30",
  });
  for (const field of [
    "name",
    "date_start",
    "category_id",
    "weight",
    "fat",
    "carbohydrates",
    "marc_desc",
    "marc_desc_full",
    "time_stage_2",
    "time_stage_3",
    "item_items",
    "items_stage",
  ])
    expect(saved).not.toHaveProperty(field);
  expect(state.siteItems[0]).toMatchObject({
    name: original.name,
    date_start: original.date_start,
    category_id: original.category_id,
    fat: original.fat,
    carbohydrates: original.carbohydrates,
  });
});

test("field access: stage ingredients and linked items retain original permissions", async ({
  page,
}) => {
  const state = await installSkladMock(page, {
    access: {
      site_items_view: 1,
      site_items_edit: 1,
      stage_edit: 1,
      items_edit: 0,
      stage_view: 1,
      items_view: 0,
    },
  });
  for (const field of ["stage", "items"]) {
    state.access.stage_edit = state.access.stage_view = Number(field === "stage");
    state.access.items_edit = state.access.items_view = Number(field === "items");
    await page.goto("/sklad_items/site-items");
    await page.reload();
    await page.getByRole("button", { name: /E2E_SKLAD_Салаты и закуски/ }).click();
    await page
      .locator('[data-testid="site-item-21"]:visible')
      .getByRole("button", { name: "Редактировать", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText(field === "stage" ? "Состав технологической карты" : "Финальные товары", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      dialog.getByText(field === "stage" ? "Финальные товары" : "Состав технологической карты", {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(dialog.getByRole("combobox")).toHaveCount(1);
    await expect(dialog.getByRole("combobox")).toBeEnabled();
    await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const data = state.requests.findLast(({ method }) => method === "site-items/save_edit").data;
    if (field === "stage") {
      expect(data).toHaveProperty("pf_stage_1");
      expect(data).toHaveProperty("item_stage_3");
      expect(data).not.toHaveProperty("item_items");
    } else {
      expect(data).toHaveProperty("item_items");
      expect(data).not.toHaveProperty("pf_stage_1");
      expect(data).not.toHaveProperty("item_stage_3");
    }
  }
});

test("единицы измерения: создание, редактирование и безопасное удаление", async ({ page }) => {
  await installSkladMock(page, { access: FULL_ACCESS });

  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Единицы измерения" }).click();

  await expect(
    page
      .getByRole("row", { name: /Используемая единица/ })
      .locator("button")
      .last(),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Добавить" }).click();
  await expect(page.getByText("Новая единица", { exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Единица");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Единица/ })).toBeVisible();

  let row = page.getByRole("row", { name: /E2E_SKLAD_Единица/ });
  await row.locator("button").first().click();
  await expect(page.getByText("Редактирование единицы", { exact: true })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Единица_Изменена");
  await page.getByRole("button", { name: "Сохранить" }).click();
  row = page.getByRole("row", { name: /E2E_SKLAD_Единица_Изменена/ });
  await expect(row).toBeVisible();

  await row.locator("button").last().click();
  await expect(page.getByRole("heading", { name: "Требуется подтверждение" })).toBeVisible();
  await page.getByRole("button", { name: "ОК" }).click();
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Единица_Изменена/ })).toHaveCount(0);
});

test("единицы измерения: поиск базовой единицы, Без привязки и отмена", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  state.units[0].id = "1";
  state.units[1].con_id = 1;
  await page.goto("/sklad_items/units");
  await page.getByRole("button", { name: "Добавить единицу", exact: true }).click();
  const baseUnit = page.getByRole("combobox", { name: "Базовая единица" });
  await expect(baseUnit).toHaveValue("Без привязки");
  await expect(page.getByRole("button", { name: "Сохранить", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Сохранить", exact: true })).toHaveCSS(
    "background-color",
    "rgb(248, 248, 248)",
  );

  for (const input of [page.getByLabel("Название", { exact: true }), baseUnit]) {
    const control = await input.evaluate((node) => {
      const root = node.closest(".MuiInputBase-root");
      const style = getComputedStyle(root);
      return { height: root.getBoundingClientRect().height, radius: style.borderTopLeftRadius };
    });
    expect(control.height).toBeCloseTo(44, 2);
    expect(control.radius).toBe("12px");
  }
  await page.screenshot({ path: testInfo.outputPath("unit-create.png"), animations: "disabled" });

  await baseUnit.click();
  await expect(page.getByRole("option")).toHaveCount(3);
  await expectConnectedPopup(page, baseUnit);
  await expect
    .poll(async () => {
      const box = await page.getByRole("listbox").boundingBox();
      return Boolean(box && box.y >= 0 && box.y + box.height <= page.viewportSize().height);
    })
    .toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("unit-options-popup.png"),
    animations: "disabled",
  });
  await baseUnit.fill("грам");
  await expect(page.getByRole("option", { name: "Грамм", exact: true })).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(1);
  const popup = page.getByRole("listbox");
  await expect
    .poll(async () => {
      const box = await popup.boundingBox();
      return Boolean(box && box.y >= 0 && box.y + box.height <= page.viewportSize().height);
    })
    .toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("unit-search-popup.png"),
    animations: "disabled",
  });
  await page.getByRole("option", { name: "Грамм", exact: true }).click();
  await expect(baseUnit).toHaveValue("Грамм");
  await page.getByLabel("Название", { exact: true }).fill("E2E_SKLAD_Поисковая единица");
  await page.getByLabel("Базовое количество", { exact: true }).fill("1000");
  await page.getByLabel("Количество в связке", { exact: true }).fill("1");
  const saveButton = page.getByRole("button", { name: "Сохранить", exact: true });
  const cancelButton = page.getByRole("button", { name: "Отмена", exact: true });
  await expect(saveButton).toBeEnabled();
  await expect(saveButton).toHaveCSS("background-color", "rgb(22, 163, 74)");
  await expect(cancelButton).toHaveCSS("background-color", "rgb(221, 26, 50)");
  const saveBox = await saveButton.boundingBox();
  const cancelBox = await cancelButton.boundingBox();
  const actionBox = await saveButton.evaluate((node) => {
    const box = node.parentElement.getBoundingClientRect();
    return { left: box.left, right: box.right };
  });
  expect(cancelBox.x).toBeCloseTo(actionBox.left, 1);
  expect(saveBox.x + saveBox.width).toBeCloseTo(actionBox.right, 1);
  expect(cancelBox.x + cancelBox.width).toBeLessThan(saveBox.x);
  await page.screenshot({
    path: testInfo.outputPath("unit-create-ready.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Поисковая единица/ })).toBeVisible();
  expect(state.requests.find(({ method }) => method === "units/save_new").data).toEqual({
    name: "E2E_SKLAD_Поисковая единица",
    con_id: 1,
    main_count: 1000,
    con_count: 1,
  });

  await page
    .getByRole("row", { name: /Используемая единица/ })
    .locator("button")
    .first()
    .click();
  await expect(baseUnit).toHaveValue("Грамм");
  await page.getByRole("button", { name: /Использования/ }).click();
  await expect(page.getByText("Рецепты (1)", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      baseUnit.evaluate((node) => {
        const inputBottom = node.closest(".MuiInputBase-root").getBoundingClientRect().bottom;
        const usageTop = node
          .closest(".MuiPaper-root")
          .querySelector(".MuiAccordion-root")
          .getBoundingClientRect().top;
        return Math.round(usageTop - inputBottom);
      }),
    )
    .toBe(16);
  await page.screenshot({
    path: testInfo.outputPath("unit-edit-usage.png"),
    animations: "disabled",
  });
  await baseUnit.fill("Без прив");
  await page.getByRole("option", { name: "Без привязки", exact: true }).click();
  await expect(baseUnit).toHaveValue("Без привязки");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText("Редактирование единицы", { exact: true })).not.toBeVisible();
  expect(state.requests.find(({ method }) => method === "units/save_edit").data.con_id).toBe(0);

  await page.getByRole("button", { name: "Добавить единицу", exact: true }).click();
  await page.getByLabel("Название", { exact: true }).fill("E2E_SKLAD_Не сохранять");
  await baseUnit.fill("грам");
  await page.getByRole("option", { name: "Грамм", exact: true }).click();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByText("Новая единица", { exact: true })).not.toBeVisible();
  expect(state.requests.filter(({ method }) => method === "units/save_new")).toHaveLength(1);
  await page.getByRole("button", { name: "Добавить единицу", exact: true }).click();
  await expect(baseUnit).toHaveValue("Без привязки");
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "закрыть", exact: true }).click();
  await expect(page.getByText("Новая единица", { exact: true })).not.toBeVisible();
});

test("единицы измерения: авторы создания и правок, хронология и значения", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page);
  await page.goto("/sklad_items/units");
  await page.getByRole("button", { name: "Добавить единицу", exact: true }).click();
  await page.getByLabel("Название", { exact: true }).fill("E2E_SKLAD_Аудит единицы");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  let row = page.getByRole("row", { name: /E2E_SKLAD_Аудит единицы/ });
  await row.getByRole("button", { name: "Редактировать", exact: true }).click();
  const history = page.getByRole("list", { name: "История изменений" });
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await expect(history).toContainText("Создание · 01.10.2026 10:00:00");
  await expect(history).toContainText("E2E Автор единицы");
  await expect(history).toContainText("Название: — → E2E_SKLAD_Аудит единицы");
  await expect(history).toContainText("Базовая единица: — → E2E_SKLAD_Аудит единицы");
  state.unitAuditActor = { actor_id: 88, actor_name: "E2E Редактор единицы" };
  await page.getByLabel("Название", { exact: true }).fill("E2E_SKLAD_Аудит после правки");
  await page.getByLabel("Базовое количество", { exact: true }).fill("1000");
  await page.getByRole("combobox", { name: "Базовая единица" }).fill("грам");
  await page.getByRole("option", { name: "Грамм", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  row = page.getByRole("row", { name: /E2E_SKLAD_Аудит после правки/ });
  await expect(row).toBeVisible();
  state.units[0].name = "E2E Позже переименованный грамм";
  await row.getByRole("button", { name: "История", exact: true }).click();
  await expect(history.getByRole("listitem")).toHaveCount(2);
  const entries = history.getByRole("listitem");
  await expect(entries.first()).toContainText("Редактирование · 01.10.2026 10:00:01");
  await expect(entries.first()).toContainText("E2E Редактор единицы");
  await expect(entries.first()).toContainText(
    "Название: E2E_SKLAD_Аудит единицы → E2E_SKLAD_Аудит после правки",
  );
  await expect(entries.first()).toContainText("Базовое количество: 1 → 1000");
  await expect(entries.first()).toContainText("Базовая единица: E2E_SKLAD_Аудит единицы → Грамм");
  await expect(entries.first()).not.toContainText("Позже переименованный");
  await expect(entries.last()).toContainText("Создание");
  await expect(entries.last()).toContainText("E2E Автор единицы");
  await expect(page.getByRole("button", { name: "Сохранить", exact: true })).toHaveCount(0);
  await history.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("unit-history.png"), animations: "disabled" });
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
});

test("единицы измерения: история доступна без редактирования, старые данные без автора", async ({
  page,
}) => {
  const state = await installSkladMock(page, {
    access: { units_view: 1 },
    unitDetail: async (response, data) => ({
      ...response,
      history: Number(data.id) === 1 ? null : [],
    }),
  });
  await page.goto("/sklad_items/units");
  for (const name of ["Грамм", "Используемая единица"]) {
    await page
      .getByRole("row", { name: new RegExp(name) })
      .getByRole("button", { name: "История", exact: true })
      .click();
    await expect(page.getByText("История единицы", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "История изменений пока отсутствует. Для старых записей автор создания неизвестен.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Название", { exact: true })).toBeDisabled();
    await expect(page.getByRole("combobox", { name: "Базовая единица" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Сохранить", exact: true })).toHaveCount(0);
    await expect(page.getByRole("list", { name: "История изменений" })).toHaveCount(0);
    await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  }
  expect(
    state.requests.some(({ method }) =>
      ["units/save_new", "units/save_edit", "units/delete"].includes(method),
    ),
  ).toBeFalsy();
});

test("единицы измерения: ошибка истории, повторная загрузка и защита от устаревшего ответа", async ({
  page,
}) => {
  let fail = true;
  let hold = false;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const state = await installSkladMock(page, {
    unitDetail: async (response, data) => {
      if (Number(data.id) === 1 && fail) {
        fail = false;
        return { st: false, text: "E2E Ошибка чтения истории" };
      }
      if (Number(data.id) === 1 && hold) await gate;
      return response;
    },
  });
  await page.goto("/sklad_items/units");
  const gram = page.getByRole("row", { name: /Грамм/ });
  await gram.getByRole("button", { name: "Редактировать", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("E2E Ошибка чтения истории");
  await expect(page.getByRole("button", { name: "Сохранить", exact: true })).toBeDisabled();
  await expect(page.getByText("История изменений пока отсутствует.", { exact: false })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Повторить загрузку", exact: true }).click();
  await expect(page.getByLabel("Название", { exact: true })).toBeEnabled();
  await expect(
    page.getByText("История изменений пока отсутствует.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  hold = true;
  const previousReads = state.requests.filter(({ method }) => method === "units/get_one").length;
  await gram.getByRole("button", { name: "Редактировать", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Загрузка истории…");
  await expect(page.getByLabel("Название", { exact: true })).toBeDisabled();
  await expect
    .poll(() => state.requests.filter(({ method }) => method === "units/get_one").length)
    .toBe(previousReads + 1);
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await page
    .getByRole("row", { name: /Используемая единица/ })
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await expect(page.getByLabel("Название", { exact: true })).toBeEnabled();
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue("Используемая единица");
  const delayedResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/units/get_one") &&
      Number(JSON.parse(new URLSearchParams(response.request().postData()).get("data")).id) === 1,
  );
  release();
  await delayedResponse;
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue("Используемая единица");
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
});

test("mock Яндекс Object Storage сохраняет JPG/WebP и версию", async ({ page }) => {
  await installSkladMock(page);

  await page.goto("/sklad_items");
  const result = await page.evaluate(async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["image"], { type: "image/jpeg" }), "E2E_SKLAD.jpg");
    formData.append("data", JSON.stringify({ id: 100, slot: "main" }));
    const response = await fetch("http://127.0.0.1:8080/api/sklad_items/site-items/upload_image", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    return body.data;
  });

  expect(result.image_version).toBe("E2E_SKLAD_VERSION");
  expect(result.current_fields.img_new).toMatch(/\.jpg$/);
  expect(result.current_fields.img_new_update).toMatch(/\.webp$/);
  expect(result.urls.jpg[0]).toContain("storage.yandexcloud.net/mock/");
});

test("навигация: URL каждой вкладки сохраняется при обновлении и переходах назад/вперёд", async ({
  page,
}) => {
  const state = await installSkladMock(page);
  await page.goto("/sklad_items/warehouse-items?context=test");
  await expandWarehouseGroups(page);
  await expect(page.getByRole("tab", { name: "Товары склада" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toBeVisible();

  const bootstrapCount = state.requests.filter((request) => request.method === "get_all").length;
  await page.getByRole("button", { name: "Обновить", exact: true }).click();
  await expect
    .poll(() => state.requests.filter((request) => request.method === "get_all").length)
    .toBeGreaterThan(bootstrapCount);
  await expect(page.getByRole("tab", { name: "Товары склада" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page).toHaveURL(/\/sklad_items\/warehouse-items\?context=test$/);
  expect(
    state.requests.some(({ method }) =>
      ["recipes/list", "semi-finished/list", "site-items/list", "units/list"].includes(method),
    ),
  ).toBeFalsy();
  await page.reload();
  await expect(page.getByRole("tab", { name: "Товары склада" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const afterReloadBootstrapCount = state.requests.filter(
    (request) => request.method === "get_all",
  ).length;
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await expect(page).toHaveURL(/\/sklad_items\/site-items\?context=test$/);
  await page.getByRole("tab", { name: "Единицы измерения" }).click();
  await expect(page).toHaveURL(/\/sklad_items\/units\?context=test$/);
  await page.goBack();
  await expect(page.getByRole("tab", { name: "Товары сайта" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.goForward();
  await expect(page.getByRole("tab", { name: "Единицы измерения" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(new URL(page.url()).searchParams.get("context")).toBe("test");
  await page.getByRole("tab", { name: "Рецепты и полуфабрикаты" }).click();
  await expect(page).toHaveURL(/\/sklad_items\/production\?context=test$/);
  expect(state.requests.filter((request) => request.method === "get_all").length).toBe(
    afterReloadBootstrapCount,
  );
  expect(new URL(page.url()).searchParams.has("tab")).toBeFalsy();
});

test("навигация: склад не загружает другие разделы до готовности bootstrap", async ({ page }) => {
  let releaseBootstrap;
  const bootstrapReady = new Promise((resolve) => {
    releaseBootstrap = resolve;
  });
  const state = await installSkladMock(page, { bootstrapReady });
  await page.goto("/sklad_items/warehouse-items");
  await expect
    .poll(() => state.requests.filter(({ method }) => method === "get_all").length)
    .toBeGreaterThan(0);
  await expect(page.locator(".MuiBackdrop-root .MuiCircularProgress-root")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  expect(state.requests.filter(({ method }) => method !== "get_all")).toEqual([]);
  await expect(
    page.getByText("E2E_SKLAD_Очень длинное название рецепта для проверки адаптивной таблицы"),
  ).toHaveCount(0);
  releaseBootstrap();
  await expandWarehouseGroups(page);
  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toBeVisible();
  expect(
    state.requests.filter(({ method }) => !["get_all", "items/list"].includes(method)),
  ).toEqual([]);
});

test("навигация: старый tab URL заменяется slash-адресом без потери query", async ({ page }) => {
  const state = await installSkladMock(page);
  await page.goto("/sklad_items?tab=warehouse-items&context=legacy");
  await expandWarehouseGroups(page);
  await expect(page).toHaveURL(/\/sklad_items\/warehouse-items\?context=legacy$/);
  await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toBeVisible();
  expect(
    state.requests.filter(({ method }) => !["get_all", "items/list"].includes(method)),
  ).toEqual([]);
  await page.goto("/sklad_items/warehouse-items?tab=units&context=path");
  await expect(page).toHaveURL(/\/sklad_items\/warehouse-items\?context=path$/);
  await expect(page.getByRole("tab", { name: "Товары склада" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("навигация: неизвестный или недоступный URL выбирает первый разрешённый раздел", async ({
  page,
}) => {
  await installSkladMock(page, { access: { units_view: 1 } });
  for (const key of ["unknown", "warehouse-items"]) {
    await page.goto(`/sklad_items/${key}`);
    await expect(page).toHaveURL(/\/sklad_items\/units$/);
    await expect(page.getByRole("tab", { name: "Единицы измерения" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: "Товары склада" })).toHaveCount(0);
  }
});

for (const accessKey of ["warehouse_items_view", "warehouse_items_edit"]) {
  test(`товары склада: самостоятельное право ${accessKey} открывает раздел без других вкладок`, async ({
    page,
  }) => {
    await installSkladMock(page, { access: { [accessKey]: 1 } });
    await page.goto("/sklad_items/warehouse-items");
    await expandWarehouseGroups(page);
    await expect(page.getByRole("tab")).toHaveCount(1);
    await expect(page.getByText("E2E_SKLAD_Коробка для пиццы")).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить товар" })).toBeDisabled();
    await expect(
      page
        .getByRole("row", { name: /E2E_SKLAD_Коробка/ })
        .getByRole("button")
        .first(),
    )[accessKey.endsWith("_edit") ? "toBeEnabled" : "toBeDisabled"]();
  });
}

test("production listing has read-only activity and revision indicators", async ({
  page,
}, testInfo) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  const base = state.recipes[0];
  state.recipes = [
    [1, 1],
    [1, 0],
    [0, 1],
    [0, 0],
  ].map(([active, revision], index) => ({
    ...base,
    id: 31 + index,
    name: `E2E_SKLAD_Flags${active}${revision}`,
    is_active: String(active),
    show_in_rev: revision,
    is_show: active,
    is_scheduled: index === 0 || index === 3 ? 1 : 0,
    is_archived: index === 2 ? 1 : 0,
    two_user: index === 1 ? 1 : 0,
  }));
  state.semiFinished = [];
  await page.goto("/sklad_items/production");
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Flags11/ })).toBeVisible();
  const table = page.getByRole("table").first();
  await expect(table.getByRole("columnheader")).toHaveCount(9);
  for (const name of ["Активность", "Ревизия"])
    await expect(table.getByRole("columnheader", { name, exact: true })).toBeVisible();
  for (const name of ["Статус", "Срок годности"])
    await expect(table.getByRole("columnheader", { name, exact: true })).toHaveCount(0);
  await expect(table.getByRole("checkbox")).toHaveCount(0);
  const notes = ["Есть новая версия", "2 сотрудника", "Архив", "Запланирована"];
  for (const [index, [active, revision]] of [
    [1, 1],
    [1, 0],
    [0, 1],
    [0, 0],
  ].entries()) {
    const row = table.getByRole("row", { name: new RegExp(`E2E_SKLAD_Flags${active}${revision}`) });
    await expect(row.getByRole("cell")).toHaveCount(9);
    const activity = row.getByRole("img", {
      name: new RegExp(`^Активность: ${active ? "Да" : "Нет"}\\.`),
    });
    const rev = row.getByRole("img", { name: `Ревизия: ${revision ? "Да" : "Нет"}`, exact: true });
    await expect(activity).toHaveAccessibleName(new RegExp(notes[index]));
    await expect(activity).toHaveCSS("color", active ? "rgb(22, 163, 74)" : "rgb(221, 26, 50)");
    await expect(rev).toHaveCSS("color", revision ? "rgb(22, 163, 74)" : "rgb(221, 26, 50)");
    for (const icon of [activity, rev]) {
      await expect(icon).toHaveCSS("width", "24px");
      await expect(icon).toHaveCSS("clip-path", "inset(3px round 4px)");
      expect(await icon.evaluate((node) => node.closest("button, input, [tabindex]"))).toBeNull();
    }
  }
  const row = table.getByRole("row", { name: /E2E_SKLAD_Flags11/ });
  const activity = row.getByRole("img", { name: /^Активность:/ });
  await activity.evaluate((node) => node.scrollIntoView({ block: "center", inline: "center" }));
  const requestCount = state.requests.length;
  await activity.click();
  await row.getByRole("img", { name: "Ревизия: Да", exact: true }).click();
  expect(state.requests).toHaveLength(requestCount);
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: testInfo.outputPath("production-readonly-flags.png"),
    animations: "disabled",
  });
  await row.getByRole("button", { name: "Редактировать", exact: true }).click();
  const dialog = page.getByRole("dialog"),
    shelfLife = dialog.getByRole("textbox", { name: "Срок годности", exact: true });
  await expect(shelfLife).toHaveValue("48 часов");
  const revision = dialog.getByRole("checkbox", { name: "Показывать в ревизии", exact: true });
  await expect(revision).toBeChecked();
  await revision.uncheck();
  await dialog.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    state.requests.findLast(({ method }) => method === "recipes/save_edit").data,
  ).toMatchObject({ id: 31, shelf_life: "48 часов", show_in_rev: 0 });
});

test("рецепты: текущие и исторические вложенные связи блокируют удаление", async ({ page }) => {
  const state = await installSkladMock(page);
  for (const [index, relation] of ["active_relations", "history_relations"].entries()) {
    state.recipes.push({
      ...state.recipes[0],
      id: 20 + index,
      name: `E2E_SKLAD_Вложенный рецепт ${index}`,
      delete_usage: {
        can_delete: false,
        active_relations: [],
        history_relations: [],
        [relation]: [{ source: index ? "recipe_items_hist_new" : "recipe_items_new", count: 1 }],
      },
    });
  }
  await page.goto("/sklad_items/production");
  for (const index of [0, 1]) {
    await expect(
      page
        .getByRole("row", { name: new RegExp(`Вложенный рецепт ${index}`) })
        .getByRole("button")
        .last(),
    ).toBeDisabled();
  }
  expect(state.requests.some((request) => request.method === "entities/delete")).toBeFalsy();
});

test("история: периоды, сравнение состава и отмена будущей версии", async ({ page }) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });

  await page.goto("/sklad_items");
  await page
    .getByRole("row", { name: /E2E_SKLAD_Очень длинное название рецепта/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  await page.getByRole("tab", { name: "История" }).click();

  await expect(page.getByRole("table", { name: "Список сохранений" })).toBeVisible();
  await expect(page.getByRole("row", { name: /10\.09\.2026.*Запланирована/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Заменена/ })).toHaveCount(0);

  const technicalEvents = page.getByRole("switch", {
    name: "Показывать отменённые и заменённые",
  });
  await technicalEvents.check();
  await expect(page.getByRole("row", { name: /Заменена/ })).toBeVisible();

  const onlyChanges = page.getByRole("switch", { name: "Только изменения" });
  await expect(page.getByText(/С предыдущей версией: 01\.08\.2026.*09\.09\.2026/)).toBeVisible();
  await expect(onlyChanges).toBeEnabled();
  await onlyChanges.check();
  await expect(page.getByText("Основные", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Состав", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Удалён из состава")).toBeVisible();
  await expect(page.getByText("Новый компонент", { exact: true })).toBeVisible();

  await page.getByRole("row", { name: /01\.08\.2026 10:00.*Действует/ }).click();
  await expect(page.getByText("Предыдущей версии нет")).toBeVisible();
  await expect(onlyChanges).toBeDisabled();
  await expect(onlyChanges).not.toBeChecked();

  await page.getByRole("row", { name: /31\.08\.2026 12:00.*Запланирована/ }).click();

  await page.getByRole("button", { name: "Отменить версию" }).click();
  await expect
    .poll(() => state.requests.some((request) => request.method === "history/schedule/cancel"))
    .toBeTruthy();
});
