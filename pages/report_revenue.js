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

import { MyDatePickerNew, MyAlert, formatDate, MyAutocomplite } from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru'); 

class ReportRevenue_Table extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      JSON.stringify(this.props.months) !== JSON.stringify(nextProps.months) ||
      JSON.stringify(this.props.cats) !== JSON.stringify(nextProps.cats)
    );
  }

  formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

  formatCurrency = (num) => new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(num);

  getRowTotal = (data) => data.reduce(
    (acc, d) => ({
      count: acc.count + d.count,
      price: acc.price + d.price
    }),
    { count: 0, price: 0 }
  );

  calculateGrandTotals(months, cats) {
    const grandTotals = {
      months: months.map(() => ({ count: 0, price: 0 })),
      overall: { count: 0, price: 0 }
    };

    cats.forEach(cat => {
      cat.items?.forEach(item => {
        item.data.forEach((d, i) => {
          grandTotals.months[i].count += d.count;
          grandTotals.months[i].price += d.price;
          grandTotals.overall.count += d.count;
          grandTotals.overall.price += d.price;
        });
      });
    });

    return grandTotals;
  }

  render() {
    const { months, cats } = this.props;
    const totalCols = 1 + (2 * months.length) + 2;
    const grandTotals = this.calculateGrandTotals(months, cats);

    return (
      <TableContainer sx={{ maxHeight: 650, overflow: 'auto', p: 0, m: 0, pb: 5 }}>
        <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0, '& .MuiTableCell-root': { textAlign: 'center', whiteSpace: 'nowrap' } }}>

          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#fff' }}>
            <TableRow sx={{ height: 40 }}>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 11, backgroundColor: '#fff', minWidth: 200, width: 400, textAlign: 'left !important' }}>
                Название
              </TableCell>
              {months.map(month => (
                <TableCell key={month} colSpan={2} align="center" sx={{ minWidth: 240 }}>
                  {dayjs(month + '-01').format('MMMM YYYY').replace(/^./, m => m.toUpperCase())}
                </TableCell>
              ))}
              <TableCell colSpan={2} align="center" sx={{ minWidth: 240 }}>
                Итого
              </TableCell>
            </TableRow>

            <TableRow sx={{ height: 40 }}>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 11, backgroundColor: '#fff', minWidth: 200 }} />

              {months.map((_, idx) => (
                <React.Fragment key={idx}>
                  <TableCell align="center">Кол-во, шт</TableCell>
                  <TableCell align="center">Выручка, руб</TableCell>
                </React.Fragment>
              ))}

              <TableCell align="center">Кол-во, шт</TableCell>
              <TableCell align="center">Выручка, руб</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cats.map(cat => cat.items?.length ? (
              <React.Fragment key={cat.id}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', position: 'sticky', left: 0, textAlign: 'left !important' }}>{cat.name}</TableCell>
                  <TableCell colSpan={totalCols - 1} sx={{ backgroundColor: '#f5f5f5' }} />
                </TableRow>

                {cat.items.map(item => {
                  const rowTotal = this.getRowTotal(item.data);
                  return (
                    <TableRow key={item.id}>
                      <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: '#fff', boxShadow: '2px 0 5px -2px rgba(0,0,0,0.05)', minWidth: 200, textAlign: 'left !important' }}>
                        {item.name}
                      </TableCell>
                      {item.data.map((d, idx) => (
                        <React.Fragment key={idx}>
                          <TableCell>{d.count ? this.formatNumber(d.count) : 0}</TableCell>
                          <TableCell>{d.price ? this.formatCurrency(d.price) : 0}</TableCell>
                        </React.Fragment>
                      ))}
                      <TableCell>{rowTotal.count ? this.formatNumber(rowTotal.count) : 0}</TableCell>
                      <TableCell>{rowTotal.price ? this.formatCurrency(rowTotal.price) : 0}</TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ) : null)}

            <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0', position: 'sticky', left: 0 }}>Итого</TableCell>

              {grandTotals.months.map((total, idx) => (
                <React.Fragment key={idx}>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>{total.count ? this.formatNumber(total.count) : 0}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>{total.price ? this.formatCurrency(total.price) : 0}</TableCell>
                </React.Fragment>
              ))}

              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>{grandTotals.overall.count ? this.formatNumber(grandTotals.overall.count) : 0}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>{grandTotals.overall.price ? this.formatCurrency(grandTotals.overall.price) : 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

class ReportRevenue_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'report_revenue',
      module_name: '',
      is_load: false,
      
      points: [],
      point: [],

      openAlert: false,
      err_status: false,
      err_text: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
    
      cats: [],
      cat: [],

      months: [],
      reportCats: []
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      points: data.points,
      cats: data.cats,
      module_name: data.module_info.name,
    });
    
    document.title = data.module_info.name;
  }
  
  getData = (method, data = {}, dop_type = {}) => {
       
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data, dop_type)
    .then(result => {

      if(method === 'export_file_xls') {
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

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };
   
  changePoints = (key, event, value) => {
    this.setState({
      [key]: value
    });
  };

  changeDateRange = (key, newDate) => {
    this.setState({
      [key]: formatDate(newDate)
    });
  };

  changeCategory = (event, newValue) => {
    const oldValue = this.state.cat;

    const hadAllBefore = oldValue.some(item => item.id === -1);
    const hasAllNow = newValue.some(item => item.id === -1);
  
    if (!hadAllBefore && hasAllNow) {
      newValue = newValue.filter(item => item.id === -1);
    } else if (hadAllBefore && hasAllNow) {
      newValue = newValue.filter(item => item.id !== -1);
    }
  
    this.setState({ cat: newValue });
  };

  get_report = async () => {
    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, 'Необходимо выбрать точку');
      return;
    }

    if (!cat.length) {
      this.openAlert(false, 'Необходимо выбрать категорию');
      return;
    }

    const data = {
      date_start: dayjs(date_start).format('YYYY-MM-DD'),
      date_end: dayjs(date_end).format('YYYY-MM-DD'),
      points: point,
      cats: cat.map(item => item.id),
    };

    const res = await this.getData('get_report', data);

    if (res.st) {

      this.setState({
        months: res.months,
        reportCats: res.cats
      });
      
    } else {
      this.openAlert(false, res.text);
    }
  };

  downLoad = async () => {

    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, 'Необходимо выбрать точку');
      return;
    }

    if (!cat.length) {
      this.openAlert(false, 'Необходимо выбрать категорию');
      return;
    }

    date_start = dayjs(date_start).format('YYYY-MM-DD');
    date_end = dayjs(date_end).format('YYYY-MM-DD');

    const data = {
      date_start,
      date_end,
      points: point,
      cats: cat.map(item => item.id),
    };

    const dop_type = {
      responseType: 'blob',
    }

    const res = await this.getData('export_file_xls', data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Отчет о выручке за период ${date_start}_${date_end}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    const { is_load, openAlert, err_status, err_text, module_name, date_start, date_end, points, point, cats, cat, months, reportCats } = this.state;

    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Дата от"
              value={date_start}
              func={newDate => this.changeDateRange('date_start', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyDatePickerNew
              label="Дата до"
              value={date_end}
              func={newDate => this.changeDateRange('date_end', newDate)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Точка"
              multiple={true}
              data={points}
              value={point}
              func={(event, value) => this.changePoints('point', event, value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              label="Категории"
              multiple={true}
              data={cats}
              value={cat}
              func={this.changeCategory}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" onClick={this.get_report}>
              Показать
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant={!(months.length && reportCats.length) ? "outlined" : "contained"} onClick={this.downLoad} disabled={!(months.length && reportCats.length)}>
              Скачать таблицу в XLS
            </Button>
          </Grid>

          {months.length && reportCats.length ? (
            <Grid item xs={12} sm={12} mt={3}>
              <ReportRevenue_Table months={months} cats={reportCats} />
            </Grid>
          ) : null}

        </Grid>
      </>
    );
  }
}

export default function ReportRevenue() {
  return <ReportRevenue_ />;
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
