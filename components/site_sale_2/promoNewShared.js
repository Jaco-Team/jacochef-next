import React, { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";
import { MyDatePickerNew } from "@/ui/Forms";

export function formatDateName(date) {
  const d = new Date(date);
  const month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();

  if (day.length < 2) day = "0" + day;

  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  return [day, months[parseInt(month, 10) - 1]].join(" ");
}

function normalizeDate(value) {
  const source = value?.toDate ? value.toDate() : value;
  const parsed = dayjs(source);

  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}

export function PromoExcludeDatePicker({ label, value = [], func, disabled }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const dates = value.map(normalizeDate).filter(Boolean);

  const addDate = (date) => {
    const normalizedDate = normalizeDate(date);

    if (normalizedDate && !dates.includes(normalizedDate)) {
      func([...dates, normalizedDate].sort());
    }

    setSelectedDate(null);
  };

  const removeDate = (dateToRemove) => {
    func(dates.filter((date) => date !== dateToRemove));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        width: "100%",
      }}
    >
      <Box sx={{ width: { xs: "100%", sm: 240 }, flexShrink: 0 }}>
        <MyDatePickerNew
          label={label}
          value={selectedDate}
          func={addDate}
          disabled={disabled}
          clearable
        />
      </Box>

      {dates.length ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 1, flex: 1, minWidth: 0 }}
        >
          {dates.map((date) => (
            <Chip
              key={date}
              label={dayjs(date).format("DD.MM.YYYY")}
              onDelete={disabled ? undefined : () => removeDate(date)}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
