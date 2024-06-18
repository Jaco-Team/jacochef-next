import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {MyCheckBox, MyTextInput, MyAutocomplite, MyDatePickerNew, MyAlert, formatDate, MySelect} from '@/ui/elements';

import queryString from 'query-string';
import dayjs from 'dayjs';

function roundTo(n, digits) {
  if (n.length == 0) {
    return n;
  }

  var negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
    n = (n * -1).toFixed(digits);
  }
  return n;
}

class ReceptModule_Modal_History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
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
          <Typography>{this.props.method}</Typography>
          <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                  <TableCell style={{ width: '5%' }}>Просмотр</TableCell>
                  <TableCell style={{ width: '20%' }}>Наименование</TableCell>
                  <TableCell style={{ width: '20%' }}>Действует с</TableCell>
                  <TableCell style={{ width: '20%' }}>по</TableCell>
                  <TableCell style={{ width: '15%' }}>Дата редактирования</TableCell>
                  <TableCell style={{ width: '20%' }}>Редактор</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.item.map((it, key) => (
                  <TableRow key={key}>
                    <TableCell><TextSnippetOutlinedIcon /></TableCell>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.date_start}</TableCell>
                    <TableCell>{it.date_end}</TableCell>
                    <TableCell>{it.date_update}</TableCell>
                    <TableCell>{it.user}</TableCell>
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

class ReceptModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      shelf_life: '',
      storages: [],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      time: '',
      dop_time: '',
      apps: '',
      count_user_1: 0,
      count_user_2: 0,
      list: [],
      all_w: 0,
      show_in_rev: 0,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.rec) {
      return;
    }

    if (this.props.rec !== prevProps.rec) {
      this.setState({
        name: this.props.rec?.name,
        shelf_life: this.props.rec?.shelf_life,
        storages: this.props.rec?.storages,
        time: this.props.rec?.time_min,
        date_start: this.props.rec?.date_start ?? formatDate(null),
        date_end: this.props.rec?.date_end ?? formatDate(null),
        count_user_1: parseInt(this.props.rec?.two_user) ? 0 : 1,
        count_user_2: parseInt(this.props.rec?.two_user) ? 1 : 0,
        //list: this.props.list.length ? this.props.list : [],
        apps: this.props.rec?.app_id,
        all_w: this.props.rec?.all_w,
        show_in_rev: this.props.rec?.show_in_rev,
      });
    }
  }

  chooseItem(event, data) {
    let list = this.state.list;

    list.push({
      name_id: data,
      ed: data.ei_name,
      brutto: 0,
      pr_1: 0,
      netto: 0,
      pr_2: 0,
      res: 0,
    });

    this.setState({ list });
  }

  changeItemData(type, key, event, data) {
    let list = this.state.list;

    let this_item = list[key];

    if (type == 'name_id') {
      this_item[[type]] = data;
    } else {
      this_item[[type]] = event.target.value;
    }

    this_item.netto = roundTo(
      (parseFloat(this_item.brutto) * (100 - parseFloat(this_item.pr_1))) / 100,
      3
    );
    this_item.res = roundTo(
      (parseFloat(this_item.netto) * (100 - parseFloat(this_item.pr_2))) / 100,
      3
    );

    list[key] = this_item;

    let all_w = 0;

    list.map((it) => {
      all_w += parseFloat(it.res);
    });

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w });
  }

  changeItem(type, event, data) {
    this.setState({
      [type]: data ? data : event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : '',
    });
  }

  changeApps(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeItemChecked(type_1, type_2, event) {
    this.setState({
      [type_1]: event.target.checked === true ? 1 : 0,
      [type_2]: 0,
    });
  }

  save() {
    let data = {
      name: this.state.name,
      shelf_life: this.state.shelf_life,
      storages: this.state.storages,
      date_start: this.state.date_start && this.state.date_start.length != 0 ? dayjs(this.state.date_start).format('YYYY-MM-DD') : '',
      date_end: this.state.date_end && this.state.date_end.length != 0 ? dayjs(this.state.date_end).format('YYYY-MM-DD') : '',
      show_in_rev: this.state.show_in_rev,
      list: this.state.list,
    };

    this.props.save(data);

    this.onClose();
  }

  onClose() {
    this.setState({
      name: '',
      shelf_life: '',
      storages: [],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      time: '',
      dop_time: '',
      apps: '',
      count_user_1: 0,
      count_user_2: 0,
      list: [],
      all_w: 0,
      show_in_rev: 0,
    });

    this.props.onClose();
  }

  render() {
    const { open, method, apps, storages, items } = this.props;

    return (
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth={'lg'}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>{method}</Typography>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Наименование"
                value={this.state.name}
                func={this.changeItem.bind(this, 'name')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyTextInput
                label="Срок годности"
                value={this.state.shelf_life}
                func={this.changeItem.bind(this, 'shelf_life')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MyAutocomplite
                label="Места хранения"
                multiple={true}
                data={storages}
                value={this.state.storages}
                func={this.changeItem.bind(this, 'storages')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyDatePickerNew
                label="Действует с"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, 'date_start')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyDatePickerNew
                label="по"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, 'date_end')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Время приготовления 1 кг"
                value={this.state.time}
                func={this.changeItem.bind(this, 'time')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MyTextInput
                label="Дополнительное время (уборка рабочего места)"
                value={this.state.dop_time}
                func={this.changeItem.bind(this, 'dop_time')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MySelect
                is_none={false}
                data={apps}
                value={this.state.apps}
                func={this.changeApps.bind(this, 'apps')}
                label="Должность в кафе (кто будет готовить)"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyCheckBox
                label="Один сотрудник"
                value={this.state.count_user_1 === 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'count_user_1', 'count_user_2')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyCheckBox
                label="Два сотрудника"
                value={this.state.count_user_2 === 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'count_user_2', 'count_user_1')}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <MyCheckBox
                label="Ревизия"
                value={parseInt(this.state.show_in_rev) == 1 ? true : false}
                func={this.changeItemChecked.bind(this, 'show_in_rev', null)}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell width="30%">Номенклатура</TableCell>
                    <TableCell>Единица измерения</TableCell>
                    <TableCell>Брутто</TableCell>
                    <TableCell>% потери при ХО</TableCell>
                    <TableCell>Нетто</TableCell>
                    <TableCell>% потери при ГО</TableCell>
                    <TableCell>Выход</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.list.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <MyAutocomplite
                          multiple={false}
                          data={items}
                          value={item.name_id}
                          func={this.changeItemData.bind(this, 'name_id', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.ed}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.brutto}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'brutto', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_1}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'pr_1', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.netto}
                          type={'number'}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.pr_2}
                          type={'number'}
                          func={this.changeItemData.bind(this, 'pr_2', key)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          value={item.res}
                          disabled={true}
                          className="disabled_input"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <MyAutocomplite
                        multiple={false}
                        data={items}
                        value={null}
                        func={this.chooseItem.bind(this)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                    <TableCell>
                      <MyTextInput value={''} disabled={true} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} />
                    <TableCell>
                      <MyTextInput
                        value={this.state.all_w}
                        disabled={true}
                        className="disabled_input"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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

class ReceptModule_Table extends React.Component {
  render() {
    const { data, method, openItemEdit, changeTableCheck, openHistoryItem } = this.props;

    return (
      <>
        {!data.length ? null : (
          <>
            <Grid item xs={12} sm={12}>
              <h4>{method}</h4>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={12} mb={5}>
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableRow>
                      <TableCell style={{ width: '10%' }}>Ревизия</TableCell>
                      <TableCell style={{ width: '18%' }}>Наименование</TableCell>
                      <TableCell style={{ width: '18%' }}>Действует с</TableCell>
                      <TableCell style={{ width: '18%' }}>Обновление</TableCell>
                      <TableCell style={{ width: '18%' }}>Редактирование</TableCell>
                      <TableCell style={{ width: '18%' }}>
                        {method === 'Рецепты' ? null : 'История изменений'}
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          <MyCheckBox
                            label=""
                            value={parseInt(item.show_in_rev) == 1 ? true : false}
                            func={changeTableCheck.bind(this, item.id, 'show_in_rev')}
                          />
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.date_update}</TableCell>
                        <TableCell style={{ cursor: 'pointer' }} onClick={openItemEdit.bind(this, item.id, `Редактирование: ${item.name}`)}>
                          <EditIcon />
                        </TableCell>
                        <TableCell 
                          onClick={method === 'Рецепты' ? null : openHistoryItem.bind(this, item.id, `История изменений: ${item.name}`)}
                          style={{cursor: method === 'Рецепты' ? null : 'pointer'}}
                        >
                          {' '}{method === 'Рецепты' ? null : <EditNoteIcon />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        )}
      </>
    );
  }
}

class ReceptModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'recept_module',
      module_name: '',
      is_load: false,

      recipes_list: [],
      pf_list: [],

      modalDialog: false,
      modalDialogHist: false,
      storages: [],
      method: '',
      apps: [],
      all_pf_list: [],
      rec: [],
      //rec_list: [],
      item: [],

      operAlert: false,
      err_status: false,
      err_text: '',

      fullScreen: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData('get_all');

    this.setState({
      module_name: data.module_info.name,
      recipes_list: data.items,
      pf_list: data.items.splice(0, 6),
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

  async update() {
    const data = await this.getData('get_all');

    this.setState({
      recipes_list: data.items,
      pf_list: data.items.splice(0, 6),
    });
  }

  async changeTableCheck(rec_id, type, event, value) {
    const data = {
      type,
      rec_id,
      value: value ? 1 : 0,
    };

    const res = await this.getData('save_check', data);

    if (res.st) {
      setTimeout(() => {
        this.update();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: 'Данные не изменены, попробуйте позже',
      });
    }
  }

  async openItemNew(method) {
    this.handleResize();

    const data = {
      id: 0,
    };

    const res = await this.getData('get_one', data);

    this.setState({
      modalDialog: true,
      method,
      storages: res.all_storages,
      apps: res.apps,
      all_pf_list: res.all_pf_list,
    });
  }

  async openItemEdit(id, method) {
    this.handleResize();

    const data = { id };

    const res = await this.getData('get_one', data);

    this.setState({
      modalDialog: true,
      method,
      storages: res.all_storages,
      apps: res.apps,
      all_pf_list: res.all_pf_list,
      rec: res.rec,
      //rec_list: res.pf_list,
    });
  }

  async openHistoryItem(id, method) {
    this.handleResize();

    // const data = {
    //   item_id: id,
    // };

    // const res = await this.getData('get_one', data);

    const res = [
      {
        id: '96',
        name: 'Рис отварной',
        date_start: '2022-01-13',
        date_end: '2023-02-14',
        date_update: '2023-02-14',
        user: 'Иванов И.И.',
      },
      {
        id: '96',
        name: 'Рис отварной',
        date_start: '2023-02-15',
        date_end: '2024-02-14',
        date_update: '2024-02-14',
        user: 'Иванов И.И.',
      },
      {
        id: '96',
        name: 'Рис отварной',
        date_start: '2024-02-15',
        date_end: '',
        date_update: '2024-02-14',
        user: 'Иванов И.И.',
      },
    ]; // для тестирования модалки истории изменений

    this.setState({
      modalDialogHist: true,
      item: res,
      method,
    });
  }

  async saveNew(data) {
    console.log(data);
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => this.setState({ operAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <ReceptModule_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          items={this.state.all_pf_list}
          method={this.state.method}
          storages={this.state.storages}
          apps={this.state.apps}
          rec={this.state.rec}
          save={this.saveNew.bind(this)}
          fullScreen={this.state.fullScreen}
          //list={this.state.rec_list}
        />

        <ReceptModule_Modal_History
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false })}
          item={this.state.item}
          method={this.state.method}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid item xs={12} sm={6} mb={3}>
            <Button onClick={this.openItemNew.bind(this, 'Новый полуфабрикат или рецепт')} variant="contained">
              Добавить рецепт или полуфабрикат
            </Button>
          </Grid>

          <ReceptModule_Table
            data={this.state.pf_list}
            method="Полуфабрикаты"
            openItemEdit={this.openItemEdit.bind(this)}
            changeTableCheck={this.changeTableCheck.bind(this)}
            openHistoryItem={this.openHistoryItem.bind(this)}
          />

          <ReceptModule_Table
            data={this.state.recipes_list}
            method="Рецепты"
            openItemEdit={this.openItemEdit.bind(this)}
            changeTableCheck={this.changeTableCheck.bind(this)}
            openHistoryItem={this.openHistoryItem.bind(this)}
          />
        </Grid>
      </>
    );
  }
}

export default function ReceptModule() {
  return <ReceptModule_ />;
}
