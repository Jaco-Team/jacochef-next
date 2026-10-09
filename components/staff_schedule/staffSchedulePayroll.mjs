import { createStaffSchedulePolicy } from "./staffScheduleAccess.mjs";

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function computeTotalSum(row = {}) {
  if (Object.prototype.hasOwnProperty.call(row, "total_sum")) return row.total_sum ?? "";
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
  if (Object.prototype.hasOwnProperty.call(row, "to_pay_sum")) return row.to_pay_sum ?? "";
  if (row.app_type === "driver") {
    return "";
  }

  return computeTotalSum(row) - toNumber(row.given_cart) - toNumber(row.withheld);
}

export function computePremiumSheet(row = {}) {
  if (Object.prototype.hasOwnProperty.call(row, "premium_sheet")) return row.premium_sheet ?? "";
  return computeTotalSum(row) - toNumber(row.h_price);
}

export function getAvailablePayoutAmount(row = {}, access = {}, mode) {
  const policy = createStaffSchedulePolicy(access);
  if (
    !["given", "given_cart"].includes(mode) ||
    !policy.canShowSalaryBlock ||
    !policy.canView("all_price") ||
    !policy.canView("withheld") ||
    (mode === "given" && !policy.canView("given_cart"))
  )
    return null;
  const values = [computeTotalSum(row), row.withheld];
  if (mode === "given") values.push(row.given_cart);
  if (
    values.some(
      (value) => value == null || String(value).trim() === "" || !Number.isFinite(Number(value)),
    )
  )
    return null;
  return Number(values[0]) - Number(values[1]) - Number(values[2] ?? 0);
}
