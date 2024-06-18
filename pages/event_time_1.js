import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

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

import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';

import {MySelect, MyAutocomplite2, MyTimePicker, MyDatePickerNew, MyAlert} from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class EventTime1_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      data: [],
      
      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.event);

    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      const data = [];

      for (let i = 5; i <= 300; i += 5) {
        data.push({ id: `${i}`, name: `${i}` });
      }

      this.setState({
        item: this.props.event,
        data,
      });
    }
  }

  changeItem(data, event, value) {
    const item = this.state.item;


    if( data == 'time_dev' ){
      if( !value ){
        value = event.target.value;
        console.log( event.target.value )
      }
      console.log( data, event, value )
    }

    item[data] = value;

    this.setState({
      item,
    });
  }

  changeTime(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeDateRange(data, value) {
    const item = this.state.item;

    item[data] = value ? (value) : '';

    this.setState({
      item,
    });
  }

  save() {
    const message = 'Необходимо заполнить все данные!';

    let item = this.state.item

    if (this.props.mark === 'newDay' && (!item.date || !item.time_start || !item.time_end || !item.time_dev)) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: message,
      });

      return;
    }

    if ((this.props.mark === 'newEvent' || this.props.mark === 'editEvent') && 
    (!item.time_start || !item.time_end || !item.time_dev)) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: message,
      });

      return;
    }

    item.date = dayjs(item.date).format('YYYY-MM-DD'),

    this.props.save(item, this.props.mark);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: this.props.event ? this.props.event : null,
      data: [],
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
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} />

        <Dialog
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={this.props.mark !== 'newDay' ? 'md' : 'lg'}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'normal' }}>{this.props.method}</Typography>
            {this.props.fullScreen ? (
              <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3} mb={3} item xs={12}>
              {this.props.mark !== 'newDay' ? null : (
                <Grid item sm={3} xs={12}>
                  <MyDatePickerNew
                    label="Дата"
                    value={this.state.item?.date ? dayjs(this.state.item.date) : null}
                    func={this.changeDateRange.bind(this, 'date')}
                  />
                </Grid>
              )}

              <Grid item sm={this.props.mark !== 'newDay' ? 4 : 3} xs={6}>
                <MyTimePicker
                  value={this.state.item ? this.state.item.time_start : ''}
                  func={this.changeTime.bind(this, 'time_start')}
                  label="Время начала"
                />
              </Grid>

              <Grid item sm={this.props.mark !== 'newDay' ? 4 : 3} xs={6}>
                <MyTimePicker
                  value={this.state.item ? this.state.item.time_end : ''}
                  func={this.changeTime.bind(this, 'time_end')}
                  label="Время окончания"
                />
              </Grid>

              <Grid item sm={this.props.mark !== 'newDay' ? 4 : 3} xs={12}>
                <MyAutocomplite2
                  label="Время на доставку"
                  multiple={false}
                  freeSolo={true}
                  func={this.changeItem.bind(this, 'time_dev')}
                  onBlur={this.changeItem.bind(this, 'time_dev')}
                  data={this.state.data}
                  value={this.state.item ? this.state.item.time_dev : ''}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.save.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class EventTime1_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'event_time_1',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      modalDialog: false,
      method: '',
      mark: '',
      fullScreen: false,

      item: [],
      itemData: [],

      itemNew: {
        dow: '',
        zone_id: '',
        time_start: '',
        time_end: '',
        time_dev: '',
      },

      event: null,

      cardData: [
        {
          day_id: '1',
          day_week: 'Понедельник',
          data: [],
        },
        {
          day_id: '2',
          day_week: 'Вторник',
          data: [],
        },
        {
          day_id: '3',
          day_week: 'Среда',
          data: [],
        },
        {
          day_id: '4',
          day_week: 'Четверг',
          data: [],
        },
        {
          day_id: '5',
          day_week: 'Пятница',
          data: [],
        },
        {
          day_id: '6',
          day_week: 'Суббота',
          data: [],
        },
        {
          day_id: '7',
          day_week: 'Воскресенье',
          data: [],
        },
      ],
    };
  }

  async componentDidMount() {
    const itemData = JSON.parse(JSON.stringify(this.state.cardData));

    const data = await this.getData('get_all');

    const zone = {
      zone_id: data.points[0].id,
    };

    const res = await this.getData('get_data', zone);

    res.dows.forEach((item) => {
      itemData.forEach((el) => {
        if (item.dow === el.day_id) {
          el.data.push(item);
        }
      });
    });

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      itemData,
      item: res.other_days,
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

  async changePoint(event) {

    const zone_id = event.target.value;

    if(event.target.value) {

      const itemData = JSON.parse(JSON.stringify(this.state.cardData));
  
      const zone = {
        zone_id,
      };
  
      const res = await this.getData('get_data', zone);
  
      res.dows.forEach((item) => {
        itemData.forEach((el) => {
          if (item.dow === el.day_id) {
            el.data.push(item);
          }
        });
      });
  
      this.setState({
        point: zone_id,
        item: res.other_days,
        itemData,
      });

    } else {

      this.setState({
        point: zone_id,
        item: [],
        itemData: [],
      });

    }

  }

  openModal(method, mark, item) {
    this.handleResize();

    if (mark === 'newDay') {

      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      itemNew.zone_id = this.state.point;

      this.setState({
        modalDialog: true,
        method,
        mark,
        event: itemNew,
      });
    }

    if (mark === 'newEvent') {

      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      itemNew.zone_id = this.state.point;

      itemNew.dow = item.day_id;

      method = `${item.day_week} ${method}`;

      this.setState({
        modalDialog: true,
        method,
        mark,
        event: itemNew,
      });
    }

    if (mark === 'editEvent') {

      this.setState({
        modalDialog: true,
        method,
        mark,
        event: item,
      });
    }
  }

  async saveItem(item, mark) {

    item.time = `${item.time_start}-${item.time_end}`

    if (mark === 'newDay') {
      await this.getData('save_new_cur_other', item);
    }

    if (mark === 'newEvent') {
      await this.getData('save_new_cur', item);
    }

    if (mark === 'editEvent') {
      await this.getData('save_edit_cur_time', item);
    }

    this.update();

  }

  async deleteItem(time_id, mark, event) {
    event.stopPropagation();

    const data = {
      time_id,
    };

    if (mark === 'time') {
      await this.getData('del_time', data);
    }

    if (mark === 'time_other') {
      await this.getData('del_time_other', data);
    }

    this.update();
  }

  async update() {
    const zone_id = this.state.point;

    const itemData = JSON.parse(JSON.stringify(this.state.cardData));

    const zone = {
      zone_id,
    };

    const res = await this.getData('get_data', zone);

    res.dows.forEach((item) => {
      itemData.forEach((el) => {
        if (item.dow === el.day_id) {
          el.data.push(item);
        }
      });
    });

    this.setState({
      item: res.other_days,
      itemData,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
        </Grid>

        {/* модалка */}
        <EventTime1_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={this.state.method}
          event={this.state.event}
          save={this.saveItem.bind(this)}
          mark={this.state.mark}
          fullScreen={this.state.fullScreen}
        />

        {/* выбор и кнопка */}
        <Grid container spacing={3} justifyContent="center" className='container_first_child'>
          <Grid item xs={12} sm={3}></Grid>
          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Button variant="contained" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal.bind(this, 'Особый день', 'newDay')}>
              Добавить особый день
            </Button>
          </Grid>

          {/* аккардион */}
          {!this.state.item.length ? null : (
            <Grid item sm={5} xs={12} mb={3}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                  <Typography style={{ whiteSpace: 'nowrap' }}> Особые дни </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Accordion>
                    <TableContainer>
                      <Table size="small" style={{ whiteSpace: 'nowrap' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: '30%' }}>Дата</TableCell>
                            <TableCell style={{ width: '30%' }}>Время</TableCell>
                            <TableCell style={{ width: '30%' }}>Доставка</TableCell>
                            <TableCell style={{ width: '10%' }}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody sx={{ '& td': { border: 0 }, borderBottom: 1, borderColor: 'divider' }}>
                        {this.state.item.map((item, key) => (
                            <TableRow  key={key + 100}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.time_start} - {item.time_end}</TableCell>
                              <TableCell>{item.time_dev}</TableCell>
                              <TableCell><CloseIcon onClick={this.deleteItem.bind(this, item.id, 'time_other')} style={{ cursor: 'pointer' }}/></TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Accordion>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>

        {/* карточки/таблица */}
        {!this.state.itemData.length ? null : (
          <Grid container item xs={12} spacing={3}>
            {this.state.itemData.map((item, key) => (
              <Grid item sm={3} xs={12} key={key}>
                <Card variant="outlined" sx={{ border: 1, boxShadow: 1, borderRadius: 2, p: 2, marginBottom: key === 6 ? 10 : '' }}>
                  <Grid align="center">{item.day_week}</Grid>
                  <Divider />
                  <Table size="small" style={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ maxWidth: '40%' }}>Время</TableCell>
                        <TableCell style={{ maxWidth: '40%' }}>Доставка</TableCell>
                        <TableCell style={{ maxWidth: '20%' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ '& td': { border: 0 }, borderBottom: 1, borderColor: 'divider' }}>
                    {item.data.map((item, key) => (
                        <TableRow key={key + 100} style={{ cursor: 'pointer' }} onClick={this.openModal.bind(this, 'Редактирование времени', 'editEvent', item)}>
                          <TableCell>{item.time_start} - {item.time_end}</TableCell>
                          <TableCell>{item.time_dev}</TableCell>
                          <TableCell style={{ padding: 0 }}>
                            <CloseIcon onClick={this.deleteItem.bind(this, item.id, 'time')} />
                          </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                  <Button size="sm" fullWidth={true} onClick={this.openModal.bind(this, '- текущие заказы', 'newEvent', item)}>
                    Добавить
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </>
    );
  }
}

export default function EventTime1() {
  return <EventTime1_ />;
}
