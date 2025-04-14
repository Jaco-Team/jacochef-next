import React, { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';

import api from '@/src/api';

import Cookies from 'js-cookie';

import { EyeShow, EyeHide } from '@/ui/icons';
import { MyAlert} from '@/ui/elements';

export default function Auth(){

  const [isLoad, setIsLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [errText, setErrText] = useState(false);

  const checkPhone = (event) => {
    let v = event.target.value;
    v = v.replace(/[^\d+]/ig, "");

    if (v.charAt(0) !== '+') {
      v = v.replace(/\+/g, "");
    } else {
      v = '+' + v.slice(1).replace(/\+/g, "");
    }

    let maxLen = v.charAt(0) === '+' ? 12 : 11;
    v = v.substring(0, maxLen);

    setPhone(v);
  };

  const setLogin = (event) => {
    setPassword(event.target.value.replaceAll(' ', ''));
  };

  async function login(){

    if (!password.trim() || !phone || (phone.startsWith('+7') && phone.length < 12) || (phone.startsWith('8') && phone.length < 11)) {
      setErrText('Пожалуйста, заполните все поля корректно: телефон и пароль');
      setOpenAlert(true);

      return;
    }

    setIsLoad(true);

    let data = {
      login: phone,
      pwd: password
    };

    let res = await api('auth', 'auth', data);

    console.log(res)

    if (res.st === false) {

      setTimeout(() => {
        setErrText(res.text)
        setOpenAlert(true);
        setIsLoad(false);
      }, 500)

    } else {

      localStorage.setItem('token', res.token);
      Cookies.set('token', res.token, { expires: 60 });

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

      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={false}
        text={errText}
      />

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
                label="Номер телефона"
                name="phone"
                autoComplete="phone"
                autoFocus
                value={phone}
                onChange={checkPhone}
              />

              <TextField
                variant="outlined"
                margin="normal"
                size="small"
                fullWidth
                name="password"
                label="Пароль"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        disableRipple
                        disableFocusRipple
                      >
                        {showPassword ? <EyeShow style={{ fontSize: 30 }} /> : <EyeHide style={{ fontSize: 30 }}/>}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={setLogin}
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
