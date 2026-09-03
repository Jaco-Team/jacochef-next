import dayjs from "dayjs";

import { canViewAccess } from "./skladSiteItemsAccess";

export const historySections = [
  {
    id: "main",
    title: "Основные",
    description: "Наименование, категория, сроки и изображение",
    fields: [
      { key: "name", label: "Наименование", access: "name" },
      { key: "short_name", label: "Короткое название", access: "short_name" },
      { key: "art", label: "Код 1С", access: "art" },
      { key: "date_start", label: "Действует с", access: "date_start", type: "date" },
      { key: "date_end", label: "Действует по", access: "date_end", type: "date" },
      { key: "category_name", label: "Старая категория", access: "category_id" },
      { key: "category_name2", label: "Новая категория", access: "category_id" },
      { key: "stol", label: "Стол", access: "stol" },
      { key: "is_mark", label: "Маркировка", access: "marc", type: "marking" },
      { key: "mark_code", label: "Код маркировки", access: "marc" },
      { key: "img_app", label: "Изображение", access: "dropzone", type: "image" },
    ],
  },
  {
    id: "nutrition",
    title: "БЖУ",
    description: "Вес, порция и пищевая ценность",
    fields: [
      { key: "count_part", label: "Кусочков или размер", access: "portion", type: "number" },
      { key: "weight", label: "Вес", access: "portion", type: "number" },
      { key: "protein", label: "Белки", access: "bju", type: "number" },
      { key: "fat", label: "Жиры", access: "bju", type: "number" },
      { key: "carbohydrates", label: "Углеводы", access: "bju", type: "number" },
      { key: "kkal", label: "Калорийность", access: "bju", type: "number" },
    ],
  },
  {
    id: "description",
    title: "Описание",
    description: "Тексты карточки и списка",
    fields: [
      { key: "tmp_desc", label: "Состав", access: "description", multiline: true },
      {
        key: "marc_desc_full",
        label: "Полное описание",
        access: "description",
        multiline: true,
      },
      {
        key: "marc_desc",
        label: "Короткое описание",
        access: "description",
        multiline: true,
      },
    ],
  },
  {
    id: "tags",
    title: "Теги",
    description: "Теги и промо-маркеры",
    fields: [
      { key: "tags", label: "Теги", access: "tags", type: "tags" },
      { key: "is_new", label: "Новинка", access: "tags", type: "boolean" },
      { key: "is_updated", label: "Обновлено", access: "tags", type: "boolean" },
      { key: "is_hit", label: "Хит", access: "tags", type: "boolean" },
      { key: "is_spicy", label: "Острый", access: "tags", type: "boolean" },
    ],
  },
  {
    id: "activity",
    title: "Активность",
    description: "Публикация и продажи",
    fields: [
      { key: "is_price", label: "Установить цену", access: "activity", type: "boolean" },
      { key: "is_show", label: "Активность", access: "activity", type: "boolean" },
      { key: "show_site", label: "На сайте и КЦ", access: "activity", type: "boolean" },
      { key: "show_program", label: "На кассе", access: "activity", type: "boolean" },
      { key: "sort", label: "Сортировка", access: "sort", type: "number" },
    ],
  },
];

export const compositionSections = [
  { key: "stage_1", title: "Полуфабрикаты: 1 этап", access: "composition" },
  { key: "stage_2", title: "Полуфабрикаты: 2 этап", access: "composition" },
  { key: "stage_3", title: "Полуфабрикаты: 3 этап", access: "composition" },
  { key: "items", title: "Позиции", access: "composition", isFinal: true },
];

export const compositionTotals = [
  { key: "time_stage_1", label: "Время на 1 этап", access: "composition" },
  { key: "time_stage_2", label: "Время на 2 этап", access: "composition" },
  { key: "time_stage_3", label: "Время на 3 этап", access: "composition" },
  { key: "all_w_brutto", label: "Итого брутто", access: "composition", type: "number" },
  { key: "all_w_netto", label: "Итого нетто", access: "composition", type: "number" },
  { key: "all_w", label: "Итого выход", access: "composition", type: "number" },
];

function numberValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(String(value).replace(",", "."));
  return Number.isNaN(parsed) ? String(value) : String(parsed);
}

function nameOf(value) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  return value?.name || value?.title || value?.label || String(value?.id ?? "");
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags !== "string" || !tags.trim()) return [];
  return tags
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => ({ id, name: id }));
}

export function normalizeHistorySnapshot(snapshot = {}) {
  const stageSource = snapshot?.items_stage || snapshot?.composition_source?.items_stage || {};
  const itemSource = snapshot?.item_items || snapshot?.composition_source?.item_items || {};

  return {
    ...snapshot,
    category_name:
      snapshot?.category_name || nameOf(snapshot?.category) || snapshot?.category_id || "",
    category_name2: snapshot?.category_name2 || snapshot?.category_id2 || "",
    mark_code: snapshot?.mark_code ?? snapshot?.series ?? "",
    tags: normalizeTags(snapshot?.tags),
    stage_1: snapshot?.stage_1 || stageSource?.stage_1 || [],
    stage_2: snapshot?.stage_2 || stageSource?.stage_2 || [],
    stage_3: snapshot?.stage_3 || stageSource?.stage_3 || [],
    items: snapshot?.items || itemSource?.this_items || [],
  };
}

export function formatHistoryTimestamp(value) {
  if (!value) return "Дата не указана";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : String(value);
}

export function formatHistoryDate(value) {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : String(value);
}

export function formatHistoryValue(field, snapshot) {
  const value = snapshot?.[field.key];

  if (field.type === "date") return formatHistoryDate(value);
  if (field.type === "boolean") {
    if (value === "" || value === null || value === undefined) return "—";
    return Number(value) === 1 || value === true ? "Да" : "Нет";
  }
  if (field.type === "marking") {
    return { 0: "Обычный товар", 1: "Вода", 2: "Сладкий напиток" }[Number(value)] || "—";
  }
  if (field.type === "number") {
    const normalized = numberValue(value);
    return normalized === "" ? "—" : normalized.replace(".", ",");
  }
  if (field.type === "tags") {
    const result = normalizeTags(value).map(nameOf).filter(Boolean).join(", ");
    return result || "—";
  }

  return value === "" || value === null || value === undefined ? "—" : nameOf(value);
}

function normalizedFieldValue(field, snapshot) {
  if (field.type === "number") return numberValue(snapshot?.[field.key]);
  if (field.type === "date") {
    const parsed = dayjs(snapshot?.[field.key]);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
  }
  if (field.type === "boolean") return Number(snapshot?.[field.key] || 0) ? "1" : "0";
  if (field.type === "tags") {
    return normalizeTags(snapshot?.[field.key])
      .map((item) => String(item?.id ?? item))
      .sort()
      .join(",");
  }
  return nameOf(snapshot?.[field.key]).trim();
}

function collectionKey(row, isFinal) {
  if (isFinal) {
    const id = typeof row?.item_id === "object" ? row.item_id?.id : row?.item_id;
    return `item:${id ?? row?.id ?? nameOf(row)}`;
  }
  const id = row?.type === "rec" ? row?.rec_id || row?.type_id?.id : row?.pf_id || row?.type_id?.id;
  return `${row?.type || "pf"}:${id ?? row?.id ?? nameOf(row)}:${row?.stage || ""}:${row?.sort || ""}`;
}

function normalizedCollectionRow(row) {
  const copy = { ...row };
  delete copy.id;
  delete copy.item_hist_id;
  return JSON.stringify(copy, (_, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value?.id ?? value?.name ?? value;
    }
    return value;
  });
}

export function compareCollection(currentRows = [], previousRows = [], isFinal = false) {
  const previous = new Map(previousRows.map((row) => [collectionKey(row, isFinal), row]));
  const currentKeys = new Set();
  const rows = currentRows.map((row) => {
    const key = collectionKey(row, isFinal);
    const before = previous.get(key);
    currentKeys.add(key);
    return {
      ...row,
      historyKey: key,
      historyStatus: !before
        ? "added"
        : normalizedCollectionRow(row) === normalizedCollectionRow(before)
          ? "unchanged"
          : "changed",
    };
  });
  const removed = previousRows
    .filter((row) => !currentKeys.has(collectionKey(row, isFinal)))
    .map((row) => ({ ...row, historyKey: collectionKey(row, isFinal), historyStatus: "removed" }));
  return { rows, removed };
}

export function buildHistoryComparison(currentValue, previousValue) {
  const current = currentValue ? normalizeHistorySnapshot(currentValue) : null;
  const previous = previousValue ? normalizeHistorySnapshot(previousValue) : null;
  const changedFields = new Set();

  if (current && previous) {
    [...historySections.flatMap((section) => section.fields), ...compositionTotals].forEach(
      (field) => {
        if (normalizedFieldValue(field, current) !== normalizedFieldValue(field, previous)) {
          changedFields.add(field.key);
        }
      },
    );
  }

  const collections = Object.fromEntries(
    compositionSections.map((section) => [
      section.key,
      compareCollection(
        current?.[section.key] || [],
        previous?.[section.key] || [],
        section.isFinal,
      ),
    ]),
  );

  return { current, previous, changedFields, collections };
}

export function canViewHistoryField(access, field) {
  return !field?.access || canViewAccess(access, field.access, false);
}

export function getCompositionRowName(row) {
  return row?.name || nameOf(row?.item_id) || nameOf(row?.type_id) || "Без названия";
}

export function formatCompositionNumber(value) {
  const normalized = numberValue(value);
  return normalized === "" ? "—" : Number(normalized).toFixed(3).replace(".", ",");
}
