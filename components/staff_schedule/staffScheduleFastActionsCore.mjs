import dayjs from "dayjs";
import { createStaffScheduleAccess, createStaffSchedulePolicy } from "./staffScheduleAccess.mjs";
import {
  buildPointOptions,
  buildScheduleOptions,
  buildSmenaOptions,
} from "./staffScheduleEditViewModel.js";
import { canUseStaffScheduleFastActionsPeriod } from "./staffSchedulePeriodRange.mjs";

export function buildCommonFastActionOptions(users = []) {
  if (!users.length) {
    return { smenaOptions: [], pointOptions: [] };
  }

  const shiftLists = users.map((user) =>
    Array.isArray(user?.other_smens) ? buildSmenaOptions(user) : [],
  );
  const pointLists = users.map((user) =>
    Array.isArray(user?.other_points) ? buildPointOptions(user) : [],
  );
  const unique = (options) =>
    Array.from(new Map(options.map((item) => [String(item.id), item])).values());
  const smenaOptions = unique(shiftLists.flat()).filter(
    (option) =>
      Number(option.id) > 0 &&
      users.every(
        (user, index) =>
          String(user.smena_id) === String(option.id) ||
          shiftLists[index].some((item) => String(item.id) === String(option.id)),
      ),
  );
  const pointOptions = unique(pointLists[0]).filter(
    (option) =>
      Number(option.point_id) > 0 &&
      Number(option.smena_id) > 0 &&
      pointLists.every((options) => options.some((item) => String(item.id) === String(option.id))),
  );

  return { smenaOptions, pointOptions };
}

export function hasFastActionDraftChanges(draft, users = []) {
  return Boolean(
    (draft?.scheduleType && draft?.scheduleScope) ||
    (draft?.smenaId && users.some((user) => String(user.smena_id) !== String(draft.smenaId))) ||
    draft?.point?.point_id,
  );
}

export function canEditFastHoursPeriod(monthId, scope, selectedPart, referenceDate = dayjs()) {
  return (
    ["month", "week"].includes(scope) &&
    canUseStaffScheduleFastActionsPeriod(monthId, selectedPart, referenceDate)
  );
}

export function buildFastActionRequests({
  draft,
  users = [],
  mode,
  access,
  monthId,
  selectedPart,
  referenceDate,
}) {
  if (!createStaffSchedulePolicy(access).canShowFastActionsPanel) {
    throw new Error("Нет доступа к быстрым действиям");
  }
  if (!canUseStaffScheduleFastActionsPeriod(monthId, selectedPart, referenceDate)) {
    throw new Error("Прошедший период нельзя изменить");
  }
  if (
    !users.length ||
    users.some(
      (user) =>
        !(Number(user?.id) > 0) || !(Number(user?.app_id) > 0) || !(Number(user?.smena_id) > 0),
    )
  ) {
    throw new Error("Выберите сотрудников");
  }

  const { canAccess } = createStaffScheduleAccess(access);
  const { smenaOptions, pointOptions } = buildCommonFastActionOptions(users);
  const bulk = mode === "bulk";
  const sources = users.map((user) => ({
    user_id: user.id,
    app_id: user.app_id,
    smena_id: user.smena_id,
  }));
  const sourcePayload = (rows) => (bulk ? { users: rows } : rows[0]);
  const requests = [];

  if (draft?.scheduleType && draft?.scheduleScope) {
    const month = draft.scheduleScope === "month";
    const allowed = (month || draft.scheduleScope === "week") && canAccess("fast_hours");
    if (!allowed) {
      throw new Error("Нет доступа к изменению часов");
    }
    if (!canEditFastHoursPeriod(monthId, draft.scheduleScope, selectedPart, referenceDate)) {
      throw new Error("Прошедший период нельзя изменить");
    }
    if (
      !buildScheduleOptions(draft.scheduleScope, selectedPart).some(
        (item) => Number(item.type) === Number(draft.scheduleType),
      )
    ) {
      throw new Error("Выберите часовой график");
    }
    requests.push({
      action: "schedule",
      label: "Часы",
      method: bulk
        ? month
          ? "saveFastTimeArrMounth"
          : "saveFastTimeArrTwoWeek"
        : month
          ? "saveFastTime"
          : "saveFastTimeWeekOne",
      payload: {
        ...sourcePayload(sources),
        date: monthId,
        part: selectedPart,
        type: draft.scheduleType,
      },
    });
  }

  const hasShift =
    draft?.smenaId && users.some((user) => String(user.smena_id) !== String(draft.smenaId));
  if (hasShift) {
    if (!canAccess("fast_smena")) {
      throw new Error("Нет доступа к изменению смены");
    }
    if (!smenaOptions.some((item) => String(item.id) === String(draft.smenaId))) {
      throw new Error("Выбранная смена недоступна для всех выбранных сотрудников");
    }
    requests.push({
      action: "shift",
      label: "Смена",
      method: "saveFastSmena",
      payload: {
        ...sourcePayload(sources),
        new_smena_id: draft.smenaId,
        date: monthId,
        part: selectedPart,
      },
    });
  }

  if (draft?.point?.point_id) {
    if (!canAccess("fast_point")) {
      throw new Error("Нет доступа к изменению кафе");
    }
    if (
      !pointOptions.some(
        (item) =>
          String(item.point_id) === String(draft.point.point_id) &&
          String(item.smena_id) === String(draft.point.smena_id),
      )
    ) {
      throw new Error("Выбранное кафе недоступно для всех выбранных сотрудников");
    }
    const pointSources = hasShift
      ? sources.map((source) => ({ ...source, smena_id: draft.smenaId }))
      : sources;
    requests.push({
      action: "point",
      label: "Кафе",
      method: "saveFastPoint",
      payload: {
        ...sourcePayload(pointSources),
        new_point_id: draft.point.point_id,
        new_smena_id: draft.point.smena_id,
        date: monthId,
        part: selectedPart,
      },
    });
  }

  return requests;
}

export function assertFastActionRequestAccess(access, request) {
  const key = { schedule: "fast_hours", shift: "fast_smena", point: "fast_point" }[request?.action];
  if (!key || !createStaffScheduleAccess(access).canAccess(key)) {
    throw new Error(`Нет доступа: ${request?.label || "быстрые действия"}`);
  }
}

export async function persistFastActionRequests(
  api,
  requests,
  onCompleted = () => {},
  beforeRequest = () => {},
) {
  const completed = [];
  for (const request of requests) {
    try {
      beforeRequest(request);
      const response = await api[request.method](request.payload);
      if (response?.st !== true) {
        throw new Error(response?.text || `Не удалось сохранить: ${request.label}`);
      }
      completed.push(request);
      onCompleted(request);
    } catch (error) {
      error.completedActions = completed.map((item) => item.label);
      throw error;
    }
  }
}

export function clearCompletedFastAction(draft, action) {
  if (action === "schedule") return { ...draft, scheduleScope: null, scheduleType: null };
  if (action === "shift") return { ...draft, smenaId: "" };
  if (action === "point") return { ...draft, point: null };
  return draft;
}
