import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

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

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MySelect } from '@/ui/elements';

import queryString from 'query-string';
import Collapse from '@mui/material/Collapse';

class Appointment_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'appointment',
      module_name: '',

      modalDialog: false,
      method: '',
      item : [],

      is_load: false,

      

      confirmDialog: false,
      items: [], 
      

      openApp: null,
      full_menu: [],

      dataSelect: [
        {id: false, name: 'Без активности'},
        {id: 'show', name: 'Показывать'},
        {id: 'edit', name: 'Редактировать'},
      ],
    };
  }

  async componentDidMount() {
    console.log('appointment!!');
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

  async saveSort() {
    let data = {
      app_list:  this.state.items,   
    };

    let res = await this.getData('save_sort', data);

    if (res.st === false) {
      alert(res.text);
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
  
  changeItem2(data, event) {
   
    const item = this.state.openApp;

    item[data] = event.target.value;

    this.setState({
      openApp: item
    });
    
  }
  
  async updateList() {
    const res = await this.getData('get_items'); 

    this.setState({
      items: res.apps,
    });
  }
  
  async openModal(id) {
    const data = {
      'app_id': id
    };

    const res = await this.getData('get_one', data); 

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
    });
  }

  changeActive(main_key, parent_key, features_key, event){
    let full_menu = this.state.full_menu;

    if( event.target.checked === undefined ){
      full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.value;
    }else{

      if( parseInt(features_key) > -1 ) {
        full_menu[ main_key ]['chaild'][ parent_key ]['features'][ features_key ].is_active = event.target.checked === true ? 1 : 0;
      }else{
        full_menu[ main_key ]['chaild'][ parent_key ].is_active = event.target.checked === true ? 1 : 0;
      }

    }

    this.setState({
      full_menu: full_menu
    });
  }

  async saveEdit() {
    const data = {
      app: this.state.openApp,
      full_menu: this.state.full_menu,
    };

    const res = await this.getData('save_edit', data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: []
      });

      this.updateList();
    }
  }

  async saveNew(){
    const data = {
      app: this.state.openApp,
      full_menu: this.state.full_menu,
    };

    const res = await this.getData('save_new', data);

    if (res.st === false) {
      alert(res.text);
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
    const res = await this.getData('get_all_for_new'); 

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
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
                    <TableRow key={key} hover onClick={this.openModal.bind(this, item.id)}>
                      <TableCell style={{ width: '1%' }}>{key + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
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

        
        <Dialog
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' }) }
          fullWidth={true}
          maxWidth={'lg'}
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
              <List dense sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
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
                    </ListItem>
                    {item?.chaild?.map( ( it, k ) => 
                      <>
                        <ListItem
                          key={k}
                          secondaryAction={
                            <Checkbox
                              edge="end"
                              onChange={ this.changeActive.bind(this, key, k, -1) }
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
                                      onChange={ this.changeActive.bind(this, key, k, f_key) }
                                      checked={ parseInt(f.is_active) == 1 ? true : false }
                                    />
                                      :
                                    <MySelect
                                      data={this.state.dataSelect}
                                      value={f.is_active}
                                      func={this.changeActive.bind(this, key, k, f_key)}
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
        </Dialog>
      </>
    );
  }
}

export default function Appointment() {
  return <Appointment_ />;
}
