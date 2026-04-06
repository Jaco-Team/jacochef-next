"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import MyAlert from "@/ui/MyAlert";
import { MyTextInput } from "@/ui/Forms";

import CompetitorParserItemsModal from "./CompetitorParserItemsModal";
import { competitorStatusColorMap, useCompetitorParsersStore } from "./useCompetitorParsersStore";
import { formatValue, getStatusLabel } from "./utils";
import ExcelIcon from "@/ui/ExcelIcon";
import { useConfirm } from "@/src/hooks/useConfirm";

export default function CompetitorParsersPage() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const module = useCompetitorParsersStore((s) => s.module);
  const moduleName = useCompetitorParsersStore((s) => s.moduleName);
  const loading = useCompetitorParsersStore((s) => s.loading);
  const access = useCompetitorParsersStore((s) => s.access);
  const filters = useCompetitorParsersStore((s) => s.filters);
  const sources = useCompetitorParsersStore((s) => s.sources);
  const itemsModal = useCompetitorParsersStore((s) => s.itemsModal);
  const refreshToken = useCompetitorParsersStore((s) => s.refreshToken);

  const setLoading = useCompetitorParsersStore((s) => s.setLoading);
  const setFilters = useCompetitorParsersStore((s) => s.setFilters);
  const setData = useCompetitorParsersStore((s) => s.setData);
  const setItemsModal = useCompetitorParsersStore((s) => s.setItemsModal);
  const refreshAll = useCompetitorParsersStore((s) => s.refreshAll);

  const { withConfirm, ConfirmDialog } = useConfirm();

  const { api_laravel } = useApi(module);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api_laravel("get_all", {});
      if (!res?.st) throw new Error(res?.message || res?.text || "Ошибка загрузки данных");

      const nextModuleName = res?.module_info?.name || "Парсеры конкурентов";

      setData({
        moduleName: nextModuleName,
        access: res?.access || null,
        sources: res?.sources || [],
      });
      document.title = nextModuleName;
    } catch (error) {
      showAlert?.(error?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [api_laravel, setData, setLoading, showAlert]);

  useEffect(() => {
    loadAll();
  }, [refreshToken]);

  const canAccess = useCallback(
    (key) => {
      if (!access || Object.keys(access).length === 0) return true;
      const { userCan } = handleUserAccess(access);
      return userCan("access", key);
    },
    [access],
  );

  const canRun = canAccess("run") || canAccess("sources") || canAccess("settings");
  const canExport = canAccess("export") || canAccess("sources") || canAccess("settings");
  const canViewItems = canAccess("view_items") || canAccess("sources") || canAccess("settings");
  const filteredSources = sources.filter((source) => {
    if (filters.enabled_only && !source.is_enabled) return false;

    const query = filters.search?.trim().toLowerCase();
    if (!query) return true;

    return [source.code, source.name].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  const runSource = async (sourceCode) => {
    setLoading(true);
    try {
      const res = await api_laravel("run", { source_code: sourceCode, debug: false });
      if (!res?.st) throw new Error(res?.message || res?.text || "Ошибка запуска парсера");
      showAlert?.("Парсер запущен", true);
      await loadAll();
    } catch (error) {
      showAlert?.(error?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const exportSource = async (source) => {
    const snapshotDate = source?.last_run?.snapshot_date;
    if (!snapshotDate) {
      showAlert?.("Нет снимка для экспорта");
      return;
    }

    setLoading(true);
    try {
      const res = await api_laravel(
        "export",
        {
          source_code: source.code,
          snapshot_date: snapshotDate,
          disk: "public",
        },
        { responseType: "blob" },
      );

      const blob = new Blob([res], { type: res?.type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `competitor_parsers_${source.code}_${snapshotDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert?.(error?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const exportAll = async () => {
    setLoading(true);
    try {
      const res = await api_laravel("export_all", {}, { responseType: "blob" });
      if (!res) {
        throw new Error("Ошибка экспорта");
      }
      const blob = new Blob([res], { type: res?.type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `competitor_parsers_export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert?.(error?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const closeItemsModal = useCallback(() => {
    setItemsModal({
      open: false,
      loading: false,
      source: null,
      run: null,
      items: [],
    });
  }, [setItemsModal]);

  const openItemsModal = async (source) => {
    setItemsModal({
      open: true,
      loading: true,
      source,
      run: source?.last_run || null,
      items: [],
    });

    try {
      const payload = {
        source_code: source.code,
        limit: 500,
      };

      if (source?.last_run?.snapshot_date) {
        payload.snapshot_date = source.last_run.snapshot_date;
      }

      const res = await api_laravel("get_last_run_items", payload);
      if (!res?.st) throw new Error(res?.message || res?.text || "Ошибка загрузки товаров");

      setItemsModal({
        open: true,
        loading: false,
        source: res?.source || source,
        run: res?.run || source?.last_run || null,
        items: res?.items || [],
      });
    } catch (error) {
      setItemsModal({ loading: false });
      showAlert?.(error?.message || "Ошибка");
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

      <ConfirmDialog />

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <CompetitorParserItemsModal
        modal={itemsModal}
        onClose={closeItemsModal}
      />

      <Grid
        spacing={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <h1>{moduleName}</h1>
        </Grid>

        <Grid size={12}>
          <Paper sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              gap={2}
              mb={2}
            >
              <Box>
                <Typography variant="h6">Источники</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Последний статус запуска и просмотр товаров по запросу.
                </Typography>
              </Box>

              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
              >
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFilters({
                      enabled_only: true,
                      search: "",
                    })
                  }
                >
                  Сбросить
                </Button>

                <Button
                  variant="contained"
                  onClick={refreshAll}
                >
                  Обновить
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={exportAll}
                >
                  <Tooltip title="Экспорт всех данных в Excel">
                    <ExcelIcon
                      fontSize="small"
                      iconColor="#1D6F42"
                      bgColor="#fff"
                    />
                  </Tooltip>
                </Button>
              </Stack>
            </Stack>

            <Grid
              container
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(filters.enabled_only)}
                      onChange={(event) => setFilters({ enabled_only: event.target.checked })}
                    />
                  }
                  label="Только активные"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <MyTextInput
                  type="search"
                  label="Поиск"
                  placeholder="Поиск по названию"
                  value={filters.search}
                  func={(event) => setFilters({ search: event.target.value })}
                />
              </Grid>
            </Grid>

            <TableContainer sx={{ overflow: "auto", maxHeight: "65dvh" }}>
              <Table
                stickyHeader
                size="small"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Конкурент</TableCell>
                    <TableCell>Город</TableCell>
                    <TableCell>Парсер</TableCell>
                    <TableCell>Активен</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Товаров</TableCell>
                    <TableCell>Ошибок</TableCell>
                    <TableCell>Снимок</TableCell>
                    <TableCell>Ссылка</TableCell>
                    <TableCell>Заметки</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <Typography variant="body2">Нет данных</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSources.map((source) => {
                      const lastRun = source.last_run;
                      const status = lastRun?.status || null;
                      const statusColor = competitorStatusColorMap[status] || "default";

                      return (
                        <TableRow key={source.id}>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography fontWeight={700}>{source.name}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {source.code}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{formatValue(source.competitor)}</TableCell>
                          <TableCell>{formatValue(source.city)}</TableCell>
                          <TableCell>{formatValue(source.parser)}</TableCell>
                          <TableCell>{source.is_enabled ? "Да" : "Нет"}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={statusColor}
                              label={getStatusLabel(status)}
                            />
                          </TableCell>
                          <TableCell>{lastRun?.item_count ?? "—"}</TableCell>
                          <TableCell>{lastRun?.error_count ?? "—"}</TableCell>
                          <TableCell>{formatValue(lastRun?.snapshot_date)}</TableCell>
                          <TableCell>
                            {source.base_url ? (
                              <IconButton
                                component={Link}
                                href={source.base_url}
                                target="_blank"
                                color="primary"
                                size="small"
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ maxWidth: 220 }}
                            >
                              {formatValue(source.notes)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="flex-end"
                              gap={1}
                            >
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => openItemsModal(source)}
                                disabled={!canViewItems || !lastRun?.snapshot_date}
                              >
                                Товары
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                onClick={withConfirm(
                                  () => runSource(source.code),
                                  "Вы уверены, что хотите запустить парсер? Это может занять некоторое время.",
                                )}
                                disabled={!canRun}
                              >
                                Запустить
                              </Button>

                              <IconButton
                                size="small"
                                onClick={() => exportSource(source)}
                                disabled={!canExport || !lastRun?.snapshot_date}
                              >
                                <ExcelIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
