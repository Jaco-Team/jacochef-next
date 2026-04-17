"use client";

import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { CP_SPACE } from "../layout";
import MetricLabel from "./MetricLabel";

export const getSlaTone = (value) => {
  if (value == null) return "neutral";
  if (value >= 95) return "success";
  if (value >= 85) return "warning";
  return "danger";
};

const TONE_COLOR = {
  success: "success.main",
  warning: "warning.main",
  danger: "error.main",
  neutral: "action.disabled",
};

export default function SlaProgressBar({ value, label = "SLA", formatter }) {
  const tone = getSlaTone(value);
  const clamped = value == null ? 0 : Math.max(0, Math.min(100, Number(value)));
  const displayValue = formatter ? formatter(value) : value == null ? "—" : `${Math.round(value)}%`;

  return (
    <Stack spacing={CP_SPACE.related}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <MetricLabel
          text={label}
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: TONE_COLOR[tone] }}
        >
          {displayValue}
        </Typography>
      </Stack>
      <Box
        sx={{
          borderRadius: 999,
          backgroundColor: "action.hover",
          overflow: "hidden",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={clamped}
          sx={{
            height: 6,
            borderRadius: 999,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": {
              backgroundColor: TONE_COLOR[tone],
              borderRadius: 999,
            },
          }}
        />
      </Box>
    </Stack>
  );
}
