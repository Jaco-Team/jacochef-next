import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { changeColor, formatChange, formatDecimal, splitPointName } from "./dashboardFormat";

const EFFICIENCY_SCALE = 120;

/** Рейтинг кафе по выбранной карточке: факт к цели или г/г для метрик без цели. */
export default function DashboardCafeRating({ cafes, metric, ratingBy }) {
  const byEfficiency = ratingBy === "efficiency";

  const rows = (cafes ?? [])
    .map((cafe) => {
      const values = cafe.metrics?.[metric] ?? {};
      return { cafe, value: byEfficiency ? values.efficiency : values.yoy };
    })
    .sort((a, b) => {
      if (a.value === null || a.value === undefined) return 1;
      if (b.value === null || b.value === undefined) return -1;
      return b.value - a.value;
    });

  const maxAbs = Math.max(1, ...rows.map((row) => Math.abs(Number(row.value) || 0)));

  return (
    <Box
      component="ol"
      sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.75 }}
    >
      {rows.map(({ cafe, value }, index) => {
        const { city, name } = splitPointName(cafe.name);
        const hasValue = value !== null && value !== undefined;
        const width = !hasValue
          ? 0
          : byEfficiency
            ? (Math.min(Math.max(value, 0), EFFICIENCY_SCALE) / EFFICIENCY_SCALE) * 100
            : (Math.abs(value) / maxAbs) * 100;
        const barColor = byEfficiency ? uiColors.primary : changeColor(value);

        return (
          <Box
            component="li"
            key={cafe.point_id}
            sx={{
              display: "grid",
              gridTemplateColumns: "22px minmax(0, 1fr) 60px",
              alignItems: "center",
              gap: 1.25,
              px: 1,
              py: 0.875,
              borderRadius: "10px",
              backgroundColor: cafe.selected ? uiColors.primarySoft : "transparent",
            }}
          >
            <Typography component="div" sx={{ fontSize: 13, color: uiColors.text, fontVariantNumeric: "tabular-nums" }}>
              {index + 1}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
              <Typography component="div"
                sx={{
                  fontSize: 14,
                  fontWeight: cafe.selected ? 700 : 500,
                  color: uiColors.textStrong,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={cafe.name}
              >
                {name}
                {city ? (
                  <Box
                    component="span"
                    sx={{ color: uiColors.text, fontWeight: 400 }}
                  >
                    {" "}
                    · {city}
                  </Box>
                ) : null}
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: uiColors.surfaceMuted,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${width}%`,
                    borderRadius: 4,
                    backgroundColor: barColor,
                  }}
                />
                {byEfficiency ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -3,
                      bottom: -3,
                      left: `${(100 / EFFICIENCY_SCALE) * 100}%`,
                      width: 2,
                      backgroundColor: uiColors.textStrong,
                      opacity: 0.45,
                    }}
                  />
                ) : null}
              </Box>
            </Box>
            <Typography component="div"
              sx={{
                textAlign: "right",
                fontSize: 14,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: byEfficiency ? uiColors.textStrong : changeColor(value),
              }}
            >
              {!hasValue ? "—" : byEfficiency ? formatDecimal(value, 1) : formatChange(value)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
