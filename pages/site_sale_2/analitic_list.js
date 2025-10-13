import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyDatePickerNew } from '@/components/shared/Forms';
import Typography from '@mui/material/Typography';

import dayjs from 'dayjs';

// import {api_laravel} from "@/src/api_new";
import {api_laravel_local as api_laravel} from "@/src/api_new";
import { formatDate } from '@/src/helpers/ui/formatDate';

class SiteSale2_AnaliticList_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_sale_2',
      module_name: '',
      is_load: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      promo_list: [],

      city_list: [],
      city_id: ''
    };
  }

  async componentDidMount(){

    let data = await this.getData('get_analitic_all');

    console.log( data )

    this.setState({
      module_name: data.module_info.name,
      city_list: data.cities,
      city_id: -1
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

  async getUsers(){
    let data = {
      city_id: this.state.city_id,

      dateStart  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      dateEnd    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    }

    let res = await this.getData('get_promo_users_analitic', data);

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
        <Grid container style={{ marginTop: '80px', paddingLeft: '24px' }}>
          <Grid size={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid container direction="row" style={{ paddingTop: 20 }} spacing={3}>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MySelect is_none={false} data={this.state.city_list} value={this.state.city_id} func={ (event) => { this.setState({city_id: event.target.value}) } } label='Город' />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Button variant="contained" onClick={this.getUsers.bind(this)}>Обновить</Button>
            </Grid>

          </Grid>

          <Grid size={12} style={{ marginTop: 20 }}>

            { this.state.promo_list.map( (item, key) =>
              <Accordion key={key} style={{ width: '100%' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <span>Всего выписано: {item.count} (промокод) - {item.all_count_active} (активаций)</span>
                  <br />
                  <span>Удаленных: {item.stat.is_delete_count} (промокод) - {item.stat.is_delete_active} (активаций)</span>
                  <br />
                  <span>Активировано: {item.stat.is_active.count} (промокод) - {item.stat.is_active.all_count_active} (активаций)</span>
                  <br />
                  <span>Не активировано: {item.stat.is_nonactive.count} (промокод) - {item.stat.is_nonactive.all_count_active} (активаций)</span>
                  <br />
                  <span>------------------------------</span>
                  <br />
                  <span>Новых клиентов: {item.stat.is_new_perc}</span>
                  <br />
                  <span>Не заказывали 90 и более и сделали заказ по промику: {item.stat.is_return_90}</span>
                  <br />
                  <span>(от общего числа заказов)</span>
                  <br />
                  <span>------------------------------</span>
                  <br />
                  <span>Доставка: {item.stat.type_dev}</span>
                  <br />
                  <span>Самовывоз: {item.stat.type_pic}</span>
                  <br />
                  <span>Зал: {item.stat.type_hall}</span>
                  <br />
                  <span>Всего: {item.stat.type_all}</span>
                  <br />
                  <span>------------------------------</span>
                  <br />
                  <span>Оформил клиент: {item.stat.is_client}</span>
                  <br />
                  <span>Оформил контакт-центр: {item.stat.is_center}</span>
                  <br />
                  <span>Оформили на кассе: {item?.stat?.is_hall}</span>
                  <br />
                </AccordionDetails>
              </Accordion>
            ) }

          </Grid>

        </Grid>
      </>
    );
  }
}

export default function SiteSale2_AnaliticList () {
  return <SiteSale2_AnaliticList_ />;
}
