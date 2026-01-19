import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

export const formatDateReverse = (date) =>
  date && date !== "0000-00-00" && dayjs(date).isValid() ? dayjs(date).format("DD-MM-YYYY") : "";

export const formatDateMin = (date) =>
  date && dayjs(date).isValid() ? dayjs(date).format("YYYY-MM") : "";

export const formatDate = (date) => dayjs(date);

export const formatYMD = (date) => dayjs(date).format("YYYY-MM-DD");

/**
 * checks that end is after start date
 * @param {string} from
 * @param {string} to
 * @returns boolean validity
 */
export const checkDates = (from, to) => {
  if (!from || !to) return false;
  const fromDate = dayjs(from);
  const toDate = dayjs(to);
  return fromDate.isValid() && toDate.isValid() && fromDate.diff(toDate) <= 0;
};
