import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyDatePickerNew, formatDate, MyAutocomplite, MyTextInput, MyAlert } from '@/ui/elements';

import dayjs from 'dayjs';
import queryString from 'query-string';

class SiteSale2_RepeatOrders_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'site_sale_2',
      module_name: '',
      is_load: false,
      
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      promo_list: [],
      promoName: '',

      city_list: [],
      city_id: [],

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_repeat_orders_all');
    
    this.setState({
      module_name: data.module_info.name,
      city_list: data.cities,
    })
    
    document.title = data.module_info.name;
  }
  
  getData = (method, data = {}) => {
    
    this.setState({
      is_load: true
    })
    
    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded'},
      body: queryString.stringify({
        method: method, 
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify( data )
      })
    }).then(res => res.json()).then(json => {
      
      if( json.st === false && json.type == 'redir' ){
        window.location.pathname = '/';
        return;
      }
      
      if( json.st === false && json.type == 'auth' ){
        window.location.pathname = '/auth';
        return;
      }
      
      setTimeout( () => {
        this.setState({
          is_load: false
        })
      }, 300 )
      
      return json;
    })
    .catch(err => { 
      console.log( err )
      
      setTimeout( () => {
        this.setState({
          is_load: false
        })
      }, 300 )
    });
  }

  async getDataPromo(){

    const { city_id, date_start, date_end, promoName } = this.state;

    if(!date_start || !date_end) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать все даты',
      })
      
      return;
    }

    if(!city_id.length) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город',
      })
      
      return;
    }

    if(!promoName) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать промокод',
      })
      
      return;
    }

    const data = {
      city_id,
      date_start : dayjs(date_start).format('YYYY-MM-DD'),
      date_end : dayjs(date_end).format('YYYY-MM-DD'),
      promoName
    }
    
    const res = await this.getData('get_data_repeat_orders', data);
  
    this.setState({
      promo_list: res.promo_list
    })
  }

  changeDateRange(data, event){
    this.setState({
      [data]: (event)
    })
  }

  render(){
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
        
        <Grid container style={{ marginTop: '80px', paddingLeft: '24px' }}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid container direction="row" style={{ paddingTop: 20 }} spacing={3}>

            <Grid item xs={12} sm={6}>
              <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyAutocomplite
                label="Город"
                multiple={true}
                data={this.state.city_list}
                value={this.state.city_id}
                func={(event, value) => this.setState({ city_id: value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput 
                value={this.state.promoName} 
                func={(event) => this.setState({ promoName: event.target.value })} 
                label='Промокод' 
              />
            </Grid>
            
            <Grid item xs={12} sm={12}>
              <Button variant="contained" onClick={this.getDataPromo.bind(this)}>Показать</Button>
            </Grid>

          </Grid>  
          
          <Grid item xs={12} sm={12} style={{ marginTop: 20 }}>
            <Grid item xs={12}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Заказов</TableCell>
                    <TableCell>Количество</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.promo_list.map( (item, key) =>
                    <TableRow key={key}>
                      <TableCell>{item.orders}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Grid>  
          </Grid>
        
        </Grid>
      </>
    )
  }
}

export default function SiteSale2_RepeatOrders () {
  return <SiteSale2_RepeatOrders_ />;
}
