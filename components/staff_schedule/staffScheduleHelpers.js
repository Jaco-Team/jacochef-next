import {
  createStaffScheduleAccess,
  createStaffSchedulePolicy,
  hasAccessRule,
} from "./staffScheduleAccess.mjs";
import {
  computePremiumSheet,
  computeToPaySum,
  computeTotalSum,
  toArray,
  toNumber,
} from "./staffSchedulePayroll.mjs";

export {
  computePremiumSheet,
  computeToPaySum,
  computeTotalSum,
  createStaffScheduleAccess,
  createStaffSchedulePolicy,
  hasAccessRule,
  toArray,
  toNumber,
};

export function getActiveMonthId(months = []) {
  const active = months.find((item) => Number(item?.is_active) === 1);
  return active?.id ?? months[0]?.id ?? "";
}

export function getPartStartDate(monthId, selectedPart = 0) {
  if (!monthId) {
    return "";
  }

  return `${monthId}-${Number(selectedPart) === 0 ? "01" : "16"}`;
}

// Не финансовая колонка: видна всем, не размывается и не зависит от прав.
export const WORKED_HOURS_COLUMN = {
  key: "worked_hours",
  label: "Всего часов",
  accessKey: null,
  public: true,
};

// Как в ячейках дней: целые часы — «109», с минутами — «123:20».
export function formatWorkedMinutes(minutes) {
  if (minutes === null || minutes === undefined || minutes === "") {
    return "";
  }
  const total = Math.round(Number(minutes));
  if (!Number.isFinite(total)) {
    return "";
  }
  const hours = Math.floor(Math.abs(total) / 60);
  const rest = Math.abs(total) % 60;
  const sign = total < 0 ? "-" : "";
  return rest ? `${sign}${hours}:${String(rest).padStart(2, "0")}` : `${sign}${hours}`;
}

export function getVisibleSummaryColumns(access = {}) {
  const { canShowSalaryBlock, canView } = createStaffSchedulePolicy(access);

  if (!canShowSalaryBlock) {
    return [WORKED_HOURS_COLUMN];
  }

  return [
    WORKED_HOURS_COLUMN,
    { key: "price_p_h", label: "За 1ч", accessKey: "1h" },
    { key: "price_p_h_dop", label: "За 1ч + доп.", accessKey: "1h_plus" },
    { key: "dop_bonus", label: "Командный бонус", accessKey: "com_bonus" },
    { key: "h_price", label: "За часы", accessKey: "full_h" },
    { key: "err_price", label: "Ошибки", accessKey: "errors" },
    { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
    { key: "total_sum", label: "Всего", accessKey: "all_price", computed: true },
    {
      key: "withheld",
      label: "Удержано по исп. листу",
      accessKey: "withheld",
    },
    { key: "opening_balance", label: "Остаток на начало", accessKey: "test_all_price" },
    { key: "to_pay_sum", label: "К выплате", accessKey: "test_all_price", computed: true },
    { key: "given", label: "Выдано", accessKey: "given" },
    { key: "given_cart", label: "На карты", accessKey: "given_cart" },
    { key: "salary_difference", label: "Разница", accessKey: "test_all_price" },
  ].filter((item) => item.public || canView(item.accessKey));
}

export function getSummaryCellValue(column, row = {}) {
  if (column.key === "worked_hours") {
    return formatWorkedMinutes(row?.worked_min);
  }

  if (column.key === "total_sum") {
    return computeTotalSum(row);
  }

  if (column.key === "to_pay_sum") {
    return computeToPaySum(row);
  }

  if (column.key === "test_all_price") {
    return computePremiumSheet(row);
  }

  return row?.[column.key] ?? "";
}

/**
 * Сумма за день в узкой ячейке: от тысячи — в тысячах с одним знаком («53,8к»), иначе целым числом.
 */
export function formatCompactAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return String(value);
  }
  if (Math.abs(number) < 1000) {
    return String(Math.round(number));
  }
  return `${(number / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}к`;
}

export function formatFullAmount(value) {
  const number = Number(value);
  return value === "" || value == null || !Number.isFinite(number)
    ? ""
    : `${Math.round(number).toLocaleString("ru-RU")} ₽`;
}

// Едва заметные, но различимые оттенки для строк одного человека; не пересекаются с цветами медкнижки и смен.
export const SAME_PERSON_TINTS = ["#E8F0FC", "#E3F5F0", "#F0E9FA", "#FCEFE4", "#EAF4E4", "#FBE9F0"];

export function getSamePersonTint(row = {}) {
  const group = Number(row?.same_person_group);
  return group > 0 ? SAME_PERSON_TINTS[(group - 1) % SAME_PERSON_TINTS.length] : null;
}

export function getSamePersonTitle(row = {}) {
  const others = Array.isArray(row?.same_person_with) ? row.same_person_with : [];
  return others.length ? `Этот же человек в графике: ${others.join(", ")}` : undefined;
}

const ACCRUAL_FINANCE_KEYS = new Set([
  "worked_hours",
  "price_p_h",
  "price_p_h_dop",
  "dop_bonus",
  "h_price",
  "err_price",
  "my_bonus",
  "total_sum",
]);

export function getFinanceGroup(columnKey) {
  return ACCRUAL_FINANCE_KEYS.has(columnKey) ? "accrual" : "payout";
}

export function formatFinanceCardValue(column, value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (column?.key === "worked_hours") {
    return String(value);
  }
  const number = Number(value);
  return Number.isFinite(number)
    ? `${number.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`
    : String(value);
}

export const BALANCE_COLUMN_KEYS = new Set(["opening_balance", "salary_difference"]);

export function isNegativeBalanceValue(column, value) {
  return BALANCE_COLUMN_KEYS.has(column?.key) && Number(value) < 0;
}

export function getScheduleRowFocusKey(row = {}) {
  if (
    [row?.smena_id, row?.id, row?.app_id].some(
      (value) => value == null || String(value).trim() === "",
    )
  ) {
    return null;
  }

  return `${row.smena_id}:${row.id}:${row.app_id}`;
}

export function getSelectedScheduleRows(visibleRows = [], selectedRowIds = []) {
  const selectedKeys = new Set(selectedRowIds);
  const seenKeys = new Set();

  return visibleRows
    .filter((row) => row?.row !== "header")
    .map((row) => row?.data)
    .filter((row) => {
      const key = getScheduleRowFocusKey(row);
      if (
        !key ||
        !selectedKeys.has(key) ||
        seenKeys.has(key) ||
        !(Number(row?.id) > 0) ||
        !(Number(row?.app_id) > 0) ||
        !(Number(row?.smena_id) > 0)
      ) {
        return false;
      }
      seenKeys.add(key);
      return true;
    });
}

export function getRowBaseColor(type, isDimmed) {
  if (isDimmed) {
    return {
      backgroundColor: "#D3D3D3",
      color: "#000000",
    };
  }

  if (Number(type) === 2) {
    return {
      backgroundColor: "#ffcc00",
      color: "#000000",
    };
  }

  if (Number(type) === 3) {
    return {
      backgroundColor: "#cc0033",
      color: "#ffffff",
    };
  }

  return {
    backgroundColor: "#ffffff",
    color: "#000000",
  };
}

export function hasFastActionsAccess(access = {}) {
  return createStaffSchedulePolicy(access).canShowFastActionsPanel;
}

export function canExportExcel(access = {}) {
  return createStaffSchedulePolicy(access).canExportWorkSchedule;
}

export function openExportDownloadUrl(response) {
  const url = response?.url || response?.data?.url;

  if (!url) {
    return false;
  }

  const link = document.createElement("a");
  link.href = url;
  link.click();
  return true;
}

export function buildShiftGroups(rows = []) {
  const result = [];
  let currentGroup = null;

  rows.forEach((row, index) => {
    if (row?.row === "header") {
      currentGroup = {
        id: row?.smena_id ? String(row.smena_id) : `shift-${index}`,
        smenaId: row?.smena_id ?? "",
        label: row?.data || "Смена",
        rows: [],
        header: row,
      };
      result.push(currentGroup);
      return;
    }

    if (!currentGroup) {
      currentGroup = {
        id: "shift-default",
        smenaId: "",
        label: "Смена",
        rows: [],
        header: { row: "header", data: "Смена" },
      };
      result.push(currentGroup);
    }

    if (!currentGroup.smenaId && row?.data?.smena_id) {
      currentGroup.smenaId = row.data.smena_id;
      currentGroup.id = String(row.data.smena_id);
    }

    currentGroup.rows.push(row);
  });

  return result;
}

export function countShiftEmployees(rows = []) {
  const employeeIds = new Set();
  let rowsWithoutId = 0;

  toArray(rows).forEach((row) => {
    const id = row?.data?.id;

    if (id == null || id === "") {
      rowsWithoutId += 1;
    } else {
      employeeIds.add(String(id));
    }
  });

  return employeeIds.size + rowsWithoutId;
}

export function formatEmployeeCount(count) {
  const value = Math.max(0, Math.trunc(Number(count) || 0));
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;
  const noun =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? "сотрудников"
      : lastDigit === 1
        ? "сотрудник"
        : lastDigit >= 2 && lastDigit <= 4
          ? "сотрудника"
          : "сотрудников";

  return `${value} ${noun}`;
}
