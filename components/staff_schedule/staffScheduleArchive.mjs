import dayjs from "dayjs";

// В архивном месяце остаются только права, которые открывают просмотр.
const ARCHIVE_OPEN_ACCESS_KEYS = new Set(["full_month", "export_excel"]);

export function getStaffScheduleEditableMonthStart(referenceDate = dayjs()) {
  return dayjs(referenceDate).startOf("month").subtract(1, "month").format("YYYY-MM");
}

/**
 * Месяцы старше прошлого — только просмотр; бэк отклоняет запись в них.
 */
export function isStaffScheduleArchiveMonth(monthId, referenceDate = dayjs()) {
  return (
    /^\d{4}-\d{2}$/.test(String(monthId ?? "")) &&
    monthId < getStaffScheduleEditableMonthStart(referenceDate)
  );
}

export const STAFF_SCHEDULE_ARCHIVE_FLAG = "staff_schedule_archive";

export function buildStaffScheduleArchiveAccess(access = {}) {
  const next = { [STAFF_SCHEDULE_ARCHIVE_FLAG]: true };
  for (const [key, value] of Object.entries(access ?? {})) {
    const match = key.match(/^(.+)_(view|edit|access)$/);
    if (!match) {
      next[key] = value;
      continue;
    }
    const base = match[1];
    const readable = ["view", "edit", "access"].some(
      (mode) => Number(access[`${base}_${mode}`]) === 1,
    );
    next[`${base}_view`] = readable ? 1 : 0;
    next[`${base}_edit`] = 0;
    next[`${base}_access`] =
      ARCHIVE_OPEN_ACCESS_KEYS.has(base) && Number(access[`${base}_access`]) === 1 ? 1 : 0;
  }
  return next;
}
