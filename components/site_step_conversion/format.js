const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return numberFormat.format(number);
}

export function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${decimalFormat.format(number)}%`;
}

export function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${numberFormat.format(Math.round(number))} ₽`;
}

export function formatSeconds(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const text = Number.isInteger(number)
    ? numberFormat.format(number)
    : decimalFormat.format(number);
  return `${text} с`;
}

export function formatKpiValue(value, format) {
  if (format === "percent") return formatPercent(value);
  if (format === "money") return formatMoney(value);
  return formatNumber(value);
}

export function displayText(value) {
  if (value == null || value === "") return "—";
  return String(value);
}
