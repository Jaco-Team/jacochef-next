import dayjs from "dayjs";
import { canViewAccess } from "@/components/site_items_new/site_items_access";

export const historySections = [
  {
    id: "main",
    title: "Основные",
    fields: [
      { key: "name", label: "Наименование", access: "name" },
      { key: "short_name", label: "Короткое название", access: "short_name" },
      { key: "link", label: "Ссылка", access: "name" },
      { key: "art", label: "Код 1С", access: "art" },
      { key: "date_start", label: "Действует с", access: "date_start", type: "date" },
      { key: "date_end", label: "Действует по", access: "date_end", type: "date" },
      { key: "category_name", label: "Категория", access: "category_id" },
      { key: "stol", label: "Стол", access: "stol" },
      { key: "is_mark", label: "Маркировка", access: "marc", type: "marking" },
      { key: "mark_code", label: "Код маркировки", access: "marc" },
      { key: "img_app", label: "Изображение", access: "dropzone", type: "image" },
    ],
  },
  {
    id: "nutrition",
    title: "БЖУ",
    fields: [
      { key: "count_part", label: "Кусочков или размер", access: "count_part", type: "number" },
      { key: "weight", label: "Вес", access: "weight", type: "number" },
      { key: "protein", label: "Белки", access: "protein", type: "number" },
      { key: "fat", label: "Жиры", access: "fat", type: "number" },
      {
        key: "carbohydrates",
        label: "Углеводы",
        access: "carbohydrates",
        type: "number",
      },
      { key: "kkal", label: "Калорийность", access: "carbohydrates", type: "number" },
    ],
  },
  {
    id: "description",
    title: "Описание",
    fields: [
      { key: "tmp_desc", label: "Состав", access: "tmp_desc", multiline: true },
      {
        key: "marc_desc_full",
        label: "Полное описание",
        access: "marc_desc_full",
        multiline: true,
      },
      {
        key: "marc_desc",
        label: "Короткое описание",
        access: "marc_desc",
        multiline: true,
      },
    ],
  },
  {
    id: "tags",
    title: "Теги",
    fields: [
      { key: "tags", label: "Теги", access: "tags", type: "tags" },
      { key: "is_new", label: "Новинка", access: "is_new", type: "boolean" },
      { key: "is_update", label: "Обновлено", access: "is_updated", type: "boolean" },
      { key: "is_hit", label: "Хит", access: "is_hit", type: "boolean" },
      { key: "is_spicy", label: "Острый", access: "is_spicy", type: "boolean" },
    ],
  },
  {
    id: "activity",
    title: "Активность",
    fields: [
      { key: "is_price", label: "Установить цену", access: "is_price", type: "boolean" },
      { key: "is_show", label: "Активность", access: "is_show", type: "boolean" },
      { key: "show_site", label: "На сайте и КЦ", access: "show_site", type: "boolean" },
      { key: "show_program", label: "На кассе", access: "show_program", type: "boolean" },
      { key: "sort", label: "Сортировка", access: "sort", type: "number" },
    ],
  },
];

export const compositionSections = [
  { key: "stage_1", title: "Заготовки: 1 этап", access: "stage" },
  { key: "stage_2", title: "Заготовки: 2 этап", access: "stage" },
  { key: "stage_3", title: "Заготовки: 3 этап", access: "stage" },
  { key: "items", title: "Позиции", access: "items", isFinal: true },
];

export const compositionTotals = [
  { key: "time_stage_1", label: "Время на 1 этап", access: "time_stage_1" },
  { key: "time_stage_2", label: "Время на 2 этап", access: "time_stage_2" },
  { key: "time_stage_3", label: "Время на 3 этап", access: "time_stage_3" },
  { key: "all_w_brutto", label: "Итого брутто", access: "items", type: "number" },
  { key: "all_w_netto", label: "Итого нетто", access: "items", type: "number" },
  { key: "all_w", label: "Итого выход", access: "items", type: "number" },
];

const numberKeys = new Set([
  "count_part",
  "weight",
  "protein",
  "fat",
  "carbohydrates",
  "kkal",
  "sort",
  "brutto",
  "pr_1",
  "netto",
  "pr_2",
  "res",
  "max_count",
]);

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed = Number(String(value).replace(",", "."));
  return Number.isNaN(parsed) ? String(value) : String(parsed);
}

function normalizeBoolean(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  return parseInt(value, 10) ? "1" : "0";
}

function resolveTags(tags, tagsAll = []) {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => {
        if (typeof tag === "object") {
          return tag;
        }

        return (
          tagsAll.find((item) => String(item?.id) === String(tag)) || {
            id: tag,
            name: String(tag),
          }
        );
      })
      .filter(Boolean);
  }

  if (typeof tags !== "string" || !tags.trim()) {
    return [];
  }

  return tags
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(
      (id) =>
        tagsAll.find((tag) => String(tag?.id) === String(id)) || {
          id,
          name: id,
        },
    );
}

function getTimestamp(snapshot) {
  return snapshot?.update_item || snapshot?.date_update || snapshot?.date_start || "";
}

function getTimestampValue(snapshot) {
  const value = getTimestamp(snapshot);
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeSnapshot(snapshot, tagsAll = []) {
  return {
    ...snapshot,
    mark_code: snapshot?.mark_code ?? snapshot?.series ?? "",
    category_name: snapshot?.category_name || snapshot?.category_id || "",
    tags: resolveTags(snapshot?.tags, tagsAll),
    stage_1: Array.isArray(snapshot?.stage_1) ? snapshot.stage_1 : [],
    stage_2: Array.isArray(snapshot?.stage_2) ? snapshot.stage_2 : [],
    stage_3: Array.isArray(snapshot?.stage_3) ? snapshot.stage_3 : [],
    items: Array.isArray(snapshot?.items) ? snapshot.items : [],
    history_timestamp: getTimestamp(snapshot),
  };
}

export function normalizeHistorySnapshots(history = [], tagsAll = []) {
  return (Array.isArray(history) ? history : [])
    .filter(Boolean)
    .map((snapshot) => normalizeSnapshot(snapshot, tagsAll))
    .sort((left, right) => {
      const dateDiff = getTimestampValue(right) - getTimestampValue(left);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return parseInt(right?.id || 0, 10) - parseInt(left?.id || 0, 10);
    });
}

export function formatHistoryTimestamp(value) {
  if (!value) {
    return "Дата не указана";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : String(value);
}

export function formatHistoryValue(field, snapshot) {
  const value = snapshot?.[field.key];

  if (field.type === "date") {
    if (!value) {
      return "—";
    }

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD.MM.YYYY") : String(value);
  }

  if (field.type === "boolean") {
    if (value === "" || value === null || value === undefined) {
      return "—";
    }

    return parseInt(value, 10) ? "Да" : "Нет";
  }

  if (field.type === "marking") {
    const labels = {
      0: "Обычный товар",
      1: "Вода",
      2: "Сладкий напиток",
    };

    return labels[parseInt(value, 10)] ?? (value || "—");
  }

  if (field.type === "number") {
    const normalized = normalizeNumber(value);
    return normalized === "" ? "—" : normalized.replace(".", ",");
  }

  if (field.type === "tags") {
    return Array.isArray(value) && value.length
      ? value
          .map((tag) => tag?.name)
          .filter(Boolean)
          .join(", ")
      : "—";
  }

  return value === "" || value === null || value === undefined ? "—" : String(value);
}

function normalizeFieldValue(field, snapshot) {
  const value = snapshot?.[field.key];

  if (field.type === "tags") {
    return (Array.isArray(value) ? value : [])
      .map((tag) => String(tag?.id ?? tag))
      .sort()
      .join(",");
  }

  if (field.type === "boolean") {
    return normalizeBoolean(value);
  }

  if (field.type === "number" || numberKeys.has(field.key)) {
    return normalizeNumber(value);
  }

  if (field.type === "date") {
    if (!value) {
      return "";
    }

    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : String(value);
  }

  return value === null || value === undefined ? "" : String(value).trim();
}

function getCollectionRowKey(row, isFinal) {
  if (isFinal) {
    const itemId = typeof row?.item_id === "object" ? row.item_id?.id : row?.item_id;
    return `item:${itemId ?? row?.id ?? row?.name ?? ""}`;
  }

  const entityId =
    row?.type === "rec" ? (row?.rec_id ?? row?.type_id?.id) : (row?.pf_id ?? row?.type_id?.id);

  return `${row?.type || "pf"}:${entityId ?? row?.id ?? row?.name ?? ""}`;
}

function normalizeCollectionRow(row) {
  const ignoredKeys = new Set(["id", "item_hist_id", "sort"]);
  const normalized = {};

  Object.keys(row || {})
    .filter((key) => !ignoredKeys.has(key))
    .sort()
    .forEach((key) => {
      const value = row?.[key];
      if (typeof value === "object" && value !== null) {
        normalized[key] = value?.id ?? value?.name ?? JSON.stringify(value);
      } else if (numberKeys.has(key)) {
        normalized[key] = normalizeNumber(value);
      } else {
        normalized[key] = value ?? "";
      }
    });

  return JSON.stringify(normalized);
}

export function compareCollection(currentRows = [], previousRows = [], isFinal = false) {
  const previousMap = new Map(previousRows.map((row) => [getCollectionRowKey(row, isFinal), row]));
  const currentKeys = new Set();

  const rows = currentRows.map((row) => {
    const key = getCollectionRowKey(row, isFinal);
    const previous = previousMap.get(key);
    currentKeys.add(key);

    return {
      ...row,
      historyKey: key,
      historyStatus: !previous
        ? "added"
        : normalizeCollectionRow(row) !== normalizeCollectionRow(previous)
          ? "changed"
          : "unchanged",
    };
  });

  const removed = previousRows
    .filter((row) => !currentKeys.has(getCollectionRowKey(row, isFinal)))
    .map((row) => ({
      ...row,
      historyKey: getCollectionRowKey(row, isFinal),
      historyStatus: "removed",
    }));

  return { rows, removed };
}

function getChangedSectionsForPair(current, previous) {
  const changedSections = [];

  if (!current || !previous) {
    return changedSections;
  }

  historySections.forEach((section) => {
    const hasFieldChange = section.fields.some(
      (field) => normalizeFieldValue(field, current) !== normalizeFieldValue(field, previous),
    );

    if (hasFieldChange) {
      changedSections.push({ id: section.id, title: section.title });
    }
  });

  const hasCompositionFieldChange = compositionTotals.some(
    (field) => normalizeFieldValue(field, current) !== normalizeFieldValue(field, previous),
  );

  const hasCompositionCollectionChange = compositionSections.some((section) => {
    const comparison = compareCollection(
      current?.[section.key] || [],
      previous?.[section.key] || [],
      section.isFinal,
    );

    return (
      comparison.removed.length > 0 ||
      comparison.rows.some(
        (row) => row.historyStatus === "added" || row.historyStatus === "changed",
      )
    );
  });

  if (hasCompositionFieldChange || hasCompositionCollectionChange) {
    changedSections.push({ id: "composition", title: "Состав" });
  }

  return changedSections;
}

export function getVersionChangedSections(versions, index) {
  const current = versions[index] || null;
  const previous = versions[index + 1] || null;
  return getChangedSectionsForPair(current, previous);
}

export function buildHistoryComparison(versions, selectedIndex) {
  const current = versions[selectedIndex] || null;
  const previous = versions[selectedIndex + 1] || null;
  const changedFields = new Set();

  if (current && previous) {
    [...historySections.flatMap((section) => section.fields), ...compositionTotals].forEach(
      (field) => {
        if (normalizeFieldValue(field, current) !== normalizeFieldValue(field, previous)) {
          changedFields.add(field.key);
        }
      },
    );
  }

  const collections = {};
  compositionSections.forEach((section) => {
    collections[section.key] = compareCollection(
      current?.[section.key] || [],
      previous?.[section.key] || [],
      section.isFinal,
    );
  });

  return {
    current,
    previous,
    changedFields,
    changedSections: getChangedSectionsForPair(current, previous),
    collections,
  };
}

export function canViewHistoryField(access, field) {
  if (!field?.access) {
    return true;
  }

  return canViewAccess(access, field.access, false);
}

export function getCompositionRowName(row) {
  return row?.name || row?.item_id?.name || row?.type_id?.name || "Без названия";
}

export function formatCompositionNumber(value) {
  const normalized = normalizeNumber(value);
  return normalized === "" ? "—" : Number(normalized).toFixed(3).replace(".", ",");
}
