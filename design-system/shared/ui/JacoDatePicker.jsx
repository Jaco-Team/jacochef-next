import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseIcon from "@mui/icons-material/Close";
import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ruRU } from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { uiColors, uiRadii, uiShadows, uiStateColors, uiTypography } from "../tokens";

dayjs.locale("ru");

const ruLocaleText = {
  ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
  okButtonLabel: "Выбрать",
};

const calendarPaperSx = {
  border: `1px solid ${uiColors.border}`,
  borderRadius: uiRadii.md,
  boxShadow: uiShadows.overlay,
  overflow: "hidden",
  "& .MuiPickersLayout-root": {
    color: uiColors.textStrong,
    backgroundColor: uiColors.surface,
  },
  "& .MuiPickersCalendarHeader-root": {
    px: 2,
    mt: 1.5,
    mb: 1,
  },
  "& .MuiPickersCalendarHeader-label": {
    ...uiTypography.bodyMedium,
    color: uiColors.textStrong,
    textTransform: "capitalize",
  },
  "& .MuiPickersArrowSwitcher-button, & .MuiPickersCalendarHeader-switchViewButton": {
    color: uiColors.textMuted,
    borderRadius: uiRadii.sm,
    "&:hover": {
      backgroundColor: uiStateColors.hover,
    },
  },
  "& .MuiDayCalendar-weekDayLabel": {
    color: uiColors.textMuted,
    fontWeight: 500,
  },
  "& .MuiPickerDay-root": {
    color: uiColors.textStrong,
    borderRadius: uiRadii.sm,
    "&:hover": {
      backgroundColor: uiColors.primarySoft,
    },
    "&.Mui-selected": {
      color: uiColors.surface,
      backgroundColor: uiColors.primary,
      "&:hover, &:focus": {
        backgroundColor: uiColors.primaryHover,
      },
    },
    "&.MuiPickerDay-today": {
      borderColor: uiColors.primary,
    },
    "&.Mui-disabled": {
      color: uiColors.textSubtle,
    },
  },
};

const actionBarSx = {
  gap: 1,
  px: 2,
  py: 1.5,
  borderTop: `1px solid ${uiColors.borderLight}`,
  "& .MuiButton-root": {
    minWidth: 88,
    minHeight: 36,
    px: 2,
    borderRadius: uiRadii.sm,
    textTransform: "none",
    fontWeight: 500,
  },
  "& .MuiButton-root:not(:last-of-type)": {
    color: uiColors.text,
    border: `1px solid ${uiColors.border}`,
    backgroundColor: uiColors.surface,
    "&:hover": {
      borderColor: uiColors.border,
      backgroundColor: uiStateColors.hover,
    },
  },
  "& .MuiButton-root:last-of-type": {
    color: uiColors.surface,
    backgroundColor: uiColors.primary,
    "&:hover": {
      backgroundColor: uiColors.primaryHover,
    },
  },
};

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
        localeText={ruLocaleText}
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
                  borderRadius: uiRadii.md,
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
              sx: {
                ...actionBarSx,
                ...slotProps?.actionBar?.sx,
              },
            },
            desktopPaper: {
              ...slotProps?.desktopPaper,
              sx: {
                ...calendarPaperSx,
                ...slotProps?.desktopPaper?.sx,
              },
            },
            mobilePaper: {
              ...slotProps?.mobilePaper,
              sx: {
                ...calendarPaperSx,
                ...slotProps?.mobilePaper?.sx,
              },
            },
          }}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
