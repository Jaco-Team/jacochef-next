import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';

import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';

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

import {MyCheckBox, MyTextInput, MyAutocomplite, MyDatePickerNew, MyAlert, formatDate, MySelect} from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';
import dayjs from 'dayjs';

class ReceptModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'order_return',
      module_name: '',
      is_load: false,

      cities: [],
      city: null,

      order: '',
  
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');
    console.log("🚀 === componentDidMount data:", data);

    this.setState({
      module_name: data.module_info.name,
      cities: data.cities
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
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

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeInput(data, type, event) {

    if(type === 'clear') {

      this.setState({
        [data]: ''
      })

    } else {

      let value = event.target.value;

      this.setState({
        [data]: value
      });

    }
    
  }

  async getOrders() {
    const order = this.state.order;
    const city = this.state.city;

    if (!city) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;
    } 

    if (!order) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать номер заказа'
      });

      return;
    } 

    const data = {
      city: city.id,
      order
    }

    console.log("🚀 === get_orders data:", data);

    const res = await this.getData('get_orders', data);

    console.log("🚀 === get_orders res:", res);

    // if (res.st) {

    //   if(!res.clients.length) {

    //     this.setState({
    //       openAlert: true,
    //       err_status: false,
    //       err_text: 'Клиенты с таким номером не найдены'
    //     });

    //   }

    //   this.setState({
    //     clients: res.clients
    //   });
      
    // } else {

    //   this.setState({
    //     openAlert: true,
    //     err_status: res.st,
    //     err_text: res.text,
    //   });

    // }

  }


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

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyAutocomplite
              label="Город"
              multiple={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeAutocomplite.bind(this, 'city')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyTextInput
              type='number'
              className="input_login"
              label="Номер заказа"
              value={this.state.order}
              func={this.changeInput.bind(this, 'order', 'edit')}
              inputAdornment={{
                endAdornment: (
                  <>
                    {!this.state.order ? null :
                      <InputAdornment position="end">
                        <IconButton>
                          <ClearIcon onClick={this.changeInput.bind(this, 'order', 'clear')} />
                        </IconButton>
                      </InputAdornment>
                    }
                  </>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.getOrders.bind(this)} variant="contained">
              Показать
            </Button>
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function ReceptModule() {
  return <ReceptModule_ />;
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
