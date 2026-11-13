"use client";

import { Chip } from "@mui/material";
import { uiColors } from "../tokens";

export default function JacoStatusChip({ label, tone = "success", sx, ...props }) {
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 22,
        color: uiColors.surface,
        backgroundColor: tone === "danger" ? uiColors.danger : uiColors.successHover,
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    />
  );
}
