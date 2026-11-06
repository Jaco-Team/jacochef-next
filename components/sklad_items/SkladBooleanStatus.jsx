"use client";

import { Typography } from "@mui/material";
import { JacoStatusChip } from "@/design-system/shared/ui";

export default function SkladBooleanStatus({ label, value, colorize = false }) {
  const enabled = Number(value) === 1;
  if (colorize) {
    return (
      <JacoStatusChip
        label={enabled ? "Да" : "Нет"}
        tone={enabled ? "success" : "danger"}
        aria-label={`${label}: ${enabled ? "Да" : "Нет"}`}
      />
    );
  }
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
