import React, {Fragment} from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

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

import {MyAlert, MySelect, MyTextInput, formatDateMin, MyDatePickerNewViews, MyDateTimePickerNew} from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class Lamps_Modal_Add extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_id: this.props.lampEdit?.id ?? '',
      number: this.props.lampEdit?.number ?? '',
      name: this.props.lampEdit?.name ?? '',
      resource: this.props.lampEdit?.resource ?? '',
      place: this.props.lampEdit?.place ?? '',
    };
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
        <DialogTitle className="button">
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
           
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Порядковый номер"
                value={this.state.number}
                func={this.changeItem.bind(this, 'number')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Модель"
                value={this.state.name}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Ресурс (часов)"
                value={this.state.resource}
                type={'number'}
                func={this.changeItem.bind(this, 'resource')}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
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
      active_id: this.props.itemEdit?.id ?? '',
      lamp_id: this.props.itemEdit?.lamp_id ?? '',
      time_start: this.props.itemEdit ? dayjs(this.props.itemEdit.time_start) : null,
      time_end: this.props.itemEdit ? dayjs(this.props.itemEdit.time_end) : null
    };
  }

  changeItem(data, event) {

    this.setState({
      [data]: event.target.value,
    });
  }

  add() {
    const data = {
      id: this.state.active_id,
      lamp_id: this.state.lamp_id,
      time_start: dayjs(this.state.time_start).format('YYYY-MM-DD HH:mm'),
      time_end: dayjs(this.state.time_end).format('YYYY-MM-DD HH:mm'),
    };
    
    this.props.add(data);
  }

  changeLamp(){
    if(confirm('Точно заменить лампу ?')) {
      const data = {
        lamp_id: this.state.lamp_id,
      };
      
      this.props.changeLamp(data);
    }
  }

  onClose() {
    this.setState({
      number: '',
      name: '',
      resource: '',
      place: '',
    });

    this.props.onClose();
  }

  changeDateRange(data, event, test) {

    this.setState({
      [data]: event ? event : '',
    });
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
        <DialogTitle className="button">
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            
            <Grid item xs={12} sm={12}>
              <MySelect
                is_none={false}
                disabled={ this.state.active_id == '' ? false : true }
                data={this.props.lampList}
                value={this.state.lamp_id}
                func={this.changeItem.bind(this, 'lamp_id')}
                label="Лампа"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <MyDateTimePickerNew
                value={this.state.time_start}
                func={ newValue => this.changeDateRange('time_start', newValue)}
                label="Время начала работы"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyDateTimePickerNew
                value={this.state.time_end}
                func={ newValue => this.changeDateRange('time_end', newValue)}
                label="Время окончания работы"
              />
            </Grid>
              
          </Grid>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={this.changeLamp.bind(this)}>Замена лампы</Button>
          <Button variant="contained" onClick={this.add.bind(this)}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Journal_of_work_of_bactericidal_lamps_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'journal_of_work_of_bactericidal_lamps',
      module_name: '',
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
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getLamps();
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
      this.getLamps();
    }, 50);
  }

  async getLamps() {
    const data = {
      point_id: this.state.point,
      date_start: this.state.date_start,
      date_end: this.state.date_end,
    };

    const res = await this.getData('get_lamps', data);

    this.setState({
      lampList: res.list,
      lampListActive: res.active_lamp,
    });
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
      }, 300);
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
      }, 300);
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

  openModalAddActiveLamp(){
    this.setState({
      modalAddActiveLamp: true
    })
  }

  editActiveLamp(item){
    this.setState({
      modalAddActiveLamp: true,
      itemEdit: item
    })
  }

  editLamp(item){
    this.setState({
      modalAddLamp: true,
      lampEdit: item
    })
  }

  async downloadHJ(){
    let data = {
      date_start: dayjs(this.state.date_start).format('YYYY-MM'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM'),
      point_id: this.state.point,
    };

    const res =  await this.getData('downloadHJ', data);

    // правка 26.12 скачивания файла в один клик
    if( res.url){
      const link = document.createElement('a');
      link.href = res.url;
      link.click();
    }
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

        { this.state.modalAddLamp === false ? false :
          <Lamps_Modal_Add
            open={this.state.modalAddLamp}
            add={this.add.bind(this)}
            onClose={() => this.setState({ modalAddLamp: false, lampEdit: null })}
            fullScreen={this.state.fullScreen}
            lampEdit={this.state.lampEdit}
            changeLamp={this.changeLamp.bind(this)}
          />
        }

        { this.state.modalAddActiveLamp === false ? false :
          <Lamps_Modal_Add_Active
            open={this.state.modalAddActiveLamp}
            add={this.addActive.bind(this)}
            onClose={() => this.setState({ modalAddActiveLamp: false, itemEdit: null })}
            fullScreen={this.state.fullScreen}
            lampList={this.state.lampList}
            itemEdit={this.state.itemEdit}
          />
        }

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNewViews
              label="Дата от"
              views={['month', 'year']}
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MyDatePickerNewViews
              label="Дата до"
              views={['month', 'year']}
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
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
            <Button variant="contained" onClick={this.getLamps.bind(this)}>
              Обновить данные
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={this.openModalAddLamp.bind(this)}>
              Добавить лампу
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={this.openModalAddActiveLamp.bind(this)}>
              Добавить активацию
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={this.downloadHJ.bind(this)}>
              Скачать
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} mt={3} mb={5}>
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
                          <TableCell style={{ textAlign: 'center', color: 'red' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp)}>{lamp.only_time_start}</TableCell>
                          <TableCell style={{ textAlign: 'center', color: 'red' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp)}>{lamp.only_time_end}</TableCell>
                          <TableCell style={{ textAlign: 'center', color: 'red', borderRight: '1px solid #e5e5e5' }} onClick={ lamp.id == '' ? () => {} : this.editActiveLamp.bind(this, lamp)}>{lamp.diff}</TableCell>
                        </Fragment>
                      ) }

                      <TableCell style={{ border: '1px solid #e5e5e5' }}>{item.manager}</TableCell>
                    </TableRow>
                  ))}

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
