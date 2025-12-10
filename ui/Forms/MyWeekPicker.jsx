"use client";

import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

function getIsoWeek(date) {
  if (!date) return null;
  const d = new Date(date.year(), date.month(), date.date());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function MyWeekPicker({ value, onChange }) {
  const [internalDate, setInternalDate] = useState(value ? dayjs(value) : null);

  const weekNumber = internalDate ? getIsoWeek(internalDate) : null;
  const displayText = weekNumber ? `Неделя ${weekNumber}` : "";

  const handleSelect = (newDate) => {
    if (!newDate) return;

    const monday = newDate.startOf("week").add(1, "day");
    onChange({
      weekStart: monday.format("YYYY-MM-DD"),
      weekEnd: monday.add(6, "day").format("YYYY-MM-DD"),
      weekNumber: getIsoWeek(newDate),
    });

    setInternalDate(newDate);
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <Box position="relative">
        {/* real field — invisible but functional */}
        <DatePicker
          value={internalDate}
          onChange={handleSelect}
          views={["month", "day"]}
          displayWeekNumber
          enableAccessibleFieldDOMStructure={false}
          format="DD.MM.YYYY"
          slotProps={{
            textField: {
              size: "small",
              sx: {
                "& .MuiInputBase-input": {
                  opacity: 0, // <-- hide actual text
                },
                "& .MuiInputBase-root": {
                  height: 40,
                },
              },
              inputProps: {
                readOnly: true,
              },
            },
          }}
        />

        {/* visible fake value */}
        <Box
          pointerEvents="none"
          position="absolute"
          left={14}
          top={10}
          fontSize="1rem"
          color="text.primary"
        >
          {displayText}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
