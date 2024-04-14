import React, { useState, useEffect } from 'react';

import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Link from 'next/link';

import api from '@/src/api';

export default function Auth(){

  const [ isLoad, setIsLoad ] = useState(false);
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ isDialogText, setIsDialogText ] = useState('');
  const [ isDialogTitle, setIsDialogTitle ] = useState('');

  function openDialog(title = '', text = '') {
    setDialogOpen( open => !open )

    if(text && text.length > 0) {
      setIsDialogText(text);
    }
    if(title && title.length > 0) {
      setIsDialogTitle(title);
    }
  }

  function checkPhone(event){
    let v = event.target.value;
    let maxLen = 0;

    v       = v.replace(/[^\d+]/ig, "");
    maxLen  = v.substring(0, 1) == '+' ? 12 : 11;
    v       = v.substring(0, maxLen);
    document.getElementById('phone').value = v;
  }

  async function login(){
    setIsLoad(true);

    let data = {
      login: document.getElementById('phone').value,
      pwd: document.getElementById('password').value
    };

    let res = await api('auth', 'auth', data);

    console.log(res)

    if (res.st === false) {
      setTimeout(() => {
        openDialog('Предупреждение', res.text)
        setIsLoad(false);
      }, 500)
    } else {
      localStorage.setItem('token', res.token)

      setTimeout(() => {
        setIsLoad(false);
        window.location.pathname = '/'
      }, 300)
    }
  }

  return (
    <>
      <Backdrop style={{ zIndex: 99 }} open={isLoad}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={isDialogOpen}
        onClose={openDialog}
      >
        <DialogTitle>{isDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{isDialogText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={openDialog} color="primary" autoFocus>Хорошо</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <Avatar style={{ borderRadius: 0, width: '100%', height: 150, margin: 0, backgroundColor: '#fff' }}>
              <img alt="Жако доставка роллов и пиццы" src="/Favikon.png" style={{ height: '100%' }} />
            </Avatar>
            <form style={{ width: '100%' }} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                size="small"
                fullWidth
                id="phone"
                label="Номер телефона"
                name="phone"
                autoComplete="phone"
                autoFocus
                onChange={checkPhone}
              />
              <TextField
                variant="outlined"
                margin="normal"
                size="small"
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={login}
              >
                Войти
              </Button>
              <Grid container style={{ marginTop: 10 }}>
                <Grid item>
                  <Link href={`/registration`} style={{ color: '#c03' }}>Восстановить пароль</Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
    </>
  )
}