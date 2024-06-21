import React from 'react';
import Link from 'next/link';

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
import Paper from '@mui/material/Paper';

import {MySelect, MyAutocomplite2} from '@/ui/elements';

import queryString from 'query-string';

// главная страница
class Revizion_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'revizion',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      revList: [],
      chooseRev: '',

      items: [],
      pf: [],
      rec: [],

      all_items_list: [],
      all_for_search: [],

      itemsCopy: [],
      pfCopy: [],
      recCopy: [],
      search: '',
    };
  }

  // переменные для фильтра
  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getRevList();
    }, 10);
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

  // смена точки
  changePoint(event) {
    const data = event.target.value;

    this.setState({
      point: data,
      search: '',
    });

    setTimeout(() => {
      this.getRevList();
    }, 50);
  }

  // смена ревизии
  changeRev(event) {
    const data = event.target.value;

    this.setState({
      chooseRev: data,
      search: '',
    });

    setTimeout(() => {
      this.getDataRev();
    }, 300);
  }

  // получение списка ревизий
  async getRevList() {
    const data = {
      point_id: this.state.point,
    };

    const res = await this.getData('get_rev_list', data);

    res.length = 10;

    this.setState({
      revList: res,
      chooseRev: res.length > 0 ? res[0]['id'] : '',
    });

    if (res.length > 0) {
      setTimeout(() => {
        this.getDataRev();
      }, 300);
    }
  }

  // получение данных ревизии
  async getDataRev() {
    const data = {
      point_id: this.state.point,
      rev_id: this.state.chooseRev,
    };

    const res = await this.getData('get_data_rev', data);

    // console.log(res);

    this.setState({
      pf: res.pf,
      pfCopy: res.pf,
      rec: res.rec,
      recCopy: res.rec,
      items: res.item,
      itemsCopy: res.item,
      all_items_list: res.all,
      all_for_search: res.all_for_search,
    });
  }

  // поиск
  search(event, value) {
    const search = event.target.value ? event.target.value : value ? value : '';

    const itemsCopy = this.state.itemsCopy;

    const pfCopy = this.state.pfCopy;

    const recCopy = this.state.recCopy;

    const items = itemsCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

    const pf = pfCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

    const rec = recCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

    this.setState({
      search,
      items,
      rec,
      pf,
    });
  }

  // редактирование выбранной ревизии
  editDataRev() {
    const data = {
      point_id: this.state.point,
      rev_id: this.state.chooseRev,
    };

    localStorage.setItem('editRevData', JSON.stringify(data));

    window.location.href = '/revizion/edit';
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button variant="contained" style={{ whiteSpace: 'nowrap' }}>
              <Link style={{ color: '#fff', textDecoration: 'none' }} href="/revizion/new">
                Новая ревизия
              </Link>
            </Button>
          </Grid>

          <Grid item xs={12} sm={8}>
            <MyAutocomplite2
              label="Поиск"
              freeSolo={true}
              multiple={false}
              data={this.state.all_for_search}
              value={this.state.search}
              func={this.search.bind(this)}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              data={this.state.revList}
              value={this.state.chooseRev}
              func={this.changeRev.bind(this)}
              label="Ревизия"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              onClick={this.getDataRev.bind(this)}
              style={{ whiteSpace: 'nowrap' }}
            >
              Обновить данные
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              style={{ whiteSpace: 'nowrap' }}
              onClick={this.editDataRev.bind(this)}
              disabled={!this.state.point || !this.state.chooseRev || this.state.point === '0' ? true : false}
            >
              Редактировать ревизию
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TableContainer component={Paper}>
              <Table>
                {!this.state.items.length ? null : (
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                      <TableCell style={{ width: '60%' }}>Товар</TableCell>
                      <TableCell style={{ width: '40%' }}>Объем</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {this.state.items.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.value} {item.ei_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                {!this.state.pf.length ? null : (
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                      <TableCell style={{ width: '60%' }}>Заготовка</TableCell>
                      <TableCell style={{ width: '40%' }}>Объем</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {this.state.pf.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.value} {item.ei_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                {!this.state.rec.length ? null : (
                  <TableHead>
                    <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                      <TableCell style={{ width: '60%' }}>Рецепт</TableCell>
                      <TableCell style={{ width: '40%' }}>Объем</TableCell>
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {this.state.rec.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.value} {item.ei_name}</TableCell>
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

export default function Revizion() {
  return <Revizion_ />;
}
