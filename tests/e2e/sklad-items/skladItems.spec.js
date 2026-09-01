const { test, expect } = require("@playwright/test");
const { FULL_ACCESS, installSkladMock } = require("./support/skladMock");

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

test("полный доступ: все разделы открываются, VK отсутствует", async ({ page }, testInfo) => {
  const state = await installSkladMock(page);

  await page.goto("/sklad_items");
  await expect(page.getByRole("heading", { name: "Склад" })).toBeVisible();

  const tabs = ["Рецепты и полуфабрикаты", "Товары сайта", "Единицы измерения"];
  for (const [index, tab] of tabs.entries()) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    await page.getByRole("tab", { name: tab }).click();
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
    });
  }

  await expect(page.getByRole("tab", { name: "Архив" })).toHaveCount(0);

  await expect(page.getByText("Синхронизировать VK")).toHaveCount(0);
  expect(state.requests.some((request) => request.method.includes("sync_vk"))).toBeFalsy();

  await page.screenshot({ path: testInfo.outputPath("sklad-full-access.png"), fullPage: true });
});

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
  await expect(page.getByRole("heading", { name: "Новый рецепт" })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Новый рецепт");
  const startsAt = page.getByRole("group", { name: "Действует с" });
  await startsAt.getByRole("spinbutton", { name: "Year" }).fill("2026");
  await startsAt.getByRole("spinbutton", { name: "Month" }).fill("08");
  await startsAt.getByRole("spinbutton", { name: "Day" }).fill("01");
  await page.getByRole("button", { name: "Создать", exact: true }).click();
  await expect(page.getByText("E2E_SKLAD_Новый рецепт")).toBeVisible();

  await page
    .getByRole("row", { name: /E2E_SKLAD_Новый рецепт/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Редактирование: E2E_SKLAD_Новый рецепт/ }),
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
  await nomenclature.fill("салат");
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

test("товары сайта: фильтр, создание и редактирование карточки", async ({ page }, testInfo) => {
  const state = await installSkladMock(page, { access: SITE_ITEM_MODAL_ACCESS });
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
  const siteStartsAt = page.getByRole("group", { name: "С" });
  await siteStartsAt.getByRole("spinbutton", { name: "Year" }).fill("2026");
  await siteStartsAt.getByRole("spinbutton", { name: "Month" }).fill("09");
  await siteStartsAt.getByRole("spinbutton", { name: "Day" }).fill("01");
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
  await preparationSearch.fill("салатник");
  await expect(
    page.getByRole("option", { name: "Крышка прозрачная для салатника", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: "Салатник 750 мл", exact: true })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Стикер для салатника", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: "Рис вареный П/Ф", exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("option", { name: "Сахар пакетированный (5гр) П/Ф", exact: true }),
  ).toHaveCount(0);
});

test("товары сайта: редактор тегов переименовывает тег с отдельным правом", async ({ page }) => {
  const state = await installSkladMock(page, { access: SITE_ITEM_MODAL_ACCESS });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();

  await page.getByRole("button", { name: "Редактировать теги" }).click();
  const dialog = page.getByRole("dialog", { name: "Редактирование тегов" });
  await expect(dialog).toBeVisible();

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
    name: "E2E_SKLAD_Фото-2.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(page.getByText("E2E_SKLAD_Фото-2.png")).toBeVisible();
  await expect(page.getByText("E2E_SKLAD_Фото-1.png")).toHaveCount(0);
  const replacementPreview = page.getByRole("img", { name: "E2E_SKLAD_Фото-2.png" });
  await expect(replacementPreview).toBeVisible();
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
  await expect(row.locator("button")).toHaveCount(1);
});

test("матрица прав: редактор без create/delete может только редактировать", async ({ page }) => {
  await installSkladMock(page, { access: { units_view: 1, units_edit: 1 } });

  await page.goto("/sklad_items");

  await expect(page.getByRole("button", { name: "Добавить" })).toBeDisabled();
  const row = page.getByRole("row", { name: /Грамм/ });
  await expect(row.locator("button").first()).toBeEnabled();
  await expect(row.locator("button")).toHaveCount(1);
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
    page.getByRole("group", { name: "Действует с" }).locator("input").first(),
  ).toBeDisabled();
});

test("матрица прав: создание товара показывает обязательные поля без прав на остальные", async ({
  page,
}) => {
  await installSkladMock(page, {
    access: { site_items_view: 1, site_items_create: 1 },
  });

  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();
  await page.getByRole("button", { name: "Новый товар", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("textbox", { name: "Наименование" })).toBeEnabled();
  await expect(dialog.getByRole("group", { name: "С" })).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Старая категория" })).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Новая категория" })).toBeVisible();
  await expect(dialog.getByText("БЖУ", { exact: true })).toHaveCount(0);
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
  await expect(page.getByRole("heading", { name: "Новая единица" })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Единица");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Единица/ })).toBeVisible();

  let row = page.getByRole("row", { name: /E2E_SKLAD_Единица/ });
  await row.locator("button").first().click();
  await expect(page.getByRole("heading", { name: "Редактирование единицы" })).toBeVisible();
  await page.getByLabel("Название").fill("E2E_SKLAD_Единица_Изменена");
  await page.getByRole("button", { name: "Сохранить" }).click();
  row = page.getByRole("row", { name: /E2E_SKLAD_Единица_Изменена/ });
  await expect(row).toBeVisible();

  await row.locator("button").last().click();
  await expect(page.getByRole("heading", { name: "Требуется подтверждение" })).toBeVisible();
  await page.getByRole("button", { name: "ОК" }).click();
  await expect(page.getByRole("row", { name: /E2E_SKLAD_Единица_Изменена/ })).toHaveCount(0);
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
