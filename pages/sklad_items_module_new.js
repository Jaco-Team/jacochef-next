import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Divider from '@mui/material/Divider';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MySelect, MyCheckBox, MyAutocomplite, MyTextInput, MyAlert} from '@/ui/elements';

import queryString from 'query-string';

class SkladItemsModule_Modal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log(nextProps.item);

    if (!nextProps.item) {
      return null;
    }

    if (nextProps.item !== prevState.item) {
      return { item: nextProps.item };
    }
    return null;
  }

  onClose() {
    this.setState({
      item: [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '5%' }}>Просмотр</TableCell>
                  <TableCell style={{ width: '20%' }}>Наименование</TableCell>
                  <TableCell style={{ width: '15%' }}>Действует с</TableCell>
                  <TableCell style={{ width: '15%' }}>по</TableCell>
                  <TableCell style={{ width: '15%' }}>Дата редактирования</TableCell>
                  <TableCell style={{ width: '20%' }}>Редактор</TableCell>
                  <TableCell style={{ width: '10%' }}>Редактирование</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell><TextSnippetOutlinedIcon /></TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.date_start}</TableCell>
                    <TableCell>{it.date_end}</TableCell>
                    <TableCell>{it.date_update}</TableCell>
                    <TableCell>{it.user}</TableCell>
                    <TableCell><EditIcon /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose.bind(this)} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemEdit: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log(nextProps.event);

    if (!nextProps.event) {
      return null;
    }

    if (nextProps.event !== prevState.event) {
      return { itemEdit: nextProps.event };
    }
    return null;
  }

  changeItem(data, event) {
    let vendor = this.state.itemEdit;
    vendor.item[data] = event.target.value;

    this.setState({
      itemEdit: vendor,
    });
  }

  changeItemChecked(data, event) {
    let vendor = this.state.itemEdit;
    vendor.item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      itemEdit: vendor,
    });
  }

  changeDataUnload(type, key, event, value) {
    let vendor = this.state.itemEdit;

    if (type === 'post') {
      vendor.users[key].name = value ? value.name : '';
    }

    if (type === 'time') {
      vendor.users[key].time = event.target.value;
    }

    if (vendor.users[key].name && vendor.users[key].time && !vendor.users[key]?.add) {
      vendor.users[key].add = true;
      vendor.users.push({ id: '0', name: '', time: '' });
    }

    if ((!vendor.users[key].name || !vendor.users[key].time) && vendor.users[key]?.add && vendor.users.length > 1) {
      vendor.users[key].add = false;
      vendor.users.pop();
    }

    this.setState({
      itemEdit: vendor,
    });
  }

  onClose() {
    this.setState({
      itemEdit: this.props.event ? this.props.event : null,
    });
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Название товара"
                value={this.state.itemEdit ? this.state.itemEdit.item.name : ''}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyAutocomplite
                label="Категория"
                multiple={false}
                data={this.state.itemEdit ? this.state.itemEdit.cats : []}
                value={this.state.itemEdit ? this.state.itemEdit.item.cat_id === '0' ? '' : this.state.itemEdit.item.cat_id : ''}
                func={(event, value) => {
                  let this_storages = this.state.itemEdit;
                  this_storages.item.cat_id = value;
                  this.setState({ itemEdit: this_storages });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <MySelect
                data={this.state.itemEdit ? this.state.itemEdit.ed_izmer : []}
                value={this.state.itemEdit ? this.state.itemEdit.item.ed_izmer_id === '0' ? '' : this.state.itemEdit.item.ed_izmer_id : ''}
                func={this.changeItem.bind(this, 'ed_izmer_id')}
                label="Ед измер"
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <MyTextInput
                label="Максимальное количество заказов в месяц (0 - без ограничений)"
                value={this.state.itemEdit ? this.state.itemEdit.item.max_count_in_m : ''}
                func={this.changeItem.bind(this, 'max_count_in_m')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Название товара для поставщика"
                value={this.state.itemEdit ? this.state.itemEdit.item.name_for_vendor : ''}
                func={this.changeItem.bind(this, 'name_for_vendor')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Количество в упаковке"
                value={this.state.itemEdit ? this.state.itemEdit.item.pq : ''}
                func={this.changeItem.bind(this, 'pq')}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <MyTextInput
                label="% заявки"
                value={this.state.itemEdit ? this.state.itemEdit.item.percent : ''}
                func={this.changeItem.bind(this, 'percent')}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <MyTextInput
                label="Разрешенный % повышения ценника"
                value={this.state.itemEdit ? this.state.itemEdit.item.vend_percent : ''}
                func={this.changeItem.bind(this, 'vend_percent')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Код для 1с"
                value={this.state.itemEdit ? this.state.itemEdit.item.art : ''}
                func={this.changeItem.bind(this, 'art')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Минимальный остаток"
                value={''}
                // value={ this.state.itemEdit ? this.state.itemEdit.item.art : ''}
                // func={ this.changeItem.bind(this, 'art') }
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Состав"
                multiple={true}
                data={[]}
                value={''}
                // data={this.state.itemEdit ? this.state.itemEdit.pf_list : []}
                // value={
                //   this.state.itemEdit
                //     ? this.state.itemEdit.item.pf_id == '0'
                //       ? null
                //       : this.state.itemEdit.item.pf_id
                //     : ''
                // }
                // func={(event, value) => {
                //   let this_storages = this.state.itemEdit;
                //   this_storages.item.pf_id = value;
                //   this.setState({ itemEdit: this_storages });
                // }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Аллергены"
                multiple={true}
                data={[]}
                value={''}
                // data={this.state.itemEdit ? this.state.itemEdit.pf_list : []}
                // value={
                //   this.state.itemEdit
                //     ? this.state.itemEdit.item.pf_id == '0'
                //       ? null
                //       : this.state.itemEdit.item.pf_id
                //     : ''
                // }
                // func={(event, value) => {
                //   let this_storages = this.state.itemEdit;
                //   this_storages.item.pf_id = value;
                //   this.setState({ itemEdit: this_storages });
                // }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Возможные аллергены"
                multiple={true}
                data={[]}
                value={''}
                // data={this.state.itemEdit ? this.state.itemEdit.pf_list : []}
                // value={
                //   this.state.itemEdit
                //     ? this.state.itemEdit.item.pf_id == '0'
                //       ? null
                //       : this.state.itemEdit.item.pf_id
                //     : ''
                // }
                // func={(event, value) => {
                //   let this_storages = this.state.itemEdit;
                //   this_storages.item.pf_id = value;
                //   this.setState({ itemEdit: this_storages });
                // }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <h4>Места хранения</h4>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Места хранения"
                multiple={true}
                data={this.state.itemEdit ? this.state.itemEdit.storages : []}
                value={this.state.itemEdit ? this.state.itemEdit.this_storages : ''}
                func={(event, value) => {
                  let this_storages = this.state.itemEdit;
                  this_storages.this_storages = value;
                  this.setState({ itemEdit: this_storages });
                }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <h4>Разгрузка</h4>
              <Divider />
            </Grid>

            {this.state.itemEdit?.users.map((user, key) => (
              <React.Fragment key={key}>
                <Grid item xs={12} sm={5}>
                  <MyAutocomplite
                    label="Должность в кафе"
                    multiple={false}
                    data={this.state.itemEdit ? this.state.itemEdit.posts : []}
                    value={user ?? {}}
                    func={this.changeDataUnload.bind(this, 'post', key)}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <MyTextInput
                    label="Время"
                    value={user?.time ? user.time : ''}
                    func={this.changeDataUnload.bind(this, 'time', key)}
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.props.method === 'Редактирование товара' ? this.props.checkArt.bind(this, this.state.itemEdit) : this.props.checkArtNew.bind(this, this.state.itemEdit)}
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'sklad_items_module',
      module_name: '',
      is_load: false,

      cats: [],
      allItems: [],
      vendor_items: [],

      modalDialog: false,
      modalDialogHistory: false,

      method: null,
      itemEdit: null,
      itemName: '',
      item: [],

      checkArtDialog: false,
      checkArtList: [],

      freeItems: [],

      searchItem: '',

      fullScreen: false,

      operAlert: false,
      err_status: false,
      err_text: '',
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    //console.log('data', data);

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      freeItems: data.items_free,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, is_load = true) => {
    if (is_load == true) {
      this.setState({
        is_load: true,
      });
    }

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

  async changeCity(event) {
    let data = {
      city: event.target.value,
    };

    let res = await this.getData('get_vendors', data);

    this.setState({
      vendors: res,
      city: event.target.value,
    });
  }

  changeSort(data, event) {
    this.state.vendor_items.map((item, key) => {
      if (parseInt(item.item_id) == parseInt(data)) {
        this.state.vendor_items[key]['sort'] = event.target.value;
      }
    });

    this.setState({
      vendor_items: this.state.vendor_items,
    });
  }

  async showEditItem(id, method) {
    this.handleResize();

    let data = {
      item_id: id,
    };

    let res = await this.getData('get_one', data);

    res.item.pf_id = res.pf_list.find((item) => item.id === res.item.pf_id);
    res.item.cat_id = res.cats.find((item) => item.id === res.item.cat_id);

    res.users = [{ id: '2', name: 'Повар', time: '11:15' }]; // для тестирования добавления должности и времени разгрузки
    res.posts = [
      { id: '1', name: 'Менеджер' },
      { id: '2', name: 'Повар' },
      { id: '3', name: 'Курьер' },
    ]; // для тестирования добавления должности и времени разгрузки

    this.setState({
      modalDialog: true,
      method,
      itemEdit: res,
      itemName: res.item.name,
    });
  }

  async openHistoryItem(id, method) {
    this.handleResize();

    // const data = {
    //   item_id: id,
    // };

    // const res = await this.getData('get_one', data);

    const res = [
      {
        id: '96',
        name: 'Сыр Пармезан',
        date_start: '2022-01-13',
        date_end: '2023-02-14',
        date_update: '2023-02-14',
        user: 'Иванов И.И.',
      },
      {
        id: '96',
        name: 'Сыр Пармезан',
        date_start: '2023-02-15',
        date_end: '2024-02-14',
        date_update: '2024-02-14',
        user: 'Иванов И.И.',
      },
      {
        id: '96',
        name: 'Сыр Пармезан',
        date_start: '2024-02-15',
        date_end: '',
        date_update: '2024-02-14',
        user: 'Иванов И.И.',
      },
    ]; // для тестирования модалки истории изменений

    this.setState({
      modalDialogHistory: true,
      item: res,
      itemName: res[0].name,
      method,
    });
  }

  async saveEditItem(itemEdit, main_item_id = 0) {
    let pf_id = itemEdit.item.pf_id.id;
    let cat_id = itemEdit.item.cat_id.id;

    itemEdit.item.pf_id = pf_id;
    itemEdit.item.cat_id = cat_id;

    let data = {
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      main_item_id:
        parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    //let res = await this.getData('saveEditItem', data);

    let res = { st: false, text: 'Сохранение изменений в товаре отключено' };

    if (res.st === false) {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      setTimeout(async () => {
        this.search();
      }, 300);
    }
  }

  async saveNewItem(itemEdit, main_item_id = 0) {
    let pf_id = itemEdit.item.pf_id.id;
    let cat_id = itemEdit.item.cat_id.id;

    itemEdit.item.pf_id = pf_id;
    itemEdit.item.cat_id = cat_id;

    let data = {
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      main_item_id:
        parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    //let res = await this.getData('saveNewItem', data);

    let res = { st: false, text: 'Сохранение добаления товара отключено' };

    if (res.st === false) {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      setTimeout(async () => {
        this.search();
      }, 300);
    }
  }

  async checkArt(itemEdit) {
    let data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };

    let res = await this.getData('checkArt', data);

    if (res.st === false) {
      this.setState({
        checkArtDialog: true,
        checkArtList: res.data,
        itemEdit: itemEdit,
      });
    } else {
      this.saveEditItem(itemEdit);
    }
  }

  async checkArtNew(itemEdit) {
    let data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };

    let res = await this.getData('checkArt', data);

    if (res.st === false) {
      res.data.push({ id: -1, name: this.state.itemEdit.item.name });

      this.setState({
        checkArtDialog: true,
        checkArtList: res.data,
      });
    } else {
      this.saveNewItem(itemEdit);
    }
  }

  chooseArt(item_id) {
    if (this.state.modalItemNew === true) {
      this.saveNewItem(item_id);
    } else {
      this.saveEditItem(this.state.itemEdit, item_id);
    }
  }

  async openModalItemNew(method) {
    this.handleResize();

    let res = await this.getData('get_all_for_new');

    res.users = [{ id: '0', name: '', time: '' }]; // для тестирования добавления должности и времени разгрузки
    res.posts = [
      { id: '1', name: 'Менеджер' },
      { id: '2', name: 'Повар' },
      { id: '3', name: 'Курьер' },
    ]; // для тестирования добавления должности и времени разгрузки

    this.setState({
      modalDialog: true,
      itemEdit: res,
      itemName: '',
      method,
    });
  }

  async saveItem(item_id, type, value) {
    let data = {
      item_id,
      type,
      value,
    };

    // let res = await this.getData('saveItem', data, false);

    let res = { st: false, text: 'Сохранение отключено' };

    if (res.st === false) {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        modalItemNew: false,
        modalItemEdit: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      res = await this.getData('get_all');

      this.setState({
        cats: res.cats,
        freeItems: res.items_free,
      });
    }
  }

  async search() {
    let data = {
      item: this.state.searchItem,
    };

    let res = await this.getData('get_all_search', data);

    this.setState({
      cats: res.cats,
      freeItems: res.items_free,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          onClose={() => this.setState({ checkArtDialog: false, checkArtList: [] })}
          open={this.state.checkArtDialog}
        >
          <DialogTitle>Такой код 1с уже задан у следующих позиций:</DialogTitle>
          <List sx={{ pt: 0 }}>
            {this.state.checkArtList.map((item, key) => (
              <ListItemButton onClick={this.chooseArt.bind(this, item.id)} key={key}>
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>

        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <SkladItemsModule_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          checkArtNew={this.checkArtNew.bind(this)}
          checkArt={this.checkArt.bind(this)}
          method={this.state.method}
          event={this.state.itemEdit}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />

        <SkladItemsModule_Modal_History
          open={this.state.modalDialogHistory}
          onClose={() => this.setState({ modalDialogHistory: false })}
          item={this.state.item}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModalItemNew.bind(this, 'Новый товар')} variant="contained">
              Добавить товар
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyTextInput
              label="Поиск"
              value={this.state.searchItem}
              func={(event) => this.setState({ searchItem: event.target.value })}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} style={{ paddingBottom: '50px' }}>
            {this.state.cats.map((item, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.cats.map((category, key_cat) => (
                    <Accordion key={key_cat}>
                      <AccordionSummary style={{ backgroundColor: '#ffff' }} expandIcon={<ExpandMoreIcon />}>
                        <Typography>{category.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails className="accordion_details">
                        <TableContainer component={Paper} sx={{ maxHeight: { xs: 'none', sm: 500 } }}>
                          <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell style={{ width: '5%' }}>№</TableCell>
                                <TableCell style={{ width: '10%' }}>Активность</TableCell>
                                <TableCell style={{ width: '10%' }}>Заявка</TableCell>
                                <TableCell style={{ width: '10%' }}>Ревизия</TableCell>
                                <TableCell style={{ width: '20%' }}>Товар</TableCell>
                                <TableCell style={{ width: '15%' }}>Код для 1С</TableCell>
                                <TableCell style={{ width: '15%' }}>Редактирование</TableCell>
                                <TableCell style={{ width: '15%' }}>История изменений</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {category.items.map((it, k) => (
                                <TableRow key={k}>
                                  <TableCell>{k + 1}</TableCell>
                                  <TableCell onClick={this.saveItem.bind(this, it.id, 'active', it.is_show)}>
                                    <MyCheckBox
                                      label=""
                                      value={parseInt(it.is_show) == 1 ? true : false}
                                    />
                                  </TableCell>
                                  <TableCell
                                  // onClick={this.saveItem.bind(this, it.id, 'show_in_rev', it.show_in_rev)}
                                  >
                                    <MyCheckBox
                                      label=""
                                      // value={parseInt(it.is_show) == 1 ? true : false }
                                      value={false}
                                    />
                                  </TableCell>
                                  <TableCell onClick={this.saveItem.bind(this, it.id, 'show_in_rev', it.show_in_rev)}>
                                    <MyCheckBox
                                      label=""
                                      value={parseInt(it.show_in_rev) == 1 ? true : false}
                                    />
                                  </TableCell>
                                  <TableCell>{it.name}</TableCell>
                                  <TableCell></TableCell>
                                  <TableCell
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.showEditItem.bind(this, it.id, 'Редактирование товара')}
                                  >
                                    <EditIcon />
                                  </TableCell>
                                  <TableCell
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.openHistoryItem.bind(this, it.id, 'История изменений')}
                                  >
                                    <EditNoteIcon />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
            {this.state.freeItems.length == 0 ? null : (
              <Accordion>
                <AccordionSummary style={{ backgroundColor: '#ffff' }} expandIcon={<ExpandMoreIcon />}>
                  <Typography>Без категории</Typography>
                </AccordionSummary>
                <AccordionDetails className="accordion_details">
                  <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                          <TableCell style={{ width: '5%' }}>№</TableCell>
                          <TableCell style={{ width: '10%' }}>Активность</TableCell>
                          <TableCell style={{ width: '10%' }}>Заявка</TableCell>
                          <TableCell style={{ width: '10%' }}>Ревизия</TableCell>
                          <TableCell style={{ width: '20%' }}>Товар</TableCell>
                          <TableCell style={{ width: '15%' }}>Код для 1С</TableCell>
                          <TableCell style={{ width: '15%' }}>Редактирование</TableCell>
                          <TableCell style={{ width: '15%' }}>История изменений</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.freeItems.map((it, key) => (
                          <TableRow key={key}>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell onClick={this.saveItem.bind(this, it.id, 'active', it.is_show)}>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.is_show) == 1 ? true : false}
                              />
                            </TableCell>
                            <TableCell
                            // onClick={this.saveItem.bind(this, it.id, 'show_in_rev', it.show_in_rev)}
                            >
                              <MyCheckBox
                                label=""
                                // value={parseInt(it.is_show) == 1 ? true : false }
                                value={false}
                              />
                            </TableCell>
                            <TableCell onClick={this.saveItem.bind(this, it.id, 'show_in_rev', it.show_in_rev)}>
                              <MyCheckBox
                                label=""
                                value={parseInt(it.show_in_rev) == 1 ? true : false}
                              />
                            </TableCell>
                            <TableCell>{it.name}</TableCell>
                            <TableCell></TableCell>
                            <TableCell
                              style={{ cursor: 'pointer' }}
                              onClick={this.showEditItem.bind(this, it.id, 'Редактирование товара')}
                            >
                              <EditIcon />
                            </TableCell>
                            <TableCell
                              style={{ cursor: 'pointer' }}
                              onClick={this.openHistoryItem.bind(this, it.id, 'История изменений')}
                            >
                              <EditNoteIcon />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SkladItemsModule() {
  return <SkladItemsModule_ />;
}
