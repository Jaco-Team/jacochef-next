import React from "react";

import dayjs from "dayjs";
import "dayjs/locale/ru";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { formatNumber } from "./utils";

dayjs.locale("ru");

// ---------- Таблица в Таб Продажи ----------
const DataTable = ({ tableData, openGraphModal }) => {
  const toRawMonth = (formatted) => {
    const [month, year] = formatted.split("-");
    return `${year}-${month}`;
  };

  const getPreviousPeriodHeader = (formatted) => {
    const parts = formatted.split("-");
    if (parts.length < 2) return formatted;
    const year = parts[1];
    const currentLastTwo = year.slice(-2);
    const previousLastTwo = (parseInt(year, 10) - 1).toString().slice(-2);
    return `${currentLastTwo}/${previousLastTwo}`;
  };

  const getPreviousMonthHeader = (formatted) => {
    const parts = formatted.split("-");
    if (parts.length < 2) return formatted;

    const month = parts[0];
    const year = parts[1];

    let currentMonth = parseInt(month, 10);
    let currentYear = parseInt(year, 10);

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = currentYear - 1;
    }

    const previousMonthFormatted = previousMonth.toString().padStart(2, "0");

    const currentLastTwo = currentYear.toString().slice(-2);
    const previousLastTwo = previousYear.toString().slice(-2);

    if (currentYear === previousYear) {
      return `${month}/${previousMonthFormatted}`;
    }

    return `${previousMonthFormatted}-${previousLastTwo}/${month}-${currentLastTwo}`;
  };

  const renderMonthHeader = (formattedMonth) => {
    const parts = formattedMonth.split("-");
    const isoDate = `${parts[1]}-${parts[0]}-01`;
    return (
      <TableCell
        key={formattedMonth}
        colSpan={5}
        sx={{
          backgroundColor: "#dcdcdc",
          minWidth: 4 * 80,
          top: 0,
          zIndex: 1000,
          borderTop: thickBorder,
          borderRight: thickBorder,
          borderBottom: thickBorder,
        }}
      >
        {dayjs(isoDate)
          .format("MMMM YYYY")
          .replace(/^./, (match) => match.toUpperCase())}
      </TableCell>
    );
  };

  const { columns, rows } = tableData;
  const totalColSpan = 2 + columns.months.length * 4;

  const thinBorder = "1px solid #ccc";
  const thickBorder = "2px solid #000 !important";

  const paramColWidth = 150;
  const typeColWidth = 100;

  const cellStylesHeader = {
    position: "sticky",
    top: 40,
    zIndex: 1000,
    minWidth: "120px",
    borderRight: thickBorder,
    borderBottom: thickBorder,
  };

  const [month, year] = columns.months[0].split("-");
  const firstMonthKey = `${year}-${month}`;

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto",
        overflow: "auto !important",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          WebkitAppearance: "none",
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, .3)",
        },
        minHeight: "400px",
        maxHeight: "calc(100vh - 200px)",
        p: 0,
        m: 0,
        pb: 5,
      }}
      className="montserrat-family"
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableCell-root": { textAlign: "center", whiteSpace: "nowrap", border: thinBorder },
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "white", height: 40 }}>
            <TableCell
              colSpan={2}
              rowSpan={2}
              sx={{
                position: "sticky",
                left: 0,
                top: 0,
                backgroundColor: "white",
                zIndex: 1100,
                minWidth: paramColWidth + typeColWidth,
                borderRight: thickBorder,
                textAlign: "left !important",
              }}
            >
              Месяц / год
            </TableCell>

            {columns.months.map((formattedMonth) => renderMonthHeader(formattedMonth))}
          </TableRow>

          <TableRow sx={{ backgroundColor: "white", height: 40 }}>
            {columns.months.map((formattedMonth) => (
              <React.Fragment key={formattedMonth}>
                <TableCell sx={cellStylesHeader}>кол-во</TableCell>
                <TableCell sx={cellStylesHeader}>факт/п</TableCell>
                <TableCell
                  sx={{ ...cellStylesHeader, cursor: "pointer" }}
                  onClick={() => openGraphModal("stat_effect", rows)}
                >
                  <Tooltip title="Открыть график Эффективности">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                      >
                        эффект-ть
                      </Typography>
                      <QueryStatsIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={cellStylesHeader}>
                  {getPreviousPeriodHeader(formattedMonth)}
                </TableCell>
                <TableCell sx={cellStylesHeader}>
                  {getPreviousMonthHeader(formattedMonth)}
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>

          <TableRow>
            <TableCell
              colSpan={totalColSpan}
              sx={{ border: "none", p: 0, m: 0 }}
            >
              {"\u00A0"}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <React.Fragment key={row.parameter}>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: paramColWidth,
                    borderRight: "none !important",
                    fontWeight: "bold",
                    textAlign: "left !important",
                  }}
                >
                  {row.parameter}
                </TableCell>

                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    left: paramColWidth + 33.5,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: typeColWidth,
                    borderLeft: "none !important",
                    borderRight: thickBorder,
                  }}
                >
                  Роллы
                </TableCell>

                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};

                  return (
                    <React.Fragment key={`${formattedMonth}-rolls`}>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData?.point_id
                            ? (cellData.color_rolls ?? null)
                            : null,
                          fontWeight: cellData?.point_id ? "bold" : "normal",
                        }}
                      >
                        {formatNumber(cellData.rolls_current ?? 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_rolls ?? null,
                          fontWeight: "bold",
                        }}
                      >
                        {cellData.percent_fact_rolls ?? 0}%
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_fact ?? null,
                          fontWeight: "bold",
                          fontSize: "32px !important",
                        }}
                      >
                        {cellData.percent_fact ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_rolls) > 0 ? "green" : "red",
                        }}
                      >
                        {cellData.percent_compare_rolls ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_rolls_mom) > 0 ? "green" : "red",
                          borderRight: thickBorder,
                        }}
                      >
                        {cellData.percent_compare_rolls_mom ?? 0}%
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    left: paramColWidth + 33.5,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: typeColWidth,
                    borderLeft: "none !important",
                    borderRight: thickBorder,
                  }}
                >
                  Пицца
                </TableCell>

                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};
                  return (
                    <React.Fragment key={`${formattedMonth}-pizza`}>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData?.point_id
                            ? (cellData.color_pizza ?? null)
                            : null,
                          fontWeight: cellData?.point_id ? "bold" : "normal",
                        }}
                      >
                        {formatNumber(cellData.pizza_current ?? 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_pizza ?? null,
                          fontWeight: "bold",
                        }}
                      >
                        {cellData.percent_fact_pizza ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_pizza) > 0 ? "green" : "red",
                        }}
                      >
                        {cellData.percent_compare_pizza ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_pizza_mom) > 0 ? "green" : "red",
                          borderRight: thickBorder,
                        }}
                      >
                        {cellData.percent_compare_pizza_mom ?? 0}%
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              {rowIndex === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={totalColSpan}
                    sx={{ border: "none", p: 0, m: 0 }}
                  >
                    {"\u00A0"}
                  </TableCell>
                </TableRow>
              )}

              {rowIndex < rows.length - 1 &&
                !rows[rowIndex].data[firstMonthKey]?.point_id &&
                rows[rowIndex + 1].data[firstMonthKey]?.point_id && (
                  <TableRow>
                    <TableCell
                      colSpan={totalColSpan}
                      sx={{ border: "none", p: 0, m: 0 }}
                    >
                      {"\u00A0"}
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
