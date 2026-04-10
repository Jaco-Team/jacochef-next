"use client";

import { Paper, Stack, Typography } from "@mui/material";

export default function KpiCard({ label, value, caption, tone = "default" }) {
  const palette =
    tone === "success"
      ? { border: "success.light", bg: "background.paper", accent: "success.main" }
      : tone === "warning"
        ? { border: "warning.light", bg: "background.paper", accent: "warning.dark" }
        : tone === "danger"
          ? { border: "error.light", bg: "background.paper", accent: "error.main" }
          : { border: "divider", bg: "background.paper", accent: "text.primary" };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        minWidth: 0,
        border: "1px solid",
        borderColor: palette.border,
        backgroundColor: palette.bg,
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: palette.accent, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
        {caption ? (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
