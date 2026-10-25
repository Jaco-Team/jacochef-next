import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  EDITABLE_FINANCE_KEYS,
  createStaffScheduleAccess,
  getStaffScheduleFinanceAction,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";
import {
  formatFinanceCardValue,
  getFinanceGroup,
} from "../../../components/staff_schedule/staffScheduleHelpers.js";

const row = { check_period: 1, smena_id: 10, price_p_h: 260, price_arr: [260, 280], can_edit_bonus: true };
const action = (columnKey, access, extra = {}) =>
  getStaffScheduleFinanceAction({
    columnKey,
    row: { ...row, ...extra.row },
    canEdit: createStaffScheduleAccess(access).canEdit,
    selectedPart: extra.selectedPart ?? 1,
    periodBonusState: extra.periodBonusState ?? 1,
  });

test("overview cards use the same edit rules as the table cells", () => {
  assert.deepEqual([...EDITABLE_FINANCE_KEYS], ["price_p_h", "dop_bonus", "my_bonus", "withheld", "given", "given_cart"]);
  for (const [key, right] of [["given", "given"], ["given_cart", "given_cart"], ["withheld", "withheld"], ["price_p_h", "1h"]]) {
    assert.equal(action(key, { [`${right}_edit`]: 1 }), "summary", key);
    assert.equal(action(key, { [`${right}_view`]: 1 }), null, key);
  }
  assert.equal(action("price_p_h", { "1h_edit": 1 }, { row: { price_arr: [260] } }), null, "нет другой ставки");
  assert.equal(action("my_bonus", { bonus_edit: 1 }), "summary");
  assert.equal(action("my_bonus", { bonus_edit: 1 }, { selectedPart: 0 }), null, "бонус — только вторая половина");
  assert.equal(action("my_bonus", { bonus_edit: 1 }, { row: { can_edit_bonus: false } }), null);
  assert.equal(action("dop_bonus", { com_bonus_edit: 1 }), "team_bonus");
  assert.equal(action("dop_bonus", { com_bonus_edit: 1 }, { periodBonusState: 0 }), null);
  assert.equal(action("dop_bonus", { com_bonus_edit: 1 }, { row: { smena_id: -1 } }), null);
  assert.equal(action("total_sum", { all_price_edit: 1 }), null, "расчётные показатели не меняются");
});

test("cards are grouped into accruals and payouts and formatted as money or hours", () => {
  for (const key of ["worked_hours", "price_p_h", "dop_bonus", "h_price", "err_price", "my_bonus", "total_sum"]) {
    assert.equal(getFinanceGroup(key), "accrual", key);
  }
  for (const key of ["withheld", "opening_balance", "to_pay_sum", "given", "given_cart", "salary_difference"]) {
    assert.equal(getFinanceGroup(key), "payout", key);
  }
  assert.equal(formatFinanceCardValue({ key: "given" }, 12400).replace(/\s/g, " "), "12 400 ₽");
  assert.equal(formatFinanceCardValue({ key: "worked_hours" }, "123:20"), "123:20");
  assert.equal(formatFinanceCardValue({ key: "given" }, ""), "—");
});

test("overview opens the table edit dialogs and the table itself is untouched", () => {
  const modal = readFileSync(new URL("../../../components/staff_schedule/modals/StaffScheduleMonthModal.jsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../../../components/staff_schedule/StaffSchedulePage.jsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url), "utf8");
  assert.match(modal, /modal\.data\.hasPeriodSummary && finance\?\.items\?\.length \?/);
  assert.match(modal, /if \(!canEdit\) \{\n    return <Box sx=\{rowSx\}>/);
  assert.match(modal, /\{canEdit \? <EditOutlinedIcon/);
  assert.match(page, /finance=\{page\.monthFinance\}/);
  assert.match(page, /onEditFinance=\{page\.handleEditMonthFinance\}/);
  assert.match(hook, /handleChangeTeamBonusForUser\(row\);/);
  assert.match(hook, /handleOpenSummaryAction\(row, item\.key\);/);
  assert.match(hook, /request\.date !== monthId/);
});
