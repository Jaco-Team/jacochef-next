import assert from "node:assert/strict";
import test from "node:test";
import { orderSkladPermissionGroups } from "../../../components/employees/skladPermissionGroups.mjs";

test("groups warehouse permissions by submodule without changing their original feature indices", () => {
  const groups = [
    { key: "site_items_modal_main", name: "Основные", items: [{ featureIndex: 0 }] },
    { key: "production_fields", name: "Рецепты и заготовки · Поля", items: [{ featureIndex: 1 }] },
    { key: "warehouse_items_activity", name: "Активность", items: [{ featureIndex: 2 }] },
    { key: "units", name: "Единицы измерения", items: [{ featureIndex: 3 }] },
    { key: "future", name: "Новое", items: [{ featureIndex: 4 }] },
  ];
  const result = orderSkladPermissionGroups(groups);
  assert.deepEqual(
    result.map(({ name }) => name),
    [
      "Товары склада · Активность",
      "Рецепты и полуфабрикаты · Поля",
      "Товары сайта · Основные",
      "Единицы измерения",
      "Новое",
    ],
  );
  assert.deepEqual(
    result.map(({ items }) => items[0].featureIndex),
    [2, 1, 0, 3, 4],
  );
  assert.equal(groups[0].name, "Основные");
});
