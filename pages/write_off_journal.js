import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {MySelect, MyDatePickerNew, formatDate, MyAlert, MyTextInput} from '@/ui/elements';

import queryString from 'query-string';
//import dayjs from 'dayjs';

import { data, items, data_table, modal_view, modal_new } from '@/src/data_write_off_journal';

class Write_off_journal_modal_new extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      points: [],
      point: '',

      types: [],
      type: '',

      items: [],
      item: '',

      count: '',
      ed_izmer: '',

      writeOffItems: [],
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.data) {
      return;
    }

    if (this.props.data !== prevProps.data) {
      this.setState({
        points: this.props.points,
        types: this.props.data.types,
        items: this.props.data.items,
      });
    }
  }

  changeItem(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  addItems() {
    let { point, type, types, item, items, count, ed_izmer, writeOffItems } = this.state;

    type = types.find((it) => parseInt(it.id) === parseInt(type))?.name;

    item = items.find((it) => parseInt(it.id) === parseInt(item))?.name;

    const data = {
      id: writeOffItems.length + 1,
      point,
      type,
      item,
      count,
      ed_izmer,
      comment: '',
    };

    writeOffItems.push(data);

    this.setState({
      writeOffItems,
    });
  }

  changeComment(key, event) {
    let writeOffItems = this.state.writeOffItems;

    writeOffItems[key].comment = event.target.value;

    this.setState({
      writeOffItems,
    });
  }

  save() {
    const writeOffItems = this.state.writeOffItems;

    this.props.save(writeOffItems);

    this.onClose();
  }

  onClose() {
    this.setState({
      point: '',
      type: '',
      item: '',
      count: '',
      ed_izmer: '',
      writeOffItems: [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>Новое списание</Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={4}>
              <MySelect
                is_none={false}
                data={this.state.points}
                value={this.state.point}
                func={this.changeItem.bind(this, 'point')}
                label="Точка"
              />
            </Grid>
            <Grid item xs={12} sm={8} />
            <Grid item xs={12} sm={3}>
              <MySelect
                is_none={false}
                data={this.state.types}
                value={this.state.type}
                func={this.changeItem.bind(this, 'type')}
                label="Тип"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MySelect
                is_none={false}
                data={this.state.items}
                value={this.state.item}
                func={this.changeItem.bind(this, 'item')}
                label="Наименование"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                type="number"
                label="Количество"
                value={this.state.count}
                func={this.changeItem.bind(this, 'count')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyTextInput
                label="Ед измерения"
                value={this.state.ed_izmer}
                func={this.changeItem.bind(this, 'ed_izmer')}
              />
            </Grid>
            <Grid item xs={12} sm={9} />
            <Grid item xs={12} sm={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={this.addItems.bind(this)} variant="contained" color="success">
                Добавить
              </Button>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider />
            </Grid>
          </Grid>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '20%' }}>Тип</TableCell>
                  <TableCell style={{ width: '20%' }}>Наименование</TableCell>
                  <TableCell style={{ width: '20%' }}>Количество</TableCell>
                  <TableCell style={{ width: '40%' }}>Комментарии</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.writeOffItems.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell>{it.type}</TableCell>
                    <TableCell>{it.item}</TableCell>
                    <TableCell>{it.count + ' ' + it.ed_izmer}</TableCell>
                    <TableCell>
                      <MyTextInput
                        label="Комментарий"
                        value={it.comment}
                        func={this.changeComment.bind(this, key)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.save.bind(this)} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Write_off_journal_modal_view extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
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
      });
    }
  }

  onClose() {
    this.setState({
      item: [],
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ''}
          </Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '5%' }}>№</TableCell>
                  <TableCell style={{ width: '20%' }}>Позиция</TableCell>
                  <TableCell style={{ width: '15%' }}>Количество</TableCell>
                  <TableCell style={{ width: '15%' }}>Себестоимость</TableCell>
                  <TableCell style={{ width: '15%' }}>Комментарии</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.count + ' ' + it.ed_izmer}</TableCell>
                    <TableCell>{' '}{new Intl.NumberFormat('ru-RU').format(it.price)} ₽</TableCell>
                    <TableCell>{it.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose.bind(this)} variant="contained">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Write_off_journal_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'write_off_journal',
      module_name: '',
      is_load: false,

      points: [],
      point: '',

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      items: [],
      itemsCopy: [],

      openAlert: false,
      err_status: true,
      err_text: '',

      searchItem: '',

      data_table: [],
      item: null,

      fullScreen: false,

      modalDialogView: false,

      modalDialogNew: false,
      data_new: [],
    };
  }

  async componentDidMount() {
    //const data = await this.getData('get_all');

    //console.log('data', data)

    this.setState({
      points: data.points,
      point: data.points[0].id,
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

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  search(event) {
    const searchItem = event.target.value;
    const point = this.state.point;

    const items = JSON.parse(JSON.stringify(this.state.itemsCopy));

    if (!point || !items.length) {
      return;
    }

    if (!searchItem) {
      this.setState({
        searchItem,
        items,
      });

      return;
    }

    const itemsFilter = items.map((item) => {
      item.dish = item.dish.filter((item) => item.title.toLowerCase().includes(searchItem.toLowerCase()));

      item.structure = item.structure.filter((item) => item.name.toLowerCase().includes(searchItem.toLowerCase()));

      return item;
    });

    this.setState({
      searchItem,
      items: itemsFilter,
    });
  }

  async getWriteOff() {
    const res = { items, data_table };

    this.setState({
      items: res.items,
      itemsCopy: res.items,
      data_table: res.data_table,
    });
  }

  async openViewItem() {
    this.handleResize();

    const res = modal_view;

    this.setState({
      modalDialogView: true,
      item: res,
    });
  }

  async openNewItem() {
    this.handleResize();

    const res = modal_new;

    this.setState({
      modalDialogNew: true,
      data_new: res,
    });
  }

  async saveNewItem(item) {
    console.log('saveNewItem', item);
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

        <Write_off_journal_modal_view
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false })}
          item={this.state.item}
          fullScreen={this.state.fullScreen}
        />

        <Write_off_journal_modal_new
          open={this.state.modalDialogNew}
          onClose={() => this.setState({ modalDialogNew: false })}
          data={this.state.data_new}
          points={this.state.points}
          fullScreen={this.state.fullScreen}
          save={this.saveNewItem.bind(this)}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button onClick={this.openNewItem.bind(this)} variant="contained">
              Новое списание
            </Button>
          </Grid>

          <Grid item xs={12} sm={9} />

          <Grid item xs={12} sm={4}>
            <MySelect
              is_none={false}
              label="Точка"
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, 'point')}
            />
          </Grid>

          <Grid item xs={12} sm={8} />

          <Grid item xs={12} sm={2}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, 'date_start')}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, 'date_end')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <MyTextInput
              label="Поиск позиции списания"
              value={this.state.searchItem}
              func={this.search.bind(this)}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button onClick={this.getWriteOff.bind(this)} variant="contained">
              Посмотреть
            </Button>
          </Grid>
          {!this.state.items.length ? null : (
            <>
              <Grid item xs={12} sm={4}>
                {this.state.items.map((item, key) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Количество по материалам</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell style={{ width: '35%' }}>Позиция</TableCell>
                              <TableCell style={{ width: '35%' }}>Количество</TableCell>
                              <TableCell style={{ width: '30%' }}></TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {item.structure.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{it.name}</TableCell>
                                <TableCell>{it.pf + ' ' + it.ed_izmer}</TableCell>
                                <TableCell>{new Intl.NumberFormat('ru-RU').format(it.price)}{' '}₽</TableCell>
                              </TableRow>
                            ))}
                            {this.state.searchItem ? null : (
                              <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                                <TableCell>Общая:</TableCell>
                                <TableCell></TableCell>
                                <TableCell>{new Intl.NumberFormat('ru-RU').format(item.allPrice)}{' '}₽</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                {this.state.items.map((item, key) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Количество по блюдам</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell style={{ width: '35%' }}>Позиция</TableCell>
                              <TableCell style={{ width: '35%' }}>Количество</TableCell>
                              <TableCell style={{ width: '30%' }}></TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {item.dish.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{it.title}</TableCell>
                                <TableCell>{it.count + ' ' + it.ed_izmer}</TableCell>
                                <TableCell>{new Intl.NumberFormat('ru-RU').format(it.price)}{' '}₽</TableCell>
                              </TableRow>
                            ))}
                            {this.state.searchItem ? null : (
                              <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                                <TableCell>Общая:</TableCell>
                                <TableCell></TableCell>
                                <TableCell>{new Intl.NumberFormat('ru-RU').format(item.dish[0].price)}{' '}₽</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                {this.state.items.map((item, key) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Количество по создателям</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="sticky table">
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                              <TableCell style={{ width: '40%' }}>Создатель</TableCell>
                              <TableCell style={{ width: '40%' }}>Сумма</TableCell>
                              <TableCell style={{ width: '20%' }}></TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {item.users.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{it.user}</TableCell>
                                <TableCell>{' '}{new Intl.NumberFormat('ru-RU').format(item.allPrice)}{' '}₽</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </>
          )}

          {!this.state.data_table.length ? null : (
            <Grid item xs={12} sm={12} mt={5}>
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                      <TableCell style={{ width: '5%' }}>№</TableCell>
                      <TableCell style={{ width: '18%' }}>Дата</TableCell>
                      <TableCell style={{ width: '18%' }}>Время</TableCell>
                      <TableCell style={{ width: '18%' }}>Себестоимость</TableCell>
                      <TableCell style={{ width: '18%' }}>Создатель</TableCell>
                      <TableCell style={{ width: '18%' }}>Редактирование</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.data_table.map((item, key) => (
                      <TableRow hover key={key}>
                        <TableCell>{key + 1}</TableCell>
                        <TableCell style={{ cursor: 'pointer' }} onClick={this.openViewItem.bind(this)}>{item.date}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell>{' '}{new Intl.NumberFormat('ru-RU').format(item.price)} ₽</TableCell>
                        <TableCell>{item.user}</TableCell>
                        <TableCell style={{ cursor: 'pointer' }}>
                          <EditIcon />
                        </TableCell>
                      </TableRow>
                    ))}
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

export default function WriteOffJournal() {
  return <Write_off_journal_ />;
}
