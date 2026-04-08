"use client";

import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Backdrop, CircularProgress, Grid, Paper, Tab, Tabs } from "@mui/material";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { CAFE_PERFORMANCE_TABS } from "./config";
import useCafePerformanceStore from "./useCafePerformanceStore";
import PageFilters from "./components/PageFilters";
import WarningList from "./components/WarningList";
import DashboardTab from "./tabs/DashboardTab";
import KitchenTab from "./tabs/KitchenTab";
import LeadersTab from "./tabs/LeadersTab";
import QualityTab from "./tabs/QualityTab";
import DeliveryTab from "./tabs/DeliveryTab";

const buildRequestPayload = (activeFilters) => ({
  date_start: activeFilters.date_start ? formatYMD(activeFilters.date_start) : formatYMD(dayjs()),
  date_end: activeFilters.date_end ? formatYMD(activeFilters.date_end) : formatYMD(dayjs()),
  point_list: (activeFilters.point_list || []).map((item) => ({ id: item.id })),
  category_ids: activeFilters.category_ids || [],
  stage_type: activeFilters.stage_type,
});

const normalizeDate = (value) => (value ? dayjs(value) : null);

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
        const normalizedFilters = {
          date_start: normalizeDate(defaults.date_start) || dayjs(),
          date_end: normalizeDate(defaults.date_end) || dayjs(),
          point_list: defaults.point_list || [],
          category_ids: [],
          stage_type: defaults.stage_type || res.stage_types?.[0]?.id || "",
        };

        const firstTab = CAFE_PERFORMANCE_TABS[0];
        const firstTabResponse = await api_laravel(
          firstTab.method,
          buildRequestPayload(normalizedFilters),
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
          defaults,
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
        const res = await api_laravel(currentTab.method, buildRequestPayload(filters));
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
    if (key === "date_start" || key === "date_end") {
      setFilters({ [key]: normalizeDate(value) });
      return;
    }
    setFilters({ [key]: value });
  };

  const handleApply = async () => {
    if (!filters.point_list?.length) {
      showAlert("Выберите хотя бы одно кафе");
      return;
    }

    if (!filters.date_start || !filters.date_end) {
      showAlert("Укажите период");
      return;
    }

    if (dayjs(filters.date_start).isAfter(dayjs(filters.date_end), "day")) {
      showAlert("Дата от не может быть позже даты до");
      return;
    }

    setLoading(true);
    try {
      const visitedTabs = CAFE_PERFORMANCE_TABS.filter((item) => loadedTabs[item.key]);
      const tabsToLoad = visitedTabs.length ? visitedTabs : [currentTab];

      resetLoadedTabs();

      for (const tabConfig of tabsToLoad) {
        const res = await api_laravel(tabConfig.method, buildRequestPayload(filters));
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки данных");
        setScreenData(tabConfig.key, res);
        markTabLoaded(tabConfig.key);
      }
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
          <PageFilters
            moduleName={moduleName}
            filters={filters}
            points={points}
            categories={categories}
            stageTypes={stageTypes}
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
