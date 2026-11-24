import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { Box, Stack, Typography } from "@mui/material";

import { uiColors, uiRadii, uiTypography } from "../tokens";
import JacoTimePicker from "./JacoTimePicker";

function parseTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value ?? ""));

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function getDuration(startValue, endValue) {
  const startMinutes = parseTime(startValue);
  const endMinutes = parseTime(endValue);

  if (startMinutes === null || endMinutes === null) {
    return null;
  }

  const crossesMidnight = endMinutes < startMinutes;
  const durationMinutes = crossesMidnight
    ? 24 * 60 - startMinutes + endMinutes
    : endMinutes - startMinutes;

  return { durationMinutes, crossesMidnight };
}

function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (!minutes) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
}

export default function JacoTimeRangePicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startLabel = "Начало",
  endLabel = "Окончание",
  minutesStep = 5,
  disabled = false,
  showDuration = true,
  startPickerProps,
  endPickerProps,
  sx,
}) {
  const duration = getDuration(startValue, endValue);

  return (
    <Box sx={sx}>
      <Box
        data-testid="jaco-time-range"
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 20px minmax(0, 1fr)",
          gap: { xs: 0.75, sm: 1 },
          alignItems: "center",
        }}
      >
        <JacoTimePicker
          picker
          label={startLabel}
          value={startValue}
          onChange={onStartChange}
          minutesStep={minutesStep}
          disabled={disabled}
          {...startPickerProps}
        />

        <Typography
          aria-hidden="true"
          sx={{ color: uiColors.textMuted, textAlign: "center", fontSize: 18 }}
        >
          —
        </Typography>

        <JacoTimePicker
          picker
          label={endLabel}
          value={endValue}
          onChange={onEndChange}
          minutesStep={minutesStep}
          disabled={disabled}
          {...endPickerProps}
        />
      </Box>

      {showDuration && duration ? (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 1.25, alignItems: "center", color: uiColors.textMuted }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ ...uiTypography.label, color: "inherit" }}>
            {duration.crossesMidnight ? "Ночная смена" : "Продолжительность смены"}
            {` · ${formatDuration(duration.durationMinutes)}`}
          </Typography>
        </Stack>
      ) : null}
    </Box>
  );
}
