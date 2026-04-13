"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import useCafePerformanceStore from "./useCafePerformanceStore";
import { buildOrderTypeNameMap, getStageTypeLabel } from "./config";

export const CAFE_PERFORMANCE_TABS = [
  { id: 0, key: "dashboard", label: "Дашборд", method: "get_dashboard" },
  { id: 1, key: "kitchen", label: "Кухня", method: "get_kitchen" },
  { id: 2, key: "leaders", label: "Лидеры", method: "get_leaders" },
  { id: 3, key: "quality", label: "Качество", method: "get_quality" },
  { id: 4, key: "delivery", label: "Доставка", method: "get_delivery" },
];

const buildRequestPayload = (activeFilters, tabKey) => {
  const payload = {
    period_type: activeFilters.period_type || "day",
    date_start: activeFilters.date_start || null,
    date_end: activeFilters.date_end || null,
    point_list: (activeFilters.point_list || []).map((item) => ({ id: item.id })),
  };

  if (tabKey === "kitchen") {
    payload.category_ids = activeFilters.category_ids || [];
    payload.stage_type = activeFilters.stage_type || "";
  }

  return payload;
};

const buildQueryKey = (tabKey, activeFilters) =>
  JSON.stringify({
    tabKey,
    payload: buildRequestPayload(activeFilters, tabKey),
  });

const getPresetByType = (presets = [], periodType) =>
  presets.find((item) => item.period_type === periodType) || null;

const buildPeriodFilterState = (defaults = {}, presets = []) => {
  const activePreset = getPresetByType(presets, defaults.period_type) ||
    presets[0] || {
      period_type: defaults.period_type || "day",
      date_start: defaults.date_start || null,
      date_end: defaults.date_end || null,
      period_label: defaults.period_label || "",
    };

  return {
    period_type: activePreset.period_type || "day",
    date_start: activePreset.date_start || defaults.date_start || null,
    date_end: activePreset.date_end || defaults.date_end || null,
    period_label: activePreset.period_label || defaults.period_label || "",
  };
};

export default function useCafePerformanceController() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const module = useCafePerformanceStore((s) => s.module);
  const moduleName = useCafePerformanceStore((s) => s.moduleName);
  const loading = useCafePerformanceStore((s) => s.loading);
  const bootstrapped = useCafePerformanceStore((s) => s.bootstrapped);
  const tab = useCafePerformanceStore((s) => s.tab);
  const points = useCafePerformanceStore((s) => s.points);
  const stageTypes = useCafePerformanceStore((s) => s.stageTypes);
  const orderTypes = useCafePerformanceStore((s) => s.orderTypes);
  const categories = useCafePerformanceStore((s) => s.categories);
  const defaults = useCafePerformanceStore((s) => s.defaults);
  const filters = useCafePerformanceStore((s) => s.filters);
  const appliedFilters = useCafePerformanceStore((s) => s.appliedFilters);
  const screens = useCafePerformanceStore((s) => s.screens);

  const {
    setLoading,
    setBootstrap,
    setFilters,
    setAppliedFilters,
    setTab,
    setScreenResult,
    resetScreens,
  } = useCafePerformanceStore((s) => ({
    setLoading: s.setLoading,
    setBootstrap: s.setBootstrap,
    setFilters: s.setFilters,
    setAppliedFilters: s.setAppliedFilters,
    setTab: s.setTab,
    setScreenResult: s.setScreenResult,
    resetScreens: s.resetScreens,
  }));

  const { api_laravel } = useApi(module);
  const requestCacheRef = useRef(new Map());

  const currentTab = CAFE_PERFORMANCE_TABS[tab] || CAFE_PERFORMANCE_TABS[0];
  const currentScreen = screens[currentTab.key];
  const currentMeta = currentScreen?.meta || null;
  const periodPresets = defaults?.period_presets || [];
  const activePeriodLabel =
    currentMeta?.period?.type === filters.period_type
      ? currentMeta?.period?.label
      : filters.period_label;

  const formatters = useMemo(
    () => ({
      number: (value) => (value == null ? "—" : Number(value).toFixed(2).replace(/\.00$/, "")),
      integer: (value) => (value == null ? "—" : Number(value).toLocaleString("ru-RU")),
      percent: (value) =>
        value == null ? "—" : `${Number(value).toFixed(2).replace(/\.00$/, "")}%`,
      duration: (value) => {
        if (value == null) return "—";
        const totalSeconds = Math.round(Number(value));
        if (!Number.isFinite(totalSeconds)) return "—";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes <= 0) return `${seconds} сек`;
        return `${minutes} мин ${seconds} сек`;
      },
    }),
    [],
  );

  const currentStageName = useMemo(() => {
    const currentStage = stageTypes.find((item) => item.id === appliedFilters.stage_type);
    return currentStage ? getStageTypeLabel(currentStage.id) : "";
  }, [appliedFilters.stage_type, stageTypes]);

  const orderTypeNameMap = useMemo(() => buildOrderTypeNameMap(orderTypes), [orderTypes]);

  const loadScreen = useCallback(
    async (tabConfig, activeFilters) => {
      const queryKey = buildQueryKey(tabConfig.key, activeFilters);
      const currentRequest = requestCacheRef.current.get(queryKey);

      if (currentRequest) {
        return currentRequest;
      }

      const request = (async () => {
        const res = await api_laravel(
          tabConfig.method,
          buildRequestPayload(activeFilters, tabConfig.key),
        );
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки данных");
        setScreenResult(tabConfig.key, res, queryKey);
        return res;
      })();

      requestCacheRef.current.set(queryKey, request);

      try {
        return await request;
      } finally {
        if (requestCacheRef.current.get(queryKey) === request) {
          requestCacheRef.current.delete(queryKey);
        }
      }
    },
    [api_laravel, setScreenResult],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api_laravel("get_all");
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки модуля");

        const moduleDefaults = res.defaults || {};
        const nextPeriodPresets = res.period_presets || [];
        const normalizedFilters = {
          ...buildPeriodFilterState(moduleDefaults, nextPeriodPresets),
          point_list: moduleDefaults.point_list || [],
          category_ids: [],
          stage_type: moduleDefaults.stage_type || res.stage_types?.[0]?.id || "",
        };

        const firstTab = CAFE_PERFORMANCE_TABS[0];
        const firstTabResponse = await api_laravel(
          firstTab.method,
          buildRequestPayload(normalizedFilters, firstTab.key),
        );
        if (!firstTabResponse?.st) {
          throw new Error(firstTabResponse?.text || "Ошибка загрузки данных");
        }

        if (cancelled) return;

        setBootstrap({
          moduleName: res?.module_info?.name,
          access: res.access,
          points: res.points,
          stageTypes: res.stage_types,
          orderTypes: res.order_types,
          categories: res.categories,
          defaults: {
            ...moduleDefaults,
            period_presets: nextPeriodPresets,
          },
          filters: normalizedFilters,
          appliedFilters: normalizedFilters,
        });

        setScreenResult(
          firstTab.key,
          firstTabResponse,
          buildQueryKey(firstTab.key, normalizedFilters),
        );
        document.title = res?.module_info?.name || "Эффективность кафе";
      } catch (error) {
        if (!cancelled) showAlert(error?.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;

    const expectedQueryKey = buildQueryKey(currentTab.key, appliedFilters);
    if (currentScreen?.queryKey === expectedQueryKey) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        await loadScreen(currentTab, appliedFilters);
      } catch (error) {
        if (!cancelled) showAlert(error?.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, currentTab.key, currentScreen?.queryKey]);

  const handleFilterChange = useCallback(
    (key, value) => {
      if (key === "period_type") {
        const nextPreset = getPresetByType(periodPresets, value);

        setFilters({
          period_type: value,
          date_start: nextPreset?.date_start || null,
          date_end: nextPreset?.date_end || null,
          period_label: nextPreset?.period_label || "",
        });
        return;
      }

      setFilters({ [key]: value });
    },
    [periodPresets, setFilters],
  );

  const handleApply = useCallback(async () => {
    if (!filters.point_list?.length) {
      showAlert("Выберите хотя бы одно кафе");
      return;
    }

    if (!filters.period_type || !filters.date_start || !filters.date_end) {
      showAlert("Укажите период");
      return;
    }

    const nextAppliedFilters = {
      ...filters,
    };
    const filtersChanged = JSON.stringify(nextAppliedFilters) !== JSON.stringify(appliedFilters);

    setAppliedFilters(nextAppliedFilters);
    if (filtersChanged) {
      resetScreens(
        CAFE_PERFORMANCE_TABS.filter((item) => item.key !== currentTab.key).map((item) => item.key),
      );
    }

    setLoading(true);
    try {
      await loadScreen(currentTab, nextAppliedFilters);
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [
    appliedFilters,
    currentTab,
    filters,
    loadScreen,
    resetScreens,
    setAppliedFilters,
    setLoading,
    showAlert,
  ]);

  const handleKitchenStageChange = useCallback(
    async (stageType) => {
      if (!stageType || stageType === filters.stage_type) return;

      const nextFilters = {
        ...filters,
        stage_type: stageType,
      };

      setFilters({ stage_type: stageType });
      setAppliedFilters({ stage_type: stageType });

      setLoading(true);
      try {
        await loadScreen(CAFE_PERFORMANCE_TABS[1], nextFilters);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    },
    [filters, loadScreen, setAppliedFilters, setFilters, setLoading, showAlert],
  );

  return {
    alert: {
      isOpen: isAlert,
      onClose: closeAlert,
      status: alertStatus,
      text: alertMessage,
    },
    moduleName,
    loading,
    tab,
    setTab,
    tabs: CAFE_PERFORMANCE_TABS,
    filters,
    points,
    categories,
    stageTypes,
    orderTypes,
    periodPresets,
    activePeriodLabel,
    currentMeta,
    currentStageName,
    orderTypeNameMap,
    formatters,
    screens,
    handleFilterChange,
    handleApply,
    handleKitchenStageChange,
  };
}
