"use client";
import dayjs from "dayjs";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import Typography from "@mui/material/Typography";
import TableBody from "@mui/material/TableBody";

const PerformanceTable = ({ dataTable }) => {
  dayjs.locale("ru");
  const { columns, rows } = dataTable;
  const [month, year] = columns.months[0].split("-");
  const firstMonthKey = `${year}-${month}`;

  const thinBorder = "1px solid #ccc";
  const thickBorder = "2px solid #000 !important";

  const renderMonthHeader = (formattedMonth) => {
    const parts = formattedMonth.split("-");
    const isoDate = `${parts[1]}-${parts[0]}-01`;
    return (
      <TableCell
        key={formattedMonth}
        colSpan={3}
        sx={{
          backgroundColor: "#dcdcdc",
          minWidth: 3 * dataCellWidth,
          top: 0,
          zIndex: 1000,
          borderTop: thickBorder,
          borderRight: thickBorder,
          borderBottom: thickBorder,
          padding: "6px",
        }}
      >
        {dayjs(isoDate)
          .format("MMMM YYYY")
          .replace(/^./, (match) => match.toUpperCase())}
      </TableCell>
    );
  };

  const paramColWidth = 120;
  const typeColWidth = 5;
  const dataCellWidth = 70;
  const cellStylesHeader = {
    position: "sticky",
    top: 40,
    zIndex: 1000,
    minWidth: dataCellWidth,
    borderRight: thickBorder,
    borderBottom: thickBorder,
    padding: "6px",
    fontSize: "0.8rem",
  };
  const getPreviousPeriodHeader = (formatted) => {
    const parts = formatted.split("-");
    if (parts.length < 2) return formatted;
    const year = parts[1];
    const currentLastTwo = year.slice(-2);
    const previousLastTwo = (parseInt(year, 10) - 1).toString().slice(-2);
    return `${currentLastTwo}/${previousLastTwo}`;
  };

  const totalColSpan = 2 + columns.months.length * 4;

  const toRawMonth = (formatted) => {
    const [month, year] = formatted.split("-");
    return `${year}-${month}`;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: "auto", overflowY: "hidden", p: 0, m: 0, pb: 5 }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableCell-root": {
            textAlign: "center",
            whiteSpace: "nowrap",
            border: thinBorder,
            padding: "6px",
            fontSize: "0.8rem",
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "white", height: 32 }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                top: 0,
                backgroundColor: "white",
                zIndex: 1200,
                minWidth: paramColWidth + typeColWidth,
                borderRight: thickBorder,
                padding: "6px",
                fontSize: "0.8rem",
                textAlign: "left !important",
              }}
              colSpan={2}
              rowSpan={2}
            >
              Месяц / год
            </TableCell>
            {columns.months.map((formattedMonth) => renderMonthHeader(formattedMonth))}
          </TableRow>
          <TableRow sx={{ backgroundColor: "white", height: 32 }}>
            {columns.months.map((formattedMonth) => (
              <React.Fragment key={formattedMonth}>
                <TableCell sx={cellStylesHeader}>время</TableCell>
                <TableCell sx={{ ...cellStylesHeader, minWidth: "20px !important" }}></TableCell>
                <TableCell sx={{ ...cellStylesHeader }}>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                  >
                    {getPreviousPeriodHeader(formattedMonth)}
                  </Typography>
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
                    padding: "6px",
                    textAlign: "left !important",
                  }}
                >
                  {row.parameter}
                </TableCell>

                <TableCell
                  component="th"
                  scope="row"
                  rowSpan={2}
                  sx={{
                    position: "sticky",
                    left: paramColWidth + (paramColWidth + typeColWidth - 15.7),
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: typeColWidth,
                    borderLeft: "none !important",
                    borderRight: thickBorder,
                    padding: "6px",
                  }}
                >
                  {row.parameterLabel}
                </TableCell>

                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};

                  return (
                    <React.Fragment key={`${formattedMonth}-rolls`}>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color,
                          fontWeight: "bold",
                          padding: "6px",
                        }}
                      >
                        {cellData.time_str}
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: "20px",
                          backgroundColor: cellData.color_rolls ?? null,
                          fontWeight: "bold",
                          padding: "6px",
                        }}
                      >
                        {cellData.ball}
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_rolls ?? null,
                          fontWeight: "bold",
                          padding: "6px",
                        }}
                      >
                        {cellData.time_diff_str}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              <TableRow>
                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};
                  return <React.Fragment key={`${formattedMonth}-pizza`}></React.Fragment>;
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

              {row.cityLast && (
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

export default PerformanceTable;
