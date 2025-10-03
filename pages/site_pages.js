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

import { MyTextInput } from '@/components/shared/Forms';

import queryString from 'query-string';
import MyAlert from '@/components/shared/MyAlert';

class SitePages_Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

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
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Название"
                value={ this.state.item ? this.state.item.name : '' }
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyTextInput
                label="Ссылка"
                value={this.state.item ? this.state.item.link : '' }
                func={this.changeItem.bind(this, 'link')}
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

class SitePages_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_pages',
      module_name: '',
      is_load: false,

      fullScreen: false,

      pages: null,
      page: null,
      
      mark: null,
      modalDialog: false,
      method: '',
      pageName: '',

      pageNew: {
        name: '',
        link: '',
      },

      openAlert: false,
      err_status: true,
      err_text: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      pages: data.pages,
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

  openModal (mark, id) {
    this.handleResize();

    if(mark === 'add') {

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(this.state.pageNew)),
        modalDialog: true,
        method: 'Новая страница',
      });

    }

    if(mark === 'edit') {
      const pages = this.state.pages;

      const page = pages.find(item => item.id === id);

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(page)),
        pageName: page.name,
        modalDialog: true,
        method: 'Редактирование страницы',
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
      pages: data.pages,
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
        <SitePages_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, pageName: '', method: '' })}
          mark={this.state.mark}
          item={this.state.item}
          method={this.state.method}
          itemName={this.state.pageName}
          fullScreen={this.state.fullScreen}
          save={this.save.bind(this)}
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
              sm: 12
            }}>
            <Button
              variant="contained"
              color="primary"
              style={{ whiteSpace: 'nowrap' }}
              onClick={this.openModal.bind(this, 'add', null)}
            >
              Добавить
            </Button>
          </Grid>

          <Grid
            mb={5}
            size={{
              xs: 12,
              sm: 12
            }}>
            {!this.state.pages ? null : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Адрес</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.pages.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell  onClick={this.openModal.bind(this, 'edit', item.id)} style={{ color: '#c03', fontWeight: 700, cursor: 'pointer' }}>
                        {item.name}
                      </TableCell>
                      <TableCell>{item.link}</TableCell>
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

export default function SitePages() {
  return <SitePages_ />;
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
