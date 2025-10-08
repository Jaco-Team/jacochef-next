import React from 'react';

import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyCheckBox } from '@/components/shared/Forms';

import { api_laravel_local, api_laravel } from '@/src/api_new';
import MyAlert from '@/components/shared/MyAlert';

class CitySiteItems_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'city_site_items',
      module_name: '',
      is_load: false,

      cities: [],
      cats: [],

      openAlert: false,
      err_status: '',
      err_text: '',
     
    };
  }
  
  async componentDidMount() {
    const data = await this.getData('get_all');

    const cats = this.getCats(data.cats, data.cities);

    this.setState({
      module_name: data.module_info.name,
      cities: data.cities,
      cats,
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

  getCats = (cats, cities) => (
    cats.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        const city_active = {};
        cities.forEach(city => {
          city_active[city.id] = city.items.includes(item.id);
        });
        return { ...item, city_active };
      })
    }))
  );

  changeActive = (item_id, city_id, currentState) => {
    const updatedCats = this.state.cats.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        if (item.id !== item_id) return item;
        return {
          ...item,
          city_active: {
            ...item.city_active,
            [city_id]: !currentState
          }
        };
      })
    }));

    const active = currentState ? 0 : 1;

    this.setState({ cats: updatedCats }, () => { this.save_check(item_id, city_id, active)})
  };

  async save_check(item_id, city_id, active) {

    const data = {
      item_id,
      city_id,
      is_active: active
    };

    const res = await this.getData('save_check', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.update();
      }, 500);
    } 
  }

  async update() {
    const res = await this.getData('get_all');

    const cats = this.getCats(res.cats, res.cities);

    this.setState({
      cities: res.cities,
      cats,
    });

  }

  all_check = (city_id) => {
    const { cats } = this.state;
    const item_ids = [];
    let all_active = true;

    cats.forEach(cat => {
      cat.items.forEach(item => {
        item_ids.push(item.id);
        if (!item.city_active?.[city_id]) {
          all_active = false;
        }
      });
    });

    if (all_active) {
      this.openAlert(false, 'Все товары в этом городе уже активны');
      return;
    }

    const updatedCats = cats.map(cat => ({
      ...cat,
      items: cat.items.map(item => ({
        ...item,
        city_active: {
          ...item.city_active,
          [city_id]: true
        }
      }))
    }));

    this.setState({ cats: updatedCats }, () => {
      this.save_all_check(city_id, item_ids);
    });
  }

  async save_all_check(city_id, item_ids) {

    const data = {
      city_id,
      item_ids
    };

    const res = await this.getData('save_all_check', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.update();
      }, 500);
    } 
  }

  render() {
    const { is_load, openAlert, err_status, err_text, module_name, cats, cities } = this.state;

    const fixedWidth = 8 + 25;
    const cityCellWidth = (100 - fixedWidth) / cities.length;

    return (
      <>
        <Backdrop style={{ zIndex: 999 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        <Grid container spacing={3} className='container_first_child'>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{module_name}</h1>
          </Grid>
          
           <Grid
             mb={5}
             size={{
               xs: 12
             }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell style={{ width: '8%' }}>ИД товара</TableCell>
                    <TableCell style={{ width: '25%' }}>Наименование товара</TableCell>
                    {cities.map((city, idx) => (
                      <TableCell key={city.id || idx} style={{ width: `${cityCellWidth}%` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {city.name}
                          <Tooltip title={`Сделать активными все товары в городе ${city.name}`}>
                            <span>
                              <MyCheckBox
                                value={true}
                                func={() => this.all_check(city.id)}
                                label=""
                              />
                            </span>
                          </Tooltip>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cats.map((cat, catIdx) =>
                    cat.items.length === 0 ? null : (
                      <React.Fragment key={catIdx}>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: '#f0f0f0' }}></TableCell>
                          <TableCell colSpan={cities.length + 2} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>{cat.name}</TableCell>
                        </TableRow>
                        {cat.items.map((item, itemIdx) => (
                          <TableRow hover key={itemIdx}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            {cities.map((city, cityIdx) => (
                              <TableCell key={cityIdx} align="center">
                                <MyCheckBox
                                  value={!!item.city_active?.[city.id]}
                                  func={() => this.changeActive(item.id, city.id, item.city_active?.[city.id])}
                                  label=""
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function CitySiteItems() {
  return <CitySiteItems_ />;
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
