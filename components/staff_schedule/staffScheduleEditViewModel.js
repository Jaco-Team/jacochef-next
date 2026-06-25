const WEEK_SUFFIX = " 2/2 с 10:00 до 22:00";
const MONTH_SUFFIX = " 2/2 с 10:00 до 22:00";

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

export function buildEditDialogContext({ user, monthId, pointLabel, shiftLabel }) {
  return {
    userName: user?.user_name ?? "",
    roleName: user?.full_app_name || user?.app_name || "",
    periodLabel: monthId ?? "",
    shiftLabel: shiftLabel || "—",
    pointLabel: pointLabel || "—",
    scheduleLabel: "—",
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

export function getScheduleLabel(draft, selectedPart) {
  if (!draft?.scheduleType || !draft?.scheduleScope) {
    return null;
  }

  const options = buildScheduleOptions(draft.scheduleScope, selectedPart);
  return options.find((item) => Number(item.type) === Number(draft.scheduleType))?.name ?? null;
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

export function hasEditDraftChanges(draft, user) {
  const hasScheduleChange = Boolean(draft?.scheduleType && draft?.scheduleScope);
  const hasSmenaChange = Boolean(
    draft?.smenaId && String(draft.smenaId) !== String(user?.smena_id ?? ""),
  );
  const hasPointChange = Boolean(draft?.point?.point_id);

  return hasScheduleChange || hasSmenaChange || hasPointChange;
}

export function getDefaultScheduleScope(access, canAccess) {
  const canMonth = canAccess(access, "fast_month");
  const canWeek = canAccess(access, "fast_2_week");

  if (canWeek) {
    return EDIT_SCHEDULE_SCOPE.week;
  }

  if (canMonth) {
    return EDIT_SCHEDULE_SCOPE.month;
  }

  return EDIT_SCHEDULE_SCOPE.week;
}
