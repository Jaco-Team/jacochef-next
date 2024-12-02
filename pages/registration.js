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

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import Link from 'next/link';

import api from '@/src/api';

import Cookies from 'js-cookie';

export default function Registration(){

  const [ isLoad, setIsLoad ] = useState(false);
  const [ steps, setSteps ] = useState(['Телефон', 'Подтверждение', 'Новый пароль']);
  const [ activeStep, setActiveStep ] = useState(0);

  const [ phone, setPhone ] = useState('');
  const [ code, setCode ] = useState('');

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

    v = v.replace(/[^\d+]/ig, "");
    maxLen = v.substring(0, 1) == '+' ? 12 : 11;
    v = v.substring(0, maxLen);
    document.getElementById('phone').value = v;
  }

  function enterNextStep(event){
    if (event.charCode == 13) {
      //nextStep();
    }
  }

  async function nextStep() {
    if(activeStep == 0) {
      let data = {
        login: document.getElementById('phone').value
      }

      let res = await api('auth', 'check_phone', data);

      if (res.st === false) {
        setTimeout(() => {
          openDialog('Предупреждение', res.text)
        }, 500)
      } else {
        setActiveStep(activeStep_ => activeStep_ + 1);
        setPhone(data.login)
      }
    } else if (activeStep == 1) {
      let data = {
        login: phone,
        code: document.getElementById('code').value
      }

      let res = await api('auth', 'check_code', data);

      if (res.st === false) {
        setTimeout(() => {
          openDialog('Предупреждение', res.text)
        }, 500)
      } else {
        setActiveStep(activeStep_ => activeStep_ + 1);
        setCode(data.code)
      }
    } else if (activeStep == 2) {
      let data = {
        login: phone,
        code: code,
        pwd: document.getElementById('password').value
      }

      let res = await api('auth', 'save_new_pwd', data);

      if (res.st === false) {
        setTimeout(() => {
          openDialog('Предупреждение', res.text)
        }, 500)
      } else {
        localStorage.setItem('token', res.token);
        Cookies.set('token', res.token, { expires: 60 });

        setTimeout(() => {
          window.location.pathname = '/'
        }, 300)
      }
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
            <Avatar style={{ borderRadius: 0, width: '100%', height: 150, margin: 0, backgroundColor: '#fff', marginBottom: 20 }}>
              <img alt="Жако доставка роллов и пиццы" src="/Favikon.png" style={{ height: '100%' }} />
            </Avatar>

            <Stepper activeStep={activeStep} alternativeLabel style={{ width: '100%' }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <div style={{ width: '100%' }}>

              {activeStep == 0 ?
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
                  onKeyPress={enterNextStep}
                  onChange={checkPhone}
                />
                  :
                null
              }

              {activeStep == 1 ?
                <TextField
                  variant="outlined"
                  margin="normal"
                  size="small"
                  fullWidth
                  id="code"
                  label="Код из смс"
                  name="code"
                  autoComplete="code"
                  autoFocus
                  onKeyPress={enterNextStep}
                />
                  :
                null
              }

              {activeStep == 2 ?
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
                  onKeyPress={enterNextStep}
                />
                  :
                null
              }

              <Button
                fullWidth
                variant="contained"
                color="primary"
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={nextStep}
              >
                Дальше
              </Button>

              <Grid container style={{ marginTop: 10 }}>
                <Grid item>
                  <Link href={`/auth`} style={{ color: '#c03' }}>Вернуться к авторизации</Link>
                </Grid>
              </Grid>


            </div>
          </div>
        </Grid>
      </Grid>
    </>
  )
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