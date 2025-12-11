import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CloseIcon from "@mui/icons-material/Close";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import { MySelect, MyAutocomplite2, MyTimePicker, MyDatePickerNew } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class EventTime1_Modal_Map extends React.Component {
  render() {
    const { item_one, itemData_one, deleteItem, openModal, fullScreen, open, zone_name, onClose } =
      this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose.bind(this)}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"xl"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="button">
          <Typography>{`Зона: ${zone_name}`}</Typography>
          <IconButton onClick={onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
            size={{
              xs: 12,
            }}
          >
            <EventTime1_Data
              item={item_one}
              itemData={itemData_one}
              deleteItem={deleteItem}
              openModal={openModal}
              type="modal"
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose.bind(this)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class EventTime1_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      data: [],

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.event);

    if (!this.props.event) {
      return;
    }

    if (this.props.event !== prevProps.event) {
      const data = [];

      for (let i = 5; i <= 300; i += 5) {
        data.push({ id: `${i}`, name: `${i}` });
      }

      this.setState({
        item: this.props.event,
        data,
      });
    }
  }

  changeItem(data, event, value) {
    const item = this.state.item;

    if (data == "time_dev") {
      if (!value) {
        value = event.target.value;
        // console.log( event.target.value )
      }
      // console.log( data, event, value )
    }

    item[data] = value;

    this.setState({
      item,
    });
  }

  changeTime(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeDateRange(data, value) {
    const item = this.state.item;

    item[data] = value ? value : "";

    this.setState({
      item,
    });
  }

  save() {
    const message = "Необходимо заполнить все данные!";

    let item = this.state.item;

    if (
      this.props.mark === "newDay" &&
      (!item.date || !item.time_start || !item.time_end || !item.time_dev)
    ) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: message,
      });

      return;
    }

    if (
      (this.props.mark === "newEvent" || this.props.mark === "editEvent") &&
      (!item.time_start || !item.time_end || !item.time_dev)
    ) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: message,
      });

      return;
    }

    ((item.date = dayjs(item.date).format("YYYY-MM-DD")), this.props.save(item, this.props.mark));

    this.onClose();
  }

  onClose() {
    this.setState({
      item: this.props.event ? this.props.event : null,
      data: [],
      err_status: true,
      err_text: "",
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
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={this.props.mark !== "newDay" ? "md" : "lg"}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography>{this.props.method}</Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
              size={{
                xs: 12,
              }}
              sx={{
                mb: 3,
              }}
            >
              {this.props.mark !== "newDay" ? null : (
                <Grid
                  size={{
                    sm: 3,
                    xs: 12,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата"
                    value={this.state.item?.date ? dayjs(this.state.item.date) : null}
                    func={this.changeDateRange.bind(this, "date")}
                  />
                </Grid>
              )}

              <Grid
                size={{
                  sm: this.props.mark !== "newDay" ? 4 : 3,
                  xs: 6,
                }}
              >
                <MyTimePicker
                  value={this.state.item ? this.state.item.time_start : ""}
                  func={this.changeTime.bind(this, "time_start")}
                  label="Время начала"
                />
              </Grid>

              <Grid
                size={{
                  sm: this.props.mark !== "newDay" ? 4 : 3,
                  xs: 6,
                }}
              >
                <MyTimePicker
                  value={this.state.item ? this.state.item.time_end : ""}
                  func={this.changeTime.bind(this, "time_end")}
                  label="Время окончания"
                />
              </Grid>

              <Grid
                size={{
                  sm: this.props.mark !== "newDay" ? 4 : 3,
                  xs: 12,
                }}
              >
                <MyAutocomplite2
                  label="Время на доставку"
                  multiple={false}
                  freeSolo={true}
                  func={this.changeItem.bind(this, "time_dev")}
                  onBlur={this.changeItem.bind(this, "time_dev")}
                  data={this.state.data}
                  value={this.state.item ? this.state.item.time_dev : ""}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.save.bind(this)}>Сохранить</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class EventTime1_Data extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      JSON.stringify(nextProps.itemData) !== JSON.stringify(this.props.itemData) ||
      JSON.stringify(nextProps.item) !== JSON.stringify(this.props.item) ||
      nextProps.type !== this.props.type
    );
  }

  render() {
    const { item, itemData, deleteItem, openModal, type } = this.props;

    return (
      <>
        {type === "zone" ? null : (
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Button
              variant="contained"
              style={{ whiteSpace: "nowrap" }}
              onClick={openModal.bind(this, "Особый день", "newDay")}
            >
              Добавить особый день
            </Button>
          </Grid>
        )}
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography style={{ whiteSpace: "nowrap", fontWeight: "bold " }}>
                {" "}
                Особые дни{" "}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Accordion>
                <TableContainer>
                  <Table
                    size="small"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "30%" }}>Дата</TableCell>
                        <TableCell style={{ width: "30%" }}>Время</TableCell>
                        <TableCell style={{ width: "30%" }}>Доставка</TableCell>
                        <TableCell style={{ width: "10%" }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      sx={{ "& td": { border: 0 }, borderBottom: 1, borderColor: "divider" }}
                    >
                      {item.map((item, key) => (
                        <TableRow key={key + 100}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            {item.time_start} - {item.time_end}
                          </TableCell>
                          <TableCell>{item.time_dev}</TableCell>
                          <TableCell>
                            <CloseIcon
                              onClick={deleteItem.bind(this, item.id, "time_other")}
                              style={{ cursor: "pointer" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        />
        {itemData.map((item, key) => (
          <Grid
            key={key}
            size={{
              sm: 3,
              xs: 12,
            }}
          >
            <Card
              variant="outlined"
              sx={{ border: 1, boxShadow: 1, borderRadius: 2, p: 2, mb: "12px" }}
            >
              <Grid align="center">{item.day_week}</Grid>
              <Divider />
              <Table
                size="small"
                style={{ whiteSpace: "nowrap" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell style={{ maxWidth: "40%" }}>Время</TableCell>
                    <TableCell style={{ maxWidth: "40%" }}>Доставка</TableCell>
                    <TableCell style={{ maxWidth: "20%" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ "& td": { border: 0 }, borderBottom: 1, borderColor: "divider" }}>
                  {item.data.map((item, key) => (
                    <TableRow
                      key={key + 100}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell
                        onClick={openModal.bind(this, "Редактирование времени", "editEvent", item)}
                      >
                        {item.time_start} - {item.time_end}
                      </TableCell>
                      <TableCell
                        onClick={openModal.bind(this, "Редактирование времени", "editEvent", item)}
                      >
                        {item.time_dev}
                      </TableCell>
                      <TableCell style={{ padding: 0 }}>
                        <CloseIcon onClick={deleteItem.bind(this, item.id, "time")} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                size="sm"
                fullWidth={true}
                onClick={openModal.bind(this, "- текущие заказы", "newEvent", item)}
              >
                Добавить
              </Button>
            </Card>
          </Grid>
        ))}
      </>
    );
  }
}

class EventTime1_ extends React.Component {
  map = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "event_time_1",
      module_name: "",
      is_load: false,

      points: [],
      point: "0",

      modalDialog: false,
      method: "",
      mark: "",
      fullScreen: false,

      item: [],
      itemData: [],

      itemNew: {
        dow: "",
        zone_id: "",
        time_start: "",
        time_end: "",
        time_dev: "",
      },

      event: null,

      cardData: [
        {
          day_id: "1",
          day_week: "Понедельник",
          data: [],
        },
        {
          day_id: "2",
          day_week: "Вторник",
          data: [],
        },
        {
          day_id: "3",
          day_week: "Среда",
          data: [],
        },
        {
          day_id: "4",
          day_week: "Четверг",
          data: [],
        },
        {
          day_id: "5",
          day_week: "Пятница",
          data: [],
        },
        {
          day_id: "6",
          day_week: "Суббота",
          data: [],
        },
        {
          day_id: "7",
          day_week: "Воскресенье",
          data: [],
        },
      ],

      openAlert: false,
      err_status: false,
      err_text: "",

      activeTab: 0,

      cities: [],
      city: "",

      zones: [],

      item_one: [],
      itemData_one: [],
      itemData_hist: [],
      modalDialog_one: false,
      zone_name: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");
    const itemData = JSON.parse(JSON.stringify(this.state.cardData));

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      itemData,
      zone_id: data.points[0].id,
      cities: data.cities,
      city: data.cities[0].id,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.update();
    }, 50);
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
    const zone_id = event.target.value;

    this.setState({
      point: zone_id,
    });

    setTimeout(() => {
      this.update();
    }, 50);
  }

  openModal(method, mark, item) {
    this.handleResize();

    if (mark === "newDay") {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      itemNew.zone_id = this.state.point;

      this.setState({
        modalDialog: true,
        method,
        mark,
        event: itemNew,
      });
    }

    if (mark === "newEvent") {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      itemNew.zone_id = this.state.point;

      itemNew.dow = item.day_id;

      method = `${item.day_week} ${method}`;

      this.setState({
        modalDialog: true,
        method,
        mark,
        event: itemNew,
      });
    }

    if (mark === "editEvent") {
      this.setState({
        modalDialog: true,
        method,
        mark,
        event: item,
      });
    }
  }

  async saveItem(item, mark) {
    item.time = `${item.time_start}-${item.time_end}`;
    item.type = mark;

    const res = await this.getData("save", item);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: res.text,
      });

      setTimeout(() => {
        this.update();
      }, 100);
    }
  }

  async deleteItem(time_id, mark) {
    const data = {
      time_id,
    };

    if (mark === "time") {
      await this.getData("del_time", data);
    }

    if (mark === "time_other") {
      await this.getData("del_time_other", data);
    }

    this.update();
  }

  async update() {
    const zone_id = this.state.point;
    const itemData = JSON.parse(JSON.stringify(this.state.cardData));

    const zone = {
      zone_id,
    };

    const res = await this.getData("get_data", zone);

    res.dows.forEach((item) => {
      itemData.forEach((el) => {
        if (parseInt(item.dow) === parseInt(el.day_id)) {
          el.data.push(item);
        }
      });
    });

    let itemData_hist = JSON.parse(JSON.stringify(this.state.cardData));

    res?.dows_hist?.forEach((item) => {
      itemData_hist.forEach((el) => {
        if (parseInt(item.dow) === parseInt(el.day_id)) {
          el.data.push(item);
        }
      });
    });

    itemData_hist = itemData_hist
      .filter((day) => day.data.length > 0)
      .sort((a, b) => parseInt(a.day_id) - parseInt(b.day_id));

    this.setState({
      item: res.other_days,
      itemData,
      item_one: res.other_days,
      itemData_one: itemData,
      itemData_hist,
    });
  }

  changeTab(event, val) {
    if (parseInt(val) === 1) {
      this.map = null;

      this.getZones();
    } else {
      this.update();
    }

    this.setState({
      activeTab: val,
    });
  }

  changeCity(event) {
    this.setState({
      city: event.target.value,
    });

    setTimeout(() => {
      this.getZones();
    }, 100);
  }

  async getZones() {
    const city_id = this.state.city;
    const city =
      this.state.cities.find((item) => parseInt(item.id) === parseInt(city_id))?.xy_center_map ??
      "";

    const data = {
      city_id,
    };

    const res = await this.getData("get_zones", data);

    this.setState({
      zones: res.zones,
    });

    if (res.zones.length && city) {
      setTimeout(() => {
        this.getMapZones(city, res.zones);
      }, 300);
    } else {
      setTimeout(() => {
        this.map?.geoObjects?.removeAll();
      }, 300);
    }
  }

  getMapZones(city, all_zones) {
    if (!this.map) {
      ymaps.ready(() => {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
          return;
        }

        this.map = new ymaps.Map(
          "map",
          { center: JSON.parse(city), zoom: 11 },
          { searchControlProvider: "yandex#search" },
        );

        all_zones.map((item) => {
          let points_zone = [];

          points_zone.push(JSON.parse(item["zone"]));

          let myGeoObject2 = [];

          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly]],
              {
                hintContent: "",
              },
              {
                fillOpacity: 0.4,
                fillColor: "rgb(240, 128, 128)",
                strokeColor: "rgb(187, 0, 37)",
                strokeWidth: 5,
              },
            );

            this.map.geoObjects.add(myGeoObject2[poly]);
          }
        });

        this.map.geoObjects.events.add("click", this.openZone.bind(this));
      });
    } else {
      this.map.geoObjects.removeAll();

      this.map.setCenter(JSON.parse(city));

      all_zones.map((item) => {
        let points_zone = [];

        points_zone.push(JSON.parse(item["zone"]));

        let myGeoObject2 = [];

        for (var poly = 0; poly < points_zone.length; poly++) {
          myGeoObject2[poly] = new ymaps.Polygon(
            [points_zone[poly]],
            {
              hintContent: "",
            },
            {
              fillOpacity: 0.4,
              fillColor: "rgb(240, 128, 128)",
              strokeColor: "rgb(187, 0, 37)",
              strokeWidth: 5,
            },
          );

          this.map.geoObjects.add(myGeoObject2[poly]);
        }
      });
    }
  }

  async openZone(event) {
    this.handleResize();

    const zones = this.state.zones;
    const index = this.map.geoObjects.indexOf(event.get("target"));

    if (zones[index]) {
      const data = {
        zone_id: zones[index].id,
      };

      const res = await this.getData("get_data", data);
      const itemData = JSON.parse(JSON.stringify(this.state.cardData));

      res.dows.forEach((item) => {
        itemData.forEach((el) => {
          if (parseInt(item.dow) === parseInt(el.day_id)) {
            el.data.push(item);
          }
        });
      });

      this.setState({
        modalDialog_one: true,
        item_one: res.other_days,
        itemData_one: itemData,
        zone_name: zones[index].name,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Что-то пошло не так, зона не найдена",
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <EventTime1_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={this.state.method}
          event={this.state.event}
          save={this.saveItem.bind(this)}
          mark={this.state.mark}
          fullScreen={this.state.fullScreen}
        />
        <EventTime1_Modal_Map
          open={this.state.modalDialog_one}
          onClose={() => this.setState({ modalDialog_one: false })}
          fullScreen={this.state.fullScreen}
          item_one={this.state.item_one}
          itemData_one={this.state.itemData_one}
          deleteItem={this.deleteItem.bind(this)}
          openModal={this.openModal.bind(this)}
          zone_name={this.state.zone_name}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Paper>
              <Tabs
                value={this.state.activeTab}
                onChange={this.changeTab.bind(this)}
                centered
                variant="fullWidth"
              >
                <Tab
                  label="По зонам"
                  {...a11yProps(0)}
                />
                <Tab
                  label="На карте"
                  {...a11yProps(1)}
                />
              </Tabs>
            </Paper>
          </Grid>

          {/* По зонам */}
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={this.state.activeTab}
              index={0}
              id="clients"
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MySelect
                    is_none={false}
                    data={this.state.points}
                    value={this.state.point}
                    func={this.changePoint.bind(this)}
                    label="Точка"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Button
                    variant="contained"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={this.openModal.bind(this, "Особый день", "newDay")}
                  >
                    Добавить особый день
                  </Button>
                </Grid>

                <EventTime1_Data
                  item={this.state.item}
                  itemData={this.state.itemData}
                  deleteItem={this.deleteItem.bind(this)}
                  openModal={this.openModal.bind(this)}
                  type="zone"
                />

                {!this.state.itemData_hist.length ? null : (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                    sx={{
                      mb: 5,
                    }}
                  >
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="main-accordion-content"
                        id="main-accordion-header"
                      >
                        <Typography sx={{ fontWeight: "bold " }}>
                          История изменений в днях недели
                        </Typography>
                      </AccordionSummary>

                      <AccordionDetails>
                        {this.state.itemData_hist.map((day) => (
                          <Accordion key={day.day_id}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls={`accordion-day-${day.day_id}-content`}
                              id={`accordion-day-${day.day_id}-header`}
                            >
                              <Typography sx={{ fontWeight: "bold " }}>{day.day_week}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>#</TableCell>
                                      <TableCell>Дата / время изменений</TableCell>
                                      <TableCell>Время</TableCell>
                                      <TableCell>Доставка</TableCell>
                                      <TableCell>Сотрудник</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {day.data.map((row, key) => (
                                      <TableRow key={key}>
                                        <TableCell>{key + 1}</TableCell>
                                        <TableCell>{row.date_time}</TableCell>
                                        <TableCell>
                                          {row.time_start} - {row.time_end}
                                        </TableCell>
                                        <TableCell>{row.time_dev}</TableCell>
                                        <TableCell>{row.user_name}</TableCell>
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
                )}
              </Grid>
            </TabPanel>
          </Grid>
          {/* По зонам */}

          {/* На карте */}
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={this.state.activeTab}
              index={1}
              id="clients"
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MySelect
                    label="Город"
                    is_none={false}
                    data={this.state.cities}
                    value={this.state.city}
                    func={this.changeCity.bind(this)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                  sx={{
                    mb: 5,
                  }}
                >
                  <div
                    id="map"
                    name="map"
                    style={{ width: "100%", height: 700, paddingTop: 10 }}
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
          {/* На карте  */}
        </Grid>
      </>
    );
  }
}

export default function EventTime1() {
  return <EventTime1_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
