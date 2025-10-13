import React, {Fragment} from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';

import {MySelect, MyTextInput, MyDatePickerNewViews, MyDateTimePickerNew} from '@/components/shared/Forms';

import { api_laravel_local, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // импортируем русскую локаль
import handleUserAccess from '@/src/helpers/access/handleUserAccess';
import TestAccess from '@/components/shared/TestAccess';
import MyAlert from '@/components/shared/MyAlert';
import { formatDateMin } from '@/src/helpers/ui/formatDate';

// для редактирования времени (при этом дату нельзя редактировать)
class DateWithEditableTimePicker extends React.PureComponent {

  handleTimeChange = (newTime) => {
    const { value, onChange } = this.props;
    if (!newTime) return;
    if (value) {
      const fixedDate = dayjs(value).format('YYYY-MM-DD');
      const updated = dayjs(`${fixedDate} ${dayjs(newTime).format('HH:mm')}`);
      onChange(updated);
    }
  };

  render() {
    const { value, labelDate, labelTime, disabled, ...rest } = this.props;
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField
            label={labelDate || "Дата"}
            value={value ? dayjs(value).format("YYYY-MM-DD") : ''}
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
          />
          <TimePicker
            label={labelTime || "Время"}
            value={value || null}
            onChange={this.handleTimeChange}
            disabled={disabled}
            ampm={false}
            views={['hours', 'minutes']}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { readOnly: true },
              },
            }}
            disableClearable
            {...rest}
          />
        </div>
      </LocalizationProvider>
    );
  }
}

class Lamps_Modal_Add extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_id: '',
      number: '',
      name: '',
      resource: '',
      place: '',
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.lampEdit);

    if (!this.props.lampEdit) {
      return;
    }

    if (this.props.lampEdit !== prevProps.lampEdit) {
      this.setState({
        active_id: this.props.lampEdit?.id ?? '',
        number: this.props.lampEdit?.number ?? '',
        name: this.props.lampEdit?.name ?? '',
        resource: this.props.lampEdit?.resource ?? '',
        place: this.props.lampEdit?.place ?? '',
      });
    }
  }

  changeItem(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  add() {
    const data = {
      id: this.state.active_id,
      number: this.state.number,
      name: this.state.name,
      resource: this.state.resource,
      place: this.state.place,
    };
    

    this.props.add(data);

    //this.onClose();
  }

  onClose() {
    this.setState({
      active_id: '',
      number: '',
      name: '',
      resource: '',
      place: '',
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
        <DialogTitle style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
           
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Порядковый номер"
                value={this.state.number}
                func={this.changeItem.bind(this, 'number')}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Модель"
                value={this.state.name}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Ресурс (часов)"
                value={this.state.resource}
                type={'number'}
                func={this.changeItem.bind(this, 'resource')}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Где размещена"
                value={this.state.place}
                func={this.changeItem.bind(this, 'place')}
              />
            </Grid>
              
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.add.bind(this)}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Lamps_Modal_Add_Active extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_id: '',
      lamp_id: '',
      time_start: null,
      time_end: null,
      name_lamp: '',
      confirmDialog: false,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.itemEdit);

    if (!this.props.itemEdit) {
      return;
    }

    if (this.props.itemEdit !== prevProps.itemEdit) {
      this.setState({
        name_lamp: this.props.itemEdit?.name ?? '',
        active_id: this.props.typeActive === 'edit' ? this.props.itemEdit?.id ?? '' : '',
        lamp_id: this.props.typeActive === 'edit' ? this.props.itemEdit?.lamp_id ?? '' : this.props.itemEdit?.id ?? '',
        time_start: this.props.itemEdit?.time_start ? dayjs(this.props.itemEdit.time_start) : null,
        time_end: this.props.itemEdit?.time_end ? dayjs(this.props.itemEdit.time_end) : null,
      });
    }
  }

  changeItem(data, event) {

    this.setState({
      [data]: event.target.value,
    });
  }

  add() {

    const time_start = this.state.time_start;
    const time_end = this.state.time_end;

    if (!time_start || !time_end) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Выберите оба времени!'
      });

      return;
    };

    const diffInMinutes = time_end.diff(time_start, "minute");

    if (diffInMinutes <= 0) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Конечное время должно быть позже начального!"
      });

      return;
    };

    if (diffInMinutes > 5 * 60) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Разница во времени не должна превышать 5 часов!"
      });

      return;
    };

    const data = {
      id: this.state.active_id,
      lamp_id: this.state.lamp_id,
      time_start: dayjs(this.state.time_start).format('YYYY-MM-DD HH:mm'),
      time_end: dayjs(this.state.time_end).format('YYYY-MM-DD HH:mm'),
    };
    
    this.props.add(data);
  }

  changeLamp(){

    this.setState ({
      confirmDialog: false
    });

    const data = {
      lamp_id: this.state.lamp_id,
    };
    
    this.props.changeLamp(data);
  }

  onClose() {
    this.setState({
      active_id: '',
      lamp_id: '',
      time_start: null,
      time_end: null,
      name_lamp: '',
      confirmDialog: false,
      openAlert: false,
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  changeDateRange(data, event) {
    
    const time_end = this.state.time_end;

    if(data === 'time_start' && !time_end && event) {

      const updatedEvent = dayjs(event);
      const time_end = updatedEvent.add(1, 'hour');

      this.setState({
        time_end,
      });

    }

    this.setState({
      [data]: event ? event : null,
    });
  }

  render() {

    const { typeActive } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Точно заменить лампу ?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.changeLamp.bind(this)}>Заменить</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <MyTextInput
                  label="Лампа"
                  value={this.state.name_lamp}
                  className='disabled_input'
                />
              </Grid>
              
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                {typeActive === 'new' ?
                  <MyDateTimePickerNew
                    value={this.state.time_start}
                    func={newValue => this.changeDateRange('time_start', newValue)}
                    label="Время начала работы"
                  />
                  :
                  <DateWithEditableTimePicker
                    value={this.state.time_start}
                    onChange={newValue => this.changeDateRange('time_start', newValue)}
                    labelDate="Дата начала работы"
                    labelTime="Время начала"
                  />
                }
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                {typeActive === 'new' ?
                  <MyDateTimePickerNew
                    value={this.state.time_end}
                    func={newValue => this.changeDateRange('time_end', newValue)}
                    label="Время окончания работы"
                  />
                  :
                  <DateWithEditableTimePicker
                    value={this.state.time_end}
                    onChange={newValue => this.changeDateRange('time_end', newValue)}
                    labelDate="Дата окончания работы"
                    labelTime="Время окончания"
                  />
                }
              </Grid>
                
            </Grid>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={() => this.setState({ confirmDialog: true })}>Замена лампы</Button>
            <Button variant="contained" onClick={this.add.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class Journal_of_work_of_bactericidal_lamps_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'journal_of_work_of_bactericidal_lamps',
      module_name: '',
      access: null,
      is_load: false,

      points: [],
      point: '0',

      type: '',
      pointModal: '',
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      modalAddLamp: false,
      modalAddActiveLamp: false,
      lampList: [],
      lampListActive: [],
      itemEdit: null,
      lampEdit: null,

      typeActive: null,

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
      access: data.access
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  getData = (method, data = {}, dop_type = {}) => {
      
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data, dop_type)
    .then(result => {

      if(method === 'export_file_xls') {
        return result;
      } else {
        return result.data;
      }

    })
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

  changePoint(event) {
    const data = event.target.value;

    this.setState({
      point: data,
    });

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  async getLamps() {
    const data = {
      point_id: this.state.point,
      date_start: dayjs(this.state.date_start).format('YYYY-MM'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM'),
    };

    const res = await this.getData('get_lamps', data);

    if (res.st) {

      this.setState({
        lampList: res.list,
        lampListActive: res.active_lamp,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });

    }
  }

  async add(data) {
    data.point_id = this.state.point;

    const res = await this.getData('add_lamp', data);
    
    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Успешно сохранено!',

        modalAddLamp: false
      });

      setTimeout(() => {
        this.getLamps();
      }, 500);
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  async addActive(data) {
    data.point_id = this.state.point;

    const res = await this.getData('add_lamp_active', data);
    
    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Успешно сохранено!',
        modalAddActiveLamp: false
      });

      setTimeout(() => {
        this.getLamps();
      }, 500);

    } else {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });

    }
  }

  openModalAddLamp(){
    this.setState({
      modalAddLamp: true
    })
  }

  editLamp(item){
    this.setState({
      modalAddLamp: true,
      lampEdit: item
    })
  }

  openModalAddActiveLamp(item, typeActive){
    this.setState({
      modalAddActiveLamp: true,
      itemEdit: item,
      typeActive
    })
  }

  editActiveLamp(item, typeActive){

    const name = this.state.lampList.find((lamp) => parseInt(lamp.id) === parseInt(item.lamp_id))?.name ?? '';
   
    item.name = name;

    this.setState({
      modalAddActiveLamp: true,
      itemEdit: item,
      typeActive
    })
  }

  async download(){

    const date_start = dayjs(this.state.date_start).format('YYYY-MM');
    const date_end = dayjs(this.state.date_end).format('YYYY-MM');

    let data = {
      date_start,
      date_end,
      point_id: this.state.point,
    };

    const dop_type = {
      responseType: 'blob',
    }

    const res = await this.getData('export_file_xls', data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Журнал учета работы бактерицидных ламп ${date_start}_${date_end}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  changeDateRange(type, data) {
    this.setState({
      [type]: data,
    });
  }

  async changeLamp(data){
    data.point_id = this.state.point;

    const res = await this.getData('changeLamp', data);
    
    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Успешно сохранено!',
        modalAddActiveLamp: false
      });

      setTimeout(() => {
        this.getLamps();
      }, 500);
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    }
  }

  canAccess(key){
    const {userCan} = handleUserAccess(this.state.access);
    return userCan('access', key);
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
        {/* <TestAccess 
          access={this.state.access} 
          setAccess={(access) => this.setState({access})} 
        /> */}
        <Lamps_Modal_Add
          open={this.state.modalAddLamp}
          add={this.add.bind(this)}
          onClose={() => this.setState({ modalAddLamp: false, lampEdit: null })}
          fullScreen={this.state.fullScreen}
          lampEdit={this.state.lampEdit}
        />
        <Lamps_Modal_Add_Active
          open={this.state.modalAddActiveLamp}
          add={this.addActive.bind(this)}
          onClose={() => this.setState({ modalAddActiveLamp: false, itemEdit: null, typeActive: null })}
          fullScreen={this.state.fullScreen}
          lampList={this.state.lampList}
          itemEdit={this.state.itemEdit}
          changeLamp={this.changeLamp.bind(this)}
          typeActive={this.state.typeActive}
        />
        <Grid container spacing={3} className='container_first_child'>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <MyDatePickerNewViews
              label="Дата от"
              views={['month', 'year']}
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <MyDatePickerNewViews
              label="Дата до"
              views={['month', 'year']}
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button variant="contained" onClick={this.getLamps.bind(this)}>
              Обновить данные
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button variant="contained" onClick={this.openModalAddLamp.bind(this)}>
              Добавить лампу
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            {this.canAccess('export_excel') && (
              <Button variant="contained" onClick={this.download.bind(this)}>
                Скачать файл XLS
              </Button>
            )}
          </Grid>

          <Grid
            mt={3}
            mb={5}
            size={{
              xs: 12,
              sm: 12
            }}>
            <TableContainer>
              <Table style={{whiteSpace: 'nowrap'}}>
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={5} style={{ border: '1px solid #e5e5e5' }}>Дата проверки</TableCell>
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map( (item, key) =>
                      <TableCell key={key} colSpan={3} style={{ textAlign: 'center', border: '1px solid #e5e5e5' }}>Размещение: {item.place}</TableCell>
                    )}

                    <TableCell rowSpan={5} style={{ border: '1px solid #e5e5e5' }}>Подпись менеджера смены</TableCell>
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map( (item, key) =>
                      <TableCell key={key} colSpan={3} style={{ textAlign: 'center', cursor: 'pointer', color: 'red', border: '1px solid #e5e5e5' }} onClick={this.editLamp.bind(this, item)}>Модель: {item.name}</TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map( (item, key) =>
                      <TableCell key={key} colSpan={3} style={{ textAlign: 'center', border: '1px solid #e5e5e5' }}>Ресурс лампы: {item.resource}</TableCell>
                    )}
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map( (item, key) =>
                      <Fragment key={key}>
                        <TableCell style={{ textAlign: 'center' }}>Включение</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>Выключение</TableCell>
                        <TableCell style={{ textAlign: 'center', borderRight: '1px solid #e5e5e5' }}>Время работы</TableCell>
                      </Fragment>
                    )}
                  </TableRow>
                  
                </TableHead>
                <TableBody>
                  {this.state.lampListActive.map((item, key) => (
                    <TableRow key={key} style={{ cursor: 'pointer' }} hover>
                      <TableCell style={{ border: '1px solid #e5e5e5' }}>{item.date}</TableCell>
                        
                      {item.lamps.map( (lamp, k) =>
                        <Fragment key={k}>
                          <TableCell style={{ textAlign: 'center', color: 'red' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp, 'edit')}>{lamp.only_time_start}</TableCell>
                          <TableCell style={{ textAlign: 'center', color: 'red' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp, 'edit')}>{lamp.only_time_end}</TableCell>
                          <TableCell style={{ textAlign: 'center', color: 'red', borderRight: '1px solid #e5e5e5' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp, 'edit')}>{lamp.diff}</TableCell>
                        </Fragment>
                      ) }

                      <TableCell style={{ border: '1px solid #e5e5e5' }}>{item.manager}</TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell style={{ borderRight: '1px solid #e5e5e5', borderLeft: '1px solid #e5e5e5' }} />
                    {this.state.lampList.map((item, key) =>
                      <TableCell colSpan={3} key={key} style={{ borderRight: '1px solid #e5e5e5', textAlign: 'right' }}>
                        <Button variant="contained" onClick={this.openModalAddActiveLamp.bind(this, item, 'new')}>
                          Добавить активацию
                        </Button>
                      </TableCell>
                    )}
                    <TableCell style={{ borderRight: '1px solid #e5e5e5' }} />
                  </TableRow>

                  <TableRow>
                    <TableCell style={{ border: '1px solid #e5e5e5' }}>Отработано часов</TableCell>
                      
                    {this.state.lampList.map( (lamp, k) =>
                      <Fragment key={k}>
                        <TableCell style={{ textAlign: 'center' }}></TableCell>
                        <TableCell style={{ textAlign: 'center' }}></TableCell>
                        <TableCell style={{ textAlign: 'center', borderRight: '1px solid #e5e5e5' }}>{lamp.svod}</TableCell>
                      </Fragment>
                    ) }

                    <TableCell style={{ border: '1px solid #e5e5e5' }}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Journal_of_work_of_bactericidal_lamps() {
  return <Journal_of_work_of_bactericidal_lamps_ />;
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
