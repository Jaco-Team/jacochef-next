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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { MyDatePickerNewViews } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import ProgressTimeline from "@/components/stat_sale/ProgressTimeline";
import axios from "axios";
import { credentialsConfig, getAuthHeaders } from "@/src/api_new";
import StatSaleYearlyLineChart from "@/components/stat_sale/StatSaleYearlyLineChart";
import StatSalePlanFactLineChart from "@/components/stat_sale/StatSalePlanFactLineChart";
import { JacoSegmentedTabs } from "@/design-system/shared/ui";
import {
  buildDynamicSaleView,
  indexRowsByPeriod,
  SALES_SOURCE_KEYS,
  SALES_SOURCE_LABELS,
  SALES_SOURCE_TABS,
} from "@/components/stat_sale/statSaleDynamicSaleUtils";

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
      annualPlanTotals: {
        orders: null,
        rolly: null,
        pizza: null,
      },
      data_clients_list_cafe: {},
      data_clients_list_kc: {},
      data_clients_list_site: {},
      yearly_totals: null,
      yearly_totals_cafe: null,
      yearly_totals_kc: null,
      yearly_totals_site: null,
      expandedTableYears: {},
      expandedTableMonths: {},
      sourceRows: {
        cafe: { orders: [], rolly: [], pizza: [] },
        kc: { orders: [], rolly: [], pizza: [] },
        site: { orders: [], rolly: [], pizza: [] },
      },
      annualPlanTotalsBySource: {},
      linesBySource: {},
      analyticsSources: {
        orders: "total",
        rolly: "total",
        pizza: "total",
      },
      analyticsResetKey: 0,
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
    const selectedStart = dayjs(date_start).startOf("month");
    const selectedEnd = dayjs(date_end).startOf("month");
    const currentYear = new Date().getFullYear();
    const currentYearStart = dayjs(`${currentYear}-01-01`).startOf("month");
    const currentYearEnd = dayjs(`${currentYear}-12-01`).startOf("month");
    const includesCurrentYear =
      !selectedEnd.isBefore(currentYearStart, "month") &&
      !selectedStart.isAfter(currentYearEnd, "month");
    let requestStart = selectedStart.subtract(1, "month");
    let requestEnd = selectedEnd;

    if (includesCurrentYear) {
      const annualPlanStart = currentYearStart.subtract(1, "month");
      if (requestStart.isAfter(annualPlanStart, "month")) requestStart = annualPlanStart;
      if (requestEnd.isBefore(currentYearEnd, "month")) requestEnd = currentYearEnd;
    }

    const data = {
      date_start: requestStart.format("YYYY-MM"),
      date_end: requestEnd.format("YYYY-MM"),
      points: point,
    };

    // export
    if (exp) {
      try {
        this.setState({ is_load: true });

        const response = await axios.post(
          "https://apichef2.jacochef.ru/api/stat_sale/export_data_dynamics",
          {
            method: "export_data_dynamics",
            module: "orders_by_hour",
            version: 2,
            data: this.state.res,
          },
          {
            ...credentialsConfig,
            responseType: "blob",
            headers: getAuthHeaders({
              "Content-Type": "application/json",
              Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
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
      const selectedStartIndex = selectedStart.year() * 12 + selectedStart.month();
      const selectedEndIndex = selectedEnd.year() * 12 + selectedEnd.month();
      const buildView = (monthMap) =>
        buildDynamicSaleView({
          monthMap,
          selectedStartIndex,
          selectedEndIndex,
          currentYear,
          includesCurrentYear,
        });
      const totalView = buildView(res.res);
      const sourceViews = SALES_SOURCE_KEYS.reduce((views, source) => {
        views[source] = buildView(res.res_by_source?.[source]);
        return views;
      }, {});
      const sourceRows = SALES_SOURCE_KEYS.reduce((rows, source) => {
        rows[source] = {
          orders: sourceViews[source].orders,
          rolly: sourceViews[source].rolly,
          pizza: sourceViews[source].pizza,
        };
        return rows;
      }, {});
      const annualPlanTotalsBySource = SALES_SOURCE_KEYS.reduce(
        (totals, source) => ({
          ...totals,
          [source]: sourceViews[source].annualPlanTotals,
        }),
        { total: totalView.annualPlanTotals },
      );

      this.setState((prevState) => ({
        res,
        pizzaArr: totalView.pizza,
        rollyArr: totalView.rolly,
        orderArr: totalView.orders,
        accountArr: totalView.accounts,
        annualPlanTotals: totalView.annualPlanTotals,
        sourceRows,
        annualPlanTotalsBySource,
        pizzaLine: res.pizza_line ?? {},
        rollyLine: res.rolly_line ?? {},
        ordersLine: res.orders_line ?? {},
        linesBySource: res.lines_by_source ?? {},
        analyticsSources: {
          orders: "total",
          rolly: "total",
          pizza: "total",
        },
        expandedTableYears: {},
        expandedTableMonths: {},
        analyticsResetKey: prevState.analyticsResetKey + 1,
      }));
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

  isMonthExpanded(tableKey, periodKey) {
    return Boolean(this.state.expandedTableMonths?.[`${tableKey}:${periodKey}`]);
  }

  toggleMonth(tableKey, periodKey) {
    const key = `${tableKey}:${periodKey}`;
    this.setState((prevState) => ({
      expandedTableMonths: {
        ...prevState.expandedTableMonths,
        [key]: !prevState.expandedTableMonths?.[key],
      },
    }));
  }

  changeAnalyticsSource(metric, source) {
    this.setState((prevState) => ({
      analyticsSources: {
        ...prevState.analyticsSources,
        [metric]: source,
      },
    }));
  }

  renderPizzaTable(pizzaArr, title, options = {}) {
    const {
      planFulfillment = false,
      tableKey = title,
      showFactYoY = true,
      preserveAccountPercentDecimals = false,
      sourceRows = null,
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
    const renderColoredValue = (value, { threshold = 0, formatter = formatPercent } = {}) => (
      <Typography
        component="span"
        sx={{
          color:
            threshold === 0 && getSafeNumber(value) === 0
              ? "text.secondary"
              : getSafeNumber(value) >= threshold
                ? "success.main"
                : "error.main",
          fontWeight: 700,
          fontSize: "0.85rem",
        }}
      >
        {formatter(value)}
      </Typography>
    );
    const sourceRowsByPeriod = sourceRows
      ? SALES_SOURCE_KEYS.reduce((result, source) => {
          result[source] = indexRowsByPeriod(sourceRows[source] ?? []);
          return result;
        }, {})
      : null;

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

    const renderDataRow = (row, index, rowOptions = {}) => {
      const { source = null, expanded = false } = rowOptions;
      const isSourceRow = Boolean(source);
      const canExpand = !isSourceRow && Boolean(sourceRowsByPeriod);
      const rowBackground = isSourceRow ? "#f7f9fc" : index % 2 === 0 ? "#fafafa" : "white";

      return (
        <TableRow
          key={`${row.periodKey ?? `${row.month}-${index}`}-${source ?? "total"}`}
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
              backgroundColor: rowBackground,
              color: isSourceRow ? "primary.main" : "text.primary",
              textAlign: "left",
              pl: isSourceRow ? 6 : canExpand ? 0.5 : 2,
            }}
          >
            {isSourceRow ? (
              SALES_SOURCE_LABELS[source]
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {canExpand ? (
                  <IconButton
                    size="small"
                    onClick={() => this.toggleMonth(tableKey, row.periodKey)}
                    aria-label={`${expanded ? "Свернуть" : "Развернуть"} источники за ${row.month}`}
                    aria-expanded={expanded}
                  >
                    {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                  </IconButton>
                ) : null}
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, fontSize: "inherit" }}
                >
                  {row.month}
                </Typography>
                {canExpand ? (
                  <Typography
                    component="span"
                    sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.75rem" }}
                  >
                    Тотал
                  </Typography>
                ) : null}
              </Box>
            )}
          </TableCell>
          <TableCell
            sx={{
              ...bodyCellSx,
              fontWeight: "500",
              backgroundColor: rowBackground,
            }}
          >
            {formatQuantity(row.planQty)}
          </TableCell>
          {!planFulfillment && (
            <TableCell
              sx={{
                ...bodyCellSx,
                backgroundColor: rowBackground,
              }}
            >
              <Typography
                component="span"
                sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}
              >
                {formatPercent(row.planLoad)}
              </Typography>
            </TableCell>
          )}
          <TableCell
            sx={{
              ...bodyCellSx,
              fontWeight: "500",
              backgroundColor: rowBackground,
            }}
          >
            {formatQuantity(row.factQty)}
          </TableCell>
          {showFactYoY && (
            <TableCell
              sx={{
                ...bodyCellSx,
                backgroundColor: rowBackground,
              }}
            >
              {renderColoredValue(row.factYoYPct)}
            </TableCell>
          )}
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: rowBackground,
            }}
          >
            {renderColoredValue(row.factDynPct)}
          </TableCell>
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: rowBackground,
            }}
          >
            {renderColoredValue(row.factDynQty, { formatter: formatQuantity })}
          </TableCell>
          <TableCell
            sx={{
              ...bodyCellSx,
              backgroundColor: rowBackground,
            }}
          >
            {planFulfillment ? (
              renderColoredValue(row.planLoad, { threshold: 100 })
            ) : (
              <Typography
                component="span"
                sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.85rem" }}
              >
                {formatPercent(row.factLoad)}
              </Typography>
            )}
          </TableCell>
          {hasPlanFact && (
            <TableCell
              sx={{
                ...bodyCellSx,
                backgroundColor: rowBackground,
              }}
            >
              {renderColoredValue(row.planFact, { threshold: 100 })}
            </TableCell>
          )}
        </TableRow>
      );
    };

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
                  rowSpan={2}
                  sx={cellSx}
                >
                  Период
                </TableCell>
                <TableCell
                  colSpan={planFulfillment ? 1 : 2}
                  sx={{ ...cellSx, backgroundColor: "#e8f5e9" }}
                >
                  План
                </TableCell>
                <TableCell
                  colSpan={factColumnCount}
                  sx={{ ...cellSx, backgroundColor: "#fff3e0" }}
                >
                  Факт
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Кол-во, шт</TableCell>
                {!planFulfillment && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Загрузка, %</TableCell>
                )}
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Кол-во, шт</TableCell>
                {showFactYoY && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика г/г, %</TableCell>
                )}
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика м/м, %</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>Динамика, шт</TableCell>
                <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>
                  {planFulfillment ? "План/Факт, %" : "Загрузка, %"}
                </TableCell>
                {hasPlanFact && (
                  <TableCell sx={{ ...cellSx, fontWeight: "bold" }}>План/Факт, %</TableCell>
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
                          {yearGroups.length > 1 ? (
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                this.toggleYear(tableKey, group.year, yearGroups);
                              }}
                              aria-label={`${expanded ? "Свернуть" : "Развернуть"} ${group.year} год`}
                              aria-expanded={expanded}
                            >
                              {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                            </IconButton>
                          ) : null}
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
                    {expanded
                      ? group.items.map((row, index) => {
                          const monthExpanded = this.isMonthExpanded(tableKey, row.periodKey);

                          return (
                            <React.Fragment key={`${tableKey}-${row.periodKey}`}>
                              {renderDataRow(row, index, { expanded: monthExpanded })}
                              {monthExpanded && sourceRowsByPeriod
                                ? SALES_SOURCE_KEYS.map((source) => {
                                    const sourceRow = sourceRowsByPeriod[source]?.[row.periodKey];
                                    return sourceRow
                                      ? renderDataRow(sourceRow, index, { source })
                                      : null;
                                  })
                                : null}
                            </React.Fragment>
                          );
                        })
                      : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    );
  }

  renderSalesMetric({
    metric,
    title,
    totalRows,
    totalLine,
    yearlyTitle,
    planFactTitle,
    progressTitle,
    tableOptions = {},
  }) {
    const { analyticsResetKey, analyticsSources, annualPlanTotalsBySource, linesBySource } =
      this.state;
    const selectedSource = analyticsSources[metric] ?? "total";
    const selectedRows =
      selectedSource === "total"
        ? totalRows
        : (this.state.sourceRows?.[selectedSource]?.[metric] ?? []);
    const selectedLine =
      selectedSource === "total" ? totalLine : (linesBySource?.[selectedSource]?.[metric] ?? {});
    const annualPlanTotal = annualPlanTotalsBySource?.[selectedSource]?.[metric] ?? null;
    const tableSourceRows = SALES_SOURCE_KEYS.reduce((result, source) => {
      result[source] = this.state.sourceRows?.[source]?.[metric] ?? [];
      return result;
    }, {});

    return (
      <>
        {this.renderPizzaTable(totalRows, title, {
          ...tableOptions,
          tableKey: metric,
          sourceRows: tableSourceRows,
        })}
        {totalRows.length ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ width: { xs: "100%", sm: 520 }, maxWidth: "100%", mx: "auto" }}>
              <JacoSegmentedTabs
                value={selectedSource}
                onChange={(_event, source) => this.changeAnalyticsSource(metric, source)}
                items={SALES_SOURCE_TABS}
                size="compact"
                aria-label={`Источник: ${title.toLowerCase()}`}
              />
            </Box>
          </Grid>
        ) : null}
        {Object.keys(selectedLine).length ? (
          <StatSaleYearlyLineChart
            rawData={selectedLine}
            title={yearlyTitle}
            dateStart={this.state.date_start}
            dateEnd={this.state.date_end}
            collapsible
            defaultExpanded={false}
            resetKey={analyticsResetKey}
          />
        ) : null}
        {selectedRows.length ? (
          <StatSalePlanFactLineChart
            data={selectedRows}
            title={planFactTitle}
            resetKey={analyticsResetKey}
          />
        ) : null}
        {selectedRows.length ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ width: { xs: "100%", md: "66.6667%" }, mx: "auto", mt: 1, mb: 5 }}>
              <ProgressTimeline
                data={selectedRows}
                title={progressTitle}
                cumulative
                annualPlanTotal={annualPlanTotal}
                resetKey={analyticsResetKey}
              />
            </Box>
          </Grid>
        ) : null}
      </>
    );
  }

  render() {
    const { activeTab } = this.props;
    const { loading, pizzaArr, rollyArr, orderArr, accountArr } = this.state;

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
            {this.renderSalesMetric({
              metric: "orders",
              title: "Заказы",
              totalRows: orderArr,
              totalLine: this.state.ordersLine,
              yearlyTitle: "Динамика заказов по годам",
              planFactTitle: "План / Факт — Заказы",
              progressTitle: "Выполнение плана по заказам",
              tableOptions: { planFulfillment: true },
            })}
            {this.renderSalesMetric({
              metric: "rolly",
              title: "Роллы",
              totalRows: rollyArr,
              totalLine: this.state.rollyLine,
              yearlyTitle: "Динамика роллов по годам",
              planFactTitle: "План / Факт — Роллы",
              progressTitle: "Выполнение плана по роллам",
            })}
            {this.renderSalesMetric({
              metric: "pizza",
              title: "Пицца",
              totalRows: pizzaArr,
              totalLine: this.state.pizzaLine,
              yearlyTitle: "Динамика пиццы по годам",
              planFactTitle: "План / Факт — Пицца",
              progressTitle: "Выполнение плана по пицце",
            })}
            {this.renderPizzaTable(accountArr, "Аккаунты (данные по всем кафе)", {
              planFulfillment: true,
              showFactYoY: false,
              preserveAccountPercentDecimals: true,
            })}
            {accountArr.length ? (
              <Grid size={{ xs: 12, sm: 12 }}>
                <Box sx={{ width: { xs: "100%", md: "66.6667%" }, mx: "auto", mt: 1, mb: 5 }}>
                  <ProgressTimeline
                    data={accountArr}
                    title="Выполнение плана по аккаунтам"
                    resetKey={this.state.analyticsResetKey}
                  />
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
