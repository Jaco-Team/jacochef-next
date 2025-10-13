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

import { MySelect } from '@/components/shared/Forms';

import queryString from 'query-string';
import {api_laravel_local} from "@/src/api_new";

class SiteSale2_Stat_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_sale_2',
      module_name: '',
      is_load: false,

      spam_list: [],
      spam_id: 0,
      findPromoList: [],

      spam_list_data: [],
      spam_list_data_stat: {
        true: 0,
        all: 0,
        percent: 0
      },
    };
  }

  async componentDidMount(){

    let data = await this.getData('get_spam_list');

    console.log( data )

    this.setState({
      module_name: data.module_info.name,
      spam_list: data.spam_list
    })

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

  async show(){
    let data = {
      spam_id: this.state.spam_id
    }

    let res = await this.getData('get_spam_data', data);

    console.log( res )

    this.setState({
      spam_list_data: res.spam_list,
      spam_list_data_stat: res.stat
    })
  }

  changeSpam(event){
    this.setState({spam_id: event.target.value})

    setTimeout( () => {
      this.show()
    }, 300 )
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container style={{ marginTop: '80px', paddingLeft: '24px' }}>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid container direction="row" style={{ paddingTop: 20 }} spacing={3}>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MySelect data={this.state.spam_list} value={this.state.spam_id} func={ this.changeSpam.bind(this) } label='Рассылка' />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <Button variant="contained" onClick={this.show.bind(this)}>Обновить</Button>
            </Grid>

          </Grid>

          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>

            <Grid
              size={{
                xs: 6
              }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Всего</TableCell>
                    <TableCell>Использовали</TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  <TableRow>
                    <TableCell>{this.state.spam_list_data_stat.all}</TableCell>
                    <TableCell>{this.state.spam_list_data_stat.true}</TableCell>
                    <TableCell>{this.state.spam_list_data_stat.percent}</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </Grid>

            <Grid
              size={{
                xs: 6
              }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Номер</TableCell>
                    <TableCell>Ост активаций</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  { this.state.spam_list_data.map( (item, key) =>
                    <TableRow key={key}>
                      <TableCell>{key+1}</TableCell>
                      <TableCell>{item.number}</TableCell>
                      <TableCell>{item.count}</TableCell>

                    </TableRow>
                  ) }

                </TableBody>
              </Table>
            </Grid>
          </Grid>


        </Grid>
      </>
    );
  }
}

export default function SiteSale2_Stat () {
  return <SiteSale2_Stat_ />;
}
