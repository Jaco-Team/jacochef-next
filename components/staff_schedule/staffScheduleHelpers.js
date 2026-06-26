import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getActiveMonthId(months = []) {
  const active = months.find((item) => Number(item?.is_active) === 1);
  return active?.id ?? months[0]?.id ?? "";
}

export function getVisibleSummaryColumns(access = {}) {
  const { canView } = createStaffScheduleAccess(access);

  return [
    { key: "price_p_h", label: "За 1ч", accessKey: "1h" },
    { key: "price_p_h_dop", label: "За 1ч + доп.", accessKey: "1h_plus" },
    { key: "dop_bonus", label: "Командный бонус", accessKey: "com_bonus" },
    { key: "h_price", label: "За часы", accessKey: "full_h" },
    { key: "err_price", label: "Ошибки", accessKey: "errors" },
    { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
    { key: "total_sum", label: "Всего", accessKey: "all_price", computed: true },
    { key: "withheld", label: "Удержано", accessKey: "withheld" },
    { key: "to_pay_sum", label: "К выплате", accessKey: "test_all_price", computed: true },
    { key: "given", label: "Выдано", accessKey: "given" },
    { key: "given_cart", label: "На карты", accessKey: "given_cart" },
    { key: "test_all_price", label: "Премия по ведомости", accessKey: "premia" },
  ].filter((item) => canView(item.accessKey));
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
  const { canAccess } = createStaffScheduleAccess(access);

  return (
    canAccess("fast_2_week") ||
    canAccess("fast_month") ||
    canAccess("fast_smena") ||
    canAccess("fast_point")
  );
}

export function canExportExcel(access = {}) {
  return createStaffScheduleAccess(access).canAccess("export_excel");
}

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
  const check = (action, key) => (hasAccessRule(access, key) ? userCan(action, key) : true);

  return {
    canAccess: (key) => check("access", key),
    canView: (key) => check("view", key),
    canEdit: (key) => check("edit", key),
  };
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
