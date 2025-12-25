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
    InputAdornment: legacyInputAdornment = null, // legacy hack
    inputAdornment,
    rows,
    minRows,
    maxRows,
    multiline,
    ...rest
  } = props;

  const isNumber = type === "number";
  const isMultiline = Boolean(multiline || rows || minRows || maxRows);

  // это костыль для легаси
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
      value={value ?? ""}
      onChange={func}
      type={type}
      multiline={isMultiline}
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      sx={{ width: "100%", ...(rest.sx || {}) }}
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
