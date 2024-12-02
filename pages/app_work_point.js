import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { MyTextInput, MySelect } from '@/ui/elements';

import queryString from 'query-string';

class AppWorkPoint_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'app_work_point',
      module_name: '',
      is_load: false,
      
      points: [],
      point_id: 0,

      apps: [],
      app_id: 0,

      allList: [],
      allListRender: [],
      thisList: []
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      points: data.points,
      point_id: data.points[0].id,
      apps: data.apps,
      app_id: data.apps[0].id
    })
    
    document.title = data.module_info.name;

    setTimeout( () => {
      this.getWorks();
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
      this.setState({
        is_load: false
      })
    });
  }
   
  changeApp(event){
    this.setState({
      app_id: event.target.value
    });

    setTimeout( () => {
      this.getWorks();
    }, 300 )
  }

  async getWorks(){
    let data = {
      point_id: this.state.point_id,
      app_id: this.state.app_id
    };

    let res = await this.getData('get_works', data);

    console.log( res )

    this.setState({
      allList: res.all_work,
      thisList: res.this_work,
    })

    setTimeout( () => {
      this.checkList();
    }, 300 )
  }

  checkList(){
    let allList = this.state.allList;
    let thisList = this.state.thisList;

    thisList.map( (Titem) => {
      let newArr = [];

        allList.map( (Aitem) => {
          if( parseInt(Aitem.id) != parseInt(Titem.id) ){
            newArr.push(Aitem);
          }
        })

        allList = newArr;
    } )

    this.setState({
      allListRender: allList
    })
  }

  add(id, name){
    let thisList = this.state.thisList;
    let allList = this.state.allList;

    let check = thisList.find( (item, key) => parseInt(item['id']) == parseInt(id) );
    let thisItem = allList.find( (item, key) => parseInt(item['id']) == parseInt(id) );

		if( !check ){
			thisList.push({id: id, name: name, dop_time: 0, time_min: thisItem.time_min})
		}

		this.setState({
      thisList: thisList
    })

    setTimeout( () => {
      this.checkList();
    }, 300 )
  }

  del(id, name){
    let new_arr = [];
    let thisList = this.state.thisList;

		thisList.map(function(item, key){
			if( parseInt(item['id']) != parseInt(id) ){
				new_arr.push( item )
			}
		})

		this.setState({
      thisList: new_arr
    })

    setTimeout( () => {
      this.checkList();
    }, 300 )
	}

  async save(){
    let data = {
      point_id: this.state.point_id,
      app_id: this.state.app_id,
      items: this.state.thisList
    };

    let fake_item = null;

    this.state.thisList.map( (item, key) => {
      if( item.dop_time.length == 0 ){
        fake_item = item;
      }
    } )

    console.log(fake_item  )

    if( fake_item ){
      alert('У позиции "'+fake_item.name+'" не указано доп время');

      return ;
    }

    let res = await this.getData('save', data);

    console.log( res )

    alert(res.text)
  }

  changeDopTime(key, event){
    let data = event.target.value;
    let list = this.state.thisList;

    if( !isNaN(data) || data == ''  ){
      list[ key ]['dop_time'] = data == '' ? '' : parseInt(data);

      this.setState({
        thisList: list
      })
    }
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

          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.points} value={this.state.point_id} func={ (event) => { this.setState({ point_id: event.target.value }) } } label='Точка' />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MySelect data={this.state.apps} value={this.state.app_id} func={ this.changeApp.bind(this) } label='Должность' />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.getWorks.bind(this)}>Обновить данные</Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <List style={{ width: '100%' }}>
              { this.state.allListRender.map( (item, key) =>
                <ListItem key={key} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <ListItemText primary={ item.name } />
                  <SendIcon onClick={this.add.bind(this, item.id, item.name)} />
                </ListItem>
              ) }
            </List>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Наименование</TableCell>
                  <TableCell>Основное время</TableCell>
                  <TableCell>Доп время (в минутах)</TableCell>
                  <TableCell><CloseIcon /></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                
                { this.state.thisList.map( (item, key) =>
                  <TableRow key={key}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.time_min} мин.</TableCell>
                    <TableCell>
                      <MyTextInput value={ item.dop_time } func={ this.changeDopTime.bind(this, key) } label='' />
                    </TableCell>
                    <TableCell>
                      <CloseIcon onClick={this.del.bind(this, item.id, item.name)} style={{cursor: 'pointer'}} />
                    </TableCell>
                  </TableRow>
                ) }
              
              </TableBody>
            
            </Table>

          </Grid>
        
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.save.bind(this)}>Сохранить</Button>
          </Grid>

        </Grid>
      </>
    )
  }
}

export default function AppWorkPoint() {
  return <AppWorkPoint_ />;
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