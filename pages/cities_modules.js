import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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

import { MyTextInput, MySelect, MyCheckBox, MyAlert, MyDatePickerNew } from '@/ui/elements';

import { api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';

class CitiesModules_Levels_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date_start: dayjs(),
      selectedLevel: null,
      levels: [
        { id: 0, name: 'Не выбран' },
        { id: 1, name: 'Уровень 1' },
        { id: 2, name: 'Уровень 2' },
        { id: 3, name: 'Уровень 3' },
        { id: 4, name: 'Уровень 4' },
        { id: 5, name: 'Уровень 5' },
        { id: 6, name: 'Уровень 6' },
        { id: 7, name: 'Уровень 7' },
      ],
    };
    
  }

  componentDidUpdate(prevProps) {
    const { kassir_lavel } = this.props;

    if (kassir_lavel && prevProps.kassir_lavel !== kassir_lavel) {

      this.setState({
        date_start: kassir_lavel.date_start && kassir_lavel.date_start !== '0000-00-00' ? dayjs(kassir_lavel.date_start) : dayjs(),
        selectedLevel: kassir_lavel.kassir_lavel,
      });
    }
  }

  changeDate = (date) => {
    this.setState({ date_start: date || dayjs() });
  };

  changeLevel = (event) => {
    this.setState({ selectedLevel: event.target.value });
  };

  save = () => {
    const { date_start, selectedLevel } = this.state;
    const { kassir_lavel, openAlert, onSave } = this.props;

    if (!date_start.isValid() || date_start.isBefore(dayjs(), 'day')) {
      openAlert(false, 'Сохранение возможно только при указании сегодняшней или будущей даты');

      return;
    }

    let date = '';

    if(selectedLevel !== 0) {
      date = date_start.format('YYYY-MM-DD');
    }
    
    const data = {
      city_id: kassir_lavel.city_id,
      date_start: date,
      kassir_lavel: selectedLevel,
    };

    onSave(data);
    this.close();
  };

  close = () => {
    this.setState({ date_start: dayjs(), selectedLevel: null });
    this.props.onClose();
  };

  render() {
    const { open, fullScreen, kassir_lavel } = this.props;
    const { date_start, levels, selectedLevel } = this.state;

    return (
      <Dialog
        open={open}
        onClose={this.close}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Город: {kassir_lavel?.city_name ?? ''}<br/>
          Выберите уровень кассира и укажите дату с которой будут действовать изменения
          <IconButton onClick={this.close} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <MyDatePickerNew
                label="Дата изменений"
                value={date_start}
                func={this.changeDate}
              />
            </Grid>

            <Grid item xs={12}>
              <MySelect
                label="Уровень кассира за регистрацию"
                is_none={false}
                data={levels}
                value={selectedLevel}
                func={this.changeLevel}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="success" onClick={this.save}>
            Сохранить изменения
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

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

    const city = item.city;

    if (this.props.mark === 'newItem') {

      if (!city.name || city.name.trim() === '') {
  
        this.props.openAlert(false, 'Название города не указано');
  
        return;
      }
    
      if (!city.name_2 || city.name_2.trim() === '') {
  
        this.props.openAlert(false, 'Склонение не указано');
  
        return;
      }
    
      if (!city.link || city.link.trim() === '') {
  
        this.props.openAlert(false, 'Адрес не указан');
  
        return;
      }

    }

    this.props.save(city);

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
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
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
          <Button variant="contained" color="success" onClick={this.save.bind(this)}>
            Сохранить изменения
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

      openAlert: false,
      err_status: false,
      err_text: '',

      modalDialog_lavel: false,
      kassir_lavel: null,
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

  async save(item) {

    let res;

    if (this.state.mark === 'newItem') {

      const data = item;

      res = await this.getData('save_new', data);
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

      res = await this.getData('save_edit', data);
    }

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.update();
    }
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

  openAlert (status, text) {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };

  async openLevels (city_id) {
    this.handleResize();

    const city_name = this.state.cities.find(item => parseInt(item.id) === parseInt(city_id))?.name || '';

    const data = {
      city_id,
    };

    let res = await this.getData('get_kassir_lavel', data);

    res.kassir_lavel.city_name = city_name;

    this.setState({
      modalDialog_lavel: true,
      kassir_lavel: res.kassir_lavel,
    });

  };

  async saveLevel (data) {
    const res = await this.getData('save_kassir_lavel', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.update();
    }
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

        <CitiesModules_Levels_Modal
          open={this.state.modalDialog_lavel}
          kassir_lavel={this.state.kassir_lavel}
          onSave={this.saveLevel.bind(this)}
          onClose={() => this.setState({ modalDialog_lavel: false })}
          openAlert={this.openAlert.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <CitiesModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
          openAlert={this.openAlert.bind(this)}
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
                    <TableCell style={{ width: '8%' }}>#</TableCell>
                    <TableCell style={{ width: '23%' }}>Название города</TableCell>
                    <TableCell style={{ width: '23%' }}>Уровень цен</TableCell>
                    <TableCell style={{ width: '23%' }}>Уровень кассира за регистрацию</TableCell>
                    <TableCell style={{ width: '23%' }}>Активность</TableCell>
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
                      <TableCell>
                        <IconButton onClick={this.openLevels.bind(this, item.id)} title='Редактировать уровень кассира' disableRipple disableFocusRipple>
                           <Typography component="span" sx={{ display: 'table-cell', verticalAlign: 'inherit', textAlign: 'left', fontSize: '1rem !important', color: 'rgba(0,0,0,0.87)', fontWeight: 700}}>
                            {item.actual_lavel == null ? 'Не выбран' :  `Текущий - ${item.actual_lavel} уровень с ${item.actual_date}` }
                            <br />
                            {item.next_lavel == null ? '' :  `Будущий - ${item.next_lavel} уровень с ${item.next_date}` }
                          </Typography>
                        </IconButton>
                      </TableCell>
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
