import dayjs from "dayjs";

export function orderId(row) {
  return Number(row?.order_id ?? row?.id ?? 0);
}

export function pointId(row) {
  return Number(row?.point_id ?? 0);
}

export const WORKFLOW_SOURCES = [
  { id: "contact_center", name: "Контакт-центр" },
  { id: "cafe", name: "Кафе" },
];

export const STATISTICS_SOURCES = [
  { id: "site", name: "Сайт" },
  { id: "contact_center", name: "Контакт-центр" },
  { id: "cafe", name: "Кафе" },
  { id: "legacy", name: "Исторический контур" },
];
export const COMPLAINT_HISTORY_FIELDS = {
  status: "Статус",
  common_comment: "Общий комментарий",
  sent_to_cafe_at: "Отправлено в кафе",
  accepted_at: "Принято в работу",
  resolved_at: "Решение принято",
  resolution_promo_code: "Промокод решения",
};
export const COMPLAINT_STATUS_LABELS = {
  registered: "В решении",
  sent_to_cafe: "В решении",
  accepted_by_cafe: "В решении",
  resolved: "Решена",
  cancelled: "Отменена",
};

export function historyFieldLabel(field) {
  if (COMPLAINT_HISTORY_FIELDS[field]) return COMPLAINT_HISTORY_FIELDS[field];
  const errorField = field.match(
    /^errors\.\d+\.(category_name|error_type_name|error_name|stage_name|solution_name|error_amount|changed_amount|comment)$/,
  )?.[1];
  return {
    category_name: "Категория",
    error_type_name: "Тип ошибки",
    error_name: "Ошибка",
    stage_name: "Этап возникновения ошибки",
    solution_name: "Решение",
    error_amount: "Сумма ошибки",
    changed_amount: "Сумма изменения",
    comment: "Комментарий к ошибке",
  }[errorField];
}

export function hasHistoryValue(value) {
  return value !== null && value !== undefined && value !== "";
}

export function historyChanges(item) {
  try {
    const diff = typeof item?.diff_json === "string" ? JSON.parse(item.diff_json) : item?.diff_json;
    if (!diff || typeof diff !== "object") return [];
    return Object.entries(diff)
      .map(([field, change]) => ({ field, label: historyFieldLabel(field), change }))
      .filter(
        ({ label, change }) =>
          label &&
          change &&
          typeof change === "object" &&
          (hasHistoryValue(change.from) || hasHistoryValue(change.to)),
      )
      .map(({ field, label, change }) => ({ field, label, ...change }))
      .sort((left, right) => historyFieldOrder(left.field) - historyFieldOrder(right.field));
  } catch {
    return [];
  }
}

export function historySummaryLines(changes) {
  const groups = new Map();
  changes.forEach((change) => {
    const from = hasHistoryValue(change.from) ? historyValue(change.from, change.field) : null;
    const to = historyValue(change.to, change.field);
    const value = from ? `${from} → ${to}` : to;
    const group = groups.get(change.label) || [];
    if (!group.includes(value)) group.push(value);
    groups.set(change.label, group);
  });
  return Array.from(groups, ([label, values]) => ({ label, value: values.join(" · ") }));
}

export function historyFieldOrder(field) {
  if (field === "status") return 0;
  if (field.endsWith(".category_name")) return 1;
  if (field.endsWith(".error_type_name")) return 2;
  if (field.endsWith(".error_name")) return 3;
  if (field.endsWith(".stage_name")) return 4;
  if (field.endsWith(".solution_name")) return 5;
  if (field.endsWith(".error_amount")) return 6;
  if (field.endsWith(".changed_amount")) return 7;
  if (field.endsWith(".comment")) return 8;
  if (field === "common_comment") return 9;
  if (field === "resolution_promo_code") return 10;
  return 11;
}

export const HISTORY_STATUS_LABELS = {
  registered: "Зарегистрирована",
  sent_to_cafe: "Отправлена в кафе",
  accepted_by_cafe: "Принята кафе",
  resolved: "Решена",
  cancelled: "Отменена",
};

export function historyValue(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "status") return HISTORY_STATUS_LABELS[value] || String(value);
  if (["sent_to_cafe_at", "accepted_at", "resolved_at"].includes(field))
    return historyTimestamp(value);
  if (field.endsWith(".error_amount") || field.endsWith(".changed_amount"))
    return amountLabel(value);
  return String(value);
}

export function historyTimestamp(value) {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : value || "—";
}

export function amountLabel(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)} ₽` : "—";
}

export function workflowSourceLabel(source) {
  return WORKFLOW_SOURCES.find((item) => item.id === source)?.name || "—";
}

export function orderSourceLabel(source) {
  return STATISTICS_SOURCES.find((item) => item.id === source)?.name || "Не определено";
}

export function cafeLabel(row, points) {
  const point = points.find((item) => String(item.id) === String(row.point_id));
  return row.cafe_name || point?.addr || point?.name || "—";
}

export function complaintStatusLabel(item) {
  const label = item?.status_label || COMPLAINT_STATUS_LABELS[item?.status] || "—";
  return item?.status_context ? `${label} · ${item.status_context}` : label;
}

export function complaintStatusColor(status) {
  return (
    {
      registered: "info",
      sent_to_cafe: "warning",
      accepted_by_cafe: "warning",
      resolved: "success",
      cancelled: "error",
    }[status] || "default"
  );
}

export function complaintObjectLabel(item) {
  return (
    {
      dish: "Блюдо",
      order: "Заказ",
      extra: "Допы",
      cutlery: "Столовые приборы",
      delivery: "Доставка",
    }[item?.object_type] ||
    item?.category_name ||
    "Ошибка"
  );
}
