export const CLOSE_BUY_TABS = {
  management: "management",
  history: "history",
};

export const CLOSE_BUY_STATUS_FILTERS = [
  { value: "all", label: "Все" },
  { value: "open", label: "Открытые" },
  { value: "closed", label: "Закрытые" },
];

export function normalizeIsActive(value) {
  return Number(value) === 1 ? 1 : 0;
}

export function getCategoryState(category) {
  const totalCount = Number(category?.count) || 0;
  const openCount = Number(category?.open_count) || 0;

  if (totalCount === 0) return "empty";
  if (openCount === totalCount) return "open";
  if (openCount === 0) return "closed";
  return "mixed";
}

export function getCategoryStatusLabel(state) {
  if (state === "open") return "Открыто";
  if (state === "closed") return "Закрыто";
  if (state === "mixed") return "Смешано";
  return "Пусто";
}

export function getItemStatusLabel(isActive) {
  return normalizeIsActive(isActive) === 1 ? "Открыт" : "Закрыт";
}

export function normalizeCategory(category) {
  const items = Array.isArray(category?.items)
    ? category.items.map((item) => ({
        item_id: Number(item?.item_id) || 0,
        name: String(item?.name || ""),
        category_id: Number(item?.category_id ?? category?.id) || 0,
        is_active: normalizeIsActive(item?.is_active),
      }))
    : [];

  const totalCount = Number(category?.count) || items.length;
  const openCount =
    category?.open_count != null
      ? Number(category.open_count) || 0
      : items.filter((item) => item.is_active === 1).length;
  const closedCount =
    category?.closed_count != null ? Number(category.closed_count) || 0 : totalCount - openCount;
  const normalized = {
    id: Number(category?.id) || 0,
    name: String(category?.name || ""),
    count: totalCount,
    open_count: openCount,
    closed_count: closedCount,
    items,
  };

  return {
    ...normalized,
    status: getCategoryState(normalized),
  };
}

export function normalizeCategories(categories) {
  return Array.isArray(categories) ? categories.map(normalizeCategory) : [];
}

export function normalizeSummary(summary, categories) {
  const fallbackSummary = {
    total_categories: categories.length,
    open_categories: 0,
    closed_categories: 0,
    mixed_categories: 0,
  };

  categories.forEach((category) => {
    if (category.status === "open") fallbackSummary.open_categories += 1;
    if (category.status === "closed") fallbackSummary.closed_categories += 1;
    if (category.status === "mixed") fallbackSummary.mixed_categories += 1;
  });

  if (summary && typeof summary === "object") {
    const totalCategories =
      summary.total_categories != null
        ? Number(summary.total_categories) || 0
        : fallbackSummary.total_categories;
    const openCategories =
      summary.open_categories != null
        ? Number(summary.open_categories) || 0
        : summary.open != null
          ? Number(summary.open) || 0
          : fallbackSummary.open_categories;
    const closedCategories =
      summary.closed_categories != null
        ? Number(summary.closed_categories) || 0
        : summary.closed != null
          ? Number(summary.closed) || 0
          : fallbackSummary.closed_categories;
    const mixedCategories =
      summary.mixed_categories != null
        ? Number(summary.mixed_categories) || 0
        : summary.mixed != null
          ? Number(summary.mixed) || 0
          : fallbackSummary.mixed_categories;

    return {
      total_categories: totalCategories,
      open_categories: openCategories,
      closed_categories: closedCategories,
      mixed_categories: mixedCategories,
    };
  }

  return fallbackSummary;
}

export function filterCategoryItems(items, query) {
  const trimmedQuery = String(query || "")
    .trim()
    .toLowerCase();

  if (!trimmedQuery) return items;

  return items.filter((item) =>
    [item.name, item.item_id].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(trimmedQuery),
    ),
  );
}

export function getVisibleSelectedCategory(categories, selectedCategoryId) {
  if (!categories.length) return null;
  return categories.find((category) => category.id === selectedCategoryId) || categories[0];
}

export function normalizeHistoryEvent(event) {
  const items = Array.isArray(event?.items)
    ? event.items.map((item, index) => ({
        id: `${event?.id || "history"}-${index}-${item?.item_id || "item"}`,
        item_id: Number(item?.item_id) || 0,
        name: String(item?.item_name || ""),
        category_id: Number(item?.category_id) || null,
        category_name: String(item?.category_name || ""),
        old_is_active: normalizeIsActive(item?.is_active_old),
        old_status_label: String(item?.old_status_label || getItemStatusLabel(item?.is_active_old)),
        new_is_active: normalizeIsActive(item?.is_active_new),
        new_status_label: String(item?.new_status_label || getItemStatusLabel(item?.is_active_new)),
        sort: Number(item?.sort) || index,
      }))
    : [];

  return {
    id: String(event?.id || `legacy:${event?.history_id || Date.now()}`),
    date: String(event?.date || ""),
    time: String(event?.time || ""),
    user_id: event?.user_id ?? null,
    user_name: String(event?.user_name || ""),
    point_id: Number(event?.point_id) || 0,
    point_name: String(event?.point_name || ""),
    category_id: Number(event?.category_id) || null,
    category_name: String(event?.category_name || ""),
    event_type: String(event?.event_type || "legacy_change"),
    title: String(event?.title || "Изменение"),
    description: event?.description ? String(event.description) : "",
    comment: event?.comment ? String(event.comment) : "",
    request_id: event?.request_id ? String(event.request_id) : "",
    operation_id: event?.operation_id ? String(event.operation_id) : "",
    transaction_id: event?.transaction_id ? String(event.transaction_id) : "",
    item_count: event?.item_count != null ? Number(event.item_count) || 0 : items.length,
    changed_item_count:
      event?.changed_item_count != null ? Number(event.changed_item_count) || 0 : items.length,
    card_variant: event?.card_variant === "legacy" ? "legacy" : "standard",
    details_available: event?.details_available !== false,
    restore_available: event?.restore_available === true,
    transaction_status: String(event?.transaction_status || "unknown"),
    legacy_reason: event?.legacy_reason ? String(event.legacy_reason) : "",
    timezone: event?.timezone ? String(event.timezone) : "",
    snapshot_version: Number(event?.snapshot_version) || 0,
    meta: event?.meta && typeof event.meta === "object" ? event.meta : {},
    items,
  };
}

export function groupHistoryByDate(history) {
  return history.reduce((acc, event) => {
    const key = event.date || "Без даты";
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

export function getHistoryEventTitle(event) {
  if (event?.title) return event.title;
  if (event.item_count === 1) return "Изменён 1 товар";
  return `Изменено товаров: ${event.item_count}`;
}

export function formatPersonName(value) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) return parts[0] || "";

  const initials = parts
    .slice(1, 3)
    .map((part) => `${Array.from(part.replace(/\.+$/, ""))[0]?.toUpperCase() || ""}.`)
    .filter((part) => part !== ".")
    .join(" ");

  return initials ? `${parts[0]} ${initials}` : parts[0];
}

export function formatHistoryDescription(event) {
  const description = String(event?.description || "");
  const fullName = String(event?.user_name || "").trim();

  if (!description || !fullName) return description;

  return description.replace(fullName, formatPersonName(fullName));
}

export function getReadableError(error, fallback = "Не удалось выполнить запрос") {
  if (typeof error === "string" && error.trim()) return error;
  if (error?.response?.data?.text) return error.response.data.text;
  if (error?.message) return error.message;
  return fallback;
}
