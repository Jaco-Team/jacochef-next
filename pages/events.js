import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

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

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyCheckBox, MyTimePicker, MyAlert } from '@/ui/elements';
import Typography from '@mui/material/Typography';

import { api_laravel_local, api_laravel } from '@/src/api_new';

class Events_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'events',
      module_name: '',
      is_load: false,
      
      points: [],
      point: '0',
      mounth: '0',
      mounths: [],
      years: [],
      year: '0',
      
      calendar: [],
      modalDialog: false,
      
      chooseDayHoly: '',
      events: [],
      chooseEvent: 0,
      
      eventPoint1: 0,
      everyYear1: false,
      timeStart2: '10:00',
      timeEnd2: '21:30',
      
      expanded: '',
      dayEvents: [],
      events_hist: [],

      openAlert: false,
      err_status: false,
      err_text: '',

      confirmDialog: false,
      del_id: null,
      text_delete: ''
    };
  }
  
  async componentDidMount(){
    
    let data = await this.getData('get_all');
    
    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      mounths: data.mounth,
      mounth: data.this_m,
      years: data.years,
      year: data.this_y,
    })
    
    document.title = data.module_info.name;
    
    setTimeout( () => {
      this.updateData();
    }, 50 )
  }
  
  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

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
   
  changePoint(event){
    let data = event.target.value;
    
    this.setState({
      point: data
    })
    
    setTimeout( () => {
      this.updateData();
    }, 50 )
  }
  
  changeMounth(event){
    let data = event.target.value;
    
    this.setState({
      mounth: data
    })
    
    setTimeout( () => {
      //this.updateData();
    }, 50 )
  }
  
  changeYear(event){
    let data = event.target.value;
    
    this.setState({
      year: data
    })
  }
  
  changeCheckOrders(event){
    let data = event.target.checked;
    
    this.setState({
      showReady: data
    })
  }
  
  async updateData(){
    let data = {
      m: this.state.mounth,
      y: this.state.year,
      point_id: this.state.point
    };
    
    let res = await this.getData('get_calendar', data);

    this.setState({
      calendar: res.year,
    })
   
  }
  
  async chooseDay(day){
    
    if( day.full_day ){
    
      this.setState({
        chooseDay: null,
        eventPoint1: this.state.point,
        chooseEvent: 0,
        everyYear1: false,
        timeStart2: '10:00',
        timeEnd2: '21:30',
        modalDialog: false,
        events_hist: []
      })
      
      let data = {
        date: day.full_day,
        point_id: this.state.point
      };
      
      let res = await this.getData('get_calendar_day', data);
      
      this.setState({
        chooseDay: day,
        chooseDayHoly: res.holy,
        events: res.events,
        events_hist: res.hist,
        dayEvents: res.this_events,
        modalDialog: true
      })
    }
  }
  
  changeEvent(event){
    let data = event.target.value;
    
    this.setState({
      chooseEvent: data
    })
  }
  
  changePoint1(event){
    let data = event.target.value;
    
    this.setState({
      eventPoint1: data
    })
  }
  
  changeEveryYear1(event){
    let data = event.target.checked;
    
    this.setState({
      everyYear1: data
    })
  }
  
  changeTimeStart2(event){
    let data = event.target.value;
    
    this.setState({
      timeStart2: data
    })
  }
  
  changeTimeEnd2(event){
    let data = event.target.value;
    
    this.setState({
      timeEnd2: data
    })
  }
  
  async save(){

    if (!this.state.chooseEvent) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать событие'
      });

      return;
    } 

    if (this.state.eventPoint1 === '') {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать точку'
      });

      return;
    } 

    let data = {
      date: this.state.chooseDay.full_day,
      point_id: this.state.eventPoint1,
      event: this.state.chooseEvent,
      every_year: this.state.everyYear1 === true ? 1 : 0,
      time_start: this.state.timeStart2,
      time_end: this.state.timeEnd2,
    };
    
    let res = await this.getData('save_event', data);
    
    if(res.st === false){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text
      });

    } else {

      this.setState({
        chooseDay: null,
        eventPoint1: this.state.point,
        chooseEvent: 0,
        everyYear1: false,
        timeStart2: '10:00',
        timeEnd2: '21:30',
        modalDialog: false
      })
      
      setTimeout( () => {
        this.updateData();
      }, 300 )
    }
  }
  
  handleChange(data){
    this.setState({
      expanded: data
    })
  }

  openConfigDialog(event) {

    this.setState({
      confirmDialog: true,
      del_id: event.id,
      text_delete: 'Удалить событие "'+event.title+' '+event.date+'" ?'
    });

  }
  
  async delEvent(){

    this.setState({ confirmDialog: false })
    
    let data = {
      del_id: this.state.del_id
    };
      
    await this.getData('del_event', data);
    
    this.setState({
      chooseDay: null,
      eventPoint1: this.state.point,
      chooseEvent: 0,
      everyYear1: false,
      timeStart2: '10:00',
      timeEnd2: '21:30',
      modalDialog: false
    })
    
    setTimeout( () => {
      this.updateData();
    }, 300 )

  }
  
  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false, del_id: null, text_delete: '' })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>{this.state.text_delete}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false, del_id: null, text_delete: '' })}>Отмена</Button>
            <Button onClick={this.delEvent.bind(this)}>Удалить</Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
          open={this.state.modalDialog}
          onClose={ () => { this.setState({ modalDialog: false }) } }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" className="button">
            {this.state.chooseDay ? this.state.chooseDay.full_day : ''}
            <IconButton onClick={ () => { this.setState({ modalDialog: false }) } } style={{ position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <DialogContentText id="alert-dialog-description">
              
              <Grid container spacing={3}>
                
                {this.state.chooseDayHoly.length == 0 ? null :
                  <Grid item xs={12} sm={12}>
                    <Typography component="span">{this.state.chooseDayHoly}</Typography>
                  </Grid>
                }
                
                <Grid item xs={12} sm={12}>
                  <MySelect data={this.state.events} value={this.state.chooseEvent} func={ this.changeEvent.bind(this) } label='Событие' is_none={false} />
                </Grid>
                
                <Grid item xs={12} sm={12}>
                  <MySelect data={this.state.points} value={ this.state.eventPoint1 } func={ this.changePoint1.bind(this) } label='Точка' is_none={false} />
                </Grid>
                
                { parseInt(this.state.chooseEvent) !== 2 ? null :
                  <>
                    <Grid item xs={6} sm={6}>
                      <MyTimePicker value={ this.state.timeStart2 } func={ this.changeTimeStart2.bind(this) } label='Время начала работы' />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <MyTimePicker value={ this.state.timeEnd2 } func={ this.changeTimeEnd2.bind(this) } label='Время окончания работы' />
                    </Grid>
                  </>
                }
                
                <Grid item xs={12} sm={12}>
                  <MyCheckBox value={ this.state.everyYear1 } func={ this.changeEveryYear1.bind(this) } label='Каждый год' />
                </Grid>
                
              </Grid>
              
              <List component="nav">
                { this.state.dayEvents.map( (item, key) => 
                  <ListItem key={key}>
                    <ListItemText primary={item.title} />
                    { ( parseInt(item.type) == 4 ||  parseInt(item.type) == 6) ? null :
                      <CloseIcon color="primary" onClick={this.openConfigDialog.bind(this, item)} style={{ cursor: 'pointer' }} />
                    }
                  </ListItem>
                )}
              </List>
              
              {!this.state.events_hist.length ? null :
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>История</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List component="nav">
                      { this.state.events_hist.map( (item, key) => 
                        <ListItem key={key}>
                          <ListItemText primary={item.title} />
                        </ListItem>
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              }
              
              
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ this.save.bind(this) } color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MySelect  data={this.state.points} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' is_none={false} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MySelect  data={this.state.mounths} value={this.state.mounth} func={ this.changeMounth.bind(this) } label='Месяц' is_none={false} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MySelect  data={this.state.years} value={this.state.year} func={ this.changeYear.bind(this) } label='Год' is_none={false} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>
        
          <Grid container direction="row" justifyContent="center" style={{ paddingTop: 20, margin: '0 auto' }} >
            
            { this.state.calendar.map( (item, key) =>
            
              <Grid item sm={6} key={key} style={{ padding: 20 }} >
                <h1 style={{ textAlign: 'center' }}>{ item[0][0].mounth }</h1>
                <TableContainer component={Paper}>
                  <Table aria-label="a dense table" style={{ overflow: 'hidden' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Пн</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Вт</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Ср</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Чт</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Пт</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Сб</TableCell>
                        <TableCell style={{ textAlign: 'center', padding: 15 }}>Вс</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      
                      { item.map( (mounth, m_key) =>
                        <TableRow key={m_key}>
                          { mounth.map( (day, k) =>
                          <>
                            <TableCell 
                              key={k} 
                              onClick={ this.chooseDay.bind(this, day) } 
                              
                              style={{ color: day.dir ? 'yellow' : day.holy ? '#c03' : '#000', height: '6vw', position: 'relative' }}

                              className={ day.event ? 'customCel' : 'tableCel' }
                            >
                            {day.day}

                            {!day.event?.length ? null :
                             <Tooltip title={<Typography color="inherit">Кол-во событий дня</Typography>}> 
                              <span style={{ position: 'absolute', right: 5, top: 5, color: '#c03' }}>{day.event.length}</span>
                             </Tooltip>
                            }

                            </TableCell>
                          </>
                          ) }
                        </TableRow>
                      ) }
                      
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            
          </Grid>
        </Grid>
      </>
    )
  }
}

export default function Events() {
  return <Events_ />;
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
