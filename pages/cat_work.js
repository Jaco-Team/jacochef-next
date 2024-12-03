import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { MyTextInput, TextEditor } from '@/ui/elements';

import queryString from 'query-string';

class CatWork_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'cat_work',
      module_name: '',
      is_load: false,
      
      cats: [],
      modalDialog: false,
      modalDialogNew: false,

      nameCat: '',
      editText: '',

      nameCatNew: '',
      editTextNew: '',

      config: {
        readonly: false // all options from https://xdsoft.net/jodit/doc/
      },

      showCat: null
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      cats: data.cats
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
   
  openCat(item){
    this.setState({
      modalDialog: true,
      showCat: item,
      nameCat: item.name,
      editText: item.text
    })
  }

  async save(){
    let data = {
      cat_id: this.state.showCat.id,
      name: this.state.nameCat,
      text: this.state.showCat.text
    };

    let res = await this.getData('save_edit', data);

    if( res.st === false ){
      alert(res.text)
    }else{
      this.setState({ 
        modalDialog: false, 
        showCat: null, 
        nameCat: '' 
      })

      //document.getElementById('EditorEdit').value = '';

      res = await this.getData('get_all');
    
      this.setState({
        cats: res.cats
      })
    }
  }

  async saveNew(){
    let data = {
      name: this.state.nameCatNew,
      text: document.getElementById('EditorNew').value
    };

    let res = await this.getData('save_new', data);

    if( res.st === false ){
      alert(res.text)
    }else{
      this.setState({ 
        modalDialogNew: false, 
        editTextNew: '', 
        nameCatNew: '' 
      })

      document.getElementById('EditorNew').value = '';

      res = await this.getData('get_all');
    
      this.setState({
        cats: res.cats
      })
    }
  }

  changeText(data){
    let showCat = this.state.showCat;

    showCat.text = data

    this.setState({
      showCat: showCat
    })
  }

  render(){
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        { !this.state.showCat ? null :
          <Dialog
            open={this.state.modalDialog}
            onClose={ () => { this.setState({ modalDialog: false, showCat: null, editText: '', nameCat: '' }) } }
          >
            <DialogTitle>Категория уборки "{this.state.showCat.name}"</DialogTitle>
            <DialogContent style={{ paddingTop: 10 }}>
              
              <Grid container spacing={3}>
                
                <Grid item xs={12} sm={12}>
                  <MyTextInput value={ this.state.nameCat } func={ (event) => { this.setState({ nameCat: event.target.value }) } } label='Название категории' />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextEditor id="EditorEdit" value={this.state.showCat.text} func={ this.changeText.bind(this) } />
                </Grid>
                
              </Grid>

            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.save.bind(this)}>Сохранить</Button>
            </DialogActions>
          </Dialog>
        }

        <Dialog
          open={this.state.modalDialogNew}
          onClose={ () => { this.setState({ modalDialogNew: false, editTextNew: '', nameCatNew: '' }) } }
        >
          <DialogTitle>Новая категория уборки</DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            
            <Grid container spacing={3}>
              
              <Grid item xs={12} sm={12}>
                <MyTextInput value={ this.state.nameCatNew } func={ (event) => { this.setState({ nameCatNew: event.target.value }) } } label='Название категории' />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextEditor id="EditorNew" value={''} />
              </Grid>
              
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.saveNew.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button variant="contained" color="primary" onClick={ () => { this.setState({ modalDialogNew: true }) } }>Добавить категорию</Button>
          </Grid>
          
          <Grid item xs={12} sm={12}>
            <List style={{ width: '100%' }}>
              { this.state.cats.map( (item, key) =>
                <ListItem button key={key} onClick={ this.openCat.bind(this, item) }>
                  <ListItemText primary={ item.name } />
                </ListItem>
              ) }
            </List>
          </Grid>
        
        </Grid>
      </>
    )
  }
}

export default function CatWork() {
  return (
    <CatWork_ />
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