import { ADDITION_TYPE_LABELS, days } from "./constants.js";
import { htmlToText } from "./richText.mjs";

// Turns raw `history/category` and `history/template` rows into HistoryLog rows with Russian labels.
// `context`: { categories, templates, roles, locations, scheduleTypeOptions, additionTypeOptions }.

const ACTION_LABEL = "Действие";
const EMPTY_VALUE = "—";
const EVENT_LABELS = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
  status: "Статус",
  templates: "Применяется для",
};
const DOW_TO_SCHEDULE_TYPE = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  7: "sun",
  11: "every_day",
  12: "every_day_shift_end",
  13: "manual",
  14: "after_cleaning",
};
const SCHEDULE_FALLBACK_LABELS = {
  every_day: "Каждый день",
  every_day_shift_end: "Каждый день в конце смены",
  manual: "Ручное добавление",
  after_cleaning: "После уборки",
  other: "Другое",
};
const TYPE_TIME_TO_ADDITION_TYPE = { 0: "other", 1: "single_active", 2: "unlimited" };
const CATEGORY_TECHNICAL_FIELDS = new Set(["id", "sort"]);
const TEMPLATE_TECHNICAL_FIELDS = new Set(["id", "time_sec", "sort"]);
const TEXT_PREVIEW_LENGTH = 200;
const TEXT_CONTEXT_LENGTH = 40;
const TEXT_CHANGE_LENGTH = 300;

const TEMPLATE_FIELDS = [
  { column: "name", label: "Объект уборки", read: (template) => toText(template.name) },
  {
    column: "type_new",
    label: "Вид уборки",
    read: (template, context) => getCategoryLabel(template.type_new, context),
  },
  {
    column: "app_id",
    label: "Должность",
    read: (template, context) => getRoleLabel(template.app_id, context),
  },
  {
    column: "app_id_2",
    label: "Вторая должность",
    read: (template, context) =>
      toNumber(template.app_id_2) ? getRoleLabel(template.app_id_2, context) : "",
  },
  { column: "time_min", label: "Длительность", read: (template) => formatMinutes(template.time_min) },
  { column: "max_count", label: "Количество активаций", read: (template) => toText(template.max_count) },
  {
    column: "type_time",
    label: "Тип добавления",
    read: (template, context) => getAdditionTypeLabel(template.type_time, context),
  },
  {
    column: "dow",
    label: "Расписание",
    read: (template, context) => getScheduleLabel(template.dow, context),
  },
  { label: "Время появления задачи", readSnapshot: (snapshot) => snapshot.startTimes.join(", ") },
  { label: "Время удаления", readSnapshot: (snapshot) => snapshot.deleteTimes.join(", ") },
  {
    column: "is_not_del",
    label: "Не удалять автоматически",
    read: (template) => formatFlag(template.is_not_del),
    createDefault: "Нет",
  },
  {
    column: "is_need",
    label: "Особый день",
    read: (template) => formatFlag(template.is_need),
    createDefault: "Нет",
  },
  {
    column: "work_id",
    label: "После выполнения уборки",
    read: (template, context) =>
      toNumber(template.work_id) ? getTemplateLabel(template.work_id, context) : "",
  },
  { column: "description", label: "Инструкция", rich: true },
  {
    column: "is_active",
    label: "Статус",
    read: (template) => formatStatus(template.is_active),
    createDefault: "Активна",
  },
  { label: "Кафе", cafes: true },
  {
    column: "type",
    label: "Вид уборки (старое поле)",
    read: (template) => toText(template.type),
    legacy: true,
  },
  { column: "text", label: "Описание (старое поле)", rich: true, legacy: true },
];
const KNOWN_TEMPLATE_COLUMNS = new Set(
  TEMPLATE_FIELDS.map((field) => field.column).filter(Boolean),
);

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJson(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toNumber(value) {
  if (value == null || value === "" || typeof value === "boolean") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toText(value) {
  if (value == null) {
    return "";
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value).trim();
}

function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function toShortTime(value) {
  const time = String(value ?? "").trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(time);

  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : time;
}

function findById(list, id) {
  return toArray(list).find((item) => String(item?.id) === String(id)) || null;
}

function formatMinutes(value) {
  const text = toText(value);
  return text ? `${text} мин` : "";
}

function formatFlag(value) {
  return value == null || value === "" ? "" : toBoolean(value) ? "Да" : "Нет";
}

function formatStatus(value) {
  return value == null || value === "" ? "" : toBoolean(value) ? "Активна" : "Архив";
}

function getTemplateLabel(id, context) {
  const template = findById(context.templates, id);

  if (!template) {
    return `уборка #${id}`;
  }

  return template.role ? `${template.name} · ${template.role}` : template.name;
}

function getCategoryLabel(id, context) {
  if (!toNumber(id)) {
    return "Без вида уборки";
  }

  return findById(context.categories, id)?.name || `вид уборки #${id}`;
}

function getRoleLabel(id, context) {
  if (!toNumber(id)) {
    return "Без должности";
  }

  return findById(context.roles, id)?.name || `должность #${id}`;
}

function getLocationLabel(id, context) {
  return findById(context.locations, id)?.name || `кафе #${id}`;
}

function getOptionLabel(options, value) {
  return toArray(options).find((option) => option?.value === value)?.label || "";
}

function getScheduleLabel(dow, context) {
  const dowNumber = toNumber(dow);

  if (dowNumber == null) {
    return "";
  }

  const scheduleType = DOW_TO_SCHEDULE_TYPE[dowNumber] || "other";
  const weekday = days.find((day) => day.value === scheduleType);

  if (weekday) {
    return weekday.label;
  }

  return (
    getOptionLabel(context.scheduleTypeOptions, scheduleType) ||
    SCHEDULE_FALLBACK_LABELS[scheduleType]
  );
}

function getAdditionTypeLabel(typeTime, context) {
  const additionType = TYPE_TIME_TO_ADDITION_TYPE[toNumber(typeTime)];

  if (!additionType) {
    return toText(typeTime);
  }

  return (
    getOptionLabel(context.additionTypeOptions, additionType) ||
    ADDITION_TYPE_LABELS[additionType] ||
    additionType
  );
}

function toSingleLine(text) {
  return text.replace(/\n+/g, " / ");
}

function clip(text, length, fromEnd = false) {
  if (text.length <= length) {
    return text;
  }

  return fromEnd ? `…${text.slice(text.length - length)}` : `${text.slice(0, length)}…`;
}

// Shows only the changed fragment of a long text with a little context around it.
function getTextChangeExcerpt(fromText, toText) {
  if (fromText.length <= TEXT_PREVIEW_LENGTH && toText.length <= TEXT_PREVIEW_LENGTH) {
    return { from: fromText, to: toText };
  }

  let prefix = 0;
  const maxPrefix = Math.min(fromText.length, toText.length);
  while (prefix < maxPrefix && fromText[prefix] === toText[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  const maxSuffix = maxPrefix - prefix;
  while (
    suffix < maxSuffix &&
    fromText[fromText.length - 1 - suffix] === toText[toText.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const excerpt = (text) => {
    const changeEnd = text.length - suffix;
    const before = text.slice(0, prefix);
    const after = text.slice(changeEnd);
    const change = text.slice(prefix, changeEnd);

    return [
      before ? clip(before, TEXT_CONTEXT_LENGTH, true) : "",
      clip(change, TEXT_CHANGE_LENGTH),
      after ? clip(after, TEXT_CONTEXT_LENGTH) : "",
    ].join("");
  };

  return { from: excerpt(fromText), to: excerpt(toText) };
}

function describeRichChange(fromHtml, toHtml, mode) {
  const fromText = toSingleLine(htmlToText(fromHtml));
  const toText = toSingleLine(htmlToText(toHtml));

  if (mode === "create") {
    return toText ? { from: null, to: clip(toText, TEXT_PREVIEW_LENGTH) } : null;
  }

  if (fromText === toText) {
    return String(fromHtml ?? "") === String(toHtml ?? "")
      ? null
      : { from: null, to: "Изменено оформление" };
  }

  if (!fromText) {
    return { from: null, to: clip(toText, TEXT_PREVIEW_LENGTH) };
  }

  if (!toText) {
    return { from: clip(fromText, TEXT_PREVIEW_LENGTH), to: EMPTY_VALUE };
  }

  return getTextChangeExcerpt(fromText, toText);
}

function addChange(changes, label, from, to, mode, createDefault = "") {
  if (from === to) {
    return;
  }

  if (mode === "create") {
    if (to && to !== createDefault) {
      changes[label] = { from: null, to };
    }
    return;
  }

  changes[label] = { from: from || null, to: to || EMPTY_VALUE };
}

function buildRow(row, changes) {
  const eventType = row?.event_type || "";

  return {
    id: row?.id ?? `${row?.created_at || ""}-${eventType}`,
    created_at: row?.created_at || "",
    actor_name: row?.actor_name || "Неизвестно",
    event_type: eventType,
    diff_json: {
      [ACTION_LABEL]: { from: null, to: EVENT_LABELS[eventType] || "Изменение" },
      ...changes,
    },
  };
}

function presentCategoryEvent(row, context) {
  const eventType = row?.event_type || "";
  const diff = parseJson(row?.diff_json);
  const changes = {};

  if (eventType === "delete") {
    const before = parseJson(row?.before_json);
    const name = toText(before?.name) || toText(diff?.name?.from);

    if (name) {
      changes["Название"] = { from: null, to: name };
    }
    return buildRow(row, changes);
  }

  if (!isPlainObject(diff)) {
    return buildRow(row, { Подробности: { from: null, to: "Недоступны" } });
  }

  const mode = eventType === "create" ? "create" : "update";
  const addedTemplates = [];
  const removedTemplates = [];

  Object.entries(diff).forEach(([path, change]) => {
    if (!isPlainObject(change)) {
      return;
    }

    const [root, ...rest] = path.split(".");

    if (root === "templates") {
      const templateId = rest.join(".");
      const wasLinked = Boolean(toNumber(change.from));
      const isLinked = Boolean(toNumber(change.to));

      if (templateId && wasLinked !== isLinked) {
        (isLinked ? addedTemplates : removedTemplates).push(getTemplateLabel(templateId, context));
      }
      return;
    }

    if (CATEGORY_TECHNICAL_FIELDS.has(path)) {
      return;
    }

    if (path === "name") {
      addChange(changes, "Название", toText(change.from), toText(change.to), mode);
      return;
    }

    if (path === "text") {
      const instructionChange = describeRichChange(change.from, change.to, mode);
      if (instructionChange) {
        changes["Инструкция"] = instructionChange;
      }
      return;
    }

    addChange(changes, `Поле «${path}»`, toText(change.from), toText(change.to), mode);
  });

  const templateChanges = [
    ...addedTemplates.sort().map((label) => `+ ${label}`),
    ...removedTemplates.sort().map((label) => `− ${label}`),
  ];
  if (templateChanges.length) {
    changes["Применяется для"] = { from: null, to: templateChanges.join(", ") };
  }

  // Only technical fields changed (e.g. `id` of old snapshots): nothing to show.
  if (mode !== "create" && !Object.keys(changes).length) {
    return null;
  }

  return buildRow(row, changes);
}

// Old shape: [{id, time_action, type_action, work_id}]; new shape: {start: {"10:00": 1}, delete: {...}}.
function readTimes(times, kind, legacyTypeAction) {
  let values = [];

  if (Array.isArray(times)) {
    values = times
      .filter((row) => toNumber(row?.type_action) === legacyTypeAction)
      .map((row) => row?.time_action);
  } else if (isPlainObject(times)) {
    const group = times[kind];
    values = isPlainObject(group) ? Object.keys(group) : toArray(group);
  }

  return [...new Set(values.map(toShortTime).filter(Boolean))].sort();
}

// Old shape: [{id, point_id, dop_time, work_id}] (duplicates collapse to the latest row);
// new shape: {"<pointId>": {dop_time}}, a JSON array when the point ids are exactly 0..n-1.
function readPoints(points) {
  const dopTimes = new Map();
  const isLegacyRows =
    Array.isArray(points) && points.some((row) => isPlainObject(row) && "point_id" in row);

  if (isLegacyRows) {
    const latestRowIds = new Map();

    points.forEach((row, index) => {
      const pointId = toNumber(row?.point_id);
      if (pointId == null) {
        return;
      }

      const rowId = toNumber(row?.id) ?? index;
      if (latestRowIds.has(pointId) && latestRowIds.get(pointId) > rowId) {
        return;
      }

      latestRowIds.set(pointId, rowId);
      dopTimes.set(String(pointId), toNumber(row?.dop_time) ?? 0);
    });
  } else if (Array.isArray(points) || isPlainObject(points)) {
    Object.entries(points).forEach(([pointId, value]) => {
      if (value == null) {
        return;
      }

      dopTimes.set(String(pointId), toNumber(isPlainObject(value) ? value.dop_time : value) ?? 0);
    });
  }

  // `point_id = 0` is a broken legacy link, not a cafe.
  dopTimes.delete("0");
  return dopTimes;
}

function readTemplateSnapshot(value) {
  const snapshot = parseJson(value);

  if (!isPlainObject(snapshot)) {
    return null;
  }

  return {
    template: isPlainObject(snapshot.template) ? snapshot.template : {},
    startTimes: readTimes(snapshot.times, "start", 1),
    deleteTimes: readTimes(snapshot.times, "delete", 2),
    points: readPoints(snapshot.points),
  };
}

function formatDopTime(minutes) {
  return `${minutes} мин`;
}

function addCafeChanges(changes, before, after, mode, context) {
  const beforePoints = before?.points || new Map();
  const afterPoints = after?.points || new Map();
  const byName = (left, right) => left.name.localeCompare(right.name, "ru");
  const toCafe = (pointId, dopTime) => ({ name: getLocationLabel(pointId, context), dopTime });

  const added = [...afterPoints]
    .filter(([pointId]) => !beforePoints.has(pointId))
    .map(([pointId, dopTime]) => toCafe(pointId, dopTime))
    .sort(byName);
  const removed = [...beforePoints]
    .filter(([pointId]) => !afterPoints.has(pointId))
    .map(([pointId, dopTime]) => toCafe(pointId, dopTime))
    .sort(byName);
  const withDopTime = (cafe) => (cafe.dopTime > 0 ? `${cafe.name} (+${cafe.dopTime} мин)` : cafe.name);

  if (mode === "create") {
    if (added.length) {
      changes["Кафе"] = { from: null, to: added.map(withDopTime).join(", ") };
    }
    return;
  }

  const cafeChanges = [
    ...added.map((cafe) => `+ ${withDopTime(cafe)}`),
    ...removed.map((cafe) => `− ${cafe.name}`),
  ];
  if (cafeChanges.length) {
    changes["Кафе"] = { from: null, to: cafeChanges.join(", ") };
  }

  [...afterPoints]
    .filter(([pointId, dopTime]) => beforePoints.has(pointId) && beforePoints.get(pointId) !== dopTime)
    .map(([pointId, dopTime]) => ({
      ...toCafe(pointId, dopTime),
      previousDopTime: beforePoints.get(pointId),
    }))
    .sort(byName)
    .forEach((cafe) => {
      changes[`Доп. время: ${cafe.name}`] = {
        from: formatDopTime(cafe.previousDopTime),
        to: formatDopTime(cafe.dopTime),
      };
    });
}

function presentTemplateEvent(row, context) {
  const eventType = row?.event_type || "";
  const before = readTemplateSnapshot(row?.before_json);
  const after = readTemplateSnapshot(row?.after_json);
  const changes = {};

  if (!before && !after) {
    return buildRow(row, { Подробности: { from: null, to: "Недоступны" } });
  }

  if (eventType === "delete" || !after) {
    const name = toText(before?.template?.name) || toText(after?.template?.name);

    if (name) {
      changes["Объект уборки"] = { from: null, to: name };
    }
    return buildRow(row, changes);
  }

  const mode = before ? "update" : "create";
  const emptyTemplate = {};

  TEMPLATE_FIELDS.forEach((field) => {
    if (field.legacy && mode === "create") {
      return;
    }

    if (field.cafes) {
      addCafeChanges(changes, before, after, mode, context);
      return;
    }

    if (field.rich) {
      const richChange = describeRichChange(
        before?.template?.[field.column],
        after?.template?.[field.column],
        mode,
      );
      if (richChange) {
        changes[field.label] = richChange;
      }
      return;
    }

    const read = (snapshot) =>
      field.readSnapshot
        ? field.readSnapshot(snapshot)
        : field.read(snapshot?.template || emptyTemplate, context);

    addChange(
      changes,
      field.label,
      before ? read(before) : "",
      read(after),
      mode,
      field.createDefault,
    );
  });

  const otherColumns = new Set([
    ...Object.keys(before?.template || {}),
    ...Object.keys(after?.template || {}),
  ]);
  otherColumns.forEach((column) => {
    if (KNOWN_TEMPLATE_COLUMNS.has(column) || TEMPLATE_TECHNICAL_FIELDS.has(column)) {
      return;
    }

    addChange(
      changes,
      `Поле «${column}»`,
      toText(before?.template?.[column]),
      toText(after?.template?.[column]),
      mode,
    );
  });

  // Only technical fields changed (row ids of old snapshots): nothing to show.
  if (mode !== "create" && !Object.keys(changes).length) {
    return null;
  }

  return buildRow(row, changes);
}

// One malformed row never breaks the list: it falls back to a bare «Изменение».
function presentRows(rows, context, presentEvent) {
  const safeContext = context || {};

  return toArray(rows)
    .map((row) => {
      try {
        return presentEvent(row, safeContext);
      } catch {
        return {
          ...buildRow(row, {}),
          diff_json: { [ACTION_LABEL]: { from: null, to: EVENT_LABELS.update } },
        };
      }
    })
    .filter(Boolean);
}

export function presentCategoryHistory(rows, context = {}) {
  return presentRows(rows, context, presentCategoryEvent);
}

export function presentTemplateHistory(rows, context = {}) {
  return presentRows(rows, context, presentTemplateEvent);
}
