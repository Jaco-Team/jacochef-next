import React from "react";

import Script from "next/script";

import Grid from "@mui/material/Grid";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import dayjs from "dayjs";
import "dayjs/locale/ru";

import { api_laravel, api_laravel_local } from "@/src/api_new";
import MyAlert from "@/ui/MyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

import { am5locales_ru_RU } from "./utils";
import StatSaleTabs from "./StatSaleTabs";
import StatSale_Modal_Graph from "./StatSaleModalGraph";
import StatSale_Tab_Sale from "./StatSaleTabSale";
import StatSale_Tab_Clients from "./StatSaleTabClients";
import StatSale_Tab_Dynamic from "./StatSaleTabDynamic";
import StatSale_Tab_DynamicSale from "./StatSaleTabDynamicSale";
import StatSale_Tab_Sett from "./settings/StatSaleSettingsTab";

dayjs.locale("ru");

// ---------- Стартовая / Основной компонент ----------
class StatSale_ extends React.Component {
  chartStat = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "stat_sale",
      module_name: "",
      acces: {},
      is_load: false,

      fullScreen: false,
      activeTab: 0,
      data_sett_limit_dynamic: [],
      data_sett_limit_dynamic_pay: [],

      data_sett_rate: [],
      data_sett_points: [],
      data_sett_rate_clients: [],

      points: [],
      cities: [],

      modalDialog: false,
      id: null,
      name: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");
    const availableTabs = this.getAvailableTabs(data.acces ?? {});

    this.setState({
      data_sett_rate: data.data_sett_rate,
      data_sett_points: data.data_sett_points,
      data_sett_rate_clients: data.data_sett_rate_clients,
      module_name: data.module_info?.name,
      points: data.points,
      cities: data.cities,
      acces: data.acces ?? {},
      activeTab: availableTabs.includes(this.state.activeTab)
        ? this.state.activeTab
        : (availableTabs[0] ?? 0),
    });

    document.title = data.module_info?.name;

    this.handleResize();
  }

  canAccess = (key) => {
    const { userCan } = handleUserAccess(this.state.acces);
    return userCan("access", key);
  };

  getAvailableTabs = (acces = this.state.acces) => {
    const { userCan } = handleUserAccess(acces);
    const canAccess = (key) => userCan("access", key);
    const tabs = [];

    if (canAccess("sale")) tabs.push(0);
    if (canAccess("client")) tabs.push(1);
    if (canAccess("dynamic")) tabs.push(2);
    if (canAccess("sale_dynamic")) tabs.push(3);
    if (
      canAccess("setting_sale") ||
      canAccess("setting_clients") ||
      canAccess("setting_citizens") ||
      canAccess("setting_limits") ||
      canAccess("setting_limits_pay")
    ) {
      tabs.push(4);
    }

    return tabs;
  };

  getData = async (method, data = {}) => {
    this.setState({ is_load: true });

    try {
      const result = await api_laravel(this.state.module, method, data);
      return result?.data;
    } catch (error) {
      return { st: false, text: error.message || "Ошибка запроса" };
    } finally {
      setTimeout(() => {
        this.setState({ is_load: false });
      }, 500);
    }
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

  changeTab = (event, val) => {
    if (parseInt(val) === 4) this.getDataSet();
    this.setState({ activeTab: val });
  };

  getDataSet = async (req = {}) => {
    const res = await this.getData("get_data_sett", req);

    this.setState({
      data_sett_rate: res.data_sett_rate,
      data_sett_points: res.data_sett_points,
      data_sett_rate_clients: res.data_sett_rate_clients,
      data_sett_limit_dynamic: res.data_sett_limit_dynamic,
      data_sett_limit_dynamic_pay: res.data_sett_limit_dynamic_pay,
    });
  };

  getDataSetOne = async (req = {}) => {
    const res = await this.getData("get_data_sett", { points: req });

    this.setState({
      data_sett_limit_dynamic: res.data_sett_limit_dynamic,
      data_sett_limit_dynamic_pay: res.data_sett_limit_dynamic_pay,
    });
  };

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  get_graph_data_sale = (rawData) => {
    return rawData.map((item) => {
      let seriesData = [];

      Object.keys(item.data).forEach((key) => {
        const datum = item.data[key];

        if (datum?.month) {
          seriesData.push({
            date: dayjs(datum.month, "YYYY-MM").valueOf(),
            value: datum.percent_fact,
          });
        }
      });

      seriesData.sort((a, b) => a.date - b.date);

      return {
        parameter: item.parameter,
        data: seriesData,
      };
    });
  };

  get_graph_data_clients = (data, key) => {
    const flatData = data.flat();
    const grouped = {};

    flatData.forEach((item) => {
      const seriesName = item.name;

      if (!grouped[seriesName]) {
        grouped[seriesName] = [];
      }

      const timestamp = dayjs(item.month, "YYYY-MM").valueOf();

      let value = item[key];

      if (typeof value === "string") {
        value = parseFloat(value.replace(/\s/g, "").replace(",", "."));
      }

      grouped[seriesName].push({ date: timestamp, value });
    });

    return Object.keys(grouped).map((name) => {
      const seriesData = grouped[name].sort((a, b) => a.date - b.date);
      return { parameter: name, data: seriesData };
    });
  };

  openGraphModal = (id, data) => {
    this.handleResize();

    let myData;
    let graphTitle = "";

    if (id === "stat_effect") {
      myData = this.get_graph_data_sale(data);
      graphTitle = "Эффективность за период";
    } else if (id === "stat_clients") {
      myData = this.get_graph_data_clients(data, "percentClients");
      graphTitle = "Клиенты за период";
    } else if (id === "stat_active") {
      myData = this.get_graph_data_clients(data, "percentActiveAccounts");
      graphTitle = "Активность за период";
    } else if (id === "stat_orders") {
      myData = this.get_graph_data_clients(data, "ordersAvg");
      graphTitle = "Заказы за период";
    } else if (id === "stat_avg") {
      myData = this.get_graph_data_clients(data, "averageCheck");
      graphTitle = "Средний чек за период";
    }

    const allDates = myData.flatMap((series) => series.data.map((point) => point.date));
    const minTimestamp = Math.min(...allDates);
    const maxTimestamp = Math.max(...allDates);

    const formatDate = (ts) => {
      const formatted = dayjs(ts).locale("ru").format("MMMM YYYY");
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const startDateStr = formatDate(minTimestamp);
    const endDateStr = formatDate(maxTimestamp);

    this.setState({
      name: `${graphTitle} ${startDateStr} - ${endDateStr} года`,
    });

    this.setState({
      modalDialog: true,
      id,
    });

    setTimeout(() => {
      this.renderGraph(myData, id);
    }, 300);
  };

  renderGraph = (data, id) => {
    if (
      typeof am5 === "undefined" ||
      typeof am5xy === "undefined" ||
      typeof am5themes_Animated === "undefined"
    ) {
      console.error("amCharts libraries not loaded yet");
      // Попробуем еще раз через секунду
      setTimeout(() => this.renderGraph(data, id), 1000);
      return;
    }
    if (this.chartStat) {
      this.chartStat.dispose();
    }

    var root = am5.Root.new(id);
    this.chartStat = root;

    root.locale = am5locales_ru_RU;
    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    // Создаем ось Y
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Создаем ось X
    var xAxis = chart.xAxes.push(
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

    data.forEach((item) => {
      createSeries(item.parameter, "value", item.data);
    });

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
  };

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 9999 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <StatSale_Modal_Graph
          onClose={() => this.setState({ modalDialog: false })}
          fullScreen={this.state.fullScreen}
          open={this.state.modalDialog}
          id={this.state.id}
          name={this.state.name}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
          }}
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
            <StatSaleTabs
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              onChange={this.changeTab}
              canAccess={this.canAccess}
            />
          </Grid>

          {/* Продажи */}
          {this.state.activeTab === 0 && (
            <StatSale_Tab_Sale
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              openGraphModal={this.openGraphModal}
              canExport={this.canAccess("export")}
            />
          )}
          {/* Клиенты */}
          {this.state.activeTab === 1 && (
            <StatSale_Tab_Clients
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              rates={this.state.data_sett_rate_clients}
              openGraphModal={this.openGraphModal}
              canExport={this.canAccess("export")}
            />
          )}
          {/* Динамика */}
          {this.state.activeTab === 2 && (
            <StatSale_Tab_Dynamic
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              rates={this.state.data_sett_rate_clients}
              openGraphModal={this.openGraphModal}
              canExport={this.canAccess("export_dynamic")}
            />
          )}
          {/* Динамика продаж */}
          {this.state.activeTab === 3 && (
            <StatSale_Tab_DynamicSale
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              rates={this.state.data_sett_rate_clients}
              openGraphModal={this.openGraphModal}
              canExport={this.canAccess("export")}
            />
          )}
          {/* Настройки */}
          {this.state.activeTab === 4 && (
            <StatSale_Tab_Sett
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              acces={this.state.acces}
              rows={this.state.data_sett_rate}
              dynamics={this.state.data_sett_limit_dynamic}
              dynamics_pay={this.state.data_sett_limit_dynamic_pay}
              rows_clietns={this.state.data_sett_rate_clients}
              getDataSet={this.getDataSet}
              pointsCurrent={this.state.points}
              getDataSetOne={this.getDataSetOne}
              getData={this.getData}
              points={this.state.data_sett_points}
              openAlert={this.openAlert}
            />
          )}
        </Grid>
      </>
    );
  }
}

export default StatSale_;
