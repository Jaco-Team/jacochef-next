import { IconButton as MuiIconButton } from "@mui/material";
import { uiColors, uiControl, uiRadii, uiStateColors } from "../tokens";

export default function JacoIconButton({ sx, disabled, ...props }) {
  return (
    <MuiIconButton
      disabled={disabled}
      sx={{
        width: uiControl.height,
        height: uiControl.height,
        borderRadius: uiRadii.md,
        flexShrink: 0,
        backgroundColor: disabled ? uiStateColors.disabledSurface : uiColors.surface,
        border: disabled ? "none" : `1px solid ${uiColors.border}`,
        color: disabled ? uiStateColors.disabledText : uiColors.text,
        "&:hover": {
          backgroundColor: disabled ? uiStateColors.disabledSurface : uiStateColors.hover,
        },
        ...sx,
      }}
      {...props}
    />
  );
}
