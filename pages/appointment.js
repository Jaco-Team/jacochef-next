import React from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MySelect, MyCheckBox } from '@/ui/elements';

import queryString from 'query-string';
import { NoStroller } from '@mui/icons-material';

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

      points: [],
      point: '0',

      cats: [], // todo del

      confirmDialog: false,
      cat: [], // todo del
      items: [], 
      test: 0
    };
  }

  async componentDidMount() {
    console.log('appointment!!');
    const data = await this.getData('get_all');
    const res = await this.getData('get_items');

    this.setState({
      module_name: data.module_info.name,
      items: res.items,
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

  async changePoint(event) {
    const point = event.target.value;

    const data = {
      point_id: point,
    };

    const res = await this.getData('get_items', data);

    this.setState({
      point,
      cats: res.items,
    });
  }
  // todo
  openConfirm(cat, event) {
    event.stopPropagation();

    this.setState({
      confirmDialog: true,
      cat,
    });
  }
 
  // todo
  async update() {
    const point = this.state.point;

    const data = {
      point_id: point,
    };

    const res = await this.getData('get_items', data);

    this.setState({
      cats: res.items,
    });
  }

  // сохранение сортировки
  async save() {
    console.log('save')
    const app_list = this.state.items;
 
    console.log('app_list',app_list);

   // await this.getData('save_sort', app_list);
    this.setState({
      modalDialog: false
    });
    console.log('save ok')
  }

  //(this, 'kind', item.kind, key)
  changeItem(data, id, event) {
   
    const items = this.state.items;
    console.log('data='+data+' id='+id + ' ev='+ event.target.value )

    items.forEach((item) => {
      if (item.id === id) {
         console.log('YES=')
        item[data] = event.target.value;
      }
      // console.log('kind='+item.kind+' sort='+item.sort +' item='+item[data]+' id='+id+' item_id='+item.id)
    });      


    this.setState({
      items,
    });
    console.log('setStateok')
  }
  
  async openModal(id) {

    console.log('id='+id);
    let d = {'id' : id};
    const res = await this.getData('get_one', id); 

    console.log('r_data=',res.data);
    console.log('r_name=',res.data.name);
    this.setState({
      modalDialog: true,
      item: res.data
    });
  }

  changeItemChecked(data, event) {
    console.log('check_',event.target.checked);
    const item = this.state.item;

   // item.err[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  render() {
    console.log('app render!!');
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>
        </Grid>
       
        <Grid item xs={12} ml={3}>
          <Button  variant="contained" onClick={this.save.bind(this)}>Сохранить</Button>
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
              <Button color="primary" variant="contained" onClick={this.save.bind(this)}>Сохранить</Button>
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
              <Grid item >
                <MyTextInput
                  label="Название должности"
                  value={this.state.item.name}
                  func={this.changeItem.bind(this, 'name')}
                />
              </Grid>

              <Grid item  >
                <MyTextInput
                  label="Сокрощенное название"
                  value={this.state.item.short_name}
                  func={this.changeItem.bind(this, 'short_name')}
                />
              </Grid>

              <Grid item  >
                <MyTextInput
                  label="Норма бонусов"
                  value={this.state.item.bonus}
                  func={this.changeItem.bind(this, 'bonus')}
                />
              </Grid>
            </Grid>

            <Accordion  style={{ marginTop: 10}} >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Typography>Настройка доступа к модулям</Typography>
              </AccordionSummary>
              <AccordionDetails>
              
                    { this.state.item.full_menu ?
                        this.state.item.full_menu.map((item, key) =>
                          <Grid item>
                              <Grid item  style={{ width: '100%', fontWeight: 700, fontSize: 20,paddingTop: 10, paddingBottom: 10 }}>{item.name}</Grid>
                              <Accordion >
                              <AccordionSummary>  <Typography>Разделы</Typography></AccordionSummary>
                                <AccordionDetails>
                                  <TableContainer><Table> 
                                    { item.child ?
                                      item.child.map((it, key) => 
                                        <TableRow key={key}>
                                          <TableCell style={{ width: '1%'}}><MyCheckBox
                                              label=""
                                              value={parseInt(it.is_active) == 1 ? true : false}
                                              func={this.changeItemChecked.bind(this, it.id)}
                                            /></TableCell>
                                          <TableCell>{it.name}</TableCell>

                                          { it.dop ?
                                            it.dop.map((j, k) => 
                                            <TableCell>
                                              {j.name}   
                                              <TableCell style={{ width: '1%'}}><MyCheckBox
                                                label=""
                                                value={parseInt(it.is_active) == 1 ? true : false}
                                                func={this.changeItemChecked.bind(this, it.id)}
                                              /></TableCell>
                                            </TableCell>
                                          ) : null}
                                        </TableRow>
                                       
                                    ) : null}
                                </Table></TableContainer>
                              </AccordionDetails>
                              </Accordion >
                            </Grid>
                        ) : null}
                 
            </AccordionDetails>
          </Accordion>

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

export default function Appointment() {
  return <Appointment_ />;
}
