export const STAFF_SCHEDULE_HOUR_PRESETS = [
  {
    type: 0,
    key: "full",
    label: "10:00-22:00",
    time_start: "10:00",
    time_end: "22:00",
    color: "#95D26B",
    textColor: "#1F2937",
  },
  {
    type: 1,
    key: "first_half",
    label: "10:00-16:00",
    time_start: "10:00",
    time_end: "16:00",
    color: "#9A78BC",
    textColor: "#FFFFFF",
  },
  {
    type: 2,
    key: "second_half",
    label: "16:00-22:00",
    time_start: "16:00",
    time_end: "22:00",
    color: "#2567C1",
    textColor: "#FFFFFF",
  },
  {
    type: 3,
    key: "custom",
    label: "Другое",
    time_start: "",
    time_end: "",
    color: "#D92D5F",
    textColor: "#FFFFFF",
  },
];

export function getHourPresetByType(type) {
  return (
    STAFF_SCHEDULE_HOUR_PRESETS.find((item) => Number(item.type) === Number(type)) ||
    STAFF_SCHEDULE_HOUR_PRESETS[0]
  );
}

export function formatHourRangeLabel(timeStart, timeEnd) {
  return [timeStart, timeEnd].filter(Boolean).join("-") || "—";
}

function parseTimeToMinutes(value) {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

export function formatWorkedHours(timeStart, timeEnd) {
  const startMinutes = parseTimeToMinutes(timeStart);
  const endMinutes = parseTimeToMinutes(timeEnd);

  if (startMinutes === null || endMinutes === null) {
    return "";
  }

  let durationMinutes = endMinutes - startMinutes;

  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return minutes === 0 ? String(hours) : `${hours}:${String(minutes).padStart(2, "0")}`;
}

export function isSameHourRange(left = {}, right = {}) {
  return (
    String(left?.time_start ?? "") === String(right?.time_start ?? "") &&
    String(left?.time_end ?? "") === String(right?.time_end ?? "") &&
    Number(left?.type ?? 0) === Number(right?.type ?? 0)
  );
}

export function matchesPresetRange(timeStart, timeEnd, preset) {
  return (
    String(timeStart ?? "") === String(preset?.time_start ?? "") &&
    String(timeEnd ?? "") === String(preset?.time_end ?? "")
  );
}

export function isCustomHourRange(item = {}) {
  const preset = STAFF_SCHEDULE_HOUR_PRESETS.slice(0, 3).find((candidate) =>
    matchesPresetRange(item?.time_start, item?.time_end, candidate),
  );

  return !preset;
}

export function buildHourSlotId(item = {}) {
  return `${Number(item?.type ?? 0)}-${String(item?.time_start ?? "")}-${String(item?.time_end ?? "")}`;
}
