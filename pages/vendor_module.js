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

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import Divider from '@mui/material/Divider';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyCheckBox, MyAutocomplite, MyTextInput } from '@/ui/elements';
import Typography from '@mui/material/Typography';

import queryString from 'query-string';
import {api_laravel} from "@/src/api_new";

class VendorModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'vendor_module',
      module_name: '',
      is_load: false,

      modalItems: false,
      modalVendor: false,
      modalVendorNew: false,

      vendors: [],

      allItems: [],
      vendor_items: [],
      mails: [],
      openVendor: null,
      customAdd: 0,

      vendorCities: [],
      allCities: [],
      all_points: [],
      need_points: [],

      mailPoint: null,
      mailMail: '',
      mailComment: '',

      nds: [
        { id: -1, name: 'Без НДС' },
        { id: 10, name: '10% НДС' },
        { id: 20, name: '20% НДС' },
      ],
      nds_: [
        -1, 10, 20
      ],

      cities: [],
      city: ''
    };
  }

  async componentDidMount(){

    let data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      vendors: data.vendors,
      cities: data.cities,
      city: data.cities[0].id,
    })

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => method === 'get_vendors' ? result : result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  changeNDS(item_id, event){
    this.state.vendor_items.map( (item, key) => {
      if( parseInt(item.item_id) == parseInt(item_id) ){
        item.nds = event.target.value;
      }
    } )

    this.setState({
      vendor_items: this.state.vendor_items
    })
  }

  async openModalItems(vendor){
    let data = {
      vendor_id: vendor.id
    }

    let res = await this.getData('get_vendor_items', data);

    this.setState({
      modalItems: true,
      allItems: res.all_items,
      vendor_items: res.vendor_items,
      openVendor: vendor
    })
  }

  async openModalVendor(vendor){
    let data = {
      vendor_id: vendor.id
    }

    let res = await this.getData('get_vendor_info', data);

    this.setState({
      modalVendor: true,
      openVendor: res.vendor,
      vendorCities: res.vendor_cities,
      allCities: res.all_cities,
      mails: res.mails,
      all_points: res.all_points
    })

    setTimeout( () => {
      this.changeCityPoint();
    }, 300 )
  }

  changeCityPoint(){
    const { vendorCities, all_points, mails } = this.state;

    let need_points = [];
    let newMails = [];

    vendorCities.map( city => {
      all_points.map( point => {
        if( parseInt(point.city_id) == parseInt(city.id) ){
          need_points.push(point)
        }
      } )

      mails.map( mail => {
        if( parseInt(mail.point_id.city_id) == parseInt(city.id) ){
          newMails.push(mail)
        }
      } )
    } )

    if( need_points.length > 0 ){
      need_points.unshift(all_points[0]);

      mails.map( mail => {
        if( parseInt(mail.point_id.city_id) == -1 ){
          newMails.unshift(mail)
        }
      } )
    }

    need_points = need_points.sort(function (a, b) {
      if (a.id > b.id) {
        return 1;
      }
      if (a.id < b.id) {
        return -1;
      }

      return 0;
    });

    this.setState({
      need_points: need_points,
      mails: newMails
    })
  }

  async openModalVendorNew(){
    let data = {
      vendor_id: 0
    }

    let res = await this.getData('get_vendor_info', data);

    this.setState({
      modalVendorNew: true,
      openVendor: {
        addr: "",
        bill_ex: "0",
        email: "",
        email_2: "",
        inn: "",
        min_price: "",
        name: "",
        need_img_bill_ex: "0",
        ogrn: "",
        phone: "",
        text: "",
      },
      vendorCities: [],
      mails: [],
      all_points: res.all_points,
      allCities: res.all_cities,
    })
  }

  async saveVendorItems(){
    let data = {
      vendor_id: this.state.openVendor.id,
      items: this.state.vendor_items
    }

    let check = data.items.filter( (item, key) => !this.state.nds_.includes( parseInt(item.nds) ) );

    if( check.length > 0 ){
      alert('У одной или нескольких позиций не заполнен НДС')

      return ;
    }

    let res = await this.getData('save_vendor_items', data);

    this.setState({
      modalItems: false,
      vendor_items: [],
      openVendor: null
    })
  }

  async saveVendor(){
    let data = {
      vendor: this.state.openVendor,
      vendor_cities: this.state.vendorCities,
      city: this.state.city,
      mails: this.state.mails
    }

    let res = await this.getData('update_vendor', data);

    this.setState({
      modalVendor: false,
      openVendor: null,
      vendorCities: [],
      allCities: [],
      vendors: res.vendors
    })
  }

  async addVendor(){
    let data = {
      vendor: this.state.openVendor,
      vendor_cities: this.state.vendorCities,
      city: this.state.city,
      mails: this.state.mails
    }

    let res = await this.getData('new_vendor', data);

    if( res.st === false ){
      alert(res.text);
      return ;
    }

    this.setState({
      modalVendorNew: false,
      openVendor: null,
      vendorCities: [],
      allCities: [],
      vendors: res.vendors
    })
  }

  delItem(item_id){
    let items = this.state.vendor_items;

    items = items.filter( (item) => parseInt(item.item_id) != parseInt(item_id) );

    this.setState({
      vendor_items: items
    })
  }

  addItem(item){
    let this_items = this.state.vendor_items;
    let check = this_items.find( (it) => parseInt(it.item_id) == parseInt(item.id) );

    if( !check ){
      this_items.push({
        item_id: item.id,
        item_name: item.name,
        nds: -2
      })
    }

    this.setState({
      vendor_items: this_items
    })
  }

  addItemCustom(){

    let item = this.state.allItems.find( (item1) => parseInt(item1.id) == parseInt(this.state.customAdd.id) );

    this.addItem(item);
  }

  testChange(data, event){
    let vendor = this.state.openVendor;

    if( data == 'bill_ex' || data == 'need_img_bill_ex' || data == 'is_show' || data == 'is_priority' ){
      vendor[data] = event.target.checked === true ? 1 : 0;
    }else{
      vendor[data] = event.target.value;
    }

    this.setState({
      openVendor: vendor
    })
  }

  async changeCity(event){
    let data = {
      city: event.target.value
    }

    let res = await this.getData('get_vendors', data);

    this.setState({
      vendors: res,
      city: event.target.value
    })
  }

  changeMail(type, key, event, data){
    let thisMails = [...this.state.mails];

    thisMails[key][ [type] ] = data ? data : event.target.value || event.target.value == '' ? event.target.value : null;

    this.setState({
      mails: thisMails
    })
  }

  changeMailNew(type, key, event, data){
    this.setState({
      [type]: data ? data : event.target.value
    })
  }

  checkAddMail(){
    if( this.state.mailMail.length > 0 && this.state.mailPoint !== null && this.state.mailComment.length > 0 ){
      let thisMails = [...this.state.mails];

      thisMails.push({
        point_id: this.state.mailPoint,
        mail: this.state.mailMail,
        comment: this.state.mailComment
      })

      this.setState({
        mails: thisMails,
        mailMail: '',
        mailPoint: null,
        mailComment: ''
      })
    }
  }

  delMail(mailKey){
    let thisMails = [...this.state.mails];

    thisMails = thisMails.filter( (item, key) => parseInt(key) != parseInt(mailKey) )

    this.setState({
      mails: thisMails,
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          open={this.state.modalItems}
          fullWidth={true}
          maxWidth={'md'}
          onClose={ () => { this.setState({ modalItems: false,  customAdd: 0 }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Товары поставщика {this.state.openVendor ? this.state.openVendor.name : ''}</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

            <Grid container style={{ paddingTop: 20 }}>

              <Grid item xs={12} sm={5} style={{ paddingRight: 10 }}>

                <Table>
                  <TableBody>
                    <TableRow style={{ height: 75 }}>
                      <TableCell>
                         <MyAutocomplite
                        multiple={false}
                        data={this.state.allItems}
                        value={this.state.customAdd === 0 ? null : this.state.customAdd}
                        func={ (event, value) => { this.setState({ customAdd: value }) } }
                          />
                      </TableCell>
                      <TableCell><AddIcon onClick={this.addItemCustom.bind(this)} style={{ cursor: 'pointer' }} /></TableCell>
                    </TableRow>

                    { this.state.allItems.map( (item, key) =>
                      <TableRow key={key} style={{ height: 75 }}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell><AddIcon onClick={this.addItem.bind(this, item)} style={{ cursor: 'pointer' }} /></TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                </Table>

              </Grid>
              <Grid item xs={12} sm={7}>

                <Table>
                  <TableBody>
                    { this.state.vendor_items.map( (item, key) =>
                      <TableRow key={key} style={{ height: 75 }}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>
                          <MySelect data={this.state.nds} value={item.nds} func={ this.changeNDS.bind(this, item.item_id) } />
                        </TableCell>
                        <TableCell><CloseIcon onClick={ this.delItem.bind(this, item.item_id) } style={{ cursor: 'pointer' }} /></TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                </Table>

              </Grid>

            </Grid>

          </DialogContent>
          <DialogActions>
            <Button onClick={this.saveVendorItems.bind(this)} color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modalVendor}
          fullWidth={true}
          maxWidth={'md'}
          onClose={ () => { this.setState({ modalVendor: false }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Поставщик {this.state.openVendor ? this.state.openVendor.name : ''}</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

            <Grid container spacing={3}>

              {this.state.openVendor ?
                <>
                  <Grid item xs={12} sm={5}>
                    <MyTextInput label="Наименование" value={ this.state.openVendor.name } func={ this.testChange.bind(this, 'name') } />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MyTextInput label="Описание" value={ this.state.openVendor.text } func={ this.testChange.bind(this, 'text') } />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MyTextInput label="Мин. сумма заявки" value={ this.state.openVendor.min_price } func={ this.testChange.bind(this, 'min_price') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="ИНН" value={ this.state.openVendor.inn } func={ this.testChange.bind(this, 'inn') } disabled={true} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="ОГРН" value={ this.state.openVendor.ogrn } func={ this.testChange.bind(this, 'ogrn') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="БИК" value={ this.state.openVendor.bik } func={ this.testChange.bind(this, 'bik') } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="РС" value={ this.state.openVendor.rc } func={ this.testChange.bind(this, 'rc') } />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <MyTextInput label="Адрес компании" value={ this.state.openVendor.addr } func={ this.testChange.bind(this, 'addr') } />
                  </Grid>


                  <Grid item xs={12} sm={4}>
                    <MyCheckBox label="Активность" value={ parseInt(this.state.openVendor.is_show) == 1 ? true : false } func={ this.testChange.bind(this, 'is_show') } />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MyCheckBox label="Работа по счетам" value={ parseInt(this.state.openVendor.bill_ex) == 1 ? true : false } func={ this.testChange.bind(this, 'bill_ex') } />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MyCheckBox label="Необходима картинка" value={ parseInt(this.state.openVendor.need_img_bill_ex) == 1 ? true : false } func={ this.testChange.bind(this, 'need_img_bill_ex') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite multiple={true} label='Города' data={this.state.allCities} value={this.state.vendorCities} func={ (event, value) => { console.log(value); this.setState({ vendorCities: value }); setTimeout( () => { this.changeCityPoint(); }, 300 ) } } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyCheckBox label="Приоритетный поставщик" value={ parseInt(this.state.openVendor.is_priority) == 1 ? true : false } func={ this.testChange.bind(this, 'is_priority') } />
                  </Grid>

                  <Grid item xs={12} sm={10}>

                    <Typography>Почта поставщика</Typography>
                    <Divider style={{ marginBottom: 15 }} />

                    <Grid container spacing={3}>
                      {this.state.mails.map( (mail, key) =>
                        <Grid item xs={12} key={key}>
                          <Grid container spacing={3} >
                            <Grid item xs={5}>
                              <MyAutocomplite multiple={false} label='Точка' data={this.state.need_points} value={mail.point_id} func={ this.changeMail.bind(this, 'point_id', key) } />
                            </Grid>
                            <Grid item xs={5}>
                              <MyTextInput label="Почта" value={ mail.mail } func={ this.changeMail.bind(this, 'mail', key) } />
                            </Grid>
                            <Grid item xs={1}>
                              <Button variant="contained" color='primary' style={{ width: '100%' }} onClick={this.delMail.bind(this, key)}>
                                <CloseIcon />
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <MyTextInput label="Контактные данные" value={ mail.comment } func={ this.changeMail.bind(this, 'comment', key) } multiline={true} maxRows={5} />
                            </Grid>
                            <Grid item xs={12}>
                              <Divider />
                            </Grid>
                          </Grid>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Grid container spacing={3}>
                          <Grid item xs={5}>
                            <MyAutocomplite multiple={false} label='Точка' data={this.state.need_points} value={this.state.mailPoint} func={ this.changeMailNew.bind(this, 'mailPoint', 0) } onBlur={this.checkAddMail.bind(this)} />
                          </Grid>
                          <Grid item xs={5}>
                            <MyTextInput label="Почта" value={ this.state.mailMail } func={ this.changeMailNew.bind(this, 'mailMail', 0) } onBlur={this.checkAddMail.bind(this)} />
                          </Grid>
                          <Grid item xs={12}>
                            <MyTextInput label="Контактные данные" value={ this.state.mailComment } func={ this.changeMailNew.bind(this, 'mailComment', 0) } onBlur={this.checkAddMail.bind(this)} multiline={true} maxRows={5} />
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>

                  </Grid>

                </>
                  :
                null
              }
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button onClick={this.saveVendor.bind(this)} color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.modalVendorNew}
          fullWidth={true}
          maxWidth={'md'}
          onClose={ () => { this.setState({ modalVendorNew: false }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Новый поставщик</DialogTitle>
          <DialogContent>

            <Grid container spacing={3}>

              {this.state.openVendor ?
                <>
                  <Grid item xs={12} sm={5}>
                    <MyTextInput label="Наименование" value={ this.state.openVendor.name } func={ this.testChange.bind(this, 'name') } />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MyTextInput label="Описание" value={ this.state.openVendor.text } func={ this.testChange.bind(this, 'text') } />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MyTextInput label="Мин. сумма заявки" value={ this.state.openVendor.min_price } func={ this.testChange.bind(this, 'min_price') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="ИНН" value={ this.state.openVendor.inn } func={ this.testChange.bind(this, 'inn') } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="ОГРН" value={ this.state.openVendor.ogrn } func={ this.testChange.bind(this, 'ogrn') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="БИК" value={ this.state.openVendor.bik } func={ this.testChange.bind(this, 'bik') } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyTextInput label="РС" value={ this.state.openVendor.rc } func={ this.testChange.bind(this, 'rc') } />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <MyTextInput label="Адрес компании" value={ this.state.openVendor.addr } func={ this.testChange.bind(this, 'addr') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyCheckBox label="Работа по счетам" value={ parseInt(this.state.openVendor.bill_ex) == 1 ? true : false } func={ this.testChange.bind(this, 'bill_ex') } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MyCheckBox label="Необходима картинка" value={ parseInt(this.state.openVendor.need_img_bill_ex) == 1 ? true : false } func={ this.testChange.bind(this, 'need_img_bill_ex') } />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <MyAutocomplite multiple={true} label='Города' data={this.state.allCities} value={this.state.vendorCities} func={ (event, value) => { this.setState({ vendorCities: value }); setTimeout( () => { this.changeCityPoint(); }, 300 ) } } />
                  </Grid>

                  <Grid item xs={12} sm={10}>

                    <Typography>Почта поставщика</Typography>
                    <Divider style={{ marginBottom: 15 }} />

                    <Grid container spacing={3}>
                      {this.state.mails.map( (mail, key) =>
                        <Grid item xs={12} key={key}>
                          <Grid container spacing={3} >
                            <Grid item xs={5}>
                              <MyAutocomplite multiple={false} label='Точка' data={this.state.need_points} value={mail.point_id} func={ this.changeMail.bind(this, 'point_id', key) } />
                            </Grid>
                            <Grid item xs={5}>
                              <MyTextInput label="Почта" value={ mail.mail } func={ this.changeMail.bind(this, 'mail', key) } />
                            </Grid>
                            <Grid item xs={1}>
                              <Button variant="contained" color='primary' style={{ width: '100%' }} onClick={this.delMail.bind(this, key)}>
                                <CloseIcon />
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <MyTextInput label="Контактные данные" value={ mail.comment } func={ this.changeMail.bind(this, 'comment', key) } multiline={true} maxRows={5} />
                            </Grid>
                            <Grid item xs={12}>
                              <Divider />
                            </Grid>
                          </Grid>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Grid container spacing={3}>
                          <Grid item xs={5}>
                            <MyAutocomplite multiple={false} label='Точка' data={this.state.need_points} value={this.state.mailPoint} func={ this.changeMailNew.bind(this, 'mailPoint', 0) } onBlur={this.checkAddMail.bind(this)} />
                          </Grid>
                          <Grid item xs={5}>
                            <MyTextInput label="Почта" value={ this.state.mailMail } func={ this.changeMailNew.bind(this, 'mailMail', 0) } onBlur={this.checkAddMail.bind(this)} />
                          </Grid>
                          <Grid item xs={12}>
                            <MyTextInput label="Контактные данные" value={ this.state.mailComment } func={ this.changeMailNew.bind(this, 'mailComment', 0) } onBlur={this.checkAddMail.bind(this)} multiline={true} maxRows={5} />
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>

                  </Grid>
                </>
                  :
                null
              }
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button onClick={this.addVendor.bind(this)} color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>


        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.cities} value={this.state.city} func={ this.changeCity.bind(this) } label='Город' />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModalVendorNew.bind(this)} variant="contained">Добавить поставщика</Button>
          </Grid>

          <Grid item xs={12}>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell component="th">Название</TableCell>
                    <TableCell component="th" style={{ textAlign: 'center' }}>Назначенные товары</TableCell>
                    <TableCell component="th" style={{ textAlign: 'center' }}>Актиновсть</TableCell>
                    <TableCell component="th" style={{ textAlign: 'center' }}>Приоритетный</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { this.state.vendors.map( (item, key) =>
                    <TableRow key={key} style={{ backgroundColor: parseInt(item.is_show) == 0 ? '#e5e5e5' : '#fff' }}>
                      <TableCell><Typography onClick={ this.openModalVendor.bind(this, item) } style={{ cursor: 'pointer', width: 'max-content' }}>{item.name}</Typography></TableCell>
                      <TableCell style={{ textAlign: 'center' }}><DirectionsCarIcon onClick={ this.openModalItems.bind(this, item) } style={{ cursor: 'pointer' }} /></TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon /> }</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{ parseInt(item.is_priority) == 1 ? <PriorityHighIcon /> : null }</TableCell>
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

export default function VendorModule() {
  return (
    <VendorModule_ />
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
