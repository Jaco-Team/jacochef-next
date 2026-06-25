import { Box, Stack, Switch, Typography } from "@mui/material";
import { v2Colors, v2Control, v2Radii } from "./tokens";

export default function V2FieldSwitch({ label, checked, onChange, action = null, sx, ...props }) {
  return (
    <Box
      sx={{
        minHeight: v2Control.height,
        borderRadius: v2Radii.lg,
        border: `1px solid ${v2Colors.border}`,
        backgroundColor: v2Colors.surface,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        ...sx,
      }}
    >
      <Typography
        sx={{ fontSize: 14, lineHeight: 1.25, color: v2Colors.textMuted, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ flexShrink: 0 }}
      >
        <Switch
          checked={checked}
          onChange={onChange}
          size="small"
          color="error"
          {...props}
        />
        {action}
      </Stack>
    </Box>
  );
}
