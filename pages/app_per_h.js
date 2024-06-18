import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MySelect, MyAlert } from '@/ui/elements';

import queryString from 'query-string';

class AppPerH_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'app_per_h',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      items: [],

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    const city = {
      city_id: data.cities[0].id,
    };

    const res = await this.getData('get_one', city);

    this.setState({
      items: res.lavel_price,
      cities: data.cities,
      city: data.cities[0].id,
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

  async changeCity(event) {
    const data = {
      city_id: event.target.value,
    };

    const res = await this.getData('get_one', data);

    this.setState({
      city: event.target.value,
      items: res.lavel_price,
    });
  }

  changeItem(data, id, event) {
    const items = this.state.items;

    items.forEach((item) => {
      if (item.app_id === id) {
        item[data] = event.target.value;
      }
    });

    this.setState({
      items,
    });
  }

  async save() {
    const city_id = this.state.city;

    const app_list = this.state.items;

    const data = {
      city_id,
      app_list,
    };

    console.log(data);

    await this.getData('save_edit', data);

    this.setState({
      openAlert: true,
      err_status: true,
      err_text: 'Обновлено',
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

    const res = await this.getData('get_one', data);

    this.setState({
      items: res.lavel_price,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert 
          isOpen={this.state.openAlert} 
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} />

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Город"
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={9}>
            <Button onClick={this.save.bind(this)} variant="contained">
              Сохранить изменения
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} mt={5}>
            <span style={{backgroundColor: '#ef5350', color: '#fff', padding: '10px 15px'}}>
              Данные применяться с текущего периода
            </span>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '5%' }}>#</TableCell>
                    <TableCell style={{ width: '35%' }}>Должность</TableCell>
                    <TableCell style={{ width: '15%' }}>Оклад</TableCell>
                    <TableCell style={{ width: '15%' }}>Минимальная ставка</TableCell>
                    <TableCell style={{ width: '15%' }}>Средняя ставка</TableCell>
                    <TableCell style={{ width: '15%' }}>Максимальная ставка</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.items.map((item, key) => (
                    <TableRow key={key} hover>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell>{item.app_name}</TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.oklad}
                          func={this.changeItem.bind(this, 'oklad', item.app_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.min_price}
                          func={this.changeItem.bind(this, 'min_price', item.app_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.avg_price}
                          func={this.changeItem.bind(this, 'avg_price', item.app_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          label=""
                          value={item.max_price}
                          func={this.changeItem.bind(this, 'max_price', item.app_id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function AppPerH() {
  return <AppPerH_ />;
}
