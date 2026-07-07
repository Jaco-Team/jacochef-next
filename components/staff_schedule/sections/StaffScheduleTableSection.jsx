import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
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
import {
  V2Button,
  V2Checkbox,
  V2FieldSwitch,
  V2IconButton,
  V2Surface,
  v2Colors,
  v2TableColors,
} from "@/ui/v2";
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
  createStaffSchedulePolicy,
  getRowBaseColor,
  getSummaryCellValue,
  hasFastActionsAccess,
  toArray,
} from "../staffScheduleHelpers";
import StaffScheduleMobileTableSection from "./StaffScheduleMobileTableSection";

const stickyBaseSx = {
  position: "sticky",
};

const tableCellDividerSx = {
  boxShadow: "inset -1px 0 0 #ECECEC, inset 0 -1px 0 #ECECEC",
  backgroundClip: "padding-box",
};

const stickyBoundarySx = {
  boxShadow:
    "inset -1px 0 0 #E2E8F0, inset 0 -1px 0 #ECECEC, 10px 0 14px -14px rgba(15, 23, 42, 0.45)",
};

const stickyCellSx = (width, left, zIndex, backgroundColor = "#ffffff") => ({
  ...stickyBaseSx,
  ...tableCellDividerSx,
  left,
  zIndex,
  width,
  minWidth: width,
  maxWidth: width,
  boxSizing: "border-box",
  backgroundColor,
  overflow: "hidden",
});

function ScheduleTableHeaderRow({
  days,
  summaryColumns,
  hasBulkSelection,
  showFastActions,
  isCalendarHidden,
  positionHeaderLeft,
  onOpenBulkFastActions,
  stickyZIndex = 6,
}) {
  return (
    <TableRow sx={{ backgroundColor: "#ffffff" }}>
      <TableCell
        sx={{
          ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, stickyZIndex),
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
            onClick={hasBulkSelection && showFastActions ? onOpenBulkFastActions : undefined}
            sx={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${v2TableColors.bulkActionBorder}`,
              borderRadius: "4px",
              cursor: hasBulkSelection && showFastActions ? "pointer" : "default",
              pointerEvents: hasBulkSelection && showFastActions ? "auto" : "none",
              opacity: hasBulkSelection && showFastActions ? 1 : 0.3,
              backgroundColor:
                hasBulkSelection && showFastActions
                  ? v2TableColors.bulkActionActive
                  : v2TableColors.bulkActionInactive,
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
          ...stickyCellSx(EMPLOYEE_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH, stickyZIndex),
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        Сотрудник
      </TableCell>
      <TableCell
        sx={{
          ...stickyCellSx(POSITION_COLUMN_WIDTH, positionHeaderLeft, stickyZIndex),
          fontWeight: 500,
          ...(showFastActions ? null : stickyBoundarySx),
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
              stickyZIndex,
            ),
            ...stickyBoundarySx,
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
                ...tableCellDividerSx,
                minWidth: DAY_COLUMN_WIDTH,
                backgroundColor:
                  day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                    ? v2TableColors.weekend
                    : "#ffffff",
                fontWeight: 500,
                color: "#666666",
                py: 1,
                px: 0.25,
              }}
            >
              <Stack spacing={0.25}>
                <Typography sx={{ fontSize: 12, lineHeight: 1 }}>{day?.day ?? ""}</Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.1 }}>{day?.date ?? ""}</Typography>
              </Stack>
            </TableCell>
          ))
        : null}

      {summaryColumns.map((column) => (
        <TableCell
          key={`head-bottom-${column.key}`}
          align="center"
          sx={{
            ...tableCellDividerSx,
            minWidth: SUMMARY_COLUMN_WIDTH,
            fontWeight: 700,
            fontSize: 10.5,
            lineHeight: 1.15,
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            verticalAlign: "middle",
            py: 0.75,
            px: 0.5,
          }}
        >
          <SmallFont
            style={{
              display: "block",
              fontSize: "10.5px",
              lineHeight: "1.15",
              textAlign: "center",
            }}
          >
            {column.label}
          </SmallFont>
        </TableCell>
      ))}
    </TableRow>
  );
}

function ScheduleTableColGroup({ dayCount, summaryColumnCount, showFastActions }) {
  return (
    <colgroup>
      <col style={{ width: SELECTION_COLUMN_WIDTH }} />
      <col style={{ width: EMPLOYEE_COLUMN_WIDTH }} />
      <col style={{ width: POSITION_COLUMN_WIDTH }} />
      {showFastActions ? <col style={{ width: ACTION_COLUMN_WIDTH }} /> : null}
      {Array.from({ length: dayCount }).map((_, index) => (
        <col
          key={`day-col-${index}`}
          style={{ width: DAY_COLUMN_WIDTH }}
        />
      ))}
      {Array.from({ length: summaryColumnCount }).map((_, index) => (
        <col
          key={`summary-col-${index}`}
          style={{ width: SUMMARY_COLUMN_WIDTH }}
        />
      ))}
    </colgroup>
  );
}

function ScheduleRow({
  row,
  summaryColumns,
  onOpenDay,
  onOpenMonth,
  onOpenFastActions,
  onOpenSummaryAction,
  onRemoveTeamBonusFromUser,
  canOpenMonth,
  canOpenDayEdit,
  canEdit,
  selectedPart,
  showFastActions,
  isCalendarHidden,
  useColors,
  selectedRowIds,
  onToggleRowSelection,
}) {
  const [hoverMode, setHoverMode] = useState(null);
  const data = row?.data ?? {};
  const rowId = data?.id ? String(data.id) : "";
  const isSelected = selectedRowIds.includes(rowId);
  const baseColors = useColors
    ? getRowBaseColor(data?.type, Boolean(row?.color))
    : { backgroundColor: "#ffffff", color: "#000000" };
  const isFullRowHighlighted = isSelected || hoverMode === "row";
  const rowSurfaceColor = isFullRowHighlighted
    ? v2TableColors.rowSelected
    : row?.color
      ? v2TableColors.rowMuted
      : v2Colors.surface;
  const employeeCellColor = isFullRowHighlighted
    ? v2TableColors.rowSelected
    : hoverMode === "name"
      ? v2TableColors.nameHover
      : baseColors.backgroundColor;
  const canOpenDay = Boolean(onOpenDay) && canOpenDayEdit && String(data?.smena_id ?? "") !== "-1";
  const canUseFastActions =
    showFastActions && Boolean(onOpenFastActions) && String(data?.smena_id ?? "") !== "-1";
  const positionStickyLeft = SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH;

  return (
    <TableRow>
      <TableCell
        padding="checkbox"
        className="checkBox"
        sx={{
          ...stickyCellSx(SELECTION_COLUMN_WIDTH, 0, 5, rowSurfaceColor),
          p: 0,
        }}
        onMouseEnter={() => setHoverMode("row")}
        onMouseLeave={() => setHoverMode(null)}
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
          ...stickyCellSx(EMPLOYEE_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH, 5, employeeCellColor),
          color: baseColors.color,
          fontWeight: 500,
          py: 0.9,
          px: 1.5,
          cursor: canOpenMonth ? "pointer" : "default",
        }}
        onMouseEnter={() => setHoverMode("name")}
        onMouseLeave={() => setHoverMode(null)}
        onClick={canOpenMonth ? () => onOpenMonth(data) : undefined}
      >
        <Typography
          sx={{ fontSize: 14, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden" }}
          noWrap
        >
          {data?.user_name || "Без имени"}
        </Typography>
      </TableCell>

      <TableCell
        sx={{
          ...stickyCellSx(POSITION_COLUMN_WIDTH, positionStickyLeft, 5, rowSurfaceColor),
          ...(showFastActions ? null : stickyBoundarySx),
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
            ...stickyCellSx(
              ACTION_COLUMN_WIDTH,
              positionStickyLeft + POSITION_COLUMN_WIDTH,
              5,
              rowSurfaceColor,
            ),
            ...stickyBoundarySx,
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
                  ...tableCellDividerSx,
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

      {summaryColumns.map((column) =>
        (() => {
          const isDriver = data?.app_type === "driver";
          const canEditPrice =
            column.key === "price_p_h" && canEdit("1h") && toArray(data?.price_arr).length;
          const canEditGiven = column.key === "given" && canEdit("given") && !isDriver;
          const canEditGivenCart =
            column.key === "given_cart" && canEdit("given_cart") && !isDriver;
          const canEditWithheld = column.key === "withheld" && canEdit("withheld");
          const canEditDirBonus =
            column.key === "my_bonus" &&
            canEdit("bonus") &&
            Number(selectedPart) === 1 &&
            data?.app_type === "dir";
          const canEditDopBonus =
            column.key === "dop_bonus" &&
            canEdit("com_bonus") &&
            Number(data?.check_period) === 1 &&
            String(data?.smena_id ?? "") !== "-1";
          const isClickable =
            canEditPrice ||
            canEditGiven ||
            canEditGivenCart ||
            canEditWithheld ||
            canEditDirBonus ||
            canEditDopBonus;

          const handleClick = () => {
            if (canEditDopBonus) {
              onRemoveTeamBonusFromUser?.(data);
              return;
            }

            if (isClickable) {
              onOpenSummaryAction?.(data, column.key);
            }
          };

          return (
            <TableCell
              key={`${data?.id || data?.user_name}-${column.key}`}
              align="center"
              onClick={isClickable ? handleClick : undefined}
              sx={{
                ...tableCellDividerSx,
                minWidth: SUMMARY_COLUMN_WIDTH,
                fontSize: 11.5,
                px: 0.75,
                cursor: isClickable ? "pointer" : "default",
                backgroundColor:
                  isFullRowHighlighted || !canEditDirBonus
                    ? rowSurfaceColor
                    : v2TableColors.rowHover,
                "&:hover": isClickable
                  ? {
                      backgroundColor: isFullRowHighlighted
                        ? rowSurfaceColor
                        : canEditDirBonus
                          ? "#DCDCDC"
                          : "#F7F7F7",
                    }
                  : undefined,
              }}
            >
              {getSummaryCellValue(column, data)}
            </TableCell>
          );
        })(),
      )}
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
  const headerBg = v2TableColors.shiftHeader;

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
            <ScheduleRoundedIcon sx={{ fontSize: 20, color: "#3C3B3B" }} />
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
            ...tableCellDividerSx,
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
          ...tableCellDividerSx,
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

function SummaryMetricRow({
  label,
  values,
  summaryColumns,
  stickyColumnCount,
  labelWidth,
  compactValues = false,
  fillColor = "#ffffff",
  textColor = "#5E5E5E",
  getValue,
  getSummaryValue,
  onSummaryCellClick,
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={stickyColumnCount}
        sx={{
          ...tableCellDividerSx,
          minWidth: labelWidth,
          fontSize: 14,
          lineHeight: 1.3,
          color: "#3C3B3B",
          py: 1.25,
          px: 1.25,
          whiteSpace: "normal",
        }}
      >
        {label}
      </TableCell>

      {values.map((item, index) => (
        <TableCell
          key={`${label}-${index}`}
          align="center"
          className={compactValues ? "min_block min_size" : "min_block"}
          sx={{
            ...tableCellDividerSx,
            minWidth: DAY_COLUMN_WIDTH,
            px: 0.25,
            py: 0.75,
            backgroundColor: fillColor,
            color: textColor,
            fontSize: compactValues ? 13.2 : 12,
            whiteSpace: compactValues ? "nowrap" : undefined,
          }}
        >
          {compactValues ? (
            <SmallFont
              style={{
                display: "block",
                fontSize: "0.65rem",
                lineHeight: 1.1,
              }}
            >
              {getValue ? getValue(item) : ""}
            </SmallFont>
          ) : getValue ? (
            getValue(item)
          ) : (
            ""
          )}
        </TableCell>
      ))}

      {summaryColumns.map((column) => (
        <TableCell
          key={`${label}-${column.key}`}
          align="center"
          onClick={onSummaryCellClick ? () => onSummaryCellClick(column) : undefined}
          sx={{
            ...tableCellDividerSx,
            minWidth: SUMMARY_COLUMN_WIDTH,
            px: 0.5,
            fontSize: compactValues ? 13.2 : 12,
            color: "#5E5E5E",
            whiteSpace: compactValues ? "nowrap" : undefined,
            cursor: onSummaryCellClick ? "pointer" : "default",
            "&:hover": onSummaryCellClick
              ? {
                  backgroundColor: "#F7F7F7",
                }
              : undefined,
          }}
        >
          {compactValues ? (
            <SmallFont
              style={{
                display: "block",
                fontSize: "0.65rem",
                lineHeight: 1.1,
              }}
            >
              {getSummaryValue ? getSummaryValue(column) : ""}
            </SmallFont>
          ) : getSummaryValue ? (
            getSummaryValue(column)
          ) : (
            ""
          )}
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
  graphKind,
  directorLevel,
  periodBonusState,
  selectedPart,
  onOpenDay,
  onOpenMonth,
  onOpenFastActions,
  onOpenSummaryAction,
  onRemoveTeamBonusFromUser,
  onOpenBulkFastActions,
  onOpenCreateSmena,
  onOpenEditSmena,
  selectedRowIds,
  onToggleRowSelection,
  onClearRowSelection,
  collapsedShiftIds,
  onToggleShiftCollapse,
  isCalendarHidden,
  onCalendarVisibilityChange,
  colorMode,
  onColorModeChange,
  isMobile = false,
}) {
  const [isColorLegendOpen, setIsColorLegendOpen] = useState(false);
  const [stickyHeader, setStickyHeader] = useState({
    visible: false,
    left: 0,
    top: 0,
    width: 0,
  });
  const tableRef = useRef(null);
  const tableHeadRef = useRef(null);
  const tableContainerRef = useRef(null);
  const stickyHeaderContainerRef = useRef(null);
  const isSyncingScrollRef = useRef(false);
  const days = toArray(period?.meta?.days);
  const visibleRows = toArray(rows);
  const { canView, canEdit, canShowFooterStats, canOpenMonthCard, canOpenDayCard, canManageSmena } =
    useMemo(() => createStaffSchedulePolicy(access), [access]);
  const renderedDayCount = isCalendarHidden ? 0 : days.length;
  const showFastActions = hasFastActionsAccess(access);
  const stickyColumnCount = 3 + (showFastActions ? 1 : 0);
  const colSpan = stickyColumnCount + renderedDayCount + summaryColumns.length;
  const shiftHeaderMiddleColSpan = Math.max(colSpan - stickyColumnCount - 1, 0);
  const canShowRolls = canView("rolls");
  const canShowPizza = canView("pizza");
  const canShowSlowOrders = canView("over_40_min");
  const canShowTotals = canView("sums_all");
  const canShowPeriodSum = canView("bonus_of_day");
  const canOpenMonth = canOpenMonthCard;
  const canOpenDayEdit = canOpenDayCard;
  const canEditSmena = canManageSmena;
  const canCreateSmena = canManageSmena;
  const canEditTeamBonus = canEdit("com_bonus");
  const canOpenDirectorLevel = graphKind !== "other";
  const hasBulkSelection = selectedRowIds.length > 0;
  const useColors = colorMode !== "plain";
  const positionHeaderLeft = SELECTION_COLUMN_WIDTH + EMPLOYEE_COLUMN_WIDTH;
  const summaryLabelWidth =
    SELECTION_COLUMN_WIDTH +
    EMPLOYEE_COLUMN_WIDTH +
    POSITION_COLUMN_WIDTH +
    (showFastActions ? ACTION_COLUMN_WIDTH : 0);
  const tableWidth =
    SELECTION_COLUMN_WIDTH +
    EMPLOYEE_COLUMN_WIDTH +
    POSITION_COLUMN_WIDTH +
    (showFastActions ? ACTION_COLUMN_WIDTH : 0) +
    renderedDayCount * DAY_COLUMN_WIDTH +
    summaryColumns.length * SUMMARY_COLUMN_WIDTH;
  const toolbarControlMinWidth = { xs: "100%", md: 240 };
  const bonusDayValues = toArray(period?.meta?.bonus);
  const slowOrderValues = toArray(period?.meta?.order_stat);
  const summaryTotals = period?.meta?.other_summ ?? {};
  const totalsSummaryKeyMap = {
    dop_bonus: "sum_dop_bonus_price",
    h_price: "sum_h_price",
    err_price: "sum_err_price",
    my_bonus: "sum_bonus_price",
    total_sum: "sum_to_given_price",
    given: "sum_given_price",
  };
  const periodBonusSummaryKeyMap = {
    my_bonus: "sum_bonus_price",
  };
  const hasSummaryRows =
    canShowFooterStats &&
    ((canShowPeriodSum && bonusDayValues.length > 0) ||
      canShowTotals ||
      (!isCalendarHidden && canShowRolls) ||
      (!isCalendarHidden && canShowPizza) ||
      (!isCalendarHidden && canShowSlowOrders));

  const syncScrollPosition = useCallback((source, target) => {
    if (!source || !target || target.scrollLeft === source.scrollLeft) {
      return;
    }

    isSyncingScrollRef.current = true;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }, []);

  const syncStickyHeaderPosition = useCallback(() => {
    const currentTable = tableRef.current;
    const currentHead = tableHeadRef.current;
    const currentContainer = tableContainerRef.current;

    if (!currentTable || !currentHead || !currentContainer) {
      return;
    }

    const appToolbar = document.querySelector(".MuiAppBar-root .MuiToolbar-root");
    const appBar = document.querySelector(".MuiAppBar-root");
    const stickyTop = Math.round(
      appToolbar?.getBoundingClientRect().height || appBar?.getBoundingClientRect().height || 0,
    );
    const tableRect = currentTable.getBoundingClientRect();
    const headRect = currentHead.getBoundingClientRect();
    const containerRect = currentContainer.getBoundingClientRect();
    const shouldShow = headRect.top <= stickyTop && tableRect.bottom > stickyTop + headRect.height;

    setStickyHeader((prev) => {
      const nextState = {
        visible: shouldShow,
        left: Math.round(containerRect.left),
        top: stickyTop,
        width: Math.round(containerRect.width),
      };

      return prev.visible === nextState.visible &&
        prev.left === nextState.left &&
        prev.top === nextState.top &&
        prev.width === nextState.width
        ? prev
        : nextState;
    });

    if (stickyHeaderContainerRef.current) {
      syncScrollPosition(currentContainer, stickyHeaderContainerRef.current);
    }
  }, [syncScrollPosition]);

  useEffect(() => {
    syncStickyHeaderPosition();

    const handleWindowChange = () => {
      syncStickyHeaderPosition();
    };
    const handleTableScroll = () => {
      if (isSyncingScrollRef.current) {
        return;
      }

      if (stickyHeaderContainerRef.current && tableContainerRef.current) {
        syncScrollPosition(tableContainerRef.current, stickyHeaderContainerRef.current);
      }
    };
    const handleStickyHeaderScroll = () => {
      if (isSyncingScrollRef.current) {
        return;
      }

      if (stickyHeaderContainerRef.current && tableContainerRef.current) {
        syncScrollPosition(stickyHeaderContainerRef.current, tableContainerRef.current);
      }
    };
    const currentContainer = tableContainerRef.current;
    const currentStickyHeaderContainer = stickyHeaderContainerRef.current;

    window.addEventListener("scroll", handleWindowChange, { passive: true });
    window.addEventListener("resize", handleWindowChange);
    currentContainer?.addEventListener("scroll", handleTableScroll, { passive: true });
    currentStickyHeaderContainer?.addEventListener("scroll", handleStickyHeaderScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleWindowChange);
      window.removeEventListener("resize", handleWindowChange);
      currentContainer?.removeEventListener("scroll", handleTableScroll);
      currentStickyHeaderContainer?.removeEventListener("scroll", handleStickyHeaderScroll);
    };
  }, [stickyHeader.visible, syncScrollPosition, syncStickyHeaderPosition]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      syncStickyHeaderPosition();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    collapsedShiftIds,
    days.length,
    hasBulkSelection,
    isCalendarHidden,
    rows,
    showFastActions,
    summaryColumns,
    syncStickyHeaderPosition,
  ]);

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

  if (isMobile) {
    return (
      <StaffScheduleMobileTableSection
        shownShiftCount={shownShiftCount}
        rows={visibleRows}
        days={days}
        collapsedShiftIds={collapsedShiftIds}
        onToggleShiftCollapse={onToggleShiftCollapse}
        canEditSmena={canEditSmena}
        onOpenEditSmena={onOpenEditSmena}
        isCalendarHidden={isCalendarHidden}
        showFastActions={showFastActions}
        hasBulkSelection={hasBulkSelection}
        onOpenBulkFastActions={onOpenBulkFastActions}
        useColors={useColors}
        selectedRowIds={selectedRowIds}
        onToggleRowSelection={onToggleRowSelection}
        onClearRowSelection={onClearRowSelection}
        onOpenMonth={onOpenMonth}
        onOpenDay={onOpenDay}
        canOpenMonth={canOpenMonth}
        canOpenDayEdit={canOpenDayEdit}
        hasSummaryRows={hasSummaryRows}
        onOpenSummaryAction={onOpenSummaryAction}
        summaryColumns={summaryColumns}
        summaryTotals={summaryTotals}
        totalsSummaryKeyMap={totalsSummaryKeyMap}
        periodBonusSummaryKeyMap={periodBonusSummaryKeyMap}
        canEditTeamBonus={canEditTeamBonus}
        periodBonusState={periodBonusState}
        canShowPeriodSum={canShowPeriodSum}
        bonusDayValues={bonusDayValues}
        canShowTotals={canShowTotals}
        canShowRolls={canShowRolls}
        canShowPizza={canShowPizza}
        canShowSlowOrders={canShowSlowOrders}
        slowOrderValues={slowOrderValues}
      />
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

      {stickyHeader.visible ? (
        <Box
          sx={{
            position: "fixed",
            left: stickyHeader.left,
            top: stickyHeader.top,
            width: stickyHeader.width,
            zIndex: 1200,
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
            borderTop: "1px solid #ECECEC",
            borderBottom: "1px solid #ECECEC",
            backgroundColor: "#FFFFFF",
          }}
        >
          <TableContainer
            ref={stickyHeaderContainerRef}
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Table
              size="small"
              sx={{
                width: tableWidth,
                minWidth: tableWidth,
                tableLayout: "fixed",
                borderCollapse: "separate",
                borderSpacing: 0,
                "& .MuiTableCell-root": {
                  borderColor: "#EDEDED",
                },
              }}
            >
              <ScheduleTableColGroup
                dayCount={renderedDayCount}
                summaryColumnCount={summaryColumns.length}
                showFastActions={showFastActions}
              />
              <TableHead>
                <ScheduleTableHeaderRow
                  days={days}
                  summaryColumns={summaryColumns}
                  hasBulkSelection={hasBulkSelection}
                  showFastActions={showFastActions}
                  isCalendarHidden={isCalendarHidden}
                  positionHeaderLeft={positionHeaderLeft}
                  onOpenBulkFastActions={onOpenBulkFastActions}
                  stickyZIndex={8}
                />
              </TableHead>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      <TableContainer
        ref={tableContainerRef}
        sx={{
          overflowX: "auto",
          borderTop: "1px solid #ECECEC",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          ref={tableRef}
          size="small"
          sx={{
            width: tableWidth,
            minWidth: tableWidth,
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 0,
            "& .MuiTableCell-root": {
              borderColor: "#EDEDED",
            },
          }}
        >
          <ScheduleTableColGroup
            dayCount={renderedDayCount}
            summaryColumnCount={summaryColumns.length}
            showFastActions={showFastActions}
          />
          <TableHead ref={tableHeadRef}>
            <ScheduleTableHeaderRow
              days={days}
              summaryColumns={summaryColumns}
              hasBulkSelection={hasBulkSelection}
              showFastActions={showFastActions}
              isCalendarHidden={isCalendarHidden}
              positionHeaderLeft={positionHeaderLeft}
              onOpenBulkFastActions={onOpenBulkFastActions}
            />
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
                  onOpenSummaryAction={onOpenSummaryAction}
                  onRemoveTeamBonusFromUser={onRemoveTeamBonusFromUser}
                  canOpenMonth={canOpenMonth}
                  canOpenDayEdit={canOpenDayEdit}
                  canEdit={canEdit}
                  selectedPart={selectedPart}
                  showFastActions={showFastActions}
                  isCalendarHidden={isCalendarHidden}
                  useColors={useColors}
                  selectedRowIds={selectedRowIds}
                  onToggleRowSelection={onToggleRowSelection}
                />
              );
            })}

            {hasSummaryRows ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  sx={{
                    backgroundColor: v2TableColors.sectionHeader,
                    height: 60,
                    py: 0.75,
                    px: 1.5,
                    borderTop: "1px solid #EDEDED",
                    color: "#FFFFFF",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
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

                    {canOpenDirectorLevel ? (
                      <V2Button
                        compact
                        tone="secondary"
                        onClick={() => onOpenSummaryAction?.(null, "dir_lv")}
                        sx={{
                          minHeight: 32,
                          px: 1.5,
                          border: "none",
                          borderRadius: "10px",
                          backgroundColor: "#FFFFFF",
                          color: "#666666",
                          fontSize: 14,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          "&:hover": {
                            border: "none",
                            backgroundColor: "#F7F7F7",
                          },
                        }}
                      >
                        {`Уровень директора: ${directorLevel ?? 0}`}
                      </V2Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : null}

            {canShowTotals || (!isCalendarHidden && canShowPeriodSum && bonusDayValues.length) ? (
              <SummaryMetricRow
                label="Сумма за период"
                values={!isCalendarHidden ? bonusDayValues : []}
                summaryColumns={summaryColumns}
                stickyColumnCount={stickyColumnCount}
                labelWidth={summaryLabelWidth}
                compactValues
                fillColor="#9BDD7C"
                textColor="#5E5E5E"
                getValue={(item) => item?.res ?? ""}
                getSummaryValue={(column) => {
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
                }}
                onSummaryCellClick={
                  canEditTeamBonus
                    ? (column) => {
                        if (column.key === "dop_bonus") {
                          onOpenSummaryAction?.(null, "dop_bonus_toggle");
                        }
                      }
                    : undefined
                }
              />
            ) : null}

            {!isCalendarHidden && canShowRolls ? (
              <SummaryMetricRow
                label="Роллы"
                values={bonusDayValues}
                summaryColumns={summaryColumns}
                stickyColumnCount={stickyColumnCount}
                labelWidth={summaryLabelWidth}
                getValue={(item) => item?.count_rolls ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowPizza ? (
              <SummaryMetricRow
                label="Пицца"
                values={bonusDayValues}
                summaryColumns={summaryColumns}
                stickyColumnCount={stickyColumnCount}
                labelWidth={summaryLabelWidth}
                getValue={(item) => item?.count_pizza ?? ""}
              />
            ) : null}

            {!isCalendarHidden && canShowSlowOrders ? (
              <SummaryMetricRow
                label="Заказы готовились более 40 минут"
                values={slowOrderValues}
                summaryColumns={summaryColumns}
                stickyColumnCount={stickyColumnCount}
                labelWidth={summaryLabelWidth}
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
