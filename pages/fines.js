import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MyCheckBox } from '@/components/shared/Forms';

import queryString from 'query-string';

class Fines_Table_Сameras extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.cameras;
    var array2 = this.props.cameras;

    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      });

    return !is_same;
  }

  render() {
    return (
      <TableContainer>


        <Grid sx={{fontWeight: 'bold' }} mt={3} mb={3}>Ошибки по камерам</Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '35%' }}>Наименование</TableCell>
              <TableCell style={{ width: '20%' }}>
                Размер штрафа за первый раз
              </TableCell>
              <TableCell style={{ width: '20%' }}>
                Размер штрафа за второй раз
              </TableCell>
              <TableCell style={{ width: '20%' }}>
                Размер штрафа за третий и последующие
              </TableCell>
              <TableCell style={{ width: '5%' }}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.props.cameras.map((item, i) => (
              <TableRow key={i}>
                <TableCell
                  style={{ cursor: 'pointer' }}
                  onClick={this.props.openModal.bind(
                    this,
                    'Штраф по камерам',
                    item.id
                  )}
                >
                  {item.name}
                </TableCell>
                <TableCell>{item.price_one} руб</TableCell>
                <TableCell>{item.price_two} руб</TableCell>
                <TableCell>{item.price_tree} руб</TableCell>
                <TableCell>
                  {parseInt(item.is_active) == 1 ? (
                    <VisibilityIcon />
                  ) : (
                    <VisibilityOffIcon />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
    );
  }
}

class Fines_Table_Reviews extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.reviews;
    var array2 = this.props.reviews;

    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      });

    return !is_same;
  }

  render() {
    return (
      <TableContainer>
        <Grid sx={{ fontWeight: 'bold' }} mt={3} mb={3}>Ошибки по отзывам</Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '35%' }}>Наименование</TableCell>
              <TableCell style={{ width: '20%' }}>
                Процент за первый раз
              </TableCell>
              <TableCell style={{ width: '20%' }}>
                Процент за второй раз
              </TableCell>
              <TableCell style={{ width: '20%' }}>
                Процент за третий и последующие
              </TableCell>
              <TableCell style={{ width: '5%' }}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {this.props.reviews.map((item, i) => (
              <React.Fragment key={item.id}>
                <TableRow>
                  <TableCell
                    style={{ cursor: 'pointer' }}
                    rowSpan="2"
                    onClick={this.props.openModal.bind(
                      this,
                      'Штраф по отзывам',
                      item.id
                    )}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell>{item.percent_one} %</TableCell>
                  <TableCell>{item.percent_two} %</TableCell>
                  <TableCell>{item.percent_tree} %</TableCell>
                  <TableCell rowSpan="2">
                    {parseInt(item.is_active) == 1 ? (
                      <VisibilityIcon />
                    ) : (
                      <VisibilityOffIcon />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{item.price_one} руб</TableCell>
                  <TableCell>{item.price_two} руб</TableCell>
                  <TableCell>{item.price_tree} руб</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

class Fines_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.event) {
      return null;
    }

    if (nextProps.event !== prevState.event) {
      return { item: nextProps.event };
    }
    return null;
  }

  changeItem(data, event) {
    let vendor = this.state.item;
    vendor[data] = event.target.value;

    this.setState({
      item: vendor,
    });
  }

  changeItemChecked(data, event) {
    let vendor = this.state.item;
    vendor[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item: vendor,
    });
  }

  onClose() {
    this.setState({
      item: null
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={'lg'}
      >
        <DialogTitle id="alert-dialog-title">
          {this.props.method}
          {this.props.itemName ? `: ${this.props.itemName}` : ''}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  mb={2}
                  size={{
                    xs: 12,
                    sm: 8
                  }}>
                  <MyTextInput
                    label="Наименование штрафа"
                    value={this.state.item.name}
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>
              </Grid>
              {this.props.method === 'Новый штраф по отзывам' ||
              this.props.method === 'Штраф по отзывам' ? (
                <Grid container spacing={3}>
                  <Grid
                    mb={2}
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <MyTextInput
                      label="Процент за первый раз"
                      value={this.state.item.percent_one}
                      func={this.changeItem.bind(this, 'percent_one')}
                    />
                  </Grid>
                  <Grid
                    mb={2}
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <MyTextInput
                      label="Процент за второй раз"
                      value={this.state.item.percent_two}
                      func={this.changeItem.bind(this, 'percent_two')}
                    />
                  </Grid>
                  <Grid
                    mb={2}
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <MyTextInput
                      label="Процент за третий и последующие"
                      value={this.state.item.percent_tree}
                      func={this.changeItem.bind(this, 'percent_tree')}
                    />
                  </Grid>
                </Grid>
              ) : null}

              <Grid container spacing={3}>
                <Grid
                  mb={2}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <MyTextInput
                    label="Размер штрафа за первый раз"
                    value={this.state.item.price_one}
                    func={this.changeItem.bind(this, 'price_one')}
                  />
                </Grid>
                <Grid
                  mb={2}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <MyTextInput
                    label="Размер штрафа за второй раз"
                    value={this.state.item.price_two}
                    func={this.changeItem.bind(this, 'price_two')}
                  />
                </Grid>
                <Grid
                  mb={2}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <MyTextInput
                    label="Размер штрафа за третий и последующие"
                    value={this.state.item.price_tree}
                    func={this.changeItem.bind(this, 'price_tree')}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {this.props.method === 'Новый штраф по камерам' ||
                this.props.method === 'Штраф по камерам' ? (
               
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3
                    }}>
                    <MyCheckBox
                      label="Картинка"
                      value={
                        parseInt(this.state.item.img) == 1 ? true : false
                      }
                      func={this.changeItemChecked.bind(this, 'img')}
                    />
                  </Grid>
          
                ) : null}

                {this.props.method === 'Штраф по отзывам' ||
                this.props.method === 'Штраф по камерам' ? (

                  <Grid
                    size={{
                      xs: 12,
                      sm: 3
                    }}>
                    <MyCheckBox
                      label="Активность"
                      value={parseInt(this.state.item.is_active) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, 'is_active')}
                    />
                  </Grid>

                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.props.save.bind(
              this,
              this.props.method,
              this.state.item
            )}
            color="primary"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Fines_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'fines',
      module_name: '',
      is_load: false,

      modalDialog: false,
      itemName: '',

      cameras: [],
      reviews: [],
      
      event: {},
      method: '',

      newFine: {
        name: '',
        percent_one: '',
        percent_two: '',
        percent_tree: '',
        price_one: '',
        price_two: '',
        price_tree: '',
        is_active: 0,
        img: 0,
      },
    };
  }

  async componentDidMount() {
    let data = await this.getData('get_all');

    // console.log(data);

    this.setState({
      cameras: data.items,
      reviews: data.items_1,
      module_name: data.module_info.name
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

  async openModal(method, id) {

    if (method === 'Новый штраф по камерам') {
      this.setState({
        modalDialog: true,
        method,
        event: this.state.newFine,
      });
    }

    if (method === 'Новый штраф по отзывам') {
      this.setState({
        modalDialog: true,
        method,
        event: this.state.newFine,
      });
    }

    if (method === 'Штраф по камерам') {

      const data = {
        id,
      }

      const item = await this.getData('get_one_cam', data);

      this.setState({
        modalDialog: true,
        method,
        event: item.item,
        itemName: item.item.name,
      });
    }

    if (method === 'Штраф по отзывам') {

      const data = {
        id,
      }

      const item = await this.getData('get_one_orders', data);

      this.setState({
        modalDialog: true,
        method,
        event: item.item,
        itemName: item.item.name,
      });
    }
  }

  async saveItem(method, data) {

    this.setState({
      modalDialog: false,
      itemName: ''
    });

    if (method === 'Новый штраф по камерам') {
      await this.getData('save_new_cam', data); 
    }

    if (method === 'Новый штраф по отзывам') {
      await this.getData('save_new_orders', data); 
    }

    if (method === 'Штраф по камерам') {
      await this.getData('save_edit_cam', data); 
    }

    if (method === 'Штраф по отзывам') {
      await this.getData('save_edit_orders', data); 
    }

    this.update();
  }

  async update() {

    let data = await this.getData('get_all');

    // console.log(data);

    this.setState({
      cameras: data.items,
      reviews: data.items_1,
    });

  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={3} className='container_first_child'>
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
              sm: 6
            }}>
            <Button
              onClick={this.openModal.bind(this, 'Новый штраф по камерам')}
              variant="contained"
            >
              Добавить ошибку по камерам
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button
              onClick={this.openModal.bind(this, 'Новый штраф по отзывам')}
              variant="contained"
            >
              Добавить ошибку по отзывам
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Fines_Table_Сameras
              cameras={this.state.cameras}
              openModal={this.openModal.bind(this)}
            />
          </Grid>


          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Fines_Table_Reviews
              reviews={this.state.reviews}
              openModal={this.openModal.bind(this)}
            />
          </Grid>
        </Grid>
        <Fines_Modal
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false, itemName: '' });
          }}
          method={this.state.method}
          event={this.state.event}
          save={this.saveItem.bind(this)}
          itemName={this.state.itemName}
        />
      </>
    );
  }
}

export default function Fines() {
  return <Fines_ />;
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
