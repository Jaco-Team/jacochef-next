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
