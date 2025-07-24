import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

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

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, MyDatePickerNew, MySelect, MyTimePicker, MyTextInput, MyCheckBox, MyAlert, formatDate } from '@/ui/elements';

import dayjs from 'dayjs';

import { api_laravel } from '@/src/api_new';

class SitePush_Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      push: null,

      openAlert: false,
      err_status: true,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.push) {
      return;
    }

    if (this.props.push !== prevProps.push) {
      this.setState({
        push: this.props.push
      });
    }
  }

  async changeItem(data, event) {
    const push = this.state.push;
    const value = event.target.value;

    if (value.length > 50 && (data === 'title' || data === 'text')) {
      return;
    }

    push.this_push[data] = value;

    this.setState({
      push
    });
  }

  changeDateRange(data, event) {
    const push = this.state.push;

    push.this_push[data] = event ? event : '';

    this.setState({
      push
    });
  }

  changeAutocomplite(data, event, value) {
    const push = this.state.push;

    if(data === 'city_id' && !value.length) {
      push.this_push.it_id = 0;
      push.this_push.list = [];
      push.this_push.type = '';
    }

    push.this_push[data] = value;

    if(data === 'city_id') {

      const all_city = push.this_push[data].find(item => parseInt(item.id) === -1);

      if(all_city) {
        push.this_push.city_id = [];
  
        push.this_push.city_id.push(all_city);
      }

    }

    if(data === 'city_id' && parseInt(push.this_push.type) === 2) {

      push.this_push.it_id = 0;

      if(push.this_push.city_id.length > 1) {
        push.this_push.list = push.banners.filter(item => parseInt(item.city_id) === -1);
      } else {
        push.this_push.list = push.banners.reduce((newArr, item) => {
  
          let res = [];
  
          push.this_push.city_id.map((city) => {
  
            if(parseInt(city.id) === parseInt(item.city_id) || parseInt(item.city_id) === -1) {
              res.push(item);
            }
  
            return city;
          });
  
          return [...newArr,...res];
        }, []);
      }

    }

    this.setState({
      push,
    });
  }

  changeSelect(data, event) {
    const push = this.state.push;

    const value = event.target.value;

    if(!push.this_push.city_id.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город',
      });

      return;
    }
    
    if(parseInt(value) === 2) {

      if(push.this_push.city_id.length > 1) {
        push.this_push.list = push.banners.filter(item => parseInt(item.city_id) === -1);
      } else {
        push.this_push.list = push.banners.reduce((newArr, item) => {
  
          let res = [];
  
          push.this_push.city_id.map((city) => {
  
            if(parseInt(city.id) === parseInt(item.city_id) || parseInt(item.city_id) === -1) {
              res.push(item);
            }
  
            return city;
          });
  
          return [...newArr,...res];
        }, []);
      }
    }
    
    if(parseInt(value) === 3) {
      push.this_push.list = push.items;
    }
    
    push.this_push.it_id = 0;
    push.this_push[data] = event.target.value;

    this.setState({
      push,
    });
  }

  changeItemChecked(data, event) {
    const push = this.state.push;

    push.this_push[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      push
    });
  }

  save() {

    let push = this.state.push;

    if (!push.this_push.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;

    } 

    if (!push.this_push.time_start) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать время начала рассылки'
      });

      return;

    } 

    if (!push.this_push.title) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать заголовок'
      });

      return;

    } 

    if (!push.this_push.text) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать текст'
      });

      return;

    } 

    if (!push.this_push.type) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать тип рассылки'
      });

      return;

    } 

    if((parseInt(push.this_push.type) === 2 || parseInt(push.this_push.type) === 3) && !push.this_push.it_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать товар / акцию'
      });

      return;

    }

    if((parseInt(push.this_push.type) === 2 || parseInt(push.this_push.type) === 3)) {

      if(parseInt(push.this_push.type) === 2) {
        push.this_push.ban_id = push.this_push.it_id.id;
        push.this_push.item_id = 0;
      } else {
        push.this_push.item_id = push.this_push.it_id.id;
        push.this_push.ban_id = 0;
      }
    }

    if(parseInt(push.this_push.type) === 1) {
      push.this_push.item_id = 0;
      push.this_push.ban_id = 0;
    }

    delete push.this_push.it_id;
    delete push.this_push.list;

    push.this_push.date_start = dayjs(push.this_push.date_start).format('YYYY-MM-DD');

    const data = push.this_push;

    this.props.save(data);
    this.onClose();
  }

  onClose() {
    
    this.setState ({
      push: null,

      openAlert: false,
      err_status: true,
      err_text: ''
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, push_name } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'lg'}
        >
          <DialogTitle className="button">
            {method}
            {push_name ? `: ${push_name}` : null}
          </DialogTitle>

          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
            <CloseIcon />
          </IconButton>

          {!this.state.push ? null : (
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <MyTextInput
                    label="Название"
                    value={this.state.push.this_push.name}
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyDatePickerNew
                    label="Дата рассылки"
                    value={dayjs(this.state.push.this_push.date_start)}
                    func={this.changeDateRange.bind(this, 'date_start')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTimePicker
                    label='Время начала рассылки'
                    value={this.state.push.this_push.time_start}
                    func={this.changeItem.bind(this, 'time_start')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyTextInput
                    label="Заголовок"
                    value={this.state.push.this_push.title}
                    func={this.changeItem.bind(this, 'title')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyTextInput
                    label="Текст"
                    value={this.state.push.this_push.text}
                    func={this.changeItem.bind(this, 'text')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyAutocomplite
                    label="Город"
                    multiple={true}
                    data={this.state.push.cities}
                    value={this.state.push.this_push.city_id}
                    func={this.changeAutocomplite.bind(this, 'city_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MySelect
                    is_none={false}
                    label="Тип"
                    data={this.state.push.types}
                    value={this.state.push.this_push.type}
                    func={this.changeSelect.bind(this, 'type')}
                  />
                </Grid>

                {parseInt(this.state.push.this_push.type) === 2 || parseInt(this.state.push.this_push.type) === 3 ?
                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite
                      label="Товар / Акция"
                      multiple={false}
                      data={this.state.push.this_push.list}
                      value={this.state.push.this_push.it_id}
                      func={this.changeAutocomplite.bind(this, 'it_id')}
                    />
                  </Grid>
                  : 
                  <Grid item xs={6} sm={6} />
                }

                <Grid item xs={12} sm={4}>
                  <MyCheckBox
                    label="Активность"
                    value={parseInt(this.state.push.this_push.is_active) == 1 ? true : false}
                    func={this.changeItemChecked.bind(this, 'is_active')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyCheckBox
                    label="Разрешил рассылку"
                    value={parseInt(this.state.push.this_push.is_send) == 1 ? true : false}
                    func={this.changeItemChecked.bind(this, 'is_send')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyCheckBox
                    label="Авторизован в приложении"
                    value={parseInt(this.state.push.this_push.is_auth) == 1 ? true : false}
                    func={this.changeItemChecked.bind(this, 'is_auth')}
                  />
                </Grid>
               
              </Grid>
            </DialogContent>
          )}
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

class SitePush_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_push',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      active: [],
      non_active: [],

      active_copy: [],
      non_active_copy: [],

      fullScreen: false,

      modalDialog: false,
      method: '',
      mark: '',
      push: null,
      push_name: '',

      push_new: {
        name: '',
        date_start: formatDate(new Date()),
        time_start: '',
        is_send: 0,
        is_auth: 0,
        title: '',
        text: '',
        type: '',
        is_active: 0,
        it_id: 0,
        city_id: [],
        list: []
      },

      openAlert: false,
      err_status: true,
      err_text: ''

    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      active: data.push.active,
      non_active: data.push.non_active,
      active_copy: data.push.active,
      non_active_copy: data.push.non_active,
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

  async changeCity(event) {
    const city = event.target.value;

    let active = JSON.parse(JSON.stringify(this.state.active_copy));
    let non_active = JSON.parse(JSON.stringify(this.state.non_active_copy));
    
    if(parseInt(city) !== -1) {
      active = active.filter(item => item.city_id.includes(city) || item.city_id.includes('-1'));
      non_active = non_active.filter(item => item.city_id.includes(city || '-1') || item.city_id.includes('-1'));
    }

    this.setState({
      city,
      active,
      non_active,
    });
  }

  async update() {
    const res = await this.getData('get_all');

    this.setState({
      active: res.push.active,
      non_active: res.push.non_active,
      active_copy: res.push.active,
      non_active_copy: res.push.non_active,
    });
  }

  async openModal(mark, method, push_id) {
    this.handleResize();

    if (mark === 'push_new') {

      const push = await this.getData('get_all_for_new');

      push.this_push = JSON.parse(JSON.stringify(this.state.push_new));
      push.types = [{ id: 1, name: 'Простое уведомление'}, { id: 2, name: 'Открыть акцию'}, { id: 3, name: 'Открыть товар'}];

      this.setState({
        push,
        mark,
        method,
        modalDialog: true,
      });
    }

    if (mark === 'push_edit') {

      const data = {
        push_id,
      };

      const push = await this.getData('get_one', data);

      push.types = [{ id: 1, name: 'Простое уведомление'}, { id: 2, name: 'Открыть акцию'}, { id: 3, name: 'Открыть товар'}];

      if(parseInt(push.this_push.ban_id)) {
        push.this_push.it_id = push.banners.find(ban => parseInt(ban.id) === parseInt(push.this_push.ban_id)) ?? 0;

        if(push.this_push.city_id.length > 1) {
          push.this_push.list = push.banners.filter(item => parseInt(item.city_id) === -1);
        } else {
          push.this_push.list = push.banners.reduce((newArr, item) => {
    
            let res = [];
    
            push.this_push.city_id.map((city) => {
    
              if(parseInt(city.id) === parseInt(item.city_id) || parseInt(item.city_id) === -1) {
                res.push(item);
              }
    
              return city;
            });
    
            return [...newArr,...res];
          }, []);
        }
      }

      if(parseInt(push.this_push.item_id)) {
        push.this_push.it_id = push.items.find(item => parseInt(item.id) === parseInt(push.this_push.item_id)) ?? 0;
        push.this_push.list = push.items;
      }

      this.setState({
        push,
        mark,
        method,
        modalDialog: true,
        push_name: push.this_push.name
      });
    }
  }

  async change_active(key, id, event) {
    const active = this.state.active;
    const value = event.target.checked === true ? 1 : 0;

    active.forEach((item) => {
      if (parseInt(item.id) === parseInt(id)) {
        item[key] = value;
      }
    });
    
    this.setState({
      active,
    });

    const data = {
      id,
      is_active: value,
    };

    const res = await this.getData('save_active', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(async () => {
        this.update();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async saveNew(push) {
    
    const data = {
      ...push
    }

    const res = await this.getData('save_new', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
      });

      setTimeout(async () => {
        this.update();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  
  }

  async saveEdit(push) {

    const data = {
      ...push
    }

    const res = await this.getData('save_edit', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
      });

      setTimeout(async () => {
        this.update();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

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

        <SitePush_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={this.state.method}
          mark={this.state.mark}
          push={this.state.push}
          push_name={this.state.push_name}
          fullScreen={this.state.fullScreen}
          save={this.state.mark === 'push_new' ? this.saveNew.bind(this) : this.saveEdit.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}><h1>{this.state.module_name}</h1></Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              label="Город"
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModal.bind(this, 'push_new', 'Новая рассылка')} variant="contained">
              Добавить рассылку
            </Button>
          </Grid>

          {/* таблица активных рассылок */}
          {!this.state.active.length ? null : (
            <Grid item xs={12} sm={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={8}><h2>Активные</h2></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ width: '10%' }}>#</TableCell>
                      <TableCell style={{ width: '18%' }}>Название</TableCell>
                      <TableCell style={{ width: '18%' }}>Город</TableCell>
                      <TableCell style={{ width: '18%' }}>Дата старта</TableCell>
                      <TableCell style={{ width: '18%' }}>Время старта</TableCell>
                      <TableCell style={{ width: '18%' }}>Активность</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.active.map((item, key) => (
                      <TableRow key={key} hover>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell onClick={this.openModal.bind(this, 'push_edit', 'Редактирование рассылки', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                          {item.name}
                        </TableCell>
                        <TableCell>{item.city_name}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.time_start}</TableCell>
                        <TableCell>
                          <MyCheckBox
                            value={parseInt(item.is_active) == 1 ? true : false}
                            func={this.change_active.bind(this, 'is_active', item.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица неактивных рассылок */}
          {!this.state.non_active.length ? null : (
            <Grid item xs={12} sm={12}>
              <Accordion pb={10}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>Не активные</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ overflow: 'hidden' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '20%' }}>#</TableCell>
                          <TableCell style={{ width: '20%' }}>Название</TableCell>
                          <TableCell style={{ width: '20%' }}>Город</TableCell>
                          <TableCell style={{ width: '20%' }}>Дата старта</TableCell>
                          <TableCell style={{ width: '20%' }}>Время старта</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.non_active.map((item, key) => (
                          <TableRow key={key} hover>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell onClick={this.openModal.bind(this, 'push_edit', 'Редактирование рассылки', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>{item.name}</TableCell>
                            <TableCell>{item.city_name}</TableCell>
                            <TableCell>{item.date_start}</TableCell>
                            <TableCell>{item.time_start}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function SitePush() {
  return <SitePush_ />;
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
