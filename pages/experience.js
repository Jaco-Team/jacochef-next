import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";

import moment from "moment";
import { api_laravel_local, api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";

const formatter = new Intl.NumberFormat("ru", {
  style: "unit",
  unit: "year",
  unitDisplay: "long",
});

class Experience_Modal_Cloth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      listCloth: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.listCloth) {
      return;
    }

    if (this.props.listCloth !== prevProps.listCloth) {
      let listCloth = [...this.props.listCloth];

      listCloth = listCloth.filter((item) => item.name);

      listCloth.push({ id: "0", name: "" });

      this.setState({
        listCloth,
      });
    }
  }

  changeName(index, event) {
    let listCloth = this.state.listCloth;

    listCloth[index].name = event.target.value;

    listCloth = listCloth.filter((item) => item.name);

    listCloth.push({ id: "0", name: "" });

    this.setState({
      listCloth,
    });
  }

  saveClothList() {
    let listCloth = this.state.listCloth;

    listCloth = listCloth.filter((item) => item.name);

    this.props.saveClothList(listCloth);

    this.onClose();
  }

  onClose() {
    this.setState({
      listCloth: null,
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
        maxWidth={"md"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold" }}>Список предметов одежды</Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
          <Grid
            container
            spacing={3}
          >
            {!this.state.listCloth
              ? null
              : this.state.listCloth.map((it, key) => (
                  <Grid
                    key={key}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <MyTextInput
                      label="Наименование"
                      value={it.name}
                      func={this.changeName.bind(this, key)}
                    />
                  </Grid>
                ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="success"
            variant="contained"
            onClick={this.saveClothList.bind(this)}
          >
            Coxранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class Experience_Modal_User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      setEdit: false,
      pressCount: 0,
      data: "",

      ItemTab: "1",
      listData: null,
      listClothUserActive: null,
      listClothUserNonActive: null,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  componentDidUpdate(prevProps) {
    //console.log('Experience_Modal_User', this.props);

    if (!this.props.user) {
      return;
    }

    if (this.props.user !== prevProps.user) {
      const listData = [...this.props.listData];

      listData.forEach((item) => {
        const end = moment(item.end);

        if (!item.end) {
          item.change = "daysOver";
        }

        if (end.diff(moment(), "days") < -13) {
          item.change = "daysOver";
        }

        if (end.diff(moment(), "days") < 14 && end.diff(moment(), "days") > -14) {
          item.change = "endDays";
        }
      });

      this.setState({
        listData,
        listClothUserActive: this.props.listClothUserActive,
        listClothUserNonActive: this.props.listClothUserNonActive,
        item: this.props.user,
        data: this.props.user.date_registration,
        ItemTab: this.props.ItemTab ?? this.state.ItemTab,
      });
    }
  }

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });
  }

  changeDateRange(data, type, date, val) {
    const value = val ? dayjs(val).format("YYYY-MM-DD") : "";

    if (data === "list") {
      const listData = this.state.listData;

      listData.forEach((item) => (item.type === type ? (item.start = value) : item));

      this.setState({
        listData,
      });
    } else if (data === "cloth") {
      const listClothUserActive = this.state.listClothUserActive;

      listClothUserActive.forEach((item) => (item.cloth_id === type ? (item[date] = value) : item));

      this.setState({
        listClothUserActive,
      });
    } else {
      const item = this.state.item;

      item.date_registration = value;

      this.setState({
        item,
      });
    }
  }

  onDoubleClick() {
    this.setState({ pressCount: this.state.pressCount + 1 });

    setTimeout(() => {
      if (this.state.pressCount == 2) {
        this.setState({ setEdit: true });
      }
      this.setState({ pressCount: 0 });
    }, 300);
  }

  closeEdit() {
    const item = this.state.item;

    item.date_registration = this.state.data;

    this.setState({
      item,
      setEdit: false,
    });
  }

  saveEdit() {
    let item = this.state.item;

    if (!item.date_registration) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Укажите дату!",
      });

      return;
    }

    if (item.date_registration === this.state.data) {
      this.setState({
        setEdit: false,
      });

      return;
    }

    item.date_registration = dayjs(item.date_registration).format("YYYY-MM-DD");

    this.props.saveEdit(item.date_registration, item.id);

    this.setState({
      setEdit: false,
    });

    this.onClose();
  }

  saveHealthBook() {
    const listData = this.state.listData;

    const user = this.state.item;

    const data = {
      user_id: user.id,
    };

    const noDate = listData.find((item) => !item.start);

    if (noDate) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо заполнить все даты прохождения!",
      });

      return;
    }

    listData.forEach((item) => {
      if (item.start) {
        data[`${item.type}_start`] = item.start;
      }

      if (item.end || item.end === null) {
        data[`${item.type}_end`] = item.end;
      }
    });

    this.props.saveHealthBook(data);

    this.onClose();
  }

  saveListClothUser() {
    const items = this.state.listClothUserActive;
    const user = this.state.item;

    const data = {
      user_id: user.id,
      items,
    };

    this.props.saveListClothUser(data);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
      setEdit: false,
      data: "",

      ItemTab: "1",
      listData: null,
      listClothUserActive: null,
      listClothUserNonActive: [],

      openAlert: false,
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
          maxWidth={"md"}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: "bold" }}>Информация о сотруднике</Typography>
            {this.props.fullScreen ? (
              <IconButton
                onClick={this.onClose.bind(this)}
                style={{ cursor: "pointer" }}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>

          <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
            <TabContext value={this.state.ItemTab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={this.changeTab.bind(this)}
                  variant="fullWidth"
                >
                  <Tab
                    label="Информация"
                    value="1"
                  />
                  {parseInt(this.state.item?.is_health_book) == 1 ? (
                    <Tab
                      label="Мед книжка"
                      value="2"
                    />
                  ) : null}
                  {parseInt(this.state.item?.is_cloth) == 1 ? (
                    <Tab
                      label="Предметы одежды"
                      value="3"
                    />
                  ) : null}
                </TabList>
              </Box>

              {/* Информация */}
              <TabPanel
                value={"1"}
                style={{ padding: "24px 0" }}
              >
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {this.state.item ? (
                      this.state.item.photo ? (
                        <img
                          src={this.state.item.photo}
                          style={{ width: "100%", height: "auto" }}
                        />
                      ) : (
                        "Фото отсутствует"
                      )
                    ) : (
                      "Фото отсутствует"
                    )}
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        ФИО:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item?.name ?? "Не указано"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        Текущая должность:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item?.app_name ?? "Не указана"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        Общий стаж:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item?.exp ?? "Не указано"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        Текущая организация:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item?.point ?? "Не указано"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        Телефон:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item?.login ?? "Не указано"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap", marginRight: 2 }}>
                        Трудоустроен:
                      </Typography>
                      <Typography sx={{ whiteSpace: "nowrap" }}>
                        {this.state.item
                          ? this.state.item.acc_to_kas == 0
                            ? "Неофициально"
                            : "Официально"
                          : "Не указано"}
                      </Typography>
                    </Grid>

                    <Grid
                      sx={{
                        display: "flex",
                        flexDirection: this.state.setEdit ? "column" : "row",
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          marginRight: 2,
                          marginBottom: 2,
                        }}
                      >
                        Дата трудоустройства:
                      </Typography>
                      {this.state.setEdit ? (
                        <Grid
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <Grid
                            sx={{
                              mr: 2,
                            }}
                          >
                            <MyDatePickerNew
                              label="Изменить датy"
                              value={dayjs(this.state.item?.date_registration ?? "")}
                              func={this.changeDateRange.bind(this, "registration", 0, 0)}
                            />
                          </Grid>
                          <Grid
                            sx={{
                              mr: 2,
                            }}
                          >
                            <Button
                              onClick={this.saveEdit.bind(this)}
                              style={{ cursor: "pointer" }}
                              color="success"
                              variant="contained"
                            >
                              <CheckIcon />
                            </Button>
                          </Grid>
                          <Grid>
                            <Button
                              onClick={this.closeEdit.bind(this)}
                              style={{ cursor: "pointer" }}
                              color="error"
                              variant="contained"
                            >
                              <ClearIcon />
                            </Button>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          sx={{ whiteSpace: "nowrap", cursor: "pointer" }}
                          onClick={this.onDoubleClick.bind(this)}
                        >
                          {this.state.item?.date_registration ?? "Не указана"}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* мед книжка */}
              <TabPanel
                value={"2"}
                style={{ padding: "24px 0" }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "33%" }}>Название</TableCell>
                        <TableCell style={{ width: "34%", minWidth: "150px" }}>
                          Дата прохождения
                        </TableCell>
                        <TableCell style={{ width: "33%", minWidth: "150px" }}>
                          Дата окончания
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!this.state.listData
                        ? null
                        : this.state.listData.map((item, key) => (
                            <TableRow key={key}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <MyDatePickerNew
                                  label="Дата"
                                  value={dayjs(item?.start ?? "")}
                                  func={this.changeDateRange.bind(this, "list", item.type, 0)}
                                />
                              </TableCell>
                              <TableCell
                                style={{
                                  backgroundColor: item.change
                                    ? item.change === "daysOver"
                                      ? "#c03"
                                      : "#ffcc00"
                                    : null,
                                  color: item.change
                                    ? item.change === "daysOver"
                                      ? "#fff"
                                      : null
                                    : null,
                                }}
                              >
                                {item.end}
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* предметы одежды */}
              <TabPanel
                value="3"
                style={{ padding: "24px 0" }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "33%" }}>Наименование</TableCell>
                        <TableCell style={{ width: "34%", minWidth: "150px" }}>
                          Дата выдачи
                        </TableCell>
                        <TableCell style={{ width: "33%", minWidth: "150px" }}>
                          Дата сдачи
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!this.state.listClothUserActive
                        ? null
                        : this.state.listClothUserActive.map((item, key) => (
                            <TableRow key={key}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <MyDatePickerNew
                                  label="Дата"
                                  value={dayjs(item?.date_start ?? "")}
                                  func={this.changeDateRange.bind(
                                    this,
                                    "cloth",
                                    item.cloth_id,
                                    "date_start",
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <MyDatePickerNew
                                  label="Дата"
                                  value={dayjs(item?.date_end ?? "")}
                                  func={this.changeDateRange.bind(
                                    this,
                                    "cloth",
                                    item.cloth_id,
                                    "date_end",
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                  <Table
                    size="small"
                    style={{ marginTop: "30px" }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{ border: "none" }}
                          colSpan={3}
                        >
                          <h4>Сданная одежда</h4>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ width: "33%" }}>Наименование</TableCell>
                        <TableCell style={{ width: "34%", minWidth: "150px" }}>
                          Дата выдачи
                        </TableCell>
                        <TableCell style={{ width: "33%", minWidth: "150px" }}>
                          Дата сдачи
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!this.state.listClothUserNonActive
                        ? null
                        : this.state.listClothUserNonActive.map((item, key) => (
                            <TableRow key={key}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item?.date_start ?? ""}</TableCell>
                              <TableCell>{item?.date_end ?? ""}</TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </TabContext>
          </DialogContent>

          <DialogActions className={this.state.ItemTab !== "1" ? "button" : null}>
            {this.state.ItemTab === "1" ? (
              <Button
                variant="contained"
                onClick={this.onClose.bind(this)}
              >
                Закрыть
              </Button>
            ) : (
              <>
                <Button
                  onClick={this.onClose.bind(this)}
                  variant="contained"
                >
                  Отмена
                </Button>
                <Button
                  color="success"
                  variant="contained"
                  onClick={
                    this.state.ItemTab === "2"
                      ? this.saveHealthBook.bind(this)
                      : this.saveListClothUser.bind(this)
                  }
                >
                  Coxранить
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class Experience_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "experience",
      module_name: "",
      is_load: false,

      cities: [],
      city: "",

      points: [],
      pointsCopy: [],
      point: [],

      stat: null,
      users: null,
      stat_of: null,

      modalDialog: false,
      user: null,
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: "",
      apps: [],
      app: {},

      listData: [
        { type: "type_2", name: "Отоларинголог" },
        { type: "type_3", name: "Патогенный стафилококк" },
        { type: "type_4", name: "Стоматолог" },
        { type: "type_5", name: "Терапевт" },
        { type: "type_6", name: "Мед. осмотр" },
        { type: "type_7", name: "Флюорография" },
        { type: "type_8", name: "Бак. анализ" },
        { type: "type_9", name: "Яйц. глист" },
        { type: "type_10", name: "Санитарный минимум" },
      ],

      ItemTab: null,

      modalDialogCloth: false,
      listCloth: null,

      listClothUserActive: null,
      listClothUserNonActive: null,

      user_kind: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    let city = this.state.city;

    let point = this.state.point;

    city =
      data.cities.length === 1
        ? data.cities[0].id
        : (data.cities.find((city) => city.id === -1).id ?? data.cities[0].id);

    point =
      data.cities.length === 1
        ? [...point, ...data.points]
        : [...point, ...([data.points.find((point) => point.id === -1)] ?? [data.points[0]])];

    this.setState({
      city,
      point,
      points: data.points,
      pointsCopy: data.points,
      apps: data.apps,
      app: data.apps.find((app) => app.id === -2),
      cities: data.cities,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getInfo();
    }, 500);
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

  changeCity(event) {
    const data = JSON.parse(JSON.stringify(this.state.pointsCopy));
    const points = data
      .map((point) => {
        if (event.target.value == -1 || point.city_id == event.target.value) {
          return point;
        }
        return null;
      })
      .filter(Boolean);

    this.setState({
      city: event.target.value,
      point: [],
      points,
    });
  }

  changePoint = (event, newValue, reason, details) => {
    const clicked = details?.option;

    if (reason === "clear") {
      this.setState({ point: [] });
      return;
    }

    if (reason === "removeOption") {
      this.setState({ point: newValue });
      return;
    }

    if (reason === "selectOption" && (clicked.id === -1 || clicked.id === -2)) {
      this.setState({ point: [clicked] });
      return;
    }

    const normalPoints = newValue.filter((p) => p.id > 0);
    this.setState({ point: normalPoints });
  };

  async getInfo() {
    const point = this.state.point;

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Выберите точку!",
      });

      return;
    }

    const data = {
      point_id: point,
      app: this.state.app,
    };

    let res = await this.getData("get_info", data);

    res.users.sort((a, b) => new Date(a.date_registration) - new Date(b.date_registration));

    this.setState({
      stat: res.stat,
      users: res.users,
      stat_of: res.stat_of,
    });
  }

  async openModal(user_id, ItemTab) {
    this.handleResize();

    const listData = this.state.listData;

    const data = {
      user_id,
    };

    const res = await this.getData("get_user_info", data);

    listData.forEach((item) => {
      item.change = "";

      for (const key in res.health_book) {
        if (Number(key.split("_")[1]) === Number(item.type.split("_")[1])) {
          if (key.includes("start")) {
            item.start = res.health_book[key];
          }
          if (key.includes("end")) {
            item.end = res.health_book[key];
          }
        }
      }
    });

    const listClothUserNonActive = res.cloth.non_active;

    this.setState({
      ItemTab,
      listData,
      listClothUserActive: res.cloth.active,
      listClothUserNonActive,
      modalDialog: true,
      user: res.user,
    });
  }

  async saveEdit(date_registration, user_id) {
    const data = {
      user_id,
      date_registration,
    };

    const res = await this.getData("save_date_registration", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getInfo();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveHealthBook(data) {
    const res = await this.getData("save_health_book", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getInfo();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async getDataСloth() {
    this.handleResize();

    const res = await this.getData("get_cloth");

    this.setState({
      modalDialogCloth: true,
      listCloth: res.cloth,
    });
  }

  async saveClothList(items) {
    const data = {
      items,
    };

    const res = await this.getData("save_cloth_list", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getInfo();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveListClothUser(data) {
    const res = await this.getData("save_cloth_user", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getInfo();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 999 }}
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
        <Experience_Modal_User
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          user={this.state.user}
          fullScreen={this.state.fullScreen}
          saveEdit={this.saveEdit.bind(this)}
          saveHealthBook={this.saveHealthBook.bind(this)}
          listData={this.state.listData}
          ItemTab={this.state.ItemTab}
          listClothUserActive={this.state.listClothUserActive}
          listClothUserNonActive={this.state.listClothUserNonActive}
          saveListClothUser={this.saveListClothUser.bind(this)}
        />
        <Experience_Modal_Cloth
          open={this.state.modalDialogCloth}
          onClose={() => this.setState({ modalDialogCloth: false })}
          fullScreen={this.state.fullScreen}
          listCloth={this.state.listCloth}
          saveClothList={this.saveClothList.bind(this)}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
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
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Должность"
              multiple={false}
              data={this.state.apps}
              value={this.state.app}
              func={this.changeAutocomplite.bind(this, "app")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={this.getInfo.bind(this)}
              sx={{ whiteSpace: "nowrap" }}
            >
              Обновить данные
            </Button>
          </Grid>

          {this.state.user_kind === "1" || this.state.user_kind === "0" ? (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Button
                variant="contained"
                onClick={this.getDataСloth.bind(this)}
                sx={{ whiteSpace: "nowrap" }}
              >
                Предметы одежды
              </Button>
            </Grid>
          ) : null}

          {/* статистика */}
          {!this.state.stat ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Статистические данные</TableCell>
                    </TableRow>
                    {this.state.stat.map((stat, key) => (
                      <TableRow key={key}>
                        <TableCell>
                          {stat.days === "0"
                            ? "Стаж менее года"
                            : `${formatter.format(stat.days)} стажа`}{" "}
                          - {stat.count} сотрудника(-ов)
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* официально трудоустроенных */}
          {!this.state.stat_of ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Трудоустроено</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Официально: {this.state.stat_of.true_count} сотрудника(-ов) /{" "}
                        {this.state.stat_of.true_perc} % от числа сотрудников
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Неофициально: {this.state.stat_of.false_count} сотрудника(-ов) /{" "}
                        {this.state.stat_of.false_perc} % от числа сотрудников
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица */}
          {!this.state.users ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mb: 5,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "5%" }}>#</TableCell>
                      <TableCell style={{ width: "25%" }}>ФИО</TableCell>
                      <TableCell style={{ width: "20%" }}>Дата устройства на работу</TableCell>
                      <TableCell style={{ width: "20%" }}>Текущая организация</TableCell>
                      <TableCell style={{ width: "10%" }}>Общий стаж год/месяц</TableCell>
                      <TableCell style={{ width: "10%" }}>Должность</TableCell>
                      <TableCell style={{ width: "10%" }}>Статус мед. книжки</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.users.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell
                          onClick={this.openModal.bind(this, item.id, null)}
                          style={{ cursor: "pointer", fontWeight: 700 }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>{item.date_registration}</TableCell>
                        <TableCell>{item.point}</TableCell>
                        <TableCell>{item.exp}</TableCell>
                        <TableCell>{item.app_name}</TableCell>
                        <TableCell
                          style={{
                            background:
                              parseInt(item.type) == 0
                                ? "#fff"
                                : parseInt(item.type) == 1
                                  ? "#fff"
                                  : parseInt(item.type) == 2
                                    ? "#ffcc00"
                                    : "#c03",
                            color:
                              parseInt(item.type) == 1
                                ? "#000"
                                : parseInt(item.type) == 2
                                  ? "#000"
                                  : "#fff",
                          }}
                        >
                          {item?.status}
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

export default function Experience() {
  return <Experience_ />;
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
