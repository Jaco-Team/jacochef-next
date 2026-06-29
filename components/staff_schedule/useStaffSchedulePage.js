import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfirm } from "@/ui/v2";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { EMPTY_PERIOD } from "./staffScheduleConstants";
import { getActiveMonthId, toArray } from "./staffScheduleHelpers";
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
  const dayModal = dayModalState.state;
  const monthModal = monthModalState.state;
  const smenaModal = smenaModalState.state;

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

        dayModalState.openReady({ request, data: buildDayModalViewModel(response) });
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

        monthModalState.openReady({ request, data: buildMonthModalViewModel(response) });
      } catch (requestError) {
        monthModalState.openError(requestError?.message || "Не удалось загрузить месячные часы", {
          request,
          data: null,
        });
      }
    },
    [api, monthId, monthModalState],
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
    fastActions: fastActions.state,
    pointLabel,
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
