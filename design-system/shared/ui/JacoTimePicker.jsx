import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { uiColors, uiRadii, uiStateColors, uiTypography } from "../tokens";

function normalizeTimeValue(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  return digits;
}

export default function JacoTimePicker({
  value,
  onChange,
  func,
  onBlur,
  sx,
  inputProps,
  slotProps,
  ...props
}) {
  const controlledChange = onChange ?? func;
  const [localValue, setLocalValue] = useState(normalizeTimeValue(value));

  useEffect(() => {
    if (controlledChange) {
      setLocalValue(normalizeTimeValue(value));
    }
  }, [controlledChange, value]);

  const handleChange = (event) => {
    const nextValue = normalizeTimeValue(event.target.value);
    event.target.value = nextValue;
    setLocalValue(nextValue);
    controlledChange?.(event);
  };

  const handleBlur = (event) => {
    if (!controlledChange) {
      setLocalValue("");
    }
    onBlur?.(event);
  };

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      value={controlledChange ? normalizeTimeValue(value) : localValue}
      onChange={handleChange}
      onBlur={onBlur ? handleBlur : undefined}
      placeholder="00:00"
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: 44,
          borderRadius: uiRadii.lg,
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
        "& .MuiInputBase-input": {
          ...uiTypography.body,
        },
        ...sx,
      }}
      slotProps={{
        ...slotProps,
        htmlInput: {
          inputMode: "numeric",
          maxLength: 5,
          pattern: "[0-9]{2}:[0-9]{2}",
          ...(inputProps || {}),
          ...slotProps?.htmlInput,
        },
        inputLabel: {
          shrink: true,
          ...slotProps?.inputLabel,
        },
      }}
    />
  );
}
