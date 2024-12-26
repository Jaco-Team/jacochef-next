import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyAutocomplite, MyTextInput, MySelect, MyCheckBox, MyAlert, formatDate, MyDatePickerNew, MyAutocomplite2} from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';
import dayjs from 'dayjs';

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
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
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

class CafeEdit_Modal_Close extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      confirmDialog: false,
      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  open_confirm() {

    if(this.props.is_сlosed_technic && !this.props.chooseReason){
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать причину технического закрытия кафе',
      })  

      return;
    }

    this.setState ({
      confirmDialog: true
    });
  }

  save() {
    
    this.setState ({
      confirmDialog: false
    });

    this.props.stop_cafe();

    this.props.onClose();
  }

  onClose() {
    setTimeout(() => {
      this.setState ({
        confirmDialog: false,
        openAlert: false,
        err_status: true,
        err_text: '',
      });
    }, 100);

    this.props.onClose();
  }
 
  render() {
    const { open, fullScreen, is_сlosed_overload, changeItemChecked, is_сlosed_technic, show_comment, reason_list, changeReason, chooseReason } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Вы действительное хотите сохранить данные?</Typography>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.save.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={open}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle>
            Причина закрытия кафе
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
            </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
       
              <Grid item xs={12} sm={12}>
                <MyCheckBox 
                  label='Закрыто из-за большого количества заказов' 
                  value={parseInt(is_сlosed_overload) == 1 ? true : false} 
                  func={changeItemChecked.bind(this, 'is_сlosed_overload')} 
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MyCheckBox 
                  label='Закрыто по техническим причинам'          
                  value={parseInt(is_сlosed_technic) == 1 ? true : false}  
                  func={changeItemChecked.bind(this, 'is_сlosed_technic')} 
                />
              </Grid>

              {!show_comment ? null :
                <Grid item xs={12} sm={12} >
                  <MyAutocomplite2 
                    id="cafe_upr_edit" 
                    data={reason_list} 
                    value={chooseReason} 
                    func={changeReason.bind(this)} 
                    onBlur={changeReason.bind(this)}
                    multiple={false} 
                    label='Причина'  
                    freeSolo={true} 
                  />
                </Grid>
              }

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.open_confirm.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class CafeEdit_Modal_Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date_edit: formatDate(new Date()),
    };
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : ''
    });
  }
 
  save(){
    const date_edit = dayjs(this.state.date_edit).format('YYYY-MM-DD');

    this.props.save(date_edit);

    this.onClose();
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        date_edit: formatDate(new Date()),
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen } = this.props;

    return (
      <Dialog 
        open={open}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={'sm'}
      >
        <DialogTitle>
          Укажите дату с которой будут действовать изменения
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <MyDatePickerNew
            label="Дата изменений"
            value={dayjs(this.state.date_edit)}
            func={this.changeDateRange.bind(this, 'date_edit')}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CafeEdit_Modal_Zone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_active: 0,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log('componentDidUpdate', this.props);
    
    if (!this.props.zone) {
      return;
    }

    if (this.props.zone !== prevProps.zone) {
      this.setState({
        is_active: this.props.zone.is_active
      });
    }
  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;

    this.setState({
      [data]: value
    });
  }
 
  save(){
    let zone = this.props.zone;
    const is_active = this.state.is_active;

    zone.is_active = is_active;

    this.props.save(zone);

    this.onClose();
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        isActive: 0,
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, zone } = this.props;

    return (
      <Dialog 
        open={open}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={'sm'}
      >
        <DialogTitle>
          Активность зоны доставки
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
            <CloseIcon />
          </IconButton>
          </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <MyCheckBox 
            label={zone?.zone_name ?? ''} 
            value={parseInt(this.state.is_active) == 1 ? true : false} 
            func={this.changeItemChecked.bind(this, 'is_active')} 
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CafeEdit_Modal_New extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

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
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    if(!item.city_id) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город',
      })
      
      return;
    }

    if(!item.addr) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать адрес',
      })
      
      return;
    }

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,

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
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            Новая точка
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}>
                <MySelect
                  label="Город"
                  is_none={false}
                  data={this.state.item ? this.state.item.cities : []}
                  value={this.state.item ? this.state.item.city_id : ''}
                  func={this.changeItem.bind(this, 'city_id')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Адрес"
                  value={this.state.item ? this.state.item.addr : ''}
                  func={this.changeItem.bind(this, 'addr')}
                />
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

class CafeEdit_ extends React.Component {
  map = null;
  myGeoObject = null;

  constructor(props) {
    super(props);

    this.state = {
      module: 'cafe_edit',
      module_name: '',
      is_load: false,

      points: [],
      point: '',
      cities: [],

      activeTab: 0,

      point_info: null,

      modalDialog: false,
      item: null,

      itemNew: {
        addr: '',
        city_id: ''
      },

      openAlert: false,
      err_status: true,
      err_text: '',

      actual_time_list: [],
      dop_time_list: [],

      zone: [],
      other_zones: [],

      modalDialog_zone: false,
      one_zone: null,

      modalDialog_edit: false,
      mark: '',

      modalDialog_close: false,
      show_comment: false,
      is_сlosed_overload: 0,
      is_сlosed_technic: 0,
      reason_list: [],
      chooseReason: null,

    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');
    console.log("🚀 === componentDidMount data:", data);

    this.setState({
      points: data.points,
      point: data.points[0],
      module_name: data.module_info.name
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getDataPoint();
    }, 100);
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

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api(this.state.module, method, data)
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

  async changePoint(event, value) {
    this.setState({
      point: value,
    });

    setTimeout(() => {
      this.getDataPoint();
    }, 100);
  }

  changeTab(event, value) {
    
    if(value === 4) {
      const zone = this.state.zone;
      const other_zones = this.state.other_zones;

      if(zone.length && other_zones.length) {
        setTimeout(() => {
          this.getZones(zone, other_zones);
        }, 300);
      }

    } else {
      this.map = null;
    }

    this.setState({
      activeTab: value,
    });
  }

  changeData(data, event) {
    const value = event.target.value;
    const point_info = this.state.point_info;

    point_info[data] = value;

    this.setState({
      point_info,
    });
  }

  async getDataPoint() {
    //const point_id = this.state.point.id;
    const city_id = this.state.point.city_id;
    const activeTab = this.state.activeTab;

    const data = {
      point_id: 0,
      city_id
    };

    const res = await this.getData('get_one', data);

    console.log("🚀 === getDataPoint res:", res);

    this.setState({
      cities: res.cities,
      point_info: res.point_info,
      actual_time_list: res.actual_time_list,
      dop_time_list: res.dop_time_list,
      other_zones: res.other_zones,
      zone: res.zone,
      reason_list: res.reason_list
    });

    if(activeTab === 4 && res.zone.length && res.other_zones.length) {
      setTimeout(() => {
        this.getZones(res.zone, res.other_zones);
      }, 300);
    }

  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;
    const point_info = this.state.point_info;

    if(data === 'cafe_handle_close' && !value){
      this.open_close_cafe();
    }
 
    if(data === 'cafe_handle_close' && value){
      // setTimeout(() => {
      //     this.runCafe();
      // }, 250)
    }

    if(data === 'is_сlosed_technic'){

      this.setState({
        show_comment : event.target.checked,
        is_сlosed_overload : 0,
        is_сlosed_technic : value,
        chooseReason: null
      })

    } 
    
    if(data === 'is_сlosed_overload'){

      this.setState({
        show_comment : false,
        is_сlosed_technic : 0,
        is_сlosed_overload: value,
        chooseReason: null
      })
      
    }

    point_info[data] = value;

    this.setState({
      point_info
    });
  }

  changeReason(event, value) {
    const res = event.target.value ? event.target.value : value ? value : '';

    this.setState({
      chooseReason: res
    })
  }

  open_close_cafe() {
    this.handleResize();

    this.setState({
      modalDialog_close: true,
    })  
  }

  close_modal_cafe(){
    
    this.setState({ 
      modalDialog_close: false 
    });

    const chooseReason = this.state.chooseReason;
    const is_сlosed_overload = this.state.is_сlosed_overload ? 1 : 0;
    const is_сlosed_technic = this.state.is_сlosed_technic ? 1 : 0;

    if(!is_сlosed_overload && !is_сlosed_technic && !chooseReason){
      const point_info = this.state.point_info
      point_info.cafe_handle_close = 1;

      this.setState({
        point_info
      })  
    }

    this.setState({
      is_сlosed_overload: 0,
      is_сlosed_technic: 0,
      chooseReason: null,
      show_comment: false
    }) 

  }

  async stop_cafe(){
    const point_id = this.state.point.id;
    const chooseReason = this.state.chooseReason;
    const is_сlosed_overload = this.state.is_сlosed_overload ? 1 : 0;
    const is_сlosed_technic = this.state.is_сlosed_technic ? 1 : 0;
   
    const data = {
      point_id,
      is_сlosed_overload,
      is_сlosed_technic,
      comment: chooseReason
    }
    
    console.log("🚀 === stop_cafe data:", data);
    
  }

  open_new_point() {
    this.handleResize();

    const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));
    const cities = this.state.cities;

    itemNew.cities = cities;

    this.setState({
      modalDialog: true,
      item: itemNew
    });
  }

  open_edit_point(mark) {
    this.handleResize();

    this.setState({
      modalDialog_edit: true,
      mark
    });
  }

  async save_new_point(item) {
    // let data = this.state.point_info;

    // data.point_id = data.id;

    console.log('save_new_point', item);

    // const res = await this.getData('save_edit_point_info', data);

    // console.log("🚀 === res:", res);

    // if (!res.st) {
    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });
    // } else {

    // setTimeout(() => {
    //   this.getDataPoint();
    // }, 300);

    // }
  }

  async save_edit_point_info() {
    let data = this.state.point_info;

    data.point_id = data.id;

    if (!data.city_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;

    } 

    if (!data.addr) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать адрес'
      });

      return;

    } 

    if (!data.raion) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать район'
      });

      return;

    } 

    if (!data.organization) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать организацию'
      });

      return;

    } 

    if (!data.inn) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать ИНН'
      });

      return;

    } 

    if (!data.ogrn) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать ОГРН'
      });

      return;

    } 

    if (!data.kpp || parseInt(data.kpp) === 0) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать КПП'
      });

      return;

    } 

    if (!data.full_addr) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать полный адрес'
      });

      return;

    } 

    const res = await this.getData('save_edit_point_info', data);

    if (!res.st) {

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

      setTimeout(() => {
        this.getDataPoint();
      }, 300);

    }
  }

  async save_edit_point(date) {
    const mark = this.state.mark;

    let data = this.state.point_info;

    data.point_id = data.id;

    data.date_start = date;

    let res;

    if(mark === 'rate') {
      res = await this.getData('save_edit_point_rate', data);
    } else {
      res = await this.getData('save_edit_point_pay', data);
    }

    if (!res.st) {

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

    }
  }

  async save_edit_point_sett() {
    let data = this.state.point_info;

    data.point_id = data.id;

    const res = await this.getData('save_edit_point_sett', data);

    if (!res.st) {
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

      setTimeout(() => {
        this.getDataPoint();
      }, 300);

    }
  }

  async save_active_zone(item) {
  
    console.log('save_edit_point new item', item);
   
    // if (!res.st) {
    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });
    // } else {

    // setTimeout(() => {
    //   this.getDataPoint();
    // }, 300);

    // }

  }

  getZones(points, all_zones) {
    const zone_main = points[0];

    if (!this.map) {
      ymaps.ready(() => {

        this.map = new ymaps.Map(
          'map',
          { center: JSON.parse(zone_main['xy_point']), zoom: 11 },
          { searchControlProvider: 'yandex#search' }
        );

        // зоны доставки точки
        points.map((item) => {
          let points_zone = [];

          points_zone.push(JSON.parse(item['zone']));

          let myGeoObject2 = [];

          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly]],
              {geometry: { fillRule: 'nonZero' }},
              {
                fillOpacity: 0.4,
                fillColor: '#00FF00',
                strokeColor: '#0000FF',
                strokeWidth: 5,
              }
            );

            this.map.geoObjects.add(myGeoObject2[poly]);
          }

        });

        // другие зоны доставки
        all_zones.map((item) => {
          let points_zone = [];

          points_zone.push(JSON.parse(item['zone']));

          let myGeoObject3 = [];

          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject3[poly] = new ymaps.Polygon(
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

            this.map.geoObjects.add(myGeoObject3[poly]);
          }
        });

        this.map.geoObjects.events.add('click', this.openZone.bind(this));
      });

    } else {

      this.map.geoObjects.removeAll();

      this.map.setCenter(JSON.parse(points[0]['xy_point']));

      // зоны доставки точки
      points.map((item) => {
        let points_zone = [];

        points_zone.push(JSON.parse(item['zone']));

        let myGeoObject2 = [];

        for (var poly = 0; poly < points_zone.length; poly++) {
          myGeoObject2[poly] = new ymaps.Polygon(
            [points_zone[poly]],
            { geometry: { fillRule: 'nonZero' } },
            {
              fillColor: '#00FF00',
              strokeColor: '#0000FF',
              fillOpacity: 0.4,
              strokeWidth: 5,
            }
          );

          this.map.geoObjects.add(myGeoObject2[poly]);
        }

      });

      // другие зоны
      all_zones.map((item) => {
        let points_zone = [];

        points_zone.push(JSON.parse(item['zone']));

        let myGeoObject3 = [];

        for (var poly = 0; poly < points_zone.length; poly++) {
          myGeoObject3[poly] = new ymaps.Polygon(
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

          this.map.geoObjects.add(myGeoObject3[poly]);
        }
      });

    }
  }

  openZone(event) {
    this.handleResize();

    const zone = this.state.zone;
    const index = this.map.geoObjects.indexOf(event.get('target'));

    if(zone[index]) {
      this.setState({
        modalDialog_zone: true,
        one_zone: zone[index]
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
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <CafeEdit_Modal_Close
          open={this.state.modalDialog_close}
          onClose={this.close_modal_cafe.bind(this)}
          changeItemChecked={this.changeItemChecked.bind(this)}
          fullScreen={this.state.fullScreen}
          stop_cafe={this.stop_cafe.bind(this)}
          is_сlosed_overload={this.state.is_сlosed_overload}
          is_сlosed_technic={this.state.is_сlosed_technic}
          show_comment={this.state.show_comment}
          reason_list={this.state.reason_list}
          changeReason={this.changeReason.bind(this)}
          chooseReason={this.state.chooseReason}
        />

        <CafeEdit_Modal_New
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, mark: '' })}
          item={this.state.item}
          save={this.save_new_point.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <CafeEdit_Modal_Zone
          open={this.state.modalDialog_zone}
          onClose={() => this.setState({ modalDialog_zone: false, one_zone: null })}
          zone={this.state.one_zone}
          save={this.save_active_zone.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <CafeEdit_Modal_Edit
          open={this.state.modalDialog_edit}
          onClose={() => this.setState({ modalDialog_edit: false })}
          save={this.save_edit_point.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>

          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Точка"
              multiple={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.open_new_point.bind(this)} variant="contained">
              Добавить точку
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingBottom: 24 }}>
            <Paper>
              <Tabs value={this.state.activeTab} onChange={ this.changeTab.bind(this) } centered variant='fullWidth'>
                <Tab label="Информация о точке" {...a11yProps(0)} />
                <Tab label="Коэффициенты" {...a11yProps(1)} />
                <Tab label="Зарплата" {...a11yProps(2)} />
                <Tab label="Настройки" {...a11yProps(3)} />
                <Tab label="Зоны доставки" {...a11yProps(4)} />
              </Tabs>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={0} 
              id='clients'
            >
              <Grid container spacing={3}>

                <Grid item xs={12} sm={3}>
                  <MySelect
                    label="Город"
                    is_none={false}
                    data={this.state.cities}
                    value={this.state.point_info?.city_id ?? ''}
                    func={this.changeData.bind(this, 'city_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Адрес"
                    value={this.state.point_info?.addr ?? ''}
                    func={this.changeData.bind(this, 'addr')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Район"
                    value={this.state.point_info?.raion ?? ''}
                    func={this.changeData.bind(this, 'raion')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Сортировка"
                    value={this.state.point_info?.sort ?? ''}
                    func={this.changeData.bind(this, 'sort')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Организация"
                    value={this.state.point_info?.organization ?? ''}
                    func={this.changeData.bind(this, 'organization')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="ИНН"
                    value={this.state.point_info?.inn ?? ''}
                    func={this.changeData.bind(this, 'inn')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="ОГРН"
                    value={this.state.point_info?.ogrn ?? ''}
                    func={this.changeData.bind(this, 'ogrn')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="КПП"
                    value={this.state.point_info?.kpp ?? ''}
                    func={this.changeData.bind(this, 'kpp')}
                  />
                </Grid>

                <Grid item xs={12} sm={8}>
                  <MyTextInput
                    label="Полный адрес"
                    value={this.state.point_info?.full_addr ?? ''}
                    func={this.changeData.bind(this, 'full_addr')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyCheckBox
                    label="Активность"
                    value={parseInt(this.state.point_info?.is_active ?? 0) == 1 ? true : false}
                    func={this.changeItemChecked.bind(this, 'is_active')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Телефон управляющего"
                    value={this.state.point_info?.phone_upr ?? ''}
                    func={this.changeData.bind(this, 'phone_upr')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Телефон менеджера"
                    value={this.state.point_info?.phone_man ?? ''}
                    func={this.changeData.bind(this, 'phone_man')}
                  />
                </Grid>

                <Grid item xs={12} sm={12} display='grid'>
                  <Button 
                    onClick={this.save_edit_point_info.bind(this)} 
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>
               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={1} 
              id='clients'
            >
              <Grid container spacing={3}>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент количества пиццы в час"
                    value={this.state.point_info?.k_pizza ?? ''}
                    func={this.changeData.bind(this, 'k_pizza')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для пиццы (кух раб)"
                    value={this.state.point_info?.k_pizza_kux ?? ''}
                    func={this.changeData.bind(this, 'k_pizza_kux')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для роллов (кух раб)"
                    value={this.state.point_info?.k_rolls_kux ?? ''}
                    func={this.changeData.bind(this, 'k_rolls_kux')}
                  />
                </Grid>

                <Grid item xs={12} sm={12} display='grid'>
                  <Button 
                    onClick={this.open_edit_point.bind(this, 'rate')} 
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>
               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={2} 
              id='clients'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Оклад директора на 2 недели (с тек. периода)"
                    value={this.state.point_info?.dir_price ?? ''}
                    func={this.changeData.bind(this, 'dir_price')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Бонус от уровня директору (с тек. периода)"
                    value={this.state.point_info?.price_per_lv ?? ''}
                    func={this.changeData.bind(this, 'price_per_lv')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Часовая ставка курьера (применяется со следующего дня)"
                    value={this.state.point_info?.driver_price ?? ''}
                    func={this.changeData.bind(this, 'driver_price')}
                  />
                </Grid>

                <Grid item xs={12} sm={12} display='grid'>
                  <Button 
                    onClick={this.open_edit_point.bind(this, 'pay')}  
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>
               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={3} 
              id='clients'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <MyCheckBox 
                    label='Если в заказе только пицца, она выйдет на сборку после начала ее приготовления (напитки, допы и закуски не учитываются)' 
                    value={parseInt(this.state.point_info?.priority_pizza ?? 0) == 1 ? true : false} 
                    func={this.changeItemChecked.bind(this, 'priority_pizza')} 
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyCheckBox 
                    label='Если заказ приготовить зарнее - он выйдет в приоритете на сборку, кроме предов (напитки, допы и закуски не учитываются)' 
                    value={parseInt(this.state.point_info?.priority_order ?? 0) == 1 ? true : false} 
                    func={this.changeItemChecked.bind(this, 'priority_order')} 
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyCheckBox 
                    label='Пицца у повара будет отображаться, если более 50% роллов в заказе начнут готовить' 
                    value={parseInt(this.state.point_info?.rolls_pizza_dif ?? 0) == 1 ? true : false} 
                    func={this.changeItemChecked.bind(this, 'rolls_pizza_dif')} 
                  />
                </Grid>


                <Grid item xs={12} sm={12}>
                  <MyCheckBox 
                    label='Общий стол' 
                    value={parseInt(this.state.point_info?.cook_common_stol ?? 0) == 1 ? true : false} 
                    func={this.changeItemChecked.bind(this, 'cook_common_stol')} 
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyCheckBox 
                    label='Кафе работает' 
                    value={parseInt(this.state.point_info?.cafe_handle_close ?? 0) == 1 ? true : false} 
                    func={this.changeItemChecked.bind(this, 'cafe_handle_close')} 
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput 
                    value={this.state.point_info?.summ_driver ?? ''} 
                    func={this.changeData.bind(this, 'summ_driver')}
                    label='Максимальная сумма нала для курьера' 
                  />
                </Grid> 

                <Grid item xs={12} sm={4}>
                  <MyTextInput 
                    value={this.state.point_info?.summ_driver_min ?? ''} 
                    func={this.changeData.bind(this, 'summ_driver_min')}
                    label='Максимальная сумма нала для курьера стажера' 
                  />
                </Grid> 

                <Grid item xs={12} sm={12} display='grid'>
                  <Button 
                    onClick={this.save_edit_point_sett.bind(this)}  
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>

                <Grid item xs={12} sm={12} mb={5}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={3}>Актуальное время</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ width:'33%' }}>Зона</TableCell>
                          <TableCell style={{ width:'33%' }}>Промежуток</TableCell>
                          <TableCell style={{ width:'33%' }}>Время доставки</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.actual_time_list.map((item, key) =>
                          <TableRow key={key}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.time_start} - {item.time_end}</TableCell>
                            <TableCell>{item.time_dev} мин.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {!this.state.dop_time_list.length ? null :
                  <Grid item xs={12} sm={12} mb={5}>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>Дополнительное время</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ width:'33%' }}>Зона</TableCell>
                            <TableCell style={{ width:'33%' }}>Промежуток</TableCell>
                            <TableCell style={{ width:'33%' }}>Время доставки</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.dop_time_list.map((item, key) =>
                            <TableRow key={key}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.time_start} - {item.time_end}</TableCell>
                              <TableCell>{item.time_dev} мин.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                }
               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={4} 
              id='clients'
            >
              <Grid item xs={12} sm={12} mb={5}>
                <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }} />
              </Grid>
            </TabPanel>
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function CafeEdit() {
  return <CafeEdit_ />;
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
