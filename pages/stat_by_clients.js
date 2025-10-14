import React from "react";

import Script from "next/script";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import { MyDatePickerNewViews, MyDatePickerNew } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import { formatDate, formatDateMin } from "@/src/helpers/ui/formatDate";

var am5locales_ru_RU = {
  Jan: "Янв",
  January: "Янв",
  Feb: "Фев",
  February: "Фев",
  Mar: "Мар",
  March: "Мар",
  Apr: "Апр",
  April: "Апр",
  May: "Май",
  Jun: "Июн",
  June: "Июн",
  Jul: "Июл",
  July: "Июл",
  Aug: "Авг",
  August: "Авг",
  Sep: "Сен",
  September: "Сен",
  Oct: "Окт",
  October: "Окт",
  Nov: "Ноя",
  November: "Ноя",
  Dec: "Дек",
  December: "Дек",
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class StatByClients_Modal extends React.Component {
  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth
        maxWidth="calc(95% - 32px)"
      >
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <h2 style={{ textAlign: "center" }}>
              Итого {this.props.city}: {this.props.name}
            </h2>
            <div
              id={this.props.id}
              style={{ width: "100%", height: "500px" }}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={this.props.onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class StatByClients_ extends React.Component {
  chartnewusers = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "stat_by_clients",
      module_name: "",
      is_load: false,

      dataPoints: [],
      dataCities: [],
      all_data: [],
      dataDates: [],

      date_start: null,
      date_end: null,

      date_start_day: formatDate(new Date()),
      date_end_day: formatDate(new Date()),

      dataPoints_days: [],
      dataCities_days: [],
      all_data_days: [],
      dataDates_days: [],

      modalDialog: false,
      fullScreen: false,
      id: null,
      name: "",

      activeTab: 0,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  async update_months() {
    const data = {
      date_start: this.state.date_start,
      date_end: this.state.date_end,
    };

    const res = await this.getData("get_data", data);

    this.setState({
      dataPoints: res.points,
      dataCities: res.cities,
      all_data: res.all_data,
      dataDates: res.date_list,
    });
  }

  async update_days() {
    const data = {
      date_start_day: this.state.date_start_day
        ? dayjs(this.state.date_start_day).format("YYYY-MM-DD")
        : "",
      date_end_day: this.state.date_end_day
        ? dayjs(this.state.date_end_day).format("YYYY-MM-DD")
        : "",
    };

    const res = await this.getData("get_data_days", data);

    this.setState({
      dataPoints_days: res.points,
      dataCities_days: res.cities,
      all_data_days: res.all_data,
      dataDates_days: res.date_list,
    });
  }

  // Тестовый метод для получения данных по дням для Ушедших и Вернувшихся
  // async test_stat() {

  //   const data = {
  //     date_start_day: this.state.date_start_day ? dayjs(this.state.date_start_day).format('YYYY-MM-DD') : '',
  //     date_end_day: this.state.date_end_day ? dayjs(this.state.date_end_day).format('YYYY-MM-DD') : '',
  //   };
  //   console.log("🚀 === test_stat data:", data);

  //   const res = await this.getData('stat_test', data);
  //   console.log("🚀 === test_stat res:", res);
  // }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  changeDateRange_days(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  openGraphModal(id, city, data) {
    this.handleResize();

    let myData;

    const allData = this.state.all_data;

    if (id === "newUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.new_users });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.new_users });
          return newData;
        }, []);
      }

      this.setState({
        name: "Новые клиенты по месяцам",
      });
    }

    if (id === "orders") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.count });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.count });
          return newData;
        }, []);
      }

      this.setState({
        name: "Количество заказов по месяцам",
      });
    }

    if (id === "avgSumm") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.avg_summ });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.avg_summ });
          return newData;
        }, []);
      }

      this.setState({
        name: "Средний чек по месяцам",
      });
    }

    if (id === "lostUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.lost_users,
          });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.lost_users,
          });
          return newData;
        }, []);
      }

      this.setState({
        name: "Ушедшие клиенты по месяцам",
      });
    }

    if (id === "returnUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.return_users,
          });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.return_users,
          });
          return newData;
        }, []);
      }

      this.setState({
        name: "Вернувшиеся клиенты по месяцам",
      });
    }

    this.setState({
      modalDialog: true,
      city,
      id,
    });

    setTimeout(() => {
      this.renderGraph(myData, id);
    }, 300);
  }

  openGraphModal_days(id, city, data) {
    this.handleResize();

    let myData;

    const allData = this.state.all_data_days;

    if (id === "newUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.new_users });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.new_users });
          return newData;
        }, []);
      }

      this.setState({
        name: "Новые клиенты по дням",
      });
    }

    if (id === "orders") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.count });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.count });
          return newData;
        }, []);
      }

      this.setState({
        name: "Количество заказов по дням",
      });
    }

    if (id === "avgSumm") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.avg_summ });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({ date: item.new_date, count: item.avg_summ });
          return newData;
        }, []);
      }

      this.setState({
        name: "Средний чек по дням",
      });
    }

    if (id === "lostUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users,
          });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.lost_users,
          });
          return newData;
        }, []);
      }

      this.setState({
        name: "Ушедшие клиенты по дням",
      });
    }

    if (id === "returnUsers") {
      if (data) {
        myData = data.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.return_users,
          });
          return newData;
        }, []);
      } else {
        myData = allData.reduce((newData, item) => {
          newData.push({
            date: item.new_date,
            count: item.lost_users.return_users,
          });
          return newData;
        }, []);
      }

      this.setState({
        name: "Вернувшиеся клиенты по дням",
      });
    }

    this.setState({
      modalDialog: true,
      city,
      id,
    });

    setTimeout(() => {
      this.renderGraph_days(myData, id);
    }, 300);
  }

  renderGraph(MyData, id) {
    if (this.chartnewusers) {
      this.chartnewusers.dispose();
    }

    var root = am5.Root.new(id);
    this.chartnewusers = root;

    root.locale = am5locales_ru_RU;

    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    var data = [];

    MyData.map((item) => {
      let date = item.date.split("-");

      data.push({
        date: new Date(date[0], parseInt(date[1]) - 1, 1).getTime(),
        value: parseInt(item.count),
      });
    });

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";
    xAxis.get("dateFormats")["month"] = "MMMM";

    // Create series правка 1 Новые клиенты по месяцам
    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        }),
      );

      // правка radius: 5->3
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill"),
          }),
        });
      });

      series.strokes.template.set("strokeWidth", 3);
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}");
      series.data.setAll(data);
    }

    createSeries("Всего", "value", data);

    // Add cursor
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomXY",
        xAxis: xAxis,
      }),
    );

    xAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );

    yAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );
  }

  renderGraph_days(MyData, id) {
    if (this.chartnewusers) {
      this.chartnewusers.dispose();
    }

    var root = am5.Root.new(id);
    this.chartnewusers = root;

    root.locale = am5locales_ru_RU;

    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    var data = [];

    MyData.map((item) => {
      let date = item.date.split("-");

      data.push({
        date: new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime(),
        value: parseInt(item.count),
      });
    });

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );

    xAxis.get("dateFormats")["day"] = "dd/MM";
    xAxis.get("periodChangeDateFormats")["day"] = "dd/MM";
    // xAxis.get('dateFormats')['month'] = 'MMMM';

    // Create series Новые клиенты по дням
    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        }),
      );

      // правка radius: 5->3
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill"),
          }),
        });
      });

      series.strokes.template.set("strokeWidth", 3);
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}");
      series.data.setAll(data);
    }

    createSeries("Всего", "value", data);

    // Add cursor
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomXY",
        xAxis: xAxis,
      }),
    );

    xAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );

    yAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );
  }

  changeTab(event, val) {
    this.setState({
      activeTab: val,
    });
  }

  render() {
    return (
      <>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <StatByClients_Modal
          onClose={() => this.setState({ modalDialog: false })}
          fullScreen={this.state.fullScreen}
          open={this.state.modalDialog}
          city={this.state.city}
          name={this.state.name}
          id={this.state.id}
        />
        <Grid
          container
          spacing={3}
          mb={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            style={{ paddingBottom: 24 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Paper>
              <Tabs
                value={this.state.activeTab}
                onChange={this.changeTab.bind(this)}
                centered
                variant="fullWidth"
              >
                <Tab
                  label="Дни"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Месяца"
                  {...a11yProps(1)}
                />
              </Tabs>
            </Paper>
          </Grid>

          {/* по дням */}
          {this.state.activeTab === 0 && (
            <Grid
              style={{ paddingTop: 0, paddingBottom: "40px" }}
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TabPanel
                value={this.state.activeTab}
                index={0}
                id="stat"
              >
                <Grid
                  container
                  spacing={3}
                  sx={{ p: 0, mb: 2 }}
                >
                  <Grid
                    style={{ paddingRight: 12 }}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <MyDatePickerNew
                      label="Дата от"
                      value={this.state.date_start_day}
                      func={this.changeDateRange_days.bind(this, "date_start_day")}
                    />
                  </Grid>

                  <Grid
                    style={{ paddingLeft: 12 }}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <MyDatePickerNew
                      label="Дата до"
                      value={this.state.date_end_day}
                      func={this.changeDateRange_days.bind(this, "date_end_day")}
                    />
                  </Grid>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <Button
                    onClick={this.update_days.bind(this)}
                    variant="contained"
                  >
                    {/* для тестов получениt данных по дням для Ушедших и Вернувшихся */}
                    {/* <Button onClick={this.test_stat.bind(this)} variant="contained"> */}
                    Обновить
                  </Button>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TableContainer sx={{ maxHeight: { xs: "none", sm: 600 }, overflowX: "auto" }}>
                    <Table
                      stickyHeader
                      size="small"
                      style={{ borderCollapse: "collapse" }}
                    >
                      <TableHead sx={{ position: "sticky", top: 0, zIndex: 7 }}>
                        <TableRow>
                          <TableCell sx={{ zIndex: 30, minWidth: 200, left: 0 }}>Точка</TableCell>
                          <TableCell sx={{ zIndex: 30, left: 200 }}></TableCell>
                          {this.state.dataDates_days.map((item, key) => (
                            <TableCell
                              key={key}
                              style={{ textAlign: "center", minWidth: 100 }}
                            >
                              {item.new_date}
                            </TableCell>
                          ))}
                          <TableCell style={{ borderLeft: "1px solid #e5e5e5", minWidth: 100 }}>
                            Итого
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.dataCities_days.map((city, c_key) => (
                          <React.Fragment key={c_key}>
                            {city.points.map((item, key) => (
                              <React.Fragment key={key}>
                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    sx={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Новые клиенты
                                  </TableCell>
                                  {this.state.dataDates_days.map((it) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.new_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.new_users}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    sx={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Количество заказов
                                  </TableCell>
                                  {this.state.dataDates_days.map((it) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.count}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.count}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    sx={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  >
                                    {item.name}
                                  </TableCell>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Средний чек
                                  </TableCell>
                                  {this.state.dataDates_days.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.avg_summ}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.avg_summ}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    sx={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Ушедшие клиенты
                                  </TableCell>
                                  {this.state.dataDates_days.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.lost_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.lost_users}
                                  </TableCell>
                                </TableRow>

                                <TableRow sx={{ borderBottom: "10px solid #e5e5e5 !important" }}>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 200, position: "sticky", left: 0 }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    sx={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Вернувшиеся клиенты
                                  </TableCell>
                                  {this.state.dataDates_days.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.return_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell
                                    sx={{
                                      borderLeft: "1px solid #e5e5e5",
                                      position: "sticky",
                                      left: 0,
                                    }}
                                  >
                                    {item.svod.return_users}
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            ))}

                            <React.Fragment>
                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal_days.bind(
                                  this,
                                  "newUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Новые клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>

                                {this.state.dataDates_days.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.new_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal_days.bind(
                                  this,
                                  "orders",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Количество заказов
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates_days.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.count}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow>
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                >
                                  Итого {city.name}
                                </TableCell>
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    "&:hover": {
                                      color: "#c03",
                                    },
                                  }}
                                  onClick={this.openGraphModal_days.bind(
                                    this,
                                    "avgSumm",
                                    city.name,
                                    city.data,
                                  )}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Средний чек
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates_days.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        onClick={this.openGraphModal_days.bind(
                                          this,
                                          "avgSumm",
                                          city.name,
                                          city.data,
                                        )}
                                        sx={{
                                          minWidth: 250,
                                          position: "sticky",
                                          left: 200,
                                          textAlign: "center",
                                          cursor: "pointer",
                                          "&:hover": { color: "#c03" },
                                        }}
                                        key={k}
                                      >
                                        {st.avg_summ}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal_days.bind(
                                  this,
                                  "lostUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Ушедшие клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates_days.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.lost_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{
                                  borderBottom: "10px solid #e5e5e5 !important",
                                  cursor: "pointer",
                                  "& td": { "&:hover": { color: "#c03" } },
                                }}
                                onClick={this.openGraphModal_days.bind(
                                  this,
                                  "returnUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  sx={{ minWidth: 200, position: "sticky", left: 0 }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Вернувшиеся клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates_days.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.return_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>
                            </React.Fragment>
                            <TableRow>
                              <TableCell
                                colSpan={this.state.dataDates_days.length + 3}
                                style={{
                                  borderBottom: "10px solid #e5e5e5 !important",
                                  height: 100,
                                }}
                              ></TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}

                        <React.Fragment>
                          <TableRow>
                            <TableCell
                              rowSpan={6}
                              variant="head"
                              sx={{ minWidth: 200, position: "sticky", left: 0 }}
                            >
                              Итого в сети
                            </TableCell>
                            <TableCell
                              variant="head"
                              sx={{
                                cursor: this.state.dataDates_days.length ? "pointer" : null,
                                "&:hover": {
                                  color: this.state.dataDates_days.length ? "#c03" : null,
                                },
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                              onClick={
                                this.state.dataDates_days.length
                                  ? this.openGraphModal_days.bind(this, "newUsers", "в сети", null)
                                  : null
                              }
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Новые клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>

                            {this.state.dataDates_days.map((it, kk) =>
                              this.state.all_data_days.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    sx={{
                                      cursor: this.state.dataDates_days.length ? "pointer" : null,
                                      "&:hover": {
                                        color: this.state.dataDates_days.length ? "#c03" : null,
                                      },
                                      minWidth: 250,
                                      position: "sticky",
                                      left: 200,
                                      textAlign: "center",
                                    }}
                                    onClick={
                                      this.state.dataDates_days.length
                                        ? this.openGraphModal_days.bind(
                                            this,
                                            "newUsers",
                                            "в сети",
                                            null,
                                          )
                                        : null
                                    }
                                  >
                                    {st.new_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates_days.length ? "pointer" : null,
                              "& td": {
                                "&:hover": {
                                  color: this.state.dataDates_days.length ? "#c03" : null,
                                },
                              },
                            }}
                            onClick={
                              this.state.dataDates_days.length
                                ? this.openGraphModal_days.bind(this, "orders", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              sx={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Количество заказов
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates_days.map((it, kk) =>
                              this.state.all_data_days.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.count}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates_days.length ? "pointer" : null,
                              "& td": {
                                "&:hover": {
                                  color: this.state.dataDates_days.length ? "#c03" : null,
                                },
                              },
                            }}
                            onClick={
                              this.state.dataDates_days.length
                                ? this.openGraphModal_days.bind(this, "avgSumm", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              sx={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Средний чек
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates_days.map((it, kk) =>
                              this.state.all_data_days.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.avg_summ}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates_days.length ? "pointer" : null,
                              "& td": {
                                "&:hover": {
                                  color: this.state.dataDates_days.length ? "#c03" : null,
                                },
                              },
                            }}
                            onClick={
                              this.state.dataDates_days.length
                                ? this.openGraphModal_days.bind(this, "lostUsers", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              sx={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Ушедшие клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates_days.map((it, kk) =>
                              this.state.all_data_days.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.lost_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates_days.length ? "pointer" : null,
                              "& td": {
                                "&:hover": {
                                  color: this.state.dataDates_days.length ? "#c03" : null,
                                },
                              },
                            }}
                            onClick={
                              this.state.dataDates_days.length
                                ? this.openGraphModal_days.bind(this, "returnUsers", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              sx={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Вернувшиеся клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates_days.map((it, kk) =>
                              this.state.all_data_days.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.return_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>
                        </React.Fragment>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </TabPanel>
            </Grid>
          )}
          {/* по дням */}

          {/* по месяцам */}
          {this.state.activeTab === 1 && (
            <Grid
              style={{ paddingTop: 0, paddingBottom: "40px" }}
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TabPanel
                value={this.state.activeTab}
                index={1}
                id="stat"
              >
                <Grid
                  container
                  spacing={3}
                  sx={{ p: 0, mb: 2 }}
                >
                  <Grid
                    style={{ paddingRight: 12 }}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <MyDatePickerNewViews
                      label="Дата от"
                      views={["month", "year"]}
                      value={this.state.date_start}
                      func={this.changeDateRange.bind(this, "date_start")}
                    />
                  </Grid>

                  <Grid
                    style={{ paddingLeft: 12 }}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <MyDatePickerNewViews
                      label="Дата до"
                      views={["month", "year"]}
                      value={this.state.date_end}
                      func={this.changeDateRange.bind(this, "date_end")}
                    />
                  </Grid>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <Button
                    onClick={this.update_months.bind(this)}
                    variant="contained"
                  >
                    Обновить
                  </Button>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TableContainer sx={{ maxHeight: { xs: "none", sm: 600 } }}>
                    <Table
                      stickyHeader
                      size="small"
                      style={{ borderCollapse: "collapse" }}
                    >
                      <TableHead sx={{ position: "sticky", top: 0, zIndex: 7 }}>
                        <TableRow>
                          <TableCell sx={{ zIndex: 30, minWidth: 200, left: 0 }}>Точка</TableCell>
                          <TableCell sx={{ zIndex: 30, left: 200 }}></TableCell>
                          {this.state.dataDates.map((item, key) => (
                            <TableCell
                              key={key}
                              style={{ textAlign: "center", minWidth: 100 }}
                            >
                              {item.new_date}
                            </TableCell>
                          ))}
                          <TableCell style={{ borderLeft: "1px solid #e5e5e5", minWidth: 100 }}>
                            Итого
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.dataCities.map((city, c_key) => (
                          <React.Fragment key={c_key}>
                            {city.points.map((item, key) => (
                              <React.Fragment key={key}>
                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    style={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Новые клиенты
                                  </TableCell>
                                  {this.state.dataDates.map((it) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.new_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.new_users}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    style={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Количество заказов
                                  </TableCell>
                                  {this.state.dataDates.map((it) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.count}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.count}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    style={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  >
                                    {item.name}
                                  </TableCell>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Средний чек
                                  </TableCell>
                                  {this.state.dataDates.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.avg_summ}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.avg_summ}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell
                                    variant="head"
                                    style={{
                                      minWidth: 200,
                                      position: "sticky",
                                      left: 0,
                                      border: "none",
                                    }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Ушедшие клиенты
                                  </TableCell>
                                  {this.state.dataDates.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.lost_users.lost_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell style={{ borderLeft: "1px solid #e5e5e5" }}>
                                    {item.svod.lost_users}
                                  </TableCell>
                                </TableRow>

                                <TableRow sx={{ borderBottom: "10px solid #e5e5e5 !important" }}>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 200, position: "sticky", left: 0 }}
                                  ></TableCell>
                                  <TableCell
                                    variant="head"
                                    style={{ minWidth: 250, position: "sticky", left: 200 }}
                                  >
                                    Вернувшиеся клиенты
                                  </TableCell>
                                  {this.state.dataDates.map((it, kk) =>
                                    item.stat.map((st, k) =>
                                      it.new_date == st.new_date ? (
                                        <TableCell
                                          key={k}
                                          style={{ textAlign: "center" }}
                                        >
                                          {st.lost_users.return_users}
                                        </TableCell>
                                      ) : null,
                                    ),
                                  )}
                                  <TableCell
                                    style={{
                                      borderLeft: "1px solid #e5e5e5",
                                      position: "sticky",
                                      left: 0,
                                    }}
                                  >
                                    {item.svod.return_users}
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            ))}

                            <React.Fragment>
                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal.bind(
                                  this,
                                  "newUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Новые клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.new_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal.bind(
                                  this,
                                  "orders",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Количество заказов
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.count}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                >
                                  Итого {city.name}
                                </TableCell>
                                <TableCell
                                  variant="head"
                                  sx={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    cursor: "pointer",
                                    "&:hover": { color: "#c03" },
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                  onClick={this.openGraphModal.bind(
                                    this,
                                    "avgSumm",
                                    city.name,
                                    city.data,
                                  )}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Средний чек
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        onClick={this.openGraphModal.bind(
                                          this,
                                          "avgSumm",
                                          city.name,
                                          city.data,
                                        )}
                                        sx={{
                                          minWidth: 250,
                                          position: "sticky",
                                          left: 200,
                                          textAlign: "center",
                                          cursor: "pointer",
                                          "&:hover": { color: "#c03" },
                                        }}
                                        key={k}
                                      >
                                        {st.avg_summ}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{ cursor: "pointer", "& td": { "&:hover": { color: "#c03" } } }}
                                onClick={this.openGraphModal.bind(
                                  this,
                                  "lostUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 200,
                                    position: "sticky",
                                    left: 0,
                                    border: "none",
                                  }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Ушедшие клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.lost_users.lost_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>

                              <TableRow
                                sx={{
                                  borderBottom: "10px solid #e5e5e5 !important",
                                  cursor: "pointer",
                                  "& td": { "&:hover": { color: "#c03" } },
                                }}
                                onClick={this.openGraphModal.bind(
                                  this,
                                  "returnUsers",
                                  city.name,
                                  city.data,
                                )}
                              >
                                <TableCell
                                  variant="head"
                                  style={{ minWidth: 200, position: "sticky", left: 0 }}
                                ></TableCell>
                                <TableCell
                                  variant="head"
                                  style={{
                                    minWidth: 250,
                                    position: "sticky",
                                    left: 200,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                    Вернувшиеся клиенты
                                  </Typography>
                                  <QueryStatsIcon fontSize="small" />
                                </TableCell>
                                {this.state.dataDates.map((it, kk) =>
                                  city.data.map((st, k) =>
                                    it.new_date == st.new_date ? (
                                      <TableCell
                                        key={k}
                                        style={{ textAlign: "center" }}
                                      >
                                        {st.lost_users.return_users}
                                      </TableCell>
                                    ) : null,
                                  ),
                                )}
                              </TableRow>
                            </React.Fragment>

                            <TableCell
                              colSpan={this.state.dataDates.length + 3}
                              style={{ borderBottom: "10px solid #e5e5e5 !important", height: 100 }}
                            ></TableCell>
                          </React.Fragment>
                        ))}

                        <React.Fragment>
                          <TableRow>
                            <TableCell
                              rowSpan={6}
                              variant="head"
                              style={{ minWidth: 200, position: "sticky", left: 0 }}
                            >
                              Итого в сети
                            </TableCell>
                            <TableCell
                              variant="head"
                              sx={{
                                cursor: this.state.dataDates.length ? "pointer" : null,
                                "&:hover": { color: this.state.dataDates.length ? "#c03" : null },
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                              onClick={
                                this.state.dataDates.length
                                  ? this.openGraphModal.bind(this, "newUsers", "в сети", null)
                                  : null
                              }
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Новые клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>

                            {this.state.dataDates.map((it, kk) =>
                              this.state.all_data.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    sx={{
                                      cursor: this.state.dataDates.length ? "pointer" : null,
                                      "&:hover": {
                                        color: this.state.dataDates.length ? "#c03" : null,
                                      },
                                      minWidth: 250,
                                      position: "sticky",
                                      left: 200,
                                      textAlign: "center",
                                    }}
                                    onClick={
                                      this.state.dataDates.length
                                        ? this.openGraphModal.bind(this, "newUsers", "в сети", null)
                                        : null
                                    }
                                  >
                                    {st.new_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates.length ? "pointer" : null,
                              "& td": {
                                "&:hover": { color: this.state.dataDates.length ? "#c03" : null },
                              },
                            }}
                            onClick={
                              this.state.dataDates.length
                                ? this.openGraphModal.bind(this, "orders", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              style={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Количество заказов
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates.map((it, kk) =>
                              this.state.all_data.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.count}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates.length ? "pointer" : null,
                              "& td": {
                                "&:hover": { color: this.state.dataDates.length ? "#c03" : null },
                              },
                            }}
                            onClick={
                              this.state.dataDates.length
                                ? this.openGraphModal.bind(this, "avgSumm", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              style={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Средний чек
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates.map((it, kk) =>
                              this.state.all_data.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.avg_summ}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates.length ? "pointer" : null,
                              "& td": {
                                "&:hover": { color: this.state.dataDates.length ? "#c03" : null },
                              },
                            }}
                            onClick={
                              this.state.dataDates.length
                                ? this.openGraphModal.bind(this, "lostUsers", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              style={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Ушедшие клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates.map((it, kk) =>
                              this.state.all_data.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.lost_users.lost_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>

                          <TableRow
                            sx={{
                              cursor: this.state.dataDates.length ? "pointer" : null,
                              "& td": {
                                "&:hover": { color: this.state.dataDates.length ? "#c03" : null },
                              },
                            }}
                            onClick={
                              this.state.dataDates.length
                                ? this.openGraphModal.bind(this, "returnUsers", "в сети", null)
                                : null
                            }
                          >
                            <TableCell
                              variant="head"
                              style={{
                                minWidth: 250,
                                position: "sticky",
                                left: 200,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Typography sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                                Вернувшиеся клиенты
                              </Typography>
                              <QueryStatsIcon fontSize="small" />
                            </TableCell>
                            {this.state.dataDates.map((it, kk) =>
                              this.state.all_data.map((st, k) =>
                                it.new_date == st.new_date ? (
                                  <TableCell
                                    key={k}
                                    style={{ textAlign: "center" }}
                                  >
                                    {st.lost_users.return_users}
                                  </TableCell>
                                ) : null,
                              ),
                            )}
                          </TableRow>
                        </React.Fragment>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </TabPanel>
            </Grid>
          )}
          {/* по месяцам */}
        </Grid>
      </>
    );
  }
}

export default function StatByClients() {
  return <StatByClients_ />;
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
