import dayjs from "dayjs";
import {
  computePremiumSheet,
  computeToPaySum,
  computeTotalSum,
  createStaffSchedulePolicy,
  toArray,
} from "./staffScheduleHelpers.js";
import { STAFF_SCHEDULE_HOUR_PRESETS, getHourPresetByType } from "./staffScheduleHourPresets.js";
import {
  buildMonthSavePayload,
  canEditDayHealth,
  canEditDayPeriod,
  canEditMonthByRole,
  isEditableMonthDay,
  isClosedDayHalfPeriod,
} from "./staffScheduleModalCore.mjs";

export const STAFF_SCHEDULE_HEALTH_OPTIONS = [
  { id: 1, name: "Выходной" },
  { id: 2, name: "Здоров" },
  { id: 3, name: "Больничный лист" },
];

const PERSONAL_FINANCE_COLUMN_LABELS = {
  price_p_h: "За 1ч",
  given: "Выдано",
  given_cart: "На карты",
  withheld: "Удержано",
  my_bonus: "Бонус",
};

export function buildSummaryActionHeaderData(row, mode, periodLabel) {
  return {
    columnLabel: PERSONAL_FINANCE_COLUMN_LABELS[mode] || "",
    personName: row?.user_name || "",
    positionName: row?.full_app_name || row?.app_name || "",
    periodLabel: periodLabel || "",
  };
}

function formatDateLabel(value) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : value;
}

function formatHistoryDateLabel(value) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm:ss") : value;
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
  const policy = createStaffSchedulePolicy(context.access);
  const showBonus =
    Boolean(response?.show_bonus) && policy.canShowSalaryBlock && policy.canView("bonus");
  const user = info?.user ?? {};
  const hours = toArray(info?.hours);
  const canEditPeriodFields = canEditDayPeriod({
    date: info?.date,
    roleKind: context?.roleKind,
    checkPeriod: context?.checkPeriod,
    canEditDay: context?.canEditDay,
    hasDedicatedDayEdit: context?.hasDedicatedDayEdit,
    referenceDate: context?.referenceDate,
  });
  const canEditHealthFields = canEditDayHealth({
    date: info?.date,
    roleKind: context?.roleKind,
    checkPeriod: context?.checkPeriod,
    canEditDay: context?.canEditDay,
    hasDedicatedDayEdit: context?.hasDedicatedDayEdit,
    referenceDate: context?.referenceDate,
  });

  return {
    title: user?.user_name || "Сведения о сотруднике",
    subtitle: user?.app_name || "",
    personName: user?.user_name || "",
    positionName: user?.app_name || "",
    dateLabel: info?.date || formatDateLabel(info?.date),
    date: info?.date || "",
    isPastPeriod: isClosedDayHalfPeriod(info?.date, context?.referenceDate),
    loadTime: user?.my_load_h ?? "",
    averageLoadTime: user?.all_load_h ?? "",
    bonusValue: showBonus ? (user?.bonus ?? "") : "",
    loadLabel:
      user?.my_load_h || user?.all_load_h
        ? `${user?.my_load_h ?? "—"} / ${user?.all_load_h ?? "—"}`
        : "",
    bonusLabel: showBonus ? (user?.bonus ?? "") : "",
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
      createdAt: formatHistoryDateLabel(item?.date),
      actorName: item?.user_name || "—",
      title: [formatHistoryDateLabel(item?.date), item?.user_name].filter(Boolean).join(" - "),
      items: toArray(item?.items).map((historyItem, historyIndex) => ({
        id: `${historyItem?.time_start || "start"}-${historyItem?.time_end || "end"}-${historyIndex}`,
        timeStart: historyItem?.time_start ?? "",
        timeEnd: historyItem?.time_end ?? "",
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
  const policy = createStaffSchedulePolicy(context.access);
  const canEditMonth =
    policy.canOpenMonthCard &&
    canEditMonthByRole({
      monthId: context?.monthId,
    });
  const source = {
    ...row,
    ...user,
  };
  const totalSum = computeTotalSum(source);
  const toPaySum = computeToPaySum(source);
  const canViewFinance = (key) => policy.canShowSalaryBlock && policy.canView(key);

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
      ratePerHour: canViewFinance("1h") ? (source?.price_p_h ?? "") : "",
      ratePerHourExtra: canViewFinance("1h_plus") ? (source?.price_p_h_dop ?? "") : "",
      hoursTotal: canViewFinance("full_h") ? (source?.h_price ?? "") : "",
      errors: canViewFinance("errors") ? (source?.err_price ?? "") : "",
      withheld: canViewFinance("withheld") ? (source?.withheld ?? "") : "",
      toPay: canViewFinance("test_all_price") ? toPaySum : "",
      bonuses: canViewFinance("bonus") ? (source?.my_bonus ?? 0) : "",
      total: canViewFinance("all_price") ? totalSum : "",
      givenCash: canViewFinance("given") ? (source?.given_cash ?? source?.given ?? "") : "",
      transferred: canViewFinance("given_cart") ? (source?.given_cart ?? "") : "",
      premiumSheet: canViewFinance("premia") ? computePremiumSheet(source) : "",
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
    hasPeriodSummary: context?.hasPeriodSummary !== false,
    recentCustomHours: toArray(response?.recent_custom_hours).map((item) => ({
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    })),
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

export { buildMonthSavePayload, canEditMonthByRole, isEditableMonthDay };
