import test from "node:test";
import assert from "node:assert/strict";
import {
  createStaffScheduleAccess,
  createStaffSchedulePolicy,
  hasAccessRule,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";

test("hasAccessRule detects any access/view/edit variant", () => {
  assert.equal(hasAccessRule({ full_month_access: 1 }, "full_month"), true);
  assert.equal(hasAccessRule({ given_view: 1 }, "given"), true);
  assert.equal(hasAccessRule({ withheld_edit: 1 }, "withheld"), true);
  assert.equal(hasAccessRule({}, "premia"), false);
});

test("createStaffScheduleAccess follows access inheritance", () => {
  const access = createStaffScheduleAccess({
    given_view: 1,
    withheld_edit: 1,
    full_month_access: 1,
  });

  assert.equal(access.canView("given"), true);
  assert.equal(access.canEdit("given"), false);
  assert.equal(access.canView("withheld"), true);
  assert.equal(access.canEdit("withheld"), true);
  assert.equal(access.canAccess("full_month"), true);
  assert.equal(access.canView("missing"), false);
});

test("createStaffSchedulePolicy uses grouped flags when present", () => {
  const policy = createStaffSchedulePolicy({
    salary_block_view: 1,
    payroll_actions_access: 1,
    schedule_actions_access: 1,
    smena_actions_access: 1,
    footer_stats_view: 1,
    full_month_access: 1,
    export_excel_access: 1,
  });

  assert.equal(policy.canShowSalaryBlock, true);
  assert.equal(policy.canShowPayrollActions, true);
  assert.equal(policy.canShowFastActionsPanel, true);
  assert.equal(policy.canManageSmena, true);
  assert.equal(policy.canShowFooterStats, true);
  assert.equal(policy.canOpenMonthCard, true);
  assert.equal(policy.canOpenDayCard, true);
  assert.equal(policy.canExportWorkSchedule, true);
});

test("createStaffSchedulePolicy falls back to legacy detailed keys", () => {
  const policy = createStaffSchedulePolicy({
    premia_view: 1,
    given_cart_edit: 1,
    fast_month_access: 1,
    create_edit_smena_access: 1,
    rolls_view: 1,
  });

  assert.equal(policy.canShowSalaryBlock, true);
  assert.equal(policy.canShowPayrollActions, true);
  assert.equal(policy.canShowFastActionsPanel, true);
  assert.equal(policy.canManageSmena, true);
  assert.equal(policy.canShowFooterStats, true);
  assert.equal(policy.canOpenMonthCard, false);
  assert.equal(policy.canOpenDayCard, false);
});
