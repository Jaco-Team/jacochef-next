import { List } from "@mui/material";
import { uiColors, uiRadii } from "../tokens";

export default function JacoSelectableList({ sx, ...props }) {
  return (
    <List
      dense
      sx={{
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.md,
        overflow: "hidden",
        ...sx,
      }}
      {...props}
    />
  );
}
