import { useCallback, useEffect, useRef, useState } from "react";
import { createStaffSchedulePolicy } from "./staffScheduleAccess.mjs";
import { buildEditDraft } from "./staffScheduleEditViewModel";
import { getSelectedScheduleRows } from "./staffScheduleHelpers";
import { canUseStaffScheduleFastActionsPeriod } from "./staffSchedulePeriodRange.mjs";
import {
  buildCommonFastActionOptions,
  assertFastActionRequestAccess,
  buildFastActionRequests,
  clearCompletedFastAction,
  persistFastActionRequests,
} from "./staffScheduleFastActionsCore.mjs";

function createFastActionsState(overrides = {}) {
  return {
    open: false,
    mode: "single",
    screen: "hub",
    user: null,
    users: [],
    draft: null,
    shiftLabel: "",
    saving: false,
    error: "",
    ...overrides,
  };
}

export default function useStaffScheduleFastActions({
  api,
  access,
  confirm,
  monthId,
  selectedPart,
  visibleRows,
  selectedRowIds,
  shiftOptions,
  onReload,
}) {
  const [state, setState] = useState(() => createFastActionsState());
  const saveInProgress = useRef(false);
  const draftGeneration = useRef(0);
  const accessRef = useRef(access);
  accessRef.current = access;
  const contextRef = useRef({ monthId, selectedPart });
  contextRef.current = { monthId, selectedPart };
  const reloadRef = useRef(onReload);
  reloadRef.current = onReload;
  const policy = createStaffSchedulePolicy(access);
  const canHours = policy.canAccess("fast_hours");
  const canShift = policy.canAccess("fast_smena");
  const canPoint = policy.canAccess("fast_point");
  const canOpen =
    policy.canShowFastActionsPanel && canUseStaffScheduleFastActionsPeriod(monthId, selectedPart);
  const previousPermissions = useRef({ canHours, canShift, canPoint });
  const previousContext = useRef({ monthId, selectedPart });

  const isCurrentPeriodAvailable = useCallback(() => {
    const current = contextRef.current;
    return (
      current.monthId === monthId &&
      current.selectedPart === selectedPart &&
      createStaffSchedulePolicy(accessRef.current).canShowFastActionsPanel &&
      canUseStaffScheduleFastActionsPeriod(current.monthId, current.selectedPart)
    );
  }, [monthId, selectedPart]);

  useEffect(() => {
    const previous = previousPermissions.current;
    const contextChanged =
      previousContext.current.monthId !== monthId ||
      previousContext.current.selectedPart !== selectedPart;
    if (
      contextChanged ||
      !canOpen ||
      (previous.canHours && !canHours) ||
      (previous.canShift && !canShift) ||
      (previous.canPoint && !canPoint)
    ) {
      draftGeneration.current += 1;
      setState(createFastActionsState());
    }
    previousPermissions.current = { canHours, canShift, canPoint };
    previousContext.current = { monthId, selectedPart };
  }, [canHours, canShift, canPoint, canOpen, monthId, selectedPart]);

  const close = useCallback(() => {
    draftGeneration.current += 1;
    setState(createFastActionsState());
  }, []);

  const open = useCallback(
    (row) => {
      if (
        !canOpen ||
        !isCurrentPeriodAvailable() ||
        !row?.id ||
        String(row?.smena_id ?? "") === "-1"
      ) {
        return;
      }

      const shiftLabel =
        shiftOptions.find((item) => String(item.id) === String(row.smena_id))?.name || "—";

      draftGeneration.current += 1;
      setState({
        ...createFastActionsState(),
        open: true,
        mode: "single",
        user: row,
        users: [row],
        draft: buildEditDraft(row),
        shiftLabel,
      });
    },
    [canOpen, isCurrentPeriodAvailable, shiftOptions],
  );

  const openBulk = useCallback(() => {
    const selectedRows = getSelectedScheduleRows(visibleRows, selectedRowIds);

    if (!canOpen || !isCurrentPeriodAvailable() || !selectedRows.length) {
      return;
    }

    draftGeneration.current += 1;
    setState({
      ...createFastActionsState(),
      open: true,
      mode: "bulk",
      user: selectedRows[0],
      users: selectedRows,
      draft: {
        scheduleScope: null,
        scheduleType: null,
        smenaId: "",
        point: null,
      },
      shiftLabel: "",
    });
  }, [canOpen, isCurrentPeriodAvailable, selectedRowIds, visibleRows]);

  const openSelected = openBulk;

  const updateUsers = useCallback(
    (users) => {
      if (!isCurrentPeriodAvailable()) return;
      setState((prev) => ({ ...prev, users, error: "" }));
    },
    [isCurrentPeriodAvailable],
  );

  const backToHub = useCallback(() => {
    if (!isCurrentPeriodAvailable()) return;
    setState((prev) => ({
      ...prev,
      screen: "hub",
      error: "",
    }));
  }, [isCurrentPeriodAvailable]);

  const openSchedule = useCallback(() => {
    if (!canHours || !isCurrentPeriodAvailable()) return;
    setState((prev) => ({
      ...prev,
      screen: "schedule",
      error: "",
    }));
  }, [canHours, isCurrentPeriodAvailable]);

  const openShift = useCallback(() => {
    if (!canShift || !isCurrentPeriodAvailable()) return;
    setState((prev) => ({
      ...prev,
      screen: "shift",
      error: "",
    }));
  }, [canShift, isCurrentPeriodAvailable]);

  const openPoint = useCallback(() => {
    if (!canPoint || !isCurrentPeriodAvailable()) return;
    setState((prev) => ({
      ...prev,
      screen: "point",
      error: "",
    }));
  }, [canPoint, isCurrentPeriodAvailable]);

  const applyScheduleDraft = useCallback(
    (nextScheduleDraft) => {
      if (!canHours || !isCurrentPeriodAvailable()) return;
      setState((prev) => ({
        ...prev,
        screen: "hub",
        error: "",
        draft: {
          ...prev.draft,
          scheduleScope: nextScheduleDraft?.scheduleScope ?? null,
          scheduleType: nextScheduleDraft?.scheduleType ?? null,
        },
      }));
    },
    [canHours, isCurrentPeriodAvailable],
  );

  const applyShiftDraft = useCallback(
    (nextSmenaId) => {
      if (!canShift || !isCurrentPeriodAvailable()) return;
      setState((prev) => ({
        ...prev,
        screen: "hub",
        error: "",
        draft: {
          ...prev.draft,
          smenaId: nextSmenaId,
        },
      }));
    },
    [canShift, isCurrentPeriodAvailable],
  );

  const applyPointDraft = useCallback(
    (pointItem) => {
      if (!canPoint || !isCurrentPeriodAvailable()) return;
      setState((prev) => ({
        ...prev,
        screen: "hub",
        error: "",
        draft: {
          ...prev.draft,
          point: pointItem
            ? {
                point_id: pointItem.point_id,
                smena_id: pointItem.smena_id,
                name: pointItem.name,
              }
            : null,
        },
      }));
    },
    [canPoint, isCurrentPeriodAvailable],
  );

  const saveChanges = useCallback(
    async (nextDraftOverride = null, nextUsersOverride = null) => {
      const user = state.user;
      const users = state.mode === "bulk" ? nextUsersOverride || state.users : user ? [user] : [];
      const draft = nextDraftOverride || state.draft;
      const mode = state.mode;
      const generation = draftGeneration.current;

      if (
        !isCurrentPeriodAvailable() ||
        saveInProgress.current ||
        (!user && mode !== "bulk") ||
        !draft
      ) {
        return;
      }

      let requests;
      try {
        requests = buildFastActionRequests({ draft, users, mode, access, monthId, selectedPart });
      } catch (error) {
        setState((prev) => ({ ...prev, error: error.message }));
        return;
      }
      if (!requests.length) return;

      saveInProgress.current = true;

      const needsPointConfirm = Boolean(draft?.point?.point_id);

      const runSave = async () => {
        if (generation !== draftGeneration.current || !isCurrentPeriodAvailable()) {
          saveInProgress.current = false;
          return;
        }
        setState((prev) => ({
          ...prev,
          saving: true,
          error: "",
          draft,
          users,
        }));

        try {
          const currentRequests = buildFastActionRequests({
            draft,
            users,
            mode,
            access: accessRef.current,
            monthId,
            selectedPart,
          });
          await persistFastActionRequests(
            api,
            currentRequests,
            (request) => {
              setState((prev) => {
                if (generation !== draftGeneration.current) return prev;
                const movedUsers =
                  request.action === "shift"
                    ? users.map((item) => ({ ...item, smena_id: request.payload.new_smena_id }))
                    : prev.users;
                return {
                  ...prev,
                  draft: clearCompletedFastAction(prev.draft, request.action),
                  users: movedUsers,
                  user:
                    request.action === "shift" && prev.user
                      ? { ...prev.user, smena_id: request.payload.new_smena_id }
                      : prev.user,
                  shiftLabel:
                    request.action === "shift"
                      ? buildCommonFastActionOptions(users).smenaOptions.find(
                          (item) => String(item.id) === String(request.payload.new_smena_id),
                        )?.name || prev.shiftLabel
                      : prev.shiftLabel,
                };
              });
            },
            (request) => {
              if (generation !== draftGeneration.current || !isCurrentPeriodAvailable()) {
                throw new Error(
                  "Доступ или выбранный период изменился. Откройте быстрые действия заново.",
                );
              }
              assertFastActionRequestAccess(accessRef.current, request);
            },
          );
          if (generation === draftGeneration.current) close();
          await reloadRef.current();
        } catch (requestError) {
          const completed = requestError?.completedActions || [];
          if (completed.length) {
            await reloadRef.current().catch(() => {});
          }
          setState((prev) =>
            generation !== draftGeneration.current
              ? prev
              : {
                  ...prev,
                  saving: false,
                  screen: "hub",
                  error: completed.length
                    ? `Сохранено: ${completed.join(", ")}. ${requestError?.message || "Не удалось сохранить остальные изменения"}. Повторное сохранение применит только оставшиеся изменения.`
                    : requestError?.message || "Не удалось сохранить изменения",
                },
          );
        } finally {
          saveInProgress.current = false;
        }
      };

      if (!needsPointConfirm) {
        await runSave();
        return;
      }

      try {
        const accepted = await confirm({
          title: "Предупреждение",
          message: "Точно сменить точку с сегодняшнего дня?",
          confirmLabel: "Сменить",
          confirmTone: "success",
          cancelTone: "danger",
        });
        if (accepted) await runSave();
      } finally {
        saveInProgress.current = false;
      }
    },
    [
      access,
      api,
      close,
      confirm,
      isCurrentPeriodAvailable,
      monthId,
      selectedPart,
      state.draft,
      state.mode,
      state.user,
      state.users,
    ],
  );

  return {
    state,
    open,
    openSelected,
    updateUsers,
    close,
    openBulk,
    backToHub,
    openSchedule,
    openShift,
    openPoint,
    applyScheduleDraft,
    applyShiftDraft,
    applyPointDraft,
    saveChanges,
  };
}
