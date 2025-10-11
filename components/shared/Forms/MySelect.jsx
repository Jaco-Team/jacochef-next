"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export function MySelect(props) {
  return (
    <FormControl
      fullWidth
      variant="outlined"
      size="small"
      style={props.style}
    >
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={props.data?.length > 0 ? props.value || '' : ''}
        label={props.label}
        disabled={props.disabled || props.disabled === true ? true : false}
        onChange={props.func}
        multiple={props.multiple && props.multiple === true ? true : false}
        //style={{ zIndex: 9999 }}
      >
        {props.is_none === false ? null : (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}

        {props.data?.map((item, key) => (
          <MenuItem
            key={key}
            value={item.id}
            style={{ color: item?.color ? item.color : null, zIndex: 9999 }}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
