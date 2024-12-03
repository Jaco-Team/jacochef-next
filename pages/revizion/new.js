import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/SaveAs';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import InputAdornment from '@mui/material/InputAdornment';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {MySelect, MyTextInput, MyAlert} from '@/ui/elements';

import { evaluate } from 'mathjs';
import queryString from 'query-string';

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// модальные окна
class Revizion_Modal extends React.Component {
  render() {
    // console.log( 'Revizion_Button_Group render' )

    return (
      <Dialog
        maxWidth={this.props.pf_list ? 'lg' : 'sm'}
        open={this.props.modalDialog}
        onClose={this.props.close.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={this.props.fullScreen ? 'button' : null}>
          <Typography align={this.props.pf_list ? 'left' : 'center'} sx={{ fontWeight: 'bold' }}>{this.props.title}</Typography>
          {this.props.fullScreen ? (
            <IconButton onClick={this.props.close.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        {this.props.comment ? <DialogTitle>{this.props.comment}</DialogTitle> : null}
          <DialogContent align="center" sx={{ fontWeight: this.props.pf_list ? null : 'bold' }}>
            {this.props.pf_list ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '40%' }}>Наименование</TableCell>
                      <TableCell style={{ width: '40%' }}>Количество</TableCell>
                      <TableCell style={{ width: '20%' }}>Ед измерения</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.props.pf_list.map((item, key) => (
                      <TableRow key={key} style={{backgroundColor: this.props.save ? item.count_warn > 0 ? '#ffc107' : null : null}}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>{item?.ei_name ?? ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : this.props.content}
          </DialogContent>
          <DialogActions>
            {this.props.pf_list ? (
              <>
                <Button onClick={this.props.close.bind(this)}>{this.props.save ? 'Отмена' : 'Закрыть'}</Button>
                {this.props.save ? <Button color="success" onClick={this.props.saveRev.bind(this)}>Сохранить</Button> : null}
              </>
            ) : (
              <>
                <Button onClick={this.props.notRestoreData.bind(this)}>Нет</Button>
                <Button color="success" onClick={this.props.getDataRev.bind(this)}>Восстановить</Button>
              </>
            )}
          </DialogActions>
      </Dialog>
    );
  }
}

// группа кнопок Сохранить/Сортировка мест хранения
class Revizion_Button_Group extends React.Component {

  render() {
    // console.log( 'Revizion_Button_Group render' )

    return (
      <>
      {this.props.storages.length == 0 ? null : this.props.fullScreen ? (
        !this.props.items.length || !this.props.pf.length ? null : (
          <Paper sx={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7}} elevation={3}>
            <BottomNavigation showLabels>
              <BottomNavigationAction
                onClick={this.props.open.bind(this)}
                label="Места хранения"
                icon={<RestoreIcon />}
              />
              <BottomNavigationAction
                onClick={this.props.checkData.bind(this)}
                label="Сохранить"
                icon={<SaveIcon />}
              />
            </BottomNavigation>
          </Paper>
        )
      ) : !this.props.items.length || !this.props.pf.length ? null : (
        <Box sx={{ position: 'fixed', bottom: 20, right: 90 }}>
          <SpeedDial ariaLabel="SpeedDial basic example" icon={<SpeedDialIcon />}>
            <SpeedDialAction
              onClick={this.props.open.bind(this)}
              key={'Recents'}
              icon={<RestoreIcon />}
              tooltipTitle={'Места хранения'}
            />
            <SpeedDialAction
              onClick={this.props.checkData.bind(this)}
              key={'Save'}
              icon={<SaveIcon />}
              tooltipTitle={'Сохранить'}
            />
          </SpeedDial>
        </Box>
      )}
      </>
    );
  }
}

// строка Таблицы из списка Заготовок или Рецептов
class Revizion_Table_Row extends React.Component {
  shouldComponentUpdate(nextProps) {
    return JSON.stringify(nextProps.item) !== JSON.stringify(this.props.item);
  }

  render() {
    // console.log( 'Revizion_Table_Row render' )
    const { index, item, saveData, math, type } = this.props;

    return (
      <TableRow>
        <TableCell>
          <Grid container spacing={2}>
            <Grid item xs={5} sm={4} sx={{ wordWrap: 'break-word' }}>{item.name}</Grid>
            <Grid item xs={7} sm={8}>
              <MyTextInput
                label="Количество"
                tabindex={{ tabIndex: index }}
                value={item.value}
                func={(event) => saveData(event, type, item.id, 'value')}
                onBlur={(event) => math(event, type, item.id, 'value')}
                enter={(event) => event.key === 'Enter' ? math(event, type, item.id, 'value') : null}
                inputAdornment={{endAdornment: <InputAdornment position="end">{item?.ei_name ?? ''}</InputAdornment>}}
              />
            </Grid>
          </Grid>
        </TableCell>
      </TableRow>
    );
  }
}

// строка из списка Товаров с объемом и количеством Товара
class Revizion_Table_Row_Item extends React.Component {
  shouldComponentUpdate(nextProps) {
    return JSON.stringify(nextProps.item) !== JSON.stringify(this.props.item);
  }

  render() {
    // console.log( 'Revizion_Table_Row_Item render' )
    const { index, item, it, i, saveData, clearData, math, fullScreen } = this.props;

    return (
      <TableRow>
        <TableCell style={{ borderBottom: 'none', borderTop: 'none' }}>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={4}>
              <MySelect
                is_none={false}
                label="Объем упаковки"
                data={item.size}
                value={it.need_pq}
                func={(event) => saveData(event, 'item', item.id, 'need_pq', i)}
              />
            </Grid>

            <Grid item xs={i === 0 ? 8 : 5} sm={i === 0 ? 8 : 7}>
              <MyTextInput
                label={fullScreen ? i === 0 ? 'Количество' : 'Кол-во' : 'Количество'}
                id={item.id}
                value={it.value}
                tabindex={{ tabIndex: index }}
                func={(event) => saveData(event, 'item', item.id, 'value', i)}
                onBlur={(event) => math(event, 'item', item.id, 'value', i)}
                enter={(event) => event.key === 'Enter' ? math(event, 'item', item.id, 'value', i) : null}
                inputAdornment={{endAdornment: <InputAdornment position="end"> {item?.ei_name ?? ''}</InputAdornment>}}
              />
            </Grid>

            {i === 0 ? null : (
              <Grid item xs={1} sm={1}>
                <Button variant="contained" onClick={() => clearData(item.id, i)}>
                  <CloseIcon />
                </Button>
              </Grid>
            )}
          </Grid>
        </TableCell>
      </TableRow>
    );
  }
}

// строка Таблицы из списка Товаров
class Revizion_Table_Item extends React.Component {
  shouldComponentUpdate(nextProps) {
    return JSON.stringify(nextProps.item) !== JSON.stringify(this.props.item);
  }

  render() {
    // console.log( 'Revizion_Table_Item render' )
    const { index, item, saveData, clearData, copyData, math, fullScreen } = this.props;

    return (
      <>
        <TableHead>
          <TableRow>
            {fullScreen ? (
              <TableCell>{item.name} {item.value} {item.value === '' ? '' : item.ei_name}</TableCell>
            ) : (
              <TableCell>
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>{item.name}</Grid>
                  <Grid item xs={8} sm={8}>{item.value} {item.value === '' ? '' : item.ei_name}</Grid>
                </Grid>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {item.counts.map((it, i) => (
            <Revizion_Table_Row_Item
              key={i}
              i={i}
              it={it}
              item={item}
              index={index}
              saveData={saveData}
              clearData={clearData}
              math={math}
              fullScreen={fullScreen}
            />
          ))}
          <TableRow>
            <TableCell style={{ borderTop: 'none', borderBottom: '1px groove #e6e6e6' }}>
              <Button variant="contained" onClick={() => copyData(item.id)}>
                Дублировать
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </>
    );
  }
}

// Таблица
class Revizion_Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      rec: [],
      pf: [],
      id: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log(nextProps);

    if (!nextProps.items || !nextProps.pf || !nextProps.rec) {
      return null;
    }

    if (nextProps.items !== prevState.items || nextProps.pf !== prevState.pf || nextProps.rec !== prevState.rec) {
      if (prevState.id) {
        const id = prevState.id;

        const itemsCopy = JSON.parse(JSON.stringify(nextProps.items));

        const recCopy = JSON.parse(JSON.stringify(nextProps.rec));

        const pfCopy = JSON.parse(JSON.stringify(nextProps.pf));

        const items = itemsCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

        const rec = recCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

        const pf = pfCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

        return { items, rec, pf };
      } else {
        return {
          items: JSON.parse(JSON.stringify(nextProps.items)),
          rec: JSON.parse(JSON.stringify(nextProps.rec)),
          pf: JSON.parse(JSON.stringify(nextProps.pf)),
        };
      }
    }
    return null;
  }

  // сортировка по месту хранения
  sortItem(id) {
    const itemsCopy = this.state.items;

    const recCopy = this.state.rec;

    const pfCopy = this.state.pf;

    const items = itemsCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

    const rec = recCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

    const pf = pfCopy.filter((item) => item.storages.find((storages) => id ? storages.storage_id === id : storages));

    this.setState({ items, rec, pf, id });

    this.props.onClose();
  }

  render() {
    // console.log('Revizion_List render');

    return (
      <>
        {/* Товары */}
        <TableContainer component={Paper} style={{ marginBottom: 85 }}>
          <Table>
            {/* Товары */}
            {!this.state.items.length ? null : (
              <TableHead>
                <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                  <TableCell>
                    <Grid container spacing={2}>
                      <Grid item xs={4} sm={4}>Товар</Grid>
                      <Grid item xs={8} sm={8}>Количество</Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              </TableHead>
            )}
            {this.state.items.map((item, key) => (
              <Revizion_Table_Item
                key={key}
                index={key + 1}
                item={item}
                saveData={this.props.saveData}
                clearData={this.props.clearData}
                copyData={this.props.copyData}
                math={this.props.math}
                fullScreen={this.props.fullScreen}
              />
            ))}

            {/* Заготовки */}
            {!this.state.pf.length ? null : (
              <>
                <TableHead>
                  <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                    <TableCell>
                      <Grid container spacing={2}>
                        <Grid item xs={5} sm={4}>Заготовка</Grid>
                        <Grid item xs={7} sm={8}>Количество</Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.pf.map((item, key) => (
                    <Revizion_Table_Row
                      key={key}
                      index={key + 1}
                      item={item}
                      saveData={this.props.saveData}
                      math={this.props.math}
                      type={'pf'}
                    />
                  ))}
                </TableBody>
              </>
            )}

            {/* Рецепты */}
            {!this.state.rec.length ? null : (
              <>
                <TableHead>
                  <TableRow style={{ backgroundColor: '#ADD8E6' }}>
                    <TableCell>
                      <Grid container spacing={2}>
                        <Grid item xs={5} sm={4}>Рецепт</Grid>
                        <Grid item xs={7} sm={8}>Количество</Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.rec.map((item, key) => (
                    <Revizion_Table_Row
                      key={key}
                      index={key + 1}
                      item={item}
                      saveData={this.props.saveData}
                      math={this.props.math}
                      type={'rec'}
                    />
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>

        {/* Боковая панель с выбором мест хранения */}
        <React.Fragment>
          <SwipeableDrawer
            anchor={'left'}
            open={this.props.open}
            onClose={() => this.props.onClose()}
            onOpen={() => this.props.onOpen()}
          >
            <List style={{ width: '100%' }}>
              {this.props.storages.map((item, key) => (
                <ListItemButton key={key} onClick={this.sortItem.bind(this, item.id)}>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              ))}
            </List>
          </SwipeableDrawer>
        </React.Fragment>
      </>
    );
  }
}

// Новая ревизия
class RevizionNew_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'revizion',
      module_name: '',
      is_load: false,

      points: [],
      point: '0',

      revData: null,

      allItems: [],
      search: '',
      itemsCopy: [],
      recCopy: [],
      pfCopy: [],

      storages: [],
      items: [],
      rec: [],
      pf: [],

      modalDialog: false,
      title: '',
      content: '',
      comment: '',
      open: false,

      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: '',

      pf_list: null,
      save: false,
      data: [],
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      points: data.point_list,
      point: data.point_list.length == 1 ? data.point_list[0].id : '0',
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    if (data.point_list.length == 1) {
      setTimeout(() => {
        this.getLocalStorage();
      }, 300);
    }
  }

  // получение размера экрана
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

  // измение точки подгрузка данных
  changePoint(event) {
    const data = event.target.value;

    if (data) {
      setTimeout(() => {
        this.getLocalStorage();
      }, 300);
    }

    this.setState({
      revData: null,
      point: data,
      storages: [],
      items: [],
      rec: [],
      pf: [],
      allItems: [],
      save: false,
      pf_list: null,
      search: '',
      fullScreen: false,
    });
  }

  // метод получения данных
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

  // получаем данные
  async getDataRev() {
    this.handleResize();

    this.setState({
      modalDialog: false,
      title: '',
      comment: '',
      content: '',
    });

    const point_id = this.state.point;

    const revData = this.state.revData;

    const data = {
      point_id,
    };

    const res = await this.getData('get_data_for_new_rev', data);

    // console.log(res);

    if (revData) {
      res.items.forEach((item) => {
        revData.items.forEach((it) => {
          if (it.id === item.id && it.type === item.type) {
            item.value = it.value;
            item.counts = it.counts;
          }
        });
      });

      res.pf.forEach((item) => {
        revData.items.forEach((it) => {
          if (it.id === item.id && it.type === item.type) {
            item.value = it.value;
          }
        });
      });

      res.rec.forEach((item) => {
        revData.items.forEach((it) => {
          if (it.id === item.id && it.type === item.type) {
            item.value = it.value;
          }
        });
      });
    }

    this.setState({
      revData,
      pf: res.pf,
      rec: res.rec,
      items: res.items,
      storages: res.storages,
      pfCopy: res.pf,
      recCopy: res.rec,
      itemsCopy: res.items,
      allItems: res.all_for_search,
    });
  }

  // получение общего количества данных из выражения в инпуте и переход к следующем инпуту по нажатию enter
  math(event, type, id, data, i) {
    // console.log(event, type, id, data, i);

    const regexp = /^[a-zа-яё,._\-/=!?]+$/gi;

    if (regexp.test(event.target.value)) {
      return;
    }

    const result = String(evaluate(event.target.value) ?? '');

    this.saveData(result, type, id, data, i);

    if (document.activeElement !== document.body) {
      const nextInput = [...document.querySelectorAll('input:not([tabindex = "-1"]):not([autocomplete])')];
      const index = nextInput.indexOf(document.activeElement) + 1;

      if (nextInput[index]) {
        nextInput[index].focus();
      } else {
        return;
      }
    }
  }

  // предварительное сохранение
  saveData(event, type, id, data, index) {
    // console.log(type, id, data, index);

    if (type == 'item') {
      const items = this.state.items;

      items.forEach((item) => {
        if (item.id === id) {
          item.counts[index][data] = event.target?.value ?? event;

          let allVal = 0;

          item.counts.forEach((it) => {
            if (it.value.includes('=')) {
              it.value = evaluate(it.value.replaceAll('=', ''));
              allVal += Number(it.need_pq) * Number(it.value);
            } else {
              allVal += Number(it.need_pq) * Number(it.value);
            }
          });

          if (isNaN(allVal)) {
            item.value = 0;
          } else {
            item.value = allVal;
          }

          this.setLocalStorage(item.id, item.value, item.type, item.counts);
        }
      });

      this.setState({
        items,
      });
    }

    if (type === 'pf') {
      const pf = this.state.pf;

      pf.forEach((pf) => {
        if (pf.id === id) {
          const value = event.target?.value ?? event;

          if (value.includes('=')) {
            pf[data] = evaluate(value.replaceAll('=', ''));
          } else {
            pf[data] = value;
          }

          this.setLocalStorage(pf.id, pf.value, pf.type);
        }
      });

      this.setState({
        pf,
      });
    }

    if (type === 'rec') {
      const rec = this.state.rec;

      rec.forEach((rec) => {
        if (rec.id === id) {
          const value = event.target?.value ?? event;

          if (value.includes('=')) {
            rec[data] = evaluate(value.replaceAll('=', ''));
          } else {
            rec[data] = value;
          }

          this.setLocalStorage(rec.id, rec.value, rec.type);
        }
      });

      this.setState({
        rec,
      });
    }
  }

  // сохранить заполненные, но не сохраненные данные ревизии в localStorage
  setLocalStorage(id, value, type, counts) {
    const point = this.state.point;

    let data = this.state.revData;

    if (data) {
      data.items = data.items.map((item) => {
        if (item.id === id && item.type === type) {
          item.value = value;
          counts ? (item.counts = counts) : null;
        }
        return item;
      });

      data.items = data.items.find((item) => item.id === id && item.type === type) ? data.items : [...data.items, ...[{ type, id, value, counts }]];
    } else {
      data = {
        date: formatDate(new Date()),
        items: [],
      };

      data.items.push({ type, id, value, counts });
    }

    this.setState({
      revData: data,
    });

    localStorage.setItem(`revizionDataPoint-${point}`, JSON.stringify(data));
  }

  // получения данных по точке из localStorage
  getLocalStorage() {
    const point = this.state.point;

    const revData = JSON.parse(localStorage.getItem(`revizionDataPoint-${point}`));

    if (revData?.date === formatDate(new Date())) {
      this.setState({
        revData,
        modalDialog: true,
        title: 'В памяти есть данные по Ревизии!',
        content: 'Восстановить данные?',
        storages: [],
        items: [],
        rec: [],
        pf: [],
      });
    } else {
      localStorage.removeItem(`revizionDataPoint-${point}`);

      setTimeout(() => {
        this.notRestoreData();
      }, 300);
    }
  }

  // не восстановливать данные Ревизии
  notRestoreData() {
    this.setState({
      modalDialog: false,
      revData: null,
      title: '',
      comment: '',
      content: '',
    });

    setTimeout(() => {
      this.getDataRev();
    }, 300);
  }

  // копируем
  copyData(id) {
    const items = this.state.items;

    items.forEach((item) => {
      if (item.id === id) {
        item.counts = [...item.counts, ...[{ need_pq: item.counts[0].need_pq, value: '' }]];
      }
    });

    this.setState({
      items,
    });
  }

  // очищаем
  clearData(id, index) {
    const items = this.state.items;

    items.forEach((item) => {
      if (item.id === id) {
        item.counts.splice(index, 1);

        let allVal = 0;

        item.counts.forEach((it) => allVal += Number(it.need_pq) * Number(it.value));

        item.value = allVal;

        this.setLocalStorage(item.id, item.value, item.type, item.counts);
      }
    });

    this.setState({
      items,
    });
  }

  // поиск
  search(event, value) {
    const point = this.state.point;

    if (!point) {
      return;
    }

    let search = event?.target?.value ? event.target.value : value ? value : '';

    let items = this.state.itemsCopy;

    let rec = this.state.recCopy;

    let pf = this.state.pfCopy;

    if (!search) {
      this.setState({
        search,
        items,
        rec,
        pf,
      });

      return;
    }

    if (typeof search === 'string') {
      items = items.filter((value) => value.name.toLowerCase().includes(search.toLowerCase()));

      rec = rec.filter((value) => value.name.toLowerCase().includes(search.toLowerCase()));

      pf = pf.filter((value) => value.name.toLowerCase().includes(search.toLowerCase()));

      search = { name: search };
    } else {
      items = items.filter((value) => value.name.toLowerCase() === search.name.toLowerCase());

      rec = rec.filter((value) => value.name.toLowerCase() === search.name.toLowerCase());

      pf = pf.filter((value) => value.name.toLowerCase() === search.name.toLowerCase());
    }

    this.setState({
      search,
      items,
      rec,
      pf,
    });
  }

  // проверка данных ревизии перед сохранением (предварительное сохранение)
  async checkData() {
    this.handleResize();

    const point_id = this.state.point;

    const items_rev = this.state.itemsCopy;

    const rec = this.state.recCopy;

    const pf = this.state.pfCopy;

    const allItems = [...pf, ...items_rev, ...rec];

    const items = allItems.reduce((items, cat) => {
      cat = {
        name: cat.name,
        item_id: cat.id,
        type: cat.type,
        value: cat.value,
        counts: cat?.counts ?? 0,
      };

      return (items = [...items, ...[cat]]);
    }, []);

    const data = {
      point_id,
      items,
    };

    const res = await this.getData('check_count', data);

    // console.log(res);

    if (res.count_err > 0) {
      this.setState({
        modalDialog: true,
        title: 'Уточнение данных',
        comment: 'Для продолжения надо исправить количество в позициях',
        pf_list: res.pf_list,
      });
    } else {
      const pf_list = res.pf_list.sort((pf) => (pf.count_warn > 0 ? -1 : 1));

      this.setState({
        modalDialog: true,
        title: 'Уточнение данных',
        comment: 'Цифра показывает сумму всех позиций, а не каждую в отдельности (товар / заготовка / рецепт)',
        pf_list,
        save: true,
        data,
      });
    }
  }

  // получение данных ревизии
  async saveRev() {
    this.setState({
      modalDialog: false,
      title: '',
      comment: '',
      save: false,
      pf_list: null,
    });

    const data = this.state.data;

    const res = await this.getData('save_new', data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: 'Ревизия успешно сохранена!',
      });

      window.location.href = '/revizion';
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
      this.search(null, res.item_name);
    }
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

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>Новая ревизия</h1>
          </Grid>

          <Grid item xs={12} sm={12}>
            <Button
              variant="contained"
              onClick={this.checkData.bind(this)}
              disabled={!this.state.point || this.state.point === '0' ? true : false}
            >
              Сохранить
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo={true}
              size="small"
              disableCloseOnSelect={true}
              options={this.state.allItems}
              getOptionLabel={(option) => option?.name ?? ''}
              value={this.state.search}
              onChange={this.search.bind(this)}
              onBlur={this.search.bind(this)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={'Поиск'}
                  onChange={(event) => this.search(event)}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <Revizion_Table
              items={this.state.items}
              rec={this.state.rec}
              pf={this.state.pf}
              saveData={this.saveData.bind(this)}
              clearData={this.clearData.bind(this)}
              copyData={this.copyData.bind(this)}
              open={this.state.open}
              onClose={() => this.setState({ open: false })}
              onOpen={() => this.setState({ open: true })}
              storages={this.state.storages}
              math={this.math.bind(this)}
              fullScreen={this.state.fullScreen}
            />
          </Grid>
        </Grid>

        <Revizion_Button_Group 
          items={this.state.items}
          pf={this.state.pf}
          fullScreen={this.state.fullScreen}
          storages={this.state.storages}
          checkData={this.checkData.bind(this)}
          open={() => this.setState({ open: true })}
        />

        <Revizion_Modal 
          pf_list={this.state.pf_list}
          modalDialog={this.state.modalDialog}
          close={() => this.setState({modalDialog: false, title: '', comment: '', save: false})}
          fullScreen={this.state.fullScreen}
          title={this.state.title}
          comment={this.state.comment}
          save={this.state.save}
          content={this.state.content}
          saveRev={this.saveRev.bind(this)}
          notRestoreData={this.notRestoreData.bind(this)}
          getDataRev={this.getDataRev.bind(this)}
        />

      </>
    );
  }
}

export default function RevizionNew() {
  return <RevizionNew_ />;
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