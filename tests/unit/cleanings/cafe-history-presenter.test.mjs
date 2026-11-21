import test from "node:test";
import assert from "node:assert/strict";
import { presentCafeHistory } from "../../../components/cleanings/cleaningsHistoryPresenter.mjs";

const context = {
  templates: [
    { id: 5, name: "Пол", role: "Повар" },
    { id: 6, name: "Окно", role: "Кассир" },
    { id: 7, name: "Стол", role: "" },
  ],
};

const snapshot = (templates) => JSON.stringify({ templates });

test("assign: added cleaning with and without dop. time, source comment", () => {
  const [assigned, assignedWithDopTime] = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "assign",
        actor_name: "Иван",
        created_at: "2026-11-20 10:00:00",
        comment: "Карточка уборки «Пол»",
        before_json: snapshot([]),
        after_json: snapshot({ 5: { dop_time: 0 } }),
      },
      {
        id: 2,
        event_type: "assign",
        before_json: { templates: { 5: { dop_time: 0 } } },
        after_json: { templates: { 5: { dop_time: 0 }, 6: { dop_time: 15 } } },
      },
    ],
    context,
  );

  assert.equal(assigned.actor_name, "Иван");
  assert.equal(assigned.created_at, "2026-11-20 10:00:00");
  assert.deepEqual(assigned.diff_json, {
    Действие: { from: null, to: "Добавлена уборка" },
    Источник: { from: null, to: "Карточка уборки «Пол»" },
    Уборки: { from: null, to: "+ Пол · Повар" },
  });
  assert.deepEqual(assignedWithDopTime.diff_json, {
    Действие: { from: null, to: "Добавлена уборка" },
    Уборки: { from: null, to: "+ Окно · Кассир (доп. время 15 мин)" },
  });
  assert.equal(assignedWithDopTime.actor_name, "Неизвестно");
});

test("remove and dop_time events", () => {
  const [removed, dopTime] = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "remove",
        comment: "Уборка «Окно» удалена",
        before_json: snapshot({ 5: { dop_time: 0 }, 6: { dop_time: 15 } }),
        after_json: snapshot({ 5: { dop_time: 0 } }),
      },
      {
        id: 2,
        event_type: "dop_time",
        before_json: snapshot({ 5: { dop_time: 0 }, 6: { dop_time: 15 }, 7: { dop_time: 3 } }),
        after_json: snapshot({ 5: { dop_time: 10 }, 6: { dop_time: 15 }, 7: { dop_time: 0 } }),
      },
    ],
    context,
  );

  assert.deepEqual(removed.diff_json, {
    Действие: { from: null, to: "Убрана уборка" },
    Источник: { from: null, to: "Уборка «Окно» удалена" },
    Уборки: { from: null, to: "− Окно · Кассир" },
  });
  assert.deepEqual(dopTime.diff_json, {
    Действие: { from: null, to: "Доп. время" },
    "Доп. время «Пол · Повар»": { from: "0 мин", to: "10 мин" },
    "Доп. время «Стол»": { from: "3 мин", to: "0 мин" },
  });
});

test("replace: additions, removals and dop. time changes, sorted, unknown ids by number", () => {
  const [row] = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "replace",
        comment: "Старый экран привязок",
        before_json: snapshot({ 6: { dop_time: 0 }, 7: { dop_time: 5 }, 42: { dop_time: 0 } }),
        after_json: snapshot({ 5: { dop_time: 2 }, 7: { dop_time: 8 }, 99: { dop_time: 0 } }),
      },
    ],
    context,
  );

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Замена списка уборок" },
    Источник: { from: null, to: "Старый экран привязок" },
    Уборки: {
      from: null,
      to: "+ Пол · Повар (доп. время 2 мин), + уборка #99, − Окно · Кассир, − уборка #42",
    },
    "Доп. время «Стол»": { from: "5 мин", to: "8 мин" },
  });
});

test("templates as [] or as a JSON array (index = template id, 0 ignored)", () => {
  const rows = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "assign",
        before_json: "[]",
        after_json: '{"templates":[]}',
      },
      {
        id: 2,
        event_type: "assign",
        before_json: { templates: [] },
        after_json: { templates: [{ dop_time: 4 }, null, null, null, null, { dop_time: 3 }] },
      },
      {
        id: 3,
        event_type: "dop_time",
        before_json: { templates: [{ dop_time: 1 }] },
        after_json: { templates: [{ dop_time: 9 }] },
      },
    ],
    context,
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    [2],
  );
  assert.deepEqual(rows[0].diff_json.Уборки, { from: null, to: "+ Пол · Повар (доп. время 3 мин)" });
});

test("null, broken and one-sided snapshots never break the list", () => {
  const rows = presentCafeHistory(
    [
      { id: 1, event_type: "dop_time", before_json: null, after_json: null, comment: "Карточка" },
      { id: 2, event_type: "assign", before_json: "not json", after_json: "" },
      { id: 3, event_type: "assign", before_json: null, after_json: snapshot({ 6: {} }) },
      { id: 4, event_type: "remove", before_json: snapshot({ 5: { dop_time: 1 } }), after_json: null },
      {
        id: 5,
        event_type: "remove",
        get before_json() {
          throw new Error("broken row");
        },
      },
      { id: 6, event_type: "unknown", before_json: { templates: null }, after_json: { templates: 5 } },
      { id: 7, event_type: "assign", before_json: { templates: {} }, after_json: { templates: { 5: 2 } } },
    ],
    null,
  );

  assert.deepEqual(
    rows.map((row) => row.id),
    [1, 2, 3, 4, 5, 7],
  );
  assert.deepEqual(rows[0].diff_json, {
    Действие: { from: null, to: "Доп. время" },
    Источник: { from: null, to: "Карточка" },
    Подробности: { from: null, to: "Недоступны" },
  });
  assert.equal(rows[1].diff_json.Подробности.to, "Недоступны");
  assert.deepEqual(rows[2].diff_json.Уборки, { from: null, to: "+ уборка #6" });
  assert.deepEqual(rows[3].diff_json.Уборки, { from: null, to: "− уборка #5" });
  assert.deepEqual(rows[4].diff_json, { Действие: { from: null, to: "Изменение" } });
  assert.deepEqual(rows[5].diff_json.Уборки, { from: null, to: "+ уборка #5 (доп. время 2 мин)" });
  assert.deepEqual(presentCafeHistory(undefined), []);
});

test("unchanged snapshots and unknown event types", () => {
  const rows = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "replace",
        before_json: snapshot({ 5: { dop_time: 1 } }),
        after_json: snapshot({ 5: { dop_time: 1 } }),
      },
      {
        id: 2,
        event_type: "something_new",
        before_json: snapshot([]),
        after_json: snapshot({ 5: { dop_time: 0 } }),
      },
    ],
    context,
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].diff_json.Действие.to, "Изменение");
});

test("same label on two templates keeps both dop. time lines", () => {
  const [row] = presentCafeHistory(
    [
      {
        id: 1,
        event_type: "dop_time",
        before_json: snapshot({ 5: { dop_time: 0 }, 8: { dop_time: 0 } }),
        after_json: snapshot({ 5: { dop_time: 5 }, 8: { dop_time: 6 } }),
      },
    ],
    { templates: [...context.templates, { id: 8, name: "Пол", role: "Повар" }] },
  );

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Доп. время" },
    "Доп. время «Пол · Повар»": { from: "0 мин", to: "5 мин" },
    "Доп. время «Пол · Повар» #8": { from: "0 мин", to: "6 мин" },
  });
});
