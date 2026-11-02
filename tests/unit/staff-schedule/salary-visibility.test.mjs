import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  canEditStaffScheduleBonus,
  canEditStaffScheduleFinanceValue,
  getStaffScheduleFinanceAction,
  isStaffScheduleFinanceHidden,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";

const helpers = () => import("../../../components/staff_schedule/staffScheduleHelpers.js");
const canEdit = () => true;

test("hidden salary rows show a dash instead of zero, hours stay visible", async () => {
  const { getSummaryCellValue, WORKED_HOURS_COLUMN } = await helpers();
  const hidden = { finance_hidden: 1, given: 0, price_p_h: 0, worked_min: 90 };

  for (const key of ["price_p_h", "given", "given_cart", "all_price", "to_pay_sum", "salary_difference"]) {
    assert.equal(getSummaryCellValue({ key }, hidden), "—", key);
  }
  assert.equal(getSummaryCellValue(WORKED_HOURS_COLUMN, hidden), "1:30");
  assert.equal(getSummaryCellValue({ key: "given" }, { finance_hidden: 0, given: "500.00" }), "500");
});

test("hidden salary rows cannot be edited from the table or the overview", () => {
  const row = { finance_hidden: 1, can_edit_bonus: 1, price_arr: [300, 320], price_p_h: 300, check_period: 1, smena_id: 10 };

  assert.equal(isStaffScheduleFinanceHidden(row), true);
  assert.equal(isStaffScheduleFinanceHidden({ finance_hidden: 0 }), false);
  for (const columnKey of ["price_p_h", "given", "given_cart", "withheld"]) {
    assert.equal(canEditStaffScheduleFinanceValue({ columnKey, row, canEdit }), false, columnKey);
    assert.equal(getStaffScheduleFinanceAction({ columnKey, row, canEdit, selectedPart: 1, periodBonusState: 1 }), null);
  }
  assert.equal(getStaffScheduleFinanceAction({ columnKey: "dop_bonus", row, canEdit, periodBonusState: 1 }), null);
  assert.equal(canEditStaffScheduleBonus({ row, canEdit, selectedPart: 1 }), false);
  assert.equal(canEditStaffScheduleFinanceValue({ columnKey: "given", row: { ...row, finance_hidden: 0 }, canEdit }), true);
});

test("overview skips the finance block for hidden rows and team bonus toggle needs salary_all", () => {
  const read = (path) => readFileSync(new URL(`../../../components/staff_schedule/${path}`, import.meta.url), "utf8");
  assert.match(read("useStaffSchedulePage.js"), /if \(!row \|\| Number\(row\.finance_hidden\) === 1\) \{/);
  assert.match(read("modals/StaffScheduleMonthModal.jsx"), /modal\.data\.hasPeriodSummary && !modal\.data\.financeHidden \?/);
  assert.match(read("sections/StaffScheduleTableSection.jsx"), /canEdit\("com_bonus"\) && canView\("salary_all"\)/);
});
