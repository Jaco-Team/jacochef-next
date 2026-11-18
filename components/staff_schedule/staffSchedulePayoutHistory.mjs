export const PAYOUT_HISTORY_MODES = ["given", "given_cart", "withheld"];

const MODE_TYPES = { given: 1, given_cart: 2, withheld: 3 };

export function hasPayoutHistory(mode) {
  return PAYOUT_HISTORY_MODES.includes(mode);
}

export function buildPayoutHistoryRequest(request = {}) {
  return {
    date: request.date,
    user_id: request.user_id,
    app_id: request.app_id,
    smena_id: request.smena_id,
  };
}

export function isPayoutHistoryRowCurrentMode(row, mode) {
  return Number(row?.type) === MODE_TYPES[mode];
}

function formatAmount(value) {
  return Number(value ?? 0).toLocaleString("ru-RU");
}

export function formatPayoutHistoryChange(row) {
  return row?.old_price === null || row?.old_price === undefined
    ? formatAmount(row?.price)
    : `${formatAmount(row.old_price)} → ${formatAmount(row.price)}`;
}

export function formatPayoutHistoryDate(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  return match ? `${match[3]}.${match[2]} ${match[4]}:${match[5]}` : String(value ?? "");
}

export function filterPayoutHistoryByMode(rows, mode) {
  return (Array.isArray(rows) ? rows : []).filter((row) => isPayoutHistoryRowCurrentMode(row, mode));
}
