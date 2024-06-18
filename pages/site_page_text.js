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

import { MySelect, TextEditor, MyTextInput, MyAutocomplite } from '@/ui/elements';

import queryString from 'query-string';

class SitePageText_Modal extends React.Component {
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

    item.page[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemText(data, value) {
    const item = this.state.item;

    item.page[data] = value;

    this.setState({
      item,
    });
  }

  changePages(data, event, value) {
    const item = this.state.item;

    item.page[data] = value;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item.page);

    this.onClose();
  }

  onClose() {
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        disableEnforceFocus
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
            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                label="Город"
                data={this.state.item ? this.state.item.cities : []}
                value={this.state.item ? this.state.item.page.city_id : ''}
                func={this.changeItem.bind(this, 'city_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyAutocomplite
                label="Страница"
                multiple={false}
                data={this.state.item ? this.state.item.all_pages : []}
                value={this.state.item ? this.state.item.page.page_id : ''}
                func={this.changePages.bind(this, 'page_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Заголовок (H1-H2)"
                value={this.state.item ? this.state.item.page.page_h : ''}
                func={this.changeItem.bind(this, 'page_h')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Заголовок (title)"
                value={this.state.item ? this.state.item.page.title : ''}
                func={this.changeItem.bind(this, 'title')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Текст на сайте"
                multiline={true}
                maxRows={5}
                value={this.state.item ? this.state.item.page.description : ''}
                func={this.changeItem.bind(this, 'description')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextEditor
                value={this.state.item ? this.state.item.page.content : ''}
                func={this.changeItemText.bind(this, 'content')}
              />
            </Grid>
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

class SitePageText_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'site_page_text',
      module_name: '',
      is_load: false,

      cities: [],
      city: '0',

      pages: [],

      item: null,
      itemName: '',

      modalDialog: false,
      method: '',
      mark: '',

      itemNew: {
        page_id: { id: '', name: '' },
        city_id: '',
        page_h: '',
        title: '',
        description: '',
        content: '',
      },

      fullScreen: false,
    };
  }

  async componentDidMount() {

    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      module_name: data.module_info.name,
      pages: data.pages,
    });

    document.title = data.module_info.name;
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

  changeCity(event) {
    const city = event.target.value;

    this.setState({
      city,
    });
  }

  async openModal(mark, method, id) {
    this.handleResize();

    if (mark === 'newPage') {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData('get_all_for_new');

      item.page = itemNew;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === 'editPage') {
      const data = {
        id,
      };

      const item = await this.getData('get_one', data);

      item.page.page_id = item.all_pages.find(page => page.id === item.page.page_id);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.page.page_id.name,
      });
    }
  }

  async save(item) {
    const mark = this.state.mark;

    if (mark === 'newPage') {
      const data = {
        page_id: item.page_id.id,
        city_id: item.city_id,
        page_h: item.page_h,
        page_title: item.title,
        page_description: item.description,
        page_text: item.content,
      };

      await this.getData('save_new', data);
    }

    if (mark === 'editPage') {
      const data = {
        id: item.id,
        page_id: item.page_id.id,
        city_id: item.city_id,
        page_h: item.page_h,
        page_title: item.title,
        page_description: item.description,
        page_text: item.content,
      };

      await this.getData('save_edit', data);
    }

    this.update();
  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      pages: data.pages,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <SitePageText_Modal
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
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
              label="Город"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              onClick={this.openModal.bind(this, 'newPage', 'Новая страница')}
              variant="contained"
            >
              Добавить
            </Button>
          </Grid>
        </Grid>

        <Grid container mt={3} spacing={3} mb={5}>

        <Grid item xs={12} sm={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '2%' }}>#</TableCell>
                    <TableCell style={{ width: '10%' }}>Название</TableCell>
                    <TableCell style={{ width: '8%' }}>Город</TableCell>
                    <TableCell style={{ width: '20%' }}>Заголовок</TableCell>
                    <TableCell style={{ width: '45%' }}>Текст на сайте</TableCell>
                    <TableCell style={{ width: '15%' }}>Последнее обновление</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.pages
                    .filter((page) => this.state.city !== '-1' ? ( page.city_id === this.state.city || parseInt(page.city_id) === -1 ) : page)
                    .map((item, key) => (
                      <TableRow key={key} hover style={{ cursor: 'pointer' }} onClick={this.openModal.bind(this, 'editPage', 'Редактирование страницы', item.id)}>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell style={{ color: '#ff1744', fontWeight: 700 }}>{item.page_name}</TableCell>
                        <TableCell>{item.city_name}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.date_time_update}</TableCell>
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

export default function SitePageText() {
  return <SitePageText_ />;
}
