import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import api from '@/src/api';

import Cookies from 'js-cookie';

export default function Header() {
  const [ isOpenMenu, setIsOpenMenu ] = useState(false);
  const [ CatMenu, setCatMenu ] = useState([]);
  const [ FullMenu, setFullMenu ] = useState([]);

  function openMenu(){
    setIsOpenMenu( state => !state );
  }

  async function loadMenu(){
    const response = await api('header', 'get_all');

    if(response?.info?.st === true){
      setCatMenu(response?.info?.left_menu);
      setFullMenu(response?.info?.full_menu);
    }
    
  }

  useEffect( () => {
    if( (!localStorage.getItem( 'token' ) || localStorage.getItem( 'token' ).length == 0) && window.location.href == '/auth'){
      window.location.href = '/auth';
    }else{
      loadMenu()
    }
  }, []);

  function logOut(){
    localStorage.removeItem('token');
    Cookies.remove('token');
    window.location.href = '/auth';
  }

  if( window.location.pathname == '/auth' || window.location.pathname == '/registration' ){
    return <></>;
  }

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={openMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap style={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <SwipeableDrawer
        anchor={'left'}
        open={ isOpenMenu }
        onClose={ openMenu }
        onOpen={ openMenu }
        className='LeftMenu'
      >
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 10 }}>
        
          <Autocomplete
            size="small"
            options={FullMenu}
            getOptionLabel={(option) => option.name}
            onChange={(event, newValue) => {
              if( newValue ){
                window.location.pathname = "/"+newValue.key_query+"/";
              }
            }}
            style={{ width: '100%' }}
            renderInput={(params) => <TextField {...params} label="Поиск" variant="outlined" />}
          />
          
          <IconButton onClick={openMenu}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        

        <Divider />
        
        { CatMenu?.map( (item, key) =>
          <Accordion key={key} >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>{ item.parent.name }</Typography>
            </AccordionSummary>
            <AccordionDetails>
              
              <List style={{ width: '100%' }}>
              
                { item.chaild.map( (it, k) =>
                  <Link href={`/${it.key_query}/`} key={k}>
                    <ListItem button>
                      {it.name}
                    </ListItem>
                  </Link>
                ) }
              
              </List>
              
            </AccordionDetails>
          </Accordion>
        ) }

        

        <Accordion>
          <AccordionSummary onClick={logOut}>
            <Typography>Выйти из аккаунта</Typography>
          </AccordionSummary>
        </Accordion>

      </SwipeableDrawer>
    </>
  );
}
