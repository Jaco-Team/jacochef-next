import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {MySelect, MyDatePickerNew, MyTextInput, MyAlert, formatDate} from '@/ui/elements';

import queryString from 'query-string';

class CheckCheck_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.orders) {
      return;
    }

    if (this.props.orders !== prevProps.orders) {
      this.setState({
        orders: this.props.orders,
      });
    }
  }

  onClose() {
    this.setState({
      orders: [],
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: 'bold' }}>Заказы</Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Номер заказа</TableCell>
                  <TableCell>Точка</TableCell>
                  <TableCell>Дата/Время заказа</TableCell>
                  <TableCell>Тип заказа</TableCell>
                  <TableCell>Сумма заказа</TableCell>
                  <TableCell>Выбрать</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.orders.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.addr}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.sum}</TableCell>
                    <TableCell>
                      <Button style={{ cursor: 'pointer' }} onClick={this.props.selectOrder.bind(this, item.id)}>
                        <CheckCircleIcon className="icon" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button style={{ color: '#DC143C' }} onClick={this.onClose.bind(this)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CheckCheck_Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.orders);

    if (!this.props.orders) {
      return;
    }

    if (this.props.orders !== prevProps.orders) {
      this.setState({
        orders: this.props.orders,
      });
    }
  }

  componentDidMount() {
    this.setState({
      orders: this.props.orders,
    });
  }

  render() {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Номер заказа</TableCell>
              <TableCell>Точка</TableCell>
              <TableCell>Тип заказа</TableCell>
              <TableCell>Номер кассы</TableCell>
              <TableCell>Сумма заказа</TableCell>
              <TableCell>Дата/Время заказа</TableCell>
              <TableCell>Найти заказ</TableCell>
              <TableCell>Сохранить</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.orders.map((item, key) => (
              <TableRow key={key}>
                <TableCell>{key + 1}</TableCell>
                <TableCell>
                  <MyTextInput
                    value={item.order_id}
                    func={this.props.changeOrderId.bind(this, item.id)}
                  />
                </TableCell>
                <TableCell>{item.addr}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.kassa}</TableCell>
                <TableCell>{item.sum}</TableCell>
                <TableCell>{item.date} {item.time}</TableCell>
                <TableCell>
                  <Button onClick={this.props.openModal.bind(this, item.sum, item.date, item.point_id, item.id)}>
                    <OpenInNewIcon className="icon" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={this.props.saveOrder.bind(this, item.id, item.order_id, item.point_id)}>
                    <SaveIcon className="icon" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

class CheckCheck_ extends React.Component {
  constructor(props) {
    super(props);

    let date_start = new Date();
    date_start.setDate(date_start.getDate() - 5);

    this.state = {
      module: 'check_check',
      module_name: '',
      is_load: false,

      point_list: [],
      type_list: [],
      kassa_list: [],

      date_start: formatDate(date_start),
      date_end: formatDate(new Date()),

      point_id: '',
      type: '',
      kassa: '',

      openAlert: false,
      err_status: true,
      err_text: '',

      allOrder: [],

      order_id: '',

      modalOrder: false,
      fullScreen: false,
      orders: [],
    };
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
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
        console.log(err);
      });
  };

  async componentDidMount() {
    const res = await this.getData('get_points');

    this.setState({
      kassa_list: res.kassa_list,
      point_list: res.point_list,
      type_list: res.type_list,
      module_name: res.module_info.name,
    });

    document.title = res.module_info.name;
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

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? formatDate(event) : '',
    });
  }

  changeSort(type, event) {
    this.setState({
      [type]: event.target.value,
    });
  }

  // получение заказов по указанному фильтру
  async getOrder() {
    const data = {
      date_start: this.state.date_start,
      date_end: this.state.date_end,
      point_id: this.state.point_id,
      type: this.state.type,
      kassa: this.state.kassa,
    };

    const res = await this.getData('show', data);

    // console.log('getOrder res', res);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    } else {
      if (res.orders.length) {
        this.setState({
          allOrder: res.orders,
        });
      } else {
        this.setState({
          openAlert: true,
          err_status: true,
          err_text: 'Заказы за указанный период отсутствуют',
        });
      }
    }
  }

  // модалка заказов
  async openModal(sum, date, point_id, order_id) {
    this.handleResize();

    const data = {
      sum,
      point_id,
      date,
      type: this.state.type,
    };

    const res = await this.getData('find_order', data);

    // console.log(res);

    this.setState({
      modalOrder: true,
      orders: res.orders,
      order_id,
    });
  }

  // выбор заказа в модалке
  selectOrder(id) {
    const allOrder = this.state.allOrder;
    const order_id = this.state.order_id;

    allOrder.map((el) => order_id === el.id ? (el.order_id = id) : el.order_id);

    this.setState({
      modalOrder: false,
      order_id: '',
      allOrder,
    });
  }

  // изменения в ручную номера заказа в таблице
  changeOrderId(id, event) {
    const allOrder = this.state.allOrder;

    allOrder.map((el) => id === el.id ? (el.order_id = event.target.value) : el.order_id);

    this.setState({
      allOrder,
    });
  }

  // сохранении order_id
  async saveOrder(id, order_id, point_id) {
    let data = {
      id: id,
      order_id: order_id,
      point_id: point_id,
    };

    // console.log(data);

    const res = await this.getData('saveItem', data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Данные успешно сохранены!',
      });

      setTimeout(() => {
        this.getOrder();
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
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <CheckCheck_Modal
          open={this.state.modalOrder}
          onClose={() => this.setState({ modalOrder: false })}
          fullScreen={this.state.fullScreen}
          orders={this.state.orders}
          selectOrder={this.selectOrder.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Начало периода"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Конец периода"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button onClick={this.getOrder.bind(this)} variant="contained">
              Выполнить
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Точка"
              is_none={false}
              data={this.state.point_list}
              value={this.state.point_id}
              func={this.changeSort.bind(this, 'point_id')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Тип"
              is_none={false}
              data={this.state.type_list}
              value={this.state.type}
              func={this.changeSort.bind(this, 'type')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Касса"
              is_none={false}
              data={this.state.kassa_list}
              value={this.state.kassa}
              func={this.changeSort.bind(this, 'kassa')}
            />
          </Grid>

          <Grid item xs={12}>
            <CheckCheck_Table
              orders={this.state.allOrder}
              openModal={this.openModal.bind(this)}
              saveOrder={this.saveOrder.bind(this)}
              changeOrderId={this.changeOrderId.bind(this)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function CheckCheck() {
  return <CheckCheck_ />;
}
