import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  DAY_COLUMN_WIDTH,
  EMPLOYEE_COLUMN_WIDTH,
  POSITION_COLUMN_WIDTH,
  SUMMARY_COLUMN_WIDTH,
} from "../staffScheduleConstants";
import { getRowBaseColor, getSummaryCellValue, isEnabled, toArray } from "../staffScheduleHelpers";

function ScheduleRow({ row, summaryColumns, onOpenDay, onOpenMonth, canOpenMonth }) {
  const data = row?.data ?? {};
  const baseColors = getRowBaseColor(data?.type, Boolean(row?.color));
  const canOpenDay = Boolean(onOpenDay) && String(data?.smena_id ?? "") !== "-1";

  return (
    <TableRow hover>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          minWidth: EMPLOYEE_COLUMN_WIDTH,
          backgroundColor: baseColors.backgroundColor,
          color: baseColors.color,
          fontWeight: 700,
          borderRight: "1px solid #E5E7EB",
          py: 1,
          px: 2,
          cursor: canOpenMonth ? "pointer" : "default",
        }}
        onClick={canOpenMonth ? () => onOpenMonth(data) : undefined}
      >
        {data?.user_name || "Без имени"}
      </TableCell>
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 2,
          minWidth: POSITION_COLUMN_WIDTH,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
          py: 1,
          px: 2,
        }}
      >
        {data?.app_name || "—"}
      </TableCell>

      {toArray(data?.dates).map((day, index) => {
        const info = day?.info ?? {};
        const isHoliday = Boolean(data?.holydays?.[day?.date]);
        const backgroundColor = row?.color ? "#D3D3D3" : info?.color || "#ffffff";
        const textColor = row?.color ? "#000000" : info?.colorT || "#111827";

        return (
          <TableCell
            key={`${day?.date || index}-${data?.id || data?.user_name || index}`}
            align="center"
            sx={{
              minWidth: DAY_COLUMN_WIDTH,
              px: 0.25,
              py: 0.5,
              fontSize: 11,
              fontWeight: 600,
              background: isHoliday
                ? `repeating-linear-gradient(-45deg, ${backgroundColor}, ${backgroundColor} 8px, rgba(255, 0, 0, 0.2) 8px, rgba(255, 0, 0, 0.2) 12px)`
                : backgroundColor,
              color: textColor,
              cursor: canOpenDay ? "pointer" : "default",
            }}
            onClick={canOpenDay ? () => onOpenDay(data, day?.date) : undefined}
          >
            {info?.hours || ""}
          </TableCell>
        );
      })}

      {summaryColumns.map((column) => (
        <TableCell
          key={`${data?.id || data?.user_name}-${column.key}`}
          align="center"
          sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontSize: 11.5, px: 0.75 }}
        >
          {getSummaryCellValue(column, data)}
        </TableCell>
      ))}
    </TableRow>
  );
}

function ShiftHeaderRow({ label, colSpan }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          backgroundColor: "#E5E7EB",
          fontWeight: 700,
          color: "#111827",
          py: 1.25,
        }}
      >
        {label || "Смена"}
      </TableCell>
    </TableRow>
  );
}

function FooterMetricRow({ label, values, summaryColumns, highlightCurrent = false, getValue }) {
  return (
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 600,
          py: 0.75,
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 600,
          py: 0.75,
        }}
      >
        {label}
      </TableCell>

      {values.map((item, index) => (
        <TableCell
          key={`${label}-${index}`}
          align="center"
          sx={{
            minWidth: DAY_COLUMN_WIDTH,
            px: 0.25,
            py: 0.5,
            backgroundColor: highlightCurrent && item?.type === "cur" ? "#CFF4C8" : "#ffffff",
            fontSize: 11,
          }}
        >
          {getValue
            ? getValue(item)
            : (item?.res ?? item?.count_rolls ?? item?.count_pizza ?? item?.count_false ?? "")}
        </TableCell>
      ))}

      {summaryColumns.map((column) => (
        <TableCell
          key={`${label}-${column.key}`}
          align="center"
        />
      ))}
    </TableRow>
  );
}

function SummaryTotalsRow({ values, summaryColumns }) {
  const keyMap = {
    dop_bonus: "sum_dop_bonus_price",
    h_price: "sum_h_price",
    err_price: "sum_err_price",
    my_bonus: "sum_bonus_price",
    total_sum: "sum_to_given_price",
    given: "sum_given_price",
  };

  return (
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 1,
          backgroundColor: "#ffffff",
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 700,
        }}
      >
        Итоги
      </TableCell>

      <TableCell colSpan={values.length} />

      {summaryColumns.map((column) => (
        <TableCell
          key={`summary-${column.key}`}
          align="center"
          sx={{ fontWeight: 700 }}
        >
          {values?.[keyMap[column.key]] ?? ""}
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function StaffScheduleTableSection({
  period,
  summaryColumns,
  access,
  loading = false,
  onOpenDay,
  onOpenMonth,
}) {
  const days = toArray(period?.meta?.days);
  const rows = toArray(period?.rows);
  const colSpan = 2 + days.length + summaryColumns.length;
  const canShowRolls = isEnabled(access?.rolls_view);
  const canShowPizza = isEnabled(access?.pizza_view);
  const canShowSlowOrders = isEnabled(access?.over_40_min_view);
  const canShowTotals = isEnabled(access?.sums_all_view);
  const canOpenMonth = isEnabled(access?.full_month_access);

  if (loading && !days.length && !rows.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "text.secondary" }}
      >
        <CircularProgress
          size={28}
          sx={{ mb: 1.5 }}
        />
        <Typography sx={{ fontSize: 14 }}>Загрузка графика...</Typography>
      </Paper>
    );
  }

  if (!days.length && !rows.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 4, textAlign: "center", color: "text.secondary" }}
      >
        Нет данных за выбранный период
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflowX: "auto",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 980,
          "& .MuiTableCell-root": {
            borderColor: "#E5E7EB",
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                minWidth: EMPLOYEE_COLUMN_WIDTH,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
                py: 1,
                px: 2,
              }}
            >
              Сотрудник
            </TableCell>
            <TableCell
              sx={{
                position: "sticky",
                left: EMPLOYEE_COLUMN_WIDTH,
                zIndex: 3,
                minWidth: POSITION_COLUMN_WIDTH,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
                py: 1,
                px: 2,
              }}
            >
              Должность
            </TableCell>

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-day-num`}
                align="center"
                sx={{
                  minWidth: DAY_COLUMN_WIDTH,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  fontWeight: 700,
                  py: 1,
                  px: 0.25,
                }}
              >
                {day?.date ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-top-${column.key}`}
                align="center"
                sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontWeight: 700, px: 0.5 }}
              />
            ))}
          </TableRow>

          <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                backgroundColor: "#F8FAFC",
                py: 0.75,
              }}
            />
            <TableCell
              sx={{
                position: "sticky",
                left: EMPLOYEE_COLUMN_WIDTH,
                zIndex: 3,
                backgroundColor: "#F8FAFC",
                py: 0.75,
              }}
            />

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-weekday`}
                align="center"
                sx={{
                  minWidth: DAY_COLUMN_WIDTH,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  color: "#6B7280",
                  fontSize: 11,
                  px: 0.25,
                  py: 0.75,
                }}
              >
                {day?.day ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-bottom-${column.key}`}
                align="center"
                sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontWeight: 700, fontSize: 11, px: 0.5 }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) =>
            row?.row === "header" ? (
              <ShiftHeaderRow
                key={`shift-${index}`}
                label={row?.data}
                colSpan={colSpan}
              />
            ) : (
              <ScheduleRow
                key={`row-${row?.data?.id || row?.data?.smena_id || row?.data?.user_name || "x"}-${index}`}
                row={row}
                summaryColumns={summaryColumns}
                onOpenDay={onOpenDay}
                onOpenMonth={onOpenMonth}
                canOpenMonth={canOpenMonth}
              />
            ),
          )}

          {toArray(period?.meta?.bonus).length ? (
            <FooterMetricRow
              label="Бонус дня"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              highlightCurrent
              getValue={(item) => item?.res ?? ""}
            />
          ) : null}

          {canShowTotals ? (
            <SummaryTotalsRow
              values={period?.meta?.other_summ ?? {}}
              summaryColumns={summaryColumns}
            />
          ) : null}

          {canShowRolls ? (
            <FooterMetricRow
              label="Роллов"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_rolls ?? ""}
            />
          ) : null}

          {canShowPizza ? (
            <FooterMetricRow
              label="Пиццы"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_pizza ?? ""}
            />
          ) : null}

          {canShowSlowOrders ? (
            <FooterMetricRow
              label="Заказы больше 40 мин"
              values={toArray(period?.meta?.order_stat)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_false ?? ""}
            />
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
