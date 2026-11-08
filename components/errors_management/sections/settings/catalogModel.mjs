export const CATEGORY_DEFINITIONS = [
  { objectType: "dish", name: "Блюдо" },
  { objectType: "order", name: "Заказ" },
  { objectType: "extra", name: "Допы" },
  { objectType: "cutlery", name: "Столовые приборы" },
  { objectType: "delivery", name: "Доставка" },
];

export function nodesOf(nodes, kind, parentId = null) {
  return nodes.filter(
    (node) =>
      node.kind === kind && (parentId === null || Number(node.parent_id) === Number(parentId)),
  );
}

export function sortNodes(nodes) {
  return [...nodes].sort(
    (left, right) =>
      Number(left.sort_order || 0) - Number(right.sort_order || 0) ||
      String(left.name || "").localeCompare(String(right.name || ""), "ru") ||
      Number(left.id) - Number(right.id),
  );
}

const HISTORY_FIELDS = {
  name: "Наименование",
  description: "Описание",
  sort_order: "Порядок",
  is_active: "Активность",
  "rules.requires_ingredient": "Продукт из состава обязателен",
  "rules.stage_ids": "Доступные этапы",
};

export function historyTimestamp(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  return match ? `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}` : "—";
}

export function historyValue(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "is_active") return Boolean(Number(value)) ? "Включено" : "Отключено";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

export function historyChanges(item) {
  try {
    return Object.entries(JSON.parse(item?.diff_json || "{}"))
      .filter(([field]) => HISTORY_FIELDS[field])
      .map(([field, change]) => ({
        field,
        label: HISTORY_FIELDS[field],
        from: change?.from,
        to: change?.to,
      }));
  } catch {
    return [];
  }
}

export function initialDraft(node, context) {
  return {
    id: node?.id || 0,
    kind: node?.kind || context.kind,
    parent_id: node?.parent_id ?? context.parentId ?? null,
    point_id: node?.point_id ?? context.pointId ?? null,
    name: node?.name || context.name || "",
    description: node?.description || "",
    sort_order: String(node?.sort_order ?? 0),
    is_active: node?.is_active ?? true,
    rules:
      node?.rules ||
      context.rules ||
      (context.kind === "category" ? { object_types: [context.objectType] } : {}),
  };
}
