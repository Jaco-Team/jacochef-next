const WEEK_SUFFIX = " 2/2 с 10:00 до 22:00";
const MONTH_SUFFIX = " 2/2 с 10:00 до 22:00";
const SCHEDULE_TIME_SUFFIX = " с 10:00 до 22:00";

const SCHEDULE_DAY_OPTIONS = [
  { type: 1, altType: 16, labelPart1: "С 1 числа", labelPart2: "С 16 числа" },
  { type: 2, altType: 17, labelPart1: "С 2 числа", labelPart2: "С 17 числа" },
  { type: 3, altType: 18, labelPart1: "С 3 числа", labelPart2: "С 18 числа" },
  { type: 4, altType: 19, labelPart1: "С 4 числа", labelPart2: "С 19 числа" },
];

export const EDIT_SCHEDULE_SCOPE = {
  month: "month",
  week: "week",
};

function buildScheduleLabel(option, scope, selectedPart) {
  if (scope === EDIT_SCHEDULE_SCOPE.month) {
    return `${option.labelPart1}${MONTH_SUFFIX} на месяц`;
  }

  const dayLabel = selectedPart === 0 ? option.labelPart1 : option.labelPart2;
  return `${dayLabel}${WEEK_SUFFIX} на две недели`;
}

export function buildScheduleOptions(scope, selectedPart) {
  return SCHEDULE_DAY_OPTIONS.map((option) => {
    const type =
      scope === EDIT_SCHEDULE_SCOPE.month
        ? option.type
        : selectedPart === 0
          ? option.type
          : option.altType;

    return {
      id: type,
      type,
      name: buildScheduleLabel(option, scope, selectedPart),
    };
  });
}

export function getCurrentScheduleDisplay(user) {
  const text = user?.current_schedule_text ?? user?.current_schedule?.text ?? "";
  const pattern = user?.current_schedule?.pattern ?? "";
  const workDays = Array.isArray(user?.current_schedule?.work_days)
    ? user.current_schedule.work_days
    : [];

  if (!text && workDays.length === 0) {
    return null;
  }

  if (!pattern && workDays.length > 1) {
    return "Персональные";
  }

  if (text.includes("2/2") && !text.includes("10:00")) {
    return `${text}${SCHEDULE_TIME_SUFFIX}`;
  }

  return text || "Персональные";
}

export function mapStartDayToScheduleType(startDay, scope, selectedPart) {
  const day = Number(startDay);

  if (!Number.isFinite(day) || day <= 0) {
    return null;
  }

  if (scope === EDIT_SCHEDULE_SCOPE.month) {
    return day >= 1 && day <= 4 ? day : null;
  }

  if (selectedPart === 0) {
    return day >= 1 && day <= 4 ? day : null;
  }

  return day >= 16 && day <= 19 ? day : null;
}

export function getCurrentScheduleType(user, selectedPart, scope = null) {
  const startDay = user?.current_schedule?.start_day;

  if (!startDay) {
    return null;
  }

  if (scope) {
    return mapStartDayToScheduleType(startDay, scope, selectedPart);
  }

  return (
    mapStartDayToScheduleType(startDay, EDIT_SCHEDULE_SCOPE.month, selectedPart) ??
    mapStartDayToScheduleType(startDay, EDIT_SCHEDULE_SCOPE.week, selectedPart)
  );
}

export function inferScheduleScopeFromUser(user, selectedPart) {
  const startDay = Number(user?.current_schedule?.start_day);

  if (startDay >= 16 && startDay <= 19) {
    return EDIT_SCHEDULE_SCOPE.week;
  }

  if (startDay >= 1 && startDay <= 4) {
    return null;
  }

  return null;
}

export function buildEditDialogContext({ user, monthId, pointLabel, shiftLabel }) {
  return {
    userName: user?.user_name ?? "",
    roleName: user?.full_app_name || user?.app_name || "",
    periodLabel: monthId ?? "",
    shiftLabel: shiftLabel || "—",
    pointLabel: pointLabel || "—",
    scheduleLabel: getCurrentScheduleDisplay(user) || "—",
  };
}

export function buildEditDraft(user) {
  return {
    scheduleScope: null,
    scheduleType: null,
    smenaId: user?.smena_id ?? "",
    point: null,
  };
}

export function buildSmenaOptions(user) {
  return (user?.other_smens || []).map((item) => ({
    id: item?.id ?? "",
    name: item?.name ?? "",
  }));
}

export function buildPointOptions(user) {
  return (user?.other_points || []).map((item) => ({
    id: `${item?.point_id}-${item?.smena_id}`,
    point_id: item?.point_id ?? "",
    smena_id: item?.smena_id ?? "",
    name: item?.name ?? "",
  }));
}

export function getScheduleLabel(draft, selectedPart, user) {
  if (draft?.scheduleType && draft?.scheduleScope) {
    const options = buildScheduleOptions(draft.scheduleScope, selectedPart);
    return options.find((item) => Number(item.type) === Number(draft.scheduleType))?.name ?? null;
  }

  return getCurrentScheduleDisplay(user);
}

export function getSmenaLabel(draft, user, context) {
  if (draft?.smenaId && String(draft.smenaId) !== String(user?.smena_id ?? "")) {
    return (
      buildSmenaOptions(user).find((item) => String(item.id) === String(draft.smenaId))?.name ??
      context.shiftLabel
    );
  }

  return context.shiftLabel;
}

export function getPointLabel(draft, context) {
  if (draft?.point?.name) {
    return draft.point.name;
  }

  return context.pointLabel;
}

export function hasEditDraftChanges(draft, user, selectedPart = 0) {
  const currentScheduleType = getCurrentScheduleType(
    user,
    selectedPart,
    draft?.scheduleScope ?? null,
  );
  const hasScheduleChange = Boolean(
    draft?.scheduleType &&
    draft?.scheduleScope &&
    (currentScheduleType === null || Number(draft.scheduleType) !== Number(currentScheduleType)),
  );
  const hasSmenaChange = Boolean(
    draft?.smenaId && String(draft.smenaId) !== String(user?.smena_id ?? ""),
  );
  const hasPointChange = Boolean(draft?.point?.point_id);

  return hasScheduleChange || hasSmenaChange || hasPointChange;
}

export function getDefaultScheduleScope(canUse) {
  const canMonth = canUse("fast_month");
  const canWeek = canUse("fast_2_week");

  if (canWeek) {
    return EDIT_SCHEDULE_SCOPE.week;
  }

  if (canMonth) {
    return EDIT_SCHEDULE_SCOPE.month;
  }

  return EDIT_SCHEDULE_SCOPE.week;
}
