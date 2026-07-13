import handleUserAccess from "../../src/helpers/access/handleUserAccess.js";

export function hasAccessRule(access = {}, key) {
  const keyBase = String(key || "").replace(/_(access|view|edit)$/, "");

  return (
    Object.prototype.hasOwnProperty.call(access, `${keyBase}_access`) ||
    Object.prototype.hasOwnProperty.call(access, `${keyBase}_view`) ||
    Object.prototype.hasOwnProperty.call(access, `${keyBase}_edit`)
  );
}

export function createStaffScheduleAccess(access = {}) {
  const { userCan } = handleUserAccess(access);

  const check = (action, key) => {
    if (!hasAccessRule(access, key)) {
      return false;
    }

    return userCan(action, key);
  };

  return {
    canAccess: (key) => check("access", key),
    canView: (key) => check("view", key),
    canEdit: (key) => check("edit", key),
  };
}

export function createStaffSchedulePolicy(access = {}) {
  const accessCheck = createStaffScheduleAccess(access);
  const { canAccess, canView, canEdit } = accessCheck;
  const canShowSalaryBlock = hasAccessRule(access, "salary_block")
    ? canView("salary_block")
    : canView("1h") ||
      canView("1h_plus") ||
      canView("full_h") ||
      canView("bonus") ||
      canView("all_price") ||
      canView("given") ||
      canView("withheld") ||
      canView("given_cart") ||
      canView("test_all_price") ||
      canView("premia");
  const canShowPayrollActions = hasAccessRule(access, "payroll_actions")
    ? canAccess("payroll_actions")
    : canEdit("given") || canEdit("given_cart") || canEdit("withheld");
  const canShowFastActionsPanel = hasAccessRule(access, "schedule_actions")
    ? canAccess("schedule_actions")
    : canAccess("full_month") ||
      canAccess("fast_2_week") ||
      canAccess("fast_month") ||
      canAccess("fast_smena") ||
      canAccess("fast_point");
  const canManageSmena = hasAccessRule(access, "smena_actions")
    ? canAccess("smena_actions")
    : canAccess("create_edit_smena");
  const canShowFooterStats = hasAccessRule(access, "footer_stats")
    ? canView("footer_stats")
    : canView("bonus_of_day") ||
      canView("rolls") ||
      canView("pizza") ||
      canView("over_40_min") ||
      canView("sums_all");
  const canOpenMonthCard = canAccess("full_month");
  const canOpenDayCard = canEdit("day_edit") || canAccess("full_day") || canOpenMonthCard;
  const canExportWorkSchedule = hasAccessRule(access, "export_excel")
    ? canAccess("export_excel")
    : true;

  return {
    ...accessCheck,
    canShowSalaryBlock,
    canShowPayrollActions,
    canShowFastActionsPanel,
    canManageSmena,
    canShowFooterStats,
    canOpenMonthCard,
    canOpenDayCard,
    canExportWorkSchedule,
    canExportHealthJournal: true,
  };
}
