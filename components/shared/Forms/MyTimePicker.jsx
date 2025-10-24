"use client";

import { TextField } from "@mui/material";
import { useState } from "react";

const inputProps = {
  step: 600,
};

export function MyTimePicker(props) {
  const [thisVal, setThisVal] = useState(props.value);

  const onChange = (event) => {
    setThisVal(event.target.value);
  };

  const onBlur = () => {
    setThisVal("");
    props.onBlur();
  };

  return (
    <TextField
      variant="outlined"
      size="small"
      color="primary"
      label={props.label}
      type="time"
      disabled={props.disabled}
      id={props.id ? props.id : null}
      value={props.func ? props.value : thisVal}
      style={{ width: "100%" }}
      onChange={props.func ? props.func : onChange}
      onBlur={props.onBlur ? onBlur : null}
      InputLabelProps={{
        shrink: true,
      }}
      step={600}
      inputProps={inputProps}
    />
  );
}
