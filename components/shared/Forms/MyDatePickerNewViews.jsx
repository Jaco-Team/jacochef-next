"use client";

import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export function MyDatePickerNewViews(props) {
  return (
    <NoSsr>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <DatePicker
          className={"datePicker"}
          //multiple={true}
          //mask="____-__"
          //inputFormat="yyyy-MM"
          minDate={props.minDate ? props.minDate : null}
          label={props.label}
          value={dayjs(props.value)}
          views={props.views}
          onChange={props.func}
          onBlur={props.onBlur ? props.onBlur : null}
          slotProps={{
            textField: {
              size: "small",
              sx: {
                "& .MuiInputBase-root": {
                  height: 40,
                },
              },
            },
          }}

          //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
