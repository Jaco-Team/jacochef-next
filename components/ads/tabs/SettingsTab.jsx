"use client";

import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";

import { useConfirm } from "@/src/hooks/useConfirm";

import AdsAddConnectionModal from "../AdsAddConnectionModal";
import AdsOauthCodeModal from "../AdsOauthCodeModal";
import AdsSyncModal from "../AdsSyncModal";
import { useAdsStore } from "../useAdsStore";
import { refresh } from "next/cache";

export default function SettingsTab({ api_laravel, showAlert, canAccess }) {
  const { ConfirmDialog, withConfirm } = useConfirm();

  const moduleName = useAdsStore((s) => s.moduleName);
  const connections = useAdsStore((s) => s.connections);
  const access = useAdsStore((s) => s.access);

  const isAddOpen = useAdsStore((s) => s.isAddOpen);
  const oauthModal = useAdsStore((s) => s.oauthModal);
  const syncModal = useAdsStore((s) => s.syncModal);

  const setLoading = useAdsStore((s) => s.setLoading);
  const setAddOpen = useAdsStore((s) => s.setAddOpen);
  const setOauthModal = useAdsStore((s) => s.setOauthModal);
  const setSyncModal = useAdsStore((s) => s.setSyncModal);
  const refreshAll = useAdsStore((s) => s.refreshAll);

  const statusColorMap = useAdsStore((s) => s.statusColorMap);
  const isOauthRequired = useAdsStore((s) => s.isOauthRequired);

  const openSync = (conn) => setSyncModal({ open: true, connection: conn });
  const closeSync = () => setSyncModal({ open: false, connection: null });

  const toggleStatus = async (conn) => {
    setLoading(true);
    try {
      const nextStatus = conn.status === "disabled" ? "active" : "disabled";
      const res = await api_laravel("update", { id: conn.id, status: nextStatus });
      if (!res?.st) throw new Error(res?.text || "Ошибка изменения статуса");
      refreshAll();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const deleteConnection = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("delete", { id: conn.id });
      if (!res?.st) throw new Error(res?.text || "Ошибка удаления");
      refreshAll();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("refresh", { id: conn.id });
      if (!res?.st) throw new Error(res?.text || "Ошибка обновления токенов");
      refreshAll();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const authorize = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("connect", { id: conn.id });
      if (!res?.st) throw new Error(res?.message || "Ошибка создания OAuth ссылки");

      const url = res?.url;
      if (!url) throw new Error("Backend did not return oauth url");

      window.open(url, "_blank", "noopener,noreferrer");
      try {
        await navigator.clipboard.writeText(url);
      } catch {}

      setOauthModal({ open: true, connection: conn });
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const exchangeCode = async (code) => {
    const conn = oauthModal.connection;
    if (!conn) return;

    setLoading(true);
    try {
      const res = await api_laravel("exchange_code", { id: conn.id, code });
      if (!res?.st) throw new Error(res?.message || "Ошибка обмена кода");
      setOauthModal({ open: false, connection: null });
      refreshAll();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const syncConnection = async (days) => {
    const conn = syncModal.connection;
    if (!conn) return;

    setLoading(true);
    try {
      const res = await api_laravel("sync_connection", { id: conn.id, days });
      if (!res?.st) throw new Error(res?.message || "Ошибка запуска синхронизации");
      closeSync();
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmDialog />

      <AdsAddConnectionModal
        api_laravel={api_laravel}
        isOpened={isAddOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={refreshAll}
        showAlert={showAlert}
      />

      <AdsOauthCodeModal
        open={oauthModal.open}
        connection={oauthModal.connection}
        onClose={() => setOauthModal({ open: false, connection: null })}
        onSubmit={({ code }) => exchangeCode(code)}
      />

      <AdsSyncModal
        open={syncModal.open}
        connection={syncModal.connection}
        onClose={closeSync}
        onSubmit={({ days }) => syncConnection(days)}
      />

      <Grid
        container
        spacing={1}
      >
        <Grid size={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h6">Настройка соединений с API</Typography>
            </Box>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                onClick={refreshAll}
              >
                Reload
              </Button>

              <Button
                variant="contained"
                onClick={() => setAddOpen(true)}
                disabled={!canAccess("settings")}
              >
                Add connection
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {connections?.length === 0 ? (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="body1">Нет записей</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          connections.map((conn) => {
            const oauthNeeded = isOauthRequired(conn.status);
            const chipColor = statusColorMap[conn.status] || "default";

            return (
              <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                key={conn.id}
              >
                <Card>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={2}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            noWrap
                            title={conn.title}
                          >
                            {conn.title || "—"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.7 }}
                            noWrap
                          >
                            {conn.name} • {conn.provider} • {conn.external_account_id || "—"}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={conn.status}
                          color={chipColor}
                        />
                      </Stack>

                      <Divider />

                      <Stack spacing={0.5}>
                        <Typography variant="body2">Currency: {conn.currency || "—"}</Typography>
                        <Typography variant="body2">
                          Updated:{" "}
                          {conn.updated_at ? new Date(conn.updated_at).toLocaleString() : "—"}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleStatus(conn)}
                          disabled={!canAccess("settings")}
                        >
                          {conn.status === "disabled" ? "Enable" : "Disable"}
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => refreshTokens(conn)}
                          disabled={!canAccess("settings")}
                        >
                          Refresh tokens
                        </Button>

                        {oauthNeeded ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => authorize(conn)}
                            disabled={!canAccess("settings")}
                          >
                            Connect
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openSync(conn)}
                            disabled={!canAccess("settings")}
                          >
                            Sync
                          </Button>
                        )}

                        <Button
                          size="small"
                          color="error"
                          onClick={withConfirm(
                            () => deleteConnection(conn),
                            "Подтвердите удаление",
                            5,
                          )}
                          disabled={!canAccess("settings")}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </>
  );
}
