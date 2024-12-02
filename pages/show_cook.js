import React from 'react';
import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Paper from '@mui/material/Paper';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Avatar from '@mui/material/Avatar';

import Typography from '@mui/material/Typography';

import queryString from 'query-string';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class ShowCook_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'show_cook',
      module_name: '',
      is_load: false,
      
      modalDialog: false,
      itemsEdit: null,

      stage_1: [],
      stage_2: [],
      stage_3: [],

      activeTab: 0,

      pf: [],
      rec: [],
      cats: []
    };
  }
  
  async componentDidMount(){
    let res = await this.getData('get_all');
    
    this.setState({
      pf: res.pf,
      rec: res.rec,
      cats: res.cats,
      module_name: res.module_info.name,
    })
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
   
  async openItem(id){
    let data = {
      id: id,
    };

    let res = await this.getData('get_one', data);

    console.log( res )

    this.setState({
      itemsEdit: res.item,
      stage_1: res.stage_1,
      stage_2: res.stage_2,
      stage_3: res.stage_3,
      modalDialog: true,
    })
  }

  changeTab(event, val){
    let activeTab = parseInt(val);

    this.setState({
      activeTab: val
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          { !this.state.itemsEdit ? null :
            <Dialog
              open={this.state.modalDialog}
              maxWidth={'md'}
              onClose={ () => { this.setState({ modalDialog: false, itemsEdit: null }) } }
            >
              <DialogTitle style={{ textAlign: 'center' }}>{this.state.itemsEdit.name}</DialogTitle>
              <DialogContent>
                
                <Grid container spacing={0}>

                  <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                    { this.state.itemsEdit.img_app.length == 0 && this.state.itemsEdit.img_new.length > 0 ?
                      <img src={'https://storage.yandexcloud.net/site-img/'+this.state.itemsEdit.img_new+'600х400.jpg?'+this.state.itemsEdit.img_new_update} style={{ maxHeight: 400, width: '100%' }} loading="lazy" />
                        :
                        this.state.itemsEdit.img_app.length > 0 ?
                          <picture>
                            <source srcSet={`
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_276x276.jpg 138w, 
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_292x292.jpg 146w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_366x366.jpg 183w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_466x466.jpg 233w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_585x585.jpg 292w
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_732x732.jpg 366w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_1168x1168.jpg 584w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_1420x1420.jpg 760w,
                              https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_2000x2000.jpg 1875w`} 
                              sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px" />
                            <img style={{ maxHeight: 400, width: '100%' }} src={`https://storage.yandexcloud.net/site-img/${this.state.itemsEdit.img_app}_276х276.jpg`} loading="lazy" />
                          </picture>
                            :
                          <div style={{ maxHeight: 400, width: '100%' }}/>
                    }
                  </Grid>

                  {this.state.stage_1.length > 0 ?
                    <Grid item xs={12}>
                      <h3 style={{ textAlign: 'center' }}>Этап 1</h3>
                      <List>
                        {this.state.stage_1.map( (item, key) =>
                          <ListItem disablePadding key={key}>
                            <ListItemButton style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <ListItemText primary={item.name} style={{ width: '60%' }} />
                              <ListItemText primary={item.count + ' ' + item.ei_name} style={{ width: '40%' }} />
                            </ListItemButton>
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                      :
                    null
                  }

                  {this.state.stage_2.length > 0 ?
                    <Grid item xs={12}>
                      <h3 style={{ textAlign: 'center' }}>Этап 2</h3>
                      <List>
                        {this.state.stage_2.map( (item, key) =>
                          <ListItem disablePadding key={key}>
                            <ListItemButton style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <ListItemText primary={item.name} style={{ width: '60%' }} />
                              <ListItemText primary={item.count + ' ' + item.ei_name} style={{ width: '40%' }} />
                            </ListItemButton>
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                      :
                    null
                  }

                  {this.state.stage_3.length > 0 ?
                    <Grid item xs={12}>
                      <h3 style={{ textAlign: 'center' }}>Этап 3</h3>
                      <List>
                        {this.state.stage_3.map( (item, key) =>
                          <ListItem disablePadding key={key}>
                            <ListItemButton style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <ListItemText primary={item.name} style={{ width: '60%' }} />
                              <ListItemText primary={item.count + ' ' + item.ei_name} style={{ width: '40%' }} />
                            </ListItemButton>
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                      :
                    null
                  }

                </Grid>

              </DialogContent>
            </Dialog>
          }

          <Grid item xs={12} sm={12} style={{ paddingBottom: 24 }}>
            <Paper>
              <Tabs value={this.state.activeTab} onChange={ this.changeTab.bind(this) } centered variant='fullWidth'>
                <Tab label="Товары" {...a11yProps(0)} />
                <Tab label="Рецепты" {...a11yProps(1)} />
                <Tab label="Сроки хранения" {...a11yProps(2)} />
              </Tabs>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
            <TabPanel value={this.state.activeTab} index={0} id='items' style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
            
              {this.state.cats.map( (item, key) =>
                <Accordion key={key}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>{item.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>

                    <List>

                      {item.items.map( (it, k) =>
                        <ListItem disablePadding key={k} onClick={this.openItem.bind(this, it.id)}>
                          <ListItemButton>
                            <Avatar sx={{ width: 60, height: 60 }}>
                              { it.img_app.length == 0 && it.img_new.length > 0 ?
                                  <img src={'https://storage.yandexcloud.net/site-img/'+it.img_new+'300х200.jpg?'+it.img_new_update} style={{ height: '100%' }} loading="lazy" />
                                    :
                                    it.img_app.length > 0 ?
                                      <picture style={{ width: '100%', height: '100%' }}>
                                        <source srcSet={`
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_276x276.jpg 138w, 
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_292x292.jpg 146w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_366x366.jpg 183w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_466x466.jpg 233w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_585x585.jpg 292w
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_732x732.jpg 366w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_1168x1168.jpg 584w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_1420x1420.jpg 760w,
                                            https://storage.yandexcloud.net/site-img/${it.img_app}_2000x2000.jpg 1875w`} 
                                            sizes="(max-width=1439px) 233px, (max-width=1279px) 218px, 292px" />
                                        <img style={{ height: '100%' }} src={`https://storage.yandexcloud.net/site-img/${it.img_app}_276х276.jpg`} loading="lazy" />
                                      </picture>
                                        :
                                      <div style={{ height: '100%' }}/>
                                    
                              }
                            </Avatar>
                            <ListItemText primary={it.name} style={{ paddingLeft: 20 }} />
                          </ListItemButton>
                        </ListItem>
                      )}
                    
                    </List>

                  </AccordionDetails>
                </Accordion>
              )}
              
            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
            <TabPanel value={this.state.activeTab} index={1} id='rec'>
            
              <Paper sx={{ display: { xs: 'block', md: 'flex' }, width: { xs: '100%', md: '50%' } }} style={{ justifyContent: 'center', flexDirection: 'column' }}>
                {this.state.rec.map( (item, key) =>
                  <Accordion key={key}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Typography>{item.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>

                      <List>

                        {item.items.map( (it, k) =>
                          <ListItem disablePadding key={k}>
                            <ListItemButton style={{ borderBottom: '1px solid #e5e5e5' }}>
                              <ListItemText primary={it.name} style={{ width: '70%' }} />
                              <ListItemText primary={it.count + ' ' + it.ei_name} style={{ width: '30%' }} />
                            </ListItemButton>
                          </ListItem>
                        )}
                      
                        <ListItem disablePadding>
                          <ListItemButton>
                            <ListItemText primary={''} style={{ width: '70%' }} />
                            <span style={{ width: '30%', fontWeight: '900' }} >{item.all_w + ' ' + item.ei_name}</span>
                          </ListItemButton>
                        </ListItem>

                      </List>

                    </AccordionDetails>
                  </Accordion>
                )}
              </Paper>

            </TabPanel>
          </Grid>

          <Grid item xs={12} sm={12} style={{ paddingTop: 0, paddingBottom: '40px' }}>
            <TabPanel value={this.state.activeTab} index={2} id='pf' style={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
            
              <Paper>
                <List>
                  {this.state.pf.map( (item, key) =>
                    <ListItem disablePadding key={key}>
                      <ListItemButton style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <ListItemText primary={item.name} style={{ width: '40%' }} />
                        <ListItemText primary={item.shelf_life} style={{ width: '60%' }} />
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </Paper>

            </TabPanel>
          </Grid>

          
        
        </Grid>
      </>
    )
  }
}

export default function ShowCook() {
  return (
    <ShowCook_ />
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