import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MySelect, MyDatePickerNew, MyTextInput, MyAlert} from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';
import dayjs from 'dayjs';

class SitePriceLevelEdit_input_level_name extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.data || '',
      prevData: props.data || '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.data !== prevState.prevData) {
      return {
        item: nextProps.data,
        prevData: nextProps.data,
      };
    }
    return null;
  }

  changeItem = (event) => {
    const value = event.target.value;
    this.setState({ item: value });
  };

  save_data_input = () => {
    const value = this.state.item;
    this.props.changeInput(value);
  };

  render() {
    return (
      <Grid item xs={12} sm={4}>
        <MyTextInput
          label="Название"
          value={this.state.item}
          func={this.changeItem}
          onBlur={this.save_data_input}
        />
      </Grid>
    );
  }
}

class SitePriceLevelEdit_input_item extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      item: this.props.data,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  changeItem(event) {
    const date_now = dayjs();
    const date_start = dayjs(this.props.date_start);

    if(date_start.isBefore(date_now, 'day')){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Редактрование возможно только при указании сегодняшней или будущей даты'
      });
      
      return;
    }

    const value = event.target.value.replace(/^0+/, '');

    this.setState({
      item: value
    });
  }

  save_data_input() {

    const date_now = dayjs();
    const date_start = dayjs(this.props.date_start);

    if(date_start.isBefore(date_now, 'day')){
      return;
    }

    if (!this.click) {
      this.click = true;

      let value = this.state.item;
      this.props.changeInput(this.props.key_cat, this.props.key_item, this.props.item_id, value);

      if (document.activeElement !== document.body) {
        const nextInput = [...document.querySelectorAll('input:not([tabindex = "-1"]):not([autocomplete])')];
        const index = nextInput.indexOf(document.activeElement) + 1;

        if (nextInput[index]) {
          nextInput[index].focus();
        } else {
          return;
        }
      }
    }

    setTimeout(() => {
      this.click = false;
    }, 200);
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

        <MyTextInput
          type='number'
          value={this.state.item}
          func={this.changeItem.bind(this)}
          onBlur={this.save_data_input.bind(this)}
          enter={(event) => event.key === 'Enter' ? this.save_data_input(event) : null}
          onWheel={(e) => e.target.blur()}
        />
      </>
    )
  }
}

class SitePriceLevelEdit_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_price_lavel',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      cities: [],
      city: '',
      date_start: '',
      cats: [],

      level_id: '',
      level_name: '',

      acces: null,

      initialCity: '',
      initialDate: '',
    };
  }

  async componentDidMount() {
    let data_level = window.location.pathname.split('/');
    this.update(data_level[2]);
  }

  getData = (method, data = {}) => {
      
    if(method !== 'save_one_price') {
      this.setState({
        is_load: true,
      });
    }

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

  changeCity(event) {
    const city = event.target.value;

    this.setState({
      city,
    });
  }

  changeItem(value) {
    this.setState({
      level_name: value,
    });
  }

  changeDateRange(data, event) {
    if (event === null) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Указание даты обязательно',
        date_start: this.state.date_start,
      });
      return;
    }
  
    const date_now = dayjs();
    let selectedDate = dayjs(event);
  
    if (selectedDate.isBefore(date_now, 'day')) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text:
          'Изменение даты возможно только при указании сегодняшней или будущей даты',
      });
      return;
    }
  
    this.setState({ 
      [data]: event ? event : '' }, 

      () => {
      const newDate = dayjs(this.state[data]);
      const baseDate = dayjs(this.state.initialDate);

      if (newDate.isSame(date_now, 'day')) {
        if (baseDate.isSame(date_now, 'day')) {
          return;
        }
        this.handleSave();
      }
    });

  }
  
  async handleSave() {
    const { level_id, level_name, city, date_start, cats } = this.state;
  
    if (!city || !level_name || !date_start) {
      const err_text = !city
        ? 'Необходимо выбрать город'
        : !level_name
        ? 'Необходимо указать название'
        : 'Указание даты обязательно';
  
      this.setState({
        openAlert: true,
        err_status: false,
        err_text,
      });
      return;
    }
  
    const date_now = dayjs();
    const currentDate = dayjs(date_start);
  
    if (currentDate.isBefore(date_now, 'day')) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text:
          'Сохранение возможно только при указании сегодняшней или будущей даты',
      });
      return;
    }
  
    const formattedDate = currentDate.format('YYYY-MM-DD');
    const items = cats.reduce((acc, cat) => acc.concat(cat.items), []);
 
    if (currentDate.isSame(date_now, 'day') && !dayjs(this.state.initialDate).isSame(date_now, 'day')) {
      const data = {
        name: level_name,
        date_start: formattedDate,
        city_id: city,
        type: 'date',
        items,
      };
  
      const res = await this.getData('save_new', data);
      if (!res.st) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        window.location.href = '/site_price_lavel';
      }
      
      return;
    }
  
    const isCityChanged = city !== this.state.initialCity;
    const isDateChanged = !currentDate.isSame(dayjs(this.state.initialDate), 'day');
    const typeValue = (!isCityChanged && !isDateChanged) ? 'edit' : 'check';
  
    const data = {
      level_id,
      city_id: city,
      name: level_name,
      date_start: formattedDate,
      items,
      type: typeValue,
    };
  
    const res = await this.getData('save_edit', data);
    this.setState({
      openAlert: true,
      err_status: res.st,
      err_text: res.text,
    });
  
    if (res.st) {
      setTimeout(() => {
        this.update(res.level_id);
      }, 100);
    }
  }
  
  async changeInput(key_cat, key_item, item_id, value) {
    let cats = this.state.cats;

    cats[key_cat].items[key_item].price = value;

    this.setState({
      cats,
    });

    const data = {
      level_id: this.state.level_id,
      item_id,
      value,
    };

    await this.getData('save_one_price', data);
  }

  async update(level_id) {

    const data = {
      level_id,
    }

    const res = await this.getData('get_one', data);
    console.log("🚀 === res:", res);

    let city;

    if(parseInt(res.acces?.edit_level) && !dayjs(res.level.date_start).isBefore(dayjs(), 'day')) {
      city = res.level.city_id;
    } else {
      city = res.cities.find((item) => item.id === res.level.city_id)?.name ?? '';
    }

    this.setState({
      level_id: res.level.id,
      cats: res.cats,
      cities: res.cities,
      city,
      date_start: res.level.date_start,
      level_name: res.level.name,
      module_name: res.module_info.name,
      acces: res.acces,
      initialCity: res.level.city_id,
      initialDate: res.level.date_start,
    });

    document.title = res.module_info.name;

  }

  render() {

    const { acces, date_start } = this.state;
    const isEdit = parseInt(acces?.edit_level) && !dayjs(date_start).isBefore(dayjs(), 'day');

    return (
      <>

        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>

          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          {isEdit ?
            <SitePriceLevelEdit_input_level_name
              data={this.state.level_name}
              changeInput={this.changeItem.bind(this)}
            />
            :
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Название"
                value={this.state.level_name}
                disabled={true}
                className={"disabled_input"}
              />
            </Grid>
          }

          <Grid item xs={12} sm={4}>
            {isEdit ?
              <MySelect
                is_none={false}
                data={this.state.cities}
                value={this.state.city}
                func={this.changeCity.bind(this)}
                label="Город"
              />
              :
              <MyTextInput
                label="Город"
                value={this.state.city}
                disabled={true}
                className={"disabled_input"}
              />
            }
          </Grid>

          <Grid item xs={12} sm={4}>
            {isEdit ?
              <MyDatePickerNew
                label="Дата старта"
                value={dayjs(this.state.date_start)}
                func={this.changeDateRange.bind(this, 'date_start')}
              />
              :
              <MyTextInput
                label="Дата старта"
                value={this.state.date_start}
                disabled={true}
                className={"disabled_input"}
              />
            }
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 652 } }} component={Paper}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ width: '10%' }}>ID товара</TableCell>
                    <TableCell style={{ width: '45%' }}>Наименование товара</TableCell>
                    <TableCell style={{ width: '45%' }}>Цена товара</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.cats.map((cat, key) =>
                    cat.items.length === 0 ? null :
                      <React.Fragment key={key}>
                        <TableRow sx={{ '& th': { border: 'none' } }}>
                          <TableCell></TableCell>
                          <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                            {cat.name}
                          </TableCell>
                        </TableRow>
                        {cat.items.map((item, k) => (
                          <TableRow hover key={k}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>
                              {item.name}
                            </TableCell>
                            <TableCell>
                            {isEdit ?
                              <SitePriceLevelEdit_input_item
                                data={item?.price}
                                changeInput={this.changeInput.bind(this)}
                                key_cat={key}
                                key_item={k}
                                date_start={this.state.date_start}
                                item_id={item.id}
                              />
                              :
                              <MyTextInput
                                label=""
                                value={item?.price}
                                disabled={true}
                                className={"disabled_input"}
                              />
                            }
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {isEdit ?
            <Grid item xs={12} sm={4}>
              <Button variant="contained" onClick={this.handleSave.bind(this)}>
                Сохранить
              </Button>
            </Grid>
          : null}

        </Grid>

      </>
    );
  }
}

export default function SitePriceLevelEdit() {
  return <SitePriceLevelEdit_ />;
}
