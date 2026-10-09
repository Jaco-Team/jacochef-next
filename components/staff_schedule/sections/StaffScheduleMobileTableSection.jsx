import { useCallback, useRef, useState } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
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
import { SmallFont } from "@/design-system/shared/ui";
import { SummarySectionIcon } from "@/design-system/shared/icons";
import {
  JacoButton,
  JacoCheckbox,
  JacoSurface,
  uiColors,
  uiTableColors,
} from "@/design-system/shared/ui";
import { CONTROL_RADIUS, SUMMARY_COLUMN_WIDTH } from "../staffScheduleConstants";
import {
  formatEmployeeCount,
  getRowBaseColor,
  getScheduleRowFocusKey,
  getSummaryCellValue,
  toArray,
} from "../staffScheduleHelpers";
import {
  getHolidayStripeSx,
  staffScheduleHeaderActionSx,
  staffScheduleFinancialValueStyle,
  staffScheduleFinancialFocusSx,
} from "../staffSchedulePatterns";
import {
  canEditStaffScheduleBonus,
  canEditStaffScheduleFinanceValue,
} from "../staffScheduleAccess.mjs";

const MOBILE_SELECTION_COLUMN_WIDTH = 34;
const MOBILE_EMPLOYEE_COLUMN_WIDTH = 150;
const MOBILE_DAY_COLUMN_WIDTH = 76;
const MOBILE_SUMMARY_COLUMN_WIDTH = SUMMARY_COLUMN_WIDTH;
const MOBILE_CARD_BORDER = "1px solid #ECECEC";
const MOBILE_CARD_RADIUS = "14px";
const MOBILE_MIN_FONT_SIZE = 13;
const MOBILE_WEEKDAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const getMobileFixedColumnSx = (width) => ({
  width,
  minWidth: width,
  maxWidth: width,
  boxSizing: "border-box",
});

const getMobileStickyColumnSx = (left, zIndex, withEdgeShadow = false) => ({
  position: "sticky",
  left,
  zIndex,
  backgroundClip: "padding-box",
  ...(withEdgeShadow
    ? {
        boxShadow:
          "inset -1px 0 0 #ECECEC, inset 0 -1px 0 #ECECEC, 8px 0 12px -12px rgba(15, 23, 42, 0.45)",
      }
    : {}),
});

function getMobileDayHeader(item) {
  const rawDate = String(item?.date ?? "");
  const isoDateParts = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (!isoDateParts) {
    return {
      day: item?.day ?? "",
      date: rawDate,
    };
  }

  const [, year, month, day] = isoDateParts;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return {
    day: item?.day || MOBILE_WEEKDAY_LABELS[parsedDate.getUTCDay()],
    date: day.padStart(2, "0"),
  };
}

const mobileCellDividerSx = {
  boxShadow: "inset -1px 0 0 #ECECEC, inset 0 -1px 0 #ECECEC",
};

const mobileCardSx = {
  border: MOBILE_CARD_BORDER,
  borderRadius: MOBILE_CARD_RADIUS,
  overflow: "hidden",
  backgroundColor: "#FFFFFF",
};

const mobileActionCellSx = {
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${uiTableColors.bulkActionBorder}`,
  borderRadius: "8px",
};

const mobileDayHeaderTextSx = {
  fontSize: MOBILE_MIN_FONT_SIZE,
  lineHeight: 1.1,
};

const mobileDayHeaderDateSx = {
  fontSize: MOBILE_MIN_FONT_SIZE,
  lineHeight: 1.1,
};

function buildMobileShiftGroups(rows) {
  return toArray(rows).reduce((groups, row, index) => {
    if (row?.row === "header") {
      groups.push({
        key: row?.__shiftId || `shift-${index}`,
        shiftId: row?.__shiftId || `shift-${index}`,
        smenaId: row?.__smenaId || row?.smena_id,
        label: row?.data || "Смена",
        employeeCount: row?.__employeeCount,
        rows: [],
      });
      return groups;
    }

    if (!groups.length) {
      groups.push({
        key: `shift-fallback-${index}`,
        shiftId: `shift-fallback-${index}`,
        smenaId: row?.data?.smena_id,
        label: "Смена",
        rows: [],
      });
    }

    groups[groups.length - 1].rows.push(row);
    return groups;
  }, []);
}

function MobileScheduleRow({
  row,
  summaryColumns,
  isCalendarHidden,
  useColors,
  selectedRowIds,
  onToggleRowSelection,
  onOpenMonth,
  onOpenDay,
  canOpenMonth,
  canOpenDayEdit,
  canEditTeamBonus,
  canEdit,
  selectedPart,
  onOpenSummaryAction,
  onChangeTeamBonusForUser,
  periodBonusState,
  hideSelectionColumn,
  focusedRowKey,
  onToggleRowFocus,
  blurFinancials,
}) {
  const data = row?.data ?? {};
  const selectionColumnWidth = hideSelectionColumn ? 0 : MOBILE_SELECTION_COLUMN_WIDTH;
  const focusKey = getScheduleRowFocusKey(data);
  const isSelected = focusKey != null && selectedRowIds.includes(focusKey);
  const isFocused = focusKey != null && focusedRowKey === focusKey;
  const isFinancialBlurred = blurFinancials && !isFocused;
  const baseColors = useColors
    ? getRowBaseColor(data?.type, Boolean(row?.color))
    : { backgroundColor: "#ffffff", color: "#000000" };
  const rowSurfaceColor = isFocused
    ? uiTableColors.rowSelected
    : row?.color
      ? uiTableColors.rowMuted
      : "#ffffff";
  const employeeCellColor = isFocused ? uiTableColors.rowSelected : baseColors.backgroundColor;
  const employeeMetaColor =
    baseColors.color === "#ffffff" ? "rgba(255, 255, 255, 0.82)" : "#666666";
  const canOpenDay = Boolean(onOpenDay) && canOpenDayEdit && String(data?.smena_id ?? "") !== "-1";

  return (
    <TableRow sx={{ backgroundColor: rowSurfaceColor }}>
      <TableCell
        sx={{
          ...mobileCellDividerSx,
          ...getMobileFixedColumnSx(selectionColumnWidth),
          p: 0,
          backgroundColor: rowSurfaceColor,
          verticalAlign: "middle",
          overflow: "hidden",
          opacity: hideSelectionColumn ? 0 : 1,
          transition:
            "width 180ms ease, min-width 180ms ease, max-width 180ms ease, opacity 120ms ease",
        }}
      >
        <Box
          sx={{
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!hideSelectionColumn && String(data?.smena_id ?? "") !== "-1" ? (
            <JacoCheckbox
              checked={isSelected}
              onChange={() => onToggleRowSelection(focusKey)}
              disabled={!focusKey}
            />
          ) : null}
        </Box>
      </TableCell>

      <TableCell
        sx={{
          ...mobileCellDividerSx,
          ...getMobileFixedColumnSx(MOBILE_EMPLOYEE_COLUMN_WIDTH),
          ...getMobileStickyColumnSx(0, 3, true),
          px: 1,
          py: 1,
          backgroundColor: employeeCellColor,
          color: isFocused ? "#000000" : baseColors.color,
          cursor: canOpenMonth ? "pointer" : "default",
        }}
        onClick={canOpenMonth ? () => onOpenMonth(data) : undefined}
      >
        <Typography
          sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}
          noWrap
        >
          {data?.user_name || "Без имени"}
        </Typography>
        <Typography
          component="button"
          type="button"
          disabled={!focusKey}
          aria-pressed={isFocused}
          onClick={(event) => {
            event.stopPropagation();
            onToggleRowFocus(focusKey);
          }}
          sx={{
            mt: 0.25,
            mx: -1,
            mb: -1,
            px: 1,
            py: 0.5,
            width: "calc(100% + 16px)",
            minHeight: 24,
            display: "block",
            border: 0,
            background: "none",
            fontSize: MOBILE_MIN_FONT_SIZE,
            lineHeight: 1.2,
            color: isFocused ? "#666666" : employeeMetaColor,
            textAlign: "left",
            cursor: focusKey ? "pointer" : "default",
          }}
          noWrap
        >
          {data?.app_name || "—"}
        </Typography>
      </TableCell>

      {!isCalendarHidden
        ? toArray(data?.dates).map((day, index) => {
            const info = day?.info ?? {};
            const isHoliday = Boolean(data?.holydays?.[day?.date]);
            const hasExplicitDayColor =
              useColors && Boolean(info?.color) && !row?.color && !isFocused;
            const baseBackground = hasExplicitDayColor ? info.color : rowSurfaceColor;
            const textColor = isFocused
              ? "#111827"
              : useColors
                ? row?.color
                  ? "#000000"
                  : info?.colorT || "#111827"
                : "#111827";

            return (
              <TableCell
                key={`${day?.date || index}-${data?.id || data?.user_name || index}`}
                align="center"
                sx={{
                  ...mobileCellDividerSx,
                  ...getMobileFixedColumnSx(MOBILE_DAY_COLUMN_WIDTH),
                  px: 0.25,
                  py: 0.75,
                  fontSize: MOBILE_MIN_FONT_SIZE,
                  fontWeight: 500,
                  ...(isHoliday && !isFocused
                    ? getHolidayStripeSx(baseBackground, index, MOBILE_DAY_COLUMN_WIDTH)
                    : { backgroundColor: baseBackground }),
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

      {summaryColumns.map((column) => {
        const canEditFinancialValue = canEditStaffScheduleFinanceValue({
          columnKey: column.key,
          row: data,
          canEdit,
        });
        const canEditBonus =
          column.key === "my_bonus" &&
          canEditStaffScheduleBonus({ row: data, canEdit, selectedPart });
        const canEditDopBonus =
          column.key === "dop_bonus" &&
          canEditTeamBonus &&
          [1, 2].includes(Number(periodBonusState)) &&
          Number(data?.check_period) === 1 &&
          String(data?.smena_id ?? "") !== "-1";
        const isPremiumColumn = column.key === "test_all_price" && column.accessKey === "premia";
        const isClickable =
          !isFinancialBlurred &&
          Boolean(canEditDopBonus ? onChangeTeamBonusForUser : onOpenSummaryAction) &&
          (canEditFinancialValue || canEditBonus || canEditDopBonus);
        const handleClick = () => {
          if (canEditDopBonus) onChangeTeamBonusForUser?.(data);
          else onOpenSummaryAction?.(data, column.key);
        };

        return (
          <TableCell
            key={`${data?.id || data?.user_name}-${column.key}`}
            align="center"
            data-financial-column={column.key}
            data-financial-editable={isClickable ? "true" : undefined}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={
              isClickable
                ? `Изменить ${column.label} — ${data?.user_name || "Сотрудник"} · ${data?.full_app_name || data?.app_name || ""}`
                : undefined
            }
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={
              isClickable
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleClick();
                    }
                  }
                : undefined
            }
            sx={{
              ...mobileCellDividerSx,
              ...getMobileFixedColumnSx(MOBILE_SUMMARY_COLUMN_WIDTH),
              px: 0.5,
              py: 0.75,
              fontSize: MOBILE_MIN_FONT_SIZE,
              backgroundColor: isFocused
                ? rowSurfaceColor
                : isPremiumColumn
                  ? uiColors.primary
                  : rowSurfaceColor,
              color: isPremiumColumn && !isFocused ? "#FFFFFF" : "#5E5E5E",
              whiteSpace: "nowrap",
              cursor: isClickable ? "pointer" : "default",
              ...(isClickable ? staffScheduleFinancialFocusSx : null),
              "&:hover": isClickable ? { backgroundColor: uiTableColors.rowHover } : undefined,
            }}
          >
            <SmallFont
              data-financial-value
              aria-hidden={isFinancialBlurred}
              style={{
                display: "block",
                fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                lineHeight: "1.1",
                fontWeight: isPremiumColumn ? 700 : undefined,
                filter: isFinancialBlurred ? "blur(5px)" : undefined,
                userSelect: isFinancialBlurred ? "none" : undefined,
                pointerEvents: isFinancialBlurred ? "none" : undefined,
                ...(isClickable ? staffScheduleFinancialValueStyle : null),
              }}
            >
              {getSummaryCellValue(column, data)}
            </SmallFont>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

function MobileShiftCard({
  group,
  days,
  collapsed,
  onToggle,
  canEditSmena,
  onOpenEditSmena,
  isCalendarHidden,
  showFastActions,
  hasBulkSelection,
  onOpenBulkFastActions,
  useColors,
  selectedRowIds,
  onToggleRowSelection,
  onOpenMonth,
  onOpenDay,
  canOpenMonth,
  canOpenDayEdit,
  canEditTeamBonus,
  canEdit,
  selectedPart,
  onOpenSummaryAction,
  onChangeTeamBonusForUser,
  periodBonusState,
  summaryColumns,
  registerScrollContainer,
  onSynchronizedScroll,
  hideSelectionColumn,
  focusedRowKey,
  onToggleRowFocus,
  blurFinancials,
}) {
  const selectionColumnWidth = hideSelectionColumn ? 0 : MOBILE_SELECTION_COLUMN_WIDTH;
  const tableMinWidth =
    selectionColumnWidth +
    MOBILE_EMPLOYEE_COLUMN_WIDTH +
    (isCalendarHidden ? 0 : days.length * MOBILE_DAY_COLUMN_WIDTH) +
    summaryColumns.length * MOBILE_SUMMARY_COLUMN_WIDTH;

  return (
    <Box sx={mobileCardSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.75,
          backgroundColor: uiTableColors.shiftHeader,
          borderBottom: collapsed ? "none" : "1px solid #ECECEC",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => {
            if (canEditSmena && group?.smenaId) {
              onOpenEditSmena(group.smenaId);
            }
          }}
          sx={{
            border: "none",
            background: "transparent",
            p: 0,
            m: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canEditSmena && group?.smenaId ? "pointer" : "default",
          }}
        >
          <ScheduleRoundedIcon sx={{ fontSize: 20, color: "#3C3B3B" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ minWidth: 0, fontSize: 14, fontWeight: 500, color: "#4B5563" }}
            noWrap
          >
            {group?.label || "Смена"}
          </Typography>
          {Number.isInteger(group?.employeeCount) ? (
            <Typography
              sx={{ fontSize: 12, color: uiColors.textMuted, flexShrink: 0 }}
              noWrap
            >
              {formatEmployeeCount(group.employeeCount)}
            </Typography>
          ) : null}
        </Box>

        <IconButton
          size="small"
          onClick={() => onToggle(group.shiftId)}
          aria-label={collapsed ? "Развернуть смену" : "Свернуть смену"}
          sx={{
            width: 32,
            height: 32,
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
          }}
        >
          {collapsed ? <KeyboardArrowRightRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
        </IconButton>
      </Box>

      {!collapsed ? (
        <TableContainer
          ref={registerScrollContainer}
          data-mobile-synced-scroll
          onScroll={onSynchronizedScroll}
          sx={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table
            size="small"
            sx={{
              width: tableMinWidth,
              minWidth: tableMinWidth,
              transition: "width 180ms ease, min-width 180ms ease",
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderColor: "#EDEDED",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  data-mobile-selection-column
                  sx={{
                    ...mobileCellDividerSx,
                    ...getMobileFixedColumnSx(selectionColumnWidth),
                    p: 0,
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                    opacity: hideSelectionColumn ? 0 : 1,
                    transition:
                      "width 180ms ease, min-width 180ms ease, max-width 180ms ease, opacity 120ms ease",
                  }}
                >
                  {showFastActions &&
                  !hideSelectionColumn &&
                  String(group?.smenaId ?? "") !== "-1" ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 0.5 }}>
                      <Box
                        onClick={
                          showFastActions && hasBulkSelection ? onOpenBulkFastActions : undefined
                        }
                        sx={{
                          ...mobileActionCellSx,
                          cursor: showFastActions && hasBulkSelection ? "pointer" : "default",
                          backgroundColor:
                            showFastActions && hasBulkSelection
                              ? uiTableColors.bulkActionActive
                              : uiTableColors.bulkActionInactive,
                          opacity: showFastActions ? 1 : 0.4,
                        }}
                      >
                        <SwapHorizRoundedIcon
                          sx={{
                            color: showFastActions && hasBulkSelection ? "#EE2737" : "#666666",
                            fontSize: 18,
                          }}
                        />
                      </Box>
                    </Box>
                  ) : null}
                </TableCell>
                <TableCell
                  data-mobile-employee-column
                  sx={{
                    ...mobileCellDividerSx,
                    ...getMobileFixedColumnSx(MOBILE_EMPLOYEE_COLUMN_WIDTH),
                    ...getMobileStickyColumnSx(0, 5, true),
                    backgroundColor: "#FFFFFF",
                    py: 0.7,
                    px: 1,
                    fontWeight: 500,
                  }}
                >
                  Сотрудник
                </TableCell>
                {!isCalendarHidden
                  ? days.map((day, index) => {
                      const dayHeader = getMobileDayHeader(day);
                      const isWeekend = ["Пт", "Сб", "Вс"].includes(dayHeader.day);

                      return (
                        <TableCell
                          key={`${group.shiftId}-${day?.date || index}`}
                          data-mobile-day-column
                          align="center"
                          sx={{
                            ...mobileCellDividerSx,
                            ...getMobileFixedColumnSx(MOBILE_DAY_COLUMN_WIDTH),
                            backgroundColor: isWeekend ? uiTableColors.weekend : "#FFFFFF",
                            color: "#666666",
                            py: 0.7,
                            px: 0.25,
                          }}
                        >
                          <Stack spacing={0.25}>
                            <Typography sx={mobileDayHeaderTextSx}>{dayHeader.day}</Typography>
                            <Typography sx={mobileDayHeaderDateSx}>{dayHeader.date}</Typography>
                          </Stack>
                        </TableCell>
                      );
                    })
                  : null}
                {summaryColumns.map((column) => {
                  const canOpenTeamBonus =
                    column.key === "dop_bonus" &&
                    canEditTeamBonus &&
                    !blurFinancials &&
                    Boolean(onOpenSummaryAction);
                  const label = (
                    <SmallFont
                      style={{
                        display: "block",
                        fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                        lineHeight: "1.15",
                      }}
                    >
                      {column.label}
                    </SmallFont>
                  );
                  return (
                    <TableCell
                      key={`${group.shiftId}-summary-${column.key}`}
                      data-salary-header-cell
                      align="center"
                      sx={{
                        ...mobileCellDividerSx,
                        ...getMobileFixedColumnSx(MOBILE_SUMMARY_COLUMN_WIDTH),
                        py: 0.7,
                        px: 0.5,
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "normal",
                        overflowWrap: "normal",
                        hyphens: "none",
                      }}
                    >
                      {canOpenTeamBonus ? (
                        <Box
                          component="button"
                          type="button"
                          aria-label="Изменить командный бонус за выбранный период"
                          onClick={() => onOpenSummaryAction(null, "dop_bonus_toggle")}
                          sx={staffScheduleHeaderActionSx}
                        >
                          {label}
                        </Box>
                      ) : (
                        label
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {group.rows.map((row, index) => (
                <MobileScheduleRow
                  key={`mobile-row-${getScheduleRowFocusKey(row?.data) ?? `${group.shiftId}-${index}`}`}
                  row={row}
                  summaryColumns={summaryColumns}
                  isCalendarHidden={isCalendarHidden}
                  useColors={useColors}
                  selectedRowIds={selectedRowIds}
                  onToggleRowSelection={onToggleRowSelection}
                  onOpenMonth={onOpenMonth}
                  onOpenDay={onOpenDay}
                  canOpenMonth={canOpenMonth}
                  canOpenDayEdit={canOpenDayEdit}
                  canEditTeamBonus={canEditTeamBonus}
                  canEdit={canEdit}
                  selectedPart={selectedPart}
                  onOpenSummaryAction={onOpenSummaryAction}
                  onChangeTeamBonusForUser={onChangeTeamBonusForUser}
                  periodBonusState={periodBonusState}
                  hideSelectionColumn={hideSelectionColumn}
                  focusedRowKey={focusedRowKey}
                  onToggleRowFocus={onToggleRowFocus}
                  blurFinancials={blurFinancials}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}

function MobileSummaryCard({
  onOpenSummaryAction,
  summaryColumns,
  summaryTotals,
  totalsSummaryKeyMap,
  periodBonusSummaryKeyMap,
  canEditTeamBonus,
  periodBonusState,
  canShowPeriodSum,
  bonusDayValues,
  isCalendarHidden,
  canShowTotals,
  canShowRolls,
  canShowPizza,
  canShowSlowOrders,
  slowOrderValues,
  registerScrollContainer,
  onSynchronizedScroll,
  blurFinancials,
  hideSelectionColumn,
}) {
  const dayCount = isCalendarHidden ? 0 : bonusDayValues.length;
  const labelColumnWidth =
    MOBILE_EMPLOYEE_COLUMN_WIDTH + (hideSelectionColumn ? 0 : MOBILE_SELECTION_COLUMN_WIDTH);
  const cellTemplate = `${labelColumnWidth}px repeat(${dayCount}, ${MOBILE_DAY_COLUMN_WIDTH}px) repeat(${summaryColumns.length}, ${MOBILE_SUMMARY_COLUMN_WIDTH}px)`;
  const gridWidth =
    labelColumnWidth +
    dayCount * MOBILE_DAY_COLUMN_WIDTH +
    summaryColumns.length * MOBILE_SUMMARY_COLUMN_WIDTH;

  const renderMetricRow = (
    label,
    values,
    getValue,
    getSummaryValue,
    onSummaryCellClick,
    options = {},
  ) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: cellTemplate,
        width: gridWidth,
        minWidth: gridWidth,
        backgroundColor: options.fillColor || "#FFFFFF",
      }}
    >
      <Box
        sx={{
          ...mobileCellDividerSx,
          ...getMobileFixedColumnSx(labelColumnWidth),
          ...getMobileStickyColumnSx(0, 3, true),
          px: 1,
          py: 1,
          fontSize: 13,
          color: "#3C3B3B",
          backgroundColor: options.fillColor || "#FFFFFF",
        }}
      >
        {label}
      </Box>
      {!isCalendarHidden
        ? values.map((item, index) => (
            <Box
              key={`${label}-value-${index}`}
              sx={{
                ...mobileCellDividerSx,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.25,
                py: 1,
                fontSize: options.compactValues ? 13.2 : MOBILE_MIN_FONT_SIZE,
                color: options.textColor || "#5E5E5E",
                whiteSpace: options.compactValues ? "nowrap" : "normal",
              }}
            >
              <Box
                component="span"
                aria-hidden={options.blurValues}
                sx={{
                  display: "inline-block",
                  filter: options.blurValues ? "blur(5px)" : undefined,
                  userSelect: options.blurValues ? "none" : undefined,
                }}
              >
                {getValue(item)}
              </Box>
            </Box>
          ))
        : null}
      {summaryColumns.map((column) => (
        <Box
          key={`${label}-${column.key}`}
          onClick={
            !options.blurValues && onSummaryCellClick ? () => onSummaryCellClick(column) : undefined
          }
          sx={{
            ...mobileCellDividerSx,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 0.5,
            py: 1,
            fontSize: options.compactValues ? 13.2 : MOBILE_MIN_FONT_SIZE,
            color: options.textColor || "#5E5E5E",
            cursor: !options.blurValues && onSummaryCellClick ? "pointer" : "default",
          }}
        >
          <Box
            component="span"
            aria-hidden={options.blurValues}
            sx={{
              display: "inline-block",
              filter: options.blurValues ? "blur(5px)" : undefined,
              userSelect: options.blurValues ? "none" : undefined,
            }}
          >
            {getSummaryValue(column)}
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={mobileCardSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 1,
          py: 0.75,
          minHeight: 44,
          boxSizing: "border-box",
          backgroundColor: uiTableColors.shiftHeader,
          color: "#4B5563",
          borderBottom: "1px solid #ECECEC",
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: "center" }}
        >
          <SummarySectionIcon sx={{ fontSize: 20, color: "#3C3B3B" }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>
            Сводные данные
          </Typography>
        </Stack>
      </Box>

      <Box
        ref={registerScrollContainer}
        data-mobile-synced-scroll
        onScroll={onSynchronizedScroll}
        sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <Box sx={{ width: gridWidth, minWidth: gridWidth }}>
          {!isCalendarHidden ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: cellTemplate,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Box
                data-mobile-summary-label-column
                sx={{
                  ...mobileCellDividerSx,
                  ...getMobileFixedColumnSx(labelColumnWidth),
                  ...getMobileStickyColumnSx(0, 4, true),
                  px: 1,
                  py: 0.7,
                  fontWeight: 500,
                  backgroundColor: "#FFFFFF",
                }}
              >
                Показатель
              </Box>
              {bonusDayValues.map((item, index) => {
                const dayHeader = getMobileDayHeader(item);
                const isWeekend = ["Пт", "Сб", "Вс"].includes(dayHeader.day);

                return (
                  <Box
                    key={`summary-day-${item?.date || index}`}
                    data-mobile-day-column
                    sx={{
                      ...mobileCellDividerSx,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.25,
                      py: 0.7,
                      backgroundColor: isWeekend ? uiTableColors.weekend : "#FFFFFF",
                      color: "#666666",
                    }}
                  >
                    <Stack spacing={0.25}>
                      <Typography sx={mobileDayHeaderTextSx}>{dayHeader.day}</Typography>
                      <Typography sx={mobileDayHeaderDateSx}>{dayHeader.date}</Typography>
                    </Stack>
                  </Box>
                );
              })}
              {summaryColumns.map((column) => {
                const canOpenTeamBonus =
                  column.key === "dop_bonus" &&
                  canEditTeamBonus &&
                  !blurFinancials &&
                  Boolean(onOpenSummaryAction);
                const label = (
                  <SmallFont
                    style={{
                      display: "block",
                      fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                      lineHeight: "1.15",
                    }}
                  >
                    {column.label}
                  </SmallFont>
                );
                return (
                  <Box
                    key={`summary-column-${column.key}`}
                    sx={{
                      ...mobileCellDividerSx,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.5,
                      py: 0.7,
                      textAlign: "center",
                    }}
                  >
                    {canOpenTeamBonus ? (
                      <Box
                        component="button"
                        type="button"
                        aria-label="Изменить командный бонус за выбранный период"
                        onClick={() => onOpenSummaryAction(null, "dop_bonus_toggle")}
                        sx={staffScheduleHeaderActionSx}
                      >
                        {label}
                      </Box>
                    ) : (
                      label
                    )}
                  </Box>
                );
              })}
            </Box>
          ) : null}

          {canShowTotals || (!isCalendarHidden && canShowPeriodSum && bonusDayValues.length)
            ? renderMetricRow(
                "Сумма за период",
                bonusDayValues,
                (item) => item?.res ?? "",
                (column) => {
                  if (column.key === "dop_bonus" && canEditTeamBonus) {
                    if (!periodBonusState) {
                      return "+ / -";
                    }

                    return Number(periodBonusState) === 1 ? "+" : "−";
                  }

                  const summaryKey = totalsSummaryKeyMap[column.key];
                  if (summaryKey) {
                    return summaryTotals?.[summaryKey] ?? "";
                  }

                  const periodBonusKey = periodBonusSummaryKeyMap[column.key];
                  return periodBonusKey ? (summaryTotals?.[periodBonusKey] ?? "") : "";
                },
                canEditTeamBonus
                  ? (column) => {
                      if (column.key === "dop_bonus") {
                        onOpenSummaryAction?.(null, "dop_bonus_toggle");
                      }
                    }
                  : undefined,
                {
                  compactValues: true,
                  fillColor: "#9BDD7C",
                  textColor: "#5E5E5E",
                  blurValues: blurFinancials,
                },
              )
            : null}

          {!isCalendarHidden && canShowRolls
            ? renderMetricRow(
                "Роллы",
                bonusDayValues,
                (item) => item?.count_rolls ?? "",
                () => "",
              )
            : null}

          {!isCalendarHidden && canShowPizza
            ? renderMetricRow(
                "Пицца",
                bonusDayValues,
                (item) => item?.count_pizza ?? "",
                () => "",
              )
            : null}

          {!isCalendarHidden && canShowSlowOrders
            ? renderMetricRow(
                "Заказы готовились более 40 минут",
                slowOrderValues,
                (item) => item?.count_false ?? "",
                () => "",
              )
            : null}
        </Box>
      </Box>
    </Box>
  );
}

function MobileSelectionBar({ selectedCount, onClearSelection, onOpenBulkFastActions }) {
  if (!selectedCount) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.75,
        borderRadius: "18px",
        backgroundColor: "rgba(98, 98, 98, 0.96)",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          px: 0.75,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {`Выбрано: ${selectedCount}`}
      </Typography>

      <JacoButton
        tone="secondary"
        onClick={onClearSelection}
        sx={{
          minHeight: 40,
          px: 1.5,
          borderRadius: "12px",
          border: "none",
          backgroundColor: "#FFFFFF",
          color: "#666666",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
          "&:hover": {
            backgroundColor: "#F6F6F6",
            border: "none",
          },
        }}
      >
        Снять
      </JacoButton>

      <JacoButton
        onClick={onOpenBulkFastActions}
        startIcon={<SwapHorizRoundedIcon sx={{ fontSize: 18 }} />}
        sx={{
          minHeight: 40,
          px: 2,
          borderRadius: "12px",
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        Редактирование
      </JacoButton>
    </Box>
  );
}

export default function StaffScheduleMobileTableSection({
  shownShiftCount,
  rows,
  days,
  collapsedShiftIds,
  onToggleShiftCollapse,
  canEditSmena,
  onOpenEditSmena,
  isCalendarHidden,
  showFastActions,
  hasBulkSelection,
  onOpenBulkFastActions,
  onOpenSelectedFastActions,
  useColors,
  selectedRowIds,
  onToggleRowSelection,
  onClearRowSelection,
  onOpenMonth,
  onOpenDay,
  canOpenMonth,
  canOpenDayEdit,
  hasSummaryRows,
  onOpenSummaryAction,
  summaryColumns,
  summaryTotals,
  totalsSummaryKeyMap,
  periodBonusSummaryKeyMap,
  canEditTeamBonus,
  canEdit,
  selectedPart,
  onChangeTeamBonusForUser,
  periodBonusState,
  canShowPeriodSum,
  bonusDayValues,
  canShowTotals,
  canShowRolls,
  canShowPizza,
  canShowSlowOrders,
  slowOrderValues,
  isEmployeeSearchActive = false,
  focusedRowKey,
  onToggleRowFocus,
  blurFinancials,
}) {
  const mobileShiftGroups = buildMobileShiftGroups(rows);
  const selectedCount = selectedRowIds.length;
  const scrollRootRef = useRef(null);
  const sharedScrollLeftRef = useRef(0);
  const [isHorizontallyScrolled, setIsHorizontallyScrolled] = useState(false);
  const registerScrollContainer = useCallback((node) => {
    if (node) {
      node.scrollLeft = sharedScrollLeftRef.current;
    }
  }, []);
  const handleSynchronizedScroll = useCallback((event) => {
    const source = event.currentTarget;
    const nextScrollLeft = source.scrollLeft;

    sharedScrollLeftRef.current = nextScrollLeft;
    setIsHorizontallyScrolled(nextScrollLeft > 1);
    scrollRootRef.current?.querySelectorAll("[data-mobile-synced-scroll]").forEach((container) => {
      if (container !== source && Math.abs(container.scrollLeft - nextScrollLeft) > 0.5) {
        container.scrollLeft = nextScrollLeft;
      }
    });
  }, []);

  return (
    <>
      <Box ref={scrollRootRef}>
        <JacoSurface
          sx={{
            borderRadius: CONTROL_RADIUS,
            overflow: "hidden",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{ p: 1.5 }}
          >
            <Stack spacing={0.25}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase" }}>
                График смен
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#666666" }}>
                Показано • {shownShiftCount} смен
              </Typography>
            </Stack>

            <Stack spacing={1.25}>
              {isEmployeeSearchActive && !mobileShiftGroups.length ? (
                <Box sx={{ py: 2, textAlign: "center", color: uiColors.textMuted, fontSize: 13 }}>
                  Сотрудники не найдены
                </Box>
              ) : null}

              {mobileShiftGroups.map((group) => (
                <MobileShiftCard
                  key={group.key}
                  group={group}
                  days={days}
                  collapsed={collapsedShiftIds.includes(group.shiftId)}
                  onToggle={onToggleShiftCollapse}
                  canEditSmena={canEditSmena}
                  onOpenEditSmena={onOpenEditSmena}
                  isCalendarHidden={isCalendarHidden}
                  showFastActions={showFastActions}
                  hasBulkSelection={hasBulkSelection}
                  onOpenBulkFastActions={onOpenBulkFastActions}
                  useColors={useColors}
                  selectedRowIds={selectedRowIds}
                  onToggleRowSelection={onToggleRowSelection}
                  onOpenMonth={onOpenMonth}
                  onOpenDay={onOpenDay}
                  canOpenMonth={canOpenMonth}
                  canOpenDayEdit={canOpenDayEdit}
                  canEditTeamBonus={canEditTeamBonus}
                  canEdit={canEdit}
                  selectedPart={selectedPart}
                  onOpenSummaryAction={onOpenSummaryAction}
                  onChangeTeamBonusForUser={onChangeTeamBonusForUser}
                  periodBonusState={periodBonusState}
                  summaryColumns={summaryColumns}
                  registerScrollContainer={registerScrollContainer}
                  onSynchronizedScroll={handleSynchronizedScroll}
                  hideSelectionColumn={!showFastActions || isHorizontallyScrolled}
                  focusedRowKey={focusedRowKey}
                  onToggleRowFocus={onToggleRowFocus}
                  blurFinancials={blurFinancials}
                />
              ))}

              {hasSummaryRows ? (
                <MobileSummaryCard
                  onOpenSummaryAction={onOpenSummaryAction}
                  summaryColumns={summaryColumns}
                  summaryTotals={summaryTotals}
                  totalsSummaryKeyMap={totalsSummaryKeyMap}
                  periodBonusSummaryKeyMap={periodBonusSummaryKeyMap}
                  canEditTeamBonus={canEditTeamBonus}
                  periodBonusState={periodBonusState}
                  canShowPeriodSum={canShowPeriodSum}
                  bonusDayValues={bonusDayValues}
                  isCalendarHidden={isCalendarHidden}
                  canShowTotals={canShowTotals}
                  canShowRolls={canShowRolls}
                  canShowPizza={canShowPizza}
                  canShowSlowOrders={canShowSlowOrders}
                  slowOrderValues={slowOrderValues}
                  registerScrollContainer={registerScrollContainer}
                  onSynchronizedScroll={handleSynchronizedScroll}
                  blurFinancials={blurFinancials}
                  hideSelectionColumn={!showFastActions || isHorizontallyScrolled}
                />
              ) : null}
            </Stack>
          </Stack>
        </JacoSurface>
      </Box>

      {showFastActions ? (
        <MobileSelectionBar
          selectedCount={selectedCount}
          onClearSelection={onClearRowSelection}
          onOpenBulkFastActions={onOpenSelectedFastActions}
        />
      ) : null}
    </>
  );
}
