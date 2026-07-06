import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { MyDatePickerNew, MyAutocomplite } from "@/ui/Forms";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

// import { api_laravel_local as api_laravel } from '@/src/api_new';
import { api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import "dayjs/locale/ru";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import TestAccess from "@/ui/TestAccess";
import MyAlert from "@/ui/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";
dayjs.locale("ru");

class ReportRevenue_Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sort: {
        monthIndex: null,
        field: null,
        segmentKey: null,
        order: "desc",
      },
    };
  }

  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(this.props.months) !== JSON.stringify(prevProps.months) ||
      JSON.stringify(this.props.cats) !== JSON.stringify(prevProps.cats)
    ) {
      this.setState({
        sort: { monthIndex: null, field: null, segmentKey: null, order: "desc" },
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(this.props.months) !== JSON.stringify(nextProps.months) ||
      JSON.stringify(this.props.cats) !== JSON.stringify(nextProps.cats) ||
      JSON.stringify(this.state.sort) !== JSON.stringify(nextState.sort)
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

  calculateGrandTotals(months, cats, pricePeriods) {
    const grandTotals = {
      months: months.map(() => ({ count: 0, price: 0 })),
      overall: { count: 0, price: 0 },
      price_segments: {},
      discount_count: 0,
      discount_price: 0,
      lost_price: 0,
    };

    cats.forEach((cat) => {
      cat.items?.forEach((item) => {
        const itemTotal = this.getItemTotal(item);

        item.data.forEach((d, i) => {
          grandTotals.months[i].count += d.count;
          grandTotals.months[i].price += d.price;
        });

        grandTotals.overall.count += itemTotal.count || 0;
        grandTotals.overall.price += itemTotal.price || 0;
        grandTotals.discount_count += itemTotal.discount_count || 0;
        grandTotals.discount_price += itemTotal.discount_price || 0;
        grandTotals.lost_price += itemTotal.lost_price || 0;

        pricePeriods.forEach((period) => {
          const segment = this.getItemPriceSegment(item, period.key);

          if (!grandTotals.price_segments[period.key]) {
            grandTotals.price_segments[period.key] = {
              no_discount_count: 0,
              no_discount_price: 0,
            };
          }

          grandTotals.price_segments[period.key].no_discount_count +=
            segment.no_discount_count || 0;
          grandTotals.price_segments[period.key].no_discount_price +=
            segment.no_discount_price || 0;
        });
      });
    });

    return grandTotals;
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
    const { sort } = this.state;
    const pricePeriods = this.getPricePeriods(cats);
    const baseTotalCols = 2;
    const calcTotalCols = pricePeriods.length * 3 + 3;
    const totalLeafCols = baseTotalCols + calcTotalCols;
    const totalCols = 1 + 2 * months.length + totalLeafCols;
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
      ...months.flatMap(() => [commonColumnWidth, commonColumnWidth]),
      commonColumnWidth,
      commonColumnWidth,
      ...pricePeriods.flatMap(() => [calcColumnWidth, calcColumnWidth, calcColumnWidth]),
      calcColumnWidth,
      calcColumnWidth,
      lostColumnWidth,
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
      borderLeft: pricePeriods.length ? finalDiscountBlockBorder : calcBlockBorder,
    };
    const getPricePeriodBorderSx = (index) => {
      if (index === 0) {
        return calcBlockHeadSx;
      }

      return {
        borderLeft: pricePeriodBorder,
      };
    };

    return (
      <TableContainer
        sx={{ maxHeight: 650, maxWidth: "100%", overflow: "auto", p: 0, m: 0, pb: 5 }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            width: allColumnWidths.reduce((sum, width) => sum + width, 0),
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
              {months.map((month, idx) => (
                <TableCell
                  key={month}
                  colSpan={2}
                  sx={{
                    minWidth: 240,
                    ...(idx > 0 ? { borderLeft: monthBlockBorder } : {}),
                  }}
                >
                  {dayjs(month + "-01")
                    .format("MMMM YYYY")
                    .replace(/^./, (ch) => ch.toUpperCase())}
                </TableCell>
              ))}
              <TableCell
                colSpan={baseTotalCols}
                sx={{ minWidth: 240, borderLeft: monthBlockBorder }}
              >
                Итого
              </TableCell>
              <TableCell
                colSpan={calcTotalCols}
                sx={{
                  minWidth:
                    pricePeriods.length * calcColumnWidth * 3 +
                    calcColumnWidth * 2 +
                    lostColumnWidth,
                  ...calcBlockHeadSx,
                }}
              >
                Расчет скидок
              </TableCell>
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
              />
              {months.map((__, idx) => (
                <React.Fragment key={idx}>
                  {this.renderSortableCell({
                    label: "Кол-во, шт",
                    monthIndex: idx,
                    field: "count",
                    sx: idx > 0 ? { borderLeft: monthBlockBorder } : {},
                  })}
                  {this.renderSortableCell({
                    label: "Выручка, руб",
                    monthIndex: idx,
                    field: "price",
                  })}
                </React.Fragment>
              ))}

              {this.renderSortableCell({
                label: "Кол-во, шт",
                monthIndex: -1,
                field: "count",
                sx: { borderLeft: monthBlockBorder },
              })}
              {this.renderSortableCell({ label: "Выручка, руб", monthIndex: -1, field: "price" })}
              {pricePeriods.map((period, index) => {
                const label = this.getPricePeriodLabel(period, index, pricePeriods);

                return (
                  <React.Fragment key={period.key}>
                    {this.renderSortableCell({
                      label: pricePeriods.length > 1 ? `${label}, руб` : "Цена, руб",
                      monthIndex: -2,
                      field: "price",
                      segmentKey: period.key,
                      sx: { ...calcHeaderSx, ...getPricePeriodBorderSx(index) },
                    })}
                    {this.renderSortableCell({
                      label: "кол-во без скидок",
                      monthIndex: -2,
                      field: "no_discount_count",
                      segmentKey: period.key,
                      sx: calcHeaderSx,
                    })}
                    {this.renderSortableCell({
                      label: "Выручка без скидки",
                      monthIndex: -2,
                      field: "no_discount_price",
                      segmentKey: period.key,
                      sx: calcHeaderSx,
                    })}
                  </React.Fragment>
                );
              })}
              {this.renderSortableCell({
                label: "кол-во со скидками или бесплатно",
                monthIndex: -1,
                field: "discount_count",
                sx: { ...calcHeaderSx, ...finalDiscountBlockSx },
              })}
              {this.renderSortableCell({
                label: "Выручка со скидками",
                monthIndex: -1,
                field: "discount_price",
                sx: calcHeaderSx,
              })}
              {this.renderSortableCell({
                label: "Недополученная выручка по акциям и промокодам",
                monthIndex: -1,
                field: "lost_price",
                sx: { ...calcHeaderSx, minWidth: 160, maxWidth: 190 },
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {cats.map((cat) =>
              cat.items?.length ? (
                <React.Fragment key={cat.id}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f5f5f5",
                        position: "sticky",
                        left: 0,
                        zIndex: 80,
                        ...stickyIdSx,
                      }}
                    />
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#f5f5f5",
                        position: "sticky",
                        textAlign: "left !important",
                        zIndex: 69,
                        ...stickyNameSx,
                      }}
                    >
                      {cat.name}
                    </TableCell>
                    <TableCell
                      colSpan={totalCols - 1}
                      sx={{ backgroundColor: "#f5f5f5" }}
                    />
                  </TableRow>

                  {(() => {
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
                        <TableRow key={item.id}>
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
                              <TableCell sx={idx > 0 ? { borderLeft: monthBlockBorder } : {}}>
                                {d.count ? this.formatNumber(d.count) : 0}
                              </TableCell>
                              <TableCell>{d.price ? this.formatCurrency(d.price) : 0}</TableCell>
                            </React.Fragment>
                          ))}

                          <TableCell sx={{ borderLeft: monthBlockBorder }}>
                            {rowTotal.count ? this.formatNumber(rowTotal.count) : 0}
                          </TableCell>
                          <TableCell>
                            {rowTotal.price ? this.formatCurrency(rowTotal.price) : 0}
                          </TableCell>
                          {pricePeriods.map((period, index) => {
                            const segment = this.getItemPriceSegment(item, period.key);

                            return (
                              <React.Fragment key={period.key}>
                                <TableCell
                                  sx={
                                    index === 0
                                      ? calcBlockCellSx
                                      : { borderLeft: pricePeriodBorder }
                                  }
                                >
                                  {segment.price ? this.formatCurrency(segment.price) : 0}
                                </TableCell>
                                <TableCell>
                                  {segment.no_discount_count
                                    ? this.formatNumber(segment.no_discount_count)
                                    : 0}
                                </TableCell>
                                <TableCell>
                                  {segment.no_discount_price
                                    ? this.formatCurrency(segment.no_discount_price)
                                    : 0}
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                          <TableCell sx={finalDiscountBlockSx}>
                            {rowTotal.discount_count
                              ? this.formatNumber(rowTotal.discount_count)
                              : 0}
                          </TableCell>
                          <TableCell>
                            {rowTotal.discount_price
                              ? this.formatCurrency(rowTotal.discount_price)
                              : 0}
                          </TableCell>
                          <TableCell>
                            {rowTotal.lost_price ? this.formatCurrency(rowTotal.lost_price) : 0}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </React.Fragment>
              ) : null,
            )}

            <TableRow sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e0e0e0",
                  position: "sticky",
                  left: 0,
                  ...stickyIdSx,
                }}
              >
                Итого
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e0e0e0",
                  position: "sticky",
                  textAlign: "left",
                  zIndex: 69,
                  ...stickyNameSx,
                }}
              />

              {grandTotals.months.map((total, idx) => (
                <React.Fragment key={idx}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#e0e0e0",
                      ...(idx > 0 ? { borderLeft: monthBlockBorder } : {}),
                    }}
                  >
                    {total.count ? this.formatNumber(total.count) : 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                    {total.price ? this.formatCurrency(total.price) : 0}
                  </TableCell>
                </React.Fragment>
              ))}

              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e0e0e0",
                  borderLeft: monthBlockBorder,
                }}
              >
                {grandTotals.overall.count ? this.formatNumber(grandTotals.overall.count) : 0}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                {grandTotals.overall.price ? this.formatCurrency(grandTotals.overall.price) : 0}
              </TableCell>
              {pricePeriods.map((period, index) => {
                const segment = grandTotals.price_segments[period.key] || {};

                return (
                  <React.Fragment key={period.key}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e0e0e0",
                        ...(index === 0 ? calcBlockCellSx : { borderLeft: pricePeriodBorder }),
                      }}
                    />
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                      {segment.no_discount_count ? this.formatNumber(segment.no_discount_count) : 0}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                      {segment.no_discount_price
                        ? this.formatCurrency(segment.no_discount_price)
                        : 0}
                    </TableCell>
                  </React.Fragment>
                );
              })}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e0e0e0",
                  ...finalDiscountBlockSx,
                }}
              >
                {grandTotals.discount_count ? this.formatNumber(grandTotals.discount_count) : 0}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                {grandTotals.discount_price ? this.formatCurrency(grandTotals.discount_price) : 0}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                {grandTotals.lost_price ? this.formatCurrency(grandTotals.lost_price) : 0}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

class ReportRevenue_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "report_revenue",
      module_name: "",
      is_load: false,

      points: [],
      point: [],

      openAlert: false,
      err_status: false,
      err_text: "",

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      cats: [],
      cat: [],

      months: [],
      reportCats: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      points: data.points,
      cats: data.cats,
      module_name: data.module_info.name,
      access: data.access,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, dop_type = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data, dop_type)
      .then((result) => {
        if (method === "export_file_xls") {
          return result;
        } else {
          return result.data;
        }
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  changePoints = (key, event, value) => {
    this.setState({
      [key]: value,
    });
  };

  changeDateRange = (key, newDate) => {
    this.setState({
      [key]: formatDate(newDate),
    });
  };

  changeCategory = (event, newValue) => {
    const oldValue = this.state.cat;

    const hadAllBefore = oldValue.some((item) => item.id === -1);
    const hasAllNow = newValue.some((item) => item.id === -1);

    if (!hadAllBefore && hasAllNow) {
      newValue = newValue.filter((item) => item.id === -1);
    } else if (hadAllBefore && hasAllNow) {
      newValue = newValue.filter((item) => item.id !== -1);
    }

    this.setState({ cat: newValue });
  };

  get_report = async () => {
    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, "Необходимо выбрать город или кафе");
      return;
    }

    if (!cat.length) {
      this.openAlert(false, "Необходимо выбрать категорию");
      return;
    }

    const data = {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      points: point,
      cats: cat.map((item) => item.id),
    };

    const res = await this.getData("get_report", data);

    if (res.st) {
      this.setState({
        months: res.months,
        reportCats: res.cats,
      });
    } else {
      this.openAlert(false, res.text);

      this.setState({
        months: [],
        reportCats: [],
        total: {},
      });
    }
  };

  downLoad = async () => {
    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, "Необходимо выбрать город или кафе");
      return;
    }

    if (!cat.length) {
      this.openAlert(false, "Необходимо выбрать категорию");
      return;
    }

    date_start = dayjs(date_start).format("YYYY-MM-DD");
    date_end = dayjs(date_end).format("YYYY-MM-DD");

    const data = {
      date_start,
      date_end,
      points: point,
      cats: cat.map((item) => item.id),
    };

    const dop_type = {
      responseType: "blob",
    };

    const res = await this.getData("export_file_xls", data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Отчет о выручке за период ${date_start}_${date_end}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  canAccess(key) {
    const { userCan } = handleUserAccess(this.state.access);
    return userCan("access", key);
  }

  render() {
    const {
      is_load,
      openAlert,
      err_status,
      err_text,
      module_name,
      date_start,
      date_end,
      points,
      point,
      cats,
      cat,
      months,
      reportCats,
    } = this.state;

    return (
      <>
        <Backdrop
          style={{ zIndex: 999 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {/* <TestAccess access={this.state.access} setAccess={(access) => this.setState({access})} /> */}
        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Дата от"
              value={date_start}
              func={(newDate) => this.changeDateRange("date_start", newDate)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={date_end}
              func={(newDate) => this.changeDateRange("date_end", newDate)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <CityCafeAutocomplete2
              label="Кафе"
              points={points}
              value={point}
              onChange={(value) => this.changePoints("point", null, value)}
              singleCityOnly
              withOrganizationMode={false}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              label="Категории"
              multiple={true}
              data={cats}
              value={cat}
              func={this.changeCategory}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={this.get_report}
            >
              Показать
            </Button>
          </Grid>
          {this.canAccess("export_items") && (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Button
                variant={!(months.length && reportCats.length) ? "outlined" : "contained"}
                onClick={this.downLoad}
                disabled={!(months.length && reportCats.length)}
              >
                Скачать таблицу в XLS
              </Button>
            </Grid>
          )}

          {months.length && reportCats.length ? (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mt: 3,
              }}
            >
              <ReportRevenue_Table
                months={months}
                cats={reportCats}
              />
            </Grid>
          ) : null}
        </Grid>
      </>
    );
  }
}

export default function ReportRevenue() {
  return <ReportRevenue_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
