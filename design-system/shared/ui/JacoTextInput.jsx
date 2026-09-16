import { InputAdornment, TextField } from "@mui/material";
import { isValidElement } from "react";

import { uiColors, uiRadii, uiStateColors, uiTypography } from "../tokens";

function resolveAdornment(adornment, position) {
  if (!isValidElement(adornment)) {
    return null;
  }

  if (adornment.type === InputAdornment) {
    return adornment;
  }

  return <InputAdornment position={position}>{adornment}</InputAdornment>;
}

export default function JacoTextInput({
  value,
  onChange,
  func,
  type = "text",
  min,
  max,
  step,
  inputProps,
  slotProps,
  isTimeMask,
  isDecimalMask,
  decimalScale = 3,
  customRI,
  InputLabelProps,
  InputAdornment: legacyInputAdornment = null,
  inputAdornment,
  rows,
  minRows,
  maxRows,
  multiline,
  sx,
  ...props
}) {
  const isNumber = type === "number";
  const isMultiline = Boolean(multiline || rows || minRows || maxRows);
  const handleChange = onChange ?? func;

  const startAdornment = resolveAdornment(
    legacyInputAdornment?.startAdornment ?? inputAdornment?.startAdornment,
    "start",
  );
  const endAdornment = resolveAdornment(
    inputAdornment?.endAdornment ?? legacyInputAdornment?.endAdornment ?? inputAdornment,
    "end",
  );

  const handleSimpleTimeMask = (event) => {
    let nextValue = event.target.value.replace(/\D/g, "");
    if (nextValue.length > 4) {
      nextValue = nextValue.slice(0, 4);
    }
    if (nextValue.length >= 3) {
      nextValue = `${nextValue.slice(0, 2)}:${nextValue.slice(2)}`;
    }
    event.target.value = nextValue;
    handleChange?.(event);
  };

  const handleDecimalMask = (event) => {
    const safeDecimalScale = Number.isInteger(decimalScale) ? decimalScale : 3;
    let nextValue = event.target.value.replace(/\./g, ",").replace(/[^\d,]/g, "");
    const parts = nextValue.split(",");

    if (parts.length > 2) {
      nextValue = `${parts[0]},${parts.slice(1).join("")}`;
    }
    if (parts.length === 2 && parts[1].length > safeDecimalScale) {
      nextValue = `${parts[0]},${parts[1].slice(0, safeDecimalScale)}`;
    }

    event.target.value = nextValue;
    handleChange?.(event);
  };

  const normalizedValue =
    isDecimalMask && value != null ? String(value).replace(/\./g, ",") : (value ?? "");

  return (
    <TextField
      fullWidth
      size="small"
      {...props}
      value={normalizedValue}
      type={type}
      multiline={isMultiline}
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      onChange={
        isTimeMask ? handleSimpleTimeMask : isDecimalMask ? handleDecimalMask : handleChange
      }
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: 44,
          alignItems: "center",
          borderRadius: customRI === "journal" ? uiRadii.md : uiRadii.lg,
          backgroundColor: props.disabled ? uiStateColors.disabledSurface : uiColors.surface,
          color: uiColors.text,
          "& fieldset": {
            borderColor: uiColors.border,
          },
          "&:hover fieldset": {
            borderColor: uiColors.border,
          },
          "&.Mui-focused fieldset": {
            borderColor: uiColors.primary,
            borderWidth: 1,
          },
        },
        "& input.MuiInputBase-input": {
          ...uiTypography.body,
          py: 0,
          alignSelf: "center",
        },
        "& .MuiInputLabel-root": {
          ...uiTypography.label,
          color: uiColors.textMuted,
          "&.Mui-focused": {
            color: uiColors.primary,
          },
        },
        ...sx,
      }}
      slotProps={{
        htmlInput: isNumber
          ? { min, max, step, ...(inputProps || {}) }
          : isTimeMask
            ? { maxLength: 5, ...(inputProps || {}) }
            : inputProps,
        input: {
          startAdornment,
          endAdornment,
        },
        inputLabel: InputLabelProps,
        ...slotProps,
      }}
    />
  );
}
