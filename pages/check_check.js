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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArchiveIcon from '@mui/icons-material/Archive';

import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import {MySelect, MyDatePickerNew, MyAlert, MyAutocomplite, formatDateReverse} from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';

const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

class CheckCheck_Accordion extends React.Component {
  render() {
    const { data, type } = this.props;

    return (
      <Box>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              width="100%"
            >
              <Typography sx={{ fontWeight: 'bold' }}>{type}</Typography>

              <Stack direction="row" spacing={1}>
                <Typography>Наличные за период:</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {formatNumber(data?.all_cash ?? 0)} ₽
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Typography>Безнал за период:</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {formatNumber(data?.all_bank ?? 0)} ₽
                </Typography>
              </Stack>

            </Stack>
          </AccordionSummary>

          <AccordionDetails>
   
            {data?.days.map((day) => (
              <Accordion key={day.date} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" justifyContent="space-between" width="100%">

                    <Typography sx={{ fontWeight: 'bold' }}>{formatDateReverse(day.date)}</Typography>

                    <Stack direction="row" spacing={1}>
                      <Typography>Наличные за день:</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {formatNumber(day.summ_cash ?? 0)} ₽
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Typography>Безнал за день:</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {formatNumber(day.summ_bank ?? 0)} ₽
                      </Typography>
                    </Stack>

                  </Stack>
                </AccordionSummary>

                <AccordionDetails>
                  <Paper elevation={1} sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Касса</TableCell>
                          <TableCell align="right">Наличные</TableCell>
                          <TableCell align="right">Безнал</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {day.kass.map((k) => (
                          <TableRow key={k.kassa}>
                            <TableCell component="th" scope="row"> {`${k.kassa}${k.kassa === 2 ? ' (онлайн)' : ''}`}</TableCell>
                            <TableCell align="right">{formatNumber(k.summ_cash ?? 0)} ₽</TableCell>
                            <TableCell align="right">{formatNumber(k.summ_bank ?? 0)} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }
}

class CheckCheck_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order_id: '',
      type_pay: '',
      confirmDialog: false,
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

  openConfirm = (order_id, type_pay) => {
    this.setState({
      confirmDialog: true,
      order_id,
      type_pay
    });
  }

  save = () => {
    this.setState ({
      confirmDialog: false
    });

    this.props.saveOrder(this.props.order?.id, this.state.order_id, this.state.type_pay, this.props.order?.summ_check);

    this.onClose();
  }

  onClose = () => {
    this.setState({
      orders: [],
      confirmDialog: false,
      order_id: '',
      type_pay: '',
    });

    this.props.onClose();
  }

  render() {

    const { orders, confirmDialog } = this.state;
    const { order, open, fullScreen } = this.props;

    return (
      <>
        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Сохранить данные выбранного заказа ?</DialogContent>
          <DialogActions>
            <Button autoFocus variant="contained" onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button variant="contained" color='success' onClick={this.save}>Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'lg'}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: 'bold' }}>Выбрать из списка подходящий заказ</Typography>
            <IconButton onClick={this.onClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>

            <Grid item xs={12} sm={6} display="flex" flexDirection="column" marginBottom={2}>
              <Grid display="flex" flexDirection="row">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: 2 }}>Дата/Время заказа:</Typography>
                <Typography sx={{ whiteSpace: 'nowrap' }}>{order?.date} {order?.time}</Typography>
              </Grid>

              <Grid display="flex" flexDirection="row">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: 2 }}>Сумма заказа:</Typography>
                <Typography sx={{ whiteSpace: 'nowrap' }}>{formatNumber(order?.summ_check ?? 0)} ₽</Typography>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={5}>Список заказов</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Номер заказа</TableCell>
                    <TableCell>Дата/Время заказа</TableCell>
                    <TableCell>Сумма заказа</TableCell>
                    <TableCell>Выбрать</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{formatNumber(item.summ_check ?? 0)} ₽</TableCell>
                      <TableCell>
                        <IconButton title={'Сохранить'} onClick={()=>this.openConfirm(item.id, item.type_pay)}>
                          <ArchiveIcon sx={{ color: '#c03' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </DialogContent>

          <DialogActions>
            <Button variant="contained" onClick={this.onClose}>
              Закрыть
            </Button>
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class CheckCheck_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'check_check',
      module_name: '',
      is_load: false,

      points: [],
      kass: [],

      date_start: dayjs(),
      date_end: dayjs(),

      point_id: '',
      kassa: [],

      openAlert: false,
      err_status: true,
      err_text: '',

      complete_data: [],
      summ_ofd: null,
      summ_chef: null,

      order: null,
      modalOrder: false,
      fullScreen: false,
      orders: [],

      isAccordionOpen: false,

      confirmDialog: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      kass: data.kass,
      points: data.points,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
        
    this.setState({
      is_load: true,
    });

    let res = api_laravel_local(this.state.module, method, data)
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

  handleResize = () => {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  };

  changeDateRange = (field, newDate) => {
    this.setState({ [field]: newDate });
  };

  changeSort = (type, event) => {
    this.setState({
      [type]: event.target.value,
    });
  };

  changeKass = (data, event, value) => {
    this.setState({
      [data]: value,
    });
  }

  check_data() {
    let { date_start, date_end, point_id, kassa, points } = this.state;

    if (!date_start || !date_end || !point_id || !Array.isArray(kassa) || kassa.length === 0) {
      this.openAlert(false, 'Необходимо заполнить даты начала и конца, указать точку и выбрать кассу');
      return null;
    }

    const formattedStart = dayjs(date_start).format('YYYY-MM-DD');
    const formattedEnd = dayjs(date_end).format('YYYY-MM-DD');

    const point = points.find(it => parseInt(it.id, 10) === parseInt(point_id, 10));

    return {
      date_start: formattedStart,
      date_end: formattedEnd,
      point,
      kassa,
    };
  }

  getOrders = async () => {
    const data = this.check_data();
    if (!data) return;

    const res = await this.getData('get_orders', data);

    if (!res.st) {

      this.openAlert(false, res.text);

    } else {

      this.setState({
        complete_data: res.complete_data,
        summ_ofd: res.summ_ofd,
        summ_chef: res.summ_chef,
      });

    }

  };

  openModal = async (summ, date, order) => {
    this.handleResize();

    const { point_id, points } = this.state;

    const point = points.find(it => parseInt(it.id) === parseInt(point_id));

    const data = {
      summ,
      point,
      date,
    };

    const res = await this.getData('find_order', data);

    this.setState({
      modalOrder: true,
      orders: res.orders,
      order,
    });
  };

  saveOrder = async (id, order_id, type_pay, summ) => {

    const { point_id, points } = this.state;
    const point = points.find(it => parseInt(it.id) === parseInt(point_id));
    const type = parseInt(type_pay) === 1 ? 'sum_cash' : 'sum_bank';

    const data = {
      id,
      order_id,
      point,
      type,
      summ
    };

    const res = await this.getData('save_order', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 300);
    }

  }

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };

  handleAccordionChange = (event, isExpanded) => {
    this.setState({ isAccordionOpen: isExpanded });
  };

  set_orders = async () => {
    const data = this.check_data();
    if (!data) return;

    const res = await this.getData('set_orders', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 300);
    }
  };

  check_data_for_1C = async () => {
    const data = this.check_data();
    if (!data) return;

    const res = await this.getData('check_data_1C', data);

    if(res.st) {  

      this.setState({
        confirmDialog: true,
      });

    } else {
      this.openAlert(res.st, res.text);
    }

  };

  upload_data_1C = async (type) => {

    this.setState({
      confirmDialog: false,
    });

    const data = this.check_data();
    if (!data) return;

    data.type = type;      

    const res = await this.getData('upload_data_1C', data);

    this.openAlert(res.st, res.text);
  };

  render() {
    const { is_load, openAlert, err_status, err_text, modalOrder, fullScreen, orders, module_name, date_start, date_end, points, kass, point_id, kassa, complete_data, order, summ_ofd, summ_chef, confirmDialog} = this.state;

    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Выберите действие</DialogTitle>
          <DialogContent>
            <List>
              <ListItemButton
                onClick={() => this.upload_data_1C('export')}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary="Выгрузить данные в 1С"
                  primaryTypographyProps={{ fontWeight: 'medium', color: 'primary.main' }}
                />
              </ListItemButton>
              <ListItemButton
                onClick={() => this.upload_data_1C('clear')}
                sx={{
                  bgcolor: '#c03',
                  mb: 1,
                  border: '1px solid #a00',
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#b02' },
                }}
              >
                <ListItemText
                  primary="Очистить данные в 1С и после выгрузить данные в 1С"
                  primaryTypographyProps={{ fontWeight: 'medium', color: '#fff' }}
                />
              </ListItemButton>
            </List>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
          </DialogActions>
        </Dialog>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />

        <CheckCheck_Modal
          open={modalOrder}
          onClose={() => this.setState({ modalOrder: false, orders: [], order: null })}
          fullScreen={fullScreen}
          orders={orders}
          order={order}
          saveOrder={this.saveOrder}
        />
       
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Начало периода"
              value={date_start}
              func={newDate => this.changeDateRange('date_start', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Конец периода"
              value={date_end}
              func={newDate => this.changeDateRange('date_end', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              label="Точка"
              is_none={false}
              data={points}
              value={point_id}
              func={event => this.changeSort('point_id', event)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Касса"
              multiple={true}
              data={kass}
              value={kassa}
              func={(event, value) => this.changeKass('kassa', event, value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button onClick={this.getOrders} variant="contained">
              Показать
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.set_orders} variant="contained" sx={{ whiteSpace: 'nowrap'}} color="success">
              Расставить номера заказов / суммы
            </Button>
          </Grid>

          <Grid item xs={12} sm={3} container justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Button onClick={this.check_data_for_1C} variant="contained" color="info" sx={{ whiteSpace: 'nowrap' }}>
              Выгрузить в 1С
            </Button>
          </Grid>

          {!complete_data.length ? null :
            <Grid item xs={12} sm={12} mb={summ_ofd ? 0 : 5}>
              <Accordion
                style={{ width: '100%' }}
                expanded={complete_data.length > 100 ? false : this.state.isAccordionOpen}
                onChange={complete_data.length > 100 ? undefined : this.handleAccordionChange}
                disabled={complete_data.length > 100}
              >
                <AccordionSummary expandIcon={complete_data.length > 100 ? null : <ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Проверка на заполненность данных
                    </Typography>
                    <Tooltip title="Количество заказов" arrow>
                      <Chip label={complete_data.length} color="primary" size="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                {complete_data.length <= 100 &&
                  <AccordionDetails>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Номер кассы </TableCell>
                          <TableCell>Сумма заказа</TableCell>
                          <TableCell>Дата / время</TableCell>
                          <TableCell>Найти заказ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {complete_data.map((it, k) =>
                          <TableRow hover key={k}>
                            <TableCell>{k + 1}</TableCell>
                            <TableCell>{it.kassa}</TableCell>
                            <TableCell>{formatNumber(it.summ_check ?? 0)} ₽</TableCell>
                            <TableCell>{it.date} {it.time}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => this.openModal(it.summ_check, it.date, it)}>
                                <ReceiptLongIcon sx={{ color: '#c03' }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                }
              </Accordion>
            </Grid>
          }

          {!summ_ofd ? null :
            <Grid item xs={12} sm={6} mb={5}>
              <CheckCheck_Accordion
                data={summ_ofd}
                type='Суммы из выгруженного ОФД'
              />
            </Grid>
          }

          {!summ_chef ? null :
            <Grid item xs={12} sm={6} mb={5}>
              <CheckCheck_Accordion
                data={summ_chef}
                type='Суммы из системы ШЕФ'
              />
            </Grid>
          }
         
        </Grid>
      </>
    );
  }
}

export default function CheckCheck() {
  return <CheckCheck_ />;
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
