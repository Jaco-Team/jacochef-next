import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyCheckBox, MyDatePickerNew, formatDate, MyAutocomplite, MyAlert} from '@/ui/elements';

import { api, api_laravel, api_laravel_local } from '@/src/api_new';
import dayjs from 'dayjs';

var am5locales_ru_RU = {
  Jan: 'Янв',
  January: 'Янв',
  Feb: 'Фев',
  February: 'Фев',
  Mar: 'Мар',
  March: 'Мар',
  Apr: 'Апр',
  April: 'Апр',
  May: 'Май',
  Jun: 'Июн',
  June: 'Июн',
  Jul: 'Июл',
  July: 'Июл',
  Aug: 'Авг',
  August: 'Авг',
  Sep: 'Сен',
  September: 'Сен',
  Oct: 'Окт',
  October: 'Окт',
  Nov: 'Ноя',
  November: 'Ноя',
  Dec: 'Дек',
  December: 'Дек',
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
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class StatOrder_ extends React.Component {
  chart_avg = null;
  chart_summ = null;
  chart_count = null;

  constructor(props) {
    super(props);

    this.state = {
      module: 'module_stat_order',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      points: [],
      point: [],

      fullScreen: false,
      activeTab: 0,

      metrics: [],
      metric: [],

      is_akcii: 0,

      stat: [],

      avg_graph: null,
      summ_graph: null,
      count_graph: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.points,
      metrics: data.metrics,
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

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeItemChecked(event) {
    this.setState({
      is_akcii: event.target.checked === true ? 1 : 0,
    });
  }

  changeTab(event, value) {
    const { activeTab } = this.state;

    if (activeTab !== value) {
      this.setState({
        avg_graph: null,
        summ_graph: null,
        count_graph: null,
      });

      setTimeout(() => {
        this.get_stat_orders();
      }, 200);
    }

    this.setState({
      activeTab: value,
    });
  }

  async get_stat_orders() {
    this.setState({
      avg_graph: null,
      summ_graph: null,
      count_graph: null,
    });

    const { activeTab, point, metric, date_start, date_end, is_akcii } =
      this.state;

    const type = activeTab ? 'month' : 'days';

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать точки',
      });

      return;
    }

    if (!metric.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать метрику',
      });

      return;
    }

    let count = 0;
    let avg = 0;
    let summ = 0;

    metric.forEach((item) => {
      if (parseInt(item.id) === 1) {
        avg = 1;
      }

      if (parseInt(item.id) === 2) {
        summ = 1;
      }

      if (parseInt(item.id) === 3) {
        count = 1;
      }
    });

    const data = {
      date_start: date_start ? dayjs(date_start).format('YYYY-MM-DD') : '',
      date_end: date_end ? dayjs(date_end).format('YYYY-MM-DD') : '',
      point,
      metric,
      is_akcii,
      count,
      avg,
      summ,
    };

    let res;

    if (type === 'days') {
      res = await this.getData('get_stat_days', data);
    } else {
      res = await this.getData('get_stat_month', data);
    }

    this.setState({
      stat: res.stat,
    });

    setTimeout(() => {
      this.get_graph_data(count, avg, summ, type);
    }, 100);
  }

  get_graph_data(count, avg, summ, type) {
    const stat = this.state.stat;

    if (avg) {
      const myData_avg = stat.reduce((newData, item) => {
        if (item?.avg_orders) {
          const exist = newData.find((data) => data.date == item.date);

          if (exist) {
            let existIndex = newData.indexOf(exist);

            newData[existIndex].count = (parseInt(item.avg_orders) + parseInt(newData[existIndex].count)) / 2;

            if (newData[existIndex]?.avd_data && item?.avd?.length) {
              newData[existIndex]?.avd_data?.push(...item.avd);
            }
          } else {
            newData.push({
              date: item.date,
              count: parseInt(item.avg_orders ?? 0),
              avd_data: item?.avd ?? [],
            });
          }
        }

        return newData;
      }, []);

      let data_column = [];

      myData_avg.forEach((item) => {

        let date = item.date.split('-');

        item.date = type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime();
        item.value = Math.floor(item.count);

        if (item?.avd_data?.length) {
          item.avd_data = item.avd_data.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));

          item.avd_data.forEach((it) => {
            data_column.push({
              date: type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime(),
              value: (Math.floor(item.count) / 100) * 90,
              name: it.name,
            });
          });
        }
      });

      data_column = Object.values(data_column.reduce((acc, c) => (c.name in acc ? acc[c.name].push(c) : (acc[c.name] = [c]), acc), []));

      this.setState({
        avg_graph: 'avg_graph',
      });

      if (type === 'days') {
        setTimeout(() => {
          this.renderGraph_days(myData_avg, 'avg_graph', 'Средний чек', data_column);
        }, 200);
      } else {
        setTimeout(() => {
          this.renderGraph_month(myData_avg, 'avg_graph', 'Средний чек', data_column);
        }, 200);
      }
    }

    if (summ) {
      const myData_summ = stat.reduce((newData, item) => {
        if (item?.sum_orders) {
          const exist = newData.find((data) => data.date == item.date);

          if (exist) {
            let existIndex = newData.indexOf(exist);

            newData[existIndex].count = (parseInt(item.sum_orders) + parseInt(newData[existIndex].count)) / 2;

            if (newData[existIndex]?.avd_data && item?.avd?.length) {
              newData[existIndex]?.avd_data?.push(...item.avd);
            }
          } else {
            newData.push({
              date: item.date,
              count: parseInt(item.sum_orders ?? 0),
              avd_data: item?.avd ?? [],
            });
          }
        }

        return newData;
      }, []);

      let data_column = [];

      myData_summ.forEach((item) => {

        let date = item.date.split('-');

        item.date = type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime();
        item.value = Math.floor(item.count);

        if (item?.avd_data?.length) {
          item.avd_data = item.avd_data.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));

          item.avd_data.forEach((it) => {
            data_column.push({
              date: type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime(),
              value: (Math.floor(item.count) / 100) * 90,
              name: it.name,
            });
          });
        }
      });

      data_column = Object.values(data_column.reduce((acc, c) => (c.name in acc ? acc[c.name].push(c) : (acc[c.name] = [c]), acc), []));

      this.setState({
        summ_graph: 'summ_graph',
      });

      if (type === 'days') {
        setTimeout(() => {
          this.renderGraph_days(myData_summ, 'summ_graph', 'Выручка', data_column);
        }, 200);
      } else {
        setTimeout(() => {
          this.renderGraph_month(myData_summ, 'summ_graph', 'Выручка', data_column);
        }, 200);
      }
    }

    if (count) {
      const myData_count = stat.reduce((newData, item) => {
        if (item?.count_orders) {
          const exist = newData.find((data) => data.date == item.date);

          if (exist) {
            let existIndex = newData.indexOf(exist);

            newData[existIndex].count = (parseInt(item.count_orders) + parseInt(newData[existIndex].count)) / 2;

            if (newData[existIndex]?.avd_data && item?.avd?.length) {
              newData[existIndex]?.avd_data?.push(...item.avd);
            }
          } else {
            newData.push({
              date: item.date,
              count: parseInt(item.count_orders ?? 0),
              avd_data: item?.avd ?? [],
            });
          }
        }

        return newData;
      }, []);

      let data_column = [];

      myData_count.forEach((item) => {

        let date = item.date.split('-');

        item.date = type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime();
        item.value = Math.floor(item.count);

        if (item?.avd_data?.length) {
          item.avd_data = item.avd_data.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));

          item.avd_data.forEach((it) => {
            data_column.push({
              date: type === 'days' ? new Date(date[0], parseInt(date[1]) - 1, date[2]).getTime() : new Date(date[0], parseInt(date[1]) - 1, 1).getTime(),
              value: (Math.floor(item.count) / 100) * 90,
              name: it.name,
            });
          });
        }
      });

      data_column = Object.values(data_column.reduce((acc, c) => (c.name in acc ? acc[c.name].push(c) : (acc[c.name] = [c]), acc), []));

      this.setState({
        count_graph: 'count_graph',
      });

      if (type === 'days') {
        setTimeout(() => {
          this.renderGraph_days(myData_count, 'count_graph', 'Кол-во заказов', data_column);
        }, 200);
      } else {
        setTimeout(() => {
          this.renderGraph_month(myData_count, 'count_graph', 'Кол-во заказов', data_column);
        }, 200);
      }
    }
  }

  renderGraph_days(data_series, id, type, data_column) {
    if (id === 'avg_graph') {
      if (this.chart_avg) {
        this.chart_avg.dispose();
      }
    }

    if (id === 'summ_graph') {
      if (this.chart_summ) {
        this.chart_summ.dispose();
      }
    }

    if (id === 'count_graph') {
      if (this.chart_count) {
        this.chart_count.dispose();
      }
    }

    var root = am5.Root.new(id);

    if (id === 'avg_graph') {
      this.chart_avg = root;
    }

    if (id === 'summ_graph') {
      this.chart_summ = root;
    }

    if (id === 'count_graph') {
      this.chart_count = root;
    }

    root.locale = am5locales_ru_RU;
    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: 'zoomX',
        layout: root.verticalLayout,
      })
    );

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.get('dateFormats')['day'] = 'dd/MM';
    xAxis.get('periodChangeDateFormats')['day'] = 'dd/MM';

    // Create series
    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: 'date',
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        })
      );

      // правка radius: 5->3
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get('fill'),
          }),
        });
      });

      series.strokes.template.set('strokeWidth', 3);
      series.get('tooltip').label.set('text', '[bold]{name}[/]\n{valueX.formatDate()}: {valueY}');
      series.data.setAll(data);
    }

    createSeries(type, 'value', data_series);

    function createColumn(name, field, data) {
      var series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: 'date',
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: 'horizontal',
          }),
        })
      );

      series1.columns.template.setAll({
        width: am5.percent(20),
        fillOpacity: 0.5,
        strokeWidth: 2,
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
      });

      series1.get('tooltip').label.set('text', '[bold]{name}');
      series1.data.setAll(data);
    }

    data_column.forEach((item) => {
      createColumn('Акция', 'value', item);
    });

    // Add cursor
    chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'zoomXY',
        xAxis: xAxis,
      })
    );

    xAxis.set(
      'tooltip',
      am5.Tooltip.new(root, {
        themeTags: ['axis'],
      })
    );

    yAxis.set(
      'tooltip',
      am5.Tooltip.new(root, {
        themeTags: ['axis'],
      })
    );
  }

  renderGraph_month(data_series, id, type, data_column) {
    if (id === 'avg_graph') {
      if (this.chart_avg) {
        this.chart_avg.dispose();
      }
    }

    if (id === 'summ_graph') {
      if (this.chart_summ) {
        this.chart_summ.dispose();
      }
    }

    if (id === 'count_graph') {
      if (this.chart_count) {
        this.chart_count.dispose();
      }
    }

    var root = am5.Root.new(id);

    if (id === 'avg_graph') {
      this.chart_avg = root;
    }

    if (id === 'summ_graph') {
      this.chart_summ = root;
    }

    if (id === 'count_graph') {
      this.chart_count = root;
    }

    root.locale = am5locales_ru_RU;

    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: 'zoomX',
        layout: root.verticalLayout,
      })
    );

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: 'month', count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.get('dateFormats')['day'] = 'MM/dd';
    xAxis.get('periodChangeDateFormats')['day'] = 'MM/dd';
    xAxis.get('dateFormats')['month'] = 'MMMM';

    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: 'date',
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        })
      );

      // правка radius: 5->3
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get('fill'),
          }),
        });
      });

      series.strokes.template.set('strokeWidth', 3);
      series.get('tooltip').label.set('text', '[bold]{name}[/]\n{valueX.formatDate()}: {valueY}');
      series.data.setAll(data);
    }

    createSeries(type, 'value', data_series);

    function createColumn(name, field, data) {
      var series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: 'date',
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: 'horizontal',
          }),
        })
      );

      series1.columns.template.setAll({
        width: am5.percent(40),
        fillOpacity: 0.5,
        strokeWidth: 2,
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
      });

      series1.get('tooltip').label.set('text', '[bold]{name}');
      series1.data.setAll(data);
    }

    data_column.forEach((item) => {
      createColumn('Акция', 'value', item);
    });

    // Add cursor
    chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'zoomXY',
        xAxis: xAxis,
      })
    );

    xAxis.set(
      'tooltip',
      am5.Tooltip.new(root, {
        themeTags: ['axis'],
      })
    );

    yAxis.set(
      'tooltip',
      am5.Tooltip.new(root, {
        themeTags: ['axis'],
      })
    );
  }

  render() {
    return (
      <>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>

        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Grid container spacing={3} mb={3} className="container_first_child">
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Точка"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changeAutocomplite.bind(this, 'point')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Метрика"
              multiple={true}
              data={this.state.metrics}
              value={this.state.metric}
              func={this.changeAutocomplite.bind(this, 'metric')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyCheckBox
              label="Показывать акции"
              value={parseInt(this.state.is_akcii) == 1 ? true : false}
              func={this.changeItemChecked.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button onClick={this.get_stat_orders.bind(this)} variant="contained">
              Показать
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingBottom: 24 }}>
            <Paper>
              <Tabs value={this.state.activeTab} onChange={this.changeTab.bind(this)} centered variant="fullWidth">
                <Tab label="Дни" {...a11yProps(0)} />
                <Tab label="Месяца" {...a11yProps(1)} />
              </Tabs>
            </Paper>
          </Grid>

          {/* по дням */}
          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel value={this.state.activeTab} index={0} id="stat">
              <Grid container spacing={3}>
                {!this.state.avg_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>Средний чек по дням</h2>
                    <div id={this.state.avg_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}

                {!this.state.summ_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>Выручка по дням</h2>
                    <div id={this.state.summ_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}

                {!this.state.count_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>
                      Кол-во заказов по дням
                    </h2>
                    <div id={this.state.count_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Grid>
          {/* по дням */}

          {/* по месяцам */}
          <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
            <TabPanel value={this.state.activeTab} index={1} id="stat">
              <Grid container spacing={3}>
                {!this.state.avg_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>
                      Средний чек по месяцам
                    </h2>
                    <div id={this.state.avg_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}

                {!this.state.summ_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>Выручка по месяцам</h2>
                    <div id={this.state.summ_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}

                {!this.state.count_graph ? null : (
                  <Grid item xs={12} sm={12}>
                    <h2 style={{ textAlign: 'center' }}>
                      Кол-во заказов по месяцам
                    </h2>
                    <div id={this.state.count_graph} style={{ width: '100%', height: '500px' }}/>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Grid>
          {/* по месяцам */}
        </Grid>
      </>
    );
  }
}

export default function StatOrder() {
  return <StatOrder_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=3600'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  };
}
