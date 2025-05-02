import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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

import { MySelect, MyTextInput, MyAlert, TextEditor, MyAutocomplite } from '@/ui/elements';

import { api_laravel_local, api_laravel } from '@/src/api_new';

class SitePageText_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

      openAlert: false,
      err_status: false,
      err_text: '',

      change_link: false
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItemText(data, value) {
    let item = this.state.item;

    if (!item || !item.page) return;

    item.page[data] = value;

    this.setState({
      item,
    });
  }

  changeAutocomplite = (data, event, value) => {
    let item = this.state.item;

    item.page[data] = value;

    this.setState({
      item,
    });
  };

  changeItem(data, event) {
    const item = this.state.item;
    const value = event.target.value;
    const change_link = this.state.change_link;
    const mark = this.props.mark;

    if(data === 'link') {
      this.setState({
        change_link: true,
      });
    }

    if(data === 'page_name' && !change_link && mark === 'newPage') {
      const link = this.translit(value);

      item.page.link = link;
      item.page.page_name = value;
    } else {
      item.page[data] = value;
    }

    this.setState({
      item,
    });
  }

  translit(word) {
    let answer = '';

    const converter = {
      'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
      'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
      'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
      'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
      'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
      'ш': 'sh',   'щ': 'sh',   'ь': '',     'ы': 'y',    'ъ': '',
      'э': 'e',    'ю': 'iu',   'я': 'ia',
  
      'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
      'Е': 'E',    'Ё': 'E',    'Ж': 'ZH',   'З': 'Z',    'И': 'I',
      'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
      'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
      'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'CH',
      'Ш': 'SH',   'Щ': 'SH',   'Ь': '',     'Ы': 'Y',    'Ъ': '',
      'Э': 'E',    'Ю': 'IU',   'Я': 'IA',   ' ': '_',    '%': '' 
    };
  
    for (let i = 0; i < word.length; i++) {
      if (converter[word[i]] === undefined){
        answer += '';
      } else {
        answer += converter[word[i]];
      }
    }
  
    return answer;
  }

  save() {
    let item = this.state.item;
    item = item.page;

    if (!item.city_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;

    } 

    if (!item.page_name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать страницу'
      });

      return;

    } 

    if(!item.link) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать ссылку'
      });
      
      return;
    } 

    if(!item.page_h || !item.title ) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать все заголовки'
      });
      
      return;
    } 

    if(!item.description) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать описание'
      });
      
      return;
    } 

    this.props.save(item);

    this.onClose();
  }

  onClose() {

    this.setState ({
      item: null,
      openAlert: false,
      err_status: false,
      err_text: '',
      change_link: false
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
          disableEnforceFocus
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            {this.props.method}{this.props.itemName ? `: ${this.props.itemName}` : null}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
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
                  label="Категория"
                  multiple={false}
                  data={this.state.item ? this.state.item.category : []}
                  value={this.state.item ? this.state.item.page.category_id : ''}
                  func={this.changeAutocomplite.bind(this, 'category_id')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Страница"
                  value={this.state.item ? this.state.item.page.page_name : ''}
                  func={this.changeItem.bind(this, 'page_name')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Ссылка"
                  value={this.state.item ? this.state.item.page.link : ''}
                  func={this.changeItem.bind(this, 'link')}
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
                  label="Описание (description)"
                  multiline={true}
                  maxRows={5}
                  value={this.state.item ? this.state.item.page.description : ''}
                  func={this.changeItem.bind(this, 'description')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Typography gutterBottom>
                  Текст на сайте
                </Typography>
                <TextEditor
                  value={this.state.item?.page?.content || ''}
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
      </>
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
      pagesCopy: [],

      item: null,
      itemName: '',

      modalDialog: false,
      method: '',
      mark: '',

      itemNew: {
        page_name: '',
        city_id: '',
        page_h: '',
        title: '',
        description: '',
        link: '',
        content: '',
        category_id: {'id': 0, 'name': 'Без категории'}
      },

      fullScreen: false,

      openAlert: false,
      err_status: false,
      err_text: ''
    };
  }

  async componentDidMount() {

    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      module_name: data.module_info.name,
      pages: data.pages,
      pagesCopy: data.pages,
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

  changeCity(event) {
    const city = event.target.value;
    let pages = JSON.parse(JSON.stringify(this.state.pagesCopy));

    pages = pages.filter((page) => parseInt(city) !== -1 ? (parseInt(page.city_id) === parseInt(city) || parseInt(page.city_id) === -1 ) : page);

    this.setState({
      city,
      pages
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

      item.page.category_id = item.category.find(cat => parseInt(cat.id) === parseInt(item.page.category_id)) ?? null;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item?.page?.page_name ?? '',
      });
    }
  }

  async save(item) {
    const mark = this.state.mark;

    let res;

    if (mark === 'newPage') {
      const data = {
        page_name: item.page_name,
        link: item.link,
        city_id: item.city_id,
        page_h: item.page_h,
        page_title: item.title,
        page_description: item.description,
        page_text: item.content,
        category_id: item.category_id ? item.category_id.id : 0,
      };

      res = await this.getData('save_new', data);
    }

    if (mark === 'editPage') {
      const data = {
        id: item.id,
        page_name: item.page_name,
        link: item.link,
        page_id: item.page_id,
        city_id: item.city_id,
        page_h: item.page_h,
        page_title: item.title,
        page_description: item.description,
        page_text: item.content,
        category_id: item.category_id ? item.category_id.id : 0,
      };

      res =await this.getData('save_edit', data);
    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false,
        itemName: '',
        item: null
      });

      setTimeout(async () => {
        this.update();
      }, 300);

    } else {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

    }

  }

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      cities: data.cities,
      city: data.cities[0].id,
      pages: data.pages,
      pagesCopy: data.pages,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

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
                    <TableCell style={{ width: '20%' }}>Заголовок (title)</TableCell>
                    <TableCell style={{ width: '45%' }}>Описание (description)</TableCell>
                    <TableCell style={{ width: '15%' }}>Последнее обновление</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.pages.map((item, key) => (
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
