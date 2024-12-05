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

import { api } from '@/src/api_new';
import dayjs from 'dayjs';

class SitePriceLevelEdit_input_level_name extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.data) {
      return;
    }

    if (this.props.data !== prevProps.data) {
      this.setState({
        item: this.props.data,
      });
    }
  }

  changeItem(event) {
    const value = event.target.value;

    this.setState({
      item: value
    });
  }

  save_data_input() {
    let value = this.state.item;
    this.props.changeInput(value);
  }

  render() {
    return (
      <Grid item xs={12} sm={4}>
        <MyTextInput
          label='Название'
          value={this.state.item}
          func={this.changeItem.bind(this)}
          onBlur={this.save_data_input.bind(this)}
        />
      </Grid>
    )
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

    if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Редактрование возможно только при указании будущей даты (позже сегодняшней даты)'
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

    if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){
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
        />
      </>
    )
  }
}

class SitePriceLevelEdit_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_price_level',
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

    };
  }

  async componentDidMount() {

    let data_level = window.location.pathname;
    data_level = data_level.split('/');

    const data = {
      level_id: data_level[2],
    }

    const res = await this.getData('get_one', data);

    this.setState({
      level_id: res.level.id,
      cats: res.cats,
      cities: res.cities,
      city: res.level.city_id,
      date_start: res.level.date_start,
      level_name: res.level.name,
      module_name: res.module_info.name
    });

    document.title = res.module_info.name;
  }

  getData = (method, data = {}) => {
      
    this.setState({
      is_load: true,
    });

    let res = api(this.state.module, method, data)
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

    this.setState({
      [data]: event ? event : ''
    });
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

  async save() {
    const date_now = dayjs();
    let date_start = dayjs(this.state.date_start);

    if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Сохранение возможно только при указании будущей даты (позже сегодняшней даты)'
      });

      return;
    }

    let level_name = this.state.level_name;

    if (!level_name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;

    } 

    date_start = dayjs(this.state.date_start).format('YYYY-MM-DD');

    let items = [];

    const cats = this.state.cats;

    cats.map((cat) => {
      items = [...items, ...cat.items];
      return cat;
    });

    const data = {
      level_id: this.state.level_id,
      city_id: this.state.city,
      name: this.state.level_name,
      date_start,
      items
    };

    const res = await this.getData('save_edit', data);

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

      setTimeout(async () => {
        this.update(res.level_id);
      }, 100);
    }
  }

  async update(level_id) {

    const data = {
      level_id,
    }

    const res = await this.getData('get_one', data);

    this.setState({
      level_id: res.level.id,
      cats: res.cats,
      cities: res.cities,
      city: res.level.city_id,
      date_start: res.level.date_start,
      level_name: res.level.name,
    });

  }

  render() {
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

          <SitePriceLevelEdit_input_level_name
            data={this.state.level_name}
            changeInput={this.changeItem.bind(this)}
          />

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
              label="Город"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата старта"
              value={dayjs(this.state.date_start)}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
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
                              <SitePriceLevelEdit_input_item
                                data={item?.price}
                                changeInput={this.changeInput.bind(this)}
                                key_cat={key}
                                key_item={k}
                                date_start={this.state.date_start}
                                item_id={item.id}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </Grid>

        </Grid>

      </>
    );
  }
}

export default function SitePriceLevelEdit() {
  return <SitePriceLevelEdit_ />;
}
