import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { ExlIcon } from "@/ui/icons";

import { MySelect, MyTextInput, MyDatePickerNew } from "@/ui/Forms";

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import { api_laravel } from "@/src/api_new";

import axios from "axios";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";

// ---------- Вспомогательные функции для переключения Табов ----------

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

// ---------- Модальное окно Скачать/Загрузить файл XLS ----------
class SitePriceLevel_Modal_XLS extends React.Component {
  render() {
    const { onClose, open, fullScreen, downLoad, uploadFile, input_value } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"sm"}
      >
        <DialogTitle className="button">
          Скачать/Загрузить файл XLS
          <IconButton
            onClick={onClose}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            <Grid
              x={{ display: "flex", alignItems: "center" }}
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Tooltip
                title={<Typography color="inherit">{"Скачать шаблон таблицы в Excel"}</Typography>}
              >
                <IconButton
                  disableRipple
                  sx={{ padding: 0 }}
                  onClick={downLoad}
                >
                  <ExlIcon />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid
              className="button_import"
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Button
                variant="contained"
                component="label"
                style={{ whiteSpace: "nowrap" }}
              >
                Загрузить файл xls
                <input
                  type="file"
                  hidden
                  onChange={uploadFile}
                  value={input_value}
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Модальное окно Добавить новый уровень цен ----------
class SitePriceLevel_Modal_New extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;
    const val = event.target.value;
    item.level[data] = val === "none" ? "" : val;
    this.setState({ item });
  }

  changeDateRange(data, event) {
    const item = this.state.item;

    item.level[data] = event ? event : "";

    this.setState({
      item,
    });
  }

  save() {
    let item = this.state.item;
    item = item.level;

    if (!item.city_id || item.city_id === "none") {
      this.props.openAlert(false, "Необходимо выбрать город");
      return;
    }

    if (!item.name) {
      this.props.openAlert(false, "Необходимо указать название");
      return;
    }

    if (!item.date_start) {
      this.props.openAlert(false, "Необходимо указать дату");
      return;
    }

    const date_now = dayjs();
    const date_start = dayjs(item.date_start);

    if (date_start.isBefore(date_now, "day")) {
      this.props.openAlert(false, "Необходимо указать сегодняшнюю или будущую дату");
      return;
    }

    item.date_start = dayjs(item.date_start).format("YYYY-MM-DD");

    this.props.save(item);

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
        maxWidth={"md"}
      >
        <DialogTitle className="button">
          {this.props.method}
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MySelect
                label="Город"
                data={this.state.item ? this.state.item?.cities : []}
                value={
                  this.state.item
                    ? this.state.item.level.city_id
                      ? String(this.state.item.level.city_id)
                      : "none"
                    : "none"
                }
                func={this.changeItem.bind(this, "city_id")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Название"
                value={this.state.item ? this.state.item?.level?.name : ""}
                func={this.changeItem.bind(this, "name")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyDatePickerNew
                label="Дата старта"
                value={dayjs(this.state.item?.level?.date_start)}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={this.save.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Таб Динамика ----------
class StatSale_Tab_Dynamic extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      city: "",

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      columns: [],
      cats: [],
    };
  }

  changeCity = (event) => {
    this.setState({ city: event.target.value });
  };

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDate(data),
    });
  }

  get_data_dynamic = async () => {
    let { city, date_start, date_end } = this.state;

    if (!city) {
      this.props.openAlert(false, "Необходимо выбрать город");

      return;
    }

    const data = {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      city,
    };

    const res = await this.props.getData("get_data_dynamic", data);

    if (res.st) {
      this.setState({
        columns: res.columns,
        cats: res.cats,
      });
    } else {
      this.props.openAlert(false, res.text);

      this.setState({
        columns: [],
        cats: [],
      });
    }
  };

  downLoad = async () => {
    let { city, date_start, date_end } = this.state;

    if (!city) {
      this.props.openAlert(false, "Необходимо выбрать город");
      return;
    }

    date_start = dayjs(date_start).format("YYYY-MM-DD");
    date_end = dayjs(date_end).format("YYYY-MM-DD");

    const data = {
      date_start,
      date_end,
      city,
    };

    const dop_type = {
      responseType: "blob",
    };

    const res = await this.props.getData("export_file_xls_dynamic", data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Динамика цен за период ${date_start}_${date_end}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  render() {
    const { activeTab, cities } = this.props;
    const { columns, cats, city, date_start, date_end } = this.state;

    const columnsCount = columns.length ?? 0;
    const totalCols = 2 + columnsCount;

    return (
      <Grid size={12}>
        <TabPanel
          value={activeTab}
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
              <MyDatePickerNew
                label="Дата от"
                value={date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                value={date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MySelect
                is_none={false}
                data={cities}
                value={city}
                func={this.changeCity}
                label="Город"
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
                onClick={this.get_data_dynamic}
              >
                Показать
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Button
                variant={!(columns.length && cats.length) ? "outlined" : "contained"}
                onClick={this.downLoad}
                disabled={!(columns.length && cats.length)}
              >
                Скачать таблицу в XLS
              </Button>
            </Grid>

            {columns.length && cats.length ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                sx={{
                  mt: 3,
                  mb: 5,
                }}
              >
                <TableContainer
                  sx={{ maxHeight: 650, maxWidth: "100%", overflow: "auto", p: 0, m: 0 }}
                >
                  <Table
                    size="small"
                    sx={{
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      "& .MuiTableCell-root": { textAlign: "center", whiteSpace: "nowrap" },
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#fff" }}
                      >
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            zIndex: 98,
                            backgroundColor: "#fff",
                            borderLeft: "none",
                            minWidth: 50,
                            width: 50,
                          }}
                        >
                          ID Товара
                        </TableCell>

                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 104,
                            zIndex: 95,
                            backgroundColor: "#fff",
                            borderLeft: "none",
                            minWidth: 200,
                            width: 400,
                          }}
                        >
                          Название
                        </TableCell>

                        {columns.map((col) => (
                          <TableCell
                            key={col.id}
                            sx={{ minWidth: 120 }}
                          >
                            {col.name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cats.map((cat) => {
                        if (!cat.items || cat.items.length === 0) return null;

                        return (
                          <React.Fragment key={cat.id}>
                            <TableRow>
                              <TableCell
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#f5f5f5",
                                  position: "sticky",
                                  left: 0,
                                  zIndex: 80,
                                }}
                              />
                              <TableCell
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#f5f5f5",
                                  position: "sticky",
                                  left: 104,
                                  zIndex: 80,
                                }}
                              >
                                {cat.name}
                              </TableCell>
                              <TableCell
                                colSpan={totalCols}
                                sx={{ backgroundColor: "#f5f5f5" }}
                              />
                            </TableRow>

                            {cat.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell
                                  sx={{
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 70,
                                    backgroundColor: "#fff",
                                    borderLeft: "none",
                                    minWidth: 50,
                                    width: 50,
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.id}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    position: "sticky",
                                    left: 104,
                                    zIndex: 69,
                                    backgroundColor: "#fff",
                                    borderLeft: "none",
                                    minWidth: 200,
                                    width: 400,
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.name}
                                </TableCell>

                                {item.prices.map((price, idx) => {
                                  const cellColor = item.price_colors?.[idx] ?? null;
                                  return (
                                    <TableCell
                                      key={idx}
                                      sx={{
                                        minWidth: 120,
                                        ...(cellColor
                                          ? { backgroundColor: cellColor, fontWeight: "bold" }
                                          : {}),
                                      }}
                                    >
                                      {price ?? "0"}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ) : null}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таб Уровни цен ----------
class SitePriceLevel_Tab_Level extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_load: false,
      city: "",
      modalDialog: false,
      modalDialog_XLS: false,
      confirmDialog: false,
      method: "",
      item: null,
      delete_level: null,
      input_value: "",
      itemNew: {
        name: "",
        date_start: formatDate(new Date()),
        city_id: "",
      },
      levels: [],
      levelsCopy: [],
    };

    this.changeCity = this.changeCity.bind(this);
    this.openModal = this.openModal.bind(this);
    this.save = this.save.bind(this);
    //this.getOneLevel = this.getOneLevel.bind(this);
    this.downLoad = this.downLoad.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.delete_level = this.delete_level.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.levels !== prevProps.levels) {
      this.setState({
        levels: this.props.levels,
        levelsCopy: this.props.levels,
        city: this.props.cities && this.props.cities.length > 0 ? this.props.cities[0].id : "",
      });
    }
  }

  changeCity(event) {
    const selectedCity = event.target.value;

    const { levelsCopy } = this.state;

    const filteredLevels = levelsCopy.filter((level) => {
      if (parseInt(selectedCity) === -1) return true;

      return parseInt(level.city_id) === parseInt(selectedCity) || parseInt(level.city_id) === -1;
    });

    this.setState({
      city: selectedCity,
      levels: filteredLevels,
    });
  }

  async openModal(method) {
    if (this.props.handleResize) {
      this.props.handleResize();
    }

    const itemNewCopy = { ...this.state.itemNew };

    const item = await this.props.getData("get_all_for_new");

    item.level = itemNewCopy;

    this.setState({
      modalDialog: true,
      method,
      item,
    });
  }

  async save(item) {
    const data = {
      name: item.name,
      date_start: item.date_start,
      city_id: item.city_id,
      type: "new",
    };

    const res = await this.props.getData("save_new", data);

    if (!res.st) {
      this.props.openAlert(res.st, res.text);
    } else {
      const link = document.createElement("a");
      link.href = `/site_price_lavel/${res?.level_id}`;
      link.target = "_blank";
      link.click();

      setTimeout(() => {
        this.props.update();
      }, 100);
    }
  }

  // getOneLevel(level_id) {

  //   const link = document.createElement('a');
  //   link.href = `/site_price_lavel/${level_id}`
  //   link.target = '_blank'
  //   link.click();

  // }

  async downLoad() {
    this.setState({ modalDialog_XLS: false });

    const dop_type = {
      responseType: "blob",
    };

    const res = await this.props.getData("export_file_xls", {}, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Уровень цен (форма для заполнения).xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async uploadFile({ target }) {
    const file = target.files[0];
    if (!file) {
      return;
    }

    this.setState({
      modalDialog_XLS: false,
      input_value: "",
      is_load: true,
    });

    let formData = new FormData();

    //const urlApi_dev = 'http://127.0.0.1:8000/api/site_price_lavel/import_file_xls';
    const urlApi_dev = "https://apichef.jacochef.ru/api/site_price_lavel/import_file_xls";

    formData.append("file", file);
    formData.append("login", localStorage.getItem("token"));
    formData.append("method", "import_file_xls");
    formData.append("module", "site_price_lavel");

    try {
      const response = await axios.post(urlApi_dev, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = response.data.data;

      this.props.openAlert(res.st, res.text);

      if (res.st) {
        setTimeout(() => {
          this.props.update();
        }, 100);
      }
    } catch (error) {
      // console.error('Ошибка загрузки файла', error);
      this.props.openAlert(false, "Ошибка загрузки файла");
    } finally {
      this.setState({
        is_load: false,
      });
    }
  }

  async delete_level() {
    const level = this.state.delete_level;

    const data = {
      date_start: level.date_start,
      level_id: level.id,
    };

    const res = await this.props.getData("delete_level", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      this.setState({
        is_load: false,
        confirmDialog: false,
        delete_level: null,
      });

      setTimeout(() => {
        this.props.update();
      }, 100);
    } else {
      this.setState({
        is_load: false,
      });
    }
  }

  render() {
    const { activeTab, cities, acces, fullScreen, openAlert } = this.props;
    const {
      levels,
      city,
      is_load,
      confirmDialog,
      modalDialog,
      modalDialog_XLS,
      method,
      item,
      input_value,
    } = this.state;

    return (
      <>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false, delete_level: null })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            <Typography>Вы действительно хотите удалить данный уровень цен?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false, delete_level: null })}
            >
              Отмена
            </Button>
            <Button onClick={this.delete_level}>Удалить</Button>
          </DialogActions>
        </Dialog>
        <SitePriceLevel_Modal_New
          open={modalDialog}
          onClose={() => this.setState({ modalDialog: false })}
          method={method}
          item={item}
          save={this.save}
          fullScreen={fullScreen}
          openAlert={openAlert}
        />
        <SitePriceLevel_Modal_XLS
          open={modalDialog_XLS}
          onClose={() => this.setState({ modalDialog_XLS: false })}
          uploadFile={this.uploadFile}
          downLoad={this.downLoad}
          fullScreen={fullScreen}
          input_value={input_value}
        />
        <Backdrop
          style={{ zIndex: 999 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid
          size={12}
          sx={{
            mb: 10,
          }}
        >
          <TabPanel
            value={activeTab}
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
                  sm: 4,
                }}
              >
                <MySelect
                  is_none={false}
                  data={cities}
                  value={city}
                  func={this.changeCity}
                  label="Город"
                />
              </Grid>

              {parseInt(acces?.add_level_access) ? (
                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <Button
                    onClick={() => this.openModal("Новый уровень цен")}
                    variant="contained"
                  >
                    Добавить
                  </Button>
                </Grid>
              ) : null}

              {parseInt(acces?.get_excel_access) ? (
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <Button
                    onClick={() => this.setState({ modalDialog_XLS: true })}
                    variant="contained"
                  >
                    Скачать/Загрузить файл XLS
                  </Button>
                </Grid>
              ) : null}

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell style={{ width: "3%" }}>#</TableCell>
                        <TableCell style={{ width: "25%" }}>Наименование</TableCell>
                        <TableCell style={{ width: "18%" }}>Дата старта</TableCell>
                        <TableCell style={{ width: "18%" }}>Город</TableCell>
                        <TableCell style={{ width: "18%" }}>Редактировать / Просмотр</TableCell>
                        <TableCell style={{ width: "18%" }}>Удалить</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {levels.map((level, index) => (
                        <TableRow
                          hover
                          key={index}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{level.name}</TableCell>
                          <TableCell>{level.date_start}</TableCell>
                          <TableCell>{level.city_name}</TableCell>

                          <TableCell>
                            <a
                              href={"/site_price_lavel/" + level.id}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconButton /*onClick={() => this.getOneLevel(level.id)}*/>
                                {parseInt(acces?.edit_level_access) ? (
                                  <Tooltip
                                    title={<Typography color="inherit">Редактировать</Typography>}
                                  >
                                    <EditIcon />
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    title={<Typography color="inherit">Просмотр</Typography>}
                                  >
                                    <VisibilityIcon />
                                  </Tooltip>
                                )}
                              </IconButton>
                            </a>
                          </TableCell>

                          <TableCell>
                            {parseInt(acces?.delete_level_acceess) && level?.delete ? (
                              <IconButton
                                onClick={() =>
                                  this.setState({ confirmDialog: true, delete_level: level })
                                }
                              >
                                <CloseIcon />
                              </IconButton>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>
        </Grid>
      </>
    );
  }
}

// ---------- Стартовая / Основной компонент ----------
class SitePriceLevel_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "site_price_lavel",
      module_name: "",
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      cities: [],
      fullScreen: false,

      levels: [],

      acces: null,
      activeTab: 0,
    };
  }

  async componentDidMount() {
    this.update();
  }

  getData = (method, data = {}, dop_type = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data, dop_type)
      .then((result) => {
        if (method === "export_file_xls" || method === "export_file_xls_dynamic") {
          return result;
        } else {
          return result.data;
        }
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  handleResize = () => {
    this.setState({ fullScreen: window.innerWidth < 601 });
  };

  update = async () => {
    try {
      const data = await this.getData("get_all");

      if (data && data.levels) {
        const updatedLevels = data.levels.map((level) => {
          const date_now = dayjs();
          const date_start = dayjs(level.date_start);

          return {
            ...level,
            delete: date_start.isAfter(date_now, "day"),
            edit: !date_start.isBefore(date_now, "day"),
          };
        });

        this.setState({
          cities: data.cities || [],
          levels: updatedLevels,
          acces: data.acces,
          module_name: data.module_info?.name || "",
        });

        if (data.module_info?.name) {
          document.title = data.module_info.name;
        }
      }
    } catch (error) {
      this.openAlert(false, "Ошибка обновления данных. Попробуйте позже.");
    }
  };

  changeTab = (event, val) => {
    if (parseInt(val) === 0) this.update();

    this.setState({ activeTab: val });
  };

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  render() {
    const {
      is_load,
      openAlert,
      err_status,
      err_text,
      module_name,
      activeTab,
      fullScreen,
      cities,
      levels,
      acces,
    } = this.state;

    const cities_city = cities.filter((city) => city.id !== -1);

    return (
      <>
        <Backdrop
          style={{ zIndex: 999 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
          }}
        >
          <Grid size={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            style={{ paddingBottom: 24 }}
            size={12}
          >
            <Paper>
              <Tabs
                value={activeTab}
                onChange={this.changeTab}
                variant={fullScreen ? "scrollable" : "fullWidth"}
                scrollButtons={false}
              >
                <Tab
                  label="Уровни цен"
                  {...a11yProps(0)}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                ></Tab>
                <Tab
                  label="Динамика"
                  {...a11yProps(1)}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                />
              </Tabs>
            </Paper>
          </Grid>

          {/* Уровни цен */}
          {activeTab === 0 && (
            <SitePriceLevel_Tab_Level
              activeTab={activeTab}
              fullScreen={fullScreen}
              cities={cities}
              openAlert={this.openAlert}
              getData={this.getData}
              levels={levels}
              acces={acces}
              handleResize={this.handleResize}
              update={this.update}
            />
          )}
          {/* /Уровни цен */}

          {/* Динамика */}
          {activeTab === 1 && (
            <StatSale_Tab_Dynamic
              activeTab={activeTab}
              fullScreen={fullScreen}
              cities={cities_city}
              openAlert={this.openAlert}
              getData={this.getData}
            />
          )}
          {/* /Динамика */}
        </Grid>
      </>
    );
  }
}

export default function SitePriceLevel() {
  return <SitePriceLevel_ />;
}
