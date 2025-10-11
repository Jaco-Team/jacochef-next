"use client";

import { Autocomplete, createFilterOptions, Stack, TextField } from "@mui/material";

const filter = createFilterOptions();

export function MyAutocomplite2(props) {
  if (props.id && props.id == "promoName") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data ?? []}
          getOptionLabel={(option) => option.name}
          value={props.value}
          onChange={props.func}
          //filterSelectedOptions
          disabled={props.disabled && props.disabled === true ? true : false}
          multiple={props.multiple && props.multiple === true ? true : false}
          //isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
            />
          )}
        />
      </Stack>
    );
  }

  // для Управление точкой управляющего
  if (props.id && props.id == "cafe_upr_edit") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          //disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data.map((option) => option.name)}
          value={props.value}
          onChange={props.func}
          filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          disabled={props.disabled && props.disabled === true ? true : false}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
            />
          )}
        />
      </Stack>
    );
  }

  //isOptionEqualToValue

  if (props.name && props.name == "only_choose") {
    return (
      <Stack spacing={3}>
        <Autocomplete
          freeSolo={props.freeSolo ? props.freeSolo : false}
          size="small"
          //disableCloseOnSelect={true}
          onBlur={props.onBlur ? props.onBlur : null}
          id={props.id ?? null}
          options={props.data.map((option) => option.name)}
          value={props.value}
          onChange={props.func}
          //filterSelectedOptions
          multiple={props.multiple && props.multiple === true ? true : false}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            //console.log( 'params', params )
            //console.log( 'filtered', filtered )

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option.name);
            /*if (inputValue !== '' && !isExisting) {
                filtered.push(
                  inputValue
                );
              }*/

            //console.log( 'new filtered', filtered )

            return filtered;
          }}
          disabled={props.disabled && props.disabled === true ? true : false}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={props.placeholder}
            />
          )}
        />
      </Stack>
    );
  }
  return (
    <Stack spacing={3}>
      <Autocomplete
        freeSolo={props.freeSolo ? props.freeSolo : false}
        size="small"
        //disableCloseOnSelect={true}
        onBlur={props.onBlur ? props.onBlur : null}
        id={props.id ?? null}
        options={props.data.map((option) => option.name)}
        value={props.value}
        onChange={props.func}
        //filterSelectedOptions
        multiple={props.multiple && props.multiple === true ? true : false}
        //isOptionEqualToValue={(option, value) => option.id === value.id}

        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          //console.log( 'params', params )
          //console.log( 'filtered', filtered )

          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.name);
          if (inputValue !== "" && !isExisting) {
            filtered.push(inputValue);
          }

          //console.log( 'new filtered', filtered )

          return filtered;
        }}
        disabled={props.disabled && props.disabled === true ? true : false}
        renderInput={(params) => (
          <TextField
            {...params}
            label={props.label}
            placeholder={props.placeholder}
          />
        )}
      />
    </Stack>
  );
}
