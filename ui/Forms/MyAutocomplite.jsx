"use client";

import { Autocomplete, NoSsr, Stack, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export function MyAutocomplite(props) {
  const customStylesRenderInput = {
    journal: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        border: "1px solid #E5E5E5",
        color: "#666666",
        backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
        "&:hover": {
          backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E5E5",
          },
        },
        "&.Mui-focused": {
          color: "#666666",
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E5E5",
            borderWidth: "2px",
          },
        },
        "&.Mui-disabled": {
          backgroundColor: "#F5F5F5",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
      "& .MuiInputLabel-root": {
        color: "#666666",
        backgroundColor: "#fff",
        paddingInline: "12px",
        borderRadius: "12px",
        "&.Mui-focused": {
          color: "#A6A6A6",
        },
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
        },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        display: "none",
      },
    },
  };
  return (
    <NoSsr>
      <Stack spacing={3}>
        <Autocomplete
          size="small"
          clearIcon={
            props.customRI === "journal" ? (
              <CloseIcon
                fontSize="small"
                style={{ color: "#BABABA" }}
              />
            ) : undefined
          }
          popupIcon={
            props.customRI === "journal" ? (
              <KeyboardArrowDownIcon style={{ color: "#BABABA" }} />
            ) : undefined
          }
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
                sx={props.customRI ? customStylesRenderInput[props.customRI] : {}}
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
