import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { STAFF_SCHEDULE_ACCESS_RULES } from "../../../components/staff_schedule/staffScheduleAccessRegistry.js";
import { getVisibleSummaryColumns } from "../../../components/staff_schedule/staffScheduleHelpers.js";

// Совпадает с StaffSchedulePermissionLabels::CANONICAL на бэке (tests/Unit/StaffSchedulePermissionLabelsTest.php).
const PERMISSION_LABELS = {
  full_month: "Расстановка часов на месяц",
  create_edit_smena: "Новая смена / Редактирование смены",
  history_year: "Графики за последний год (только просмотр)",
  fast_hours: "Часы",
  fast_smena: "Смена",
  fast_point: "Сменить кафе",
  "1h": "За 1ч",
  "1h_plus": "За 1ч + доп.",
  com_bonus: "Командный бонус",
  full_h: "За часы",
  errors: "Ошибки",
  bonus: "Бонус (директор — только себе; менеджер — по праву редактирования)",
  all_price: "Всего",
  withheld: "Удержано по исп. листу",
  test_all_price: "Остаток на начало / К выплате / Разница",
  given: "Выдано",
  given_cart: "На карты",
  bonus_of_day: "Дневной бонус",
  sums_all: "Сумма за период (итоги зарплат)",
  rolls: "Роллы",
  pizza: "Пицца",
  over_40_min: "Заказы готовились более 40 минут",
  rates: "Ставки и коэффициенты",
};

// В настройках сохранены прежние подписи; на форме колонка называется иначе.
const KEPT_SETTINGS_LABELS = { bonus: "Бонус" };

const source = (path) =>
  readFileSync(new URL(`../../../components/staff_schedule/${path}`, import.meta.url), "utf8");

test("access tester uses the same labels as permission settings", () => {
  for (const [key, label] of Object.entries(PERMISSION_LABELS)) {
    assert.equal(STAFF_SCHEDULE_ACCESS_RULES.find((rule) => rule.key === key)?.label, label, key);
  }
});

test("finance permission labels are the column labels on the form", () => {
  const access = Object.fromEntries(Object.keys(PERMISSION_LABELS).map((key) => [`${key}_view`, 1]));
  const columns = getVisibleSummaryColumns(access).filter((column) => !column.public);
  const byAccess = {};
  for (const column of columns) (byAccess[column.accessKey] ??= []).push(column.label);
  for (const [key, labels] of Object.entries(byAccess)) {
    assert.equal(labels.join(" / "), KEPT_SETTINGS_LABELS[key] ?? PERMISSION_LABELS[key], key);
  }
});

test("footer, quick action and shift labels exist on the form as named in settings", () => {
  const table = source("sections/StaffScheduleTableSection.jsx");
  for (const label of ["Сумма за период", "Роллы", "Пицца", "Заказы готовились более 40 минут", "Новая смена"]) {
    assert.match(table, new RegExp(label));
  }
  const fast = source("modals/StaffScheduleFastActionsDialog.jsx");
  for (const label of ["Часы", "Смена", "Кафе"]) assert.match(fast, new RegExp(`label="${label}"`));
  assert.match(source("modals/StaffScheduleSmenaModal.jsx"), /Редактирование смены/);
  assert.match(source("modals/StaffScheduleMonthModal.jsx"), /Заполнение часов/);
});
