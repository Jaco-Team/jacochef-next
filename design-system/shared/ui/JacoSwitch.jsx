import { Switch } from "@mui/material";

import { uiColors } from "../tokens";

export default function JacoSwitch({ sx, ...props }) {
  return (
    <Switch
      {...props}
      sx={{
        width: 58,
        height: 34,
        p: 0,
        "& .MuiSwitch-switchBase": {
          p: "3px",
          color: uiColors.surface,
          "&.Mui-checked": {
            transform: "translateX(24px)",
            color: uiColors.surface,
            "& + .MuiSwitch-track": {
              bgcolor: uiColors.primary,
              borderColor: uiColors.primary,
              opacity: 1,
            },
          },
          "&.Mui-disabled": {
            color: uiColors.surface,
            "& + .MuiSwitch-track": { opacity: 0.55 },
          },
        },
        "& .MuiSwitch-thumb": {
          width: 28,
          height: 28,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18)",
        },
        "& .MuiSwitch-track": {
          boxSizing: "border-box",
          border: "1px solid #D9D9D9",
          borderRadius: "17px",
          bgcolor: "#F1F1F1",
          opacity: 1,
        },
        ...sx,
      }}
    />
  );
}
