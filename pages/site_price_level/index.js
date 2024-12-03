import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyAlert, formatDate, MyTextInput, MyDatePickerNew } from '@/ui/elements';

import { api } from '@/src/api_new';
import { ExlIcon } from '@/ui/icons';
import axios from 'axios';
import queryString from 'query-string';

import dayjs from 'dayjs';

class SitePriceLevel_Modal_New extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

      openAlert: false,
      err_status: true,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.level[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeDateRange(data, event) {
    const item = this.state.item;

    item.level[data] = event ? event : '';

    this.setState({
      item
    });
  }

  save() {
    let item = this.state.item;
    item = item.level;

    if (!item.city_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;

    } 

    if (!item.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;

    } 

    if(!item.date_start) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать дату'
      });
      
      return;
    } 

    const date_now = dayjs();
    const date_start = dayjs(item.date_start);

    if(date_start.isSame(date_now, 'day') || date_start.isBefore(date_now, 'day')){

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать будущую даты (позже сегодняшней даты)'
      });
      
      return;
    }

    item.date_start = dayjs(item.date_start).format('YYYY-MM-DD');

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState ({
      item: null,

      openAlert: false,
      err_status: true,
      err_text: ''
    });

    this.props.onClose();
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
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            {this.props.method}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <MySelect
                  is_none={false}
                  label="Город"
                  data={this.state.item ? this.state.item?.cities : []}
                  value={this.state.item ? this.state.item?.level?.city_id : ''}
                  func={this.changeItem.bind(this, 'city_id')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MyTextInput
                  label="Название"
                  value={this.state.item ? this.state.item?.level?.name : ''}
                  func={this.changeItem.bind(this, 'name')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MyDatePickerNew
                  label="Дата старта"
                  value={dayjs(this.state.item?.level?.date_start)}
                  func={this.changeDateRange.bind(this, 'date_start')}
                />
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SitePriceLevel_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'site_price_level',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      cities: [],
      city: '',

      modalDialog: false,
      fullScreen: false,

      method: '',
      mark: '',
      item: null,

      itemNew: {
        name: '',
        date_start: formatDate(new Date()),
        city_id: '',
      },

      levels: [],
      levelsCopy: [],
     
      file_import: null
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');
    console.log("🚀 === componentDidMount data:", data);

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      levels: data.levels,
      levelsCopy: data.levels,
      module_name: data.module_info.name
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, dop_type = {}) => {
    
    this.setState({
      is_load: true,
    });

    let res = api(this.state.module, method, data, dop_type)
    .then(result => {

      if(method === 'export_file_xls' || method === 'import_file_xls') {
        return result;
      } else {
        return result.data;
      }

    })
    .finally( () => {
      setTimeout(() => {
        this.setState({
          is_load: false,
        });
      }, 500);
    });

    return res;
  }

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

  changeCity(event) {
    const city = event.target.value;
    let levels = JSON.parse(JSON.stringify(this.state.levelsCopy));

    levels = levels.filter((level) => parseInt(city) !== -1 ? (parseInt(level.city_id) === parseInt(city) || parseInt(level.city_id) === -1 ) : level);

    this.setState({
      city,
      levels
    });
  }

  async openModal(method) {
    this.handleResize();

    const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

    const item = await this.getData('get_all_for_new');
    
    item.level = itemNew;

    this.setState({
      modalDialog: true,
      method,
      item
    });
  }

  async save(item) {

    const data = {
      name: item.name,
      date_start: item.date_start,
      city_id: item.city_id,
    };

    const res = await this.getData('save_new', data);

    if (!res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    } else {

      const link = document.createElement('a');
      link.href = `/site_price_level/${res?.level_id}`
      link.target = '_blank'
      link.click();

      setTimeout(async () => {
        this.update();
      }, 100);

    }
  }

  async getOneLevel(level_id) {
   
    const link = document.createElement('a');
    link.href = `/site_price_level/${level_id}`
    link.target = '_blank'
    link.click();

  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      levels: data.levels,
      levelsCopy: data.levels
    });
  }

  async downLoad() {

    const dop_type = {
      //responseType: 'arraybuffer',
      responseType: 'blob',
    }

    const res = await this.getData('export_file_xls', {}, dop_type);
    console.log("🚀 === downLoad res:", res);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Уровень цен (форма для заполнения).xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
  }

  async uploadFile({ target }) {

    const file = target.files[0];

    if(!file) {
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    // for (var pair of formData.entries()) {
    //   console.log(pair[0]);
    //   console.log(pair[1]);
    //   formData.append('file', pair[1]);
    // }

    const urlApi_dev = 'http://127.0.0.1:8000/api/site_price_level/import_file_xls';

    const this_data = queryString.stringify({
      method: 'import_file_xls', 
      module: 'site_price_level',
      version: 2,
  
      login: localStorage.getItem('token'),
      file: formData,
    })

    axios.post(urlApi_dev, this_data).then(response => console.log('response', response));

    // console.log("🚀 === uploadFile res:", res);

    // if(res.st) {
    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });

    //   setTimeout(async () => {
    //     this.update();
    //   }, 100);
    // } else {

    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });
      
    // }

  };

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <SitePriceLevel_Modal_New
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          item={this.state.item}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>

          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
              label="Город"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Button onClick={this.openModal.bind(this, 'Новый уровень цен')} variant="contained">
              Добавить
            </Button>
          </Grid>

          <Grid item xs={12} sm={4} x={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={<Typography color="inherit">{'Скачать шаблон таблицы в Excel'}</Typography>}> 
              <IconButton disableRipple sx={{ padding: 0 }}
              onClick={this.downLoad.bind(this)} 
              >
                <ExlIcon />
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={4} className='button_import'>
            <Button variant="contained" component="label">
              Загрузить файл xls
              <input type="file" hidden onChange={this.uploadFile.bind(this)} />
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ width: '10%' }}>#</TableCell>
                    <TableCell style={{ width: '30%' }}>Наименование</TableCell>
                    <TableCell style={{ width: '30%' }}>Дата старта</TableCell>
                    <TableCell style={{ width: '30%' }}>Город</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.levels.map((level, key) =>
                    <TableRow hover key={key} style={{ cursor: 'pointer' }} onClick={this.getOneLevel.bind(this, level.id)}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{level.name}</TableCell>
                      <TableCell>{level.date_start}</TableCell>
                      <TableCell>{level.city_name}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
             
        </Grid>
      </>
    );
  }
}

export default function SitePriceLevel() {
  return <SitePriceLevel_ />;
}
