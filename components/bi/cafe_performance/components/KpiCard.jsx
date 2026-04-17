"use client";

import { Box, Card, Stack, Typography } from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";
import MetricLabel from "./MetricLabel";

const TONE_ICON_BG = {
  default: "action.hover",
  success: "success.50",
  warning: "warning.50",
  danger: "error.50",
  info: "primary.50",
};

const TONE_ICON_COLOR = {
  default: "text.secondary",
  success: "success.main",
  warning: "warning.dark",
  danger: "error.main",
  info: "primary.main",
};

const DELTA_TONE = {
  success: { bg: "success.50", fg: "success.dark" },
  danger: { bg: "error.50", fg: "error.dark" },
  neutral: { bg: "action.hover", fg: "text.secondary" },
};

function DeltaChip({ delta }) {
  if (!delta || !delta.label) return null;

  const tone = DELTA_TONE[delta.tone] || DELTA_TONE.neutral;
  const Icon =
    delta.direction === "up"
      ? ArrowUpwardRoundedIcon
      : delta.direction === "down"
        ? ArrowDownwardRoundedIcon
        : RemoveRoundedIcon;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={CP_SPACE.micro}
      sx={{
        backgroundColor: tone.bg,
        color: tone.fg,
        borderRadius: 999,
        px: CP_SPACE.related,
        py: 0.375,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <Icon sx={{ fontSize: 14 }} />
      <Box component="span">{delta.label}</Box>
    </Stack>
  );
}

export default function KpiCard({
  label,
  value,
  caption,
  tone = "default",
  icon,
  delta,
  compact = false,
  sx,
}) {
  const valueColor =
    tone === "success"
      ? "success.main"
      : tone === "warning"
        ? "warning.dark"
        : tone === "danger"
          ? "error.main"
          : "text.primary";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: CP_RADIUS.card,
        height: compact ? "auto" : { xs: "auto", sm: "100%" },
        display: "flex",
        flexDirection: "column",
        p: compact ? CP_SPACE.compact : CP_PADDING.card,
        ...sx,
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={CP_SPACE.related}
        sx={{ mb: compact ? CP_SPACE.micro : CP_SPACE.related }}
      >
        <MetricLabel
          text={label}
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        />
        {icon ? (
          <Box
            sx={{
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              borderRadius: "50%",
              backgroundColor: TONE_ICON_BG[tone] || TONE_ICON_BG.default,
              color: TONE_ICON_COLOR[tone] || TONE_ICON_COLOR.default,
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
        spacing={CP_SPACE.related}
        flexWrap="wrap"
      >
        <Typography
          variant={compact ? "h5" : "h4"}
          color={valueColor}
          sx={{ fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" }}
        >
          {value}
        </Typography>
        <DeltaChip delta={delta} />
      </Stack>

      {caption ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: compact ? CP_SPACE.related : "auto",
            pt: compact ? CP_SPACE.micro : CP_SPACE.related,
          }}
        >
          {caption}
        </Typography>
      ) : null}
    </Card>
  );
}
