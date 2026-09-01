import { Paper } from "@mui/material";
import { uiColors, uiRadii } from "../tokens";

export default function JacoSurface({ sx, ...props }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: uiRadii.md,
        borderColor: uiColors.border,
        boxShadow: "none",
        ...sx,
      }}
      {...props}
    />
  );
}
