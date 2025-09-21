import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  MyAutocomplite,
  MyTextInput,
  MySelect,
  MyCheckBox,
  MyAlert,
} from "@/ui/elements";

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import {api_laravel} from "@/src/api_new";
import dayjs from 'dayjs';
import handleUserAccess from '@/src/helpers/access/handleUserAccess';
import CafeEdit_Modal_Kkt_Info_Add from '@/components/cafe_edit/CafeEdit_Modal_Kkt_Info_Add';
import CafeEdit_Modal_Kkt_Info from '@/components/cafe_edit/CafeEdit_Modal_Kkt_Info';
import CafeEdit_Modal_Close_Cafe from '@/components/cafe_edit/CafeEdit_Modal_Close_Cafe';
import CafeEdit_Modal_History from '@/components/cafe_edit/CafeEdit_Modal_History';
import CafeEdit_Modal_Edit from '@/components/cafe_edit/CafeEdit_Modal_Edit';
import CafeEdit_Modal_New from '@/components/cafe_edit/CafeEdit_Modal_New';
import CafeEdit_Modal_Zone from '@/components/cafe_edit/CafeEdit_Modal_Zone';
import TabPanel from '@/components/shared/TabPanel/TabPanel';
import a11yProps from '@/components/shared/TabPanel/a11yProps';
import CafeEdit_ZonesMap from '@/components/cafe_edit/CafeEdit_ZonesMap';
import deepEqual from '@/src/helpers/utils/deepEqual';

class CafeEdit_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'cafe_edit',
      module_name: '',
      is_load: false,

      acces: null,

      fullScreen: false,

      points: [],
      point: '',
      cities: [],

      activeTab: 0,

      point_info: null,
      point_info_copy: null,

      modalDialog: false,
      item: null,

      itemNew: {
        addr: '',
        city_id: ''
      },

      openAlert: false,
      err_status: true,
      err_text: '',

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

      point_info_hist: [],
      point_rate_hist: [],
      point_pay_hist: [],
      point_sett_hist: [],
      point_zone_hist: [],
      point_sett_driver_hist: [],
      kkt_info_hist: [],

      modalDialogView: false,
      itemView: null,
      type_modal: null,
      date_edit: null,

      index_info: -1,
      index_rate: -1,
      index_pay: -1,
      index_sett: -1,
      index_zone: -1,
      index_driver: -1,
      index_kkt: -1,
      tabs_data: [],

      upr_list: [],

      confirmDialog: false,
      nextTab: null,

      kkt_info_active: [],
      kkt_info_none_active: [],

      modalDialog_kkt: false,
      kkt_update: null,
      pointModal: '',

      modalDialog_kkt_add: false,

    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      acces: data.acces,
      points: data.points,
      point: data.points[0],
      module_name: data.module_info.name
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getTabIndex();
    }, 100);

    setTimeout(async () => {
      await this.getDataPoint();
    }, 200);

  }

  handleResize() {
    this.setState({
      fullScreen: window.innerWidth < 601,
    });
  }

  async getData(method, data = {}) {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .catch(e => {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: e.message
        })
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

  async changePoint(_, value) {
    this.setState({
      point: value,
    });

    setTimeout(async () => {
      await this.getDataPoint();
    }, 100);
  }

  async changeTab(_, value) {

    const { point_info, point_info_copy } = this.state;

    const hasChanges = !deepEqual(point_info, point_info_copy);

    if (hasChanges) {

      this.setState({
        confirmDialog: true,
        nextTab: value,
      });

      return;

    }

    this.setState({ is_load: true });

    // const index_zone = this.state.index_zone;
    // if(value === index_zone) {
    //   const zone = this.state.zone;
    //   const other_zones = this.state.other_zones;

    //   if(zone.length && other_zones.length) {
    //     setTimeout(() => {
    //       this.getZones(zone, other_zones);
    //     }, 300);
    //   } else {
    //     setTimeout(() => {
    //       this.map?.geoObjects?.removeAll();
    //     }, 300);
    //   }

    // } else {
    //   this.map = null;
    // }

    this.setState({
      activeTab: value,
    });

    await this.getDataPoint();
  }

  async confirmTabChange() {

    this.setState({ is_load: true });

    this.setState({
      activeTab: this.state.nextTab,
      confirmDialog: false,
      nextTab: null,
    });

    await this.getDataPoint();

  }

  changeData(data, event) {
    const value = event.target.value;
    const point_info = this.state.point_info;

    point_info[data] = value;

    this.setState({
      point_info,
    });
  }

  getTabIndex() {
    const acces = this.state.acces;

    let tabs_data = [];

    console.log( acces )

    //for (let key in acces) {
      //if(!this.canView(key)) { continue; }

      //console.log(acces, key)

      if( this.checkAccess('active_point') || this.checkAccess('organization_point') || this.checkAccess('telephone_point') ){

        const infoName = "Информация о точке";
        const info = tabs_data.find(item => item.name === infoName);

        if(!info) {
          tabs_data.push({key: 'active_point', name: infoName});
        }

      }

      if( this.checkAccess('rate_point')) {
        tabs_data.push({key: 'rate_point', name: "Коэффициенты"});
      }

      if(this.checkAccess('pay_point')) {
        tabs_data.push({key: 'pay_point', name: "Зарплата"});
      }

      if(this.checkAccess('settings_point')) {
        tabs_data.push({key: 'settings_point', name: "Настройки точки"});
      }

      if(this.checkAccess('zone_point')) {
        tabs_data.push({key: 'zone_point_access', name: "Зоны доставки"});
      }

      if(this.checkAccess('settings_driver')) {
        tabs_data.push({key: 'settings_driver', name: "Настройки курьеров"});
      }

      if(this.checkAccess('kkt_info')) {
        tabs_data.push({key: 'kkt_info', name: "Информация о кассах"});
      }
    //}

    tabs_data.forEach((item, index) => {

      if(item.key === 'active_point' || item.key === 'organization_point' || item.key === 'telephone_point') {
        this.setState({
          index_info: index
        });
      }

      if(item.key === 'rate_point') {
        this.setState({
          index_rate: index
        });
      }

      if(item.key === 'pay_point') {
        this.setState({
          index_pay: index
        });
      }

      if(item.key === 'settings_point') {
        this.setState({
          index_sett: index
        });
      }

      if(item.key === 'zone_point') {
        this.setState({
          index_zone: index
        });
      }

      if(item.key === 'settings_driver') {
        this.setState({
          index_driver: index
        });
      }

      if(item.key === 'kkt_info') {
        this.setState({
          index_kkt: index
        });
      }

    });

    this.setState({
      tabs_data
    });

  }

  async getDataPoint() {
    const point_id = this.state.point.id;
    const city_id = this.state.point.city_id;

    const data = {
      point_id,
      city_id
    };

    let res = await this.getData('get_one', data);

    res.point_info.manager_id = {id: res.point_info.manager_id, name: res.point_info.manager_name};
    const upr = res.upr_list.find(upr => parseInt(upr.id) === parseInt(res.point_info?.manager_id?.id));
    if(!upr) res.upr_list.push(res.point_info?.manager_id);

    const today = dayjs();

    const kkt_info_active = res.kkt_info_active.map(item => {
      const newItem = { ...item };

      if (item.date_end) {
        const diffEnd = dayjs(item.date_end).diff(today, 'day');
        newItem.days_left_end = diffEnd <= 0 ? '!' : diffEnd;
      }

      if (item.date_license) {
        const diffLic = dayjs(item.date_license).diff(today, 'day');
        newItem.days_left_license = diffLic <= 0 ? '!' : diffLic;
      }

      return newItem;
    });

    this.setState({
      upr_list: res.upr_list,
      cities: res.cities,
      point_info: res.point_info,
      point_info_copy: JSON.parse(JSON.stringify(res.point_info)),
      other_zones: res.other_zones,
      zone: res.zone,
      reason_list: res.reason_list,
      point_info_hist: res.point_info_hist,
      point_rate_hist: res.point_rate_hist,
      point_pay_hist: res.point_pay_hist,
      point_sett_hist: res.point_sett_hist,
      point_zone_hist: res.point_zone_hist,
      point_sett_driver_hist: res.point_sett_driver_hist,
      kkt_info_active,
      kkt_info_none_active: res.kkt_info_none_active,
      kkt_info_hist: res.kkt_info_hist,
    });

    // if(res.zone.length && res.other_zones.length) {
    //   setTimeout(() => {
    //     this.getZones(res.zone, res.other_zones);
    //   }, 300);
    // } else {
    //   setTimeout(() => {
    //     this.map?.geoObjects?.removeAll();
    //   }, 300);
    // }

  }

  changeActivePoint() {

    const point_info = this.state.point_info;

    const value = parseInt(point_info.cafe_handle_close) === 1 ? 0 : 1;

    if(value) {
      setTimeout(() => {
        this.save_edit_point_sett();
      }, 300)
    } else {
      this.open_close_cafe();
    }

    point_info.cafe_handle_close = value;

    this.setState({
      point_info
    });
  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;
    const point_info = this.state.point_info;

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
      point_info,
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
    const is_сlosed_overload = this.state.is_сlosed_overload;
    const is_сlosed_technic = this.state.is_сlosed_technic;

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
    const point_info = this.state.point_info;

    const data = {
      point_id,
      is_сlosed_overload,
      is_сlosed_technic,
      comment: chooseReason,
      point_info
    }

    const res = await this.getData('stop_cafe', data);

    if (!res?.st) {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    }

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

    const data = {
      addr: item.addr,
      city_id: item.city_id
    }

    const res = await this.getData('save_new_point', data);

    if (!res?.st) {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    }
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

    if (!res?.st) {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
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

    if (!res?.st) {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    }
  }

  async save_edit_point_sett_driver() {

    let data = this.state.point_info;

    data.point_id = data.id;

    const res = await this.getData('save_edit_point_sett_driver', data);

    if (!res?.st) {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);
    }
  }

  async save_edit_point_sett() {
    let data = this.state.point_info;

    data.point_id = data.id;

    const res = await this.getData('save_edit_point_sett', data);

    if (!res?.st) {
      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });
    } else {

      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    }
  }

  async save_active_zone() {
    const zone_list = this.state.zone;
    const point_id = this.state.point.id;

    const data = {
      zone_list,
      point_id
    };

    const res = await this.getData('stop_zone', data);

    if (res?.st) {
      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);
    }

  }

  openZone(index) {
    this.handleResize();
    if(!this.canEdit('zone_point')) return;
    const zone = this.state.zone;
    if(zone[index]) {
      this.setState({
        modalDialog_zone: true,
        one_zone: zone[index]
      });
    }
  }

  open_hist_view(index, type_modal) {

    let item;

    if(type_modal === 'info') {
      item = this.state.point_info_hist;
    }

    if(type_modal === 'rate') {
      item = this.state.point_rate_hist;
    }

    if(type_modal === 'pay') {
      item = this.state.point_pay_hist;
    }

    if(type_modal === 'sett') {
      item = this.state.point_sett_hist;
    }

    if(type_modal === 'driver') {
      item = this.state.point_sett_driver_hist;
    }

    let itemView = JSON.parse(JSON.stringify(item[index]));

    if(type_modal === 'info') {
      itemView.is_active = parseInt(itemView.is_active) ? 'Активна' : 'Не активна';
    }

    if(type_modal === 'sett') {
      itemView.priority_pizza = parseInt(itemView.priority_pizza) ? 'Да' : 'Нет';
      itemView.priority_order = parseInt(itemView.priority_order) ? 'Да' : 'Нет';
      itemView.rolls_pizza_dif = parseInt(itemView.rolls_pizza_dif) ? 'Да' : 'Нет';
      itemView.cook_common_stol = parseInt(itemView.cook_common_stol) ? 'Да' : 'Нет';
      itemView.cafe_handle_close = parseInt(itemView.cafe_handle_close) === 1 ? 'Работает' : 'На стопе';
    }

    if(parseInt(index) !== 0) {

      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));

      if(type_modal === 'info') {
        itemView_old.is_active = parseInt(itemView_old.is_active) ? 'Активна' : 'Не активна';
      }

      if(type_modal === 'sett') {
        itemView_old.priority_pizza = parseInt(itemView_old.priority_pizza) ? 'Да' : 'Нет';
        itemView_old.priority_order = parseInt(itemView_old.priority_order) ? 'Да' : 'Нет';
        itemView_old.rolls_pizza_dif = parseInt(itemView_old.rolls_pizza_dif) ? 'Да' : 'Нет';
        itemView_old.cook_common_stol = parseInt(itemView_old.cook_common_stol) ? 'Да' : 'Нет';
        itemView_old.cafe_handle_close = parseInt(itemView_old.cafe_handle_close) === 1 ? 'Работает' : 'На стопе';
      }

      for (let key in itemView) {
        if(itemView[key] !== itemView_old[key]) {

          if(key === 'city_id') {
            const name = this.state.cities.find((item) => item.id === itemView.city_id)?.name;
            itemView[key] = { key: name, color: 'true' }
          } else if (key === 'manager_id') {
            const name = itemView.manager_name ?? '';
            itemView[key] = { key: name, color: 'true' }
          } else {
            itemView[key] = { key: itemView[key], color: 'true' }
          }

        } else {

          if(key === 'city_id') {
            itemView.city_id = this.state.cities.find((item) => item.id === itemView.city_id)?.name ?? '';
          }

          if(key === 'manager_id') {
            itemView.manager_id = itemView.manager_name ?? '';
          }

        }

      }

    } else {

      itemView.city_id = this.state.cities.find((item) => item.id === itemView.city_id)?.name ?? '';

      itemView.manager_id = itemView.manager_name ?? '';
    }

    let date_edit = null;

    if(type_modal === 'rate' || type_modal === 'pay') {
      if(itemView?.date_start?.key) {
        date_edit = itemView?.date_start?.key;
      } else {
        date_edit = itemView?.date_start ?? null;
      }
    }

    this.setState({
      modalDialogView: true,
      itemView,
      type_modal,
      date_edit
    });
  }

  open_hist_kkt(id, kkt_id, type_modal) {
    const kkt_info_hist = this.state.kkt_info_hist;

    const kkt_list = kkt_info_hist.filter((kkt) => parseInt(kkt.kkt_id) === parseInt(kkt_id)).sort((a, b) => new Date(b.date_time_update) - new Date(a.date_time_update));

    const index = kkt_list.findIndex((kkt) => parseInt(kkt.id) === parseInt(id));

    let itemView = { ...kkt_list[index] };

    itemView.is_active = parseInt(itemView.is_active) ? 'Да' : 'Нет';

    let itemView_old = null;

    if (index > 0) {
      itemView_old = { ...kkt_list[index - 1] };
      itemView_old.is_active = parseInt(itemView_old.is_active) ? 'Да' : 'Нет';

      Object.keys(itemView).forEach((key) => {
        if (itemView[key] !== itemView_old[key]) {
          itemView[key] = { key: itemView[key], color: "true" };
        }
      });
    }

    this.setState({
      modalDialogView: true,
      itemView,
      type_modal,
    });
  }

  open_hist_view_zone(index, type_modal) {

    const item = this.state.point_zone_hist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.is_active = parseInt(itemView.is_active) ? 'включена' : 'отключена';

    this.setState({
      modalDialogView: true,
      itemView,
      type_modal
    });

  }

  changeUpr(data, _, value) {
    const point_info = this.state.point_info;

    point_info[data] = value;

    this.setState({
      point_info,
    });
  }

  openModalKktInfo(type_modal, kkt) {
    this.handleResize();

    const {points, point, kkt_info_active} = this.state;

    const pointModal = points.find((it) => parseInt(it.id) === parseInt(point.id)).name;

    let all_fn = [{id: 0, name: 'Добавить новый ФН'}];

    kkt_info_active.forEach((item) => {

      if( item.rn_kkt == kkt.rn_kkt ){

        const dateStart = item.date_start.split('-').reverse().join('-');
        const dateEnd = item.date_end.split('-').reverse().join('-');
        const name = `${item.fn} ( с ${dateStart} по ${dateEnd} )`;

        all_fn.push({id: item.fn, name, date_start: dayjs(item.date_start).format('YYYY-MM-DD'), date_end: dayjs(item.date_end).format('YYYY-MM-DD')});
      }
    });

    kkt.all_fn = all_fn;

    this.setState({
      type_modal,
      pointModal,
      modalDialog_kkt: true,
      kkt_update: kkt
    });

  }

  openModalKktInfo_add(kkt) {
    this.handleResize();

    this.setState({
      modalDialog_kkt_add: true,
      kkt_update: kkt
    });

  }

  async add_new_fn(new_fn, start, end) {
    const kkt = this.state.kkt_update;

    const date_start = dayjs(start).format('YYYY-MM-DD');
    const date_end = dayjs(end).format('YYYY-MM-DD')

    const data = {
      date_start,
      date_end,
      fn: new_fn,
      rn_kkt: kkt.rn_kkt,
      kassa: kkt.kassa,
      dop_kassa: kkt.dop_kassa,
      base: kkt.base,
      is_active: kkt.is_active,
      date_license: kkt.date_license,
      point_id: this.state.point?.id,
    };

    const res = await this.getData('save_new_kkt', data);

    if (res?.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res?.text,
      });
    }

  }

  async save_kkt(data) {
    const type_modal = this.state.type_modal;

    data.point_id = this.state.point?.id;

    let res;

    if(type_modal === 'add_kkt') {
      res = await this.getData('save_new_kkt', data);
    } else {
      const kkt = this.state.kkt_update;
      data.id = kkt.id;
      res = await this.getData('save_edit_kkt', data);
    }

    if (res?.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: res?.text,
      });

      setTimeout(async () => {
        await this.getDataPoint();
      }, 300);

    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res?.text,
      });
    }
  }

  canView(key) {
    const {userCan} = handleUserAccess(this.state.acces);
    return userCan('view', key);
  }

  canEdit(key) {
    const {userCan} = handleUserAccess(this.state.acces);
    return userCan('edit', key);
  }

  checkAccess(key) {
    const access = this.state.acces;

    if( parseInt(access[key+'_access']) == 1 || parseInt(access[key+'_view']) == 1 || parseInt(access[key+'_edit']) == 1 ){
      return true;
    }

    return false;
  }

  checkAccessEdit(key) {
    const access = this.state.acces;

    if( parseInt(access[key+'_access']) == 1 || parseInt(access[key+'_edit']) == 1 ){
      return true;
    }

    return false;
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 999 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
          maxWidth="sm"
        >
        <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Есть несохраненные изменения. Перейти на другую вкладку?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.confirmTabChange.bind(this)}>Перейти</Button>
          </DialogActions>
        </Dialog>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <CafeEdit_Modal_Kkt_Info
          type={this.state.type_modal}
          open={this.state.modalDialog_kkt}
          pointModal={this.state.pointModal}
          kkt={this.state.kkt_update}
          onClose={() => this.setState({ modalDialog_kkt: false })}
          fullScreen={this.state.fullScreen}
          save_kkt={this.save_kkt.bind(this)}
          acces={this.state.acces}
          canView={this.canView.bind(this)}
          canEdit={this.canEdit.bind(this)}
        />

        <CafeEdit_Modal_Kkt_Info_Add
          open={this.state.modalDialog_kkt_add}
          onClose={() => this.setState({ modalDialog_kkt_add: false })}
          fullScreen={this.state.fullScreen}
          addFN={this.add_new_fn.bind(this)}
        />

        <CafeEdit_Modal_Close_Cafe
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

        <CafeEdit_Modal_History
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null, type_modal: null, date_edit: null })}
          itemView={this.state.itemView}
          fullScreen={this.state.fullScreen}
          type_modal={this.state.type_modal}
          date_edit={this.state.date_edit}
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
              disableCloseOnSelect={false}
            />
          </Grid>

          {this.canEdit('organization_point') &&
            <Grid item xs={12} sm={4}>
              <Button onClick={this.open_new_point.bind(this)} variant="contained">
                Добавить точку
              </Button>
            </Grid>
          }

          <Grid item xs={12} sm={12} style={{ paddingBottom: 24 }}>
            <Paper>
              <Tabs
                value={this.state.activeTab}
                onChange={ this.changeTab.bind(this)}
                variant='scrollable'
                scrollButtons={false}
              >
                {this.state.tabs_data?.map((item, index) => {
                  return <Tab label={item.name} {...a11yProps(index)} key={index} sx={{ minWidth: "fit-content", flex: 1 }} />
                })}
              </Tabs>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_info}
              id='info'
            >
              <Grid container spacing={3}>

                {this.checkAccessEdit.bind(this, 'organization_point') && (
                  <>
                    <Grid item xs={12} sm={3}>
                      <MySelect
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Город"
                        is_none={false}
                        data={this.state.cities}
                        value={this.state.point_info?.city_id ?? ''}
                        func={this.changeData.bind(this, 'city_id')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Адрес"
                        value={this.state.point_info?.addr ?? ''}
                        func={this.changeData.bind(this, 'addr')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Район"
                        value={this.state.point_info?.raion ?? ''}
                        func={this.changeData.bind(this, 'raion')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Сортировка ( порядок точек во всех модулях и на сайте )"
                        value={this.state.point_info?.sort ?? ''}
                        func={this.changeData.bind(this, 'sort')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Организация"
                        value={this.state.point_info?.organization ?? ''}
                        func={this.changeData.bind(this, 'organization')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="ИНН"
                        value={this.state.point_info?.inn ?? ''}
                        func={this.changeData.bind(this, 'inn')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="ОГРН"
                        value={this.state.point_info?.ogrn ?? ''}
                        func={this.changeData.bind(this, 'ogrn')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="КПП"
                        value={this.state.point_info?.kpp ?? ''}
                        func={this.changeData.bind(this, 'kpp')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'organization_point')}
                        label="Полный адрес"
                        value={this.state.point_info?.full_addr ?? ''}
                        func={this.changeData.bind(this, 'full_addr')}
                      />
                    </Grid>
                  </>
                )}

                {this.checkAccessEdit.bind(this, 'active_point') && (
                  <Grid item xs={12} sm={12}>
                    <MyCheckBox
                      label="Активность"
                      disabled={!this.checkAccessEdit.bind(this, 'active_point')}
                      value={parseInt(this.state.point_info?.is_active ?? 0) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, 'is_active')}
                    />
                  </Grid>
                )}

                {this.checkAccessEdit.bind(this, 'telephone_point') && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'telephone_point')}
                        label="Телефон управляющего"
                        value={this.state.point_info?.phone_upr ?? ''}
                        func={this.changeData.bind(this, 'phone_upr')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'telephone_point')}
                        label="Почта управляющего"
                        value={this.state.point_info?.mail ?? ''}
                        func={this.changeData.bind(this, 'mail')}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <MyTextInput
                        disabled={!this.checkAccessEdit.bind(this, 'telephone_point')}
                        label="Телефон менеджера"
                        value={this.state.point_info?.phone_man ?? ''}
                        func={this.changeData.bind(this, 'phone_man')}
                      />
                    </Grid>
                  </>
                )}

                {(this.checkAccessEdit.bind(this, 'telephone_point') || this.checkAccessEdit.bind(this, 'active_point') || this.checkAccessEdit.bind(this, 'organization_point')) && (
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
                )}

                {(this.checkAccessEdit.bind(this, 'telephone_point') || this.checkAccessEdit.bind(this, 'active_point') || this.checkAccessEdit.bind(this, 'organization_point')) && this.state.point_info_hist.length > 0 && (
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
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.point_info_hist.map((it, k) =>
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_view.bind(this, k, 'info')}
                              >
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.date_time_update}</TableCell>
                                <TableCell>{it.user_name}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_rate}
              id='rate'
            >
              {this.canView('rate_point') && 
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    disabled={!this.canEdit('rate_point')}
                    label="Коэффициент количества пиццы в час"
                    value={this.state.point_info?.k_pizza ?? ''}
                    func={this.changeData.bind(this, 'k_pizza')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    disabled={!this.canEdit('rate_point')}
                    label="Коэффициент мойки посуды для пиццы (кух раб)"
                    value={this.state.point_info?.k_pizza_kux ?? ''}
                    func={this.changeData.bind(this, 'k_pizza_kux')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    disabled={!this.canEdit('rate_point')}
                    label="Коэффициент мойки посуды для роллов (кух раб)"
                    value={this.state.point_info?.k_rolls_kux ?? ''}
                    func={this.changeData.bind(this, 'k_rolls_kux')}
                  />
                </Grid>
  
                {this.canEdit('rate_point') && 
                <Grid item xs={12} sm={12} display='grid'>
                  <Button
                    onClick={this.open_edit_point.bind(this, 'rate')}
                    color="success"
                    variant="contained"
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Выбрать дату применения
                  </Button>
                </Grid>
                }

                {this.canEdit('rate_point') && this.state.point_rate_hist.length > 0 &&
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
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.point_rate_hist.map((it, k) =>
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_view.bind(this, k,'rate')}
                              >
                                <TableCell>{k+1}</TableCell>
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
              }
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_pay}
              id='pay'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Оклад директора на 2 недели"
                    value={this.state.point_info?.dir_price ?? ''}
                    disabled={!this.canEdit('pay_point')}
                    func={this.changeData.bind(this, 'dir_price')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Бонус от уровня директору"
                    value={this.state.point_info?.price_per_lv ?? ''}
                    disabled={!this.canEdit('pay_point')}
                    func={this.changeData.bind(this, 'price_per_lv')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Часовая ставка курьера"
                    value={this.state.point_info?.driver_price ?? ''}
                    disabled={!this.canEdit('pay_point')}
                    func={this.changeData.bind(this, 'driver_price')}
                  />
                </Grid>
                {this.canEdit('pay_point') && (
                  <Grid item xs={12} sm={12} display='grid'>
                    <Button
                      onClick={this.open_edit_point.bind(this, 'pay')}
                      color="success"
                      variant="contained"
                      style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                    >
                      Выбрать дату применения
                    </Button>
                  </Grid>
                )}

                {!this.state.point_pay_hist.length ? null :
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
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.point_pay_hist.map((it, k) =>
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_view.bind(this, k,'pay')}
                              >
                                <TableCell>{k+1}</TableCell>
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
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_sett}
              id='sett'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <MyCheckBox
                    label='Если в заказе только пицца, она выйдет на сборку после начала ее приготовления (напитки, допы и закуски не учитываются)'
                    value={parseInt(this.state.point_info?.priority_pizza ?? 0) == 1 ? true : false}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeItemChecked.bind(this, 'priority_pizza')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyCheckBox
                    label='Если заказ приготовить зарнее - он выйдет в приоритете на сборку, кроме предов (напитки, допы и закуски не учитываются)'
                    value={parseInt(this.state.point_info?.priority_order ?? 0) == 1 ? true : false}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeItemChecked.bind(this, 'priority_order')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyCheckBox
                    label='Пицца у повара будет отображаться, если более 50% роллов в заказе начнут готовить'
                    value={parseInt(this.state.point_info?.rolls_pizza_dif ?? 0) == 1 ? true : false}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeItemChecked.bind(this, 'rolls_pizza_dif')}
                  />
                </Grid>


                <Grid item xs={12} sm={12}>
                  <MyCheckBox
                    label='Общий стол'
                    value={parseInt(this.state.point_info?.cook_common_stol ?? 0) == 1 ? true : false}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeItemChecked.bind(this, 'cook_common_stol')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  {this.checkAccessEdit.bind(this, 'settings_point') ? (
                    <Button
                      onClick={this.changeActivePoint.bind(this)}
                      color={parseInt(this.state.point_info?.cafe_handle_close ?? 0) == 1 ? 'success' : 'primary'}
                      variant="contained"
                      style={{ whiteSpace: 'nowrap'}}
                    >
                      {parseInt(this.state.point_info?.cafe_handle_close ?? 0) == 1 ? 'Поставить на стоп' : 'Снять со стопа' }
                    </Button>
                  ) : (
                    <Typography>{parseInt(this.state.point_info?.cafe_handle_close) === 1 ? 'Не на стопе' : 'На стопе'}</Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyAutocomplite
                    label="Управляющий"
                    multiple={false}
                    data={this.state.upr_list}
                    value={this.state.point_info?.manager_id ?? ''}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeUpr.bind(this, 'manager_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Количество столов сборки"
                    value={this.state.point_info?.count_tables ?? ''}
                    disabled={!this.checkAccessEdit.bind(this, 'settings_point')}
                    func={this.changeData.bind(this, 'count_tables')}
                  />
                </Grid>
                {this.checkAccessEdit.bind(this, 'settings_point') &&
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
                }

                {this.state.point_sett_hist.length > 0 && (
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
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.point_sett_hist.map((it, k) =>
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_view.bind(this, k, 'sett')}
                              >
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.date_time_update}</TableCell>
                                <TableCell>{it.user_name}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_zone}
              id='zone'
            >
              <Grid item xs={12} sm={12} mb={3}>
                <CafeEdit_ZonesMap zones={this.state.zone} otherZones={this.state.other_zones} clickCallback={this.openZone.bind(this)} readonly={this.canEdit('zone_point')}/>
              </Grid>

              {this.state.point_zone_hist.length > 0 && (
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
                            <TableCell>Дата / время</TableCell>
                            <TableCell>Сотрудник</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {this.state.point_zone_hist.map((it, k) =>
                            <TableRow
                              hover
                              key={k}
                              style={{ cursor: 'pointer'}}
                              onClick={this.open_hist_view_zone.bind(this, k, 'zone')}
                            >
                              <TableCell>{k+1}</TableCell>
                              <TableCell>{it.date_time_update}</TableCell>
                              <TableCell>{it.user_name}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_driver}
              id='driver'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Количество заказов на руках (0 - без ограничений)"
                    disabled={!this.canEdit('settings_driver')}
                    value={this.state.point_info?.count_driver ?? ''}
                    func={this.changeData.bind(this, 'count_driver')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.point_info?.summ_driver ?? ''}
                    disabled={!this.canEdit('settings_driver')}
                    func={this.changeData.bind(this, 'summ_driver')}
                    label='Максимальная сумма нала для курьера'
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.point_info?.summ_driver_min ?? ''}
                    disabled={!this.canEdit('settings_driver')}
                    func={this.changeData.bind(this, 'summ_driver_min')}
                    label='Максимальная сумма нала для курьера стажера'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyCheckBox
                    label='Необходима геолокация для завершения заказа'
                    disabled={!this.canEdit('settings_driver')}
                    value={parseInt(this.state.point_info?.driver_need_gps) === 1 ? true : false}
                    func={this.changeData.bind(this, 'driver_need_gps')}
                  />
                </Grid>
                {this.canEdit('settings_driver') && (
                  <Grid item xs={12} sm={6} display='grid'>
                    <Button
                      onClick={this.save_edit_point_sett_driver.bind(this)}
                      color="success"
                      variant="contained"
                      style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                    >
                      Сохранить изменения
                    </Button>
                  </Grid>
                )}

                {this.state.point_sett_driver_hist.length > 0 && ( 
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
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.point_sett_driver_hist.map((it, k) => (
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_view.bind(this, k,'driver')}
                              >
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.date_time_update}</TableCell>
                                <TableCell>{it.user_name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel
              value={this.state.activeTab}
              index={this.state.index_kkt}
              id='kkt'
            >
              <Grid container spacing={3}>

                {this.canEdit('add_kkt') && (
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={this.openModalKktInfo.bind(this, 'add_kkt', {})}
                    >
                      Добавить кассу
                    </Button>
                  </Grid>
                )}

                <Grid item xs={12} sm={12} mb={5}>
                  <TableContainer>
                    <Table>
                      <caption style={{ captionSide: 'top',fontWeight: 'bold', fontSize: '1.1rem', textAlign: "left" }}>
                        Активные кассы
                      </caption>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                          <TableCell style={{ minWidth: '50px' }}>№ кассы</TableCell>
                          <TableCell>РН ККТ</TableCell>
                          <TableCell>ФН</TableCell>
                          <TableCell style={{ minWidth: '200px' }}>Дата регистрации</TableCell>
                          <TableCell style={{ minWidth: '200px' }}>Дата окончания</TableCell>
                          <TableCell style={{ minWidth: '200px' }}>Лицензия ОФД дата завершения</TableCell>
                          {this.canEdit('add_fn') &&
                            (<TableCell style={{ minWidth: '200px' }}>Добавить новый ФН</TableCell>)
                          }
                          {this.canView('edit_kkt') && (<TableCell>{this.canEdit('edit_kkt') ? 'Редактирование' : 'Просмотр'}</TableCell>)}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.kkt_info_active.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>{item.kassa}</TableCell>
                            <TableCell>{item.rn_kkt}</TableCell>
                            <TableCell>{item.fn}</TableCell>
                            <TableCell>{item.date_start}</TableCell>

                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {!!item.date_end && (
                                  <>
                                    <Typography variant="body2" sx={{ margin: '16px 0' }}>
                                      {item.date_end}
                                    </Typography>
                                    <Tooltip title={item.days_left_end === '!' ? "Дни просрочены" : "Осталось дней"}>
                                      <Chip
                                        label={item.days_left_end}
                                        size="small"
                                        sx={{
                                          ml: 2,
                                          height: 22,
                                          cursor: 'default',
                                          '&:hover': {
                                            cursor: 'default',
                                          },
                                          '& .MuiChip-label': {
                                            fontSize: '14px !important',
                                            fontWeight: 'bold',
                                            lineHeight: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 1.2,
                                            color: item.days_left_end === '!' ? 'red' : 'inherit'
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {!!item.date_license && (
                                  <>
                                    <Typography variant="body2" sx={{ margin: '16px 0' }}>
                                      {item.date_license}
                                    </Typography>
                                    <Tooltip title={item.days_left_license === '!' ? "Дни просрочены" : "Осталось дней"}>
                                      <Chip
                                        label={item.days_left_license}
                                        size="small"
                                        sx={{
                                          ml: 2,
                                          height: 22,
                                          cursor: 'default',
                                          '&:hover': {
                                            cursor: 'default',
                                          },
                                          '& .MuiChip-label': {
                                            fontSize: '14px !important',
                                            fontWeight: 'bold',
                                            lineHeight: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 1.2,
                                            color: item.days_left_license === '!' ? 'red' : 'inherit'
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>

                            {this.canEdit('add_fn') && (
                              <TableCell>
                                <Button
                                  variant="contained"
                                  style={{ whiteSpace: 'nowrap' }}
                                  onClick={this.openModalKktInfo_add.bind(this, item)}
                                >
                                  Новый ФН
                                </Button>
                              </TableCell>
                            )}
                            {this.canView('edit_kkt') && (
                              <TableCell>
                                <IconButton onClick={this.openModalKktInfo.bind(this, this.canEdit('edit_kkt') ? 'update_kkt' : 'view_kkt', item)}>
                                  {this.canEdit('edit_kkt') ? <EditIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {this.state.kkt_info_none_active.length > 0 && (
                  <Grid item xs={12} sm={12} mb={this.state.kkt_info_hist.length ? 0 : 5}>
                    <Accordion style={{ width: '100%' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography style={{ fontWeight: 'bold' }}>Неактивные кассы</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell style={{ minWidth: '80px' }}>№ кассы</TableCell>
                                <TableCell>РН ККТ</TableCell>
                                <TableCell>ФН</TableCell>
                                <TableCell style={{ minWidth: '200px' }}>Дата регистрации</TableCell>
                                <TableCell style={{ minWidth: '200px' }}>Дата окончания</TableCell>
                                <TableCell style={{ minWidth: '200px' }}>Лицензия ОФД дата завершения</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {this.state.kkt_info_none_active.map((item, key) => (
                                <TableRow key={key}>
                                  <TableCell>{item.kassa}</TableCell>
                                  <TableCell>{item.rn_kkt}</TableCell>
                                  <TableCell>{item.fn}</TableCell>
                                  <TableCell>{item.date_start}</TableCell>
                                  <TableCell>{item.date_end}</TableCell>
                                  <TableCell>{item.date_license}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {this.state.kkt_info_hist.length > 0 && (
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
                              <TableCell>№ кассы</TableCell>
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.kkt_info_hist.map((it, k) =>
                              <TableRow
                                hover
                                key={k}
                                style={{ cursor: 'pointer'}}
                                onClick={this.open_hist_kkt.bind(this, it.id, it.kkt_id, 'kkt')}
                              >
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.kassa}</TableCell>
                                <TableCell>{it.date_time_update}</TableCell>
                                <TableCell>{it.user_name}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

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

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  }
}
