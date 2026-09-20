import dayjs from "dayjs";

export function buildPeriodRangeLabels(monthId) {
  const normalizedMonthId = String(monthId || "");
  const month = dayjs(`${normalizedMonthId}-01`);

  if (!/^\d{4}-\d{2}$/.test(normalizedMonthId) || month.format("YYYY-MM") !== normalizedMonthId) {
    return ["с 1 по 15 число", "с 16 по конец месяца"];
  }

  const monthNumber = month.format("MM");
  const lastDay = String(month.daysInMonth()).padStart(2, "0");

  return [`01.${monthNumber}–15.${monthNumber}`, `16.${monthNumber}–${lastDay}.${monthNumber}`];
}
