"use client";

import { formatDateRangeRU } from "../formatDateRangeRU";

export function formatDateRange(row) {
  return formatDateRangeRU(row?.date_start, row?.date_end);
}

export function formatBju(row) {
  const parts = [
    row?.protein !== undefined && row?.protein !== null && row?.protein !== ""
      ? String(row.protein)
      : null,
    row?.fat !== undefined && row?.fat !== null && row?.fat !== "" ? String(row.fat) : null,
    row?.carbohydrates !== undefined && row?.carbohydrates !== null && row?.carbohydrates !== ""
      ? String(row.carbohydrates)
      : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "-";
}

export function getCategoryName(row, categories) {
  const categoryId = row?.category_id ?? null;
  const directName = row?.category_name || "";

  if (directName) {
    return directName;
  }

  if (categoryId === null || categoryId === undefined || categoryId === "") {
    return "-";
  }

  const matched = categories.find((item) => String(item?.id) === String(categoryId));
  return matched?.name || String(categoryId);
}

export function getTagNames(row) {
  if (Array.isArray(row?.tags) && row.tags.length) {
    return row.tags.map((item) => item?.name).filter(Boolean);
  }

  return [];
}

function dedupeChips(chips) {
  const seen = new Set();

  return chips.filter((chip) => {
    const key = `${chip?.label || ""}-${chip?.color || ""}`;

    if (!chip?.label || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function getPrimaryStatusChip(row) {
  if (Number(row?.is_archived) === 1) {
    return { key: "archived", label: "Архив", color: "default" };
  }

  if (Number(row?.is_show ?? 0) === 1) {
    return { key: "active", label: "Активен", color: "success" };
  }

  return { key: "hidden", label: "Скрыт", color: "default" };
}

export function getSecondaryStatusChips(row) {
  return dedupeChips(
    [
      Number(row?.show_site) === 1 ? { key: "show_site", label: "Сайт", color: "primary" } : null,
      Number(row?.show_program) === 1
        ? { key: "show_program", label: "Касса", color: "secondary" }
        : null,
      Number(row?.is_hit) === 1 ? { key: "hit", label: "Хит", color: "warning" } : null,
      Number(row?.is_new) === 1 ? { key: "new", label: "Новинка", color: "info" } : null,
    ].filter(Boolean),
  );
}

export function getDeleteTooltip(row, isEditable, canDeleteAction) {
  if (!isEditable || !canDeleteAction) {
    return "Недостаточно прав для удаления";
  }

  if (row?.can_delete === false) {
    return "Удаление заблокировано связями";
  }

  return "Удалить";
}

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
    composition_source: {
      pf: [],
      recipes: [],
    },
    composition_derived: {
      pf_total: [],
    },
  };
}

export function normalizeSiteItemDraft(response, fallbackCategories = []) {
  const item = response?.item ?? {};
  const emptyRelations = createEmptySiteItemRelations();

  return {
    ...item,
    category_name:
      item?.category_name ||
      fallbackCategories.find((category) => String(category?.id) === String(item?.category_id))
        ?.name ||
      "",
    tags: Array.isArray(item?.tags) ? item.tags : [],
    composition_source: response?.composition_source ?? emptyRelations.composition_source,
    composition_derived: response?.composition_derived ?? emptyRelations.composition_derived,
    allergens_derived: Array.isArray(response?.allergens_derived) ? response.allergens_derived : [],
    possible_allergens_derived: Array.isArray(response?.possible_allergens_derived)
      ? response.possible_allergens_derived
      : [],
    image: response?.image ?? null,
    marking: response?.marking ?? {},
    can_delete: typeof response?.can_delete === "boolean" ? response.can_delete : null,
    delete_usage: response?.delete_usage ?? null,
    item_items: response?.item_items ?? emptyRelations.item_items,
    items_stage: response?.items_stage ?? emptyRelations.items_stage,
    history: response?.history ?? { rows: [], capabilities: {}, meta: {} },
    image_history: response?.image_history ?? { rows: [], capabilities: {}, current: {} },
  };
}

export function normalizeSiteItemSavePayload(draft) {
  const marking = draft?.marking || {};
  const stageRows = draft?.items_stage || {};
  const toStagePayload = (rows, type) =>
    (Array.isArray(rows) ? rows : [])
      .filter((item) => String(item?.type ?? "") === type)
      .map((item) => ({
        ...(type === "pf"
          ? {
              pf_id: item?.pf_id
                ? Number(item.pf_id)
                : Number(String(item?.selected_id || "").split("-")[0] || 0),
            }
          : {
              rec_id: item?.rec_id
                ? Number(item.rec_id)
                : Number(String(item?.selected_id || "").split("-")[0] || 0),
            }),
        brutto: item?.brutto ?? "",
        pr_1: item?.pr_1 ?? "",
        netto: item?.netto ?? "",
        pr_2: item?.pr_2 ?? "",
        res: item?.res ?? "",
      }))
      .filter((item) => Number(item?.pf_id ?? item?.rec_id ?? 0) > 0);

  return {
    id: draft?.id ?? null,
    name: String(draft?.name || "").trim(),
    short_name: String(draft?.short_name || "").trim(),
    category_id: draft?.category_id ? Number(draft.category_id) : null,
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
    tmp_desc: draft?.tmp_desc ?? "",
    marc_desc: draft?.marc_desc ?? "",
    marc_desc_full: draft?.marc_desc_full ?? "",
    tags: Array.isArray(draft?.tags) ? draft.tags : [],
    image: draft?.image ?? null,
    marking: {
      ...marking,
      is_mark: draft?.is_mark ? Number(draft.is_mark) : 0,
      mark_code: draft?.mark_code ?? "",
      series: draft?.series ?? "",
      is_akchis: draft?.is_akchis ? 1 : 0,
    },
    show_site: draft?.show_site ? 1 : 0,
    show_program: draft?.show_program ? 1 : 0,
    is_show: draft?.is_show ? 1 : 0,
    is_hit: draft?.is_hit ? 1 : 0,
    is_new: draft?.is_new ? 1 : 0,
    time_stage_1: draft?.time_stage_1 ?? "",
    time_stage_2: draft?.time_stage_2 ?? "",
    time_stage_3: draft?.time_stage_3 ?? "",
    pf_stage_1: toStagePayload(stageRows?.stage_1, "pf"),
    pf_stage_2: toStagePayload(stageRows?.stage_2, "pf"),
    pf_stage_3: toStagePayload(stageRows?.stage_3, "pf"),
    rec_stage_1: toStagePayload(stageRows?.stage_1, "rec"),
    rec_stage_2: toStagePayload(stageRows?.stage_2, "rec"),
    rec_stage_3: toStagePayload(stageRows?.stage_3, "rec"),
    composition_source:
      draft?.composition_source || createEmptySiteItemRelations().composition_source,
    composition_derived:
      draft?.composition_derived || createEmptySiteItemRelations().composition_derived,
    item_items: {
      ...(draft?.item_items || createEmptySiteItemRelations().item_items),
      this_items: Array.isArray(draft?.item_items?.this_items)
        ? draft.item_items.this_items
            .map((item) => ({
              ...item,
              item_id: item?.item_id ? Number(item.item_id) : null,
            }))
            .filter((item) => Number(item?.item_id) > 0)
        : [],
    },
    items_stage: draft?.items_stage || createEmptySiteItemRelations().items_stage,
  };
}

export function validateSiteItemDraft(draft) {
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
