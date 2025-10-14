"use client";

import { Autocomplete, NoSsr, Stack, TextField } from "@mui/material";

export function MyAutocomplite(props) {
  return (
    <NoSsr>
      <Stack spacing={3}>
        <Autocomplete
          size="small"
          disableCloseOnSelect={
            props.disableCloseOnSelect ?? (props.multiple === false ? false : true)
          }
          // freeSolo
          // multiple={true}
          disabled={props.disabled || props.disabled === true ? true : false}
          id={props.id ?? null}
          options={props.data ?? []}
          getOptionLabel={(option) => option?.name || ""}
          disableClearable={props.disableClearable}
          getOptionKey={props.getOptionKey}
          value={props.value}
          onChange={props.func}
          autoFocus={props.autoFocus}
    			// disableAutoFocus={props.disableAutoFocus}
          onBlur={props.onBlur || undefined}
          filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          isOptionEqualToValue={
            props.isOptionEqualToValue ||
            ((option, value) => parseInt(option?.id) === parseInt(value?.id))
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
          renderOption={(props, option) => (
            <li
              {...props}
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
