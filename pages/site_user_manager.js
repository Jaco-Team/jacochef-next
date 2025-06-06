import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MySelect, MyCheckBox, MyAutocomplite, MyTextInput, MyDatePickerNew, MyAlert} from '@/ui/elements';

import Dropzone from 'dropzone';
import { api_laravel, api_laravel_local } from '@/src/api_new';
import dayjs from 'dayjs';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";

class SiteUserManagerTable extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.users;
    var array2 = this.props.users;

    var same = array1.length == array2.length && array1.every(function (element, index) {
      return element === array2[index];
    });

    return (
      !same || nextProps.page_table !== this.props.page_table || nextProps.rows_table !== this.props.rows_table ||
      nextProps.total_rows !== this.props.total_rows
    );
  }

  render() {
    const { handlePageChange, handleChangeRowsPerPage, page_table, rows_table, total_rows } = this.props;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Фото</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Должность</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.users.map((item, key) => (
              <TableRow style={{ cursor: 'pointer' }} key={key} hover onClick={this.props.openEditUser.bind(this, item.id)}>
                <TableCell>{key + 1}</TableCell>
                <TableCell>
                  {item['img_name'] === null ? null : (
                    <img
                      alt={item.name}
                      src={'https://storage.yandexcloud.net/user-img/min-img/' + item['img_name'] + '?' + item['img_update']}
                      style={{ maxWidth: 100, maxHeight: 100 }}
                    />
                  )}
                </TableCell>
                <TableCell>{item.login}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.app_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total_rows}
          page={page_table}
          rowsPerPage={rows_table}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Количество строк на странице"
          rowsPerPageOptions={[25, 50, 100, { value: -1, label: 'Все' }]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count !== -1 ? count : `больше, чем ${to}`}`}
        />
      </TableContainer>
    );
  }
}

class SiteUserManager_ extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: 'image/jpeg,image/png',
    addRemoveLinks: true,
    url: 'https://jacochef.ru/src/img/users/upload.php',
  };
  myDropzone = null;
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_user_manager',
      module_name: '',
      is_load: false,

      cats: [],
      allItems: [],
      vendor_items: [],

      modalItemEdit: false,
      modalItemNew: false,

      itemEdit: null,
      itemName: '',

      checkArtDialog: false,
      checkArtList: [],

      freeItems: [],

      point_list: [],
      point_list_render: [],
      point_id: '',

      app_list: [],
      chose_app: null,
      //app_id: "-1",
      app_id: 0,
      // app_filter: null,

      users: [],
      usersCopy: [],
      editUser: null,
      modalUserEdit: false,
      modalVacation: false,
      modalUserNew: false,

      textDel: '',
      textSearch: '',
      delModal: false,

      graphModal: false,
      graphType: 0,
      show_access: 0,

      openAlert: false,
      err_status: true,
      err_text: '',

      page_table: 0,
      rows_table: 25,
      total_rows: 0,
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      point_list: data.points,
      app_list: data.apps,
      show_access: data.my.show_access,
      app_id: data.apps[0],
      point_id: data.points[0]['id'],
    });

    setTimeout(() => {
      this.getUsers();
    }, 500);

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel_local(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  changeSort(type, event, data) {
    // автокомлит для должностей

    if (type == 'app_id') {
      this.setState({
        app_id: data !== null ? data : null,
        // app_id: data !== null ? data.id : 0,
        // app_filter: data,
      });
    } else {
      this.setState({
        [type]: event.target.value,
      });
    }

    setTimeout(() => {
      this.getUsers();
    }, 300);
  }

  async getUsers() {
    const app_id = this.state.app_id ? this.state.app_id.id : 0;

    const data = {
      point_id: this.state.point_id,
      app_id,
      // app_id: this.state.app_id,
      search: this.state.textSearch,
    };

    let res = await this.getData('getUsers', data);

    const total_rows = res.length;
    const resCopy = JSON.parse(JSON.stringify(res));

    if (total_rows < this.state.rows_table || this.state.rows_table < 0) {

      this.setState({
        users: res,
        usersCopy: resCopy,
        total_rows: res.length,
      });

    } else {
      const usersPerPage = res.slice(
        this.state.page_table * this.state.rows_table,
        this.state.page_table * this.state.rows_table + this.state.rows_table
      );

      this.setState({
        users: usersPerPage,
        usersCopy: resCopy,
        total_rows: res.length,
      });
    }
  }

  async openEditUser(user_id) {
    let data = {
      user_id: user_id,
    };

    let res = await this.getData('getUser', data);

    // хак для автокомплита
    res.user.app_id = res.appointment.find((app) => parseInt(app.id) == parseInt(res.user.app_id));

    this.setState({
      editUser: res,
      chose_app: res.user.app_id,
      modalUserEdit: true,
    });

    setTimeout(() => {
      this.sortPoint();

      this.myDropzone = new Dropzone('#for_img_edit', this.dropzoneOptions);

      this.click = false;
    }, 300);
  }

  async openNewUser() {
    let res = await this.getData('getAllForNew');

    // хак для автокомплита
    res.user.app_id = null;

    this.setState({
      editUser: res,
      modalUserNew: true,
    });

    setTimeout(() => {
      this.sortPoint();

      this.myDropzone = new Dropzone('#for_img_new', this.dropzoneOptions);

      this.click = false;
    }, 300);
  }

  changeItem(data, event) {
    let vendor = this.state.editUser;

    if (data == 'birthday' || data == 'vacationStart' || data == 'vacationEnd') {
      vendor.user[data] = event;
    } else {
      if (data == 'acc_to_kas') {
        vendor.user[data] = event.target.checked === true ? 1 : 0;
      } else {
        vendor.user[data] = event.target.value;
      }
    }

    this.setState({
      editUser: vendor,
    });

    if (data == 'city_id') {
      setTimeout(() => {
        this.sortPoint();
      }, 300);
    }
  }

  // функция поиска по телефону или Фамилии
  search(type, event) {

    if(type === 'clear') {

      this.setState({
        textSearch: '',
        page_table: 0,
        rows_table: 25,
        total_rows: 0,
      });

    } else {
      let v = event.target.value;

      this.setState({
        textSearch: v,
        page_table: 0,
        rows_table: 25,
        total_rows: 0,
      });
    }

    setTimeout(() => {
      this.getUsers();
    }, 300);
  }

  sortPoint() {
    let city_id = this.state.editUser ? this.state.editUser.user.city_id : 0;
    let points = this.state.editUser.point_list;
    let points_render = [];

    if (parseInt(city_id) == -1) {
      points_render = points;
    } else {
      points_render = points.filter((item) => parseInt(item.city_id) == parseInt(city_id) || parseInt(item.city_id) == -1);
    }

    this.setState({
      point_list_render: points_render,
    });
  }

  async saveEditUser(graphType) {
    if (!this.click) {
      this.click = true;

      this.setState({
        graphType: graphType,
      });

      let is_graph = false;
      var editUser_user = this.state.editUser;

      editUser_user.user.app_id = this.state.chose_app !== null ? this.state.chose_app.id : 0;

      this.state.app_list.map((item, key) => {
        if (parseInt(editUser_user.user.app_id) == parseInt(item.id)) {
          if (parseInt(item.is_graph) == 1 && parseInt(graphType) == 0) {
            is_graph = true;
          }
        }
      });

      if (is_graph === true) {
        this.setState({
          graphModal: true,
        });

        setTimeout(() => {
          this.click = false;
        }, 300);

        return;
      }

      //todo
      if (parseInt(editUser_user.user.app_id) == 0 && this.state.textDel.length == 0) {
        this.setState({
          delModal: true,
        });

        setTimeout(() => {
          this.click = false;
        }, 300);

        return;
      }

      if (this.myDropzone['files'].length > 0 && this.isInit === false) {
        this.isInit = true;

        this.myDropzone.on('sending', (file, xhr, data) => {
          let user_id = this.state.editUser.user.id;

          let file_type = file.name.split('.');
          file_type = file_type[file_type.length - 1];
          file_type = file_type.toLowerCase();

          data.append('filetype', 'user_' + user_id + '.' + file_type);
          data.append('filename', 'user_' + user_id);

          this.getOrientation(file, function (orientation) {
            data.append('orientation', orientation);
          });
        });

        this.myDropzone.on('queuecomplete', (data) => {
          var check_img = false;

          this.myDropzone['files'].map(function (item, key) {
            if (item['status'] == 'error') {
              check_img = true;
            }
          });

          if (check_img) {
            // alert('Ошибка при загрузке фотографии');

            this.setState({
              openAlert: true,
              err_status: false,
              err_text: 'Ошибка при загрузке фотографии',
            });

            return;
          }

          this.setState({
            delModal: false,
            graphModal: false,
            modalUserEdit: false,
            editUser: null,
          });

          this.isInit = false;
          this.getUsers();
        });
      }

      if (editUser_user.user.birthday) {
        editUser_user.user.birthday = dayjs(editUser_user.user.birthday).format('YYYY-MM-DD');
      }

      let data = {
        user: editUser_user,
        textDel: this.state.textDel,
        graphType: graphType,
      };
      let res = await this.getData('saveEditUser', data);

      if (res.st === false) {
        // alert(res.text);
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.text,
        });
      } else {
        if (this.myDropzone['files'].length == 0) {
          this.isInit = false;

          this.setState({
            delModal: false,
            graphModal: false,
            modalUserEdit: false,
            editUser: null,
          });

          this.getUsers();
        } else {
          this.setState({
            is_load: true,
            graphModal: false,
          });

          this.myDropzone.processQueue();
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  async saveVacationUser() {
    if (!this.click) {
      this.click = true;
      const { user } = this.state.editUser;
      user.app_id = this.state.chose_app !== null ? this.state.chose_app.id : 0;

      if (user.birthday) {
        user.birthday = dayjs(user.birthday).format('YYYY-MM-DD');
      }

      if (user.vacationStart) {
        user.vacationStart = dayjs(user.vacationStart).format('YYYY-MM-DD');
      }

      if (user.vacationEnd) {
        user.vacationEnd = dayjs(user.vacationEnd).format('YYYY-MM-DD');
      }

      let data = {
        user,
      };
      let res = await this.getData('saveVacationUser', data);

      if (res.st === false) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.text,
        });
      } else {
        this.isInit = false;

        this.setState({
          modalVacation: false,
        }, async () => {
          let data = {
            user_id: user.id,
          };

          let res = await this.getData('getUser', data);
          this.setState({
            editUser: res,
            chose_app: res.user.app_id,
            modalUserEdit: true,
          });
          this.click = false;
        });
      }
    }
  }

  async saveNewUser() {
    if (!this.click) {
      this.click = true;

      let is_graph = false;
      let is_graph_ = false;

      // хак для нормальной работы атокомплита должность
      let editUser_user = this.state.editUser;
      editUser_user.user.app_id = this.state.chose_app !== null ? this.state.chose_app.id : 0;

      this.state.app_list.map((item, key) => {
        if (parseInt(editUser_user.user.app_id) == parseInt(item.id)) {
          if (parseInt(item.is_graph) == 1) {
            is_graph_ = true;
          }

          /*if (parseInt(item.is_graph) == 1 && parseInt(graphType) == 0) {
                    is_graph = true;
                }*/
        }
      });

      if (is_graph_ === true && this.myDropzone['files'].length == 0) {
        // alert('Необходимо фотография сотрудника');

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: 'Необходима фотография сотрудника',
        });

        setTimeout(() => {
          this.click = false;
        }, 300);

        return;
      }

      if (this.myDropzone['files'].length > 0 && this.isInit === false) {
        this.isInit = true;

        this.myDropzone.on('sending', (file, xhr, data) => {
          let user_id = this.state.editUser.user.id;

          let file_type = file.name.split('.');
          file_type = file_type[file_type.length - 1];
          file_type = file_type.toLowerCase();

          data.append('filetype', 'user_' + user_id + '.' + file_type);
          data.append('filename', 'user_' + user_id);

          this.getOrientation(file, function (orientation) {
            data.append('orientation', orientation);
          });
        });

        this.myDropzone.on('queuecomplete', (data) => {
          var check_img = false;

          this.myDropzone['files'].map(function (item, key) {
            if (item['status'] == 'error') {
              check_img = true;
            }
          });

          if (check_img) {
            // alert('Ошибка при загрузке фотографии');

            this.setState({
              openAlert: true,
              err_status: false,
              err_text: 'Ошибка при загрузке фотографии',
            });

            return;
          }

          // картинка прелоадер
          this.setState({
            modalUserNew: false,
            editUser: null,
            is_load: false,
          });

          this.isInit = false;
          this.getUsers();
        });
      }

      if (editUser_user.user.birthday) {
        editUser_user.user.birthday = dayjs(editUser_user.user.birthday).format('YYYY-MM-DD');
      }

      let data = {
        user: editUser_user,
        graphType: is_graph === true ? 1 : 0,
      };

      let res = await this.getData('saveNewUser', data);

      if (res.st === false) {
        // alert(res.text);

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: res.text,
        });
      } else {
        if (res.sms === false) {
          // alert('Ошибка в отправке смс');

          this.setState({
            openAlert: true,
            err_status: false,
            err_text: 'Ошибка в отправке смс',
          });
        }

        if (this.myDropzone['files'].length == 0) {
          this.isInit = false;

          this.setState({
            modalUserNew: false,
            editUser: null,
          });

          this.getUsers();
        } else {
          let user = this.state.editUser;
          user.user.id = res.user_id;

          user.user.app_id = this.state.editUser.user.app_id;

          // картинка прелоадер
          this.setState({
            editUser: user,
            is_load: true,
          });

          setTimeout(() => {
            this.myDropzone.processQueue();
          }, 400);
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  getOrientation(file, callback) {
    var reader = new FileReader();

    reader.onload = function (event) {
      var view = new DataView(event.target.result);

      if (view.getUint16(0, false) != 0xffd8) return callback(-2);

      var length = view.byteLength,
        offset = 2;

      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            return callback(-1);
          }
          var little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;

          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + i * 12, little) == 0x0112)
              return callback(view.getUint16(offset + i * 12 + 8, little));
        } else if ((marker & 0xff00) != 0xff00) break;
        else offset += view.getUint16(offset, false);
      }

      return callback(-1);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  }

  handlePageChange(event, page) {
    const usersCopy = JSON.parse(JSON.stringify(this.state.usersCopy));

    const usersPerPage = usersCopy.slice(
      page * this.state.rows_table,
      page * this.state.rows_table + this.state.rows_table
    );

    this.setState({
      users: usersPerPage,
      page_table: page,
    });
  }

  handleChangeRowsPerPage(event) {
    const rows_table = event.target.value;

    const usersCopy = JSON.parse(JSON.stringify(this.state.usersCopy));

    if (rows_table < 0) {

      this.setState({
        users: usersCopy,
        rows_table,
        page_table: 0,
      });

    } else {
      const usersPerPage = usersCopy.slice(
        0 * rows_table,
        0 * rows_table + rows_table
      );

      this.setState({
        page_table: 0,
        users: usersPerPage,
        rows_table,
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99999 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog open={this.state.delModal} onClose={() => this.setState({ delModal: false, textDel: '' })}>
          <DialogTitle>Причина увольнения</DialogTitle>
          <DialogContent>
            <DialogContentText>Увольнение происходит не сразу, а в полночь</DialogContentText>
            <Grid container spacing={3} style={{ paddingBottom: 10, paddingTop: 20 }}>
              <Grid item xs={12}>
                <MyTextInput
                  label="Причина увольнения"
                  value={this.state.textDel}
                  func={(event) => this.setState({ textDel: event.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={this.saveEditUser.bind(this, 0)}>
              Уволить
            </Button>
            <Button onClick={() => this.setState({ delModal: false, textDel: '' })}>
              Отмена
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.graphModal} onClose={() => this.setState({ graphModal: false, graphType: 0 })}>
          <DialogTitle>С какого периода применить изменения ?</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} style={{ paddingBottom: 10, paddingTop: 20 }}>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" onClick={this.saveEditUser.bind(this, 1)} style={{ width: '100%' }}>
                  С текущего периода
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" onClick={this.saveEditUser.bind(this, 2)} style={{ width: '100%' }}>
                  Со следующего периода
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button variant="contained" onClick={this.saveEditUser.bind(this, 3)} style={{ width: '100%' }}>
                  Без изменений
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

        <Dialog
            open={this.state.modalVacation}
            fullWidth={true}
            maxWidth={'md'}
            onClose={() => this.setState({modalVacation: false})}
        >
          <DialogTitle>Добавление отпуска сотруднику</DialogTitle>
          <DialogContent style={{paddingBottom: 10, paddingTop: 10}}>
            {this.state.editUser && this.state.modalUserEdit ? (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <MyDatePickerNew
                          label="Дата начала"
                          value={this.state.editUser.user.vacationStart ? dayjs(this.state.editUser.user.vacationStart) : null}
                          func={this.changeItem.bind(this, 'vacationStart')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MyDatePickerNew
                          label="Дата окончания"
                          value={this.state.editUser.user.vacationEnd ? dayjs(this.state.editUser.user.vacationEnd) : null}
                          func={this.changeItem.bind(this, 'vacationEnd')}
                      />
                    </Grid>
                  </Grid>
                </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.saveVacationUser.bind(this)} color="primary">
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modalUserEdit}
          fullWidth={true}
          maxWidth={'md'}
          onClose={() => this.setState({ modalUserEdit: false, editUser: null })}
        >
          <DialogTitle>Редактирование сотрудника</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
              {this.state.editUser && this.state.modalUserEdit ? (
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Фамилия"
                            value={this.state.editUser.user.fam}
                            func={this.changeItem.bind(this, 'fam')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Имя"
                            value={this.state.editUser.user.name}
                            func={this.changeItem.bind(this, 'name')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Отчество"
                            value={this.state.editUser.user.otc}
                            func={this.changeItem.bind(this, 'otc')}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Номер телефона"
                            value={this.state.editUser.user.login}
                            func={this.changeItem.bind(this, 'login')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyDatePickerNew
                            label="Дата рождения"
                            value={dayjs(this.state.editUser.user.birthday)}
                            func={this.changeItem.bind(this, 'birthday')}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <img
                            alt={this.state.editUser.user['img_name']}
                            src={'https://storage.yandexcloud.net/user-img/max-img/' + this.state.editUser.user['img_name'] +
                              '?' + this.state.editUser.user['img_update']}
                            style={{ maxWidth: 300, maxHeight: 300 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <div className="dropzone" id="for_img_edit" style={{ width: '100%', minHeight: 150 }} />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Код авторизации (4 цифры)"
                            value={this.state.editUser.user.auth_code}
                            func={this.changeItem.bind(this, 'auth_code')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="ИНН"
                            value={this.state.editUser.user.inn}
                            func={this.changeItem.bind(this, 'inn')}
                          />
                        </Grid>
                        {parseInt(this.state.show_access) == 0 ? (
                          false
                        ) : (
                          <Grid item xs={12} sm={4}>
                            <MyCheckBox
                              label="Работает официально"
                              value={parseInt(this.state.editUser.user.acc_to_kas) == 1 ? true : false}
                              func={this.changeItem.bind(this, 'acc_to_kas')}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyAutocomplite
                            data={this.state.editUser.appointment}
                            value={this.state.chose_app}
                            func={(event, data) => this.setState({ chose_app: data })}
                            multiple={false}
                            label="Должность"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MySelect
                            data={this.state.editUser.cities}
                            value={this.state.editUser.user.city_id}
                            func={this.changeItem.bind(this, 'city_id')}
                            label="Город"
                            is_none={false}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MySelect
                            data={this.state.point_list_render}
                            value={this.state.editUser.user.point_id}
                            func={this.changeItem.bind(this, 'point_id')}
                            label="Точка"
                            is_none={false}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button onClick={() => this.setState({ modalVacation: true })} color="primary" variant="contained">
                            Отпуск
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Box>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography sx={{fontWeight: 'bold'}}>История измненений</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer component={Paper}>
                              <Table size={'small'}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{minWidth: 125}}>Дата</TableCell>
                                    <TableCell>Кто обновлял</TableCell>
                                    <TableCell>Имя</TableCell>
                                    <TableCell>Телефон</TableCell>
                                    <TableCell>Код авторизации</TableCell>
                                    <TableCell>ИНН</TableCell>
                                    <TableCell>Должность</TableCell>
                                    <TableCell>Город</TableCell>
                                    <TableCell>Точка</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {this.state.editUser.user.history.map(
                                    (item, key) => (
                                      <TableRow key={key}>
                                        <TableCell style={{minWidth: 125}}>{item.date_time_update}</TableCell>
                                        <TableCell>{item.update_name}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.login}</TableCell>
                                        <TableCell>{item.auth_code}</TableCell>
                                        <TableCell>{item.inn}</TableCell>
                                        <TableCell>{item.app_name}</TableCell>
                                        <TableCell>{item.city_name}</TableCell>
                                        <TableCell>{item.point_name}</TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography sx={{fontWeight: 'bold'}}>История отпусков</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer component={Paper}>
                              <Table size={'small'}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell style={{minWidth: 125}}>№</TableCell>
                                    <TableCell style={{minWidth: 125}}>Дата начала</TableCell>
                                    <TableCell>Дата окончания</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {this.state.editUser.user.vacation.map(
                                    (item, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{key + 1}</TableCell>
                                        <TableCell>{item.date_start}</TableCell>
                                        <TableCell>{item.date_end}</TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.saveEditUser.bind(this, 0)} color="primary">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modalUserNew}
          fullWidth={true}
          maxWidth={'md'}
          onClose={() => this.setState({ modalUserNew: false, editUser: null })}
        >
          <DialogTitle>Новый сотрудник</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
              {this.state.editUser && this.state.modalUserNew ? (
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Фамилия"
                            value={this.state.editUser.user.fam}
                            func={this.changeItem.bind(this, 'fam')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Имя"
                            value={this.state.editUser.user.name}
                            func={this.changeItem.bind(this, 'name')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Отчество"
                            value={this.state.editUser.user.otc}
                            func={this.changeItem.bind(this, 'otc')}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Номер телефона"
                            value={this.state.editUser.user.login}
                            func={this.changeItem.bind(this, 'login')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyDatePickerNew
                            label="Дата рождения"
                            value={dayjs(this.state.editUser.user.birthday)}
                            func={this.changeItem.bind(this, 'birthday')}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <img
                            alt={this.state.editUser.user['img_name']}
                            src={'https://storage.yandexcloud.net/user-img/max-img/' + this.state.editUser.user['img_name'] +
                              '?' + this.state.editUser.user['img_update']}
                            style={{ maxWidth: 300, maxHeight: 300 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <div className="dropzone" id="for_img_new" style={{ width: '100%', minHeight: 150 }}/>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="Код авторизации (4 цифры)"
                            value={this.state.editUser.user.auth_code}
                            func={this.changeItem.bind(this, 'auth_code')}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MyTextInput
                            label="ИНН"
                            value={this.state.editUser.user.inn}
                            func={this.changeItem.bind(this, 'inn')}
                          />
                        </Grid>
                        {parseInt(this.state.show_access) == 0 ? false
                         : (
                          <Grid item xs={12} sm={4}>
                            <MyCheckBox
                              label="Работает официально"
                              value={parseInt(this.state.editUser.user.acc_to_kas) == 1 ? true : false}
                              func={this.changeItem.bind(this, 'acc_to_kas')}
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <MyAutocomplite
                            data={this.state.editUser.appointment}
                            value={this.state.chose_app}
                            func={(event, data) => this.setState({ chose_app: data })}
                            multiple={false}
                            label="Должность"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MySelect
                            data={this.state.editUser.cities}
                            value={this.state.editUser.user.city_id}
                            func={this.changeItem.bind(this, 'city_id')}
                            label="Город"
                            is_none={false}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <MySelect
                            data={this.state.point_list_render}
                            value={this.state.editUser.user.point_id}
                            func={this.changeItem.bind(this, 'point_id')}
                            label="Точка"
                            is_none={false}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.saveNewUser.bind(this)} color="primary">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} className="container_first_child">
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MySelect
              data={this.state.point_list}
              value={this.state.point_id}
              func={this.changeSort.bind(this, 'point_id')}
              label="Точка"
              is_none={false}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              data={this.state.app_list}
              value={this.state.app_id}
              func={this.changeSort.bind(this, 'app_id')}
              multiple={false}
              label="Должность"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MyTextInput
              label="Поиск по телефону/имени"
              value={this.state.textSearch}
              func={this.search.bind(this, 'search')}
              inputAdornment={{
                endAdornment: (
                  <>
                    {!this.state.textSearch ? null :
                      <InputAdornment position="end">
                      <IconButton>
                        <ClearIcon onClick={this.search.bind(this, 'clear')} />
                      </IconButton>
                    </InputAdornment>
                    }
                  </>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openNewUser.bind(this)} variant="contained">
              Добавить сотрудника
            </Button>
          </Grid>

          <Grid item xs={12} mb={10}>
            {this.state.users.length > 0 ? (
              <SiteUserManagerTable
                users={this.state.users}
                openEditUser={this.openEditUser.bind(this)}
                handlePageChange={this.handlePageChange.bind(this)}
                handleChangeRowsPerPage={this.handleChangeRowsPerPage.bind(this)}
                page_table={this.state.page_table}
                rows_table={this.state.rows_table}
                total_rows={this.state.total_rows}
              />
            ) : null}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SiteUserManager() {
  return <SiteUserManager_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=3600'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  };
}
