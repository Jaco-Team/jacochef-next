"use client";

export function dedupeSelectOptions(options) {
  const seen = new Set();

  return options.filter((option) => {
    const key = String(option?.id ?? "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function buildInitialDraft(draft) {
  return {
    id: draft?.id ?? null,
    name: draft?.name ?? "",
    shelf_life: draft?.shelf_life ?? "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    ed_izmer_id: draft?.ed_izmer_id ? String(draft.ed_izmer_id) : "",
    all_w: draft?.all_w ?? "",
    all_w_brutto: draft?.all_w_brutto ?? "",
    all_w_netto: draft?.all_w_netto ?? "",
    time_min: draft?.time_min ?? "",
    time_min_dop: draft?.time_min_dop ?? "",
    structure: draft?.structure ?? "",
    show_in_rev: Number(draft?.show_in_rev ?? 0) === 1,
    two_user: Number(draft?.two_user ?? 0) === 1,
    is_show: Number(draft?.is_show ?? 1) === 1,
    categories: Array.isArray(draft?.categories) ? draft.categories : [],
    allergens: Array.isArray(draft?.allergens) ? draft.allergens : [],
    allergens_possible: Array.isArray(draft?.allergens_possible) ? draft.allergens_possible : [],
    allergens_derived: Array.isArray(draft?.allergens_derived) ? draft.allergens_derived : [],
    allergens_possible_derived: Array.isArray(draft?.allergens_possible_derived)
      ? draft.allergens_possible_derived
      : [],
    storages: Array.isArray(draft?.storages) ? draft.storages : [],
    apps: Array.isArray(draft?.apps) ? draft.apps : [],
    items: Array.isArray(draft?.items) ? draft.items : [],
    history: draft?.history ?? { rows: [], capabilities: {}, meta: {} },
  };
}

export function normalizeOptionName(item) {
  return (
    item?.name ??
    item?.title ??
    item?.label ??
    item?.app_name ??
    item?.storage_name ??
    item?.allergen_name ??
    String(item?.id ?? "")
  );
}

export function normalizeOptions(options, emptyLabel = "") {
  const list = (options || []).map((item) => ({
    ...item,
    id: String(item?.id ?? ""),
    name: normalizeOptionName(item),
  }));

  return dedupeSelectOptions(
    emptyLabel ? [{ id: "", name: emptyLabel }].concat(list.filter((item) => item.id)) : list,
  );
}

export function getTypedCompositionOptionKey(item) {
  const typedKey = item?.id_name ?? item?.un_id;

  if (typedKey) {
    return String(typedKey);
  }

  if (item?.id === null || item?.id === undefined || item?.id === "") {
    return "";
  }

  return `${item.id}-${item?.type_rec ?? item?.type ?? "item"}`;
}

export function normalizeItemOptions(options) {
  const list = (options || []).map((item) => ({
    ...item,
    id: getTypedCompositionOptionKey(item),
    source_id: item?.id ?? "",
    type_rec: item?.type_rec ?? item?.type ?? "item",
    ei_name: item?.ei_name ?? item?.unit_name ?? item?.ed_izmer_name ?? "",
    name: normalizeOptionName(item),
  }));

  return dedupeSelectOptions(list.filter((item) => item.id));
}

export function normalizeSelectedOptions(value, options) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const match = options.find((option) => String(option?.id ?? "") === String(item?.id ?? item));

    return match || { id: item?.id ?? item, name: normalizeOptionName(item) };
  });
}

export function formatTagNames(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => normalizeOptionName(item)).filter(Boolean);
}

export function getPrimitiveId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return value?.id !== null && value?.id !== undefined ? String(value.id) : "";
  }

  const valueType = typeof value;
  return valueType === "string" || valueType === "number" ? String(value) : "";
}

export function getCompositionRowKey(item, index) {
  return [
    item?.item_option_key ||
      item?.id_name ||
      item?.un_id ||
      getPrimitiveId(item?.item_id) ||
      getPrimitiveId(item?.nomenclature_id) ||
      getPrimitiveId(item?.id) ||
      "item",
    item?.type_rec ?? "type",
    index,
  ].join("-");
}

export function getCompositionItemId(item) {
  return (
    item?.item_option_key ||
    item?.id_name ||
    item?.un_id ||
    getPrimitiveId(item?.item_id) ||
    getPrimitiveId(item?.nomenclature_id) ||
    getPrimitiveId(item?.id)
  );
}

export function getCompositionItemName(item) {
  return (
    item?.name ||
    item?.item_name ||
    item?.nomenclature_name ||
    item?.item?.name ||
    item?.item?.item_name ||
    item?.item_id?.name ||
    "-"
  );
}

export function getCompositionUnitName(item) {
  return item?.unit_name || item?.ei_name || item?.ed_izmer_name || item?.unit?.name || "-";
}
