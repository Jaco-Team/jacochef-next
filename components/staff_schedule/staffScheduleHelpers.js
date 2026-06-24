import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isEnabled(value) {
  return Number(value) === 1;
}

export function getActiveMonthId(months = []) {
  const active = months.find((item) => Number(item?.is_active) === 1);
  return active?.id ?? months[0]?.id ?? "";
}

export function getVisibleSummaryColumns(access = {}) {
  const { userCan } = handleUserAccess(access);

  return [
    { key: "price_p_h", label: "За 1ч", accessKey: "1h_view" },
    { key: "price_p_h_dop", label: "За 1ч + доп.", accessKey: "1h_plus_view" },
    { key: "dop_bonus", label: "Командный бонус", accessKey: "com_bonus_view" },
    { key: "h_price", label: "За часы", accessKey: "full_h_view" },
    { key: "err_price", label: "Ошибки", accessKey: "errors_view" },
    { key: "my_bonus", label: "Бонус", accessKey: "bonus_view" },
    { key: "total_sum", label: "Всего", accessKey: "all_price_view", computed: true },
    { key: "withheld", label: "Удержано", accessKey: "withheld_view" },
    { key: "to_pay_sum", label: "К выплате", accessKey: "test_all_price_view", computed: true },
    { key: "given", label: "Выдано", accessKey: "given_view" },
    { key: "given_cart", label: "На карты", accessKey: "given_cart_view" },
    { key: "test_all_price", label: "Премия по ведомости", accessKey: "premia_view" },
  ].filter((item) => userCan("view", item.accessKey));
}

export function computeTotalSum(row = {}) {
  return (
    toNumber(row.dop_bonus) +
    toNumber(row.dir_price) +
    toNumber(row.register_price) +
    toNumber(row.dir_price_dop) +
    toNumber(row.h_price) +
    toNumber(row.my_bonus) -
    toNumber(row.err_price)
  );
}

export function computeToPaySum(row = {}) {
  if (row.app_type === "driver") {
    return "";
  }

  return computeTotalSum(row) - toNumber(row.given_cart) - toNumber(row.withheld);
}

export function getSummaryCellValue(column, row = {}) {
  if (column.key === "total_sum") {
    return computeTotalSum(row);
  }

  if (column.key === "to_pay_sum") {
    return computeToPaySum(row);
  }

  return row?.[column.key] ?? "";
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
  const { userCan } = handleUserAccess(access);

  return (
    userCan("access", "fast_2_week") ||
    userCan("access", "fast_month") ||
    userCan("access", "fast_smena") ||
    userCan("access", "fast_point")
  );
}

export function canExportExcel(access = {}) {
  return handleUserAccess(access).userCan("access", "export_excel");
}

export function canAccess(access = {}, key) {
  return handleUserAccess(access).userCan("access", key);
}

export function canView(access = {}, key) {
  return handleUserAccess(access).userCan("view", key);
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
