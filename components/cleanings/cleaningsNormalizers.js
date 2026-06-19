import { days, defaultForm } from "./constants";

const PREPARATION_STATUS_FALLBACK = "pending";
const CLEANING_STATUS_FALLBACK = "active";
const LEGACY_DOW_TO_SCHEDULE = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  7: "sun",
  10: "other",
  11: "every_day",
  12: "every_day_shift_end",
  13: "manual",
  14: "after_cleaning",
};
const FALLBACK_SCHEDULE_LABELS = {
  other: "По дням",
  every_day: "Ежедневно",
  every_day_shift_end: "Каждый день после смены",
  manual: "Вручную",
  after_cleaning: "После другой уборки",
};
const FALLBACK_ADDITION_TYPE_LABELS = {
  other: "Без ограничений",
  single_active: "Одна активная",
  unlimited: "Без ограничений",
};
const TEMPLATE_HISTORY_LABELS = {
  name: "Название",
  status: "Статус",
  category: "Категория",
  role: "Роль",
  duration: "Длительность",
  activationCount: "Количество активаций",
  schedule: "Расписание",
  deleteTimes: "Время удаления",
  additionType: "Тип добавления",
  locations: "Локации",
};

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = null) {
  if (value === "" || value == null) {
    return fallback;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function toStringArray(value) {
  return toArray(value)
    .map((item) => (item == null ? "" : String(item)))
    .filter(Boolean);
}

function normalizeLocationIds(value) {
  return [...new Set(toArray(value).map((locationId) => toNumber(locationId, locationId)))].filter(
    (locationId) =>
      locationId !== 0 && locationId !== "0" && locationId != null && locationId !== "",
  );
}

function normalizeOption(item = {}) {
  return {
    value: item?.value ?? item?.id ?? "",
    label: item?.label ?? item?.name ?? "",
  };
}

function normalizeRole(item = {}) {
  if (item && typeof item === "object") {
    return {
      id: toNumber(item.id, item.id),
      name: item.name ? String(item.name) : "",
    };
  }

  const name = item == null ? "" : String(item);
  return {
    id: null,
    name,
  };
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1" || value === "true") {
    return true;
  }

  if (value === 0 || value === "0" || value === "false") {
    return false;
  }

  return fallback;
}

function unwrapData(response) {
  if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return response.data;
  }

  return response || {};
}

function parseJsonObject(value) {
  if (!value) {
    return {};
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function formatHistoryDiffValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeHistoryDiffJson(diffJson) {
  if (!diffJson) {
    return "{}";
  }

  let parsed = diffJson;

  if (typeof diffJson === "string") {
    try {
      parsed = JSON.parse(diffJson);
    } catch {
      return diffJson;
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return "{}";
  }

  const normalized = Object.fromEntries(
    Object.entries(parsed).map(([field, value]) => [
      field,
      {
        from: formatHistoryDiffValue(value?.from),
        to: formatHistoryDiffValue(value?.to),
      },
    ]),
  );

  return JSON.stringify(normalized);
}

function getScheduleLabelByDow(dow, scheduleTypeOptions = []) {
  const scheduleType = LEGACY_DOW_TO_SCHEDULE[toNumber(dow, dow)];

  if (!scheduleType) {
    return "";
  }

  const optionLabel = scheduleTypeOptions.find((option) => option.value === scheduleType)?.label;
  if (optionLabel) {
    return optionLabel;
  }

  return (
    days.find((day) => day.value === scheduleType)?.label ||
    FALLBACK_SCHEDULE_LABELS[scheduleType] ||
    ""
  );
}

function getAdditionTypeLabel(typeTime, additionTypeOptions = []) {
  const additionType =
    {
      0: "other",
      1: "single_active",
      2: "unlimited",
    }[toNumber(typeTime, typeTime)] || "";

  if (!additionType) {
    return "";
  }

  return (
    additionTypeOptions.find((option) => option.value === additionType)?.label ||
    FALLBACK_ADDITION_TYPE_LABELS[additionType] ||
    ""
  );
}

function getRoleLabel(roleId, roles = []) {
  return roles.find((role) => String(role.id) === String(roleId))?.name || "";
}

function getCategoryLabel(categoryId, categories = []) {
  return categories.find((category) => String(category.id) === String(categoryId))?.name || "";
}

function getLocationLabel(locationId, locations = []) {
  return locations.find((location) => String(location.id) === String(locationId))?.name || "";
}

function sortTimes(left, right) {
  return String(left).localeCompare(String(right));
}

function formatTimeList(times = []) {
  const normalizedTimes = toArray(times)
    .filter(Boolean)
    .map((time) => String(time))
    .sort(sortTimes);

  return normalizedTimes.length ? normalizedTimes.join(", ") : "";
}

function formatPointSummary(points = [], locations = []) {
  const labels = toArray(points)
    .map((point) => {
      const locationName = getLocationLabel(point?.point_id, locations);
      const dopTime = toNumber(point?.dop_time, 0) || 0;

      if (!locationName) {
        return "";
      }

      return dopTime > 0 ? `${locationName} (+${dopTime} мин)` : locationName;
    })
    .filter(Boolean);

  return labels.join(", ");
}

function normalizeTemplateHistorySnapshot(snapshot, context = {}) {
  const template =
    snapshot?.template && typeof snapshot.template === "object" ? snapshot.template : {};
  const times = toArray(snapshot?.times);
  const startTimes = formatTimeList(
    times
      .filter((item) => toNumber(item?.type_action, item?.type_action) === 1)
      .map((item) => item?.time_action),
  );
  const deleteTimes = formatTimeList(
    times
      .filter((item) => toNumber(item?.type_action, item?.type_action) === 2)
      .map((item) => item?.time_action),
  );
  const scheduleLabel = getScheduleLabelByDow(template?.dow, context.scheduleTypeOptions);

  return {
    name: template?.name ? String(template.name) : "",
    status: toBoolean(template?.is_active, true) ? "Активная" : "Архив",
    category: getCategoryLabel(template?.type_new, context.categories),
    role: getRoleLabel(template?.app_id, context.roles),
    duration:
      template?.time_min != null && template?.time_min !== "" ? `${template.time_min} мин` : "",
    activationCount:
      template?.max_count != null && template?.max_count !== "" ? String(template.max_count) : "",
    schedule: `${scheduleLabel || "Без дней"} · ${startTimes || "Без времени"}`,
    deleteTimes: deleteTimes || "",
    additionType: getAdditionTypeLabel(template?.type_time, context.additionTypeOptions),
    locations: formatPointSummary(snapshot?.points, context.locations),
  };
}

function buildTemplateHistoryDiffJson(item, context = {}) {
  const beforeSnapshot = normalizeTemplateHistorySnapshot(
    parseJsonObject(item?.before_json),
    context,
  );
  const afterSnapshot = normalizeTemplateHistorySnapshot(
    parseJsonObject(item?.after_json),
    context,
  );

  const diffEntries = Object.entries(TEMPLATE_HISTORY_LABELS).reduce((acc, [key, label]) => {
    const from = beforeSnapshot[key] || "";
    const to = afterSnapshot[key] || "";

    if (from === to || (!from && !to)) {
      return acc;
    }

    acc[label] = { from, to };
    return acc;
  }, {});

  if (Object.keys(diffEntries).length > 0) {
    return JSON.stringify(diffEntries);
  }

  return null;
}

function normalizeTemplateStatus(status) {
  return status === "archive" ? "archive" : "active";
}

function normalizeScheduleTypeForPayload(scheduleType, days = []) {
  if (days.length === 1 && scheduleType === days[0]) {
    return "weekly";
  }

  return scheduleType || null;
}

function normalizeControlStatus(status) {
  return ["active", "in_progress", "pending", "approved"].includes(status)
    ? status
    : CLEANING_STATUS_FALLBACK;
}

function normalizePreparationStatus(status) {
  return ["pending", "approved"].includes(status) ? status : PREPARATION_STATUS_FALLBACK;
}

function normalizeLegacyControlStatus(item = {}) {
  if (item.manager_time) {
    return "approved";
  }

  if (item.date_time_start && item.date_time_end) {
    return "pending";
  }

  if (item.date_time_start) {
    return "in_progress";
  }

  return CLEANING_STATUS_FALLBACK;
}

export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function normalizeLocation(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    base: item.base ? String(item.base) : "",
    cityId: toNumber(item.city_id, item.city_id ?? null),
  };
}

export function createLocationCities(locations = []) {
  return Object.values(
    locations.reduce((acc, location) => {
      if (!location?.city) {
        return acc;
      }

      if (!acc[location.city]) {
        acc[location.city] = {
          id: location.city,
          name: location.city,
          cafes: [],
        };
      }

      acc[location.city].cafes.push({
        id: location.id,
        name: location.name,
      });

      return acc;
    }, {}),
  );
}

export function normalizeTemplate(item = {}) {
  return {
    ...defaultForm,
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    categoryId: toNumber(item.categoryId ?? item.category_id, item.categoryId ?? item.category_id),
    role: item.role ? String(item.role) : "",
    roleId: toNumber(item.roleId ?? item.role_id, item.roleId ?? item.role_id ?? null),
    duration: item.duration === "" ? "" : toNumber(item.duration, ""),
    dopTime:
      item.dopTime === "" || item.dop_time === ""
        ? ""
        : toNumber(item.dopTime ?? item.dop_time, ""),
    activationCount:
      item.activationCount === "" || item.activationCount == null
        ? ""
        : toNumber(item.activationCount ?? item.activation_count, ""),
    additionType: item.additionType || item.addition_type || "",
    confirmation: toBoolean(item.confirmation, false),
    scheduleType: item.scheduleType || item.schedule_type || "",
    triggerCleaningId: toNumber(
      item.triggerCleaningId ?? item.trigger_cleaning_id,
      item.triggerCleaningId ?? item.trigger_cleaning_id ?? null,
    ),
    days: toStringArray(item.days),
    times: toStringArray(item.times),
    deleteTimes: toStringArray(item.deleteTimes ?? item.delete_times),
    locationIds: normalizeLocationIds(item.locationIds ?? item.location_ids),
    status: normalizeTemplateStatus(item.status),
  };
}

export function normalizeCategory(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    instruction: item.instruction ? String(item.instruction) : "",
    templatesCount: toNumber(item.templatesCount ?? item.templates_count, 0) || 0,
    deletable: toBoolean(item.deletable, true),
  };
}

export function normalizeControlItem(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : item.name_work ? String(item.name_work) : "",
    cleaningId: toNumber(item.cleaningId ?? item.cleaning_id, item.cleaningId ?? item.cleaning_id),
    locationId: toNumber(
      item.locationId ?? item.location_id ?? item.point_id,
      item.locationId ?? item.location_id ?? item.point_id,
    ),
    date: item.date ? String(item.date) : item.date_start_work ? String(item.date_start_work) : "",
    employee: item.employee ? String(item.employee) : item.user_name ? String(item.user_name) : "",
    startedAt: item.startedAt || item.started_at || item.date_time_start || "",
    finishedAt: item.finishedAt || item.finished_at || item.date_time_end || "",
    confirmedAt: item.confirmedAt || item.confirmed_at || item.manager_time || "",
    confirmer: item.confirmer
      ? String(item.confirmer)
      : item.manager_name
        ? String(item.manager_name)
        : "",
    status: normalizeControlStatus(item.status || normalizeLegacyControlStatus(item)),
  };
}

export function normalizePreparationItem(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    locationId: toNumber(item.locationId ?? item.location_id, item.locationId ?? item.location_id),
    preparedAt: item.preparedAt || item.prepared_at || "",
    volume: item.volume == null ? "" : String(item.volume),
    waste: item.waste == null ? "" : String(item.waste),
    unit: item.unit ? String(item.unit) : "",
    employee: item.employee ? String(item.employee) : "",
    helper: item.helper ? String(item.helper) : "",
    confirmedAt: item.confirmedAt || item.confirmed_at || "",
    confirmer: item.confirmer ? String(item.confirmer) : "",
    status: normalizePreparationStatus(item.status),
  };
}

export function normalizePreparationEditItem(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : item.name_work ? String(item.name_work) : "",
    locationId: toNumber(
      item.locationId ?? item.location_id ?? item.point_id,
      item.locationId ?? item.location_id ?? item.point_id ?? "",
    ),
    employee: item.employee ? String(item.employee) : item.user_name ? String(item.user_name) : "",
    confirmer: item.confirmer
      ? String(item.confirmer)
      : item.manager_name
        ? String(item.manager_name)
        : "",
    volume:
      item.volume != null
        ? String(item.volume)
        : item.count_pf != null
          ? String(item.count_pf)
          : "",
    waste:
      item.waste != null
        ? String(item.waste)
        : item.count_trash != null
          ? String(item.count_trash)
          : "",
    history: toArray(item.hist).map((historyItem, index) => ({
      id:
        historyItem?.id ??
        `${historyItem?.date_time || ""}-${historyItem?.user_name || ""}-${index}`,
      userName: historyItem?.user_name ? String(historyItem.user_name) : "",
      dateTime: historyItem?.date_time ? String(historyItem.date_time) : "",
      oldVolume: historyItem?.old_count_pf == null ? "" : String(historyItem.old_count_pf),
      oldWaste: historyItem?.old_count_trash == null ? "" : String(historyItem.old_count_trash),
      newVolume: historyItem?.new_count_pf == null ? "" : String(historyItem.new_count_pf),
      newWaste: historyItem?.new_count_trash == null ? "" : String(historyItem.new_count_trash),
    })),
  };
}

export function normalizeHistoryRows(response, context = {}) {
  const data = unwrapData(response);
  return toArray(data.history)
    .map((item) => {
      const diffJson =
        item?.scope === "templates"
          ? buildTemplateHistoryDiffJson(item, context)
          : normalizeHistoryDiffJson(item?.diff_json);

      if (item?.scope === "templates" && !diffJson) {
        return null;
      }

      return {
        id: item?.id ?? `${item?.created_at || ""}-${item?.event_type || ""}`,
        created_at: item?.created_at || "",
        actor_name: item?.actor_name || "",
        event_type: item?.event_type || "",
        diff_json: diffJson,
      };
    })
    .filter(Boolean);
}

export function normalizeBootstrap(response) {
  const data = unwrapData(response);

  return {
    moduleInfo: data.module_info || {},
    locations: toArray(data.locations).map(normalizeLocation),
    roles: toArray(data.roles)
      .map(normalizeRole)
      .filter((item) => item.name),
    scheduleTypeOptions: toArray(data.scheduleTypeOptions).map(normalizeOption),
    additionTypeOptions: toArray(data.additionTypeOptions).map(normalizeOption),
    access: data.access && typeof data.access === "object" ? data.access : {},
  };
}

export function normalizeTemplatesResponse(response) {
  const data = unwrapData(response);

  return toArray(data.templates).map(normalizeTemplate);
}

export function normalizeCategoriesResponse(response) {
  const data = unwrapData(response);

  return toArray(data.categories).map(normalizeCategory);
}

export function normalizeCafesResponse(response) {
  const data = unwrapData(response);

  return {
    selectedLocationId: toNumber(
      data.selectedLocationId ?? data.selected_location_id,
      data.selectedLocationId ?? data.selected_location_id ?? "",
    ),
    assignedTemplates: toArray(data.assignedTemplates ?? data.assigned_templates).map(
      normalizeTemplate,
    ),
    availableTemplates: toArray(data.availableTemplates ?? data.available_templates).map(
      normalizeTemplate,
    ),
  };
}

export function normalizeControlResponse(response) {
  const data = unwrapData(response);

  return {
    cleanings: toArray(
      data.items?.length ? data.items : data.cleanings?.length ? data.cleanings : data.work,
    ).map(normalizeControlItem),
    preparations: toArray(data.preparations?.length ? data.preparations : data.pf_list).map(
      normalizePreparationItem,
    ),
    manualTemplates: toArray(
      data.availableManualCleanings ??
        data.manualTemplates ??
        data.manual_templates ??
        data.all_work,
    ).map(normalizeTemplate),
    permissions: data.permissions && typeof data.permissions === "object" ? data.permissions : {},
  };
}

export function normalizePreparationEditResponse(response) {
  const data = unwrapData(response);
  return normalizePreparationEditItem(data.item || {});
}

export function normalizeCategoryPayload(category = {}) {
  return {
    name: category.name ? String(category.name).trim() : "",
    instruction: category.instruction || "",
  };
}

export function normalizeTemplatePayload(template = {}) {
  const normalizedTemplate = normalizeTemplate(template);
  const normalizedScheduleType = normalizeScheduleTypeForPayload(
    normalizedTemplate.scheduleType,
    normalizedTemplate.days,
  );

  return {
    name: normalizedTemplate.name.trim(),
    categoryId: normalizedTemplate.categoryId,
    roleId: normalizedTemplate.roleId,
    duration: normalizedTemplate.duration === "" ? null : normalizedTemplate.duration,
    confirmation: normalizedTemplate.confirmation,
    scheduleType: normalizedScheduleType,
    days: normalizedTemplate.days,
    times: normalizedTemplate.times,
    deleteTimes: normalizedTemplate.deleteTimes,
    activationCount:
      normalizedTemplate.activationCount === "" ? null : normalizedTemplate.activationCount,
    additionType: normalizedTemplate.additionType || null,
    triggerCleaningId: normalizedTemplate.triggerCleaningId ?? 0,
    locationIds: normalizedTemplate.locationIds,
  };
}
