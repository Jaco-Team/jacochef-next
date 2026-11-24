import assert from "node:assert/strict";
import test from "node:test";
import { collectVisibleChanges } from "../../../components/sklad_items/history/historyChangeSummary.mjs";

test("summarizes changes only for fields visible in both snapshots", () => {
  const previous = [
    { field: "name", label: "Название", value: "До" },
    { field: "hidden", label: "Скрыто", value: "—" },
  ];
  const current = [
    { field: "name", label: "Название", value: "После" },
    { field: "hidden", label: "Скрыто", value: "—" },
    { field: "new", label: "Новое", value: "Значение" },
  ];
  assert.deepEqual(collectVisibleChanges(current, previous), [
    { field: "name", label: "Название", from: "До", to: "После" },
  ]);
});
