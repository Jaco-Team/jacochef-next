import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableFooter from '@mui/material/TableFooter';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, MyDatePickerNew, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';
import {api_laravel} from "@/src/api_new";

class OrderStats_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: 'order_stats',
      module_name: '',
      is_load: false,

      points: [],
      point: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rangeDate: [formatDate(new Date()), formatDate(new Date())],

      modalDialog: false,

      drive_stat_full: [],
      drive_stat_date: null,
      summ: 0,
      choose_driver_id: 0,
      check_cash: 0,

      getSumm: 0,
      modalDialogGetSumm: false,
      getSummDriverId: null,
      getSummComment: '',

      modalDialogStatSumm: false,
      modalDialogStatSummMain: false,
      statSumm: [],
      statSummMain: [],

      show_dop: 0,

      showdata: [],
    };
  }

  async componentDidMount(){

    let data = await this.getData('get_all');

    console.log( data )

    this.setState({
      points: data.points,
      //point: data.points[0].id,
      module_name: data.module_info.name,
    })

    document.title = data.module_info.name;

    setTimeout( () => {
      this.updateData();
    }, 50 )
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

  async updateData(){
    let data = {
      point_id: this.state.point,
      date_start: dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end: dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };

    let res = await this.getData('get_data', data);

    console.log( res )

    this.setState({
      //show_dop: parseInt(res.user.kind) < 3 ? 1 : 0,
      //drive_stat_full: res.drive_stat_full,
      showdata: res.unic_users
    })
  }

  changeDate(data, event){
    this.setState({
      [data]: (event)
    })
  }

  changePoint(event){
    let data = event.target.value;

    this.setState({
      point: data
    })
  }

  giveCash(driver_id, check_cash){
    this.setState({
      modalDialog: true,
      choose_driver_id: driver_id,
      check_cash: check_cash
    })
  }

  changeSumm(event){
    this.setState({
      summ: event.target.value,
    })
  }

  async saveGivePrice(){
    if( this.click ){
      return ;
    }

    this.click = true;

    if( parseInt( this.state.summ ) > parseInt( this.state.check_cash ) ){
      alert('Нельзя сдать денег больше, чем есть у курьера');
      setTimeout( () => {
        this.click = false;
      }, 300 )
      return;
    }


    let data = {
      point_id: this.state.point,
      price: this.state.summ,
      driver_id: this.state.choose_driver_id,
    };

    let res = await this.getData('save_give', data);

    console.log( res )

    if( res['st'] == true ){
      this.setState({
        modalDialog: false,
        check_cash: 0,
        choose_driver_id: 0,
        summ: 0
      })

      this.updateData();
    }else{
      alert(res['text'])
    }

    setTimeout( () => {
      this.click = false;
    }, 300 )
  }

  getCash(driver){
    this.setState({
      modalDialogGetSumm: true,
      getSumm: 0,
      getSummDriverId: driver,
      getSummComment: ''
    })
  }

  async saveGetPrice(){
    if( this.click ){
      return ;
    }

    this.click = true;

    if( parseInt( this.state.getSumm ) > 1000 ){
      alert('Нельзя выдать больше 1000р за раз');
      setTimeout( () => {
        this.click = false;
      }, 300 )
      return;
    }


    let data = {
      point_id: this.state.point,
      price: this.state.getSumm,
      driver_id: this.state.getSummDriverId.driver_id,
      comment: this.state.getSummComment
    };

    let res = await this.getData('save_get', data);

    console.log( res )

    if( res['st'] == true ){
      this.setState({
        modalDialogGetSumm: false,
        getSumm: 0,
        getSummDriverId: null,
        getSummComment: ''
      })

      this.updateData();
    }else{
      alert(res['text'])
    }

    setTimeout( () => {
      this.click = false;
    }, 300 )
  }

  async getStatDop(driver){
    let data = {
      point_id: this.state.point,
      driver_id: driver.driver_id,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };

    let res = await this.getData('getStatDop', data);

    console.log( res )

    this.setState({
      modalDialogStatSumm: true,
      statSumm: res,
      getSummDriverId: driver
    })
  }

  async getStatDopMain(driver){
    let data = {
      point_id: this.state.point,
      driver_id: driver.driver_id,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };

    let res = await this.getData('getStatDopMain', data);

    console.log( res )

    this.setState({
      modalDialogStatSummMain: true,
      statSummMain: res?.stat,
      show_dop: parseInt(res.my.kind) < 3 ? 1 : 0,
      getSummDriverId: driver
    })
  }

  changeAutocomplite(type, event, data) {
    this.setState({
      [type]: data,
    });
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDate.bind(this, 'date_start') } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDate.bind(this, 'date_end') } />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              data={this.state.points}
              multiple={true}
              value={this.state.point}
              func={this.changeAutocomplite.bind(this, 'point')}
              label="Точка"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>

          <Grid item xs={12} mb={3}>
            <TableContainer component={Paper}>
              <Table>

                <TableHead>
                  <TableRow>
                    <TableCell>Сотрудник</TableCell>
                    <TableCell>Кол-во заказов не ко времени</TableCell>
                    <TableCell>Ср. время от заказа до выходана стол</TableCell>
                    <TableCell>Ср. время от выхода на стол до закрыт на кухне</TableCell>
                    <TableCell>Ср. время от заказа до закрыт на кухне</TableCell>
                    <TableCell>Ср. время от заказа до получения</TableCell>
                    <TableCell>Кол-во заказов ко времени</TableCell>
                    <TableCell>% вовремя закрытых на кухне (ко времени)</TableCell>
                    <TableCell>% вовремя полученных клиентом (ко времени с учетом GPS)</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>

                  { this.state.showdata.map( (item, key) =>
                    <TableRow key={key}>
                      <TableCell>{item.user_name}</TableCell>
                      <TableCell>{item.count_ob}</TableCell>
                      <TableCell>{item.time1_}</TableCell>
                      <TableCell>{item.time2_}</TableCell>
                      <TableCell>{item.time3_}</TableCell>
                      <TableCell>{item.time4_}</TableCell>
                      <TableCell>{item.count_pred}</TableCell>

                      <TableCell>{item.cook_true_}%</TableCell>
                      <TableCell>{item.order_true_}%</TableCell>
                    </TableRow>
                  ) }

                </TableBody>

              </Table>
            </TableContainer>
          </Grid>




        </Grid>
      </>
    )
  }
}

export default function OrderStats() {
  return <OrderStats_ />;
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
