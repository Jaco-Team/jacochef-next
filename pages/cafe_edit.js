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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
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

class CafeEdit_Modal_History extends React.Component {
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

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {

    const { open, fullScreen, type_modal, date_edit } = this.props

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
            {type_modal !== 'zone' ? 'Изменения выделены цветом' : 'Изменения в зоне доставки'}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>

            {type_modal === 'info' ?
              <>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Город"
                    value={this.state.itemView ? this.state.itemView.city_id?.color ? this.state.itemView.city_id.key : this.state.itemView.city_id : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.city_id?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Адрес"
                    value={this.state.itemView ? this.state.itemView.addr?.color ? this.state.itemView.addr.key : this.state.itemView.addr : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.addr?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Район"
                    value={this.state.itemView ? this.state.itemView.raion?.color ? this.state.itemView.raion.key : this.state.itemView.raion : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.raion?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Сортировка"
                    value={this.state.itemView ? this.state.itemView.sort?.color ? this.state.itemView.sort.key : this.state.itemView.sort : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.sort?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Организация"
                    value={this.state.itemView ? this.state.itemView.organization?.color ? this.state.itemView.organization.key : this.state.itemView.organization : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.organization?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="ИНН"
                    value={this.state.itemView ? this.state.itemView.inn?.color ? this.state.itemView.inn.key : this.state.itemView.inn : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.inn?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="ОГРН"
                    value={this.state.itemView ? this.state.itemView.ogrn?.color ? this.state.itemView.ogrn.key : this.state.itemView.ogrn : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.ogrn?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="КПП"
                    value={this.state.itemView ? this.state.itemView.kpp?.color ? this.state.itemView.kpp.key : this.state.itemView.kpp : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.kpp?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Телефон управляющего"
                    value={this.state.itemView ? this.state.itemView.phone_upr?.color ? this.state.itemView.phone_upr.key : this.state.itemView.phone_upr : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.phone_upr?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Телефон менеджера"
                    value={this.state.itemView ? this.state.itemView.phone_man?.color ? this.state.itemView.phone_man.key : this.state.itemView.phone_man : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.phone_man?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Активность"
                    value={this.state.itemView ? this.state.itemView.is_active?.color ? this.state.itemView.is_active.key : this.state.itemView.is_active : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.is_active?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <MyTextInput
                    label="Полный адрес"
                    value={this.state.itemView ? this.state.itemView.full_addr?.color ? this.state.itemView.full_addr.key : this.state.itemView.full_addr : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.full_addr?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
              </>
            : null}

            {type_modal === 'rate' ?
              <>
                {!date_edit ? null :
                  <Grid item xs={12} sm={12}>
                    <Typography style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                      Дата начала изменений: {date_edit ?? ''}
                    </Typography>
                  </Grid>
                }
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Коэффициент количества пиццы в час"
                    value={this.state.itemView ? this.state.itemView.k_pizza?.color ? this.state.itemView.k_pizza.key : this.state.itemView.k_pizza : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.k_pizza?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для пиццы (кух раб)"
                    value={this.state.itemView ? this.state.itemView.k_pizza_kux?.color ? this.state.itemView.k_pizza_kux.key : this.state.itemView.k_pizza_kux : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.k_pizza_kux?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для роллов (кух раб)"
                    value={this.state.itemView ? this.state.itemView.k_rolls_kux?.color ? this.state.itemView.k_rolls_kux.key : this.state.itemView.k_rolls_kux : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.k_rolls_kux?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
              </>
            : null}

            {type_modal === 'pay' ?
              <>
                {!date_edit ? null :
                  <Grid item xs={12} sm={12}>
                    <Typography style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                      Дата начала изменений: {date_edit ?? ''}
                    </Typography>
                  </Grid>
                }
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Оклад директора на 2 недели"
                    value={this.state.itemView ? this.state.itemView.dir_price?.color ? this.state.itemView.dir_price.key : this.state.itemView.dir_price : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.dir_price?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Бонус от уровня директору"
                    value={this.state.itemView ? this.state.itemView.price_per_lv?.color ? this.state.itemView.price_per_lv.key : this.state.itemView.price_per_lv : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.price_per_lv?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Часовая ставка курьера"
                    value={this.state.itemView ? this.state.itemView.driver_price?.color ? this.state.itemView.driver_price.key : this.state.itemView.driver_price : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.driver_price?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
              </>
            : null}

            {type_modal === 'sett' ?
              <>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Если в заказе только пицца, она выйдет на сборку после начала ее приготовления (напитки, допы и закуски не учитываются)"
                    value={this.state.itemView ? this.state.itemView.priority_pizza?.color ? this.state.itemView.priority_pizza.key : this.state.itemView.priority_pizza : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.priority_pizza?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Если заказ приготовить зарнее - он выйдет в приоритете на сборку, кроме предов (напитки, допы и закуски не учитываются)"
                    value={this.state.itemView ? this.state.itemView.priority_order?.color ? this.state.itemView.priority_order.key : this.state.itemView.priority_order : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.priority_order?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Пицца у повара будет отображаться, если более 50% роллов в заказе начнут готовить"
                    value={this.state.itemView ? this.state.itemView.rolls_pizza_dif?.color ? this.state.itemView.rolls_pizza_dif.key : this.state.itemView.rolls_pizza_dif : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.rolls_pizza_dif?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Общий стол"
                    value={this.state.itemView ? this.state.itemView.cook_common_stol?.color ? this.state.itemView.cook_common_stol.key : this.state.itemView.cook_common_stol : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.cook_common_stol?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Кафе"
                    value={this.state.itemView ? this.state.itemView.cafe_handle_close?.color ? this.state.itemView.cafe_handle_close.key : this.state.itemView.cafe_handle_close : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.cafe_handle_close?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Управляющий"
                    value={this.state.itemView ? this.state.itemView.manager_id?.color ? this.state.itemView.manager_id.key : this.state.itemView.manager_id : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.manager_id?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Количество столов сборки"
                    value={this.state.itemView ? this.state.itemView.count_tables?.color ? this.state.itemView.count_tables.key : this.state.itemView.count_tables : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.count_tables?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
              </>
            : null}

            {type_modal === 'zone' ?
              <Grid item xs={12} sm={12}>
                <Typography style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                  {`${this.state.itemView?.zone_name} ${this.state.itemView?.is_active}: ${this.state.itemView?.date_time_update}`}
                </Typography>
              </Grid>
            : null}

            {type_modal === 'driver' ?
              <>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Количество заказов на руках (0 - без ограничений)"
                    value={this.state.itemView ? this.state.itemView.count_driver?.color ? this.state.itemView.count_driver.key : this.state.itemView.count_driver : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.count_driver?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Максимальная сумма нала для курьера"
                    value={this.state.itemView ? this.state.itemView.summ_driver?.color ? this.state.itemView.summ_driver.key : this.state.itemView.summ_driver : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.summ_driver?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Максимальная сумма нала для курьера стажера"
                    value={this.state.itemView ? this.state.itemView.summ_driver_min?.color ? this.state.itemView.summ_driver_min.key : this.state.itemView.summ_driver_min : ''}
                    disabled={true}
                    className={this.state.itemView ? this.state.itemView.summ_driver_min?.color ? "disabled_input disabled_input_color" : "disabled_input" : "disabled_input"}
                  />
                </Grid>
              </>
            : null}
          
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
    if(!this.props.is_сlosed_technic && !this.props.is_сlosed_overload){
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать причину закрытия кафе',
      })  

      return;
    }

    if(this.props.is_сlosed_technic && !this.props.chooseReason){
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать/указать причину технического закрытия кафе',
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
            <Typography>Вы действительно хотите сохранить данные?</Typography>
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
          maxWidth={'sm'}
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
      confirmDialog: false,
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

    this.props.save();

    this.onClose();
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        isActive: 0,
        confirmDialog: false,
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, zone } = this.props;

    return (
      <>
        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Вы действительно хотите сохранить данные?</Typography>
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
          maxWidth={'sm'}
        >
          <DialogTitle>
            Настройка активных зон доставки
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
            </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <div style={{ marginBottom: 20 }}>
              <span>Если снять активность с выбранной зоны доставки, то прекратиться оформление новых доставок в данную зону</span>
            </div>

            <MyCheckBox 
              label={zone?.zone_name ?? ''} 
              value={parseInt(this.state.is_active) == 1 ? true : false} 
              func={this.changeItemChecked.bind(this, 'is_active')} 
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => this.setState({ confirmDialog: true })}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
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

      acces: null,
      fullScreen: false,

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
      tabs_data: [],

      upr_list: [],

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

    setTimeout(() => {
      this.getDataPoint();
    }, 200);

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

  async changePoint(event, value) {
    this.setState({
      point: value,
    });

    setTimeout(() => {
      this.getDataPoint();
    }, 100);
  }

  changeTab(event, value) {
    const index_zone = this.state.index_zone;
    
    if(value === index_zone) {
      const zone = this.state.zone;
      const other_zones = this.state.other_zones;

      if(zone.length && other_zones.length) {
        setTimeout(() => {
          this.getZones(zone, other_zones);
        }, 300);
      } else {
        setTimeout(() => {
          this.map?.geoObjects?.removeAll();
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

  getTabIndex() {
    const acces = this.state.acces;

    let tabs_data = [];

    for (let key in acces) {
      if(parseInt(acces[key])) {

        if(key === 'active_point' || key === 'organization_point' || key === 'telephone_point') {

          const info = tabs_data.find(item => item.name === 'Информация о точке');

          if(!info) {
            tabs_data.push({key, 'name': "Информация о точке"});
          }

        }

        if(key === 'rate_point') {
          tabs_data.push({key, 'name': "Коэффициенты"});
        }

        if(key === 'pay_point') {
          tabs_data.push({key, 'name': "Зарплата"});
        }
        
        if(key === 'settings_point') {
          tabs_data.push({key, 'name': "Настройки точки"});
        }

        if(key === 'zone_point') {
          tabs_data.push({key, 'name': "Зоны доставки"});
        }

        if(key === 'settings_driver') {
          tabs_data.push({key, 'name': "Настройки курьеров"});
        }
        
      }
    }

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

    });

    this.setState({
      tabs_data
    });

  }

  async getDataPoint() {
    const point_id = this.state.point.id;
    const city_id = this.state.point.city_id;
    const activeTab = this.state.activeTab;
    const index_zone = this.state.index_zone;

    const data = {
      point_id,
      city_id
    };

    const res = await this.getData('get_one', data);

    res.point_info.manager_id = {id: res.point_info.manager_id, name: res.point_info.manager_name};
    const upr = res.upr_list.find(upr => parseInt(upr.id) === parseInt(res.point_info?.manager_id?.id));
    if(!upr) res.upr_list.push(res.point_info?.manager_id);

    this.setState({
      upr_list: res.upr_list,
      cities: res.cities,
      point_info: res.point_info,
      other_zones: res.other_zones,
      zone: res.zone,
      reason_list: res.reason_list,
      point_info_hist: res.point_info_hist,
      point_rate_hist: res.point_rate_hist,
      point_pay_hist: res.point_pay_hist,
      point_sett_hist: res.point_sett_hist,
      point_zone_hist: res.point_zone_hist,
      point_sett_driver_hist: res.point_sett_driver_hist
    });

    if(activeTab === index_zone && res.zone.length && res.other_zones.length) {
      setTimeout(() => {
        this.getZones(res.zone, res.other_zones);
      }, 300);
    } else {
      setTimeout(() => {
        this.map?.geoObjects?.removeAll();
      }, 300);
    }

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

      setTimeout(() => {
        this.getDataPoint();
      }, 300);

    }
  }

  async save_edit_point_sett_driver() {

    let data = this.state.point_info;

    data.point_id = data.id;

    const res = await this.getData('save_edit_point_sett_driver', data);

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

  async save_active_zone() {

    const zone_list = this.state.zone;
    const point_id = this.state.point.id;

    const data = {
      zone_list,
      point_id
    };

    const res = await this.getData('stop_zone', data);
   
    if (res.st) {
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

          points_zone.push({xy: JSON.parse(item['zone']), active: item.is_active});

          let myGeoObject2 = [];
          
          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly].xy],
              {geometry: { fillRule: 'nonZero' }},
              {
                fillOpacity: 0.4,
                fillColor: parseInt(points_zone[poly].active) ? '#00FF00' : '#AAAAAA',
                strokeColor: parseInt(points_zone[poly].active) ? '#0000FF' : '#000000',
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

        points_zone.push({xy: JSON.parse(item['zone']), active: item.is_active});

          let myGeoObject2 = [];
          
          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly].xy],
              {geometry: { fillRule: 'nonZero' }},
              {
                fillOpacity: 0.4,
                fillColor: parseInt(points_zone[poly].active) ? '#00FF00' : '#AAAAAA',
                strokeColor: parseInt(points_zone[poly].active) ? '#0000FF' : '#000000',
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

  async open_hist_view(index, type_modal) {

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

  async open_hist_view_zone(index, type_modal) {

    const item = this.state.point_zone_hist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.is_active = parseInt(itemView.is_active) ? 'включена' : 'отключена';

    this.setState({
      modalDialogView: true,
      itemView,
      type_modal
    });

  }

  changeUpr(data, event, value) {
    const point_info = this.state.point_info;

    point_info[data] = value;

    this.setState({
      point_info,
    });
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

        <CafeEdit_Modal_History
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null,type_modal: null, date_edit: null })}
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
            />
          </Grid>

          {parseInt(this.state.acces?.organization_point) ?
            <Grid item xs={12} sm={4}>
              <Button onClick={this.open_new_point.bind(this)} variant="contained">
                Добавить точку
              </Button>
            </Grid>
          : null}

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
              id='clients'
            >
              <Grid container spacing={3}>

                {parseInt(this.state.acces?.organization_point) ?
                  <>
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
                        label="Сортировка ( порядок точек во всех модулях и на сайте )"
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

                    <Grid item xs={12} sm={12}>
                      <MyTextInput
                        label="Полный адрес"
                        value={this.state.point_info?.full_addr ?? ''}
                        func={this.changeData.bind(this, 'full_addr')}
                      />
                    </Grid>
                  </>
                  : null
                }

                {parseInt(this.state.acces?.active_point) ?
                  <Grid item xs={12} sm={12}>
                    <MyCheckBox
                      label="Активность"
                      value={parseInt(this.state.point_info?.is_active ?? 0) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, 'is_active')}
                    />
                  </Grid>
                : null}

                {parseInt(this.state.acces?.telephone_point) ?
                  <>
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
                  </>
                : null}

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

                {!this.state.point_info_hist.length ? null :
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
                }
               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={this.state.index_rate} 
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
                    Выбрать дату применения
                  </Button>
                </Grid>

                {!this.state.point_rate_hist.length ? null :
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
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={this.state.index_pay} 
              id='clients'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Оклад директора на 2 недели"
                    value={this.state.point_info?.dir_price ?? ''}
                    func={this.changeData.bind(this, 'dir_price')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Бонус от уровня директору"
                    value={this.state.point_info?.price_per_lv ?? ''}
                    func={this.changeData.bind(this, 'price_per_lv')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Часовая ставка курьера"
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
                    Выбрать дату применения
                  </Button>
                </Grid>

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

                <Grid item xs={12} sm={4}>
                  <MyAutocomplite
                    label="Управляющий"
                    multiple={false}
                    data={this.state.upr_list}
                    value={this.state.point_info?.manager_id ?? ''}
                    func={this.changeUpr.bind(this, 'manager_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Количество столов сборки"
                    value={this.state.point_info?.count_tables ?? ''}
                    func={this.changeData.bind(this, 'count_tables')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button 
                    onClick={this.changeActivePoint.bind(this)}  
                    color={parseInt(this.state.point_info?.cafe_handle_close ?? 0) == 1 ? 'success' : 'primary'}
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap'}}
                  >
                    {parseInt(this.state.point_info?.cafe_handle_close ?? 0) == 1 ? 'Поставить на стоп' : 'Снять со стопа' }
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} display='grid'>
                  <Button 
                    onClick={this.save_edit_point_sett.bind(this)}  
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>

                {!this.state.point_sett_hist.length ? null :
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
                }

               
              </Grid>
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={this.state.index_zone} 
              id='clients'
            >
              <Grid item xs={12} sm={12} mb={3}>
                <div id="map" name="map" style={{ width: '100%', height: 700, paddingTop: 10 }} />
              </Grid>

              {!this.state.point_zone_hist.length ? null :
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
              }
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
            <TabPanel 
              value={this.state.activeTab} 
              index={this.state.index_driver} 
              id='clients'
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Количество заказов на руках (0 - без ограничений)"
                    value={this.state.point_info?.count_driver ?? ''}
                    func={this.changeData.bind(this, 'count_driver')}
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
                    onClick={this.save_edit_point_sett_driver.bind(this)}  
                    color="success" 
                    variant="contained" 
                    style={{ whiteSpace: 'nowrap', justifySelf: 'flex-end' }}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>

                {!this.state.point_sett_driver_hist.length ? null :
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
                            {this.state.point_sett_driver_hist.map((it, k) =>
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
