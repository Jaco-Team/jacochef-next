export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function computeTotalSum(row = {}) {
  return (
    toNumber(row.dop_bonus) +
    toNumber(row.dir_price) +
    toNumber(row.register_price) +
    toNumber(row.dir_price_dop) +
    toNumber(row.h_price) +
    toNumber(row.my_bonus) -
    toNumber(row.err_price)
  );
}

export function computeToPaySum(row = {}) {
  if (row.app_type === "driver") {
    return "";
  }

  return computeTotalSum(row) - toNumber(row.given_cart) - toNumber(row.withheld);
}

export function computePremiumSheet(row = {}) {
  return computeTotalSum(row) - toNumber(row.h_price);
}
