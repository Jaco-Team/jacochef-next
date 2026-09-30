import test from "node:test";
import assert from "node:assert/strict";
import {
  createStaffScheduleAccess,
  createStaffSchedulePolicy,
  hasAccessRule,
  getStaffScheduleFinancialReadSignature,
  hasRevokedFinancialReadPermission,
} from "../../../components/staff_schedule/staffScheduleAccess.mjs";
import {
  applyStaffScheduleAccessPreset,
  STAFF_SCHEDULE_ACCESS_RULES,
} from "../../../components/staff_schedule/staffScheduleAccessRegistry.js";
import { getVisibleSummaryColumns } from "../../../components/staff_schedule/staffScheduleHelpers.js";

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

test("removed grouped flags cannot grant finance, shifts, statistics or quick actions", () => {
  const policy = createStaffSchedulePolicy({
    salary_block_view: 1,
    payroll_actions_access: 1,
    schedule_actions_access: 1,
    smena_actions_access: 1,
    footer_stats_view: 1,
    full_month_access: 1,
    export_excel_access: 1,
  });

  assert.equal(policy.canShowSalaryBlock, false);
  assert.equal(policy.canShowPayrollActions, false);
  assert.equal(policy.canShowFastActionsPanel, false);
  assert.equal(policy.canManageSmena, false);
  assert.equal(policy.canShowFooterStats, false);
  assert.equal(policy.canOpenMonthCard, true);
  assert.equal(policy.canOpenDayCard, true);
  assert.equal(policy.canExportWorkSchedule, true);
});

test("createStaffSchedulePolicy derives visibility and actions from detailed keys", () => {
  const policy = createStaffSchedulePolicy({
    premia_view: 1,
    given_cart_edit: 1,
    fast_hours_access: 1,
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

test("quick actions require one of the three exact access flags, regardless of other gates", () => {
  const keys = ["fast_hours", "fast_smena", "fast_point"];
  for (let mask = 0; mask < 8; mask += 1) {
    const access = Object.fromEntries(
      keys.map((key, index) => [`${key}_access`, (mask >> index) & 1]),
    );
    assert.equal(createStaffSchedulePolicy(access).canShowFastActionsPanel, mask !== 0);
    assert.equal(
      createStaffSchedulePolicy({ ...access, schedule_actions_access: 0 }).canShowFastActionsPanel,
      mask !== 0,
    );
    assert.equal(
      createStaffSchedulePolicy({ ...access, schedule_actions_access: 1, full_month_access: 1 })
        .canShowFastActionsPanel,
      mask !== 0,
    );
  }
  for (const key of keys) {
    for (const suffix of ["view", "edit"]) {
      assert.equal(
        createStaffSchedulePolicy({ [`${key}_${suffix}`]: 1 }).canShowFastActionsPanel,
        false,
      );
    }
  }
  assert.equal(
    createStaffSchedulePolicy({ fast_month_access: 1, fast_2_week_access: 1 })
      .canShowFastActionsPanel,
    false,
  );
});

test("the quick category and local presets expose the three canonical permissions only", () => {
  assert.deepEqual(
    STAFF_SCHEDULE_ACCESS_RULES.filter((rule) => rule.area === "Быстрые действия").map(
      (rule) => rule.key,
    ),
    ["fast_hours", "fast_smena", "fast_point"],
  );
  for (const preset of ["fast", "all_on"]) {
    const access = applyStaffScheduleAccessPreset({}, preset);
    for (const key of ["fast_hours", "fast_smena", "fast_point"])
      assert.equal(access[`${key}_access`], 1);
    for (const key of ["fast_month", "fast_2_week"]) assert.equal(access[`${key}_access`], 0);
  }
  assert.equal(
    createStaffSchedulePolicy(applyStaffScheduleAccessPreset({}, "schedule"))
      .canShowFastActionsPanel,
    false,
  );
});

test("finance operations follow edit/access inheritance only, with independent grants", () => {
  const modes = {
    price_p_h: "1h",
    given: "given",
    given_cart: "given_cart",
    withheld: "withheld",
    my_bonus: "bonus",
    dir_lv: "director_level",
    dop_bonus_toggle: "com_bonus",
    dop_bonus_user: "com_bonus",
  };
  for (const [mode, key] of Object.entries(modes)) {
    for (const view of [0, 1])
      for (const edit of [0, 1])
        for (const access of [0, 1]) {
          const policy = createStaffSchedulePolicy({
            [`${key}_view`]: view,
            [`${key}_edit`]: edit,
            [`${key}_access`]: access,
          });
          assert.equal(policy.canEditSummaryAction(mode), Boolean(edit || access));
          if (mode === "dir_lv") assert.equal(policy.canEditDirectorLevel, Boolean(edit || access));
          for (const [otherMode, otherKey] of Object.entries(modes)) {
            if (otherKey !== key) assert.equal(policy.canEditSummaryAction(otherMode), false);
          }
        }
  }
  assert.equal(
    createStaffSchedulePolicy({ payroll_actions_access: 1 }).canEditSummaryAction("given"),
    false,
  );
  assert.equal(createStaffSchedulePolicy({}).canEditSummaryAction("unknown"), false);
});

test("salary fields require individual readable flags and ignore removed group denial", () => {
  const keys = [
    "1h",
    "1h_plus",
    "com_bonus",
    "full_h",
    "errors",
    "bonus",
    "all_price",
    "withheld",
    "test_all_price",
    "given",
    "given_cart",
    "premia",
  ];
  assert.deepEqual(getVisibleSummaryColumns({}), []);
  assert.deepEqual(getVisibleSummaryColumns({ salary_block_access: 1 }), []);
  for (const key of keys)
    for (const suffix of ["view", "edit", "access"]) {
      const access = { [`${key}_${suffix}`]: 1 };
      assert.deepEqual(
        getVisibleSummaryColumns(access).map((column) => column.accessKey),
        [key],
      );
      assert.deepEqual(
        getVisibleSummaryColumns({ ...access, salary_block_access: 0 }).map(
          (column) => column.accessKey,
        ),
        [key],
      );
    }
});

test("both exports and month actions require their exact action right, not role or view/edit", () => {
  for (const view of [0, 1])
    for (const edit of [0, 1])
      for (const access of [0, 1]) {
        const policy = createStaffSchedulePolicy({
          export_excel_view: view,
          export_excel_edit: edit,
          export_excel_access: access,
          full_month_view: view,
          full_month_edit: edit,
          full_month_access: access,
        });
        assert.equal(policy.canExportWorkSchedule, Boolean(access));
        assert.equal(policy.canExportHealthJournal, Boolean(access));
        assert.equal(policy.canOpenMonthCard, Boolean(access));
      }
});

test("cached financial modal data invalidates on readable rights revocation, not grant or unchanged inheritance", () => {
  const signature = getStaffScheduleFinancialReadSignature;
  const none = signature({});
  const cash = signature({ given_edit: 1 });
  const cards = signature({ given_cart_access: 1 });
  assert.equal(hasRevokedFinancialReadPermission(cash, none), true);
  assert.equal(hasRevokedFinancialReadPermission(cash, cards), true);
  assert.equal(hasRevokedFinancialReadPermission(none, cash), false);
  assert.equal(hasRevokedFinancialReadPermission(cash, signature({ given_view: 1 })), false);
  assert.equal(
    hasRevokedFinancialReadPermission(cash, signature({ given_edit: 1, salary_block_view: 0 })),
    false,
  );
  assert.equal(
    hasRevokedFinancialReadPermission(
      signature({ bonus_view: 1 }),
      signature({ full_month_access: 1 }),
    ),
    true,
  );
  assert.equal(hasRevokedFinancialReadPermission(undefined, cash), false);
});

test("all removed groups are inert for every suffix/value and absent from tester registry/presets", () => {
  const keys = [
    "salary_block",
    "payroll_actions",
    "schedule_actions",
    "smena_actions",
    "footer_stats",
  ];
  const detailed = {
    given_access: 1,
    fast_hours_access: 1,
    create_edit_smena_access: 1,
    rolls_edit: 1,
  };
  const gates = (flags) => {
    const policy = createStaffSchedulePolicy(flags);
    return [
      policy.canShowSalaryBlock,
      policy.canShowPayrollActions,
      policy.canShowFastActionsPanel,
      policy.canManageSmena,
      policy.canShowFooterStats,
    ];
  };
  for (const suffix of ["view", "edit", "access"])
    for (const value of [0, 1]) {
      const groups = Object.fromEntries(keys.map((key) => [`${key}_${suffix}`, value]));
      assert.deepEqual(gates(groups), [false, false, false, false, false]);
      assert.deepEqual(gates({ ...detailed, ...groups }), [true, true, true, true, true]);
      assert.equal(
        getStaffScheduleFinancialReadSignature({ ...detailed, ...groups }),
        getStaffScheduleFinancialReadSignature(detailed),
      );
    }
  for (const key of keys)
    assert.equal(
      STAFF_SCHEDULE_ACCESS_RULES.some((rule) => rule.key === key),
      false,
    );
  for (const preset of ["all_on", "all_off", "read_only", "finance", "schedule", "fast"]) {
    const flags = applyStaffScheduleAccessPreset({}, preset);
    for (const key of keys)
      for (const suffix of ["access", "view", "edit"])
        assert.equal(flags[`${key}_${suffix}`], undefined);
  }
  assert.equal(createStaffSchedulePolicy({ create_edit_smena_view: 1 }).canManageSmena, false);
  assert.equal(createStaffSchedulePolicy({ create_edit_smena_edit: 1 }).canManageSmena, false);
});
