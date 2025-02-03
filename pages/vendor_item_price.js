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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyAlert, MyTextInput, MyAutocomplite } from '@/ui/elements';

import { api } from '@/src/api_new';

class VendorItemPrice_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'vendor_item_price',
      module_name: '',
      is_load: false,
      
      modalDialog: false,
      modalDialogCity: false,

      vendors: [],
      vendor: null,
      
      items: [],
      
      cities: [],
      city: '',

      vendorCities: [],
      vendorCity: [],

      operAlert: false,
      err_status: true,
      err_text: '',
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      cities: data.cities
    })
    
    document.title = data.module_info.name;
  }
  
  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api(this.state.module, method, data)
      .then(result => result.data)
      .finally( () => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  }
   
  async changeCity(event){
    let data = {
      city: event.target.value
    }
    
    let res = await this.getData('get_vendors', data);
    
    this.setState({
      vendors: res.vendors,
      city: event.target.value,
      vendor: null,
      items: []
    })
  }
  
  async changeVendor(event, value){

    let data = {
      city: this.state.city,
      vendor_id: value.id,
    }
    
    let res = await this.getData('get_vendor_items', data);
    
    this.setState({
      items: res.items,
      vendor: value,
      vendorCities: res.vendor_cities,
      vendorCity: this.state.cities.filter( city => parseInt(city.id) == parseInt(this.state.city) )
    })
  }
  
  update(item_id, data, event){
    let this_items = this.state.items;
    
    this_items.map( (item, key) => {
      if( parseInt(item.item_id) == parseInt(item_id) ){
        this_items[key][data] = event.target.value;
        
        this_items[key]['price'] = (parseFloat(this_items[key]['full_price']) / parseFloat(this_items[key]['rec_pq'])).toFixed(2);
      }
    } )
    
    this.setState({
      items: this_items
    })
  }
  
  async save(){
    let data = {
      vendor_id: this.state.vendor.id,
      items: this.state.items,
      city_id: this.state.city,
      vendorCity: this.state.vendorCity
    }
    
    let res = await this.getData('save_price', data);
    
    this.setState({
      operAlert: true,
      err_status: res.st,
      err_text: res.text,
      modalDialogCity: res.st ? false : this.state.modalDialogCity
    })

  }

  chooseCity(event, data){
    this.setState({
      vendorCity: data
    })
  }

  openSave(){
    if( this.state.vendorCities.length > 1 ){
      this.setState({ modalDialogCity: true });
    }else{
      this.save();
    }
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <MyAlert isOpen={this.state.operAlert} onClose={() => { this.setState({ operAlert: false }); }} status={this.state.err_status} text={this.state.err_text} />

        <Dialog
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title"></DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
          open={this.state.modalDialogCity}
          onClose={() => { this.setState({ modalDialogCity: false }); }}
          fullWidth={true}
          maxWidth={'xs'}
        >
          <DialogTitle>Где применить</DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid item xs={12} sm={4}>
              <MyAutocomplite
                label="Города"
                multiple={true}
                data={this.state.vendorCities}
                value={this.state.vendorCity}
                func={this.chooseCity.bind(this)}
              />
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.cities} value={this.state.city} func={ this.changeCity.bind(this) } is_none={false} label='Город' />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyAutocomplite data={this.state.vendors} value={this.state.vendor} func={ this.changeVendor.bind(this) } multiple={false} label='Поставщик' />
          </Grid>
          
          
          <Grid item xs={12}>
            <Button onClick={ () => { this.setState({ modalDialogCity: true }) } } variant="contained">Сохранить</Button>
          </Grid>
          
          
          <Grid item xs={12}>
              
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Позиция</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Комментарий</TableCell>
                    <TableCell>Цена за упаковку</TableCell>
                    <TableCell>Объем упаковки</TableCell>
                    <TableCell>Цена за 1 ед.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { this.state.items.map( (item, key) => 
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.name_for_vendor}</TableCell>
                      <TableCell>
                        <MyTextInput label="" value={item.comment} func={ this.update.bind(this, item.item_id, 'comment') } multiline={true} maxRows={5} />
                      </TableCell>
                      <TableCell>
                        <MyTextInput label="" value={item.full_price} func={ this.update.bind(this, item.item_id, 'full_price') } />
                      </TableCell>
                      <TableCell>
                        <MySelect data={item.pqs} value={ item.rec_pq == 0 || item.rec_pq == '0' ? '' : item.rec_pq } func={ this.update.bind(this, item.item_id, 'rec_pq') } label='' />
                      </TableCell>
                      <TableCell>{item.price} / {item.ei_name}</TableCell>
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

export default function VendorItemPrice() {
  return (
    <VendorItemPrice_ />
  );
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
