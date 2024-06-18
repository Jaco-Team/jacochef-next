import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { MyAutocomplite, MyDatePickerNew, formatDate, MyAlert } from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

class DriverStatTime_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'driver_stat_time',
      module_name: '',
      is_load: false,
      
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      points: [],
      point: [],

      svod: [],
      orders: [],

      dop_show: 0,

      operAlert: false,
      err_status: true,
      err_text: '',
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      points: data.points,
      dop_show: data.dop_show
    })
    
    if( data.points.length == 1 ){
      this.setState({
        point: data.points
      })
    }

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
      this.setState({
        is_load: false
      })
    });
  }
  
  changeAutocomplite(type, event, data) {
    this.setState({
      [type]: data,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : null,
    });
  }

  async showData(){

    const { date_end, date_start, point } = this.state;
      
    console.log( point )

    const dateStart = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
    const dateEnd = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

    if( point.length == 0 || dateStart == '' || dateEnd == '' ){
      this.setState({
        operAlert: true,
        err_status: false,
        err_text: 'Точка или Дата не указана',
      });

      return ;
    }

    let data = {
      date_start: dateStart,
      date_end: dateEnd,
      point_id: point.length == 1 ? point[0].id : '',
      points: point,
    };

    let res = await this.getData('show_data', data);

    this.setState({
      svod: res.avg_orders,
      orders: res.all_orders
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyAutocomplite
              data={this.state.points}
              multiple={true}
              value={this.state.point}
              func={this.changeAutocomplite.bind(this, 'point')}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
              clearable={true}
              customActions={true}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
              clearable={true}
              customActions={true}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button variant="contained" color="primary" onClick={ this.showData.bind(this) }>Показать</Button>
          </Grid>
          
          <Grid item xs={12} sm={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Курьер</TableCell>
                    <TableCell align="center">Среднее время</TableCell>
                    <TableCell align="center">Количество</TableCell>
                    <TableCell align="center">Во время</TableCell>
                    <TableCell align="center">С опозданием</TableCell>

                    { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">Вовремя и в радиусе</TableCell> }
                    { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">В радиусе</TableCell> }
                    { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">Не вовремя и не в радиусе</TableCell> }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.svod.map((row) => (
                    <TableRow key={row.driver_id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">{row.time2}</TableCell>
                      <TableCell align="center">{row.other_stat.all_count}</TableCell>
                      <TableCell align="center">{row.other_stat.norm} ({row.other_stat.norm_percent}%)</TableCell>
                      <TableCell align="center">{row.other_stat.fake} ({row.other_stat.fake_percent}%)</TableCell>

                      { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">{row.other_stat.time_dist_true} ({row.other_stat.time_dist_true_percent}%)</TableCell> }
                      { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">{row.other_stat.true_dist} ({row.other_stat.true_dist_percent}%)</TableCell> }
                      { parseInt( this.state.dop_show ) == 0 ? false : <TableCell align="center">{row.other_stat.time_dist_false} ({row.other_stat.time_dist_false_percent}%)</TableCell> }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} sm={12} style={{ marginBottom: 100 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                Детализация заказов
              </AccordionSummary>
              <AccordionDetails>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>№ заказа</TableCell>
                      <TableCell>Курьер</TableCell>
                      <TableCell>Время в пути заказа</TableCell>
                      { parseInt( this.state.dop_show ) == 0 ? false : <TableCell>Дистанция</TableCell> }
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.orders.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.time2}</TableCell>
                        { parseInt( this.state.dop_show ) == 0 ? false : <TableCell>{row.dist}</TableCell> }
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          </Grid>

        </Grid>
      </>
    )
  }
}

export default function DriverStatTime() {
  return <DriverStatTime_ />;
}
