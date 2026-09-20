import { NoSsr, TextField } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ruRU } from "@mui/x-date-pickers/locales";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useEffect, useState } from "react";

import { uiColors, uiRadii, uiShadows, uiStateColors, uiTypography } from "../tokens";

dayjs.locale("ru");

const ruLocaleText = {
  ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
  cancelButtonLabel: "Отмена",
  okButtonLabel: "Выбрать",
  timePickerToolbarTitle: "Выберите время",
};

const timePickerPaperSx = {
  border: `1px solid ${uiColors.border}`,
  borderRadius: uiRadii.lg,
  boxShadow: uiShadows.overlay,
  overflow: "hidden",
  "& .MuiPickersLayout-root": {
    color: uiColors.textStrong,
    backgroundColor: uiColors.surface,
  },
  "& .MuiClock-pin, & .MuiClockPointer-root": {
    backgroundColor: uiColors.primary,
  },
  "& .MuiClockPointer-thumb": {
    borderColor: uiColors.primary,
  },
  "& .MuiClockNumber-root.Mui-selected": {
    color: "#FFFFFF",
    backgroundColor: uiColors.primary,
  },
  "& .MuiPickersActionBar-root": {
    gap: 1,
    px: 2,
    pb: 2,
  },
  "& .MuiPickersActionBar-root .MuiButton-root": {
    minHeight: 40,
    px: 2,
    borderRadius: uiRadii.md,
    textTransform: "none",
    fontWeight: 500,
  },
};

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
  const normalizedValue = normalizeTimeValue(value);

  if (!/^\d{2}:\d{2}$/.test(normalizedValue)) {
    return null;
  }

  const parsed = dayjs(`2026-01-01T${normalizedValue}`);
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
  minutesStep = 10,
  timeSteps,
  viewRenderers,
  views,
  closeOnSelect = false,
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
          localeText={ruLocaleText}
        >
          <TimePicker
            {...props}
            ampm={ampm}
            format={pickerFormat}
            views={views ?? ["hours", "minutes"]}
            minutesStep={minutesStep}
            timeSteps={timeSteps ?? { minutes: minutesStep }}
            viewRenderers={
              viewRenderers ?? {
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }
            }
            closeOnSelect={closeOnSelect}
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
                    borderRadius: uiRadii.md,
                    backgroundColor: props.disabled
                      ? uiStateColors.disabledSurface
                      : uiColors.surface,
                  },
                  "& .MuiInputBase-input": uiTypography.body,
                  ...sx,
                  ...slotProps?.textField?.sx,
                },
              },
              actionBar: {
                actions: ["cancel", "accept"],
                ...slotProps?.actionBar,
              },
              desktopPaper: {
                ...slotProps?.desktopPaper,
                sx: {
                  ...timePickerPaperSx,
                  ...slotProps?.desktopPaper?.sx,
                },
              },
              mobilePaper: {
                ...slotProps?.mobilePaper,
                sx: {
                  ...timePickerPaperSx,
                  ...slotProps?.mobilePaper?.sx,
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
          borderRadius: uiRadii.md,
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
