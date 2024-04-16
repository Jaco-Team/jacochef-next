import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import Avatar from '@mui/material/Avatar';

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

import {MyAlert, MySelect, MyTextInput, MyDatePickerNew, formatDate, MyCheckBox} from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

class Kkt_Info_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rn_kkt: '',
      fn: '',
      kassa: '',
      dop_kassa: '',
      base: '',
      is_active: 1,
      kass: [
        { id: '1', name: '1' },
        { id: '2', name: '2' },
        { id: '3', name: '3' },
        { id: '4', name: '4' },
        { id: '5', name: '5' },
        { id: '6', name: '6' },
      ],
      dop_kass: [
        { id: '1', name: '1' },
        { id: '2', name: '2' },
        { id: '3', name: '3' },
        { id: '4', name: '4' },
        { id: '5', name: '5' },
        { id: '6', name: '6' },
      ],
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.kkt !== prevProps.kkt) {
      if (this.props.type === 'update_kkt') {
        const { kkt } = this.props;

        this.setState({
          date_start: formatDate(kkt.date_start),
          date_end: formatDate(kkt.date_end),
          rn_kkt: kkt.rn_kkt,
          fn: kkt.fn,
          kassa: kkt.kassa,
          dop_kassa: kkt.dop_kassa,
          base: kkt.base,
          is_active: parseInt(kkt.is_active),
        });
      }
    }
  }

  changeItem(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeSelect(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;
    this.setState({
      [data]: value,
    });
  }

  close_modal() {
    const type = this.props.type;

    const data = {
      date_start: dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM-DD'),
      rn_kkt: this.state.rn_kkt,
      fn: this.state.fn,
      kassa: this.state.kassa,
      dop_kassa: this.state.dop_kassa,
      base: this.state.base,
      is_active: this.state.is_active,
    };

    if (type === 'add_kkt') {
      this.props.add_kkt(data);
    } else {
      const { kkt } = this.props;
      data.id = kkt.id;
      this.props.update_kkt(data);
    }

    this.onClose();
  }

  onClose() {
    this.setState({
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rn_kkt: '',
      fn: '',
      kassa: '',
      dop_kassa: '',
      base: '',
      is_active: 1,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle style={{ display: 'flex', alignItems: 'center' }}>
          <Typography>Точка:{' '}<span style={{ fontWeight: 'bold' }}>{this.props.pointModal}</span></Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', marginLeft: 'auto' }}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                data={this.state.kass}
                value={this.state.kassa}
                func={this.changeSelect.bind(this, 'kassa')}
                label="Номер кассы"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                data={this.state.dop_kass}
                value={this.state.dop_kassa}
                func={this.changeSelect.bind(this, 'dop_kassa')}
                label="Доп касса"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="РН ККТ"
                value={this.state.rn_kkt}
                func={this.changeItem.bind(this, 'rn_kkt')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="ФН"
                value={this.state.fn}
                func={this.changeItem.bind(this, 'fn')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyDatePickerNew
                label="Дата регистрации"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, 'date_start')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyDatePickerNew
                label="Дата окончания"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, 'date_end')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="База"
                value={this.state.base}
                func={this.changeItem.bind(this, 'base')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyCheckBox
                value={parseInt(this.state.is_active) === 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'is_active')}
                label="Активность"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.close_modal.bind(this)}>
            {this.props.type === 'update_kkt' ? 'Сохранить изменения' : 'Добавить кассу'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Kkt_Info_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'kkt_info',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      kkt: [],
      kkt_update: null,

      type: '',
      pointModal: '',
      modalDialog: false,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.get_kkt();
    }, 100);
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
          window.location.pathname = '/auth';
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

  changePoint(event) {
    const data = event.target.value;

    this.setState({
      point: data,
    });

    setTimeout(() => {
      this.get_kkt();
    }, 50);
  }

  async get_kkt() {
    const point_id = this.state.point;

    const data = {
      point_id,
    };

    const res = await this.getData('get_kkt', data);

    res.kkt.sort((a, b) => parseInt(a.kassa) - parseInt(b.kassa));

    this.setState({
      kkt: res.kkt,
    });
  }

  async openModal(type, kkt) {
    this.handleResize();

    const points = this.state.points;

    const point_id = this.state.point;

    const pointModal = points.find((it) => it.id === point_id).name;

    if (type === 'add_kkt') {
      this.setState({
        type,
        pointModal,
        modalDialog: true,
      });
    }

    if (type === 'update_kkt') {
      this.setState({
        type,
        kkt_update: kkt,
        pointModal,
        modalDialog: true,
      });
    }
  }

  async add_kkt(data) {
    data.point_id = this.state.point;

    //const res = await this.getData('save_new', data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Касса успешно добавлена',
      });

      setTimeout(() => {
        this.get_kkt();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  async update_kkt(data) {

    const res = await this.getData('save_edit', data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Данные кассы изменены',
      });

      setTimeout(() => {
        this.get_kkt();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Kkt_Info_Modal
          type={this.state.type}
          open={this.state.modalDialog}
          pointModal={this.state.pointModal}
          kkt={this.state.kkt_update}
          onClose={() => this.setState({ modalDialog: false })}
          fullScreen={this.state.fullScreen}
          add_kkt={this.add_kkt.bind(this)}
          update_kkt={this.update_kkt.bind(this)}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={this.get_kkt.bind(this)}>
              Обновить данные
            </Button>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button variant="contained" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal.bind(this, 'add_kkt')}>
              Добавить кассу
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} mt={3} mb={5}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={6} style={{ fontWeight: 700 }}>Кассы</TableCell>
                  </TableRow>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ minWidth: '150px' }}>№ кассы</TableCell>
                    <TableCell>РН ККТ</TableCell>
                    <TableCell>ФН</TableCell>
                    <TableCell style={{ minWidth: '200px' }}>Дата регистрации</TableCell>
                    <TableCell style={{ minWidth: '200px' }}>Дата окончания</TableCell>
                    <TableCell>Активность</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.kkt.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell onClick={this.openModal.bind(this, 'update_kkt', item)}
                        style={{cursor: 'pointer', fontWeight: 700, color: '#c03', textDecoration: 'underline'}}>
                        {item.kassa}
                      </TableCell>
                      <TableCell>{item.rn_kkt}</TableCell>
                      <TableCell>{item.fn}</TableCell>
                      <TableCell>{item.date_start}</TableCell>
                      <TableCell>{item.date_end}</TableCell>
                      <TableCell>
                        {item.is_active === '0' ? (
                          <Avatar style={{ backgroundColor: '#000' }} variant="rounded" sx={{ width: 24, height: 24 }}>
                            <CloseIcon style={{ color: '#fff' }} />
                          </Avatar>
                        ) : (
                          <Avatar style={{ backgroundColor: '#c03' }} variant="rounded" sx={{ width: 24, height: 24 }}>
                            <CheckIcon style={{ color: '#fff' }} />
                          </Avatar>
                        )}
                      </TableCell>
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

export default function KktInfo() {
  return <Kkt_Info_ />;
}
