import React from 'react';


import { MyTextInput, MyAlert } from '@/ui/elements';
import { api_laravel } from '@/src/api_new';
import { Backdrop, Button, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AppointmentModal from '@/components/appointment/AppointmentModal';

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

      // dataSelect: [
      //   {id: false, name: 'Без активности'},
      //   {id: 'show', name: 'Показывать'},
      //   {id: 'edit', name: 'Редактировать'},
      // ],
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

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text
      });

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
    const res = await this.getData('get_all'); 

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
        err_status: res.st,
        err_text: res.text
      });

    } else {

      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: [],
        openAlert: true,
        err_status: res.st,
        err_text: res.text
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
        err_status: res.st,
        err_text: res.text
      });

    } else {

      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: [],
        openAlert: true,
        err_status: res.st,
        err_text: res.text
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

          <AppointmentModal
            open={this.state.modalDialog}
            onClose={() => this.setState({ modalDialog: false, openApp: null })}
            item={this.state.openApp}
            full_menu={this.state.full_menu}
            fullScreen={this.state.fullScreen}
            save={parseInt(this.state.openApp?.id) == -1 ? this.saveNew.bind(this) : this.saveEdit.bind(this)}
            method={this.state.method}
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

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  }
}
