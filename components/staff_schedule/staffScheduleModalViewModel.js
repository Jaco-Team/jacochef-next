import dayjs from "dayjs";
import { toArray } from "./staffScheduleHelpers";

export const STAFF_SCHEDULE_HEALTH_OPTIONS = [
  { id: 1, name: "Выходной" },
  { id: 2, name: "Здоров" },
  { id: 3, name: "Больничный лист" },
];

function formatDateLabel(value) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : value;
}

function formatDateTimeLabel(date, timeStart, timeEnd) {
  const timeRange = [timeStart, timeEnd].filter(Boolean).join(" - ");
  const dateLabel = formatDateLabel(date);

  if (!timeRange) {
    return dateLabel;
  }

  return `${dateLabel} · ${timeRange}`;
}

export function hasDayModalPayload(response) {
  return Boolean(response?.h_info);
}

export function hasMonthModalPayload(response) {
  return Boolean(response?.h_info);
}

export function buildDayModalViewModel(response) {
  const info = response?.h_info ?? {};
  const user = info?.user ?? {};

  return {
    title: [user?.app_name, user?.user_name].filter(Boolean).join(" "),
    subtitle: formatDateLabel(info?.date),
    loadLabel:
      user?.my_load_h || user?.all_load_h
        ? `${user?.my_load_h ?? "—"} / ${user?.all_load_h ?? "—"}`
        : "",
    bonusLabel: response?.show_bonus ? (user?.bonus ?? "") : "",
    newApp: info?.new_app ?? "",
    mentorId: info?.mentor_id ?? "",
    userTemp: info?.user_temp ?? "",
    typeHealf: info?.type_healf ?? 2,
    otherApps: toArray(response?.other_app).map((item) => ({
      id: item?.id ?? "",
      name: item?.name ?? "",
    })),
    mentorList: toArray(info?.mentor_list).map((item) => ({
      id: item?.id ?? "",
      name: item?.name ?? "",
    })),
    healthOptions: STAFF_SCHEDULE_HEALTH_OPTIONS,
    hours: toArray(info?.hours).map((item, index) => ({
      id: `${item?.time_start || "start"}-${item?.time_end || "end"}-${index}`,
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
      label: [item?.time_start, item?.time_end].filter(Boolean).join(" - ") || "—",
      appName: item?.app_name ?? "",
    })),
    history: toArray(info?.hist).map((item, index) => ({
      id: `${item?.date || "date"}-${item?.user_name || index}`,
      title: [formatDateLabel(item?.date), item?.user_name].filter(Boolean).join(" · "),
      items: toArray(item?.items).map((historyItem, historyIndex) => ({
        id: `${historyItem?.time_start || "start"}-${historyItem?.time_end || "end"}-${historyIndex}`,
        label: [historyItem?.time_start, historyItem?.time_end].filter(Boolean).join(" - ") || "—",
        appName: historyItem?.app_name ?? "",
      })),
    })),
  };
}

export function buildMonthModalViewModel(response) {
  const info = response?.h_info ?? {};
  const user = info?.user ?? {};

  return {
    title: [user?.app_name, user?.user_name].filter(Boolean).join(" "),
    subtitle: info?.date ? formatDateLabel(info.date) : "",
    days: toArray(response?.hours_days).map((item, index) => ({
      id: `${item?.date || "date"}-${index}`,
      date: item?.date ?? "",
      dateLabel: formatDateLabel(item?.date),
      type: item?.type ?? "",
      timeLabel: formatDateTimeLabel(item?.date, item?.time_start, item?.time_end),
    })),
  };
}
