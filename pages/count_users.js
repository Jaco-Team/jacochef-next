import React from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import {MySelect, MyTimePicker, MyDatePickerNew, MyTextInput} from '@/ui/elements';

import queryString from 'query-string';

import dayjs from 'dayjs';
import {api_laravel} from "@/src/api_new";

class CountUsers_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
      date_start: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      this.setState({
        item: JSON.parse(JSON.stringify(this.props.event)),
        date_start: this.props.event[0]?.date ? JSON.parse(JSON.stringify(this.props.event[0].date)) : null,
      });
    }
  }

  changeTimeStart(item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((el) => {
      if (el.id === item.id) {
        el.time_start = event.target.value;
      }
      return el;
    });

    this.setState({
      item: editEvent,
    });
  }

  changeTimeEnd(item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((el) => {
      if (el.id === item.id) {
        el.time_end = event.target.value;
      }
      return el;
    });

    this.setState({
      item: editEvent,
    });
  }

  changeItem(el, item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((ev) => {
      if (ev.id === item.id) {
        ev.apps.map((obj) => {
          if (obj.app_id === el.app_id) {
            obj.count = Number(event.target.value);
          }
          return obj;
        });
      }
      return ev;
    });

    this.setState({
      item: editEvent,
    });
  }

  changeDateRange(val) {
    const item = this.state.item;

    item.forEach((el) => el.date = val);

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item, this.props.method, this.state.date_start);

    this.setState({
      item: this.props.event ? this.props.event : [],
    });

    this.props.onClose();
  }

  addItem() {
    const item = this.state.item;

    if (item.length) {
      const newItem = {
        id: item.length + 1,
        time_start: '',
        time_end: '',
        apps: [
          {
            app_id: '6',
            count: '0',
            app_name: 'Кассир',
          },
          {
            app_id: '5',
            count: '0',
            app_name: 'Повар',
          },
          {
            app_id: '21',
            count: '0',
            app_name: 'Кухонный работник',
          },
          {
            app_id: '8',
            count: '0',
            app_name: 'Курьер',
          },
        ],
      };

      item.push(newItem);
    } else {
      const newItem = {
        id: 1,
        time_start: '',
        time_end: '',
        apps: [
          {
            app_id: '6',
            count: '0',
            app_name: 'Кассир',
          },
          {
            app_id: '5',
            count: '0',
            app_name: 'Повар',
          },
          {
            app_id: '21',
            count: '0',
            app_name: 'Кухонный работник',
          },
          {
            app_id: '8',
            count: '0',
            app_name: 'Курьер',
          },
        ],
      };

      item.push(newItem);
    }

    this.setState({
      item,
    });
  }

  deleteItem(id) {
    const data = this.state.item;

    const item = data.filter((el) => el.id !== id);

    this.setState({
      item,
    });
  }

  onClose() {
    this.setState({
      item: this.props.event ? this.props.event : [],
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: 'normal' }}>{this.props.method}</Typography>
          {this.props.fullScreen ? (
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>

        <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6}>
              <MyDatePickerNew
                label="Дата"
                value={this.state?.item[0]?.date ? dayjs(this.state?.item[0]?.date) : null}
                func={this.changeDateRange.bind(this)}
              />
            </Grid>
          </Grid>
          {this.state.item.map((item, key) => (
            <React.Fragment key={key}>
              <Grid container spacing={3}>
                <Grid item xs={8} sm={3} mt={2}>
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', minHeight: 120}}>
                    <MyTimePicker
                      value={item.time_start}
                      func={this.changeTimeStart.bind(this, item)}
                      label="Время начала"
                    />
                    <MyTimePicker
                      value={item.time_end}
                      func={this.changeTimeEnd.bind(this, item)}
                      label="Время окончания"
                    />
                  </div>
                </Grid>
                <Grid item xs={4} sm={0} sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', alignItems: 'center'}}>
                  <CloseIcon fontSize="large" onClick={this.deleteItem.bind(this, item.id)} style={{ cursor: 'pointer' }}/>
                </Grid>

                <Grid item sm={8}>
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                    {item.apps.map((el, i) => (
                      <div key={i + 10} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: i === 0 ? 20 : 0}}>
                        <span style={{ minWidth: 200 }}>{el.app_name}</span>
                        <MyTextInput
                          value={el.count}
                          type="number"
                          func={this.changeItem.bind(this, el, item)}
                        />
                      </div>
                    ))}
                  </div>
                </Grid>

                <Grid item xs={4} sm={1} sx={{display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', alignItems: 'center'}}>
                  <CloseIcon fontSize="large" onClick={this.deleteItem.bind(this, item.id)} style={{ cursor: 'pointer' }}/>
                </Grid>
              </Grid>
              <Divider />
            </React.Fragment>
          ))}
        </DialogContent>

        <DialogActions className="button">
          <Button style={{ whiteSpace: 'nowrap' }} onClick={this.addItem.bind(this)}>
            Добавить
          </Button>
          <Button style={{ color: '#00a550' }} onClick={this.save.bind(this)}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class CountUsers_TablePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      this.setState({
        item: JSON.parse(JSON.stringify(this.props.event)),
      });
    }
  }

  componentDidMount() {
    this.setState({
      item: JSON.parse(JSON.stringify(this.props.event)),
    });
  }

  changeTimeStart(item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((el) => {
      if (el.id === item.id) {
        el.time_start = event.target.value;
      }
      return el;
    });

    this.setState({
      item: editEvent,
    });
  }

  changeTimeEnd(item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((el) => {
      if (el.id === item.id) {
        el.time_end = event.target.value;
      }
      return el;
    });

    this.setState({
      item: editEvent,
    });
  }

  changeItem(el, item, event) {
    const eventItem = this.state.item;

    const editEvent = eventItem.map((ev) => {
      if (ev.id === item.id) {
        ev.apps.map((obj) => {
          if (obj.app_id === el.app_id) {
            obj.count = Number(event.target.value);
          }
          return obj;
        });
      }
      return ev;
    });

    this.setState({
      item: editEvent,
    });
  }

  addItem() {
    const item = this.state.item;

    if (item.length) {
      const newItem = {
        id: item.length + 1,
        time_start: '',
        time_end: '',
        apps: [
          {
            app_id: '6',
            count: '0',
            app_name: 'Кассир',
          },
          {
            app_id: '5',
            count: '0',
            app_name: 'Повар',
          },
          {
            app_id: '21',
            count: '0',
            app_name: 'Кухонный работник',
          },
          {
            app_id: '8',
            count: '0',
            app_name: 'Курьер',
          },
        ],
      };

      item.push(newItem);
    } else {
      const newItem = {
        id: 1,
        time_start: '',
        time_end: '',
        apps: [
          {
            app_id: '6',
            count: '0',
            app_name: 'Кассир',
          },
          {
            app_id: '5',
            count: '0',
            app_name: 'Повар',
          },
          {
            app_id: '21',
            count: '0',
            app_name: 'Кухонный работник',
          },
          {
            app_id: '8',
            count: '0',
            app_name: 'Курьер',
          },
        ],
      };

      item.push(newItem);
    }

    this.setState({
      item,
    });
  }

  deleteItem(id) {
    const data = this.state.item;

    const item = data.filter((el) => el.id !== id);

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item, 'Изменение данных таблицы');

    this.setState({
      item: JSON.parse(JSON.stringify(this.props.event)),
    });
  }

  render() {
    return (
      <TabPanel value={this.props.value}>
        <Grid container justifyContent="center">
          {this.state.item.map((item, key) => (
            <Grid
              container
              spacing={3}
              key={key}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              item
              sm={8}
            >
              <Grid item xs={8} sm={3} mt={2}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    height: '100%',
                    minHeight: 120,
                  }}
                >
                  <MyTimePicker
                    value={item.time_start}
                    func={this.changeTimeStart.bind(this, item)}
                    label="Время начала"
                  />
                  <MyTimePicker
                    value={item.time_end}
                    func={this.changeTimeEnd.bind(this, item)}
                    label="Время окончания"
                  />
                </div>
              </Grid>
              <Grid
                item
                xs={4}
                sm={0}
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CloseIcon
                  fontSize="large"
                  onClick={this.deleteItem.bind(this, item.id)}
                  style={{ cursor: 'pointer' }}
                />
              </Grid>

              <Grid item sm={6}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  {item.apps.map((el, i) => (
                    <div
                      key={i + 10}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                        marginTop: i === 0 ? 20 : 0,
                      }}
                    >
                      <span style={{ minWidth: 200 }}>{el.app_name}</span>
                      <MyTextInput
                        value={el.count}
                        type="number"
                        func={this.changeItem.bind(this, el, item)}
                      />
                    </div>
                  ))}
                </div>
              </Grid>

              <Grid
                item
                xs={4}
                sm={3}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CloseIcon
                  fontSize="large"
                  onClick={this.deleteItem.bind(this, item.id)}
                  style={{ cursor: 'pointer' }}
                />
              </Grid>
            </Grid>
          ))}

          <Grid
            item
            sm={8}
            container
            spacing={3}
            sx={{ marginBottom: { xs: 0, sm: 3 }, marginTop: 1 }}
          >
            <Grid item xs={6} sm={9}>
              <Button
                variant="contained"
                style={{ whiteSpace: 'nowrap' }}
                onClick={this.addItem.bind(this)}
              >
                Добавить
              </Button>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                onClick={this.save.bind(this)}
                style={{ backgroundColor: '#00a550', whiteSpace: 'nowrap' }}
              >
                Сохранить
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
    );
  }
}

class CountUsers_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: 'count_users',
      module_name: '',
      is_load: false,

      points: [],
      point: '',

      ItemTab: '1',

      item: [],

      data: [
        {
          id: 1,
          time_start: '',
          time_end: '',
          apps: [
            {
              app_id: '6',
              count: '0',
              app_name: 'Кассир',
            },
            {
              app_id: '5',
              count: '0',
              app_name: 'Повар',
            },
            {
              app_id: '21',
              count: '0',
              app_name: 'Кухонный работник',
            },
            {
              app_id: '8',
              count: '0',
              app_name: 'Курьер',
            },
          ],
        },
      ],

      other_days: [],

      modalDialog: false,

      dows: [],
      dow: [],

      fullScreen: false,
    };
  }

  async componentDidMount() {
    const ItemTab = this.state.ItemTab;

    const data = await this.getData('get_all');

    const dataTable = this.state.data;

    const point = {
      point_id: data.point_list[0].id,
    };

    const res = await this.getData('get_info', point);

    const dow = res.dows.find((el) => el.dow === Number(ItemTab));

    dow.times.map((el, i) => (el.id = i + 1));

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
      dows: res.dows,
      dow: dow.times.length ? dow.times : dataTable,
      other_days: res.other_days,
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
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  async changePoint(event) {
    const ItemTab = this.state.ItemTab;

    const dataTable = this.state.data;

    const data = {
      point_id: event.target.value,
    };

    const res = await this.getData('get_info', data);

    const dow = res.dows.find((el) => el.dow === Number(ItemTab));

    dow.times.map((el, i) => (el.id = i + 1));

    this.setState({
      point: event.target.value,
      dows: res.dows,
      dow: dow.times.length ? dow.times : dataTable,
      other_days: res.other_days,
    });
  }

  changeTab(event, value) {
    const dows = this.state.dows;

    const dataTable = this.state.data;

    const dow = dows.find((el) => el.dow === Number(value));

    dow.times.map((el, i) => (el.id = i + 1));

    this.setState({
      ItemTab: value,
      dow: dow.times.length ? dow.times : dataTable,
    });
  }

  async openModal(method, item, event) {
    this.handleResize();

    if (method === 'Особый день') {
      const item = [
        {
          id: 1,
          time_start: '',
          time_end: '',
          apps: [
            {
              app_id: '6',
              count: '0',
              app_name: 'Кассир',
            },
            {
              app_id: '5',
              count: '0',
              app_name: 'Повар',
            },
            {
              app_id: '21',
              count: '0',
              app_name: 'Кухонный работник',
            },
            {
              app_id: '8',
              count: '0',
              app_name: 'Курьер',
            },
          ],
        },
      ];

      this.setState({
        modalDialog: true,
        method,
        item,
      });
    }

    if (method === 'Редактировать особый день') {
      event.stopPropagation();

      const point_id = this.state.point;

      const data = {
        date: item.date,
        point_id,
      };

      const res = await this.getData('get_day', data);

      res.forEach((el) => {
        el.id = 1;
        el.apps = [];

        el.apps.push(
          {
            app_id: '6',
            count: el.count_kassir,
            app_name: 'Кассир',
          },
          {
            app_id: '5',
            count: el.count_povar,
            app_name: 'Повар',
          },
          {
            app_id: '21',
            count: el.count_kux,
            app_name: 'Кухонный работник',
          },
          {
            app_id: '8',
            count: el.count_driver,
            app_name: 'Курьер',
          }
        );

        delete el.count_kassir;
        delete el.count_povar;
        delete el.count_kux;
        delete el.count_driver;
      });

      this.setState({
        modalDialog: true,
        method,
        item: res,
      });
    }
  }

  async save(item, method, old_day) {
    const dow = this.state.ItemTab;

    const point_id = this.state.point;

    const date = dayjs(item[0].date).format('YYYY-MM-DD');

    item.forEach((el) => {
      (el.dow = Number(dow)), delete el.id;

      el.apps.forEach((it) => {
        if (it.app_name === 'Кассир') {
          el.count_kassir = it.count;
        }
        if (it.app_name === 'Повар') {
          el.count_povar = it.count;
        }
        if (it.app_name === 'Кухонный работник') {
          el.count_kux = it.count;
        }
        if (it.app_name === 'Курьер') {
          el.count_driver = it.count;
        }
      });

      delete el.apps;

      if (el.date) {
        delete el.date;
      }
    });

    if (method === 'Изменение данных таблицы') {
      const data = {
        point_id,
        dow: dow,
        data: item,
      };

      await this.getData('update', data);

      setTimeout(() => {
        this.update();
      }, 300);
    }

    if (method === 'Особый день') {
      const data = {
        point_id,
        date,
        data: item,
      };

      await this.getData('save_new_day', data);

      setTimeout(() => {
        this.update();
      }, 300);
    }

    if (method === 'Редактировать особый день') {
      const data = {
        point_id,
        date,
        old_day,
        data: item,
      };

      await this.getData('save_edit_day', data);

      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async deleteItem(item, event) {
    event.stopPropagation();

    const data = {
      point_id: item.point_id,
      date: item.date,
    };

    await this.getData('del_day', data);

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async update() {
    const ItemTab = this.state.ItemTab;

    const point_id = this.state.point;

    const dataTable = this.state.data;

    const data = {
      point_id,
    };

    const res = await this.getData('get_info', data);

    const dow = res.dows.find((el) => el.dow === Number(ItemTab));

    dow.times.map((el, i) => (el.id = i + 1));

    this.setState({
      dows: res.dows,
      dow: dow.times.length ? dow.times : dataTable,
      other_days: res.other_days,
    });
  }

  render() {
    return (
      <>
        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* модалка */}
        <CountUsers_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={this.state.method}
          event={this.state.item}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
        />

        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          {/* выбор и кнопка */}
          <Grid item xs={12} sm={6}>
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button variant="contained" style={{ whiteSpace: 'nowrap' }} onClick={this.openModal.bind(this, 'Особый день')}>
              Добавить особый день
            </Button>
          </Grid>

          {/* таблица */}
          {this.state.point < 1 ? null : (
            <Grid item xs={12} sm={8}>
              <TabContext value={this.state.ItemTab}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                  <TabList
                    onChange={this.changeTab.bind(this)}
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                  >
                    <Tab label="Понедельник" value="1" />
                    <Tab label="Вторник" value="2" />
                    <Tab label="Среда" value="3" />
                    <Tab label="Четверг" value="4" />
                    <Tab label="Пятница" value="5" />
                    <Tab label="Суббота" value="6" />
                    <Tab label="Воскресенье" value="7" />
                  </TabList>
                </Box>
                <CountUsers_TablePanel
                  value={this.state.ItemTab}
                  event={this.state.dow}
                  save={this.save.bind(this)}
                />
              </TabContext>
            </Grid>
          )}

          {/* аккордион */}
          {!this.state.other_days.length ? null : (
            <Grid item xs={12} sm={4} mb={3}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                  <Typography>Даты</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {this.state.other_days.map((item, i) => (
                    <Accordion key={i} expanded={true} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <AccordionSummary expandIcon={<CloseIcon onClick={this.deleteItem.bind(this, item)}/>}>
                        <Typography onClick={this.openModal.bind(this, 'Редактировать особый день', item)}>{item.date}</Typography>
                      </AccordionSummary>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function CountUsers() {
  return <CountUsers_ />;
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
