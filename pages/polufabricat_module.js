import React from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
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
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MySelect, MyCheckBox, MyTextInput, MyAutocomplite, MyAlert} from '@/ui/elements';

import queryString from 'query-string';

class PolufabricatModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      const item = this.props.event;

      if(this.props.mark === 'newItem') {
        item.item.this_storages = [];
      }

      this.setState({
        item,
      });
    }
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item.item, this.props.mark);

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
        maxWidth={'md'}
      >
        <DialogTitle className="button">
          <Typography>{this.props.method}{this.props.itemName ? ': ' + this.props.itemName : ''}
          </Typography>
          {this.props.fullScreen ? (
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Название заготовки"
                value={this.state.item ? this.state.item.item.name : ''}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                label="Категория"
                data={this.state.item ? this.state.item.cat_pf : []}
                value={this.state.item ? parseInt(this.state.item.item.cat_pf_id) == 0 ? '' : this.state.item.item.cat_pf_id : ''}
                func={this.changeItem.bind(this, 'cat_pf_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                label="Ед измерения"
                data={this.state.item ? this.state.item.ed_izmer : []}
                value={this.state.item ? parseInt(this.state.item.item.ed_izmer_id) == 0 ? '' : this.state.item.item.ed_izmer_id : ''}
                func={this.changeItem.bind(this, 'ed_izmer_id')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MyTextInput
                label="Минимальный остаток"
                value={this.state.item ? this.state.item.item.min_count : ''}
                func={this.changeItem.bind(this, 'min_count')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Срок годности"
                value={this.state.item ? this.state.item.item.shelf_life : ''}
                func={this.changeItem.bind(this, 'shelf_life')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Место хранения"
                multiple={true}
                data={this.state.item ? this.state.item.storages : []}
                value={this.state.item ? this.state.item.item.this_storages : []}
                func={(event, value) => {
                  let item = this.state.item;
                  item.item.this_storages = value;
                  this.setState({ item });
                }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyTextInput
                label="Состав"
                value={this.state.item ? this.state.item.item.structure : ''}
                func={this.changeItem.bind(this, 'structure')}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Аллергены"
                multiple={true}
                data={this.state.item ? this.state.item.allergens : []}
                value={this.state.item ? this.state.item.item.my_allergens : []}
                func={(event, value) => {
                  let item = this.state.item;
                  item.item.my_allergens = value;
                  this.setState({ item });
                }}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <MyAutocomplite
                label="Возможные аллергены"
                multiple={true}
                data={this.state.item ? this.state.item.allergens : []}
                value={this.state.item ? this.state.item.item.my_allergens_other : []}
                func={(event, value) => {
                  let item = this.state.item;
                  item.item.my_allergens_other = value;
                  this.setState({ item });
                }}
              />
            </Grid>

            {this.props.mark === 'itemEdit' ? (
              <Grid item xs={12}>
                <MyCheckBox
                  label="Активность"
                  value={this.state.item ? parseInt(this.state.item.item.is_show) == 1 ? true : false : false}
                  func={this.changeItemChecked.bind(this, 'is_show')}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" style={{ whiteSpace: 'nowrap' }} onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class PolufabricatModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'polufabricat_module',
      module_name: '',
      is_load: false,

      cats: [],
      freeItems: [],

      modalDialog: false,
      fullScreen: false,

      mark: '',
      method: '',

      item: null,
      itemName: '',

      openAlert: false,
      err_status: true,
      err_text: '',

      type: 0,

      searchItem: '',
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    // console.log(data)

    this.setState({
      module_name: data.module_info.name,
      cats: data.items,
      freeItems: data.items_free,
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

  async openModal(mark, method, item_id) {
    this.handleResize();

    if (mark === 'newItem') {
      const res = await this.getData('get_all_for_new');

      this.setState({
        modalDialog: true,
        item: res,
        mark,
        method,
      });
    }

    if (mark === 'itemEdit') {
      const data = {
        item_id,
      };

      const res = await this.getData('get_one', data);

      const itemName = res.item.name;

      this.setState({
        modalDialog: true,
        item: res,
        mark,
        method,
        itemName,
      });
    }
  }

  changeTableItem(item_id, type, is_show, show_in_rev, show_in_order) {

    const is_show_edit = parseInt(is_show) == 1 ? 0 : 1;
    const show_in_rev_edit = parseInt(show_in_rev) == 1 ? 0 : 1;
    const show_in_order_edit = parseInt(show_in_order) == 1 ? 0 : 1;

    if (parseInt(type) == 1 || parseInt(type) == 2 || parseInt(type) == 3) {


      if (parseInt(type) == 1) {
        this.saveItem(item_id, 'active', is_show_edit);
      }

      if (parseInt(type) == 2) {
        this.saveItem(item_id, 'rev', show_in_rev_edit);
      }

      if (parseInt(type) == 3) {
        this.saveItem(item_id, 'order', show_in_order_edit);
      }
    }

    if (parseInt(type) == 4 || parseInt(type) == 5 || parseInt(type) == 6) {
      if (parseInt(type) == 4) {
        this.saveItem(item_id, 'active', is_show_edit);
      }

      if (parseInt(type) == 5) {
        this.saveItem(item_id, 'rev', show_in_rev_edit);
      }

      if (parseInt(type) == 6) {
        this.saveItem(item_id, 'order', show_in_order_edit);
      }
    }
  }

  async saveItem(item_id, type, is_show) {
    const data = {
      item_id,
      type,
      is_show,
    };

    let res = await this.getData('update_order_rev_active', data);

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

  async save(item, mark) {
    let res;

    const data = {
      item,
    };

    if (mark === 'newItem') {
      res = await this.getData('save_new', data);
    }

    if (mark === 'itemEdit') {
      res = await this.getData('update', data);
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

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      cats: data.items,
      freeItems: data.items_free,
    });
  }

  async search() {
    const data = {
      item: this.state.searchItem,
    };

    const res = await this.getData('get_all_search', data);

    this.setState({
      cats: res.items,
      freeItems: res.items_free,
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
          onClose={() => this.setState({ openAlert: false }) } 
          status={this.state.err_status} 
          text={this.state.err_text} />

        <PolufabricatModule_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: '' })}
          method={this.state.method}
          event={this.state.item}
          mark={this.state.mark}
          save={this.save.bind(this)}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} mb={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openModal.bind(this, 'newItem', 'Новая заготовка')} variant="contained">
              Добавить заготовку
            </Button>
          </Grid>

          <Grid item xs={12} sm={3}>
            <MyTextInput
              label="Поиск"
              value={this.state.searchItem}
              func={(event) => {this.setState({ searchItem: event.target.value })}}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} style={{ paddingBottom: '10px' }}>
            {this.state.cats.map((item, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.cats.map((category, key_cat) => (
                    <Accordion key={key_cat}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{category.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails style={{ width: '100%', overflow: 'scroll' }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: '5%' }}>id</TableCell>
                              <TableCell style={{ width: '10%' }}>Активность</TableCell>
                              <TableCell style={{ width: '10%' }}>Ревизия</TableCell>
                              <TableCell style={{ width: '10%' }}>Заявка</TableCell>
                              <TableCell style={{ width: '20%' }}>Название заготовки</TableCell>
                              <TableCell style={{ width: '10%' }}>Мин. ост.</TableCell>
                              <TableCell style={{ width: '10%' }}>Ед. измер</TableCell>
                              <TableCell style={{ width: '25%' }}>Место хранения</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {category.items.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{it.id}</TableCell>
                                <TableCell onClick={this.changeTableItem.bind(this, it.id, 1, it.is_show, it.show_in_rev, it.show_in_order)}>
                                  <MyCheckBox
                                    label=""
                                    value={parseInt(it.is_show) == 1 ? true : false}
                                  />
                                </TableCell>
                                <TableCell onClick={this.changeTableItem.bind(this, it.id, 2, it.is_show, it.show_in_rev, it.show_in_order)}>
                                  <MyCheckBox
                                    label=""
                                    value={parseInt(it.show_in_rev) == 1 ? true : false}
                                  />
                                </TableCell>
                                <TableCell onClick={this.changeTableItem.bind(this, it.id, 3, it.is_show, it.show_in_rev, it.show_in_order)}>
                                  <MyCheckBox
                                    label=""
                                    value={parseInt(it.show_in_order) == 1 ? true : false}
                                  />
                                </TableCell>
                                <TableCell style={{ cursor: 'pointer' }} onClick={this.openModal.bind(this, 'itemEdit', 'Редактирование заготовки', it.id)}>
                                  {it.name}
                                </TableCell>
                                <TableCell>{it.min_count}</TableCell>
                                <TableCell>{it.ei_name}</TableCell>
                                <TableCell>{it.storage_name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
            {this.state.freeItems.length == 0 ? null : (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Без категории</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ width: '100%', overflow: 'scroll' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '5%' }}>id</TableCell>
                        <TableCell style={{ width: '10%' }}>Активность</TableCell>
                        <TableCell style={{ width: '10%' }}>Ревизия</TableCell>
                        <TableCell style={{ width: '10%' }}>Заявка</TableCell>
                        <TableCell style={{ width: '20%' }}>Название заготовки</TableCell>
                        <TableCell style={{ width: '10%' }}>Мин. ост.</TableCell>
                        <TableCell style={{ width: '10%' }}>Ед. измер</TableCell>
                        <TableCell style={{ width: '25%' }}>Место хранения</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.freeItems.map((cat, key) => (
                        <TableRow key={key}>
                          <TableCell>{cat.id}</TableCell>
                          <TableCell onClick={this.changeTableItem.bind(this, cat.id, 4, cat.is_show, cat.show_in_rev, cat.show_in_order)}>
                            <MyCheckBox
                              label=""
                              value={parseInt(cat.is_show) == 1 ? true : false}
                            />
                          </TableCell>
                          <TableCell onClick={this.changeTableItem.bind(this, cat.id, 5, cat.is_show, cat.show_in_rev, cat.show_in_order)}>
                            <MyCheckBox
                              label=""
                              value={parseInt(cat.show_in_rev) == 1 ? true : false}
                            />
                          </TableCell>
                          <TableCell onClick={this.changeTableItem.bind(this, cat.id, 6, cat.is_show, cat.show_in_rev, cat.show_in_order)}>
                            <MyCheckBox
                              label=""
                              value={parseInt(cat.show_in_order) == 1 ? true : false}
                            />
                          </TableCell>
                          <TableCell style={{ cursor: 'pointer' }} onClick={this.openModal.bind(this, 'itemEdit', 'Редактирование заготовки', cat.id)}>
                            {cat.name}
                          </TableCell>
                          <TableCell>{cat.min_count}</TableCell>
                          <TableCell>{cat.ei_name}</TableCell>
                          <TableCell>{cat.storage_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function PolufabricatModule() {
  return <PolufabricatModule_ />;
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