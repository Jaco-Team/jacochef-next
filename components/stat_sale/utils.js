import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export const am5locales_ru_RU = {
  Jan: "Янв",
  January: "Янв",
  Feb: "Фев",
  February: "Фев",
  Mar: "Мар",
  March: "Мар",
  Apr: "Апр",
  April: "Апр",
  May: "Май",
  Jun: "Июн",
  June: "Июн",
  Jul: "Июл",
  July: "Июл",
  Aug: "Авг",
  August: "Авг",
  Sep: "Сен",
  September: "Сен",
  Oct: "Окт",
  October: "Окт",
  Nov: "Ноя",
  November: "Ноя",
  Dec: "Дек",
  December: "Дек",
};

export const formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(num);

export const calcPercent = (num, total) => {
  if (total === 0) return 0;
  return Math.round((num / total) * 100);
};

export const calcAvg = (num, total) => {
  if (total === 0) return 0;
  return Math.round((num / total) * 100) / 100;
};

export const calcAverageCheck = (summ, orders) => {
  if (orders === 0) return 0;
  return Math.round(summ / orders);
};

const getNiceStep = (roughStep) => {
  if (!Number.isFinite(roughStep) || roughStep <= 0) return 1;

  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;

  return niceFraction * 10 ** exponent;
};

/**
 * Границы оси Y по данным, без пустого места под линиями: минимум и максимум ненулевых значений,
 * запас 10%, «круглый» шаг. seriesItems: [{ values: number[] }].
 */
export const calculateYAxisBounds = (seriesItems) => {
  const values = seriesItems
    .flatMap((item) => item.values ?? [])
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(Number)
    .filter(Number.isFinite);
  const nonZeroValues = values.filter((value) => value !== 0);

  if (!nonZeroValues.length) {
    return { min: 0, max: 1 };
  }

  const minValue = Math.min(...nonZeroValues);
  const maxValue = Math.max(...nonZeroValues);
  const span = maxValue - minValue || Math.abs(maxValue) || 1;
  const padding = span * 0.1;
  const hasZero = values.some((value) => value === 0);
  const rawMin = hasZero && minValue >= 0 ? 0 : minValue - padding;
  const rawMax = maxValue + padding;
  const step = getNiceStep((rawMax - rawMin) / 5);
  const min =
    minValue >= 0
      ? Math.max(0, Math.floor(rawMin / step) * step)
      : Math.floor(rawMin / step) * step;
  const max = Math.ceil(rawMax / step) * step;

  return {
    min,
    max: max > min ? max : min + step,
  };
};
