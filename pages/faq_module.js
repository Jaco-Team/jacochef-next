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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, MyDatePickerNew, formatDate, MyAlert } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class FAQ_Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      item: null,

      openAlert: false,
      err_status: true,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        push: this.props.pushыв
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

class FAQ_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'faq_module',
      module_name: '',
      is_load: false,

      points: [],
      point: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      arrayOrdersByH: null,
      data: null,
      statAllItemsCount: null,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');
    console.log("🚀 === data:", data);

    this.setState({
      // points: data.points,
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

  async addSection() {
    console.log('addSection');
  }

  async addArt() {
    console.log('addArt');
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

          <Grid item xs={12} sm={4}>
            <Button onClick={this.addSection.bind(this)} variant="contained">
              Добавить раздел
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.addArt.bind(this)} variant="contained">
              Добавить статью
            </Button>
          </Grid>
             
        </Grid>
      </>
    );
  }
}

export default function FAQ() {
  return <FAQ_ />;
}
