"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Box, Container, Typography } from "@mui/material";

import {
  JacoAlert,
  JacoBackdropLoader,
  JacoCompactTabs,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import useMyAlert from "@/src/hooks/useMyAlert";

import OverviewTab from "./OverviewTab";
import SettingsTab from "./SettingsTab";
import SlotsTab from "./SlotsTab";
import { KITCHEN_QUEUE_TABS, getErrorText } from "./kitchenQueueUtils";
import useKitchenQueueApi from "./useKitchenQueueApi";

const EMPTY_RIGHTS = {
  settings_view: false,
  settings_edit: false,
  settings_all_edit: false,
  slots_view: false,
  slots_edit: false,
};

export default function KitchenQueueSettingsPage() {
  const api = useKitchenQueueApi();
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const { confirm, ConfirmDialog } = useJacoConfirm();

  const [bootstrap, setBootstrap] = useState({
    moduleName: "Настройки распределения заказов",
    rights: EMPTY_RIGHTS,
    points: [],
    days: [],
    maxCount: 99,
  });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;
  const notify = useCallback((message, isSuccess) => showAlertRef.current(message, isSuccess), []);

  useEffect(() => {
    let active = true;

    api
      .getAll()
      .then((data) => {
        if (!active) return;
        setBootstrap(data);
        setLoaded(true);
      })
      .catch((error) => {
        if (active) notify(getErrorText(error, "Не удалось загрузить модуль"), false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [api, notify]);

  const { rights, points } = bootstrap;

  const tabs = useMemo(() => {
    const items = [];
    if (rights.settings_view) {
      items.push({ id: KITCHEN_QUEUE_TABS.settings, label: "Параметры" });
      items.push({ id: KITCHEN_QUEUE_TABS.overview, label: "Сводка по кафе" });
    }
    if (rights.slots_view) {
      items.push({ id: KITCHEN_QUEUE_TABS.slots, label: "Лимиты слотов" });
    }

    return items;
  }, [rights.settings_view, rights.slots_view]);

  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : (tabs[0]?.id ?? "");

  return (
    <>
      <JacoBackdropLoader open={loading} />

      <JacoAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <ConfirmDialog />

      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 2, md: 3 },
          py: { xs: 1.5, md: 3 },
        }}
      >
        <Box
          className="container_first_child"
          style={{ paddingInline: 0 }}
        >
          <Typography
            variant="h4"
            sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.75rem", md: "2.125rem" } }}
          >
            {bootstrap.moduleName}
          </Typography>

          {loaded && tabs.length === 0 ? (
            <JacoAlert severity="info">
              У вашей должности нет прав на разделы этого модуля. Их включают в настройках
              должности.
            </JacoAlert>
          ) : null}

          {loaded && tabs.length > 0 ? (
            <>
              <JacoCompactTabs
                items={tabs}
                value={currentTab}
                onChange={(_, nextTab) => setActiveTab(nextTab)}
                sx={{ mb: 3, maxWidth: 560 }}
              />

              {currentTab === KITCHEN_QUEUE_TABS.settings ? (
                <SettingsTab
                  api={api}
                  points={points}
                  rights={rights}
                  confirm={confirm}
                  showAlert={notify}
                />
              ) : null}

              {currentTab === KITCHEN_QUEUE_TABS.overview ? (
                <OverviewTab
                  api={api}
                  showAlert={notify}
                />
              ) : null}

              {currentTab === KITCHEN_QUEUE_TABS.slots ? (
                <SlotsTab
                  api={api}
                  points={points}
                  days={bootstrap.days}
                  maxCount={bootstrap.maxCount}
                  rights={rights}
                  confirm={confirm}
                  showAlert={notify}
                />
              ) : null}
            </>
          ) : null}
        </Box>
      </Container>
    </>
  );
}
