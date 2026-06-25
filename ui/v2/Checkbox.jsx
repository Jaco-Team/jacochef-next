import { Box, Checkbox } from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

function EmptyIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        border: "1px solid #E4E7EC",
        borderRadius: v2Radii.xs,
        backgroundColor: v2Colors.surface,
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
        border: `1px solid ${v2Colors.primary}`,
        borderRadius: v2Radii.xs,
        backgroundColor: v2Colors.primary,
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

export default function V2Checkbox(props) {
  return (
    <Checkbox
      icon={<EmptyIcon />}
      checkedIcon={<CheckedIcon />}
      sx={{ width: 24, height: 24, p: 0 }}
      {...props}
    />
  );
}
