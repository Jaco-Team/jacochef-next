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

import { MyTextInput, MySelect, MyAlert } from '@/ui/elements';

import { api } from '@/src/api_new';

class SiteCategory_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      listCat: null,
      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
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

  save() {
    const item = this.state.item;

    if (!item.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;
    } 

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
      listCat: null,
      openAlert: false,
      err_status: true,
      err_text: '',
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

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
                  label="Название категории"
                  value={this.state.item ? this.state.item.name : ''}
                  func={this.changeItem.bind(this, 'name')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MyTextInput
                  label="Сроки хранения"
                  value={this.state.item ? this.state.item.shelf_life : ''}
                  func={this.changeItem.bind(this, 'shelf_life')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MySelect
                  label="Дочерняя категория"
                  data={this.state.listCat ? this.state.listCat : []}
                  value={this.state.item ? this.state.item.parent_id : ''}
                  func={this.changeItem.bind(this, 'parent_id')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SiteCategory_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_category',
      module_name: '',
      is_load: false,

      fullScreen: false,

      main: null,

      mark: null,
      modalDialog: false,
      listCat: null,
      item: null,

      itemNew: {
        name: '',
        shelf_life: '',
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
      main: data.main,
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
        listCat: res.category,
        modalDialog: true,
        method: 'Новая категория',
      });
    }

    if (mark === 'edit') {
      const data = {
        id,
      };

      const res = await this.getData('get_one', data);

      this.setState({
        mark,
        item: res.item,
        itemName: res.item.name,
        listCat: res.category,
        modalDialog: true,
        method: 'Редактирование категории',
      });
    }
  }

  async save(item) {
    const mark = this.state.mark;

    let res;

    if (mark === 'add') {
      const data = {
        name: item.name,
        shelf_life: item.shelf_life,
        cat_id: item?.parent_id ?? 0,
      };

      res = await this.getData('save_new', data);
    }

    if (mark === 'edit') {
      const data = {
        id: item.id,
        name: item.name,
        shelf_life: item.shelf_life,
        cat_id: item.parent_id,
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
    const main = this.state.main;

    if (cat === 'subCat') {
      main.forEach((item) => {
        if (item.id === id) {
          item.items[index].sort = event.target.value;
        }
      });
    } else {
      main[index].sort = event.target.value;
    }

    this.setState({
      main,
    });
  }

  async saveSort(id, event) {
    const data = {
      id,
      sort: event.target.value,
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
      main: data.main,
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

        <SiteCategory_Modal
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
            <Button
              variant="contained"
              color="primary"
              style={{ whiteSpace: 'nowrap' }}
              onClick={this.openModal.bind(this, 'add', null)}
            >
              Добавить
            </Button>
          </Grid>

          {!this.state.main ? null : (
            <Grid item xs={12} sm={12} mb={10}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell>#</TableCell>
                      <TableCell sx={{ minWidth: '300px' }}>Название</TableCell>
                      <TableCell>Сортировка</TableCell>
                      <TableCell sx={{ minWidth: '500px' }}>Сроки хранения</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.main.map((item, index) =>
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
                            <TableCell sx={{ minWidth: '500px' }}>{item.shelf_life}</TableCell>
                          </TableRow>
                          {item.items.map((it, key) => (
                            <TableRow hover key={key}>
                              <TableCell></TableCell>
                              <TableCell onClick={this.openModal.bind(this, 'edit', it.id)} sx={{ paddingLeft: 10, alignItems: 'center', minWidth: '300px', cursor: 'pointer'}}>
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
                              <TableCell sx={{ minWidth: '500px' }}>{it.shelf_life}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ) : (
                        <TableRow hover key={index} sx={{ '& th': { border: 'none' } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell onClick={this.openModal.bind(this, 'edit', item.id)} sx={{ fontWeight: 'bold', cursor: 'pointer', color: '#c03'}}>
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
                          <TableCell sx={{ minWidth: '500px' }}>{item.shelf_life}</TableCell>
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

export default function SiteCategory() {
  return <SiteCategory_ />;
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
