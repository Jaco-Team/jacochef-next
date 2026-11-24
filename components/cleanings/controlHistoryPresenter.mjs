// Turns raw `control/history` rows into HistoryLog rows (newest first) with Russian labels.

const ACTION_LABEL = "Действие";
const EMPTY_VALUE = "—";
const UNKNOWN_ACTOR = "Неизвестно";

export const CONTROL_ACTION_LABELS = {
  manual_add: "Добавлена вручную",
  approve: "Подтверждена",
  return: "Возвращена на доработку",
  detach: "Снята с сотрудника",
  delete: "Удалена",
  edit: "Изменена",
};

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

function toText(value) {
  if (value == null || typeof value === "object") {
    return "";
  }

  return String(value).trim();
}

export function formatControlDate(value) {
  const text = toText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);

  return match ? `${match[3]}.${match[2]}.${match[1]}` : text;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

// Unix seconds → "10:30" on the cleaning's own date, "20.11.2026 10:30" on another one (local time).
function formatUnixTime(value, workDate) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const date = new Date(seconds * 1000);
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return day === toText(workDate).slice(0, 10)
    ? time
    : `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${time}`;
}

function formatAmount(value) {
  if (value == null || value === "") {
    return EMPTY_VALUE;
  }

  const number = Number(value);
  return Number.isFinite(number) ? String(Number(number.toFixed(3))) : toText(value) || EMPTY_VALUE;
}

// BE `meta` of return / detach is the row before the action:
// `{user_id, user_name, date_unix_start, date_unix_end}` (unix seconds).
function getPreviousStateChanges(action, meta, workDate) {
  if (!isPlainObject(meta)) {
    return {};
  }

  const employee = toText(meta.user_name);
  const startedAt = formatUnixTime(meta.date_unix_start, workDate);
  const finishedAt = formatUnixTime(meta.date_unix_end, workDate);
  const changes = {};

  // Return keeps the employee and the start; only the finish time is cleared.
  if (action === "return") {
    if (employee) {
      changes["Сотрудник"] = { from: null, to: employee };
    }
    if (finishedAt) {
      changes["Окончание"] = { from: finishedAt, to: EMPTY_VALUE };
    }
    return changes;
  }

  if (employee) {
    changes["Сотрудник"] = { from: employee, to: EMPTY_VALUE };
  }
  if (startedAt) {
    changes["Начало"] = { from: startedAt, to: EMPTY_VALUE };
  }
  if (finishedAt) {
    changes["Окончание"] = { from: finishedAt, to: EMPTY_VALUE };
  }
  return changes;
}

// BE `meta` of a preparation edit: `{old_count_pf, old_count_trash, new_count_pf, new_count_trash}`.
function getEditChanges(meta) {
  if (!isPlainObject(meta)) {
    return {};
  }

  const changes = {};
  const volume = [formatAmount(meta.old_count_pf), formatAmount(meta.new_count_pf)];
  const waste = [formatAmount(meta.old_count_trash), formatAmount(meta.new_count_trash)];

  if (volume[0] !== volume[1]) {
    changes["Объём"] = { from: volume[0], to: volume[1] };
  }
  if (waste[0] !== waste[1]) {
    changes["Отходы"] = { from: waste[0], to: waste[1] };
  }
  return changes;
}

function presentControlEvent(row) {
  const action = toText(row.action);
  const createdAt = toText(row.createdAt);
  const comment = toText(row.comment);
  const changes = {
    [ACTION_LABEL]: { from: null, to: CONTROL_ACTION_LABELS[action] || action || EMPTY_VALUE },
  };

  if (comment) {
    changes[action === "delete" ? "Причина" : "Комментарий"] = { from: null, to: comment };
  }

  if (action === "return" || action === "detach") {
    Object.assign(changes, getPreviousStateChanges(action, parseJson(row.meta), row.workDate));
  }

  if (action === "edit") {
    Object.assign(changes, getEditChanges(parseJson(row.meta)));
  }

  return {
    id: row.id ?? `${createdAt}-${action}`,
    created_at: createdAt,
    actor_name: toText(row.actorName) || UNKNOWN_ACTOR,
    event_type: action,
    diff_json: changes,
  };
}

function compareNewestFirst(left, right) {
  if (left.created_at !== right.created_at) {
    return left.created_at < right.created_at ? 1 : -1;
  }

  return (Number(right.id) || 0) - (Number(left.id) || 0);
}

export function presentControlHistory(rows) {
  return toArray(rows).filter(isPlainObject).map(presentControlEvent).sort(compareNewestFirst);
}

// Dialog subtitle «Объект · ДД.ММ.ГГГГ»; event copies cover a row the list no longer has.
export function getControlHistorySubject(item, rows = []) {
  const event = toArray(rows).find(isPlainObject) || {};
  const name = toText(item?.workName) || toText(item?.name) || toText(event.workName);
  // `preparedAt` of a preparation may be a bare time, so the event's work date goes first.
  const date = formatControlDate(item?.date || event.workDate || item?.preparedAt);

  return { name: [name, date].filter(Boolean).join(" · ") };
}
