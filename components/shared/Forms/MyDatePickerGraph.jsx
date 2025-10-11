"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";

export function MyDatePickerGraph(props) {
  const data = props.year.split("-");
  const [activeValue, setActiveValue] = useState(formatDate(`${props.year}-01`));
  const [minDate, setMinDate] = useState(new Date(data[0], parseInt(data[1]) - 1, 1));
  const [maxDate, setMaxDate] = useState(new Date(data[0], parseInt(data[1]), 0));
  const [arr, setArr] = useState([]);

  useEffect(() => {
    setMinDate(new Date(data[0], parseInt(data[1]) - 1, 1));
    setMaxDate(new Date(data[0], parseInt(data[1]), 0));
  }, []);

  // const renderWeekPickerDay = (date, selectedDates, pickersDayProps) => {
  //   pickersDayProps["selected"] = false;
  //   pickersDayProps["aria-selected"] = false;

  //   const picked = arr.find((item) => formatDate(item.date) == formatDate(date));

  //   if (picked) {
  //     return (
  //       <PickersDay
  //         {...pickersDayProps}
  //         style={{ backgroundColor: "yellow", color: "red" }}
  //         onClick={() => chooseDay(date)}
  //       />
  //     );
  //   }

  //   return (
  //     <PickersDay
  //       {...pickersDayProps}
  //       onClick={() => chooseDay(date)}
  //     />
  //   );
  // };

  // const chooseDay = (newValue) => {
  //   const exists = arr.find((item) => formatDate(item.date) == formatDate(newValue));

  //   if (!exists) {
  //     setArr(arr => [...arr, {
  //       date: formatDate(newValue),
  //       type: 1,
  //     }]);
  //   } else {
  //     setArr(arr => arr.filter((item) => formatDate(item.date) != formatDate(newValue)));
  //   }
  // };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
    >
      <StaticDatePicker
        multiple={true}
        minDate={formatDate(minDate)}
        maxDate={formatDate(maxDate)}
        displayStaticWrapperAs="desktop"
        label="Week picker"
        //renderDay={props.renderWeekPickerDay}
        //renderInput={(params) => <TextField {...params} />}
        //inputFormat="yyyy-MM-dd"
        //onChange={ () => {} }

        slotProps={{ textField: { size: "small", multiple: true } }}
        value={activeValue}
        slots={{ day: (day) => props.renderWeekPickerDay(day) }}
      />
    </LocalizationProvider>
  );
}
