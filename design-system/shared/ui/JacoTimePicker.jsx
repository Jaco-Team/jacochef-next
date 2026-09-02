import { NoSsr, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
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

function toPickerValue(value) {
  const parsed = dayjs(`2026-01-01T${normalizeTimeValue(value) || "00:00"}`);
  return parsed.isValid() ? parsed : null;
}

export default function JacoTimePicker({
  value,
  onChange,
  func,
  onBlur,
  sx,
  inputProps,
  slotProps,
  picker = false,
  pickerFormat = "HH:mm",
  ampm = false,
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

  if (picker) {
    return (
      <NoSsr>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="ru"
        >
          <TimePicker
            {...props}
            ampm={ampm}
            format={pickerFormat}
            value={toPickerValue(value)}
            onChange={(nextValue) =>
              controlledChange?.(nextValue?.isValid?.() ? nextValue.format("HH:mm") : "")
            }
            slotProps={{
              ...slotProps,
              textField: {
                fullWidth: true,
                size: "small",
                ...slotProps?.textField,
                sx: {
                  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
                    minHeight: 44,
                    borderRadius: uiRadii.lg,
                    backgroundColor: props.disabled
                      ? uiStateColors.disabledSurface
                      : uiColors.surface,
                  },
                  "& .MuiInputBase-input": uiTypography.body,
                  ...sx,
                  ...slotProps?.textField?.sx,
                },
              },
            }}
          />
        </LocalizationProvider>
      </NoSsr>
    );
  }

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
