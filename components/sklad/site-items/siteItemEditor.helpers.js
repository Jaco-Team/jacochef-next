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

export function createEmptySiteItemRelations() {
  return {
    composition_source: {
      pf: [],
      recipes: [],
    },
    composition_derived: {
      pf_total: [],
    },
    item_items: {
      this_items: [],
      all_items: [],
    },
    items_stage: {
      stage_1: [],
      stage_2: [],
      stage_3: [],
      all: [],
    },
  };
}

export function formatDecimalString(value, fallback = "0,000") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const normalized = String(value).replace(".", ",").trim();
  return normalized || fallback;
}

export function formatIntegerString(value, fallback = "0") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized || fallback;
}

export function parseDecimalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundTo(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function recalculateCompositionRow(row) {
  const brutto = parseDecimalNumber(row?.brutto);
  const pr1 = parseDecimalNumber(row?.pr_1);
  const pr2 = parseDecimalNumber(row?.pr_2);
  const netto = roundTo((brutto * (100 - pr1)) / 100, 3);
  const res = roundTo((netto * (100 - pr2)) / 100, 3);

  return {
    ...row,
    netto: formatDecimalString(netto),
    res: formatDecimalString(res),
  };
}

export function buildStageOptionLookup(itemsStage) {
  const list = Array.isArray(itemsStage?.all) ? itemsStage.all : [];
  const lookup = new Map();

  list.forEach((item) => {
    const key = String(item?.un_id ?? "");

    if (key) {
      lookup.set(key, item);
    }
  });

  return lookup;
}

export function normalizeStageRow(row, stageKey, lookup) {
  const inferredType =
    row?.type === "rec" || row?.type === "recipe"
      ? "rec"
      : row?.type === "pf" || row?.type === "semi_finished"
        ? "pf"
        : row?.rec_id
          ? "rec"
          : "pf";
  const entityId = row?.rec_id ?? row?.pf_id ?? row?.id ?? "";
  const selectedId = row?.selected_id ?? row?.un_id ?? `${entityId}-${inferredType}`;
  const matched = lookup.get(String(selectedId)) ?? null;

  return {
    selected_id: matched?.un_id ?? String(selectedId),
    type: matched?.type ?? inferredType,
    rec_id: inferredType === "rec" ? (row?.rec_id ?? entityId) : "",
    pf_id: inferredType === "pf" ? (row?.pf_id ?? entityId) : "",
    name: row?.name ?? matched?.name ?? "-",
    ei_name: row?.ei_name ?? matched?.ei_name ?? "-",
    brutto: formatDecimalString(row?.brutto),
    pr_1: formatIntegerString(row?.pr_1),
    netto: formatDecimalString(row?.netto),
    pr_2: formatIntegerString(row?.pr_2),
    res: formatDecimalString(row?.res),
    stage: stageKey,
  };
}

export function normalizeLinkedItemRow(row) {
  return {
    item_id: row?.item_id ? String(row.item_id) : "",
    name: row?.name ?? "-",
    brutto: formatDecimalString(row?.brutto),
    pr_1: formatIntegerString(row?.pr_1),
    netto: formatDecimalString(row?.netto),
    pr_2: formatIntegerString(row?.pr_2),
    res: formatDecimalString(row?.res),
  };
}

export function buildInitialDraft(draft) {
  const emptyRelations = createEmptySiteItemRelations();
  const itemsStage = draft?.items_stage ?? emptyRelations.items_stage;
  const stageLookup = buildStageOptionLookup(itemsStage);

  return {
    id: draft?.id ?? null,
    name: draft?.name ?? "",
    short_name: draft?.short_name ?? "",
    category_id: draft?.category_id ? String(draft.category_id) : "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    art: draft?.art ?? "",
    stol: draft?.stol ?? "",
    count_part: draft?.count_part ?? "",
    weight: draft?.weight ?? "",
    protein: draft?.protein ?? "",
    fat: draft?.fat ?? "",
    carbohydrates: draft?.carbohydrates ?? "",
    kkal: draft?.kkal ?? "",
    kkal_preview: draft?.kkal_preview ?? "",
    image: draft?.image ?? null,
    tmp_desc: draft?.tmp_desc ?? "",
    marc_desc: draft?.marc_desc ?? "",
    marc_desc_full: draft?.marc_desc_full ?? "",
    is_mark: String(draft?.marking?.is_mark ?? 0),
    mark_code: draft?.marking?.mark_code ?? "",
    series: draft?.marking?.series ?? "",
    is_akchis: Number(draft?.marking?.is_akchis ?? 0) === 1,
    tags: Array.isArray(draft?.tags) ? draft.tags : [],
    show_site: Number(draft?.show_site ?? 0) === 1,
    show_program: Number(draft?.show_program ?? 0) === 1,
    is_show: Number(draft?.is_show ?? 0) === 1,
    is_hit: Number(draft?.is_hit ?? 0) === 1,
    is_new: Number(draft?.is_new ?? 0) === 1,
    time_stage_1: draft?.time_stage_1 ?? "",
    time_stage_2: draft?.time_stage_2 ?? "",
    time_stage_3: draft?.time_stage_3 ?? "",
    composition_source: draft?.composition_source ?? emptyRelations.composition_source,
    composition_derived: draft?.composition_derived ?? emptyRelations.composition_derived,
    items_stage: {
      ...(draft?.items_stage ?? emptyRelations.items_stage),
      stage_1: Array.isArray(itemsStage?.stage_1)
        ? itemsStage.stage_1.map((item) =>
            recalculateCompositionRow(normalizeStageRow(item, "stage_1", stageLookup)),
          )
        : [],
      stage_2: Array.isArray(itemsStage?.stage_2)
        ? itemsStage.stage_2.map((item) =>
            recalculateCompositionRow(normalizeStageRow(item, "stage_2", stageLookup)),
          )
        : [],
      stage_3: Array.isArray(itemsStage?.stage_3)
        ? itemsStage.stage_3.map((item) =>
            recalculateCompositionRow(normalizeStageRow(item, "stage_3", stageLookup)),
          )
        : [],
    },
    item_items: {
      ...(draft?.item_items ?? emptyRelations.item_items),
      this_items: Array.isArray(draft?.item_items?.this_items)
        ? draft.item_items.this_items.map((item) =>
            recalculateCompositionRow(normalizeLinkedItemRow(item)),
          )
        : [],
    },
    history: draft?.history ?? { rows: [], capabilities: {}, meta: {} },
    image_history: draft?.image_history ?? { rows: [], capabilities: {}, current: {} },
    img_app: draft?.img_app ?? draft?.image?.current_fields?.img_app ?? "",
  };
}

export function normalizeTagList(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const seen = new Set();

  return tags.filter((tag) => {
    const key = String(tag?.id ?? "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function parseNutritionNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).replace(",", ".").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPreviewKkal(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function getLiveKkalPreview(form) {
  const protein = parseNutritionNumber(form?.protein);
  const fat = parseNutritionNumber(form?.fat);
  const carbohydrates = parseNutritionNumber(form?.carbohydrates);

  if (protein === null && fat === null && carbohydrates === null) {
    return form?.kkal_preview ?? "";
  }

  const safeProtein = protein ?? 0;
  const safeFat = fat ?? 0;
  const safeCarbohydrates = carbohydrates ?? 0;

  return formatPreviewKkal(safeProtein * 4 + safeFat * 9 + safeCarbohydrates * 4);
}
