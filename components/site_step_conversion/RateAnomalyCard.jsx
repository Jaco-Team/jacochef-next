"use client";

import { useMemo } from "react";
import { Box, Tooltip } from "@mui/material";
import { DROP_WARNING, computeRateAnomalies } from "./anomalies";
import { formatNumber, formatPercent } from "./format";
import { MetricTable, SectionCard, ToneChip } from "./widgets";

const CHART_HEIGHT = 240;
const BASELINE_COLOR = "#9CA3AF";
const DANGER_COLOR = "#DD1A32";
const WARNING_COLOR = "#C2410C";
const DANGER_BAND = "rgba(221, 26, 50, 0.08)";
const WARNING_BAND = "rgba(194, 65, 12, 0.08)";

const SEVERITY_COLOR = { danger: DANGER_COLOR, warning: WARNING_COLOR };
const SEVERITY_BAND = { danger: DANGER_BAND, warning: WARNING_BAND };

const dropFormat = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatDrop(value) {
  return `−${dropFormat.format(Math.abs(value))} п. п.`;
}

function formatDay(point) {
  return point.label || point.date;
}

function buildAxis(items) {
  const values = [];
  items.forEach((item) => {
    if (item.rate !== null) values.push(item.rate);
    if (item.baseline !== null) values.push(item.baseline);
  });
  const rawMin = values.length ? Math.floor((Math.min(...values) - 5) / 5) * 5 : 0;
  const range = 100 - rawMin;
  const step = range <= 20 ? 5 : range <= 50 ? 10 : 20;
  const yMin = Math.max(0, Math.floor(rawMin / step) * step);
  const ticks = [];
  for (let value = 100; value >= yMin; value -= step) ticks.push(value);
  return { yMin, ticks };
}

function buildSegments(items, getValue, toX, toY) {
  const segments = [];
  let current = [];
  items.forEach((item, index) => {
    const value = getValue(item);
    if (value === null) {
      if (current.length) segments.push(current);
      current = [];
      return;
    }
    current.push(`${toX(index)},${toY(value)}`);
  });
  if (current.length) segments.push(current);
  return segments.filter((segment) => segment.length > 1);
}

function LegendItem({ children, swatch }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, color: "#4B5563" }}>
      {swatch}
      {children}
    </Box>
  );
}

function PointTooltip({ point, totalLabel, successLabel }) {
  return (
    <Box>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{point.date || point.label}</Box>
      <Box>Показатель: {formatPercent(point.rate)}</Box>
      <Box>Среднее за 7 дн.: {formatPercent(point.baseline)}</Box>
      {point.drop !== null ? (
        <Box>{point.drop > 0 ? `Падение: ${formatDrop(point.drop)}` : "Падения нет"}</Box>
      ) : null}
      <Box>
        {totalLabel}: {formatNumber(point.total)}
      </Box>
      <Box>
        {successLabel}: {formatNumber(point.success)}
      </Box>
    </Box>
  );
}

export default function RateAnomalyCard({
  title,
  subtitle,
  points,
  totalKey,
  successKey,
  totalLabel,
  successLabel,
  color = "#3B82F6",
}) {
  const items = useMemo(
    () => computeRateAnomalies(points, totalKey, successKey),
    [points, totalKey, successKey],
  );

  if (items.length === 0) return null;

  const count = items.length;
  const { yMin, ticks } = buildAxis(items);
  const toX = (index) => ((index + 0.5) / count) * 100;
  const toY = (value) => 100 - ((value - yMin) / (100 - yMin)) * 100;
  const rateSegments = buildSegments(items, (item) => item.rate, toX, toY);
  const baselineSegments = buildSegments(items, (item) => item.baseline, toX, toY);
  const flagged = items.filter((item) => item.severity).reverse();

  const columns = [
    { key: "date", label: "День", render: (row) => formatDay(row) },
    {
      key: "rate",
      label: "Показатель",
      align: "right",
      render: (row) => formatPercent(row.rate),
    },
    {
      key: "baseline",
      label: "Среднее за 7 дн.",
      align: "right",
      render: (row) => formatPercent(row.baseline),
    },
    {
      key: "drop",
      label: "Падение (п. п.)",
      align: "right",
      render: (row) => <ToneChip tone={row.severity}>{formatDrop(row.drop)}</ToneChip>,
    },
    {
      key: "total",
      label: totalLabel,
      align: "right",
      render: (row) => formatNumber(row.total),
    },
    {
      key: "success",
      label: successLabel,
      align: "right",
      render: (row) => formatNumber(row.success),
    },
  ];

  return (
    <SectionCard
      title={title}
      note={subtitle || `падение ≥ ${DROP_WARNING} п. п. к среднему за 7 предыдущих дней`}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <LegendItem
          swatch={<Box sx={{ width: 16, height: 3, borderRadius: 2, backgroundColor: color }} />}
        >
          Показатель за день
        </LegendItem>
        <LegendItem
          swatch={
            <Box
              sx={{
                width: 16,
                height: 0,
                borderTop: `2px dashed ${BASELINE_COLOR}`,
              }}
            />
          }
        >
          Среднее за 7 предыдущих дней
        </LegendItem>
        <LegendItem
          swatch={
            <Box
              sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: WARNING_COLOR }}
            />
          }
        >
          Падение ≥ 5 п. п.
        </LegendItem>
        <LegendItem
          swatch={
            <Box
              sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: DANGER_COLOR }}
            />
          }
        >
          Падение ≥ 10 п. п.
        </LegendItem>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          sx={{
            height: CHART_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          {ticks.map((tick) => (
            <Box
              key={tick}
              sx={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1 }}
            >
              {tick}%
            </Box>
          ))}
        </Box>
        <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
          <Box sx={{ position: "relative", height: CHART_HEIGHT }}>
            {ticks.map((tick) => (
              <Box
                key={tick}
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${((tick - yMin) / (100 - yMin)) * 100}%`,
                  borderTop: "1px solid #F1F2F4",
                }}
              />
            ))}
            <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
              {items.map((item, index) => (
                <Box
                  key={item.date || item.label || index}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    height: "100%",
                    backgroundColor: item.severity ? SEVERITY_BAND[item.severity] : "transparent",
                  }}
                />
              ))}
            </Box>
            <Box
              component="svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
            >
              {baselineSegments.map((segment, index) => (
                <polyline
                  key={`baseline-${index}`}
                  points={segment.join(" ")}
                  fill="none"
                  stroke={BASELINE_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {rateSegments.map((segment, index) => (
                <polyline
                  key={`rate-${index}`}
                  points={segment.join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </Box>
            {items.map((item, index) => {
              if (item.rate === null) return null;
              const size = item.severity ? 12 : 6;
              return (
                <Box
                  key={`marker-${item.date || index}`}
                  sx={{
                    position: "absolute",
                    left: `${toX(index)}%`,
                    top: `${toY(item.rate)}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    backgroundColor: item.severity ? SEVERITY_COLOR[item.severity] : color,
                    border: item.severity ? "2px solid #fff" : "none",
                    boxSizing: "border-box",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
            <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
              {items.map((item, index) => (
                <Tooltip
                  key={`tip-${item.date || index}`}
                  title={
                    <PointTooltip
                      point={item}
                      totalLabel={totalLabel}
                      successLabel={successLabel}
                    />
                  }
                  arrow
                >
                  <Box sx={{ flex: 1, minWidth: 0, height: "100%" }} />
                </Tooltip>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", mt: 1 }}>
            {items.map((item, index) => (
              <Box
                key={`label-${item.date || index}`}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                  fontSize: 11,
                  color: "#9CA3AF",
                }}
              >
                {formatDay(item)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        {flagged.length === 0 ? (
          <ToneChip tone="success">Аномалий не найдено</ToneChip>
        ) : (
          <MetricTable
            rows={flagged}
            getRowKey={(row, index) => row.date || index}
            columns={columns}
          />
        )}
      </Box>
    </SectionCard>
  );
}
