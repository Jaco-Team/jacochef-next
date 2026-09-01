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

export default function JacoCheckbox(props) {
  return (
    <MuiCheckbox
      icon={<EmptyIcon />}
      checkedIcon={<CheckedIcon />}
      sx={{ width: 24, height: 24, p: 0 }}
      {...props}
    />
  );
}
