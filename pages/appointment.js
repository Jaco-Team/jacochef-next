import React from 'react';

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

import Checkbox from '@mui/material/Checkbox';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MySelect, MyAlert, MyCheckBox } from '@/ui/elements';
import queryString from 'query-string';

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

    if( event.target.checked === undefined ){
      full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.value;
    }else{
      if( parseInt(category_id) > -1 ){
        full_menu[ main_key ]['chaild'][ parent_key ]['features_cat'][ category_id ]['features'][ features_key ].is_active = event.target.checked === true ? 1 : 0;
      }else{
        if( parseInt(features_key) > -1 ) {
          full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.checked === true ? 1 : 0;
        }else{
          full_menu[ main_key ]['chaild'][ parent_key ].is_active = event.target.checked === true ? 1 : 0;
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

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null,
        full_menu: null,
        name: '',
        short_name: '',
        bonus: '',
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, dataSelect } = this.props;

    return (
      <Dialog
        open={open}
        onClose={() => this.setState({ modalDialog: false, itemName: '' }) }
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
              <TableContainer>
                <Table size="small">
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
                                  <TableCell colSpan={2}>
                                    <Checkbox
                                      edge="end"
                                      onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                                      checked={ parseInt(it.is_active) == 1 ? true : false }
                                    />
                                  </TableCell>
                                </TableRow>

                                  {it?.features.map((f, f_key) => (
                                    <TableRow hover key={k}>
                                      <TableCell></TableCell>
                                      <TableCell sx={{ paddingLeft: { xs: 5, sm: 10 }, alignItems: 'center' }}>
                                        <li className='li_disc'>{f.name}</li>
                                      </TableCell>
                                      <TableCell colSpan={2}> 
                                        {parseInt(f?.type) == 2 ?
                                          <Checkbox
                                            edge="end"
                                            onChange={ this.changeActive.bind(this, key, k, f_key, -1) }
                                            checked={ parseInt(f.is_active) == 1 ? true : false }
                                          />
                                          :
                                          <MySelect
                                            data={dataSelect}
                                            value={parseInt(f.is_active) === 0 || f.is_active === null ? false : f.is_active}
                                            func={this.changeActive.bind(this, key, k, f_key, -1)}
                                            is_none={false}
                                          />
                                        }
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </React.Fragment>
                              :  
                              it?.features_cat?.length ? 

                              <React.Fragment key={k}>
                                
                                <TableRow hover>
                                  <TableCell></TableCell>
                                  <TableCell sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: 'center' }} >
                                    <li>{it.name}</li>
                                  </TableCell>
                                  <TableCell colSpan={2}>
                                    <Checkbox
                                      edge="end"
                                      onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                                      checked={ parseInt(it.is_active) == 1 ? true : false }
                                    />
                                  </TableCell>
                                </TableRow>

                                  {it?.features_cat.map((f, f_key) => 
                                    f?.features?.map( ( cat_f, cat_f_key ) =>
                                    <TableRow hover key={cat_f_key}>
                                      <TableCell></TableCell>
                                      <TableCell sx={{ paddingLeft: { xs: 5, sm: 10 }, }}>
                                        <li className='li_disc'>
                                          <span style={{ marginRight: 80, whiteSpace: 'nowrap'}}>{cat_f.category_name}</span>
                                          <span style={{ whiteSpace: 'nowrap'}}>{cat_f.name}</span>
                                        </li>
                                      </TableCell>
                                      <TableCell> 
                                      <Checkbox
                                        edge="end"
                                        onChange={ this.changeActive.bind(this, key, k, cat_f_key, f_key) }
                                        checked={ parseInt(cat_f.is_active) == 1 ? true : false }
                                      />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </React.Fragment>
                              :
                              <TableRow hover key={k}>
                                <TableCell></TableCell>
                                <TableCell sx={{ paddingLeft: { xs: 2, sm: 5 }, alignItems: 'center' }}>
                                  <li>{it.name}</li>
                                </TableCell>
                                <TableCell colSpan={2}>
                                  <Checkbox
                                    edge="end"
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

        
        {/* <Dialog
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' }) }
          fullWidth={true}
          maxWidth={'md'}
        > 
          <DialogTitle >
            {this.state.item.name}
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }} >
            <Grid container spacing={3} className=''>
              <Grid item xs={12} md={4}>
                <MyTextInput
                  label="Название должности"
                  value={this.state.openApp?.name}
                  func={this.changeItem2.bind(this, 'name')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <MyTextInput
                  label="Сокрощенное название"
                  value={this.state.openApp?.short_name}
                  func={this.changeItem2.bind(this, 'short_name')}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <MyTextInput
                  label="Норма бонусов"
                  value={this.state.openApp?.bonus}
                  func={this.changeItem2.bind(this, 'bonus')}
                />
              </Grid>
            </Grid>
        
            <Grid style={{ marginTop: 10}}>
              <List dense sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper' }}>
                {this.state.full_menu?.map((item, key) => 
                  <>
                    <ListItem
                      key={key}
                      disablePadding
                      style={{ marginTop: 30 }}
                    >
                      <ListItemButton>
                        <span style={{ fontWeight: 'bold' }}>{item?.parent?.name}</span>
                      </ListItemButton>
                      <ListItemButton>
                        <span style={{ fontWeight: 'bold' }}>Активность</span>
                      </ListItemButton>
                    </ListItem>
                    {item?.chaild?.map( ( it, k ) => 
                      <>
                        <ListItem
                          key={k}
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              onChange={ this.changeActive.bind(this, key, k, -1, -1) }
                              checked={ parseInt(it.is_active) == 1 ? true : false }
                              //inputProps={{ 'aria-labelledby': labelId }}
                            />
                          }
                          disablePadding
                        >
                          <ListItemButton>
                            <ListItemText primary={it?.name} />
                          </ListItemButton>
                        </ListItem>
                        <Collapse in={ true } timeout="auto">
                          <List component="div" disablePadding>
                          
                            { it?.features?.map( (f, f_key) =>
                              <ListItem
                                key={f_key}
                                secondaryAction={
                                  parseInt(f?.type) == 2 ?
                                    <Checkbox
                                      edge="end"
                                      onChange={ this.changeActive.bind(this, key, k, f_key, -1) }
                                      checked={ parseInt(f.is_active) == 1 ? true : false }
                                    />
                                      :
                                    <MySelect
                                      data={this.state.dataSelect}
                                      value={parseInt(f.is_active) === 0 || f.is_active === null ? false : f.is_active}
                                      // value={f.is_active}
                                      func={this.changeActive.bind(this, key, k, f_key, -1)}
                                      //label="День недели"
                                      is_none={false}
                                    />
                                  }
                                disablePadding
                              >
                                <ListItemButton>
                                  <ListItemText primary={f?.name} style={{ paddingLeft: 30 }} />
                                </ListItemButton>
                              </ListItem>
                            ) }

                            <table>
                              <thead>
                                <tr>
                                  <th></th>
                                  { it?.features_cat?.length > 0 ?
                                    
                                      it?.features_cat[0]?.features?.map( ( cat_f, cat_f_key ) =>
                                        <th key={cat_f_key}>{cat_f?.name}</th>
                                      )
                                      :
                                    false
                                  }
                                </tr>
                              </thead>
                              <tbody>
                                
                              { it?.features_cat?.map( (f, f_key) =>
                                <tr key={f_key}>
                                  
                                  <td>{ f?.category_name }</td>
                                  { f?.features?.map( ( cat_f, cat_f_key ) =>
                                    <td key={cat_f_key}>
                                      <Checkbox
                                        //key={cat_f_key}
                                        //style={{ width: 400 }}
                                        edge="end"
                                        onChange={ this.changeActive.bind(this, key, k, cat_f_key, f_key) }
                                        checked={ parseInt(cat_f.is_active) == 1 ? true : false }
                                      />
                                    </td>
                                    
                                  ) }
                                </tr>
                              ) }

                              </tbody>
                            </table>

                          
                            
                            
                          </List>
                        </Collapse>
                        
                      </>
                    )}
                  </>
                  
                )}
              </List>

            </Grid>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={ parseInt(this.state.openApp?.id) == -1 ? this.saveNew.bind(this) : this.saveEdit.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog> */}
      </>
    );
  }
}

export default function Appointment() {
  return <Appointment_ />;
}
