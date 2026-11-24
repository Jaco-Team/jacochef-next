import { useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { formatInt, formatPercent, OTHER_COLOR } from "./dashboardFormat";

const SIZE = 180;
const STROKE = 36;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
// Сегмент на всё кольцо рисуется окружностью: дуга с совпавшими концами не отрисуется.
const FULL_CIRCLE = 99.999;

/** Точка на окружности кольца: 0% — «12 часов», дальше по часовой стрелке. */
function pointAt(percent) {
  const angle = (percent / 100) * 2 * Math.PI - Math.PI / 2;
  return `${(CENTER + RADIUS * Math.cos(angle)).toFixed(3)} ${(CENTER + RADIUS * Math.sin(angle)).toFixed(3)}`;
}

/**
 * Сегмент — отдельная дуга от start до end (в процентах окружности).
 * Пунктир по окружности (stroke-dasharray) здесь не годится: в точке замыкания браузер рисует клин.
 */
function arcPath(start, end) {
  return `M ${pointAt(start)} A ${RADIUS} ${RADIUS} 0 ${end - start > 50 ? 1 : 0} 1 ${pointAt(end)}`;
}

const tooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: "#1F2937",
      borderRadius: "8px",
      px: 1.25,
      py: 1,
      maxWidth: 260,
    },
  },
};

/** Целая доля для подписи: shareRounded задаёт родитель, чтобы сумма по списку оставалась 100. */
const shareText = (item) => formatPercent(item.shareRounded ?? item.share);

function SegmentTooltip({ item }) {
  const hasCount = item.count !== null && item.count !== undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, color: "#FFFFFF" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 13, fontWeight: 600 }}>
        <Box
          sx={{
            flex: "none",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: item.color,
            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.6)",
          }}
        />
        <div>
          {item.name}
          {item.detail || item.hint ? ` · ${item.detail || item.hint}` : ""}
        </div>
      </Box>
      <Box sx={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
        {hasCount ? `${formatInt(item.count)} ${item.unit ?? "шт"} · ` : ""}
        {shareText(item)}%
      </Box>
    </Box>
  );
}

/**
 * Кольцевая диаграмма без подписей внутри, с тултипом на сегменте, и легенда справа.
 * items: [{ key, name, hint?, detail?, share, shareRounded?, color, count?, unit? }] — share в процентах;
 * hint виден в легенде и тултипе, detail — только в тултипе.
 * Сегменты и легенда — по убыванию доли, элементы с last: true («Остальные») в конце.
 */
export default function DashboardDonut({ items: sourceItems, ariaLabel }) {
  const [activeKey, setActiveKey] = useState(null);
  const items = [...sourceItems].sort(
    (a, b) => Number(Boolean(a.last)) - Number(Boolean(b.last)) || (Number(b.share) || 0) - (Number(a.share) || 0),
  );
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.share) || 0), 0);
  const scale = total > 100 ? 100 / total : 1;

  let offset = 0;
  const arcs = items
    .filter((item) => Number(item.share) > 0)
    .map((item) => {
      const start = offset;
      offset += Number(item.share) * scale;
      return { item, start, end: Math.min(offset, 100) };
    });

  const dimmed = (key) => activeKey !== null && activeKey !== key;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={ariaLabel}
        sx={{ width: SIZE, height: SIZE, flex: "none" }}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={OTHER_COLOR}
          strokeWidth={STROKE}
        />
        {arcs.map(({ item, start, end }) => {
          const segmentProps = {
            fill: "none",
            stroke: item.color,
            strokeWidth: STROKE,
            opacity: dimmed(item.key) ? 0.35 : 1,
            style: { cursor: "pointer", transition: "opacity 0.15s" },
            onMouseEnter: () => setActiveKey(item.key),
            onMouseLeave: () => setActiveKey(null),
          };

          return (
            <Tooltip
              key={item.key}
              title={<SegmentTooltip item={item} />}
              followCursor
              placement="top"
              slotProps={tooltipSlotProps}
            >
              {end - start >= FULL_CIRCLE ? (
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  {...segmentProps}
                />
              ) : (
                <path
                  d={arcPath(start, end)}
                  {...segmentProps}
                />
              )}
            </Tooltip>
          );
        })}
      </Box>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          flex: "1 1 160px",
          minWidth: 0,
        }}
      >
        {items.map((item) => (
          <Box
            component="li"
            key={item.key}
            onMouseEnter={() => setActiveKey(item.key)}
            onMouseLeave={() => setActiveKey(null)}
            sx={{
              display: "grid",
              gridTemplateColumns: "10px minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 1,
              px: 0.75,
              py: 0.5,
              borderRadius: "6px",
              backgroundColor: activeKey === item.key ? uiColors.surfaceMuted : "transparent",
              opacity: dimmed(item.key) ? 0.55 : 1,
              transition: "opacity 0.15s, background-color 0.15s",
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
            <Typography
              component="div"
              sx={{
                fontSize: 13,
                color: uiColors.textStrong,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={item.name}
            >
              {item.name}
              {item.hint ? (
                <Box
                  component="span"
                  sx={{ color: uiColors.text, ml: 0.75 }}
                >
                  {item.hint}
                </Box>
              ) : null}
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: uiColors.textStrong,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {shareText(item)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
