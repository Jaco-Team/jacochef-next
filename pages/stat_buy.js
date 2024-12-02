import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyAlert, MySelect, MyAutocomplite, MyDatePickerNew, formatDate} from '@/ui/elements';

import queryString from 'query-string';
import moment from 'moment';

import dayjs from 'dayjs';
import 'moment/locale/ru';
moment.locale('ru');

class Stat_buy_Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.ItemTab !== this.props.ItemTab ||
      nextProps.getDataCell !== this.props.getDataCell
    );
  }

  render() {
    // console.log('render Table');
    const { ItemTab, getDataCell, catsData, unic_date } = this.props;
    return (
      <TabPanel value={ItemTab} style={{ padding: '24px 0' }} className='tender'>
        <TableContainer sx={{ maxHeight: { xs: 'none', sm: 1000 } }}>
          <Table stickyHeader size="small">
            <TableHead style={{ position: 'sticky', top: 0, zIndex: 7 }}>
              <TableRow>
                <TableCell sx={{ zIndex: 30, minWidth: 150 }}>Категория</TableCell>
                {ItemTab === '1' ? <TableCell sx={{ zIndex: 20 }}>Ед измерения</TableCell> : null}
                {unic_date.map((item, key) => (
                  <TableCell key={key} sx={{textTransform: 'capitalize', zIndex: 7, minWidth: 150}}>
                    {moment(item.date).format('MMMM YYYY')}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {catsData.map((item, key) => (
                <React.Fragment key={key}>
                  <TableRow>
                    <TableCell style={{position: 'sticky', display: 'flex', backgroundColor: '#ADD8E6'}}>
                      {item.name}
                    </TableCell>
                    <TableCell style={{ backgroundColor: '#ADD8E6' }} colSpan={`${ItemTab === '1' ? 2 + unic_date.length : 1 + unic_date.length}`}></TableCell>
                  </TableRow>

                  {item.cats.map((category, key_cat) => (
                    <React.Fragment key={key_cat}>
                      <TableRow hover sx={{'& td': {backgroundColor: '#ADD8E6', borderRight: 'none'}}}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell style={{ backgroundColor: '#ADD8E6' }} colSpan={`${ItemTab === '1' ? 2 + unic_date.length : 1 + unic_date.length}`}></TableCell>
                      </TableRow>

                      {category.items.map((item, k) => (
                        <TableRow key={k} hover>
                          <TableCell variant="head" style={{ minWidth: 150 }}>{item.name}</TableCell>
                          {ItemTab === '1' ? <TableCell>{item.ei_name}</TableCell> : null}
                          {unic_date.map((data, key) => getDataCell(item.id, data.date, key))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    );
  }
}

class Stat_buy_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'stat_buy',
      module_name: '',
      is_load: false,

      points: [],
      point: [],

      cats: [],
      cat: '',

      catsData: [],
      unic_date: [],
      items: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      ItemTab: '1',

      url: null,

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      cats: data.cats,
      cat: data.cats[0].id,
      points: data.points,

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

  changeCat(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changePoint(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? (event) : '',
    });
  }

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });
  }

  async getItems() {
    const points = this.state.point;

    if (!points.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Выберите точку!',
      });

      return;
    }
    
    const data = {
      cat: {
        id: this.state.cat,
      },
      points,
      date_start  : dayjs(this.state.date_start).format('YYYY-MM-DD'),
      date_end    : dayjs(this.state.date_end).format('YYYY-MM-DD'),
    };


    const res = await this.getData('get_items', data);

    if (!res.counts.unic_date.length || !res.counts.unic_date.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Данные за указанный период отсутствуют!',
      });

      return;
    }

    res.counts.unic_date.sort((a, b) => new Date(a.date) - new Date(b.date));

    this.setState({
      url: res.url,
      catsData: res.cats,
      unic_date: res.counts.unic_date,
      items: res.counts.items,
    });
  }

  getDataCell(id, date, key) {
    const items = this.state.items;

    const ItemTab = this.state.ItemTab;

    let item = items.find((item) => item.item_id === id && item.date === date);

    item = ItemTab === '1' ? item?.count ?? null : ItemTab === '2' ? item?.price ?? null : item?.avg_price ?? null;

    return item ? <TableCell key={key}>{item}</TableCell> : <TableCell key={key}></TableCell>;
  }

  onDownload() {
    const url = this.state.url;

    const link = document.createElement('a');
    link.href = url;
    link.click();
  }

  render() {
    console.log('render');
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

        <Grid container spacing={3} style={{ marginTop: '64px', marginBottom: '24px' }}>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, 'point')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              label="Категория"
              is_none={false}
              data={this.state.cats}
              value={this.state.cat}
              func={this.changeCat.bind(this, 'cat')}
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

          <Grid item xs={12} sm={2}>
            <Button onClick={this.getItems.bind(this)} variant="contained">
              Обновить
            </Button>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button color="success" variant="contained" onClick={this.onDownload.bind(this)} disabled={!this.state.url}>
              Скачать
            </Button>
          </Grid>

        </Grid>

        <Grid item xs={12} sm={12} style={{ padding: '0 24px' }}>
          <TabContext value={this.state.ItemTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={this.changeTab.bind(this)} variant="fullWidth">
                <Tab label="Количество" value="1" />
                <Tab label="Сумма" value="2" />
                <Tab label="Средняя цена" value="3" />
              </TabList>
            </Box>

            <Stat_buy_Table
              ItemTab={this.state.ItemTab}
              unic_date={this.state.unic_date}
              catsData={this.state.catsData}
              getDataCell={this.getDataCell.bind(this)}
            />
          </TabContext>
        </Grid>
      </>
    );
  }
}

export default function StatBuy() {
  return <Stat_buy_ />;
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