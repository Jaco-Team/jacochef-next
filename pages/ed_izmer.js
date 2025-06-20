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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { MyTextInput, MySelect, MyAlert } from '@/ui/elements';

import queryString from 'query-string';
import {api_laravel, api_laravel_local} from "@/src/api_new";

class EdIzmer_Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      item: null,
      items: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.items) {
      return;
    }

    if (this.props.items !== prevProps.items) {
      this.setState({
        item: this.props.item,
        items: this.props.items,
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

    this.props.save(item);

    this.onClose();
  }

  onClose() {

    this.setState ({
      item: null,
      items: null,
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
          maxWidth='md'
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
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Название"
                    value={ this.state.item ? this.state.item.name : '' }
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Количество создаваемого"
                    value={this.state.item ? this.state.item.main_count : '' }
                    func={this.changeItem.bind(this, 'main_count')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MySelect
                    is_none={false}
                    label="Связанная единица измерения"
                    data={this.state.items ? this.state.items : []}
                    value={this.state.item ? this.state.item.con_id : ''}
                    func={this.changeItem.bind(this, 'con_id')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Количество связанной"
                    value={this.state.item ? this.state.item.con_count : '' }
                    func={this.changeItem.bind(this, 'con_count')}
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
    );
  }
}

class EdIzmer_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'ed_izmer',
      module_name: '',
      is_load: false,

      fullScreen: false,

      list: null,
      mark: null,

      modalDialog: false,
      items: null,
      item: null,

      method: '',
      itemName: '',

      itemNew: {
        con_count: '',
        con_id: '',
        main_count: '',
        name: '',
      },

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.list,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {

    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
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

  async openModal (mark, id) {
    this.handleResize();

    if(mark === 'add') {

      const res = await this.getData('get_all_for_new');

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(this.state.itemNew)),
        items: res.items,
        modalDialog: true,
        method: 'Новая единица измерения',
      });

    }

    if(mark === 'edit') {
      const data = {
        id
      }

      const res = await this.getData('get_one', data);

      this.setState({
        mark,
        item: res.item,
        itemName: res.item.name,
        items: res.items,
        modalDialog: true,
        method: 'Редактирование единицы измерения',
      });
    }

  }

  async save(data) {
    const mark = this.state.mark;

    let res;

    if(mark === 'add') {
      res = await this.getData('save_new', data);
    }

    if(mark === 'edit') {
      res = await this.getData('save_edit', data);
    }

    if(!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout( () => {
        this.update();
      }, 300 )
    }
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      list: data.list,
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

        <EdIzmer_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '', method: '' })}
          mark={this.state.mark}
          item={this.state.item}
          items={this.state.items}
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
              Добавить единицу измерения
            </Button>
          </Grid>

          <Grid item xs={12} sm={12} mb={5}>
            {!this.state.list ? null : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Связка</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.list.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell  onClick={this.openModal.bind(this, 'edit', item.id)} style={{ color: '#c03', fontWeight: 700, cursor: 'pointer' }}>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function EdIzmer() {
  return <EdIzmer_ />;
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
