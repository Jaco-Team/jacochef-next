const { test, expect } = require("@playwright/test");
const { FULL_ACCESS, installSkladMock } = require("./support/skladMock");

async function setup(page, granted = true) {
  await installSkladMock(page, {
    access: FULL_ACCESS,
    catalogs: { linked_modules: { allergens: granted } },
  });
  const state = {
    rows: [{ id: 1, name: "Молоко", dop_name: "Лактоза", sort: 1 }],
    requests: [],
    failNextSave: false,
  };
  await page.route("**/api/allergens/**", async (route) => {
    const request = route.request();
    const method = new URL(request.url()).pathname.split("/").pop();
    const params = new URLSearchParams(request.postData() || "");
    const data = JSON.parse(params.get("data") || "{}");
    state.requests.push({ method, data });
    let body;
    if (method === "get_all") body = { allergens: state.rows, module_info: { name: "Аллергены" } };
    else if (state.failNextSave) {
      state.failNextSave = false;
      body = { st: false, text: "Не удалось сохранить" };
    } else if (method === "save_new") {
      state.rows.push({ id: 2, ...data, sort: 0 });
      body = { st: true, id: 2 };
    } else if (method === "save_edit") {
      state.rows = state.rows.map((row) => (row.id === data.id ? { ...row, ...data } : row));
      body = { st: true, id: data.id };
    } else if (method === "save_sort") {
      for (const item of data.aller)
        state.rows = state.rows.map((row) =>
          row.id === item.id ? { ...row, sort: Number(item.sort) } : row,
        );
      body = { st: true };
    } else throw new Error(`Unexpected allergens API method: ${method}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: body }),
    });
  });
  return state;
}

test("allergens tab requires the original module grant", async ({ page }) => {
  const state = await setup(page, false);
  await page.goto("/sklad_items/allergens");
  await expect(page.getByRole("tab", { name: "Аллергены" })).toHaveCount(0);
  expect(state.requests).toHaveLength(0);
});

test("allergens create, edit and sorting use existing API and retain failed draft", async ({
  page,
}) => {
  const state = await setup(page);
  await page.goto("/sklad_items/allergens");
  await expect(page.getByRole("button", { name: "Открыть карточку: Молоко" })).toBeVisible();
  await page.getByRole("button", { name: "Добавить аллерген" }).click();
  const dialog = page.getByRole("dialog", { name: "Новый аллерген" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Название", { exact: true }).fill("Орехи");
  await dialog.getByLabel("Доп. название").fill("Арахис");
  state.failNextSave = true;
  await dialog.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByText("Не удалось сохранить")).toBeVisible();
  await expect(dialog.getByLabel("Название", { exact: true })).toHaveValue("Орехи");
  await dialog.getByRole("button", { name: "Сохранить" }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.requests.filter(({ method }) => method === "save_new").at(-1).data).toEqual({
    name: "Орехи",
    dop_name: "Арахис",
  });
  await page.getByRole("button", { name: "Открыть карточку: Орехи" }).click();
  const edit = page.getByRole("dialog", { name: "Редактирование аллергена" });
  await edit.getByLabel("Доп. название").fill("Миндаль");
  await edit.getByRole("button", { name: "Сохранить" }).click();
  await expect(edit).toHaveCount(0);
  expect(state.requests.findLast(({ method }) => method === "save_edit").data).toEqual({
    id: 2,
    name: "Орехи",
    dop_name: "Миндаль",
  });
  await page.getByRole("spinbutton", { name: "Сортировка: Орехи" }).fill("2");
  await page.getByRole("spinbutton", { name: "Сортировка: Орехи" }).fill("0");
  await page.getByRole("button", { name: "Сохранить порядок" }).click();
  await expect
    .poll(() => state.requests.findLast(({ method }) => method === "save_sort")?.data)
    .toEqual({ aller: [{ id: 2, sort: "0" }] });
});
