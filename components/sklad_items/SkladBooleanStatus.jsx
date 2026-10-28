"use client";

import { Typography } from "@mui/material";

export default function SkladBooleanStatus({ label, value }) {
  const enabled = Number(value) === 1;
  return (
    <Typography
      component="span"
      variant="body2"
      aria-label={`${label}: ${enabled ? "Да" : "Нет"}`}
    >
      {enabled ? "Да" : "Нет"}
    </Typography>
  );
}
