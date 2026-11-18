"use client";

import { Chip } from "@mui/material";
import { uiColors } from "../tokens";

const toneColors = {
  success: { solid: uiColors.successHover, soft: uiColors.successSoft, text: uiColors.successHover },
  danger: { solid: uiColors.danger, soft: uiColors.primarySoft, text: uiColors.dangerHover },
  warning: { solid: uiColors.warning, soft: uiColors.warningSoft, text: uiColors.textStrong },
  neutral: { solid: uiColors.text, soft: uiColors.surfaceMuted, text: uiColors.text },
};

function variantSx(tone, variant) {
  const colors = toneColors[tone] || toneColors.success;

  if (variant === "soft") {
    return { color: colors.text, backgroundColor: colors.soft, border: "1px solid transparent" };
  }

  if (variant === "outlined") {
    return {
      color: tone === "neutral" ? uiColors.textStrong : colors.text,
      backgroundColor: uiColors.surface,
      border: `1px solid ${tone === "neutral" ? uiColors.border : colors.solid}`,
    };
  }

  return {
    color: tone === "warning" ? uiColors.textStrong : uiColors.surface,
    backgroundColor: colors.solid,
    border: "1px solid transparent",
  };
}

/**
 * Compact status label. `tone` carries the meaning (success, danger, warning,
 * neutral), `variant` the weight: filled for states that need attention, soft
 * for ordinary states, outlined for the absence of a state.
 */
export default function JacoStatusChip({
  label,
  tone = "success",
  variant = "filled",
  sx,
  ...props
}) {
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 22,
        fontWeight: 600,
        ...variantSx(tone, variant),
        ...sx,
      }}
      {...props}
    />
  );
}
