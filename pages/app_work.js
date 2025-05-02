import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {MyTextInput, MyCheckBox, MySelect, MyTimePicker, MyAutocomplite, MyAlert} from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';

class AppWorkTable extends React.Component {
  shouldComponentUpdate(nextProps) {

    var array1 = nextProps.items;
    var array2 = this.props.items;

    var is_same = array1.length == array2.length && array1.every(function (element, index) { return element === array2[index] });

    return !is_same || nextProps.timeUpdate !== this.props.timeUpdate;
  }

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Работа</TableCell>
            <TableCell>Должность</TableCell>
            <TableCell>Время</TableCell>
            <TableCell>День недели</TableCell>
            <TableCell>Время открытия</TableCell>

            <TableCell>Время автоматического удаления</TableCell>
            <TableCell>Не удалять в конце смены</TableCell>
            <TableCell>Обязательна к выполнению в особый день</TableCell>
            <TableCell>
              <VisibilityIcon />
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {this.props.items.map((item, key) => (
            <TableRow key={key}>
              <TableCell
                onClick={this.props.openWork.bind(this, item.id)}
                style={{ color: '#c03', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {item.work_name}
              </TableCell>
              <TableCell>{item.app_name}</TableCell>
              <TableCell>
                {item.time_min ? item.time_min + 'мин.' : ''}
              </TableCell>
              <TableCell>{item.dow_name}</TableCell>
              <TableCell>{item.times_open}</TableCell>

              <TableCell>{item.times_close}</TableCell>

              <TableCell>
                <MyCheckBox
                  value={parseInt(item.is_not_del) == 1 ? true : false}
                  func={this.props.changeCheck.bind(this, key, 'is_not_del')}
                  label=""
                />
              </TableCell>
              <TableCell>
                <MyCheckBox
                  value={parseInt(item.is_need) == 1 ? true : false}
                  func={this.props.changeCheck.bind(this, key, 'is_need')}
                  label=""
                />
              </TableCell>
              <TableCell>
                <MyCheckBox
                  value={parseInt(item.is_active) == 1 ? true : false}
                  func={this.props.changeCheck.bind(this, key, 'is_active')}
                  label=""
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

class AppWork_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'app_work',
      module_name: '',
      is_load: false,

      items: [],
      items_min: [],
      modalDialog: false,
      modalDialogNew: false,

      dows: [
        { id: 1, name: 'Понедельник' },
        { id: 2, name: 'Вторник' },
        { id: 3, name: 'Среда' },
        { id: 4, name: 'Четверг' },
        { id: 5, name: 'Пятница' },
        { id: 6, name: 'Суббота' },
        { id: 7, name: 'Воскресенье' },

        { id: 10, name: 'Другое' },
        { id: 11, name: 'Каждый день' },
        { id: 12, name: 'Каждый день в конце смены' },
        { id: 13, name: 'Ручное добавление' },
        { id: 14, name: 'После выполнение уборки' },
      ],
      types: [
        { id: 0, name: 'Другое' },
        { id: 1, name: 'Только 1 активная' },
        { id: 2, name: 'Добавление без ограничений' },
      ],

      itemsEdit: null,
      nameWork: '',

      itemsNew: null,
      chengeItem1: null,
      chengeItemNew1: null,

      openAlert: false,
      err_status: true,
      err_text: '',

      timeUpdate: new Date(),
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    data.items.map((item, key) => {
      data.items[key]['dow_name'] = this.state.dows.find(
        (it) => parseInt(it.id) == parseInt(item.dow)
      )['name'];
    });

    this.setState({
      module_name: data.module_info.name,
      items: data.items,
      items_min: data.items_min,
      timeUpdate: new Date(),
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
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

  openCat(item) {
    this.setState({
      modalDialog: true,
      showCat: item,
      nameCat: item.name,
      editText: item.text,
    });
  }

  check_form(type) {

    let item = type === 'new' ? this.state.itemsNew : this.state.itemsEdit;

    if (!item.item.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать наименование уборки'
      });

      return;

    } 

    if (!item.item.type_new) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать категорию уборки'
      });

      return;

    } 

    if (!item.item.app_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать должность'
      });

      return;

    } 

    if (!item.item.dow) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать день недели'
      });

      return;

    } 

    if (!item.item.type_time) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать тип добавления'
      });

      return;

    }

    if(type === 'new') {
      this.saveNew();
    } else {
      this.saveEdit();
    }

  }

  async saveEdit() {

    let itemsEdit = JSON.parse(JSON.stringify(this.state.itemsEdit));

    itemsEdit.item.type_new = itemsEdit?.item?.type_new?.id;
    itemsEdit.item.app_id = itemsEdit?.item?.app_id?.id;

    let data = {
      work: itemsEdit.item,
      times_add: this.state.itemsEdit.times_add,
      times_close: this.state.itemsEdit.times_close,
    };

    let res = await this.getData('save_edit', data);

    if (!res.st) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: true,
        err_text: res.text,
        modalDialog: false,
        itemsEdit: null,
        nameWork: '',
      });

      this.update();
    }
  }

  async saveNew() {

    let itemsNew = JSON.parse(JSON.stringify(this.state.itemsNew));

    itemsNew.item.type_new = itemsNew?.item?.type_new?.id
    itemsNew.item.app_id = itemsNew?.item?.app_id?.id

    let data = {
      work: itemsNew.item,
      times_add: this.state.itemsNew.times_add,
      times_close: this.state.itemsNew.times_close,
    };

    let res = await this.getData('save_new', data);

    if (res.st === false) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });

    } else {

      this.setState({
        openAlert: true,
        err_status: true,
        err_text: res.text,
        modalDialogNew: false,
        itemsNew: null,
      });

      this.update();
    }
  }

  async openWork(id) {
    let data = {
      id: id,
    };

    let res = await this.getData('get_one', data);

    res.item.type_new = res.cats.find(item => item.id === res.item.type_new)
    res.item.app_id = res.apps.find(item => item.id === res.item.app_id)

    this.setState({
      itemsEdit: res,
      modalDialog: true,
      nameWork: res.item.name,
      chengeItem1: this.state.items_min.find(
        (item, key) => parseInt(item.id) == parseInt(res.item.work_id)
      ),
    });
  }

  async openNewWork() {
    let res = await this.getData('get_all_for_new');

    this.setState({
      itemsNew: res,
      modalDialogNew: true,
    });
  }

  chengeItem(type, event) {
    let data = event.target.value;
    let item = this.state.itemsEdit;

    item.item[[type]] = data;

    if (type == 'dow' && data == 12) {
      item.times_add = [{ time_action: '19:00' }];
      item.times_close = '23:00';
    }

    if (type == 'dow' && data == 13) {
      item.times_add = [];
    }

    this.setState({
      itemsEdit: item,
    });
  }

  chengeItem1(type, event, data) {
    let item = this.state.itemsEdit;

    item.item[[type]] = data.id;

    this.setState({
      itemsEdit: item,
      chengeItem1: data,
    });
  }

  chengeItemNew(type, event) {
    let data = event.target.value;
    let item = this.state.itemsNew;

    item.item[[type]] = data;

    if (type == 'dow' && data == 12) {
      item.times_add = [{ time_action: '19:00' }];
      item.times_close = '23:00';
    }

    if (type == 'dow' && data == 13) {
      item.times_add = [];
    }

    this.setState({
      itemsNew: item,
    });
  }

  chengeItemNew1(type, event, data) {
    let item = this.state.itemsNew;

    item.item[[type]] = data.id;

    this.setState({
      itemsNew: item,
      chengeItemNew1: data,
    });
  }

  chengeTime(key, event) {
    let data = event.target.value;
    let item = this.state.itemsEdit;

    item.times_add[key]['time_action'] = data;

    this.setState({
      itemsEdit: item,
    });
  }

  chengeTimeNew(key, event) {
    let data = event.target.value;
    let item = this.state.itemsNew;

    item.times_add[key]['time_action'] = data;

    this.setState({
      itemsNew: item,
    });
  }

  delTime(key) {
    let item = this.state.itemsEdit;

    let newArr = [];

    item.times_add.map((it, k) => {
      if (parseInt(k) != parseInt(key)) {
        newArr.push(it);
      }
    });

    item.times_add = newArr;

    this.setState({
      itemsEdit: item,
    });
  }

  delTimeNew(key) {
    let item = this.state.itemsNew;

    let newArr = [];

    item.times_add.map((it, k) => {
      if (parseInt(k) != parseInt(key)) {
        newArr.push(it);
      }
    });

    item.times_add = newArr;

    this.setState({
      itemsNew: item,
    });
  }

  addTime(event) {
    let data = document.getElementById('timePikerNew').value;
    let item = this.state.itemsEdit;

    if (data != '') {
      item.times_add.push({
        time_action: data,
      });

      this.setState({
        itemsEdit: item,
      });
    }
  }

  addTimeNew(event) {
    let data = document.getElementById('timePikerNew').value;
    let item = this.state.itemsNew;

    if (data != '') {
      item.times_add.push({
        time_action: data,
      });

      this.setState({
        itemsNew: item,
      });
    }
  }

  chengeTimeClose(event) {
    let data = event.target.value;
    let item = this.state.itemsEdit;

    item.times_close = data;

    this.setState({
      itemsEdit: item,
    });
  }

  chengeTimeCloseNew(event) {
    let data = event.target.value;
    let item = this.state.itemsNew;

    item.times_close = data;

    this.setState({
      itemsNew: item,
    });
  }

  async changeCheck(key, type, event) {
    let items = this.state.items;

    items[key][type] = event.target.checked ? 1 : 0;

    this.setState({
      items: items,
      timeUpdate: new Date(),
    });

    let data = {
      type: type,
      value: event.target.checked ? 1 : 0,
      id: items[key].id,
    };

    let res = await this.getData('save_check', data);

    if(res.st) {

      this.update();

    } else {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });

    }
  }

  async update () {
    let data = await this.getData('get_all');

    data.items.map((item, key) => {
      data.items[key]['dow_name'] = this.state.dows.find(
        (it) => parseInt(it.id) == parseInt(item.dow)
      )['name'];
    });

    this.setState({
      items: data.items,
      items_min: data.items_min,
      timeUpdate: new Date(),
    });
  }

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {!this.state.itemsEdit ? null : (
          <Dialog
            open={this.state.modalDialog}
            maxWidth={'md'}
            onClose={() => {
              this.setState({
                modalDialog: false,
                itemsEdit: null,
                nameWork: '',
              });
            }}
          >
            <DialogTitle>Уборка "{this.state.nameWork}"</DialogTitle>
            <DialogContent style={{ paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.itemsEdit.item.name}
                    func={this.chengeItem.bind(this, 'name')}
                    label="Название уборки"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                   <MyAutocomplite 
                    label='Категория уборки' 
                    multiple={false} 
                    data={this.state.itemsEdit.cats} 
                    value={this.state.itemsEdit.item.type_new === 0 ? null : this.state.itemsEdit.item.type_new} 
                    func={ (event, value) => { 
                    let this_storages = this.state.itemsEdit; 
                    this_storages.item.type_new = value;
                    this.setState({ itemsEdit: this_storages }) } } 
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.itemsEdit.item.time_min}
                    func={this.chengeItem.bind(this, 'time_min')}
                    label="Время уборки (в минутах)"
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    value={this.state.itemsEdit.item.max_count}
                    func={this.chengeItem.bind(this, 'max_count')}
                    label="Количество активаций"
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <MyTextInput
                    multiline={true}
                    maxRows={2}
                    value={this.state.itemsEdit.item.description}
                    func={this.chengeItem.bind(this, 'description')}
                    label="Описание (для внутренного использования)"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyAutocomplite 
                    label='Должность' 
                    multiple={false} 
                    data={this.state.itemsEdit.apps} 
                    value={this.state.itemsEdit.item.app_id === 0 ? null : this.state.itemsEdit.item.app_id} 
                    func={ (event, value) => { 
                    let this_storages = this.state.itemsEdit; 
                    this_storages.item.app_id = value;
                    this.setState({ itemsEdit: this_storages }) } } 
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MySelect
                    data={this.state.dows}
                    value={this.state.itemsEdit.item.dow}
                    func={this.chengeItem.bind(this, 'dow')}
                    label="День недели"
                    is_none={false}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MySelect
                    data={this.state.types}
                    value={this.state.itemsEdit.item.type_time}
                    func={this.chengeItem.bind(this, 'type_time')}
                    label="Тип добавления"
                    is_none={false}
                  />
                </Grid>

                {parseInt(this.state.itemsEdit.item.dow) != 14 ? null : (
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <MyAutocomplite
                          data={this.state.items_min}
                          value={this.state.chengeItem1 === 0 ? null : this.state.chengeItem1}
                          func={this.chengeItem1.bind(this, 'work_id')}
                          multiple={false}
                          label="Если эта уборка завершена"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <ListItemText primary={'Время добавления уборки'} />
                    </ListItem>

                    {this.state.itemsEdit.times_add.map((item, key) => (
                      <ListItem
                        key={key}
                        style={{ borderBottom: '1px solid #e5e5e5' }}
                      >
                        <MyTimePicker
                          label={''}
                          value={item.time_action}
                          func={this.chengeTime.bind(this, key)}
                        />
                        <CloseIcon
                          style={{ cursor: 'pointer' }}
                          onClick={this.delTime.bind(this, key)}
                        />
                      </ListItem>
                    ))}

                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <MyTimePicker
                        id="timePikerNew"
                        label={''}
                        value={'00:00'}
                        onBlur={this.addTime.bind(this)}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <ListItemText
                        primary={'Время автоматического удаления'}
                      />
                    </ListItem>

                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <MyTimePicker
                        label={''}
                        value={this.state.itemsEdit.times_close}
                        func={this.chengeTimeClose.bind(this)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.check_form.bind(this, 'edit')}>
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {!this.state.itemsNew ? null : (
          <Dialog
            open={this.state.modalDialogNew}
            maxWidth={'md'}
            onClose={() => {
              this.setState({ modalDialogNew: false });
            }}
          >
            <DialogTitle>Новая уборка</DialogTitle>
            <DialogContent style={{ paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.itemsNew.item.name}
                    func={this.chengeItemNew.bind(this, 'name')}
                    label="Название уборки"
                  />
                </Grid>
        
                <Grid item xs={12} sm={4}>
                   <MyAutocomplite 
                    label='Категория уборки' 
                    multiple={false} 
                    data={this.state.itemsNew.cats} 
                    value={this.state.itemsNew.item.type_new === 0 ? null : this.state.itemsNew.item.type_new} 
                    func={ (event, value) => { 
                      let this_storages = this.state.itemsNew; 
                      this_storages.item.type_new = value;
                      this.setState({ itemsNew: this_storages }) } } 
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyTextInput
                    value={this.state.itemsNew.item.time_min}
                    func={this.chengeItemNew.bind(this, 'time_min')}
                    label="Время уборки (в минутах)"
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <MyTextInput
                    value={this.state.itemsNew.item.max_count}
                    func={this.chengeItemNew.bind(this, 'max_count')}
                    label="Количество активаций"
                  />
                </Grid>

                <Grid item xs={12} sm={9}>
                  <MyTextInput
                    multiline={true}
                    maxRows={2}
                    value={this.state.itemsNew.item.description}
                    func={this.chengeItemNew.bind(this, 'description')}
                    label="Описание (для внутренного использования)"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MyAutocomplite 
                    label='Должность' 
                    multiple={false} 
                    data={this.state.itemsNew.apps} 
                    value={this.state.itemsNew.item.app_id === 0 ? null : this.state.itemsNew.item.app_id} 
                    func={ (event, value) => { 
                    let this_storages = this.state.itemsNew; 
                    this_storages.item.app_id = value;
                    this.setState({ itemsNew: this_storages }) } } 
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MySelect
                    data={this.state.dows}
                    value={this.state.itemsNew.item.dow === 0 ? '' : this.state.itemsNew.item.dow}
                    func={this.chengeItemNew.bind(this, 'dow')}
                    label="День недели"
                    is_none={false}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <MySelect
                    data={this.state.types}
                    value={this.state.itemsNew.item.type_time === 0 ? '' : this.state.itemsNew.item.type_time}
                    func={this.chengeItemNew.bind(this, 'type_time')}
                    label="Тип добавления"
                    is_none={false}
                  />
                </Grid>

                {parseInt(this.state.itemsNew.item.dow) != 14 ? null : (
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <MyAutocomplite
                          data={this.state.items_min}
                          value={this.state.chengeItemNew1 === 0 ? null : this.state.chengeItemNew1}
                          func={this.chengeItemNew1.bind(this, 'work_id')}
                          multiple={false}
                          label="Если эта уборка завершена"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <ListItemText primary={'Время добавления уборки'} />
                    </ListItem>

                    {this.state.itemsNew.times_add.map((item, key) => (
                      <ListItem
                        key={key}
                        style={{ borderBottom: '1px solid #e5e5e5' }}
                      >
                        <MyTimePicker
                          label={''}
                          value={item.time_action}
                          func={this.chengeTimeNew.bind(this, key)}
                        />
                        <CloseIcon
                          style={{ cursor: 'pointer' }}
                          onClick={this.delTimeNew.bind(this, key)}
                        />
                      </ListItem>
                    ))}

                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <MyTimePicker
                        id="timePikerNew"
                        label={''}
                        value={'00:00'}
                        onBlur={this.addTimeNew.bind(this)}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <List>
                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <ListItemText
                        primary={'Время автоматического удаления'}
                      />
                    </ListItem>

                    <ListItem style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <MyTimePicker
                        label={''}
                        value={this.state.itemsNew.times_close}
                        func={this.chengeTimeCloseNew.bind(this)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.check_form.bind(this, 'new')}>
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <MyAlert 
            isOpen={this.state.openAlert} 
            onClose={() => this.setState({ openAlert: false }) } 
            status={this.state.err_status} 
            text={this.state.err_text} 
          />

          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.openNewWork.bind(this)}
            >
              Добавить уборку
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>

          {this.state.items.length > 0 ?
            <AppWorkTable 
              items={this.state.items} 
              openWork={this.openWork.bind(this)}
              changeCheck={this.changeCheck.bind(this) }
              timeUpdate={this.state.timeUpdate}
            /> : null
          }
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function AppWork() {
  return <AppWork_ />;
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
