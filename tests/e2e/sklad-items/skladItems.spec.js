const { test, expect } = require("@playwright/test");
const { FULL_ACCESS, installSkladMock } = require("./support/skladMock");

test("полный доступ: все разделы открываются, VK отсутствует", async ({ page }, testInfo) => {
  const state = await installSkladMock(page);

  await page.goto("/sklad_items");
  await expect(page.getByRole("heading", { name: "Склад" })).toBeVisible();

  const tabs = ["Рецепты и заготовки", "Товары сайта", "Единицы измерения", "Архив"];
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

  const search = page.getByPlaceholder("Название рецепта или заготовки");
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

test("товары сайта: фильтр, создание и редактирование карточки", async ({ page }) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  await page.goto("/sklad_items");
  await page.getByRole("tab", { name: "Товары сайта" }).click();

  const longName = "E2E_SKLAD_Товар сайта с длинным названием для визуальной проверки";
  await expect(page.getByText(longName)).toBeVisible();
  const search = page.getByPlaceholder("Название или короткое название");
  await search.fill("не существует");
  await expect(page.getByText(longName)).toHaveCount(0);
  await search.fill("");

  await page.getByRole("button", { name: "Добавить", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Новый товар сайта" })).toBeVisible();
  await page.getByLabel("Наименование").fill("E2E_SKLAD_Новый товар сайта");
  await page.getByRole("button", { name: "Создать товар" }).click();
  await expect(page.getByText("E2E_SKLAD_Новый товар сайта")).toBeVisible();

  await page
    .getByRole("row", { name: /E2E_SKLAD_Новый товар сайта/ })
    .getByRole("button", { name: "Редактировать" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Редактирование: E2E_SKLAD_Новый товар сайта/ }),
  ).toBeVisible();
  await page.getByLabel("Наименование").fill("E2E_SKLAD_Товар изменён");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByText("E2E_SKLAD_Товар изменён")).toBeVisible();
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
