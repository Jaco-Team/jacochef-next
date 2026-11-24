import {
  ADDITION_TYPE_LABELS,
  ADDITION_TYPE_SHORT_LABELS,
  NIGHTLY_CLEANUP_TIME,
  cleaningSectionTabs,
  controlKindTabs,
  days,
} from "./constants";
import { uiColors, uiTableColors, uiTypography } from "@/design-system/shared/ui";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const POOL_CLEANING_MARK = "(Г)";
const SCHEDULE_SORT_ORDER = [
  ...days.map((day) => day.value),
  "every_day",
  "every_day_shift_end",
  "after_cleaning",
  "manual",
  "other",
];

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

export function isValidTime(value) {
  return TIME_PATTERN.test(String(value ?? ""));
}

export function isFiveMinuteTime(value) {
  const match = TIME_PATTERN.exec(String(value ?? ""));
  return Boolean(match) && Number(match[2]) % 5 === 0;
}

export function getScheduleSortValue(item) {
  const scheduleType = getScheduleTypeFromDays(item);
  const index = SCHEDULE_SORT_ORDER.indexOf(scheduleType);
  const firstTime = [...(item.times || [])].sort()[0] || "";

  return `${String(index === -1 ? SCHEDULE_SORT_ORDER.length : index).padStart(2, "0")} ${firstTime}`;
}

export function getAdditionTypeName(additionType, additionTypeOptions = []) {
  if (!additionType) {
    return "";
  }

  return (
    additionTypeOptions.find((option) => option.value === additionType)?.label ||
    ADDITION_TYPE_LABELS[additionType] ||
    ""
  );
}

export function getAdditionTypeShortName(additionType) {
  return ADDITION_TYPE_SHORT_LABELS[additionType] || "";
}

// The nightly cleanup returns unassigned «(Г)» tasks to the pool instead of removing them (BE: `like '%(Г)%'`).
function isPoolCleaning(item = {}) {
  return String(item.name ?? "").toUpperCase().includes(POOL_CLEANING_MARK);
}

// What happens to an unassigned task of the template: kept, removed at its delete time,
// removed by the nightly cleanup, or returned to the pool at night.
export function getDeleteBehavior(item = {}) {
  if (item.is_not_del) {
    return { kind: "mandatory", time: "" };
  }

  const deleteTime = (item.deleteTimes || []).find(Boolean) || "";

  if (deleteTime) {
    return { kind: "time", time: deleteTime };
  }

  return isPoolCleaning(item)
    ? { kind: "pool", time: "" }
    : { kind: "nightly", time: NIGHTLY_CLEANUP_TIME };
}

// "Все кафе" or per city: "Тольятти: все (12)", "Самара: 3 из 8".
export function getLocationSelectionSummary(locationIds = [], locations = [], cities = []) {
  const selectedIds = new Set((locationIds || []).map((locationId) => String(locationId)));
  const selected = locations.filter((location) => selectedIds.has(String(location.id)));

  if (!selected.length) {
    return "";
  }

  if (selected.length === locations.length) {
    return `Все кафе (${locations.length})`;
  }

  const groups = new Map();
  locations.forEach((location) => {
    const key = location.cityId ?? "none";
    const group = groups.get(key) || { cityId: location.cityId, total: 0, selected: 0 };
    group.total += 1;
    group.selected += selectedIds.has(String(location.id)) ? 1 : 0;
    groups.set(key, group);
  });

  return [...groups.values()]
    .filter((group) => group.selected > 0)
    .map((group) => {
      const cityName =
        cities.find((city) => isSameId(city.id, group.cityId))?.name || "Без города";
      return group.selected === group.total
        ? `${cityName}: все (${group.total})`
        : `${cityName}: ${group.selected} из ${group.total}`;
    })
    .join(" · ");
}

export function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || "Без вида уборки";
}

export function getVisibleSectionTabs(canView) {
  return cleaningSectionTabs.filter((tab) => tab.accessKeys.some((key) => canView(key)));
}

export function getVisibleControlKindTabs(canView) {
  return controlKindTabs.filter((tab) => canView(tab.accessKey));
}

// Maps URL segments to an accessible section; unknown or forbidden segments fall back to the first visible tab.
export function resolveCleaningsRoute(segments = [], canView) {
  const sectionTabs = getVisibleSectionTabs(canView);
  const [requestedPath, requestedKind] = segments;
  const sectionTab = sectionTabs.find((tab) => tab.path === requestedPath) || sectionTabs[0];

  if (!sectionTab) {
    return null;
  }

  if (sectionTab.value !== "control") {
    return { section: sectionTab.value, controlKind: null, segments: [sectionTab.path] };
  }

  const kindTabs = getVisibleControlKindTabs(canView);
  const kindTab = kindTabs.find((tab) => tab.value === requestedKind) || kindTabs[0];

  return {
    section: sectionTab.value,
    controlKind: kindTab.value,
    segments: [sectionTab.path, kindTab.value],
  };
}

export function getSectionSegments(sectionValue, controlKind = null) {
  const sectionTab = cleaningSectionTabs.find((tab) => tab.value === sectionValue);

  if (!sectionTab) {
    return [];
  }

  return sectionTab.value === "control" && controlKind
    ? [sectionTab.path, controlKind]
    : [sectionTab.path];
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

// Order-insensitive comparison of id lists ("12" and 12 are the same id).
export function isSameIdSet(left = [], right = []) {
  const leftIds = new Set((left || []).map((id) => String(id)));
  const rightIds = new Set((right || []).map((id) => String(id)));

  return leftIds.size === rightIds.size && [...leftIds].every((id) => rightIds.has(id));
}

export function getCategoryTemplateIds(templates = [], categoryId) {
  return templates
    .filter((template) => isSameId(template.categoryId, categoryId))
    .map((template) => template.id);
}

// Stored cafe extra time as the string the dop. time input edits; empty means 0.
export function getSavedDopTime(template) {
  const value = template?.dopTime ?? template?.extraTime;

  return value === "" || value == null ? "0" : String(value);
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

// Local «ЧЧ:ММ» of a timestamp in ms.
export function formatClockTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Status chip and filter key of a control row: deleted rows are split by `deletedBy`;
// plain `deleted` is left for rows without it (old BE).
export function getControlStatusKey(item) {
  if (item?.status !== "deleted") {
    return item?.status;
  }

  if (item.deletedBy === "system") {
    return "deleted_system";
  }

  return item.deletedBy === "manager" ? "deleted_manager" : "deleted";
}

// Deleted before anyone took it: there is no employee and no start to show.
export function isControlItemNeverTaken(item) {
  return item?.status === "deleted" && !item.wasStarted;
}

// `JacoStatusChip` tone and variant of a control status; the variant tells apart statuses of one tone.
export function getControlStatusMeta(status) {
  const meta = {
    pending: { label: "Ожидает подтверждения", tone: "warning", variant: "soft" },
    active: { label: "Активно", tone: "neutral", variant: "outlined" },
    in_progress: { label: "В процессе", tone: "warning", variant: "outlined" },
    approved: { label: "Подтверждено", tone: "success", variant: "soft" },
    deleted: { label: "Удалено", tone: "danger", variant: "soft" },
    deleted_system: {
      label: "Не выполнена — удалена автоматически",
      tone: "danger",
      variant: "soft",
    },
    deleted_manager: { label: "Удалена менеджером", tone: "neutral", variant: "soft" },
  };

  return meta[status] || meta.active;
}

// Long chip labels wrap inside the chip instead of widening a table column.
export const wrappingChipSx = {
  height: "auto",
  minHeight: 24,
  maxWidth: "100%",
  "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 },
};

export const tableHeaderSx = {
  bgcolor: uiTableColors.shiftHeader,
  "& .MuiTableCell-root": {
    py: 1.25,
    color: uiColors.text,
    ...uiTypography.compactLabel,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottom: `1px solid ${uiColors.border}`,
  },
};

export const tableRowSx = {
  "& .MuiTableCell-root": {
    py: 1.5,
    borderBottom: `1px solid ${uiColors.borderLight}`,
  },
  "&:hover": {
    bgcolor: uiTableColors.rowHover,
  },
  "&:hover .cleaning-name-cell": {
    borderLeftColor: uiColors.primary,
  },
};
