import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MySelect, MyDatePickerNew, formatDate } from '@/ui/elements';

import dayjs from 'dayjs';

import { api } from '@/src/api_new';

class StatTimeOrders_Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.ItemTab !== this.props.ItemTab || nextProps.data !== this.props.data;
  }

  checkColor(color = ''){
    if(color == 'red' || color == 'pink'){
      return '#d5265b';
    }

    if(color == 'yellow' || color == 'light_pink' ){
      return '#ffba00';
    }

    if(color == 'black' ){
      return '#000';
    }

    return color;
  }

  render() {
    const { ItemTab, data, getDataCellOrder, getDataCellCount, getDataCellUser } = this.props;

    return (
      <TabPanel value={ItemTab} style={{ padding: '24px 0' }}>
        <TableContainer sx={{ maxHeight: { xs: 'none', sm: 1000 } }}>
          <Table stickyHeader size="small">
            <TableHead style={{ position: 'sticky', top: 0, zIndex: 7 }}>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell sx={{ zIndex: 30, minWidth: 100 }}>Сотрудник</TableCell>
                <TableCell sx={{ zIndex: 30, minWidth: 100 }}>Должность</TableCell>
                {data?.hours.map((item, key) => (
                  <TableCell key={key} sx={{ zIndex: 30, minWidth: 50 }}>{item.h}</TableCell>
                ))}
                <TableCell sx={{ zIndex: 30, minWidth: 100 }}>Всего</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.users.map((item, key) => (
                <TableRow key={key} hover>
                  <TableCell
                    style={{ backgroundColor: ItemTab === '1' ? item.my_color_day ? this.checkColor(item.my_color_day) : null : null,
                             color: ItemTab === '1' ? item.my_color_day ? '#fff' : '#000' : '#000'}}
                  >
                    {item.user_name}
                  </TableCell>
                  <TableCell style={{ borderRight: '1px solid #e5e5e5' }}>
                    {item.app_name}{' '}{ItemTab === '1' ? item?.new_app_name ? `(${item?.new_app_name})` : null : null}
                  </TableCell>
                  {data?.hours.map((it) => getDataCellUser(it.h, item.user_id, key))}
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {ItemTab === '1' ? item.all_time_all
                      : ItemTab === '2' ? item.povar_time_all
                      : ItemTab === '3' ? item.kassir_time_all
                      : ItemTab === '4' ? item.work_time_all
                      : ItemTab === '5' ? item.pf_work_time_all
                      : null}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell sx={{ border: 'none' }}></TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Загруженность</TableCell>
                {data?.hours.map((item, key) => (
                  <TableCell key={key} sx={{ fontWeight: 'bold', border: 'none' }}>
                    {ItemTab === '1' ? item?.all_time_h
                      : ItemTab === '2' ? item?.povar_time_h
                      : ItemTab === '3' ? item?.kassir_time_h
                      : ItemTab === '4' ? item?.work_time_h
                      : ItemTab === '5' ? item?.pf_work_time_h
                      : null}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>
                  {ItemTab === '1' ? data?.all_load_time
                    : ItemTab === '2' ? data?.all_povar_time
                    : ItemTab === '3' ? data?.all_kassit_time
                    : ItemTab === '4' ? data?.all_work_time
                    : ItemTab === '5' ? data?.all_pf_work_time
                    : null}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ border: 'none' }}></TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Заказов</TableCell>
                {data?.hours.map((item, key) => getDataCellOrder(item.h, key))}
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>{data?.full_time_orders}</TableCell>
              </TableRow>

              {ItemTab === '2' ? (
                <>
                  <TableRow>
                    <TableCell sx={{ border: 'none' }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Сотрудников</TableCell>
                    {data?.hours.map((item, key) => getDataCellCount(item.h, key))}
                    <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>{data?.full_time_orders}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ border: 'none' }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Задержка кухни</TableCell>
                    {data?.hours.map((item, key) => (
                      <TableCell key={key} sx={{ fontWeight: 'bold', border: 'none' }}>{item.wait}</TableCell>
                    ))}
                  </TableRow>
                </>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    );
  }
}

class StatTimeOrders_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'stat_time_orders',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      date: formatDate(new Date()),
      ItemTab: '1',
      data: null,
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

    let res = api(this.state.module, method, data)
      .then(result => result.data)
      .finally( () => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  }

  changePoint(event) {
    const point = event.target.value;

    this.setState({
      point,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });
  }

  async getStat() {
    const point_id = this.state.point;
    const date = this.state.date;

    const data = {
      date: dayjs(date).format('YYYY-MM-DD'),
      point_id,
    };

    const res = await this.getData('get_stat', data);

    this.setState({
      data: res,
      ItemTab: '1',
    });
  }

  getDataCellOrder(h, key) {
    const data = this.state.data;

    const item = data.orders.find((item) => parseInt(item.h) === parseInt(h));

    return item ? 
    <TableCell key={key} sx={{ zIndex: 30, minWidth: 50, fontWeight: 'bold', border: 'none' }}>{item.time_h}</TableCell> 
    : 
    <TableCell key={key} sx={{ border: 'none' }}></TableCell>;
  }

  getDataCellCount(h, key) {
    const data = this.state.data;

    const item = data.orders.find((item) => parseInt(item.h) === parseInt(h));

    return item ? 
      <TableCell key={key} sx={{ zIndex: 30, minWidth: 50, fontWeight: 'bold', border: 'none' }}>{item.count_users}</TableCell>
      : 
      <TableCell key={key} sx={{ border: 'none' }}></TableCell>;
  }

  getDataCellUser(h, id, key) {
    const data = this.state.data;
    const ItemTab = this.state.ItemTab;

    let item = data.users.find((item) => item.user_id === id);

    if (ItemTab === '1') {
      item = item.all_time;
    }

    if (ItemTab === '2') {
      item = item.povar_time;
    }
    
    if (ItemTab === '3') {
      item = item.kassir_time;
    }

    if (ItemTab === '4') {
      item = item.work_time;
    }

    if (ItemTab === '5') {
      item = item.pf_work_time;
    }

    item = item.find((item) => item.h === h)?.time_h;

    return item ? item !== '00:00' ? 
        <TableCell key={key + id + h} style={{ borderRight: '1px solid #e5e5e5' }}>{item}</TableCell>
        :
        <TableCell key={key + id + h} style={{ borderRight: '1px solid #e5e5e5' }}></TableCell>
        : 
        <TableCell key={key + id + h} style={{ borderRight: '1px solid #e5e5e5' }}></TableCell>;
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              label="Точка"
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата"
              value={this.state.date}
              func={this.changeDateRange.bind(this, 'date')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.getStat.bind(this)} variant="contained">
              Обновить
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <TabContext value={this.state.ItemTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={this.changeTab.bind(this)} variant="scrollable" allowScrollButtonsMobile>
                  <Tab sx={{ minWidth: 'fit-content', flex: 1 }} label="Общий" value="1" />
                  <Tab sx={{ minWidth: 'fit-content', flex: 1 }} label="Повара" value="2" />
                  <Tab sx={{ minWidth: 'fit-content', flex: 1 }} label="Кассир" value="3" />
                  <Tab sx={{ minWidth: 'fit-content', flex: 1 }} label="Уборки" value="4" />
                  <Tab sx={{ minWidth: 'fit-content', flex: 1 }} label="Заготовки" value="5"/>
                </TabList>
              </Box>

              <StatTimeOrders_Table
                ItemTab={this.state.ItemTab}
                data={this.state.data}
                getDataCellOrder={this.getDataCellOrder.bind(this)}
                getDataCellCount={this.getDataCellCount.bind(this)}
                getDataCellUser={this.getDataCellUser.bind(this)}
              />
              
            </TabContext>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function StatTimeOrders() {
  return <StatTimeOrders_ />;
}
