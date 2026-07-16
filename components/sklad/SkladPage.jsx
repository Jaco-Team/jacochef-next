"use client";

import { useEffect, useMemo } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";

import SkladPlaceholderTab from "./SkladPlaceholderTab";
import { getVisibleSkladTabs } from "./skladTabs";
import { useSkladStore } from "./useSkladStore";

function normalizeBootstrap(response) {
  return {
    moduleName: response?.module_info?.name || "Склад",
    access: response?.access || {},
    summary: response?.summary || {},
    sections: response?.sections || [],
    plannedSections: response?.planned_sections || [],
    units: response?.units || [],
    categories: response?.categories || [],
    allergens: response?.allergens || [],
    storages: response?.storages || [],
    apps: response?.apps || [],
    tags: response?.tags || [],
    accountingSystems: response?.accounting_systems || [],
    uiMeta: response?.ui_meta || {},
    businessMeta: response?.business_meta || {},
    capabilities: response?.capabilities || {},
  };
}

export default function SkladPage() {
  const { api_laravel } = useApi("sklad");
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const loading = useSkladStore((state) => state.loading);
  const refreshToken = useSkladStore((state) => state.refreshToken);
  const moduleName = useSkladStore((state) => state.moduleName);
  const summary = useSkladStore((state) => state.summary);
  const sections = useSkladStore((state) => state.sections);
  const access = useSkladStore((state) => state.access);
  const tab = useSkladStore((state) => state.tab);
  const setBootstrap = useSkladStore((state) => state.setBootstrap);
  const setLoading = useSkladStore((state) => state.setLoading);
  const setTab = useSkladStore((state) => state.setTab);
  const requestRefresh = useSkladStore((state) => state.requestRefresh);

  const tabs = useMemo(() => getVisibleSkladTabs({ sections, access }), [sections, access]);

  useEffect(() => {
    let isMounted = true;

    const loadBootstrap = async () => {
      setLoading(true);

      try {
        const response = await api_laravel("get_all", { archive_mode: "active" });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки модуля");
        }

        if (!isMounted) {
          return;
        }

        const nextState = normalizeBootstrap(response);
        const nextTabs = getVisibleSkladTabs({
          sections: nextState.sections,
          access: nextState.access,
        });

        setBootstrap({
          ...nextState,
          tab: nextTabs.length ? 0 : 0,
        });

        document.title = nextState.moduleName || "Склад";
      } catch (error) {
        if (isMounted) {
          showAlert(error?.message || "Ошибка загрузки модуля", false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
  }, [api_laravel, refreshToken, setBootstrap, setLoading, showAlert]);

  useEffect(() => {
    if (tabs.length === 0) {
      return;
    }

    if (tab > tabs.length - 1) {
      setTab(0);
    }
  }, [tab, tabs, setTab]);

  const summaryChips = [
    { key: "recipes_active", label: "Рецепты" },
    { key: "semi_finished_active", label: "Полуфабрикаты" },
    { key: "site_items_active", label: "Товары сайта" },
    { key: "archive_total", label: "Архив" },
  ].filter((item) => summary?.[item.key] !== undefined);

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
        className="container_first_child"
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 700 }}
              >
                {moduleName || "Склад"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Canonical shell нового модуля на `/api/sklad/*`.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => requestRefresh()}
            >
              Обновить
            </Button>
          </Stack>
        </Grid>

        {summaryChips.length ? (
          <Grid size={12}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              {summaryChips.map((item) => (
                <Chip
                  key={item.key}
                  label={`${item.label}: ${summary[item.key]}`}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Grid>
        ) : null}

        <Grid size={12}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Tabs
              value={tabs.length ? tab : 0}
              onChange={(_, value) => setTab(value)}
              aria-label="sklad tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((item, index) => (
                <Tab
                  key={item.key}
                  label={item.label}
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        <Grid size={12}>
          {tabs.length ? (
            tabs.map((item, index) => (
              <TabPanel
                key={item.key}
                value={tab}
                index={index}
              >
                <SkladPlaceholderTab
                  title={item.label}
                  description={item.description}
                  summaryValue={item.summaryKey ? (summary?.[item.summaryKey] ?? 0) : null}
                />
              </TabPanel>
            ))
          ) : (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Нет доступных разделов</Typography>
              <Typography color="text.secondary">
                Проверь права доступа и published sections в `sklad/get_all`.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </>
  );
}
