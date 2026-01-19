export function formatNumber(num, mindec = 2, maxdec = null) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: mindec,
    maximumFractionDigits: maxdec || mindec,
  }).format(Number(num));
}

/**
 * Russian pluralization helper.
 *
 * @param {number|string} count
 *        Value to pluralize by. Will be forced to a non-negative integer.
 *
 * @param {[string, string, string]} forms
 *        Array of 3 forms:
 *        [one, few, many]
 *        Examples:
 *        ["операция", "операции", "операций"]
 *        ["товар", "товара", "товаров"]
 *
 * @returns {string}
 *        String in format: "\<count\> \<correctWordForm\>"
 *
 * @example
 * formatPlural(3, ["операция", "операции", "операций"]);
 * // "3 операции"
 */
export function formatPlural(count, forms) {
  const n = Math.abs(parseInt(count, 10)) || 0;

  const [one, few, many] = forms;
  const mod10 = n % 10;
  const mod100 = n % 100;

  let word;

  if (mod10 === 1 && mod100 !== 11) {
    word = one;
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    word = few;
  } else {
    word = many;
  }

  return `${n} ${word}`;
}

export function formatRUR(num, round = true) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: round ? 0 : 2,
  }).format(Number(num ?? 0));
}
