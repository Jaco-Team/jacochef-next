import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Typography from '@mui/material/Typography';

import { MySelect, MyTextInput, MyDatePickerNew, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class CashBook_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);
        
    this.state = {
      module: 'cash_book',
      module_name: '',
      is_load: false,
      
      points: [],
      point: '0',
      
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

      fiz_kassa: {},
      driver_kassa: {},
      openModalType: '',
      openModalType_edit: false,
      comment: '',
      type: '',
      openModalKassa: '',
      openModalTitle: '',
      openModalHist_data: [],
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_all');
    
    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
    })
    
    document.title = data.module_info.name;
    
    setTimeout( () => {
      this.updateData();
    }, 50 )
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
    });
  }
   
  async updateData(){
    let data = {
      point_id: this.state.point,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('get_data', data);
    
    console.log( res )
    
    this.setState({
      fiz_kassa: res.fiz_kassa,
      driver_kassa: res.driver_kassa,
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

  changeComment(event){
    this.setState({
      comment: event.target.value,
    })
  }

  async saveGivePrice(){
    if( this.click ){
      return ;
    }

    this.click = true;

    if( parseInt( this.state.summ ) == 0 ){
      alert('Необходимо указать сумму');

      setTimeout( () => {
        this.click = false;
      }, 300 )

      return;
    }


    let data = {
      point_id: this.state.point,
      price: this.state.summ,
      comment: this.state.comment,
      type: this.state.openModalType,
      kassa: this.state.openModalKassa,
    };
    
    let res = await this.getData('save_give', data);

    console.log( res )

    if( res['st'] == true ){
      this.setState({
        modalDialog: false,
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

  addData(type, kassa, hist, title){
    this.setState({
      openModalType: type,
      openModalType_edit: this.state.fiz_kassa[ type+'_is_edit' ] == 'edit' ? true : false,
      openModalKassa: kassa,
      openModalTitle: title,
      openModalHist_data: hist,

      modalDialog: true,
      comment: '',
      summ: 0,
    })

    //Остаток на начало дня - первый раз ставят директора

    //Выручка за день - отчет о закрытии смены
    //Заемные средства - директор или бухгалтерия
    //Перемещение из другой кассы - директор / менеджер

    //Выдача заработной платы - бухгалтерия
    //Инкассация - директор / менеджер
    //Возврат займа - директор или бухгалтерия
    //Выдача в подотчет - директор / менеджер
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Dialog
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) } }
        >
          <DialogTitle>{this.state.openModalTitle}</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            
            <Grid container spacing={3}>

              { this.state.openModalType_edit === false ? false :
                <Grid item xs={12} sm={12}>
                  <MyTextInput label="Сумма" value={this.state.summ} type={'number'} func={this.changeSumm.bind(this)} />
                </Grid>
              }

              { this.state.openModalType_edit === false ? false :
                <Grid item xs={12} sm={12}>
                  <MyTextInput label="Комментарий" value={this.state.comment} multiline={true} maxRows={3} type={'text'} func={this.changeComment.bind(this)} />
                </Grid>
              }

              <Grid item xs={12} sm={12}>
                <TableContainer component={Paper}>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Сотрудник</TableCell>
                        <TableCell>Время</TableCell>
                        <TableCell>Комментарий</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                      {this.state.openModalHist_data?.map( item => 
                        
                        <TableRow key={item.id}>
                          <TableCell>{item.user_name}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>{item.comment}</TableCell>
                          <TableCell>{item.summ}</TableCell>
                        </TableRow>

                      )}

                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

            </Grid>

            

          </DialogContent>
          { this.state.openModalType_edit === false ? false :
            <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button style={{ backgroundColor: 'green', color: '#fff' }} onClick={this.saveGivePrice.bind(this)}>Сохранить</Button>
              <Button style={{ backgroundColor: 'red', color: '#fff' }} onClick={() => { this.setState({ modalDialog: false, comment: '', openModalType: '', openModalKassa: '', summ: 0 }) }}>Отмена</Button>
            </DialogActions>
          }
        </Dialog>

        
        <Dialog
          open={this.state.modalDialogStatSumm}
          onClose={ () => { this.setState({ modalDialogStatSumm: false, getSummDriverId: null }) } }
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle>Доп выплаты "{this.state.getSummDriverId ? this.state.getSummDriverId.name : ''}"</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            
            <Table size={'small'}>
                
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Кто назначил</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell>Тип</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                
                { this.state.statSumm.map( (item, key) =>
                  <TableRow key={key}>
                    <TableCell>{item.date_time}</TableCell>
                    <TableCell>{item.user_name}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.comment}</TableCell>
                    <TableCell>{ parseInt(item.order_id) > 0 ? 'Довоз' : 'Доп выплата' }</TableCell>
                  </TableRow>
                ) }
              
              </TableBody>
            
            </Table>

            

          </DialogContent>
        </Dialog>

        <Grid container spacing={3} style={{ paddingBottom: 100 }} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <MySelect data={this.state.points} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDate.bind(this, 'date_start') } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDate.bind(this, 'date_end') } />
          </Grid>

          
          <Grid item xs={12}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>
        
          <Grid item xs={12} sm={6}>
            <TableContainer component={Paper}>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell>Приход</TableCell>
                    <TableCell>Расход</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.ostatok_nachalo_dnya_is_edit === false ?
                        <Typography 
                          component="span"
                        >
                          Остаток на начало дня
                        </Typography>
                          :
                        <Typography 
                          component="span"
                          onClick={this.addData.bind(this, 'ostatok_nachalo_dnya', 'fiz', this.state.fiz_kassa?.ostatok_nachalo_dnya_arr, 'Физическая касса: Остаток на начало дня')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Остаток на начало дня
                        </Typography>
                      }
                    </TableCell>
                    <TableCell>{this.state.fiz_kassa?.ostatok_nachalo_dnya}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.virycka_is_edit === false ?
                        <Typography 
                          component="span"
                        >
                          Выручка
                        </Typography>
                          :
                        <Typography 
                          component="span"
                          onClick={this.addData.bind(this, 'virycka', 'fiz', this.state.fiz_kassa?.virycka_arr, 'Физическая касса: Выручка')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Выручка
                        </Typography>
                      }
                      
                    </TableCell>
                    <TableCell>{this.state.fiz_kassa?.virycka}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.zaim_is_edit === false ?
                        <Typography 
                          component="span"
                        >
                          Заемные средства
                        </Typography>
                          :
                        <Typography 
                          component="span"
                          onClick={this.addData.bind(this, 'zaim', 'fiz', this.state.fiz_kassa?.zaim_arr, 'Физическая касса: Заемные средства')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Заемные средства
                        </Typography>
                      }
                    </TableCell>
                    <TableCell>{this.state.fiz_kassa?.zaim}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.dengi_iz_drygoy_kassy_is_edit === false ?
                        <Typography
                          component="span"
                        >
                          Перемещение из другой кассы
                        </Typography>
                          :
                        <Typography
                          component="span"
                          onClick={this.addData.bind(this, 'dengi_iz_drygoy_kassy', 'fiz', this.state.fiz_kassa?.dengi_iz_drygoy_kassy_arr, 'Физическая касса: Перемещение из другой кассы')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Перемещение из другой кассы
                        </Typography>
                      }
                    </TableCell>
                    <TableCell>{this.state.fiz_kassa?.dengi_iz_drygoy_kassy}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.vedomosm_zp_is_edit === false ?
                        <Typography
                          component="span"
                        >
                          Платежная ведомость на выплату заработной платы
                        </Typography>
                          :
                        <Typography
                          component="span"
                          onClick={this.addData.bind(this, 'vedomosm_zp', 'fiz', this.state.fiz_kassa?.vedomosm_zp_arr, 'Физическая касса: Платежная ведомость на выплату заработной платы')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Платежная ведомость на выплату заработной платы
                        </Typography>
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{this.state.fiz_kassa?.vedomosm_zp}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.incasacia_is_edit === false ?
                        <Typography
                          component="span"
                        >
                          Инкассация
                        </Typography>
                          :
                        <Typography
                          component="span"
                          onClick={this.addData.bind(this, 'incasacia', 'fiz', this.state.fiz_kassa?.incasacia_arr, 'Физическая касса: Инкассация')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Инкассация
                        </Typography>
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{this.state.fiz_kassa?.incasacia}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.vozvrat_zaim_is_edit === false ?
                        <Typography 
                          component="span"
                        >
                          Возврат займа
                        </Typography>
                          :
                        <Typography 
                          component="span"
                          onClick={this.addData.bind(this, 'vozvrat_zaim', 'fiz', this.state.fiz_kassa?.vozvrat_zaim_arr, 'Физическая касса: Возврат займа')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Возврат займа
                        </Typography>
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{this.state.fiz_kassa?.vozvrat_zaim}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      { this.state.fiz_kassa?.vidacha_otchet_is_edit === false ?
                        <Typography 
                          component="span"
                        >
                          Выдача в подотчет
                        </Typography>
                          :
                        <Typography 
                          component="span"
                          onClick={this.addData.bind(this, 'vidacha_otchet', 'fiz', this.state.fiz_kassa?.vidacha_otchet_arr, 'Физическая касса: Выдача в подотчет')} 
                          style={{ cursor: 'pointer', color: '#c03', padding: '15px 15px 15px 0px' }}
                        >
                          Выдача в подотчет
                        </Typography>
                      }
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{this.state.fiz_kassa?.vidacha_otchet}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Итого за день</TableCell>
                    <TableCell>{this.state.fiz_kassa?.itog_plus}</TableCell>
                    <TableCell>{this.state.fiz_kassa?.itog_minus}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Остаток на конец дня</TableCell>
                    <TableCell>{this.state.fiz_kassa?.ostatok_konec_dnya}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                </TableBody>
              </Table>


              
              
              
              
              
              


              
            </TableContainer>
          </Grid>

          

          
        </Grid>
      </>
    )
  }
}

export default function CashBook() {
  return (
    <CashBook_ />
  );
}
