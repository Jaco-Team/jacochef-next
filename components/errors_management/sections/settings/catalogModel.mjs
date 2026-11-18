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

export function scopePointId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isGlobalNode(node) {
  return node?.point_id === null || node?.point_id === undefined;
}

export function isInheritedNode(node, pointId) {
  return pointId !== null && pointId !== undefined && isGlobalNode(node);
}

export function canEditCatalogNode(node, pointId, canEdit) {
  if (!canEdit || !node) return false;
  if (pointId === null || pointId === undefined) return isGlobalNode(node);
  return !isGlobalNode(node) && Number(node.point_id) === Number(pointId);
}

export function categoriesForObjectType(nodes, objectType) {
  return sortNodes(
    nodesOf(nodes, "category").filter((node) => node.rules?.object_types?.[0] === objectType),
  );
}

export function preferredCategory(categories, pointId) {
  return (
    categories.find(
      (node) => pointId !== null && pointId !== undefined && Number(node.point_id) === pointId,
    ) ||
    categories.find(isGlobalNode) ||
    categories[0] ||
    null
  );
}

function positiveIds(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
    : [];
}

export function scopeCompatible(node, candidate) {
  if (!candidate) return false;
  if (isGlobalNode(node)) return isGlobalNode(candidate);
  return isGlobalNode(candidate) || Number(candidate.point_id) === Number(node.point_id);
}

const PARENT_KINDS = { error_type: "category", error: "error_type" };

export function parentKind(kind) {
  return PARENT_KINDS[kind] || null;
}

export function parentOptions(nodes, draft) {
  const kind = parentKind(draft?.kind);
  if (!kind) return [];
  return sortNodes(
    nodes.filter(
      (node) =>
        node.kind === kind &&
        Number(node.id) !== Number(draft.id) &&
        (Boolean(node.is_active) || Number(node.id) === Number(draft.parent_id)) &&
        scopeCompatible(draft, node),
    ),
  );
}

export function stageOptions(stages, draft) {
  return sortNodes(
    stages.filter(
      (stage) => stage.kind === "stage" && Boolean(stage.is_active) && scopeCompatible(draft, stage),
    ),
  );
}

export function hasChildren(nodes, node) {
  return Boolean(node?.id) && nodes.some((item) => Number(item.parent_id) === Number(node.id));
}

export function errorObjectTypes(nodes, draft) {
  const type = nodes.find((node) => Number(node.id) === Number(draft?.parent_id));
  const category = nodes.find((node) => Number(node.id) === Number(type?.parent_id));
  return Array.isArray(category?.rules?.object_types) ? category.rules.object_types : [];
}

export function allowsIngredient(nodes, draft) {
  return errorObjectTypes(nodes, draft).includes("dish");
}

export function nodeRules(kind, rules = {}, { allowIngredient = true, stageIds = null } = {}) {
  if (kind === "error") {
    const allowedStages = stageIds ? new Set(stageIds.map(Number)) : null;
    const nextStageIds = positiveIds(rules?.stage_ids).filter(
      (id) => !allowedStages || allowedStages.has(id),
    );
    return {
      ...(allowIngredient ? { requires_ingredient: Boolean(rules?.requires_ingredient) } : {}),
      ...(nextStageIds.length ? { stage_ids: nextStageIds } : {}),
    };
  }
  if (kind === "category") {
    const siteCategoryIds = positiveIds(rules?.site_category_ids);
    const itemIds = positiveIds(rules?.item_ids);
    return {
      object_types: Array.isArray(rules?.object_types) ? rules.object_types : [],
      ...(siteCategoryIds.length ? { site_category_ids: siteCategoryIds } : {}),
      ...(itemIds.length ? { item_ids: itemIds } : {}),
    };
  }
  return {};
}

export function canSaveNode(draft, { stageIds = null, parentIds = null } = {}) {
  if (!String(draft?.name || "").trim()) return false;
  if (parentIds && parentKind(draft?.kind)) {
    if (!parentIds.map(Number).includes(Number(draft.parent_id))) return false;
  }
  if (draft?.kind === "error") {
    return (nodeRules("error", draft.rules, { stageIds }).stage_ids || []).length > 0;
  }
  return true;
}

const HISTORY_FIELDS = {
  name: "Наименование",
  description: "Описание",
  sort_order: "Порядок",
  is_active: "Активность",
  "rules.requires_ingredient": "Продукт из состава обязателен",
  "rules.stage_ids": "Доступные этапы",
  "rules.site_category_ids": "Категории сайта",
  "rules.item_ids": "Позиции сайта",
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
    parent_id: node ? (node.parent_id ?? null) : (context.parentId ?? null),
    point_id: node ? (node.point_id ?? null) : (context.pointId ?? null),
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
