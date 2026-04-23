"use client";

import { Box } from "@mui/material";
import { getSlaTone } from "./SlaProgressBar";
import { CP_SPACE } from "../layout";

const TONE_STYLE = {
  success: { bg: "success.50", fg: "success.dark" },
  warning: { bg: "warning.50", fg: "warning.dark" },
  danger: { bg: "error.50", fg: "error.dark" },
  neutral: { bg: "action.hover", fg: "text.secondary" },
};

export default function SlaChip({ value, formatter }) {
  const tone = getSlaTone(value);
  const { bg, fg } = TONE_STYLE[tone];
  const label = formatter ? formatter(value) : value == null ? "—" : `${Math.round(value)}%`;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bg,
        color: fg,
        borderRadius: 999,
        px: 1,
        py: CP_SPACE.micro,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {label}
    </Box>
  );
}
