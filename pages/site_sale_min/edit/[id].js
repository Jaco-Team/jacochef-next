import React from 'react';

import { useRouter } from 'next/router'

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyTimePicker, MyTextInput, MyDatePickerNew, formatDate } from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

function formatDateDot(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('.');
}

function formatDateName(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  //if (month.length < 2) 
  //    month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  let m = '';    
      
  switch(parseInt(month)){
		case 1:{
			m = 'Января';
			break;}
		case 2:{
			m = 'Февраля';
			break;}
		case 3:{
			m = 'Марта';
			break;}
		case 4:{
			m = 'Апреля';
			break;}
		case 5:{
			m = 'Мая';
			break;}
		case 6:{
			m = 'Июня';
			break;}	
		case 7:{
			m = 'Июля';
			break;}
		case 8:{
			m = 'Августа';
			break;}
		case 9:{
			m = 'Сентября';
			break;}
		case 10:{
			m = 'Октября';
			break;}
		case 11:{
			m = 'Ноября';
			break;}
		case 12:{
			m = 'Декабря';
			break;}	
	}    
      
  return [day, m].join(' ');
}

class SiteSaleMin_edit_ extends React.Component {
  click = false;
  
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'site_sale_min',
      module_name: '',
      is_load: false,
      modalText: '',
      
      points: [],
      point: 0,
      cities: [],
      city: 0,
      
      modalDialog: false,
      modalLink: '',
      
      where_promo_list: [
        {id: 1, name: 'Создать'},
        {id: 2, name: 'Создать и показать'},
        {id: 3, name: 'Отправить на почту'},
        {id: 4, name: 'Отправить в смс'},
        {id: 5, name: 'Рассылка смс'},
        {id: 6, name: 'Отправить в ЛК (через 8)'},
        {id: 7, name: 'Создать сертификат(ы)'},
      ],
      promo_action_list: [],
      sale_list: [
        {id: 1, name: 'На товары'},
        {id: 2, name: 'На категории'},
        {id: 3, name: 'На все меню (кроме допов и закусок)'},
      ],
      promo_conditions_list: [
        {id: 1, name: 'В корзине есть определенные товар(ы)'},
        {id: 2, name: 'В корзине набрана определенная сумма'},
      ],
      promo_sale_list: [],
      type_sale_list: [
        {id: 1, name: 'В рублях'},
        {id: 2, name: 'В процентах'},
      ],
      date_promo_list: [
        {id: 1, name: 'В определенные даты'},
        {id: 2, name: '14 дней с 10:00 до 21:40'},
        {id: 3, name: '14 дней с 00:00 до 23:59'},
        {id: 4, name: '30 дней с 10:00 до 21:40'},
        {id: 5, name: '30 дней с 00:00 до 23:59'},
      ],
      type_order_list: [
        {id: 1, name: 'Все'},
        {id: 2, name: 'Доставка'},
        {id: 3, name: 'Самовывоз'},
        {id: 4, name: 'Зал'},
      ],
      where_order_list: [
        {id: 1, name: 'В городе'},
        {id: 2, name: 'На точке'}
      ],
      
      auto_text: false,
      where_promo: 1,
      promo_name: '',
      generate_new: false,
      count_action: 1,
      promo_action: 1,
      type_sale: 3,
      promo_sale: 1,
      sale_type: 2,
      promo_conditions: 2,
      
      price_start: 0,
      price_end: 0,
      date_promo: 1,
      
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rangeDate: [formatDate(new Date()), formatDate(new Date())],
      time_start: '10:00',
      time_end: '21:30',
      
      promo_length: 5,
      promo_count: 1,
      
      day_1: true,
      day_2: true,
      day_3: true,
      day_4: true,
      day_5: true,
      day_6: true,
      day_7: true,
      
      type_order: 1,
      where_order: 1,
      
      numberList: '',
      promo_desc_true: '',
      promo_desc_false: '',
      textSMS: '',
      
      
      addItem: 1,
      addItemCount: 1,
      addItemPrice: 1,
      addItemAllPrice: 0,
      
      itemsAdd: [],
      itemsAddPrice: [],
      items: [],
      cats: [],
      saleCat: [],
      saleItem: [],
      
      priceItem: 1,
      
      conditionItems: [],
      
      testDate: []
    };
  }
  
  async componentDidMount(){
    
    let data = {
      promo_id: this.props.promoId
    }
    
    let res = await this.getData('get_all_for_edit', data);
    
    let items = [];
    
    if( res.promo.promo_conditions_items.length > 4 ){
      res.promo.promo_conditions_items = JSON.parse(res.promo.promo_conditions_items, true);
      
      res.promo.promo_conditions_items.map( (item) => {
        let findItem = res.items.find( (it) => parseInt(it.id) == parseInt(item) );
        
        items.push(findItem)
      } )
    }
    
    setTimeout( () => {
      
      console.log( 'conditionItems', items )
      console.log( 'items', res.items )
      
      let limDate = [];
      
      res.limit.map( (item) => {
        limDate.push( new Date(item.date) )
      } )
      
      this.setState({
        points: res.points,
        cities: res.cities,
        module_name: res.module_info.name,
        promo_action_list: res.promo_action_list,
        promo_sale_list: res.promo_sale_list,
        
        date_start: dayjs(res.promo.date1),
        date_end: dayjs(res.promo.date2),
        time_start: res.promo.time1,
        time_end: res.promo.time2,
        rangeDate: [res.promo.date1, res.promo.date2],
        
        items: res.items,
        cats: res.cats,
        
        day_1: parseInt(res.promo.d1) == 1 ? true : false,
        day_2: parseInt(res.promo.d2) == 1 ? true : false,
        day_3: parseInt(res.promo.d3) == 1 ? true : false,
        day_4: parseInt(res.promo.d4) == 1 ? true : false,
        day_5: parseInt(res.promo.d5) == 1 ? true : false,
        day_6: parseInt(res.promo.d6) == 1 ? true : false,
        day_7: parseInt(res.promo.d7) == 1 ? true : false,
        
        count_action: res.promo.count,
        promo_name: res.promo.name,
        
        price_start: res.promo.promo_summ,
        price_end: res.promo.promo_summ_to,
        
        conditionItems: items,
        promo_conditions: items.length > 0 ? 1 : 2,
        
        point: res.promo.point_id,
        city: res.promo.city_id,
        
        where_order: parseInt(res.promo.city_id) > 0 ? 1 : parseInt(res.promo.point_id) > 0 ? 2 : 1,
        
        type_order: res.promo.type_order,
        
        promo_desc_true: res.promo.coment,
        promo_desc_false: res.promo.condition_text,
        
        promo_id: res.promo.id,
        
        testDate: limDate
      })
    }, 300 )
    
    
    document.title = res.module_info.name;
    
    setTimeout( () => {
      this.generateTextDescFalse();     
      this.generateTextDescTrue(); 
    }, 300 )
  }
  
  async save(){
    
    if( !this.click ){
      this.click = true;  
      
      let conditionItems = [];
      
      this.state.conditionItems.map( (item) => {
        conditionItems.push(item.id)
      } )
      
      
      let promo_items = [];
      
      
      let promo_cat = [];
      let dateList = [];
      
      this.state.testDate.map( (item) => {
        dateList.push( (new Date(item).toISOString()).split('T')[0] );
      } )
      
      dateList = dateList.join(',')
      
      let data = {
        promo_id: this.state.promo_id,
        cert_text: this.state.cert_text,
        addr: this.state.numberList,
        where_promo: this.state.where_promo,
        promo_count: this.state.promo_count,
        promo_len: this.state.promo_length,
        promo_name: this.state.promo_name,
        generate: this.state.generate_new ? 1 : 0,
        promo_in_count: this.state.count_action,
        promo_action: this.state.promo_action,
        promo_type_sale: this.state.type_sale,
        promo_type: this.state.sale_type,
        promo_conditions: this.state.promo_conditions,
        
        promo_summ: this.state.price_start,
        promo_summ_to: this.state.price_end,
        promo_when: this.state.date_promo,
        
        date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
        date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
        time_start: this.state.time_start,
        time_end: this.state.time_end,
        
        day_1: this.state.day_1 ? 1 : 0,
        day_2: this.state.day_2 ? 1 : 0,
        day_3: this.state.day_3 ? 1 : 0,
        day_4: this.state.day_4 ? 1 : 0,
        day_5: this.state.day_5 ? 1 : 0,
        day_6: this.state.day_6 ? 1 : 0,
        day_7: this.state.day_7 ? 1 : 0,
        
        promo_type_order: this.state.type_order,
        promo_where: this.state.where_order,
        
        numberList: this.state.numberList,
        
        promo_city: this.state.city,
        promo_point: this.state.point,
        
        about_promo_text: this.state.promo_desc_true,
        condition_promo_text: this.state.promo_desc_false,
        textSMS: this.state.textSMS,
        
        
        promo_items: JSON.stringify(promo_items),
        promo_cat: JSON.stringify(promo_cat),
        promo_items_add: JSON.stringify(this.state.itemsAdd),
        promo_items_sale: JSON.stringify(this.state.itemsAddPrice),
        promo_conditions_items: JSON.stringify(conditionItems),
        
        date_between: dateList
      };
      
      let res = await this.getData('save_edit_promo', data);
      
      console.log( res )
      
      this.setState({
        modalDialog: true,
        modalText: res.text
      })
      
      setTimeout( () => {
        this.click = false;    
      }, 300 )
    }
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
        
        this.click = false;    
      }, 300 )
    });
  }
  
  changeData(type, event){
    this.setState({
      [ type ]: event.target.value
    })
    
    if( type == 'date_promo' && (event.target.value == 2 || event.target.value == 3) ){
      let thisDay = new Date();
      let nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 14);
      
      this.setState({
        rangeDate: [formatDate(thisDay), formatDate(nextDay)],
        date_start: formatDate(thisDay),
        date_end: formatDate(nextDay),
        
        time_start: event.target.value == 2 ? '10:00' : '00:00',
        time_end: event.target.value == 2 ? '21:40' : '23:59',
      })
    }

    if( type == 'date_promo' && (event.target.value == 4 || event.target.value == 5) ){
      let thisDay = new Date();
      let nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 30);
      
      this.setState({
        rangeDate: [formatDate(thisDay), formatDate(nextDay)],
        date_start: formatDate(thisDay),
        date_end: formatDate(nextDay),
        
        time_start: event.target.value == 4 ? '10:00' : '00:00',
        time_end: event.target.value == 4 ? '21:40' : '23:59',
      })
    }
    
    setTimeout( () => {
      this.generateTextDescFalse();   
      this.generateTextDescTrue();   
    }, 300 )
  }
  
  changeDataCheck(type, event){
    this.setState({
      [ type ]: event.target.checked
    })
    
    setTimeout( () => {
      this.generateTextDescFalse();    
      this.generateTextDescTrue();  
    }, 300 )
  }
  
  changeDateRange(data, event){
    this.setState({
      [data]: formatDate(event)
    })
    
    setTimeout( () => {
      this.generateTextDescFalse();  
      this.generateTextDescTrue();    
    }, 300 )
  }
  
  changeDataData(type, data){
    this.setState({
      [ type ]: data
    });
    
    setTimeout( () => {
      this.generateTextDescFalse();  
      this.generateTextDescTrue();    
    }, 300 )
  }
  
  generateTextDescTrue(){
    
    if( !this.state.auto_text ){
      return ;
    }
    
    let promo_action = this.state.promo_action;
    let textTrue = '';
    
    if(parseInt(promo_action) == 1){//скидка
      var promo_type_sale = this.state.type_sale,
        count_promo = this.state.promo_sale_list.find( (item) => parseInt(item.id) == parseInt(this.state.promo_sale) )['name'],//размер скидки
        promo_type = this.state.sale_type; //1 - рубли 2 %

      if(parseInt(promo_type_sale) == 1){//товары
        var promo_items = this.state.saleItem,
          items = '';

        promo_items.map(function(item, key){
          items += item.name+', ';
        })

        items = items.substring(0, items.length - 2);

        textTrue = 'скидку на '+items+' в размере '+count_promo+(parseInt(promo_type) == 1 ? 'руб.' : '%');
      }	
      if(parseInt(promo_type_sale) == 2){//категории
        var promo_items = this.state.saleCat,
          items = '';

        promo_items.map(function(item, key){
          items += item.name+', ';
        })

        items = items.substring(0, items.length - 2);

        textTrue = 'скидку на '+items+' в размере '+count_promo+(parseInt(promo_type) == 1 ? 'руб.' : '%');
      }
      if(parseInt(promo_type_sale) == 3){//все
        textTrue = 'скидку на всё меню, кроме напитков, соусов, приправ и палочек, в размере '+count_promo+(parseInt(promo_type) == 1 ? 'руб.' : '%');
      }
    }
    
    if(parseInt(promo_action) == 2){//добавляет товар
      var itemText = '';

      this.state.itemsAdd.map( (item, key) => {
        if(parseInt(item['price']) == 0){
          itemText += 'бесплатную '+item['name']+' '+item['count']+'шт. '+'за '+item['price']+'руб., ';
        }else{
          itemText += item['name']+' '+item['count']+'шт. '+'за '+item['price']+'руб., ';
        }
      } )
      
      itemText = itemText.substring(0, item.length - 2);

      textTrue = this.state.itemsAdd.length == 1 ? 'позицию '+itemText : 'позиции '+itemText;
    }	
    
    if(parseInt(promo_action) == 3){//товар за цену
      var itemText = '';

      this.state.promo_items_sale.map( (item, key) => {
        itemText += item['name']+' по '+item['price']+'руб., ';
      } )
      
      itemText = itemText.substring(0, itemText.length - 2);

      textTrue = this.state.promo_items_sale.length-1 == 1 ? 'позицию '+itemText : 'позиции '+itemText;
    }
    
    let textSMS = 'Промокод --promo_name--, действует до '+formatDateName(this.state.date_end)+'. Заказывай на jacofood.ru!'
    
    this.setState({
      promo_desc_true: textTrue,
      textSMS: textSMS,
      cert_text: textTrue
    })
  }
  
  generateTextDescFalse(){
    
    if( !this.state.auto_text ){
      return ;
    }
    
    var dop_text = '';
		
		if( parseInt(this.state.where_order) == 1 ){
			//город
			if( parseInt(this.state.city) != 0 ){
        let city_name = this.state.cities.find( (item) => parseInt(item.id) == parseInt(this.state.city) )['name'];
        
				dop_text = ' в г. '+city_name;
			}
		}
		
		if( parseInt(this.state.where_order) == 2 ){
			//точка
			if( parseInt(this.state.point) != 0 ){
        let point_name = this.state.points.find( (item) => parseInt(item.id) == parseInt(this.state.point) )['name'];
        
				dop_text = ' в г. '+point_name;
			}
		}
    
    let dateStart = formatDateDot(this.state.date_start);
    let dateEnd = formatDateDot(this.state.date_end);
    
    let textFalse = 'Промокод действует c '+dateStart+' до '+dateEnd+' с '+this.state.time_start+' до '+this.state.time_end+dop_text;
    
    this.setState({
      promo_desc_false: textFalse
    })
	}
  
  addItemAdd(){
    let thisItems = this.state.itemsAdd;
    
    let check = thisItems.find( (item) => parseInt(item.item_id) == parseInt(this.state.addItem) );
    
    if( !check ){
      let thisItem = this.state.items.find( (item) => parseInt(item.id) == parseInt(this.state.addItem) );
      
      thisItems.push({
        item_id: this.state.addItem,
        name: thisItem.name,
        count: this.state.addItemCount,
        price: this.state.addItemPrice,
      })
      
      let addItemAllPrice = 0;
      
      thisItems.map( (item) => {
        addItemAllPrice += parseInt(item.price)
      } )
      
      this.setState({
        itemsAdd: thisItems,
        addItemAllPrice: addItemAllPrice
      })
    }
  }
  
  priceItemAdd(){
    let thisItems = this.state.itemsAddPrice;
    
    let check = thisItems.find( (item) => parseInt(item.item_id) == parseInt(this.state.priceItem) );
    
    if( !check ){
      let thisItem = this.state.items.find( (item) => parseInt(item.id) == parseInt(this.state.priceItem) );
      
      thisItems.push({
        id: this.state.priceItem,
        name: thisItem.name,
        price: this.state.addItemCount,
      })
      
      this.setState({
        itemsAddPrice: thisItems
      })
    }
  }
  
  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
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
          <Grid item xs={12} sm={12}>
            <h1>Редактирование промокода</h1>
          </Grid>
          
          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>
            
            <Grid item xs={12} sm={3}>
              <Typography>Промокод: {this.state.promo_name}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <MyTextInput value={this.state.count_action} func={ this.changeData.bind(this, 'count_action') } label='Количество активаций' />
            </Grid>
            
          </Grid>
          
          <Divider style={{ width: '100%', marginTop: 20 }} />
          
          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>
            
            <Grid item xs={12} sm={6}>
              <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
            </Grid>
           
            <Grid item xs={12} sm={6}>
              <MyTimePicker label="Время от" value={this.state.time_start} func={ this.changeData.bind(this, 'time_start') } />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <MyTimePicker label="Время до" value={this.state.time_end} func={ this.changeData.bind(this, 'time_end') } />
            </Grid>
              
          </Grid>

          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20 }} spacing={3}>
            
              <Grid item xs={12} sm={4}>
                <MySelect data={this.state.cities} value={this.state.city} func={ this.changeData.bind(this, 'city') } label='Город' />
              </Grid>
            
              <Grid item xs={12} sm={4}>
                <MySelect data={this.state.points} value={this.state.point} func={ this.changeData.bind(this, 'point') } label='Точка' />
              </Grid>
            
          </Grid>

          <Grid container direction="row" justifyContent="end" style={{ paddingTop: 50 }} spacing={3}>
            <Button variant="contained" onClick={this.save.bind(this)}>Сохранить</Button>
          </Grid>
          
        </Grid>
      </>
    )
  }
}

export default function SiteSaleMin_Edit () {
  const router = useRouter()
  
  return (
    <SiteSaleMin_edit_ promoId={router.query.id} />
  );
}
