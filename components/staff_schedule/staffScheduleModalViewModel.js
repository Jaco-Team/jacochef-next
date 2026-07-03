import dayjs from "dayjs";
import { toArray } from "./staffScheduleHelpers";
import { STAFF_SCHEDULE_HOUR_PRESETS, getHourPresetByType } from "./staffScheduleHourPresets";

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

export const MONTH_TYPE_PRESETS = STAFF_SCHEDULE_HOUR_PRESETS.map((item) => ({
  ...item,
  label: item.label.replace("-", " - "),
}));

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
  const row = context?.rowData ?? {};
  const periodDays = toArray(context?.periodDays);
  const canEditMonth = isMegaOnlyRole(context?.roleKind) || !isPastMonth(context?.monthId);
  const source = {
    ...row,
    ...user,
  };
  const rowTotalSum = row?.total_sum;
  const rowToPaySum = row?.to_pay_sum;
  const totalSum =
    rowTotalSum !== undefined && rowTotalSum !== ""
      ? Number(rowTotalSum)
      : Number(source?.dop_bonus ?? 0) +
        Number(source?.dir_price ?? 0) +
        Number(source?.register_price ?? 0) +
        Number(source?.dir_price_dop ?? 0) +
        Number(source?.h_price ?? 0) +
        Number(source?.my_bonus ?? 0) -
        Number(source?.err_price ?? 0);
  const toPaySum =
    rowToPaySum !== undefined && rowToPaySum !== ""
      ? Number(rowToPaySum)
      : source?.app_type === "driver"
        ? ""
        : totalSum - Number(source?.given_cart ?? 0) - Number(source?.withheld ?? 0);

  return {
    title: [source?.app_name, source?.user_name].filter(Boolean).join(" "),
    subtitle: info?.date ? formatDateLabel(info.date) : "",
    personName: source?.user_name || "",
    positionName: source?.app_name || "",
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
    summary: {
      ratePerHour: source?.price_p_h ?? "",
      ratePerHourExtra: source?.price_p_h_dop ?? "",
      hoursTotal: source?.h_price ?? "",
      errors: source?.err_price ?? "",
      withheld: source?.withheld ?? "",
      toPay: toPaySum,
      bonuses: source?.my_bonus ?? 0,
      total: totalSum,
      givenCash: source?.given_cash ?? source?.given ?? "",
      transferred: source?.given_cart ?? "",
      premiumSheet: source?.test_all_price ?? "",
    },
    overviewDays: toArray(row?.dates).map((item, index) => {
      const periodDay = periodDays[index] ?? {};

      return {
        id: `${item?.date || periodDay?.date || "overview"}-${index}`,
        date: item?.date ?? "",
        dayNumber: periodDay?.date || formatDateLabel(item?.date).slice(0, 2),
        weekdayShort: periodDay?.day || "",
        isWeekend: ["Пт", "Сб", "Вс"].includes(periodDay?.day),
        hoursLabel: item?.info?.hours || "",
        backgroundColor: item?.info?.color || "",
        textColor: item?.info?.colorT || "#111827",
      };
    }),
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
  const preset = getHourPresetByType(selectedType);
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
      type: Number(item.type ?? 0),
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
