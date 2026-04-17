"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SectionCard from "../components/SectionCard";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";
import ReasonsBreakdownChart from "../charts/ReasonsBreakdownChart";
import ComplaintsByCategoryChart from "../charts/ComplaintsByCategoryChart";
import { getStageTypeLabel } from "../config";
import { CP_SPACE } from "../layout";

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right, "ru");
  }
  return left > right ? 1 : left < right ? -1 : 0;
};

const getAnomalyTone = (value) => {
  if (value == null) return "neutral";
  if (value >= 7) return "danger";
  if (value >= 3) return "warning";
  return "success";
};

const ANOMALY_COLOR = {
  success: "success.main",
  warning: "warning.main",
  danger: "error.main",
  neutral: "action.disabled",
};

const QUALITY_TONE_STYLES = {
  warning: {
    accent: "#D97706",
    iconBg: "#FFF7E8",
    iconColor: "#B45309",
    valueColor: "warning.dark",
  },
  info: {
    accent: "#7C3AED",
    iconBg: "#F5F0FF",
    iconColor: "#7C3AED",
    valueColor: "text.primary",
  },
  danger: {
    accent: "#E11D48",
    iconBg: "#FDECF2",
    iconColor: "#BE123C",
    valueColor: "error.main",
  },
  default: {
    accent: "#475467",
    iconBg: "action.hover",
    iconColor: "text.secondary",
    valueColor: "text.primary",
  },
};

const DELTA_TONE_STYLES = {
  success: { bg: "#E8F5E9", fg: "#1B5E20" },
  danger: { bg: "#FDECEF", fg: "#B42318" },
  neutral: { bg: "action.hover", fg: "text.secondary" },
};

const formatSigned = (value, fractionDigits = 2) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";

  const abs = Math.abs(numeric);
  const fixed = abs
    .toFixed(fractionDigits)
    .replace(/\.00$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");
  if (numeric > 0) return `+${fixed}`;
  if (numeric < 0) return `-${fixed}`;
  return fixed;
};

const buildDelta = ({ value, inverse = false, suffix = "", fractionDigits = 2 }) => {
  if (value == null) return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  if (numeric === 0) {
    return {
      label: `0${suffix}`,
      tone: "neutral",
      direction: "flat",
    };
  }

  const improving = inverse ? numeric < 0 : numeric > 0;

  return {
    label: `${formatSigned(numeric, fractionDigits)}${suffix}`,
    tone: improving ? "success" : "danger",
    direction: numeric > 0 ? "up" : "down",
  };
};

function DeltaPill({ delta }) {
  if (!delta?.label) return null;

  const toneStyle = DELTA_TONE_STYLES[delta.tone] || DELTA_TONE_STYLES.neutral;
  const direction = delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        borderRadius: 999,
        px: 1,
        py: 0.375,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
        backgroundColor: toneStyle.bg,
        color: toneStyle.fg,
      }}
    >
      <Box component="span">{direction}</Box>
      <Box component="span">{delta.label}</Box>
    </Box>
  );
}

function QualitySummaryCard({ label, value, caption, tone = "default", icon, delta }) {
  const toneStyle = QUALITY_TONE_STYLES[tone] || QUALITY_TONE_STYLES.default;

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        minHeight: { md: 112 },
        p: { xs: 1.5, md: 2 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: 1,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: toneStyle.accent,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
        {icon ? (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: toneStyle.iconBg,
              color: toneStyle.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        flexWrap="wrap"
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: toneStyle.valueColor,
          }}
        >
          {value}
        </Typography>
        <DeltaPill delta={delta} />
      </Stack>

      {caption ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: "auto" }}
        >
          {caption}
        </Typography>
      ) : null}
    </Card>
  );
}

function AnomalyChip({ value, formatter }) {
  const tone = getAnomalyTone(value);
  const TONE_STYLE = {
    success: { bg: "success.50", fg: "success.dark" },
    warning: { bg: "warning.50", fg: "warning.dark" },
    danger: { bg: "error.50", fg: "error.dark" },
    neutral: { bg: "action.hover", fg: "text.secondary" },
  };
  const { bg, fg } = TONE_STYLE[tone];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        backgroundColor: bg,
        color: fg,
        borderRadius: 999,
        px: 1,
        py: CP_SPACE.micro,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {formatter ? formatter(value) : value == null ? "—" : `${value}%`}
    </Box>
  );
}

function AnomalyBar({ value, max }) {
  const tone = getAnomalyTone(value);
  const clamped =
    value == null || max == null || max <= 0
      ? 0
      : Math.max(0, Math.min(100, (Number(value) / Number(max)) * 100));
  return (
    <Box sx={{ borderRadius: 999, backgroundColor: "action.hover", overflow: "hidden" }}>
      <LinearProgress
        variant="determinate"
        value={clamped}
        sx={{
          height: 6,
          borderRadius: 999,
          backgroundColor: "transparent",
          "& .MuiLinearProgress-bar": {
            backgroundColor: ANOMALY_COLOR[tone],
            borderRadius: 999,
          },
        }}
      />
    </Box>
  );
}

export default function QualityTab({ data, formatters }) {
  if (!data) return <EmptyState />;

  const summary = data.summary || {};
  const complaintsByCategory = data.complaints_by_category || [];
  const anomalies = data.anomalies_by_stage_category || [];

  const [sortBy, setSortBy] = useState("share_long_stage_percent");
  const [sortDirection, setSortDirection] = useState("desc");

  const sortedAnomalies = useMemo(() => {
    return [...anomalies].sort((left, right) => {
      const result = compareValues(left?.[sortBy], right?.[sortBy]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [anomalies, sortBy, sortDirection]);

  const maxAnomalyShare = useMemo(
    () =>
      anomalies.reduce((max, item) => {
        const value = Number(item?.share_long_stage_percent || 0);
        return value > max ? value : max;
      }, 0),
    [anomalies],
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDirection(field === "stage_type" || field === "category_name" ? "asc" : "desc");
  };

  return (
    <Stack spacing={CP_SPACE.section}>
      <SectionHeading
        icon={<WarningAmberRoundedIcon fontSize="small" />}
        iconColor="#B45309"
        iconBg="#FEF3C7"
        title="Качество и проблемы"
        subtitle="Экран для менеджеров"
      />

      <Grid
        container
        spacing={2}
        alignItems="stretch"
      >
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex" }}
        >
          <QualitySummaryCard
            label="Жалобы / 100 заказов"
            value={formatters.number(summary.complaints_per_100_orders)}
            tone="warning"
            icon={<FeedbackOutlinedIcon fontSize="small" />}
            delta={buildDelta({
              value: summary.complaints_per_100_orders_diff,
              inverse: true,
              fractionDigits: 2,
            })}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex" }}
        >
          <QualitySummaryCard
            label="Переделки / 100 позиций"
            value={formatters.number(summary.remakes_per_100_items)}
            caption={summary.remakes_per_100_items == null ? "Данные скоро появятся" : null}
            tone="info"
            icon={<AutorenewRoundedIcon fontSize="small" />}
            delta={buildDelta({
              value: summary.remakes_per_100_items_diff,
              inverse: true,
              fractionDigits: 2,
            })}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex" }}
        >
          <QualitySummaryCard
            label="Аномально долгие этапы"
            value={formatters.percent(summary.anomaly_share_percent)}
            caption="> 2× от P90"
            tone="danger"
            icon={<AccessTimeRoundedIcon fontSize="small" />}
            delta={buildDelta({
              value: summary.anomaly_share_percent_diff,
              inverse: true,
              suffix: "%",
              fractionDigits: 2,
            })}
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Обращения по причинам">
            <ReasonsBreakdownChart data={data.reasons_breakdown || []} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Жалобы по категориям (на 100 позиций)">
            {complaintsByCategory.length ? (
              <ComplaintsByCategoryChart data={complaintsByCategory} />
            ) : (
              <EmptyState />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Аномалии по этапам и категориям">
        {anomalies.length ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={sortBy === "stage_type" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "stage_type"}
                      direction={sortBy === "stage_type" ? sortDirection : "asc"}
                      onClick={() => handleSort("stage_type")}
                    >
                      Этап
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortBy === "category_name" ? sortDirection : false}>
                    <TableSortLabel
                      active={sortBy === "category_name"}
                      direction={sortBy === "category_name" ? sortDirection : "asc"}
                      onClick={() => handleSort("category_name")}
                    >
                      Категория
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    align="right"
                    sortDirection={sortBy === "share_long_stage_percent" ? sortDirection : false}
                  >
                    <TableSortLabel
                      active={sortBy === "share_long_stage_percent"}
                      direction={sortBy === "share_long_stage_percent" ? sortDirection : "desc"}
                      onClick={() => handleSort("share_long_stage_percent")}
                    >
                      Доля аномалий
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ width: "30%" }}>Визуализация</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAnomalies.map((item) => (
                  <TableRow
                    key={`${item.stage_type}-${item.category_id}`}
                    hover
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {getStageTypeLabel(item.stage_type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.category_name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <AnomalyChip
                        value={item.share_long_stage_percent}
                        formatter={formatters.percent}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <AnomalyBar
                          value={item.share_long_stage_percent}
                          max={maxAnomalyShare || 100}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatters.integer(item.long_count)} из {formatters.integer(item.count)}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState />
        )}
      </SectionCard>
    </Stack>
  );
}
