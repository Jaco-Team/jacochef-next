import dayjs from "dayjs";

export function canUseStaffScheduleFastActionsPeriod(
  monthId,
  selectedPart,
  referenceDate = dayjs(),
) {
  if (!/^\d{4}-\d{2}$/.test(String(monthId)) || ![0, 1, "0", "1"].includes(selectedPart)) {
    return false;
  }
  const month = dayjs(`${monthId}-01`);
  const today = dayjs(referenceDate);
  if (
    !month.isValid() ||
    month.format("YYYY-MM") !== monthId ||
    !today.isValid() ||
    (typeof referenceDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(referenceDate) &&
      today.format("YYYY-MM-DD") !== referenceDate)
  ) {
    return false;
  }
  const end = Number(selectedPart) === 0 ? month.date(15) : month.endOf("month");
  return !end.isBefore(today, "day");
}

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
