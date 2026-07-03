import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfirm } from "@/ui/v2";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { EMPTY_PERIOD } from "./staffScheduleConstants";
import {
  computeTotalSum,
  getActiveMonthId,
  getPartStartDate,
  toArray,
} from "./staffScheduleHelpers";
import {
  buildGraphState,
  buildPageViewModel,
  getModuleTitle,
  hasBootstrapPayload,
  hasGraphPayload,
} from "./staffScheduleViewModel";
import {
  buildDayModalViewModel,
  buildMonthModalViewModel,
  hasDayModalPayload,
  hasMonthModalPayload,
} from "./staffScheduleModalViewModel";
import useStaffScheduleExport from "./useStaffScheduleExport";
import useStaffScheduleFastActions from "./useStaffScheduleFastActions";
import useResourceModalState from "./useResourceModalState";
import { buildCamErrorModalData, buildOrderErrorModalData } from "./staffScheduleErrorViewModel";

export default function useStaffSchedulePage() {
  const api = useStaffScheduleApi();
  const { confirm, ConfirmDialog } = useConfirm();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [error, setError] = useState("");
  const [moduleName, setModuleName] = useState("График работы");
  const [points, setPoints] = useState([]);
  const [months, setMonths] = useState([]);
  const [pointId, setPointId] = useState("");
  const [monthId, setMonthId] = useState("");
  const [access, setAccess] = useState({});
  const [graph, setGraph] = useState({
    oneMeta: EMPTY_PERIOD,
    twoMeta: EMPTY_PERIOD,
    oneRows: [],
    twoRows: [],
    part: 1,
    kind: "",
    show_zp_one: 0,
    show_zp_two: 0,
    errors: {
      one: { orders: [], cam: [] },
      two: { orders: [], cam: [] },
    },
  });
  const [selectedPart, setSelectedPart] = useState(0);
  const [selectedShiftId, setSelectedShiftId] = useState("all");
  const [isCalendarHidden, setIsCalendarHidden] = useState(false);
  const [colorMode, setColorMode] = useState("default");
  const [collapsedShiftIds, setCollapsedShiftIds] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const dayModalState = useResourceModalState({
    open: false,
    loading: false,
    error: "",
    request: null,
    data: null,
  });
  const monthModalState = useResourceModalState({
    open: false,
    loading: false,
    error: "",
    request: null,
    data: null,
  });
  const smenaModalState = useResourceModalState({
    open: false,
    loading: false,
    error: "",
    mode: "create",
    request: null,
    data: null,
  });
  const summaryActionState = useResourceModalState({
    open: false,
    loading: false,
    error: "",
    mode: "",
    request: null,
    data: null,
  });
  const errorAppealState = useResourceModalState({
    open: false,
    loading: false,
    error: "",
    request: null,
    data: null,
  });
  const dayModal = dayModalState.state;
  const monthModal = monthModalState.state;
  const smenaModal = smenaModalState.state;
  const summaryActionModal = summaryActionState.state;
  const errorAppealModal = errorAppealState.state;
  const directorLevelOptions = useMemo(
    () =>
      Array.from({ length: 41 }, (_, index) => {
        const value = index - 20;
        return {
          id: value,
          name: `${value} уровень`,
        };
      }),
    [],
  );

  const loadGraph = useCallback(
    async (nextPointId, nextMonthId) => {
      if (!nextPointId || !nextMonthId) {
        return;
      }

      setIsGraphLoading(true);
      setError("");

      try {
        const response = await api.getGraph({
          point_id: nextPointId,
          month: nextMonthId,
        });

        if (response?.st === false || !hasGraphPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить график");
        }

        setGraph(buildGraphState(response));
        setAccess(response?.access ?? {});
        setSelectedPart(Math.max(Number(response?.part || 1) - 1, 0));
      } catch (requestError) {
        setError(requestError?.message || "Не удалось загрузить график");
      } finally {
        setIsGraphLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setError("");

      try {
        const response = await api.getAll();

        if (response?.st === false || !hasBootstrapPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить модуль");
        }

        if (!isMounted) {
          return;
        }

        const nextPoints = toArray(response?.point_list);
        const nextMonths = toArray(response?.months);
        const nextPointId = nextPoints[0]?.id ?? "";
        const nextMonthId = getActiveMonthId(nextMonths);

        setModuleName(getModuleTitle(response));
        setPoints(nextPoints);
        setMonths(nextMonths);
        setPointId(nextPointId);
        setMonthId(nextMonthId);
        setAccess(response?.access ?? {});

        if (nextPointId && nextMonthId) {
          await loadGraph(nextPointId, nextMonthId);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || "Не удалось загрузить модуль");
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [api, loadGraph]);

  useEffect(() => {
    document.title = moduleName;
  }, [moduleName]);

  const view = useMemo(
    () =>
      buildPageViewModel({
        moduleName,
        access,
        graph,
        selectedPart,
        selectedShiftId,
        collapsedShiftIds,
      }),
    [access, collapsedShiftIds, graph, moduleName, selectedPart, selectedShiftId],
  );
  const periodBonusState = useMemo(
    () => view.activePeriod?.meta?.bonus_other ?? 0,
    [view.activePeriod],
  );

  useEffect(() => {
    setSelectedShiftId("all");
    setCollapsedShiftIds([]);
    setSelectedRowIds([]);
  }, [selectedPart, pointId, monthId]);

  const handlePointChange = useCallback(
    async (event) => {
      const nextPointId = event.target.value;
      setPointId(nextPointId);
      await loadGraph(nextPointId, monthId);
    },
    [loadGraph, monthId],
  );

  const handleMonthChange = useCallback(
    async (event) => {
      const nextMonthId = event.target.value;
      setMonthId(nextMonthId);
      await loadGraph(pointId, nextMonthId);
    },
    [loadGraph, pointId],
  );

  const handleReload = useCallback(async () => {
    await loadGraph(pointId, monthId);
  }, [loadGraph, monthId, pointId]);

  const handleShiftChange = useCallback((event) => {
    setSelectedShiftId(event.target.value);
    setSelectedRowIds([]);
  }, []);

  const handleCalendarVisibilityChange = useCallback((event) => {
    setIsCalendarHidden(!event.target.checked);
  }, []);

  const handleColorModeChange = useCallback((event) => {
    setColorMode(event.target.checked ? "default" : "plain");
  }, []);

  const handleToggleShiftCollapse = useCallback((shiftId) => {
    setCollapsedShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((item) => item !== shiftId) : [...prev, shiftId],
    );
  }, []);

  const handleToggleRowSelection = useCallback((rowId) => {
    if (!rowId) {
      return;
    }

    setSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((item) => item !== rowId) : [...prev, rowId],
    );
  }, []);

  const handleOpenDayModal = useCallback(
    async (row, date) => {
      if (!row?.id || !row?.smena_id || !row?.app_id || !date || !row?.date) {
        return;
      }

      const request = {
        user_id: row.id,
        smena_id: row.smena_id,
        app_id: row.app_id,
        point_id: pointId,
        date,
        date_start: row.date,
      };

      dayModalState.openLoading({ request, data: null });

      try {
        const response = await api.getUserDay(request);

        if (response?.st === false || !hasDayModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить данные сотрудника");
        }

        dayModalState.openReady({
          request,
          data: buildDayModalViewModel(response, {
            roleKind: graph.kind,
            checkPeriod: row?.check_period,
          }),
        });
      } catch (requestError) {
        dayModalState.openError(requestError?.message || "Не удалось загрузить данные сотрудника", {
          request,
          data: null,
        });
      }
    },
    [api, dayModalState, pointId],
  );

  const handleCloseDayModal = useCallback(() => {
    dayModalState.close();
  }, [dayModalState]);

  const handleSaveDayModal = useCallback(
    async (payload) => {
      const response = await api.saveUserDay(payload);

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось сохранить день");
      }

      handleCloseDayModal();
      await handleReload();
    },
    [api, handleCloseDayModal, handleReload],
  );

  const handleOpenMonthModal = useCallback(
    async (row) => {
      if (!row?.id || !row?.smena_id || !row?.app_id || !monthId || !row?.date) {
        return;
      }

      const request = {
        user_id: row.id,
        smena_id: row.smena_id,
        app_id: row.app_id,
        date: monthId,
        date_start: row.date,
      };

      monthModalState.openLoading({ request, data: null });

      try {
        const response = await api.getUserMonth(request);

        if (response?.st === false || !hasMonthModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить месячные часы");
        }

        const data = buildMonthModalViewModel(response, {
          roleKind: graph.kind,
          monthId,
          rowData: row,
          periodDays: view.activePeriod?.meta?.days,
        });

        monthModalState.openReady({
          request: {
            ...request,
            canEditMonth: data.canEditMonth,
          },
          data,
        });
      } catch (requestError) {
        monthModalState.openError(requestError?.message || "Не удалось загрузить месячные часы", {
          request,
          data: null,
        });
      }
    },
    [api, graph.kind, monthId, monthModalState, view.activePeriod?.meta?.days],
  );

  const handleCloseMonthModal = useCallback(() => {
    monthModalState.close();
  }, [monthModalState]);

  const handleSaveMonthModal = useCallback(
    async (payload) => {
      const response = await api.saveUserMonth(payload);

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось сохранить месяц");
      }

      handleCloseMonthModal();
      await handleReload();
    },
    [api, handleCloseMonthModal, handleReload],
  );

  const handleOpenCreateSmena = useCallback(async () => {
    smenaModalState.openLoading({
      mode: "create",
      request: { point_id: pointId },
      data: null,
    });

    try {
      const response = await api.getAllForNewSmena({ point_id: pointId });

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось загрузить список сотрудников");
      }

      smenaModalState.openReady({
        mode: "create",
        request: { point_id: pointId },
        data: {
          name: "",
          users: toArray(response?.free_users),
        },
      });
    } catch (requestError) {
      smenaModalState.openError(
        requestError?.message || "Не удалось загрузить список сотрудников",
        {
          mode: "create",
          request: { point_id: pointId },
          data: null,
        },
      );
    }
  }, [api, pointId, smenaModalState]);

  const handleOpenEditSmena = useCallback(
    async (smenaId) => {
      if (!smenaId) {
        return;
      }

      smenaModalState.openLoading({
        mode: "edit",
        request: { id: smenaId, point_id: pointId },
        data: null,
      });

      try {
        const response = await api.getOneSmena({ id: smenaId, point_id: pointId });

        if (response?.st === false || !response?.smena) {
          throw new Error(response?.text || "Не удалось загрузить смену");
        }

        smenaModalState.openReady({
          mode: "edit",
          request: { id: smenaId, point_id: pointId },
          data: {
            name: response?.smena?.name ?? "",
            users: toArray(response?.free_users),
          },
        });
      } catch (requestError) {
        smenaModalState.openError(requestError?.message || "Не удалось загрузить смену", {
          mode: "edit",
          request: { id: smenaId, point_id: pointId },
          data: null,
        });
      }
    },
    [api, pointId, smenaModalState],
  );

  const handleCloseSmenaModal = useCallback(() => {
    smenaModalState.close();
  }, [smenaModalState]);

  const handleOpenSummaryAction = useCallback(
    (row, key) => {
      if (key === "dir_lv") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: monthId,
            point_id: pointId,
          },
          data: {
            title: `Изменение уровня директора ${monthId}`,
            value: graph?.add_lv ?? 0,
            options: directorLevelOptions,
          },
        });
        return;
      }

      if (key === "dop_bonus_toggle") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: monthId,
            part: selectedPart,
            point_id: pointId,
          },
          data: {
            title: `Командный бонус ${getPartStartDate(monthId, selectedPart)}`,
            value: periodBonusState,
            options: [
              { id: 1, name: "Выдать" },
              { id: 2, name: "Отказать" },
            ],
          },
        });
        return;
      }

      if (!row?.id) {
        return;
      }

      const periodStartDate = getPartStartDate(monthId, selectedPart);

      if (key === "price_p_h") {
        const options = toArray(row?.price_arr).map((item) => ({
          id: item,
          name: String(item),
        }));

        if (!options.length) {
          return;
        }

        summaryActionState.openReady({
          mode: key,
          request: {
            date: monthId,
            part: selectedPart,
            user_id: row.id,
            app_id: row.app_id,
            smena_id: row.smena_id,
          },
          data: {
            title: `Часовая ставка ${row?.user_name || ""} ${monthId}`,
            value: row?.price_p_h ?? "",
            options,
          },
        });
        return;
      }

      if (key === "given") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: periodStartDate,
            user_id: row.id,
            app_id: row.app_id,
            smena_id: row.smena_id,
          },
          data: {
            title: [row?.full_app_name || row?.app_name, row?.user_name, periodStartDate]
              .filter(Boolean)
              .join(" "),
            label: "Выданная сумма",
            value: row?.given ?? "",
            fullAmount:
              computeTotalSum(row) - Number(row?.given_cart || 0) - Number(row?.withheld || 0),
          },
        });
        return;
      }

      if (key === "given_cart") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: periodStartDate,
            user_id: row.id,
            app_id: row.app_id,
            smena_id: row.smena_id,
          },
          data: {
            title: `Перечислено на карту ${[
              row?.full_app_name || row?.app_name,
              row?.user_name,
              periodStartDate,
            ]
              .filter(Boolean)
              .join(" ")}`,
            label: "Выданная сумма",
            value: row?.given_cart ?? "",
            fullAmount: computeTotalSum(row) - Number(row?.withheld || 0),
          },
        });
        return;
      }

      if (key === "withheld") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: periodStartDate,
            user_id: row.id,
            app_id: row.app_id,
            smena_id: row.smena_id,
          },
          data: {
            title: `Удержано по исполнительному листу ${[
              row?.full_app_name || row?.app_name,
              row?.user_name,
              periodStartDate,
            ]
              .filter(Boolean)
              .join(" ")}`,
            label: "Удержанная сумма",
            value: row?.withheld ?? "",
          },
        });
        return;
      }

      if (key === "my_bonus") {
        summaryActionState.openReady({
          mode: key,
          request: {
            date: monthId,
            user_id: row.id,
          },
          data: {
            title: `Бонус директора ${row?.user_name || ""} ${monthId}`,
            label: "Сумма",
            value: row?.dir_bonus ?? "",
          },
        });
      }
    },
    [
      directorLevelOptions,
      graph?.add_lv,
      monthId,
      periodBonusState,
      pointId,
      selectedPart,
      summaryActionState,
    ],
  );

  const handleCloseSummaryAction = useCallback(() => {
    summaryActionState.close();
  }, [summaryActionState]);

  const handleOpenOrderError = useCallback(
    async (item) => {
      const request = {
        id: item?.id,
        row_id: item?.row_id,
      };

      errorAppealState.openLoading({ request, data: null });

      try {
        const response = await api.getMyErrOrder(request);

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось загрузить ошибку заказа");
        }

        errorAppealState.openReady({
          request,
          data: buildOrderErrorModalData(response),
        });
      } catch (requestError) {
        errorAppealState.openError(requestError?.message || "Не удалось загрузить ошибку заказа", {
          request,
          data: null,
        });
      }
    },
    [api, errorAppealState],
  );

  const handleOpenCamError = useCallback(
    async (item) => {
      const request = {
        id: item?.id,
      };

      errorAppealState.openLoading({ request, data: null });

      try {
        const response = await api.getMyErrCam(request);

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось загрузить ошибку камеры");
        }

        errorAppealState.openReady({
          request,
          data: buildCamErrorModalData(response),
        });
      } catch (requestError) {
        errorAppealState.openError(requestError?.message || "Не удалось загрузить ошибку камеры", {
          request,
          data: null,
        });
      }
    },
    [api, errorAppealState],
  );

  const handleCloseErrorAppeal = useCallback(() => {
    errorAppealState.close();
  }, [errorAppealState]);

  const handleSaveErrorAppeal = useCallback(
    async ({ type, appealText }) => {
      const accepted = await confirm({
        title: "Предупреждение",
        message: "Точно обжаловать ?",
        confirmLabel: "Обжаловать",
      });

      if (!accepted) {
        return;
      }

      errorAppealState.patch({ loading: true, error: "" });

      try {
        const response =
          type === "order"
            ? await api.saveFakeOrders({
                err_id: errorAppealModal.data?.errId,
                row_id: errorAppealModal.data?.rowId,
                order_id: errorAppealModal.data?.orderId,
                text: appealText,
              })
            : await api.saveFakeCam({
                id: errorAppealModal.data?.id,
                text: appealText,
              });

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось отправить обжалование");
        }

        handleCloseErrorAppeal();
        await handleReload();
      } catch (requestError) {
        errorAppealState.patch({
          loading: false,
          error: requestError?.message || "Не удалось отправить обжалование",
        });
      }
    },
    [api, confirm, errorAppealModal.data, errorAppealState, handleCloseErrorAppeal, handleReload],
  );

  const handleSaveSummaryAction = useCallback(
    async ({ mode, request, value }) => {
      let response = null;

      if (mode === "price_p_h") {
        response = await api.saveUserPriceH({ ...request, price: value });
      }

      if (mode === "given") {
        response = await api.saveUserGivePrice({ ...request, give_price: value });
      }

      if (mode === "given_cart") {
        response = await api.saveUserGiveCartPrice({ ...request, give_price: value });
      }

      if (mode === "withheld") {
        response = await api.saveUserWithheld({ ...request, withheld: value });
      }

      if (mode === "my_bonus") {
        response = await api.saveDirBonus({ ...request, bonus: value });
      }

      if (mode === "dir_lv") {
        response = await api.saveDirLv({ ...request, dir_lv: value });
      }

      if (mode === "dop_bonus_toggle") {
        response = await api.saveDopBonus({ ...request, type: value });
      }

      if (response?.st === false || !response) {
        throw new Error(response?.text || "Не удалось сохранить значение");
      }

      handleCloseSummaryAction();
      await handleReload();
    },
    [api, handleCloseSummaryAction, handleReload],
  );

  const handleRemoveTeamBonusFromUser = useCallback(
    async (row) => {
      const accepted = await confirm({
        title: "Предупреждение",
        message: `Лишить командного бонуса ${row?.user_name || "сотрудника"}?`,
        confirmLabel: "Лишить",
      });

      if (!accepted) {
        return;
      }

      try {
        const response = await api.deleteDopBonusUser({
          point_id: pointId,
          user_id: row?.id,
          smena_id: row?.smena_id,
          app_id: row?.app_id,
          part: selectedPart,
          data: monthId,
        });

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось изменить командный бонус");
        }

        await handleReload();
      } catch (requestError) {
        setError(requestError?.message || "Не удалось изменить командный бонус");
      }
    },
    [api, confirm, handleReload, monthId, pointId, selectedPart],
  );

  const handleSaveSmenaModal = useCallback(
    async ({ id, name, users }) => {
      const payload = {
        name,
        point_id: pointId,
        users: users.map((item) =>
          smenaModal.mode === "create"
            ? {
                id: item.id,
                is_my: item.is_my,
              }
            : {
                id: item.id,
                app_id: item.app_id,
                is_my: item.is_my,
              },
        ),
      };

      const response =
        smenaModal.mode === "create"
          ? await api.saveNewSmena(payload)
          : await api.saveEditSmena({ ...payload, id });

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось сохранить смену");
      }

      handleCloseSmenaModal();
      await handleReload();
    },
    [api, handleCloseSmenaModal, handleReload, pointId, smenaModal.mode],
  );

  const handleRequestDeleteSmena = useCallback(async () => {
    const accepted = await confirm({
      title: "Предупреждение",
      message: "Смена будет удалена, если в ней нет сотрудников.",
      confirmLabel: "Удалить",
    });

    if (!accepted) {
      return;
    }

    try {
      const response = await api.deleteSmena({
        id: smenaModal.request?.id,
        users: smenaModal.data?.users ?? [],
      });

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось удалить смену");
      }

      handleCloseSmenaModal();
      await handleReload();
    } catch (requestError) {
      setError(requestError?.message || "Не удалось выполнить действие");
    }
  }, [
    api,
    confirm,
    handleCloseSmenaModal,
    handleReload,
    smenaModal.data?.users,
    smenaModal.request?.id,
  ]);

  const pointLabel = useMemo(
    () => points.find((item) => String(item.id) === String(pointId))?.name || "—",
    [pointId, points],
  );

  const fastActions = useStaffScheduleFastActions({
    api,
    confirm,
    monthId,
    selectedPart,
    visibleRows: view.visibleRows,
    selectedRowIds,
    shiftOptions: view.shiftOptions,
    onReload: handleReload,
  });

  const exportActions = useStaffScheduleExport({
    api,
    access,
    pointId,
  });

  return {
    isBootstrapping,
    isGraphLoading,
    error,
    points,
    months,
    pointId,
    monthId,
    access,
    selectedPart,
    selectedShiftId,
    isCalendarHidden,
    colorMode,
    collapsedShiftIds,
    selectedRowIds,
    view,
    dayModal,
    monthModal,
    smenaModal,
    summaryActionModal,
    errorAppealModal,
    fastActions: fastActions.state,
    pointLabel,
    graphKind: graph.kind,
    directorLevel: graph.add_lv,
    periodBonusState: view.activePeriod?.meta?.bonus_other ?? 0,
    exportDialog: exportActions.dialog,
    canExport: exportActions.canExport,
    ConfirmDialog,
    setSelectedPart,
    handlePointChange,
    handleMonthChange,
    handleReload,
    handleShiftChange,
    handleCalendarVisibilityChange,
    handleColorModeChange,
    handleToggleShiftCollapse,
    handleToggleRowSelection,
    handleOpenDayModal,
    handleCloseDayModal,
    handleSaveDayModal,
    handleOpenMonthModal,
    handleCloseMonthModal,
    handleSaveMonthModal,
    handleOpenCreateSmena,
    handleOpenEditSmena,
    handleCloseSmenaModal,
    handleSaveSmenaModal,
    handleRequestDeleteSmena,
    handleOpenSummaryAction,
    handleCloseSummaryAction,
    handleSaveSummaryAction,
    handleOpenOrderError,
    handleOpenCamError,
    handleCloseErrorAppeal,
    handleSaveErrorAppeal,
    handleRemoveTeamBonusFromUser,
    handleOpenFastActions: fastActions.open,
    handleCloseFastActions: fastActions.close,
    handleOpenBulkFastActions: fastActions.openBulk,
    handleEditDialogBackToHub: fastActions.backToHub,
    handleEditDialogOpenSchedule: fastActions.openSchedule,
    handleEditDialogOpenShift: fastActions.openShift,
    handleEditDialogOpenPoint: fastActions.openPoint,
    handleEditDialogApplyScheduleDraft: fastActions.applyScheduleDraft,
    handleEditDialogApplyShiftDraft: fastActions.applyShiftDraft,
    handleEditDialogApplyPointDraft: fastActions.applyPointDraft,
    handleEditDialogSaveChanges: fastActions.saveChanges,
    handleOpenExportDialog: exportActions.open,
    handleCloseExportDialog: exportActions.close,
    handleExportDateStartChange: exportActions.setDateStart,
    handleExportDateEndChange: exportActions.setDateEnd,
    handleExportDownload: exportActions.download,
  };
}
