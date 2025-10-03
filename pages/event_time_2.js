import React from 'react';

import Grid from '@mui/material/Grid';

import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import IconButton from '@mui/material/IconButton';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { MyDatePickerNew, MyTextInput } from '@/components/shared/Forms';

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import {api_laravel} from "@/src/api_new";

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import MyAlert from '@/components/shared/MyAlert';
dayjs.locale('ru');

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>{children}</Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Таймпикер для точности до секунд (чч:мм:сс)
class MyTimePicker extends React.PureComponent {
  handleChange = (e) => {
    const val = e.target.value;
    this.props.onChange(val);
  };

  render() {
    return (
      <TextField
        variant="outlined"
        size="small"
        color="primary"
        disabled={this.props.disabled}
        label={this.props.label}
        type="time"
        id={this.props.id}
        value={this.props.value || ''}
        onChange={this.handleChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 1 }}
        fullWidth
      />
    );
  }
}

// Таймпикер для точности до минут (чч:мм)
class MyTimePickerHM extends React.PureComponent {
  handleChange = (e) => {
    const val = e.target.value;
    this.props.onChange(val);
  };

  render() {
    return (
      <TextField
        variant="outlined"
        size="small"
        color="primary"
        disabled={this.props.disabled}
        label={this.props.label}
        type="time"
        id={this.props.id}
        value={this.props.value || ''}
        onChange={this.handleChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{ step: 60 }}
        fullWidth
      />
    );
  }
}

// ---------- Модалка для редактирования уровня в Табе Мотивации кассира за регистрацию ----------
class EventTime_Tab_Kassir_Registr_Modal_Edit extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      date_start: dayjs()
    };

  }

  componentDidUpdate(prevProps) {
    if (this.props.dateModalData && prevProps.dateModalData !== this.props.dateModalData) {
      this.setState({
        date_start: dayjs(this.props.dateModalData.date_start) || dayjs()
      });
    }
  }

  changeDate = (date) => this.setState({ date_start: date || dayjs() });

  save = () => {

    const { date_start } = this.state;

    if (!date_start.isValid() || date_start.isBefore(dayjs(), 'day')) {
      this.props.openAlert(false, 'Сохранение возможно только при указании сегодняшней или будущей даты');
      return;
    }

    const newBlock = {
      id: this.props.dateModalData.id,
      date_start: date_start.format('YYYY-MM-DD'),
      levels: this.props.dateModalData.levels
    };

    this.props.onSave('edit', newBlock);
    this.close();

  };

  close = () => {

    this.setState({
      date_start: dayjs()
    });

    this.props.onClose();
  };

  render() {
    const { open } = this.props;
    const { date_start } = this.state;

    const fullScreen = typeof window !== 'undefined' && window.innerWidth < 601;

    return (
      <Dialog
        open={open}
        onClose={this.close}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Укажите дату с которой будут действовать изменения
          <IconButton onClick={this.close} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid
              sx={{ mt: 1 }}
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyDatePickerNew
                label="Дата изменений"
                value={date_start}
                func={this.changeDate}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color='success' onClick={this.save}>Сохранить изменения</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Модалка для добавления нового уровня в Табе Мотивации кассира за регистрацию ----------
class EventTime_Tab_Kassir_Registr_Modal extends React.Component {

  state = this.getInitialState();

  getInitialState() {
    return {
      date_start: dayjs(),
      levels: Array.from({ length: 7 }, (_, i) => ({
        lavel: i + 1,
        price: [20,25,30,35,40,45,50][i]
      })),
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState(this.getInitialState());
    }
  }

  changeDate = (date) => this.setState({ date_start: date || dayjs() });

  changeLevel = (idx, e) => {
    let raw = e.target.value;

    let v = raw;
    if (v.length > 1 && v.startsWith('0')) {
      v = v.replace(/^0+/, '');
    }

    if (v === '') {
      v = '0';
    }

    const numVal = Number(v);

    const levels = this.state.levels.map((lvl, i) =>
      i === idx
        ? { ...lvl, price: numVal }
        : lvl
    );

    this.setState({ levels });
  };


  save = () => {

    const { date_start } = this.state;

    if (!date_start.isValid() || date_start.isBefore(dayjs(), 'day')) {
      this.props.openAlert(false, 'Сохранение возможно только при указании сегодняшней или будущей даты');
      return;
    }

    const newBlock = {
      date_start: date_start.format('YYYY-MM-DD'),
      levels: this.state.levels.map(l => ({ ...l }))
    };

    this.props.onSave('new', newBlock);
    this.props.onClose();
  };

  render() {
    const { open, onClose } = this.props;
    const { date_start, levels } = this.state;

    const fullScreen = typeof window !== 'undefined' && window.innerWidth < 601;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
          <Typography fontWeight="bold">Добавить новый уровень</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 1 }}>
          <Grid container spacing={3}>
            <Grid
              sx={{ mt: 1 }}
              size={{
                xs: 12,
                sm: 12
              }}>
              <MyDatePickerNew
                label="Дата изменений"
                value={date_start}
                func={this.changeDate}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Уровень</TableCell>
                      <TableCell>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levels.map((lvl, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{lvl.lavel}</TableCell>
                        <TableCell>
                          <MyTextInput
                            type="number"
                            tabindex={{ min: 0 }}
                            value={String(lvl.price)}
                            func={(e) => this.changeLevel(idx, e)}
                            onBlur={(e) => this.changeLevel(idx, e)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color='success' onClick={this.save}>Сохранить изменения</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Таб Мотивации кассира за регистрацию ----------
class EventTime_Tab_Kassir_Registr extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      addModalOpen: false,
      dateModalOpen: false,
      dateModalData: null,
      expanded: null,
      kassir_registr: props.kassir_registr,
      confirmDialog: false,
      delete_block: null,
    };

  }

  componentDidUpdate(prevProps) {
    if (prevProps.kassir_registr !== this.props.kassir_registr) {
      this.setState({ kassir_registr: this.props.kassir_registr });
    }
  }

  toggleRow = (idx) => this.setState({ expanded: this.state.expanded === idx ? null : idx });

  isEditable = (date) => {
    const startOfDate = dayjs(date).startOf('day');
    const startOfToday = dayjs().startOf('day');
    return startOfDate.diff(startOfToday) >= 0;
  };

  isDelete = (date) => {
    return dayjs(date).startOf('day').isAfter(dayjs().startOf('day'));
  };

  handleModalOpen  = () => this.setState({ addModalOpen: true });
  handleModalClose = () => this.setState({ addModalOpen: false });

  openDateModal = (lavel) => this.setState({ dateModalOpen: true, dateModalData: lavel });
  closeDateModal = () => this.setState({ dateModalOpen: false, dateModalData: null });

  handleLevelChange = (blockIdx, levelIdx, e) => {
    let raw = e.target.value;

    if (raw.length > 1 && raw.startsWith('0')) {
      raw = raw.replace(/^0+/, '');
    }

    if (raw === '') {
      raw = '0';
    }

    const numVal = Number(raw);

    const newArr = this.state.kassir_registr.map((blk, i) =>
      i === blockIdx
        ? {
            ...blk,
            levels: blk.levels.map((lvl, j) =>
              j === levelIdx
                ? { ...lvl, price: numVal }
                : lvl
            )
          }
        : blk
    );

    this.setState({ kassir_registr: newArr });
  };

  handleConfirm = (delete_block) => {
    this.setState({ delete_block, confirmDialog: true });
  };

  handleDelete = () => {
    this.props.onDelete(this.state.delete_block);
    this.setState({ confirmDialog: false, delete_block: null });
  };

  render() {
    const { expanded, addModalOpen, kassir_registr, dateModalOpen, dateModalData, confirmDialog } = this.state;
    const { acces } = this.props;

    return (
      <Grid
        mb={5}
        size={{
          xs: 12
        }}>
        <Dialog
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
          maxWidth="sm"
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Точно удалить уровень?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false })}>
              Отмена
            </Button>
            <Button onClick={this.handleDelete}>Удалить</Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ display: 'flex', mb: 2 }}>
          {acces.kassir_registr_edit ? (
            <Button variant="contained" onClick={this.handleModalOpen}>
              Добавить
            </Button>
          ) : null}
        </Box>
        <TableContainer component={Paper}>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '10%' }}>#</TableCell>
                <TableCell sx={{ width: '30%' }}>Дата старта</TableCell>
                <TableCell sx={{ width: '40%' }}>Редактировать / Просмотр</TableCell>
                <TableCell sx={{ width: '20%' }}>Удалить</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
            {kassir_registr.map((block, i) => {
                const editable = this.isEditable(block.date_start);
                const deltable = this.isDelete(block.date_start);
                return (
                  <React.Fragment key={i}>

                    <TableRow hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{dayjs(block.date_start).format('DD.MM.YYYY')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => this.toggleRow(i)} title={editable ? 'Редактировать' : 'Просмотр'}>
                          {editable ? <EditIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {deltable && (
                          <IconButton color="error" onClick={() => this.handleConfirm(block)} title="Удалить">
                            <DeleteOutline />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={4} style={{ padding: 0 }}>
                        <Collapse in={expanded === i} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                            <Table size="small" sx={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              '& td, & th': {
                                borderBottom: '1px solid #ddd',
                              }
                            }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ width: '10%' }} />
                                  <TableCell sx={{ width: '30%' }}>Уровень</TableCell>
                                  <TableCell colSpan={2} sx={{ width: '60%' }}>Сумма</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {block.levels.map((lvl, j) => (
                                  <TableRow key={j}>
                                    <TableCell />
                                    <TableCell>{lvl.lavel}</TableCell>
                                    <TableCell colSpan={2}>
                                      <MyTextInput
                                        type="number"
                                        tabindex={{ min: 0 }}
                                        value={String(lvl.price)}
                                        func={e => this.handleLevelChange(i, j, e)}
                                        onBlur={e => this.handleLevelChange(i, j, e)}
                                        disabled={!editable && (!acces.kassir_registr_view || !acces.kassir_registr_edit)}
                                        className={!editable && (!acces.kassir_registr_view || !acces.kassir_registr_edit) ? "disabled_input" : null}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            {editable &&
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
                                <Button
                                  color="success"
                                  variant="contained"
                                  style={{ whiteSpace: 'nowrap' }}
                                  onClick={() => this.openDateModal(block)}
                                >
                                  Выбрать дату применения
                                </Button>
                              </Box>
                            }
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Модалка Добавить */}
        <EventTime_Tab_Kassir_Registr_Modal
          open={addModalOpen}
          onClose={this.handleModalClose}
          onSave={this.props.onSave}
          openAlert={this.props.openAlert}
        />
        {/* Модалка Выбора даты */}
        <EventTime_Tab_Kassir_Registr_Modal_Edit
          open={dateModalOpen}
          onClose={this.closeDateModal}
          dateModalData={dateModalData}
          onSave={this.props.onSave}
          openAlert={this.props.openAlert}
        />
      </Grid>
    );
  }
}

// ---------- Таб Время ожидания для клиента ----------
class EventTime_Tab_Cur extends React.PureComponent {
  render() {

    const {activeTab, index_cur, cur, onCurChange, saveKey, onSave, acces } = this.props;

    const handlers = {

      add: () => {
        const maxId = cur.reduce((m, r) => Math.max(m, r.id || 0), 0);
        const newRow = {
          id: maxId + 1,
          count: cur.length + 1,
          time_rolls: '00:00:00',
          time_pizza: '00:00:00'
        };
        onCurChange([...cur, newRow]);
      },

      del: id => onCurChange(cur.filter(r => r.id !== id)),

      edit: (idx, field, raw) => {
        let v = raw;

        if (field === 'count' && v.length > 1 && v.startsWith('0')) {
          v = v.replace(/^0+/, '');
        }

        if (field === 'count' && v === '') {
          v = '0';
        }

        const newArr = cur.map((r, i) =>
          i === idx ? { ...r, [field]: field === 'count' ? Number(v) : v } : r
        );

        onCurChange(newArr);
      }

    };

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_cur}>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Количество</TableCell>
                  <TableCell>Время роллов</TableCell>
                  <TableCell>Время пиццы</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {cur.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        tabindex={{ min: 0 }}
                        disabled={!acces.cur_view || !acces.cur_edit}
                        value={String(row.count)}
                        func={e => handlers.edit(idx, 'count', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTimePicker
                        value={row.time_rolls}
                        onChange={val => handlers.edit(idx, 'time_rolls', val)}
                        disabled={!acces.cur_view || !acces.cur_edit}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <MyTimePicker
                        value={row.time_pizza}
                        disabled={!acces.cur_view || !acces.cur_edit}
                        onChange={val => handlers.edit(idx, 'time_pizza', val)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell align="right">
                      {acces.cur_edit ? (
                        <IconButton
                          size="small"
                          color="error"
                          title="Удалить"
                          onClick={() => handlers.del(row.id)}
                        >
                          <DeleteOutline/>
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    {acces.cur_edit ? (
                      <IconButton
                        size="small"
                        color="success"
                        title="Добавить"
                        onClick={handlers.add}
                      >
                        <AddCircleOutline/>
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {acces.cur_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Уровней кафе ----------
class EventTime_Tab_TableLv extends React.PureComponent {
  render() {

    const { activeTab, index_table_lv, table_lv, onLvChange, saveKey, onSave, acces } = this.props;

    const handlers = {

      add: () => {
        const maxId = table_lv.reduce((m, r) => Math.max(m, r.id || 0), 0);
        const newRow = {
          id: maxId + 1,
          lavel: table_lv.length + 1,
          min_count: 0,
          max_count: 0
        };
        onLvChange([...table_lv, newRow]);
      },

      del: id => onLvChange(table_lv.filter(r => r.id !== id)),

      edit: (idx, field, raw) => {
        let v = raw;

        if ((field === 'lavel' || field === 'min_count' || field === 'max_count')
            && v.length > 1 && v.startsWith('0')) {
          v = v.replace(/^0+/, '');
        }

        if (v === '') v = '0';

        const newArr = table_lv.map((r, i) => i === idx ? { ...r, [field]: Number(v) } : r);

        onLvChange(newArr);
      }
    };

    return (
      <Grid
        size={{
          xs: 12
        }}>
        <TabPanel value={activeTab} index={index_table_lv}>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Уровень</TableCell>
                  <TableCell>Количество от</TableCell>
                  <TableCell>Количество до</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {table_lv.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        tabindex={{ min: 1 }}
                        disabled={!acces.table_lv_view || !acces.table_lv_edit}
                        value={String(row.lavel)}
                        func={e => handlers.edit(idx, 'lavel', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        tabindex={{ min: 0 }}
                        disabled={!acces.table_lv_view || !acces.table_lv_edit}
                        value={String(row.min_count)}
                        func={e => handlers.edit(idx, 'min_count', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        tabindex={{ min: 0 }}
                        disabled={!acces.table_lv_view || !acces.table_lv_edit}
                        value={String(row.max_count)}
                        func={e => handlers.edit(idx, 'max_count', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {acces.table_lv_edit ? (
                        <IconButton
                          size="small"
                          color="error"
                          title="Удалить"
                          onClick={() => handlers.del(row.id)}
                        >
                          <DeleteOutline/>
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    {acces.table_lv_edit ? (
                      <IconButton
                        size="small"
                        color="success"
                        title="Добавить"
                        onClick={handlers.add}
                      >
                        <AddCircleOutline/>
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {acces.table_lv_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Время кассира ----------
class EventTime_Tab_Kassir_Time extends React.PureComponent {

  render() {

    const { activeTab, index_kassir_time, kassir: { time_order, time_pic, time_hall, time_check }, onKassirChange, onSave, saveKey, acces } = this.props;

    const update = (field, val) => onKassirChange({ ...this.props.kassir, [field]: val });

    const makeHandlers = (arr, key) => ({

      add: () => {
        const maxId = arr.reduce((m, r) => Math.max(m, r.id || 0), 0);
        const newRow = { id: maxId + 1, price_min: 0, price_max: 0, time_format: '00:00:00' };
        update(key, [...arr, newRow]);
      },

      del: id => update(key, arr.filter(r => r.id !== id)),

      edit: (idx, field, raw) => {
        let v = raw;

        if ((field === 'price_min' || field === 'price_max') && v.length > 1 && v.startsWith('0')) {
          v = v.replace(/^0+/, '');
        }

        const newArr = arr.map((r, i) => (i === idx ? { ...r, [field]: v } : r));

        update(key, newArr);
      }

    });

    const orderH = makeHandlers(time_order, 'time_order');
    const picH = makeHandlers(time_pic, 'time_pic');
    const hallH  = makeHandlers(time_hall, 'time_hall');

    const checkOrder = [
      'kassir_time_order_check_pic',
      'kassir_time_order_pred_check_pic',
      'kassir_time_order_check_hall',
      'kassir_time_order_check_hall_in',
      'kassir_time_order_check_dev',
      'kassir_time_order_check_dev_online'
    ];

    const checkLabels = {
      kassir_time_order_check_pic: 'Самовывоз',
      kassir_time_order_pred_check_pic: 'Самовывоз предчек',
      kassir_time_order_check_hall: 'Зал',
      kassir_time_order_check_hall_in: 'Зал с собой',
      kassir_time_order_check_dev: 'Доставка',
      kassir_time_order_check_dev_online:'Доставка онлайн'
    };

    const editCheck = (key, val) => update('time_check', { ...time_check, [key]: val });

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_kassir_time}>
          {[
            { title: 'на принятие заказа', data: time_order, h: orderH },
            { title: 'выдача самовывоза', data: time_pic, h: picH },
            { title: 'выдача зал / зал с собой', data: time_hall, h: hallH }
          ].map(({ title, data, h }, i) => (
            <Box key={i} mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Время кассира {title}
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Сумма от</TableCell>
                      <TableCell>Сумма до</TableCell>
                      <TableCell>Время (чч:мм:сс)</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <MyTextInput
                            type="number"
                            tabindex={{ min: 0 }}
                            value={String(row.price_min || 0)}
                            disabled={!acces.kassir_time_view || !acces.kassir_time_edit}
                            func={e => h.edit(idx, 'price_min', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            type="number"
                            tabindex={{ min: 0 }}
                            value={String(row.price_max || 0)}
                            disabled={!acces.kassir_time_view || !acces.kassir_time_edit}
                            func={e => h.edit(idx, 'price_max', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTimePicker
                            value={row.time_format}
                            disabled={!acces.kassir_time_view || !acces.kassir_time_edit}
                            onChange={val => h.edit(idx, 'time_format', val)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {acces.kassir_time_edit ? (
                            <IconButton size="small" color="error" onClick={() => h.del(row.id)} title="Удалить">
                              <DeleteOutline/>
                            </IconButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        {acces.kassir_time_edit ? (
                          <IconButton size="small" color="success" onClick={h.add} title="Добавить">
                            <AddCircleOutline/>
                          </IconButton>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          ))}

          <Divider />

          <Box mt={3} mb={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Время кассира за пробивку чека
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell>Время (чч:мм:сс)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkOrder.map(key => (
                    <TableRow key={key}>
                      <TableCell>{checkLabels[key]}</TableCell>
                      <TableCell>
                        <MyTimePicker
                          value={time_check[key] || '00:00:00'}
                          disabled={!acces.kassir_time_view || !acces.kassir_time_edit}
                          onChange={val => editCheck(key, val)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
            {acces.kassir_time_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Коэффициенты ----------
class EventTime_Tab_Rate extends React.PureComponent {

  constructor(props) {
    super(props);

    const { dow_coef } = props.rate;

    this.state = {
      sortedDow: [...dow_coef].sort((a, b) => a.dow - b.dow),
      _lastDow: dow_coef,
    };

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const newDow = nextProps.rate.dow_coef;

    if (newDow !== prevState._lastDow) {
      return {
        sortedDow: [...newDow].sort((a, b) => a.dow - b.dow),
        _lastDow: newDow,
      };
    }

    return null;
  }

  render() {

    const { activeTab, index_rate, rate, onRateChange, onSave, saveKey, acces } = this.props;
    const { pizza_lv } = rate;
    const { sortedDow } = this.state;
    const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

    const update = (field, val) => onRateChange({ ...rate, [field]: val });

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_rate}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Коэффициенты заготовок
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            {sortedDow.map(row => (
              <Grid
                key={row.dow}
                size={{
                  xs: 12/7
                }}>
                <Typography
                  align="center"
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  {days[row.dow - 1]}
                </Typography>
                <MyTextInput
                  type="number"
                  tabindex={{ min: 0 }}
                  value={String(row.coef)}
                  disabled={!acces.rate_view || !acces.rate_edit}
                  func={e => {
                    let v = e.target.value;

                    if (v === '') {
                      v = '0';
                    }

                    if (v.length > 1 && v.startsWith('0')) {
                      v = v.replace(/^0+/, '');
                    }

                    const newArr = sortedDow.map(d => d.dow === row.dow ? { ...d, coef: v } : d);

                    update('dow_coef', newArr);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Коэффициент пиццы для уровня кафе
            </Typography>
            <MyTextInput
              type="number"
              disabled={!acces.rate_view || !acces.rate_edit}
              tabindex={{ min: 0 }}
              value={String(pizza_lv)}
              func={e => {
                let v = e.target.value;

                if (v === '') {
                  update('pizza_lv', 0);
                  return;
                }

                if (v.length > 1 && v.startsWith('0')) {
                  v = v.replace(/^0+/, '');
                }

                update('pizza_lv', Number(v));
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            {acces.rate_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Время за открытие / закрытие смены ----------
class EventTime_Tab_Time_Smena extends React.PureComponent {
  render() {
    const { activeTab, index_time_smena, time_smena, onTimeChange, onSave, saveKey, acces } = this.props;
    const { time_open_smena, time_close_smena } = time_smena;

    const handleCloseChange = (idx, field, raw) => {
      let v = raw;
      if ((field === 'price_min' || field === 'price_max') && v.length > 1 && v.startsWith('0')) {
        v = v.replace(/^0+/, '');
      }
      const arr = time_close_smena.map((r,i)=>(i===idx?{...r,[field]:v}:r));
      onTimeChange('time_close_smena', arr);
    };

    const handleAddRow = () => {
      const maxId = time_close_smena.reduce((m,r)=>Math.max(m,r.id||0),0);
      onTimeChange('time_close_smena', [
        ...time_close_smena,
        {id:maxId+1,price_min:0,price_max:0,time:'00:00:00'}
      ]);
    };

    const handleDeleteRow = id => onTimeChange('time_close_smena', time_close_smena.filter(r=>r.id!==id));

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_time_smena}>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'bold'}}>
              Время за открытие смены (чч:мм:сс)
            </Typography>
            <MyTimePicker
              value={time_open_smena || '00:00:00'}
              disabled={!acces.time_smena_view || !acces.time_smena_edit}
              onChange={val=>onTimeChange('time_open_smena', val)}
            />
          </Box>
          <Divider />
          <Box mt={2} mb={1}>
            <Typography variant="subtitle1" sx={{fontWeight:'bold'}}>
              Время за закрытие смены
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Сумма от</TableCell>
                  <TableCell>Сумма до</TableCell>
                  <TableCell>Время (чч:мм:сс)</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {time_close_smena.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        tabindex={{min:0}}
                        disabled={!acces.time_smena_view || !acces.time_smena_edit}
                        value={String(row.price_min || 0)}
                        func={e => handleCloseChange(idx,'price_min',e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        disabled={!acces.time_smena_view || !acces.time_smena_edit}
                        tabindex={{min:0}}
                        value={String(row.price_max || 0)}
                        func={e => handleCloseChange(idx,'price_max',e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyTimePicker
                        value={row.time || '00:00:00'}
                        onChange={val => handleCloseChange(idx,'time',val)}
                        disabled={!acces.time_smena_view || !acces.time_smena_edit}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {acces.time_smena_edit ? (
                        <IconButton size="small" color="error" onClick={()=>handleDeleteRow(row.id)} title="Удалить">
                        <DeleteOutline />
                      </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    {acces.time_smena_edit ? (
                      <IconButton size="small" color="success" onClick={handleAddRow} title="Добавить">
                        <AddCircleOutline/>
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <Box sx={{ display:'flex', justifyContent:'flex-end', mt:2 }}>
            {acces.time_smena_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Время менеджеру ----------
class EventTime_Tab_Time_Manager extends React.PureComponent {
  render() {

    const { activeTab, index_time_manager, time_manager, onTimeChange, onSave, saveKey, acces } = this.props;
    const { manager_spis, manager_check, manager_cash, manager_time_voice } = time_manager;

    const update = (field, val) => onTimeChange(field, val);

    const cashH = {

      add: () => {
        const maxId = manager_cash.reduce((m, r) => Math.max(m, r.id || 0), 0);
        const newRow = { id: maxId + 1, price_min: 0, price_max: 0, time_format: '00:00:00' };
        update('manager_cash', [...manager_cash, newRow]);
      },

      del: id => update('manager_cash', manager_cash.filter(r => r.id !== id)),

      edit: (idx, field, raw) => {
        let v = raw;

        if ((field === 'price_min' || field === 'price_max') && v.length > 1 && v.startsWith('0')) {
          v = v.replace(/^0+/, '');
        }

        const newArr = manager_cash.map((r, i) => i === idx ? { ...r, [field]: v } : r);

        update('manager_cash', newArr);
      }
    };

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_time_manager}>

          <Grid container spacing={2} mb={3}>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Время списания (чч:мм:сс)
              </Typography>
              <MyTimePicker
                value={manager_spis || '00:00:00'}
                disabled={!acces.time_manager_view || !acces.time_manager_edit}
                onChange={val => update('manager_spis', val)}
                fullWidth
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Время подтверждения уборок / заготовок (чч:мм:сс)
              </Typography>
              <MyTimePicker
                value={manager_check || '00:00:00'}
                disabled={!acces.time_manager_view || !acces.time_manager_edit}
                onChange={val => update('manager_check', val)}
                fullWidth
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4
              }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Время менеджеру за мотивирующие разговоры за сотрудника (чч:мм:сс)
            </Typography>
            <MyTimePicker
              value={manager_time_voice || '00:00:00'}
              disabled={!acces.time_manager_view || !acces.time_manager_edit}
              onChange={val => update('manager_time_voice', val)}
              fullWidth
            />
            </Grid>
          </Grid>

          <Divider />

          <Box mt={3} mb={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Время менеджера за наличку с курьеров
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Сумма от</TableCell>
                    <TableCell>Сумма до</TableCell>
                    <TableCell>Время (чч:мм:сс)</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {manager_cash.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <MyTextInput
                          type="number"
                          tabindex={{ min: 0 }}
                          disabled={!acces.time_manager_view || !acces.time_manager_edit}
                          value={String(row.price_min || 0)}
                          func={e => cashH.edit(idx, 'price_min', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTextInput
                          type="number"
                          disabled={!acces.time_manager_view || !acces.time_manager_edit}
                          tabindex={{ min: 0 }}
                          value={String(row.price_max || 0)}
                          func={e => cashH.edit(idx, 'price_max', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <MyTimePicker
                          value={row.time_format}
                          disabled={!acces.time_manager_view || !acces.time_manager_edit}
                          onChange={val => cashH.edit(idx, 'time_format', val)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {acces.time_manager_edit ? (
                          <IconButton size="small" color="error" onClick={() => cashH.del(row.id)} title="Удалить">
                          <DeleteOutline />
                        </IconButton>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      {acces.time_manager_edit ? (
                        <IconButton size="small" color="success" onClick={cashH.add} title="Добавить">
                          <AddCircleOutline/>
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {acces.time_manager_edit ? (
              <Button variant="contained" color="success" onClick={() => onSave(saveKey)}>
                Сохранить изменения
              </Button>
            ) : null}
          </Box>

        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Время приготовления заказа ----------
class EventTime_Tab_Time_Cook extends React.PureComponent {
  render() {
    const { activeTab, index_time_cook, time_cook, onTimeChange, onSave, saveKey, acces } = this.props;

    const rows = [
      { label: 'Самовывоз / Зал', key: 'time_pic' },
      { label: 'Предзаказы доставка', key: 'time_pred_dev' },
      { label: 'Предзаказы самовывоз', key: 'time_pred_pic' }
    ];

    return (
      <Grid
        mb={5}
        size={{
          xs: 12,
          sm: 12
        }}>
        <TabPanel value={activeTab} index={index_time_cook}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Тип</TableCell>
                  <TableCell>Время (чч:мм)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ label, key }) => (
                  <TableRow key={key}>
                    <TableCell>{label}</TableCell>
                    <TableCell>
                      <MyTimePickerHM
                        label=""
                        disabled={!acces.time_cook_view || !acces.time_cook_edit}
                        value={time_cook[key]}
                        onChange={(val) => onTimeChange(key, val)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {acces.time_cook_edit ? (
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
              <Button variant="contained" onClick={() => onSave(saveKey)} color='success'>
                Сохранить изменения
              </Button>
            </Box>
          ) : null}
        </TabPanel>
      </Grid>
    );
  }
}

class EventTime2_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'event_time_2',
      module_name: '',
      is_load: false,

      openAlert: false,
      err_status: false,
      err_text: '',

      acces: null,

      time_cook: null,
      time_manager: null,
      time_smena: null,
      rate: null,
      kassir_time: null,
      table_lv: null,
      cur: null,
      kassir_registr: null,

      index_time_cook: -1,
      index_time_manager: -1,
      index_time_smena: -1,
      index_rate: -1,
      index_kassir_time: -1,
      index_table_lv: -1,
      index_cur: -1,
      index_kassir_registr: -1,
      tabs_data: [],

      activeTab: 0,

      snapshot: null,
      confirmDialog: false,
      nextTab: null,

    };
  }

  async componentDidMount(){
    const data = await this.getData('get_all');

    this.setState(
      {
        acces: data.acces,
        module_name: data.module_info.name,
      },
      () => {
        this.getTabIndex();
        this.getDataSett();
      }
    );

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

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text
    });
  };

  getDataSett = async () => {
    let res = await this.getData('get_data_sett');
    //console.log("🚀 === getDataSett res:", res);

    this.setState({
      time_cook: res.time_cook,
      time_manager: res.time_manager,
      time_smena: res.time_smena,
      rate: res.rate,
      kassir_time: res.kassir_time,
      table_lv: res.table_lv,
      cur: res.cur,
      kassir_registr: res?.kassir_registr ?? [],
      snapshot: this.makeSnapshot(res),
    });
  }

  makeSnapshot = (src) => {
    const { time_cook, time_manager, time_smena, rate, kassir_time, table_lv, cur } = src;

    return { time_cook, time_manager, time_smena, rate, kassir_time, table_lv, cur };
  };

  changeTab = (_, nextIndex) => {
    const current = this.makeSnapshot(this.state);
    const pristine = this.state.snapshot;
    const dirty = !this.deepEqual(current, pristine);

    if (dirty) {

      this.setState({ confirmDialog: true, nextTab: nextIndex });

      return;
    }

    this.switchTab(nextIndex);
  };

  deepEqual = (a, b) => {
    if (a === b) return true;

    if (typeof a !== 'object' || a === null ||
        typeof b !== 'object' || b === null) return false;

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (const k of aKeys) {
      if (!bKeys.includes(k) || !this.deepEqual(a[k], b[k])) return false;
    }

    return true;
  };

  switchTab = (idx) => {
    this.setState({ activeTab: idx }, () => this.getDataSett());
  };

  confirmTabChange = () => {
    const { nextTab } = this.state;

    this.setState({ confirmDialog: false, nextTab: null }, () =>
      this.switchTab(nextTab)
    );

  };

  getTabIndex = () => {
    const { acces } = this.state;

    const config = [
      { key: 'time_cook', name: 'Время приготовления заказа', indexState: 'index_time_cook' },
      { key: 'time_manager', name: 'Время менеджеру', indexState: 'index_time_manager' },
      { key: 'time_smena', name: 'Время за открытие / закрытие смены', indexState: 'index_time_smena' },
      { key: 'rate', name: 'Коэффициенты', indexState: 'index_rate' },
      { key: 'kassir_time', name: 'Время кассира', indexState: 'index_kassir_time' },
      { key: 'table_lv', name: 'Таблица уровней кафе', indexState: 'index_table_lv' },
      { key: 'cur', name: 'Время ожидания для клиента', indexState: 'index_cur' },
      { key: 'kassir_registr', name: 'Мотивация кассира за регистрацию', indexState: 'index_kassir_registr' },
    ];

    const tabs_data = [];
    const indices   = {};

    let idx = 0;

    for (const item of config) {
      const hasAccess = parseInt(acces?.[item.key]);

      if (!hasAccess) continue;

      if ((!acces?.[`${item.key}_edit`] && !acces?.[`${item.key}_view`])) {
        continue;
      }

      tabs_data.push({key: item.key, name: item.name});
      indices[item.indexState] = idx;
      idx++;
    }

    this.setState({
      tabs_data,
      ...indices,
    });

  }

  saveTabData = async (tabKey) => {

    const data = this.state[tabKey];

    let res;

    if(tabKey === 'time_cook') {
      res = await this.getData('save_time_cook', data);
    }

    if(tabKey === 'time_manager') {
      res = await this.getData('save_time_manager', data);
    }

    if(tabKey === 'time_smena') {
      res = await this.getData('save_time_smena', data);
    }

    if(tabKey === 'rate') {
      res = await this.getData('save_rate', data);
    }

    if(tabKey === 'kassir_time') {
      res = await this.getData('save_kassir_time', data);
    }

    if(tabKey === 'table_lv') {
      res = await this.getData('save_table_lv', data);
    }

    if(tabKey === 'cur') {
      res = await this.getData('save_cur', data);
    }

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.getDataSett();
    }

  };

  saveTabData_registr = async (saveKey, data) => {

    let res;

    if(saveKey === 'new') {
      res = await this.getData('save_new_kassir_lavels', data);
    } else {
      res = await this.getData('save_edit_kassir_lavels', data);
    }

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.getDataSett();
    }
  }

  deleteTabData_registr = async (block) => {

    const data = { level_id: block.id, date_start: block.date_start };

    const res = await this.getData('delete_kassir_lavel', data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.getDataSett();
    }
  }

  render() {
    const { acces, is_load, openAlert, err_status, err_text, module_name, activeTab, tabs_data, time_cook, index_time_cook, index_time_manager, time_manager, index_time_smena, time_smena, rate, index_rate, index_kassir_time, kassir_time, index_table_lv, table_lv, index_cur, cur, kassir_registr, index_kassir_registr, confirmDialog } = this.state;

    return (
      <>
        <Backdrop style={{ zIndex: 999 }} open={is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
          maxWidth="sm"
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent align="center" sx={{ fontWeight: 'bold' }}>
            <Typography>Есть несохранённые изменения. Перейти на другую вкладку?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ confirmDialog: false })}>
              Отмена
            </Button>
            <Button onClick={this.confirmTabChange}>Перейти</Button>
          </DialogActions>
        </Dialog>
        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        <Grid container spacing={3} className='container_first_child'>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            style={{ paddingBottom: 24 }}
            size={{
              xs: 12,
              sm: 12
            }}>
            <Paper>
              <Tabs
                value={activeTab}
                onChange={this.changeTab}
                variant='scrollable'
                scrollButtons='auto'
                allowScrollButtonsMobile={true}
              >
                {tabs_data?.map((item, index) => {
                  return <Tab label={item.name} {...a11yProps(index)} key={index} sx={{ minWidth: "auto", flex:  '0 0 auto' }} />
                })}
              </Tabs>
            </Paper>
          </Grid>
          {/* Время приготовления заказа */}
            {activeTab === index_time_cook && time_cook && (
              <EventTime_Tab_Time_Cook
                activeTab={activeTab}
                acces={acces}
                index_time_cook={index_time_cook}
                time_cook={time_cook}
                onTimeChange={(key, val) =>
                  this.setState(s => ({
                    time_cook: { ...s.time_cook, [key]: val }
                  }))
                }
                saveKey="time_cook"
                onSave={this.saveTabData}
              />
            )}
          {/* Время приготовления заказа */}

          {/* Время менеджеру */}
          {activeTab === index_time_manager && time_manager && (
            <EventTime_Tab_Time_Manager
              activeTab={activeTab}
              acces={acces}
              index_time_manager={index_time_manager}
              time_manager={time_manager}
              onTimeChange={(key,val)=>{
                this.setState(s=>({ time_manager:{ ...s.time_manager, [key]: val }}));
              }}
              saveKey="time_manager"
              onSave={this.saveTabData}
            />
          )}
          {/* Время менеджеру */}

          {/* Время за открытие / закрытие смены */}
            {activeTab === index_time_smena && time_smena && (
              <EventTime_Tab_Time_Smena
                activeTab={activeTab}
                acces={acces}
                index_time_smena={index_time_smena}
                time_smena={time_smena}
                onTimeChange={(key, val) =>
                  this.setState(s => ({
                    time_smena: {
                      ...s.time_smena,
                      [key]: val
                    }
                  }))
                }
                saveKey="time_smena"
                onSave={this.saveTabData}
              />
            )}
          {/* Время за открытие / закрытие смены */}

          {/* Коэффициенты */}
            {activeTab === index_rate && rate && (
              <EventTime_Tab_Rate
                activeTab={activeTab}
                acces={acces}
                index_rate={index_rate}
                rate={rate}
                onRateChange={newRate => this.setState({ rate: newRate })}
                saveKey="rate"
                onSave={this.saveTabData}
              />
            )}
          {/* Коэффициенты */}

          {/* Время кассира */}
            {activeTab === index_kassir_time && kassir_time && (
              <EventTime_Tab_Kassir_Time
                activeTab={activeTab}
                acces={acces}
                index_kassir_time={index_kassir_time}
                kassir={kassir_time}
                onKassirChange={newKassir => this.setState({ kassir_time: newKassir })}
                saveKey="kassir_time"
                onSave={this.saveTabData}
              />
            )}
          {/* Время кассира */}

          {/* Таблица уровней кафе */}
            {activeTab === index_table_lv && table_lv && (
              <EventTime_Tab_TableLv
                activeTab={activeTab}
                acces={acces}
                index_table_lv={index_table_lv}
                table_lv={table_lv}
                onLvChange={newArr => this.setState({ table_lv: newArr })}
                saveKey="table_lv"
                onSave={this.saveTabData}
              />
            )}
          {/* Таблица уровней кафе */}

          {/* Время ожидания для клиента */}
            {activeTab === index_cur && cur && (
              <EventTime_Tab_Cur
                activeTab={activeTab}
                index_cur={index_cur}
                cur={cur}
                acces={acces}
                onCurChange={newArr => this.setState({ cur: newArr })}
                saveKey="cur"
                onSave={this.saveTabData}
              />
            )}
          {/* Время ожидания для клиента */}

          {/* Мотивации кассира за регистрацию */}
            {activeTab === index_kassir_registr && kassir_registr && (
              <EventTime_Tab_Kassir_Registr
                activeTab={activeTab}
                index_kassir_registr={index_kassir_registr}
                kassir_registr={kassir_registr}
                acces={acces}
                onSave={this.saveTabData_registr}
                openAlert={this.openAlert}
                onDelete={this.deleteTabData_registr}
              />
            )}
          {/* Мотивации кассира за регистрацию */}

        </Grid>
      </>
    );
  }
}

export default function EventTime2() {
  return <EventTime2_ />;
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
