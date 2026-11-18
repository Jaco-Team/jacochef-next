import dayjs from "dayjs";
import "dayjs/locale/ru";

const parse = (date) => {
  if (!date || date === "0000-00-00") {
    return null;
  }

  const parsed = dayjs(date).locale("ru");

  return parsed.isValid() ? parsed : null;
};

export const todayYmd = () => dayjs().format("YYYY-MM-DD");

export const formatLongDate = (date) => parse(date)?.format("D MMMM YYYY") ?? "";

export const formatShortDate = (date) => parse(date)?.format("DD.MM.YYYY") ?? "";

export const formatDayMonth = (date) => parse(date)?.format("D MMMM") ?? "";

export const formatDayNumber = (date) => parse(date)?.format("D") ?? "";

export const formatWeekday = (date) => parse(date)?.format("dd") ?? "";

export const formatDateRange = (dateStart, dateEnd) => {
  const start = parse(dateStart);
  const end = parse(dateEnd);

  if (!start || !end) {
    return formatLongDate(dateStart || dateEnd);
  }

  if (start.isSame(end, "day")) {
    return end.format("D MMMM YYYY");
  }

  if (start.isSame(end, "month")) {
    return `${start.format("D")}–${end.format("D MMMM YYYY")}`;
  }

  if (start.isSame(end, "year")) {
    return `${start.format("D MMMM")} – ${end.format("D MMMM YYYY")}`;
  }

  return `${start.format("D MMMM YYYY")} – ${end.format("D MMMM YYYY")}`;
};

export const pluralDays = (count) => {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} день`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} дня`;
  }

  return `${count} дней`;
};
