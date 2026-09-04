import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseIcon from "@mui/icons-material/Close";
import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { uiColors, uiRadii, uiStateColors, uiTypography } from "../tokens";

dayjs.locale("ru");

function toDayjs(value) {
  if (!value) {
    return null;
  }
  return dayjs.isDayjs(value) ? value : dayjs(value);
}

export default function JacoDatePicker({
  value,
  onChange,
  func,
  format = "YYYY-MM-DD",
  minDate,
  maxDate,
  clearable,
  customActions,
  customRI,
  InputLabelProps,
  slots,
  slotProps,
  sx,
  ...props
}) {
  return (
    <NoSsr>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <DatePicker
          {...props}
          format={format}
          minDate={toDayjs(minDate)}
          maxDate={toDayjs(maxDate)}
          value={toDayjs(value)}
          onChange={onChange ?? func}
          slots={{
            ...slots,
            openPickerIcon:
              slots?.openPickerIcon ??
              (customRI === "journal" ? CalendarMonthRoundedIcon : undefined),
            clearIcon: slots?.clearIcon ?? CloseIcon,
          }}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
              required: Boolean(props.required),
              size: "small",
              ...slotProps?.textField,
              slotProps: {
                ...slotProps?.textField?.slotProps,
                inputLabel: {
                  ...InputLabelProps,
                  ...slotProps?.textField?.slotProps?.inputLabel,
                },
              },
              sx: {
                "& .MuiPickersOutlinedInput-root": {
                  minHeight: 44,
                  borderRadius: customRI === "journal" ? uiRadii.md : uiRadii.lg,
                  backgroundColor: props.disabled
                    ? uiStateColors.disabledSurface
                    : uiColors.surface,
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
                "& .MuiInputLabel-root": {
                  ...uiTypography.label,
                  color: uiColors.textMuted,
                  "&.Mui-focused": {
                    color: uiColors.primary,
                  },
                },
                ...sx,
                ...slotProps?.textField?.sx,
              },
            },
            field: {
              clearable,
              ...slotProps?.field,
            },
            actionBar: {
              actions: customActions ? ["clear", "accept"] : ["cancel", "accept"],
              ...slotProps?.actionBar,
            },
          }}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
