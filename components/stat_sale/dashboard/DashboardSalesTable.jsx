import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { uiColors } from "@/design-system/shared/ui";

import { changeColor, formatChange, formatDecimal, formatInt } from "./dashboardFormat";

const headCellSx = {
  py: 1.25,
  fontSize: 13,
  fontWeight: 600,
  color: uiColors.text,
  borderBottomColor: uiColors.border,
  whiteSpace: "nowrap",
};

const cellSx = {
  py: 1.25,
  fontSize: 14,
  color: uiColors.textStrong,
  borderBottomColor: uiColors.borderLight,
  fontVariantNumeric: "tabular-nums",
};

/**
 * Таблица продаж активного таба. В заголовках «шт» и «%», в ячейках только числа.
 * rows: [{ key, name, hint?, color, count, share, mom, yoy }]
 */
export default function DashboardSalesTable({ rows, nameHeader }) {
  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{ minWidth: 600, fontSize: 14 }}
      >
        <TableHead sx={{ fontSize: 13 }}>
          <TableRow>
            <TableCell sx={headCellSx}>{nameHeader}</TableCell>
            <TableCell
              align="right"
              sx={headCellSx}
            >
              Кол-во, шт
            </TableCell>
            <TableCell
              align="right"
              sx={headCellSx}
            >
              Доля, %
            </TableCell>
            <TableCell
              align="right"
              sx={headCellSx}
            >
              М/м, %
            </TableCell>
            <TableCell
              align="right"
              sx={headCellSx}
            >
              Г/г, %
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
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
                    <Typography component="div"
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
                      <Typography component="div" sx={{ fontSize: 12, color: uiColors.text }}>{row.hint}</Typography>
                    ) : null}
                  </Box>
                </Box>
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...cellSx, fontWeight: 600 }}
              >
                {formatInt(row.count)}
              </TableCell>
              <TableCell
                align="right"
                sx={cellSx}
              >
                {formatDecimal(row.share, 1)}
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
