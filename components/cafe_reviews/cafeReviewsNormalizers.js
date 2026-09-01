const EMPTY_PAGINATION = {
  page: 1,
  per_page: 20,
  total: 0,
  total_pages: 1,
};

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function asNumber(value, fallback = 0) {
  if (value === "" || value == null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function asBoolean(value) {
  return value === true || value === 1 || value === "1";
}

export function normalizeOption(item) {
  if (typeof item === "string") {
    return { value: item, label: item };
  }
  if (!item || typeof item !== "object") return null;

  return {
    value: item.value ?? "",
    label: String(item.label ?? ""),
  };
}

export function normalizePoint(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id,
    name: String(item.name ?? ""),
    city_id: item.city_id ?? null,
  };
}

export function normalizeCity(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id,
    name: String(item.name ?? ""),
  };
}

export function normalizeIssue(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? null,
    code: String(item.code ?? ""),
    name: String(item.label ?? item.name ?? item.label_ru ?? ""),
  };
}

export function normalizePagination(value) {
  const pagination = asObject(value);

  return {
    page: Math.max(1, asNumber(pagination.page, EMPTY_PAGINATION.page)),
    per_page: Math.max(1, asNumber(pagination.per_page, EMPTY_PAGINATION.per_page)),
    total: Math.max(0, asNumber(pagination.total, EMPTY_PAGINATION.total)),
    total_pages: Math.max(
      1,
      asNumber(
        pagination.total_pages,
        asNumber(pagination.last_page, EMPTY_PAGINATION.total_pages),
      ),
    ),
  };
}

export function normalizeBootstrap(response) {
  const data = asObject(response);
  const dictionaries = asObject(data.dictionaries);
  const filters = asObject(data.filters);
  const statusLabels = {
    partial: "Частичный",
    completed: "Завершён",
    blocked: "Заблокирован",
    new: "Новый",
    in_progress: "В работе",
    resolved: "Решён",
    dismissed: "Отклонён",
  };
  const severityLabels = {
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
    critical: "Критическая",
  };
  const normalizeOptions = (values, labels = {}) =>
    asArray(values)
      .map((item) => {
        const option = normalizeOption(item);
        if (!option) return null;
        return {
          ...option,
          label: labels[option.value] || option.label || String(option.value),
        };
      })
      .filter(Boolean);
  const dictionaryStatuses = normalizeOptions(dictionaries.statuses, statusLabels);
  const reviewStatuses = normalizeOptions(
    asArray(dictionaries.review_statuses).length
      ? dictionaries.review_statuses
      : filters.review_statuses,
    statusLabels,
  );
  const incidentStatuses = normalizeOptions(
    asArray(dictionaries.incident_statuses).length
      ? dictionaries.incident_statuses
      : filters.incident_statuses,
    statusLabels,
  );
  const statuses = dictionaryStatuses.length
    ? dictionaryStatuses
    : [...reviewStatuses, ...incidentStatuses].filter(
        (option, index, options) =>
          options.findIndex((item) => item.value === option.value) === index,
      );
  const severities = normalizeOptions(
    asArray(dictionaries.severities).length ? dictionaries.severities : filters.severities,
    severityLabels,
  );
  const issueDefinitions = asArray(dictionaries.issues).length
    ? dictionaries.issues
    : asArray(data.issue_definitions).length
      ? data.issue_definitions
      : filters.issues;

  return {
    module_info: asObject(data.module_info),
    access: asObject(data.access),
    points: asArray(data.points).map(normalizePoint).filter(Boolean),
    cities: asArray(data.cities).map(normalizeCity).filter(Boolean),
    dictionaries: {
      statuses,
      review_statuses: reviewStatuses.length ? reviewStatuses : statuses,
      incident_statuses: incidentStatuses.length ? incidentStatuses : statuses,
      severities,
      issues: asArray(issueDefinitions).map(normalizeIssue).filter(Boolean),
    },
  };
}

export function normalizeReview(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id,
    created_at: item.created_at ?? "",
    completed_at: item.completed_at ?? "",
    point_id: item.point_id ?? null,
    point_name: String(item.point_name ?? ""),
    city_id: item.city_id ?? null,
    city_name: String(item.city_name ?? ""),
    rating: asNumber(item.rating, 0),
    status: String(item.status ?? ""),
    comment: String(item.comment ?? ""),
    has_photos: asBoolean(item.has_photos),
    issues_count: asNumber(item.issues_count, 0),
    incident_id: item.incident?.id ?? null,
  };
}

export function normalizeIncident(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id,
    review_id: item.review_id ?? null,
    created_at: item.created_at ?? "",
    updated_at: item.updated_at ?? "",
    point_id: item.point_id ?? null,
    point_name: String(item.point_name ?? ""),
    city_id: item.city_id ?? null,
    city_name: String(item.city_name ?? ""),
    rating: asNumber(item.rating, 0),
    status: String(item.status ?? ""),
    severity: item.severity == null ? "" : String(item.severity),
    comment: "",
    review_comment: String(item.review_comment ?? ""),
    has_photos: asBoolean(item.has_photos),
    issues_count: asNumber(item.issues_count, 0),
    lock_version: asNumber(item.lock_version, 0),
  };
}

export function normalizeList(response, itemKey, itemNormalizer) {
  const data = asObject(response);
  const collection = asObject(data[itemKey]);

  return {
    items: asArray(collection.items).map(itemNormalizer).filter(Boolean),
    pagination: normalizePagination(collection.pagination),
  };
}

export function normalizeDashboard(response) {
  const data = asObject(asObject(response).dashboard);
  const incidentCounts = asArray(data.incidents);
  const incidentsTotal = incidentCounts.reduce(
    (total, item) => total + asNumber(item?.total, 0),
    0,
  );
  const incidentsOpen = incidentCounts
    .filter((item) => !["resolved", "dismissed"].includes(item?.status))
    .reduce((total, item) => total + asNumber(item?.total, 0), 0);

  return {
    summary: {
      reviews_total: asNumber(data.reviews_total, 0),
      completed_total: asNumber(data.completed_total, 0),
      average_rating: asNumber(data.average_rating, 0),
      incidents_total: incidentsTotal,
      incidents_open: incidentsOpen,
      reviews_with_photos: asNumber(data.reviews_with_photos, 0),
    },
    rating_distribution: asArray(data.ratings).map((item) => ({
      rating: asNumber(item?.rating, 0),
      count: asNumber(item?.total, 0),
    })),
    points: asArray(data.points).map((item) => ({
      point_id: item?.point_id ?? null,
      point_name: String(item?.point_name ?? ""),
      city_id: item?.city_id ?? null,
      city_name: String(item?.city_name ?? ""),
      reviews_total: asNumber(item?.reviews_total, 0),
      average_rating: asNumber(item?.average_rating, 0),
      reviews_with_photos: asNumber(item?.reviews_with_photos, 0),
      incidents_total: asNumber(item?.incidents_total, 0),
      incidents_open: asNumber(item?.open_incidents, 0),
    })),
  };
}

function normalizePhoto(item) {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id,
    mime_type: String(item.mime_type ?? ""),
  };
}

function normalizeEvent(item) {
  if (!item || typeof item !== "object") return null;
  const actor = asObject(item.actor);

  return {
    id: item.id,
    created_at: item.created_at ?? "",
    actor: {
      id: actor.id ?? null,
      type: String(actor.type ?? ""),
      name: String(actor.name ?? ""),
    },
    event_type: String(item.event_type ?? ""),
    status_from: item.status_from == null ? "" : String(item.status_from),
    status_to: item.status_to == null ? "" : String(item.status_to),
    severity: item.severity == null ? "" : String(item.severity),
    comment: String(item.comment ?? ""),
    ai_analysis_id: item.ai_analysis_id ?? null,
  };
}

function normalizeAiAnalysis(value) {
  const item = asObject(value);
  if (!Object.keys(item).length) return null;

  return {
    id: item.id,
    summary_ru: String(item.summary_ru ?? ""),
    suggested_severity: String(item.suggested_severity ?? ""),
    suggested_category: String(item.suggested_category ?? ""),
    recommended_actions: asArray(item.actions).map(String),
    evidence: asArray(item.evidence)
      .map((evidence) => {
        if (typeof evidence === "string") return evidence;
        if (!evidence || typeof evidence !== "object") return "";
        return [
          evidence.issue_code ? `Причина: ${evidence.issue_code}` : "",
          evidence.photo_id ? `Фото: ${evidence.photo_id}` : "",
        ]
          .filter(Boolean)
          .join(", ");
      })
      .filter(Boolean),
    confidence: asNumber(item.confidence, 0),
    pii_detected: asBoolean(item.pii_detected),
    image_uncertain: asBoolean(item.image_uncertain),
    human_decision: String(item.human_decision ?? ""),
  };
}

export function normalizeReviewDetail(response) {
  const data = asObject(response);
  const review = asObject(data.review);

  return {
    review: normalizeReview(review),
    issues: asArray(review.issues).map(normalizeIssue).filter(Boolean),
    photos: asArray(review.photos).map(normalizePhoto).filter(Boolean),
    incident: normalizeIncident(review.incident),
  };
}

export function normalizeIncidentDetail(response) {
  const data = asObject(response);
  const incident = asObject(data.incident);
  const nestedReview = asObject(incident.review);
  const review = {
    ...nestedReview,
    point_id: nestedReview.point_id ?? incident.point_id,
    point_name: nestedReview.point_name ?? incident.point_name,
    city_id: nestedReview.city_id ?? incident.city_id,
    city_name: nestedReview.city_name ?? incident.city_name,
  };

  return {
    incident: normalizeIncident(incident),
    review: normalizeReview(review),
    issues: asArray(incident.issues).map(normalizeIssue).filter(Boolean),
    photos: asArray(incident.photos).map(normalizePhoto).filter(Boolean),
    events: asArray(incident.events).map(normalizeEvent).filter(Boolean),
    ai_analysis: normalizeAiAnalysis(incident.ai_analysis),
  };
}

export function getDefaultFilters() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 29);

  const toDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    date_from: toDateInput(dateFrom),
    date_to: toDateInput(dateTo),
    city_id: "",
    point_id: "",
    rating: "",
    review_status: "",
    incident_status: "",
    severity: "",
    issue: "",
    has_photo: "",
    search: "",
  };
}

export function buildFilterPayload(filters, section) {
  const payload = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        !["point_id", "review_status", "incident_status"].includes(key) &&
        value !== "" &&
        value != null,
    ),
  );
  if (filters.point_id !== "" && filters.point_id != null) {
    payload.point_ids = [filters.point_id];
  }
  const status = section === "incidents" ? filters.incident_status : filters.review_status;
  if (status) {
    payload[section === "overview" ? "review_status" : "status"] = status;
  }
  return payload;
}
