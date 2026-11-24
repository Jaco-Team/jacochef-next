"use client";

import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, TextField } from "@mui/material";

export default function CleaningsLampDateTimePicker({
  value,
  onChange,
  labelDate = "Дата",
  labelTime = "Время",
  disabled,
}) {
  const dateValue = useMemo(() => (value ? dayjs(value) : null), [value]);
  const dateLabelValue = useMemo(() => (value ? dayjs(value).format("YYYY-MM-DD") : ""), [value]);

  const handleTimeChange = useCallback(
    (newTime) => {
      if (!newTime) return;
      const date = value ? dayjs(value).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      onChange?.(dayjs(`${date} ${dayjs(newTime).format("HH:mm")}`));
    },
    [onChange, value],
  );

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <Grid
        container
        spacing={1}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label={labelDate}
            value={dateLabelValue}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TimePicker
            label={labelTime}
            value={dateValue}
            onChange={handleTimeChange}
            disabled={disabled}
            ampm={false}
            views={["hours", "minutes"]}
            slotProps={{
              textField: { size: "small", fullWidth: true, inputProps: { readOnly: true } },
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
