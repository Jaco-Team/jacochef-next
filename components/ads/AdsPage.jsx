"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Backdrop, Box, CircularProgress, Grid, Paper, Tab, Tabs, Typography } from "@mui/material";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";

import { useAdsStore } from "./useAdsStore";
import SettingsTab from "./tabs/SettingsTab";
import YandexDirectTab from "./tabs/YandexDirectTab";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export default function AdsPage() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const access = useAdsStore((s) => s.access);
  const loading = useAdsStore((s) => s.loading);
  const tab = useAdsStore((s) => s.tab);
  const moduleName = useAdsStore((s) => s.moduleName);
  const module = useAdsStore((s) => s.module);
  const refreshToken = useAdsStore((s) => s.refreshToken);

  const setAll = useAdsStore((s) => s.setAll);
  const setTab = useAdsStore((s) => s.setTab);
  const setLoading = useAdsStore((s) => s.setLoading);

  const { api_laravel } = useApi(module);
  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api_laravel("get_all");
      if (!res?.st) throw new Error(res?.message || "Ошибка получения списка рекламных кабинетов");
      setAll({
        moduleName: res?.module_info?.name,
        connections: res?.connections,
        access: res?.access,
      });
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (key) => {
    const { userCan } = handleUserAccess(access);
    console.log("Checking access for", key, "with access list", access);
    return userCan("access", key);
  };

  useEffect(() => {
    loadAll();
  }, [refreshToken]);

  const tabs = useMemo(
    () => [
      {
        label: "Яндекс.Директ",
        // node: canAccess("yandex_direct") ? (
        node: (
          <YandexDirectTab
            api_laravel={api_laravel}
            showAlert={showAlert}
          />
        ),
      },
      {
        label: "Настройки",
        // node: canAccess("settings") ? (
        node: (
          <SettingsTab
            api_laravel={api_laravel}
            showAlert={showAlert}
            canAccess={canAccess}
          />
        ),
      },
    ],
    [],
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
        spacing={3}
        className="container_first_child"
      >
        <Grid
          size={12}
          sx={{ mb: 2 }}
        >
          <h1>{moduleName}</h1>
        </Grid>

        <Grid
          size={12}
          mt={2}
        >
          <Paper>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              aria-label="ads tabs"
              sx={{ mb: 3 }}
            >
              {tabs.map((t, idx) => (
                <Tab
                  key={t.label}
                  label={t.label}
                  {...a11yProps(idx)}
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>
        <Grid size={12}>
          {tabs.map((t, idx) => (
            <TabPanel
              key={t.label}
              value={tab}
              index={idx}
            >
              {t.node}
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
