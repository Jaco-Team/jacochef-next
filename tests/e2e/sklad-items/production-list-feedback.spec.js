const { test, expect } = require("@playwright/test");
const { FULL_ACCESS, installSkladMock } = require("./support/skladMock");

test("production lists actual categories and units and sorts by category", async ({ page }) => {
  const state = await installSkladMock(page, { access: FULL_ACCESS });
  state.recipes[0].ed_izmer_name = "Грамм";
  state.recipes[0].categories = [{ id: 11, name: "Ягодная категория" }];
  state.semiFinished[0].ed_izmer_name = "Килограмм";
  state.semiFinished[0].categories = [{ id: 12, name: "Ароматная категория" }];

  await page.goto("/sklad_items/production");
  const recipe = page.getByRole("row", { name: /E2E_SKLAD_Очень длинное название рецепта/ });
  const semi = page.getByRole("row", { name: /E2E_SKLAD_Полуфабрикат/ });
  await expect(page.getByRole("columnheader", { name: "Единица", exact: true })).toBeVisible();
  await expect(recipe.getByRole("cell", { name: "Грамм", exact: true })).toBeVisible();
  await expect(recipe.getByRole("cell", { name: "Ягодная категория", exact: true })).toBeVisible();
  await expect(semi.getByRole("cell", { name: "Килограмм", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Категории", exact: true }).click();
  const rows = page.locator("tbody tr");
  await expect(rows.first()).toContainText("Ароматная категория");
  await expect(rows.nth(1)).toContainText("Ягодная категория");
});

test("production hides units without unit view access even if response contains them", async ({
  page,
}) => {
  const state = await installSkladMock(page, {
    access: { ...FULL_ACCESS, production_unit_view: 0, production_unit_edit: 0 },
  });
  state.recipes[0].ed_izmer_name = "Частная единица";
  await page.goto("/sklad_items/production");
  await expect(
    page.getByRole("button", { name: /Открыть карточку: E2E_SKLAD_Очень длинное/ }),
  ).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Единица", exact: true })).toHaveCount(0);
  await expect(page.getByText("Частная единица")).toHaveCount(0);
});

test("warehouse category manager shows the actual number of child categories", async ({ page }) => {
  await installSkladMock(page, { access: FULL_ACCESS });
  await page.route("**/api/sklad_items/categories/list", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          st: true,
          list: [
            {
              id: 40,
              category_key: "warehouse_item:40",
              name: "Группа",
              source_type: "warehouse_item",
              is_group: true,
              total_usage_count: 0,
              delete_state: "blocked",
              delete_usage: { active_relations: [{ source: "items_cat.parent_id", count: 3 }] },
            },
            {
              id: 41,
              category_key: "warehouse_item:41",
              name: "Подкатегория",
              source_type: "warehouse_item",
              parent_name: "Группа",
              warehouse_items_count: 4,
              total_usage_count: 4,
              delete_state: "blocked",
              delete_usage: { active_relations: [] },
            },
          ],
        },
      }),
    });
  });
  await page.goto("/sklad_items/warehouse-items");
  await page.getByRole("button", { name: "Управление категориями" }).click();
  const dialog = page.getByRole("dialog", { name: /Категории/ });
  await expect(dialog.getByText("Группа складских категорий · Подкатегорий: 3")).toBeVisible();
  await expect(dialog.getByText("Товары: 4", { exact: false })).toHaveCount(0);
  await expect(dialog.getByLabel("4 товара")).toBeVisible();
});
