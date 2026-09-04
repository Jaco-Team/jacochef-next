const COMPARE_FIELDS = [
  "effective_date",
  "promo_in_count",
  "promo_action",
  "promo_type_sale",
  "count_promo",
  "promo_type",
  "promo_conditions",
  "promo_summ",
  "promo_summ_to",
  "promo_type_order",
  "promo_where",
  "promo_city",
  "promo_point",
  "about_promo_text",
  "condition_promo_text",
  "time_start",
  "time_end",
  "promo_items",
  "promo_cat",
  "promo_items_add",
  "promo_items_sale",
  "promo_conditions_items",
];

const JSON_FIELDS = new Set([
  "promo_items",
  "promo_cat",
  "promo_items_add",
  "promo_items_sale",
  "promo_conditions_items",
]);

const FIELD_LABELS = {
  effective_date: "Дата вступления",
  promo_in_count: "Кол-во активаций",
  promo_action: "Что даёт",
  promo_type_sale: "Тип скидки/выгоды",
  count_promo: "Размер",
  promo_type: "Единица",
  promo_conditions: "Условие",
  promo_summ: "Сумма от",
  promo_summ_to: "Сумма до",
  promo_type_order: "Тип заказа",
  promo_where: "Где",
  promo_city: "Город",
  promo_point: "Точка",
  about_promo_text: "Текст выгоды",
  condition_promo_text: "Текст условий",
  time_start: "Время от",
  time_end: "Время до",
  promo_items: "Товары скидки",
  promo_cat: "Категории скидки",
  promo_items_add: "Добавляемые позиции",
  promo_items_sale: "Позиции по цене",
  promo_conditions_items: "Товары условия",
};

const PROMO_TYPE_SALE_LABELS = {
  1: "На товары",
  2: "На категории",
  3: "На всё меню кроме допов",
  7: "На всё меню",
};

const PROMO_TYPE_LABELS = {
  1: "рубли",
  2: "проценты",
};

const PROMO_CONDITIONS_LABELS = {
  1: "товары",
  2: "сумма",
};

const PROMO_TYPE_ORDER_LABELS = {
  1: "Все",
  3: "Доставка",
  2: "Самовывоз",
  4: "Зал",
};

const PROMO_WHERE_LABELS = {
  1: "В городе",
  2: "В кафе",
};

const SOURCE_LABELS = {
  immediate: "Сразу",
  backfill: "Миграция",
  scheduled: "Запланировано",
  applied: "Применено",
  scheduler: "Планировщик",
};

export function parseHistoryJson(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === "") {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return [];
}

function parseChangedAtTs(value) {
  if (!value) {
    return 0;
  }

  const raw = String(value);
  const date = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function normalizeConfigHistoryList(list) {
  const rows = Array.isArray(list) ? list.slice() : [];

  rows.sort((a, b) => {
    const byTime = parseChangedAtTs(b?.changed_at) - parseChangedAtTs(a?.changed_at);
    if (byTime !== 0) {
      return byTime;
    }

    return (parseInt(b?.id, 10) || 0) - (parseInt(a?.id, 10) || 0);
  });

  return rows;
}

export function formatConfigHistoryDateTime(value) {
  if (!value) {
    return "—";
  }

  const raw = String(value);
  const date = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  if (raw.length <= 10) {
    return `${dd}.${mm}.${yyyy}`;
  }

  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

export function formatConfigHistoryDate(value) {
  if (!value) {
    return "—";
  }

  const raw = String(value);
  const date = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}

export function getConfigHistorySourceLabel(source) {
  if (source == null || source === "") {
    return "—";
  }

  const key = String(source).trim();
  const lower = key.toLowerCase();

  return SOURCE_LABELS[lower] || key;
}

function findCatalogName(catalog, id, emptyLabel = "—") {
  if (id == null || String(id).trim() === "") {
    return emptyLabel;
  }

  const found = (catalog || []).find((item) => parseInt(item.id, 10) === parseInt(id, 10));
  return found?.name || `#${id}`;
}

function mapLabel(map, value, emptyLabel = "—") {
  if (value == null || value === "") {
    return emptyLabel;
  }

  const key = parseInt(value, 10);
  if (Number.isNaN(key)) {
    return String(value);
  }

  return map[key] || String(value);
}

function formatTimeValue(value) {
  if (value == null || String(value).trim() === "") {
    return "—";
  }

  return String(value);
}

function getItemDisplayName(entry) {
  if (entry == null) {
    return "";
  }

  if (typeof entry !== "object") {
    return "";
  }

  return String(entry.name || "").trim();
}

function formatJsonArraySummary(value) {
  const arr = parseHistoryJson(value);

  if (!arr.length) {
    return "—";
  }

  const names = arr.map((entry) => getItemDisplayName(entry)).filter(Boolean);

  if (names.length) {
    return names.join(", ");
  }

  return `${arr.length} позиций`;
}

function stableJsonCompareValue(value) {
  const arr = parseHistoryJson(value);

  const normalized = arr
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const id = entry.item_id ?? entry.id ?? "";
        const name = entry.name ?? "";
        const count = entry.count ?? "";
        const price = entry.price ?? "";
        return [String(id), String(name), String(count), String(price)].join("|");
      }

      return String(entry);
    })
    .sort();

  return JSON.stringify(normalized);
}

function formatFieldDisplay(key, value, catalogs = {}) {
  switch (key) {
    case "effective_date":
      return formatConfigHistoryDate(value);
    case "promo_action":
      return findCatalogName(catalogs.promo_action_list, value);
    case "promo_type_sale":
      return mapLabel(PROMO_TYPE_SALE_LABELS, value);
    case "promo_type":
      return mapLabel(PROMO_TYPE_LABELS, value);
    case "promo_conditions": {
      if (value == null || value === "" || parseInt(value, 10) === 0) {
        return "Без условий";
      }
      return mapLabel(PROMO_CONDITIONS_LABELS, value);
    }
    case "promo_type_order":
      return mapLabel(PROMO_TYPE_ORDER_LABELS, value);
    case "promo_where":
      return mapLabel(PROMO_WHERE_LABELS, value);
    case "promo_city":
      if (value == null || parseInt(value, 10) === 0) {
        return "Все";
      }
      return findCatalogName(catalogs.cities, value);
    case "promo_point":
      if (value == null || parseInt(value, 10) === 0) {
        return "—";
      }
      return findCatalogName(catalogs.points, value);
    case "time_start":
    case "time_end":
      return formatTimeValue(value);
    case "promo_items":
    case "promo_cat":
    case "promo_items_add":
    case "promo_items_sale":
    case "promo_conditions_items":
      return formatJsonArraySummary(value);
    default:
      if (value == null || value === "") {
        return "—";
      }
      return String(value);
  }
}

function compareValue(key, value) {
  if (JSON_FIELDS.has(key)) {
    return stableJsonCompareValue(value);
  }

  if (key === "time_start" || key === "time_end") {
    return formatTimeValue(value);
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

export function getConfigHistoryFieldDiffs(current, previous, catalogs = {}) {
  if (!previous) {
    return [];
  }

  const diffs = [];

  COMPARE_FIELDS.forEach((key) => {
    const fromRaw = previous[key];
    const toRaw = current ? current[key] : undefined;

    if (compareValue(key, fromRaw) === compareValue(key, toRaw)) {
      return;
    }

    diffs.push({
      key,
      label: FIELD_LABELS[key] || key,
      from: formatFieldDisplay(key, fromRaw, catalogs),
      to: formatFieldDisplay(key, toRaw, catalogs),
    });
  });

  return diffs;
}

export function getConfigHistoryFirstVersionSummary(entry, catalogs = {}) {
  if (!entry) {
    return [];
  }

  const timeStart = formatTimeValue(entry.time_start);
  const timeEnd = formatTimeValue(entry.time_end);
  const timeLabel = timeStart === "—" && timeEnd === "—" ? "—" : `${timeStart}–${timeEnd}`;

  return [
    {
      label: FIELD_LABELS.promo_action,
      value: formatFieldDisplay("promo_action", entry.promo_action, catalogs),
    },
    {
      label: "Время",
      value: timeLabel,
    },
    {
      label: FIELD_LABELS.promo_where,
      value: formatFieldDisplay("promo_where", entry.promo_where, catalogs),
    },
    {
      label: FIELD_LABELS.promo_city,
      value: formatFieldDisplay("promo_city", entry.promo_city, catalogs),
    },
    {
      label: FIELD_LABELS.promo_point,
      value: formatFieldDisplay("promo_point", entry.promo_point, catalogs),
    },
  ];
}
