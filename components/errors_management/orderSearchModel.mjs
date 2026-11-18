export const ORDER_NUMBER_DIGITS_HINT = "Номер заказа — только цифры";

export function orderNumberLookup(value) {
  const text = String(value ?? "").trim();
  const exact = /^\d+$/.test(text);
  return { text, exact, invalid: text !== "" && !exact };
}

export function orderSearchPeriod(filters) {
  const { exact } = orderNumberLookup(filters?.orderNumber);
  return {
    date_from: exact ? "" : filters?.dateFrom || "",
    date_to: exact ? "" : filters?.dateTo || "",
  };
}

export function journalOrderFilters(filters) {
  const { text, exact } = orderNumberLookup(filters?.orderNumber);
  return {
    order_id: exact ? text : null,
    date_from: exact ? null : filters?.dateFrom || null,
    date_to: exact ? null : filters?.dateTo || null,
  };
}
