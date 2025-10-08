import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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
import Paper from '@mui/material/Paper';

import CloseIcon from '@mui/icons-material/Close';

import { MyTextInput, MyDatePickerNew, MySelect, MyAutocomplite, MyCheckBox } from '@/components/shared/Forms';

import queryString from 'query-string';

import dayjs from 'dayjs';
import { formatDate } from '@/src/helpers/ui/formatDate';
    
class AdvertisingCompany_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'advertising_company',
      module_name: '',
      description: '',
      promo: '',
      is_load: false,
      
      adv_actual: [],
      adv_old: [],
      
      modalDialog: false,
      modalDialogNew: false,
      rangeDate: [formatDate(new Date()), formatDate(new Date())],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      point_id: 0,
      points: [],
      choosePoint: [],
      points_filter: [],

      is_active: 1,
      id: 0,

      nameCat: '',
      editText: '',

      name: '',
      editTextNew: '',

      showItem: null
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
        module_name     : data.module_info.name,
        adv_actual      : data.adv_actual,
        adv_old         : data.adv_old,
        points          : data.points,
        points_filter   : data.points,
        point_id        : data.points[0].id
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
      this.setState({
        is_load: false
      })
    });
  }
   
  openCat(item) {
    this.setState({
      modalDialog     : true,
      showItem        : true,
      name            : item.name,
      date_start      : item.date_start,
      date_end        : item.date_end,
      is_active       : item.is_active,
      id              : item.id,
      description     : item.description,
      choosePoint     : item.choosePoint,
      promo           : item.promo,
    })
    
  }

  // сохранение после редактирования
  async save(){
    let data = {
      id          : this.state.id,
      points      : this.state.choosePoint,
      name        : this.state.name,
      //rangeDate   : this.state.rangeDate,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
      is_active   : this.state.is_active,
      description : this.state.description,
      promo       : this.state.promo,
    };

    let res = await this.getData('save_edit', data);

    if (res.st === false) {
      alert(res.text)
    } else {
      this.setState({ 
        modalDialog: false, 
        // showItem: null, 
        name: '',
        date_start: formatDate(new Date()),
        date_end: formatDate(new Date())
      })

      res = await this.getData('get_adv_point', { point_id: this.state.point_id } );

      this.setState({
        adv_actual : res.adv_actual,
        adv_old    : res.adv_old
      })

    }   
  }
     
  async saveNew(){
    let data = {
      points        : this.state.choosePoint,
      name          : this.state.name,
      date_start    : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end      : dayjs(this.state.date_end).format('YYYY-MM-DD'),
      is_active     : this.state.is_active,
      description   : this.state.description,
      promo         : this.state.promo,
    };

    let res = await this.getData('save_new', data);

    if (res.st === false) {
        alert(res.text)
    } else {
      this.setState({ 
        modalDialogNew: false,
        name: '',
        date_start: formatDate(new Date()),
        date_end: formatDate(new Date())
      })

      res = await this.getData('get_adv_point', {point_id: this.state.point_id} );
  
      this.setState({
        adv_actual : res.adv_actual,
        adv_old    : res.adv_old,
      })
    }
  }

  changeChekBox(type, event) {
      this.setState({
          [type]: event.target.checked
      })
  }

  changeDateRange(data, val) {
    this.setState({
      [data]: formatDate(val)
    })
  }

  // смена точки
  changePoint(event) {
    this.setState({
        point_id: event.target.value
    })

    setTimeout(() => {
        this.getAdvList();
    }, 50)
  }

  // получение спиок рек. компаний по точки
  async getAdvList() {
    let data = {
        point_id: this.state.point_id,
    };

    let res = await this.getData('get_adv_point', data);

    this.setState({
      adv_actual: res.adv_actual,
      adv_old   : res.adv_old,
    })
  }

    // удаление РК
  async delAdv(id) {
    let data = {
      point_id: this.state.point_id,
    };

    if (confirm('Вы действительно хотите удалить рекламную компанию?')) {
      
      let del = await this.getData('delete_adv', {id : id} );
      if (!del['st']) {
        alert('При удалении произошла ошибка');
      }

      let res = await this.getData('get_adv_point', data);

      this.setState({
        adv_actual: res.adv_actual,
        adv_old: res.adv_old,
      })
    }   
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        { !this.state.showItem ? null :
          <Dialog
            open={this.state.modalDialog}
                    onClose={() => { this.setState({ modalDialog: false, description: '', name: '', promo: '', choosePoint: [], date_start: formatDate(new Date()), date_end: formatDate(new Date()) }) } }
          >
            <DialogTitle>Компания "{this.state.name}"</DialogTitle>
            <DialogContent style={{ paddingTop: 10 }}>
              
              <Grid container spacing={3}>
                
                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <MyTextInput value={this.state.name} func={(event) => { this.setState({ name: event.target.value }) }} label='Название акции' />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyDatePickerNew label="Дата от" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <MyAutocomplite data={this.state.points} value={this.state.choosePoint} func={(event, data) => { this.setState({ choosePoint: data }) }} multiple={true} label='Точка' />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                     <MyTextInput value={this.state.description} func={(event) => { this.setState({ description: event.target.value }) }} label='Описание' />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                     <MyTextInput value={this.state.promo} func={(event) => { this.setState({ promo: event.target.value }) }} label='Промокод' />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                    <MyCheckBox label='Показать акцию' value={this.state.is_active == 1 ? true : false} func={this.changeChekBox.bind(this, 'is_active')} />
                </Grid>
                 
              </Grid>

            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.save.bind(this)}>Сохранить</Button>
            </DialogActions>
          </Dialog>
        }
        <Dialog
          open={this.state.modalDialogNew}
          onClose={() => { this.setState({ modalDialogNew: false, description: '', name: '', promo: '', choosePoint: [], date_start: formatDate(new Date()), date_end: formatDate(new Date()) }) } }
        >
          <DialogTitle>Новая акция</DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            
            <Grid container spacing={3}>
              
               <Grid
                 size={{
                   xs: 12,
                   sm: 12
                 }}>
                  <MyTextInput value={this.state.name} func={(event) => { this.setState({ name: event.target.value }) } } label='Название компании' />
               </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <MyDatePickerNew label="Дата от" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <MyAutocomplite data={this.state.points} value={this.state.choosePoint} func={(event, data) => { this.setState({ choosePoint: data }) }} multiple={true} label='Точка' />
                </Grid>
               
                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                     <MyTextInput value={this.state.description} func={(event) => { this.setState({ description: event.target.value }) }} label='Описание'  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <MyTextInput value={this.state.promo} func={(event) => { this.setState({ promo: event.target.value }) }} label='Промокод' />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                     <MyCheckBox label='Показать акцию' value={this.state.is_active == 1 ? true : false} func={this.changeChekBox.bind(this, 'is_active')} />
                </Grid>
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.saveNew.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>
        <Grid container spacing={3} className='container_first_child'>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <Button variant="contained" color="primary" onClick={ () => { this.setState({ modalDialogNew: true }) } }>Добавить акцию</Button>
          </Grid>

           <Grid
             size={{
               xs: 12,
               sm: 6
             }}>
               <MySelect data={this.state.points_filter} value={this.state.point_id} func={this.changePoint.bind(this)} label='Точка' />
            </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12
                      }}>
                        <h2 style={{ textAlign: 'center' }}>Актвные</h2>
                    </Grid>
                    
                    <TableContainer component={Paper} style={{ marginTop: 10 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell style={{ textAlign: 'center' }}>#</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Название</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Дата начало</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Дата окончания</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Точки</TableCell>
                            <TableCell style={{ textAlign: 'center' }}>Промокод</TableCell>
                            <TableCell style={{ textAlign: 'center' }}></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                        {!this.state.adv_actual ? null :
                           this.state.adv_actual.map((item, key) =>
                              <TableRow key={key}  >
                                <TableCell style={{ textAlign: 'center' }}>{ key + 1 } </TableCell>
                                <TableCell style={{ textAlign: 'center', cursor: 'pointer' }} onClick={this.openCat.bind(this, item)} >{ item.name } </TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{ item.date_start } </TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{ item.date_end } </TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{item.choosePoint.map((it, k) => <React.Fragment key={k}> {it.name} </React.Fragment> )}</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>{item.promo} </TableCell>
                                <TableCell style={{ textAlign: 'center' }}> <CloseIcon onClick={this.delAdv.bind(this, item.id)} /> </TableCell>
                              </TableRow>
                         )}
                        </TableBody>
                     </Table>
                    </TableContainer>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12
                  }}>
                    <Grid container>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 12
                          }}>
                          <h2 style={{ textAlign: 'center' }}>Не Актвные</h2>
                        </Grid>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 12
                          }}>
                          <TableContainer component={Paper} style={{ marginTop: 10 }}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ textAlign: 'center' }}></TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Название</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Дата начало</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Дата окончания</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Точки</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}>Промокод</TableCell>
                                  <TableCell style={{ textAlign: 'center' }}></TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                  {!this.state.adv_old ? null :
                                      this.state.adv_old.map((item, key) =>
                                          <TableRow key={key}  >
                                              <TableCell style={{ textAlign: 'center' }}>{key + 1} </TableCell>
                                              <TableCell style={{ textAlign: 'center', cursor: 'pointer' }} onClick={this.openCat.bind(this, item)} >{item.name} </TableCell>
                                              <TableCell style={{ textAlign: 'center' }}>{item.date_start} </TableCell>
                                              <TableCell style={{ textAlign: 'center' }}>{item.date_end} </TableCell>
                                              <TableCell style={{ textAlign: 'center' }}>{item.choosePoint.map((it, k) => <React.Fragment key={k}> {it.name} </React.Fragment>)}</TableCell>
                                              <TableCell style={{ textAlign: 'center' }}>{item.promo} </TableCell>
                                              <TableCell style={{ textAlign: 'center' }}> <CloseIcon onClick={this.delAdv.bind(this, item.id)} /> </TableCell>
                                          </TableRow>
                                      )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                    </Grid>
                </Grid>
        </Grid>
      </>
    );
  }
}

export default function AdvertisingCompany() {
  return <AdvertisingCompany_ />;
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
