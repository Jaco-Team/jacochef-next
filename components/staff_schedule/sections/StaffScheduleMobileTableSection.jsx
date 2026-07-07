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
import SmallFont from "@/ui/SmallFont";
import { SummarySectionIcon } from "@/ui/icons";
import { V2Button, V2Checkbox, V2Surface, v2TableColors } from "@/ui/v2";
import { CONTROL_RADIUS, DAY_COLUMN_WIDTH } from "../staffScheduleConstants";
import { getRowBaseColor, getSummaryCellValue, toArray } from "../staffScheduleHelpers";

const MOBILE_SELECTION_COLUMN_WIDTH = 34;
const MOBILE_EMPLOYEE_COLUMN_WIDTH = 150;
const MOBILE_SUMMARY_LABEL_WIDTH = 140;
const MOBILE_SUMMARY_COLUMN_WIDTH = 76;
const MOBILE_CARD_BORDER = "1px solid #ECECEC";
const MOBILE_CARD_RADIUS = "14px";

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
  border: `1px solid ${v2TableColors.bulkActionBorder}`,
  borderRadius: "8px",
};

const mobileDayHeaderTextSx = {
  fontSize: 11,
  lineHeight: 1,
};

const mobileDayHeaderDateSx = {
  fontSize: 12,
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
}) {
  const data = row?.data ?? {};
  const rowId = data?.id ? String(data.id) : "";
  const isSelected = selectedRowIds.includes(rowId);
  const baseColors = useColors
    ? getRowBaseColor(data?.type, Boolean(row?.color))
    : { backgroundColor: "#ffffff", color: "#000000" };
  const rowSurfaceColor = isSelected
    ? v2TableColors.rowSelected
    : row?.color
      ? v2TableColors.rowMuted
      : "#ffffff";
  const employeeCellColor = isSelected ? v2TableColors.rowSelected : baseColors.backgroundColor;
  const employeeMetaColor =
    baseColors.color === "#ffffff" ? "rgba(255, 255, 255, 0.82)" : "#666666";
  const canOpenDay = Boolean(onOpenDay) && canOpenDayEdit && String(data?.smena_id ?? "") !== "-1";

  return (
    <TableRow sx={{ backgroundColor: rowSurfaceColor }}>
      <TableCell
        sx={{
          ...mobileCellDividerSx,
          width: MOBILE_SELECTION_COLUMN_WIDTH,
          minWidth: MOBILE_SELECTION_COLUMN_WIDTH,
          maxWidth: MOBILE_SELECTION_COLUMN_WIDTH,
          p: 0,
          backgroundColor: rowSurfaceColor,
          verticalAlign: "middle",
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
          <V2Checkbox
            checked={isSelected}
            onChange={() => onToggleRowSelection(rowId)}
            disabled={!rowId || String(data?.smena_id ?? "") === "-1"}
          />
        </Box>
      </TableCell>

      <TableCell
        sx={{
          ...mobileCellDividerSx,
          minWidth: MOBILE_EMPLOYEE_COLUMN_WIDTH,
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
          sx={{ mt: 0.25, fontSize: 12, lineHeight: 1.2, color: employeeMetaColor }}
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
                  width: DAY_COLUMN_WIDTH,
                  minWidth: DAY_COLUMN_WIDTH,
                  px: 0.25,
                  py: 0.75,
                  fontSize: 12,
                  fontWeight: 500,
                  background: isHoliday
                    ? `repeating-linear-gradient(-45deg, ${baseBackground}, ${baseBackground} 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)`
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
          sx={{
            ...mobileCellDividerSx,
            width: MOBILE_SUMMARY_COLUMN_WIDTH,
            minWidth: MOBILE_SUMMARY_COLUMN_WIDTH,
            px: 0.5,
            py: 0.75,
            fontSize: 11,
            backgroundColor: rowSurfaceColor,
            color: "#5E5E5E",
            whiteSpace: "nowrap",
          }}
        >
          <SmallFont
            style={{
              display: "block",
              fontSize: "10px",
              lineHeight: "1.1",
            }}
          >
            {getSummaryCellValue(column, data)}
          </SmallFont>
        </TableCell>
      ))}
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
  summaryColumns,
}) {
  const tableMinWidth =
    MOBILE_SELECTION_COLUMN_WIDTH +
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
          backgroundColor: v2TableColors.shiftHeader,
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
          sx={{ borderRadius: "8px", backgroundColor: "#FFFFFF" }}
        >
          {collapsed ? <KeyboardArrowRightRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
        </IconButton>
      </Box>

      {!collapsed ? (
        <TableContainer
          sx={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: tableMinWidth,
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
                  sx={{
                    ...mobileCellDividerSx,
                    width: MOBILE_SELECTION_COLUMN_WIDTH,
                    minWidth: MOBILE_SELECTION_COLUMN_WIDTH,
                    p: 0,
                    backgroundColor: "#FFFFFF",
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
                            ? v2TableColors.bulkActionActive
                            : v2TableColors.bulkActionInactive,
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
                  sx={{
                    ...mobileCellDividerSx,
                    minWidth: MOBILE_EMPLOYEE_COLUMN_WIDTH,
                    py: 0.7,
                    px: 1,
                    fontWeight: 500,
                  }}
                >
                  Сотрудник
                </TableCell>
                {!isCalendarHidden
                  ? days.map((day, index) => (
                      <TableCell
                        key={`${group.shiftId}-${day?.date || index}`}
                        align="center"
                        sx={{
                          ...mobileCellDividerSx,
                          width: DAY_COLUMN_WIDTH,
                          minWidth: DAY_COLUMN_WIDTH,
                          backgroundColor:
                            day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                              ? v2TableColors.weekend
                              : "#FFFFFF",
                          color: "#666666",
                          py: 0.7,
                          px: 0.25,
                        }}
                      >
                        <Stack spacing={0.25}>
                          <Typography sx={mobileDayHeaderTextSx}>{day?.day ?? ""}</Typography>
                          <Typography sx={mobileDayHeaderDateSx}>{day?.date ?? ""}</Typography>
                        </Stack>
                      </TableCell>
                    ))
                  : null}
                {summaryColumns.map((column) => (
                  <TableCell
                    key={`${group.shiftId}-summary-${column.key}`}
                    align="center"
                    sx={{
                      ...mobileCellDividerSx,
                      width: MOBILE_SUMMARY_COLUMN_WIDTH,
                      minWidth: MOBILE_SUMMARY_COLUMN_WIDTH,
                      py: 0.7,
                      px: 0.5,
                      textAlign: "center",
                    }}
                  >
                    <SmallFont style={{ display: "block", fontSize: "10px", lineHeight: "1.1" }}>
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
                fontSize: options.compactValues ? 13.2 : 12,
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
            fontSize: options.compactValues ? 13.2 : 12,
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
          py: 0.9,
          backgroundColor: v2TableColors.sectionHeader,
          color: "#FFFFFF",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
        >
          <SummarySectionIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>
            Сводные данные
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Box sx={{ minWidth: gridWidth }}>
          {!isCalendarHidden ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: cellTemplate,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Box sx={{ ...mobileCellDividerSx, px: 1, py: 0.7, fontWeight: 500 }}>Показатель</Box>
              {bonusDayValues.map((item, index) => (
                <Box
                  key={`summary-day-${item?.date || index}`}
                  sx={{
                    ...mobileCellDividerSx,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.25,
                    py: 0.7,
                    backgroundColor:
                      item?.day === "Пт" || item?.day === "Сб" || item?.day === "Вс"
                        ? v2TableColors.weekend
                        : "#FFFFFF",
                    color: "#666666",
                  }}
                >
                  <Stack spacing={0.25}>
                    <Typography sx={mobileDayHeaderTextSx}>{item?.day ?? ""}</Typography>
                    <Typography sx={mobileDayHeaderDateSx}>{item?.date ?? ""}</Typography>
                  </Stack>
                </Box>
              ))}
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
                  <SmallFont style={{ display: "block", fontSize: "10.5px", lineHeight: "1.15" }}>
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

      <V2Button
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
      </V2Button>

      <V2Button
        onClick={onOpenBulkFastActions}
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
      </V2Button>
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
  periodBonusState,
  canShowPeriodSum,
  bonusDayValues,
  canShowTotals,
  canShowRolls,
  canShowPizza,
  canShowSlowOrders,
  slowOrderValues,
}) {
  const mobileShiftGroups = buildMobileShiftGroups(rows);
  const selectedCount = selectedRowIds.length;

  return (
    <>
      <V2Surface
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
                summaryColumns={summaryColumns}
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
              />
            ) : null}
          </Stack>
        </Stack>
      </V2Surface>

      {showFastActions ? (
        <MobileSelectionBar
          selectedCount={selectedCount}
          onClearSelection={onClearRowSelection}
          onOpenBulkFastActions={onOpenBulkFastActions}
        />
      ) : null}
    </>
  );
}
