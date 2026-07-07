import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import ReportRevenueColumnsDialog from "@/components/report_revenue/ReportRevenueColumnsDialog";
import {
  DEFAULT_REPORT_REVENUE_VISIBLE_COLUMNS,
  REPORT_REVENUE_COLUMNS_STORAGE_KEY,
  REPORT_REVENUE_COLUMN_OPTIONS,
} from "@/components/report_revenue/reportRevenueColumns";

import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

export default class ReportRevenueTable extends React.Component {
  constructor(props) {
    super(props);
    this.topScrollRef = React.createRef();
    this.tableScrollRef = React.createRef();
    this.syncingScroll = false;
    this.state = {
      sort: {
        monthIndex: null,
        field: null,
        segmentKey: null,
        order: "desc",
      },
      expandedCategories: {},
      visibleColumns: DEFAULT_REPORT_REVENUE_VISIBLE_COLUMNS,
      columnsDialogOpen: false,
    };
  }

  componentDidMount() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedColumns = JSON.parse(
        window.localStorage.getItem(REPORT_REVENUE_COLUMNS_STORAGE_KEY),
      );

      if (savedColumns && typeof savedColumns === "object") {
        this.setState({
          visibleColumns: {
            ...DEFAULT_REPORT_REVENUE_VISIBLE_COLUMNS,
            ...savedColumns,
          },
        });
      }
    } catch (_) {}
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.months) !== JSON.stringify(prevProps.months) ||
      JSON.stringify(this.props.cats) !== JSON.stringify(prevProps.cats)
    ) {
      this.setState({
        sort: { monthIndex: null, field: null, segmentKey: null, order: "desc" },
        expandedCategories: {},
      });
    }
  }

  syncHorizontalScroll = (source) => {
    if (this.syncingScroll) {
      return;
    }

    const topScroll = this.topScrollRef.current;
    const tableScroll = this.tableScrollRef.current;

    if (!topScroll || !tableScroll) {
      return;
    }

    this.syncingScroll = true;

    if (source === "top") {
      tableScroll.scrollLeft = topScroll.scrollLeft;
    } else {
      topScroll.scrollLeft = tableScroll.scrollLeft;
    }

    requestAnimationFrame(() => {
      this.syncingScroll = false;
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(this.props.months) !== JSON.stringify(nextProps.months) ||
      JSON.stringify(this.props.cats) !== JSON.stringify(nextProps.cats) ||
      JSON.stringify(this.state.sort) !== JSON.stringify(nextState.sort) ||
      JSON.stringify(this.state.expandedCategories) !==
        JSON.stringify(nextState.expandedCategories) ||
      JSON.stringify(this.state.visibleColumns) !== JSON.stringify(nextState.visibleColumns) ||
      this.state.columnsDialogOpen !== nextState.columnsDialogOpen
    );
  }

  handleSort = (monthIndex, field, segmentKey = null) => {
    this.setState((prevState) => {
      let newOrder;
      if (
        prevState.sort.monthIndex === monthIndex &&
        prevState.sort.field === field &&
        prevState.sort.segmentKey === segmentKey
      ) {
        newOrder = prevState.sort.order === "asc" ? "desc" : "asc";
      } else {
        newOrder = "desc";
      }
      return { sort: { monthIndex, field, segmentKey, order: newOrder } };
    });
  };

  toggleCategory = (catId) => {
    this.setState((prevState) => ({
      expandedCategories: {
        ...prevState.expandedCategories,
        [catId]: !prevState.expandedCategories[catId],
      },
    }));
  };

  toggleAllCategories = (cats) => {
    const allExpanded = cats.every((cat) => this.state.expandedCategories[cat.id]);

    if (allExpanded) {
      this.setState({ expandedCategories: {} });
      return;
    }

    this.setState({
      expandedCategories: cats.reduce((acc, cat) => {
        acc[cat.id] = true;
        return acc;
      }, {}),
    });
  };

  saveVisibleColumns = (visibleColumns) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        REPORT_REVENUE_COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleColumns),
      );
    }
  };

  toggleColumn = (key) => {
    this.setState((prevState) => {
      const visibleColumns = {
        ...prevState.visibleColumns,
        [key]: !prevState.visibleColumns[key],
      };

      this.saveVisibleColumns(visibleColumns);

      return { visibleColumns };
    });
  };

  setAllColumns = (value) => {
    const visibleColumns = REPORT_REVENUE_COLUMN_OPTIONS.reduce((acc, item) => {
      acc[item.key] = value;
      return acc;
    }, {});

    this.saveVisibleColumns(visibleColumns);
    this.setState({ visibleColumns });
  };

  isColumnVisible = (key) => this.state.visibleColumns[key] !== false;

  formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(num);

  formatCurrency = (num) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(num);

  getRowTotal = (data) =>
    data.reduce(
      (acc, d) => ({
        count: acc.count + d.count,
        price: acc.price + d.price,
      }),
      { count: 0, price: 0 },
    );

  getItemTotal = (item) => item.total || this.getRowTotal(item.data);

  getPricePeriods = (cats) => {
    const periods = new Map();

    cats.forEach((cat) => {
      cat.items?.forEach((item) => {
        item.total?.price_segments?.forEach((segment) => {
          if (!periods.has(segment.key)) {
            periods.set(segment.key, {
              key: segment.key,
              date_start: segment.date_start,
            });
          }
        });
      });
    });

    return Array.from(periods.values()).sort((a, b) =>
      String(a.date_start || "").localeCompare(String(b.date_start || "")),
    );
  };

  getPricePeriodLabel = (period, index, periods) => {
    if (index === 0 && periods[1]?.date_start) {
      return `цена по ${dayjs(periods[1].date_start).subtract(1, "day").format("DD.MM.YY")}`;
    }

    if (period.date_start) {
      return `цена с ${dayjs(period.date_start).format("DD.MM.YY")}`;
    }

    return "цена";
  };

  getItemPriceSegment = (item, key) =>
    item.total?.price_segments?.find((segment) => segment.key === key) || {};

  getSortValue = (item, sort) => {
    if (sort.monthIndex === -2) {
      return this.getItemPriceSegment(item, sort.segmentKey)[sort.field] || 0;
    }

    if (sort.monthIndex === -1) {
      return this.getItemTotal(item)[sort.field] || 0;
    }

    return item.data[sort.monthIndex] ? item.data[sort.monthIndex][sort.field] || 0 : 0;
  };

  createEmptyTotals = (months) => ({
    months: months.map(() => ({ count: 0, price: 0 })),
    overall: { count: 0, price: 0 },
    price_segments: {},
    discount_count: 0,
    discount_price: 0,
    lost_price: 0,
  });

  addItemToTotals = (totals, item, pricePeriods) => {
    const itemTotal = this.getItemTotal(item);

    item.data.forEach((d, i) => {
      totals.months[i].count += d.count;
      totals.months[i].price += d.price;
    });

    totals.overall.count += itemTotal.count || 0;
    totals.overall.price += itemTotal.price || 0;
    totals.discount_count += itemTotal.discount_count || 0;
    totals.discount_price += itemTotal.discount_price || 0;
    totals.lost_price += itemTotal.lost_price || 0;

    pricePeriods.forEach((period) => {
      const segment = this.getItemPriceSegment(item, period.key);

      if (!totals.price_segments[period.key]) {
        totals.price_segments[period.key] = {
          no_discount_count: 0,
          no_discount_price: 0,
        };
      }

      totals.price_segments[period.key].no_discount_count += segment.no_discount_count || 0;
      totals.price_segments[period.key].no_discount_price += segment.no_discount_price || 0;
    });
  };

  calculateTotalsFromItems = (months, items, pricePeriods) => {
    const totals = this.createEmptyTotals(months);

    items?.forEach((item) => this.addItemToTotals(totals, item, pricePeriods));

    return totals;
  };

  calculateGrandTotals(months, cats, pricePeriods) {
    const items = cats.flatMap((cat) => cat.items || []);

    return this.calculateTotalsFromItems(months, items, pricePeriods);
  }

  renderArrow = (currentMonthIndex, activeField, segmentKey = null) => {
    const { sort } = this.state;

    if (
      sort.monthIndex === currentMonthIndex &&
      sort.field === activeField &&
      sort.segmentKey === segmentKey
    ) {
      return sort.order === "asc" ? (
        <ArrowDownwardIcon style={{ fontSize: "small" }} />
      ) : (
        <ArrowUpwardIcon style={{ fontSize: "small" }} />
      );
    }

    return <ArrowDownwardIcon style={{ fontSize: "small", opacity: 0.5 }} />;
  };

  renderSortableLabel = (label, monthIndex, field, segmentKey = null) => (
    <span
      style={{
        display: "block",
        position: "relative",
        paddingRight: 24,
        maxWidth: "100%",
      }}
    >
      <span style={{ minWidth: 0, whiteSpace: "inherit" }}>{label}</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
        }}
      >
        {this.renderArrow(monthIndex, field, segmentKey)}
      </span>
    </span>
  );

  renderSortableCell = ({ label, monthIndex, field, sx = {}, segmentKey = null }) => {
    return (
      <TableCell
        onClick={() => this.handleSort(monthIndex, field, segmentKey)}
        sx={{ cursor: "pointer", ...sx }}
      >
        {this.renderSortableLabel(label, monthIndex, field, segmentKey)}
      </TableCell>
    );
  };

  render() {
    const { months, cats } = this.props;
    const { sort, expandedCategories, columnsDialogOpen } = this.state;
    const categoriesWithItems = cats.filter((cat) => cat.items?.length);
    const allCategoriesExpanded =
      categoriesWithItems.length > 0 &&
      categoriesWithItems.every((cat) => expandedCategories[cat.id]);
    const pricePeriods = this.getPricePeriods(cats);
    const monthColumnKeys = ["month_count", "month_price"];
    const totalColumnKeys = ["total_count", "total_price"];
    const pricePeriodColumnKeys = ["segment_price", "no_discount_count", "no_discount_price"];
    const discountColumnKeys = ["discount_count", "discount_price", "lost_price"];
    const visibleMonthColumnKeys = monthColumnKeys.filter(this.isColumnVisible);
    const visibleTotalColumnKeys = totalColumnKeys.filter(this.isColumnVisible);
    const visiblePricePeriodColumnKeys = pricePeriodColumnKeys.filter(this.isColumnVisible);
    const visibleDiscountColumnKeys = discountColumnKeys.filter(this.isColumnVisible);
    const baseTotalCols = visibleTotalColumnKeys.length;
    const calcTotalCols =
      pricePeriods.length * visiblePricePeriodColumnKeys.length + visibleDiscountColumnKeys.length;
    const grandTotals = this.calculateGrandTotals(months, cats, pricePeriods);
    const calcBlockBorder = "2px solid #bdbdbd";
    const finalDiscountBlockBorder = "2px solid #d6d6d6";
    const pricePeriodBorder = "1px solid #e0e0e0";
    const monthBlockBorder = "1px solid #eeeeee";
    const idColumnWidth = 112;
    const nameColumnWidth = 360;
    const commonColumnWidth = 120;
    const calcColumnWidth = 130;
    const lostColumnWidth = 190;
    const allColumnWidths = [
      idColumnWidth,
      nameColumnWidth,
      ...months.flatMap(() => visibleMonthColumnKeys.map(() => commonColumnWidth)),
      ...visibleTotalColumnKeys.map(() => commonColumnWidth),
      ...pricePeriods.flatMap(() => visiblePricePeriodColumnKeys.map(() => calcColumnWidth)),
      ...visibleDiscountColumnKeys.map((key) =>
        key === "lost_price" ? lostColumnWidth : calcColumnWidth,
      ),
    ];
    const stickyIdSx = {
      minWidth: idColumnWidth,
      width: idColumnWidth,
      maxWidth: idColumnWidth,
      boxSizing: "border-box",
      px: 1,
    };
    const stickyNameSx = {
      left: idColumnWidth,
      minWidth: nameColumnWidth,
      width: nameColumnWidth,
      maxWidth: nameColumnWidth,
      boxSizing: "border-box",
    };
    const calcBlockHeadSx = {
      borderLeft: calcBlockBorder,
      backgroundColor: "#f7f7f7",
    };
    const calcHeaderSx = {
      backgroundColor: "#f7f7f7",
      whiteSpace: "normal !important",
      wordBreak: "normal",
      overflowWrap: "break-word",
      lineHeight: 1.15,
      minWidth: 120,
      width: 130,
      maxWidth: 150,
      px: 1,
      py: 1,
    };
    const calcBlockCellSx = {
      borderLeft: calcBlockBorder,
    };
    const finalDiscountBlockSx = {
      borderLeft:
        pricePeriods.length && visiblePricePeriodColumnKeys.length
          ? finalDiscountBlockBorder
          : calcBlockBorder,
    };
    const getPricePeriodBorderSx = (index) => {
      if (index === 0) {
        return calcBlockHeadSx;
      }

      return {
        borderLeft: pricePeriodBorder,
      };
    };
    const renderTotalsRow = ({
      idLabel = "",
      nameLabel = "",
      totals,
      backgroundColor,
      numberColor = "inherit",
      onClick = null,
      expanded = null,
    }) => {
      const baseCellSx = {
        fontWeight: "bold",
        backgroundColor,
      };
      const numberCellSx = {
        ...baseCellSx,
        color: numberColor,
      };

      return (
        <TableRow sx={{ fontWeight: "bold", backgroundColor }}>
          <TableCell
            onClick={onClick || undefined}
            sx={{
              ...baseCellSx,
              position: "sticky",
              left: 0,
              cursor: onClick ? "pointer" : "default",
              "&:hover": onClick ? { backgroundColor: "#eeeeee" } : {},
              ...stickyIdSx,
            }}
          >
            {expanded === null ? (
              idLabel
            ) : expanded ? (
              <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
            ) : (
              <KeyboardArrowRightIcon style={{ fontSize: 20 }} />
            )}
          </TableCell>

          <TableCell
            onClick={onClick || undefined}
            sx={{
              ...baseCellSx,
              position: "sticky",
              textAlign: expanded === null ? "center" : "left",
              zIndex: 69,
              cursor: onClick ? "pointer" : "default",
              "&:hover": onClick ? { backgroundColor: "#eeeeee" } : {},
              ...stickyNameSx,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: expanded === null ? "center" : "flex-start",
                width: "100%",
              }}
            >
              <span>{nameLabel}</span>
            </span>
          </TableCell>

          {totals.months.map((total, idx) => (
            <React.Fragment key={idx}>
              {this.isColumnVisible("month_count") ? (
                <TableCell
                  sx={{
                    ...numberCellSx,
                    ...(idx > 0 ? { borderLeft: monthBlockBorder } : {}),
                  }}
                >
                  {total.count ? this.formatNumber(total.count) : 0}
                </TableCell>
              ) : null}
              {this.isColumnVisible("month_price") ? (
                <TableCell
                  sx={{
                    ...numberCellSx,
                    ...(idx > 0 && !this.isColumnVisible("month_count")
                      ? { borderLeft: monthBlockBorder }
                      : {}),
                  }}
                >
                  {total.price ? this.formatCurrency(total.price) : 0}
                </TableCell>
              ) : null}
            </React.Fragment>
          ))}

          {this.isColumnVisible("total_count") ? (
            <TableCell sx={{ ...numberCellSx, borderLeft: monthBlockBorder }}>
              {totals.overall.count ? this.formatNumber(totals.overall.count) : 0}
            </TableCell>
          ) : null}
          {this.isColumnVisible("total_price") ? (
            <TableCell
              sx={{
                ...numberCellSx,
                ...(!this.isColumnVisible("total_count") ? { borderLeft: monthBlockBorder } : {}),
              }}
            >
              {totals.overall.price ? this.formatCurrency(totals.overall.price) : 0}
            </TableCell>
          ) : null}
          {pricePeriods.map((period, index) => {
            const segment = totals.price_segments[period.key] || {};

            return (
              <React.Fragment key={period.key}>
                {this.isColumnVisible("segment_price") ? (
                  <TableCell
                    sx={{
                      ...baseCellSx,
                      ...(index === 0 ? calcBlockCellSx : { borderLeft: pricePeriodBorder }),
                    }}
                  />
                ) : null}
                {this.isColumnVisible("no_discount_count") ? (
                  <TableCell
                    sx={{
                      ...numberCellSx,
                      ...(index === 0 &&
                      !this.isColumnVisible("segment_price") &&
                      visibleDiscountColumnKeys.length + visiblePricePeriodColumnKeys.length
                        ? calcBlockCellSx
                        : index > 0 && !this.isColumnVisible("segment_price")
                          ? { borderLeft: pricePeriodBorder }
                          : {}),
                    }}
                  >
                    {segment.no_discount_count ? this.formatNumber(segment.no_discount_count) : 0}
                  </TableCell>
                ) : null}
                {this.isColumnVisible("no_discount_price") ? (
                  <TableCell
                    sx={{
                      ...numberCellSx,
                      ...(index === 0 &&
                      !this.isColumnVisible("segment_price") &&
                      !this.isColumnVisible("no_discount_count") &&
                      visibleDiscountColumnKeys.length + visiblePricePeriodColumnKeys.length
                        ? calcBlockCellSx
                        : index > 0 &&
                            !this.isColumnVisible("segment_price") &&
                            !this.isColumnVisible("no_discount_count")
                          ? { borderLeft: pricePeriodBorder }
                          : {}),
                    }}
                  >
                    {segment.no_discount_price ? this.formatCurrency(segment.no_discount_price) : 0}
                  </TableCell>
                ) : null}
              </React.Fragment>
            );
          })}
          {this.isColumnVisible("discount_count") ? (
            <TableCell sx={{ ...numberCellSx, ...finalDiscountBlockSx }}>
              {totals.discount_count ? this.formatNumber(totals.discount_count) : 0}
            </TableCell>
          ) : null}
          {this.isColumnVisible("discount_price") ? (
            <TableCell
              sx={{
                ...numberCellSx,
                ...(!this.isColumnVisible("discount_count") ? finalDiscountBlockSx : {}),
              }}
            >
              {totals.discount_price ? this.formatCurrency(totals.discount_price) : 0}
            </TableCell>
          ) : null}
          {this.isColumnVisible("lost_price") ? (
            <TableCell
              sx={{
                ...numberCellSx,
                ...(!this.isColumnVisible("discount_count") &&
                !this.isColumnVisible("discount_price")
                  ? finalDiscountBlockSx
                  : {}),
              }}
            >
              {totals.lost_price ? this.formatCurrency(totals.lost_price) : 0}
            </TableCell>
          ) : null}
        </TableRow>
      );
    };

    const tableWidth = allColumnWidths.reduce((sum, width) => sum + width, 0);

    return (
      <>
        <Grid
          container
          justifyContent="flex-end"
          sx={{ mb: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={() => this.setState({ columnsDialogOpen: true })}
            sx={{
              color: "#d50032",
              borderColor: "#d50032",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#d50032",
                backgroundColor: "rgba(213, 0, 50, 0.04)",
              },
            }}
          >
            Колонки
          </Button>
        </Grid>

        <div
          ref={this.topScrollRef}
          onScroll={() => this.syncHorizontalScroll("top")}
          style={{
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            height: 16,
            marginBottom: 4,
          }}
        >
          <div style={{ width: tableWidth, minWidth: "100%", height: 1 }} />
        </div>

        <TableContainer
          ref={this.tableScrollRef}
          onScroll={() => this.syncHorizontalScroll("table")}
          sx={{
            maxHeight: 650,
            maxWidth: "100%",
            overflow: "auto",
            p: 0,
            m: 0,
            pb: 5,
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              borderCollapse: "separate",
              borderSpacing: 0,
              tableLayout: "fixed",
              width: tableWidth,
              minWidth: "100%",
              "& .MuiTableCell-root": { textAlign: "center", whiteSpace: "nowrap" },
            }}
          >
            <colgroup>
              {allColumnWidths.map((width, index) => (
                <col
                  key={index}
                  style={{ width }}
                />
              ))}
            </colgroup>
            <TableHead sx={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#fff" }}>
              <TableRow sx={{ height: 40 }}>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 98,
                    backgroundColor: "#fff",
                    borderLeft: "none",
                    ...stickyIdSx,
                  }}
                >
                  ID Товара
                </TableCell>
                <TableCell
                  sx={{
                    position: "sticky",
                    zIndex: 95,
                    backgroundColor: "#fff",
                    textAlign: "left !important",
                    ...stickyNameSx,
                  }}
                >
                  Название
                </TableCell>
                {visibleMonthColumnKeys.length
                  ? months.map((month, idx) => (
                      <TableCell
                        key={month}
                        colSpan={visibleMonthColumnKeys.length}
                        sx={{
                          minWidth: commonColumnWidth * visibleMonthColumnKeys.length,
                          ...(idx > 0 ? { borderLeft: monthBlockBorder } : {}),
                        }}
                      >
                        {dayjs(month + "-01")
                          .format("MMMM YYYY")
                          .replace(/^./, (ch) => ch.toUpperCase())}
                      </TableCell>
                    ))
                  : null}
                {baseTotalCols ? (
                  <TableCell
                    colSpan={baseTotalCols}
                    sx={{
                      minWidth: commonColumnWidth * baseTotalCols,
                      borderLeft: monthBlockBorder,
                    }}
                  >
                    Итого
                  </TableCell>
                ) : null}
                {calcTotalCols ? (
                  <TableCell
                    colSpan={calcTotalCols}
                    sx={{
                      minWidth:
                        pricePeriods.length *
                          calcColumnWidth *
                          visiblePricePeriodColumnKeys.length +
                        calcColumnWidth *
                          visibleDiscountColumnKeys.filter((key) => key !== "lost_price").length +
                        (this.isColumnVisible("lost_price") ? lostColumnWidth : 0),
                      ...calcBlockHeadSx,
                    }}
                  >
                    Расчет скидок
                  </TableCell>
                ) : null}
              </TableRow>

              <TableRow sx={{ height: 40 }}>
                <TableCell
                  colSpan={2}
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 11,
                    backgroundColor: "#fff",
                    minWidth: idColumnWidth + nameColumnWidth,
                  }}
                >
                  {categoriesWithItems.length ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                      }}
                    >
                      <Button
                        variant="text"
                        size="small"
                        startIcon={
                          allCategoriesExpanded ? (
                            <KeyboardArrowRightIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )
                        }
                        onClick={() => this.toggleAllCategories(categoriesWithItems)}
                        sx={{
                          color: "#d50032",
                          fontWeight: "bold",
                          minWidth: 0,
                          px: 1,
                        }}
                      >
                        {allCategoriesExpanded ? "Скрыть все" : "Раскрыть все"}
                      </Button>
                    </span>
                  ) : null}
                </TableCell>
                {months.map((__, idx) => (
                  <React.Fragment key={idx}>
                    {this.isColumnVisible("month_count")
                      ? this.renderSortableCell({
                          label: "Кол-во, шт",
                          monthIndex: idx,
                          field: "count",
                          sx: idx > 0 ? { borderLeft: monthBlockBorder } : {},
                        })
                      : null}
                    {this.isColumnVisible("month_price")
                      ? this.renderSortableCell({
                          label: "Выручка, руб",
                          monthIndex: idx,
                          field: "price",
                          sx:
                            idx > 0 && !this.isColumnVisible("month_count")
                              ? { borderLeft: monthBlockBorder }
                              : {},
                        })
                      : null}
                  </React.Fragment>
                ))}

                {this.isColumnVisible("total_count")
                  ? this.renderSortableCell({
                      label: "Кол-во, шт",
                      monthIndex: -1,
                      field: "count",
                      sx: { borderLeft: monthBlockBorder },
                    })
                  : null}
                {this.isColumnVisible("total_price")
                  ? this.renderSortableCell({
                      label: "Выручка, руб",
                      monthIndex: -1,
                      field: "price",
                      sx: !this.isColumnVisible("total_count")
                        ? { borderLeft: monthBlockBorder }
                        : {},
                    })
                  : null}
                {pricePeriods.map((period, index) => {
                  const label = this.getPricePeriodLabel(period, index, pricePeriods);

                  return (
                    <React.Fragment key={period.key}>
                      {this.isColumnVisible("segment_price")
                        ? this.renderSortableCell({
                            label: pricePeriods.length > 1 ? `${label}, руб` : "Цена, руб",
                            monthIndex: -2,
                            field: "price",
                            segmentKey: period.key,
                            sx: { ...calcHeaderSx, ...getPricePeriodBorderSx(index) },
                          })
                        : null}
                      {this.isColumnVisible("no_discount_count")
                        ? this.renderSortableCell({
                            label: "кол-во без скидок",
                            monthIndex: -2,
                            field: "no_discount_count",
                            segmentKey: period.key,
                            sx: {
                              ...calcHeaderSx,
                              ...(index === 0 && !this.isColumnVisible("segment_price")
                                ? calcBlockHeadSx
                                : index > 0 && !this.isColumnVisible("segment_price")
                                  ? { borderLeft: pricePeriodBorder }
                                  : {}),
                            },
                          })
                        : null}
                      {this.isColumnVisible("no_discount_price")
                        ? this.renderSortableCell({
                            label: "Выручка без скидки",
                            monthIndex: -2,
                            field: "no_discount_price",
                            segmentKey: period.key,
                            sx: {
                              ...calcHeaderSx,
                              ...(index === 0 &&
                              !this.isColumnVisible("segment_price") &&
                              !this.isColumnVisible("no_discount_count")
                                ? calcBlockHeadSx
                                : index > 0 &&
                                    !this.isColumnVisible("segment_price") &&
                                    !this.isColumnVisible("no_discount_count")
                                  ? { borderLeft: pricePeriodBorder }
                                  : {}),
                            },
                          })
                        : null}
                    </React.Fragment>
                  );
                })}
                {this.isColumnVisible("discount_count")
                  ? this.renderSortableCell({
                      label: "кол-во со скидками или бесплатно",
                      monthIndex: -1,
                      field: "discount_count",
                      sx: { ...calcHeaderSx, ...finalDiscountBlockSx },
                    })
                  : null}
                {this.isColumnVisible("discount_price")
                  ? this.renderSortableCell({
                      label: "Выручка со скидками",
                      monthIndex: -1,
                      field: "discount_price",
                      sx: {
                        ...calcHeaderSx,
                        ...(!this.isColumnVisible("discount_count") ? finalDiscountBlockSx : {}),
                      },
                    })
                  : null}
                {this.isColumnVisible("lost_price")
                  ? this.renderSortableCell({
                      label: "Недополученная выручка по акциям и промокодам",
                      monthIndex: -1,
                      field: "lost_price",
                      sx: {
                        ...calcHeaderSx,
                        minWidth: 160,
                        maxWidth: 190,
                        ...(!this.isColumnVisible("discount_count") &&
                        !this.isColumnVisible("discount_price")
                          ? finalDiscountBlockSx
                          : {}),
                      },
                    })
                  : null}
              </TableRow>
            </TableHead>

            <TableBody>
              {renderTotalsRow({
                nameLabel: "Итого",
                totals: grandTotals,
                backgroundColor: "#e0e0e0",
              })}

              {cats.map((cat) => {
                if (!cat.items?.length) {
                  return null;
                }

                const categoryTotals = this.calculateTotalsFromItems(
                  months,
                  cat.items,
                  pricePeriods,
                );
                const isCategoryExpanded = !!expandedCategories[cat.id];

                return (
                  <React.Fragment key={cat.id}>
                    {renderTotalsRow({
                      nameLabel: cat.name,
                      totals: categoryTotals,
                      backgroundColor: "#f5f5f5",
                      // numberColor: "#d32f2f",
                      expanded: isCategoryExpanded,
                      onClick: () => this.toggleCategory(cat.id),
                    })}

                    {isCategoryExpanded
                      ? (() => {
                          let items = cat.items;
                          if (sort.monthIndex !== null && sort.field !== null) {
                            items = [...items].sort((a, b) => {
                              const aValue = this.getSortValue(a, sort);
                              const bValue = this.getSortValue(b, sort);

                              return sort.order === "asc" ? aValue - bValue : bValue - aValue;
                            });
                          }

                          return items.map((item) => {
                            const rowTotal = this.getItemTotal(item);
                            return (
                              <TableRow
                                key={item.id}
                                sx={{
                                  "&:hover td": {
                                    backgroundColor: "#f7f7f7",
                                  },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 70,
                                    backgroundColor: "#fff",
                                    borderLeft: "none",
                                    ...stickyIdSx,
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.id}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    position: "sticky",
                                    zIndex: 69,
                                    backgroundColor: "#fff",
                                    boxShadow: "2px 0 5px -2px rgba(0,0,0,0.05)",
                                    textAlign: "left !important",
                                    ...stickyNameSx,
                                  }}
                                >
                                  {item.name}
                                </TableCell>

                                {item.data.map((d, idx) => (
                                  <React.Fragment key={idx}>
                                    {this.isColumnVisible("month_count") ? (
                                      <TableCell
                                        sx={idx > 0 ? { borderLeft: monthBlockBorder } : {}}
                                      >
                                        {d.count ? this.formatNumber(d.count) : 0}
                                      </TableCell>
                                    ) : null}
                                    {this.isColumnVisible("month_price") ? (
                                      <TableCell
                                        sx={
                                          idx > 0 && !this.isColumnVisible("month_count")
                                            ? { borderLeft: monthBlockBorder }
                                            : {}
                                        }
                                      >
                                        {d.price ? this.formatCurrency(d.price) : 0}
                                      </TableCell>
                                    ) : null}
                                  </React.Fragment>
                                ))}

                                {this.isColumnVisible("total_count") ? (
                                  <TableCell sx={{ borderLeft: monthBlockBorder }}>
                                    {rowTotal.count ? this.formatNumber(rowTotal.count) : 0}
                                  </TableCell>
                                ) : null}
                                {this.isColumnVisible("total_price") ? (
                                  <TableCell
                                    sx={
                                      !this.isColumnVisible("total_count")
                                        ? { borderLeft: monthBlockBorder }
                                        : {}
                                    }
                                  >
                                    {rowTotal.price ? this.formatCurrency(rowTotal.price) : 0}
                                  </TableCell>
                                ) : null}
                                {pricePeriods.map((period, index) => {
                                  const segment = this.getItemPriceSegment(item, period.key);

                                  return (
                                    <React.Fragment key={period.key}>
                                      {this.isColumnVisible("segment_price") ? (
                                        <TableCell
                                          sx={
                                            index === 0
                                              ? calcBlockCellSx
                                              : { borderLeft: pricePeriodBorder }
                                          }
                                        >
                                          {segment.price ? this.formatCurrency(segment.price) : 0}
                                        </TableCell>
                                      ) : null}
                                      {this.isColumnVisible("no_discount_count") ? (
                                        <TableCell
                                          sx={
                                            index === 0 && !this.isColumnVisible("segment_price")
                                              ? calcBlockCellSx
                                              : index > 0 && !this.isColumnVisible("segment_price")
                                                ? { borderLeft: pricePeriodBorder }
                                                : {}
                                          }
                                        >
                                          {segment.no_discount_count
                                            ? this.formatNumber(segment.no_discount_count)
                                            : 0}
                                        </TableCell>
                                      ) : null}
                                      {this.isColumnVisible("no_discount_price") ? (
                                        <TableCell
                                          sx={
                                            index === 0 &&
                                            !this.isColumnVisible("segment_price") &&
                                            !this.isColumnVisible("no_discount_count")
                                              ? calcBlockCellSx
                                              : index > 0 &&
                                                  !this.isColumnVisible("segment_price") &&
                                                  !this.isColumnVisible("no_discount_count")
                                                ? { borderLeft: pricePeriodBorder }
                                                : {}
                                          }
                                        >
                                          {segment.no_discount_price
                                            ? this.formatCurrency(segment.no_discount_price)
                                            : 0}
                                        </TableCell>
                                      ) : null}
                                    </React.Fragment>
                                  );
                                })}
                                {this.isColumnVisible("discount_count") ? (
                                  <TableCell sx={finalDiscountBlockSx}>
                                    {rowTotal.discount_count
                                      ? this.formatNumber(rowTotal.discount_count)
                                      : 0}
                                  </TableCell>
                                ) : null}
                                {this.isColumnVisible("discount_price") ? (
                                  <TableCell
                                    sx={
                                      !this.isColumnVisible("discount_count")
                                        ? finalDiscountBlockSx
                                        : {}
                                    }
                                  >
                                    {rowTotal.discount_price
                                      ? this.formatCurrency(rowTotal.discount_price)
                                      : 0}
                                  </TableCell>
                                ) : null}
                                {this.isColumnVisible("lost_price") ? (
                                  <TableCell
                                    sx={
                                      !this.isColumnVisible("discount_count") &&
                                      !this.isColumnVisible("discount_price")
                                        ? finalDiscountBlockSx
                                        : {}
                                    }
                                  >
                                    {rowTotal.lost_price
                                      ? this.formatCurrency(rowTotal.lost_price)
                                      : 0}
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            );
                          });
                        })()
                      : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <ReportRevenueColumnsDialog
          open={columnsDialogOpen}
          onClose={() => this.setState({ columnsDialogOpen: false })}
          isColumnVisible={this.isColumnVisible}
          setAllColumns={this.setAllColumns}
          toggleColumn={this.toggleColumn}
        />
      </>
    );
  }
}
