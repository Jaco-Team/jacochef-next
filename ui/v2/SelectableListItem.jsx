import { ListItemButton, ListItemText } from "@mui/material";
import { v2Colors } from "./tokens";

export default function V2SelectableListItem({
  label,
  destructive = false,
  children,
  sx,
  ...props
}) {
  return (
    <ListItemButton
      sx={{
        ...(destructive
          ? {
              color: "error.main",
              "&.Mui-selected": {
                backgroundColor: v2Colors.dangerSoft,
              },
              "&.Mui-selected:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.14)",
              },
            }
          : {}),
        ...sx,
      }}
      {...props}
    >
      {children || <ListItemText primary={label} />}
    </ListItemButton>
  );
}
