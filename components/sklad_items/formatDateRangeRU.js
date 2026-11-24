"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";

export function formatDateRU(value) {
  if (!value || value === "0000-00-00") {
    return "";
  }

  const parsed = formatDate(value);

  if (!parsed?.isValid?.()) {
    return "";
  }

  return parsed.format("DD.MM.YYYY");
}

export function formatDateRangeRU(dateStart, dateEnd, fallback = "—") {
  const start = formatDateRU(dateStart);
  const end = formatDateRU(dateEnd);

  if (!start && !end) {
    return fallback;
  }

  if (!start) {
    return `— ${end}`;
  }

  if (!end) {
    return `${start} —`;
  }

  return `${start} — ${end}`;
}
