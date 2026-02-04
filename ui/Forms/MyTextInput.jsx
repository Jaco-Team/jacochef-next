"use client";

import { InputAdornment, TextField } from "@mui/material";
import { isValidElement } from "react";

export function MyTextInput(props) {
  const {
    value,
    func,
    type = "text",
    min,
    max,
    step,
    inputProps,
    slotProps,
    isTimeMask,
    InputAdornment: legacyInputAdornment = null, // legacy hack
    inputAdornment,
    rows,
    minRows,
    maxRows,
    multiline,
    customRI,
    ...rest
  } = props;

  const isNumber = type === "number";
  const isMultiline = Boolean(multiline || rows || minRows || maxRows);

  const handleSimpleTimeMask = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 4) input = input.slice(0, 4);

    if (input.length >= 3) {
      input = input.slice(0, 2) + ":" + input.slice(2);
    }

    e.target.value = input;
    if (func) func(e);
  };

  const journalStyles =
    customRI === "journal"
      ? {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            border: "1px solid #E5E5E5",
            color: "#BABABA",
            backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
            "&:hover": {
              backgroundColor: props.disabled ? "#F5F5F5" : "#FFFFFF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E5E5",
              },
            },
            "& .MuiOutlinedInput-input": {
              borderRadius: "12px",
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
              borderRadius: "12px",
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            display: "none",
          },
        }
      : {};

  // TODO: find all adornments, use slotProps.input AS IN DOCS https://mui.com/material-ui/react-text-field/
  const rawEndAdornment =
    (inputAdornment && typeof inputAdornment === "object") || legacyInputAdornment?.endAdornment
      ? (inputAdornment?.endAdornment ?? legacyInputAdornment?.endAdornment ?? inputAdornment)
      : inputAdornment;

  let endAdornment = rest?.endAdornment;

  if (isValidElement(rawEndAdornment)) {
    if (rawEndAdornment.type === InputAdornment) {
      endAdornment = rawEndAdornment;
    } else {
      endAdornment = <InputAdornment position="end">{rawEndAdornment}</InputAdornment>;
    }
  }
  const rawStartAdornment =
    legacyInputAdornment?.startAdornment || inputAdornment?.startAdornment
      ? (inputAdornment?.startAdornment ?? legacyInputAdornment?.startAdornment)
      : null;

  let startAdornment = rest?.startAdornment;

  if (isValidElement(rawStartAdornment)) {
    if (rawStartAdornment.type === InputAdornment) {
      startAdornment = rawStartAdornment;
    } else {
      startAdornment = (
        <InputAdornment
          position="start"
          sx={{ mr: -1 }}
        >
          {rawStartAdornment}
        </InputAdornment>
      );
    }
  }
  //

  return (
    <TextField
      size="small"
      {...rest}
      onChange={isTimeMask ? handleSimpleTimeMask : func}
      value={value ?? ""}
      type={type}
      multiline={isMultiline}
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      inputProps={isTimeMask ? { maxLength: 5, ...inputProps } : inputProps}
      sx={{
        width: "100%",
        ...journalStyles,
        ...(rest.sx || {}),
      }}
      slotProps={{
        htmlInput: isNumber ? { min, max, step, ...(inputProps || {}) } : inputProps,
        input: {
          startAdornment: startAdornment || null,
          endAdornment: endAdornment || null,
        },
        ...slotProps,
      }}
    />
  );
}
