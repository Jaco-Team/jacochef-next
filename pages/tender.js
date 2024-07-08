import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, MySelect } from '@/ui/elements';

import queryString from 'query-string';

class TenderCell extends React.Component {
  // shouldComponentUpdate(nextProps){

  //   let array1 = Object.values(nextProps.price);
  //   let array2 = Object.values(this.props.price);

  //   let is_same = array1.length === array2.length && array1.every(function (element, index) { return element === array2[index] });

  //   return is_same;
  // }

  render() {
    const { vendor, price, item } = this.props;

    let className = 'tdprice ';

    if (price.checkTender == '1') {
      className += 'chooseCell ';
    }

    if (price.price == price.min_price) {
      className += 'minPriceCell ';
    }

    if (price.price == price.max_price) {
      className += 'maxPriceCell ';
    }

    //console.log('render');

    return (
      <TableCell
        className={className}
        style={{ cursor: 'pointer' }}
        onClick={this.props.changePrice.bind(this, vendor.id, item.id, price.price )}
      >
        {price.price}
      </TableCell>
    );
  }
}

class Tender_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'tender',
      module_name: '',
      is_load: false,

      cities: [],
      city: '',

      // url: '',

      allVendors: [],
      allTenders: [],

      tender: "",

      vendors: [],
      vendor: [],

      cats: [],

      allCats: [],
      newCat: [],

      all_price: '',
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      cities: data.cities,
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
        this.setState({
          is_load: false,
        });
      });
  };

  changeTender(event, data){
    this.setState({
      tender: data
    });
  }

  async changeCity(event) {
    const data = {
      city_id: event.target.value,
    };

    const res = await this.getData('get_vendors', data);

    this.setState({
      city: event.target.value,
      allVendors: res.vendors,
      allTenders: res.tenders,
      tender: res.tenders[0],
      allCats: res.cats,
    });
  }

  changeVendor(event, value) {
    this.setState({
      vendor: value,
      newCat: '',
    });
  }

  changeCat(event, value) {
    this.setState({
      newCat: value,
      vendor: [],
    });
  }

  async getDataTable() {
    const data = {
      city_id: this.state.city,
      vendors: this.state.vendor,
      cat: this.state.newCat,
      date: this.state.tender.name,
    };

    const res = await this.getData('get_data', data);

    // console.log('getDataTable', res);

    // передаем урл для скачивания Excel
    // this.setState({
    //   url: res.url
    // });
    this.getDataTableCell(res);
  }

  getDataTableCell(res) {
    const vendors = res.vendors;

    const items = res.vendor_items_price;

    const vendors_items = vendors.map((el) => {
      el.price = [];

      items.forEach((it) => {
        if (it.vendor_id === el.id) {
          el.price.push(it);
        }
      });

      return el;
    });

    this.setState({
      cats: res.items,
      vendors: vendors_items,
      all_price: res.all_price,
    });
  }

  changePrice(vendor_id, cat_id, price) {
    // console.log(vendor_id, cat_id, price)

    const vendors = this.state.vendors;
    const cats = this.state.cats;

    // console.log(cats);

    cats.forEach((cat) => {
      cat.cats.forEach((it) => {
        it.items.forEach((item) => {
          if (item.id === cat_id) {
            item.price = price;
            item.vendor_id = vendor_id;
          }
        });
      });
    });

    vendors.forEach((vendor) => {
      vendor.price.forEach((price) => {
        if (price.item_id === cat_id && price.vendor_id === vendor_id) {
          price.checkTender = '1';
        }
        if (price.item_id === cat_id && price.vendor_id !== vendor_id) {
          price.checkTender = '0';
        }
      });
    });

    this.setState({
      vendors,
      cats,
    });
  }

  async saveData() {
    const cats = this.state.cats;

    let items = [];

    cats.forEach((cat) => {
      cat.cats.forEach((it) => {
        it.items.forEach((item) => {
          items.push(item);
        });
      });
    });

    const data = {
      city_id: this.state.city,
      items: items,
    };

    // console.log(data);

    await this.getData('save', data);

    this.getDataTable();

    // console.log(res)
  }

  // запрос на подготовку  Excel вендора
  async downLoadVendor(vendor_id){
    const data = {
      city_id: this.state.city,
      vendor_id: vendor_id,
      date: this.state.tender['name']
    };

    const res =  await this.getData('downLoadVendor', data);

    // правка 26.12 скачивания файла в один клик
    if(res.url){
      const link = document.createElement('a');
      link.href = res.url;
      link.click();
    }
  }

  // правка 26.12 обновляем данные потом скачиваем файл
  async onDownload() {
    // const url = this.state.url;

    const data = {
      city_id: this.state.city,
      vendors: this.state.vendor,
      cat: this.state.newCat,
      date: this.state.tender.name,
    };

    const res = await this.getData('get_data', data);

    if(res?.url){
      const link = document.createElement('a');
      link.href = res.url;
      link.click();
    }
  }

  async onDownload2() {
    // const url = this.state.url;

    const data = {
      city_id: this.state.city,
      vendors: this.state.vendor,
      cat: this.state.newCat,
      date: this.state.tender.name,
    };

    const res = await this.getData('get_data2', data);

    if(res?.url){
      const link = document.createElement('a');
      link.href = res.url;
      link.click();
    }
  }

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid> 
        </Grid>

        <Grid container spacing={3} mb={3}>

          <Grid item xs={12} sm={2}>
            <MySelect
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
              label="Город"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <MyAutocomplite
              label="Тендер"
              multiple={false}
              data={this.state.allTenders}
              value={this.state.tender}
              func={this.changeTender.bind(this)}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <MyAutocomplite
              label="Поставщик"
              multiple={true}
              data={this.state.allVendors}
              value={this.state.vendor}
              func={this.changeVendor.bind(this)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <MyAutocomplite
              label="Категория"
              multiple={false}
              data={this.state.allCats}
              value={this.state.newCat}
              func={this.changeCat.bind(this)}
            />
          </Grid>


          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              style={{ whiteSpace: 'nowrap' }}
              onClick={this.getDataTable.bind(this)}
            >
              Обновить
            </Button>
          </Grid>

          <Grid item xs={12} sm={1}>
            <Button
              style={{
                whiteSpace: 'nowrap',
                backgroundColor: '#00a550',
                color: 'white',
              }}
              onClick={this.saveData.bind(this)}
            >
              Сохранить
            </Button>
          </Grid>

          <Grid item xs={12} sm={1}>
            <Button
              style={{
                whiteSpace: 'nowrap',
                backgroundColor: '#00a550',
                color: 'white',
              }}
              //onClick={this.onDownload.bind(this)}
              onClick={this.onDownload2.bind(this)}
            >
              Скачать
            </Button>
          </Grid>  
        </Grid>

        {!this.state.cats.length ? null : (
          <Grid container spacing={3} className='tender'>
            <Grid item xs={12} sm={12}>
              <TableContainer sx={{ maxHeight: { xs: 'none', sm: 1000 } }}>
                <Table stickyHeader size="small">
                  <TableHead style={{ position: 'sticky', top: 0, zIndex: 7 }}>
                    <TableRow>
                      <TableCell sx={{ zIndex: 7 }}>Средний закуп</TableCell>
                      <TableCell
                        sx={{
                          borderRight: 0,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          left: '177px',
                          zIndex: 7,
                        }}
                      >
                        {this.state.all_price}
                      </TableCell>
                      <TableCell
                        colSpan={`${2 + this.state.vendors.length * 2}`}
                      ></TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ zIndex: 3 }}>Категория</TableCell>
                      <TableCell>Выбранный</TableCell>
                      <TableCell>Расход</TableCell>
                      {this.state.vendors.map((vendor, key) => (
                        <TableCell
                          key={key}
                          style={{
                            maxWidth: 150,
                            textAlign: 'center',
                          }}
                        >
                          {vendor.name}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ zIndex: 3 }}></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      {this.state.vendors.map((vendor, key) => (
                        <TableCell
                          key={key}
                          style={{
                            maxWidth: 150,
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={this.downLoadVendor.bind(this, vendor.id)}
                        >
                          Скачать
                        </TableCell>
                       
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ zIndex: 3 }}></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      {this.state.vendors.map((vendor, key) => (
                        <TableCell
                          key={key}
                          style={{
                            maxWidth: 150,
                            textAlign: 'center',
                          }}
                        >
                          {vendor.date_last_update}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ zIndex: 3, whiteSpace: 'nowrap' }}>
                        Средний на месяц
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      {this.state.vendors.map((vendor, key) => (
                        <TableCell
                          key={key}
                          style={{
                            maxWidth: 150,
                            textAlign: 'center',
                          }}
                        >
                          {vendor.price2}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ zIndex: 3, whiteSpace: 'nowrap' }}>
                        Средний на день
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      {this.state.vendors.map((vendor, key) => (
                        <TableCell
                          key={key}
                          style={{
                            maxWidth: 150,
                            textAlign: 'center',

                            backgroundColor:
                              vendor.type == 'white'
                                ? '#fff'
                                : vendor.type == 'red'
                                ? 'red'
                                : 'green',
                            color:
                              vendor.type == 'white'
                                ? '#000'
                                : vendor.type == 'red'
                                ? '#fff'
                                : '#fff',
                            fontWeight: 700,
                          }}
                        >
                          {vendor.price3}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.cats.map((item, key) => (
                      <React.Fragment key={key}>
                        <TableRow>
                          <TableCell
                            style={{
                              position: 'sticky',
                              display: 'flex',
                              backgroundColor: '#ADD8E6',
                            }}
                          >
                            {item.name}
                          </TableCell>
                          <TableCell
                            style={{ backgroundColor: '#ADD8E6' }}
                            colSpan={`${3 + this.state.vendors.length * 2}`}
                          ></TableCell>
                        </TableRow>

                        {item.cats.map((category, key_cat) => (
                          <React.Fragment key={key_cat}>
                            <TableRow
                              sx={{
                                '& td': {
                                  backgroundColor: '#ADD8E6',
                                  borderRight: 'none',
                                },
                              }}
                            >
                              <TableCell>{category.name}</TableCell>

                              {key_cat === 0 ? (
                                <TableCell>Цена</TableCell>
                              ) : (
                                <React.Fragment key={key_cat}>
                                  <TableCell></TableCell>
                                </React.Fragment>
                              )}
                              <TableCell></TableCell>
                              {this.state.vendors.map((vendor, key) => (
                                <React.Fragment key={key}>
                                  <TableCell></TableCell>
                                </React.Fragment>
                              ))}
                            </TableRow>

                            {category.items.map((item, k) => (
                              <TableRow key={k} hover>
                                <TableCell variant="head">{item.name}</TableCell>
                                <TableCell>{item.price}</TableCell>
                                <TableCell>{item.ras}</TableCell>
                                {this.state.vendors.map((vendor, key) => (
                                  <React.Fragment key={key}>
                                    {vendor.price.find(
                                      (it) => it.item_id === item.id
                                    ) ? (
                                      <TenderCell
                                        vendor={vendor}
                                        item={item}
                                        price={vendor.price.find((it) => it.item_id === item.id)}
                                        changePrice={this.changePrice.bind(this)}
                                      />
                                    ) : (
                                      <TableCell></TableCell>
                                    )}
                                  </React.Fragment>
                                ))}
                              </TableRow>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}
      </>
    );
  }
}

export default function Tender() {
  return <Tender_ />;
}
