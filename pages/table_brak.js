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

import { MySelect, MyDatePickerNew, formatDate, MyAlert, MyTextInput } from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

class TableBrak_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'table_brak',
      module_name: '',
      is_load: false,

      points: [],
      point: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      items: [],
      itemsCopy: [],

      openAlert: false,
      err_status: true,
      err_text: '',

      searchItem: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.points,
      point: data.points[0].id,
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

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  async getStat() {
    const point_id = this.state.point;
    const date_start = dayjs(this.state.date_start).format('YYYY-MM-DD');
    const date_end = dayjs(this.state.date_end).format('YYYY-MM-DD');

    const data = {
      date_start,
      date_end,
      point_id,
    };

    const res = await this.getData('get_stat', data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    } else {
      const url = 'https://jacochef.ru/api/point_' + point_id + '_start_' + date_start + '_end_' + date_end + '.xls';

      this.setState({
        url,
        items: res.items,
        itemsCopy: res.items,
      });
    }
  }

  onDownload() {
    const url = this.state.url;
    const link = document.createElement('a');
    link.href = url;
    link.click();
  }

  search(event) {
    const searchItem = event.target.value;

    const items = this.state.itemsCopy;

    const itemsFilter = items.filter((item) => searchItem ? item.order_id.includes(searchItem) : item);

    this.setState({
      searchItem,
      items: itemsFilter,
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
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              is_none={false}
              label="Точка"
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, 'point')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.getStat.bind(this)} variant="contained">
              Обновить
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyTextInput
              type="number"
              label="Поиск по номеру заказа"
              value={this.state.searchItem}
              func={this.search.bind(this)}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant={this.state.items.length ? 'contained' : 'outlined'}
              color="success"
              onClick={this.onDownload.bind(this)}
              disabled={!this.state.items.length}
            >
              Скачать Excel
            </Button>
          </Grid>

          {/* таблица */}
          {!this.state.items.length ? null : (
            <Grid item xs={12} sm={12} mt={5}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell>Номер заказа</TableCell>
                      <TableCell>Дата и час изготовления блюда</TableCell>
                      <TableCell>Время снятия бракеража</TableCell>
                      <TableCell>Наименование блюда, кулинарного изделия</TableCell>
                      <TableCell>Результаты органолептической оценки</TableCell>
                      <TableCell>Разрешение к реалезации блюда, кулинарного изделия</TableCell>
                      <TableCell>ФИО лица, проводившего бракераж</TableCell>
                      <TableCell>ФИО повара</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.items.map((item, key) => (
                      <TableRow hover key={key}>
                        <TableCell>{item.order_id}</TableCell>
                        <TableCell>{item.povar_time}</TableCell>
                        <TableCell>{item.manager_time}</TableCell>
                        <TableCell>{item.pos_name}</TableCell>
                        <TableCell>Внешний вид, вкус и запах - свойственны данному блюду</TableCell>
                        <TableCell>Разрешено к реалезиции</TableCell>
                        <TableCell>{item.manager_name}</TableCell>
                        <TableCell>{item.povar_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function TableBrak() {
  return <TableBrak_ />;
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