"use client";

import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";

function getIsoWeek(date) {
  const d = new Date(date.year(), date.month(), date.date());
  d.setHours(0, 0, 0, 0);

  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function MyWeekPicker({ value, onChange }) {
  const [internalDate, setInternalDate] = useState(value ? dayjs(value) : null);

  const weekNumber = internalDate ? getIsoWeek(internalDate) : null;

  const handleSelect = (newDate) => {
    if (!newDate) return;

    const start = newDate.startOf("week").add(1, "day").format("YYYY-MM-DD");
    const end = newDate.startOf("week").add(7, "day").format("YYYY-MM-DD");
    const weekNumber = getIsoWeek(newDate);

    setInternalDate(newDate);

    onChange({
      weekStart: start,
      weekEnd: end,
      weekNumber,
    });
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <DatePicker
        size="small"
        label="Неделя"
        views={["month", "day"]}
        value={internalDate}
        enableAccessibleFieldDOMStructure={false}
        displayWeekNumber
        onChange={handleSelect}
        format="DD.MM.YYYY"
        slots={{
          textField: (params) => (
            <TextField
              {...params}
              size="small"
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  readOnly: true,
                  value: weekNumber ? `Неделя ${weekNumber}` : "",
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                },
              }}
            />
          ),
        }}
      />
    </LocalizationProvider>
  );
}
