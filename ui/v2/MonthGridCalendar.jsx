import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Box } from "@mui/material";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import V2DatePickerGraph from "./DatePickerGraph";

dayjs.locale("ru");

export default function V2MonthGridCalendar({ monthId, getDayMeta, onDayClick, size = 44 }) {
  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        borderRadius: "16px",
        backgroundColor: "#F2F2F2",
        overflow: "hidden",
        "& .MuiPickersLayout-root": {
          minWidth: 0,
          backgroundColor: "transparent",
        },
        "& .MuiDateCalendar-root": {
          width: "100%",
          maxWidth: "100%",
          height: "auto",
          margin: 0,
          padding: "16px",
        },
        "& .MuiPickersCalendarHeader-root": {
          minHeight: 44,
          marginTop: 0,
          marginBottom: "14px",
          paddingLeft: 0,
          paddingRight: 0,
        },
        "& .MuiPickersCalendarHeader-labelContainer": {
          minWidth: 138,
          height: 44,
          paddingInline: "14px",
          border: "1px solid #E5E5E5",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          marginRight: "auto",
        },
        "& .MuiPickersCalendarHeader-label": {
          fontSize: 16,
          lineHeight: 1.2,
          textTransform: "capitalize",
          color: "#666666",
        },
        "& .MuiPickersArrowSwitcher-root": {
          gap: "8px",
        },
        "& .MuiPickersArrowSwitcher-button": {
          width: 44,
          height: 44,
          border: "1px solid #E5E5E5",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          color: "#A6A6A6",
        },
        "& .MuiDayCalendar-header": {
          justifyContent: "space-between",
          marginBottom: "10px",
        },
        "& .MuiDayCalendar-weekDayLabel": {
          width: size,
          height: 26,
          margin: 0,
          borderRadius: "6px",
          backgroundColor: "#FFFFFF",
          color: "#666666",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "26px",
        },
        "& .MuiDayCalendar-weekContainer": {
          justifyContent: "space-between",
          margin: 0,
        },
      }}
    >
      <V2DatePickerGraph
        year={monthId}
        renderWeekPickerDay={(dayProps) => {
          const dateKey = dayjs(dayProps.day).format("YYYY-MM-DD");
          const meta = getDayMeta?.(dateKey) ?? {};
          const isOutside = Boolean(dayProps.outsideCurrentMonth);
          const isWeekend = dayProps.day.day() === 0 || dayProps.day.day() === 6;

          return (
            <PickersDay
              {...dayProps}
              disableMargin
              selected={false}
              aria-selected={false}
              onClick={!isOutside && onDayClick ? () => onDayClick(dateKey) : undefined}
              sx={{
                width: size,
                height: size,
                margin: 0,
                borderRadius: "999px",
                boxSizing: "border-box",
                fontSize: 16,
                fontWeight: meta.selected ? 700 : 500,
                color: isOutside
                  ? "transparent"
                  : meta.color || (isWeekend ? "#A6A6A6" : "#666666"),
                backgroundColor: isOutside ? "#FFFFFF" : meta.backgroundColor || "#FFFFFF",
                border: isOutside
                  ? "1px solid transparent"
                  : meta.border || (meta.selected ? "none" : "1px solid #ECECEC"),
                "&.MuiPickersDay-root": {
                  width: size,
                  height: size,
                },
                "&.Mui-selected, &.Mui-selected:hover, &:hover, &:focus": {
                  backgroundColor: isOutside
                    ? "#FFFFFF"
                    : meta.backgroundColor || "rgba(0, 0, 0, 0.04)",
                },
              }}
            />
          );
        }}
      />
    </Box>
  );
}
