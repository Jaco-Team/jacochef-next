import { ListItemButton, ListItemText } from "@mui/material";
import { uiColors } from "../tokens";

export default function JacoSelectableListItem({
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
                backgroundColor: uiColors.dangerSoft,
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
