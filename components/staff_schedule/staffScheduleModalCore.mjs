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
