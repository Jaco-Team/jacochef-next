import { useCallback, useState } from "react";
import { buildEditDraft, EDIT_SCHEDULE_SCOPE } from "./staffScheduleEditViewModel";

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
  confirm,
  monthId,
  selectedPart,
  visibleRows,
  selectedRowIds,
  shiftOptions,
  onReload,
}) {
  const [state, setState] = useState(() => createFastActionsState());

  const close = useCallback(() => {
    setState(createFastActionsState());
  }, []);

  const open = useCallback(
    (row) => {
      if (!row?.id || String(row?.smena_id ?? "") === "-1") {
        return;
      }

      const shiftLabel =
        shiftOptions.find((item) => String(item.id) === String(row.smena_id))?.name || "—";

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
    [shiftOptions],
  );

  const openBulk = useCallback(() => {
    const selectedRows = visibleRows
      .filter((row) => row?.row !== "header")
      .map((row) => row?.data)
      .filter((row) => row?.id && selectedRowIds.includes(String(row.id)));

    if (!selectedRows.length) {
      return;
    }

    setState({
      ...createFastActionsState(),
      open: true,
      mode: "bulk",
      screen: "schedule",
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
  }, [selectedRowIds, visibleRows]);

  const openSelected = useCallback(() => {
    const selectedRows = visibleRows
      .filter((row) => row?.row !== "header")
      .map((row) => row?.data)
      .filter((row) => row?.id && selectedRowIds.includes(String(row.id)));

    if (selectedRows.length === 1) {
      open(selectedRows[0]);
      return;
    }

    if (selectedRows.length > 1) {
      openBulk();
    }
  }, [open, openBulk, selectedRowIds, visibleRows]);

  const backToHub = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "hub",
      error: "",
    }));
  }, []);

  const openSchedule = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "schedule",
      error: "",
    }));
  }, []);

  const openShift = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "shift",
      error: "",
    }));
  }, []);

  const openPoint = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "point",
      error: "",
    }));
  }, []);

  const applyScheduleDraft = useCallback((nextScheduleDraft) => {
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
  }, []);

  const applyShiftDraft = useCallback((nextSmenaId) => {
    setState((prev) => ({
      ...prev,
      screen: "hub",
      error: "",
      draft: {
        ...prev.draft,
        smenaId: nextSmenaId,
      },
    }));
  }, []);

  const applyPointDraft = useCallback((pointItem) => {
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
  }, []);

  const persistDraft = useCallback(
    async (draft, user, users, mode) => {
      if (mode === "bulk") {
        if (draft?.scheduleType && draft?.scheduleScope) {
          const payload = {
            date: monthId,
            type: draft.scheduleType,
            users: users.map((item) => ({
              user_id: item.id,
              smena_id: item.smena_id,
              app_id: item.app_id,
            })),
          };

          const response =
            draft.scheduleScope === EDIT_SCHEDULE_SCOPE.month
              ? await api.saveFastTimeArrMounth(payload)
              : await api.saveFastTimeArrTwoWeek(payload);

          if (response?.st === false) {
            throw new Error(response?.text || "Не удалось сохранить график");
          }
        }

        return;
      }

      if (draft?.scheduleType && draft?.scheduleScope) {
        const schedulePayload = {
          type: draft.scheduleType,
          user_id: user.id,
          app_id: user.app_id,
          smena_id: user.smena_id,
          date: monthId,
        };

        const scheduleResponse =
          draft.scheduleScope === EDIT_SCHEDULE_SCOPE.month
            ? await api.saveFastTime(schedulePayload)
            : await api.saveFastTimeWeekOne(schedulePayload);

        if (scheduleResponse?.st === false) {
          throw new Error(scheduleResponse?.text || "Не удалось сохранить график");
        }
      }

      if (draft?.smenaId && String(draft.smenaId) !== String(user?.smena_id ?? "")) {
        const smenaResponse = await api.saveFastSmena({
          new_smena_id: draft.smenaId,
          user_id: user.id,
          app_id: user.app_id,
          smena_id: user.smena_id,
          date: monthId,
          part: selectedPart + 1,
        });

        if (smenaResponse?.st === false) {
          throw new Error(smenaResponse?.text || "Не удалось сменить смену");
        }
      }

      if (draft?.point?.point_id) {
        const pointResponse = await api.saveFastPoint({
          new_point_id: draft.point.point_id,
          new_smena_id: draft.point.smena_id,
          user_id: user.id,
          app_id: user.app_id,
          smena_id: user.smena_id,
        });

        if (pointResponse?.st === false) {
          throw new Error(pointResponse?.text || "Не удалось сменить точку");
        }
      }
    },
    [api, monthId, selectedPart],
  );

  const saveChanges = useCallback(
    async (nextDraftOverride = null) => {
      const user = state.user;
      const users = state.users;
      const draft = nextDraftOverride || state.draft;
      const mode = state.mode;

      if ((!user && mode !== "bulk") || !draft) {
        return;
      }

      const needsPointConfirm = Boolean(draft?.point?.point_id);

      const runSave = async () => {
        setState((prev) => ({
          ...prev,
          saving: true,
          error: "",
        }));

        try {
          await persistDraft(draft, user, users, mode);
          close();
          await onReload();
        } catch (requestError) {
          setState((prev) => ({
            ...prev,
            saving: false,
            error: requestError?.message || "Не удалось сохранить изменения",
          }));
        }
      };

      if (!needsPointConfirm) {
        await runSave();
        return;
      }

      const accepted = await confirm({
        title: "Предупреждение",
        message: "Точно сменить точку с сегодняшнего дня?",
        confirmLabel: "Сменить",
      });

      if (accepted) {
        await runSave();
      }
    },
    [close, confirm, onReload, persistDraft, state.draft, state.mode, state.user, state.users],
  );

  return {
    state,
    open,
    openSelected,
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
