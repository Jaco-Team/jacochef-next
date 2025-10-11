"use client";

import { TextField } from "@mui/material";

export function MyTextInput(props) {
  return (
    <TextField
      id={props.id ? props.id : null}
      label={props.label}
      value={props.value}
      onChange={props.func}
      onBlur={props.onBlur ? props.onBlur : null}
      disabled={props.disabled || props.disabled === true ? true : false}
      variant="outlined"
      size={"small"}
      color="primary"
      multiline={props.multiline ? props.multiline : false}
      maxRows={props.maxRows || 1}
      type={props.type || "text"}
      min={props.min || 0}
      style={{ width: "100%" }}
      onKeyUp={props.enter}
      InputProps={props.inputAdornment}
      inputProps={{ tabIndex: props.tabindex, ...(props.inputProps || {}) }}
      className={props.className}
      onWheel={props.onWheel ? props.onWheel : null}
    />
  );
}
