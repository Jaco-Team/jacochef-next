"use client";

import { useState } from "react";
import { Box, ButtonBase, Tooltip } from "@mui/material";
import {
  JacoDatePicker,
  JacoModal,
  JacoSelect,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";
import { displayText, formatKpiValue, formatNumber, formatPercent } from "./format";

const TONE_COLOR = {
  success: "#16A34A",
  danger: "#DD1A32",
  warning: "#C2410C",
  muted: "#6B7280",
};

const TONE_BG = {
  success: "#ECFDF3",
  danger: "#FDECEC",
  warning: "#FFF4E5",
  muted: "#F3F4F6",
};

const SERIES_COLORS = ["#3B82F6", "#F59E0B", "#34A853", "#1B3A4B", "#8B5CF6", "#0F766E"];

const PERIODS = [
  { id: "today", label: "Сегодня" },
  { id: "14d", label: "14 дней" },
  { id: "30d", label: "30 дней" },
  { id: "custom", label: "Период..." },
];

function niceMax(value) {
  if (value <= 200) return 200;
  if (value <= 400) return 400;
  const steps = [500, 800, 1000, 2000, 5000, 10000];
  return steps.find((step) => value <= step) || Math.ceil(value / 10000) * 10000;
}

function chartTicks(yMax) {
  const step = yMax <= 200 ? 100 : yMax / 4;
  const ticks = [];
  for (let value = yMax; value >= 0; value -= step) ticks.push(Math.round(value));
  return ticks;
}

export function PageTabs({ value, onChange }) {
  const items = [
    { id: "auth", label: "Авторизация" },
    { id: "payments", label: "Онлайн-оплата" },
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <ButtonBase
            key={item.id}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            sx={{
              minHeight: 36,
              px: 2.5,
              borderRadius: "10px",
              fontSize: 16,
              fontWeight: active ? 600 : 400,
              color: item.disabled ? "#B0B4BA" : active ? "#1F2937" : "#6B7280",
              backgroundColor: active ? "#ECEDEF" : "transparent",
            }}
          >
            {item.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export function FilterBar({ filters, selects, onPeriod, onDateStart, onDateEnd }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
        {PERIODS.map((item) => {
          const active = filters.period === item.id;
          return (
            <ButtonBase
              key={item.id}
              onClick={() => onPeriod(item.id)}
              sx={{
                minHeight: 44,
                px: 1.75,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: active ? uiColors.primary : "#E6E6E6",
                backgroundColor: active ? uiColors.primary : "#fff",
                color: active ? "#fff" : "#3F3F46",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item.label}
            </ButtonBase>
          );
        })}
        {filters.period === "custom" ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Box sx={{ width: 168 }}>
              <JacoDatePicker
                label="С"
                format="DD.MM.YYYY"
                value={filters.date_start}
                onChange={onDateStart}
              />
            </Box>
            <Box sx={{ width: 168 }}>
              <JacoDatePicker
                label="По"
                format="DD.MM.YYYY"
                value={filters.date_end}
                minDate={filters.date_start}
                onChange={onDateEnd}
              />
            </Box>
          </Box>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
        {selects.map((item) => (
          <Box
            key={item.key}
            sx={{ width: { xs: "100%", sm: 210 } }}
          >
            <JacoSelect
              label={item.label}
              options={item.options}
              value={item.value}
              allowNone={false}
              onChange={(event) => item.onChange(event.target.value)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function KpiGrid({ items }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" },
        gap: 1.5,
      }}
    >
      {(items || []).map((item) => (
        <JacoSurface
          key={item.key || item.label}
          sx={{ p: 2, minHeight: 112, backgroundColor: "#fff" }}
        >
          <Box sx={{ fontSize: 13, fontWeight: 500, color: "#8A8F98", mb: 1 }}>{item.label}</Box>
          <Box
            sx={{
              fontSize: 28,
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#1F2937",
              letterSpacing: "-0.02em",
            }}
          >
            {formatKpiValue(item.value, item.format)}
          </Box>
          {item.delta_label ? (
            <Box
              sx={{
                mt: 0.75,
                fontSize: 12,
                fontWeight: 600,
                color: TONE_COLOR[item.delta_tone] || TONE_COLOR.muted,
              }}
            >
              {item.delta_direction === "down" ? "▼" : "▲"} {item.delta_label}
            </Box>
          ) : null}
          {item.caption ? (
            <Box sx={{ mt: 0.75, fontSize: 12, color: "#9CA3AF", lineHeight: 1.35 }}>
              {item.caption}
            </Box>
          ) : null}
        </JacoSurface>
      ))}
    </Box>
  );
}

export function SectionCard({ title, note, children }) {
  return (
    <JacoSurface sx={{ p: { xs: 2, md: 2.5 }, backgroundColor: "#fff" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>{title}</Box>
        {note ? <Box sx={{ fontSize: 13, color: "#9CA3AF" }}>{note}</Box> : null}
      </Box>
      {children}
    </JacoSurface>
  );
}

function seriesColor(series, index) {
  return series.color || SERIES_COLORS[index % SERIES_COLORS.length];
}

export function StackedDayChart({ title, subtitle, series = [], points = [] }) {
  const totals = points.map((point) =>
    series.reduce((sum, item) => sum + Number(point?.[item.key] || 0), 0),
  );
  const yMax = niceMax(Math.max(0, ...totals));
  const ticks = chartTicks(yMax);

  return (
    <SectionCard
      title={title}
      note={subtitle}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {series.map((item, index) => (
          <Box
            key={item.key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: 13,
              color: "#4B5563",
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "3px",
                backgroundColor: seriesColor(item, index),
              }}
            />
            {item.label}
          </Box>
        ))}
      </Box>
      {points.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
          Нет данных за период
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            sx={{
              height: 240,
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
                {formatNumber(tick)}
              </Box>
            ))}
          </Box>
          <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
            {ticks.map((tick) => (
              <Box
                key={tick}
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${(tick / yMax) * 100}%`,
                  borderTop: "1px solid #F1F2F4",
                }}
              />
            ))}
            <Box sx={{ display: "flex", alignItems: "flex-end", height: 240, gap: 0.75 }}>
              {points.map((point, pointIndex) => {
                const total = totals[pointIndex] || 0;
                const tooltip = (
                  <Box>
                    <Box sx={{ fontWeight: 700, mb: 0.5 }}>{point.label || point.date}</Box>
                    {series.map((item, index) => (
                      <Box key={item.key}>
                        {item.label}: {formatNumber(point?.[item.key] || 0)}
                      </Box>
                    ))}
                  </Box>
                );
                return (
                  <Tooltip
                    key={point.date || point.label || pointIndex}
                    title={tooltip}
                    arrow
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: "72%",
                          maxWidth: 36,
                          height: total ? `${(total / yMax) * 100}%` : 0,
                          minHeight: total ? 4 : 0,
                          display: "flex",
                          flexDirection: "column-reverse",
                          overflow: "hidden",
                          borderRadius: "4px 4px 2px 2px",
                        }}
                      >
                        {series.map((item, index) => {
                          const value = Number(point?.[item.key] || 0);
                          if (!value || !total) return null;
                          return (
                            <Box
                              key={item.key}
                              sx={{
                                height: `${(value / total) * 100}%`,
                                backgroundColor: seriesColor(item, index),
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
              {points.map((point, pointIndex) => (
                <Box
                  key={`label-${point.date || pointIndex}`}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  {point.label || point.date}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </SectionCard>
  );
}

export function ShareCell({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
      <Box
        sx={{
          width: 72,
          height: 6,
          borderRadius: 99,
          backgroundColor: "#F1F2F4",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: `${width}%`, height: "100%", backgroundColor: "#4B5563" }} />
      </Box>
      <Box sx={{ minWidth: 48, textAlign: "right", color: "#4B5563" }}>{formatPercent(value)}</Box>
    </Box>
  );
}

export function ToneText({ tone, children }) {
  return (
    <Box sx={{ color: TONE_COLOR[tone] || "#4B5563", fontWeight: 600, fontSize: 13 }}>
      {children}
    </Box>
  );
}

export function ToneChip({ tone, children }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        minHeight: 24,
        borderRadius: "8px",
        backgroundColor: TONE_BG[tone] || TONE_BG.muted,
        color: TONE_COLOR[tone] || TONE_COLOR.muted,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </Box>
  );
}

export function CodeText({ children }) {
  return (
    <Box
      sx={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 12,
        color: "#9AA0A6",
      }}
    >
      {children}
    </Box>
  );
}

export function MetricTable({ columns, rows, onRowClick, getRowKey }) {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}
      >
        <Box
          component="thead"
          sx={{ fontSize: 13 }}
        >
          <Box component="tr">
            {columns.map((column) => (
              <Box
                component="th"
                key={column.key}
                sx={{
                  textAlign: column.align || "left",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#9CA3AF",
                  pb: 1.25,
                  px: 1,
                  borderBottom: "1px solid #F1F2F4",
                  whiteSpace: "nowrap",
                }}
              >
                {column.label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          component="tbody"
          sx={{ fontSize: 14 }}
        >
          {rows.length === 0 ? (
            <Box component="tr">
              <Box
                component="td"
                colSpan={columns.length}
                sx={{ py: 4, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}
              >
                Нет данных
              </Box>
            </Box>
          ) : (
            rows.map((row, index) => (
              <Box
                component="tr"
                key={getRowKey ? getRowKey(row, index) : index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover": onRowClick ? { backgroundColor: "#FAFAFA" } : undefined,
                }}
              >
                {columns.map((column) => (
                  <Box
                    component="td"
                    key={column.key}
                    sx={{
                      textAlign: column.align || "left",
                      fontSize: 14,
                      color: "#1F2937",
                      py: 1.25,
                      px: 1,
                      borderBottom: "1px solid #F6F7F8",
                      verticalAlign: "middle",
                    }}
                  >
                    {column.render ? column.render(row) : displayText(row[column.key])}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function FunnelBlock({ tabs, value, onChange, steps, color }) {
  const [localTab, setLocalTab] = useState(tabs[0]?.id || "");
  const active = value ?? localTab;
  const setActive = onChange || setLocalTab;
  const list = steps || [];
  const max = Math.max(1, ...list.map((step) => Number(step.count) || 0));

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {tabs.map((item) => {
          const selected = item.id === active;
          return (
            <ButtonBase
              key={item.id}
              onClick={() => setActive(item.id)}
              sx={{
                fontSize: 14,
                fontWeight: selected ? 700 : 500,
                color: selected ? "#1F2937" : "#9CA3AF",
                borderBottom: "2px solid",
                borderColor: selected ? "#1F2937" : "transparent",
                borderRadius: 0,
                pb: 0.5,
              }}
            >
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {list.length === 0 ? (
          <Box sx={{ py: 3, color: "#9CA3AF", fontSize: 14 }}>Нет данных</Box>
        ) : (
          list.map((step) => (
            <Box
              key={step.label}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{ width: { xs: 140, md: 280 }, flexShrink: 0, fontSize: 14, color: "#374151" }}
              >
                {step.label}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: `${Math.max(6, (Number(step.count) / max) * 100)}%`,
                    height: 22,
                    borderRadius: "4px",
                    backgroundColor: color,
                  }}
                />
              </Box>
              <Box sx={{ width: 150, flexShrink: 0, textAlign: "right" }}>
                <Box sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>
                  {formatNumber(step.count)}
                </Box>
                <Box sx={{ fontSize: 12, color: "#9CA3AF" }}>{step.rate_label || ""}</Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export function FlowDialog({ open, loading, title, steps, onClose }) {
  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={title || "События попытки"}
      maxWidth="md"
    >
      {loading ? (
        <Box sx={{ py: 4, textAlign: "center", color: "#6B7280" }}>Загрузка...</Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {(steps || []).length === 0 ? (
            <Box sx={{ color: "#6B7280" }}>События попытки не переданы</Box>
          ) : (
            steps.map((step, index) => (
              <Box
                key={`${step.time}-${step.step}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "88px 1fr" },
                  gap: 1.5,
                  pb: 1.5,
                  borderBottom: "1px solid #F1F2F4",
                }}
              >
                <Box sx={{ fontSize: 13, color: "#6B7280" }}>{displayText(step.time)}</Box>
                <Box>
                  <Box sx={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>
                    {step.label || step.step}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mt: 0.5,
                      alignItems: "center",
                    }}
                  >
                    <CodeText>{step.step}</CodeText>
                    {step.channel ? (
                      <Box sx={{ fontSize: 12, color: "#6B7280" }}>{step.channel}</Box>
                    ) : null}
                    {step.reason ? (
                      <ToneText tone={step.reason_tone}>{step.reason}</ToneText>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}
    </JacoModal>
  );
}
