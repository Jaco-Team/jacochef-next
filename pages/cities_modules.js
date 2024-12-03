import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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

import { MyTextInput, MySelect, MyCheckBox } from '@/ui/elements';

import queryString from 'query-string';

class CitiesModules_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
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

    item.city[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.city[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item.city);

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
          {this.props.method}{this.props.itemName ? `: ${this.props.itemName}` : null}
          {this.props.fullScreen ? (
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            {this.props.mark === 'newItem' ? (
              <>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Название города"
                    value={this.state.item ? this.state.item.city.name : ''}
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Склонение города (Меня нет в ...)"
                    value={this.state.item ? this.state.item.city.name_2 : ''}
                    func={this.changeItem.bind(this, 'name_2')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    label="Адрес (URL)"
                    value={this.state.item ? this.state.item.city.link : ''}
                    func={this.changeItem.bind(this, 'link')}
                  />
                </Grid>
              </>
            ) : null}

            <Grid item xs={12} sm={6}>
              <MySelect
                label="Уровень цен"
                is_none={false}
                data={this.state.item ? this.state.item.lavel_price : []}
                value={this.state.item ? this.state.item.city.price_lavel_id : ''}
                func={this.changeItem.bind(this, 'price_lavel_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Телефон контакт-центра"
                value={this.state.item ? this.state.item.city.phone : ''}
                func={this.changeItem.bind(this, 'phone')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Коэф. роллов для бонуса (С текущего периода)"
                value={this.state.item ? this.state.item.city.k_rolls : ''}
                func={this.changeItem.bind(this, 'k_rolls')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Коэф. пиццы для бонуса (С текущего периода)"
                value={this.state.item ? this.state.item.city.k_pizza : ''}
                func={this.changeItem.bind(this, 'k_pizza')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                type={'number'}
                label="Сумма вознагрождения курьеру за завершенный заказ в радиусе"
                value={this.state.item ? this.state.item.city.driver_dop_price : ''}
                func={this.changeItem.bind(this, 'driver_dop_price')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                type={'number'}
                label="Радиус в метрах в пределах которого положено вознагрождение"
                value={this.state.item ? this.state.item.city.driver_dop_price_radius : ''}
                func={this.changeItem.bind(this, 'driver_dop_price_radius')}
              />
            </Grid>

            {this.props.mark === 'editItem' ? (
              <Grid item xs={12} sm={3}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.city.is_show) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_show')}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CitiesModules_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'cities_modules',
      module_name: '',
      is_load: false,

      cities: [],

      fullScreen: false,

      modalDialog: false,
      method: '',
      mark: '',
      item: null,
      itemName: '',

      itemNew: {
        name: '',
        name_2: '',
        link: '',
        price_lavel_id: '',
        phone: '',
        k_rolls: '',
        k_pizza: '',
      },
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
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

  async save(item) {

    if (this.state.mark === 'newItem') {

      const data = item;

      // console.log(data);

      await this.getData('save_new', data);
    }

    if (this.state.mark === 'editItem') {

      const data = {
        city_id: item.id,
        lavel_price: item.price_lavel_id,
        phone: item.phone,
        k_rolls: item.k_rolls,
        k_pizza: item.k_pizza,
        is_show: item.is_show,
        driver_dop_price: item.driver_dop_price,
        driver_dop_price_radius: item.driver_dop_price_radius,
      }

      // console.log(data);

      await this.getData('save_edit', data);
    }

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
    });
  }

  async openModal(mark, method, id) {
    this.handleResize();

    if (mark === 'newItem') {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData('get_all_for_new');

      item.city = itemNew;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === 'editItem') {
      const data = {
        city_id: id,
      };

      const item = await this.getData('get_one', data);

      this.setState({
        itemName: item.city.name,
        modalDialog: true,
        method,
        mark,
        item,
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <CitiesModules_Modal
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
            <Button onClick={this.openModal.bind(this, 'newItem', 'Новый город')} variant="contained">
              Добавить город
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '5%' }}>#</TableCell>
                    <TableCell style={{ width: '30%' }}>Название города</TableCell>
                    <TableCell style={{ width: '30%' }}>Уровень цен</TableCell>
                    <TableCell style={{ width: '35%' }}>Активность</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.cities.map((item, key) => (
                    <TableRow key={key} hover>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell onClick={this.openModal.bind(this, 'editItem', 'Редактирование города', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.lavel_name}</TableCell>
                      <TableCell >{parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}</TableCell>
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

export default function CitiesModules() {
  return <CitiesModules_ />;
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
