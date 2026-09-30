import dayjs from "dayjs";
import { toArray } from "./staffSchedulePayroll.mjs";
import { canUseStaffScheduleFastActionsPeriod } from "./staffSchedulePeriodRange.mjs";
import { createStaffSchedulePolicy } from "./staffScheduleAccess.mjs";

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isMegaRole(value) {
  const role = normalizeRole(value);
  return role === "mega" || role === "mega_dir";
}

export function isPastMonth(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value, "YYYY-MM", true);
  return parsed.isValid() && parsed.isBefore(dayjs(), "month");
}

function isToday(value, referenceDate) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isSame(dayjs(referenceDate), "day");
}

function isFutureDay(value, referenceDate) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isAfter(dayjs(referenceDate), "day");
}

function getDayHalfPeriod(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = dayjs(date);
  if (!parsed.isValid() || parsed.format("YYYY-MM-DD") !== date) return null;
  return { monthId: parsed.format("YYYY-MM"), selectedPart: parsed.date() <= 15 ? 0 : 1 };
}

export function isEditableDayHalfPeriod(date, referenceDate = dayjs()) {
  const period = getDayHalfPeriod(date);
  return (
    Boolean(period) &&
    canUseStaffScheduleFastActionsPeriod(period.monthId, period.selectedPart, referenceDate)
  );
}

export function isClosedDayHalfPeriod(date, referenceDate = dayjs()) {
  return Boolean(getDayHalfPeriod(date)) && !isEditableDayHalfPeriod(date, referenceDate);
}

export function canEditDayPeriod({
  date,
  roleKind,
  checkPeriod,
  canEditDay = false,
  referenceDate = dayjs(),
}) {
  if (!canEditDay || !isEditableDayHalfPeriod(date, referenceDate)) {
    return false;
  }

  const role = normalizeRole(roleKind);

  if (isMegaRole(role) || role === "dir" || role === "dir_other") {
    return true;
  }

  if (role === "manager") {
    return isToday(date, referenceDate);
  }

  if (isToday(date, referenceDate) || isFutureDay(date, referenceDate)) {
    return true;
  }

  return Number(checkPeriod) === 1;
}

export function canEditDayHealth(context) {
  return canEditDayPeriod(context);
}

export function canEditMonthByRole({ monthId }) {
  return !isPastMonth(monthId);
}

export function isEditableMonthDay(date, referenceDate = dayjs()) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = dayjs(date);
  return (
    parsed.isValid() &&
    parsed.format("YYYY-MM-DD") === date &&
    date >= dayjs(referenceDate).format("YYYY-MM-DD")
  );
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

export function isDayDraftComplete({
  draft = {},
  originalHoursCount = 0,
  canEditAssignment = false,
  canEditHealth = false,
  canEditHours = false,
  appOptions = [],
  healthOptions = [],
} = {}) {
  const isSelectedOption = (value, options) =>
    value != null &&
    value !== "" &&
    value !== "none" &&
    toArray(options).some((option) => String(option?.id) === String(value));

  if (
    canEditAssignment &&
    toArray(appOptions).length > 0 &&
    !isSelectedOption(draft.newApp, appOptions)
  ) {
    return false;
  }

  if (canEditHealth) {
    if (!/^\d+(?:[,.]\d+)?$/.test(String(draft.userTemp ?? "").trim())) {
      return false;
    }

    if (!isSelectedOption(draft.typeHealf, healthOptions)) {
      return false;
    }
  }

  if (
    canEditHours &&
    Number(originalHoursCount) === 0 &&
    !toArray(draft.hours).some((hour) => !getTimeRangeValidationError(hour))
  ) {
    return false;
  }

  return true;
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

export function buildAuthorizedDaySavePayload({
  request,
  payload,
  access,
  roleKind,
  checkPeriod,
  referenceDate,
} = {}) {
  if (
    !request ||
    !payload ||
    ["date", "user_id", "app_id", "smena_id", "point_id"].some(
      (key) => String(request[key] ?? "") !== String(payload[key] ?? ""),
    )
  ) {
    throw new Error("Данные дня изменились. Откройте карточку заново.");
  }
  const canEditDay = createStaffSchedulePolicy(access).canOpenDayCard;
  if (!canEditDayPeriod({ date: request.date, roleKind, checkPeriod, canEditDay, referenceDate })) {
    throw new Error(
      isClosedDayHalfPeriod(request.date, referenceDate)
        ? "Прошедший период — только просмотр"
        : "Нет доступа к редактированию дня",
    );
  }
  return buildDaySavePayload(
    { ...request, canEditAssignment: true, canEditHealth: true, canEditHours: true },
    {
      newApp: payload.new_app,
      mentorId: payload.mentor_id,
      userTemp: payload.user_temp,
      typeHealf: payload.type_healf,
      hours: payload.hours,
    },
  );
}

export function buildMonthSavePayload(request = {}, draft = {}) {
  const payload = {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    dates: toArray(draft.dates)
      .filter((item) => isEditableMonthDay(item?.date))
      .map((item) => ({
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
