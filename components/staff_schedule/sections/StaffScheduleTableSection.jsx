import { Fragment, useMemo, useState } from "react";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { V2Button, V2Checkbox, V2FieldSwitch, V2IconButton, V2Surface, v2Colors } from "@/ui/v2";
import StaffScheduleColorLegendModal from "./StaffScheduleColorLegendModal";
import {
  ACTION_COLUMN_WIDTH,
  CONTROL_RADIUS,
  DAY_COLUMN_WIDTH,
  EMPLOYEE_COLUMN_WIDTH,
  POSITION_COLUMN_WIDTH,
  SELECTION_COLUMN_WIDTH,
  SUMMARY_COLUMN_WIDTH,
} from "../staffScheduleConstants";
import {
  createStaffScheduleAccess,
  getRowBaseColor,
  getSummaryCellValue,
  hasFastActionsAccess,
  toArray,
} from "../staffScheduleHelpers";

const stickyBaseSx = {
  position: "sticky",
  backgroundClip: "padding-box",
  overflow: "hidden",
};

const stickyCellSx = (width, left, zIndex, backgroundColor = "#ffffff") => ({
  ...stickyBaseSx,
  left,
  zIndex,
  width,
  minWidth: width,
  maxWidth: width,
  boxSizing: "border-box",
  backgroundColor,
});

function ScheduleRow({
  row,
  summaryColumns,
  onOpenDay,
  onOpenMonth,
  onOpenFastActions,
  canOpenMonth,
  canOpenDayEdit,
  showFastActions,
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
  const canOpenDay = Boolean(onOpenDay) && canOpenDayEdit && String(data?.smena_id ?? "") !== "-1";
  const canUseFastActions =
    showFastActions && Boolean(onOpenFastActions) && String(data?.smena_id ?? "") !== "-1";
  const positionStickyLeft = SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH;

  return (
    <TableRow hover>
      <TableCell
        padding="checkbox"
        className="checkBox"
        sx={{
          ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, 5),
          borderRight: "1px solid #E5E5E5",
          p: 0,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <V2Checkbox
            checked={isSelected}
            onChange={() => onToggleRowSelection(rowId)}
            disabled={!rowId || String(data?.smena_id ?? "") === "-1"}
          />
        </Box>
      </TableCell>

      <TableCell
        sx={{
          ...stickyCellSx(
            EMPLOYEE_COLUMN_WIDTH,
            SELECTION_COLUMN_WIDTH,
            5,
            baseColors.backgroundColor,
          ),
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
          ...stickyCellSx(POSITION_COLUMN_WIDTH, positionStickyLeft, 5),
          borderRight: "1px solid #E5E7EB",
          py: 0.9,
          px: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 13, color: "#666666", lineHeight: 1.25 }}>
          {data?.app_name || "—"}
        </Typography>
      </TableCell>

      {showFastActions ? (
        <TableCell
          align="center"
          sx={{
            ...stickyCellSx(ACTION_COLUMN_WIDTH, positionStickyLeft + POSITION_COLUMN_WIDTH, 5),
            borderRight: "1px solid #E5E7EB",
            p: 0,
          }}
        >
          {canUseFastActions ? (
            <IconButton
              size="small"
              onClick={() => onOpenFastActions(data)}
              sx={{ width: 32, height: 32, color: "#666666" }}
            >
              <SwapHorizRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </TableCell>
      ) : null}

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
                    ? `repeating-linear-gradient(-45deg, ${baseBackground}, ${baseBackground} 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)`
                    : baseBackground,
                  color: textColor,
                  cursor: canOpenDay ? "pointer" : "default",
                  transition: "filter 0.15s ease",
                  "&:hover": canOpenDay
                    ? {
                        filter: "brightness(0.95)",
                      }
                    : undefined,
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

function ShiftHeaderRow({
  shiftId,
  smenaId,
  label,
  stickyColumnCount,
  middleColSpan,
  collapsed,
  onToggle,
  onEdit,
  canEditSmena,
}) {
  const handleToggle = () => onToggle(shiftId);
  const headerBg = "#E5E5E5";

  return (
    <TableRow>
      <TableCell
        colSpan={stickyColumnCount}
        onClick={handleToggle}
        sx={{
          backgroundColor: headerBg,
          color: "#4B5563",
          py: 0.75,
          px: 1,
          cursor: "pointer",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ minWidth: 0 }}
        >
          <Box
            component="span"
            onClick={(event) => {
              if (!canEditSmena || !smenaId) {
                return;
              }

              event.stopPropagation();
              onEdit(smenaId);
            }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
              cursor: canEditSmena && smenaId ? "pointer" : "inherit",
            }}
          >
            <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography
            sx={{ fontSize: 15, fontWeight: 500, minWidth: 0 }}
            noWrap
          >
            {label || "Смена"}
          </Typography>
        </Stack>
      </TableCell>

      {middleColSpan > 0 ? (
        <TableCell
          colSpan={middleColSpan}
          onClick={handleToggle}
          sx={{
            backgroundColor: headerBg,
            py: 0.75,
            px: 0,
            cursor: "pointer",
          }}
        />
      ) : null}

      <TableCell
        align="center"
        sx={{
          position: "sticky",
          right: 0,
          textAlign: "right",
          zIndex: 4,
          backgroundColor: headerBg,
          py: 0.75,
          px: 0.5,
          minWidth: SUMMARY_COLUMN_WIDTH,
          width: SUMMARY_COLUMN_WIDTH,
        }}
      >
        <IconButton
          size="small"
          onClick={handleToggle}
          aria-label={collapsed ? "Развернуть смену" : "Свернуть смену"}
          sx={{ borderRadius: "8px", backgroundColor: "#FFFFFF" }}
        >
          {collapsed ? <KeyboardArrowRightRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function FooterMetricRow({
  label,
  values,
  summaryColumns,
  showFastActions,
  highlightCurrent = false,
  compactValues = false,
  getValue,
}) {
  return (
    <TableRow>
      <TableCell
        sx={{
          ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, 4),
          p: 0,
        }}
      />
      <TableCell
        sx={{
          ...stickyCellSx(EMPLOYEE_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH, 4),
        }}
      />
      <TableCell
        sx={{
          ...stickyCellSx(POSITION_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH, 4),
          fontWeight: 600,
          py: 0.75,
        }}
      >
        {label}
      </TableCell>
      {showFastActions ? (
        <TableCell
          sx={{
            ...stickyCellSx(
              ACTION_COLUMN_WIDTH,
              SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH + POSITION_COLUMN_WIDTH,
              4,
            ),
            p: 0,
          }}
        />
      ) : null}

      {values.map((item, index) => (
        <TableCell
          key={`${label}-${index}`}
          align="center"
          className={compactValues ? "min_block min_size" : "min_block"}
          sx={{
            minWidth: DAY_COLUMN_WIDTH,
            px: 0.25,
            py: 0.5,
            backgroundColor: highlightCurrent && item?.type === "cur" ? "#CFF4C8" : "#ffffff",
            fontSize: compactValues ? undefined : 11,
            whiteSpace: compactValues ? "nowrap" : undefined,
            overflow: compactValues ? "hidden" : undefined,
            textOverflow: compactValues ? "ellipsis" : undefined,
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

function SummaryTotalsRow({ values, summaryColumns, dayCount, showFastActions }) {
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
          ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, 4),
          p: 0,
        }}
      />
      <TableCell
        sx={{
          ...stickyCellSx(EMPLOYEE_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH, 4),
        }}
      />
      <TableCell
        sx={{
          ...stickyCellSx(POSITION_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH, 4),
          fontWeight: 700,
        }}
      >
        Итоги
      </TableCell>
      {showFastActions ? (
        <TableCell
          sx={{
            ...stickyCellSx(
              ACTION_COLUMN_WIDTH,
              SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH + POSITION_COLUMN_WIDTH,
              4,
            ),
            p: 0,
          }}
        />
      ) : null}

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
  onOpenDay,
  onOpenMonth,
  onOpenFastActions,
  onOpenBulkFastActions,
  onOpenCreateSmena,
  onOpenEditSmena,
  selectedRowIds,
  onToggleRowSelection,
  collapsedShiftIds,
  onToggleShiftCollapse,
  isCalendarHidden,
  onCalendarVisibilityChange,
  colorMode,
  onColorModeChange,
}) {
  const [isColorLegendOpen, setIsColorLegendOpen] = useState(false);
  const days = toArray(period?.meta?.days);
  const visibleRows = toArray(rows);
  const { canAccess, canView, canEdit } = useMemo(
    () => createStaffScheduleAccess(access),
    [access],
  );
  const renderedDayCount = isCalendarHidden ? 0 : days.length;
  const showFastActions = hasFastActionsAccess(access);
  const stickyColumnCount = 3 + (showFastActions ? 1 : 0);
  const colSpan = stickyColumnCount + renderedDayCount + summaryColumns.length;
  const shiftHeaderMiddleColSpan = Math.max(colSpan - stickyColumnCount - 1, 0);
  const canShowRolls = canView("rolls");
  const canShowPizza = canView("pizza");
  const canShowSlowOrders = canView("over_40_min");
  const canShowTotals = canView("sums_all");
  const canOpenMonth = canAccess("full_month");
  const canOpenDayEdit = canEdit("day_edit") || canAccess("full_day");
  const canEditSmena = canAccess("create_edit_smena");
  const canCreateSmena = canAccess("create_edit_smena");
  const hasBulkSelection = selectedRowIds.length > 0;
  const useColors = colorMode !== "plain";
  const positionHeaderLeft = SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH;
  const toolbarControlMinWidth = { xs: "100%", md: 240 };

  if (!days.length && !visibleRows.length) {
    return (
      <Box
        sx={{
          border: "1px solid #E5E5E5",
          borderRadius: CONTROL_RADIUS,
          p: 4,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        Нет данных за выбранный период
      </Box>
    );
  }

  return (
    <V2Surface
      sx={{
        borderRadius: CONTROL_RADIUS,
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "flex-start" }}
        spacing={2}
        sx={{ p: 2, pb: 1.5 }}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, textTransform: "uppercase" }}>
            График смен
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#666666" }}>
            Показано • {shownShiftCount} смен
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          {canCreateSmena ? (
            <Box sx={{ minWidth: toolbarControlMinWidth }}>
              <V2Button
                fullWidth
                tone="secondary"
                onClick={onOpenCreateSmena}
                sx={{
                  borderRadius: "18px",
                  color: v2Colors.textMuted,
                  "&.MuiButton-root": {
                    fontSize: 16,
                    lineHeight: 1.25,
                    fontWeight: 500,
                  },
                }}
              >
                Новая смена
              </V2Button>
            </Box>
          ) : null}

          <Box sx={{ minWidth: toolbarControlMinWidth }}>
            <V2FieldSwitch
              label="Календарь"
              checked={!isCalendarHidden}
              onChange={onCalendarVisibilityChange}
            />
          </Box>

          <Box sx={{ minWidth: toolbarControlMinWidth }}>
            <V2FieldSwitch
              label="Цветовые обозначения"
              checked={useColors}
              onChange={onColorModeChange}
              action={
                <V2IconButton
                  aria-label="Показать цветовые обозначения"
                  onClick={() => setIsColorLegendOpen(true)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#666666",
                    "&:hover": { backgroundColor: "#F2F2F2" },
                  }}
                >
                  <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </V2IconButton>
              }
            />
          </Box>
        </Stack>
      </Stack>

      <TableContainer
        sx={{
          overflowX: "auto",
          borderTop: "1px solid #ECECEC",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 980,
            borderCollapse: "separate",
            borderSpacing: 0,
            "& .MuiTableCell-root": {
              borderColor: "#EDEDED",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#ffffff" }}>
              <TableCell
                sx={{
                  ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, 6),
                  p: 0,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    onClick={
                      hasBulkSelection && showFastActions ? onOpenBulkFastActions : undefined
                    }
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #E4E7EC",
                      borderRadius: "4px",
                      cursor: hasBulkSelection && showFastActions ? "pointer" : "default",
                      pointerEvents: hasBulkSelection && showFastActions ? "auto" : "none",
                      opacity: hasBulkSelection && showFastActions ? 1 : 0.35,
                      backgroundColor: hasBulkSelection && showFastActions ? "#FFF5F5" : "#FFFFFF",
                    }}
                  >
                    <SwapHorizRoundedIcon
                      sx={{
                        color: hasBulkSelection && showFastActions ? "#EE2737" : "#666666",
                        fontSize: 18,
                      }}
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  ...stickyCellSx(EMPLOYEE_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH, 6),
                  fontWeight: 500,
                }}
              >
                Сотрудник
              </TableCell>
              <TableCell
                sx={{
                  ...stickyCellSx(POSITION_COLUMN_WIDTH, positionHeaderLeft, 6),
                  fontWeight: 500,
                }}
              >
                Должность
              </TableCell>

              {showFastActions ? (
                <TableCell
                  sx={{
                    ...stickyCellSx(
                      ACTION_COLUMN_WIDTH,
                      positionHeaderLeft + POSITION_COLUMN_WIDTH,
                      6,
                    ),
                    p: 0,
                  }}
                />
              ) : null}

              {!isCalendarHidden
                ? days.map((day, index) => (
                    <TableCell
                      key={`${day?.date || index}-day-num`}
                      align="center"
                      sx={{
                        minWidth: DAY_COLUMN_WIDTH,
                        backgroundColor:
                          day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                            ? "#ffe9bd"
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
            {visibleRows.map((row, index) => {
              if (row?.row === "header") {
                const shiftId = row?.__shiftId || `shift-${index}`;

                return (
                  <Fragment key={`shift-${index}`}>
                    <ShiftHeaderRow
                      shiftId={shiftId}
                      smenaId={row?.__smenaId || row?.smena_id}
                      label={row?.data}
                      stickyColumnCount={stickyColumnCount}
                      middleColSpan={shiftHeaderMiddleColSpan}
                      collapsed={collapsedShiftIds.includes(shiftId)}
                      onToggle={onToggleShiftCollapse}
                      onEdit={onOpenEditSmena}
                      canEditSmena={canEditSmena}
                    />
                  </Fragment>
                );
              }

              return (
                <ScheduleRow
                  key={`row-${row?.data?.id || row?.data?.smena_id || row?.data?.user_name || "x"}-${index}`}
                  row={row}
                  summaryColumns={summaryColumns}
                  onOpenDay={onOpenDay}
                  onOpenMonth={onOpenMonth}
                  onOpenFastActions={onOpenFastActions}
                  canOpenMonth={canOpenMonth}
                  canOpenDayEdit={canOpenDayEdit}
                  showFastActions={showFastActions}
                  isCalendarHidden={isCalendarHidden}
                  useColors={useColors}
                  selectedRowIds={selectedRowIds}
                  onToggleRowSelection={onToggleRowSelection}
                />
              );
            })}

            {!isCalendarHidden && toArray(period?.meta?.bonus).length ? (
              <FooterMetricRow
                label="Бонус дня"
                values={toArray(period?.meta?.bonus)}
                summaryColumns={summaryColumns}
                showFastActions={showFastActions}
                highlightCurrent
                compactValues
                getValue={(item) => item?.res ?? ""}
              />
            ) : null}

            {canShowTotals ? (
              <SummaryTotalsRow
                values={period?.meta?.other_summ ?? {}}
                summaryColumns={summaryColumns}
                dayCount={renderedDayCount}
                showFastActions={showFastActions}
              />
            ) : null}

            {!isCalendarHidden && canShowRolls ? (
              <FooterMetricRow
                label="Роллов"
                values={toArray(period?.meta?.bonus)}
                summaryColumns={summaryColumns}
                showFastActions={showFastActions}
                getValue={(item) => item?.count_rolls ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowPizza ? (
              <FooterMetricRow
                label="Пиццы"
                values={toArray(period?.meta?.bonus)}
                summaryColumns={summaryColumns}
                showFastActions={showFastActions}
                getValue={(item) => item?.count_pizza ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowSlowOrders ? (
              <FooterMetricRow
                label="Заказы больше 40 мин"
                values={toArray(period?.meta?.order_stat)}
                summaryColumns={summaryColumns}
                showFastActions={showFastActions}
                getValue={(item) => item?.count_false ?? ""}
              />
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      <StaffScheduleColorLegendModal
        open={isColorLegendOpen}
        onClose={() => setIsColorLegendOpen(false)}
      />
    </V2Surface>
  );
}
