"use client";

import { Paper, Stack, Typography } from "@mui/material";

export default function KpiCard({ label, value, caption, tone = "default" }) {
  const palette =
    tone === "success"
      ? { border: "#C8E6C9", bg: "#F1F8E9", accent: "#2E7D32" }
      : tone === "warning"
        ? { border: "#FFE0B2", bg: "#FFF8E1", accent: "#EF6C00" }
        : tone === "danger"
          ? { border: "#FFCDD2", bg: "#FFF5F5", accent: "#C62828" }
          : { border: "#E5E7EB", bg: "#FFFFFF", accent: "#16324F" };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 3,
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
