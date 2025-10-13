import React from 'react';

import Link from 'next/link'

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyTextInput } from '@/components/shared/Forms';

import queryString from 'query-string';
import {api_laravel, api_laravel_local} from "@/src/api_new";
import {PromoEdit} from "@/components/site_sale_2/PromoEdit";

class SiteSale2_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_sale_2',
      module_name: '',
      is_load: false,
      modalText: '',
      modalDialogEdit: false,

      modalDialog: false,
      modalLink: '',

      city_list: [],
      city_id: 0,
      promoName: '',
      promo_id: 0,

      findPromoList: []
    };
  }

  async componentDidMount(){
    let data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      city_list: data.all_city_list
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

  async showPromoList(){
    let data = {
      city_id: this.state.city_id,
      promo_name: this.state.promoName
    };

    let res = await this.getData('search_promo', data);

    this.setState({
      findPromoList: res
    })
  }

  async delPromo(promo_id){
    let check = confirm("Удалить промокод ?");

    if( check ){
      let data = {
        promo_id: promo_id
      };

      let res = await this.getData('remove_promo', data);

      setTimeout( () => {
        this.showPromoList();
      }, 300 )
    }
  }

  editPromo(promo_id){
    this.setState({
      promo_id: promo_id,
      modalDialogEdit: true
    }, () => {
     this.setState({modalDialogEdit: true})
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {this.state.modalDialogEdit ? (
          <PromoEdit
            modalDialogEdit={this.state.modalDialogEdit}
            promo_id={this.state.promo_id}
            promoName={this.state.promoName}
            onClose={ () => { this.setState({ modalDialogEdit: false }) } }
          />
        ) : null}
        <Dialog
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false, modalLink: '' }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Результат операции</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Typography>{this.state.modalText}</Typography>
            <br />
            { this.state.modalLink == '' ? null :
              <a href={this.state.modalLink} style={{ color: 'red' }}>Скачать</a>
            }
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={ () => { this.setState({ modalDialog: false }) } }>Хорошо</Button>
          </DialogActions>
        </Dialog>
        <Grid container style={{ marginTop: '80px', paddingLeft: '24px' }}>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>

              <Link href={"/site_sale_2/new"} style={{ zIndex: 10 }}>
                <Button variant="contained">Новый промокод</Button>
              </Link>

              <Link href={"/site_sale_2/stat"} style={{ zIndex: 10, marginLeft: 20 }}>
                <Button variant="contained">Статистика</Button>
              </Link>

              <Link href={"/site_sale_2/stat_list"} style={{ zIndex: 10, marginLeft: 20 }}>
                <Button variant="contained">Выписанные промокоды</Button>
              </Link>

              <Link href={"/site_sale_2/analitic_list"} style={{ zIndex: 10, marginLeft: 20 }}>
                <Button variant="contained">Аналитика по выписанным промокодам</Button>
              </Link>

              <Link href={"/site_sale_2/repeat_orders "} style={{ zIndex: 10, marginLeft: 20 }}>
                <Button variant="contained">Повторные заказы с промокода</Button>
              </Link>

            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MySelect data={this.state.city_list} value={this.state.city_id} func={ (event) => { this.setState({city_id: event.target.value}) } } label='Город' />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MyTextInput value={this.state.promoName} func={ (event) => { this.setState({promoName: event.target.value}) } } label='Промокод' />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <Button variant="contained" onClick={this.showPromoList.bind(this)}>Найти</Button>
            </Grid>

          </Grid>

          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>
            <Grid
              size={{
                xs: 12
              }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Промокод</TableCell>
                    <TableCell>Город</TableCell>
                    <TableCell>Было кол-во</TableCell>
                    <TableCell>Ост. кол-во</TableCell>
                    <TableCell>Дата окончания</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  { this.state.findPromoList.map( (item, key) =>
                    <TableRow key={key}>
                      <TableCell>
                        <Button variant="contained" onClick={this.editPromo.bind(this, item.id)}>
                          {item.name}
                        </Button>
                      </TableCell>
                      <TableCell>{ parseInt(item.city_id) == 0 ? 'Все города' : item.city_name }</TableCell>
                      <TableCell>{item.def_count}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.date2}</TableCell>
                      <TableCell>{item.coment}</TableCell>
                      <TableCell> <CloseIcon style={{ cursor: 'pointer' }} onClick={this.delPromo.bind(this, item.id)} /> </TableCell>
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

export default function SiteSale2 () {
  return <SiteSale2_ />;
}
