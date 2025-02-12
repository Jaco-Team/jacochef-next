import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import {
  MySelect,
  MyDatePickerNew,
  MyTimePicker,
  MyCheckBox,
} from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';

export default class HotMap extends React.PureComponent {
  map = null;
  heatmap = null;
  myGeoObject = null;

  constructor(props) {
    super(props);

    this.state = {
      module: 'hot_map',
      module_name: '',
      is_load: false,

      cities: [],
      city_id: '',

      date_start: dayjs(new Date()),
      date_end: dayjs(new Date()),
      time_start: '00:00',
      time_end: '23:59',

      statAllCount: '',
      statTrueCount: '',
      statTrueAllSumm: '',
      statTrueAvgSumm: '',
      is_chooseZone: false,

      is_new: 0,
      is_pick_order: 0,

      isDrawing: true,
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city_id: data.cities[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then(result => result.data)
      .finally( () => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  }

  changeCity = (event) => {
    let data = event.target.value;
    this.setState({ city_id: data });
  };

  updateData = async () => {
    if (this.state.statAllCount) {
      this.setState({
        statAllCount: '',
        statTrueCount: '',
        statTrueAllSumm: '',
        statTrueAvgSumm: '',
      });
    }

    this.setState({ isDrawing: true });

    let data = {
      city_id: this.state.city_id,
      date_start: dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM-DD'),
      time_start: this.state.time_start,
      time_end: this.state.time_end,
      is_new: this.state.is_new,
      is_pick_order: this.state.is_pick_order,
      is_chooseZone: false,
    };

    let res = await this.getData('get_orders', data);

    this.getOrders(res.points, res.all_points);
  };

  getOrders = (home, all_points) => {
    var new_data = all_points
      .filter((item) => item && item[0] && item[1])
      .map((item) => [parseFloat(item[0]), parseFloat(item[1])]);

    if (!this.map) {
      ymaps.ready(() => {
        this.map = new ymaps.Map(
          'map',
          {
            center: [home[0].home.latitude, home[0].home.longitude],
            zoom: 11,
          },
          {
            searchControlProvider: 'yandex#search',
          }
        );

        var gradients = [
            {
              0.1: 'rgba(128, 255, 0, 0.7)',
              0.2: 'rgba(255, 255, 0, 0.8)',
              0.7: 'rgba(234, 72, 58, 0.9)',
              1.0: 'rgba(162, 36, 25, 1)',
            },
            {
              0.1: 'rgba(162, 36, 25, 0.7)',
              0.2: 'rgba(234, 72, 58, 0.8)',
              0.7: 'rgba(255, 255, 0, 0.9)',
              1.0: 'rgba(128, 255, 0, 1)',
            },
          ],
          radiuses = [5, 10, 20, 30],
          opacities = [0.4, 0.6, 0.8, 1];

        home.forEach((item) => {
          let myGeoObject1 = new ymaps.GeoObject(
            {
              geometry: {
                type: 'Point',
                coordinates: [item.home.latitude, item.home.longitude],
              },
            },
            {
              preset: 'islands#blackDotIcon',
              iconColor: 'black',
            }
          );

          this.map.geoObjects.add(myGeoObject1);

          let points_zone = item.zone.map((zon) => JSON.parse(zon['zone']));

          points_zone.forEach((zone, poly) => {
            let myGeoObject2 = new ymaps.Polygon(
              [zone],
              {
                hintContent: '',
              },
              {
                fillColor: 'rgba(187, 0, 37, 0)',
                strokeColor: 'rgb(187, 0, 37)',
                strokeWidth: 5,
              }
            );

            this.map.geoObjects.add(myGeoObject2);
          });

          this.map.geoObjects.events.add('click', this.changeColorPolygon);
        });

        ymaps.modules.require(['Heatmap'], (Heatmap) => {
          this.heatmap = new Heatmap(new_data, {
            gradient: gradients[0],
            radius: radiuses[1],
            opacity: opacities[2],
          });
          this.heatmap.setMap(this.map);
        });
      });
    } else {
      this.map.geoObjects.removeAll();
      this.heatmap.destroy();

      this.map.setCenter([home[0].home.latitude, home[0].home.longitude]);

      var gradients = [
          {
            0.1: 'rgba(128, 255, 0, 0.7)',
            0.2: 'rgba(255, 255, 0, 0.8)',
            0.7: 'rgba(234, 72, 58, 0.9)',
            1.0: 'rgba(162, 36, 25, 1)',
          },
          {
            0.1: 'rgba(162, 36, 25, 0.7)',
            0.2: 'rgba(234, 72, 58, 0.8)',
            0.7: 'rgba(255, 255, 0, 0.9)',
            1.0: 'rgba(128, 255, 0, 1)',
          },
        ],
        radiuses = [5, 10, 20, 30],
        opacities = [0.4, 0.6, 0.8, 1];

      ymaps.modules.require(['Heatmap'], (Heatmap) => {
        this.heatmap = new Heatmap(new_data, {
          gradient: gradients[0],
          radius: radiuses[1],
          opacity: opacities[2],
        });
        this.heatmap.setMap(this.map);
      });

      home.forEach((item) => {
        let myGeoObject1 = new ymaps.GeoObject(
          {
            geometry: {
              type: 'Point',
              coordinates: [item.home.latitude, item.home.longitude],
            },
          },
          {
            preset: 'islands#blackDotIcon',
            iconColor: 'black',
          }
        );

        this.map.geoObjects.add(myGeoObject1);

        let points_zone = item.zone.map((zon) => JSON.parse(zon['zone']));

        points_zone.forEach((zone, poly) => {
          let myGeoObject2 = new ymaps.Polygon(
            [zone],
            {
              hintContent: '',
            },
            {
              fillColor: 'rgba(187, 0, 37, 0)',
              strokeColor: 'rgb(187, 0, 37)',
              strokeWidth: 5,
            }
          );
          this.map.geoObjects.add(myGeoObject2);
        });

        this.map.geoObjects.events.add('click', this.changeColorPolygon);
      });
    }
  };

  getCount = async () => {
    var new_this_zone = [];

    if (this.state.is_chooseZone) {
      this.map.geoObjects.each(function (geoObject) {
        new_this_zone = new_this_zone.concat(
          geoObject.geometry.getCoordinates()
        );
      });
    }

    let data = {
      city_id: this.state.city_id,
      date_start: dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM-DD'),
      time_start: this.state.time_start,
      time_end: this.state.time_end,
      is_pick_order: this.state.is_pick_order,
      is_new: this.state.is_new,
      zone: new_this_zone[new_this_zone.length - 1],
    };

    let res = await this.getData('getCount', data);

    res = res.counts;

    this.setState({
      statAllCount: res.all_count,
      statTrueCount: res.true + ' ( ' + res.true_percent + '% ) ',
      statTrueAllSumm: res.price,
      statTrueAvgSumm: res.avg_price,
    });

    // console.log('getCount', res);
  };

  changeDateRange = (data, event) => {
    this.setState({ [data]: event });
  };

  changeData = (type, event) => {
    let data = '';

    if (type === 'is_new' || type === 'is_pick_order') {
      data = event.target.checked ? 1 : 0;
    } else {
      data = event.target.value;
    }

    if (type === 'is_new' && data === 1) {
      this.setState({ is_pick_order: 0 });
    }

    if (type === 'is_pick_order' && data === 1) {
      this.setState({ is_new: 0 });
    }

    this.setState({ [type]: data });
  };

  startDrawing = () => {
    this.setState({ isDrawing: !this.state.isDrawing });

    ymaps
      .geoQuery(this.map.geoObjects)
      .setOptions('strokeColor', 'rgb(187, 0, 37)');

    this.myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: 'Polygon',
          coordinates: [],
          fillRule: 'nonZero',
        },
      },
      {
        fillColor: '#00FF00',
        strokeColor: '#0000FF',
        opacity: 0.5,
        strokeWidth: 5,
        strokeStyle: 'shortdash',
      }
    );

    this.map.geoObjects.add(this.myGeoObject);
    this.myGeoObject.editor.startDrawing();
  };

  stopDrawing = () => {
    this.setState({ isDrawing: !this.state.isDrawing });
    this.myGeoObject.editor.stopDrawing();
  };

  changeColorPolygon = (event) => {
    if (!this.state.is_chooseZone) {
      event.get('target').options.set({ strokeColor: 'rgb(255, 255, 0)' });

      const result = ymaps
        .geoQuery(this.map.geoObjects)
        .search('options.strokeColor = "rgb(255, 255, 0)"');

      if (result._objects.length > 1) {
        result.setOptions('strokeColor', 'rgb(187, 0, 37)');
      }

      if (result) {
        this.map.geoObjects.add(result._objects[0]);
      }

      this.setState({ is_chooseZone: true });
    } else {
      ymaps
        .geoQuery(this.map.geoObjects)
        .setOptions('strokeColor', 'rgb(187, 0, 37)');
      this.setState({ is_chooseZone: false });
    }
  };

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} className="container_first_child">
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              data={this.state.cities}
              value={this.state.city_id}
              func={this.changeCity}
              label="Город"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyCheckBox
              value={this.state.is_new === 1}
              func={this.changeData.bind(this, 'is_new')}
              label="Только новые клиенты"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.updateData}>
              Обновить данные
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyTimePicker
              label="Время от"
              value={this.state.time_start}
              func={this.changeData.bind(this, 'time_start')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyTimePicker
              label="Время до"
              value={this.state.time_end}
              func={this.changeData.bind(this, 'time_end')}
            />
          </Grid>

          <Grid item xs={12}>
            <Tooltip
              title={
                <span style={{ fontSize: '18px', lineHeight: '1.5' }}>
                  Показываются домашние адреса клиентов, кто хотя бы раз сделал
                  заказ на доставку и в заданный период самовывоз. Домашним
                  считается тот адрес, где больше всего доставок за все время в
                  городе.
                </span>
              }
              placement="right"
              arrow
              sx={{
                '& .MuiTooltip-tooltip': {
                  fontSize: '18px !important',
                  maxWidth: '600px',
                  padding: '10px',
                  whiteSpace: 'normal',
                  backgroundColor: '#333',
                  color: '#fff',
                },
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <MyCheckBox
                  value={this.state.is_pick_order === 1}
                  func={this.changeData.bind(this, 'is_pick_order')}
                  label="Домашние адреса"
                />
              </span>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={this.getCount}>
              Подсчитать количество
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={
                this.state.isDrawing ? this.startDrawing : this.stopDrawing
              }
            >
              {this.state.isDrawing
                ? 'Включить область редактирования'
                : 'Выключить область редактирования'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography>
                  Заказов в зоне: {this.state.statTrueCount}
                </Typography>
                <Typography>
                  Сумма заказов в зоне: {this.state.statTrueAllSumm}
                </Typography>
                <Typography>
                  Средний чек в зоне: {this.state.statTrueAvgSumm}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  Всего заказов в городе: {this.state.statAllCount}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} mb={10}>
            <div
              id="map"
              name="map"
              style={{ width: '100%', height: 700, paddingTop: 10 }}
            />
          </Grid>
        </Grid>
      </>
    );
  }
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
