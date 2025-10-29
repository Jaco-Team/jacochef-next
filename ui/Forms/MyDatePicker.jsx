"use client";

import { Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export function MyDatePicker(props) {
  return (
    <>
      <Typography>{props.label}</Typography>
      <DatePicker
        format="YYYY-MM-DD"
        multiple
        sort
        //mask="____/__/__"
        //multiple={ props.multiple && props.multiple === true ? true : false }
        //disableCloseOnSelect={true}
        //inputFormat="yyyy-MM-dd"
        style={{ width: "100%" }}
        label={props.label}
        value={props.value}
        onChange={props.func}
      />
    </>
  );
}
