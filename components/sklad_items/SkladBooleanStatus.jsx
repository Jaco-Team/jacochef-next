"use client";

import { Typography } from "@mui/material";

export default function SkladBooleanStatus({ label, value, colorize = false }) {
  const enabled = Number(value) === 1;
  return (
    <Typography
      component="span"
      variant="body2"
      aria-label={`${label}: ${enabled ? "Да" : "Нет"}`}
      sx={
        colorize ? { color: enabled ? "success.main" : "error.main", fontWeight: 600 } : undefined
      }
    >
      {enabled ? "Да" : "Нет"}
    </Typography>
  );
}
