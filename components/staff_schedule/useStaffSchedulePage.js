import { useCallback, useEffect, useMemo, useState } from "react";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { EMPTY_PERIOD, STAFF_SCHEDULE_SOURCE_MODES } from "./staffScheduleConstants";
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
  const [dataSource, setDataSource] = useState(STAFF_SCHEDULE_SOURCE_MODES.STAFF_SCHEDULE);
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
        setDataSource(response?.__source ?? STAFF_SCHEDULE_SOURCE_MODES.STAFF_SCHEDULE);
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
        setDataSource(response?.__source ?? STAFF_SCHEDULE_SOURCE_MODES.STAFF_SCHEDULE);

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
    setIsCalendarHidden(event.target.checked);
  }, []);

  const handleColorModeChange = useCallback((event) => {
    setColorMode(event.target.value);
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

  return {
    isBootstrapping,
    isGraphLoading,
    error,
    points,
    months,
    pointId,
    monthId,
    access,
    dataSource,
    selectedPart,
    selectedShiftId,
    isCalendarHidden,
    colorMode,
    collapsedShiftIds,
    selectedRowIds,
    view,
    dayModal,
    monthModal,
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
  };
}
