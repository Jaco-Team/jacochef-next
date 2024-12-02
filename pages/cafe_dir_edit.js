import React from 'react';

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
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyAutocomplite, MyTextInput, MySelect, MyCheckBox, MyAlert} from '@/ui/elements';

import queryString from 'query-string';

class CafeDirEdit_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      count_orders: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    let count_orders = [];

    count_orders.push({
      id: '0',
      name: 'Без ограничений'
    });

    for(let i = 1; i <= 20; i ++){
      count_orders.push({
        id: i,
        name: i
      });
    }

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
        count_orders: count_orders
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

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        maxWidth={'lg'}
      >
        <DialogTitle className="button">
          Новая точка
          {this.props.fullScreen ? (
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Typography>Информация о точке:</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <MySelect
                label="Город"
                is_none={false}
                data={this.state.item ? this.state.item.cities : []}
                value={this.state.item ? this.state.item.city_id : ''}
                func={this.changeItem.bind(this, 'city_id')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Адрес"
                value={this.state.item ? this.state.item.addr : ''}
                func={this.changeItem.bind(this, 'addr')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Район"
                value={this.state.item ? this.state.item.raion : ''}
                func={this.changeItem.bind(this, 'raion')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Сортировка"
                value={this.state.item ? this.state.item.sort : ''}
                func={this.changeItem.bind(this, 'sort')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Организация"
                value={this.state.item ? this.state.item.organization : ''}
                func={this.changeItem.bind(this, 'organization')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="ИНН"
                value={this.state.item ? this.state.item.inn : ''}
                func={this.changeItem.bind(this, 'inn')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="ОГРН"
                value={this.state.item ? this.state.item.ogrn : ''}
                func={this.changeItem.bind(this, 'ogrn')}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="КПП"
                value={this.state.item ? this.state.item.kpp : ''}
                func={this.changeItem.bind(this, 'kpp')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Полный адрес"
                value={this.state.item ? this.state.item.full_addr : ''}
                func={this.changeItem.bind(this, 'full_addr')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <MySelect 
                is_none={false} 
                data={this.state.count_orders} 
                value={this.state.item ? this.state.item.count_driver : ''} 
                func={ this.changeItem.bind(this, 'count_driver') } 
                label='Количество заказов на руках у курьеров' />
            </Grid> 

            <Grid item xs={12} sm={12}>
              <Typography>Коэффициенты:</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Коэффициент количества пиццы в час"
                value={this.state.item ? this.state.item.k_pizza : ''}
                func={this.changeItem.bind(this, 'k_pizza')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Коэффициент мойки посуды для пиццы (кух раб)"
                value={this.state.item ? this.state.item.k_pizza_kux : ''}
                func={this.changeItem.bind(this, 'k_pizza_kux')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Коэффициент мойки посуды для роллов (кух раб)"
                value={this.state.item ? this.state.item.k_rolls_kux : ''}
                func={this.changeItem.bind(this, 'k_rolls_kux')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Оклад директора на 2 недели (с тек. периода)"
                value={this.state.item ? this.state.item.dir_price : ''}
                func={this.changeItem.bind(this, 'dir_price')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Бонус от уровня директору (с тек. периода)"
                value={this.state.item ? this.state.item.price_per_lv : ''}
                func={this.changeItem.bind(this, 'price_per_lv')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Часовая ставка курьера (применяется со следующего дня)"
                value={this.state.item ? this.state.item.driver_price : ''}
                func={this.changeItem.bind(this, 'driver_price')}
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
    );
  }
}

class CafeDirEdit_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'cafe_dir_edit',
      module_name: '',
      is_load: false,

      points: [],
      point: '',
      cities: [],

      ItemTab: '1',

      data: null,

      modalDialog: false,
      item: null,
      mark: '',

      count_orders: [],
      count_tables: [],

      itemNew: {
        dir_price: 0,
        price_per_lv: 0,
        driver_price: 0,
        k_pizza: 0,
        k_pizza_kux: 0,
        k_rolls_kux: 0,
        addr: '',
        raion: '',
        city_id: '',
        organization: '',
        inn: '',
        ogrn: '',
        kpp: '',
        full_addr: '',
        sort: 0,
        count_order: '',
        count_table: '',
      },

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    const point = {
      point_id: data.points[0].id,
    };

    const res = await this.getData('get_one', point);

    let count_orders = [];
    let count_tables = [];

    count_orders.push({
      id: '0',
      name: 'Без ограничений'
    });

    for(let i = 1; i <= 20; i ++){
      count_orders.push({
        id: i,
        name: i
      });
    }

    for(let i = 1; i <= 10; i ++){
      count_tables.push({
        id: i,
        name: i
      });
    }

    console.log( { ...res.point_koef, ...res.point_info } )

    this.setState({
      points: data.points,
      point: data.points[0],
      cities: res.cities,
      data: { ...res.point_koef, ...res.point_info },
      module_name: data.module_info.name,
      count_orders: count_orders,
      count_tables: count_tables
    });

    document.title = data.module_info.name;
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

  async changePoint(event, value) {
    const data = {
      point_id: value.id,
    };

    const res = await this.getData('get_one', data);

    this.setState({
      point: value,
      cities: res.cities,
      data: { ...res.point_koef, ...res.point_info },
    });
  }

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });
  }

  changeData(it, event) {
    const data = this.state.data;

    data[it] = event.target.value;

    this.setState({
      data,
    });
  }

  changeItemChecked(it, event) {
    const data = this.state.data;

    data[it] = event.target.checked === true ? 1 : 0;

    this.setState({
      data,
    });
  }

  async openModal(mark) {
    this.handleResize();

    const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

    const item = await this.getData('get_all_for_new');

    itemNew.cities = item.cities;

    this.setState({
      modalDialog: true,
      item: itemNew,
      mark,
    });
  }

  async save(item) {
    const mark = this.state.mark;

    let res;

    if (mark === 'new') {
      const data = item;

      delete data.cities;

      // console.log(data);

      res = await this.getData('save_new', data);
    } else {
      const data = this.state.data;

      data.point_id = data.id;

      // console.log(data);

      res = await this.getData('save_edit', data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }

  }

  async update() {
    const point_id = this.state.point.id;

    const data = {
      point_id,
    };

    const res = await this.getData('get_one', data);

    this.setState({
      cities: res.cities,
      data: { ...res.point_koef, ...res.point_info },
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

        <CafeDirEdit_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, mark: '' })}
          item={this.state.item}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        {/* кнопки и выбор точки */}
        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyAutocomplite
              label="Точка"
              multiple={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModal.bind(this, 'new')} variant="contained">
              Добавить точку
            </Button>
          </Grid>

        </Grid>

        {/* табы */}
        <Grid item xs={12} sm={12} mt={3} mb={5}>
          <TabContext value={this.state.ItemTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={this.changeTab.bind(this)} variant="fullWidth">
                <Tab label="Информация о точке" value="1" />
                <Tab label="Коэффициенты" value="2" />
              </TabList>
            </Box>

            <TabPanel value="1">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <MySelect
                    label="Город"
                    is_none={false}
                    data={this.state.cities}
                    value={this.state.data ? this.state.data.city_id : ''}
                    func={this.changeData.bind(this, 'city_id')}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Адрес"
                    value={this.state.data ? this.state.data.addr : ''}
                    func={this.changeData.bind(this, 'addr')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Район"
                    value={this.state.data ? this.state.data.raion : ''}
                    func={this.changeData.bind(this, 'raion')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Сортировка"
                    value={this.state.data ? this.state.data.sort : ''}
                    func={this.changeData.bind(this, 'sort')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="Организация"
                    value={this.state.data ? this.state.data.organization : ''}
                    func={this.changeData.bind(this, 'organization')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="ИНН"
                    value={this.state.data ? this.state.data.inn : ''}
                    func={this.changeData.bind(this, 'inn')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="ОГРН"
                    value={this.state.data ? this.state.data.ogrn : ''}
                    func={this.changeData.bind(this, 'ogrn')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    label="КПП"
                    value={this.state.data ? this.state.data.kpp : ''}
                    func={this.changeData.bind(this, 'kpp')}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <MyTextInput
                    label="Полный адрес"
                    value={this.state.data ? this.state.data.full_addr : ''}
                    func={this.changeData.bind(this, 'full_addr')}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyCheckBox
                    label="Активность"
                    value={this.state.data ? parseInt(this.state.data.is_active) == 1 ? true : false : false}
                    func={this.changeItemChecked.bind(this, 'is_active')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MySelect 
                    is_none={false} 
                    data={this.state.count_orders} 
                    value={this.state.data ? this.state.data.count_driver : ''} 
                    func={ this.changeData.bind(this, 'count_driver') } 
                    label='Количество заказов на руках у курьеров' />
                </Grid> 
                <Grid item xs={12} sm={4}>
                  <MySelect 
                    is_none={false} 
                    data={this.state.count_tables} 
                    value={this.state.data ? this.state.data.count_tables : ''} 
                    func={ this.changeData.bind(this, 'count_tables') } 
                    label='Количество столов сборки' />
                </Grid> 
              </Grid>
            </TabPanel>

            <TabPanel value="2">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент количества пиццы в час"
                    value={this.state.data ? this.state.data.k_pizza : ''}
                    func={this.changeData.bind(this, 'k_pizza')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для пиццы (кух раб)"
                    value={this.state.data ? this.state.data.k_pizza_kux : ''}
                    func={this.changeData.bind(this, 'k_pizza_kux')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Коэффициент мойки посуды для роллов (кух раб)"
                    value={this.state.data ? this.state.data.k_rolls_kux : ''}
                    func={this.changeData.bind(this, 'k_rolls_kux')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Оклад директора на 2 недели (с тек. периода)"
                    value={this.state.data ? this.state.data.dir_price : ''}
                    func={this.changeData.bind(this, 'dir_price')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Бонус от уровня директору (с тек. периода)"
                    value={this.state.data ? this.state.data.price_per_lv : ''}
                    func={this.changeData.bind(this, 'price_per_lv')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Часовая ставка курьера (применяется со следующего дня)"
                    value={this.state.data ? this.state.data.driver_price : ''}
                    func={this.changeData.bind(this, 'driver_price')}
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
          <Grid display='flex' sx={{ justifyContent: { sm: 'end', xs: 'start' }  }}>
            <Button onClick={this.save.bind(this)} color="success" variant="contained" style={{ whiteSpace: 'nowrap' }}>
              Сохранить изменения
            </Button>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function CafeDirEdit() {
  return <CafeDirEdit_ />;
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