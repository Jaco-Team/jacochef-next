import { Button as MuiButton, CircularProgress } from "@mui/material";
import { v2Colors, v2Control, v2Radii } from "./tokens";

const variantStyles = {
  primary: {
    color: "#FFFFFF",
    backgroundColor: v2Colors.primary,
    "&:hover": {
      backgroundColor: v2Colors.primaryHover,
    },
  },
  success: {
    color: "#FFFFFF",
    backgroundColor: v2Colors.success,
    "&:hover": {
      backgroundColor: v2Colors.successHover,
    },
  },
  danger: {
    color: "#FFFFFF",
    backgroundColor: v2Colors.danger,
  },
  secondary: {
    color: v2Colors.text,
    borderColor: v2Colors.border,
    backgroundColor: v2Colors.surface,
    "&:hover": {
      borderColor: v2Colors.border,
      backgroundColor: "#FAFAFA",
    },
  },
  outlinePrimary: {
    color: v2Colors.primary,
    borderColor: v2Colors.primary,
    backgroundColor: v2Colors.surface,
    "&:hover": {
      borderColor: v2Colors.primaryHover,
      backgroundColor: "rgba(238, 39, 55, 0.04)",
    },
  },
};

export default function V2Button({
  tone = "primary",
  compact = false,
  loading = false,
  disabled = false,
  sx,
  variant,
  children,
  ...props
}) {
  const resolvedVariant =
    variant || (tone === "secondary" || tone === "outlinePrimary" ? "outlined" : "contained");

  return (
    <MuiButton
      variant={resolvedVariant}
      disabled={loading || disabled}
      sx={{
        minHeight: compact ? v2Control.compactHeight : v2Control.height,
        px: compact ? 2 : 2.25,
        borderRadius: v2Radii.md,
        boxShadow: "none",
        textTransform: "none",
        fontWeight: 700,
        whiteSpace: "nowrap",
        "&:hover": {
          boxShadow: "none",
        },
        "&.Mui-disabled": {
          backgroundColor: v2Colors.disabled,
          color: v2Colors.textSubtle,
        },
        ...(variantStyles[tone] || variantStyles.primary),
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
