import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Box, Typography } from "@mui/material";

dayjs.locale("ru");

const WEEK_DAYS = ["П", "В", "С", "Ч", "П", "С", "В"];
const GRID_GAP = 8;
const CELL_SIZE = 40;

function buildMonthCells(monthId) {
  const monthStart = dayjs(`${monthId || dayjs().format("YYYY-MM")}-01`);
  const firstWeekdayIndex = (monthStart.day() + 6) % 7;
  const daysInMonth = monthStart.daysInMonth();
  const cellCount = Math.ceil((firstWeekdayIndex + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - firstWeekdayIndex + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return monthStart.date(dayNumber);
  });
}

export default function V2MonthGridCalendar({ monthId, getDayMeta, onDayClick, title = "" }) {
  const monthStart = dayjs(`${monthId || dayjs().format("YYYY-MM")}-01`);
  const monthCells = buildMonthCells(monthId);

  return (
    <Box
      sx={{
        width: 368,
        height: 392,
        minWidth: 0,
        boxSizing: "border-box",
        borderRadius: "12px",
        backgroundColor: "#F3F3F3",
        overflow: "hidden",
        p: "20px",
      }}
    >
      {title ? (
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "20px",
            color: "#B1B1B1",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
      ) : null}
      <Box
        sx={{
          mt: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            minWidth: 118,
            height: 44,
            px: 1.5,
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#666666",
              textTransform: "capitalize",
            }}
          >
            {monthStart.format("MMMM YYYY")}
          </Typography>
          <Typography sx={{ color: "#A6A6A6", fontSize: 18, lineHeight: 1 }}>⌄</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {["‹", "›"].map((arrow) => (
            <Box
              key={arrow}
              component="button"
              type="button"
              aria-label={arrow === "‹" ? "предыдущий месяц" : "следующий месяц"}
              disabled
              sx={{
                width: 44,
                height: 44,
                p: 0,
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                color: "#A6A6A6",
                fontSize: 30,
                lineHeight: "38px",
              }}
            >
              {arrow}
            </Box>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          mt: 1.5,
          display: "grid",
          gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
          gap: `${GRID_GAP}px`,
          width: 7 * CELL_SIZE + 6 * GRID_GAP,
        }}
      >
        {WEEK_DAYS.map((weekday, index) => (
          <Box
            key={`${weekday}-${index}`}
            sx={{
              width: CELL_SIZE,
              height: 24,
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#666666", lineHeight: 1 }}>
              {weekday}
            </Typography>
          </Box>
        ))}
        {monthCells.map((day, index) => {
          const dateKey = day ? day.format("YYYY-MM-DD") : "";
          const meta = day ? (getDayMeta?.(dateKey) ?? {}) : {};
          const isWeekend = day ? day.day() === 0 || day.day() === 6 : false;
          const isEmpty = !day;

          return (
            <Box
              key={day ? dateKey : `empty-${index}`}
              component={day ? "button" : "div"}
              type={day ? "button" : undefined}
              onClick={day && onDayClick ? () => onDayClick(dateKey) : undefined}
              sx={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                p: 0,
                borderRadius: "999px",
                border: isEmpty ? "1px solid transparent" : meta.border || "1px solid transparent",
                backgroundColor: isEmpty ? "transparent" : meta.backgroundColor || "#FFFFFF",
                color: isEmpty ? "transparent" : meta.color || (isWeekend ? "#A6A6A6" : "#666666"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                cursor: day ? "pointer" : "default",
                font: "inherit",
              }}
            >
              {day ? (
                <Typography
                  component="span"
                  sx={{
                    fontSize: 16,
                    lineHeight: 1,
                    fontWeight: meta.selected ? 700 : 500,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {day.date()}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
