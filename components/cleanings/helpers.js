import { days } from "./constants";

export function getScheduleTypeFromDays(item = {}) {
  if (item.scheduleType && item.scheduleType !== "weekly") {
    return item.scheduleType;
  }

  if (item.days?.length === days.length) {
    return "every_day";
  }

  if (item.days?.length === 1) {
    return item.days[0];
  }

  return item.days?.length ? "other" : "";
}

export function getDaysFromScheduleType(scheduleType) {
  if (scheduleType === "every_day" || scheduleType === "every_day_shift_end") {
    return days.map((day) => day.value);
  }

  if (days.some((day) => day.value === scheduleType)) {
    return [scheduleType];
  }

  return [];
}

export function getScheduleText(item, scheduleTypeOptions = []) {
  const scheduleType = getScheduleTypeFromDays(item);
  const scheduleTypeLabel = scheduleTypeOptions.find(
    (option) => option.value === scheduleType,
  )?.label;
  const dayLabels = scheduleTypeLabel
    ? scheduleTypeLabel
    : item.days?.length === days.length
      ? "Ежедневно"
      : item.days?.map((day) => days.find((d) => d.value === day)?.label).join(", ");
  return `${dayLabels || "Без дней"} · ${(item.times || []).join(", ") || "Без времени"}`;
}

export function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || "Без категории";
}

export function getTemplateLocationNames(locationIds = [], locations = []) {
  return locations
    .filter((location) => locationIds.includes(location.id))
    .map(getLocationName)
    .join(", ");
}

export function getTemplateLocationCount(locationIds = [], locations = []) {
  const uniqueLocationIds = [
    ...new Set((locationIds || []).map((locationId) => String(locationId))),
  ];

  if (!locations.length) {
    return uniqueLocationIds.length;
  }

  const availableLocationIds = new Set(locations.map((location) => String(location.id)));

  return uniqueLocationIds.filter((locationId) => availableLocationIds.has(locationId)).length;
}

export function getLocationName(location) {
  return location?.name || "";
}

export function getLocationNameById(locationId, locations = []) {
  const location = locations.find((item) => String(item.id) === String(locationId));

  return location ? getLocationName(location) : "Кафе не выбрано";
}

export function isSameId(left, right) {
  if (left == null || right == null || left === "" || right === "") {
    return false;
  }

  return String(left) === String(right);
}

export function getDatePart(value) {
  return value ? String(value).split(" ")[0] : "";
}

export function isDateInRange(value, from, to) {
  const date = getDatePart(value);

  if (!date) {
    return !from && !to;
  }

  return (!from || date >= from) && (!to || date <= to);
}

export function formatControlTime(value) {
  if (!value) {
    return "—";
  }

  const time = String(value).split(" ").pop();
  const [hours, minutes] = time.split(":");

  return hours && minutes ? `${hours}:${minutes}` : value;
}

export function getControlStatusMeta(status) {
  const meta = {
    pending: {
      label: "Ожидает подтверждения",
      color: "#b45309",
      bgcolor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    active: {
      label: "Активно",
      color: "#2563eb",
      bgcolor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
    in_progress: {
      label: "В процессе",
      color: "#7c3aed",
      bgcolor: "#f5f3ff",
      borderColor: "#ddd6fe",
    },
    approved: {
      label: "Подтверждено",
      color: "#059669",
      bgcolor: "#ecfdf5",
      borderColor: "#a7f3d0",
    },
  };

  return meta[status] || meta.active;
}

export const tableHeaderSx = {
  bgcolor: "surface.muted",
  "& .MuiTableCell-root": {
    py: 1.25,
    color: "text.secondary",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottom: "1px solid",
    borderColor: "divider",
  },
};

export const tableRowSx = {
  "& .MuiTableCell-root": {
    py: 1.5,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  "&:hover": {
    bgcolor: "surface.muted",
  },
  "&:hover .cleaning-name-cell": {
    borderLeftColor: "primary.main",
  },
};
