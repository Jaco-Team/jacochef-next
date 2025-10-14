import React from 'react';
import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import { MySelect } from '@/components/shared/Forms';

import { api_laravel_local, api_laravel } from '@/src/api_new';

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

class AppWorkShow_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'app_work_show',
      module_name: '',
      is_load: false,
      
      items: [],
      items_min: [],
      showItems: [],
      modalDialog: false,
      modalDialogNew: false,

      activeTab: 0,

      dows: [
        {id: 1, name: 'Понедельник'},
        {id: 2, name: 'Вторник'},
        {id: 3, name: 'Среда'},
        {id: 4, name: 'Четверг'},
        {id: 5, name: 'Пятница'},
        {id: 6, name: 'Суббота'},
        {id: 7, name: 'Воскресенье'},

        {id: 10, name: 'Другое'},
	      {id: 11, name: 'Каждый день'},
	      {id: 12, name: 'Каждый день в конце смены'},
        {id: 13, name: 'Ручное добавление'},
        {id: 14, name: 'После выполнение уборки'},
      ],
      types: [
        {id: 0, name: 'Другое'},
        {id: 1, name: 'Только 1 активная'},
        {id: 2, name: 'Добавление без ограничений'},
      ],

      itemsEdit: null,
      nameWork: '',

      itemsNew: null,
      chengeItem1: null,
      chengeItemNew1: null,

      points: [],
      point_id: ''
    };
  }
  
  async componentDidMount(){
    let res = await this.getData('get_all');
    
    this.setState({
      module_name: res.module_info.name,
      points: res.points,
      point_id: res.points[0]['id']
    }, this.getWorks)

    document.title = res.module_info.name;
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

  getActiveTabValue(tabIndex) {
    const map = [5, 6, 21];
    return map[parseInt(tabIndex)];
  }
  
  async getWorks(){

    let data = {
      point_id: this.state.point_id
    };

    let res = await this.getData('get_works', data);

    res.items.map( (item, key) => {
      res.items[key]['dow_name'] = this.state.dows.find( (it) => parseInt(it.id) == parseInt(item.dow) )['name'];
    })

    const activeTab = this.getActiveTabValue(this.state.activeTab);

    this.setState({
      items: res.items,
      showItems: res.items.filter((item) => parseInt(item.app_id) == parseInt(activeTab)),
      items_min: res.items_min
    })

  }

  async openWork(id){
    let data = {
      id: id,
      point_id: this.state.point_id
    };

    let res = await this.getData('get_one', data);

    this.setState({
      itemsEdit: res,
      modalDialog: true,
    })
  }

  changeTab(event, val) {
    const activeTab = this.getActiveTabValue(val);
  
    this.setState({
      activeTab: val,
      showItems: this.state.items.filter(item => parseInt(item.app_id) === activeTab),
    });
  }

  changePoint(event) {
    this.setState({ point_id: event.target.value }, this.getWorks);
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={3} className='container_first_child'>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <MySelect 
              is_none={false} 
              data={this.state.points} 
              value={this.state.point_id} 
              func={this.changePoint.bind(this)} 
              label='Точка' 
            />
          </Grid>

          {!this.state.itemsEdit ? null :
            <Dialog
              open={this.state.modalDialog}
              maxWidth={'md'}
              onClose={() => {this.setState({ modalDialog: false, itemsEdit: null, nameWork: '' })}}
            >
              <DialogTitle>Уборка "{this.state.itemsEdit.item.name}"</DialogTitle>
              <DialogContent>
                
                <Grid container spacing={0}>

                  <Grid
                    size={{
                      xs: 12
                    }}>
                    <Typography>{this.state.itemsEdit.item.cat_name}</Typography>
                  </Grid>

                  {this.state.itemsEdit.item?.show_time == false ? null :
                    <Grid
                      size={{
                        xs: 12
                      }}>
                      <Typography>Время за уборку: {this.state.itemsEdit.item.time_min} мин.</Typography>
                    </Grid>
                  }

                  <Grid
                    size={{
                      xs: 12
                    }}>
                    <Typography>Описание процесса уборки: </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12
                    }}>
                    <Typography dangerouslySetInnerHTML={{__html: this.state.itemsEdit.item.text_work}}></Typography>
                  </Grid>
                  
                </Grid>

              </DialogContent>
            </Dialog>
          }

          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <Paper>
              <Tabs value={this.state.activeTab} onChange={ this.changeTab.bind(this) }>
                <Tab label="Повар" {...a11yProps(0)} />
                <Tab label="Кассир" {...a11yProps(1)} />
                <Tab label="Кухонный работник" {...a11yProps(2)} />
              </Tabs>
            </Paper>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Работа</TableCell>
                  <TableCell>День недели</TableCell>
                  <TableCell>Время открытия</TableCell>
                  <TableCell>Время автоматического удаления</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                
                {this.state.showItems.map( (item, key) =>
                  <TableRow key={key}>
                    <TableCell onClick={ this.openWork.bind(this, item.id) } style={{ color: '#c03', cursor: 'pointer', fontWeight: 'bold' }}>{item.work_name}</TableCell>
                    <TableCell>{item.dow_name} {item.need_work_name}</TableCell>
                    <TableCell>{item.times_open}</TableCell>
                    <TableCell>{item.times_close}</TableCell>
                  </TableRow>
                )}
              
              </TableBody>
            
            </Table>
          </Grid>
        
        </Grid>
      </>
    );
  }
}

export default function AppWorkShow() {
  return (
    <AppWorkShow_ />
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
