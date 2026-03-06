"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useAdsStore } from "../useAdsStore";
import { MyDatePickerNew } from "@/ui/Forms";

function SmallText({ children, size = "0.7rem" }) {
  return <div style={{ fontSize: size }}>{children}</div>;
}

function formatDate(v) {
  if (!v) return null;
  const d = v?.$d instanceof Date ? v.$d : v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function YandexDirectTab({ api_laravel, showAlert }) {
  const date_start = useAdsStore((s) => s.date_start);
  const date_end = useAdsStore((s) => s.date_end);
  const stats = useAdsStore((s) => s.stats);

  const setDates = useAdsStore((s) => s.setDates);
  const setLoading = useAdsStore((s) => s.setLoading);
  const setStats = useAdsStore((s) => s.setStats);

  const [orderBy, setOrderBy] = useState("spend_minor");
  const [orderDir, setOrderDir] = useState("desc");

  const canSubmit = useMemo(() => !!date_start && !!date_end, [date_start, date_end]);

  const getStats = async () => {
    setLoading(true);
    try {
      const res = await api_laravel("get_stats", {
        provider: "yandex_direct",
        from: date_start,
        to: date_end,
      });
      if (!res?.st) throw new Error(res?.message || "Ошибка получения статистики");
      setStats(res);
    } catch (e) {
      showAlert?.(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDir(orderDir === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrderDir("desc");
    }
  };

  const sortedCampaigns = useMemo(() => {
    if (!stats?.campaigns) return [];

    return [...stats.campaigns].sort((a, b) => {
      const av = a[orderBy] ?? 0;
      const bv = b[orderBy] ?? 0;

      if (orderDir === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [stats, orderBy, orderDir]);

  const totals = useMemo(() => {
    if (!stats?.campaigns) return null;

    return stats.campaigns.reduce(
      (t, c) => {
        t.impressions += c.impressions ?? 0;
        t.clicks += c.clicks ?? 0;
        t.spend_minor += c.spend_minor ?? 0;
        t.conversions += c.conversions ?? 0;
        return t;
      },
      { impressions: 0, clicks: 0, spend_minor: 0, conversions: 0 },
    );
  }, [stats]);

  const spendTotal = (totals?.spend_minor ?? 0) / 1_000_000;

  const columns = [
    { id: "name", label: "Campaign" },
    { id: "impressions", label: "Impressions", numeric: true },
    { id: "clicks", label: "Clicks", numeric: true },
    { id: "ctr", label: "CTR", numeric: true },
    { id: "spend_minor", label: "Spend", numeric: true },
    { id: "cpc_minor", label: "CPC", numeric: true },
    { id: "conversions", label: "Conversions", numeric: true },
  ];

  return (
    <Grid
      container
      spacing={1}
    >
      <Grid size={12}>
        <Stack spacing={2}>
          <Typography variant="h6">Yandex Direct</Typography>

          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <MyDatePickerNew
                func={(v) => setDates({ date_start: formatDate(v) })}
                value={date_start}
                label="Начало периода"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MyDatePickerNew
                func={(v) => setDates({ date_end: formatDate(v) })}
                value={date_end}
                label="Конец периода"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack
                direction="row"
                justifyContent={{ xs: "flex-start", md: "flex-end" }}
                alignItems="center"
                sx={{ height: "100%" }}
              >
                <Button
                  variant="contained"
                  disabled={!canSubmit}
                  onClick={getStats}
                >
                  Получить статистику
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Grid>

      <Grid size={12}>
        {!stats?.campaigns?.length ? (
          <Typography>Нет данных</Typography>
        ) : (
          <Paper sx={{ p: 1, mt: 2 }}>
            <TableContainer sx={{ maxHeight: "50dvh" }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.numeric ? "right" : "left"}
                      >
                        {col.id === "name" ? (
                          col.label
                        ) : (
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? orderDir : "asc"}
                            onClick={() => handleSort(col.id)}
                          >
                            {col.label}
                          </TableSortLabel>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedCampaigns.map((c) => {
                    const spend = (c.spend_minor ?? 0) / 1_000_000;
                    const cpc = (c.cpc_minor ?? 0) / 1_000_000;

                    const statusColor =
                      c.status === "ON"
                        ? "success"
                        : c.status === "OFF"
                          ? "default"
                          : c.status === "MODERATION"
                            ? "warning"
                            : "info";

                    const StatusIcon =
                      c.status === "ON"
                        ? CheckCircleIcon
                        : c.status === "OFF"
                          ? PauseCircleIcon
                          : c.status === "MODERATION"
                            ? HourglassEmptyIcon
                            : InfoOutlinedIcon;

                    return (
                      <TableRow
                        key={c.campaign_id}
                        hover
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                          >
                            <Tooltip title={c.status}>
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color:
                                    statusColor === "success"
                                      ? "success.main"
                                      : statusColor === "warning"
                                        ? "warning.main"
                                        : statusColor === "default"
                                          ? "text.disabled"
                                          : "info.main",
                                }}
                              >
                                <StatusIcon sx={{ fontSize: 14 }} />
                              </Box>
                            </Tooltip>
                            <Typography fontWeight={600}>{c.name}</Typography>
                          </Stack>
                          <SmallText>
                            {c.connection_title} • {c.external_account_id}
                          </SmallText>
                        </TableCell>

                        <TableCell align="right">{c.impressions}</TableCell>
                        <TableCell align="right">{c.clicks}</TableCell>
                        <TableCell align="right">{c.ctr}</TableCell>
                        <TableCell align="right">{spend.toFixed(2)}</TableCell>
                        <TableCell align="right">{cpc.toFixed(2)}</TableCell>
                        <TableCell align="right">{c.conversions}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

                {totals && (
                  <TableFooter
                    sx={{ position: "sticky", bottom: 0, backgroundColor: "background.paper" }}
                  >
                    <TableRow>
                      <TableCell>
                        <Typography>TOTAL</Typography>
                      </TableCell>

                      <TableCell align="right">{totals.impressions}</TableCell>
                      <TableCell align="right">{totals.clicks}</TableCell>

                      <TableCell align="right">
                        {((totals.clicks / (totals.impressions || 1)) * 100).toFixed(2)}
                      </TableCell>

                      <TableCell align="right">{spendTotal.toFixed(2)}</TableCell>

                      <TableCell align="right">
                        {(spendTotal / (totals.clicks || 1)).toFixed(2)}
                      </TableCell>

                      <TableCell align="right">{totals.conversions}</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}
