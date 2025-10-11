import React, { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import Link from 'next/link';

import api from '@/src/api';
import { api_laravel_local, api_laravel } from '@/src/api_new';

import Cookies from 'js-cookie';

import { EyeShow, EyeHide } from '@/ui/icons';
import MyAlert from '@/components/shared/MyAlert';

export default function Registration() {
  const steps = ['Телефон', 'Подтверждение', 'Новый пароль'];

  const [isLoad, setIsLoad] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const [openAlert, setOpenAlert] = useState(false);
  const [errText, setErrText] = useState('');

  const isMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasMixedCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const isPasswordValid = activeStep === 2 ? isMinLength && hasNumber && hasMixedCase : true;

  const handlePasswordChange = (event) => {
    setPassword(event.target.value.replaceAll(' ', ''));
  };

  const checkPhone = (event) => {
    let v = event.target.value;
    v = v.replace(/[^\d+]/g, '');
    
    if (v.startsWith('+7')) {
      v = v.substring(0, 12);
    } else if (v.startsWith('8')) {
      v = v.substring(0, 11);
    } else {
      v = v.substring(0, 11);
    }
    
    setPhone(v);
  };

  const handleSetCode = (event) => {
    const newCode = event.target.value.replaceAll(' ', '');
    setCode(newCode);

    if (activeStep === 1 && newCode.length === 4) {
      nextStep(newCode);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      nextStep(code);
    } else {
      nextStep();
    }
  };

  async function nextStep(currentCode = '') {
    setIsLoad(true);

    try {
      if (activeStep === 0) {
        if (!phone || (phone.startsWith('+7') && phone.length < 12) || (phone.startsWith('8') && phone.length < 11)) {

          setErrText('Введите корректный номер телефона');
          setOpenAlert(true);
          return;

        }

        let data = { login: phone };
        let res = await api_laravel('auth', 'check_phone', data);
        res = res.data;

        if (res.st === false) {
          setErrText(res.text);
          setOpenAlert(true);
        } else {
          setActiveStep((prev) => prev + 1);
        }
      } else if (activeStep === 1) {

        if (currentCode.length !== 4) {
          setErrText('Код должен состоять ровно из 4 символов');
          setOpenAlert(true);
          return;
        }

        let data = { login: phone, code: currentCode };
        let res = await api('auth', 'check_code', data);

        if (res.st === false) {
          setErrText(res.text);
          setOpenAlert(true);
        } else {
          setActiveStep((prev) => prev + 1);
        }

      } else if (activeStep === 2) {

        let data = { login: phone, code: code, pwd: password };
        let res = await api('auth', 'save_new_pwd', data);

        if (res.st === false) {

          setErrText(res.text);
          setOpenAlert(true);

        } else {

          localStorage.setItem('token', res.token);
          Cookies.set('token', res.token, { expires: 60 });

          setTimeout(() => {
            window.location.pathname = '/';
          }, 300);

        }
      }
    } catch (error) {

      setErrText('Произошла ошибка. Попробуйте позже.');
      setOpenAlert(true);

    } finally {

      setIsLoad(false);

    }
  }

  const isButtonDisabled = () => {
    if (activeStep === 0) {
      if (phone.startsWith('+7')) {
        return phone.length !== 12;
      } else if (phone.startsWith('8')) {
        return phone.length !== 11;
      }
      return true;
    } else if (activeStep === 1) {
      return code.length !== 4;
    } else if (activeStep === 2) {
      return !isPasswordValid;
    }
    return true;
  };

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
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 6,
            lg: 4,
            xl: 3
          }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              style={{
                borderRadius: 0,
                width: '100%',
                height: 150,
                margin: 0,
                backgroundColor: '#fff',
                marginBottom: 20,
              }}
            >
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
              {activeStep === 0 && (
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
              )}

              {activeStep === 1 && (
                <TextField
                  variant="outlined"
                  margin="normal"
                  size="small"
                  fullWidth
                  label="Код из смс"
                  name="code"
                  autoComplete="code"
                  autoFocus
                  value={code}
                  inputProps={{ maxLength: 4 }}
                  onChange={handleSetCode}
                />
              )}

              {activeStep === 2 && (
                <>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    size="small"
                    fullWidth
                    name="password"
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
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
                            {showPassword ? (
                              <EyeShow style={{ fontSize: 30 }} />
                            ) : (
                              <EyeHide style={{ fontSize: 30 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onChange={handlePasswordChange}
                  />

                  <Typography variant="subtitle2" sx={{ mt: 1, fontSize: '0.8rem !important', ml: 1 }}>
                    Пароль должен содержать:
                  </Typography>
                  <List dense sx={{ ml: 1 }}>
                    <ListItem disablePadding sx={{ height: '20px !important', py: 0, mb: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20, m: 0 }}>
                        <FiberManualRecordIcon style={{ fontSize: 10, color: isMinLength ? '#c03' : '#bbb' }} color="disabled" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Не менее 8 символов"
                        primaryTypographyProps={{
                          variant: 'caption',
                          sx: {
                            fontSize: '0.8rem !important',
                            m: 0,
                            p: 0,
                            color: isMinLength ? '#c03' : 'text.secondary',
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ height: '20px !important', py: 0, mb: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20, m: 0 }}>
                        <FiberManualRecordIcon style={{ fontSize: 10, color: hasNumber ? '#c03' : '#bbb' }} color="disabled" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Цифры"
                        primaryTypographyProps={{
                          variant: 'caption',
                          sx: {
                            fontSize: '0.8rem !important',
                            m: 0,
                            p: 0,
                            color: hasNumber ? '#c03' : 'text.secondary',
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ height: '20px !important', py: 0, mb: 0 }}>
                      <ListItemIcon sx={{ minWidth: 20, m: 0 }}>
                        <FiberManualRecordIcon style={{ fontSize: 10, color: hasMixedCase ? '#c03' : '#bbb' }} color="disabled" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Буквы верхнего и нижнего регистра"
                        primaryTypographyProps={{
                          variant: 'caption',
                          sx: {
                            fontSize: '0.8rem !important',
                            m: 0,
                            p: 0,
                            color: hasMixedCase ? '#c03' : 'text.secondary',
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </>
              )}

              <Button
                fullWidth
                variant={isButtonDisabled() ? 'outlined' : 'contained'}
                color="primary"
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={handleNextStep}
                disabled={isButtonDisabled()}
              >
                Дальше
              </Button>

              <Grid container style={{ marginTop: 10 }}>
                <Grid>
                  <Link href="/auth" style={{ color: '#c03' }}>
                    Вернуться к авторизации
                  </Link>
                </Grid>
              </Grid>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
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
