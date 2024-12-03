import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyDatePickerNew, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class RasBillAndCook_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);
        
    this.state = {
      module: 'ras_bill_and_cook',
      module_name: '',
      is_load: false,
      
      points: [],
      point: 0,
      
      rev_list: [],
      rev: 0,
      cats: [],
      
      date_end: formatDate(new Date())
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
      this.changePoint({ target: { value: data.points[0].id } });
    }, 300 )
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
      date_start: this.state.rev,
      date_end: dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };
    
    let res = await this.getData('show', data);
    
    console.log( res )
    
    this.setState({
      cats: res.cats
    })
  }
  
  async changePoint(event){
    let point = event.target.value;
    
    let data = {
      point_id: point
    };
    
    let res = await this.getData('get_rev_list', data);

    this.setState({
      point: point,
      rev_list: res,
      rev: res[0].id
    })
  }

  async changeRev(event){
    let rev = event.target.value;
    
    this.setState({
      rev: rev
    })
  }

  changeDate(data){
    this.setState({
      date_end: (data)
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
          
          <Grid item xs={12} sm={4}>
            <MySelect data={this.state.points} value={this.state.point} func={ this.changePoint.bind(this) } label='Точка' />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect data={this.state.rev_list} value={this.state.rev} func={ this.changeRev.bind(this) } label='Ревизия' />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew label='Дата до' value={this.state.date_end} func={ this.changeDate.bind(this) } />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={this.updateData.bind(this)}>Обновить данные</Button>
          </Grid>
        
          <Grid item xs={12}>
            
            { this.state.cats.map( (item, key) =>
              <Accordion key={key}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  { item.cats.map( (cat, key_cat) => 
                    <Accordion key={key_cat}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                      >
                        <Typography>{cat.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        
                        <Table>
                  
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: '5%' }}>#</TableCell>

                              <TableCell style={{ width: '20%' }}>Товар</TableCell>
                              <TableCell style={{ width: '20%' }}>Ревизия</TableCell>

                              <TableCell style={{ width: '15%' }}>Кол-во по накладным</TableCell>
                              <TableCell style={{ width: '15%' }}>Кол-во по продажам</TableCell>

                              <TableCell style={{ width: '15%' }}>Разница</TableCell>
                              <TableCell style={{ width: '10%' }}>Ед. измер</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            
                            { cat.items.map( (it, k) =>
                              <TableRow key={k}>
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.name}</TableCell>
                                <TableCell>{it.count_rev}</TableCell>
                                <TableCell>{it.count_bill}</TableCell>
                                <TableCell>{it.count_ras}</TableCell>
                                <TableCell>{it.count_res}</TableCell>
                                <TableCell>{it.ei_name}</TableCell>
                              </TableRow>
                            ) }
                          
                          </TableBody>
                        
                        </Table>

                      </AccordionDetails>
                    </Accordion>
                  ) }
                </AccordionDetails>
              </Accordion>
            ) }
            

          </Grid>
        </Grid>
      </>
    )
  }
}

export default function RasBillAndCook() {
  return <RasBillAndCook_ />;
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