import { useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { formatDecimal, formatInt, OTHER_COLOR } from "./dashboardFormat";

const SIZE = 180;
const STROKE = 36;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
        {formatDecimal(item.share, 1)}%
      </Box>
    </Box>
  );
}

/**
 * Кольцевая диаграмма без подписей внутри, с тултипом на сегменте, и легенда справа.
 * items: [{ key, name, hint?, detail?, share, color, count?, unit? }] — share в процентах;
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
      const length = (Number(item.share) * scale * CIRCUMFERENCE) / 100;
      const arc = { item, length, offset };
      offset += length;
      return arc;
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
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={OTHER_COLOR}
          strokeWidth={STROKE}
        />
        {arcs.map(({ item, length, offset: arcOffset }) => (
          <Tooltip
            key={item.key}
            title={<SegmentTooltip item={item} />}
            followCursor
            placement="top"
            slotProps={tooltipSlotProps}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={item.color}
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-arcOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              opacity={dimmed(item.key) ? 0.35 : 1}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={() => setActiveKey(item.key)}
              onMouseLeave={() => setActiveKey(null)}
            />
          </Tooltip>
        ))}
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
              {formatDecimal(item.share, 1)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
