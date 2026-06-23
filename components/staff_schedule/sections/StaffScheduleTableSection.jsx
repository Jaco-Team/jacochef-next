import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MySelect } from "@/ui/Forms";
import {
  DAY_COLUMN_WIDTH,
  EMPLOYEE_COLUMN_WIDTH,
  POSITION_COLUMN_WIDTH,
  SELECTION_COLUMN_WIDTH,
  SUMMARY_COLUMN_WIDTH,
} from "../staffScheduleConstants";
import { getRowBaseColor, getSummaryCellValue, isEnabled, toArray } from "../staffScheduleHelpers";

function ScheduleRow({
  row,
  summaryColumns,
  onOpenDay,
  onOpenMonth,
  canOpenMonth,
  isCalendarHidden,
  useColors,
  selectedRowIds,
  onToggleRowSelection,
}) {
  const data = row?.data ?? {};
  const rowId = data?.id ? String(data.id) : "";
  const isSelected = selectedRowIds.includes(rowId);
  const baseColors = useColors
    ? getRowBaseColor(data?.type, Boolean(row?.color))
    : { backgroundColor: "#ffffff", color: "#000000" };
  const canOpenDay = Boolean(onOpenDay) && String(data?.smena_id ?? "") !== "-1";

  return (
    <TableRow hover>
      <TableCell
        padding="checkbox"
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          minWidth: SELECTION_COLUMN_WIDTH,
          width: SELECTION_COLUMN_WIDTH,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleRowSelection(rowId)}
          size="small"
        />
      </TableCell>

      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH,
          zIndex: 2,
          minWidth: EMPLOYEE_COLUMN_WIDTH,
          backgroundColor: baseColors.backgroundColor,
          color: baseColors.color,
          fontWeight: 500,
          borderRight: "1px solid #E5E7EB",
          py: 0.9,
          px: 1.5,
          cursor: canOpenMonth ? "pointer" : "default",
        }}
        onClick={canOpenMonth ? () => onOpenMonth(data) : undefined}
      >
        <Typography sx={{ fontSize: 14, lineHeight: 1.25 }}>
          {data?.user_name || "Без имени"}
        </Typography>
      </TableCell>

      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH,
          zIndex: 2,
          minWidth: POSITION_COLUMN_WIDTH,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
          py: 0.9,
          px: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#666666", lineHeight: 1.25 }}>
          {data?.app_name || "—"}
        </Typography>
      </TableCell>

      {!isCalendarHidden
        ? toArray(data?.dates).map((day, index) => {
            const info = day?.info ?? {};
            const isHoliday = Boolean(data?.holydays?.[day?.date]);
            const baseBackground = useColors
              ? row?.color
                ? "#D3D3D3"
                : info?.color || "#ffffff"
              : "#ffffff";
            const textColor = useColors
              ? row?.color
                ? "#000000"
                : info?.colorT || "#111827"
              : "#111827";

            return (
              <TableCell
                key={`${day?.date || index}-${data?.id || data?.user_name || index}`}
                align="center"
                sx={{
                  minWidth: DAY_COLUMN_WIDTH,
                  px: 0.25,
                  py: 0.5,
                  fontSize: 11,
                  fontWeight: 500,
                  background: isHoliday
                    ? `repeating-linear-gradient(-45deg, ${baseBackground}, ${baseBackground} 8px, rgba(255, 0, 0, 0.14) 8px, rgba(255, 0, 0, 0.14) 12px)`
                    : baseBackground,
                  color: textColor,
                  cursor: canOpenDay ? "pointer" : "default",
                }}
                onClick={canOpenDay ? () => onOpenDay(data, day?.date) : undefined}
              >
                {info?.hours || ""}
              </TableCell>
            );
          })
        : null}

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

function ShiftHeaderRow({ shiftId, label, colSpan, collapsed, onToggle }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          backgroundColor: "#E5E5E5",
          color: "#4B5563",
          py: 0.75,
          px: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{label || "Смена"}</Typography>
          </Stack>

          <IconButton
            size="small"
            onClick={() => onToggle(shiftId)}
            sx={{ borderRadius: "8px", backgroundColor: "#FFFFFF" }}
          >
            {collapsed ? <KeyboardArrowRightRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </Stack>
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
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH,
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

function SummaryTotalsRow({ values, summaryColumns, dayCount }) {
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
      <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "#ffffff" }} />
      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 700,
        }}
      >
        Итоги
      </TableCell>

      {dayCount > 0 ? <TableCell colSpan={dayCount} /> : null}

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
  rows,
  shownShiftCount,
  summaryColumns,
  access,
  loading = false,
  onOpenDay,
  onOpenMonth,
  selectedRowIds,
  onToggleRowSelection,
  collapsedShiftIds,
  onToggleShiftCollapse,
  isCalendarHidden,
  onCalendarVisibilityChange,
  colorMode,
  onColorModeChange,
}) {
  const days = toArray(period?.meta?.days);
  const visibleRows = toArray(rows);
  const renderedDayCount = isCalendarHidden ? 0 : days.length;
  const colSpan = 3 + renderedDayCount + summaryColumns.length;
  const canShowRolls = isEnabled(access?.rolls_view);
  const canShowPizza = isEnabled(access?.pizza_view);
  const canShowSlowOrders = isEnabled(access?.over_40_min_view);
  const canShowTotals = isEnabled(access?.sums_all_view);
  const canOpenMonth = isEnabled(access?.full_month_access);
  const useColors = colorMode !== "plain";
  const colorModeOptions = [
    { id: "default", name: "Цветовые обозначения" },
    { id: "plain", name: "Без цветовых обозначений" },
  ];

  if (loading && !days.length && !visibleRows.length) {
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

  if (!days.length && !visibleRows.length) {
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
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, borderColor: "#ECECEC", overflow: "hidden", boxShadow: "none" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "flex-start" }}
        spacing={2}
        sx={{ p: 2.5, pb: 1.5 }}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>
            График смен
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#666666" }}>
            Показано - {shownShiftCount} смен
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Paper
            variant="outlined"
            sx={{
              px: 1.5,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              borderRadius: "12px",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCalendarHidden}
                  onChange={onCalendarVisibilityChange}
                />
              }
              label="Скрыть календарь"
              sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: 14, color: "#666666" } }}
            />
          </Paper>

          <Box sx={{ minWidth: 240 }}>
            <MySelect
              is_none={false}
              data={colorModeOptions}
              value={colorMode}
              func={onColorModeChange}
              label=""
              unifiedPopup
            />
          </Box>
        </Stack>
      </Stack>

      <TableContainer
        sx={{
          overflowX: "auto",
          borderTop: "1px solid #ECECEC",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 980,
            "& .MuiTableCell-root": {
              borderColor: "#EDEDED",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#ffffff" }}>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  minWidth: SELECTION_COLUMN_WIDTH,
                  width: SELECTION_COLUMN_WIDTH,
                  backgroundColor: "#ffffff",
                }}
              >
                <SwapHorizRoundedIcon sx={{ color: "#666666", fontSize: 18 }} />
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: SELECTION_COLUMN_WIDTH,
                  zIndex: 3,
                  minWidth: EMPLOYEE_COLUMN_WIDTH,
                  backgroundColor: "#ffffff",
                  fontWeight: 500,
                }}
              >
                Сотрудник
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH,
                  zIndex: 3,
                  minWidth: POSITION_COLUMN_WIDTH,
                  backgroundColor: "#ffffff",
                  fontWeight: 500,
                }}
              >
                Должность
              </TableCell>

              {!isCalendarHidden
                ? days.map((day, index) => (
                    <TableCell
                      key={`${day?.date || index}-day-num`}
                      align="center"
                      sx={{
                        minWidth: DAY_COLUMN_WIDTH,
                        backgroundColor:
                          day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                            ? "#FBE7B6"
                            : "#ffffff",
                        fontWeight: 500,
                        color: "#666666",
                        py: 1,
                        px: 0.25,
                      }}
                    >
                      <Stack spacing={0.25}>
                        <Typography sx={{ fontSize: 12, lineHeight: 1 }}>
                          {day?.day ?? ""}
                        </Typography>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.1 }}>
                          {day?.date ?? ""}
                        </Typography>
                      </Stack>
                    </TableCell>
                  ))
                : null}

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
            {visibleRows.map((row, index) =>
              row?.row === "header" ? (
                <ShiftHeaderRow
                  key={`shift-${index}`}
                  shiftId={row?.__shiftId || `shift-${index}`}
                  label={row?.data}
                  colSpan={colSpan}
                  collapsed={collapsedShiftIds.includes(row?.__shiftId || `shift-${index}`)}
                  onToggle={onToggleShiftCollapse}
                />
              ) : (
                <ScheduleRow
                  key={`row-${row?.data?.id || row?.data?.smena_id || row?.data?.user_name || "x"}-${index}`}
                  row={row}
                  summaryColumns={summaryColumns}
                  onOpenDay={onOpenDay}
                  onOpenMonth={onOpenMonth}
                  canOpenMonth={canOpenMonth}
                  isCalendarHidden={isCalendarHidden}
                  useColors={useColors}
                  selectedRowIds={selectedRowIds}
                  onToggleRowSelection={onToggleRowSelection}
                />
              ),
            )}

            {!isCalendarHidden && toArray(period?.meta?.bonus).length ? (
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
                dayCount={renderedDayCount}
              />
            ) : null}

            {!isCalendarHidden && canShowRolls ? (
              <FooterMetricRow
                label="Роллов"
                values={toArray(period?.meta?.bonus)}
                summaryColumns={summaryColumns}
                getValue={(item) => item?.count_rolls ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowPizza ? (
              <FooterMetricRow
                label="Пиццы"
                values={toArray(period?.meta?.bonus)}
                summaryColumns={summaryColumns}
                getValue={(item) => item?.count_pizza ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowSlowOrders ? (
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
    </Paper>
  );
}
