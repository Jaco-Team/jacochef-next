import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {MySelect, MyDatePickerNew, formatDate, MyAlert, MyTextInput, MyAutocomplite} from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';
import moment from 'moment';

class Write_off_journal_View extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '10%' }}>#</TableCell> 
                  <TableCell style={{ width: '20%' }}>Тип</TableCell>
                  <TableCell style={{ width: '40%' }}>Наименование</TableCell>
                  <TableCell style={{ width: '20%' }}>Количество</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.itemView?.items.map((it, key) => (
                  <TableRow key={key} sx={{ '& td': { color: it?.color ? '#fff' : 'rgba(0, 0, 0, 0.87)'} }} style={{backgroundColor: it?.color ? it.color === 'add' ? 'rgb(255, 204, 0)' : 'red' : '#fff'}}>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.type_name}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.value + ' ' + it.ei_name}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}>
                    <MyTextInput
                      label="Комментарий"
                      value={this.state.itemView?.coment?.color ? this.state.itemView?.coment?.key : this.state.itemView?.coment}
                      disabled={true}
                      className={this.state.itemView?.coment?.color ? "disabled_input disabled_input_color" : "disabled_input"}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.onClose.bind(this)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Write_off_journal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
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
        maxWidth={'xl'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ alignSelf: 'center' }}>{this.props.method}</Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '5%' }}>#</TableCell>
                  <TableCell style={{ width: '20%' }}>Дата создания</TableCell>
                  <TableCell style={{ width: '25%' }}>Дата редактирования/удаления</TableCell>
                  <TableCell style={{ width: '25%' }}>Время редактирования/удаления</TableCell>
                  <TableCell style={{ width: '20%' }}>Редактор</TableCell>
                  <TableCell style={{ width: '5%' }}>Просмотр</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key} hover>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.date_create}</TableCell>
                    <TableCell>{it.date_update === '0000-00-00' ? '' : it.date_update}</TableCell>
                    <TableCell>{parseInt(it.time_update) ? it.time_update : ''}</TableCell>
                    <TableCell>{it.user_update ?? it.user_create}</TableCell>
                    <TableCell style={{ cursor: 'pointer' }} onClick={this.props.openModalHistoryView.bind(this, key)}><TextSnippetOutlinedIcon /></TableCell>
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

class Write_off_journal_modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      points: [],
      point: '',

      types: [],
      type: '',

      items: [],
      item: '',

      ed_izmer: '',

      count: '',
      writeOffItems: [],

      comment: '',

      openAlert: false,
      err_status: true,
      err_text: '',

      confirmDialog: false
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.itemEdit);

    if (!this.props.itemEdit) {
      return;
    }

    if (this.props.itemEdit !== prevProps.itemEdit) {
      const point = this.props.points.find(point => parseInt(point.id) === parseInt(this.props.point)) ?? '';

      this.setState({
        point,
        points: this.props.points,
        types: this.props.itemEdit.types,
        writeOffItems: this.props.itemEdit?.woj_items ?? [],
        comment: this.props.itemEdit?.woj?.coment ?? ''
      });

    }
  }

  changeItem(data, event) {

    let value = event.target.value;

    if(value < 0 && data === 'count') {

      this.setState({
        [data]: 0,
      });

    } else {

      this.setState({
        [data]: value,
      });

    }
  }

  changeType(data, event) {
    const items = this.props.itemEdit.items.filter((it) => {
      if(parseInt(event.target.value) === 1) {
        return it.type === 'item' || it.type === 'set';
      }
      if(parseInt(event.target.value) === 2) {
        return it.type === 'rec' || it.type === 'pf';
      }
      if(parseInt(event.target.value) === 3) {
        return it.type === 'pos';
      }
    });

    this.setState({
      [data]: event.target.value,
      items,
      item: ''
    });
  }

  changeItemData(data, event, value) {
    this.setState({
      [data]: value,
      ed_izmer: value ? value?.ei_name ?? '' : ''
    });
  }

  addItems() {
    let { type, types, item, count, writeOffItems } = this.state;

    if (!type || !item || !parseInt(count)) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать все данные для списания'
      });

      return;

    }

    const type_ = types.find((it) => parseInt(it.id) === parseInt(type));

    const data = {
      id: item.id,
      ei_name: item.ei_name,
      name: item.name,
      type: item.type,
      type_name: type_.name,
      type_s: '1',
      value: count
    };

    writeOffItems.push(data);

    this.setState({
      writeOffItems,
      items: [],
      type: '',
      item: '',
      count: '',
      ed_izmer: ''
    });
  }

  deleteItem(index) {
    let writeOffItems = this.state.writeOffItems;

    writeOffItems.splice(index, 1);

    this.setState({
      writeOffItems
    });
  }

  delete() {
    const point = this.state.point;

    this.props.deleteItem(this.props.itemEdit?.woj?.id, point); 
    this.setState({ confirmDialog: false })
  }

  save() {
    const writeOffItems = this.state.writeOffItems;

    if (!writeOffItems.length) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Позиции для списания отсутствуют!'
      });

      return;

    }

    const id = this.props.itemEdit?.woj?.id ?? 0;

    const comment = this.state.comment;

    const point = this.state.point;

    this.props.save(writeOffItems, comment, point, id);

    this.onClose();
  }

  onClose() {
    this.setState({
      point: '',
      points: [],
      type: '',
      types: [],
      item: '',
      items: [],
      count: '',
      ed_izmer: '',
      comment: '',
      writeOffItems: [],
      openAlert: false,
      err_status: true,
      err_text: '',
      confirmDialog: false
    });

    this.props.onClose();
  }

  render() {

    const { open, method, fullScreen } = this.props;

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
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Точно удалить данное списание ?</DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.delete.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={'lg'}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography>{method}</Typography>
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                {method === 'Новое списание' ?
                  <MySelect
                    is_none={false}
                    data={this.state.points}
                    value={this.state.point.id}
                    func={this.changeItem.bind(this, 'point')}
                    label="Точка"
                  />
                 :  
                  <MyTextInput
                    label="Точка"
                    value={this.state.point.name}
                    disabled={true}
                    className="disabled_input"
                  />
                }
              </Grid>
              <Grid item xs={12} sm={8} />
              <Grid item xs={12} sm={3}>
                <MySelect
                  is_none={false}
                  data={this.state.types}
                  value={this.state.type}
                  func={this.changeType.bind(this, 'type')}
                  label="Тип"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <MyAutocomplite
                  label="Наименование"
                  multiple={false}
                  data={this.state.items}
                  value={this.state.item}
                  func={this.changeItemData.bind(this, 'item')}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <MyTextInput
                  type="number"
                  label="Количество"
                  value={this.state.count}
                  func={this.changeItem.bind(this, 'count')}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <MyTextInput
                  label="Ед измерения"
                  value={this.state.ed_izmer}
                  disabled={true}
                  className="disabled_input"
                />
              </Grid>
              <Grid item xs={12} sm={9} />
              <Grid item xs={12} sm={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={this.addItems.bind(this)} variant="contained" color="success">
                  Добавить
                </Button>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Divider />
              </Grid>
            </Grid>
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ width: '10%' }}>#</TableCell> 
                    <TableCell style={{ width: '20%' }}>Тип</TableCell>
                    <TableCell style={{ width: '40%' }}>Наименование</TableCell>
                    <TableCell style={{ width: '20%' }}>Количество</TableCell>
                    <TableCell style={{ width: '10%' }}></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.writeOffItems.map((it, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{it.type_name}</TableCell>
                      <TableCell>{it.name}</TableCell>
                      <TableCell>{it.value + ' ' + it.ei_name}</TableCell>
                      <TableCell onClick={this.deleteItem.bind(this, key)}> 
                        <IconButton style={{ cursor: 'pointer' }}>
                          <CloseIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4}>
                      <MyTextInput
                        label="Комментарий"
                        value={this.state.comment}
                        func={this.changeItem.bind(this, 'comment')}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            {method !== 'Новое списание' ?
              <Button onClick={() => this.setState({ confirmDialog: true })} variant="contained" style={{ backgroundColor: 'rgba(53,59,72,1.000)' }}>
                Удалить
              </Button>
            : null}
            <Button onClick={this.save.bind(this)} variant="contained">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class Write_off_journal_modal_view extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
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
  }

  onClose() {
    setTimeout(async () => {
      this.setState({
        item: [],
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'md'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', float: 'right' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '5%' }}>№</TableCell>
                  <TableCell style={{ width: '35%' }}>Позиция</TableCell>
                  <TableCell style={{ width: '30%' }}>Количество</TableCell>
                  <TableCell style={{ width: '30%' }}>Себестоимость</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.value + ' ' + it.ei_name}</TableCell>
                    <TableCell>{' '}{new Intl.NumberFormat('ru-RU').format(it?.price ?? 0)} ₽</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}>
                    <span style={{ fontWeight: 'bold'}}>Комментарий: </span>
                    <span>{this.state.item.comment}</span>
                  </TableCell>
                </TableRow>
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

class Write_off_journal_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'write_off_journal',
      module_name: '',
      is_load: false,

      points: [],
      point: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      items: [],
      item: [],

      openAlert: false,
      err_status: true,
      err_text: '',

      list: [],
      all_items_pf: [],
      all_items_pos: [],
      all_users: [],

      all_sum_pf: 0,
      all_sum_pos: 0,

      fullScreen: false,

      modalDialogView: false,
      itemView: null,

      modalDialog: false,
      itemEdit: null,

      method: '',

      modalDialogHist: false,
      itemHist: null,

      modalDialogViewHist: false,
      itemViewHist: null
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    // для тестов
    const points = [{base: "jaco_rolls_0", id: "0", id_2: "1_0", manager_id: "0", name: "Тольятти, Тестовая", name2: "Тольятти, Тестовая"}]

    this.setState({
      // points: data.points,
      // point: data.points[0].id,
      points,
      point: points[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    // для тестов
    setTimeout(async () => {
      this.getPointData(points[0]);
    }, 100);

    // setTimeout(async () => {
    //   this.getPointData(data.points[0]);
    // }, 100);

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

  async getPointData() {

    const point = this.state.points.find(point => parseInt(point.id) === parseInt(this.state.point));
    const date_start = this.state.date_start ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '';
    const date_end = this.state.date_end ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '';
    const items = this.state.item;

    const data = {
      point,
      date_start,
      date_end,
      items
    }

    const res = await this.getData('get_items', data);

    const all_sum_pf = res.all_items_pf.reduce((all, item) => all + Number(item?.price ?? 0), 0);
    const all_sum_pos = res.all_items_pos.reduce((all, item) => all + Number(item?.price ?? 0), 0);

    const all_users = res.list.reduce((users, item) => {

      if(parseInt(item.user_id) === parseInt(item.user_id)) {
        const user = users.find(user => parseInt(user.id) === parseInt(item.user_id));

        if(user) {
          user.price += Number(item?.price ?? 0);
        } else {
          users.push({ id: item.user_id, name: item.user_name, price: Number(item?.price ?? 0)});
        }

      }

      return users;

    }, []);

    this.setState({
      searchItem: '',
      items: res?.items?.items ?? [],
      list: res.list,
      all_items_pf: res.all_items_pf,
      all_items_pos: res.all_items_pos,
      all_sum_pf,
      all_sum_pos,
      all_users
    });
    
  }

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeComplite(event, value) {
    this.setState({
      item: value,
    });
  }

  openViewItem(itemView, comment) {
    this.handleResize();

    itemView.comment = comment;

    this.setState({
      modalDialogView: true,
      itemView
    });
  }

  async openNewItem(method) {
    this.handleResize();

    let res = await this.getData('get_all_for_new');

    res.types = [{id: '1', name: 'Товар'}, {id: '2', name: 'Заготовка'}, {id: '3', name: 'Сайт'}]

    this.setState({
      modalDialog: true,
      itemEdit: res,
      method
    });
  }

  async openItem(woj_id, method) {
    this.handleResize();

    const list = this.state.list;

    const open_item = list.find(item => parseInt(item.id) === parseInt(woj_id));

    let change = null;

    if(open_item) {
      // Для редактирования и удаления давать 2 недели с даты создания 
      if (parseInt(open_item?.status) === 2) {
        change = 'del';
      } else if (!(moment(open_item?.date).diff(moment(), 'days') > -15)) {
        change = 'day';
      } 
    }

    if (change === 'del' || change === 'day') {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: change === 'del' ? 'Удален' : 'Изменения недоступны - с даты создания прошло болеее 2-х недель',
      });
      
      return;

    }

    const point = this.state.points.find(point => parseInt(point.id) === parseInt(this.state.point));

    const data = {
      point,
      woj_id
    }

    let res = await this.getData('get_one', data);

    res.woj_items = res.woj_items.map(item => {
      if(item.type === 'pos') {
        item.type_name = 'Сайт';
      }

      if(item.type === 'rec' || item.type === 'pf') {
        item.type_name = 'Заготовка';
      }

      if(item.type === 'set' || item.type === 'item') {
        item.type_name = 'Товар';
      }

      return item;
    });

    res.types = [{id: '1', name: 'Товар'}, {id: '2', name: 'Заготовка'}, {id: '3', name: 'Сайт'}];

    res.items = res.items.items;

    this.setState({
      modalDialog: true,
      itemEdit: res,
      method
    });
  }

  async saveItem(items, comment, point, j_id) {

    const method = this.state.method;

    const data = {
      items, 
      comment, 
      point,
      j_id
    }

    let res;

    if(method === 'Новое списание') {
      res = await this.getData('save_new', data);
    } else {
      res = await this.getData('save_edit', data);
    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
      });
      
      setTimeout(async () => {
        this.getPointData();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async deleteItem(j_id, point) {

    const data = {
      j_id,
      point
    }

    const res = await this.getData('delete_item', data);

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
      });

      setTimeout(async () => {
        this.getPointData();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }
  }

  async openHistoryItem(id, method) {
    this.handleResize();

    const point = this.state.points.find(point => parseInt(point.id) === parseInt(this.state.point));

    const data = {
      id,
      point
    };

    const res = await this.getData('get_one_hist', data);

    res.hist = res.hist.map(item => {

      item.items = item.items.map(it => {
        if(it.type === 'pos') {
          it.type_name = 'Сайт';
        }
  
        if(it.type === 'rec' || it.type === 'pf') {
          it.type_name = 'Заготовка';
        }
  
        if(it.type === 'set' || it.type === 'item') {
          it.type_name = 'Товар';
        }

        return it;

      })

      return item;
    });
   
    this.setState({
      modalDialogHist: true,
      itemHist: res.hist,
      method
    });

  }

  openModalHistoryView(index) {

    const item = this.state.itemHist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    if(parseInt(index) !== 0) {
      
      let itemView_old = JSON.parse(JSON.stringify(item[index - 1]));
      
      for (let key in itemView) {

        if(itemView[key] !== itemView_old[key] && key !== 'items' && key !== 'status') {
          itemView[key] = { key: itemView[key], color: 'true' }
        }

        if(key === 'items') {
          itemView.items = itemView.items.reduce((newList, it) => {
            if(!itemView_old.items.find((item) => item.type === it.type && parseInt(item.item_id) === parseInt(it.item_id))) {
              it.color = 'add';
            }
            return newList = [...newList,...[it]]
          }, []).concat(itemView_old.items.filter((it) => {
            if(!itemView.items.find((item) => item.type === it.type && parseInt(item.item_id) === parseInt(it.item_id))) {
              it.color = 'delete';
              return it;
            }
          }));
     
        }
      }
    } 
    
    this.setState({
      modalDialogViewHist: true,
      itemViewHist: itemView
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
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Write_off_journal_modal_view
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null })}
          item={this.state.itemView}
          fullScreen={this.state.fullScreen}
        />

        <Write_off_journal_modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemEdit: null })}
          itemEdit={this.state.itemEdit}
          points={this.state.points}
          point={this.state.point}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          save={this.saveItem.bind(this)}
          deleteItem={this.deleteItem.bind(this)}
        />

        <Write_off_journal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false, itemHist: null })}
          item={this.state.itemHist}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
          openModalHistoryView={this.openModalHistoryView.bind(this)}
        />

        <Write_off_journal_View
          open={this.state.modalDialogViewHist}
          onClose={() => this.setState({ modalDialogViewHist: false, itemViewHist: null })}
          itemView={this.state.itemViewHist}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openNewItem.bind(this, 'Новое списание')} variant="contained">
              Новое списание
            </Button>
          </Grid>

          <Grid item xs={12} sm={9} />

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              label="Точка"
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, 'point')}
            />
          </Grid>

          <Grid item xs={12} sm={8} />

          <Grid item xs={12} sm={2}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Поиск позиции списания"
              multiple={true}
              data={this.state.items}
              value={this.state.item}
              func={this.changeComplite.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button onClick={this.getPointData.bind(this)} variant="contained">
              Посмотреть
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>Количество по материалам</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                        <TableCell style={{ width: '35%' }}>Позиция</TableCell>
                        <TableCell style={{ width: '35%' }}>Количество</TableCell>
                        <TableCell style={{ width: '30%' }}></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_items_pf.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.value + ' ' + it.ei_name}</TableCell>
                          <TableCell>{new Intl.NumberFormat('ru-RU').format(it?.price ?? '')}{' '}₽</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                        <TableCell colSpan={2}>Общая</TableCell>
                        <TableCell>{new Intl.NumberFormat('ru-RU').format(this.state.all_sum_pf)}{' '}₽</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>Количество по блюдам</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                        <TableCell style={{ width: '35%' }}>Позиция</TableCell>
                        <TableCell style={{ width: '35%' }}>Количество</TableCell>
                        <TableCell style={{ width: '30%' }}></TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_items_pos.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.value + ' ' + it.ei_name}</TableCell>
                          <TableCell>{new Intl.NumberFormat('ru-RU').format(it?.price ?? '')}{' '}₽</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                        <TableCell colSpan={2}>Общая</TableCell>
                        <TableCell>{new Intl.NumberFormat('ru-RU').format(this.state.all_sum_pos)}{' '}₽</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>Количество по создателям</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                        <TableCell>Создатель</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.all_users.map((it, k) => (
                        <TableRow key={k}>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{new Intl.NumberFormat('ru-RU').format(it?.price ?? '')}{' '}₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} sm={12} mb={5}>
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ width: '5%' }}>№</TableCell>
                    <TableCell style={{ width: '17%' }}>Дата</TableCell>
                    <TableCell style={{ width: '17%' }}>Время</TableCell>
                    <TableCell style={{ width: '15%' }}>Себестоимость</TableCell>
                    <TableCell style={{ width: '17%' }}>Создатель</TableCell>
                    <TableCell style={{ width: '15%' }}>Редактирование</TableCell>
                    <TableCell style={{ width: '14%' }}>История изменений</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.list.map((item, key) => (
                    <TableRow hover key={key} sx={{ '& td': { color: parseInt(item?.status) === 2 || item?.date_update ? '#fff' : 'rgba(0, 0, 0, 0.87)'} }} style={{ backgroundColor: parseInt(item?.status) === 2 ? 'red' : item?.date_update ? 'rgb(255, 204, 0)' : '#fff'}}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={this.openViewItem.bind(this, item?.items, item.coment)}>{item.date}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell>{' '}{new Intl.NumberFormat('ru-RU').format(item?.price ?? '')} ₽</TableCell>
                      <TableCell>{item.user_name}</TableCell>
                      <TableCell style={{ cursor: 'pointer' }} onClick={this.openItem.bind(this, item?.id, 'Редактрование списания')}>
                        <EditIcon />
                      </TableCell>
                      <TableCell 
                          onClick={this.openHistoryItem.bind(this, item.id, 'История изменений')}
                          style={{cursor: 'pointer'}}
                        >
                          <EditNoteIcon />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function WriteOffJournal() {
  return <Write_off_journal_ />;
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
