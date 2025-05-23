import React from 'react';

import Grid from '@mui/material/Grid';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
// todo подключ лара
import { api_laravel_local, api_laravel } from '@/src/api_new';

import queryString from 'query-string';

class VendorMini_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'vendor_mini',
      module_name: '',
      is_load: false,
      
      modalItems: false,
      modalVendor: false,
      modalVendorNew: false,
      
      vendors: [],
      mails: [],
      items: [],
      
      openVendor: null,

      fullScreen: false,
    };
  }
  
  async componentDidMount(){
    this.handleResize();

    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      vendors: data.vendors
    })
    
    document.title = data.module_info.name;
  }
  
  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  getData = (method, data = {}) => {
    
    this.setState({
      is_load: true
    })
    console.log('new lara')
       
    let res = api_laravel(this.state.module, method, data)
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
   
  async openModalVendor(vendor){
    let data = {
      vendor_id: vendor.id
    }
    
    let res = await this.getData('get_vendor_info', data);
    
    this.setState({
      modalVendor: true,
      openVendor: res.vendor,
      mails: res.mails,
      items: res.items
    })

    console.log('mails', res.mails)
  }
  
  render(){
   
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Dialog
          open={this.state.modalVendor}
          fullWidth={true}
          fullScreen={this.state.fullScreen}
          maxWidth={'md'}
          onClose={ () => { this.setState({ modalVendor: false }) } }
          
        >
          <DialogTitle>Поставщик {this.state.openVendor ? this.state.openVendor.name : ''}</DialogTitle>
          
          <IconButton onClick={() => this.setState({ modalVendor: false }) } style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
            <CloseIcon />
          </IconButton>
          
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            
            <Grid container spacing={3}>
              
              {this.state.openVendor ?
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">ИНН</Typography>
                    <Typography variant="h6" component="h6">{ this.state.openVendor.inn }</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">ОГРН</Typography>
                    <Typography variant="h6" component="h6">{ this.state.openVendor.ogrn }</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">Мин. сумма заявки</Typography>
                    <Typography variant="h6" component="h6">{ this.state.openVendor.min_price }</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h5" component="h5">Адрес компании</Typography>
                    <Typography variant="h6" component="h6">{ this.state.openVendor.addr }</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      {this.state.mails.map( (mail, key) => 
                        <Grid item xs={12} key={key}>
                          <Grid container spacing={3} >
                            <Grid item xs={12} sm={6}>
                              <Typography variant="h5" component="h5">Точка</Typography>
                              <Typography variant="h6" component="h6">{ mail.point_id.name }</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="h5" component="h5">Почта</Typography>
                              <Typography variant="h6" component="h6">{ mail.mail }</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="h5" component="h5">Контактные данные</Typography>
                              <Typography variant="h6" component="h6">{ mail.comment }</Typography>
                            </Grid>
                            { this.state.mails.length-1 == key ? null :
                              <Grid item xs={12}>
                                <Divider />
                              </Grid>
                            }
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <List>
                      <ListItem disablePadding>
                        <ListItemButton>
                          <Typography variant="h5" component="h5">Товары</Typography>
                        </ListItemButton>
                      </ListItem>

                      <Divider />

                      { this.state.items.map( (item, key) =>
                        <ListItem disablePadding key={key}>
                          <ListItemButton>
                            <Typography variant="h6" component="h6">{ item.name }</Typography>
                          </ListItemButton>
                        </ListItem>
                      ) }
                    </List>
                  </Grid>
                      

                  
                  
                </>
                  :
                null
              }
            </Grid>
              
          </DialogContent>
          
        </Dialog>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12}>
          
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  { this.state.vendors.map( (item, key) => 
                    <TableRow key={key} onClick={ this.openModalVendor.bind(this, item) } style={{ cursor: 'pointer' }}>
                      <TableCell>{key+1}</TableCell>
                      <TableCell>{item.name}</TableCell>
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

export default function VendorMini() {
  return <VendorMini_ />;
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
