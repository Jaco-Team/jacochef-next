import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildPayoutHistoryRequest,
  filterPayoutHistoryByMode,
  formatPayoutHistoryChange,
  formatPayoutHistoryDate,
  hasPayoutHistory,
  isPayoutHistoryRowCurrentMode,
} from "../../../components/staff_schedule/staffSchedulePayoutHistory.mjs";

test("payout history is shown only in cash, card and withheld dialogs", () => {
  for (const mode of ["given", "given_cart", "withheld"]) assert.equal(hasPayoutHistory(mode), true);
  for (const mode of ["price_p_h", "my_bonus", "dir_lv", "dop_bonus_toggle", undefined]) {
    assert.equal(hasPayoutHistory(mode), false);
  }
});

test("history request carries only employee and period identity", () => {
  assert.deepEqual(
    buildPayoutHistoryRequest({ date: "2026-10-16", user_id: 1, app_id: 5, smena_id: 10, give_price: 500 }),
    { date: "2026-10-16", user_id: 1, app_id: 5, smena_id: 10 },
  );
});

test("history rows show change, compact time and highlight the opened payout type", () => {
  assert.equal(formatPayoutHistoryChange({ price: 5000, old_price: 3000 }).replace(/\s/g, " "), "3 000 → 5 000");
  assert.equal(formatPayoutHistoryChange({ price: 700, old_price: null }), "700");
  assert.equal(formatPayoutHistoryDate("2026-10-22 18:30:00"), "22.10 18:30");
  assert.equal(isPayoutHistoryRowCurrentMode({ type: 2 }, "given_cart"), true);
  assert.equal(isPayoutHistoryRowCurrentMode({ type: 1 }, "given_cart"), false);
});

test("summary dialog loads history through the page API only for payout modes", () => {
  const dialog = readFileSync(
    new URL("../../../components/staff_schedule/modals/StaffScheduleSummaryActionDialog.jsx", import.meta.url),
    "utf8",
  );
  assert.match(dialog, /hasPayoutHistory\(modal\?\.mode\) && Boolean\(loadPayoutHistory\)/);
  const page = readFileSync(new URL("../../../components/staff_schedule/StaffSchedulePage.jsx", import.meta.url), "utf8");
  assert.match(page, /loadPayoutHistory=\{page\.loadPayoutHistory\}/);
});

test("edit dialog keeps only its own payout type, overview shows the whole period history", () => {
  const rows = [{ type: 1 }, { type: 2 }, { type: 3 }, { type: 2 }];
  assert.deepEqual(filterPayoutHistoryByMode(rows, "given_cart"), [{ type: 2 }, { type: 2 }]);
  assert.deepEqual(filterPayoutHistoryByMode(rows, "withheld"), [{ type: 3 }]);
  assert.deepEqual(filterPayoutHistoryByMode(null, "given"), []);

  const read = (path) => readFileSync(new URL(`../../../components/staff_schedule/${path}`, import.meta.url), "utf8");
  assert.match(read("modals/StaffScheduleSummaryActionDialog.jsx"), /filterPayoutHistoryByMode\(history\.rows, modal\?\.mode\)/);
  const month = read("modals/StaffScheduleMonthModal.jsx");
  assert.match(month, /enabled: Boolean\(finance\.historyRequest\)/);
  assert.match(month, /title="История выплат за период"/);
  assert.match(read("StaffSchedulePage.jsx"), /onEditFinance=\{page\.handleEditMonthFinance\}\n\s+loadPayoutHistory=\{page\.loadPayoutHistory\}/);
  assert.match(read("useStaffSchedulePage.js"), /items\.filter\(\(item\) => hasPayoutHistory\(item\.key\)\)/);
});
