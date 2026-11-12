import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import { uiColors, uiRadii } from "@/design-system/shared/ui";

import { changeColor, formatChange, formatDecimal, formatInt, formatMetric } from "./dashboardFormat";

const gridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 2,
};

function Change({ label, value }) {
  return (
    <Box
      component="span"
      sx={{ whiteSpace: "nowrap" }}
    >
      {label}{" "}
      <Box
        component="span"
        sx={{ color: changeColor(value), fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
      >
        {formatChange(value)}
        {value === null || value === undefined ? "" : "%"}
      </Box>
    </Box>
  );
}

/** Первая строка дашборда: 6 карточек, выбранная управляет графиком и рейтингом кафе. */
export default function DashboardKpiCards({ cards, selected, onSelect, loading }) {
  if (!cards?.length) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            height={196}
            animation={loading ? "pulse" : false}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{ ...gridSx, opacity: loading ? 0.55 : 1, transition: "opacity 0.2s" }}
      role="group"
      aria-label="Ключевые показатели"
    >
      {cards.map((card) => {
        const isSelected = card.key === selected;
        const hasTarget = card.target !== null && card.target !== undefined;

        return (
          <ButtonBase
            key={card.key}
            onClick={() => onSelect(card.key)}
            aria-pressed={isSelected}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "flex-start",
              gap: 1.25,
              minHeight: 196,
              p: 2,
              textAlign: "left",
              borderRadius: uiRadii.lg,
              border: `2px solid ${isSelected ? uiColors.primary : uiColors.border}`,
              backgroundColor: isSelected ? uiColors.primarySoft : uiColors.surface,
              transition: "border-color 0.15s, background-color 0.15s",
              "&:hover": {
                borderColor: isSelected ? uiColors.primary : uiColors.textSubtle,
              },
              "&.Mui-focusVisible": {
                outline: `3px solid ${uiColors.primarySoft}`,
                outlineOffset: 2,
              },
            }}
          >
            <Typography component="div" sx={{ fontSize: 15, fontWeight: 600, color: uiColors.textStrong }}>
              {card.title}
            </Typography>
            <Typography component="div"
              sx={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 700,
                color: uiColors.primary,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatMetric(card.key, card.fact)}
            </Typography>

            {hasTarget ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: uiColors.text,
                  }}
                >
                  <span>Цель</span>
                  <Box
                    component="span"
                    sx={{ color: uiColors.textStrong, fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatInt(card.target)}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: uiColors.surfaceMuted,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${Math.min(Number(card.progress) || 0, 100)}%`,
                        borderRadius: 4,
                        backgroundColor: uiColors.primary,
                      }}
                    />
                  </Box>
                  <Typography component="div"
                    sx={{
                      minWidth: 52,
                      textAlign: "right",
                      fontSize: 13,
                      fontWeight: 600,
                      color: uiColors.dangerHover,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {card.progress === null ? "—" : `${formatDecimal(card.progress, 1)}%`}
                  </Typography>
                </Box>
              </Box>
            ) : null}

            <Box
              sx={{
                mt: "auto",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 14px",
                fontSize: 13,
                color: uiColors.text,
              }}
            >
              <Change
                label="м/м"
                value={card.mom}
              />
              <Change
                label="г/г"
                value={card.yoy}
              />
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
