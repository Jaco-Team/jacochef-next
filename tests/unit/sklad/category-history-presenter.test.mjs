import test from "node:test";
import assert from "node:assert/strict";
import { presentCategoryHistory } from "../../../components/sklad_items/history/categoryHistoryPresenter.mjs";

test("category events expose localized actions and field changes", () => {
  const rows = presentCategoryHistory(
    [
      {
        id: 1,
        event_type: "create",
        actor_name: "Иван",
        diff_json: JSON.stringify({
          name: { from: null, to: "Продукты" },
          parent_id: { from: null, to: -1 },
        }),
      },
      {
        id: 2,
        event_type: "update",
        diff_json: { name: { from: "Старое", to: "Новое" }, parent_id: { from: 3, to: 4 } },
      },
      { id: 3, event_type: "delete", diff_json: { name: { from: "Удалено", to: null } } },
    ],
    "warehouse_item",
  );
  assert.equal(rows[0].diff_json.Действие.to, "Создание категории");
  assert.equal(rows[0].diff_json.Название.to, "Продукты");
  assert.equal(rows[0].diff_json["Родительская группа"].to, "Группа категорий");
  assert.deepEqual(rows[1].diff_json["Родительская группа"], {
    from: "ID категории 3",
    to: "ID категории 4",
  });
  assert.equal(rows[1].actor_name, "Неизвестно");
  assert.deepEqual(rows[2].diff_json.Название, { from: "Удалено", to: "—" });
  assert.equal(rows[2].diff_json.Действие.to, "Удаление категории");
});

test("site parent identifiers remain distinct and malformed events stay visible", () => {
  const rows = presentCategoryHistory(
    [
      {
        event_type: "update",
        diff_json: { parent_id: { from: 0, to: 42 }, extra: { from: 1, to: 2 } },
      },
      { event_type: "other", diff_json: "not json" },
    ],
    "site_item",
  );
  assert.deepEqual(rows[0].diff_json["Родительская категория"], {
    from: "Без родительской категории",
    to: "ID категории 42",
  });
  assert.equal(rows[0].diff_json["Поле «extra»"].to, "2");
  assert.equal(rows[1].diff_json.Действие.to, "Событие категории");
  assert.equal(rows[1].diff_json.Подробности.to, "Недоступны");
  assert.deepEqual(presentCategoryHistory(null, "site_item"), []);
});
