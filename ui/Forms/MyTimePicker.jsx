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
      id={props.id ?? undefined}
      label={props.label}
      variant="outlined"
      size="small"
      color="primary"
      type="time"
      disabled={props.disabled}
      value={props.func ? (props.value ?? "") : thisVal}
      sx={{ width: "100%" }}
      onChange={props.func ? props.func : onChange}
      onBlur={props.onBlur ? onBlur : undefined}
      step={600}
      slotProps={{
        input: {
          step: 600,
          ...(props.inputProps || {}),
        },
        inputLabel: {
          shrink: true,
        },
      }}
    />
  );
}
