import dayjs from "dayjs";
import { toArray } from "./staffSchedulePayroll.mjs";

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isMegaRole(value) {
  const role = normalizeRole(value);
  return role === "mega" || role === "mega_dir";
}

export function isMegaOnlyRole(value) {
  return normalizeRole(value) === "mega";
}

export function isPastMonth(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value, "YYYY-MM", true);
  return parsed.isValid() && parsed.isBefore(dayjs(), "month");
}

function isToday(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isSame(dayjs(), "day");
}

function isFutureDay(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isAfter(dayjs(), "day");
}

export function canEditDayPeriod({ date, roleKind, checkPeriod }) {
  if (!date) {
    return false;
  }

  if (isMegaRole(roleKind)) {
    return true;
  }

  if (isToday(date) || isFutureDay(date)) {
    return true;
  }

  return Number(checkPeriod) === 1;
}

export function canEditDayHealth({ date, hours }) {
  return isToday(date) && toArray(hours).length > 0;
}

export function canEditMonthByRole({ roleKind, monthId }) {
  return isMegaOnlyRole(roleKind) || !isPastMonth(monthId);
}

function timeToMinutes(value) {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

export function getTimeRangeValidationError(range = {}) {
  const start = timeToMinutes(range?.time_start);
  const end = timeToMinutes(range?.time_end);

  if (start === null || end === null) {
    return "Укажите корректное время начала и окончания.";
  }

  if (end <= start) {
    return "Время окончания должно быть позже начала. Переход через полночь недоступен.";
  }

  return "";
}

export function findInvalidTimeRangeIds(hours = []) {
  const invalidIds = new Set();

  toArray(hours).forEach((range, index) => {
    if (getTimeRangeValidationError(range)) {
      invalidIds.add(range?.id ?? `hour-${index}`);
    }
  });

  return invalidIds;
}

export function timeRangesOverlap(first = {}, second = {}) {
  if (getTimeRangeValidationError(first) || getTimeRangeValidationError(second)) {
    return false;
  }

  const firstStart = timeToMinutes(first?.time_start);
  const firstEnd = timeToMinutes(first?.time_end);
  const secondStart = timeToMinutes(second?.time_start);
  const secondEnd = timeToMinutes(second?.time_end);

  if (firstStart === null || firstEnd === null || secondStart === null || secondEnd === null) {
    return false;
  }

  return Math.max(firstStart, secondStart) < Math.min(firstEnd, secondEnd);
}

export function findOverlappingTimeRangeIds(hours = []) {
  const ranges = toArray(hours);
  const overlappingIds = new Set();

  ranges.forEach((range, rangeIndex) => {
    ranges.slice(rangeIndex + 1).forEach((otherRange, offset) => {
      if (!timeRangesOverlap(range, otherRange)) {
        return;
      }

      const otherIndex = rangeIndex + offset + 1;
      overlappingIds.add(range?.id ?? `hour-${rangeIndex}`);
      overlappingIds.add(otherRange?.id ?? `hour-${otherIndex}`);
    });
  });

  return overlappingIds;
}

function normalizeNullableValue(value) {
  return value && value !== "none" ? value : "";
}

export function buildDaySavePayload(request = {}, draft = {}) {
  const payload = {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    point_id: request?.point_id,
  };

  if (request?.canEditAssignment) {
    payload.new_app = normalizeNullableValue(draft.newApp);
    payload.mentor_id = normalizeNullableValue(draft.mentorId);
  }

  if (request?.canEditHours) {
    payload.hours = toArray(draft.hours).map((item) => ({
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    }));
  }

  if (request?.canEditHealth) {
    payload.user_temp = draft.userTemp || "";
    payload.type_healf = draft.typeHealf || "";
  }

  return payload;
}

export function buildMonthSavePayload(request = {}, draft = {}) {
  const payload = {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    dates: toArray(draft.dates).map((item) => ({
      date: item?.date ?? "",
      type: Number(item?.type ?? 0),
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    })),
  };

  if (request?.canEditMonth) {
    payload.new_app = draft.newApp || "";
    payload.mentor_id = draft.mentorId || "";
  }

  return payload;
}
