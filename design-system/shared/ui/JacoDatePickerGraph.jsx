import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useMemo } from "react";

dayjs.locale("ru");

export default function JacoDatePickerGraph({
  year,
  value,
  renderWeekPickerDay,
  slotProps,
  slots,
  ...props
}) {
  const { activeValue, minDate, maxDate } = useMemo(() => {
    const [rawYear, rawMonth] = String(year ?? "").split("-");
    const monthDate = dayjs()
      .year(Number(rawYear) || dayjs().year())
      .month(Math.max((Number(rawMonth) || 1) - 1, 0))
      .date(1);

    return {
      activeValue: value ? dayjs(value) : monthDate,
      minDate: monthDate.startOf("month"),
      maxDate: monthDate.endOf("month"),
    };
  }, [value, year]);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <StaticDatePicker
        {...props}
        minDate={minDate}
        maxDate={maxDate}
        displayStaticWrapperAs="desktop"
        value={activeValue}
        slots={{
          ...slots,
          day: renderWeekPickerDay ? (dayProps) => renderWeekPickerDay(dayProps) : slots?.day,
        }}
        slotProps={{
          ...slotProps,
          actionBar: {
            actions: [],
            ...slotProps?.actionBar,
          },
          textField: {
            size: "small",
            ...slotProps?.textField,
          },
        }}
      />
    </LocalizationProvider>
  );
}
