"use client";

import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export function MyDatePicker(props) {
  return (
    <NoSsr>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <DatePicker
          format={props.format ?? "YYYY-MM-DD"}
          label={props.label}
          value={props.value ? dayjs(props.value) : null}
          onChange={props.func}
          minDate={props.minDate ? dayjs(props.minDate) : undefined}
          maxDate={props.maxDate ? dayjs(props.maxDate) : undefined}
          disabled={!!props.disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: props.sx || {},
            },
            actionBar: {
              actions: props.customActions ? ["clear", "accept"] : ["cancel", "accept"],
            },
            field: { clearable: props.clearable },
          }}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
