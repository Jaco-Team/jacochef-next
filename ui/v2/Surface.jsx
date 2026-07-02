import { Paper } from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

export default function V2Surface({ sx, ...props }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: v2Radii.md,
        borderColor: v2Colors.border,
        boxShadow: "none",
        ...sx,
      }}
      {...props}
    />
  );
}
