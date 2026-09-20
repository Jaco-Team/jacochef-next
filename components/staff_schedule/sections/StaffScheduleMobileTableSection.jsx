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
import { CONTROL_RADIUS, DAY_COLUMN_WIDTH } from "../staffScheduleConstants";
import { getRowBaseColor, getSummaryCellValue, toArray } from "../staffScheduleHelpers";
import { getHolidayStripeSx } from "../staffSchedulePatterns";

const MOBILE_SELECTION_COLUMN_WIDTH = 34;
const MOBILE_EMPLOYEE_COLUMN_WIDTH = 150;
const MOBILE_SUMMARY_LABEL_WIDTH = MOBILE_SELECTION_COLUMN_WIDTH + MOBILE_EMPLOYEE_COLUMN_WIDTH;
const MOBILE_SUMMARY_COLUMN_WIDTH = 76;
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
  onChangeTeamBonusForUser,
  periodBonusState,
  hideSelectionColumn,
}) {
  const data = row?.data ?? {};
  const selectionColumnWidth = hideSelectionColumn ? 0 : MOBILE_SELECTION_COLUMN_WIDTH;
  const rowId = data?.id ? String(data.id) : "";
  const isSelected = selectedRowIds.includes(rowId);
  const baseColors = useColors
    ? getRowBaseColor(data?.type, Boolean(row?.color))
    : { backgroundColor: "#ffffff", color: "#000000" };
  const rowSurfaceColor = isSelected
    ? uiTableColors.rowSelected
    : row?.color
      ? uiTableColors.rowMuted
      : "#ffffff";
  const employeeCellColor = isSelected ? uiTableColors.rowSelected : baseColors.backgroundColor;
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
          <JacoCheckbox
            checked={isSelected}
            onChange={() => onToggleRowSelection(rowId)}
            disabled={!rowId || String(data?.smena_id ?? "") === "-1"}
          />
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
          color: baseColors.color,
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
          sx={{
            mt: 0.25,
            fontSize: MOBILE_MIN_FONT_SIZE,
            lineHeight: 1.2,
            color: employeeMetaColor,
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
            const hasExplicitDayColor = useColors && Boolean(info?.color) && !row?.color;
            const baseBackground = hasExplicitDayColor ? info.color : rowSurfaceColor;
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
                  ...mobileCellDividerSx,
                  ...getMobileFixedColumnSx(DAY_COLUMN_WIDTH),
                  px: 0.25,
                  py: 0.75,
                  fontSize: MOBILE_MIN_FONT_SIZE,
                  fontWeight: 500,
                  ...(isHoliday
                    ? getHolidayStripeSx(baseBackground, index, DAY_COLUMN_WIDTH)
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
        const canEditDopBonus =
          column.key === "dop_bonus" &&
          canEditTeamBonus &&
          [1, 2].includes(Number(periodBonusState)) &&
          Number(data?.check_period) === 1 &&
          String(data?.smena_id ?? "") !== "-1";
        const isPremiumColumn = column.key === "test_all_price" && column.accessKey === "premia";

        return (
          <TableCell
            key={`${data?.id || data?.user_name}-${column.key}`}
            align="center"
            onClick={canEditDopBonus ? () => onChangeTeamBonusForUser?.(data) : undefined}
            sx={{
              ...mobileCellDividerSx,
              ...getMobileFixedColumnSx(MOBILE_SUMMARY_COLUMN_WIDTH),
              px: 0.5,
              py: 0.75,
              fontSize: MOBILE_MIN_FONT_SIZE,
              backgroundColor: isPremiumColumn ? uiColors.primary : rowSurfaceColor,
              color: isPremiumColumn ? "#FFFFFF" : "#5E5E5E",
              whiteSpace: "nowrap",
              cursor: canEditDopBonus ? "pointer" : "default",
              "&:hover": canEditDopBonus ? { backgroundColor: uiTableColors.rowHover } : undefined,
            }}
          >
            <SmallFont
              style={{
                display: "block",
                fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                lineHeight: "1.1",
                fontWeight: isPremiumColumn ? 700 : undefined,
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
  onChangeTeamBonusForUser,
  periodBonusState,
  summaryColumns,
  registerScrollContainer,
  onSynchronizedScroll,
  hideSelectionColumn,
}) {
  const selectionColumnWidth = hideSelectionColumn ? 0 : MOBILE_SELECTION_COLUMN_WIDTH;
  const tableMinWidth =
    selectionColumnWidth +
    MOBILE_EMPLOYEE_COLUMN_WIDTH +
    (isCalendarHidden ? 0 : days.length * DAY_COLUMN_WIDTH) +
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

        <Typography
          sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, color: "#4B5563" }}
          noWrap
        >
          {group?.label || "Смена"}
        </Typography>

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
                            ...getMobileFixedColumnSx(DAY_COLUMN_WIDTH),
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
                {summaryColumns.map((column) => (
                  <TableCell
                    key={`${group.shiftId}-summary-${column.key}`}
                    align="center"
                    sx={{
                      ...mobileCellDividerSx,
                      ...getMobileFixedColumnSx(MOBILE_SUMMARY_COLUMN_WIDTH),
                      py: 0.7,
                      px: 0.5,
                      textAlign: "center",
                    }}
                  >
                    <SmallFont
                      style={{
                        display: "block",
                        fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                        lineHeight: "1.15",
                      }}
                    >
                      {column.label}
                    </SmallFont>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {group.rows.map((row, index) => (
                <MobileScheduleRow
                  key={`mobile-row-${group.shiftId}-${row?.data?.id ?? "no-id"}-${row?.data?.smena_id ?? "no-smena"}-${index}`}
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
                  onChangeTeamBonusForUser={onChangeTeamBonusForUser}
                  periodBonusState={periodBonusState}
                  hideSelectionColumn={hideSelectionColumn}
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
}) {
  const dayCount = isCalendarHidden ? 0 : bonusDayValues.length;
  const labelColumnWidth = `${MOBILE_SUMMARY_LABEL_WIDTH}px`;
  const cellTemplate = `${labelColumnWidth} repeat(${dayCount}, ${DAY_COLUMN_WIDTH}px) repeat(${summaryColumns.length}, ${MOBILE_SUMMARY_COLUMN_WIDTH}px)`;
  const gridWidth =
    MOBILE_SUMMARY_LABEL_WIDTH +
    dayCount * DAY_COLUMN_WIDTH +
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
      <Box sx={{ ...mobileCellDividerSx, px: 1, py: 1, fontSize: 13, color: "#3C3B3B" }}>
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
              {getValue(item)}
            </Box>
          ))
        : null}
      {summaryColumns.map((column) => (
        <Box
          key={`${label}-${column.key}`}
          onClick={onSummaryCellClick ? () => onSummaryCellClick(column) : undefined}
          sx={{
            ...mobileCellDividerSx,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 0.5,
            py: 1,
            fontSize: options.compactValues ? 13.2 : MOBILE_MIN_FONT_SIZE,
            color: options.textColor || "#5E5E5E",
            cursor: onSummaryCellClick ? "pointer" : "default",
          }}
        >
          {getSummaryValue(column)}
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
          alignItems="center"
          spacing={0.75}
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
                sx={{ ...mobileCellDividerSx, px: 1, py: 0.7, fontWeight: 500 }}
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
              {summaryColumns.map((column) => (
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
                  <SmallFont
                    style={{
                      display: "block",
                      fontSize: `${MOBILE_MIN_FONT_SIZE}px`,
                      lineHeight: "1.15",
                    }}
                  >
                    {column.label}
                  </SmallFont>
                </Box>
              ))}
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
                  onChangeTeamBonusForUser={onChangeTeamBonusForUser}
                  periodBonusState={periodBonusState}
                  summaryColumns={summaryColumns}
                  registerScrollContainer={registerScrollContainer}
                  onSynchronizedScroll={handleSynchronizedScroll}
                  hideSelectionColumn={isHorizontallyScrolled}
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
