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
  JacoTimeRangePicker,
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

export function FreeSoloSuggestions() {
  const [temperature, setTemperature] = useState("");

  return (
    <StorySurface>
      <JacoAutocomplete
        freeSolo
        forcePopupIcon
        clearOnBlur={false}
        options={["36,0", "36,6", "37,0"]}
        value={temperature}
        inputValue={temperature}
        onChange={(_event, value) => setTemperature(value ?? "")}
        onInputChange={(_event, value) => setTemperature(value)}
        label="Температура"
        placeholder="Введите или выберите"
      />
    </StorySurface>
  );
}

export function UnifiedSelectPopup() {
  const [month, setMonth] = useState("2026-09");

  return (
    <StorySurface>
      <JacoSelect
        label="Месяц"
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        options={[
          { id: "2026-08", name: "Август 2026" },
          { id: "2026-09", name: "Сентябрь 2026" },
          { id: "2026-10", name: "Октябрь 2026" },
        ]}
        allowNone={false}
        defaultOpen
      />
    </StorySurface>
  );
}

export function EmptySelectPlaceholder() {
  const [hours, setHours] = useState("");

  return (
    <StorySurface>
      <JacoSelect
        label="Часы"
        value={hours}
        onChange={(event) => setHours(event.target.value)}
        options={[
          { id: "1", name: "10:00 - 22:00" },
          { id: "2", name: "10:00 - 16:00" },
        ]}
        allowNone={false}
      />
    </StorySurface>
  );
}

export function UnifiedDatePickerPopup() {
  const [date, setDate] = useState(dayjs("2026-09-16"));

  return (
    <StorySurface>
      <JacoDatePicker
        label="Дата"
        format="DD.MM.YYYY"
        value={date}
        onChange={setDate}
        open
        onClose={() => {}}
      />
    </StorySurface>
  );
}

export function PopupTimePicker() {
  const [time, setTime] = useState("09:00");

  return (
    <StorySurface>
      <JacoTimePicker
        picker
        label="Время начала работы"
        value={time}
        onChange={setTime}
      />
      <JacoTimePicker
        picker
        label="Недоступное время"
        value="18:00"
        disabled
      />
    </StorySurface>
  );
}

export function WorkTimeRange() {
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("22:00");

  return (
    <StorySurface>
      <Typography sx={{ fontWeight: 700 }}>Рабочее время сотрудника</Typography>
      <JacoTimeRangePicker
        startValue={start}
        endValue={end}
        onStartChange={setStart}
        onEndChange={setEnd}
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
