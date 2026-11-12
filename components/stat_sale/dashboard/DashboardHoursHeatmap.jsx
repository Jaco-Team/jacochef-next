import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { formatChange, formatInt, textColorOn, thresholdColor } from "./dashboardFormat";

const columnsSx = {
  display: "grid",
  gridTemplateColumns: "40px repeat(6, minmax(56px, 1fr))",
  gap: 0.5,
};

/** Сетка «дни недели × 3-часовые интервалы»: в ячейке изменение г/г, %. */
export default function DashboardHoursHeatmap({ grid, slots, colors }) {
  const sortedColors = [...(colors ?? [])].sort((a, b) => a.percent - b.percent);
  const legend = sortedColors.length
    ? `linear-gradient(90deg, ${sortedColors
        .map((stop, index) => `${stop.color} ${(index / Math.max(sortedColors.length - 1, 1)) * 100}%`)
        .join(", ")})`
    : uiColors.surfaceMuted;

  return (
    <Box>
      <Box sx={{ overflowX: "auto" }}>
        <Box
          sx={{ minWidth: 420, display: "flex", flexDirection: "column", gap: 0.5 }}
          role="table"
          aria-label="Изменение продаж г/г по дням недели и часам"
        >
          <Box
            sx={columnsSx}
            role="row"
          >
            <Box role="columnheader" />
            {slots.map((slot) => (
              <Typography component="div"
                key={slot.key}
                role="columnheader"
                sx={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: uiColors.text, pb: 0.5 }}
              >
                {slot.name}
              </Typography>
            ))}
          </Box>

          {grid.map((row) => (
            <Box
              key={row.weekday}
              sx={columnsSx}
              role="row"
            >
              <Typography component="div"
                role="rowheader"
                sx={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: uiColors.text }}
              >
                {row.weekday}
              </Typography>
              {row.cells.map((cell) => {
                const hasValue = cell.percent !== null && cell.percent !== undefined;
                const background = hasValue ? thresholdColor(cell.percent, sortedColors) : uiColors.surfaceMuted;

                return (
                  <Box
                    key={cell.slot}
                    role="cell"
                    title={`${row.weekday}, ${cell.slot.replace("-", "–")}: ${formatInt(cell.current)} шт, год назад ${formatInt(cell.prev)} шт`}
                    sx={{
                      height: 40,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      backgroundColor: background,
                      color: hasValue ? textColorOn(background) : uiColors.textMuted,
                    }}
                  >
                    {formatChange(cell.percent)}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {sortedColors.length ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px", mt: 2 }}>
          <Box sx={{ flex: "0 1 280px", display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ height: 10, borderRadius: 5, background: legend }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: uiColors.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sortedColors.map((stop) => (
                <span key={stop.percent}>{formatChange(stop.percent).replace(",0", "")}</span>
              ))}
            </Box>
          </Box>
          <Typography component="div" sx={{ fontSize: 12, color: uiColors.text }}>
            Цвета и пороги — из настроек модуля «Заказы по часам»
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
