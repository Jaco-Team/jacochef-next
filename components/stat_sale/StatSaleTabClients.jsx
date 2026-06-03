import React from "react";

import dayjs from "dayjs";
import "dayjs/locale/ru";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Box from "@mui/material/Box";
import { Download } from "@mui/icons-material";

import { MyDatePickerNewViews } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import DownloadButton from "@/ui/DownloadButton";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

import { formatNumber, calcPercent, calcAvg, calcAverageCheck } from "./utils";

dayjs.locale("ru");

// ---------- Таб Клиенты ----------
class StatSale_Tab_Clients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      point: [],

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),

      data_clients_list: [],
    };
  }

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  get_data_clients = async (exp = false) => {
    const { point, date_start, date_end } = this.state;

    if (!point.length) {
      this.props.openAlert(false, "Необходимо выбрать кафе");
      return;
    }

    const data = {
      date_start,
      date_end,
      point,
    };

    // export
    if (exp) {
      const res = await this.props.getData("export_data_clients", data);
      if (!res?.st) {
        return this.props.openAlert(res?.st, res?.text || "Ошибка при экспорте данных");
      }
      return res?.url;
    }

    const res = await this.props.getData("get_data_clients", data);

    if (res.st) {
      const rates = this.props.rates;

      const processedData = res.data_list.map((table) =>
        table.map((item) => {
          const people = parseInt(item.people, 10);
          const active = parseInt(item.active, 10);
          const registred = parseInt(item.registred, 10);
          const orders = parseInt(item.orders, 10);
          const summ = parseInt(item.summ, 10);

          const percentClientsRaw = calcPercent(active, people);
          const percentActiveAccountsRaw = calcPercent(registred, active);
          const ordersAvgRaw = calcAvg(orders, registred);
          const averageCheckRaw = calcAverageCheck(summ, orders);

          const matchingClients = rates.find(
            (rate) =>
              rate.type === "clients" &&
              percentClientsRaw <= rate.max_value &&
              percentClientsRaw >= rate.min_value,
          );

          const matchingActive = rates.find(
            (rate) =>
              rate.type === "active" &&
              percentActiveAccountsRaw <= rate.max_value &&
              percentActiveAccountsRaw >= rate.min_value,
          );

          const matchingOrders = rates.find(
            (rate) =>
              rate.type === "orders" &&
              ordersAvgRaw <= rate.max_value &&
              ordersAvgRaw >= rate.min_value,
          );

          const matchingAvg = rates.find(
            (rate) =>
              rate.type === "avg" &&
              averageCheckRaw <= rate.max_value &&
              averageCheckRaw >= rate.min_value,
          );

          return {
            ...item,
            peopleFormatted: formatNumber(people),
            activeFormatted: formatNumber(active),
            registredFormatted: formatNumber(registred),
            ordersFormatted: formatNumber(orders),
            summFormatted: formatNumber(summ),
            percentClients: formatNumber(percentClientsRaw),
            percentActiveAccounts: formatNumber(percentActiveAccountsRaw),
            ordersAvg: formatNumber(ordersAvgRaw),
            averageCheck: formatNumber(averageCheckRaw),
            clientsColor: matchingClients ? matchingClients.value_color : null,
            activeColor: matchingActive ? matchingActive.value_color : null,
            ordersColor: matchingOrders ? matchingOrders.value_color : null,
            avgColor: matchingAvg ? matchingAvg.value_color : null,
          };
        }),
      );

      this.setState({
        data_clients_list: processedData,
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  render() {
    const { activeTab, points, openGraphModal } = this.props;
    const { data_clients_list } = this.state;

    const borderStyle = { border: "1px solid #b7b7b7" };

    const commonCellStyles = {
      width: "100px",
      fontSize: "14px",
      fontWeight: "normal",
      lineHeight: "14px",
    };

    const cellStylesAbsolute = {
      position: "absolute",
      left: "24px",
      backgroundColor: "#fff",
      zIndex: 10,
      width: "200px",
      borderTop: "none",
      textAlign: "left !important",
      fontWeight: "bold",
      height: "50px",
    };

    const cellStylesAbsoluteName = {
      position: "absolute",
      left: "24px",
      backgroundColor: "#fff",
      zIndex: 20,
      width: "200px",
      borderTop: "none",
      fontWeight: "bold",
      height: "50px",
      display: "flex",
      alignItems: "center",
      paddingTop: "10px",
    };

    const cellStylesDop = {
      borderTop: "none !important",
      borderBottom: "none !important",
      paddingLeft: "270px !important",
      minWidth: "10px !important",
    };

    const rowStyles = {
      minWidth: "330px",
      color: "#fff !important",
    };

    const cellDataStyles = {
      fontWeight: "bold",
      fontSize: "26px !important",
    };

    const emptyCellStyle = {
      border: "none !important",
    };

    const emptyCellStyleBorder = {
      borderLeft: "1px solid #b7b7b7",
      borderRight: "1px solid #b7b7b7",
    };

    const emptyCellContent = "\u00A0";

    const customCell = (
      <>
        <TableCell sx={cellStylesAbsolute}>{emptyCellContent}</TableCell>
        <TableCell sx={cellStylesDop}>{emptyCellContent}</TableCell>
      </>
    );

    const customRow = (
      <>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
      </>
    );

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TabPanel
          value={activeTab}
          index={1}
          id="clients"
        >
          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <CityCafeAutocomplete2
                label="Кафе"
                withAll
                withAllSelected
                points={points}
                value={this.state.point}
                onChange={(value) => this.changePoints("point", null, value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                onClick={() => this.get_data_clients()}
              >
                Показать
              </Button>
              {this.props.canExport && data_clients_list.length > 0 && (
                <DownloadButton
                  variant="contained"
                  color="success"
                  button={true}
                  url={async () => await this.get_data_clients(true)}
                  sx={{ ml: { sm: 2, xs: 0 } }}
                >
                  <Download />
                </DownloadButton>
              )}
            </Grid>

            {!data_clients_list.length ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                sx={{
                  mt: 3,
                  mb: 5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <TableContainer
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    overflowX: "auto",
                    overflowY: "hidden",
                    paddingBottom: 5,
                  }}
                  className="montserrat-family"
                >
                  {data_clients_list.map((table, index) => (
                    <Table
                      key={index}
                      size="small"
                      sx={{
                        marginRight: 5,
                        "& .MuiTableCell-root": { ...borderStyle, textAlign: "center" },
                        maxWidth: "70%",
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          {index === 0 && (
                            <>
                              <TableCell sx={cellStylesAbsolute}>Месяц / Год</TableCell>
                              <TableCell sx={cellStylesDop}>{emptyCellContent}</TableCell>
                            </>
                          )}

                          <TableCell
                            sx={{ backgroundColor: "#d3d3d3" }}
                            colSpan={15}
                          >
                            {dayjs(table[0].month + "-01")
                              .format("MMMM YYYY")
                              .replace(/^./, (match) => match.toUpperCase())}
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}

                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#B22222" }}
                            onClick={() => openGraphModal("stat_clients", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Клиентам">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  1.КЛИЕНТЫ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#FF8C00" }}
                            onClick={() => openGraphModal("stat_active", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Активности">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  2.АКТИВНОСТЬ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#3CB371" }}
                            onClick={() => openGraphModal("stat_orders", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Заказам">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  3.ЗАКАЗЫ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#4169E1" }}
                            onClick={() => openGraphModal("stat_avg", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Среднему чеку">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  4.СРЕДНИЙ ЧЕК
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}

                          <TableCell sx={commonCellStyles}>Ж/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>% клиентов</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>А/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>% активных аккаунтов</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>З/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>Заказов в среднем</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>В/З</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>Средний чек, руб</TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}
                          {customRow}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {table.map((item, key) => (
                          <React.Fragment key={key}>
                            <TableRow>
                              {index === 0 && (
                                <>
                                  <TableCell
                                    sx={{
                                      ...cellStylesAbsoluteName,
                                      borderBottom: "none !important",
                                    }}
                                  >
                                    {item.name}
                                  </TableCell>
                                  <TableCell
                                    rowSpan={2}
                                    sx={cellStylesDop}
                                  >
                                    {emptyCellContent}
                                  </TableCell>
                                </>
                              )}

                              <TableCell>жителей</TableCell>
                              <TableCell>{item.peopleFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.clientsColor ? item.clientsColor : null,
                                }}
                              >
                                {item.percentClients}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>аккаунтов</TableCell>
                              <TableCell>{item.activeFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.activeColor ? item.activeColor : null,
                                }}
                              >
                                {item.percentActiveAccounts}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>заказов</TableCell>
                              <TableCell>{item.ordersFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.ordersColor ? item.ordersColor : null,
                                }}
                              >
                                {item.ordersAvg}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>выручка</TableCell>
                              <TableCell>{item.summFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.avgColor ? item.avgColor : null,
                                }}
                              >
                                {item.averageCheck}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                            </TableRow>

                            <TableRow>
                              {index === 0 && (
                                <TableCell
                                  sx={{
                                    ...cellStylesAbsolute,
                                    borderTop: "none !important",
                                    borderBottom:
                                      key === table.length - 1
                                        ? "1px solid #ccc"
                                        : "none !important",
                                    height: key === table.length - 1 ? "none !important" : "50px",
                                  }}
                                >
                                  {emptyCellContent}
                                </TableCell>
                              )}

                              <TableCell>аккаунтов</TableCell>
                              <TableCell>{item.activeFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>актив. акк.</TableCell>
                              <TableCell>{item.registredFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>актив. акк.</TableCell>
                              <TableCell>{item.registredFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>заказов</TableCell>
                              <TableCell>{item.ordersFormatted}</TableCell>
                            </TableRow>

                            <TableRow>
                              {index === 0 && key === 0 && customCell}
                              {index === 0 &&
                                !item.point_id &&
                                table[key + 1] &&
                                table[key + 1].point_id &&
                                customCell}
                              {key === 0 && customRow}
                              {!item.point_id &&
                                table[key + 1] &&
                                table[key + 1].point_id &&
                                customRow}
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  ))}
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

export default StatSale_Tab_Clients;
