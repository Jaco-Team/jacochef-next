import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyCheckBox, MyAutocomplite, MyTextInput, MyDatePickerNew } from '@/ui/elements';

import Dropzone from "dropzone";

import { api } from '@/src/api_new';

import dayjs from 'dayjs';

class SiteUserManagerTable extends React.Component{
    shouldComponentUpdate(nextProps){
        var array1 = nextProps.users;
        var array2 = this.props.users;

        var is_same = (array1.length == array2.length) && array1.every(function(element, index) {
            return element === array2[index]; 
        });

        return !is_same;
    }

    render (){
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
                        {this.props.users.map((item, key) =>
                            <TableRow key={key} onClick={this.props.openEditUser.bind(this, item.id)}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>
                                    {item['img_name'] === null ? null :
                                        <img alt={item.name} src={'https://storage.yandexcloud.net/user-img/min-img/' + item['img_name'] + '?' + item['img_update']} style={{ maxWidth: 100, maxHeight: 100 }} />
                                    }
                                </TableCell>
                                <TableCell>{item.login}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.app_name}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }
}

class SiteUserManager_ extends React.Component {
    dropzoneOptions = {
        autoProcessQueue: false,
        autoQueue: true,
        maxFiles: 1,
        timeout: 0,
        parallelUploads: 10,
        acceptedFiles: "image/jpeg,image/png",
        addRemoveLinks: true,
        url: "https://jacochef.ru/src/img/users/upload.php",
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
            point_id: 0,

            app_list: [],
            chose_app: null,
            //app_id: "-1",
            app_id   : 0,
            app_filter: null,

            users: [],
            editUser: null,
            modalUserEdit: false,
            modalUserNew: false,

            textDel: '',
            textSearch: '',
            delModal: false,

            graphModal: false,
            graphType: 0,
            show_access: 0
        };
    }

    async componentDidMount() {

        let data = await this.getData('get_all');

        console.log('componentDidMount data', data);

        this.setState({
            module_name: data.module_info.name,
            point_list: data.points,
            app_list: data.apps,
            // show_access: data.my.show_access
        })

        // setTimeout(() => {
        //     this.changeSort('point_id', { target: { value: data.points[0]['id'] } })
        // }, 500)

        document.title = data.module_info.name;
    }

    getData = (method, data = {}) => {
    
      this.setState({
        is_load: true,
      });
  
      let res = api(this.state.module, method, data)
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

    changeSort(type, event, data) {

        console.log( type, event, data )

        // автокомлит для должностей
        if (type == 'app_id') {
            this.setState({
                app_id      : data != null ? data.id : 0,
                app_filter  : data
            })

        } else {
            this.setState({
                [type]: event.target.value
            })
        }

        setTimeout(() => {
            this.getUsers();
        }, 300)
    }

    async getUsers() {

        // todo
        //let app_id = this.state.app_id != null ? this.state.app_id.id : null;

        let data = {
            point_id: this.state.point_id,
            app_id: this.state.app_id,
            search: this.state.textSearch,
        };

        let res = await this.getData('getUsers', data);

        this.setState({
            users: res
        })
    }

    async openEditUser(user_id) {
        let data = {
            user_id: user_id
        };

        let res = await this.getData('getUser', data);

        // хак для автокомплита
        res.user.app_id = res.appointment.find((app) =>
            parseInt(app.id) == parseInt(res.user.app_id));

        this.setState({
            editUser: res,
            chose_app: res.user.app_id,
            modalUserEdit: true
        })

        setTimeout(() => {
            this.sortPoint();

            this.myDropzone = new Dropzone("#for_img_edit", this.dropzoneOptions);

            this.click = false;
        }, 300)
    }

    async openNewUser() {
        let res = await this.getData('getAllForNew');

        // хак для автокомплита
        res.user.app_id = null;
        this.setState({
            editUser: res,
            modalUserNew: true
        })

        setTimeout(() => {
            this.sortPoint();

            this.myDropzone = new Dropzone("#for_img_new", this.dropzoneOptions);

            this.click = false;
        }, 300)

    }

    changeItem(data, event) {

        let vendor = this.state.editUser;

        if (data == 'birthday') {
            vendor.user[data] = (event);
        } else {
            if (data == 'acc_to_kas') {
                vendor.user[data] = event.target.checked === true ? 1 : 0;
            } else {
                vendor.user[data] = event.target.value;
            }
        }

        this.setState({
            editUser: vendor
        })

        if (data == 'city_id') {
            setTimeout(() => {
                this.sortPoint();
            }, 300)
        }
    }

    // функция поиска по телефону или Фамилии
    search(data, event) {

        let v = event.target.value;

        this.setState({
            textSearch: v
        })

        setTimeout(() => {
            this.getUsers();
        }, 300)
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
            point_list_render: points_render
        })
    }

    async saveEditUser(graphType) {

      if (!this.click) {
        this.click = true;

        this.setState({
            graphType: graphType
        })

        let is_graph = false;
        var editUser_user = this.state.editUser;

        editUser_user.user.app_id = this.state.chose_app !== null ? this.state.chose_app.id : 0;


        //editUser_user.user.birthday

        this.state.app_list.map((item, key) => {
            if (parseInt(editUser_user.user.app_id) == parseInt(item.id)) {
                if (parseInt(item.is_graph) == 1 && parseInt(graphType) == 0) {
                    is_graph = true;
                }
            }
        })

        if (is_graph === true) {
            this.setState({
                graphModal: true
            })

            setTimeout(() => {
              this.click = false;
            }, 300);

            return;
        }

        //todo 
        if (parseInt(editUser_user.user.app_id) == 0 && this.state.textDel.length == 0) {

            this.setState({
                delModal: true
            })

            setTimeout(() => {
              this.click = false;
            }, 300);

            return;
        }

        if (this.myDropzone['files'].length > 0 && this.isInit === false) {
            this.isInit = true;

            this.myDropzone.on("sending", (file, xhr, data) => {
                let user_id = this.state.editUser.user.id;

                let file_type = (file.name).split('.');
                file_type = file_type[file_type.length - 1];
                file_type = file_type.toLowerCase();

                data.append("filetype", 'user_' + user_id + '.' + file_type);
                data.append("filename", 'user_' + user_id);

                this.getOrientation(file, function (orientation) {
                    data.append("orientation", orientation);
                })
            });

            this.myDropzone.on("queuecomplete", (data) => {

                var check_img = false;

                this.myDropzone['files'].map(function (item, key) {
                    if (item['status'] == "error") {
                        check_img = true;
                    }
                })

                if (check_img) {
                    alert('Ошибка при загрузке фотографии')
                    return;
                }

                this.setState({
                    delModal: false,
                    graphModal: false,
                    modalUserEdit: false,
                    editUser: null,
                })

                this.isInit = false;
                this.getUsers();
            })
        }

        editUser_user.user.birthday = dayjs(editUser_user.user.birthday).format('YYYY-MM-DD')

        let data = {
            user: editUser_user,
            textDel: this.state.textDel,
            graphType: graphType
        };

        let res = await this.getData('saveEditUser', data);

        if (res.st === false) {
            alert(res.text);
        } else {

            if (this.myDropzone['files'].length == 0) {
                this.isInit = false;

                this.setState({
                    delModal: false,
                    graphModal: false,
                    modalUserEdit: false,
                    editUser: null
                })

                this.getUsers();
            } else {
                this.setState({
                    is_load: true,
                    graphModal: false,
                })

                this.myDropzone.processQueue();
            }
        }

        setTimeout(() => {
          this.click = false;
        }, 300);
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
        })

        if (is_graph_ === true && this.myDropzone['files'].length == 0) {
            alert('Необходимо фотография сотрудника');

            setTimeout(() => {
              this.click = false;
            }, 300);

            return;
        }

        if (this.myDropzone['files'].length > 0 && this.isInit === false) {
            this.isInit = true;

            this.myDropzone.on("sending", (file, xhr, data) => {
                let user_id = this.state.editUser.user.id;

                let file_type = (file.name).split('.');
                file_type = file_type[file_type.length - 1];
                file_type = file_type.toLowerCase();

                data.append("filetype", 'user_' + user_id + '.' + file_type);
                data.append("filename", 'user_' + user_id);

                this.getOrientation(file, function (orientation) {
                    data.append("orientation", orientation);
                })
            });

            this.myDropzone.on("queuecomplete", (data) => {

                var check_img = false;

                this.myDropzone['files'].map(function (item, key) {
                    if (item['status'] == "error") {
                        check_img = true;
                    }
                })

                if (check_img) {
                    alert('Ошибка при загрузке фотографии')
                    return;
                }

                // картинка прелоадер
                this.setState({
                    modalUserNew: false,
                    editUser: null,
                    is_load: false
                })

                this.isInit = false;
                this.getUsers();
            })
        }

        editUser_user.user.birthday = dayjs(editUser_user.user.birthday).format('YYYY-MM-DD')

        // console.log( editUser_user )

        let data = {
            user: editUser_user,
            graphType: is_graph === true ? 1 : 0
        };

        let res = await this.getData('saveNewUser', data);

        if (res.st === false) {
            alert(res.text);
        } else {

            if (res.sms === false) {
                alert('Ошибка в отправке смс');
            }

            if (this.myDropzone['files'].length == 0) {
                this.isInit = false;

                this.setState({
                    modalUserNew: false,
                    editUser: null
                })

                this.getUsers();
            } else {
                let user = this.state.editUser;
                user.user.id = res.user_id;

                user.user.app_id = this.state.editUser.user.app_id;

                // картинка прелоадер
                this.setState({
                    editUser: user,
                    is_load: true
                })

                setTimeout(() => {
                    this.myDropzone.processQueue();
                }, 400)
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

            if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

            var length = view.byteLength,
                offset = 2;

            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;

                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) {
                        return callback(-1);
                    }
                    var little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;

                    for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                } else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }

            return callback(-1);
        };

        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    };

    render() {
        return (
            <>
                <Backdrop style={{ zIndex: 99999 }} open={this.state.is_load}>
                    <CircularProgress color="inherit" />
                </Backdrop>

                <Dialog open={this.state.delModal} onClose={() => { this.setState({ delModal: false, textDel: '' }) }}>
                    <DialogTitle>Причина увольнения</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Увольнение происходит не сразу, а в полночь
                        </DialogContentText>
                        <Grid container spacing={3} style={{ paddingBottom: 10, paddingTop: 20 }}>
                            <Grid item xs={12}>
                                <MyTextInput label="Причина увольнения" value={this.state.textDel} func={(event) => { this.setState({ textDel: event.target.value }) }} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button variant="contained" onClick={this.saveEditUser.bind(this, 0)}>Уволить</Button>
                        <Button onClick={() => { this.setState({ delModal: false, textDel: '' }) }}>Отмена</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={this.state.graphModal} onClose={() => { this.setState({ graphModal: false, graphType: 0 }) }}>
                    <DialogTitle>С какого периода применить изменения ?</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} style={{ paddingBottom: 10, paddingTop: 20 }}>

                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" onClick={ this.saveEditUser.bind(this, 1) } style={{ width: '100%' }}>С текущего периода</Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" onClick={ this.saveEditUser.bind(this, 2) } style={{ width: '100%' }}>Со следующего периода</Button>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" onClick={ this.saveEditUser.bind(this, 3) } style={{ width: '100%' }}>Без изменений</Button>
                            </Grid>

                        </Grid>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={this.state.modalUserEdit}
                    fullWidth={true}
                    maxWidth={'md'}
                    onClose={() => { this.setState({ modalUserEdit: false, editUser: null }) }}
                >
                    <DialogTitle>Редактирование сотрудника</DialogTitle>
                    <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

                        <Grid container spacing={3}>

                            {this.state.editUser && this.state.modalUserEdit ?
                                
                                    <Grid item xs={12}>

                                        <Grid container spacing={3}>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Фамилия" value={this.state.editUser.user.fam} func={this.changeItem.bind(this, 'fam')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Имя" value={this.state.editUser.user.name} func={this.changeItem.bind(this, 'name')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Отчество" value={this.state.editUser.user.otc} func={this.changeItem.bind(this, 'otc')} />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Номер телефона" value={this.state.editUser.user.login} func={this.changeItem.bind(this, 'login')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyDatePickerNew label="Дата рождения" value={ dayjs(this.state.editUser.user.birthday) } func={this.changeItem.bind(this, 'birthday')} />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <img alt={this.state.editUser.user['img_name']} src={'https://storage.yandexcloud.net/user-img/max-img/' + this.state.editUser.user['img_name'] + '?' + this.state.editUser.user['img_update']} style={{ maxWidth: 300, maxHeight: 300 }} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <div className="dropzone" id="for_img_edit" style={{ width: '100%', minHeight: 150 }} />
                                                    </Grid>
                                                </Grid>

                                            </Grid>


                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Код авторизации (4 цифры)" value={this.state.editUser.user.auth_code} func={this.changeItem.bind(this, 'auth_code')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="ИНН" value={this.state.editUser.user.inn} func={this.changeItem.bind(this, 'inn')} />
                                                    </Grid>
                                                    { parseInt(this.state.show_access) == 0 ? false :
                                                        <Grid item xs={12} sm={4}>
                                                            <MyCheckBox label="Работает официально" value={parseInt(this.state.editUser.user.acc_to_kas) == 1 ? true : false} func={this.changeItem.bind(this, 'acc_to_kas')} />
                                                        </Grid>
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyAutocomplite data={this.state.editUser.appointment} value={this.state.chose_app} func={(event, data) => {
                                                            this.setState({ chose_app: data })
                                                        }} multiple={false} label='Должность' />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MySelect data={this.state.editUser.cities} value={this.state.editUser.user.city_id} func={this.changeItem.bind(this, 'city_id')} label='Город' />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MySelect data={this.state.point_list_render} value={this.state.editUser.user.point_id} func={this.changeItem.bind(this, 'point_id')} label='Точка' />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <TableContainer component={Paper}>
                                                    <Table size={'small'}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell style={{ minWidth: 125 }}>Дата</TableCell>
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
                                                            {this.state.editUser.user.history.map((item, key) =>
                                                                <TableRow key={key}>
                                                                    <TableCell style={{ minWidth: 125 }}>{item.date_time_update}</TableCell>
                                                                    <TableCell>{item.update_name}</TableCell>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell>{item.login}</TableCell>
                                                                    <TableCell>{item.auth_code}</TableCell>
                                                                    <TableCell>{item.inn}</TableCell>
                                                                    <TableCell>{item.app_name}</TableCell>
                                                                    <TableCell>{item.city_name}</TableCell>
                                                                    <TableCell>{item.point_name}</TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Grid>

                                        </Grid>

                                    </Grid>

                                
                                :
                                null
                            }
                        </Grid>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.saveEditUser.bind(this, 0)} color="primary">Сохранить</Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.state.modalUserNew}
                    fullWidth={true}
                    maxWidth={'md'}
                    onClose={() => { this.setState({ modalUserNew: false, editUser: null }) }}
                >
                    <DialogTitle>Новый сотрудник</DialogTitle>
                    <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

                        <Grid container spacing={3}>

                            {this.state.editUser && this.state.modalUserNew ?
                                
                                    <Grid item xs={12}>

                                        <Grid container spacing={3}>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Фамилия" value={this.state.editUser.user.fam} func={this.changeItem.bind(this, 'fam')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Имя" value={this.state.editUser.user.name} func={this.changeItem.bind(this, 'name')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Отчество" value={this.state.editUser.user.otc} func={this.changeItem.bind(this, 'otc')} />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Номер телефона" value={this.state.editUser.user.login} func={this.changeItem.bind(this, 'login')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyDatePickerNew label="Дата рождения" value={dayjs(this.state.editUser.user.birthday)} func={this.changeItem.bind(this, 'birthday')} />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <img alt={this.state.editUser.user['img_name']} src={'https://storage.yandexcloud.net/user-img/max-img/' + this.state.editUser.user['img_name'] + '?' + this.state.editUser.user['img_update']} style={{ maxWidth: 300, maxHeight: 300 }} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <div className="dropzone" id="for_img_new" style={{ width: '100%', minHeight: 150 }} />
                                                    </Grid>
                                                </Grid>

                                            </Grid>


                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="Код авторизации (4 цифры)" value={this.state.editUser.user.auth_code} func={this.changeItem.bind(this, 'auth_code')} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyTextInput label="ИНН" value={this.state.editUser.user.inn} func={this.changeItem.bind(this, 'inn')} />
                                                    </Grid>
                                                    { parseInt(this.state.show_access) == 0 ? false :
                                                        <Grid item xs={12} sm={4}>
                                                            <MyCheckBox label="Работает официально" value={parseInt(this.state.editUser.user.acc_to_kas) == 1 ? true : false} func={this.changeItem.bind(this, 'acc_to_kas')} />
                                                        </Grid>
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={4}>
                                                        <MyAutocomplite data={this.state.editUser.appointment} value={this.state.chose_app} func={(event, data) => {
                                                            this.setState({ chose_app: data })
                                                        }} multiple={false} label='Должность' />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MySelect data={this.state.editUser.cities} value={this.state.editUser.user.city_id} func={this.changeItem.bind(this, 'city_id')} label='Город' />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <MySelect data={this.state.point_list_render} value={this.state.editUser.user.point_id} func={this.changeItem.bind(this, 'point_id')} label='Точка' />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                    </Grid>

                                
                                :
                                null
                            }
                        </Grid>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.saveNewUser.bind(this)} color="primary">Сохранить</Button>
                    </DialogActions>
                </Dialog>


                <Grid container spacing={3} className='container_first_child'>
                    <Grid item xs={12} sm={12}>
                        <h1>{this.state.module_name}</h1>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MySelect data={this.state.point_list} value={this.state.point_id} func={this.changeSort.bind(this, 'point_id')} label='Точка' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MyAutocomplite data={this.state.app_list} value={this.state.app_filter} func={this.changeSort.bind(this, 'app_id') } multiple={false} label='Должность' />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MyTextInput label="Поиск по телефону/имени" value={this.state.textSearch} func={this.search.bind(this, 'search')} />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                        <Button onClick={this.openNewUser.bind(this)} variant="contained">Добавить сотрудника</Button>
                    </Grid>

                    <Grid item xs={12}>
                        { this.state.users.length > 0 ?
                            <SiteUserManagerTable users={this.state.users} openEditUser={ this.openEditUser.bind(this) } />
                                :
                            null
                        }
                    </Grid>


                </Grid>
            </>
        )
    }
}

export default function SiteUserManager() {
  return <SiteUserManager_ />;
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
