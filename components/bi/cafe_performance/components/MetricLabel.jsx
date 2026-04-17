"use client";

import { Box, Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CP_SPACE } from "../layout";

const METRIC_HELP = {
  SLA: "SLA — доля заказов или позиций, которые уложились в целевое время выполнения.",
  P50: "P50 — условно среднее, типичное время выполнения. По нему можно понять, сколько обычно занимает заказ или позиция в нормальном сценарии.",
  P90: "P90 — время для 10% самых долгих случаев. Эта метрика показывает не обычную скорость, а насколько плохими бывают задержки в худших сценариях.",
  CV: "CV — коэффициент вариации, показатель стабильности процесса: чем ниже значение, тем стабильнее результат.",
  LONG_STAGE:
    "Длинные — доля операций на этапе, которые вышли за целевое время и считаются задержанными.",
  COUNT: "Количество — общее число операций или заказов, попавших в расчет за выбранный период.",
};

const resolveMetricHelp = (text) => {
  const normalized = String(text || "").toUpperCase();
  if (normalized.includes("P90")) return METRIC_HELP.P90;
  if (normalized.includes("P50")) return METRIC_HELP.P50;
  if (normalized.includes("SLA")) return METRIC_HELP.SLA;
  if (normalized.includes("CV")) return METRIC_HELP.CV;
  if (normalized.includes("ДЛИНН")) return METRIC_HELP.LONG_STAGE;
  if (normalized.includes("КОЛИЧЕСТВ")) return METRIC_HELP.COUNT;
  return "";
};

export default function MetricLabel({
  text,
  variant = "body2",
  color = "text.secondary",
  sx,
  noWrap = false,
}) {
  const helpText = resolveMetricHelp(text);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={CP_SPACE.micro}
      sx={{ minWidth: 0 }}
    >
      <Typography
        variant={variant}
        color={color}
        sx={sx}
        noWrap={noWrap}
      >
        {text}
      </Typography>
      {helpText ? (
        <Tooltip
          title={helpText}
          arrow
          placement="top"
          describeChild
          enterTouchDelay={0}
          leaveTouchDelay={3500}
          slotProps={{
            tooltip: {
              sx: {
                maxWidth: 280,
                fontSize: 12,
                lineHeight: 1.45,
              },
            },
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label={`Описание термина ${text}`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              cursor: "help",
              flexShrink: 0,
              width: 20,
              height: 20,
              p: 0,
              border: 0,
              borderRadius: "50%",
              backgroundColor: "transparent",
              appearance: "none",
              WebkitAppearance: "none",
              touchAction: "manipulation",
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 14 }} />
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}
