import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { MySelect, MyTextInput, MyCheckBox, MyAlert, MyDatePickerNew } from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';
import dayjs from 'dayjs';

class ZoneModules_Modal_History extends React.Component {
  map_2 = null;
  myGeoObject_2 = null;

  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.itemView);

    if (!this.props) {
      return;
    }

    if (this.props.itemView !== prevProps.itemView) {

      this.map_2 = null;
      this.myGeoObject_2 = null;

      if(this.props.zone_data){
        this.getZone(this.props.zone_data);
      } 

      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  getZone(zone_data) {

    if (!this.map_2) {
      ymaps.ready(() => {

        this.map_2 = new ymaps.Map(
          'map_zone',
          { center: JSON.parse(zone_data['xy_point']), zoom: 10 },
          { searchControlProvider: 'yandex#search' }
        );
   
        this.myGeoObject_2 = new ymaps.Polygon(
          [JSON.parse(zone_data.coordinates)],
          { geometry: { fillRule: 'nonZero' }},
          {
            fillOpacity: 0.4,
            fillColor: 'rgb(240, 128, 128)',
            strokeColor: 'rgb(187, 0, 37)',
            strokeWidth: 5,
          }
        );

        this.map_2.geoObjects.add(this.myGeoObject_2);

        if(zone_data.coordinates_old && zone_data.coordinates_old !== 'last') {
          let myGeoObject_3 = new ymaps.Polygon(
            [JSON.parse(zone_data.coordinates_old)],
            { geometry: { fillRule: 'nonZero' } },
            {
              fillColor: '#00FF00',
              strokeColor: '#0000FF',
              opacity: 0.5,
              strokeWidth: 5,
              strokeWidth: 5,
            }
          );
  
          this.map_2.geoObjects.add(myGeoObject_3);
        }

     
      });
    } else {

      this.map_2.geoObjects.removeAll();
 
      this.myGeoObject_2 = new ymaps.Polygon(
        [JSON.parse(zone_data.coordinates)],
        { geometry: { fillRule: 'nonZero' } },
        {
          fillOpacity: 0.4,
          fillColor: 'rgb(240, 128, 128)',
          strokeColor: 'rgb(187, 0, 37)',
          strokeWidth: 5,
        }
      );

      this.map_2.geoObjects.add(this.myGeoObject_2);

      if(zone_data.coordinates_old && zone_data.coordinates_old !== 'last') {

        let myGeoObject_3 = new ymaps.Polygon(
          [JSON.parse(zone_data.coordinates_old)],
          { geometry: { fillRule: 'nonZero' } },
          {
            fillColor: '#00FF00',
            strokeColor: '#0000FF',
            opacity: 0.5,
            strokeWidth: 5,
            strokeWidth: 5,
          }
        );

        this.map_2.geoObjects.add(myGeoObject_3);
      }

    }
  }

  onClose() {
    this.map_2 = null;
    this.myGeoObject_2 = null;

    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {

    const { open, fullScreen, date_edit, zone_data } = this.props

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'md'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: 'center' }}>
            Изменения в {`зоне: ${zone_data?.name ?? ''}`} выделены цветом
          </Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Typography style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                Дата начала изменений: {date_edit}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Точка"
                value={this.state.itemView ? this.state.itemView.point_id?.color ? this.state.itemView.point_id.key : this.state.itemView.point_id : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.point_id?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Название зоны"
                value={this.state.itemView ? this.state.itemView.name?.color ? this.state.itemView.name.key : this.state.itemView.name : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.name?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Сумма для клиента"
                value={this.state.itemView ? this.state.itemView.sum_div?.color ? this.state.itemView.sum_div.key : this.state.itemView.sum_div : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.sum_div?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Сумма для курьера"
                value={this.state.itemView ? this.state.itemView.sum_div_driver?.color ? this.state.itemView.sum_div_driver.key : this.state.itemView.sum_div_driver : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.sum_div_driver?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Бесплатная доставка"
                value={this.state.itemView ? this.state.itemView.free_drive?.color ? this.state.itemView.free_drive.key : this.state.itemView.free_drive : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.free_drive?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Активность"
                value={this.state.itemView ? this.state.itemView.is_active?.color ? this.state.itemView.is_active.key : this.state.itemView.is_active : ''}
                disabled={true}
                className={this.state.itemView ? this.state.itemView.is_active?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
              />
            </Grid>
            {zone_data?.coordinates_old === 'last' ? null :
              <Grid item xs={12} sm={12} mb={2}>
                <Typography align="center" style={{ backgroundColor: '#ef5350', color: '#fff', padding: '10px 15px', fontWeight: 700 }}>
                  {zone_data?.coordinates_old ? 'Красным цветом выделены границы прежней зоны, синим цветом выделены новые границы зоны' : 'Изменений в границах зоны не было'}
                </Typography>
              </Grid>
            }
            <Grid item xs={12} sm={12}>
              <div id="map_zone" name="map_zone" style={{ width: '100%', height: 300, paddingTop: 10 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose.bind(this)} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

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
      zones: [],
      date_start: '',
      date_edit: '',
      dateDialog: false,
      dates: [
        {'id': 0, 'name': 'Применить сразу'},
        {'id': 1, 'name': 'Применить с даты'},
      ],
      openAlert: false,
      err_status: true,
      err_text: '',
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

      if (this.props.mark === 'editZone' || this.props.mark === 'editZone_future') {
        this.getZones(this.props.item.zone, this.props.item.other_zone);
      }

      let zones = JSON.parse(JSON.stringify(this.props.zones));

      if (zones.length) {

        if (this.props.mark === 'editZone') {
          zones = zones.filter(zone => zone.id !== this.props.item.zone.id)
        }

        if (this.props.mark === 'editZone_future') {
          zones = zones.filter(zone => zone.id !== this.props.item.zone.zone_id)
        }

      } else {
        zones = [];
      }

      this.setState({
        item: JSON.parse(JSON.stringify(this.props.item)),
        zones,
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
        if (this.props.mark === 'editZone' || this.props.mark === 'editZone_future') {
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
          properties: { iconContent: this.props.mark === 'newZone' ? point.name : point.point_name },
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
  }

  startDrawing() {

    this.setState({
      isDrawing: !this.state.isDrawing,
    });

    if (this.props.mark === 'editZone' || this.props.mark === 'editZone_future') {
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

    if (this.props.mark === 'editZone' || this.props.mark === 'editZone_future') {
      this.myGeoObject.editor.stopEditing();
    } else if (this.props.mark === 'newZone' && this.myGeoObject) {
      this.myGeoObject.editor.stopEditing();
    } else {
      this.myGeoObject.editor.stopDrawing();
    }
  }

  changePoint(data, event) {
    const item = this.state.item;

    let point = item.points.find((point) => point.id === event.target.value);

    point.point_name = point.name;

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

  changeZonesView(index, id, event) {
    let zones = this.state.zones;
    const target = event.target.checked;
    const item = this.state.item;

    zones[index].is_view = target;

    if(target) {
      const res = this.props.item.other_zone.find(zone => zone.id === id);

      if(res) {
        item.other_zone.push(res);
      }

    } else {
      item.other_zone = item.other_zone.filter(zone => zone.id !== id);
    }

    if (this.props.mark === 'newZone') {
      this.getZones(this.props.item.points[0], item.other_zone);
    }

    if (this.props.mark === 'editZone' || this.props.mark === 'editZone_future') {
      this.getZones(this.props.item.zone, item.other_zone);
    }

    this.setState({
      zones,
      item
    });
  }

  save_variant() {
    const date_edit = this.state.date_edit;

    if(date_edit === '') {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать вариант сохранения данных'
      });

    } else {

      if(date_edit === 1) {

        const date_now = dayjs();
        
        let date_start = this.state.date_start;
    
        if(!date_start){
    
          this.setState({
            openAlert: true,
            err_status: false,
            err_text: 'Указание даты обязательно',
          });
    
          return;
        }
    
        date_start = dayjs(this.state.date_start);
    
        if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){
    
          this.setState({
            openAlert: true,
            err_status: false,
            err_text: 'Сохранение возможно только при указании будущей даты (позже сегодняшней даты)'
          });
    
          return;
        }

      }

      this.setState({
        dateDialog: false,
      });

      setTimeout(() => {
        this.save();
      }, 100);
    }
  }

  changeDateRange(data, event) {
    
    if(event === null){

      if(this.props.mark === 'editZone_future') {

        const item = this.state.item;

        const date_start =  item.zone.date_start;
  
        item.zone[data] = date_start;
  
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: 'Указание даты обязательно',
          item,
        });
  
      } else {

        this.setState({
          date_edit: '',
        });
  
      }

      return;
    }

    const date_now = dayjs();
    let date_start = dayjs(event ? event : '');

    if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Изменение даты возможно только при указании будущей даты (позже сегодняшней даты)'
      });

      return;
    }

    if(this.props.mark === 'editZone_future') {

      const item = this.state.item;

      item.zone[data] = event ? event : '';

      this.setState({
        item,
      });

    } else {

      this.setState({
        [data]: event ? event : ''
      });

    }
   
  }

  changeSelect(event) {
    const value = event.target.value;

    this.setState({
      date_edit: value
    });
  }

  save() {
    if (!this.myGeoObject) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выделить новую зону на карте!'
      });

      return;
    }

    const item = this.state.item.zone;
    
    item.new_zone = JSON.stringify(this.myGeoObject.geometry.getCoordinates().flat(1));

    if (item.new_zone === '[]') {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выделить новую зону на карте!'
      });

      return;
    }

    const date_edit = this.state.date_edit;

    let date_start;

    if(date_edit === 1) {
      date_start = dayjs(this.state.date_start).format('YYYY-MM-DD');
    } else {
      date_start = '';
    }

    this.props.save(item, date_start);

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
      zones: [],
      date_start: '',
      date_edit: '',
      dateDialog: false,
      openAlert: false,
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  render() {

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

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
            <Button onClick={this.onClose.bind(this)}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.dateDialog}
          onClose={() => this.setState({ dateDialog: false, date_edit: '' })}
        >
          <DialogTitle className="button">
            Выбрать вариант сохранения данных
            <IconButton onClick={() => this.setState({ dateDialog: false, date_edit: '' })} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ fontWeight: 'bold' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} mt={2}>
                <MySelect
                  label="Вариант сохранения данных"
                  is_none={false}
                  data={this.state.dates}
                  value={this.state.date_edit}
                  func={this.changeSelect.bind(this)}
                />
              </Grid>
              {!this.state.date_edit ? null :
                <Grid item xs={12} sm={12}>
                  <MyDatePickerNew
                    label="Дата начала изменений"
                    value={dayjs(this.state.date_start)}
                    func={this.changeDateRange.bind(this, 'date_start')}
                  />
                </Grid>
              }
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.save_variant.bind(this)}>Выбрать</Button>
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
            <IconButton onClick={() => this.setState({ confirmDialog: true, text: 'Закрыть без сохранения изменений?' })} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>

              {this.props.mark === 'editZone_future' ? (
                <Grid item xs={12} sm={12}>
                  <MyDatePickerNew
                    label="Дата начала изменений"
                    value={dayjs(this.state.item ? this.state.item.zone.date_start : '')}
                    func={this.changeDateRange.bind(this, 'date_start')}
                  />
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
                <Button 
                  variant="contained" 
                  onClick={this.state.isDrawing ? this.startDrawing.bind(this) : this.stopDrawing.bind(this)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {this.state.isDrawing ? 'Включить область редактирования' : 'Выключить область редактирования'}
                </Button>
              </Grid>

              <Grid item xs={12} sm={12}>
                <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }} >
                  {!this.state.zones.length || this.props.fullScreen ? null :
                    <List className='list_zones'>
                        <div className='list'>
                          {this.state.zones.map((item, key) => (
                            <ListItem key={key} style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <MyCheckBox
                                label={item?.zone_name}
                                value={item?.is_view ?? true}
                                func={this.changeZonesView.bind(this, key, item.id)}
                              />
                            </ListItem>
                          ))}
                        </div>
                    </List>
                  }
                </div>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.props.mark === 'newZone' || this.props.mark === 'editZone_future' ? this.save.bind(this) : () => this.setState({ dateDialog: true })}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class ZoneModules_ extends React.Component {
  map_hist = null;
  myGeoObject_hist = null;

  constructor(props) {
    super(props);

    this.state = {
      module: 'zone_modules',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      zones: [],
      zones_future: [],

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

      zone_id_delete: null,
      text_dialog_delete: '',
      type_delete: '',

      zones_hist: [],

      modalDialogView: false,
      itemView: null,
      date_edit: null,

      modalDialogMap: false,
      zone_data: null,

      points: []
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
      zones_future: res.zones_future,
      cities: data.cities,
      city: data.cities[0].id,
      module_name: data.module_info.name,
      zones_hist: res.all_hist,
      points: res.points
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
      zones_future: res.zones_future,
      zones_hist: res.all_hist,
      points: res.points
    });
  }

  async save(item, date_start) {
    const mark = this.state.mark;

    let res;

    if (mark === 'newZone') {

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

    if (mark === 'editZone') {

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

      if(date_start) {
        data.date_start = date_start;
        res = await this.getData('save_new_future', data);
      } else {
        res = await this.getData('update_zone', data);
      }

    }

    if (mark === 'editZone_future') {

      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
        zone_id: item.id,
        is_active: item.is_active,
        date_start: dayjs(item.date_start).format('YYYY-MM-DD')
      };

      res = await this.getData('update_zone_future', data);
    }

    if(!res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
      
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
      zones_future: res.zones_future,
      zones_hist: res.all_hist,
      points: res.points
    });
  }

  async openModal(mark, method, zone_id, id) {
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

    if (mark === 'editZone_future') {
      const data = {
        city_id,
        zone_id,
        id
      };
     
      const item = await this.getData('get_one_future', data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.zone.zone_name,
      });
    }
  }

  openConfigDialog(zone_id_delete, type_delete) {

    const text_dialog_delete = type_delete === 'zone' ? 'Вы действительно хотите удалить данную зону?' : 'Вы действительно хотите удалить данные изменения?' ;

    this.setState({
      confirmDialog: true,
      zone_id_delete,
      text_dialog_delete,
      type_delete
    });

  }

  async deleteZone() {

    this.setState({ confirmDialog: false })

    const data = {
      zone_id: this.state.zone_id_delete,
    };

    if(this.state.type_delete === 'zone') {
      await this.getData('delete_zone', data);
    } else {
      await this.getData('delete_zone_future', data);
    }
 
    setTimeout( () => {
      this.update();
    }, 300)
  }

  open_hist_zone(id, zone_id) {
    const points = this.state.points;
    const zones = this.state.zones;

    const item = zones.find((zone) => parseInt(zone.id) === parseInt(zone_id))?.all_hist ?? [];
    const index = item.findIndex((zone) => parseInt(zone.id) === parseInt(id));

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.free_drive = parseInt(itemView.free_drive) ? 'Да' : 'Нет';
    itemView.is_active = parseInt(itemView.is_active) ? 'Да' : 'Нет';

    let itemView_old;

    if(parseInt(index) !== 0) {
      
      itemView_old = JSON.parse(JSON.stringify(item[index - 1]));
     
      itemView_old.free_drive = parseInt(itemView_old.free_drive) ? 'Да' : 'Нет';
      itemView_old.is_active = parseInt(itemView_old.is_active) ? 'Да' : 'Нет';
      
      for (let key in itemView) {
        if(itemView[key] !== itemView_old[key]) {

          if(key === 'point_id') {
            const name = points.find((item) => item.id === itemView.point_id)?.name;
            itemView[key] = { key: name, color: 'true' }
          } else {
            itemView[key] = { key: itemView[key], color: 'true' }
          }

        } else {
          if(key === 'point_id') {
            itemView.point_id = points.find((item) => item.id === itemView.point_id)?.name ?? '';
          } 
        }
      }
      
    } else {

      itemView.point_id = points.find((item) => item.id === itemView.point_id)?.name ?? '';
    
    }

    let date_edit;

    if(itemView?.date_start?.key) {
      date_edit = itemView?.date_start?.key;
    } else {
      date_edit = itemView?.date_start ?? '';
    }

    const zone_data = this.map_zone_modal_hist(itemView, itemView_old);

    this.setState({
      modalDialogView: true,
      itemView,
      date_edit,
      zone_data
    });
  }

  map_zone_modal_hist(zone, zone_old) {
    const points = this.state.points;

    let zone_data = {};

    if(zone?.name?.key) {
      zone_data.name = zone?.name?.key;
    } else {
      zone_data.name = zone?.name ?? '';
    }

    if(zone?.zone?.key) {
      zone_data.coordinates = zone?.zone?.key;
    } else {
      zone_data.coordinates = zone?.zone ?? '';
    }

    if(zone?.point_id?.key) {
      zone_data.xy_point = points.find((item) => item.name === zone?.point_id?.key)?.xy_point ?? '';
    } else {
      zone_data.xy_point = points.find((item) => item.name === zone?.point_id)?.xy_point ?? '';
    }

    if(zone_old?.zone) {
      if(zone_data.coordinates !== zone_old.zone) {
        zone_data.coordinates_old = zone_old.zone
      } else {
        zone_data.coordinates_old = '';
      }
    } else {
      zone_data.coordinates_old = 'last';
    }

    return Object.keys(zone_data).length ? zone_data : [];

  }

  openHistZone(id){

    this.map_hist = null;
    this.myGeoObject_hist = null;
    
    const zones = this.state.zones;

    zones.forEach(zone => {
      if(parseInt(zone.id) === parseInt(id)) {
        zone.is_open = !zone.is_open;

        if(zone.is_open) {
          zone.hist.forEach((z) => {
  
            let zone_data = {
              coordinates: z.zone,
              xy_point: z.xy_point
            };
  
            this.getZone_hist(zone_data, `map_hist_${z.date_time_update}`);
          })
        }
       
      } else {
        zone.is_open = false;
      }

    });

    this.setState({
      zones,
    });
    
  } 

  getZone_hist(zone_data, mapId) {
    if (!this.map_hist) {
      ymaps.ready(() => {

        this.map_hist = new ymaps.Map(
          mapId,
          { center: JSON.parse(zone_data['xy_point']), zoom: 10 },
          { searchControlProvider: 'yandex#search' }
        );
   
        this.myGeoObject_hist = new ymaps.Polygon(
          [JSON.parse(zone_data.coordinates)],
          { geometry: { fillRule: 'nonZero' }},
          {
            fillOpacity: 0.4,
            fillColor: 'rgb(240, 128, 128)',
            strokeColor: 'rgb(187, 0, 37)',
            strokeWidth: 5,
          }
        );

        this.map_hist.geoObjects.add(this.myGeoObject_hist);
     
      });

    } else {

      this.map_hist.geoObjects.removeAll();
 
      this.myGeoObject_hist = new ymaps.Polygon(
        [JSON.parse(zone_data.coordinates)],
        { geometry: { fillRule: 'nonZero' } },
        {
          fillOpacity: 0.4,
          fillColor: 'rgb(240, 128, 128)',
          strokeColor: 'rgb(187, 0, 37)',
          strokeWidth: 5,
        }
      );

      this.map_hist.geoObjects.add(this.myGeoObject_hist);

    }
  }

  render() {
    return (
      <>
        <Script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" />

        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false, zone_id_delete: null, text_dialog_delete: '' })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>{this.state.text_dialog_delete}</Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false, zone_id_delete: null, text_dialog_delete: '' })}>Отмена</Button>
            <Button onClick={this.deleteZone.bind(this)}>Удалить</Button>
          </DialogActions>
        </Dialog>

        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} 
        />

        <ZoneModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
          zones={this.state.zones}
        />

        <ZoneModules_Modal_History
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null, date_edit: null })}
          itemView={this.state.itemView}
          fullScreen={this.state.fullScreen}
          date_edit={this.state.date_edit}
          zone_data={this.state.zone_data}
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

          <Grid item xs={12} sm={12} mb={this.state.zones_future.length ? 2 : 10}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={10} style={{ fontWeight: 700 }}>Текущие данные</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ width: '4%' }}>#</TableCell>
                    <TableCell style={{ width: '4%' }}></TableCell>
                    <TableCell style={{ width: '12%' }}>Точка</TableCell>
                    <TableCell style={{ width: '12%' }}>Зона</TableCell>
                    <TableCell style={{ width: '12%' }}>Сортировка</TableCell>
                    <TableCell style={{ width: '12%' }} align="center">Сумма для клиента</TableCell>
                    <TableCell style={{ width: '12%' }} align="center">Сумма для курьера</TableCell>
                    <TableCell style={{ width: '10%' }} align="center">Бесплатная доставка</TableCell>
                    <TableCell style={{ width: '10%' }} align="center">Активность</TableCell>
                    <TableCell style={{ width: '12%' }} align="center">Удалить</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.zones.map((item, key) => (
                    <React.Fragment key={key}>
                      <TableRow hover>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell 
                          onClick={item.hist.length ? this.openHistZone.bind(this, item.id) : null} 
                          style={{ cursor: item.hist.length ? 'pointer' : 'unset' }}
                        >
                          {!item.hist.length ? null :
                            <Tooltip title={<Typography color="inherit">История последних изменений</Typography>}> 
                              <ExpandMoreIcon 
                                style={{ display: 'flex', transform: item.is_open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              />
                            </Tooltip>
                          }
                        </TableCell>
                        <TableCell>{item.point_name}</TableCell>
                        <TableCell onClick={this.openModal.bind(this, 'editZone', 'Редактирование зоны', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                          {item.zone_name}
                        </TableCell>
                        <TableCell align="center">{item.point_id}</TableCell>
                        <TableCell align="center">{item.sum_div}</TableCell>
                        <TableCell align="center">{item.sum_div_driver}</TableCell>
                        <TableCell align="center">{parseInt(item.free_drive) === 0 ? <CloseIcon /> : <CheckIcon />}</TableCell>
                        <TableCell align="center">{parseInt(item.is_active) === 0 ? <CloseIcon /> : <CheckIcon />}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={this.openConfigDialog.bind(this, item.id, 'zone')}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ padding: 0 }} colSpan={10}>
                          <Collapse in={item.is_open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: '8px 0' }}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{ width: '4%' }}>#</TableCell>
                                    <TableCell style={{ width: '4%' }}></TableCell>
                                    <TableCell>Зона</TableCell>
                                    <TableCell>Сумма для клиента</TableCell>
                                    <TableCell>Сумма для курьера</TableCell>
                                    <TableCell style={{ width: '45%' }}>Границы зоны</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {item.hist.map((it, k) => 
                                    <TableRow key={k}>
                                      <TableCell style={{ verticalAlign: 'top' }}>{k + 1}</TableCell>
                                      <TableCell style={{ verticalAlign: 'top' }}></TableCell>
                                      <TableCell style={{ verticalAlign: 'top' }}>{it.name}</TableCell>
                                      <TableCell style={{ verticalAlign: 'top' }}>{it.sum_div}</TableCell>
                                      <TableCell style={{ verticalAlign: 'top' }}>{it.sum_div_driver}</TableCell>
                                      <TableCell>
                                        <div id={`map_hist_${it.date_time_update}`} name={`map_hist_${it.date_time_update}`} style={{ width: '100%', height: 250 }} />
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {!this.state.zones_future.length ? null :
            <Grid item xs={12} sm={12} mb={5}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={9} style={{ fontWeight: 700 }}>Будущие изменения</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ width: '4%' }}>#</TableCell>
                      <TableCell style={{ width: '12%' }}>Точка</TableCell>
                      <TableCell style={{ width: '12%' }}>Зона</TableCell>
                      <TableCell style={{ width: '12%' }}>Сортировка</TableCell>
                      <TableCell style={{ width: '12%' }} align="center">Сумма для клиента</TableCell>
                      <TableCell style={{ width: '12%' }} align="center">Сумма для курьера</TableCell>
                      <TableCell style={{ width: '12%' }} align="center">Бесплатная доставка</TableCell>
                      <TableCell style={{ width: '12%' }} align="center">Активность</TableCell>
                      <TableCell style={{ width: '12%' }} align="center">Удалить</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.zones_future.map((item, key) => (
                      <TableRow key={key} hover>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell>{item.point_name}</TableCell>
                        <TableCell onClick={this.openModal.bind(this, 'editZone_future', 'Редактирование зоны', item.id, item.zone_id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                          {item.zone_name}
                        </TableCell>
                        <TableCell align="center">{item.point_id}</TableCell>
                        <TableCell align="center">{item.sum_div}</TableCell>
                        <TableCell align="center">{item.sum_div_driver}</TableCell>
                        <TableCell align="center">{parseInt(item.free_drive) === 0 ? <CloseIcon /> : <CheckIcon />}</TableCell>
                        <TableCell align="center">{parseInt(item.is_active) === 0 ? <CloseIcon /> : <CheckIcon />}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={this.openConfigDialog.bind(this, item.id, 'future')}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          }
          
          {!this.state.zones_hist.length ? null :
            <Grid item xs={12} sm={12} mb={5}>
              <Accordion style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography style={{ fontWeight: 'bold' }}>История изменений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Зона</TableCell>
                        <TableCell>Дата / время</TableCell>
                        <TableCell>Сотрудник</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.zones_hist.map((it, k) =>
                        <TableRow 
                          hover 
                          key={k} 
                          style={{ cursor: 'pointer'}}
                          onClick={this.open_hist_zone.bind(this, it.id, it.zone_id)}
                        >
                          <TableCell>{k+1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.date_time_update}</TableCell>
                          <TableCell>{it.user_name}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          }

        </Grid>
      </>
    );
  }
}

export default function ZoneModules() {
  return <ZoneModules_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  }
}
