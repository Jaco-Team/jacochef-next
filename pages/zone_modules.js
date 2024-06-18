import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyTextInput, MyCheckBox, MyAlert } from '@/ui/elements';

import queryString from 'query-string';

class ZoneModules_Modal extends React.Component {
  map = null;
  myGeoObject = null;

  constructor(props) {
    super(props);

    this.state = {
      item: null,
      isDrawing: true,
      confirmDialog: false,
      text: '',
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      if (this.props.mark === 'newZone') {
        this.getZones(this.props.item.points[0], this.props.item.other_zone);
      }

      if (this.props.mark === 'editZone') {
        this.getZones(this.props.item.zone, this.props.item.other_zone);
      }

      this.setState({
        item: this.props.item,
      });
    }
  }

  getZones(point, all_zones) {
    if (!this.map) {
      ymaps.ready(() => {
        this.map = new ymaps.Map(
          'map',
          { center: this.props.mark === 'newZone' ? JSON.parse(point['xy_center_map']) : JSON.parse(point['xy_point']), zoom: 11 },
          { searchControlProvider: 'yandex#search' }
        );

        // точка
        let myGeoObject1 = new ymaps.GeoObject(
          { geometry: { type: 'Point', coordinates: JSON.parse(point['xy_point']) },
            properties: { iconContent: this.props.mark === 'newZone' ? point.name : point.point_name },
          },
          { preset: 'islands#blackStretchyIcon' }
        );

        this.map.geoObjects.add(myGeoObject1);

        // редактирование границ изменяемой зоны
        if (this.props.mark === 'editZone') {
          // Создаем многоугольник, используя класс GeoObject.
          this.myGeoObject = new ymaps.Polygon(
            [JSON.parse(point['zone'])],
            { geometry: { fillRule: 'nonZero' } },
            {
              // Описываем опции геообъекта.
              // Цвет заливки.
              fillColor: '#00FF00',
              // Цвет обводки.
              strokeColor: '#0000FF',
              // Общая прозрачность (как для заливки, так и для обводки).
              opacity: 0.5,
              // Ширина обводки.
              strokeWidth: 5,
              // Стиль обводки.
              strokeStyle: 'shortdash',
            }
          );

          this.map.geoObjects.add(this.myGeoObject);
        }

        // все зоны
        all_zones.map((item) => {
          let points_zone = [];

          points_zone.push(JSON.parse(item['zone']));

          let myGeoObject2 = [];

          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly]],
              {
                hintContent: '',
              },
              {
                fillOpacity: 0.4,
                fillColor: 'rgb(240, 128, 128)',
                strokeColor: 'rgb(187, 0, 37)',
                strokeWidth: 5,
              }
            );

            this.map.geoObjects.add(myGeoObject2[poly]);
          }
        });
      });
    } else {
      const myGeoObjectIndex = this.map.geoObjects.indexOf(this.myGeoObject);

      let myGeoObjectEdit = null;

      if (myGeoObjectIndex !== -1) {
        myGeoObjectEdit = this.map.geoObjects.get(myGeoObjectIndex).geometry.getCoordinates();
      }

      this.map.geoObjects.removeAll();

      // новая точка
      let myGeoObject1 = new ymaps.GeoObject(
        { geometry: { type: 'Point', coordinates: JSON.parse(point['xy_point']) },
          properties: { iconContent: point.name },
        },
        { preset: 'islands#blackStretchyIcon' }
      );

      this.map.geoObjects.add(myGeoObject1);

      // все зоны
      all_zones.map((item) => {
        let points_zone = [];

        points_zone.push(JSON.parse(item['zone']));

        let myGeoObject2 = [];

        for (var poly = 0; poly < points_zone.length; poly++) {
          myGeoObject2[poly] = new ymaps.Polygon(
            [points_zone[poly]],
            {
              hintContent: '',
            },
            {
              fillOpacity: 0.4,
              fillColor: 'rgb(240, 128, 128)',
              strokeColor: 'rgb(187, 0, 37)',
              strokeWidth: 5,
            }
          );

          this.map.geoObjects.add(myGeoObject2[poly]);
        }
      });

      // редактирование границ изменяемой зоны
      if (myGeoObjectEdit) {
        // Создаем многоугольник, используя класс GeoObject.
        this.myGeoObject = new ymaps.Polygon(
          myGeoObjectEdit,
          { geometry: { fillRule: 'nonZero' },
          },
          {
            // Описываем опции геообъекта.
            // Цвет заливки.
            fillColor: '#00FF00',
            // Цвет обводки.
            strokeColor: '#0000FF',
            // Общая прозрачность (как для заливки, так и для обводки).
            opacity: 0.5,
            // Ширина обводки.
            strokeWidth: 5,
            // Стиль обводки.
            strokeStyle: 'shortdash',
          }
        );

        this.map.geoObjects.add(this.myGeoObject);
      }
    }
    // }
  }

  startDrawing() {
    this.setState({
      isDrawing: !this.state.isDrawing,
    });

    if (this.props.mark === 'editZone') {
      this.myGeoObject.editor.startEditing();

      return;
    }

    if (this.props.mark === 'newZone' && this.myGeoObject) {
      this.myGeoObject.editor.startEditing();

      return;
    }

    // Создаем многоугольник, используя класс GeoObject.
    this.myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: 'Polygon',
          coordinates: [],
          fillRule: 'nonZero',
        },
      },
      {
        // Описываем опции геообъекта.
        // Цвет заливки.
        fillColor: '#00FF00',
        // Цвет обводки.
        strokeColor: '#0000FF',
        // Общая прозрачность (как для заливки, так и для обводки).
        opacity: 0.5,
        // Ширина обводки.
        strokeWidth: 5,
        // Стиль обводки.
        strokeStyle: 'shortdash',
      }
    );

    this.map.geoObjects.add(this.myGeoObject);

    this.myGeoObject.editor.startDrawing();
  }

  stopDrawing() {
    this.setState({
      isDrawing: !this.state.isDrawing,
    });

    if (this.props.mark === 'editZone') {
      this.myGeoObject.editor.stopEditing();
    } else if (this.props.mark === 'newZone' && this.myGeoObject) {
      this.myGeoObject.editor.stopEditing();
    } else {
      this.myGeoObject.editor.stopDrawing();
    }
  }

  changePoint(data, event) {
    const item = this.state.item;

    const point = item.points.find((point) => point.id === event.target.value);

    this.getZones(point, this.state.item.other_zone);

    item.zone[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.zone[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.zone[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  save() {
    if (!this.myGeoObject) {
      this.setState({
        confirmDialog: true,
        text: 'Необходимо выделить новую зону на карте!',
      });

      return;
    }
    const item = this.state.item.zone;

    item.new_zone = JSON.stringify(this.myGeoObject.geometry.getCoordinates().flat(1));

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.map = null;
    this.myGeoObject = null;

    this.setState({
      item: null,
      isDrawing: true,
      confirmDialog: false,
      text: '',
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle align="center" sx={{ fontWeight: 'bold' }}>Данные не сохранены!</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>{this.state.text}</DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.onClose.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.props.open}
          onClose={() => this.setState({ confirmDialog: true, text: 'Закрыть без сохранения изменений?'})}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <DialogTitle className="button">
            {this.props.method}{this.props.itemName ? `: ${this.props.itemName}` : null}
            {this.props.fullScreen ? (
              <IconButton onClick={() => this.setState({ confirmDialog: true, text: 'Закрыть без сохранения изменений?' })} style={{ cursor: 'pointer' }}>
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>

              {this.props.mark === 'editZone' ? (
                <Grid item xs={12} sm={12} mb={2}>
                  <Typography align="center" style={{ backgroundColor: '#ef5350', color: '#fff', padding: '10px 15px', fontWeight: 700 }}>
                    Суммы доставки вступят в силу на следующий день
                  </Typography>
                </Grid>
              ) : null}

              <Grid item xs={12} sm={3}>
                <MySelect
                  label="Точка"
                  is_none={false}
                  data={this.state.item ? this.state.item.points : []}
                  value={this.state.item ? this.state.item.zone.point_id : ''}
                  func={this.changePoint.bind(this, 'point_id')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Название зоны"
                  value={this.state.item ? this.state.item.zone.zone_name : ''}
                  func={this.changeItem.bind(this, 'zone_name')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Сумма для клиента"
                  value={this.state.item ? this.state.item.zone.sum_div : ''}
                  func={this.changeItem.bind(this, 'sum_div')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <MyTextInput
                  label="Сумма для курьера"
                  value={this.state.item ? this.state.item.zone.sum_div_driver : ''}
                  func={this.changeItem.bind(this, 'sum_div_driver')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <MyCheckBox
                  label="Бесплатная доставка"
                  value={this.state.item ? parseInt(this.state.item.zone.free_drive) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'free_drive')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.zone.is_active) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_active')}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Button variant="contained" onClick={this.state.isDrawing ? this.startDrawing.bind(this) : this.stopDrawing.bind(this)}>
                  {this.state.isDrawing ? 'Включить область редактирования' : 'Выключить область редактирования'}
                </Button>
              </Grid>

              <Grid item xs={12} sm={12}>
                <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }}/>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class ZoneModules_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'zone_modules',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      zones: [],

      fullScreen: false,

      modalDialog: false,
      method: '',
      mark: '',
      item: null,
      itemName: '',

      itemNew: {
        point_id: '',
        zone_name: '',
        sum_div: 0,
        sum_div_driver: 0,
        free_drive: 0,
        new_zone: [],
      },

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    const zone = {
      city_id: data.cities[0].id,
    };

    const res = await this.getData('get_zones', zone);

    this.setState({
      zones: res.zones,
      cities: data.cities,
      city: data.cities[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == 'redir') {
          window.location.pathname = '/';
          return;
        }

        if (json.st === false && json.type == 'auth') {
          window.location.pathname = '/auth';
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
      });
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

  async changeCity(event) {
    const data = {
      city_id: event.target.value,
    };

    const res = await this.getData('get_zones', data);

    this.setState({
      zones: res.zones,
      city: event.target.value,
    });
  }

  async save(item) {
    let res;

    if (this.state.mark === 'newZone') {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
      };

      res = await this.getData('save_new', data);
    }

    if (this.state.mark === 'editZone') {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
        zone_id: item.id,
        is_active: item.is_active,
      };

      res = await this.getData('save_edit', data);
    }

    if(!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout( () => {
        this.update();
      }, 300)
    }
  }

  async update() {
    const city_id = this.state.city;

    const data = {
      city_id,
    };

    const res = await this.getData('get_zones', data);

    this.setState({
      zones: res.zones,
    });
  }

  async openModal(mark, method, zone_id) {
    this.handleResize();

    const city_id = this.state.city;

    if (mark === 'newZone') {
      const data = {
        city_id,
      };

      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData('get_all_for_new', data);

      item.zone = itemNew;

      item.zone.point_id = item.points[0].id;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === 'editZone') {
      const data = {
        city_id,
        zone_id,
      };

      const item = await this.getData('get_one', data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.zone.zone_name,
      });
    }
  }

  render() {
    return (
      <>
        <Script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" />

        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} />

        <ZoneModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Город"
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModal.bind(this, 'newZone', 'Новая зона')} variant="contained">
              Добавить зону
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '4%' }}>#</TableCell>
                    <TableCell style={{ width: '16%' }}>Точка</TableCell>
                    <TableCell style={{ width: '16%' }}>Зона</TableCell>
                    <TableCell style={{ width: '16%' }} align="center">Сумма для клиента</TableCell>
                    <TableCell style={{ width: '16%' }} align="center">Сумма для курьера</TableCell>
                    <TableCell style={{ width: '16%' }} align="center">Бесплатная доставка</TableCell>
                    <TableCell style={{ width: '16%' }} align="center">Активность</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.zones.map((item, key) => (
                    <TableRow key={key} hover>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.point_name}</TableCell>
                      <TableCell onClick={this.openModal.bind(this, 'editZone', 'Редактирование зоны', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                        {item.zone_name}
                      </TableCell>
                      <TableCell align="center">{item.sum_div}</TableCell>
                      <TableCell align="center">{item.sum_div_driver}</TableCell>
                      <TableCell align="center">{item.free_drive === '0' ? <CloseIcon /> : <CheckIcon />}</TableCell>
                      <TableCell align="center">{item.is_active === '0' ? <CloseIcon /> : <CheckIcon />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function ZoneModules() {
  return <ZoneModules_ />;
}

