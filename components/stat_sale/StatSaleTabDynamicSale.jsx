import React from "react";

import dayjs from "dayjs";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Chip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { MyDatePickerNewViews } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import ProgressTimeline from "@/components/stat_sale/ProgressTimeline";
import axios from "axios";
import StatSaleYearlyLineChart from "@/components/stat_sale/StatSaleYearlyLineChart";

class StatSale_Tab_DynamicSale extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),
      data_clients_list: {},
      res: {},
      pizzaArr: [],
      rollyArr: [],
      orderArr: [],
      accountArr: [],
      pizzaLine: {},
      rollyLine: {},
      ordersLine: {},
      data_clients_list_cafe: {},
      data_clients_list_kc: {},
      data_clients_list_site: {},
      yearly_totals: null,
      yearly_totals_cafe: null,
      yearly_totals_kc: null,
      yearly_totals_site: null,
      expandedTableYears: {},
      loading: false,
    };
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  /**
   * Конвертирует объект { "2025-1": {...}, "2026-4": {...} }
   * в отсортированный массив по дате
   */
  objectToSortedArray = (obj) => {
    if (!obj || typeof obj !== "object") return [];

    return Object.values(obj).sort((a, b) => {
      if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
      return a.month - b.month;
    });
  };

  get_data_clients = async (exp = false) => {
    const { date_start, date_end, point } = this.state;
    const data = {
      date_start: dayjs(date_start).subtract(1, "month").format("YYYY-MM"),
      date_end: dayjs(date_end).format("YYYY-MM"),
      points: point,
    };

    // export
    if (exp) {
      try {
        this.setState({ is_load: true });

        const response = await axios.post(
          "https://apichef.jacochef.ru/api/stat_sale/export_data_dynamics",
          {
            method: "export_data_dynamics",
            module: "orders_by_hour",
            version: 2,
            login: localStorage.getItem("token"),
            data: this.state.res,
          },
          {
            responseType: "blob",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
            timeout: 30000,
          },
        );

        const contentType = response.headers["content-type"];

        if (contentType && contentType.includes("application/json")) {
          const text = await response.data.text();
          const errorData = JSON.parse(text);
          this.props.openAlert(false, errorData.text || "Ошибка экспорта");
          return;
        }

        if (response.data.size === 0) {
          this.props.openAlert(false, "Ошибка: получен пустой файл");
          return;
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        let fileName = `stat_dynamics_${new Date().toISOString().split("T")[0]}.xlsx`;
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        this.props.openAlert(true, "Экспорт успешно выполнен");
      } catch (error) {
        console.error("Export error:", error);

        let errorMessage = "Ошибка при экспорте";
        if (error.response && error.response.data) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.text || errorMessage;
          } catch (e) {
            errorMessage = error.message || errorMessage;
          }
        } else {
          errorMessage = error.message || errorMessage;
        }

        this.props.openAlert(false, errorMessage);
      } finally {
        this.setState({ is_load: false });
      }
      return;
    }

    this.setState({ loading: true });
    const res = await this.props.getData("get_dynamics_pay", data);
    this.setState({ loading: false });

    if (res.st) {
      const pizzaArr = [];
      const rollyArr = [];
      const orderArr = [];
      const accountArr = [];
      const pizzaCapacity = 24000;
      const rollyCapacity = 200000;
      const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const calcPercent = (numerator, denominator) => {
        const safeDenominator = toNumber(denominator);
        if (!safeDenominator) return 0;
        return (toNumber(numerator) / safeDenominator) * 100;
      };
      const getPlanLoad = (value, plan, capacity) => {
        if (value !== null && value !== undefined) return toNumber(value);
        return calcPercent(plan, capacity);
      };
      const getFirstDefinedPercent = (...values) => {
        const value = values.find((item) => item !== null && item !== undefined);
        return value !== undefined ? toNumber(value) : null;
      };
      const getFactYoYPercent = (current, previousYear, backendValue) => {
        const value = getFirstDefinedPercent(backendValue);
        if (value !== null) return value;
        return calcPercent(toNumber(current) - toNumber(previousYear), previousYear);
      };
      const entries = Object.entries(res.res);
      entries.map(([key, value], index) => {
        const prevMonth = entries[index - 1]?.[1];
        const [year] = key.split("-");
        if (index !== 0 && prevMonth) {
          pizzaArr.push({
            periodKey: key,
            year,
            month: value.month_name,
            planQty: value.pizza_plan,
            planLoad: getPlanLoad(value.pizza_plan_load, value.pizza_plan, pizzaCapacity),
            factQty: value.pizza,
            planFact:
              getFirstDefinedPercent(value.pizza_plan_fact) ??
              calcPercent(value.pizza, value.pizza_plan),
            factYoYPct: getFactYoYPercent(
              value.pizza,
              value.pizza_fact_prev_year,
              value.pizza_fact_yoy,
            ),
            factYoYQty:
              value.pizza_fact_yoy_delta !== null && value.pizza_fact_yoy_delta !== undefined
                ? toNumber(value.pizza_fact_yoy_delta)
                : toNumber(value.pizza) - toNumber(value.pizza_fact_prev_year),
            factDynPct: calcPercent(
              toNumber(value.pizza) - toNumber(prevMonth.pizza),
              prevMonth.pizza,
            ),
            factDynQty: toNumber(value.pizza) - toNumber(prevMonth.pizza),
            factLoad:
              getFirstDefinedPercent(value.pizza_fact_load) ??
              calcPercent(value.pizza, pizzaCapacity),
          });
        }

        if (key !== 0 && prevMonth) {
          rollyArr.push({
            periodKey: key,
            year,
            month: value.month_name,
            planQty: value.rolly_plan,
            planLoad: getPlanLoad(value.rolly_plan_load, value.rolly_plan, rollyCapacity),
            factQty: value.rolly,
            planFact:
              getFirstDefinedPercent(value.rolly_plan_fact) ??
              calcPercent(value.rolly, value.rolly_plan),
            factYoYPct: getFactYoYPercent(
              value.rolly,
              value.rolly_fact_prev_year,
              value.rolly_fact_yoy,
            ),
            factYoYQty:
              value.rolly_fact_yoy_delta !== null && value.rolly_fact_yoy_delta !== undefined
                ? toNumber(value.rolly_fact_yoy_delta)
                : toNumber(value.rolly) - toNumber(value.rolly_fact_prev_year),
            factDynPct: calcPercent(
              toNumber(value.rolly) - toNumber(prevMonth?.rolly),
              prevMonth?.rolly,
            ),
            factDynQty: toNumber(value.rolly) - toNumber(prevMonth?.rolly),
            factLoad:
              getFirstDefinedPercent(value.rolly_fact_load) ??
              calcPercent(value.rolly, rollyCapacity),
          });
        }

        if (key !== 0 && prevMonth) {
          orderArr.push({
            periodKey: key,
            year,
            month: value.month_name,
            planQty: value.orders_plan ?? value.order_plan,
            planLoad:
              getFirstDefinedPercent(
                value.orders_plan_fact,
                value.order_plan_fact,
                value.orders_fact_plan,
                value.order_fact_plan,
              ) ?? calcPercent(value.orders, value.orders_plan ?? value.order_plan),
            factQty: value.orders,
            factYoYPct: getFactYoYPercent(
              value.orders,
              value.orders_fact_prev_year ?? value.order_fact_prev_year,
              value.orders_fact_yoy ?? value.order_fact_yoy,
            ),
            factYoYQty:
              value.orders_fact_yoy_delta !== null && value.orders_fact_yoy_delta !== undefined
                ? toNumber(value.orders_fact_yoy_delta)
                : toNumber(value.order_fact_yoy_delta) ||
                  toNumber(value.orders) -
                    toNumber(value.orders_fact_prev_year ?? value.order_fact_prev_year),
            factDynPct: calcPercent(
              toNumber(value.orders) - toNumber(prevMonth?.orders),
              prevMonth?.orders,
            ),
            factDynQty: toNumber(value.orders) - toNumber(prevMonth?.orders),
            factLoad: calcPercent(value.orders, prevMonth.orders),
          });
        }

        if (key !== 0 && prevMonth) {
          accountArr.push({
            periodKey: key,
            year,
            month: value.month_name,
            planQty: value.active_plan,
            planLoad: calcPercent(value.active, value.active_plan),
            factQty: value.active,
            factDynPct: calcPercent(
              toNumber(value.active) - toNumber(prevMonth?.active),
              prevMonth?.active,
            ),
            factDynQty: toNumber(value.active) - toNumber(prevMonth?.active),
            factLoad: calcPercent(value.active, prevMonth.active),
          });
        }
      });
      this.setState({
        pizzaArr,
        rollyArr,
        orderArr,
        accountArr,
        pizzaLine: res.pizza_line ?? {},
        rollyLine: res.rolly_line ?? {},
        ordersLine: res.orders_line ?? {},
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  getYearGroups(rows) {
    const groups = rows.reduce((acc, row) => {
      const fallbackYear = String(row.periodKey ?? "").split("-")[0];
      const year = row.year || fallbackYear || "Без года";
      if (!acc[year]) acc[year] = [];
      acc[year].push(row);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([year, items]) => ({ year, items }))
      .sort((a, b) => {
        const yearA = Number(a.year);
        const yearB = Number(b.year);
        if (!Number.isFinite(yearA) || !Number.isFinite(yearB))
          return String(a.year).localeCompare(String(b.year));
        return yearA - yearB;
      });
  }

  getDefaultExpandedYear(groups) {
    if (!groups.length) return null;

    return groups.reduce((maxYear, group) => {
      const current = Number(group.year);
      const max = Number(maxYear);
      if (!Number.isFinite(current) || !Number.isFinite(max)) return maxYear;
      return current > max ? group.year : maxYear;
    }, groups[0].year);
  }

  isYearExpanded(tableKey, year, groups) {
    if (groups.length === 1) return true;

    const tableYears = this.state.expandedTableYears?.[tableKey] ?? {};
    if (Object.prototype.hasOwnProperty.call(tableYears, year)) return tableYears[year];

    return year === this.getDefaultExpandedYear(groups);
  }

  toggleYear(tableKey, year, groups) {
    if (groups.length === 1) return;

    this.setState((prevState) => {
      const tableYears = prevState.expandedTableYears?.[tableKey] ?? {};
      return {
        expandedTableYears: {
          ...prevState.expandedTableYears,
          [tableKey]: {
            ...tableYears,
            [year]: !this.isYearExpanded(tableKey, year, groups),
          },
        },
      };
    });
  }

  renderPizzaTable(pizzaArr, title, subTitle, options = {}) {
    const {
      planFulfillment = false,
      tableKey = title,
      showFactYoY = true,
      preserveAccountPercentDecimals = false,
    } = options;
    const getSafeNumber = (value) => {
      const parsed = Number(String(value ?? "").replace(",", "."));
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const formatQuantity = (value) =>
      value !== null && value !== undefined
        ? getSafeNumber(value).toLocaleString("ru-RU").replace(/\s/g, " ")
        : "";
    const hasPlanFact = pizzaArr.some((row) => row.planFact !== null && row.planFact !== undefined);
    const yearGroups = this.getYearGroups(pizzaArr);
    const factColumnCount = 4 + (showFactYoY ? 1 : 0) + (hasPlanFact ? 1 : 0);
    const columnCount = 1 + (planFulfillment ? 1 : 2) + factColumnCount;

    const formatPercent = (value) => {
      const numericValue = getSafeNumber(value);

      return preserveAccountPercentDecimals
        ? String(Number(numericValue.toFixed(2)))
        : String(Math.round(numericValue));
    };
    const renderPercentChip = (value, variant = "filled") => (
      <Chip
        label={formatPercent(value)}
        size="small"
        variant={variant}
        sx={
          variant === "outlined"
            ? {
                borderColor: "#1976d2",
                color: "#1976d2",
                fontWeight: "500",
                fontSize: "0.75rem",
              }
            : {
                backgroundColor: getSafeNumber(value) >= 0 ? "#4caf50" : "#f44336",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.75rem",
                minWidth: "70px",
                "& .MuiChip-label": {
                  padding: "4px 8px",
                },
              }
        }
      />
    );

    const cellSx = {
      border: "1px solid #e0e0e0",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "0.8rem",
      backgroundColor: "#fafafa",
      padding: "12px 8px",
    };

    const bodyCellSx = {
      border: "1px solid #e0e0e0",
      textAlign: "center",
      fontSize: "0.85rem",
      padding: "10px 8px",
      transition: "background-color 0.2s ease",
    };

    if (!pizzaArr.length) return null;

    const renderDataRow = (row, index) => (
      <TableRow
        key={row.periodKey ?? `${row.month}-${index}`}
        sx={{
          "&:hover": {
            backgroundColor: "#f5f5f5",
            "& .MuiTableCell-root": {
              backgroundColor: "#f5f5f5",
            },
          },
        }}
      >
        <TableCell
          component="th"
          scope="row"
          sx={{
            ...bodyCellSx,
            fontWeight: "bold",
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          {row.month}
        </TableCell>
        <TableCell
          sx={{
            ...bodyCellSx,
            fontWeight: "500",
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          {formatQuantity(row.planQty)}
        </TableCell>
        {!planFulfillment && (
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
            }}
          >
            {formatPercent(row.planLoad)}
          </TableCell>
        )}
        <TableCell
          sx={{
            ...bodyCellSx,
            fontWeight: "500",
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          {formatQuantity(row.factQty)}
        </TableCell>
        {showFactYoY && (
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
            }}
          >
            {renderPercentChip(row.factYoYPct)}
          </TableCell>
        )}
        <TableCell
          sx={{
            ...bodyCellSx,
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          <Chip
            label={formatPercent(row.factDynPct)}
            size="small"
            sx={{
              backgroundColor: getSafeNumber(row.factDynPct) >= 0 ? "#4caf50" : "#f44336",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              minWidth: "70px",
              "& .MuiChip-label": {
                padding: "4px 8px",
              },
            }}
          />
        </TableCell>
        <TableCell
          sx={{
            ...bodyCellSx,
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <span
              style={{
                color: getSafeNumber(row.factDynQty) >= 0 ? "#4caf50" : "#f44336",
                fontWeight: "bold",
                fontSize: "0.85rem",
              }}
            >
              {getSafeNumber(row.factDynQty) > 0 ? "+" : ""}
              {formatQuantity(row.factDynQty)}
            </span>
            {getSafeNumber(row.factDynQty) !== 0 && (
              <span style={{ fontSize: "0.7rem" }}>
                {getSafeNumber(row.factDynQty) > 0 ? "▲" : "▼"}
              </span>
            )}
          </Box>
        </TableCell>
        <TableCell
          sx={{
            ...bodyCellSx,
            backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
          }}
        >
          <Chip
            label={formatPercent(planFulfillment ? row.planLoad : row.factLoad)}
            size="small"
            variant={planFulfillment ? "filled" : "outlined"}
            sx={
              planFulfillment
                ? {
                    backgroundColor: getSafeNumber(row.planLoad) >= 100 ? "#4caf50" : "#f44336",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    minWidth: "70px",
                    "& .MuiChip-label": {
                      padding: "4px 8px",
                    },
                  }
                : {
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    fontWeight: "500",
                    fontSize: "0.75rem",
                  }
            }
          />
        </TableCell>
        {hasPlanFact && (
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: index % 2 === 0 ? "#fafafa" : "white",
            }}
          >
            <Chip
              label={formatPercent(row.planFact)}
              size="small"
              sx={{
                backgroundColor: getSafeNumber(row.planFact) >= 100 ? "#4caf50" : "#f44336",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.75rem",
                minWidth: "70px",
                "& .MuiChip-label": {
                  padding: "4px 8px",
                },
              }}
            />
          </TableCell>
        )}
      </TableRow>
    );

    return (
      <Grid
        size={{ xs: 12, sm: 12 }}
        sx={{ mt: 3, mb: 5, position: "relative", overflow: "hidden" }}
      >
        <TableContainer
          component={Paper}
          sx={{
            margin: "20px auto",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "& .MuiTableCell-root": {
              borderColor: "#e0e0e0",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{ p: 2, fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #f0f0f0" }}
          >
            {title}
          </Typography>
          <Table
            sx={{ minWidth: 650 }}
            aria-label="food table"
          >
            <TableHead>
              <TableRow>
                <TableCell
                  rowSpan={3}
                  sx={cellSx}
                >
                  Период
                </TableCell>
                <TableCell
                  colSpan={planFulfillment ? 1 : 2}
                  rowSpan={2}
                  sx={{ ...cellSx, backgroundColor: "#e8f5e9" }}
                >
                  План
                </TableCell>
                <TableCell
                  colSpan={factColumnCount}
                  sx={{ ...cellSx, backgroundColor: "#e3f2fd" }}
                >
                  {subTitle}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={factColumnCount}
                  sx={{ ...cellSx, backgroundColor: "#fff3e0" }}
                >
                  Факт
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Кол-во</TableCell>
                {!planFulfillment && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Загрузка, %</TableCell>
                )}
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Кол-во</TableCell>
                {showFactYoY && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика г/г, %</TableCell>
                )}
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика м/м, %</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика, шт</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>
                  {planFulfillment ? "п/ф, %" : "Загрузка, %"}
                </TableCell>
                {hasPlanFact && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>п/ф, %</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {yearGroups.map((group) => {
                const expanded = this.isYearExpanded(tableKey, group.year, yearGroups);

                return (
                  <React.Fragment key={`${tableKey}-${group.year}`}>
                    <TableRow
                      hover={yearGroups.length > 1}
                      onClick={() => this.toggleYear(tableKey, group.year, yearGroups)}
                      sx={{
                        cursor: yearGroups.length > 1 ? "pointer" : "default",
                        "& .MuiTableCell-root": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell
                        colSpan={columnCount}
                        sx={{
                          ...bodyCellSx,
                          padding: "8px 12px",
                          textAlign: "left",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            disabled={yearGroups.length === 1}
                            sx={{ p: 0.25 }}
                          >
                            {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                          </IconButton>
                          <Typography sx={{ fontWeight: 700 }}>{group.year} год</Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {group.items.length} мес.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {expanded ? group.items.map((row, index) => renderDataRow(row, index)) : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    );
  }

  render() {
    const { activeTab } = this.props;
    const { data_clients_list, loading, pizzaArr, rollyArr, orderArr, accountArr } = this.state;

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{ xs: 12, sm: 12 }}
      >
        <TabPanel
          value={activeTab}
          index={3}
          id="dynamics"
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
                points={this.props.points}
                value={this.state.point}
                onChange={(event, value) => this.changePoints("point", event, event)}
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
                disabled={loading}
              >
                {loading ? "Загрузка..." : "Показать"}
              </Button>
            </Grid>
            {this.renderPizzaTable(orderArr, "Таблица с заказами", "Заказы, кол-во", {
              planFulfillment: true,
            })}
            {Object.entries(this.state.ordersLine).length ? (
              <StatSaleYearlyLineChart
                rawData={this.state.ordersLine}
                title="Динамика заказов по годам"
                dateStart={this.state.date_start}
                dateEnd={this.state.date_end}
              />
            ) : null}
            {this.renderPizzaTable(rollyArr, "Таблица с роллами", "Ролл, шт")}
            {Object.entries(this.state.rollyLine).length ? (
              <StatSaleYearlyLineChart
                rawData={this.state.rollyLine}
                title="Динамика роллов по годам"
                dateStart={this.state.date_start}
                dateEnd={this.state.date_end}
              />
            ) : null}
            {this.renderPizzaTable(pizzaArr, "Таблица с пиццей", "Пицца, шт")}
            {Object.entries(this.state.pizzaLine).length ? (
              <StatSaleYearlyLineChart
                rawData={this.state.pizzaLine}
                title="Динамика пиццы по годам"
                dateStart={this.state.date_start}
                dateEnd={this.state.date_end}
              />
            ) : null}
            {this.renderPizzaTable(
              accountArr,
              "Таблица с аккаунтами (данные по всем кафе)",
              "Аккаунты, кол-во",
              {
                planFulfillment: true,
                showFactYoY: false,
                preserveAccountPercentDecimals: true,
              },
            )}
            {accountArr.length ? (
              <Grid size={{ xs: 12, sm: 12 }}>
                <Box sx={{ width: { xs: "100%", md: "66.6667%" }, mx: "auto", mt: 1, mb: 5 }}>
                  <ProgressTimeline data={accountArr} />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

export default StatSale_Tab_DynamicSale;
