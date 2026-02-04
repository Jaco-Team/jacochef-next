"use client";

import { NoSsr } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import CloseIcon from "@mui/icons-material/Close";
import * as PropTypes from "prop-types";
dayjs.locale("ru");

function EventIcon(props) {
  return (
    <svg
      width="17"
      height="19"
      viewBox="0 0 17 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // передаем все пропсы дальше
    >
      <path
        d="M5.5 13.2917C4.85833 13.2917 4.31597 13.0701 3.87292 12.6271C3.42986 12.184 3.20833 11.6417 3.20833 11C3.20833 10.3583 3.42986 9.81597 3.87292 9.37292C4.31597 8.92986 4.85833 8.70833 5.5 8.70833C6.14167 8.70833 6.68403 8.92986 7.12708 9.37292C7.57014 9.81597 7.79167 10.3583 7.79167 11C7.79167 11.6417 7.57014 12.184 7.12708 12.6271C6.68403 13.0701 6.14167 13.2917 5.5 13.2917ZM1.83333 18.3333C1.32917 18.3333 0.89757 18.1538 0.538542 17.7948C0.179514 17.4358 0 17.0042 0 16.5V3.66667C0 3.1625 0.179514 2.7309 0.538542 2.37188C0.89757 2.01285 1.32917 1.83333 1.83333 1.83333H2.75V0H4.58333V1.83333H11.9167V0H13.75V1.83333H14.6667C15.1708 1.83333 15.6024 2.01285 15.9615 2.37188C16.3205 2.7309 16.5 3.1625 16.5 3.66667V16.5C16.5 17.0042 16.3205 17.4358 15.9615 17.7948C15.6024 18.1538 15.1708 18.3333 14.6667 18.3333H1.83333ZM1.83333 16.5H14.6667V7.33333H1.83333V16.5Z"
        fill="#A6A6A6"
      />
    </svg>
  );
}

EventIcon.propTypes = { sx: PropTypes.shape({ color: PropTypes.string }) };
export function MyDatePickerNew(props) {
  const customStylesRenderInput = {
    journal: {
      "&.MuiFormControl-root": {
        backgroundColor: "#fff !important",
        borderRadius: "12px",
        border: "1px solid #E5E5E5",
      },

      "& input": {
        padding: "10px 12px",
      },
      "& input::placeholder": {
        color: "#b8b8b8",
        opacity: 1,
      },
      "& .MuiPickersOutlinedInput-root": {
        borderRadius: "12px",
        color: "#666666",
        "& fieldset": {
          border: "none !important",
        },
      },
      "& .MuiInputLabel-root": {
        color: "#666666",
        backgroundColor: "#fff",
        paddingInline: "12px",
        borderRadius: "4px 4px 0 0",
        "&.Mui-focused": {
          color: "#A6A6A6",
        },
        "&.Mui-disabled": {
          color: "rgba(0, 0, 0, 0.38)",
        },
      },
    },
  };
  return (
    <NoSsr>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <DatePicker
          format={props.format ?? "YYYY-MM-DD"}
          minDate={props.minDate ? props.minDate : null}
          maxDate={props.maxDate ? props.maxDate : null}
          label={props.label}
          value={props.value ? dayjs(props.value) : null}
          disabled={!!props.disabled}
          onChange={props.func}
          slots={{
            openPickerIcon: props.customRI === "journal" ? EventIcon : undefined,
            clearIcon: props.customRI === "journal" ? CloseIcon : undefined,
          }}
          onBlur={props.onBlur ?? undefined}
          slotProps={{
            textField: {
              fullWidth: true,
              size: "small",
              sx: props.customRI ? customStylesRenderInput[props.customRI] : {},
            },

            field: { clearable: props.clearable },
            actionBar: {
              actions: props.customActions ? ["clear", "accept"] : ["cancel", "accept"],
            },
          }}
        />
      </LocalizationProvider>
    </NoSsr>
  );
}
