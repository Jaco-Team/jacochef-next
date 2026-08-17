/** TZ §13 statuses — labels and MUI Chip colors. */
export const STATUS = {
  ENOUGH: "enough",
  CRITICAL: "critical",
  NEED_NOT_ALLOCATED: "need_not_allocated",
  PARTIALLY_ALLOCATED: "partially_allocated",
  FULLY_ALLOCATED: "fully_allocated",
  OVER_ALLOCATED: "over_allocated",
  NO_USAGE: "no_usage",
  NO_SUPPLIER_STOCK: "no_supplier_stock",
  STOCK_STALE: "stock_stale",
};

export const statusLabelMap = {
  [STATUS.ENOUGH]: "Достаточно",
  [STATUS.CRITICAL]: "Критически мало",
  [STATUS.NEED_NOT_ALLOCATED]: "Потребность не распределена",
  [STATUS.PARTIALLY_ALLOCATED]: "Частично распределено",
  [STATUS.FULLY_ALLOCATED]: "Распределено полностью",
  [STATUS.OVER_ALLOCATED]: "Превышение распределения",
  [STATUS.NO_USAGE]: "Нет данных по расходу",
  [STATUS.NO_SUPPLIER_STOCK]: "Нет данных по остатку поставщика",
  [STATUS.STOCK_STALE]: "Остаток устарел",
};

export const statusColorMap = {
  [STATUS.ENOUGH]: "success",
  [STATUS.CRITICAL]: "error",
  [STATUS.NEED_NOT_ALLOCATED]: "warning",
  [STATUS.PARTIALLY_ALLOCATED]: "warning",
  [STATUS.FULLY_ALLOCATED]: "success",
  [STATUS.OVER_ALLOCATED]: "error",
  [STATUS.NO_USAGE]: "default",
  [STATUS.NO_SUPPLIER_STOCK]: "warning",
  [STATUS.STOCK_STALE]: "warning",
};

export function getStatusLabel(status) {
  if (status == null || status === "") return "—";
  return statusLabelMap[status] || String(status);
}

export function getStatusColor(status) {
  return statusColorMap[status] || "default";
}

export const FILTER_FLAGS = [
  { key: "critical", label: "Критические" },
  { key: "no_supplier_stock", label: "Без остатка поставщика" },
  { key: "no_usage", label: "Без расхода" },
  { key: "stale_stock", label: "Устаревшие остатки" },
  { key: "undistributed", label: "Нераспределённая потребность" },
];
