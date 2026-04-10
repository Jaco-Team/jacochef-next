"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Backdrop, CircularProgress, Grid, Paper, Tab, Tabs, Typography } from "@mui/material";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import useCafePerformanceStore from "./useCafePerformanceStore";
import PageFilters from "./components/PageFilters";
import WarningList from "./components/WarningList";
import DashboardTab from "./tabs/DashboardTab";
import KitchenTab from "./tabs/KitchenTab";
import LeadersTab from "./tabs/LeadersTab";
import QualityTab from "./tabs/QualityTab";
import DeliveryTab from "./tabs/DeliveryTab";

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

export default function CafePerformance() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const module = useCafePerformanceStore((s) => s.module);
  const moduleName = useCafePerformanceStore((s) => s.moduleName);
  const loading = useCafePerformanceStore((s) => s.loading);
  const bootstrapped = useCafePerformanceStore((s) => s.bootstrapped);
  const tab = useCafePerformanceStore((s) => s.tab);
  const points = useCafePerformanceStore((s) => s.points);
  const stageTypes = useCafePerformanceStore((s) => s.stageTypes);
  const categories = useCafePerformanceStore((s) => s.categories);
  const defaults = useCafePerformanceStore((s) => s.defaults);
  const filters = useCafePerformanceStore((s) => s.filters);
  const loadedTabs = useCafePerformanceStore((s) => s.loadedTabs);
  const metaByScreen = useCafePerformanceStore((s) => s.metaByScreen);
  const dashboardData = useCafePerformanceStore((s) => s.dashboardData);
  const kitchenData = useCafePerformanceStore((s) => s.kitchenData);
  const leadersData = useCafePerformanceStore((s) => s.leadersData);
  const qualityData = useCafePerformanceStore((s) => s.qualityData);
  const deliveryData = useCafePerformanceStore((s) => s.deliveryData);

  const {
    setLoading,
    setBootstrap,
    setFilters,
    setTab,
    setScreenData,
    markTabLoaded,
    resetLoadedTabs,
  } = useCafePerformanceStore((s) => ({
    setLoading: s.setLoading,
    setBootstrap: s.setBootstrap,
    setFilters: s.setFilters,
    setTab: s.setTab,
    setScreenData: s.setScreenData,
    markTabLoaded: s.markTabLoaded,
    resetLoadedTabs: s.resetLoadedTabs,
  }));

  const { api_laravel } = useApi(module);
  const CAFE_PERFORMANCE_TABS = [
    { id: 0, key: "dashboard", label: "Дашборд", method: "get_dashboard" },
    { id: 1, key: "kitchen", label: "Кухня", method: "get_kitchen" },
    { id: 2, key: "leaders", label: "Лидеры", method: "get_leaders" },
    { id: 3, key: "quality", label: "Качество", method: "get_quality" },
    { id: 4, key: "delivery", label: "Доставка", method: "get_delivery" },
  ];

  const currentTab = CAFE_PERFORMANCE_TABS[tab] || CAFE_PERFORMANCE_TABS[0];

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
  const currentMeta = metaByScreen[currentTab.key] || null;
  const periodPresets = defaults?.period_presets || [];
  const activePeriodLabel =
    currentMeta?.period?.type === filters.period_type
      ? currentMeta?.period?.label
      : filters.period_label;
  const currentStageName = useMemo(
    () => stageTypes.find((item) => item.id === filters.stage_type)?.name || "",
    [filters.stage_type, stageTypes],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api_laravel("get_all");
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки модуля");

        const defaults = res.defaults || {};
        const periodPresets = res.period_presets || [];
        const normalizedFilters = {
          ...buildPeriodFilterState(defaults, periodPresets),
          point_list: defaults.point_list || [],
          category_ids: [],
          stage_type: defaults.stage_type || res.stage_types?.[0]?.id || "",
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
            ...defaults,
            period_presets: periodPresets,
          },
          filters: normalizedFilters,
        });

        setScreenData(firstTab.key, firstTabResponse);
        markTabLoaded(firstTab.key);
        document.title = res?.module_info?.name || "Эффективность кафе";
      } catch (error) {
        if (!cancelled) showAlert(error?.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped || loadedTabs[currentTab.key]) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api_laravel(
          currentTab.method,
          buildRequestPayload(filters, currentTab.key),
        );
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки данных");
        if (cancelled) return;
        setScreenData(currentTab.key, res);
        markTabLoaded(currentTab.key);
      } catch (error) {
        if (!cancelled) showAlert(error?.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [bootstrapped, currentTab.key, loadedTabs]);

  const handleFilterChange = (key, value) => {
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
  };

  const loadTabs = useCallback(
    async (tabConfigs) => {
      for (const tabConfig of tabConfigs) {
        const res = await api_laravel(
          tabConfig.method,
          buildRequestPayload(filters, tabConfig.key),
        );
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки данных");
        setScreenData(tabConfig.key, res);
        markTabLoaded(tabConfig.key);
      }
    },
    [api_laravel, filters, markTabLoaded, setScreenData],
  );

  const handleApply = async () => {
    if (!filters.point_list?.length) {
      showAlert("Выберите хотя бы одно кафе");
      return;
    }

    if (!filters.period_type || !filters.date_start || !filters.date_end) {
      showAlert("Укажите период");
      return;
    }

    setLoading(true);
    try {
      const visitedTabs = CAFE_PERFORMANCE_TABS.filter((item) => loadedTabs[item.key]);
      const tabsToLoad = visitedTabs.length ? visitedTabs : [currentTab];

      resetLoadedTabs();
      await loadTabs(tabsToLoad);
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const handleKitchenApply = async () => {
    setLoading(true);
    try {
      resetLoadedTabs();
      await loadTabs([CAFE_PERFORMANCE_TABS[1]]);
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const tabs = useMemo(
    () => [
      {
        ...CAFE_PERFORMANCE_TABS[0],
        node: (
          <DashboardTab
            data={dashboardData}
            formatters={formatters}
          />
        ),
      },
      {
        ...CAFE_PERFORMANCE_TABS[1],
        node: (
          <KitchenTab
            data={kitchenData}
            formatters={formatters}
            stageName={currentStageName}
            filters={filters}
            categories={categories}
            stageTypes={stageTypes}
            onFilterChange={handleFilterChange}
            onApply={handleKitchenApply}
          />
        ),
      },
      {
        ...CAFE_PERFORMANCE_TABS[2],
        node: (
          <LeadersTab
            data={leadersData}
            formatters={formatters}
          />
        ),
      },
      {
        ...CAFE_PERFORMANCE_TABS[3],
        node: (
          <QualityTab
            data={qualityData}
            formatters={formatters}
          />
        ),
      },
      {
        ...CAFE_PERFORMANCE_TABS[4],
        node: (
          <DeliveryTab
            data={deliveryData}
            formatters={formatters}
          />
        ),
      },
    ],
    [
      currentStageName,
      dashboardData,
      deliveryData,
      formatters,
      kitchenData,
      leadersData,
      qualityData,
    ],
  );

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <Typography variant="h5">{moduleName || "Эффективность кафе"}</Typography>
        </Grid>

        <Grid size={12}>
          <PageFilters
            filters={filters}
            periodPresets={periodPresets}
            periodLabel={activePeriodLabel}
            points={points}
            generatedAt={currentMeta?.generated_at}
            onFilterChange={handleFilterChange}
            onApply={handleApply}
          />
        </Grid>

        <Grid size={12}>
          <Paper sx={{ borderRadius: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons={false}
            >
              {tabs.map((item) => (
                <Tab
                  key={item.key}
                  label={item.label}
                  {...a11yProps(item.id)}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        <Grid size={12}>
          {tabs.map((item) => (
            <TabPanel
              key={item.key}
              value={tab}
              index={item.id}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid size={12}>{item.node}</Grid>
                <Grid size={12}>
                  <WarningList warnings={metaByScreen[item.key]?.warnings || []} />
                </Grid>
              </Grid>
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
