import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import Tooltip from '@mui/material/Tooltip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, TextEditor22, MyAlert, MyTextInput } from '@/ui/elements';

import queryString from 'query-string';

class FAQ_Modal_View extends React.Component {
  constructor(props) {
    super(props);

    this.myRef_view = React.createRef();

    this.state = {
      itemView: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        itemView: this.props.itemView
      });
    }
  }

  onClose() {
    this.setState({
      itemView: null,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, item_name, method, acces } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          {method}
          {item_name ? `: ${item_name}` : null}
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Название"
                value={this.state.itemView?.name}
                disabled={true}
                className="disabled_input"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Раздел"
                value={this.state.itemView?.faq_id?.name}
                disabled={true}
                className="disabled_input"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Должности"
                value={this.state.itemView?.apps}
                disabled={true}
                className="disabled_input"
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <TextEditor22 id="EditorNew" value={this.state.itemView?.text} refs_={this.myRef_view} toolbar={false} menubar={false}/>
            </Grid>

            {this.state.itemView?.hist && parseInt(acces?.show_hist) ? 
              <Grid item xs={12} sm={12}>
                <Accordion style={{ width: '100%' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography style={{ fontWeight: 'bold' }}>История изменений</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Дата / время</TableCell>
                          <TableCell>Сотрудник</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.itemView?.hist.map((it, k) =>
                          <TableRow hover key={k}>
                            <TableCell>{k+1}</TableCell>
                            <TableCell>{it.date_update}</TableCell>
                            <TableCell>{it.user}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              : null
            }
          </Grid>

        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={this.onClose.bind(this)}>
            Закрыть
          </Button>
        </DialogActions>

      </Dialog>
    );
  }
}

class FAQ_Modal extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    this.state = {
      item: null,
      section: [],

      confirmDialog: false,

      openAlert: false,
      err_status: false,
      err_text: ''
    };
  }

  componentDidUpdate(prevProps) {
    // console.log('componentDidUpdate', this.props);
    
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {

      const section = JSON.parse(JSON.stringify(this.props.section));
      section.push({id: "-1", name: 'Без раздела'});

      this.setState({
        section,
        item: this.props.item
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;
    const value = event.target.value;
   
    item[data] = value;

    this.setState({
      item
    });
  }

  changeEditor(value) {
    const item = this.state.item;
   
    item.text = value;

    this.setState({
      item
    });
  }

  changeAutocomplite(data, event, value) {
    const item = this.state.item;
   
    item[data] = value;

    if(data === 'apps') {

      const all_apps = item[data].find(item => parseInt(item.id) === -1);

      if(all_apps) {
        item[data] = [];
  
        item[data].push(all_apps);
      }

    }

    this.setState({
      item,
    });
  }

  delete() {
    let item = this.state.item;

    this.props.delete(item);
    this.onClose();
  }

  save() {

    let item = this.state.item;

    if (!item.name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать название'
      });

      return;

    } 

    if((this.props.type === 'art' || this.props.type === 'art_edit') && !item.apps.length) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать должности'
      });
      
      return;
    } 

    if((!this.myRef.current || this.myRef.current.getContent().length === 0) && (this.props.type === 'art' || this.props.type === 'art_edit')) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'В описании статьи пусто'
      });

      return;
    } 

    if(this.click === true){
      return;
    } else {
      this.click = true;
    }

    if(this.props.type === 'art' || this.props.type === 'art_edit') {
      item.text = this.myRef.current.getContent();
    }
    
    const data = item;

    this.props.save(data);
    this.onClose();

    setTimeout(() => {
      this.click = false;
    }, 500)
  }

  onClose() {

    setTimeout(() => {
      this.setState ({
        item: null,
        section: [],
  
        confirmDialog: false,
  
        openAlert: false,
        err_status: false,
        err_text: ''
      });
    }, 100);

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, method, item_name, type, none_section, apps, acces } = this.props;

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }} maxWidth="sm" open={this.state.confirmDialog} onClose={() => this.setState({ confirmDialog: false })}>
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>Точно удалить {type === 'section_edit' ?  'данный раздел ?' : 'данную статью ?'}</DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
            <Button onClick={this.delete.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <DialogTitle className="button">
            {method}
            {item_name ? `: ${item_name}` : null}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0, padding: 20 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {!this.state.item ? null : (
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                  <MyTextInput
                    label="Название"
                    value={this.state.item.name}
                    func={this.changeItem.bind(this, 'name')}
                  />
                </Grid>

                {type === 'section' || type === 'section_edit' ? 
                  <Grid item xs={12} sm={12}>
                    <MyAutocomplite
                      label="Статьи"
                      multiple={true}
                      data={none_section}
                      value={this.state.item?.arts}
                      func={this.changeAutocomplite.bind(this, 'arts')}
                    />
                  </Grid>
                  :
                  <>
                    <Grid item xs={12} sm={6}>
                      <MyAutocomplite
                        label="Раздел"
                        multiple={false}
                        data={this.state.section}
                        value={this.state.item?.faq_id}
                        func={this.changeAutocomplite.bind(this, 'faq_id')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MyAutocomplite
                        label=" Должности"
                        multiple={true}
                        data={apps}
                        value={this.state.item?.apps}
                        func={this.changeAutocomplite.bind(this, 'apps')}
                      />
                  </Grid>
                  </>
                }

                {type === 'art' || type === 'art_edit' ? 
                  <Grid item xs={12} sm={12}>
                    <TextEditor22 id="EditorNew" func={this.changeEditor.bind(this)} value={this.state.item?.text} refs_={this.myRef} toolbar={true} menubar={true} />
                  </Grid>
                  : null
                }

                {(type === 'art' || type === 'art_edit') && this.state.item?.hist && parseInt(acces?.show_hist) ? 
                  <Grid item xs={12} sm={12}>
                    <Accordion style={{ width: '100%' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography style={{ fontWeight: 'bold' }}>История изменений</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Дата / время</TableCell>
                              <TableCell>Сотрудник</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.item?.hist.map((it, k) =>
                              <TableRow hover key={k}>
                                <TableCell>{k+1}</TableCell>
                                <TableCell>{it.date_update}</TableCell>
                                <TableCell>{it.user}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                  : null
                }
               
              </Grid>
            </DialogContent>
          )}

          <DialogActions>
            {type !== 'section' && type !== 'art' && parseInt(acces?.delete) ?
              <Button onClick={() => this.setState({ confirmDialog: true })} variant="contained" style={{ backgroundColor: 'rgba(53,59,72,1.000)' }}>
                Удалить
              </Button>
            : null}
            {parseInt(acces?.edit) || parseInt(acces?.create)?
              <Button variant="contained" onClick={this.save.bind(this)}>
                Сохранить
              </Button>
            : null}
          </DialogActions>

        </Dialog>
      </>
    );
  }
}

class FAQ_ extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      module: 'faq_module',
      module_name: '',
      is_load: false,

      section: [],
      none_section: [],
      apps: [],
 
      modalDialog: false,
      fullScreen: false,

      method: '',
      type: '',

      openAlert: false,
      err_status: true,
      err_text: '',

      item: null,
      item_name: '',

      item_new: {
        name: '',
        text: '',
        arts: [],
        faq_id: null,
        apps: []
      },

      section_copy: [],
      none_section_copy: [],

      searchItem: '',

      acces: null,

      modalDialogView: false
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      apps: data.apps,
      acces: data.acces,
      module_name: data.module_info.name
    });

    this.get_data_user(data);

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

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      apps: data.apps,
      acces: data.acces
    });

    this.get_data_user(data);
  }

  get_data_user(data) {

    const acces = data.acces;
    
    if(parseInt(acces.create) && parseInt(acces.edit)) {

      this.setState({
        section: data.faq.section,
        none_section: data.faq.none_section,
        section_copy: data.faq.section,
        none_section_copy: data.faq.none_section,
      });
      
    } else {

      const user = parseInt(data.user_id);
      const section = data.faq.section;
      const none_section = data.faq.none_section;
  
      const user_section = section.reduce((new_sec, sec) => {
  
        if(sec.arts.length) {

          const new_arts = sec.arts.reduce((new_arts, art) => {
  
            if(parseInt(art.status) === 1) {
              if(art.apps.find(it => (parseInt(it.id) === user || parseInt(it.id) === -1))) {
                new_arts.push(art);
              }
            }
  
          return new_arts;
          }, []);
  
          if(new_arts.length) {
            sec.arts = new_arts;
            new_sec.push(sec);
          }
        } 
  
        return new_sec;
      
      }, []);
  
      const user_none_section = none_section.reduce((new_arts, art) => {

        if(parseInt(art.status) === 1) {
          if(art.apps.find(it => (parseInt(it.id) === user || parseInt(it.id) === -1))) {
            new_arts.push(art);
          }
        }
  
        return new_arts;
      
      }, []);
  
      this.setState({
        section: user_section,
        section_copy: user_section,
        none_section: user_none_section,
        none_section_copy: user_none_section
      });
    }

  }

  openModal_add(method, type) {
    this.handleResize();

    const { create } = this.state.acces;

    if(!parseInt(create)) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'У вас недостаточно прав на Добавление нового раздела/статьи',
      });

      return;

    }

    const item = JSON.parse(JSON.stringify(this.state.item_new));

    this.setState({
      modalDialog: true,
      method,
      type,
      item
    });

  }

  async openModal_edit(method, type, item, event) {
    this.handleResize();

    const { edit } = this.state.acces;

    if(!parseInt(edit)) {
      event.stopPropagation();

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'У вас недостаточно прав для Редактирования раздела/статьи',
      });

      return;

    }

    if(type === 'section_edit') {
      event.stopPropagation();
  
      this.setState({
        modalDialog: true,
        method,
        type,
        item: JSON.parse(JSON.stringify(item)),
        item_name: item.name
      });
    }

    if(type === 'art_edit') {

      let section = JSON.parse(JSON.stringify(this.state.section));
      section.push({id: "-1", name: 'Без раздела'});

      const data = {
        id: item.id,
      }

      const res = await this.getData('get_one_art', data);
      res.art.faq_id = section.find(el => parseInt(el.id) === parseInt(res.art.faq_id)) ?? null;
  
      this.setState({
        modalDialog: true,
        method,
        type,
        item: res.art,
        item_name: res.art.name
      });
    }

  }

  async openModal_view(method, item) {
    this.handleResize();

    const { show } = this.state.acces;

    if(!parseInt(show)) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'У вас недостаточно прав для Просмотра статей',
      });

      return;

    }

    let section = JSON.parse(JSON.stringify(this.state.section));
    section.push({id: "-1", name: 'Без раздела'});

    const data = {
      id: item.id,
    }

    const res = await this.getData('get_one_art', data);

    res.art.faq_id = section.find(el => parseInt(el.id) === parseInt(res.art.faq_id)) ?? null;
    res.art.apps = res.art.apps.map((el) => el.name).join(', ');

    this.setState({
      modalDialogView: true,
      method,
      item: res.art,
      item_name: res.art.name
    });

  }

  async saveSection(item) {

    const type = this.state.type;

    let data = {
      name: item.name,
      arts: item.arts
    }

    let res;

    if(type === 'section') {

      res = await this.getData('save_new_section', data);

    } else {

      const section = this.state.section;
      const arts_past = section.find(sec => parseInt(sec.id) === parseInt(item.id))?.arts;

      let old = [];

      data.arts.map(art_new => {
        arts_past.map(art_old => {
          if(parseInt(art_new.id) === parseInt(art_old.id)) {
            old.push(art_old);
          }
          return art_old;
        })
        return art_new;
      })

      let arts_old = []; // статьи которые надо изменить на Без раздела (-1)

      if(old.length) {
        arts_old = arts_past.filter(art => {
          if(!old.find(it => parseInt(it.id) === parseInt(art.id))) {
            return art;
          }
        })
      } else {
        arts_old = arts_past;
      };

      const arts_new = data.arts.reduce((new_arts, art) => {

        let isFound = arts_past.some((it) => {
          return it.id === art.id;
        });

        if(!isFound) {
          new_arts.push(art);
        }

        return new_arts;
      }, []);

      data.arts_old = arts_old;
      data.arts = arts_new;
      data.id = item.id;

      res = await this.getData('save_edit_section', data);
    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
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

  async saveArt(item) {

    const type = this.state.type;

    let data = {
      name: item.name,
      text: item.text,
      faq_id: item.faq_id ? item.faq_id.id : -1,
      apps: item.apps
    }

    let res;

    if(type === 'art') {

      res = await this.getData('save_new_art', data);

    } else {

      data.id = item.id;
      res = await this.getData('save_edit_art', data);

    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
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

  async delete(item) {

    const type = this.state.type;

    let res;
    let data;

    if(type === 'section_edit') {

      data = {
        name: item.name,
        arts: item.arts,
        id: item.id
      }

      res = await this.getData('delete_section', data);
    } 

    if(type === 'art_edit'){

      data = {
        name: item.name,
        text: item.text,
        faq_id: item.faq_id ? item.faq_id.id : -1,
        apps: item.apps,
        id: item.id
      }

      res = await this.getData('delete_art', data);
    }

    if (res.st) {

      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialog: false
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

  search(event) {
    const searchItem = event.target.value;

    const section = this.state.section_copy;
    const none_section = JSON.parse(JSON.stringify(this.state.none_section_copy));

    const section_filter = section.filter((item) => {

      if(searchItem) {
      
        if(item.arts.length) {
          item.arts = item.arts.filter(it => {
            if(it.name.toLowerCase().includes(searchItem.toLowerCase()) || it.text.toLowerCase().includes(searchItem.toLowerCase())) {
              return it;
            }
          });
          
          if(item.arts.length) {
            return item;
          }
        }

      } else {
        return item;
      }
    
    });

    const none_section_filter = none_section.filter((item) => {

      if(searchItem) {

        if(item.name.toLowerCase().includes(searchItem.toLowerCase()) || item.text.toLowerCase().includes(searchItem.toLowerCase())) {
          return item;
        }

      } else {
        return item;
      }
    
    });

    this.setState({
      searchItem,
      section: section_filter,
      none_section: none_section_filter
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <FAQ_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, item: null, item_name: '' })}
          item={this.state.item}
          fullScreen={this.state.fullScreen}
          save={this.state.type === 'section' || this.state.type === 'section_edit' ? this.saveSection.bind(this) : this.saveArt.bind(this)}
          section={this.state.section}
          none_section={this.state.none_section}
          type={this.state.type}
          method={this.state.method}
          apps={this.state.apps}
          item_name={this.state.item_name}
          delete={this.delete.bind(this)}
          acces={this.state.acces}
        />

        <FAQ_Modal_View
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, item: null, item_name: '' })}
          itemView={this.state.item}
          fullScreen={this.state.fullScreen}
          method={this.state.method}
          item_name={this.state.item_name}
          acces={this.state.acces}
        />

        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>

          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.openModal_add.bind(this, 'Новый раздел', 'section')} variant="contained">
              Добавить раздел
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button onClick={this.openModal_add.bind(this, 'Новая статья', 'art')} variant="contained">
              Добавить статью
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <MyTextInput
              label="Поиск по статьям"
              value={this.state.searchItem}
              func={(event) => {this.setState({ searchItem: event.target.value })}}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          {/* список разделов */}
          <Grid item xs={12} sm={12}>
            {this.state.section.map( (item, key) =>
              <Accordion style={{ width: '100%' }} key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className='accordion_f_a_q' style={{ backgroundColor: parseInt(item.status) === 2 ? '#fadadd' : '#fff'}}>
                  <Typography style={{ fontWeight: 'bold' }}>{item.name}</Typography>
                  <Tooltip title={<Typography color="inherit">Редактирование раздела</Typography>}> 
                    <IconButton onClick={this.openModal_edit.bind(this, 'Редактрование раздела', 'section_edit', item)} mr={7}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Редактирование</TableCell>
                        <TableCell>Просмотр</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {item.arts.map((it, k) =>
                        <TableRow hover key={k} style={{ backgroundColor: parseInt(it.status) === 2 ? '#fadadd' : '#fff'}}>
                          <TableCell>{k+1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>
                            <EditIcon 
                              style={{ cursor: 'pointer' }} 
                              onClick={this.openModal_edit.bind(this, 'Редактрование статьи', 'art_edit', it)} />
                          </TableCell>
                          <TableCell>
                            <TextSnippetOutlinedIcon 
                              style={{ cursor: 'pointer' }} 
                              onClick={this.openModal_view.bind(this, 'Просмотр', it)} 
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>

          {/* список статей без раздела */}
          {!this.state.none_section.length ? null :
            <Grid item xs={12} sm={12} style={{ marginBottom: 100 }}>
              <Accordion style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography style={{ fontWeight: 'bold' }}>Без раздела</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Редактирование</TableCell>
                        <TableCell>Просмотр</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.none_section.map( (it, k) =>
                        <TableRow hover key={k} style={{ backgroundColor: parseInt(it.status) === 2 ? '#fadadd' : '#fff'}}>
                          <TableCell>{k+1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>
                            <EditIcon 
                              style={{ cursor: 'pointer' }} 
                              onClick={this.openModal_edit.bind(this, 'Редактрование статьи', 'art_edit', it)} />
                          </TableCell>
                          <TableCell>
                            <TextSnippetOutlinedIcon 
                              style={{ cursor: 'pointer' }} 
                              onClick={this.openModal_view.bind(this, 'Просмотр', it)} 
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          }
             
        </Grid>
      </>
    );
  }
}

export default function FAQ() {
  return <FAQ_ />;
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