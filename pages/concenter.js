import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyDatePickerNew, MyTextInput, formatDate } from '@/ui/elements';
import Typography from '@mui/material/Typography';

import { api, api_laravel, api_laravel_local } from '@/src/api_new';

import dayjs from 'dayjs';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class Concenter_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'concenter',
      module_name: '',
      is_load: false,
      
      modalDialog: false,
      modalDialogDel: false,
      
      cities: [],
      city_id: 1,
      date: formatDate(new Date()),
      point_list: [],
      need_point_list: [],
      point_id: 0,
      indexTab: 0,

      orders: [],
      ordersRender: [],
      showOrder: null,

      radiogroup_options: [
        {id: '0', label: 'Решили отредактировать заказ', value: 0 },
        {id: '1', label: 'Не устраивает время ожидания', value: 0 },
        {id: '2', label: 'Изменились планы', value: 0 },
        {id: '3', label: 'Недостаточно средств', value: 0 },
        {id: '4', label: 'Другое', value: 0 },
      ],
      textDel: '',
      typeDel: -1,

      number: '',
      addr: ''
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    let need_points = data.points.filter( (item, key) => parseInt(item.city_id) == parseInt(data.cities[0].id) );

    this.setState({
      module_name: data.module_info.name,
      cities: data.cities,
      point_list: data.points,
      need_point_list: need_points,
      point_id: parseInt(need_points[0].id)
    })
    
    document.title = data.module_info.name;

    setTimeout( () => {
      this.getOrders();
    }, 300 )
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
   
  changeCity(event){
    this.setState({
      number: '',
      addr: ''
    })

    let data = event.target.value;
    
    let need_points = this.state.point_list.filter( (item, key) => parseInt(item.city_id) == parseInt(data) );

    this.setState({
      city_id: data,
      need_point_list: need_points,
      point_id: parseInt(need_points[0].id),
      indexTab: 0
    })

    setTimeout( () => {
      this.getOrders();
    }, 300 )
  }
  
  async changePoint(point_id, index){
    //let point_id = event.target.id;
    //point_id = point_id.split('-')[2]

    this.setState({
      point_id: point_id,
      indexTab: index
    })

    setTimeout( () => {
      this.getOrders();
    }, 300 )
    
  }

  async getOrders(){
    let data = {
      point_id: this.state.point_id,
      date: dayjs(this.state.date).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('get_orders', data);

    console.log( res )

    this.setState({
      orders: res.orders
    })

    setTimeout( () => {
      this.filterNumber();
    }, 300 )
  }

  btnGetOrders(){
    this.setState({
      number: '',
      addr: ''
    })

    this.getOrders();
  }

  async showOrder(order_id){
    let data = {
      point_id: this.state.point_id,
      order_id: order_id
    };

    let res = await this.getData('get_order_new', data);

    console.log( res )

    this.setState({
      modalDialog: true,
      showOrder: res
    })
  }

  closeOrder(){
    this.setState({ modalDialogDel: true })
  }

  async closeOrderTrue(){
    let deltype = this.state.radiogroup_options.find( (item) => item.id == this.state.typeDel );
        
    if (confirm("Отменить заказ #"+this.state.showOrder.order.order_id)) {
      let data = {
        typeCreate: 'center',
        order_id: this.state.showOrder.order.order_id,
        point_id: this.state.showOrder.order.point_id,
        ans: parseInt(deltype.id) == 4 ? this.state.textDel : deltype.label
      };
  
      let res = await this.getData('close_order_center', data);

      //setTimeout(() => {
        if( res['st'] === true ){
          this.setState({
            modalDialogDel: false,
            modalDialog: false,
          });
          
          this.getOrders();
        }else{
          alert( res['text'] );
        }
      //}, 300);
    }
  }

  async fakeUser(){
    let type_check = 0;

    if( parseInt(this.state.showOrder.order.check_pos) >= 0 ){
      if( parseInt(this.state.showOrder.order.check_pos) <= 100 ){
        type_check = 1;
      }else{
        type_check = 2;
      }
    }else{
      type_check = 0;
    }

    //0 - не активно
    //1 - сразу
    //2 - уточнить

    
    if( parseInt(type_check) == 0 ){
      alert('Создать обращение не возможно')
      return ;
    }

    if( parseInt(type_check) == 1 ){
      let text = prompt('Комментарий к ситуации', '');

      if(text.length > 0){
        let data = {
          text: text,
          point_id: parseInt(this.state.showOrder.order.point_id),
          order_id: parseInt(this.state.showOrder.order.order_id),
        };
    
        let res = await this.getData('fake_user', data);
  
        if(res['st'] == true){
          alert('Обращение зафиксировано')
          this.setState({ modalDialog: false })
        }else{
          alert(res['text'])
        }

      }else{
        alert('надо указать комментарий')
      }
    }

    if( parseInt(type_check) == 2 ){
      const result = confirm('Курьер, предположительно, находиться далеко от клиента, точно оформить довоз ?');

      if (result) {
        var text = prompt('Комментарий к ситуации', '');

        if(text.length > 0){
          let data = {
            text: text,
            point_id: parseInt(this.state.showOrder.order.point_id),
            order_id: parseInt(this.state.showOrder.order.order_id),
          };
      
          let res = await this.getData('fake_user', data);

          if(res['st'] == true){
            alert('Обращение зафиксировано')
            this.setState({ modalDialog: false })
          }else{
            alert(res['text'])
          }
        }else{
          alert('надо указать комментарий')
        }
      }
    }
  }

  changeText(event){
    this.setState({ textDel: event.target.value })
  }

  changeAddr = (event) => {
    this.setState({
      typeDel: event.target.value,
    })
  }

  changeDate(val){
    this.setState({
      number: '',
      addr: ''
    })
    
    this.setState({
      date: (val)
    })

    setTimeout( () => {
      this.getOrders();
    }, 300 )
  }

  changeNumber(event){
    let value = event.target.value;
    
    if( isNaN(value) ){
      return ;
    }

    this.setState({ number: value })

    setTimeout( () => {
      this.filterNumber();
    }, 300 )
  }

  changeAddrSt(event){
    let value = event.target.value;
    
    this.setState({ addr: value })

    setTimeout( () => {
      this.filterNumber();
    }, 300 )
  }

  filterNumber(){
    let renderOrders = this.state.orders;

    if( this.state.number.length > 0 ){
      renderOrders = renderOrders.filter( (item) => item.number.indexOf(this.state.number) !== -1 );
    }

    if( this.state.addr.length > 0 ){
      renderOrders = renderOrders.filter( (item) => (item.street + ' ' + item.home).toLowerCase() .indexOf(this.state.addr.toLowerCase()) !== -1 );
    }

    this.setState({
      ordersRender: renderOrders
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        { !this.state.showOrder ? null : 
          <Dialog
            open={this.state.modalDialog}
            onClose={ () => { this.setState({ modalDialog: false }) } }
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle style={{textAlign: 'center'}}>Заказ #{this.state.showOrder.order.order_id}</DialogTitle>
            <DialogContent>
              
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <span>{this.state.showOrder.order.type_order}: {this.state.showOrder.order.type_order_addr_new}</span>
                </Grid>
                { parseInt(this.state.showOrder.order.type_order_) == 1 ?
                  parseInt(this.state.showOrder.order.fake_dom) == 0 ?
                    <Grid item xs={12}>
                      <b style={{ color: 'red', fontWeight: 900 }}>Домофон не работает</b>
                    </Grid>
                      :
                    <Grid item xs={12}>
                      <b style={{ color: 'green', fontWeight: 900 }}>Домофон работает</b>
                    </Grid>
                    :
                  null
                }
                <Grid item xs={12}>
                  <span>{this.state.showOrder.order.time_order_name}: {this.state.showOrder.order.time_order}</span>
                </Grid>

                { this.state.showOrder.order.number.length > 1 ? 
                  <Grid item xs={12}>
                    <b>Телефон: </b> 
                    <span>{this.state.showOrder.order.number}</span> 
                  </Grid>
                    : 
                  null
                }

                { this.state.showOrder.order.delete_reason.length > 0 ? <Grid item xs={12}><span style={{ color: 'red' }}>Удален: {this.state.showOrder.order.date_time_delete}</span></Grid> : null}
                { this.state.showOrder.order.delete_reason.length > 0 ? <Grid item xs={12}><span style={{ color: 'red' }}>{this.state.showOrder.order.delete_reason}</span></Grid> : null}
                
                { parseInt(this.state.showOrder.order.is_preorder) == 1 ? null :
                  <Grid item xs={12}><span>{this.state.showOrder.order.text_time}{this.state.showOrder.order.time_to_client}</span></Grid>
                }
                
                <Grid item xs={12}><span>{this.state.showOrder.order.textTime}</span></Grid>
                
                
                { this.state.showOrder.order.promo_name == null || this.state.showOrder.order.promo_name.length == 0 ? null :
                  <>
                    <Grid item xs={12}>
                      <b>Промокод: </b>
                      <span>{this.state.showOrder.order.promo_name}</span>
                    </Grid>
                    <Grid item xs={12}>
                      <span className="noSpace">{this.state.showOrder.order.promo_text}</span>
                    </Grid>
                  </>
                }
                
                { this.state.showOrder.order.comment == null || this.state.showOrder.order.comment.length == 0 ? null :
                  <Grid item xs={12}>
                    <b>Комментарий: </b>
                    <span>{this.state.showOrder.order.comment}</span>
                  </Grid>
                }
                
                { this.state.showOrder.order.sdacha == null || parseInt(this.state.showOrder.order.sdacha) == 0 ? null :
                  <Grid item xs={12}>
                    <b>Сдача: </b>
                    <span>{this.state.showOrder.order.sdacha}</span>
                  </Grid>
                }
                
                <Grid item xs={12}>
                  <b>Сумма заказа: </b>
                  <span>{this.state.showOrder.order.sum_order} р</span>
                </Grid>

                { this.state.showOrder.order.check_pos_drive == null || !this.state.showOrder.order.check_pos_drive ? null :
                  <Grid item xs={12}>
                    <b>Довоз оформлен: </b>
                    <span>{this.state.showOrder.order.check_pos_drive.comment}</span>
                  </Grid>
                }

                <Grid item xs={12}>
                  <Table size={'small'} style={{ marginTop: 15 }}>
                    <TableBody>
                      { this.state.showOrder.order_items.map( (item, key) =>
                        <TableRow key={key}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.price} р</TableCell>
                        </TableRow>
                      ) }
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell style={{fontWeight: 'bold', color: '#000'}}>Сумма закза</TableCell>
                        <TableCell></TableCell>
                        <TableCell style={{fontWeight: 'bold', color: '#000'}}>{this.state.showOrder.order.sum_order} р</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </Grid>

                <Accordion style={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Расформировка</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size={'small'} style={{ marginTop: 15 }}>
                      <TableBody>
                        { this.state.showOrder.order_items_.map( (item, key) =>
                          <TableRow key={key}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell style={{ backgroundColor: parseInt(item.ready) > 0 ? '#6ab04c' : '#eb4d4b' }}></TableCell>
                          </TableRow>
                        ) }
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Grid>

            </DialogContent>

            { parseInt( this.state.showOrder.order.is_delete ) == 0 && parseInt( this.state.showOrder.order.status_order ) !== 6 ? 
              <DialogActions style={{ justifyContent: 'flex-end', padding: '15px 0px' }}>
                <ButtonGroup disableElevation={true} disableRipple={true} variant="contained" className="BtnBorderOther" style={{ marginRight: 24 }}>
                  <Button variant="contained" className="BtnCardMain CardInCardItem" onClick={ this.closeOrder.bind(this) }>Отменить заказ</Button>
                </ButtonGroup>
              </DialogActions>
                :
              null
            }

            { parseInt( this.state.showOrder.order.type_order_ ) == 1 && parseInt( this.state.showOrder.order.status_order ) > 4 && parseInt( this.state.showOrder.order.check_pos ) >= 0 ? 
              <DialogActions style={{ justifyContent: 'flex-end', padding: '15px 0px' }}>
                <ButtonGroup disableElevation={true} disableRipple={true} variant="contained" className="BtnBorderOther" style={{ marginRight: 24 }}>
                  <Button variant="contained" className="BtnCardMain CardInCardItemYellow" onClick={ this.fakeUser.bind(this) }>Клиент не вышел на связь</Button>
                </ButtonGroup>
              </DialogActions>
                :
              null
            }
          </Dialog>
        }

        { !this.state.showOrder ? null : 
          <Dialog
            open={this.state.modalDialogDel}
            onClose={ () => { this.setState({ modalDialogDel: false }) } }
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle style={{textAlign: 'center'}}>Отмена заказа {this.state.showOrder.order.order_id}</DialogTitle>
            <DialogContent>
              
              <FormControl component="fieldset">
                <RadioGroup name="typeDel" value={ this.state.typeDel } onChange={this.changeAddr} >
                  {this.state.radiogroup_options.map((item, key) => 
                    <FormControlLabel key={key} value={item.id} control={<Radio />} label={item.label} />
                  )}
                </RadioGroup>
              </FormControl>

              <TextField
                //autoFocus
                onFocus={ () => { this.setState({ typeDel: '4' }) } }
                value={ this.state.textDel }
                onChange={ this.changeText.bind(this) }
                margin="dense"
                id="name"
                label="Причина отмены"
                type="text"
                fullWidth
              />

            </DialogContent>

            <DialogActions style={{ paddingBottom: 24 }}>

              <ButtonGroup disableElevation={true} disableRipple={true} variant="contained" className="BtnBorderOther" style={{ marginRight: 24 }}>
                <Button variant="contained" className="BtnCardMain CardInCardItem" onClick={() => { this.setState({delOrder: false}) }}>К заказу</Button>
              </ButtonGroup>
              
              <ButtonGroup disableElevation={true} disableRipple={true} variant="contained" className="BtnBorderOther" style={{ marginRight: 24 }}>
                <Button variant="contained" className="BtnCardMain CardInCardItem" onClick={this.closeOrderTrue.bind(this)}>Отменить заказ</Button>
              </ButtonGroup>

            </DialogActions>
                
          </Dialog>
        }
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.cities} value={this.state.city_id} func={ this.changeCity.bind(this) } label='Город' />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label={'Дата'} value={this.state.date} func={ this.changeDate.bind(this) } />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyTextInput label={'Номер телефона'} value={this.state.number} func={ this.changeNumber.bind(this) } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyTextInput label={'Адрес'} value={this.state.addr} func={ this.changeAddrSt.bind(this) } />
          </Grid>

          
          
          
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.btnGetOrders.bind(this)}>Обновить</Button>
          </Grid>
          
          <Grid item xs={12}>
            <Tabs value={this.state.indexTab}>
              { this.state.need_point_list.map( (item, key) =>
                <Tab key={key} label={item.name} onClick={this.changePoint.bind(this, item.id, key)} {...a11yProps(parseInt(item.id))} />
              ) }
            </Tabs>
          </Grid>

          <Grid item xs={12}>
            
            <Table size={'small'}>
              <TableHead>
                <TableRow>
                  <TableCell>Заказ</TableCell>
                  <TableCell>Оформил</TableCell>
                  <TableCell>Номер клиента</TableCell>
                  <TableCell>Адрес доставки</TableCell>
                  <TableCell>Время открытия заказа</TableCell>
                  
                  <TableCell>Ко времени</TableCell>
                  <TableCell>Закрыт на кухне</TableCell>
                  <TableCell>Получен клиентом</TableCell>

                  <TableCell>До просрочки</TableCell>
                  <TableCell>Время обещ</TableCell>

                  <TableCell>Тип</TableCell>
                  <TableCell>Статус</TableCell>

                  <TableCell>Сумма</TableCell>
                  <TableCell>Оплата</TableCell>
                  <TableCell>Водитель</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                
                { this.state.ordersRender.map( (item, key) =>
                  <TableRow key={key} style={ parseInt(item.is_delete) == 1 ? {backgroundColor: 'red', color: '#fff', fontWeight: 'bold'} : {} }>
                    <TableCell style={ parseInt(item.dist) >= 0 ? {backgroundColor: 'yellow', color: '#000', cursor: 'pointer', fontWeight: 'inherit'} : {color: 'inherit', cursor: 'pointer', fontWeight: 'inherit'} } onClick={this.showOrder.bind(this, item.id)}>{item.id}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_user}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.number}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.street} {item.home}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.date_time_order}</TableCell>

                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit', backgroundColor: parseInt(item.is_preorder) == 1 ? '#bababa' : 'inherit' }}>{item.need_time}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{ item.give_data_time == '00:00:00' ? '' : item.give_data_time}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.close_order}</TableCell>

                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.to_time}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.unix_time_to_client == '0' || parseInt(item.is_preorder) == 1 ? '' : item.unix_time_to_client}</TableCell>

                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_order}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.status}</TableCell>

                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.order_price}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.type_pay}</TableCell>
                    <TableCell style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.driver}</TableCell>
                  </TableRow>
                ) }
              
              </TableBody>
            
            </Table>
            
          </Grid>
          
        </Grid>
      </>
    )
  }
}

export default function Concenter() {
  return <Concenter_ />;
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