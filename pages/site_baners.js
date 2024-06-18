import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dropzone from 'dropzone';

import { MyAutocomplite, MyDatePickerNew, MySelect, TextEditor, MyTextInput, MyCheckBox, MyAlert, formatDate } from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';

class SiteBaners_Modal extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: 'image/jpeg',
    addRemoveLinks: true,
    url: 'https://jacochef.ru/src/img/site_banners/upload_img_new.php',
  };

  myDropzone = null;
  myDropzone_m = null;
  isInit = false;
  isInit_m = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      banner: null,

      openAlert: false,
      err_status: true,
      err_text: '',

      promo_list: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.banner) {
      return;
    }

    if (this.props.banner !== prevProps.banner) {
      this.setState({
        banner: this.props.banner,
        promo_list: this.props.promos,
      });

      setTimeout(() => {
        this.myDropzone = new Dropzone('#for_img_edit', this.dropzoneOptions);
        this.myDropzone_m = new Dropzone('#for_img_edit_', this.dropzoneOptions);
      }, 300);
    }
  }

  async changeItem(data, event) {
    const banner = this.state.banner;

    banner.this_ban[data] = event.target.value;

    if( data == 'city_id' ) {
      const data = {
        city_id: event.target.value
      };

      const res = await this.props.getData('get_active_promo', data);

      this.setState({
        promo_list: res.promos
      });
    }

    this.setState({
      banner,
    });
  }

  changeDateRange(data, event) {
    const banner = this.state.banner;

    banner.this_ban[data] = event ? event : '';

    this.setState({
      banner,
    });
  }

  changeAutocomplite(data, event, value) {
    const banner = this.state.banner;

    if( data == 'items' ) {
      banner.this_ban['promo_id'] = null;
    }

    if( data == 'promo_id' ) {
      banner.this_ban['items'] = [];
    }

    banner.this_ban[data] = value;

    this.setState({
      banner,
    });
  }

  changeItemText(data, value) {
    const banner = this.state.banner;

    banner.this_ban[data] = value;

    this.setState({
      banner,
    });
  }

  changeItemChecked(data, event) {
    const banner = this.state.banner;

    banner.this_ban[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      banner,
    });
  }

  async saveNew() {
    if (!this.click) {
      this.click = true;

      let banner = this.state.banner;

      banner.this_ban.items = banner.this_ban.items.reduce(
        (saveItems, item) => {
          item = { item_id: item.id };

          saveItems = [...saveItems, ...[item]];

          return saveItems;
      }, []);

      banner.this_ban.date_start = dayjs(banner.this_ban.date_start).format('YYYY-MM-DD');
      banner.this_ban.date_end = dayjs(banner.this_ban.date_end).format('YYYY-MM-DD');

      const data = banner.this_ban;

      const res = await this.props.getData('save_new', data);

      if (!res.st) {

        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });

      } else {

        if(this.myDropzone.files.length && this.myDropzone_m.files.length) {

          let save_img = false;
          let save_img_m = false;

          if (this.myDropzone['files'].length && this.isInit === false) {
            this.isInit = true;
            
            this.myDropzone.on('sending', (file, xhr, data) => {
              data.append('name', banner.this_ban.name);
              data.append('id', res.id);
              data.append('type', 'full');
            });

            this.myDropzone.on('queuecomplete', (data) => {
              var check_img = false;

              this.myDropzone['files'].map((item, key) => {
                if (item['status'] == 'error') {
                  check_img = true;
                }
              });

              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: 'Ошибка при загрузке фотографии',
                });

                return;

              } else {
                save_img = true;
              }
              this.isInit = false;
            });
          }

          if (this.myDropzone_m['files'].length && this.isInit_m === false) {
            this.isInit_m = true;

            this.myDropzone_m.on('sending', (file, xhr, data1) => {
              data1.append('name', banner.this_ban.name);
              data1.append('id', res.id);
              data1.append('type', 'mobile');
            });

            this.myDropzone_m.on('queuecomplete', (data) => {
              var check_img = false;

              this.myDropzone_m['files'].map((item, key) => {
                if (item['status'] == 'error') {
                  check_img = true;
                }
              });

              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: 'Ошибка при загрузке фотографии',
                });

                return;

              } else {
                save_img_m = true;
              }
              this.isInit_m = false;
            });
          }

          setTimeout(() => {
            if(save_img && save_img_m) {
              this.onClose(true);
            }
          }, 3000);

          this.myDropzone.processQueue();
          this.myDropzone_m.processQueue();

        } else if(this.myDropzone.files.length || this.myDropzone_m.files.length) {

          if (this.myDropzone['files'].length > 0) {

            if (this.myDropzone['files'].length > 0 && this.isInit === false) {
              this.isInit = true;
  
              this.myDropzone.on('sending', (file, xhr, data) => {
                data.append('name', banner.this_ban.name);
                data.append('id', res.id);
                data.append('type', 'full');
              });
  
              this.myDropzone.on('queuecomplete', (data) => {
                var check_img = false;
  
                this.myDropzone['files'].map((item, key) => {
                  if (item['status'] == 'error') {
                    check_img = true;
                  }
                });
  
                if (check_img) {
                  this.setState({
                    openAlert: true,
                    err_status: false,
                    err_text: 'Ошибка при загрузке фотографии',
                  });
  
                  return;
  
                } else {
  
                  setTimeout(() => {
                    this.onClose(true);
                  }, 1000);
  
                }
  
                this.isInit = false;
  
              });
            }
  
            this.myDropzone.processQueue();
  
          } 
          
          if (this.myDropzone_m['files'].length > 0) {

            if (this.myDropzone_m['files'].length > 0 && this.isInit_m === false) {
              this.isInit_m = true;
  
              this.myDropzone_m.on('sending', (file, xhr, data1) => {
                data1.append('name', banner.this_ban.name);
                data1.append('id', res.id);
                data1.append('type', 'mobile');
              });
  
              this.myDropzone_m.on('queuecomplete', (data) => {
                var check_img = false;
  
                this.myDropzone_m['files'].map((item, key) => {
                  if (item['status'] == 'error') {
                    check_img = true;
                  }
                });
  
                if (check_img) {
                  this.setState({
                    openAlert: true,
                    err_status: false,
                    err_text: 'Ошибка при загрузке фотографии',
                  });
  
                  return;
  
                } else {
  
                  setTimeout(() => {
                    this.onClose(true);
                  }, 1000);
  
                }
  
                this.isInit_m = false;
  
              });
            }
  
            this.myDropzone_m.processQueue();
  
          } 
          
        } else {
          this.onClose(true);
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);

    }
  }

  async saveEdit() {
    if (!this.click) {
      this.click = true;

      let banner = this.state.banner;

      banner.this_ban.items = banner.this_ban.items.reduce(
        (saveItems, item) => {
          item = { item_id: item.id };

          saveItems = [...saveItems, ...[item]];

          return saveItems;
      }, []);

      banner.this_ban.date_start = dayjs(banner.this_ban.date_start).format('YYYY-MM-DD');
      banner.this_ban.date_end = dayjs(banner.this_ban.date_end).format('YYYY-MM-DD');

      const data = banner.this_ban;

      const res = await this.props.getData('save_edit', data);

      if (!res.st) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });

      } else {

        if(this.myDropzone.files.length > 0 || this.myDropzone_m.files.length  > 0) {

          if (this.myDropzone['files'].length > 0) {

            if (this.myDropzone['files'].length > 0 && this.isInit === false) {
              this.isInit = true;
  
              this.myDropzone.on('sending', (file, xhr, data) => {
                data.append('name', banner.this_ban.name);
                data.append('id', res.id);
                data.append('type', 'full');
              });
  
              this.myDropzone.on('queuecomplete', (data) => {
                var check_img = false;
  
                this.myDropzone['files'].map((item, key) => {
                  if (item['status'] == 'error') {
                    check_img = true;
                  }
                });
  
                if (check_img) {
                  this.setState({
                    openAlert: true,
                    err_status: false,
                    err_text: 'Ошибка при загрузке фотографии',
                  });
  
                  return;
  
                } else {
                  setTimeout(() => {
                    this.onClose(true);
                  }, 1000);
                }
  
                this.isInit = false;
  
              });
            }
  
            this.myDropzone.processQueue();
  
          } 
          
          if (this.myDropzone_m['files'].length > 0) {
            if (this.myDropzone_m['files'].length > 0 && this.isInit_m === false) {
              this.isInit_m = true;
  
              this.myDropzone_m.on('sending', (file, xhr, data1) => {
                data1.append('name', banner.this_ban.name);
                data1.append('id', res.id);
                data1.append('type', 'mobile');
              });
  
              this.myDropzone_m.on('queuecomplete', (data) => {
                var check_img = false;
  
                this.myDropzone_m['files'].map((item, key) => {
                  if (item['status'] == 'error') {
                    check_img = true;
                  }
                });
  
                if (check_img) {
                  this.setState({
                    openAlert: true,
                    err_status: false,
                    err_text: 'Ошибка при загрузке фотографии',
                  });
  
                  return;
  
                } else {
                  setTimeout(() => {
                    this.onClose(true);
                  }, 1000);
                }
  
                this.isInit_m = false;
  
              });
            }
  
            this.myDropzone_m.processQueue();
  
          } 
          
        } else {
          this.onClose(true);
        }

      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  onClose(is_reload = false) {
    
    this.setState ({
      banner: null,

      openAlert: false,
      err_status: true,
      err_text: '',
    });

    this.props.onClose(is_reload);
  }

  render() {
    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          open={this.props.open}
          onClose={this.onClose.bind(this, false)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <DialogTitle className="button">
            {this.props.method}
            {this.props.bannerName ? `: ${this.props.bannerName}` : null}
          </DialogTitle>

          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
            <CloseIcon />
          </IconButton>

          {!this.state.banner ? null : (
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Название банера (внутреннее)"
                    value={ this.state.banner ? this.state.banner.this_ban.name : '' }
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Заголовок"
                    value={ this.state.banner ? this.state.banner.this_ban.title : '' }
                    func={this.changeItem.bind(this, 'title')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MySelect
                    is_none={false}
                    label="Город"
                    data={this.state.banner ? this.state.banner.cities : []}
                    value={this.state.banner ? this.state.banner.this_ban.city_id : ''}
                    func={this.changeItem.bind(this, 'city_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}></Grid>

                <Grid item xs={12} sm={6}>
                  <MyDatePickerNew
                    label="Дата старта"
                    value={this.state.banner ? dayjs(this.state.banner.this_ban.date_start) : ''}
                    func={this.changeDateRange.bind(this, 'date_start')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyDatePickerNew
                    label="Дата окончания"
                    value={this.state.banner ? dayjs(this.state.banner.this_ban.date_end) : ''}
                    func={this.changeDateRange.bind(this, 'date_end')}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <MyAutocomplite
                    label="Позиции (вместо промика)"
                    multiple={true}
                    data={this.state.banner ? this.state.banner.items ? this.state.banner.items : [] : []}
                    value={this.state.banner ? this.state.banner.this_ban.items ? this.state.banner.this_ban.items : [] : []}
                    func={this.changeAutocomplite.bind(this, 'items')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyAutocomplite
                    label="Промокод (вместо позиций)"
                    multiple={false}
                    data={this.state.promo_list}
                    value={this.state.banner ? this.state.banner.this_ban.promo_id ? this.state.banner.this_ban.promo_id : null : null}
                    func={this.changeAutocomplite.bind(this, 'promo_id')}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <MyCheckBox
                    label="Активность"
                    value={this.state.banner ? parseInt(this.state.banner.this_ban.is_active) == 1 ? true : false : false}
                    func={this.changeItemChecked.bind(this, 'is_active')}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <MyCheckBox
                    label="Показывать в акциях"
                    value={this.state.banner ? parseInt(this.state.banner.this_ban.is_active_actii) == 1 ? true : false : false}
                    func={this.changeItemChecked.bind(this, 'is_active_actii')}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <MyCheckBox
                    label="Показывать на главной"
                    value={this.state.banner ? parseInt(this.state.banner.this_ban.is_active_home) == 1 ? true : false : false}
                    func={this.changeItemChecked.bind(this, 'is_active_home')}
                  />
                </Grid>
                

                <Grid item xs={12} sm={6} >
                  <Typography>Картинка на ПК разрешением 3700x1000 только JPG</Typography>

                  {!this.state.banner || this.state.banner.this_ban.img.length == 0 ? null : (
                    <div style={{ height: 400, display: 'flex' }}>
                      <img style={{ width: '100%', height: 'auto', alignSelf: 'center', borderRadius: 20 }} src={'https://storage.yandexcloud.net/site-home-img/' + this.state.banner.this_ban.img + '_3700x1000.jpg?date_update=' + this.state.banner.this_ban.date_update}/>
                    </div>
                  )}

                  <div className="dropzone" id="for_img_edit" style={{ width: '100%', minHeight: 150 }}/>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography>Картинка мобильная соотношением 2:1 (например: 1000x500) только JPG</Typography>

                  {!this.state.banner || this.state.banner.this_ban.img.length == 0 ? null : (
                    <div style={{ height: 400, display: 'flex' }}>
                      <img style={{ width: '100%', height: 'auto', alignSelf: 'center', borderRadius: 40 }} src={'https://storage.yandexcloud.net/site-home-img/' + this.state.banner.this_ban.img + '_1000x500.jpg?date_update=' + this.state.banner.this_ban.date_update}/>
                    </div>
                    )}

                  <div className="dropzone" id="for_img_edit_" style={{ width: '100%', minHeight: 150 }}/>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <TextEditor
                    value={this.state.banner ? this.state.banner.this_ban.text : ''}
                    func={this.changeItemText.bind(this, 'text')}
                  />
                </Grid>
              </Grid>
            </DialogContent>
          )}
          <DialogActions>
            <Button variant="contained" onClick={this.props.mark == 'bannerEdit' ? this.saveEdit.bind(this) : this.saveNew.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SiteBaners_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_baners',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      active: [],
      non_active: [],

      fullScreen: false,

      modalDialog: false,
      method: '',
      mark: '',
      banner: null,
      bannerName: '',

      bannerNew: {
        name: '',
        text: '',
        items: [],
        img: '',
        city_id: '',
        date_start: formatDate(new Date()),
        date_end: formatDate(new Date()),
      },

      promos: [],
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      active: data.banners.active,
      non_active: data.banners.non_active,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch('https://jacochef.ru/api/index_new.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem('token'),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == 'redir') {
          window.location.pathname = '/';
          return;
        }

        if (json.st === false && json.type == 'auth') {
          window.location.pathname = '/auth';
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  async changeCity(event) {
    const city = event.target.value;

    this.setState({
      city,
    });

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async update() {
    const city_id = this.state.city;

    const data = {
      city_id,
    };

    const res = await this.getData('get_banners', data);

    this.setState({
      active: res.active,
      non_active: res.non_active,
    });
  }

  async openModal(mark, method, banner_id) {
    this.handleResize();

    if (mark === 'bannerNew') {
      const bannerNew = JSON.parse(JSON.stringify(this.state.bannerNew));

      const banner = await this.getData('get_all_for_new');

      banner.this_ban = bannerNew;

      this.setState({
        mark,
        method,
        banner,
        modalDialog: true,
        promos: []
      });
    }

    if (mark === 'bannerEdit') {
      const data = {
        banner_id,
      };

      const banner = await this.getData('get_one', data);

      banner.items.forEach((item) => {
        banner.this_ban.items = banner.this_ban.items.map((it) => {
          if (it.item_id === item.id) {
            it = { id: it.item_id, name: item.name };
          }
          return it;
        });
      });

      this.setState({
        modalDialog: true,
        method,
        mark,
        banner,
        bannerName: banner.this_ban.name,
        promos: banner.promos,
      });
    }
  }

  async changeBanner(data, it, event) {
    const active = this.state.active;

    active.forEach((item) => {
      if (item.id === it.id) {
        if (data === 'sort') {
          item[data] = event.target.value;
        } else {
          item[data] = event.target.checked === true ? 1 : 0;
        }
      }
    });

    this.setState({
      active,
    });

    const item = {
      id: it.id,
      sort: data === 'sort' ? event.target.value : it.sort,
      is_show: data === 'sort' ? it.is_active : event.target.checked === true ? 1 : 0,
    };

    await this.getData('save_sort', item);

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async changeSort(id, event) {
    const active = this.state.active;

    active.forEach((item) => {
      if (item.id === id) {
        item.sort = event.target.value;
      }
    });

    this.setState({
      active,
    });
  }

  onCloseModal(is_reload = false) {
    this.setState({
      modalDialog: false,
      bannerName: '',
    });

    if (is_reload) {
      this.update();
    }
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <SiteBaners_Modal
          open={this.state.modalDialog}
          onClose={this.onCloseModal.bind(this)}
          method={this.state.method}
          mark={this.state.mark}
          banner={this.state.banner}
          promos={this.state.promos}
          bannerName={this.state.bannerName}
          fullScreen={this.state.fullScreen}
          getData={this.getData.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}><h1>{this.state.module_name}</h1></Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              label="Город"
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModal.bind(this, 'bannerNew', 'Новый банер')} variant="contained">
              Добавить банер
            </Button>
          </Grid>

          {/* таблица активных баннеров */}
          {!this.state.active.length ? null : (
            <Grid item xs={12} sm={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={7}><h2>Активные</h2></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ width: '5%' }}>#</TableCell>
                      <TableCell style={{ width: '21%' }}>Название</TableCell>
                      <TableCell style={{ width: '10%' }}>Сорт</TableCell>
                      <TableCell style={{ width: '15%' }}>Город</TableCell>
                      <TableCell style={{ width: '17%' }}>Дата старта</TableCell>
                      <TableCell style={{ width: '17%' }}>Дата окончания</TableCell>
                      <TableCell style={{ width: '15%' }}>Активность</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.active.map((item, key) => (
                      <TableRow key={key} hover>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell onClick={this.openModal.bind(this, 'bannerEdit', 'Редактирование банера', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Grid item xs={12} sm={6}>
                            <MyTextInput
                              value={item.sort}
                              func={this.changeSort.bind(this, item.id)}
                              onBlur={this.changeBanner.bind(this, 'sort', item)}
                            />
                          </Grid>
                        </TableCell>
                        <TableCell>{item.city_name ?? 'Все города'}</TableCell>
                        <TableCell>{item.date_start}</TableCell>
                        <TableCell>{item.date_end}</TableCell>
                        <TableCell>
                          <MyCheckBox
                            value={parseInt(item.is_active) == 1 ? true : false}
                            func={this.changeBanner.bind(this, 'is_active', item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица законченные баннеров */}
          {!this.state.non_active.length ? null : (
            <Grid item xs={12} sm={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>Законченные</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ width: '100%', overflow: 'hidden' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: '5%' }}>#</TableCell>
                          <TableCell style={{ width: '25%' }}>Название</TableCell>
                          <TableCell style={{ width: '20%' }}>Город</TableCell>
                          <TableCell style={{ width: '25%' }}>Дата старта</TableCell>
                          <TableCell style={{ width: '25%' }}>Дата окончания</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.non_active.map((item, key) => (
                          <TableRow key={key} hover>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell onClick={this.openModal.bind(this, 'bannerEdit', 'Редактирование банера', item.id)} style={{ fontWeight: 700, cursor: 'pointer' }}>{item.name}</TableCell>
                            <TableCell>{item.city_name ?? 'Все города'}</TableCell>
                            <TableCell>{item.date_start}</TableCell>
                            <TableCell>{item.date_end}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function SiteBaners() {
  return <SiteBaners_ />;
}
