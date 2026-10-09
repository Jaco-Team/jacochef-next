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
  const canShowSalaryBlock =
    canView("1h") ||
    canView("1h_plus") ||
    canView("com_bonus") ||
    canView("errors") ||
    canView("full_h") ||
    canView("bonus") ||
    canView("all_price") ||
    canView("given") ||
    canView("withheld") ||
    canView("given_cart") ||
    canView("test_all_price") ||
    canView("premia");
  const canShowPayrollActions = canEdit("given") || canEdit("given_cart") || canEdit("withheld");
  const canShowFastActionsPanel =
    canAccess("fast_hours") || canAccess("fast_smena") || canAccess("fast_point");
  const canManageSmena = canAccess("create_edit_smena");
  const canShowFooterStats =
    canView("bonus_of_day") ||
    canView("rolls") ||
    canView("pizza") ||
    canView("over_40_min") ||
    canView("sums_all");
  const canOpenMonthCard = canAccess("full_month");
  const canOpenDayCard = canEdit("day_edit") || canAccess("full_day") || canAccess("full_month");
  const canExportWorkSchedule = canAccess("export_excel");
  const canEditDirectorLevel = canEdit("director_level");
  const canEditSummaryAction = (mode) => {
    const key = {
      price_p_h: "1h",
      given: "given",
      given_cart: "given_cart",
      withheld: "withheld",
      my_bonus: "bonus",
      dir_lv: "director_level",
      dop_bonus_toggle: "com_bonus",
      dop_bonus_user: "com_bonus",
    }[mode];
    return Boolean(key && canEdit(key));
  };

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
    canExportHealthJournal: canExportWorkSchedule,
    canEditDirectorLevel,
    canEditSummaryAction,
  };
}

export function getStaffScheduleFinancialReadSignature(access = {}) {
  const policy = createStaffSchedulePolicy(access);
  return [
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
  ]
    .map((key) => Number(policy.canShowSalaryBlock && policy.canView(key)))
    .join("");
}

export function hasRevokedFinancialReadPermission(previous, current) {
  return Boolean(
    previous && [...previous].some((value, index) => value === "1" && current?.[index] !== "1"),
  );
}

export function canEditStaffScheduleBonus({ row, canEdit, selectedPart }) {
  return (
    Number(selectedPart) === 1 &&
    Boolean(canEdit?.("bonus")) &&
    (row?.can_edit_bonus === true || row?.can_edit_bonus === 1)
  );
}

export function canEditStaffScheduleFinanceValue({ columnKey, row, canEdit } = {}) {
  const permission = {
    price_p_h: "1h",
    given: "given",
    given_cart: "given_cart",
    withheld: "withheld",
  }[columnKey];
  if (!permission || !canEdit?.(permission)) return false;
  return columnKey !== "price_p_h" || (Array.isArray(row?.price_arr) && row.price_arr.length > 0);
}

export function getEditableStaffScheduleBonusRow({ rows, request, monthId, selectedPart, access }) {
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(String(monthId ?? "")) ||
    request?.date !== monthId ||
    ![request?.user_id, request?.app_id, request?.smena_id].every((value) => Number(value) > 0)
  )
    return null;
  const row = (Array.isArray(rows) ? rows : []).find(
    (item) =>
      item?.row !== "header" &&
      String(item?.data?.id) === String(request.user_id) &&
      String(item?.data?.app_id) === String(request.app_id) &&
      String(item?.data?.smena_id) === String(request.smena_id),
  )?.data;
  return canEditStaffScheduleBonus({
    row,
    selectedPart,
    canEdit: createStaffScheduleAccess(access).canEdit,
  })
    ? row
    : null;
}
