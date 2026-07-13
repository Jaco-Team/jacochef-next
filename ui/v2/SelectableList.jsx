import { List } from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

export default function V2SelectableList({ sx, ...props }) {
  return (
    <List
      dense
      sx={{
        border: `1px solid ${v2Colors.border}`,
        borderRadius: v2Radii.md,
        overflow: "hidden",
        ...sx,
      }}
      {...props}
    />
  );
}
