import React from 'react';
import Link from 'next/link';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import ErrorIcon from '@mui/icons-material/Error';

import { MySelect, MyAutocomplite, MyAutocomplite2, MyDatePickerNew, formatDate, formatDateReverse, MyTextInput, MyCheckBox, MyAlert} from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const bill_status = [
  {
      "id": "0",
      "name": "Все",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "rgba(0, 0, 0, 0.04)",
  },
  {
      "id": "5",
      "name": "Шаблон",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#dcdcdc",
  },
  {
      "id": "2",
      "name": "Заведенная",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#ffcc00",
  },
  {
      "id": "7",
      "name": "Отправленная бухгалтеру",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#f5770a",
  },
  {
      "id": "8",
      "name": "Отправленная в 1с",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#1faee9",
  },
  {
      "id": "9",
      "name": "Вернулась из 1с",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#baacc7",
  },
  {
      "id": "1",
      "name": "Оплаченная",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#008000",
  },
  {
      "id": "10",
      "name": "Отдел закупки",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#942f3d",
  },
  {
      "id": "3",
      "name": "Удаленная",
      "sum_w_nds": "0",
      "count": "0",
      "clr": "#000000",
  }
]

const types = [
  {
    "name": "Все",
    "id": "-1"
  },
  {
    "name": "Счет",
    "id": "1"
  },
  {
    "name": "Поступление",
    "id": "2"
  },
  {
    "name": "Коррекция",
    "id": "3"
  },
  {
    "name": "Возврат",
    "id": "4"
  },
]

function MyTooltip(props) {
  const { children, name, ...other } = props;

  return (
    <Tooltip title={name} arrow placement="bottom-start"  {...other}
      componentsProps={{
        tooltip: {
          sx: { bgcolor: '#fff', color: '#000', fontSize: 16, border: '0.5px solid rgba(0, 0, 0, 0.87)',
            '& .MuiTooltip-arrow': {
              color: '#fff',
              '&::before': {
                backgroundColor: 'white',
                border: '0.5px solid black',
              },
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}

class Billing_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'billing',
      module_name: '',
      is_load: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      bill_list: [],
      status: '',

      types: [],
      type: '',

      vendors: [],
      vendorsCopy: [],
      search_vendor: '',

      points: [],
      point: [],

      number: '',

      all_items: [],
      items: [],

      billings: [],
      bills: [],

      operAlert: false,
      err_status: true,
      err_text: '',

      arrPay: {},
      count_true: 0,

      modelCheckPay: false,
      acces_bux_pay: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    // console.log('componentDidMount data', data)

    this.setState({
      module_name: 'Накладные',
      points: data.points,
      bill_list: bill_status,
      billings: bill_status,
      status: bill_status[0].id,
      types: types,
      acces_bux_pay: parseInt(data.acces_bux_pay) == 1 ? true : false,
    });

    document.title = 'Накладные';

    setTimeout(() => {
      this.getLocalStorage();
    }, 300);
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
        this.setState({
          is_load: false,
        });
      });
  };

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : null,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  async changeSelect(data, event) {

    const value = event.target.value;

    if(data === 'type') {
      const data = {
        type: value,
      }

      const res = await this.getData('get_vendors_items_list', data);

      this.setState({
        vendors: res.vendors,
        vendorsCopy: res.vendors,
        all_items: res.items,
        search_vendor: '',
        items: []
      });
    } 

    this.setState({
      [data]: value,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  changeAutocomplite(type, event, data) {
    this.setState({
      [type]: data,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  changeInput(event) {
    this.setState({
      number: event.target.value,
    });

    setTimeout(() => {
      this.setLocalStorage();
    }, 300);
  }

  setLocalStorage() {
   
    const {date_start, date_end, status, type, point, number} = this.state;

    const dateStart = date_start ? dayjs(date_start).format('YYYY-MM-DD') : null;
    const dateEnd = date_end ? dayjs(date_end).format('YYYY-MM-DD') : null;

    const data = {
      dateStart, 
      dateEnd, 
      status, 
      type, 
      point, 
      number
    }

    localStorage.setItem('main_page_bill', JSON.stringify(data));
  }

  async getLocalStorage() {

    const res = JSON.parse(localStorage.getItem('main_page_bill'));

    if(res) {
      const {dateStart, dateEnd, status, type, point, number} = res;
  
      const date_start = dateStart ? dayjs(dateStart) : null;
      const date_end = dateEnd ? dayjs(dateEnd) : null;
  
      this.setState({
        date_start,
        date_end,
        status, 
        type,
        point, 
        number
      });

      if(type && type.length) {

        const data = {
          type
        }

        const res = await this.getData('get_vendors_items_list', data);

        this.setState({
          vendors: res.vendors,
          vendorsCopy: res.vendors,
          all_items: res.items,
          search_vendor: '',
          items: []
        });

      }

      this.getBillingList();
    }
  }

  getOneBill(item) {
    const link = document.createElement('a');
    link.href = `/billing/${item?.my_type_bill}/${item?.id}/${item?.point_id}`
    //link.target = '_blank'
    link.click();

    const data = {
      type: item?.my_type_bill,
      id: item?.id,
      point_id: item?.point_id,
    }

    localStorage.setItem('one_bill', JSON.stringify(data));
  }

  // поиск/выбор поставщика
  search(event, value) {

    const search = event.target.value ? event.target.value : value ? value : '';

    const vendorsCopy = this.state.vendorsCopy;

    const vendors = vendorsCopy.filter((value) => search ? value.name.toLowerCase() === search.toLowerCase() : value);

    this.setState({
      search_vendor: search,
      vendors,
    });
  
  }

  // получение накладных по указанным фильтрам
  async getBillingList () {

    const { type, point } = this.state;

    if(type && point.length) {

      const { status, number, items, vendors, date_end, date_start } = this.state;
      
      const dateStart = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
      const dateEnd = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';
      const vendor_id = vendors.length === 1 ? vendors[0].id : '';

      const point_id = point.reduce((points, point) => {
        point = { id: point.id };
        points = [...points,...[point]];
        return points
      }, [])

      const items_id = items.reduce((items, it) => {
        it = { id: it.id };
        items = [...items,...[it]];
        return items
      }, [])

      const data = {
        date_start: dateStart,
        date_end: dateEnd,
        items: items_id,
        vendor_id,
        point_id,
        number,
        status,
        type,
      }

      const res = await this.getData('get_billing_list', data);

      let billings = this.state.billings;

      console.log( 'billings', billings )

      billings = billings.map(status => {

        if(res.svod[status.id]) {
          status.count = res.svod[status.id].count
          status.sum_w_nds = res.svod[status.id].sum_w_nds
        } else {
          status.count = 0
          status.sum_w_nds = 0
        }

        return status
      })

      const bills = res.res.map(bill => {
        bill_status.map(item => {
          if(item.id === bill.status && bill.status !== '0') {
            bill.color = item.clr
          }
        })
        
        return bill
      })

      this.setState({
        bills,
        billings,
      });

    } else {

      this.setState({
        operAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать Тип / Точку',
      });

    }
    
  }

  actionCheckBox(bill_id, point_id, bill_type, event){
    let arr_Pay = this.state.arrPay;

    arr_Pay[ bill_type + '_' + bill_id + '_' + point_id ] = {
      bill_id: bill_id,
      point_id: point_id,
      bill_type: bill_type,
      status: event.target.checked,
    };

    let count_true = Object.keys(arr_Pay).filter( it => arr_Pay[ it ]?.status === true ).length

    this.setState({ arrPay: arr_Pay, count_true });
  }

  async multiPayBill(){
    let arr_Pay = this.state.arrPay;

    let arr_true = Object.keys(arr_Pay).filter( it => arr_Pay[ it ].status === true );
    let arr_true_full = [];

    arr_true.map( item => {
      arr_true_full.push( arr_Pay[ item ] )
    } )

    const data = {
      arr_Pay: arr_true_full,
    }

    const res = await this.getData('multi_pay_bill', data);

    if( res.st === true ){
      this.getBillingList();

      this.setState({ arrPay: {}, count_true: 0, modelCheckPay: false });
    }
  }

  //onClick={this.getOneBill.bind(this, item)}

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          open={this.state.modelCheckPay}
          onClose={ () => { this.setState({ modelCheckPay: false }) } }
        >
          <DialogTitle>Подтверждение</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: 20 }}>
              Оплатить выбранные документы ?
            </DialogContentText>

          </DialogContent>
          <DialogActions style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={ () => { this.setState({ modelCheckPay: false }) } } color="error">Отмена</Button>
            <Button variant="contained" onClick={ this.multiPayBill.bind(this) } color="success">Оплатить</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button variant="contained">
              <Link style={{ color: '#fff', textDecoration: 'none' }} href="/billing/new">
                Новый документ
              </Link>
            </Button>
          </Grid> 

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата от"
              format="DD-MM-YYYY"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
              clearable={true}
              customActions={true}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyDatePickerNew
              label="Дата до"
              format="DD-MM-YYYY"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
              clearable={true}
              customActions={true}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.types}
              value={this.state.type}
              multiple={false}
              is_none={false}
              func={this.changeSelect.bind(this, 'type')}
              label="Тип"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyAutocomplite2
              label="Поставщик"
              freeSolo={true}
              multiple={false}
              data={this.state.vendors}
              value={this.state.search_vendor}
              func={this.search.bind(this)}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              data={this.state.bill_list}
              value={this.state.status}
              multiple={false}
              is_none={false}
              func={this.changeSelect.bind(this, 'status')}
              label="Статус"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyTextInput
              label="Номер накладной"
              value={this.state.number}
              func={this.changeInput.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <MyAutocomplite
              data={this.state.points}
              multiple={true}
              value={this.state.point}
              func={this.changeAutocomplite.bind(this, 'point')}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyAutocomplite
              data={this.state.all_items}
              multiple={true}
              value={this.state.items}
              func={this.changeAutocomplite.bind(this, 'items')}
              label="Товары"
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button variant="contained" onClick={this.getBillingList.bind(this)}>
              Показать
            </Button>
          </Grid>

          <Grid item xs={12} style={{ marginBottom: 20 }} sm={6}>
            <TableContainer component={Paper}>
              <Table aria-label="a dense table" size='small'>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ minWidth: '180px' }}>Тип</TableCell>
                    <TableCell>Количество</TableCell>
                    <TableCell style={{ minWidth: '150px' }}>Сумма с НДС</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.billings.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell style={{ backgroundColor: item.clr, color: key !== 0 ? '#fff' : 'rgba(0, 0, 0, 0.8)' }}>{item.name}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.sum_w_nds}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            { this.state.acces_bux_pay === true ?
              <Button variant="contained" color="success" disabled={ this.state.count_true > 0 ? false : true } onClick={ () => { this.setState({ modelCheckPay: true }) } }>
                Оплатить выбранные
              </Button>
                :
              false
            }
          </Grid>

          <Grid item xs={12} style={{ marginBottom: 40 }} sm={12}>
            <TableContainer component={Paper}>
              <Table aria-label="a dense table" size='small'>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>{ this.state.acces_bux_pay === true ? 'Оплатить' : '' }</TableCell>
                    <TableCell></TableCell>
                    
                    <TableCell>Тип</TableCell>
                    <TableCell>Номер</TableCell>
                    <TableCell style={{ minWidth: '180px' }}>Дата накладной</TableCell>
                    <TableCell style={{ minWidth: '180px' }}>Поставщик</TableCell>
                    <TableCell style={{ minWidth: '180px' }}>Сумма с НДС</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.bills.map((item, key) => (
                    <TableRow key={key} style={{ cursor: 'pointer' }}>
                      <TableCell style={{ backgroundColor: item?.color ?? '#fff', color: item?.color ? '#fff' : 'rgba(0, 0, 0, 0.87)'}} onClick={this.getOneBill.bind(this, item)}>{key + 1}</TableCell>
                      <TableCell style={ this.state.acces_bux_pay === true && parseInt(item?.status) == 9 ? { display: 'flex', justifyContent: 'center' } : {}}>
                        { this.state.acces_bux_pay === true && parseInt(item?.status) == 9 ?
                          <MyCheckBox 
                            func={this.actionCheckBox.bind(this, item.id, item.point_id, item.my_type_bill)}
                            value={ this.state.arrPay[ item.my_type_bill + '_' + item.id + '_' + item.point_id ]?.status ?? false }
                          />
                            :
                          ''
                        }

                      </TableCell>
                      <TableCell onClick={this.getOneBill.bind(this, item)}>
                        {parseInt(item.check_day) === 1 || parseInt(item.check_price) === 1 ? 
                          <MyTooltip name={item.err_items ? item.err_items : item.err_date}>
                            <Typography component="div" className="ceil_svg">
                              <ErrorIcon />
                            </Typography>
                          </MyTooltip>
                        : null}
                      </TableCell>
                      
                      <TableCell onClick={this.getOneBill.bind(this, item)}>Прих</TableCell>
                      <TableCell onClick={this.getOneBill.bind(this, item)}>{item.number}</TableCell>
                      <TableCell 
                        onClick={this.getOneBill.bind(this, item)}
                        style={{ backgroundColor: parseInt(item.check_day) === 1 ? 'rgb(204, 0, 51)' : '#fff', color: parseInt(item.check_day) === 1 ? '#fff' : 'rgba(0, 0, 0, 0.87)' }}
                      > 
                        {formatDateReverse(item.date)}
                      </TableCell>
                      <TableCell onClick={this.getOneBill.bind(this, item)}>{item.vendor_name}</TableCell>
                      <TableCell 
                        onClick={this.getOneBill.bind(this, item)}
                        style={{ backgroundColor: parseInt(item.check_price) === 1 ? 'rgb(204, 0, 51)' : '#fff', color: parseInt(item.check_price) === 1 ? '#fff' : 'rgba(0, 0, 0, 0.87)'}}
                      >
                        {item.sum_w_nds} ₽
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

export default function Billing() {
  return <Billing_ />;
}
