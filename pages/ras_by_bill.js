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

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyAutocomplite, MyDatePickerNew, formatDate } from '@/ui/elements';
import Typography from '@mui/material/Typography';

import queryString from 'query-string';

import dayjs from 'dayjs';

class RasByBill_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'ras_by_bill',
      module_name: '',
      is_load: false,
      
      modalDialog: false,
      
      points: [],
      point: [],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rangeDate: [formatDate(new Date()), formatDate(new Date())],
      items: [],
      cats: [],
      items_cat: [],
      item_cat: 0,
      
      myItems: [],
      
      calendar: []
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      points: data.points,
      
      items: data.items,
      cats: data.cats,
      items_cat: data.items_cat
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
   
  changePoint(event){
    let data = event.target.value;
    
    this.setState({
      point: data
    })
  }
  
  changeItems(event, data){
    this.setState({
      myItems: data
    })
  }
  
  async getItems(){
    let data = {
      points: this.state.point,
      items: this.state.myItems,
      item_cat: this.state.item_cat,
      start_date  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      end_date    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('get_this_rev', data);
    
    let summ = 0;
    
    res.items_ras.map( (item, key) => {
      summ += parseFloat(item.sum);
    } )
    
    this.setState({
      resItems: {
        items_ras: res.items_ras,
        pf_ras: res.pf_ras,
        rec_ras: res.rec_ras,
        full_sum: summ.toFixed(2)
      },
      catItems: null
    })
  }
  
  async getCats(){
    let data = {
      points: this.state.point,
      items: this.state.myItems,
      start_date  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      end_date    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('get_this_rev_cat', data);
    
    
    let summ = 0;
    
    res.rec_ras.map( (item, key) => {
      summ += parseFloat(item.this_price);
    } )
    
    this.setState({
      catItems: {
        count_pos: res.count_pos,
        items_ras: res.items_ras,
        rec_ras: res.rec_ras,
        full_sum: summ.toFixed(2)
      },
      resItems: null
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
        
        <Dialog
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">  </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              
              
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => {} } color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.points} multiple={true} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата до" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.items_cat} multiple={false} value={this.state.item_cat} func={ (event) => {this.setState({ item_cat: event.target.value })} } label='Категория товара' />
          </Grid>
          

          <Grid item xs={12} sm={12}>
            <MyAutocomplite data={this.state.items} multiple={true} value={this.state.myItems} func={ this.changeItems.bind(this) } label='Заготовки' />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.getItems.bind(this)}>Показать заготовки</Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.getCats.bind(this)}>Показать категории</Button>
          </Grid>
        
        
          { this.state.resItems && this.state.resItems.items_ras ?
              
            <>
              <Grid item xs={12}>
                
                <h1>Куплено по наклданым</h1>
                <TableContainer component={Paper}>
                  <Table aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Наименование товара</TableCell>
                        <TableCell>Объем товра</TableCell>
                        <TableCell>Объем заготовки</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Кол-во наклданых</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      
                      { this.state.resItems.items_ras.map( (item, key) =>
                        <TableRow key={key}>
                          <TableCell> { item.name } </TableCell>
                          <TableCell> { item.count_item + ' ' + item.ei_name } </TableCell>
                          <TableCell> { item.count_pf + ' ' + item.ei_name_pf } </TableCell>
                          <TableCell> { item.sum } </TableCell>
                          <TableCell> { item.count_bill } </TableCell>
                        </TableRow>
                      ) }
                      
                      <TableRow>
                        <TableCell> Всего: </TableCell>
                        <TableCell> </TableCell>
                        <TableCell> </TableCell>
                        <TableCell> { this.state.resItems.full_sum } </TableCell>
                        <TableCell> </TableCell>
                      </TableRow>
                      
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                
                <h1>Расход заготовок (включая рецепты)</h1>
                <TableContainer component={Paper}>
                  <Table aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Наименование заготовки</TableCell>
                        <TableCell>Объем заготовок</TableCell>
                        <TableCell>Кол-во роллов</TableCell>
                        <TableCell>Сумма роллов (примерно)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      
                      { this.state.resItems.pf_ras.map( (item, key) =>
                        <TableRow key={key}>
                          <TableCell> { item.pf_name } </TableCell>
                          <TableCell> { item.count_pf + ' ' + item.ei_name } </TableCell>
                          <TableCell> { item.count_rolls } </TableCell>
                          <TableCell> { item.price_rolls } </TableCell>
                        </TableRow>
                      ) }
                      
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12}>
                
                <h1>Расход рецептов</h1>
                <TableContainer component={Paper}>
                  <Table aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Наименование заготовки</TableCell>
                        <TableCell>Объем заготовок</TableCell>
                        <TableCell>Кол-во роллов</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      
                      { this.state.resItems.rec_ras.map( (item, key) =>
                        <TableRow key={key}>
                          <TableCell> { item.pf_name } </TableCell>
                          <TableCell> { item.count_pf + ' ' + item.ei_name } </TableCell>
                          <TableCell> { item.count_rolls } </TableCell>
                        </TableRow>
                      ) }
                      
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </>
              :
            null              
          }
          
          { this.state.catItems && this.state.catItems.rec_ras ?
            <Grid item xs={12} style={{ marginBottom: '40px'}}>
              
              <Accordion disabled style={{ backgroundColor: '#fff', opacity: 1 }}>
                <AccordionSummary>
                  <Typography style={{ width: '50%' }}>Роллов: {this.state.catItems.count_pos.count_rolls}</Typography>
                  <Typography style={{ width: '50%' }}>Пиццы: {this.state.catItems.count_pos.count_pizza}</Typography>
                </AccordionSummary>
              </Accordion>
              
              { this.state.catItems.rec_ras.map( (item, key) =>
                <Accordion key={key}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                  >
                    <Typography style={{ width: '60%' }}>{item.name}</Typography>
                    <Typography style={{ width: '20%' }}>{item.this_price}</Typography>
                    <Typography style={{ width: '20%' }}>{item.price_by_items}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    
                    { item.parent_cat.map( (it, k) =>
                      <Accordion key={k}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1bh-content"
                        >
                          <Typography style={{ width: '60%', paddingLeft: 20 }}>{it.name}</Typography>
                          <Typography style={{ width: '20%', paddingLeft: 20 }}>{it.this_price}</Typography>
                          <Typography style={{ width: '20%', paddingLeft: 20 }}>{it.price_by_items}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          
                          <Accordion disabled style={{ backgroundColor: '#fff', opacity: 1 }}>
                            <AccordionSummary>
                              <Typography style={{ width: '20%', paddingLeft: 40 }}>Товар</Typography>
                              <Typography style={{ width: '20%', paddingLeft: 40 }}>Товара</Typography>
                              <Typography style={{ width: '20%', paddingLeft: 40 }}>Заготовок</Typography>
                              <Typography style={{ width: '20%', paddingLeft: 40 }}>Накладных</Typography>
                              <Typography style={{ width: '20%', paddingLeft: 40 }}>Сумма</Typography>
                            </AccordionSummary>
                          </Accordion>
                          
                          { it.items.map( (parent_items, parent_key) =>
                            <Accordion key={parent_key} disabled style={{ backgroundColor: '#fff', opacity: 1 }}>
                              <AccordionSummary>
                                <Typography style={{ width: '20%', paddingLeft: 40 }}>{parent_items.name}</Typography>
                                <Typography style={{ width: '20%', paddingLeft: 40 }}>{parent_items.count_item} {parent_items.ei_name}</Typography>
                                <Typography style={{ width: '20%', paddingLeft: 40 }}>{parent_items.count_pf} {parent_items.ei_name}</Typography>
                                <Typography style={{ width: '20%', paddingLeft: 40 }}>{parent_items.count_bill}</Typography>
                                <Typography style={{ width: '20%', paddingLeft: 40 }}>{parent_items.sum}</Typography>
                              </AccordionSummary>
                            </Accordion>
                          ) }
                          
                        </AccordionDetails>
                      </Accordion>
                    ) }
                    
                    
                  </AccordionDetails>
                </Accordion>
              ) }
              
              <Accordion disabled style={{ backgroundColor: '#fff', opacity: 1 }}>
                <AccordionSummary>
                  <Typography style={{ width: '60%', marginRight: -15 }}>Всего:</Typography>
                  <Typography style={{ width: '40%' }}>{ this.state.catItems.full_sum }</Typography>
                </AccordionSummary>
              </Accordion>
              
            </Grid>
              :
            null              
          }
          
        </Grid>
      </>
    )
  }
}

export default function RasByBill() {
  return <RasByBill_ />;
}
