import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyTextInput, MyAutocomplite, MyCheckBox } from '@/components/shared/Forms';

import { api, api_laravel, api_laravel_local } from '@/src/api_new';

class OptionToWin_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.err[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemAutocomplite(data, event, value) {
    const item = this.state.item;

    if (this.props.mark === 'newItem') {
      item.err[data] = value;

      this.setState({
        item,
      });
    }

    if (this.props.mark === 'editItem') {
      item[data] = value;

      this.setState({
        item,
      });
    }
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.err[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    if (this.props.mark === 'newItem') {
      this.props.save(item.err);
    }

    if (this.props.mark === 'editItem') {
      this.props.save(item);
    }

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        maxWidth={'lg'}
      >
        <DialogTitle className="button">
          {this.props.method}{this.props.itemName ? `: ${this.props.itemName}` : null}
          {this.props.fullScreen ? (
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <MyTextInput
                label="Наименование"
                value={this.state.item ? this.state.item.err.name : ''}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <MyAutocomplite
                label="Варианты решения"
                multiple={true}
                data={this.state.item ? this.state.item.err_to_win ? this.state.item.err_to_win : this.state.item.all_wins : []}
                value={this.state.item ? this.state.item.this_wins ? this.state.item.this_wins : this.state.item.err.id_win : []}
                func={this.changeItemAutocomplite.bind(this, this.props.mark === 'newItem' ? 'id_win' : 'this_wins')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MyAutocomplite
                label="Этапы ошибки роллы"
                multiple={true}
                data={this.state.item ? this.state.item.all_stages ? this.state.item.all_stages : this.state.item.stages : []}
                value={this.state.item ? this.state.item.this_stages_1 ? this.state.item.this_stages_1 : this.state.item.err.stage_err_1 : []}
                func={this.changeItemAutocomplite.bind(this, this.props.mark === 'newItem' ? 'stage_err_1' : 'this_stages_1')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MyAutocomplite
                label="Этапы ошибки пицца"
                multiple={true}
                data={this.state.item ? this.state.item.all_stages ? this.state.item.all_stages : this.state.item.stages : []}
                value={this.state.item ? this.state.item.this_stages_2 ? this.state.item.this_stages_2 : this.state.item.err.stage_err_2 : []}
                func={this.changeItemAutocomplite.bind(this, this.props.mark === 'newItem' ? 'stage_err_2' : 'this_stages_2')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <MyAutocomplite
                label="Этапы ошибки напитки / допы"
                multiple={true}
                data={this.state.item ? this.state.item.all_stages ? this.state.item.all_stages : this.state.item.stages : []}
                value={this.state.item ? this.state.item.this_stages_3 ? this.state.item.this_stages_3 : this.state.item.err.stage_err_3 : []}
                func={this.changeItemAutocomplite.bind(this, this.props.mark === 'newItem' ? 'stage_err_3' : 'this_stages_3')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3
              }}>
              <MyCheckBox
                label="Картинка"
                value={this.state.item ? parseInt(this.state.item.err.need_photo) == 1 ? true : false : false}
                func={this.changeItemChecked.bind(this, 'need_photo')}
              />
            </Grid>

            {this.props.mark === 'editItem' ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 3
                }}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.err.is_active) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_active')}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class OptionToWin_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'option_to_win',
      module_name: '',
      is_load: false,

      items: [],

      fullScreen: false,

      modalDialog: false,
      method: '',
      mark: '',
      item: null,
      itemName: '',

      itemNew: {
        stage_err_1: [],
        stage_err_2: [],
        stage_err_3: [],
        id_win: [],
        name: '',
        need_photo: 0,
      },
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      items: data.items,
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

  async changeItemChecked(id, is_active, mark) {
    const is_active_edit = parseInt(is_active) == 1 ? 0 : 1;

    const items = this.state.items;

    items.map((item) => {
      if (item.id === id) {
        item.is_active = is_active_edit;
      }
    });

    this.setState({
      items,
      mark,
    });

    const data = {
      id,
      is_active: is_active_edit,
    };

    console.log(data);

    await this.getData('change_active', data);

    setTimeout(() => {
      this.update();
    }, 300);

  }

  async save(item) {
    if (this.state.mark === 'newItem') {
      const data = item;

      console.log(data);

      await this.getData('save_new', data);
    }

    if (this.state.mark === 'editItem') {
      const data = {
        id: item.err.id,
        name: item.err.name,
        is_active: item.err.is_active,
        need_photo: item.err.need_photo,
        id_win: item.this_wins,
        stage_err_1: item.this_stages_1,
        stage_err_2: item.this_stages_2,
        stage_err_3: item.this_stages_3,
      };

      console.log(data);

      await this.getData('save_edit', data);
    }

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      items: data.items,
    });
  }

  async openModal(mark, method, id) {
    this.handleResize();

    if (mark === 'newItem') {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData('get_all_for_new');

      item.err = itemNew;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === 'editItem') {
      const data = {
        id,
      };

      //const item = await this.getData('get_one', data);
      const item = await this.getData('get_one', data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.err.name,
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <OptionToWin_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />
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
              sm: 3
            }}>
            <Button onClick={this.openModal.bind(this, 'newItem', 'Новый вариант жалобы')} variant="contained">
              Новая жалоба
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '5%' }}>#</TableCell>
                    <TableCell style={{ width: '55%' }}>Наименование</TableCell>
                    <TableCell style={{ width: '40%' }}>Активность</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.items.map((item, key) => (
                    <TableRow key={key} hover>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell onClick={this.openModal.bind(this, 'editItem', 'Редактирование жалобы', item.id)} style={{fontWeight: 700, cursor: 'pointer'}}>
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <MyCheckBox
                          label=""
                          value={parseInt(item.is_active) == 1 ? true : false}
                          func={this.changeItemChecked.bind(this, item.id, item.is_active, 'editItem')}
                        />
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

export default function OptionToWin() {
  return <OptionToWin_ />;
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
