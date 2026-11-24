import test from "node:test";
import assert from "node:assert/strict";
import {
  getControlHistorySubject,
  presentControlHistory,
} from "../../../components/cleanings/controlHistoryPresenter.mjs";

// Local-time unix seconds, so the expectations do not depend on the machine time zone.
const unix = (year, month, day, hours, minutes) =>
  Math.floor(new Date(year, month - 1, day, hours, minutes).getTime() / 1000);

test("labels, actor fallback and delete reason", () => {
  const [deleted, approved] = presentControlHistory([
    { id: 1, action: "approve", actorName: "Иван", createdAt: "2026-11-21 10:00:00" },
    {
      id: 2,
      action: "delete",
      actorName: "",
      comment: "Дубль",
      createdAt: "2026-11-21 11:00:00",
    },
  ]);

  assert.equal(deleted.actor_name, "Неизвестно");
  assert.deepEqual(deleted.diff_json, {
    Действие: { from: null, to: "Удалена" },
    Причина: { from: null, to: "Дубль" },
  });
  assert.deepEqual(approved.diff_json, { Действие: { from: null, to: "Подтверждена" } });
  assert.equal(approved.actor_name, "Иван");
});

test("return keeps the employee and clears only the finish (BE meta shape)", () => {
  const [row] = presentControlHistory([
    {
      id: 3,
      action: "return",
      actorName: "Мария",
      createdAt: "2026-11-21 12:00:00",
      workDate: "2026-11-21",
      meta: {
        user_id: 76,
        user_name: "Пётр",
        date_unix_start: unix(2026, 11, 21, 9, 5),
        date_unix_end: unix(2026, 11, 21, 9, 40),
      },
    },
  ]);

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Возвращена на доработку" },
    Сотрудник: { from: null, to: "Пётр" },
    Окончание: { from: "09:40", to: "—" },
  });
});

test("detach clears employee, start and finish; another day shows the date; JSON meta is parsed", () => {
  const [row] = presentControlHistory([
    {
      id: 4,
      action: "detach",
      createdAt: "2026-11-21 00:10:00",
      workDate: "2026-11-21",
      meta: JSON.stringify({
        user_id: 76,
        user_name: "Пётр",
        date_unix_start: unix(2026, 11, 20, 23, 50),
        date_unix_end: null,
      }),
    },
  ]);

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Снята с сотрудника" },
    Сотрудник: { from: "Пётр", to: "—" },
    Начало: { from: "20.11.2026 23:50", to: "—" },
  });
});

test("preparation edit shows only changed amounts", () => {
  const [row] = presentControlHistory([
    {
      id: 5,
      action: "edit",
      createdAt: "2026-11-21 13:00:00",
      meta: { old_count_pf: "2.000", old_count_trash: 0, new_count_pf: 3.5, new_count_trash: "0" },
    },
  ]);

  assert.deepEqual(row.diff_json, {
    Действие: { from: null, to: "Изменена" },
    Объём: { from: "2", to: "3.5" },
  });
});

test("newest first by createdAt, then by id", () => {
  const rows = presentControlHistory([
    { id: 1, action: "manual_add", createdAt: "2026-11-21 09:00:00" },
    { id: 3, action: "approve", createdAt: "2026-11-21 10:00:00" },
    { id: 2, action: "return", createdAt: "2026-11-21 10:00:00" },
    null,
  ]);

  assert.deepEqual(
    rows.map((row) => row.id),
    [3, 2, 1],
  );
});

test("subject: cleaning date, preparation falls back to the event work date", () => {
  assert.deepEqual(getControlHistorySubject({ name: "Полы", date: "2026-11-21" }), {
    name: "Полы · 21.11.2026",
  });
  assert.deepEqual(
    getControlHistorySubject({ name: "Соус", preparedAt: "10:00" }, [{ workDate: "2026-11-20" }]),
    { name: "Соус · 20.11.2026" },
  );
  assert.deepEqual(getControlHistorySubject({ id: 9 }, [{ workName: "Окна", workDate: null }]), {
    name: "Окна",
  });
});
