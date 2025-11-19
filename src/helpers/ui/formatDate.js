import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

export const formatDateReverse = (date) =>
  date && date !== "0000-00-00" && dayjs(date).isValid() ? dayjs(date).format("DD-MM-YYYY") : "";

export const formatDateMin = (date) =>
  date && dayjs(date).isValid() ? dayjs(date).format("YYYY-MM") : "";

export const formatDate = (date) => dayjs(date);

export const formatYMD = (date) => dayjs(date).format("YYYY-MM-DD");
