import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DatePicker from "react-multi-date-picker";

export function formatDateName(date) {
  const d = new Date(date);
  const month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();

  if (day.length < 2) day = "0" + day;

  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  return [day, months[parseInt(month, 10) - 1]].join(" ");
}

export class PromoExcludeDatePicker extends React.PureComponent {
  render() {
    const { label, value, func, disabled } = this.props;

    return (
      <Box sx={{ width: "100%", position: "relative" }}>
        {label ? (
          <Typography
            variant="body2"
            sx={{ mb: 0.75, fontWeight: 600 }}
          >
            {label}
          </Typography>
        ) : null}
        <DatePicker
          format="YYYY-MM-DD"
          multiple
          sort
          portal
          fixMainPosition
          disabled={disabled}
          containerStyle={{ width: "100%" }}
          style={{ width: "95%" }}
          value={value}
          onChange={func}
        />
      </Box>
    );
  }
}
