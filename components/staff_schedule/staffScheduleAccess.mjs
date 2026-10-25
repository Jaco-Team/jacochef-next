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
    canView("test_all_price");
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
  // В архивном месяце карточка дня не открывается: full_month даёт только просмотр месяца.
  const canOpenDayCard =
    access?.staff_schedule_archive !== true &&
    (canEdit("day_edit") || canAccess("full_day") || canAccess("full_month"));
  const canExportWorkSchedule = canAccess("export_excel");
  const canViewRates = canView("rates");
  const canEditRates = canEdit("rates");
  const canEditSummaryAction = (mode) => {
    const key = {
      price_p_h: "1h",
      given: "given",
      given_cart: "given_cart",
      withheld: "withheld",
      my_bonus: "bonus",
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
    canViewRates,
    canEditRates,
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

export function hasAlternativeStaffScheduleRate(row = {}) {
  const currentRate = String(row?.price_p_h ?? "");

  return (
    Array.isArray(row?.price_arr) && row.price_arr.some((option) => String(option) !== currentRate)
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
  return columnKey !== "price_p_h" || hasAlternativeStaffScheduleRate(row);
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

// Показатели, которые в таблице меняются по клику; остальные считаются.
export const EDITABLE_FINANCE_KEYS = new Set([
  "price_p_h",
  "dop_bonus",
  "my_bonus",
  "withheld",
  "given",
  "given_cart",
]);

/**
 * То же правило, что у ячеек финансов в таблице: "summary" — окно ввода, "team_bonus" — командный бонус, null — нельзя.
 */
export function getStaffScheduleFinanceAction({
  columnKey,
  row,
  canEdit,
  selectedPart,
  periodBonusState,
} = {}) {
  if (columnKey === "dop_bonus") {
    return canEdit?.("com_bonus") &&
      [1, 2].includes(Number(periodBonusState)) &&
      Number(row?.check_period) === 1 &&
      String(row?.smena_id ?? "") !== "-1"
      ? "team_bonus"
      : null;
  }
  if (columnKey === "my_bonus") {
    return canEditStaffScheduleBonus({ row, canEdit, selectedPart }) ? "summary" : null;
  }
  return canEditStaffScheduleFinanceValue({ columnKey, row, canEdit }) ? "summary" : null;
}
