import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tooltip from '@mui/material/Tooltip';
import PostAddIcon from '@mui/icons-material/PostAdd';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyAutocomplite, TextEditor22, MyTextInput, MyAlert } from '@/ui/elements';

import { api_laravel, api_laravel_local } from '@/src/api_new';

class OverviewModules_Modal extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.myRef = React.createRef();

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log('componentDidUpdate', this.props);

    if (this.props.open && this.props.item !== prevProps.item) {
      this.setState({ item: this.props.item });
    }

  }

  changeItem = (field) => (event) => {

    const value = event.target.value;

    this.setState((prev) => ({
      item: { ...prev.item, [field]: value }
    }));

  };

  changeEditor = (value) => {

    this.setState((prev) => ({
      item: { ...prev.item, text: value }
    }));

  };

  onTagsChange = (event, newValue) => {

    this.setState(prev => ({
      item: {
        ...prev.item,
        tag_id: newValue
      }
    }));
  };

  save = () => {
    const { item } = this.state;
    const { type, save, openAlert } = this.props;
    
    if (!item.name?.trim()) {
      openAlert(false, 'Необходимо указать название');
      return;
    }
    
    if ((type === 'art' || type === 'art_edit')) {
      
      const content = this.myRef.current?.getContent?.() || '';
      
      if (!content.trim()) {
        openAlert(false, 'В описании модуля пусто');
        return;
      }
      
      item.text = content;
    }

    console.log("🚀 === item:", item);

    //save(item);
    //this.props.onClose();
  };

  render() {
    const { item } = this.state;
    const { open, fullScreen, method, item_name, tags, type, onClose } = this.props;

    return (
    

        <Dialog
          open={open}
          onClose={onClose}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={'xl'}
        >
          <DialogTitle className="button">
            {method}
            {item_name ? `: ${item_name}` : null}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {item &&
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <MyTextInput
                    label="Название"
                    value={item.name}
                    func={this.changeItem('name')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MyAutocomplite
                    label="Тэги"
                    multiple
                    data={tags}
                    value={item.tag_id || []}
                    func={this.onTagsChange}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Typography gutterBottom>
                    Описание модуля
                  </Typography>
                  <TextEditor22 
                    id="EditorNew" 
                    func={this.changeEditor} 
                    value={item?.text} 
                    refs_={this.myRef} 
                    toolbar={true} 
                    menubar={true} 
                  />
                </Grid>

                {/* {(type === 'art' || type === 'art_edit') && this.state.item?.hist && parseInt(acces?.show_hist) ?  */}
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
                            {item?.hist.map((it, k) =>
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
                  {/* : null
                } */}
               
              </Grid>
            </DialogContent>
          }

          <DialogActions>
            {/* {type !== 'section' && type !== 'art' && parseInt(acces?.delete) ?
              <Button onClick={() => this.setState({ confirmDialog: true })} variant="contained" style={{ backgroundColor: 'rgba(53,59,72,1.000)' }}>
                Удалить
              </Button>
            : null}
            {parseInt(acces?.edit) || parseInt(acces?.create)? */}
              <Button variant="contained" onClick={this.save}>
                Сохранить
              </Button>
            {/* : null} */}
          </DialogActions>

        </Dialog>
    );
  }
}

class OverviewModules_ extends React.Component {
  constructor(props) {
    super(props);
        
    this.state = {
      module: 'overview_modules',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: false,
      err_text: '',

      category: [],
      searchItem: '',

      acces: null,

      modalDialog: false,
      fullScreen: false,

      method: '',
      item: null,
      item_name: '',

      item_new: {
        name: '',
        text: '',
        tag_id: [],
        hist: [],
      },

      tags:[
        {id: 1, name: 'Склад'},
        {id: 2, name: 'Кафе'},
        {id: 3, name: 'Админка'},
        {id: 4, name: 'Продажи'},
        {id: 5, name: 'Ревизия'},
        {id: 6, name: 'Поставщики'}, 
        {id: 7, name: 'Сайт'},
        {id: 8, name: 'Товары'},
        {id: 9, name: 'Уборка'},
        {id: 10, name: 'Клиент'},
      ]
  
    };
  }
  
  async componentDidMount(){
    let data = await this.getData('get_all');
    console.log("🚀 === data:", data);

    let acces = {
      "edit": "1",
      "create": "1",
    }
    
    this.setState({
      category: data.category,
      //acces: data.acces,
      acces,
      module_name: data.module_info.name,
    });
    
    document.title = data.module_info.name;
  }
  
  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel_local(this.state.module, method, data)
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

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };

  search = (event) => {}

  handleTag = (id) => {
    this.setState(({ tags }) => {

      if (id === -1) {
        return { tags: tags.map(t => ({ ...t, active: false })) };
      }

      return {
        tags: tags.map(t =>
          t.id === id ? { ...t, active: !t.active } : t
        )
      };

    });
  };

  openModal = (method, type, cat) => {
    this.handleResize();

    if(type === 'add') {

      const item = JSON.parse(JSON.stringify(this.state.item_new));
  
      this.setState({
        modalDialog: true,
        method,
        type,
        item,
        item_name: cat.name
      });
    }

  }

  save = () => {}

  render() {
    const { is_load, openAlert, err_status, err_text, module_name, category, searchItem, tags, acces, fullScreen, modalDialog, item, item_name, method, type } = this.state;

    return (
      <>
        <Backdrop style={{ zIndex: 999 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />

        <OverviewModules_Modal
          open={modalDialog}
          onClose={() => this.setState({ modalDialog: false, item: null, item_name: '' })}
          item={item}
          fullScreen={fullScreen}
          save={this.save}
          type={type}
          method={method}
          tags={tags}
          item_name={item_name}
          openAlert={this.openAlert}
        />
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <MyTextInput
              label="Поиск"
              value={searchItem}
              func={(event) => {this.setState({ searchItem: event.target.value })}}
              onBlur={this.search}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <Box sx={{ bgcolor: '#F5F5F5', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, overflowX: 'auto' }}>

                {tags.map(tag => (
                  <Box
                    key={tag.id}
                    onClick={() => this.handleTag(tag.id)}
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 3,    
                      height: 40,
                      borderRadius: '20px',
                      border: `1px solid ${tag.active ? '#c03' : 'transparent'}`,
                      bgcolor: '#FFFFFF',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: tag.active ? '#FFFFFF' : '#EEEEEE'
                      }
                    }}
                  >

                    <Box component="span" sx={{ visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none'}}>
                      {tag.name}
                    </Box>

                    <Typography
                      component="span"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: tag.active ? `translate(calc(-50% - ${12}px), -50%)` : 'translate(-50%, -50%)',
                        color: tag.active ? '#c03' : 'rgba(0,0,0,0.87)',
                        fontWeight: 500,
                        fontSize: '1rem',
                        pointerEvents: 'none'
                      }}
                    >
                      {tag.name}
                    </Typography>

                    {tag.active && (
                      <CloseIcon onClick={e => { e.stopPropagation(); this.handleTag(tag.id); }} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#c03', fontSize: 20 }} />
                    )}

                  </Box>
                ))}

              </Box>

              <Box sx={{ textAlign: 'left' }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => this.handleTag(-1)}
                  sx={{
                    bgcolor: '#c03',
                    borderRadius: '20px',
                    height: 40,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem'
                  }}
                >
                  Очистить
                </Button>
              </Box>

            </Box>

          </Grid>

          <Grid item xs={12} sm={12} sx={{ pb: 5 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>Список модулей</Typography>
              </AccordionSummary>

              <AccordionDetails>
                {category.map((item, key) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{item.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
                        <Table size="small">
                          <TableBody>
                            {item.cats.map((cat, k) => (
                              <TableRow key={k} hover>
                                <TableCell>{cat.name}</TableCell>

                                <TableCell padding="none" sx={{ position: 'relative', pl: 0, pr: 0 }}>
                                  <Box component="span" sx={{ position: 'absolute', top: '50%', right: 20, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {Boolean(cat?.desc) ? acces?.edit === '1' || acces?.create === '1' ? 
                                      <Tooltip title="Редактировать описание">
                                        <EditIcon
                                          // onClick={e => { e.stopPropagation(); handleEdit(cat); }}
                                          sx={{ cursor: 'pointer' }}
                                        />
                                      </Tooltip>
                                      : 
                                      <Tooltip title="Просмотр описания">
                                        <VisibilityIcon
                                          // onClick={e => { e.stopPropagation(); handleView(cat); }}
                                          sx={{ cursor: 'pointer' }}
                                        />
                                      </Tooltip>
                                      : acces.create === '1' ?
                                      <Tooltip title="Добавить описание">
                                        <PostAddIcon
                                          onClick={e => {
                                            e.stopPropagation();
                                            this.openModal('Добавление описания модуля', 'add', cat);
                                          }}
                                          sx={{ cursor: 'pointer' }}
                                        />
                                      </Tooltip>
                                      :
                                      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic',   whiteSpace: 'nowrap'  }}>
                                        Описание отсутствует
                                      </Typography>
                                    }
                                  </Box>
                                </TableCell>

                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </AccordionDetails>

            </Accordion>
          </Grid>

        </Grid>
      </>
    );
  }
}

export default function OverviewModules() {
  return <OverviewModules_ />;
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
