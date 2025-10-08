import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyCheckBox, MyDatePickerNew, MyAutocomplite} from '@/components/shared/Forms';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import Tooltip from '@mui/material/Tooltip';

const SvgIconInfo = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path d="M0 0h24v24H0z"></path>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="#414a4c"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></circle>
    <path
      stroke="#414a4c"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 11v6M11.75 8V7h.5v1z"
    ></path>
  </svg>
);

import { api_laravel, api_laravel_local } from '@/src/api_new';
import dayjs from 'dayjs';
import MyAlert from '@/components/shared/MyAlert';
import { formatDate } from '@/src/helpers/ui/formatDate';

function Row(props) {
  const { row, open, onToggle } = props;

  const [showMore, setShowMore] = React.useState(false);

  const handleClick = () => {
    onToggle(row.name);

    if (row?.arr.length === 0) {
      props.getData(row?.name)
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleClick}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row?.name} <CompositionOfOrders_Tooltip title={row?.title} />
        </TableCell>
        <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(parseInt(row?.count))}</TableCell>
        <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(row?.count_percent)}%</TableCell>
        <TableCell align="right" style={{ paddingRight: 10 }}>{ new Intl.NumberFormat('ru-RU').format(row?.price)}</TableCell>
        <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(row?.price_percent)}%</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              
              <Table size="small">
                <TableHead style={{ backgroundColor: '#e6e6e6' }}>
                  <TableRow>
                    <TableCell style={{ }}>Группа</TableCell>
                    <TableCell align="right">Заказов, шт.</TableCell>
                    <TableCell align="right">Доля в заказах</TableCell>
                    <TableCell align="right">Выручка, руб.</TableCell>
                    <TableCell align="right">Доля в выручке, руб.</TableCell>
                    <TableCell align="right">Промокод</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row?.arr_main?.map((historyRow) => (
                    <TableRow key={historyRow.full_group}>
                      <TableCell>{historyRow.full_group}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(parseInt(historyRow?.count))}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(historyRow?.count_percent)}%</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{ new Intl.NumberFormat('ru-RU').format(historyRow?.sum_orders)}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(historyRow?.sum_percent)}%</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{historyRow?.promo_name}</TableCell>
                    </TableRow>
                  ))}

                  { showMore === false ?
                    <TableRow onClick={() => setShowMore(true)} style={{ cursor: 'pointer' }}>
                      <TableCell>{ showMore === false ? 'Показать больше' : 'Показать меньше' }</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                      :
                    false
                  }

                  {row?.arr_dop?.map((historyRow) => (
                    <TableRow key={historyRow.full_group} style={{ display: showMore === true ? 'table-row' : 'none' }}>
                      <TableCell>{historyRow.full_group}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(parseInt(historyRow?.count))}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(historyRow?.count_percent)}%</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{ new Intl.NumberFormat('ru-RU').format(historyRow?.sum_orders)}</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{new Intl.NumberFormat('ru-RU').format(historyRow?.sum_percent)}%</TableCell>
                      <TableCell align="right" style={{ paddingRight: 10 }}>{historyRow?.promo_name}</TableCell>
                    </TableRow>
                  ))}

                  { showMore === true ?
                    <TableRow onClick={() => setShowMore(false)} style={{ cursor: 'pointer' }}>
                      <TableCell>{ showMore === false ? 'Показать больше' : 'Показать меньше' }</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                      :
                    false
                  }
                </TableBody>
                
              </Table>



              
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function CompositionOfOrders_Tooltip({title}) {
  return (
    <Tooltip title={title}>
      <IconButton>
        <SvgIconInfo style={{ verticalAlign: 'bottom' }} />
      </IconButton>
    </Tooltip>
  );
}

function CompositionOfOrders_IconSort({type}) {
  return (
    <>
      {type == 'none' ? false : type == 'asc' ? <ArrowDownwardIcon style={{ verticalAlign: 'middle' }} /> : <ArrowUpwardIcon style={{ verticalAlign: 'middle' }} />}
    </>
  );
}

class CompositionOfOrders_ extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      module: 'composition_of_orders',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      points: [],
      point: [],

      dows: [
        { id: 1, name: 'Пн' },
        { id: 2, name: 'Вт' },
        { id: 3, name: 'Ср' },
        { id: 4, name: 'Чт' },
        { id: 5, name: 'Пт' },
        { id: 6, name: 'Сб' },
        { id: 7, name: 'Вс' },
      ],
      dow: [],

      pays: [
        { id: 1, name: 'Доставка - Нал.' },
        { id: 2, name: 'Доставка - Безнал.' },
        { id: 3, name: 'Самовывоз - Нал.' },
        { id: 4, name: 'Самовывоз - Безнал.' },
        { id: 5, name: 'Зал - Нал.' },
        { id: 6, name: 'Зал - Безнал.' },
        { id: 7, name: 'Зал с собой - Нал.' },
        { id: 8, name: 'Зал с собой - Безнал.' },
      ],
      pay: [],

      fullScreen: false,
      activeTab: 0,

      stat: [],

      now_time: 0,
      pred_time: 0,

      all_price: 0,
      all_count: 0,

      sort_count: 'asc',
      sort_count_percent: 'asc',
      sort_price_percent: 'desc',
      sort_price: 'asc',

      openRows: {},
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.points,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
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

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeItemChecked(data, event) {
    this.setState({
      [data]: event.target.checked === true ? 1 : 0,
    });
  }

  async get_stat_orders() {
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = this.state;

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать точки',
      });

      return;
    }

    const data = {
      date_start: date_start ? dayjs(date_start).format('YYYY-MM-DD') : '',
      date_end: date_end ? dayjs(date_end).format('YYYY-MM-DD') : '',
      point,
      dow,
      pay,
      now_time,
      pred_time
    };

    let res = await this.getData('get_stat_orders', data);
    
    this.setState({
      stat: res?.res,
      all_price: res?.all_price,
      all_count: res?.all_count,

      sort_count: 'asc',
      sort_count_percent: 'asc',
      sort_price_percent: 'desc',
      sort_price: 'asc',
    });

    this.resetOpenRows();
  }

  async getDataRow(row_name){
    const { point, dow, date_start, date_end, pay, now_time, pred_time, stat } = this.state;

    const data = {
      date_start: date_start ? dayjs(date_start).format('YYYY-MM-DD') : '',
      date_end: date_end ? dayjs(date_end).format('YYYY-MM-DD') : '',
      point,
      dow,
      pay,
      now_time,
      pred_time,
      row_name
    };

    let res = await this.getData('get_stat_orders_row', data);
    
    const newStat = stat.map(item =>
      item.name === row_name
        ? {
            ...item,
            arr_main: res?.array.slice(0, 20),
            arr_dop: res?.array.slice(20),
            arr: res?.array
          }
        : item
    );
    
    console.log( newStat )

    this.setState({ stat: newStat });

    // this.setState({
      // stat: stat,
      // all_price: res?.all_price,
      // all_count: res?.all_count,
    //});
  }

  get_new_type_sort(active){
    if( active == 'none' ){
      return 'desc';
    }
    
    if( active == 'asc' ){
      return 'desc';
    }else{
      return 'asc';
    }
  }

  sort(type){
    console.log( 'sort', type )

    if( type == 'sort_count' ){

      let type_sort = this.get_new_type_sort(this.state.sort_count);

      this.setState({ 
        sort_count: type_sort, 
        sort_count_percent: 'asc',
        sort_price_percent: 'asc',
        sort_price: 'asc',

        stat: type_sort == 'asc' ? this.state.stat.sort((a, b) => parseInt(a.count) - parseInt(b.count)) : this.state.stat.sort((a, b) => parseInt(b.count) - parseInt(a.count)),
      });
    }

    if( type == 'sort_count_percent' ){

      let type_sort = this.get_new_type_sort(this.state.sort_count_percent);

      this.setState({ 
        sort_count: 'asc',
        sort_count_percent: type_sort,
        sort_price_percent: 'asc',
        sort_price: 'asc',

        stat: type_sort == 'asc' ? this.state.stat.sort((a, b) => parseInt(a.count_percent) - parseInt(b.count_percent)) : this.state.stat.sort((a, b) => parseInt(b.count_percent) - parseInt(a.count_percent)),
      });
    }

    if( type == 'sort_price_percent' ){

      let type_sort = this.get_new_type_sort(this.state.sort_price_percent);

      this.setState({ 
        sort_count: 'asc',
        sort_count_percent: 'asc',
        sort_price_percent: type_sort, 
        sort_price: 'asc',

        stat: type_sort == 'asc' ? this.state.stat.sort((a, b) => parseInt(a.price_percent) - parseInt(b.price_percent)) : this.state.stat.sort((a, b) => parseInt(b.price_percent) - parseInt(a.price_percent)),
      });
    }

    if( type == 'sort_price' ){

      let type_sort = this.get_new_type_sort(this.state.sort_price);

      this.setState({ 
        sort_count: 'asc',
        sort_count_percent: 'asc',
        sort_price_percent: 'asc',
        sort_price: type_sort, 

        stat: type_sort == 'asc' ? this.state.stat.sort((a, b) => parseInt(a.price) - parseInt(b.price)) : this.state.stat.sort((a, b) => parseInt(b.price) - parseInt(a.price)),
      });
    }
  }

  resetOpenRows = () => {
    const openRows = {};

    this.state.stat.forEach(row => {
      openRows[row.name] = false;
    });
    
    this.setState({ openRows });
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
        <Grid container spacing={3} mb={3} className="container_first_child">
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <MyAutocomplite
              label="Точка"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changeAutocomplite.bind(this, 'point')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <MyAutocomplite
              label="День недели"
              multiple={true}
              data={this.state.dows}
              value={this.state.dow}
              func={this.changeAutocomplite.bind(this, 'dow')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <MyAutocomplite
              label="Способ оплаты"
              multiple={true}
              data={this.state.pays}
              value={this.state.pay}
              func={this.changeAutocomplite.bind(this, 'pay')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2
            }}>
            <MyCheckBox
              label="Оформлен на ближайшее время"
              value={parseInt(this.state.now_time) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, 'now_time')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2
            }}>
            <MyCheckBox
              label="Оформлен предзаказ"
              value={parseInt(this.state.pred_time) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, 'pred_time')}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button onClick={this.get_stat_orders.bind(this)} variant="contained" disableElevation>
              Показать
            </Button>
          </Grid>

          
          <Grid
            style={{ marginBottom: 100 }}
            size={{
              xs: 12,
              sm: 12
            }}>
            
            <Table aria-label="collapsible table">
              <TableHead style={{ backgroundColor: '#e6e6e6' }}>
                <TableRow>
                  <TableCell style={{ }} />
                  <TableCell style={{ }}>Позиция меню <CompositionOfOrders_Tooltip title={'Берутся к учёту только те заказы, в которых есть то, что написано ниже списком. Блюда берутся в единственном и множественном числе.'} /></TableCell>
                  <TableCell align="right" style={{ }}><span style={{ cursor: 'pointer' }} onClick={ this.sort.bind(this, 'sort_count') }><CompositionOfOrders_IconSort type={this.state.sort_count} /></span> Заказов, шт. <CompositionOfOrders_Tooltip title={'Общее количество таких заказов'} /></TableCell>
                  <TableCell align="right" style={{ }}><span style={{ cursor: 'pointer' }} onClick={ this.sort.bind(this, 'sort_count_percent') }><CompositionOfOrders_IconSort type={this.state.sort_count_percent} /></span> Доля в заказах <CompositionOfOrders_Tooltip title={'% от общего количества таких заказов'} /></TableCell>
                  <TableCell align="right" style={{ }}><span style={{ cursor: 'pointer' }} onClick={ this.sort.bind(this, 'sort_price') }><CompositionOfOrders_IconSort type={this.state.sort_price} /></span> Выручка, руб. <CompositionOfOrders_Tooltip title={'Общая выручка таких заказов в руб.'} /></TableCell>
                  <TableCell align="right" style={{ }}><span style={{ cursor: 'pointer' }} onClick={ this.sort.bind(this, 'sort_price_percent') }><CompositionOfOrders_IconSort type={this.state.sort_price_percent} /></span> Доля в выручке, руб. <CompositionOfOrders_Tooltip title={'% от общей суммы выручки таких заказов'} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.stat.map((row) => (
                  <Row
                    key={row.name}
                    row={row}
                    open={this.state.openRows[row.name] || false}
                    getData={this.getDataRow.bind(this)}
                    onToggle={(rowName) => {
                      this.setState((prevState) => ({
                        openRows: {
                          ...prevState.openRows,
                          [rowName]: !prevState.openRows[rowName],
                        },
                      }));
                    }}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell style={{ borderBottom: 0 }}></TableCell>
                  <TableCell style={{ borderBottom: 0 }}>Итого</TableCell>
                  <TableCell align="right" style={{ paddingRight: 10, borderBottom: 0 }}>{new Intl.NumberFormat('ru-RU').format(parseInt(this.state.all_count)) }</TableCell>
                  <TableCell align="right" style={{ paddingRight: 10, borderBottom: 0 }}>100%</TableCell>
                  <TableCell align="right" style={{ paddingRight: 10, borderBottom: 0 }}>{new Intl.NumberFormat('ru-RU').format(parseInt(this.state.all_price)) }</TableCell>
                  <TableCell align="right" style={{ paddingRight: 10, borderBottom: 0 }}>100%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
              
          </Grid>
          
        </Grid>
      </>
    );
  }
}

export default function CompositionOfOrders() {
  return <CompositionOfOrders_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=3600'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  };
}
