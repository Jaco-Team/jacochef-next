import { Button as MuiButton, CircularProgress } from "@mui/material";
import { uiColors, uiControl, uiRadii, uiStateColors, uiTypography } from "../tokens";

const variantStyles = {
  primary: {
    color: "#FFFFFF",
    backgroundColor: uiColors.primary,
    "&:hover": {
      backgroundColor: uiColors.primaryHover,
    },
  },
  success: {
    color: "#FFFFFF",
    backgroundColor: uiColors.success,
    "&:hover": {
      backgroundColor: uiColors.successHover,
    },
  },
  danger: {
    color: "#FFFFFF",
    backgroundColor: uiColors.danger,
    "&:hover": {
      backgroundColor: uiColors.dangerHover,
    },
  },
  secondary: {
    color: uiColors.text,
    borderColor: uiColors.border,
    backgroundColor: uiColors.surface,
    "&:hover": {
      borderColor: uiColors.border,
      backgroundColor: uiStateColors.hover,
    },
  },
  outlinePrimary: {
    color: uiColors.primary,
    borderColor: uiColors.primary,
    backgroundColor: uiColors.surface,
    "&:hover": {
      borderColor: uiColors.primaryHover,
      backgroundColor: uiColors.primarySoft,
    },
  },
};

const filledTones = new Set(["primary", "success", "danger"]);

export default function JacoButton({
  tone = "primary",
  compact = false,
  loading = false,
  disabled = false,
  sx,
  variant,
  children,
  onClick,
  ...props
}) {
  const resolvedVariant =
    variant || (tone === "secondary" || tone === "outlinePrimary" ? "outlined" : "contained");
  const toneStyles = variantStyles[tone] || variantStyles.primary;
  const isFilledLoading = loading && filledTones.has(tone);

  return (
    <MuiButton
      variant={resolvedVariant}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      sx={{
        minHeight: compact ? uiControl.compactHeight : uiControl.height,
        px: compact ? 2 : 2.25,
        borderRadius: uiRadii.md,
        boxShadow: "none",
        textTransform: "none",
        fontWeight: uiTypography.bodyMedium.fontWeight,
        whiteSpace: "nowrap",
        "&:hover": {
          boxShadow: "none",
        },
        "&.Mui-disabled": {
          backgroundColor: uiStateColors.disabledSurface,
          borderColor: uiColors.border,
          color: uiStateColors.disabledText,
        },
        ...(isFilledLoading
          ? {
              "&.Mui-disabled": {
                backgroundColor: toneStyles.backgroundColor,
                borderColor: toneStyles.backgroundColor,
                color: "#FFFFFF",
              },
            }
          : {}),
        ...toneStyles,
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={18}
          color="inherit"
        />
      ) : (
        children
      )}
    </MuiButton>
  );
}
