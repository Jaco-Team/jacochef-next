import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useJacoConfirm } from "@/design-system/shared/ui";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { EMPTY_PERIOD } from "./staffScheduleConstants";
import {
  createStaffSchedulePolicy,
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
  buildSummaryActionHeaderData,
  hasDayModalPayload,
  hasMonthModalPayload,
} from "./staffScheduleModalViewModel";
import useStaffScheduleExport from "./useStaffScheduleExport";
import useStaffScheduleFastActions from "./useStaffScheduleFastActions";
import useResourceModalState from "./useResourceModalState";
import { buildCamErrorModalData, buildOrderErrorModalData } from "./staffScheduleErrorViewModel";
import { getAvailablePayoutAmount } from "./staffSchedulePayroll.mjs";
import {
  getEditableStaffScheduleBonusRow,
  getStaffScheduleFinancialReadSignature,
  hasRevokedFinancialReadPermission,
} from "./staffScheduleAccess.mjs";
import { canUseStaffScheduleFastActionsPeriod } from "./staffSchedulePeriodRange.mjs";
import { buildAuthorizedDaySavePayload } from "./staffScheduleModalCore.mjs";

export default function useStaffSchedulePage() {
  const api = useStaffScheduleApi();
  const { confirm, ConfirmDialog } = useJacoConfirm();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isMutationLoading, setIsMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [moduleName, setModuleName] = useState("График работы");
  const [points, setPoints] = useState([]);
  const [months, setMonths] = useState([]);
  const [pointId, setPointId] = useState("");
  const [monthId, setMonthId] = useState("");
  const [draftPointId, setDraftPointId] = useState("");
  const [draftMonthId, setDraftMonthId] = useState("");
  const [access, setAccess] = useState({});
  const accessRef = useRef(access);
  accessRef.current = access;
  const [devRoleKind, setDevRoleKind] = useState("");
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
  const monthModalSourceRowRef = useRef(null);
  const dayRequestGeneration = useRef(0);
  const dayModalSourceContextRef = useRef(null);
  const monthRequestGeneration = useRef(0);
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
  const dayModalRef = useRef(dayModal);
  dayModalRef.current = dayModal;
  const monthModal = monthModalState.state;
  const smenaModal = smenaModalState.state;
  const summaryActionModal = summaryActionState.state;
  const summaryActionRef = useRef(summaryActionModal);
  summaryActionRef.current = summaryActionModal;
  const monthModalRef = useRef(monthModal);
  monthModalRef.current = monthModal;
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

  const pickAccessMap = useCallback((payload) => {
    const nextAccess = payload?.access ?? payload?.acces;

    if (!nextAccess || typeof nextAccess !== "object" || Array.isArray(nextAccess)) {
      return null;
    }

    return Object.keys(nextAccess).length > 0 ? nextAccess : null;
  }, []);

  const loadGraph = useCallback(
    async (nextPointId, nextMonthId, { selectCurrentPeriod = false } = {}) => {
      if (!nextPointId || !nextMonthId) {
        return false;
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
        setAccess((prev) => pickAccessMap(response) ?? prev);
        if (selectCurrentPeriod) {
          setSelectedPart(Math.max(Number(response?.part || 1) - 1, 0));
        }
        return true;
      } catch (requestError) {
        setError(requestError?.message || "Не удалось загрузить график");
        return false;
      } finally {
        setIsGraphLoading(false);
      }
    },
    [api, pickAccessMap],
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
        setDraftPointId(nextPointId);
        setDraftMonthId(nextMonthId);
        setAccess(pickAccessMap(response) ?? {});

        if (nextPointId && nextMonthId) {
          await loadGraph(nextPointId, nextMonthId, { selectCurrentPeriod: true });
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
  }, [api, loadGraph, pickAccessMap]);

  useEffect(() => {
    document.title = moduleName;
  }, [moduleName]);

  const view = useMemo(
    () =>
      buildPageViewModel({
        moduleName,
        access,
        graph,
        monthId,
        selectedPart,
        selectedShiftId,
        collapsedShiftIds,
      }),
    [access, collapsedShiftIds, graph, moduleName, monthId, selectedPart, selectedShiftId],
  );
  const periodBonusState = useMemo(() => {
    const explicitStatus = Number(view.activePeriod?.meta?.bonus_other_status ?? 0);

    if (explicitStatus === 1 || explicitStatus === 2) {
      return explicitStatus;
    }

    return Number(view.activePeriod?.meta?.bonus_other) === 1 ? 1 : 0;
  }, [view.activePeriod]);
  const bonusScopeRef = useRef(null);
  bonusScopeRef.current = {
    rows: isGraphLoading ? [] : view.activePeriod?.rows,
    monthId,
    selectedPart,
  };
  const effectiveGraphKind = devRoleKind || graph.kind;
  const dayScopeRef = useRef(null);
  dayScopeRef.current = { pointId, monthId, selectedPart, roleKind: effectiveGraphKind };
  const dayAccess = useMemo(() => createStaffSchedulePolicy(access), [access]);
  const canUseFastActions =
    dayAccess.canShowFastActionsPanel &&
    canUseStaffScheduleFastActionsPeriod(monthId, selectedPart);
  const quickAccessSignature = ["fast_hours", "fast_smena", "fast_point"]
    .map((key) => Number(dayAccess.canAccess(key)))
    .join("");
  useEffect(() => {
    setSelectedRowIds([]);
  }, [quickAccessSignature, canUseFastActions]);
  const hasDedicatedDayEdit = dayAccess.canEdit("day_edit") || dayAccess.canAccess("full_day");
  const financialReadSignature = getStaffScheduleFinancialReadSignature(access);
  const previousFinancialReadSignature = useRef(financialReadSignature);
  useEffect(() => {
    if (
      hasRevokedFinancialReadPermission(
        previousFinancialReadSignature.current,
        financialReadSignature,
      )
    ) {
      dayRequestGeneration.current += 1;
      monthRequestGeneration.current += 1;
      dayModalState.close();
      monthModalSourceRowRef.current = null;
      monthModalState.close();
      if (summaryActionRef.current.mode !== "dir_lv") summaryActionState.close();
    }
    previousFinancialReadSignature.current = financialReadSignature;
  }, [
    financialReadSignature,
    dayModalState.close,
    monthModalState.close,
    summaryActionState.close,
  ]);
  useEffect(() => {
    if (!dayAccess.canOpenDayCard) {
      dayRequestGeneration.current += 1;
      dayModalSourceContextRef.current = null;
      dayModalState.close();
    }
    if (!dayAccess.canOpenMonthCard) {
      monthRequestGeneration.current += 1;
      monthModalSourceRowRef.current = null;
      monthModalState.close();
    }
    if (summaryActionModal.open && !dayAccess.canEditSummaryAction(summaryActionModal.mode)) {
      summaryActionState.close();
    }
  }, [
    dayAccess,
    dayModalState.close,
    monthModalState.close,
    summaryActionModal.mode,
    summaryActionModal.open,
    summaryActionState.close,
  ]);

  useEffect(() => {
    if (
      summaryActionModal.open &&
      summaryActionModal.mode === "my_bonus" &&
      !getEditableStaffScheduleBonusRow({
        ...bonusScopeRef.current,
        request: summaryActionModal.request,
        access,
      })
    ) {
      summaryActionState.close();
    }
  }, [
    access,
    graph,
    isGraphLoading,
    monthId,
    selectedPart,
    summaryActionModal.open,
    summaryActionModal.mode,
    summaryActionModal.request,
    summaryActionState.close,
  ]);

  useEffect(() => {
    setSelectedShiftId("all");
    setCollapsedShiftIds([]);
    setSelectedRowIds([]);
    dayRequestGeneration.current += 1;
    dayModalSourceContextRef.current = null;
    dayModalState.close();
    if (summaryActionRef.current.mode === "my_bonus") summaryActionState.close();
  }, [selectedPart, pointId, monthId, dayModalState.close, summaryActionState.close]);

  const handlePointChange = useCallback((_event, option) => {
    setDraftPointId(option?.id ?? "");
  }, []);

  const handleMonthChange = useCallback((event) => {
    setDraftMonthId(event.target.value);
  }, []);

  const handleApplyFilters = useCallback(async () => {
    const didLoad = await loadGraph(draftPointId, draftMonthId);

    if (didLoad) {
      setPointId(draftPointId);
      setMonthId(draftMonthId);
    }
  }, [draftMonthId, draftPointId, loadGraph]);

  const handleReload = useCallback(async () => {
    await loadGraph(pointId, monthId);
  }, [loadGraph, monthId, pointId]);

  const runMutation = useCallback(async (callback) => {
    setIsMutationLoading(true);
    setError("");

    try {
      return await callback();
    } finally {
      setIsMutationLoading(false);
    }
  }, []);

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

  const handleToggleRowSelection = useCallback(
    (rowId) => {
      if (
        !canUseFastActions ||
        !canUseStaffScheduleFastActionsPeriod(monthId, selectedPart) ||
        !rowId
      ) {
        return;
      }

      setSelectedRowIds((prev) =>
        prev.includes(rowId) ? prev.filter((item) => item !== rowId) : [...prev, rowId],
      );
    },
    [canUseFastActions, monthId, selectedPart],
  );

  const handleClearRowSelection = useCallback(() => {
    setSelectedRowIds([]);
  }, []);

  const handleOpenDayModal = useCallback(
    async (row, date) => {
      const currentScope = dayScopeRef.current;
      if (
        !createStaffSchedulePolicy(accessRef.current).canOpenDayCard ||
        currentScope.pointId !== pointId ||
        currentScope.monthId !== monthId ||
        currentScope.selectedPart !== selectedPart ||
        !row?.id ||
        !row?.smena_id ||
        !row?.app_id ||
        !date ||
        !row?.date
      ) {
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
      const sourceContext = { ...dayScopeRef.current, row };
      dayModalSourceContextRef.current = sourceContext;
      const isCurrentContext = () => {
        const scope = dayScopeRef.current;
        return (
          dayModalSourceContextRef.current === sourceContext &&
          scope.pointId === sourceContext.pointId &&
          scope.monthId === sourceContext.monthId &&
          scope.selectedPart === sourceContext.selectedPart
        );
      };

      dayModalState.openLoading({ request, data: null });
      const generation = ++dayRequestGeneration.current;

      try {
        const response = await api.getUserDay(request);

        if (response?.st === false || !hasDayModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить данные сотрудника");
        }

        if (
          generation !== dayRequestGeneration.current ||
          !isCurrentContext() ||
          !createStaffSchedulePolicy(accessRef.current).canOpenDayCard
        )
          return;
        dayModalState.openReady({
          request,
          data: buildDayModalViewModel(response, {
            access: accessRef.current,
            roleKind: dayScopeRef.current.roleKind,
            checkPeriod: row?.check_period,
            canEditDay: createStaffSchedulePolicy(accessRef.current).canOpenDayCard,
            hasDedicatedDayEdit,
          }),
        });
      } catch (requestError) {
        if (
          generation !== dayRequestGeneration.current ||
          !isCurrentContext() ||
          !createStaffSchedulePolicy(accessRef.current).canOpenDayCard
        )
          return;
        dayModalState.openError(requestError?.message || "Не удалось загрузить данные сотрудника", {
          request,
          data: null,
        });
      }
    },
    [api, dayModalState, hasDedicatedDayEdit, monthId, pointId, selectedPart],
  );

  const handleCloseDayModal = useCallback(() => {
    dayRequestGeneration.current += 1;
    dayModalSourceContextRef.current = null;
    dayModalState.close();
  }, [dayModalState]);

  const handleSaveDayModal = useCallback(
    async (payload) => {
      const request = dayModalRef.current.request;
      const sourceContext = dayModalSourceContextRef.current;
      const generation = dayRequestGeneration.current;
      const isCurrentContext = () => {
        const current = dayScopeRef.current;
        return (
          sourceContext &&
          dayModalRef.current.open &&
          !dayModalRef.current.loading &&
          dayModalRef.current.data &&
          dayModalRef.current.request === request &&
          dayModalSourceContextRef.current === sourceContext &&
          generation === dayRequestGeneration.current &&
          current.pointId === sourceContext.pointId &&
          current.monthId === sourceContext.monthId &&
          current.selectedPart === sourceContext.selectedPart
        );
      };
      const buildCurrentPayload = () => {
        if (!isCurrentContext())
          throw new Error("Данные дня изменились. Откройте карточку заново.");
        return buildAuthorizedDaySavePayload({
          request,
          payload,
          access: accessRef.current,
          roleKind: dayScopeRef.current.roleKind,
          checkPeriod: sourceContext.row?.check_period,
        });
      };
      buildCurrentPayload();
      await runMutation(async () => {
        const response = await api.saveUserDay(buildCurrentPayload());

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось сохранить день");
        }

        if (!isCurrentContext()) return;
        handleCloseDayModal();
        await handleReload();
      });
    },
    [api, handleCloseDayModal, handleReload, runMutation],
  );

  const handleOpenMonthModal = useCallback(
    async (row) => {
      if (
        !dayAccess.canOpenMonthCard ||
        !row?.id ||
        !row?.smena_id ||
        !row?.app_id ||
        !monthId ||
        !row?.date
      ) {
        return;
      }

      const request = {
        user_id: row.id,
        smena_id: row.smena_id,
        app_id: row.app_id,
        date: monthId,
        date_start: row.date,
      };

      monthModalSourceRowRef.current = row;
      const generation = ++monthRequestGeneration.current;

      monthModalState.openLoading({ request, data: null });

      try {
        const response = await api.getUserMonth(request);

        if (response?.st === false || !hasMonthModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить месячные часы");
        }

        const data = buildMonthModalViewModel(response, {
          access: accessRef.current,
          monthId,
          rowData: row,
          periodDays: view.activePeriod?.meta?.days,
        });

        if (
          generation !== monthRequestGeneration.current ||
          !createStaffSchedulePolicy(accessRef.current).canOpenMonthCard
        )
          return;
        monthModalState.openReady({
          request: {
            ...request,
            canEditMonth: data.canEditMonth,
          },
          data,
        });
      } catch (requestError) {
        if (
          generation !== monthRequestGeneration.current ||
          !createStaffSchedulePolicy(accessRef.current).canOpenMonthCard
        )
          return;
        monthModalState.openError(requestError?.message || "Не удалось загрузить месячные часы", {
          request,
          data: null,
        });
      }
    },
    [api, dayAccess.canOpenMonthCard, monthId, monthModalState, view.activePeriod?.meta?.days],
  );

  const handleCloseMonthModal = useCallback(() => {
    monthRequestGeneration.current += 1;
    monthModalSourceRowRef.current = null;
    monthModalState.close();
  }, [monthModalState]);

  const handleNavigateMonthModal = useCallback(
    async (targetMonth) => {
      const previous = monthModalState.state;
      if (
        !dayAccess.canOpenMonthCard ||
        !previous.open ||
        previous.loading ||
        !previous.request ||
        !/^\d{4}-\d{2}$/.test(targetMonth)
      ) {
        return;
      }

      const request = {
        user_id: previous.request.user_id,
        smena_id: previous.request.smena_id,
        app_id: previous.request.app_id,
        date: targetMonth,
        date_start: getPartStartDate(targetMonth, selectedPart),
      };
      const generation = ++monthRequestGeneration.current;
      const isGraphMonth = targetMonth === monthId;
      const sourceRow = monthModalSourceRowRef.current;
      const rowData = isGraphMonth
        ? sourceRow
        : { user_name: previous.data?.personName, app_name: previous.data?.positionName };

      monthModalState.openLoading({ request, data: previous.data });

      try {
        const response = await api.getUserMonth(request);
        if (response?.st === false || !hasMonthModalPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить месячные часы");
        }

        const data = buildMonthModalViewModel(response, {
          access: accessRef.current,
          monthId: targetMonth,
          rowData,
          periodDays: isGraphMonth ? view.activePeriod?.meta?.days : [],
          hasPeriodSummary: isGraphMonth,
        });

        if (
          generation !== monthRequestGeneration.current ||
          !createStaffSchedulePolicy(accessRef.current).canOpenMonthCard
        )
          return;
        monthModalState.openReady({
          request: { ...request, canEditMonth: data.canEditMonth },
          data,
        });
      } catch (requestError) {
        if (
          generation !== monthRequestGeneration.current ||
          !createStaffSchedulePolicy(accessRef.current).canOpenMonthCard
        )
          return;
        monthModalState.openError(requestError?.message || "Не удалось загрузить месячные часы", {
          request: previous.request,
          data: previous.data,
        });
      }
    },
    [
      api,
      dayAccess.canOpenMonthCard,
      monthId,
      monthModalState,
      selectedPart,
      view.activePeriod?.meta?.days,
    ],
  );

  const handleSaveMonthModal = useCallback(
    async (payload) => {
      await runMutation(async () => {
        if (
          !createStaffSchedulePolicy(accessRef.current).canOpenMonthCard ||
          !monthModalRef.current.open
        ) {
          throw new Error("Нет доступа к сохранению месяца");
        }
        const response = await api.saveUserMonth(payload);

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось сохранить месяц");
        }

        handleCloseMonthModal();
        await handleReload();
      });
    },
    [api, handleCloseMonthModal, handleReload, runMutation],
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
      if (!createStaffSchedulePolicy(accessRef.current).canEditSummaryAction(key)) return;
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
            ...buildSummaryActionHeaderData(row, key, monthId),
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
            ...buildSummaryActionHeaderData(row, key, periodStartDate),
            label: "Выданная сумма",
            value: Object.prototype.hasOwnProperty.call(row, "given_cash")
              ? (row.given_cash ?? "")
              : (row?.given ?? ""),
            fullAmount: getAvailablePayoutAmount(row, accessRef.current, "given"),
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
            ...buildSummaryActionHeaderData(row, key, periodStartDate),
            label: "Выданная сумма",
            value: row?.given_cart ?? "",
            fullAmount: getAvailablePayoutAmount(row, accessRef.current, "given_cart"),
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
            ...buildSummaryActionHeaderData(row, key, periodStartDate),
            label: "Удержанная сумма",
            value: row?.withheld ?? "",
          },
        });
        return;
      }

      if (key === "my_bonus") {
        const request = {
          date: monthId,
          user_id: row.id,
          app_id: row.app_id,
          smena_id: row.smena_id,
        };
        const currentRow = getEditableStaffScheduleBonusRow({
          ...bonusScopeRef.current,
          request,
          access: accessRef.current,
        });
        if (!currentRow) return;
        summaryActionState.openReady({
          mode: key,
          request,
          data: {
            ...buildSummaryActionHeaderData(currentRow, key, monthId),
            label: "Сумма",
            value: currentRow?.dir_bonus ?? "",
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
        confirmTone: "success",
        cancelTone: "danger",
      });

      if (!accepted) {
        return;
      }

      await runMutation(async () => {
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
      }).catch((requestError) => {
        errorAppealState.patch({
          error: requestError?.message || "Не удалось отправить обжалование",
        });
      });
    },
    [
      api,
      confirm,
      errorAppealModal.data,
      errorAppealState,
      handleCloseErrorAppeal,
      handleReload,
      runMutation,
    ],
  );

  const handleSaveSummaryAction = useCallback(
    async ({ mode, request, value }) => {
      await runMutation(async () => {
        if (
          !createStaffSchedulePolicy(accessRef.current).canEditSummaryAction(mode) ||
          !summaryActionRef.current.open ||
          summaryActionRef.current.mode !== mode ||
          summaryActionRef.current.request !== request
        ) {
          throw new Error("Нет доступа к изменению значения");
        }
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
          if (
            !getEditableStaffScheduleBonusRow({
              ...bonusScopeRef.current,
              request,
              access: accessRef.current,
            })
          ) {
            throw new Error("Нет доступа к изменению бонуса сотрудника");
          }
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
      });
    },
    [api, handleCloseSummaryAction, handleReload, runMutation],
  );

  const handleChangeTeamBonusForUser = useCallback(
    async (row) => {
      if (!createStaffSchedulePolicy(accessRef.current).canEditSummaryAction("dop_bonus_user"))
        return;
      const isGranted = Number(row?.dop_bonus ?? 0) > 0;
      const nextType = isGranted ? 2 : 1;
      const actionLabel = isGranted ? "Лишить" : "Выдать";
      const employeeName = row?.user_name;
      const accepted = await confirm({
        title: isGranted ? "Предупреждение" : "Подтверждение",
        tone: isGranted ? "danger" : "success",
        confirmTone: isGranted ? "danger" : "success",
        cancelLabel: "Отмена",
        cancelTone: "danger",
        message: isGranted
          ? `Лишить командного бонуса ${employeeName || "этого сотрудника"}?`
          : employeeName
            ? `Выдать командный бонус сотруднику ${employeeName}?`
            : "Выдать командный бонус этому сотруднику?",
        confirmLabel: actionLabel,
      });

      if (!accepted) {
        return;
      }

      try {
        await runMutation(async () => {
          if (
            !createStaffSchedulePolicy(accessRef.current).canEditSummaryAction("dop_bonus_user")
          ) {
            throw new Error("Нет доступа к командному бонусу");
          }
          const response = await api.saveDopBonusUser({
            point_id: pointId,
            user_id: row?.id,
            smena_id: row?.smena_id,
            app_id: row?.app_id,
            part: selectedPart,
            data: monthId,
            type: nextType,
          });

          if (response?.st === false) {
            throw new Error(response?.text || "Не удалось изменить командный бонус");
          }

          await handleReload();
        });
      } catch (requestError) {
        setError(requestError?.message || "Не удалось изменить командный бонус");
      }
    },
    [api, confirm, handleReload, monthId, pointId, runMutation, selectedPart],
  );

  const handleSaveSmenaModal = useCallback(
    async ({ id, name, users }) => {
      await runMutation(async () => {
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
      });
    },
    [api, handleCloseSmenaModal, handleReload, pointId, runMutation, smenaModal.mode],
  );

  const handleRequestDeleteSmena = useCallback(async () => {
    const accepted = await confirm({
      title: "Предупреждение",
      message: "Смена будет удалена, если в ней нет сотрудников.",
      confirmLabel: "Удалить",
      confirmTone: "danger",
      cancelTone: "danger",
    });

    if (!accepted) {
      return;
    }

    try {
      await runMutation(async () => {
        const response = await api.deleteSmena({
          id: smenaModal.request?.id,
          users: smenaModal.data?.users ?? [],
        });

        if (response?.st === false) {
          throw new Error(response?.text || "Не удалось удалить смену");
        }

        handleCloseSmenaModal();
        await handleReload();
      });
    } catch (requestError) {
      setError(requestError?.message || "Не удалось выполнить действие");
    }
  }, [
    api,
    confirm,
    handleCloseSmenaModal,
    handleReload,
    runMutation,
    smenaModal.data?.users,
    smenaModal.request?.id,
  ]);

  const pointLabel = useMemo(
    () => points.find((item) => String(item.id) === String(pointId))?.name || "—",
    [pointId, points],
  );

  const fastActions = useStaffScheduleFastActions({
    api,
    access,
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
  const isLoading =
    isBootstrapping ||
    isGraphLoading ||
    isMutationLoading ||
    dayModal.loading ||
    monthModal.loading ||
    smenaModal.loading ||
    summaryActionModal.loading ||
    errorAppealModal.loading ||
    fastActions.state.saving ||
    exportActions.dialog.loading;

  return {
    isLoading,
    isBootstrapping,
    isGraphLoading,
    isMutationLoading,
    error,
    points,
    months,
    pointId,
    monthId,
    draftPointId,
    draftMonthId,
    access,
    devRoleKind,
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
    effectiveGraphKind,
    directorLevel: graph.add_lv,
    periodBonusState,
    exportDialog: exportActions.dialog,
    canExportWorkSchedule: exportActions.canExportWorkSchedule,
    canExportHealthJournal: exportActions.canExportHealthJournal,
    canManageSmena: dayAccess.canManageSmena,
    ConfirmDialog,
    setAccess,
    setDevRoleKind,
    setSelectedPart,
    handlePointChange,
    handleMonthChange,
    handleApplyFilters,
    handleReload,
    handleShiftChange,
    handleCalendarVisibilityChange,
    handleColorModeChange,
    handleToggleShiftCollapse,
    handleToggleRowSelection,
    handleClearRowSelection,
    handleOpenDayModal,
    handleCloseDayModal,
    handleSaveDayModal,
    handleOpenMonthModal,
    handleNavigateMonthModal,
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
    handleChangeTeamBonusForUser,
    handleOpenFastActions: fastActions.open,
    handleCloseFastActions: fastActions.close,
    handleOpenBulkFastActions: fastActions.openBulk,
    handleOpenSelectedFastActions: fastActions.openSelected,
    handleFastActionsUsersChange: fastActions.updateUsers,
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
