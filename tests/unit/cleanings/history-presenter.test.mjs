import test from "node:test";
import assert from "node:assert/strict";
import {
  presentCategoryHistory,
  presentTemplateHistory,
} from "../../../components/cleanings/cleaningsHistoryPresenter.mjs";

const context = {
  categories: [{ id: 1, name: "Влажная" }],
  templates: [{ id: 5, name: "Пол", role: "Повар" }],
  roles: [{ id: 2, name: "Повар" }],
  locations: [
    { id: 1, name: "Кафе В" },
    { id: 2, name: "Кафе Г" },
    { id: 3, name: "Кафе А" },
    { id: 4, name: "Кафе Б" },
  ],
};
const baseTemplate = { id: 5, name: "Пол", app_id: 2, type_new: 1, dow: 11, is_active: 1 };

test("template update between the old row snapshot and the new map snapshot", () => {
  const [row] = presentTemplateHistory(
    [
      {
        id: 1,
        event_type: "update",
        actor_name: "Иван",
        before_json: JSON.stringify({
          template: baseTemplate,
          times: [
            { id: 10, time_action: "10:00:00", type_action: 1, work_id: 5 },
            { id: 11, time_action: "9:00", type_action: 2, work_id: 5 },
          ],
          points: [
            { id: 1, point_id: 3, dop_time: 0, work_id: 5 },
            { id: 2, point_id: 0, dop_time: 1, work_id: 5 },
          ],
        }),
        after_json: {
          template: baseTemplate,
          times: { start: { "10:00": 1, "11:30": 1 }, delete: { "09:00": 1 } },
          points: { 3: { dop_time: 5 }, 4: { dop_time: 0 } },
        },
      },
    ],
    context,
  );

  assert.equal(row.actor_name, "Иван");
  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Изменение" },
    "Время появления задачи": { from: "10:00", to: "10:00, 11:30" },
    Кафе: { from: null, to: "+ Кафе Б" },
    "Доп. время: Кафе А": { from: "0 мин", to: "5 мин" },
  });
});

test("empty maps sent as [] and technical-only changes are hidden", () => {
  const rows = presentTemplateHistory(
    [
      {
        id: 1,
        event_type: "update",
        before_json: { template: { ...baseTemplate, sort: 1 }, times: [], points: [] },
        after_json: {
          template: { ...baseTemplate, sort: 2 },
          times: { start: [], delete: [] },
          points: {},
        },
      },
      {
        id: 2,
        event_type: "update",
        before_json: { template: baseTemplate, times: [], points: [] },
        after_json: { template: baseTemplate, times: { start: { "08:00": 1 } }, points: [] },
      },
    ],
    context,
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 2);
  assert.deepEqual(rows[0].diff_json["Время появления задачи"], { from: null, to: "08:00" });
});

test("points as a JSON array use the index as point_id and drop point 0", () => {
  const [row] = presentTemplateHistory(
    [
      {
        id: 1,
        event_type: "create",
        before_json: null,
        after_json: {
          template: { name: "Стол", app_id: 2, type_new: 1, dow: 13, is_active: 1, is_need: 0 },
          times: [],
          points: [{ dop_time: 2 }, { dop_time: 0 }, { dop_time: 7 }, null],
        },
      },
    ],
    context,
  );

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Создание" },
    "Объект уборки": { from: null, to: "Стол" },
    "Вид уборки": { from: null, to: "Влажная" },
    Должность: { from: null, to: "Повар" },
    Расписание: { from: null, to: "Ручное добавление" },
    Кафе: { from: null, to: "Кафе В, Кафе Г (+7 мин)" },
  });
});

test("template status and delete events, including a delete without before_json", () => {
  const [status, deleted, deletedWithoutBefore] = presentTemplateHistory(
    [
      {
        id: 1,
        event_type: "status",
        before_json: { template: { name: "Стол", is_active: 1 }, times: [], points: [] },
        after_json: { template: { name: "Стол", is_active: 0 }, times: [], points: [] },
      },
      { id: 2, event_type: "delete", before_json: { template: { name: "Стол" } }, after_json: null },
      { id: 3, event_type: "delete", before_json: null, after_json: { template: { name: "Окно" } } },
    ],
    context,
  );

  assert.deepEqual(status.diff_json, {
    Действие: { from: null, to: "Статус" },
    Статус: { from: "Активна", to: "Архив" },
  });
  assert.deepEqual(deleted.diff_json["Объект уборки"], { from: null, to: "Стол" });
  assert.equal(deletedWithoutBefore.diff_json.Действие.to, "Удаление");
  assert.deepEqual(deletedWithoutBefore.diff_json["Объект уборки"], { from: null, to: "Окно" });
});

test("null or broken snapshots keep the row and never break the list", () => {
  const rows = presentTemplateHistory(
    [
      { id: 1, event_type: "update", before_json: null, after_json: null },
      { id: 2, event_type: "update", before_json: "not json", after_json: "[]" },
      {
        id: 3,
        event_type: "update",
        get before_json() {
          throw new Error("broken row");
        },
      },
      { id: 4, event_type: "delete", before_json: { template: null }, after_json: null },
    ],
    null,
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    [1, 2, 3, 4],
  );
  assert.equal(rows[0].diff_json.Подробности.to, "Недоступны");
  assert.equal(rows[1].diff_json.Подробности.to, "Недоступны");
  assert.deepEqual(rows[2].diff_json, { Действие: { from: null, to: "Изменение" } });
  assert.deepEqual(rows[3].diff_json, { Действие: { from: null, to: "Удаление" } });
  assert.deepEqual(presentTemplateHistory(undefined), []);
});

test("category create, delete and malformed events", () => {
  const [created, deleted, malformed, broken] = presentCategoryHistory(
    [
      {
        id: 1,
        event_type: "create",
        diff_json: JSON.stringify({
          id: { from: null, to: 8 },
          name: { from: null, to: "Влажная" },
          text: { from: null, to: "<p>Протереть&nbsp;пол</p><ul><li>стол</li></ul>" },
        }),
      },
      { id: 2, event_type: "delete", before_json: { name: "Сухая" } },
      { id: 3, event_type: "update", diff_json: "not json" },
      {
        id: 4,
        event_type: "update",
        get diff_json() {
          throw new Error("broken row");
        },
      },
    ],
    context,
  );

  assert.deepEqual(created.diff_json, {
    Действие: { from: null, to: "Создание" },
    Название: { from: null, to: "Влажная" },
    Инструкция: { from: null, to: "Протереть пол / • стол" },
  });
  assert.deepEqual(deleted.diff_json.Название, { from: null, to: "Сухая" });
  assert.equal(malformed.diff_json.Подробности.to, "Недоступны");
  assert.deepEqual(broken.diff_json, { Действие: { from: null, to: "Изменение" } });
});

test("category templates.<id> additions and removals, unknown ids by number", () => {
  const rows = presentCategoryHistory(
    [
      {
        id: 1,
        event_type: "templates",
        diff_json: {
          "templates.5": { from: null, to: 1 },
          "templates.99": { from: 1, to: null },
          "templates.7": { from: 1, to: 1 },
        },
      },
      { id: 2, event_type: "update", diff_json: { id: { from: 1, to: 2 }, sort: { from: 1, to: 2 } } },
    ],
    context,
  );

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].diff_json, {
    Действие: { from: null, to: "Применяется для" },
    "Применяется для": { from: null, to: "+ Пол · Повар, − уборка #99" },
  });
});

test("category instruction changes: text excerpt vs formatting only", () => {
  const [textChange, formatChange] = presentCategoryHistory(
    [
      { id: 1, event_type: "update", diff_json: { text: { from: "<p>Протереть</p>", to: "<p>Помыть</p>" } } },
      {
        id: 2,
        event_type: "update",
        diff_json: { text: { from: "<p>a</p>", to: '<p style="color: red;">a</p>' } },
      },
    ],
    context,
  );

  assert.deepEqual(textChange.diff_json.Инструкция, { from: "Протереть", to: "Помыть" });
  assert.deepEqual(formatChange.diff_json.Инструкция, { from: null, to: "Изменено оформление" });
});
