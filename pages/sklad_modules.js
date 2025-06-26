import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import Tooltip from '@mui/material/Tooltip';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { MyTextInput, MyAutocomplite, MyAlert, MyCheckBox, MySelect } from '@/ui/elements';

import queryString from 'query-string';
import {api_laravel, api_laravel_local} from "@/src/api_new";

class SkladModules_Modal_Param extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      item: null,

      openAlert: false,
      err_status: false,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate', this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      this.setState({
        item: this.props.item
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;
    const value = event.target.value;

    item[data] = value;

    this.setState({
      item
    });
  }

  changeAutocomplite(data, event, value) {
    const item = this.state.item;

    item[data] = value;

    this.setState({
      item,
    });
  }

  save() {

    let item = this.state.item;

    if (!item.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;

    }

    if (!item.param) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать параметр'
      });

      return;

    }

    if(!item.module_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать модуль'
      });

      return;
    }

    if(!item.type) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать тип'
      });

      return;
    }

    this.props.save(item);
    this.onClose();

  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null,

        openAlert: false,
        err_status: false,
        err_text: ''
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, param_name } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            {method}
            {param_name ? `: ${param_name}` : null}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {!this.state.item ? null : (
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Название"
                    value={this.state.item.name}
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Параметр"
                    value={this.state.item.param}
                    func={this.changeItem.bind(this, 'param')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyAutocomplite
                    label="Модуль"
                    multiple={false}
                    data={this.state.item.modules}
                    value={this.state.item.module_id}
                    func={this.changeAutocomplite.bind(this, 'module_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MySelect
                    is_none={false}
                    label="Тип"
                    data={this.state.item.types}
                    value={this.state.item.type}
                    func={this.changeItem.bind(this, 'type')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Категория параметра"
                    value={this.state.item.category}
                    func={this.changeItem.bind(this, 'category')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Название категории параметра"
                    value={this.state.item.category_name}
                    func={this.changeItem.bind(this, 'category_name')}
                  />
                </Grid>


              </Grid>
            </DialogContent>
          )}

          <DialogActions>
            <Button variant="contained" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class SkladModules_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      listCat: null,
      itemCat: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      const itemCat = this.props.listCat.find(item => parseInt(item.id) === parseInt(this.props.item.parent_id));

      this.setState({
        itemCat,
        item: this.props.item,
        listCat: this.props.listCat,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  changeItemCat(data, event, value) {
    const item = this.state.item;

    item[data] = value ? value.id : '';

    this.setState({
      item,
      itemCat: value,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
      listCat: null,
      itemCat: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle className="button">
          {this.props.method}
          {this.props.itemName ? `: ${this.props.itemName}` : null}
        </DialogTitle>

        <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
          <CloseIcon />
        </IconButton>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Название"
                value={this.state.item ? this.state.item.name : ''}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Адрес модуля (URL)"
                value={this.state.item ? this.state.item.link ?? '' : ''}
                func={this.changeItem.bind(this, 'link')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Категория"
                multiple={false}
                data={this.state.listCat ? this.state.listCat : []}
                value={this.state.itemCat ? this.state.itemCat : ''}
                func={this.changeItemCat.bind(this, 'parent_id')}
              />
            </Grid>

            {this.props.mark === 'edit' ? (
              <Grid item xs={12} sm={12}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.is_show) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_show')}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladModules_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'sklad_modules',
      module_name: '',
      is_load: false,

      fullScreen: false,

      list: null,

      mark: null,
      modalDialog: false,
      listCat: null,
      item: null,

      itemNew: {
        name: '',
        link: '',
        parent_id: '',
      },

      method: '',
      itemName: '',

      openAlert: false,
      err_status: true,
      err_text: '',

      mark_param: null,
      modalDialog_param: false,
      param: null,
      param_name: '',

      param_new: {
        name: '',
        category: '',
        category_name: '',
        param: '',
        type: '',
        module_id: null
      },

    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.items,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
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

  async openModal(mark, id) {
    this.handleResize();

    if (mark === 'add') {
      const res = await this.getData('get_all_for_new');

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(this.state.itemNew)),
        listCat: res.main_cat,
        modalDialog: true,
        method: 'Новая модуль',
      });
    }

    if (mark === 'edit') {
      const data = {
        id,
      };

      const res = await this.getData('get_one', data);

      this.setState({
        mark,
        item: res.item[0],
        itemName: res.item[0].name,
        listCat: res.main_cat,
        modalDialog: true,
        method: 'Редактирование модуля',
      });
    }
  }

  async openModal_param (mark_param, id) {
    this.handleResize();

    if (mark_param === 'add_param') {

      const res = await this.getData('get_new_param');

      let param = JSON.parse(JSON.stringify(this.state.param_new));

      param.modules = res.modules;

      param.types = [{ id: 2, name: "2 значения ( чекбокс - показывать / скрыть )"}, { id: 3, name: "3 значения ( селект - не активный / просмотр / редактировать )"}];

      this.setState({
        param,
        mark_param,
        modalDialog_param: true,
        method: 'Новый параметр',
      });
    }

    if (mark_param === 'edit_param') {
      const data = {
        id,
      };

      const res = await this.getData('get_one_param', data);

      res.param.types = [{ id: 2, name: "2 значения ( чекбокс - показывать / скрыть )"}, { id: 3, name: "3 значения ( селект - не активный / просмотр / редактировать )"}];

      res.param.module_id = res.param.modules.find(module => parseInt(module.id) === parseInt( res.param.module_id)) ?? 0;

      this.setState({
        mark_param,
        modalDialog_param: true,
        param: res.param,
        param_name: res.param.name,
        method: 'Редактирование параметра',
      });
    }

  }

  async save_param (param) {

    const mark_param = this.state.mark_param;

    let res;

    if (mark_param === 'add_param') {
      const data = {
        name: param.name,
        category: param.category,
        category_name: param.category_name,
        param: param.param,
        type: param.type,
        module_id: param.module_id.id
      };

      res = await this.getData('save_new_param', data);
    }

    if (mark_param === 'edit_param') {
      const data = {
        id: param.id,
        name: param.name,
        category: param.category,
        category_name: param.category_name,
        param: param.param,
        type: param.type,
        module_id: param.module_id.id
      };

      res = await this.getData('save_edit_param', data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async save(item) {
    const mark = this.state.mark;

    let res;

    if (mark === 'add') {
      const data = {
        name: item.name,
        link: item.link,
        parent_id: item.parent_id,
      };

      res = await this.getData('save_new', data);
    }

    if (mark === 'edit') {
      const data = {
        id: item.id,
        name: item.name,
        link: item.link,
        parent_id: item.parent_id,
        is_show: item.is_show,
        modul_id: item.modul_id,
      };

      res = await this.getData('save_edit', data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  changeSort(index, cat, id, event) {
    const list = this.state.list;

    if (cat === 'subCat') {
      list.forEach((item) => {
        if (item.id === id) {
          item.items[index].sort = event.target.value;
        }
      });
    } else {
      list[index].sort = event.target.value;
    }

    this.setState({
      list,
    });
  }

  async saveSort(id, event) {
    const data = {
      id,
      value: event.target.value,
    };

    const res = await this.getData('save_sort', data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.items,
    });
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

        <SkladModules_Modal_Param
          open={this.state.modalDialog_param}
          onClose={() => this.setState({ modalDialog_param: false, param: null, param_name: '', method: '' })}
          item={this.state.param}
          fullScreen={this.state.fullScreen}
          save={this.save_param.bind(this)}
          method={this.state.method}
          param_name={this.state.param_name}
        />

        <SkladModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '', method: '' })}
          mark={this.state.mark}
          item={this.state.item}
          listCat={this.state.listCat}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          save={this.save.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button variant="contained" color="primary" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal.bind(this, 'add', null)}>
              Добавить модуль
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" color="primary" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal_param.bind(this, 'add_param', null)}>
              Добавить параметр модулю
            </Button>
          </Grid>

          {!this.state.list ? null : (
            <Grid item xs={12} sm={12} mb={10}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell style={{ width: '5%' }}>#</TableCell>
                      <TableCell style={{ width: '35%' }}>Название</TableCell>
                      <TableCell style={{ width: '15%' }}>Сортировка</TableCell>
                      <TableCell style={{ width: '45%' }} align="center"><VisibilityIcon /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.list.map((item, index) =>
                      item.items.length ? (
                        <React.Fragment key={index}>
                          <TableRow hover sx={{ '& th': { border: 'none' } }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#c03' }}>
                              {item.name}
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                label=""
                                value={item.sort}
                                func={this.changeSort.bind(this, index, 'cat', null)}
                                onBlur={this.saveSort.bind(this, item.id)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </TableCell>
                          </TableRow>
                          {item.items.map((it, key) => (
                            it.params.length ?
                              <React.Fragment key={key}>
                                <TableRow hover>
                                  <TableCell></TableCell>
                                  <TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{ paddingLeft: 10, alignItems: 'center', cursor: 'pointer' }}>
                                    <li>{it.name}</li>
                                  </TableCell>
                                  <TableCell>
                                    <MyTextInput
                                      label=""
                                      value={it.sort}
                                      func={this.changeSort.bind(this, key, 'subCat', item.id)}
                                      onBlur={this.saveSort.bind(this, it.id)}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    {parseInt(it.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                  </TableCell>
                                </TableRow>
                                  {it?.params.map((param, k) => (
                                    <TableRow hover key={k}>
                                      <TableCell></TableCell>
                                      <TableCell sx={{ paddingLeft: 20, alignItems: 'center' }}>
                                        <li className='li_disc'>{param.name}</li>
                                      </TableCell>
                                      <TableCell>{param.category_name}</TableCell>
                                      <TableCell sx={{ textAlign: 'center' }} onClick={this.openModal_param.bind(this, 'edit_param', param.id)}>
                                        <Tooltip title={<Typography color="inherit">Редактирование параметра</Typography>}>
                                          <EditIcon sx={{ paddingLeft: 20, cursor: 'pointer' }}/>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </React.Fragment>
                              :
                              <TableRow hover key={key}>
                                <TableCell></TableCell>
                                <TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{ paddingLeft: 10, alignItems: 'center', cursor: 'pointer' }}>
                                  <li>{it.name}</li>
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    label=""
                                    value={it.sort}
                                    func={this.changeSort.bind(this, key, 'subCat', item.id)}
                                    onBlur={this.saveSort.bind(this, it.id)}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {parseInt(it.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </TableCell>
                              </TableRow>
                          ))}
                        </React.Fragment>
                      ) : (
                        <TableRow hover key={index} sx={{ '& th': { border: 'none' } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#c03' }}>
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={this.changeSort.bind(this, index, 'cat', null)}
                              onBlur={this.saveSort.bind(this, item.id)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function SkladModules() {
  return <SkladModules_ />;
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
