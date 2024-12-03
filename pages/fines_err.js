import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dropzone from 'dropzone';

import ModalImage from "react-modal-image";

import {MyDatePickerNew, MySelect, MyAutocomplite, MyTimePicker, MyCheckBox, MyTextInput, MyAlert, formatDate} from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class Fines_err_Modal_item extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      text: '',

      users: [],
      user: '',
      selected: '',

      apps: [],
      app: '',
      app_for_search: '',

      openAlert: false,
      err_status: true,
      err_text: '',
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
        users: this.props.item.users,
        user: this.props.item.user,
        apps: this.props.item.apps,
        app: this.props.item.apps[0],
      });
    }
  }

  changeUser(event, value) {

    const apps = this.state.apps;

    if (value) {
      
      //const app = apps.find(app => app.id === (value.new_app === '0' ? value.app_id : value.new_app));

      this.setState({
        user: value,
        selected: value.id,
        //app,
        //app_for_search: app.id,
      });
    } else {
      this.setState({
        user: value,
        selected: '',
        //app: apps[0],
        //app_for_search: '',
      });
    }
  }

  changePost(data, event, value) {

    //const user = this.state.user;
    
    /*if(user && value.id !== -1) {
      this.setState({
        [data]: value,
      });
    } else {*/
      this.setState({
        [data]: value,
        app_for_search: value.id === -1 ? '' : value.id,
        selected: '',
        user: '',
      });
    //}

  }

  changeClass(user, event) {
    const apps = this.state.apps;

    const app = apps.find(app => app.id === (user.new_app === '0' ? user.app_id : user.new_app));

    if (event.target.classList.contains('choose_user')) {
      this.setState({
        user: '',
        //app: apps[0],
        //app_for_search: '',
        selected: '',
      });
    } else {
      this.setState({
        user,
        //app,
        //app_for_search: app.id,
        selected: user.id,
      });
    }
  }

  save() {

    const user = this.state.user;

    if(!user) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Укажите сотрудника!',
      });

      return;
    }

    const item = this.state.item;

    const data = {
      id: item.err.id,
      user: user.id,
      text: this.state.text
    }

    this.props.save(data);
  }

  onClose() {
    this.setState({
      item: null,
      users: [],
      user: '',
      selected: '',
      apps: [],
      app: '',
      app_for_search: '',
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  saveErr_(type){
    const data = {
      id: this.state.item.err.id,
      type: type
    }

    if (confirm( (type === 'true' ? 'Подтвердить' : 'Удалить' ) + ' ошибку ?')) {
      this.props.saveErr(data);
    } 
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
          maxWidth={'lg'}
        >
          <DialogTitle className="button">
            {this.props.text}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3} justifyContent="center" mb={3}>

              <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Точка</Typography>
                <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap'}}>
                  {this.state.item ? this.state.item.point_info.name : 'не указана'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Дата ошибки</Typography>
                <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap'}}>
                  {this.state.item ? this.state.item.err.date : 'не указана'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Время совершения ошибки</Typography>
                <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                  {this.state.item ? this.state.item.err.time : 'не указано'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Комментарии</Typography>
                <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                  {this.state.item ? this.state.item.err.comment ? this.state.item.err.comment : 'не указаны' : 'не указаны'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ошибка</Typography>
                <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>
                  {this.state.item ? this.state.item.err.fine_name : 'не указана'}
                </Typography>
              </Grid>

              { this.state.item && parseInt(this.state.item.err.manager_create) == 1 && parseInt(this.state.item.err.status) == 2 && parseInt(this.state.item.err.for_dir) == 1 ?
                <>
                  <Grid item xs={12} sm={6}>
                    <Button color="primary" onClick={this.saveErr_.bind(this, 'true')}>Подтвердить ошибку</Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button color="primary" onClick={this.saveErr_.bind(this, 'false')}>Отменить ошибку</Button>
                  </Grid>
                </>
                  :
                null
              }

              { this.state.item && this.state.item.err.text_one.length > 0 ?
                <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                  <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Причина обжалования</Typography>
                  <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>{this.state.item.err.text_one}</Typography>
                </Grid>
                  :
                null
              }

              { this.state.item && this.state.item.err.text_one.length > 0 ?
                this.state.item.err.text_two.length > 0 ?
                  <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                    <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Описание решения</Typography>
                    <Typography sx={{ fontWeight: 'normal', textAlign: 'center' }}>{this.state.item.err.text_two}</Typography>
                  </Grid>
                    :
                  <Grid item xs={12} sm={6}>
                    <MyTextInput 
                      label="Описание решения" 
                      value={this.state.text} 
                      func={ (event) => { this.setState({ text: event.target.value }) } }
                      multiline={true}
                      maxRows={7}
                    />
                  </Grid>
                  :
                null
              }

              <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Фото ошибки</Typography>
                <Grid sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }} display="flex" flexDirection="column" justifyContent="center">
                  {this.state.item ? !this.state.item.imgs.length ? 'Фото отсутствует' : (
                      this.state.item.imgs.map((img, key) => (
                        <ModalImage
                          key={key}
                          className="img_modal"
                          small={'https://jacochef.ru/src/img/fine_err/uploads/' + img}
                          large={'https://jacochef.ru/src/img/fine_err/uploads/' + img}
                          hideDownload={true}
                          hideZoom={false}
                          showRotate={true}
                        />
                      ))
                    ) : 'Фото отсутствует'}
                </Grid>
              </Grid>

              {this.state.item ? this.state.item.user.name ? (
                  <Grid item xs={12} sm={6} display="flex" flexDirection="column" alignItems="center">
                    <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Сотрудник</Typography>
                    <Typography sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                      {this.state.item.user.name}
                    </Typography>
                    <Grid sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                      {this.state.item ? this.state.item.user.img ? (
                          <img src={'https://storage.yandexcloud.net/user-img/max-img/' + this.state.item.user.img} style={{ maxWidth: 300, maxHeight: 300 }}/>
                        ) : 'Фото отсутствует' : 'Фото отсутствует'}
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} sm={12} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} align="center">Указать сотрудника</Grid>

                    <Grid item xs={12} sm={6}>
                      <MyAutocomplite
                        multiple={false}
                        data={this.state.apps}
                        value={this.state.app}
                        func={this.changePost.bind(this, 'app')}
                        label="Должность"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MyAutocomplite
                        label="Сотрудник"
                        multiple={false}
                        data={this.state.users}
                        value={this.state.user}
                        func={this.changeUser.bind(this)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12} display="flex" flexWrap="wrap" justifyContent="center">
                      {this.state.users
                      .filter(user => this.state.app_for_search ? user.app_id === this.state.app_for_search || user.new_app === this.state.app_for_search : user)
                      .map((user, key) => (
                        <React.Fragment key={key}>
                          {!user.img ? null : (
                            <img src={'https://storage.yandexcloud.net/user-img/max-img/' + user.img}
                              style={{ maxWidth: 300, maxHeight: 300, height: 'fit-content' }}
                              onClick={this.changeClass.bind(this, user)}
                              className={this.state.selected === user.id ? 'choose_user' : ''}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </Grid>
                  </>
              ) : 'ФИО и Фото отсутствует'}
            </Grid>
          </DialogContent>
          {this.state.item ? parseInt(this.state.item.err.for_dir) == 1 && (!this.state.item.user.name || parseInt(this.state.item.err.status) == 2) ? (
            <DialogActions>
              <Button color="primary" style={{ whiteSpace: 'nowrap' }} onClick={this.save.bind(this)}>Coxpанить</Button>
            </DialogActions>
          ) : null : null}
        </Dialog>
      </>
    );
  }
}

class Fines_err_Modal_NewItem extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 10,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: 'image/jpeg,image/png',
    addRemoveLinks: true,
    url: 'https://jacochef.ru/src/img/fine_err/upload.php',
  };
  myDropzone = null;
  isInit = false;

  constructor(props) {
    super(props);

    this.state = {
      points: [],
      point: '',

      fines: [],
      fine: '',

      users: [],
      user: '',

      apps: [],
      app: '',
      app_for_search: '',

      date: null,
      time: '00:00',
      is_active: 0,
      comment: '',

      selected: '',

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.points) {
      return;
    }

    if (this.props.points !== prevProps.points) {
      this.setState({
        points: this.props.points,
        point: this.props.point,
      });
    }
  }

  changeUser(event, value) {

    const apps = this.state.apps;

    if (value) {
      
      //const app = apps.find(app => app.id === (value.new_app === '0' ? value.app_id : value.new_app));

      this.setState({
        user: value,
        selected: value.id,
        //app,
        //app_for_search: app.id,
      });
    } else {
      this.setState({
        user: value,
        selected: '',
        //app: apps[0],
        //app_for_search: '',
      });
    }
  }

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeItemChecked(data, event) {
    const value = event.target.checked === true ? 1 : 0;

    this.setState({
      [data]: value,
    });
  }

  changeItem(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changePost(data, event, value) {

    //const user = this.state.user;
    
    /*if(user && value.id !== -1) {
      this.setState({
        [data]: value,
      });
    } else {*/
      this.setState({
        [data]: value,
        app_for_search: value.id === -1 ? '' : value.id,
        selected: '',
        user: '',
      });
    //}

  }

  changePoint(data, event) {
    const date = this.state.date;

    if (event.target.value !== '' && date) {
      this.setState({
        user: '',
      });

      const point_id = event.target.value;

      this.getUsers(point_id, date);
    }

    this.setState({
      [data]: event.target.value,
      app_for_search: '',
      fine: '',
      time: '00:00',
      is_active: 0,
      comment: '',
      selected: '',
    });
  }

  changeDateRange(data, event) {
    const point_id = this.state.point;

    if (event !== '' && point_id !== '') {
      const date = (event);

      this.getUsers(point_id, date);
    }

    this.setState({
      [data]: event ? (event) : '',
    });
  }

  async getUsers(point_id, date) {
    const data = {
      point_id,
      date: dayjs(date).format('YYYY-MM-DD'),
    };

    const res = await this.props.getData('get_users', data);

    this.setState({
      fines: res.fines,
      users: res.users,
      apps: res.apps,
      app: res.apps[0],
    });

    setTimeout(() => {
      this.myDropzone = new Dropzone('#for_img_new', this.dropzoneOptions);

      this.click = false;
    }, 300);
  }

  changeClass(user, event) {

    const apps = this.state.apps;

    const app = apps.find(app => app.id === (user.new_app === '0' ? user.app_id : user.new_app));

    if (event.target.classList.contains('choose_user')) {
      this.setState({
        user: '',
        //app: apps[0],
        //app_for_search: '',
        selected: '',
      });
    } else {
      this.setState({
        user,
        //app,
        //app_for_search: app.id,
        selected: user.id,
      });
    }
  
  }

  async save() {
    if (!this.click) {
      this.click = true;

      const {point, fine, date, user, time, comment, is_active} = this.state;

      if (!point || !fine || !date || !time || time === '00:00' || comment.length == 0 || ( !user.id && is_active === false ) || !fine.id) {
        let text = 'Для сохранения новой Ошибки, необходимо выбрать: Точку, Дату, Ошибку, Сотрудника и указать Время ошибки';

        if( !point ){
          text = 'Не указана точка';
        }

        if( !fine || !fine.id ){
          text = 'Не указана ошибка';
        }

        if( !time || time === '00:00' ){
          text = 'Не указано время';
        }

        if( comment.length == 0 ){
          text = 'Не указан комментарий';
        }

        if( !user.id && is_active === false ){
          text = 'Не указан виновный';
        }

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: text,
        });

        setTimeout(() => {
          this.click = false;
        }, 300);

        return;
      }

      const data = {
        fine: fine.id,
        user: user && user.id ? user.id : 0,
        point_id: point,
        date: dayjs(date).format('YYYY-MM-DD'),
        time_err: time,
        no_user: is_active,
        comment: comment,
        img: this.myDropzone['files'].length > 0 ? 1 : 0,
      };

      const res = await this.props.getData('save_new', data);

      if(res.st === false){
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        if( this.myDropzone['files'].length > 0 ){
          var i = 0;

          if(this.myDropzone['files'].length > 0 && this.isInit === false) {
            this.isInit = true;
    
            this.myDropzone.on('sending', (file, xhr, data) => {
              i++;
              let file_type = file.name.split('.');
              file_type = file_type[file_type.length - 1];
              file_type = file_type.toLowerCase();
    
              data.append('filetype', 'file_' + i + '_point_id_' + point + '_id_' + res.err_id + '.' + file_type);
    
            });
    
            this.myDropzone.on('queuecomplete', (data) => {
              var check_img = false;
    
              this.myDropzone['files'].map( (item, key) => {
                if (item['status'] == 'error') {
                  check_img = true;
                }
              });
    
              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: 'Ошибка при загрузке фотографии',
                });
    
                return;
              } else {
                setTimeout( () => {
                  this.onClose();
                }, 1000 )
              }
    
              this.isInit = false;
            });
          }

          this.myDropzone.processQueue();
        } else {
          this.onClose();
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  onClose() {
    this.setState({
      points: [],
      point: '',

      fines: [],
      fine: '',

      users: [],
      user: '',

      apps: [],
      app: '',

      date: null,
      time: '00:00',
      is_active: 0,
      comment: '',

      selected: '',

      err_status: true,
      err_text: '',

      app_for_search: '',
    });

    this.props.onCloseFull();
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
          maxWidth={'lg'}
          className='fines_err'
        >
          <DialogTitle className="button">
            {this.props.text}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>

              <Grid item xs={12} sm={6}>
                <MySelect
                  is_none={false}
                  data={this.state.points}
                  value={this.state.point}
                  func={this.changePoint.bind(this, 'point')}
                  label="Точка"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyDatePickerNew
                  label="Дата"
                  value={this.state.date}
                  func={this.changeDateRange.bind(this, 'date')}
                />
              </Grid>

              {!this.state.fines.length ? null : (
                <>
                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite
                      label="Ошибка"
                      multiple={false}
                      data={this.state.fines}
                      value={this.state.fine}
                      func={this.changeAutocomplite.bind(this, 'fine')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <MyTimePicker
                      value={this.state.time}
                      func={this.changeItem.bind(this, 'time')}
                      label="Время ошибки"
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <MyCheckBox
                      label="Не могу определиться с виновником"
                      value={this.state.is_active == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, 'is_active')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <MyTextInput
                      label="Комментарии"
                      multiline={true}
                      maxRows={5}
                      value={this.state.comment}
                      func={this.changeItem.bind(this, 'comment')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <div
                      className="dropzone"
                      id="for_img_new"
                      style={{ width: '100%', minHeight: 150 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite
                      multiple={false}
                      data={this.state.apps}
                      value={this.state.app}
                      func={this.changePost.bind(this, 'app')}
                      label="Должность"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite
                      label="Сотрудник"
                      multiple={false}
                      data={this.state.users}
                      value={this.state.user}
                      func={this.changeUser.bind(this)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} display="flex" flexWrap="wrap" justifyContent="center">
                    {this.state.users
                    .filter(user => this.state.app_for_search ? user.app_id === this.state.app_for_search || user.new_app === this.state.app_for_search : user)
                    .map((user, key) => (
                      <React.Fragment key={key}>
                        {!user.img ? null : (
                          <img src={'https://storage.yandexcloud.net/user-img/max-img/' + user.img}
                            style={{ maxWidth: 300, maxHeight: 300, height: 'fit-content' }}
                            onClick={this.changeClass.bind(this, user)}
                            className={this.state.selected === user.id ? 'choose_user' : ''}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>

          <DialogActions className="button">
            <Button
              variant="contained"
              style={{ backgroundColor: '#00a550', whiteSpace: 'nowrap' }}
              onClick={this.save.bind(this)}
            >
              Сохранить
            </Button>
            <Button
              variant="contained"
              style={{ whiteSpace: 'nowrap' }}
              onClick={this.onClose.bind(this)}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class Fines_err_Table extends React.Component {
  render() {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Кто добавил</TableCell>
              <TableCell>Сотрудник</TableCell>
              <TableCell>Дата ошибки</TableCell>
              <TableCell>Дата закрытия</TableCell>
              <TableCell>Ошибка</TableCell>
              <TableCell>Фото</TableCell>
              <TableCell>Обжалована</TableCell>
              <TableCell>Изменина сумма</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.props.ret_list.map((item, i) => (
              <TableRow key={i} style={{ cursor: 'pointer', backgroundColor: parseInt(item.is_delete) == 1 ? 'red' : '#926eae', color: '#fff', fontWeight: 300 }}
                onClick={this.props.openModal.bind(this, 'item', 'Ошибка сотрудника', item.id)}
              >
                <TableCell>{item.find_user_name}</TableCell>
                <TableCell>{item.user_name}</TableCell>
                <TableCell>{item.date} {item.time}</TableCell>
                <TableCell>{item.date_close}</TableCell>
                <TableCell>{item.fine_name}</TableCell>
                <TableCell>
                  {!item.imgs.length ? null : (
                    item.imgs.map((img, key) => (
                      <img key={key} src={'https://jacochef.ru/src/img/fine_err/uploads/' + img} style={{ maxWidth: 150, maxHeight: 150, marginRight: 5 }}/>
                    ))
                  )}
                </TableCell>

                <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.change_win) == 1 ? <CheckIcon /> : null }</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.change_sum) == 1 ? <CheckIcon /> : null }</TableCell>
                <TableCell>{item.answer}</TableCell>
              </TableRow>
            ))}
            {this.props.all_list.map((item, i) => (
              <TableRow key={i}
                style={{ cursor: 'pointer', backgroundColor: parseInt(item.is_delete) == 1 ? 'red' : item.user_name == null ? '#926eae' : '#6ab04c', color: '#fff', fontWeight: 300 }}
                onClick={this.props.openModal.bind(this, 'item', 'Ошибка сотрудника', item.id)}
              >
                <TableCell>{item.find_user_name}</TableCell>
                <TableCell>{item.user_name}</TableCell>
                <TableCell>{item.date} {item.time}</TableCell>
                <TableCell>{item.date_close}</TableCell>
                <TableCell>{item.fine_name}</TableCell>
                <TableCell>
                  {!item.imgs.length ? null : (
                    item.imgs.map((img, key) => (
                      <img key={key} src={'https://jacochef.ru/src/img/fine_err/uploads/' + img} style={{ maxWidth: 150, maxHeight: 150, marginRight: 5 }}/>
                    ))
                  )}
                </TableCell>

                <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.change_win) == 1 ? <CheckIcon /> : null }</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.change_sum) == 1 ? <CheckIcon /> : null }</TableCell>
                <TableCell>{item.answer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

class Fines_err_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'fines_err',
      module_name: '',
      is_load: false,

      points: [],
      point: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      all_list: [],
      ret_list: [],

      modalDialogNew: false,
      modalDialog: false,

      pointsDialog: [],
      method: '',
      text: '',

      item: null,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
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

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? (event) : '',
    });
  }

  async changePoint(event) {
    const data = {
      point_id: event.target.value,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };

    const res = await this.getData('get_data', data);

    this.setState({
      point: event.target.value,
      all_list: res.all_list,
      ret_list: res.ret_list,
    });
  }

  async openModal(method, text, id) {
    this.handleResize();

    if (method === 'newItem') {
      const res = await this.getData('get_all_for_new');

      this.setState({
        pointsDialog: res.points,
        modalDialogNew: true,
        method,
        text,
      });
    }

    if (method === 'item') {
      const data = {
        id,
      };

      const res = await this.getData('get_one', data);

      this.setState({
        item: res,
        modalDialog: true,
        method,
        text,
      });
    }
  }

  async getItems() {
    const data = {
      point_id: this.state.point,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };

    const res = await this.getData('get_data', data);

    this.setState({
      all_list: res.all_list,
      ret_list: res.ret_list,
    });
  }

  async saveEditItem(data) {
    let res = await this.getData('update', data);

    if(res.st) {

      this.setState({ modalDialog: false });

      setTimeout( () => {
        this.getItems();
      }, 300 )

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async saveNewItem(data) {

    console.log(data);

    // await this.getData('save_new', data);

    // this.getItems();
  }

  async saveErr(data){
    let res = await this.getData('saveErr', data);

    if(res.st) {
      this.setState({ modalDialog: false });

      setTimeout( () => {
        this.getItems();
      }, 300 )

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  fullCloseDialog(){
    this.setState({ 
      modalDialog: false,
      modalDialogNew: false 
    });

    this.getItems();
  }

  closeDialog(){
    this.setState({ 
      modalDialog: false,
      modalDialogNew: false 
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} />

        <Fines_err_Modal_NewItem
          open={this.state.modalDialogNew}
          onClose={this.closeDialog.bind(this)}
          onCloseFull={this.fullCloseDialog.bind(this)}
          method={this.state.method}
          points={this.state.pointsDialog}
          point={this.state.point}
          text={this.state.text}
          getData={this.getData.bind(this)}
          save={this.saveNewItem.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Fines_err_Modal_item
          open={this.state.modalDialog}
          onClose={this.closeDialog.bind(this)}
          onCloseFull={this.fullCloseDialog.bind(this)}
          method={this.state.method}
          text={this.state.text}
          item={this.state.item}
          save={this.saveEditItem.bind(this)}
          fullScreen={this.state.fullScreen}
          saveErr={this.saveErr.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button
              onClick={this.openModal.bind(this, 'newItem', 'Новая ошибка')}
              variant="contained"
            >
              Добавить ошибку
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              is_none={false}
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

          <Grid item xs={12} sm={12}>
            <Fines_err_Table
              all_list={this.state.all_list}
              ret_list={this.state.ret_list}
              openModal={this.openModal.bind(this)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function FinesErr() {
  return <Fines_err_ />;
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