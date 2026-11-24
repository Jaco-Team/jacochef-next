import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { changeColor, formatChange, formatInt, formatPercent } from "./dashboardFormat";

const headCellSx = {
  py: 1.25,
  fontSize: 13,
  fontWeight: 600,
  color: uiColors.text,
  borderBottomColor: uiColors.border,
  whiteSpace: "nowrap",
};

const sortLabelSx = {
  color: "inherit",
  fontWeight: "inherit",
  "&:hover, &.Mui-active": { color: uiColors.textStrong },
  "&.Mui-active .MuiTableSortLabel-icon": { color: uiColors.primary },
};

const cellSx = {
  py: 1.25,
  fontSize: 14,
  color: uiColors.textStrong,
  borderBottomColor: uiColors.borderLight,
  fontVariantNumeric: "tabular-nums",
};

const PERCENT_COLUMNS = [
  { key: "share", label: "Доля, %" },
  { key: "mom", label: "М/м, %" },
  { key: "yoy", label: "Г/г, %" },
];

const DEFAULT_SORT = { key: "count", direction: "desc" };

const isEmpty = (value) => value === null || value === undefined;

/** Строки без значения («—») всегда внизу; при равенстве — по количеству от большего. Без sort — порядок как пришёл. */
function sortRows(rows, sort) {
  if (!sort) return rows;

  const { key, direction } = sort;
  const factor = direction === "asc" ? 1 : -1;
  const byCount = (a, b) => (Number(b.count) || 0) - (Number(a.count) || 0);

  return [...rows].sort((a, b) => {
    const left = a[key];
    const right = b[key];
    if (isEmpty(left) || isEmpty(right)) {
      return Number(isEmpty(left)) - Number(isEmpty(right)) || byCount(a, b);
    }
    const diff = key === "name" ? String(left).localeCompare(String(right), "ru") : Number(left) - Number(right);
    return diff * factor || byCount(a, b);
  });
}

/**
 * Таблица продаж: единицы — в заголовках, в ячейках только числа, проценты целые.
 * Клик по заголовку сортирует по столбцу, повторный — меняет направление.
 * rows: [{ key, name, hint?, color, count, share, shareRounded?, mom, yoy }]; пустые значения — прочерк.
 * valueHeader и formatValue — заголовок и формат столбца значения (по умолчанию «Кол-во, шт», целое).
 * defaultSort: { key, direction } или null — оставить порядок строк как передан.
 */
export default function DashboardSalesTable({
  rows,
  nameHeader,
  valueHeader = "Кол-во, шт",
  formatValue = formatInt,
  defaultSort = DEFAULT_SORT,
}) {
  const [sort, setSort] = useState(defaultSort);
  const sortedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" ? "asc" : "desc" },
    );

  const renderHeadCell = (key, label, align) => {
    const active = sort?.key === key;

    return (
      <TableCell
        key={key}
        align={align}
        sortDirection={active ? sort.direction : false}
        sx={headCellSx}
      >
        <TableSortLabel
          active={active}
          direction={active ? sort.direction : key === "name" ? "asc" : "desc"}
          onClick={() => toggleSort(key)}
          sx={sortLabelSx}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  };

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{ minWidth: 600, fontSize: 14 }}
      >
        <TableHead sx={{ fontSize: 13 }}>
          <TableRow>
            {renderHeadCell("name", nameHeader, "left")}
            {renderHeadCell("count", valueHeader, "right")}
            {PERCENT_COLUMNS.map((column) => renderHeadCell(column.key, column.label, "right"))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow
              key={row.key}
              hover
            >
              <TableCell sx={{ ...cellSx, maxWidth: 320 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                  <Box
                    sx={{
                      flex: "none",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: row.color,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      component="div"
                      sx={{
                        fontSize: 14,
                        color: uiColors.textStrong,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={row.name}
                    >
                      {row.name}
                    </Typography>
                    {row.hint ? (
                      <Typography
                        component="div"
                        sx={{ fontSize: 12, color: uiColors.text }}
                      >
                        {row.hint}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellSx, fontWeight: 600 }}
              >
                {isEmpty(row.count) ? "—" : formatValue(row.count)}
              </TableCell>
              <TableCell
                align="right"
                sx={cellSx}
              >
                {isEmpty(row.shareRounded ?? row.share) ? "—" : formatPercent(row.shareRounded ?? row.share)}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellSx, fontWeight: 600, color: changeColor(row.mom) }}
              >
                {formatChange(row.mom)}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellSx, fontWeight: 600, color: changeColor(row.yoy) }}
              >
                {formatChange(row.yoy)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
