import { useState } from "react";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import {
  JacoAutocomplete,
  JacoCityCafe,
  JacoDatePicker,
  JacoSelect,
  JacoTextInput,
  JacoTimePicker,
} from "@/design-system/shared/ui";

const meta = {
  title: "Chef Design System/Shared UI/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "Переиспользуемые form controls из design-system/shared/ui. Новые формы должны начинаться с этих Jaco* компонентов и расширять story при появлении нового состояния.",
      },
    },
  },
};

export default meta;

const cafes = [
  { id: 1, name: "Самара, Ленинградская" },
  { id: 2, name: "Самара, Ново-Садовая" },
  { id: 3, name: "Тольятти, Центральная" },
];

function StorySurface({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
      <Stack
        spacing={2}
        sx={{ width: 520, maxWidth: "100%" }}
      >
        {children}
      </Stack>
    </Box>
  );
}

export function BasicFormControls() {
  const [text, setText] = useState("Иванов Иван");
  const [hours, setHours] = useState("8");
  const [cafe, setCafe] = useState("1");
  const [autocomplete, setAutocomplete] = useState(cafes[0]);
  const [date, setDate] = useState(dayjs("2026-08-31"));
  const [time, setTime] = useState("09:00");

  return (
    <StorySurface>
      <JacoTextInput
        label="Сотрудник"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <JacoTextInput
        label="Часы"
        type="number"
        value={hours}
        onChange={(event) => setHours(event.target.value)}
        inputProps={{ min: 0, max: 24 }}
      />
      <JacoSelect
        label="Кафе"
        value={cafe}
        onChange={(event) => setCafe(event.target.value)}
        options={cafes}
        allowNone={false}
      />
      <JacoAutocomplete
        label="Кафе с поиском"
        value={autocomplete}
        onChange={(_event, value) => setAutocomplete(value)}
        options={cafes}
      />
      <JacoDatePicker
        label="Дата смены"
        value={date}
        onChange={(value) => setDate(value)}
        slots={{ openPickerIcon: CalendarMonthRoundedIcon }}
      />
      <JacoTimePicker
        label="Начало"
        value={time}
        onChange={(event) => setTime(event.target.value)}
      />
    </StorySurface>
  );
}

export function FormStates() {
  return (
    <StorySurface>
      <Typography sx={{ fontWeight: 700 }}>States</Typography>
      <JacoTextInput
        label="Ошибка"
        value="25"
        error
        helperText="Значение должно быть от 0 до 24"
      />
      <JacoTextInput
        label="Disabled"
        value="Недоступное поле"
        disabled
      />
      <JacoTextInput
        label="Комментарий"
        value="Нужна замена смены после 18:00"
        multiline
        minRows={3}
      />
      <JacoSelect
        label="Disabled select"
        value="1"
        options={cafes}
        disabled
        allowNone={false}
      />
      <JacoAutocomplete
        label="С поиском"
        placeholder="Введите кафе"
        options={cafes}
      />
    </StorySurface>
  );
}

export function CityCafeSelection() {
  const [selectedCafes, setSelectedCafes] = useState([cafes[0]]);

  return (
    <StorySurface>
      <JacoCityCafe
        points={cafes.map((cafe) => ({
          ...cafe,
          city_id: cafe.name.startsWith("Самара") ? 2 : 1,
          organization: "Jaco",
        }))}
        value={selectedCafes}
        onChange={setSelectedCafes}
        label="Кафе"
        placeholder="Выберите кафе"
        withOrganizationMode={false}
        compact
      />
    </StorySurface>
  );
}
