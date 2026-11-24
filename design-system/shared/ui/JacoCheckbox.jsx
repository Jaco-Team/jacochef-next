import { Box, Checkbox as MuiCheckbox } from "@mui/material";
import { uiColors, uiRadii } from "../tokens";

function EmptyIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.xs,
        backgroundColor: uiColors.surface,
      }}
    />
  );
}

function CheckedIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        border: `1px solid ${uiColors.primary}`,
        borderRadius: uiRadii.xs,
        backgroundColor: uiColors.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::after": {
          content: '""',
          width: 10,
          height: 6,
          borderLeft: "2px solid #FFFFFF",
          borderBottom: "2px solid #FFFFFF",
          transform: "rotate(-45deg)",
          mt: "-2px",
        },
      }}
    />
  );
}

function IndeterminateIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        border: `1px solid ${uiColors.primary}`,
        borderRadius: uiRadii.xs,
        backgroundColor: uiColors.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::after": {
          content: '""',
          width: 10,
          height: 2,
          backgroundColor: "#FFFFFF",
        },
      }}
    />
  );
}

export default function JacoCheckbox({ sx, ...props }) {
  return (
    <MuiCheckbox
      icon={<EmptyIcon />}
      checkedIcon={<CheckedIcon />}
      indeterminateIcon={<IndeterminateIcon />}
      sx={{ width: 24, height: 24, p: 0, ...sx }}
      {...props}
    />
  );
}
