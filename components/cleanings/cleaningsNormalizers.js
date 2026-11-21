import { LEGACY_ONLY_OPTION_VALUE, defaultForm } from "./constants";

const PREPARATION_STATUS_FALLBACK = "pending";
const CLEANING_STATUS_FALLBACK = "active";
const CONTROL_DELETED_BY = ["system", "manager"];

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

// BE accepts strictly HH:MM: legacy "9:05" / "10:00:00" become "09:05" / "10:00", anything else is left for validation.
function toShortTime(value) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : value;
}

function toTimeList(value) {
  return toStringArray(value).map((time) => toShortTime(time.trim()));
}

function normalizeLocationIds(value) {
  return [...new Set(toArray(value).map((locationId) => toNumber(locationId, locationId)))].filter(
    (locationId) =>
      locationId !== 0 && locationId !== "0" && locationId != null && locationId !== "",
  );
}

// Older BE sends options without `description` / `selectable`: every option except "other" stays selectable.
function normalizeOption(item = {}) {
  const value = item?.value ?? item?.id ?? "";

  return {
    value,
    label: item?.label ?? item?.name ?? "",
    description: item?.description ? String(item.description) : "",
    selectable: toBoolean(item?.selectable, value !== LEGACY_ONLY_OPTION_VALUE),
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
  return ["active", "in_progress", "pending", "approved", "deleted"].includes(status)
    ? status
    : CLEANING_STATUS_FALLBACK;
}

function normalizePreparationStatus(status) {
  return ["pending", "approved"].includes(status) ? status : PREPARATION_STATUS_FALLBACK;
}

function normalizeLegacyControlStatus(item = {}) {
  if (item.is_delete === 1 || item.is_delete === "1") {
    return "deleted";
  }

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

// `fallbackCityId` comes from raw bootstrap `points` for BE versions without `cityId`.
export function normalizeLocation(item = {}, fallbackCityId = null) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    base: item.base ? String(item.base) : "",
    cityId: toNumber(item.cityId ?? item.city_id ?? item.legacy?.city_id, null) ?? fallbackCityId,
    city: item.city ? String(item.city) : "",
  };
}

function getCityNameFromLocation(location) {
  if (location.city) {
    return location.city;
  }

  const [prefix, rest] = location.name.split(",");
  return rest ? prefix.trim() : "";
}

// Bootstrap `cities`; without them the list is derived from the locations themselves.
function normalizeCities(value, locations = []) {
  const cities = toArray(value)
    .map((city) => ({
      id: toNumber(city?.id, null),
      name: city?.name ? String(city.name) : "",
    }))
    .filter((city) => city.id != null && city.name);

  if (cities.length) {
    return cities;
  }

  const derived = new Map();
  locations.forEach((location) => {
    if (location.cityId == null || derived.has(location.cityId)) {
      return;
    }

    derived.set(location.cityId, {
      id: location.cityId,
      name: getCityNameFromLocation(location) || "Без города",
    });
  });

  return [...derived.values()];
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
    times: toTimeList(item.times),
    deleteTimes: toTimeList(item.deleteTimes ?? item.delete_times),
    is_not_del: toBoolean(item.is_not_del, false),
    is_need: toBoolean(item.is_need, false),
    locationIds: normalizeLocationIds(item.locationIds ?? item.location_ids),
    status: normalizeTemplateStatus(item.status),
  };
}

export function normalizeManualTemplate(item = {}) {
  return {
    id: toNumber(item.id, item.id),
    name: item.name ? String(item.name) : "",
    roleId: toNumber(item.roleId, null),
    role: item.role ? String(item.role) : "",
    categoryId: toNumber(item.categoryId, null),
    category: item.category ? String(item.category) : "",
    duration: toNumber(item.duration, null),
    maxCount: toNumber(item.maxCount, 0) || 0,
    todayCount: toNumber(item.todayCount, 0) || 0,
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
  const workNameSource = item.name ?? item.name_work ?? item.legacy?.name_work;
  const workName = workNameSource ? String(workNameSource) : "";
  const startedAt = item.startedAt || item.started_at || item.date_time_start || "";

  return {
    id: toNumber(item.id, item.id),
    name: workName,
    workName,
    cleaningId: toNumber(
      item.cleaningId ?? item.cleaning_id ?? item.id_work,
      item.cleaningId ?? item.cleaning_id ?? item.id_work,
    ),
    locationId: toNumber(
      item.locationId ?? item.location_id ?? item.point_id,
      item.locationId ?? item.location_id ?? item.point_id,
    ),
    date: item.date ? String(item.date) : item.date_start_work ? String(item.date_start_work) : "",
    employee: item.employee ? String(item.employee) : item.user_name ? String(item.user_name) : "",
    startedAt,
    finishedAt: item.finishedAt || item.finished_at || item.date_time_end || "",
    confirmedAt: item.confirmedAt || item.confirmed_at || item.manager_time || "",
    confirmer: item.confirmer
      ? String(item.confirmer)
      : item.manager_name
        ? String(item.manager_name)
        : "",
    status: normalizeControlStatus(item.status || normalizeLegacyControlStatus(item)),
    deletedBy: CONTROL_DELETED_BY.includes(item.deletedBy) ? item.deletedBy : null,
    deleteReason: item.deleteReason ? String(item.deleteReason).trim() : "",
    wasStarted: toBoolean(item.wasStarted, Boolean(startedAt)),
    returnsCount: toNumber(item.returnsCount, 0) || 0,
    eventsCount: toNumber(item.eventsCount, 0) || 0,
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
    eventsCount: toNumber(item.eventsCount, 0) || 0,
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

// Raw `history` rows; labels are resolved at render time by `cleaningsHistoryPresenter`.
export function normalizeHistoryResponse(response) {
  return toArray(unwrapData(response).history);
}

export function normalizeBootstrap(response) {
  const data = unwrapData(response);

  const pointCityIds = new Map(
    toArray(data.points).map((point) => [String(point?.id), toNumber(point?.city_id, null)]),
  );
  const locations = toArray(data.locations).map((location) =>
    normalizeLocation(location, pointCityIds.get(String(location?.id)) ?? null),
  );

  return {
    moduleInfo: data.module_info || {},
    locations,
    cities: normalizeCities(data.cities, locations),
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
  const seenCleaningIds = new Set();
  const cleanings = Array.isArray(data.cleanings)
    ? data.cleanings
    : [...toArray(data.items?.length ? data.items : data.work), ...toArray(data.all_work)].filter(
        (item) => {
          if (item?.id == null) {
            return true;
          }

          const cleaningId = String(item.id);
          if (seenCleaningIds.has(cleaningId)) {
            return false;
          }

          seenCleaningIds.add(cleaningId);
          return true;
        },
      );

  return {
    cleanings: cleanings.map(normalizeControlItem),
    preparations: toArray(data.preparations?.length ? data.preparations : data.pf_list).map(
      normalizePreparationItem,
    ),
    manualTemplates: toArray(data.manualTemplates).map(normalizeManualTemplate),
    manualTemplatesSupported: Array.isArray(data.manualTemplates),
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
    is_not_del: normalizedTemplate.is_not_del,
    is_need: normalizedTemplate.is_need,
    activationCount:
      normalizedTemplate.activationCount === "" ? null : normalizedTemplate.activationCount,
    additionType: normalizedTemplate.additionType || null,
    triggerCleaningId: normalizedTemplate.triggerCleaningId ?? 0,
    locationIds: normalizedTemplate.locationIds,
  };
}
