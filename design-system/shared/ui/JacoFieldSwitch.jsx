import { Box, Stack, Switch, Typography } from "@mui/material";
import { uiColors, uiControl, uiRadii, uiTypography } from "../tokens";

export default function JacoFieldSwitch({
  label,
  checked,
  onChange,
  labelAction = null,
  action = null,
  sx,
  ...props
}) {
  return (
    <Box
      sx={{
        minHeight: uiControl.height,
        borderRadius: uiRadii.md,
        border: `1px solid ${uiColors.border}`,
        backgroundColor: uiColors.surface,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ minWidth: 0, alignItems: "center" }}
      >
        <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>{label}</Typography>
        {labelAction}
      </Stack>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "center",
          flexShrink: 0,
        }}
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
