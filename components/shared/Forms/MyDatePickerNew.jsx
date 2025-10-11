"use client";

import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale('ru');

export function MyDatePickerNew(props) {

    return (
      <NoSsr>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <DatePicker
            multiple={true}
            //mask="____-__-__"
            //format="YYYY-MM-DD"
            format={ props.format ?? "YYYY-MM-DD" }
            minDate={ props.minDate ? props.minDate : null }
            label={props.label}
            value={props.value ? dayjs(props.value) : null}
            disabled={ props.disabled || props.disabled === true ? true : false }
            onChange={props.func}
            onBlur={props.onBlur ? props.onBlur : null}
            className={'datePicker'}
            slotProps={{
              textField: { size: "small" },
              field: { clearable: props.clearable },
              actionBar: {
                actions: props.customActions ? ["clear", "accept"] : ["cancel", "accept"],
              },
            }}
            //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
          />
        </LocalizationProvider>
      </NoSsr>
    )
}
