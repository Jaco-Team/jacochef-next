"use client";

import { formatDateRangeRU } from "../formatDateRangeRU";

export const ENTITY_TYPES = ["recipe", "semi_finished"];

export function getEntityLabel(entityType) {
  return entityType === "recipe" ? "Рецепты" : "Заготовки";
}

export function getEntitySingleLabel(entityType) {
  return entityType === "recipe" ? "Рецепт" : "Заготовка";
}

export function getEntitySaveApi(api, entityType, mode) {
  if (entityType === "recipe") {
    return mode === "create" ? api.createRecipe : api.updateRecipe;
  }

  return mode === "create" ? api.createSemiFinished : api.updateSemiFinished;
}

export function getEntityLoadApi(api, entityType) {
  return entityType === "recipe" ? api.getRecipes : api.getSemiFinished;
}

export function getEntityDetailApi(api, entityType) {
  return entityType === "recipe" ? api.getRecipe : api.getSemiFinishedOne;
}

export function getProductionVisibleState(row) {
  return Number(row?.is_show ?? 0) === 1;
}

export function getDeleteHint(row) {
  const activeCount = row?.delete_usage?.active_relations?.length || 0;
  const historyCount = row?.delete_usage?.history_relations?.length || 0;
  const parts = [];

  if (activeCount) {
    parts.push(`активные связи: ${activeCount}`);
  }

  if (historyCount) {
    parts.push(`история: ${historyCount}`);
  }

  return parts.length ? `Удаление заблокировано, ${parts.join(", ")}` : "Удаление заблокировано";
}

export function getDeleteError(response) {
  const usage = response?.usage ?? {};
  const activeCount = Array.isArray(usage?.active_relations) ? usage.active_relations.length : 0;
  const historyCount = Array.isArray(usage?.history_relations) ? usage.history_relations.length : 0;
  const counts = [];

  if (activeCount) {
    counts.push(`активные связи: ${activeCount}`);
  }

  if (historyCount) {
    counts.push(`история: ${historyCount}`);
  }

  return counts.length
    ? `${response?.text || "Удаление запрещено"} (${counts.join(", ")})`
    : response?.text || "Удаление запрещено";
}

export function formatCategories(categories) {
  if (!Array.isArray(categories) || !categories.length) {
    return "-";
  }

  const names = categories.map((item) => item?.name ?? "").filter(Boolean);
  return names.length ? names.join(", ") : "-";
}

export function formatDateRangeCell(row) {
  return formatDateRangeRU(row?.date_start, row?.date_end);
}

export function getPrimaryStatusChip(row) {
  if (Number(row?.is_archived) === 1) {
    return { key: "archived", label: "Архив", color: "default" };
  }

  if (getProductionVisibleState(row)) {
    return { key: "active", label: "Активен", color: "success" };
  }

  return { key: "hidden", label: "Скрыт", color: "default" };
}

export function getSecondaryStatusChips(row) {
  return [
    Number(row?.show_in_rev) === 1
      ? { key: "show_in_rev", label: "В ревизии", color: "primary" }
      : null,
    Number(row?.two_user) === 1
      ? { key: "two_user", label: "2 сотрудника", color: "secondary" }
      : null,
  ].filter(Boolean);
}

export function getRowKey(entityType, row) {
  if (row?.id !== null && row?.id !== undefined && row?.id !== "") {
    return [entityType, row.id].join("-");
  }

  return [
    entityType,
    row?.name ?? "no-name",
    row?.date_start ?? "no-start",
    row?.date_end ?? "no-end",
  ].join("-");
}

export function createEmptyProductionDraft() {
  return {
    id: null,
    name: "",
    shelf_life: "",
    date_start: "",
    date_end: "",
    ed_izmer_id: "",
    all_w: "",
    all_w_brutto: "",
    all_w_netto: "",
    time_min: "",
    time_min_dop: "",
    structure: "",
    show_in_rev: 0,
    two_user: 0,
    is_show: 1,
    is_archived: 0,
    categories: [],
    items: [],
    allergens: [],
    allergens_possible: [],
    allergens_derived: [],
    allergens_possible_derived: [],
    storages: [],
    apps: [],
    units: [],
  };
}

function normalizeRelationIds(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item) => item?.id ?? item)
    .filter((id) => id !== null && id !== undefined && id !== "")
    .map((id) => ({ id }));
}

function normalizeCompositionItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    item_id: item?.item_id ?? item?.nomenclature_id ?? item?.id ?? "",
    type_rec: item?.type_rec ?? item?.type ?? "item",
    brutto: item?.brutto ?? "",
    pr_1: item?.pr_1 ?? item?.loss ?? item?.waste ?? item?.proc_loss ?? item?.loss_percent ?? "",
    netto: item?.netto ?? "",
    pr_2: item?.pr_2 ?? "",
    res: item?.res ?? item?.output ?? item?.all_w ?? item?.weight_out ?? "",
  }));
}

export function normalizeProductionDraft(entity, response = {}) {
  const units = Array.isArray(response?.units) ? response.units : [];

  return {
    ...createEmptyProductionDraft(),
    ...entity,
    unit_name:
      units.find((item) => String(item?.id) === String(entity?.ed_izmer_id))?.name ??
      entity?.unit_name ??
      "",
    units,
    categories: Array.isArray(entity?.categories) ? entity.categories : [],
    allergens: Array.isArray(entity?.allergens) ? entity.allergens : [],
    allergens_possible: Array.isArray(entity?.allergens_possible) ? entity.allergens_possible : [],
    allergens_derived: Array.isArray(entity?.allergens_derived) ? entity.allergens_derived : [],
    allergens_possible_derived: Array.isArray(entity?.allergens_possible_derived)
      ? entity.allergens_possible_derived
      : [],
    storages: Array.isArray(entity?.storages) ? entity.storages : [],
    apps: Array.isArray(entity?.apps) ? entity.apps : [],
    items: Array.isArray(entity?.items) ? entity.items : [],
    all_storages: Array.isArray(response?.all_storages) ? response.all_storages : [],
    all_items_list: Array.isArray(response?.all_items_list) ? response.all_items_list : [],
    ref_allergens: Array.isArray(response?.allergens) ? response.allergens : [],
    ref_categories: Array.isArray(response?.categories) ? response.categories : [],
    ref_apps: Array.isArray(response?.apps) ? response.apps : [],
  };
}

export function normalizeProductionSavePayload(draft) {
  const payload = {
    name: String(draft?.name || "").trim(),
    shelf_life: draft?.shelf_life ?? "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    ed_izmer_id: draft?.ed_izmer_id ? Number(draft.ed_izmer_id) : null,
    all_w: draft?.all_w ?? "",
    all_w_brutto: draft?.all_w_brutto ?? "",
    all_w_netto: draft?.all_w_netto ?? "",
    time_min: draft?.time_min ?? "",
    time_min_dop: draft?.time_min_dop ?? "",
    structure: draft?.structure ?? "",
    show_in_rev: draft?.show_in_rev ? 1 : 0,
    two_user: draft?.two_user ? 1 : 0,
    is_show: draft?.is_show ? 1 : 0,
    allergens: normalizeRelationIds(draft?.allergens),
    allergens_possible: normalizeRelationIds(draft?.allergens_possible),
    categories: normalizeRelationIds(draft?.categories),
    storages: normalizeRelationIds(draft?.storages),
    apps: normalizeRelationIds(draft?.apps),
    items: normalizeCompositionItems(draft?.items),
  };

  if (draft?.id !== null && draft?.id !== undefined && draft?.id !== "") {
    payload.id = draft.id;
  }

  return payload;
}

export function validateProductionDraft(draft) {
  if (!String(draft?.name || "").trim()) {
    return "Название обязательно";
  }

  if (!String(draft?.date_start || "").trim()) {
    return "Дата начала обязательна";
  }

  if (draft?.date_end && draft?.date_start && String(draft.date_end) < String(draft.date_start)) {
    return "Дата окончания не может быть раньше даты начала";
  }

  return null;
}
