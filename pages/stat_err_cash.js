import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';

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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import ModalImage from "react-modal-image";

import { MySelect, MyDatePickerNew, MyAlert, MyTextInput, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';
import {api_laravel, api_laravel_local} from "@/src/api_new";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

class StatErrCash_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

      confirmDialog: false,
      confirmDialogDel: false,
      dialogEdit: false,
      staffs: [],
      newStaff: '',
      percent: 0,

      openAlert: false,
      err_status: true,
      err_text: '',
      answer: '',
      acces: {},
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }

    // this.setState({
    //   acces: this.props.acces,
    // });

    // console.log(this.props.item)
  }

  openConfirm(percent) {
    this.setState({
      confirmDialog: true,
      percent,
      answer: ''
    });
  }

  openConfirmDel(){
    this.setState({
      confirmDialogDel: true,
      answer: ''
    });
  }

  async clearItem() {
    const item = this.state.item;

    const type = this.state.percent;

    this.setState({
      confirmDialog: false,
    });

    if (this.props.mark === 'errOrder') {
      const data = {
        date: item.date_close,
        point_id: item.point_id,
        type,
        user_id: item.user_id,
        row_id: item.row_id,
        err_id: item.err_id,
        answer: this.state.answer
      };

      const res = await this.props.getData('clear_order', data);

      if (res.st) {
        this.onClose();
        this.props.update();
      } else {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      }
    }

    if (this.props.mark === 'errCam') {
      const data = {
        date: item.date,
        point_id: item.point_id,
        type,
        err_id: item.id,
        answer: this.state.answer
      };

      const res = await this.props.getData('clear_cam', data);

      if (res.st) {
        this.onClose();
        this.props.update();
      } else {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      }
    }
  }

  async delItem() {
    const item = this.state.item;

    this.setState({
      confirmDialogDel: false,
    });

    if (this.props.mark === 'errOrder') {
      const data = {
        date: item.date_close,
        point_id: item.point_id,
        user_id: item.user_id,
        row_id: item.row_id,
        err_id: item.err_id,
        answer: this.state.answer
      };

      const res = await this.props.getData('del_order', data);

      if (res.st) {
        this.onClose();
        this.props.update();
      } else {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      }
    }

    if (this.props.mark === 'errCam') {
      const data = {
        date: item.date,
        point_id: item.point_id,
        err_id: item.id,
        answer: this.state.answer
      };

      const res = await this.props.getData('del_cam', data);

      if (res.st) {
        this.onClose();
        this.props.update();
      } else {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      }
    }
  }

  onClose() {
    this.setState({
      item: this.props.item ? this.props.item : null,
      percent: 0,
      err_status: true,
      err_text: '',
      answer: ''
    });

    this.props.onClose();
  }

  search(event, value) {
    let search = event?.target?.value ? event.target.value : value ? value : '';
    this.setState({newStaff: value})
  }

  getStaffs = async () => {
    const item = this.state.item;
    this.setState({newStaff: ''});
    const data = {
      point_id: item.point_id,
      err_id: item.id,
      date: item.date_time_order ? item.date_time_order : item.date,
    };

    const res = await this.props.getData('get_staffs', data);
    this.setState({dialogEdit: true, staffs: res.staffs});
  }

  changeStaffs = async () => {
    const item = this.state.item;
    let flag = 'order';

    if (!item.date_time_order) {
      flag = 'camera';
    }

    const data = {
      point_id: item.point_id,
      err_id: item.id,
      row_id: item.row_id ?? 0,
      staff: this.state.newStaff,
      answer: this.state.answer,
      flag
    };

    const res = await this.props.getData('edit_staff', data);
    if (res.st) {
        this.setState({
          dialogEdit: false,
          answer: '',
          staffs: '',
        }, () => {this.props.update()});
      } else {
        this.setState({
          openAlert: true,
          err_status: res.st,
          answer: '',
          err_text: res.text,
        });
      }
  }

  render() {
    const { acces } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false }) }
          status={this.state.err_status}
          text={this.state.err_text} />

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="xs"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <p style={{ marginBottom: 20 }}>Уменьшить штраф на {this.state.percent}% ?</p>

            <MyTextInput
              label="Причина"
              value={this.state.answer}
              multiline={true}
              maxRows={5}
              func={ event => { this.setState({ answer: event.target.value }) } }
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false }) }>
              Отмена
            </Button>
            <Button onClick={this.clearItem.bind(this)}>Снять</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
          maxWidth="xs"
          open={this.state.confirmDialogDel}
          onClose={() => this.setState({ confirmDialogDel: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <p style={{ marginBottom: 20 }}>Удалить штраф ?</p>

            <MyTextInput
              label="Причина"
              value={this.state.answer}
              multiline={true}
              maxRows={5}
              func={ event => { this.setState({ answer: event.target.value }) } }
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialogDel: false }) }>
              Отмена
            </Button>
            <Button onClick={this.delItem.bind(this)}>Снять</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.dialogEdit}
          onClose={() => this.setState({ dialogEdit: false })}
        >
          <DialogTitle>Изменить сотрудника</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <h4>Сотрудник</h4>
            <Autocomplete
              freeSolo={true}
              size="small"
              disableCloseOnSelect={true}
              options={this.state.staffs}
              getOptionLabel={(option) => option?.staff_name ?? ''}
              value={this.state.newStaff}
              onChange={this.search.bind(this)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={'Поиск'}
                  onChange={(event) => this.search(event)}
                />
              )}
              renderOption={(props, option) => (
                  <li {...props} key={option.user_id}>
                    <div>
                      <strong>{option.staff_name}</strong>
                      <span style={{marginLeft: 4, fontSize: '12px'}}>({option.appointment_name})</span>
                    </div>
                  </li>
              )}
            />
            <h4>Укажите причину</h4>
            <MyTextInput
              label="Причина"
              value={this.state.answer}
              multiline={true}
              maxRows={5}
              func={ event => { this.setState({ answer: event.target.value }) } }
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ dialogEdit: false }) }>
              Отмена
            </Button>
            <Button onClick={this.changeStaffs}>Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            {this.props.method} №{this.props.mark === 'errOrder' ? this.state.item ? this.state.item.order_id : 'Отсутствует' : this.state.item ? this.state.item.id : 'Отсутствует'}
            {this.props.fullScreen ? (
              <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

            <Grid container spacing={3} justifyContent="center" mb={3}>

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Сотрудник</Typography>
                <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                  {this.props.mark === 'errOrder' ? this.state.item ? this.state.item.full_user_name : 'Не указан' : this.state.item ? this.state.item.user_name : 'Не указан'}
                  {parseInt(acces?.close_err) == 1 &&
                    <IconButton onClick={this.getStaffs}>
                      <Tooltip title={<Typography color="inherit">Редактировать</Typography>}>
                        <EditIcon/>
                      </Tooltip>
                    </IconButton>}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                  {this.props.mark === 'errOrder' ? 'Дата заказа' : 'Дата время ошибки'}
                </Typography>
                <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                  {this.props.mark === 'errOrder' ? this.state.item ? this.state.item.date_time_order : 'Не указана' : this.state.item ? `${this.state.item.date} 
                  ${this.state.item.time}` : 'Не указано'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={12} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {this.props.mark === 'errOrder' ? 'Комментарий оператора' : 'Ошибка'}
                </Typography>
                <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                  {this.props.mark === 'errOrder' ? this.state.item ? this.state.item.order_desc : 'Не указана' : this.state.item ? this.state.item.fine_name : 'Не указан'}
                </Typography>
              </Grid>

              {this.props.mark !== 'errCam' ? null : (
              <Grid item xs={12} sm={12} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Комментарий</Typography>
                <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                  {this.state.item ? this.state.item.comment ?? 'Не указан' : 'Не указан'}
                </Typography>
              </Grid>
              )}

              {this.props.mark !== 'errOrder' ? null : (
                <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
                  <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Позиция</Typography>
                  <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                    {this.state.item ? this.state.item.item_name : 'Не указана'}
                  </Typography>
                </Grid>
              )}

              {this.props.mark !== 'errOrder' ? null : (
                <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
                  <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Этап</Typography>
                  <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                    {this.state.item ? this.state.item.stage_name : 'Не указан'}
                  </Typography>
                </Grid>
              )}

              {this.props.mark !== 'errOrder' ? null : (
                <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
                  <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ошибка</Typography>
                  <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                    {this.state.item ? this.state.item.pr_name : 'Не указана'}
                  </Typography>
                </Grid>
              )}

              {this.props.mark !== 'errOrder' ? null : (
                <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center">
                  <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Сумма</Typography>
                  <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                    {this.state.item ? this.state.item.my_price : 'Не указана'}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Фото ошибки</Typography>
                <Grid sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                  {this.props.mark === 'errOrder' ? this.state.item ? !this.state.item.imgs.length ? 'Фото отсутствует' : (
                        <ModalImage
                          small={'https://jacochef.ru/src/img/err_orders/uploads/' + this.state.item.imgs[0]}
                          large={'https://jacochef.ru/src/img/err_orders/uploads/' + this.state.item.imgs[0]}
                          hideDownload={true}
                          hideZoom={false}
                          showRotate={true}
                        />
                      )
                      : 'Фото отсутствует'
                  : this.state.item ? !this.state.item.imgs.length ? 'Фото отсутствует' : (
                        <ModalImage
                          small={'https://jacochef.ru/src/img/fine_err/uploads/' + this.state.item.imgs[0]}
                          large={'https://jacochef.ru/src/img/fine_err/uploads/' + this.state.item.imgs[0]}
                          hideDownload={true}
                          hideZoom={false}
                          showRotate={true}
                        />
                    ) : 'Фото отсутствует'}
                </Grid>
              </Grid>
              {parseInt(acces?.close_err) ? (
                <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Grid mb={5}>
                  <Button variant="contained" onClick={this.openConfirm.bind(this, '50')} style={{ minWidth: '130px' }}>Снять 50%</Button>
                </Grid>
                <Grid mb={5}>
                  <Button variant="contained" onClick={this.openConfirm.bind(this, '100')} style={{ minWidth: '130px' }}>Снять 100%</Button>
                </Grid>
                <Grid>
                  <Button variant="contained" onClick={this.openConfirmDel.bind(this)} style={{ minWidth: '130px' }}>Удалить</Button>
                </Grid>
              </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.onClose.bind(this)}>
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class StatErrCash_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'stat_err_cash',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',
      acces: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      stat_true: '',
      stat_false: '',

      svod: [],
      svod_new: [],

      all_data: [],
      all_data_new: [],

      all_data_new_stat: '',

      modalDialog: false,
      method: '',
      mark: '',
      item: null,
      fullScreen: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      acces: data.acces
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

  getData = (method, data = {}, dop_type = {}) => {

    this.setState({
      is_load: true,
    });

    return api_laravel(this.state.module, method, data, dop_type)
        .then(result => {
        return result.data;
        })
        .finally(() => {
          setTimeout(() => {
            this.setState({
              is_load: false,
            });
          }, 500);
        });
  }

  async changePoint(event) {
    const point = event.target.value;

    const date_start = dayjs(this.state.date_start).format('YYYY-MM-DD')
    const date_end = dayjs(this.state.date_end).format('YYYY-MM-DD')

    this.setState({
      point,
    });

    if (!date_start || !date_end) {
      return;
    }

    const data = {
      point_id: point,
      date_start,
      date_end,
    };

    const res = await this.getData('get_data', data);

    this.setState({
      stat_true: res.stat_true_false.tru,
      stat_false: res.stat_true_false.fals,
      svod: res.svod,
      svod_new: res.svod_new,
      all_data: res.all_data,
      all_data_new: res.all_data_new,
      all_data_new_stat: res.all_data_new_stat,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? (event) : '',
    });
  }

  async openModal(mark, method, item) {
    this.handleResize();
    const data = {
      point_id: this.state.point,
      err_id: mark === 'errOrder' ? item.err_id : item.id,
      mark,
    };

    const res = await this.getData('get_data_one', data);

    if (mark === 'errOrder') {
      this.setState({
        modalDialog: true,
        method,
        mark,
        item: res.item,
      });
    }

    if (mark === 'errCam') {
      this.setState({
        modalDialog: true,
        method,
        mark,
        item: res.item,
      });
    }
  }

  async getItems() {
    const point_id = this.state.point;

    const date_start = dayjs(this.state.date_start).format('YYYY-MM-DD')
    const date_end = dayjs(this.state.date_end).format('YYYY-MM-DD')

    if (!date_start || !date_end) {
      return;
    }

    const data = {
      point_id,
      date_start,
      date_end,
    };

    const res = await this.getData('get_data', data);

    // console.log(res);

    this.setState({
      stat_true: res.stat_true_false.tru,
      stat_false: res.stat_true_false.fals,
      svod: res.svod,
      svod_new: res.svod_new,
      all_data: res.all_data,
      all_data_new: res.all_data_new,
      all_data_new_stat: res.all_data_new_stat,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <StatErrCash_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          getData={this.getData.bind(this)}
          update={this.getItems.bind(this)}
          fullScreen={this.state.fullScreen}
          acces={this.state.acces}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.getItems.bind(this)} variant="contained">
              Показать ошибки
            </Button>
          </Grid>
        </Grid>

        {/* клиенты */}
        {!this.state.stat_false && !this.state.stat_true ? null : (
          <Grid container spacing={3} justifyContent="center" mt={3} mb={3}>
            <Grid item xs={12} sm={4}>
              <TableContainer>
                <Typography sx={{ fontWeight: 'bold' }} align="center">Клиенты</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '50%' }} align="center">Довольные</TableCell>
                      <TableCell style={{ width: '50%' }} align="center">Недовольные</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <TableRow>
                      <TableCell align="center">{this.state.stat_true}</TableCell>
                      <TableCell align="center">{this.state.stat_false}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}

        {/* аккордионы */}
        {!this.state.svod.length && !this.state.svod_new.length ? null : (
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            {!this.state.svod.length ? null : (
              <Grid item xs={12} sm={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                    <Typography style={{ fontWeight: 'bold' }}>Общие данные (заказы)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: '40%' }} align="center">Сотрудник</TableCell>
                            <TableCell style={{ width: '30%' }} align="center">Кол-во ошибок</TableCell>
                            <TableCell style={{ width: '30%' }} align="center">Сумма ошибок</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {this.state.svod.map((item, key) => (
                            <TableRow key={key} hover>
                              <TableCell align="center">{item.user_name}</TableCell>
                              <TableCell align="center">{item.count}</TableCell>
                              <TableCell align="center">{item.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            {!this.state.svod_new.length ? null : (
              <Grid item xs={12} sm={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                    <Typography style={{ fontWeight: 'bold' }}>Общие данные (камеры)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ width: '40%' }} align="center">Сотрудник</TableCell>
                            <TableCell style={{ width: '30%' }} align="center">Кол-во ошибок</TableCell>
                            <TableCell style={{ width: '30%' }} align="center">Сумма ошибок</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {this.state.svod_new.map((item, key) => (
                            <TableRow key={key} hover>
                              <TableCell align="center">{item.user_name}</TableCell>
                              <TableCell align="center">{item.count}</TableCell>
                              <TableCell align="center">{item.price}</TableCell>
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
        )}

        {/* таблицы */}
        {!this.state.all_data.length && !this.state.all_data_new.length ? null : (
          <Grid container mt={3} spacing={3}>
          {!this.state.all_data_new.length ? null : (
          <Grid item xs={12} sm={12} sx={{ marginBottom: 5 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ fontWeight: 'bold' }}>Все данные (камеры)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">Сотрудник</TableCell>
                    <TableCell align="center">Дата внесения ошибки</TableCell>
                    <TableCell align="center">Дата и время совершения ошибки</TableCell>
                    <TableCell align="center">Ошибка</TableCell>
                    <TableCell align="center">Сумма ошибки</TableCell>
                    <TableCell align="center">Обжалована</TableCell>
                    <TableCell align="center">Изменина сумма</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ fontWeight: 'bold' }}>Кол-во не обработанных ошибок: {this.state.all_data_new_stat}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.all_data_new.map((item, key) => (
                    <TableRow key={key} hover style={{ cursor: 'pointer', backgroundColor: parseInt(item.is_delete) == 1 ? 'red' : '#fff' }} onClick={this.openModal.bind(this, 'errCam', 'Ошибка', item)}>
                      <TableCell align="center">{item.user_name}</TableCell>
                      <TableCell align="center">{item.date_close}</TableCell>
                      <TableCell align="center">{item.date} {item.time}</TableCell>
                      <TableCell align="center">{item.fine_name}</TableCell>
                      <TableCell align="center">{item.price}</TableCell>
                      <TableCell align="center">{ parseInt(item.change_win) == 1 ? <CheckIcon /> : null }</TableCell>
                      <TableCell align="center">{ parseInt(item.change_sum) == 1 ? <CheckIcon /> : null }</TableCell>
                      <TableCell align="center">{item.answer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          )}

            {!this.state.all_data.length ? null : (
              <Grid item xs={12} sm={12} sx={{ marginBottom: 5 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={8} sx={{ fontWeight: 'bold' }}>Все данные (заказы)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center">Сотрудник</TableCell>
                        <TableCell align="center">Номер заказа</TableCell>
                        <TableCell align="center">Дата заказа</TableCell>
                        <TableCell align="center">Позиция</TableCell>
                        <TableCell align="center">Ошибка</TableCell>
                        <TableCell align="center">Довоз</TableCell>
                        <TableCell align="center">Сумма ошибки</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_data.map((item, key) => (
                        <TableRow key={key} hover style={{ cursor: 'pointer', backgroundColor: parseInt(item.is_delete) == 1 ? 'red' : '#fff' }} onClick={this.openModal.bind(this, 'errOrder', 'Ошибка по заказу', item)}>
                          <TableCell align="center">{item.full_user_name}</TableCell>
                          <TableCell align="center">{item.order_id}</TableCell>
                          <TableCell align="center">{item.date_time_order}</TableCell>
                          <TableCell align="center">{item.item_name}</TableCell>
                          <TableCell align="center">{item.pr_name}</TableCell>
                          <TableCell align="center">{!item.new_order_id ? null : <DirectionsCarIcon />}</TableCell>
                          <TableCell align="center">{item.my_price}</TableCell>
                          <TableCell align="center">{item.answer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

          </Grid>
        )}
      </>
    );
  }
}

export default function StatErrCash() {
  return <StatErrCash_ />;
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
