import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { REPORT_SALES_COLUMN_OPTIONS } from "@/components/reports/reportSalesColumns";

const FONT =
  '"Roboto", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const ACCENT_GREEN = "#16a34a";
const ACCENT_RED = "#dc2626";

const tableSx = {
  minWidth: 1100,
  fontFamily: FONT,
  "& .MuiTableCell-root": {
    fontFamily: FONT,
    borderBottom: "1px solid #edf0f4",
    fontSize: 13,
    lineHeight: 1.4,
    color: "#1f2937",
    py: 1.1,
    px: 1.25,
  },
};

const headCellSx = {
  backgroundColor: "#fff",
  color: "#374151",
  fontWeight: 700,
  fontSize: "12px !important",
  letterSpacing: "0.01em",
  textAlign: "right",
  whiteSpace: "normal",
  verticalAlign: "bottom",
  borderBottom: "1px solid #e5e7eb !important",
  lineHeight: 1.3,
};

const bodyCellSx = {
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

const nameCellSx = {
  textAlign: "left",
  fontWeight: 500,
  color: "#111827",
  whiteSpace: "nowrap",
};

const totalCellSx = {
  textAlign: "right",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
  backgroundColor: "#f3f4f6",
  borderBottom: "none !important",
  color: "#111827",
};

const totalNameCellSx = {
  ...totalCellSx,
  textAlign: "left",
};

const TREND_COLUMNS = new Set(["gross_profit", "markup_percent", "margin_percent"]);

function formatValue(value, { digits = 0, empty = "—" } = {}) {
  if (value === null || value === undefined || value === "") {
    return empty;
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return empty;
  }

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

function getVisibleColumns(isColumnVisible) {
  return REPORT_SALES_COLUMN_OPTIONS.filter((column) => isColumnVisible(column.key));
}

function getColumnMinWidth(key) {
  if (key === "name") return 220;
  if (key === "num") return 56;
  if (key === "markup_percent" || key === "margin_percent") return 110;
  if (key === "gross_profit") return 140;
  return 130;
}

function getTrendColor(value) {
  const num = Number(value);

  if (Number.isNaN(num) || num === 0) {
    return "#1f2937";
  }

  return num > 0 ? ACCENT_GREEN : ACCENT_RED;
}

function TrendValue({ value, formatted }) {
  const num = Number(value);

  if (formatted === "—" || Number.isNaN(num) || num === 0) {
    return formatted;
  }

  const color = getTrendColor(num);
  const Icon = num > 0 ? ArrowDropUpIcon : ArrowDropDownIcon;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 0.1,
        color,
        fontWeight: 600,
      }}
    >
      <Icon sx={{ fontSize: 18, ml: -0.5 }} />
      {formatted}
    </Box>
  );
}

function renderCellValue(key, total, isTotalRow) {
  switch (key) {
    case "count":
      return formatValue(total?.count, { digits: 0 });
    case "unit_cost":
      return isTotalRow ? "—" : formatValue(total?.unit_cost, { digits: 2 });
    case "cost":
      return formatValue(total?.cost, { digits: 2 });
    case "avg_price":
      return isTotalRow ? "—" : formatValue(total?.avg_price, { digits: 2 });
    case "price":
      return formatValue(total?.price, { digits: 2 });
    case "gross_profit": {
      const formatted = formatValue(total?.gross_profit, { digits: 2 });
      return (
        <TrendValue
          value={total?.gross_profit}
          formatted={formatted}
        />
      );
    }
    case "markup_percent": {
      const value = formatValue(total?.markup_percent, { digits: 2 });
      const formatted = value === "—" ? value : `${value}%`;
      return (
        <TrendValue
          value={total?.markup_percent}
          formatted={formatted}
        />
      );
    }
    case "margin_percent": {
      const value = formatValue(total?.margin_percent, { digits: 2 });
      const formatted = value === "—" ? value : `${value}%`;
      return (
        <TrendValue
          value={total?.margin_percent}
          formatted={formatted}
        />
      );
    }
    default:
      return "—";
  }
}

export default function ReportSalesTable({
  title = "Отчет о розничных продажах",
  items = [],
  totals = null,
  isColumnVisible,
  onItemClick,
}) {
  const columns = getVisibleColumns(isColumnVisible);
  const colSpan = columns.length || 1;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: "1px solid #e5e7eb",
        borderRadius: 1.5,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #edf0f4",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
            color: "#9ca3af",
          }}
        >
          {title}
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          size="small"
          stickyHeader
          sx={tableSx}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={`label-${column.key}`}
                  sx={{
                    ...headCellSx,
                    minWidth: getColumnMinWidth(column.key),
                    maxWidth: column.key === "name" ? 280 : 170,
                    textAlign: column.key === "name" || column.key === "num" ? "left" : "right",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => {
              const total = item?.total || {};
              const rowNum = item?.num ?? index + 1;

              return (
                <TableRow
                  key={item?.id ?? `${item?.name}-${index}`}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 1 ? "#fafafa" : "#fff",
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                    },
                    "&:last-of-type td": totals ? undefined : { borderBottom: "none" },
                  }}
                >
                  {columns.map((column) => {
                    if (column.key === "num") {
                      return (
                        <TableCell
                          key={column.key}
                          sx={{
                            ...bodyCellSx,
                            textAlign: "left",
                            color: "#9ca3af",
                            fontWeight: 500,
                            width: 56,
                          }}
                        >
                          {rowNum}
                        </TableCell>
                      );
                    }

                    if (column.key === "name") {
                      const clickable = typeof onItemClick === "function" && item?.id != null;

                      return (
                        <TableCell
                          key={column.key}
                          sx={nameCellSx}
                        >
                          {clickable ? (
                            <Box
                              component="button"
                              type="button"
                              onClick={() => onItemClick(item)}
                              sx={{
                                all: "unset",
                                cursor: "pointer",
                                color: "#111827",
                                fontWeight: 500,
                                borderBottom: "1px dashed transparent",
                                "&:hover": {
                                  color: "#d50032",
                                  borderBottomColor: "#d50032",
                                },
                              }}
                            >
                              {item?.name ?? "—"}
                            </Box>
                          ) : (
                            (item?.name ?? "—")
                          )}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={column.key}
                        sx={bodyCellSx}
                      >
                        {renderCellValue(column.key, total, false)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}

            {totals ? (
              <TableRow>
                {columns.map((column) => {
                  if (column.key === "num") {
                    return (
                      <TableCell
                        key={column.key}
                        sx={{
                          ...totalCellSx,
                          textAlign: "left",
                        }}
                      />
                    );
                  }

                  if (column.key === "name") {
                    return (
                      <TableCell
                        key={column.key}
                        sx={totalNameCellSx}
                      >
                        Итого
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell
                      key={column.key}
                      sx={{
                        ...totalCellSx,
                        ...(TREND_COLUMNS.has(column.key)
                          ? { color: getTrendColor(totals?.[column.key]) }
                          : {}),
                      }}
                    >
                      {renderCellValue(column.key, totals, true)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ) : null}

            {!items.length ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  sx={{
                    textAlign: "center",
                    py: 4,
                    borderBottom: "none !important",
                    color: "#64748b",
                  }}
                >
                  Нет данных
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
