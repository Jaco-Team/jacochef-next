/**
 * Format number as Russian price
 * @param {number|string} value - The price to format
 * @param {boolean} withCurrency - Whether to append ₽ symbol
 * @returns {string}
 */
export default function formatPrice(value, withCurrency = false) {
  if (!Number(value) || isNaN(value)) return value;

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));

  return withCurrency ? `${formatted} ₽` : formatted;
}
