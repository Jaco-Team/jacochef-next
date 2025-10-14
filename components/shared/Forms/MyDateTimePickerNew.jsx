"use client";

import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export function MyDateTimePickerNew(props) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <DateTimePicker
        multiple={true}
        views={["year", "month", "day", "hours", "minutes"]}
        mask="____-__-__ __:__"
        format="YYYY-MM-DD HH:mm"
        minDate={props.minDate ? props.minDate : null}
        label={props.label}
        value={props.value}
        disabled={props.disabled || props.disabled === true ? true : false}
        //onChange={props.func}
        onBlur={props.onBlur ? props.onBlur : null}
        onAccept={props.func} // <-- Изменения применяются только при нажатии "OK"
        className={"datePicker"}
        slotProps={{
          textField: { size: "small" },
        }}
        //renderInput={(params) => <TextField variant="outlined" size={'small'} color='primary' style={{ width: '100%' }} {...params} />}
      />
    </LocalizationProvider>
  );
}
