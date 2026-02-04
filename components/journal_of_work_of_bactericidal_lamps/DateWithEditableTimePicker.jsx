"use client";

import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";

export default function DateWithEditableTimePicker(props) {
  const { value, onChange, labelDate = "Дата", labelTime = "Время", disabled, ...rest } = props;

  const dateValue = useMemo(() => (value ? dayjs(value) : null), [value]);

  const dateLabelValue = useMemo(() => (value ? dayjs(value).format("YYYY-MM-DD") : ""), [value]);

  const handleTimeChange = useCallback(
    (newTime) => {
      if (!newTime) return;

      const fixedDate = value ? dayjs(value).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

      const updated = dayjs(`${fixedDate} ${dayjs(newTime).format("HH:mm")}`);

      onChange?.(updated);
    },
    [value, onChange],
  );

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <TextField
        label={labelDate}
        value={dateLabelValue}
        size="small"
        fullWidth
        slotProps={{
          input: { readOnly: true },
        }}
      />

      <TimePicker
        label={labelTime}
        value={dateValue}
        onChange={handleTimeChange}
        disabled={disabled}
        ampm={false}
        views={["hours", "minutes"]}
        slotProps={{
          textField: {
            size: "small",
            inputProps: { readOnly: true },
          },
        }}
        {...rest}
      />
    </div>
  );
}
