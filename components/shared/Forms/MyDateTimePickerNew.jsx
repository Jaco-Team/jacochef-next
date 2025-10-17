"use client";

import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function MyDateTimePickerNew(props) {
  const [localValue, setLocalValue] = useState(props.value ? dayjs(props.value) : null);
  useEffect(() => {
    setLocalValue(props.value ? dayjs(props.value) : null);
  }, [props.value]);
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <DateTimePicker
        views={["year", "month", "day", "hours", "minutes"]}
        format="YYYY-MM-DD HH:mm"
        minDate={props.minDate ? props.minDate : null}
        label={props.label}
        value={localValue}
        disabled={props.disabled || props.disabled === true ? true : false}
        onChange={(v) => setLocalValue(v ? dayjs(v) : null)}
        onBlur={props.onBlur ? props.onBlur : null}
        onAccept={(v) => props.func(v ? dayjs(v) : null)} // <-- Изменения применяются только при нажатии "OK"
        className={"datePicker"}
        slotProps={{
          textField: { size: "small" },
        }}
        //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
      />
    </LocalizationProvider>
  );
}
