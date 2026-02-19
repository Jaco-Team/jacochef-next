"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Backdrop,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import AdsAddConnectionModal from "./AdsAddConnectionModal";
import AdsOauthCodeModal from "./AdsOauthCodeModal";
import AdsSyncModal from "./AdsSyncModal";
// import handleUserAccess from "@/src/helpers/access/handleUserAccess";

const statusColorMap = {
  connected: "success",
  oauth_required: "warning",
  refresh_failed: "error",
  disabled: "default",
};

function isOauthRequired(status) {
  return status === "oauth_required" || status === "refresh_failed";
}

export default function AdsPage() {
  const [connections, setConnections] = useState([]);
  const [moduleName, setModuleName] = useState("DEFAULT");
  const [access, setAccess] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [oauthModal, setOauthModal] = useState({
    open: false,
    connection: null,
  });

  const [syncModal, setSyncModal] = useState({
    open: false,
    connection: null,
  });

  const { api_laravel } = useApi("ads");
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  // enable later
  // const { userCan } = useMemo(() => handleUserAccess(access), [access]);
  const userCan = useCallback(() => true, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api_laravel("get_all");
      if (!res?.st) throw new Error(res?.message || "Ошибка получения списка рекламных кабинетов");

      setModuleName(res?.module_info?.name || "DEFAULT");
      setConnections(res?.connections || []);
      setAccess(res?.access || []);
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleStatus = async (conn) => {
    setLoading(true);
    try {
      const nextStatus = conn.status === "disabled" ? "active" : "disabled";

      const res = await api_laravel("update", {
        id: conn.id,
        status: nextStatus,
      });

      if (!res?.st) throw new Error(res?.text || "Ошибка изменения статуса");

      await loadAll();
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("delete", { id: conn.id });
      if (!res?.st) throw new Error(res?.text || "Ошибка удаления");
      await loadAll();
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("refresh", { id: conn.id });
      if (!res?.st) throw new Error(res?.text || "Ошибка обновления токенов");
      await loadAll();
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  // oauth: connect -> open url -> show modal to paste code -> exchange_code
  const handleAuthorize = async (conn) => {
    setLoading(true);
    try {
      const res = await api_laravel("connect", { id: conn.id });
      if (!res?.st) throw new Error(res?.message || "Ошибка создания OAuth ссылки");

      const url = res?.url;
      if (!url) throw new Error("Backend did not return oauth url");

      window.open(url, "_blank", "noopener,noreferrer");

      // clipboard fallback if popup blocked
      try {
        await navigator.clipboard.writeText(url);
      } catch {}

      setOauthModal({ open: true, connection: conn });
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeCode = async ({ code }) => {
    if (!oauthModal.connection) return;

    setLoading(true);
    try {
      const res = await api_laravel("exchange_code", {
        id: oauthModal.connection.id,
        code,
      });
      if (!res?.st) throw new Error(res?.message || "Ошибка обмена кода");

      setOauthModal({ open: false, connection: null });
      await loadAll();
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSync = (conn) => {
    setSyncModal({ open: true, connection: conn });
  };

  const handleSync = async ({ days }) => {
    if (!syncModal.connection) return;

    setLoading(true);
    try {
      const res = await api_laravel("sync_connection", {
        id: syncModal.connection.id,
        days,
      });
      if (!res?.st) throw new Error(res?.message || "Ошибка запуска синхронизации");

      setSyncModal({ open: false, connection: null });
    } catch (e) {
      showAlert(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

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

      <AdsAddConnectionModal
        isOpened={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadAll}
        showAlert={showAlert}
      />

      <AdsOauthCodeModal
        open={oauthModal.open}
        connection={oauthModal.connection}
        onClose={() => setOauthModal({ open: false, connection: null })}
        onSubmit={handleExchangeCode}
      />

      <AdsSyncModal
        open={syncModal.open}
        connection={syncModal.connection}
        onClose={() => setSyncModal({ open: false, connection: null })}
        onSubmit={handleSync}
      />

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
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
              <Typography variant="h5">Ads Integrations</Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.7 }}
              >
                Module: {moduleName}
              </Typography>
            </Box>

            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                onClick={loadAll}
              >
                Reload
              </Button>

              <Button
                variant="contained"
                onClick={() => setIsAddOpen(true)}
                disabled={!userCan("create")}
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
                            title={conn.name}
                          >
                            {conn.name || "—"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.7 }}
                            noWrap
                          >
                            {conn.provider} • {conn.external_account_id || "—"}
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
                          onClick={() => handleToggleStatus(conn)}
                          disabled={!userCan("update")}
                        >
                          {conn.status === "disabled" ? "Enable" : "Disable"}
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRefresh(conn)}
                          disabled={!userCan("refresh")}
                        >
                          Refresh tokens
                        </Button>

                        {oauthNeeded ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAuthorize(conn)}
                            disabled={!userCan("connect")}
                          >
                            Authorize
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenSync(conn)}
                            disabled={!userCan("sync")}
                          >
                            Sync
                          </Button>
                        )}

                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(conn)}
                          disabled={!userCan("delete")}
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
