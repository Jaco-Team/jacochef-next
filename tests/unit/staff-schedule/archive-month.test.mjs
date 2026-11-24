import assert from "node:assert/strict";
import test from "node:test";
import { createStaffSchedulePolicy } from "../../../components/staff_schedule/staffScheduleAccess.mjs";
import {
  buildStaffScheduleArchiveAccess,
  getStaffScheduleEditableMonthStart,
  isStaffScheduleArchiveMonth,
} from "../../../components/staff_schedule/staffScheduleArchive.mjs";

const today = "2026-10-25";

test("months older than previous are archive, previous and later stay editable", () => {
  assert.equal(getStaffScheduleEditableMonthStart(today), "2026-09");
  assert.equal(getStaffScheduleEditableMonthStart("2026-01-10"), "2025-12");
  for (const month of ["2026-08", "2025-11", "2025-10"]) assert.equal(isStaffScheduleArchiveMonth(month, today), true);
  for (const month of ["2026-09", "2026-10", "2026-11", "", "2026-9", null]) {
    assert.equal(isStaffScheduleArchiveMonth(month, today), false);
  }
});

test("archive access keeps reading and opening, strips every edit and action", () => {
  const access = {
    full_month_access: 1,
    full_day_access: 1,
    day_edit_edit: 1,
    export_excel_access: 1,
    given_edit: 1,
    given_cart_view: 1,
    withheld_access: 1,
    fast_hours_access: 1,
    create_edit_smena_access: 1,
    bonus_edit: 1,
    rates_edit: 1,
    "1h_view": 1,
    premia_view: 0,
  };
  const archive = buildStaffScheduleArchiveAccess(access);
  const policy = createStaffSchedulePolicy(archive);

  assert.equal(policy.canOpenMonthCard, true);
  assert.equal(policy.canExportWorkSchedule, true);
  assert.equal(policy.canOpenDayCard, false);
  assert.equal(policy.canShowFastActionsPanel, false);
  assert.equal(policy.canManageSmena, false);
  assert.equal(policy.canShowPayrollActions, false);
  for (const mode of ["given", "given_cart", "withheld", "my_bonus", "price_p_h"]) {
    assert.equal(policy.canEditSummaryAction(mode), false, mode);
  }
  for (const key of ["given", "given_cart", "withheld", "1h", "bonus", "rates"]) {
    assert.equal(policy.canView(key), true, key);
  }
  assert.equal(policy.canView("premia"), false);
  assert.equal(policy.canViewRates, true);
});
