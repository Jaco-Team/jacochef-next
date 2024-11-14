import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Checkbox from '@mui/material/Checkbox';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MySelect, MyAlert, MyCheckBox } from '@/ui/elements';
import queryString from 'query-string';

class Appointment_Modal_param extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null
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

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, dataSelect, changeActive, main_key, parent_key, type } = this.props;

    return (

      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={'lg'}
        fullScreen={fullScreen}
      > 

      <DialogTitle >
        {method}
        <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }} >
        <Grid item xs={12} >
          <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 630 } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '40%' }}>Категория</TableCell>
                  <TableCell style={{ width: '40%' }}>Параметр</TableCell>
                  <TableCell style={{ width: '20%' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {type === 'one' ?
                  !this.state.item ? null : (
                    this.state.item.map((f, f_key) => (
                      <TableRow hover key={f_key}>
                        <TableCell>{f.category_name}</TableCell>
                        <TableCell>{f.name}</TableCell>
                        <TableCell> 
                          {parseInt(f?.type) == 2 ?
                            <Checkbox
                              edge="end"
                              onChange={changeActive.bind(this, main_key, parent_key, f_key, -1)}
                              checked={parseInt(f.is_active) == 1 ? true : false}
                            />
                            :
                            <MySelect
                              data={dataSelect}
                              value={parseInt(f.is_active) === 0 || f.is_active === null ? false : f.is_active}
                              func={changeActive.bind(this, main_key, parent_key, f_key, -1)}
                              is_none={false}
                            />
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )
                :
                  !this.state.item ? null : (
                    this.state.item.map((f, f_key) => (
                      f?.features?.map( ( cat_f, cat_f_key ) => (
                        <TableRow hover key={cat_f_key}>
                          <TableCell>{cat_f.category_name}</TableCell>
                          <TableCell>{cat_f.name}</TableCell>
                          <TableCell> 
                            {parseInt(cat_f?.type) == 2 ?
                              <Checkbox
                                edge="end"
                                onChange={changeActive.bind(this, main_key, parent_key, cat_f_key, f_key)}
                                checked={parseInt(cat_f.is_active) == 1 ? true : false }
                              />
                              :
                              <MySelect
                                data={dataSelect}
                                value={parseInt(cat_f.is_active) === 0 || cat_f.is_active === null ? false : cat_f.is_active}
                                func={changeActive.bind(this, main_key, parent_key, cat_f_key, f_key)}
                                is_none={false}
                              />
                            }
                          </TableCell>
                        </TableRow>
                      ))    
                  )))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

      </DialogContent>

      <DialogActions>
        <Button color="primary" onClick={this.onClose.bind(this)}>
          Закрыть
        </Button>
      </DialogActions>

    </Dialog>
    );
  }
}

class Appointment_Modal_input extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      item: this.props.data,
    };
  }

  changeItem(event) {
    const value = event.target.value;

    this.setState({
      item: value
    });
  }

  save_data_input() {
    let value = this.state.item;
    this.props.changeItem(this.props.type, value)
  }

  render() {

    const { label } = this.props;

    return (
      <Grid item xs={12} md={6}>
        <MyTextInput
          label={label}
          value={this.state.item}
          func={this.changeItem.bind(this)}
          onBlur={this.save_data_input.bind(this)}
        />
      </Grid>
    )
  }
}

class Appointment_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      full_menu: null,
      name: '',
      short_name: '',
      bonus: '',

      modalDialog_param: false,
      method: '',
      params: null,
      main_key: '',
      parent_key: '',
      type: ''
    };
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate', this.props);
    
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      this.setState({
        item: this.props.item,
        full_menu: this.props.full_menu,
        name: this.props.item?.name ?? '',
        short_name: this.props.item?.short_name ?? '',
        bonus: this.props.item?.bonus ?? '',
      });
    }
  }

  changeItem(data, value) {
    this.setState({
      [data]: value
    });
  }

  changeItemChecked(data, event) {
    let item = this.state.item;
    item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  changeActive(main_key, parent_key, features_key, category_id, event){
    let full_menu = this.state.full_menu;

    if( event.target.checked === undefined && parseInt(category_id) == -1 ){
      full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.value;
    }else{
      if( parseInt(category_id) > -1 ){
        full_menu[ main_key ]['chaild'][ parent_key ]['features_cat'][ category_id ]['features'][ features_key ].is_active = event.target.checked === undefined ? event.target.value : event.target.checked === true ? 1 : 0
      }else{
        if( parseInt(features_key) > -1 ) {
          full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.checked === undefined ? event.target.value : event.target.checked === true ? 1 : 0
        }else{
          full_menu[ main_key ]['chaild'][ parent_key ].is_active = event.target.checked === undefined ? event.target.value : event.target.checked === true ? 1 : 0
        }
      }

    }

    this.setState({
      full_menu: full_menu
    });
  }

  save() {

    const {name, short_name, bonus, full_menu} = this.state;

    let item = this.props.item;

    item.name = name;
    item.short_name = short_name;
    item.bonus = bonus;

    this.props.save(item, full_menu);
    this.onClose();

  }

  openParams(params, method, main_key, parent_key, type) {
    this.setState({
      params,
      method,
      main_key,
      parent_key,
      type,
      modalDialog_param: true,
    });
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null,
        full_menu: null,
        name: '',
        short_name: '',
        bonus: '',
        modalDialog_param: false,
        method: '',
        params: null,
        main_key: '',
        parent_key: '', 
        type: ''
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, dataSelect } = this.props;

    return (
      <>
        <Appointment_Modal_param
          open={this.state.modalDialog_param}
          onClose={() => this.setState({ modalDialog_param: false, params: null, main_key: '', parent_key: '', type: '' })}
          item={this.state.params}
          fullScreen={fullScreen}
          method={this.state.method}
          main_key={this.state.main_key}
          parent_key={this.state.parent_key}
          type={this.state.type}
          dataSelect={dataSelect}
          changeActive={this.changeActive.bind(this)}
        />

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullWidth={true}
          maxWidth={'lg'}
          fullScreen={fullScreen}
        > 

          <DialogTitle >
            {method}
            {this.props.item?.name}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }} >
            <Grid container spacing={3}>
              <Appointment_Modal_input
                data={this.props.item?.name}
                changeItem={this.changeItem.bind(this)}
                label='Название должности'
                type='name'
              />
              <Appointment_Modal_input
                data={this.props.item?.short_name}
                changeItem={this.changeItem.bind(this)}
                label='Сокращенное название'
                type='short_name'
              />
              <Appointment_Modal_input
                data={this.props.item?.bonus}
                changeItem={this.changeItem.bind(this)}
                label='Норма бонусов'
                type='bonus'
              />
              <Grid item xs={12} md={6}>
                <MyCheckBox
                  func={this.changeItemChecked.bind(this, 'is_graph')}
                  value={ parseInt(this.props.item?.is_graph) == 1 ? true : false }
                  label='Нужен в графике работы'
                />
              </Grid>

              {!this.state.full_menu ? null : (
                <Grid item xs={12} sm={12} mb={10}>
                  <TableContainer  sx={{ maxHeight: { xs: 'none', sm: 630 } }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                          <TableCell style={{ width: '5%' }}>#</TableCell>
                          <TableCell style={{ width: '40%' }}>Наименование модуля</TableCell>
                          <TableCell style={{ width: '30%' }}>Параметры модуля</TableCell>
                          <TableCell style={{ width: '25%' }}>Активность модуля</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.full_menu.map((item, key) =>
                          item.chaild.length ? (
                            <React.Fragment key={key}>
                              <TableRow sx={{ '& th': { border: 'none' } }}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                  {item?.parent?.name}
                                </TableCell>
                              </TableRow>
                              {item.chaild.map((it, k) => (
                                it.features.length ? 
                                  <React.Fragment key={k}>
                                    <TableRow hover>
                                      <TableCell></TableCell>
                                      <TableCell sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: 'center' }}>
                                        <li>{it.name}</li>
                                      </TableCell>
                                      <TableCell sx={{ cursor: 'pointer' }} onClick={this.openParams.bind(this, it.features, `Редактирование параметров модуля: ${it.name}`, key, k, 'one')}>
                                        <Tooltip title={<Typography color="inherit">Редактировать параметры модуля</Typography>}> 
                                          <EditIcon />
                                        </Tooltip>
                                      </TableCell>
                                      <TableCell>
                                        <Checkbox
                                          edge="end"
                                          onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                                          checked={ parseInt(it.is_active) == 1 ? true : false }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                  :
                                  it?.features_cat?.length ?

                                  <React.Fragment key={k}>
                                    <TableRow hover>
                                      <TableCell></TableCell>
                                      <TableCell sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: 'center' }} >
                                        <li>{it.name}</li>
                                      </TableCell>
                                      <TableCell sx={{ cursor: 'pointer' }} onClick={this.openParams.bind(this, it.features_cat, `Редактирование параметров модуля: ${it.name}`, key, k, 'two')}>
                                        <Tooltip title={<Typography color="inherit">Редактирование свойств модуля</Typography>}> 
                                          <EditIcon/>
                                        </Tooltip>
                                      </TableCell>
                                      <TableCell>
                                        <Checkbox
                                          edge="end"
                                          onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                                          checked={ parseInt(it.is_active) == 1 ? true : false }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                  :
                                  <TableRow hover key={k}>
                                    <TableCell></TableCell>
                                    <TableCell sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: 'center' }}>
                                      <li>{it.name}</li>
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>
                                      <Checkbox
                                        edge="end 3"
                                        onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                                        checked={ parseInt(it.is_active) == 1 ? true : false }
                                      />
                                    </TableCell>
                                  </TableRow>
                              ))}
                            </React.Fragment>
                          ) : (
                            <TableRow hover key={key} sx={{ '& th': { border: 'none' } }}>
                              <TableCell>{key + 1}</TableCell>
                              <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                                {item?.parent?.name}
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

          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class Appointment_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'appointment',
      module_name: '',

      modalDialog: false,
      method: '',
      item : [],
      fullScreen: false,

      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      confirmDialog: false,
      items: [], 

      openApp: null,
      full_menu: [],

      method: '',

      dataSelect: [
        {id: false, name: 'Без активности'},
        {id: 'show', name: 'Показывать'},
        {id: 'edit', name: 'Редактировать'},
      ],
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      items: data.apps,
    });

    document.title = data.module_info.name;
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

  async saveSort() {
    let data = {
      app_list:  this.state.items,   
    };

    let res = await this.getData('save_sort', data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text
      });
    } else {
      this.updateList();
    }
 
  }

  changeItem(data, id, event) {
   
    let items = this.state.items;
  
    items.forEach((item) => {
      if( parseInt(item.id) === parseInt(id) ) {
        item[data] = event.target.value;
      }
    });      

    this.setState({
      items,
    });
  }
  
  async updateList() {
    const res = await this.getData('get_items'); 

    this.setState({
      items: res.apps,
    });
  }
  
  async openModal(id) {
    this.handleResize();

    const data = {
      'app_id': id
    };

    const res = await this.getData('get_one', data); 

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
      method: 'Редактирование должности: '
    });
  }

  async saveEdit(app, full_menu) {
    const data = {
      app,
      full_menu
    };

    const res = await this.getData('save_edit', data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text
      });
    } else {
      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: []
      });

      this.updateList();
    }
  }

  async saveNew(app, full_menu){
    const data = {
      app, 
      full_menu
    };

    const res = await this.getData('save_new', data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text
      });
    } else {
      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: []
      });

      this.updateList();
    }
  }

  async openNewApp() {
    this.handleResize();

    const res = await this.getData('get_all_for_new'); 

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
      method: 'Новая должность'
    });
  }

  render() {
    
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} mb={3} mt={10}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <MyAlert
            isOpen={this.state.openAlert}
            onClose={() => this.setState({ openAlert: false })}
            status={this.state.err_status}
            text={this.state.err_text}
          />

          <Appointment_Modal
            open={this.state.modalDialog}
            onClose={() => this.setState({ modalDialog: false, openApp: null })}
            item={this.state.openApp}
            full_menu={this.state.full_menu}
            fullScreen={this.state.fullScreen}
            save={parseInt(this.state.openApp?.id) == -1 ? this.saveNew.bind(this) : this.saveEdit.bind(this)}
            method={this.state.method}
            dataSelect={this.state.dataSelect}
          />
       
          <Grid item xs={12} mb={1}>
            <Button variant="outlined" onClick={this.openNewApp.bind(this)}>
              Новая должность
            </Button>
          </Grid>

          <Grid item xs={12} mb={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '1%' }}>#</TableCell>
                    <TableCell style={{ width: '35%' }}>Должность</TableCell>
                    <TableCell style={{ width: '15%' }}>Старшенство</TableCell>
                    <TableCell style={{ width: '15%' }}>Сортировка</TableCell>
                  </TableRow>
                </TableHead>
              <TableBody>
                {this.state.items.map((item, key) => {
                  return (
                    <TableRow key={key} hover>
                      <TableCell style={{ width: '1%' }}>{key + 1}</TableCell>
                      <TableCell onClick={this.openModal.bind(this, item.id)} style={{ cursor: 'pointer', fontWeight: 'bold'}}>{item.name}</TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.kind}
                          func={this.changeItem.bind(this, 'kind', item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.sort}
                          func={this.changeItem.bind(this, 'sort', item.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </TableContainer>
            <Grid item xs={12} ml={1} mt={3}>
              <Button color="primary" variant="contained" onClick={this.saveSort.bind(this)}>Сохранить сортировку</Button>
            </Grid> 
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Appointment() {
  return <Appointment_ />;
}
