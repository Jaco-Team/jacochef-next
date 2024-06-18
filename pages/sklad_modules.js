import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { MyTextInput, MyAutocomplite, MyAlert, MyCheckBox } from '@/ui/elements';

import queryString from 'query-string';

class SkladModules_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      listCat: null,
      itemCat: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      const itemCat = this.props.listCat.find(item => parseInt(item.id) === parseInt(this.props.item.parent_id));

      this.setState({
        itemCat,
        item: this.props.item,
        listCat: this.props.listCat,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  changeItemCat(data, event, value) {
    const item = this.state.item;

    item[data] = value ? value.id : '';

    this.setState({
      item,
      itemCat: value,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
      listCat: null,
      itemCat: null,
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
        maxWidth="md"
      >
        <DialogTitle className="button">
          {this.props.method}
          {this.props.itemName ? `: ${this.props.itemName}` : null}
        </DialogTitle>

        <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
          <CloseIcon />
        </IconButton>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Название"
                value={this.state.item ? this.state.item.name : ''}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Адрес модуля (URL)"
                value={this.state.item ? this.state.item.link ?? '' : ''}
                func={this.changeItem.bind(this, 'link')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Категория"
                multiple={false}
                data={this.state.listCat ? this.state.listCat : []}
                value={this.state.itemCat ? this.state.itemCat : ''}
                func={this.changeItemCat.bind(this, 'parent_id')}
              />
            </Grid>

            {this.props.mark === 'edit' ? (
              <Grid item xs={12} sm={12}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.is_show) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_show')}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladModules_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'sklad_modules',
      module_name: '',
      is_load: false,

      fullScreen: false,

      list: null,

      mark: null,
      modalDialog: false,
      listCat: null,
      item: null,

      itemNew: {
        name: '',
        link: '',
        parent_id: '',
      },

      method: '',
      itemName: '',

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.items,
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
        this.setState({
          is_load: false,
        });
      });
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

  async openModal(mark, id) {
    this.handleResize();

    if (mark === 'add') {
      const res = await this.getData('get_all_for_new');

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(this.state.itemNew)),
        listCat: res.main_cat,
        modalDialog: true,
        method: 'Новая модуль',
      });
    }

    if (mark === 'edit') {
      const data = {
        id,
      };

      const res = await this.getData('get_one', data);

      this.setState({
        mark,
        item: res.item[0],
        itemName: res.item[0].name,
        listCat: res.main_cat,
        modalDialog: true,
        method: 'Редактирование модуля',
      });
    }
  }

  async save(item) {
    const mark = this.state.mark;

    let res;

    if (mark === 'add') {
      const data = {
        name: item.name,
        link: item.link,
        parent_id: item.parent_id,
      };

      res = await this.getData('save_new', data);
    }

    if (mark === 'edit') {
      const data = {
        id: item.id,
        name: item.name,
        link: item.link,
        parent_id: item.parent_id,
        is_show: item.is_show,
        modul_id: item.modul_id,
      };

      res = await this.getData('save_edit', data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  changeSort(index, cat, id, event) {
    const list = this.state.list;

    if (cat === 'subCat') {
      list.forEach((item) => {
        if (item.id === id) {
          item.items[index].sort = event.target.value;
        }
      });
    } else {
      list[index].sort = event.target.value;
    }

    this.setState({
      list,
    });
  }

  async saveSort(id, event) {
    const data = {
      id,
      value: event.target.value,
    };

    const res = await this.getData('save_sort', data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.items,
    });
  }

  render() {
    return (
      <>
        <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <SkladModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '', method: '' })}
          mark={this.state.mark}
          item={this.state.item}
          listCat={this.state.listCat}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          save={this.save.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button variant="contained" color="primary" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal.bind(this, 'add', null)}>
              Добавить
            </Button>
          </Grid>

          {!this.state.list ? null : (
            <Grid item xs={12} sm={12} mb={10}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell style={{ width: '5%' }}>#</TableCell>
                      <TableCell style={{ width: '35%' }}>Название</TableCell>
                      <TableCell style={{ width: '15%' }}>Сортировка</TableCell>
                      <TableCell style={{ width: '45%' }} align="center"><VisibilityIcon /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.list.map((item, index) =>
                      item.items.length ? (
                        <React.Fragment key={index}>
                          <TableRow hover sx={{ '& th': { border: 'none' } }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#c03' }}>
                              {item.name}
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                label=""
                                value={item.sort}
                                func={this.changeSort.bind(this, index, 'cat', null)}
                                onBlur={this.saveSort.bind(this, item.id)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </TableCell>
                          </TableRow>
                          {item.items.map((it, key) => (
                            <TableRow hover key={key}>
                              <TableCell></TableCell>
                              <TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{ paddingLeft: 10, alignItems: 'center', cursor: 'pointer' }}>
                                <li>{it.name}</li>
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  label=""
                                  value={it.sort}
                                  func={this.changeSort.bind(this, key, 'subCat', item.id)}
                                  onBlur={this.saveSort.bind(this, it.id)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {parseInt(it.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ) : (
                        <TableRow hover key={index} sx={{ '& th': { border: 'none' } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#c03' }}>
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={this.changeSort.bind(this, index, 'cat', null)}
                              onBlur={this.saveSort.bind(this, item.id)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {parseInt(item.is_show) == 1 ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function SkladModules() {
  return <SkladModules_ />;
}
