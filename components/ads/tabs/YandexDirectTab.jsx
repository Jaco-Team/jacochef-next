"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
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

import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useAdsStore } from "../useAdsStore";
import { MyDatePickerNew } from "@/ui/Forms";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import useXLSExport from "@/src/hooks/useXLSXExport";
import { QueryStats } from "@mui/icons-material";
import { formatNumber } from "@/src/helpers/utils/i18n";
import MyModal from "@/ui/MyModal";

const StatsChart = dynamic(() => import("./StatsChart"), { ssr: false });

function SmallText({ children, size = "0.7rem" }) {
  return <div style={{ fontSize: size }}>{children}</div>;
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

  const exportXLSX = useXLSExport();

  const canSubmit = useMemo(() => !!date_start && !!date_end, [date_start, date_end]);

  // charts modal
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [chartData, setChartData] = useState(null);

  const campaignsNormalized = useMemo(() => {
    if (!stats?.campaigns) return [];

    return stats.campaigns.map((c) => {
      const totals = (c.stats ?? []).reduce(
        (t, s) => {
          t.impressions += s.impressions ?? 0;
          t.clicks += s.clicks ?? 0;
          t.spend_minor += s.spend_minor ?? 0;
          t.conversions += s.conversions ?? 0;
          return t;
        },
        { impressions: 0, clicks: 0, spend_minor: 0, conversions: 0 },
      );

      const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;

      const cpc_minor = totals.clicks > 0 ? totals.spend_minor / totals.clicks : 0;

      return {
        ...c,
        ...totals,
        ctr,
        cpc_minor,
      };
    });
  }, [stats]);

  const columns = [
    {
      key: "name",
      label: "Кампания",
    },
    {
      key: "impressions",
      label: "Показы",
      numeric: true,
    },
    {
      key: "clicks",
      label: "Клики",
      numeric: true,
    },
    {
      key: "ctr",
      label: "CTR",
      numeric: true,
    },
    {
      key: "spend_minor",
      label: "Расход",
      numeric: true,
      formatRaw: (v) => ((v ?? 0) / 1_000_000).toFixed(2),
    },
    {
      key: "cpc_minor",
      label: "CPC",
      numeric: true,
      formatRaw: (v) => ((v ?? 0) / 1_000_000).toFixed(2),
    },
    {
      key: "conversions",
      label: "Конверсии",
      numeric: true,
    },
  ];

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
    if (!campaignsNormalized.length) return [];
    return [...campaignsNormalized].sort((a, b) => {
      const av = a[orderBy] ?? 0;
      const bv = b[orderBy] ?? 0;

      if (orderDir === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [campaignsNormalized, orderBy, orderDir]);

  const totals = useMemo(() => {
    if (!campaignsNormalized) return null;

    return campaignsNormalized.reduce(
      (t, c) => {
        t.impressions += c.impressions ?? 0;
        t.clicks += c.clicks ?? 0;
        t.spend_minor += c.spend_minor ?? 0;
        t.conversions += c.conversions ?? 0;
        return t;
      },
      { impressions: 0, clicks: 0, spend_minor: 0, conversions: 0 },
    );
  }, [campaignsNormalized]);

  const spendTotal = (totals?.spend_minor ?? 0) / 1_000_000;

  const totalCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;

  const totalCpc = totals.clicks ? spendTotal / totals.clicks : 0;

  // for chart
  const buildTimeSeries = (campaign) => {
    if (!campaign?.stats) return [];

    return campaign.stats.map((s) => {
      const impressions = Number(s.impressions) || 0;
      const clicks = Number(s.clicks) || 0;
      const spend = (Number(s.spend_minor) || 0) / 1_000_000;
      const conversions = Number(s.conversions) || 0;

      const ctr = impressions ? (clicks / impressions) * 100 : 0;
      const cpc = clicks ? spend / clicks : 0;

      return {
        date: s.date,
        impressions,
        clicks,
        conversions,
        spend,
        ctr,
        cpc,
      };
    });
  };

  return (
    <>
      <MyModal
        open={isChartOpen}
        onClose={() => setIsChartOpen(false)}
      >
        <StatsChart data={chartData} />
      </MyModal>
      <Grid
        container
        spacing={1}
      >
        <Grid size={12}>
          <Stack spacing={2}>
            <Typography variant="h6">Яндекс Директ</Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, md: 4 }}>
                <MyDatePickerNew
                  func={(v) => setDates({ date_start: formatYMD(v) })}
                  value={date_start}
                  label="Начало периода"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <MyDatePickerNew
                  func={(v) => setDates({ date_end: formatYMD(v) })}
                  value={date_end}
                  label="Конец периода"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack
                  direction="row"
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                  alignItems="center"
                  spacing={1}
                  sx={{ height: "100%" }}
                >
                  <Button
                    variant="contained"
                    disabled={!canSubmit}
                    onClick={getStats}
                  >
                    Получить статистику
                  </Button>

                  <Tooltip title={<Typography>{"Скачать таблицу в Excel"}</Typography>}>
                    <span>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "#3cb623ff" }}
                        disabled={!sortedCampaigns.length}
                        onClick={() =>
                          exportXLSX(
                            sortedCampaigns,
                            columns,
                            `yandex_direct_${date_start}-${date_end}.xlsx`,
                            `Yandex Direct ${date_start} → ${date_end}`,
                          )
                        }
                      >
                        <DownloadIcon />
                      </Button>
                    </span>
                  </Tooltip>
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
                          key={col.key}
                          align={col.numeric ? "right" : "left"}
                        >
                          {col.key === "name" ? (
                            col.label
                          ) : (
                            <TableSortLabel
                              active={orderBy === col.key}
                              direction={orderBy === col.key ? orderDir : "asc"}
                              onClick={() => handleSort(col.key)}
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
                      const ctr = (c.ctr ?? 0) * 100;

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
                              alignItems="center"
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
                              <Tooltip title={<Typography>Показать графики</Typography>}>
                                <QueryStats
                                  sx={{
                                    fontSize: 16,
                                    cursor: "pointer",
                                    color: "text.secondary",
                                    ml: "auto",
                                  }}
                                  onClick={() => {
                                    setChartData(buildTimeSeries(c));
                                    setIsChartOpen(true);
                                  }}
                                />
                              </Tooltip>
                            </Stack>

                            <SmallText>
                              {c.connection_title} • {c.external_account_id}
                            </SmallText>
                          </TableCell>

                          <TableCell align="right">{formatNumber(c.impressions, 0)}</TableCell>
                          <TableCell align="right">{formatNumber(c.clicks, 0)}</TableCell>
                          <TableCell align="right">{formatNumber(ctr, 2)}%</TableCell>
                          <TableCell align="right">{formatNumber(spend, 2)}</TableCell>
                          <TableCell align="right">{formatNumber(cpc, 2)}</TableCell>
                          <TableCell align="right">{formatNumber(c.conversions ?? 0, 0)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  {totals && (
                    <TableFooter
                      sx={{
                        position: "sticky",
                        bottom: "-1px",
                        backgroundColor: "background.paper",
                      }}
                    >
                      <TableRow>
                        <TableCell>
                          <Typography>Всего:</Typography>
                        </TableCell>

                        <TableCell align="right">{formatNumber(totals.impressions, 0)}</TableCell>
                        <TableCell align="right">{formatNumber(totals.clicks, 0)}</TableCell>
                        <TableCell align="right">{formatNumber(totalCtr, 2)}%</TableCell>
                        <TableCell align="right">{formatNumber(spendTotal, 2)}</TableCell>
                        <TableCell align="right">{formatNumber(totalCpc, 2)}</TableCell>
                        <TableCell align="right">
                          {formatNumber(totals.conversions ?? 0, 0)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>
    </>
  );
}
