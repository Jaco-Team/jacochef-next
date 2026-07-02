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

function formatHistoryDateLabel(value) {
  return value || "—";
}

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isMegaRole(value) {
  const role = normalizeRole(value);
  return role === "mega" || role === "mega_dir";
}

function isMegaOnlyRole(value) {
  return normalizeRole(value) === "mega";
}

function isToday(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isSame(dayjs(), "day");
}

function isFutureDay(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value);
  return parsed.isValid() && parsed.isAfter(dayjs(), "day");
}

function isPastMonth(value) {
  if (!value) {
    return false;
  }

  const parsed = dayjs(value, "YYYY-MM", true);
  return parsed.isValid() && parsed.isBefore(dayjs(), "month");
}

function canEditDayPeriod({ date, roleKind, checkPeriod }) {
  if (!date) {
    return false;
  }

  if (isMegaRole(roleKind)) {
    return true;
  }

  if (isToday(date) || isFutureDay(date)) {
    return true;
  }

  return Number(checkPeriod) === 1;
}

function canEditDayHealth({ date, hours }) {
  return isToday(date) && toArray(hours).length > 0;
}

export const MONTH_TYPE_PRESETS = [
  { type: 0, label: "10:00 - 22:00", time_start: "10:00", time_end: "22:00", color: "#98e38d" },
  { type: 1, label: "10:00 - 16:00", time_start: "10:00", time_end: "16:00", color: "#3dcef2" },
  { type: 2, label: "16:00 - 22:00", time_start: "16:00", time_end: "22:00", color: "#1560bd" },
  { type: 3, label: "Другое", time_start: "", time_end: "", color: "#926eae" },
];

function getPresetByType(type) {
  return MONTH_TYPE_PRESETS.find((item) => item.type === Number(type)) || MONTH_TYPE_PRESETS[0];
}

export function hasDayModalPayload(response) {
  return Boolean(response?.h_info);
}

export function hasMonthModalPayload(response) {
  return Boolean(response?.h_info) && Array.isArray(response?.hours_days);
}

export function buildDayModalViewModel(response, context = {}) {
  const info = response?.h_info ?? {};
  const user = info?.user ?? {};
  const hours = toArray(info?.hours);
  const canEditPeriodFields = canEditDayPeriod({
    date: info?.date,
    roleKind: context?.roleKind,
    checkPeriod: context?.checkPeriod,
  });
  const canEditHealthFields = canEditDayHealth({
    date: info?.date,
    hours,
  });

  return {
    title: user?.user_name || "Сведения о сотруднике",
    subtitle: user?.app_name || "",
    personName: user?.user_name || "",
    positionName: user?.app_name || "",
    dateLabel: info?.date || formatDateLabel(info?.date),
    loadTime: user?.my_load_h ?? "",
    averageLoadTime: user?.all_load_h ?? "",
    bonusValue: response?.show_bonus ? (user?.bonus ?? "") : "",
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
    canEditHours: canEditPeriodFields,
    canEditAssignment: canEditPeriodFields,
    canEditHealth: canEditHealthFields,
    hours: hours.map((item, index) => ({
      id: `${item?.time_start || "start"}-${item?.time_end || "end"}-${index}`,
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
      label: [item?.time_start, item?.time_end].filter(Boolean).join(" - ") || "—",
      appName: item?.app_name ?? "",
    })),
    history: toArray(info?.hist).map((item, index) => ({
      id: `${item?.date || "date"}-${item?.user_name || index}`,
      title: [formatHistoryDateLabel(item?.date), item?.user_name].filter(Boolean).join(" - "),
      items: toArray(item?.items).map((historyItem, historyIndex) => ({
        id: `${historyItem?.time_start || "start"}-${historyItem?.time_end || "end"}-${historyIndex}`,
        label: [historyItem?.time_start, historyItem?.time_end].filter(Boolean).join(" - ") || "—",
        appName: historyItem?.app_name ?? "",
      })),
    })),
  };
}

export function buildMonthModalViewModel(response, context = {}) {
  const info = response?.h_info ?? {};
  const user = info?.user ?? {};
  const canEditMonth = isMegaOnlyRole(context?.roleKind) || !isPastMonth(context?.monthId);

  return {
    title: [user?.app_name, user?.user_name].filter(Boolean).join(" "),
    subtitle: info?.date ? formatDateLabel(info.date) : "",
    newApp: info?.new_app ?? "",
    mentorId: info?.mentor_id ?? "",
    otherApps: toArray(response?.other_app).map((item) => ({
      id: item?.id ?? "",
      name: item?.name ?? "",
    })),
    mentorList: toArray(info?.mentor_list).map((item) => ({
      id: item?.id ?? "",
      name: item?.name ?? "",
    })),
    canEditMonth,
    days: toArray(response?.hours_days).map((item, index) => ({
      id: `${item?.date || "date"}-${index}`,
      date: item?.date ?? "",
      dateLabel: formatDateLabel(item?.date),
      type: Number(item?.type ?? 0),
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    })),
  };
}

export function buildMonthModalDraft(data) {
  return {
    selectedType: 0,
    newApp: data?.newApp ?? "",
    mentorId: data?.mentorId ?? "",
    dates: Array.isArray(data?.days)
      ? data.days.map((item) => ({
          date: item?.date ?? "",
          type: Number(item?.type ?? 0),
          time_start: item?.time_start ?? "",
          time_end: item?.time_end ?? "",
        }))
      : [],
  };
}

export function toggleMonthDay(draft, date, selectedType) {
  const preset = getPresetByType(selectedType);
  const existing = draft.dates.find((item) => item.date === date);

  if (!existing) {
    return {
      ...draft,
      dates: [
        ...draft.dates,
        {
          date,
          type: selectedType,
          time_start: preset.time_start,
          time_end: preset.time_end,
        },
      ],
    };
  }

  if (Number(existing.type) === Number(selectedType)) {
    return {
      ...draft,
      dates: draft.dates.filter((item) => item.date !== date),
    };
  }

  return {
    ...draft,
    dates: draft.dates.map((item) =>
      item.date === date
        ? {
            ...item,
            type: selectedType,
            time_start: preset.time_start,
            time_end: preset.time_end,
          }
        : item,
    ),
  };
}

export function buildMonthSavePayload(request, draft) {
  const payload = {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    dates: draft.dates.map((item) => ({
      date: item.date,
      time_start: item.time_start ?? "",
      time_end: item.time_end ?? "",
    })),
  };

  if (request?.canEditMonth) {
    payload.new_app = draft.newApp || "";
    payload.mentor_id = draft.mentorId || "";
  }

  return payload;
}
