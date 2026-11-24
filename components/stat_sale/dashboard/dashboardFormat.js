import { uiColors } from "@/design-system/shared/tokens";

export const POSITIVE_COLOR = uiColors.successHover;
export const NEGATIVE_COLOR = uiColors.danger;

export const METRIC_KEYS = ["orders", "rolls", "pizza", "revenue", "avg_check", "orders_per_client"];

const intFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const decimalFormatters = {};

export function formatInt(value) {
  return intFormatter.format(Math.round(Number(value) || 0));
}

export function formatDecimal(value, digits = 1) {
  decimalFormatters[digits] ??= new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return decimalFormatters[digits].format(Number(value) || 0).replace(",", ".");
}

/** Процент до целого; −0 превращается в 0. */
export function roundPercent(value) {
  const rounded = Math.round(Number(value) || 0);
  return rounded === 0 ? 0 : rounded;
}

/** Целый процент без знака «%»: прогресс, эффективность, доля. */
export function formatPercent(value) {
  return formatInt(roundPercent(value));
}

/** Изменение в целых процентах без «+»: минус сохраняется, null — прочерк. */
export function formatChange(value) {
  if (value === null || value === undefined) return "—";
  const rounded = roundPercent(value);
  return `${rounded < 0 ? "−" : ""}${formatInt(Math.abs(rounded))}`;
}

/** Целые доли с сохранением суммы (метод наибольших остатков): 88,4 + 5,4 + 6,2 → 89 + 5 + 6. */
export function roundShares(values) {
  const numbers = values.map((value) => Math.max(0, Number(value) || 0));
  const result = numbers.map(Math.floor);
  let rest = Math.round(numbers.reduce((sum, value) => sum + value, 0)) - result.reduce((sum, value) => sum + value, 0);

  numbers
    .map((value, index) => ({ index, fraction: value - result[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .forEach(({ index }) => {
      if (rest > 0) {
        result[index] += 1;
        rest -= 1;
      }
    });

  return result;
}

/** pluralRu(5, ["заказ", "заказа", "заказов"]) → «заказов». */
export function pluralRu(value, [one, few, many]) {
  const n = Math.abs(Math.round(Number(value) || 0)) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

/** Цвет по округлённому значению: то, что показано как 0, — нейтральное. */
export function changeColor(value) {
  if (value === null || value === undefined) return uiColors.text;
  const rounded = roundPercent(value);
  if (rounded === 0) return uiColors.text;
  return rounded < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR;
}

export function formatMetric(key, value) {
  const number = Number(value) || 0;
  if (key === "revenue") {
    return number >= 1e6 ? `${formatDecimal(number / 1e6, 1)} млн ₽` : `${formatInt(number)} ₽`;
  }
  if (key === "avg_check") return `${formatInt(number)} ₽`;
  if (key === "orders_per_client") return formatDecimal(number, 2);
  return formatInt(number);
}

/** «Тольятти, Ленинградская 47» → { city, name }. */
export function splitPointName(name = "") {
  const index = name.indexOf(",");
  if (index === -1) return { city: "", name };
  return { city: name.slice(0, index).trim(), name: name.slice(index + 1).trim() };
}

export const CHART_PALETTE = [
  "#DD1A32",
  "#F07B88",
  "#8E1020",
  "#F7B8C0",
  "#5E5E5E",
  "#B9BEC6",
  "#E8475A",
  "#3F444B",
  "#FAD6DB",
  "#A31526",
];

export const OTHER_COLOR = "#E3E6EA";

function hexToRgb(hex) {
  const value = parseInt(String(hex).replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixColors(from, to, ratio) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `#${a
    .map((channel, index) =>
      Math.round(channel + (b[index] - channel) * ratio)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Цвет ячейки по порогам из настроек «Заказы по часам»: между порогами — плавный переход. */
export function thresholdColor(value, stops) {
  if (!stops?.length) return uiColors.surfaceMuted;
  const sorted = [...stops].sort((a, b) => a.percent - b.percent);
  if (value <= sorted[0].percent) return sorted[0].color;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const from = sorted[index];
    const to = sorted[index + 1];
    if (value <= to.percent) {
      return mixColors(from.color, to.color, (value - from.percent) / (to.percent - from.percent || 1));
    }
  }
  return sorted[sorted.length - 1].color;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Белый или тёмный текст — что контрастнее на фоне. */
export function textColorOn(background) {
  const light = luminance(background);
  return 1.05 / (light + 0.05) >= (light + 0.05) / 0.061 ? "#FFFFFF" : uiColors.textStrong;
}
