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
import {MyAlert, MySelect, MyTextInput} from '@/ui/elements';
import {api_laravel, api_laravel_local} from "@/src/api_new";
import Typography from "@mui/material/Typography";

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

  getData = (method, data = {}, dop_type = {}) => {

    this.setState({
      is_load: true,
    });

    return api_laravel(this.state.module, method, data, dop_type)
        .then(result => {
        return result.data;
        })
        .finally(() => {
          setTimeout(() => {
            this.setState({
              is_load: false,
            });
          }, 500);
        });
  }

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
      if (parseInt(item.app_id) === parseInt(id)) {
        item[data] = event.target.value;
      }
    });

    this.setState({
      items,
    });
  }

  async save() {
    const {city, items} = this.state;

    const data = {
      city_id: city,
      app_list: items,
    };

    await this.getData('save_edit', data);

    this.setState({
      openAlert: true,
      err_status: true,
      err_text: 'Обновлено',
    }, () => this.update());
  }

  async update() {
    const {city} = this.state;

    const data = {
      city_id: city,
    };

    const res = await this.getData('get_one', data);

    this.setState({
      items: res.lavel_price,
    });
  }

  render() {
    const {is_load, items, openAlert, err_text, err_status, module_name, cities, city } = this.state;
    const itemsInGraph = items.filter(value => value.is_graph === 1);
    const itemsNotGraph = items.filter(value => value.is_graph === 0);
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false }) }
          status={err_status}
          text={err_text} />

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MySelect
              label="Город"
              is_none={false}
              data={cities}
              value={city}
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

          <SectionHeader title="В графике работы"/>
          <Grid item xs={12} sm={12}>
            <SalaryTable items={itemsInGraph} onChange={this.changeItem.bind(this)}/>
          </Grid>
          <SectionHeader title="Без графика"/>
          <Grid item xs={12} sm={12}>
            <SalaryTable items={itemsNotGraph} onChange={this.changeItem.bind(this)}/>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function AppPerH() {
  return <AppPerH_ />;
}

const tableCellStyles = {
  '#': { width: '5%' },
  'Должность': { width: '35%' },
  'Оклад': { width: '15%' },
  'Минимальная ставка': { width: '15%' },
  'Средняя ставка': { width: '15%' },
  'Максимальная ставка': { width: '15%' },
};

const SalaryTable = ({ items, onChange }) => {
  const fields = ['oklad', 'min_price', 'avg_price', 'max_price'];
  const fieldLabels = ['Оклад', 'Минимальная ставка', 'Средняя ставка', 'Максимальная ставка'];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {Object.entries(tableCellStyles).map(([label, style]) => (
              <TableCell key={label} style={style}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <TableRow key={item.app_id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.app_name}</TableCell>
                {fields.map((field) => (
                  <TableCell key={`${item.app_id}-${field}`}>
                    <MyTextInput
                      label=""
                      value={item[field]}
                      func={onChange.bind(this, field, item.app_id)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">Нет данных</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SectionHeader = ({ title }) => (
  <Grid item xs={12} sm={12}>
    <Typography variant="h5" component="h1" gutterBottom>
      {title}
    </Typography>
  </Grid>
);

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
