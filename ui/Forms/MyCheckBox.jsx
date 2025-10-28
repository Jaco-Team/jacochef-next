"use client";

import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

export function MyCheckBox(props) {
  return (
    <FormGroup
      row
      style={props.style ? props.style : {}}
    >
      <FormControlLabel
        control={
          <Checkbox
            disabled={props.disabled || props.disabled === true ? true : false}
            checked={props.value}
            onChange={props.func}
            color="primary"
            size={props.size ? props.size : "medium"}
          />
        }
        label={props.label}
      />
    </FormGroup>
  );
}
