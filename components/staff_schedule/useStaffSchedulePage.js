import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { EMPTY_PERIOD } from "./staffScheduleConstants";
import {
  canExportExcel,
  getActiveMonthId,
  openExportDownloadUrl,
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

export default function useStaffSchedulePage() {
  const api = useStaffScheduleApi();

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
  const [dayModal, setDayModal] = useState({
    open: false,
    loading: false,
    error: "",
    request: null,
    data: null,
  });
  const [monthModal, setMonthModal] = useState({
    open: false,
    loading: false,
    error: "",
    request: null,
    data: null,
  });
  const [smenaModal, setSmenaModal] = useState({
    open: false,
    loading: false,
    error: "",
    mode: "create",
    request: null,
    data: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Подтвердить",
    onConfirm: null,
  });
  const [fastActions, setFastActions] = useState({
    open: false,
    screen: "root",
    user: null,
  });
  const [exportDialog, setExportDialog] = useState({
    open: false,
    mode: "ws",
    dateStart: "",
    dateEnd: "",
    loading: false,
    error: "",
  });

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

      setDayModal({
        open: true,
        loading: true,
        error: "",
        request,
        data: null,
      });

      try {
        const response = await api.getUserDay(request);

        if (response?.st === false || !hasDayModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить данные сотрудника");
        }

        setDayModal({
          open: true,
          loading: false,
          error: "",
          request,
          data: buildDayModalViewModel(response),
        });
      } catch (requestError) {
        setDayModal({
          open: true,
          loading: false,
          error: requestError?.message || "Не удалось загрузить данные сотрудника",
          request,
          data: null,
        });
      }
    },
    [api, pointId],
  );

  const handleCloseDayModal = useCallback(() => {
    setDayModal({
      open: false,
      loading: false,
      error: "",
      request: null,
      data: null,
    });
  }, []);

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

      setMonthModal({
        open: true,
        loading: true,
        error: "",
        request,
        data: null,
      });

      try {
        const response = await api.getUserMonth(request);

        if (response?.st === false || !hasMonthModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить месячные часы");
        }

        setMonthModal({
          open: true,
          loading: false,
          error: "",
          request,
          data: buildMonthModalViewModel(response),
        });
      } catch (requestError) {
        setMonthModal({
          open: true,
          loading: false,
          error: requestError?.message || "Не удалось загрузить месячные часы",
          request,
          data: null,
        });
      }
    },
    [api, monthId],
  );

  const handleCloseMonthModal = useCallback(() => {
    setMonthModal({
      open: false,
      loading: false,
      error: "",
      request: null,
      data: null,
    });
  }, []);

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
    setSmenaModal({
      open: true,
      loading: true,
      error: "",
      mode: "create",
      request: { point_id: pointId },
      data: null,
    });

    try {
      const response = await api.getAllForNewSmena({ point_id: pointId });

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось загрузить список сотрудников");
      }

      setSmenaModal({
        open: true,
        loading: false,
        error: "",
        mode: "create",
        request: { point_id: pointId },
        data: {
          name: "",
          users: toArray(response?.free_users),
        },
      });
    } catch (requestError) {
      setSmenaModal({
        open: true,
        loading: false,
        error: requestError?.message || "Не удалось загрузить список сотрудников",
        mode: "create",
        request: { point_id: pointId },
        data: null,
      });
    }
  }, [api, pointId]);

  const handleOpenEditSmena = useCallback(
    async (smenaId) => {
      if (!smenaId) {
        return;
      }

      setSmenaModal({
        open: true,
        loading: true,
        error: "",
        mode: "edit",
        request: { id: smenaId, point_id: pointId },
        data: null,
      });

      try {
        const response = await api.getOneSmena({ id: smenaId, point_id: pointId });

        if (response?.st === false || !response?.smena) {
          throw new Error(response?.text || "Не удалось загрузить смену");
        }

        setSmenaModal({
          open: true,
          loading: false,
          error: "",
          mode: "edit",
          request: { id: smenaId, point_id: pointId },
          data: {
            name: response?.smena?.name ?? "",
            users: toArray(response?.free_users),
          },
        });
      } catch (requestError) {
        setSmenaModal({
          open: true,
          loading: false,
          error: requestError?.message || "Не удалось загрузить смену",
          mode: "edit",
          request: { id: smenaId, point_id: pointId },
          data: null,
        });
      }
    },
    [api, pointId],
  );

  const handleCloseSmenaModal = useCallback(() => {
    setSmenaModal({
      open: false,
      loading: false,
      error: "",
      mode: "create",
      request: null,
      data: null,
    });
  }, []);

  const handleSaveSmenaModal = useCallback(
    async ({ id, name, users }) => {
      const payload = {
        name,
        point_id: pointId,
        users: users.map((item) => ({
          id: item.id,
          app_id: item.app_id,
          is_my: item.is_my,
        })),
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

  const handleRequestDeleteSmena = useCallback(() => {
    setConfirmDialog({
      open: true,
      title: "Удалить смену?",
      message: "Смена будет удалена, если в ней нет сотрудников.",
      confirmLabel: "Удалить",
      onConfirm: async () => {
        const response = await api.deleteSmena({
          id: smenaModal.request?.id,
          point_id: pointId,
          users: smenaModal.data?.users ?? [],
        });

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось удалить смену");
        }

        handleCloseSmenaModal();
        await handleReload();
      },
    });
  }, [api, handleCloseSmenaModal, handleReload, pointId, smenaModal]);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      confirmLabel: "Подтвердить",
      onConfirm: null,
    });
  }, []);

  const handleConfirmDialog = useCallback(async () => {
    const action = confirmDialog.onConfirm;

    handleCloseConfirmDialog();

    if (!action) {
      return;
    }

    try {
      await action();
    } catch (requestError) {
      setError(requestError?.message || "Не удалось выполнить действие");
    }
  }, [confirmDialog.onConfirm, handleCloseConfirmDialog]);

  const handleOpenFastActions = useCallback((row) => {
    if (!row?.id || String(row?.smena_id ?? "") === "-1") {
      return;
    }

    setFastActions({
      open: true,
      screen: "root",
      user: row,
    });
  }, []);

  const handleCloseFastActions = useCallback(() => {
    setFastActions({
      open: false,
      screen: "root",
      user: null,
    });
  }, []);

  const handleOpenBulkFastActions = useCallback(() => {
    const selectedRows = view.visibleRows
      .filter((row) => row?.row !== "header")
      .map((row) => row?.data)
      .filter((row) => row?.id && selectedRowIds.includes(String(row.id)));

    if (!selectedRows.length) {
      return;
    }

    handleOpenFastActions(selectedRows[0]);
  }, [handleOpenFastActions, selectedRowIds, view.visibleRows]);

  const runFastMutation = useCallback(
    async (request) => {
      try {
        const response = await request();

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось выполнить действие");
        }

        handleCloseFastActions();
        await handleReload();
      } catch (requestError) {
        setError(requestError?.message || "Не удалось выполнить действие");
      }
    },
    [handleCloseFastActions, handleReload],
  );

  const handleSelectFastSmena = useCallback(
    (newSmenaId) => {
      const user = fastActions.user;

      if (!user) {
        return;
      }

      runFastMutation(() =>
        api.saveFastSmena({
          new_smena_id: newSmenaId,
          user_id: user.id,
          app_id: user.app_id,
          smena_id: user.smena_id,
          date: monthId,
          part: selectedPart + 1,
        }),
      );
    },
    [api, fastActions.user, monthId, runFastMutation, selectedPart],
  );

  const handleSelectFastPoint = useCallback(
    (pointItem) => {
      const user = fastActions.user;

      if (!user || !pointItem) {
        return;
      }

      handleCloseFastActions();

      setConfirmDialog({
        open: true,
        title: "Сменить точку?",
        message: "Точно сменить точку с сегодняшнего дня?",
        confirmLabel: "Сменить",
        onConfirm: async () => {
          const response = await api.saveFastPoint({
            new_point_id: pointItem.point_id,
            new_smena_id: pointItem.smena_id,
            user_id: user.id,
            app_id: user.app_id,
            smena_id: user.smena_id,
          });

          if (response?.st === false) {
            throw new Error(response?.text || "Не удалось сменить точку");
          }

          await handleReload();
        },
      });
    },
    [api, fastActions.user, handleCloseFastActions, handleReload],
  );

  const handleOpenFastActionsTimeWeek = useCallback(() => {
    setFastActions((prev) => ({
      ...prev,
      open: true,
      screen: "time-week",
    }));
  }, []);

  const handleOpenFastActionsSmenaList = useCallback(() => {
    setFastActions((prev) => ({
      ...prev,
      open: true,
      screen: "smena-list",
    }));
  }, []);

  const handleOpenFastActionsPointList = useCallback(() => {
    setFastActions((prev) => ({
      ...prev,
      open: true,
      screen: "point-list",
    }));
  }, []);

  const handleSelectFastTimeWeekType = useCallback(
    (type) => {
      const user = fastActions.user;

      if (!user) {
        return;
      }

      runFastMutation(() =>
        api.saveFastTimeWeekOne({
          type,
          user_id: user.id,
          app_id: user.app_id,
          smena_id: user.smena_id,
          date: monthId,
        }),
      );
    },
    [api, fastActions.user, monthId, runFastMutation],
  );

  const handleOpenExportDialog = useCallback((mode) => {
    const today = dayjs().format("YYYY-MM-DD");

    setExportDialog({
      open: true,
      mode,
      dateStart: today,
      dateEnd: today,
      loading: false,
      error: "",
    });
  }, []);

  const handleCloseExportDialog = useCallback(() => {
    setExportDialog({
      open: false,
      mode: "ws",
      dateStart: "",
      dateEnd: "",
      loading: false,
      error: "",
    });
  }, []);

  const handleExportDateStartChange = useCallback((dateStart) => {
    setExportDialog((prev) => ({
      ...prev,
      dateStart,
      error: "",
    }));
  }, []);

  const handleExportDateEndChange = useCallback((dateEnd) => {
    setExportDialog((prev) => ({
      ...prev,
      dateEnd,
      error: "",
    }));
  }, []);

  const handleExportDownload = useCallback(async () => {
    if (!pointId || !exportDialog.dateStart || !exportDialog.dateEnd) {
      return;
    }

    setExportDialog((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const payload = {
        point_id: pointId,
        date_start: exportDialog.dateStart,
        date_end: exportDialog.dateEnd,
      };
      const response =
        exportDialog.mode === "hj" ? await api.downloadHJ(payload) : await api.downloadWS(payload);

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось выгрузить файл");
      }

      if (!openExportDownloadUrl(response)) {
        throw new Error("Не удалось получить ссылку на файл");
      }

      handleCloseExportDialog();
    } catch (requestError) {
      setExportDialog((prev) => ({
        ...prev,
        loading: false,
        error: requestError?.message || "Не удалось выгрузить файл",
      }));
    }
  }, [
    api,
    exportDialog.dateEnd,
    exportDialog.dateStart,
    exportDialog.mode,
    handleCloseExportDialog,
    pointId,
  ]);

  const canExport = canExportExcel(access);

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
    confirmDialog,
    fastActions,
    exportDialog,
    canExport,
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
    handleCloseConfirmDialog,
    handleConfirmDialog,
    handleOpenFastActions,
    handleCloseFastActions,
    handleOpenBulkFastActions,
    handleOpenFastActionsTimeWeek,
    handleOpenFastActionsSmenaList,
    handleOpenFastActionsPointList,
    handleSelectFastSmena,
    handleSelectFastPoint,
    handleSelectFastTimeWeekType,
    handleOpenExportDialog,
    handleCloseExportDialog,
    handleExportDateStartChange,
    handleExportDateEndChange,
    handleExportDownload,
  };
}
