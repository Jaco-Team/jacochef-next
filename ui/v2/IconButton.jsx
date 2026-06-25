import { IconButton as MuiIconButton } from "@mui/material";
import { v2Colors, v2Control, v2Radii } from "./tokens";

export default function V2IconButton({ sx, disabled, ...props }) {
  return (
    <MuiIconButton
      disabled={disabled}
      sx={{
        width: v2Control.height,
        height: v2Control.height,
        borderRadius: v2Radii.md,
        flexShrink: 0,
        backgroundColor: disabled ? v2Colors.disabled : v2Colors.surface,
        border: disabled ? "none" : `1px solid ${v2Colors.border}`,
        color: disabled ? "#999999" : "#1F2937",
        "&:hover": {
          backgroundColor: disabled ? v2Colors.disabled : "#FAFAFA",
        },
        ...sx,
      }}
      {...props}
    />
  );
}
