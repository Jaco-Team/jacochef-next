"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Grid, Stack, Typography } from "@mui/material";

import useMyAlert from "@/src/hooks/useMyAlert";
import {
  JacoAlert,
  JacoBackdropLoader,
  JacoButton,
  JacoCompactTabs,
  JacoSurface,
  JacoTabPanel,
  uiColors,
  uiShadows,
} from "@/design-system/shared/ui";

import useSkladApi from "./useSkladApi";
import { getVisibleSkladTabs } from "./skladTabs";
import { useSkladStore } from "./useSkladStore";

const SkladUnitsTab = dynamic(() => import("./units/SkladUnitsTab"), { ssr: false });
const SkladProductionTab = dynamic(() => import("./production/SkladProductionTab"), { ssr: false });
const SkladWarehouseItemsTab = dynamic(() => import("./warehouse-items/SkladWarehouseItemsTab"), {
  ssr: false,
});
const SkladSiteItemsTab = dynamic(() => import("./site-items/SkladSiteItemsTab"), { ssr: false });

function sectionUrl(query, key) {
  const { section, tab, ...otherQuery } = query;
  return {
    pathname: "/sklad_items/[[...section]]",
    query: { ...otherQuery, section: [key] },
  };
}

function normalizeBootstrap(response) {
  return {
    moduleName: response?.module_info?.name || "Склад",
    access: response?.access || {},
    summary: response?.summary || {},
    units: response?.units || [],
    categories: response?.categories || [],
    allergens: response?.allergens || [],
    storages: response?.storages || [],
    apps: response?.apps || [],
    tags: response?.tags || [],
    accountingSystems: response?.accounting_systems || [],
  };
}

export default function SkladPage() {
  const router = useRouter();
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const api = useSkladApi();
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const isLoading = useSkladStore((state) => state.isLoading);
  const refreshToken = useSkladStore((state) => state.refreshToken);
  const moduleName = useSkladStore((state) => state.moduleName);
  const access = useSkladStore((state) => state.access);
  const setBootstrap = useSkladStore((state) => state.setBootstrap);
  const setState = useSkladStore((state) => state.setState);
  const requestRefresh = useSkladStore((state) => state.requestRefresh);

  const tabs = useMemo(() => getVisibleSkladTabs({ access }), [access]);
  const section = router.query.section;
  const requestedKey = Array.isArray(section)
    ? section.length === 1
      ? section[0]
      : null
    : section === undefined && typeof router.query.tab === "string"
      ? router.query.tab
      : null;
  const tab = Math.max(
    0,
    tabs.findIndex((item) => item.key === requestedKey),
  );

  useEffect(() => {
    let isMounted = true;

    const loadBootstrap = async () => {
      setState({ isLoading: true });

      try {
        const response = await api.getBootstrap({ archive_mode: "active" });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки модуля");
        }

        if (!isMounted) {
          return;
        }

        const nextState = normalizeBootstrap(response);

        setBootstrap(nextState);
        setBootstrapReady(true);

        document.title = nextState.moduleName || "Склад";
      } catch (error) {
        if (isMounted) {
          showAlert(error?.message || "Ошибка загрузки модуля", false);
        }
      } finally {
        if (isMounted) {
          setState({ isLoading: false });
        }
      }
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
  }, [api, refreshToken, setBootstrap, setState]);

  useEffect(() => {
    if (!bootstrapReady || !router.isReady || tabs.length === 0) {
      return;
    }

    const activeKey = tabs[tab].key;
    if (
      !Array.isArray(section) ||
      section.length !== 1 ||
      section[0] !== activeKey ||
      router.query.tab !== undefined
    ) {
      router
        .replace(sectionUrl(router.query, activeKey), undefined, { shallow: true, scroll: false })
        .catch((error) => {
          if (!error?.cancelled) showAlert("Не удалось открыть раздел", false);
        });
    }
  }, [bootstrapReady, router, tab, tabs]);

  const changeTab = async (_, value) => {
    const nextTab = tabs[value];
    if (!nextTab || nextTab.key === requestedKey) return;

    try {
      await router.push(sectionUrl(router.query, nextTab.key), undefined, {
        shallow: true,
        scroll: false,
      });
    } catch (error) {
      if (!error?.cancelled) showAlert("Не удалось открыть раздел", false);
    }
  };

  const renderTabContent = (item) => {
    if (item.key === "units") {
      return (
        <SkladUnitsTab
          showAlert={showAlert}
          refreshToken={refreshToken}
        />
      );
    }

    if (item.key === "production") {
      return (
        <SkladProductionTab
          showAlert={showAlert}
          refreshToken={refreshToken}
        />
      );
    }

    if (item.key === "site-items") {
      return (
        <SkladSiteItemsTab
          showAlert={showAlert}
          refreshToken={refreshToken}
        />
      );
    }

    if (item.key === "warehouse-items") {
      return (
        <SkladWarehouseItemsTab
          showAlert={showAlert}
          refreshToken={refreshToken}
        />
      );
    }

    return null;
  };

  return (
    <>
      <JacoBackdropLoader
        open={isLoading}
        sx={{ "& .MuiCircularProgress-root": { color: "common.white" } }}
      />
      <JacoAlert
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
          <Grid
            container
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Grid size={{ xs: 12, md: "grow" }}>
              <Box>
                <h1>{moduleName || "Склад"}</h1>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: "auto" }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <JacoButton
                  startIcon={<RefreshIcon />}
                  onClick={() => requestRefresh()}
                >
                  Обновить
                </JacoButton>
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <JacoSurface
            sx={{
              p: 0,
              overflow: "hidden",
              backgroundColor: uiColors.surface,
              borderColor: uiColors.border,
              boxShadow: uiShadows.surface,
            }}
          >
            <JacoCompactTabs
              value={tabs.length ? tab : 0}
              onChange={changeTab}
              items={tabs.map((item, index) => ({
                id: item.key,
                value: index,
                label: item.label,
              }))}
              aria-label="sklad_items tabs"
              variant="scrollable"
              scrollButtons={false}
              allowScrollButtonsMobile
              tabSx={{ textTransform: "uppercase" }}
            />
          </JacoSurface>
        </Grid>

        <Grid size={12}>
          <Grid
            container
            spacing={2}
          >
            <Grid size={12}>
              {!bootstrapReady || !router.isReady ? null : tabs.length ? (
                tabs.map((item, index) => (
                  <JacoTabPanel
                    key={item.key}
                    value={tab}
                    index={index}
                  >
                    {renderTabContent(item)}
                  </JacoTabPanel>
                ))
              ) : (
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Нет доступных разделов</Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Проверь права доступа в `sklad_items/get_all`.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
