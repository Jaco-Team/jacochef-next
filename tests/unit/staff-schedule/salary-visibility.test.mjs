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
  assert.equal(getSummaryCellValue(WORKED_HOURS_COLUMN, hidden).replace(/\u00A0/g, " "), "1 ч 30 мин");
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

test("team bonus button color shows the decision: neutral, granted, refused", async () => {
  const { getTeamBonusHeaderActionSx, getTeamBonusStatusText } = await import(
    "../../../components/staff_schedule/staffSchedulePatterns.js"
  );
  const none = getTeamBonusHeaderActionSx(0);
  const granted = getTeamBonusHeaderActionSx(1);
  const refused = getTeamBonusHeaderActionSx(2);

  assert.equal(new Set([none.backgroundColor, granted.backgroundColor, refused.backgroundColor]).size, 3);
  assert.match(none.border, /#A6A6A6/);
  assert.match(granted.border, /#16A34A/);
  assert.match(refused.border, /#DD1A32/);
  assert.deepEqual(getTeamBonusHeaderActionSx(undefined), none);
  assert.equal(none.cursor, "pointer");
  assert.equal(getTeamBonusStatusText(0), "Командный бонус: решение не принято");
  assert.equal(getTeamBonusStatusText(1), "Командный бонус: выдан");
  assert.equal(getTeamBonusStatusText("2"), "Командный бонус: отказано");

  for (const path of ["sections/StaffScheduleTableSection.jsx", "sections/StaffScheduleMobileTableSection.jsx"]) {
    const source = readFileSync(new URL(`../../../components/staff_schedule/${path}`, import.meta.url), "utf8");
    assert.match(source, /\{canOpenTeamBonus \? \(\s+<Box\s+component="button"[\s\S]*?sx=\{getTeamBonusHeaderActionSx\(periodBonusState\)\}/, path);
  }
  const desktop = readFileSync(new URL("../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx", import.meta.url), "utf8");
  assert.equal((desktop.match(/positionHeaderLeft=\{positionHeaderLeft\}\s+periodBonusState=\{periodBonusState\}/g) ?? []).length, 2);
});
