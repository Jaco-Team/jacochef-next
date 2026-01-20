"use client";

import { Autocomplete, NoSsr, Stack, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";

export function MyAutocomplite(props) {
  return (
    <NoSsr>
      <Stack spacing={3}>
        <Autocomplete
          size="small"
          disableCloseOnSelect={
            props.disableCloseOnSelect ?? (props.multiple === false ? false : true)
          }
          style={props.style}
          // freeSolo
          // multiple={true}
          disabled={props.disabled || props.disabled === true ? true : false}
          id={props.id ?? null}
          options={props.data ?? []}
          getOptionLabel={(option) => option?.name || ""}
          disableClearable={props.disableClearable}
          getOptionKey={props.getOptionKey}
          value={props.value ?? (props.multiple ? [] : null)}
          onChange={props.func}
          onFocus={props.onFocus}
          autoFocus={props.autoFocus}
          disabledItemsFocusable={props.disabledItemsFocusable}
          //disableAutoFocus={props.disableAutoFocus}
          blurOnSelect={props.blurOnSelect}
          onBlur={props.onBlur || undefined}
          filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          isOptionEqualToValue={
            props.isOptionEqualToValue ||
            ((option, value) => parseInt(option?.id) === parseInt(value?.id))
          }
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={option.name}
                size="small"
                sx={{
                  color: props.disabled ? "rgba(0, 0, 0, 0.38)" : undefined,
                  "&.Mui-disabled": {
                    backgroundColor: props.disabled ? "rgba(0, 0, 0, 0.08) !important" : undefined,
                  },
                  "& .MuiChip-deleteIcon": {
                    color: props.disabled ? "rgba(0, 0, 0, 0.26)" : undefined,
                  },
                }}
              />
            ))
          }
          renderInput={
            props.renderInput ||
            ((params) => (
              <TextField
                {...params}
                label={props.label}
                placeholder={props.placeholder}
              />
            ))
          }
          renderOption={(params, option) => (
            <li
              {...params}
              key={props.optionKey ? option[`${props.optionKey}`] : option.id}
            >
              {option.name}
            </li>
          )}
        />
      </Stack>
    </NoSsr>
  );
}
