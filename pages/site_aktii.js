import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Dropzone from "dropzone";

import {
  MyAutocomplite,
  MyDatePickerNew,
  MySelect,
  TextEditor,
  MyTextInput,
  MyCheckBox,
} from "@/ui/Forms";

import queryString from "query-string";

import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";

class SiteAktii_Modal extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://jacochef.ru/src/img/site_aktii/upload_img.php",
  };

  myDropzone = null;
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });

      console.log(this.props.item);

      setTimeout(() => {
        this.myDropzone = new Dropzone("#for_img_edit", this.dropzoneOptions);
      }, 300);
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.akcia[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeDateRange(data, event) {
    const item = this.state.item;

    item.akcia[data] = event ? event : "";

    this.setState({
      item,
    });
  }

  changeAutocomplite(data, event, value) {
    const item = this.state.item;

    item[data] = value;

    this.setState({
      item,
    });
  }

  changeItemText(data, value) {
    const item = this.state.item;

    item.akcia[data] = value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.akcia[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  async saveNew() {
    if (!this.click) {
      this.click = true;

      let item = this.state.item;

      item.akcia.promo_name = item.akcia.promo;
      item.akcia.items = item.akcia_items;

      item.akcia.start_date = dayjs(item.akcia.start_date).format("YYYY-MM-DD");
      item.akcia.end_date = dayjs(item.akcia.end_date).format("YYYY-MM-DD");

      const data = item.akcia;

      const res = await this.props.getData("save_new", data);

      if (res.st === false) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        if (this.myDropzone["files"].length > 0) {
          if (this.myDropzone["files"].length > 0 && this.isInit === false) {
            this.isInit = true;

            this.myDropzone.on("sending", (file, xhr, data) => {
              data.append("name", item.akcia.name);
              data.append("id", res.id);
              data.append("img_type", "full");
            });

            this.myDropzone.on("queuecomplete", (data) => {
              var check_img = false;

              this.myDropzone["files"].map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: "Ошибка при загрузке фотографии",
                });

                return;
              } else {
                setTimeout(() => {
                  this.onClose(true);
                }, 1000);
              }

              this.isInit = false;
            });
          }

          this.myDropzone.processQueue();
        } else {
          this.onClose(true);
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  async saveEdit() {
    if (!this.click) {
      this.click = true;

      let item = this.state.item;

      item.akcia.promo_name = item.akcia.promo;
      item.akcia.items = item.akcia_items;

      item.akcia.start_date = dayjs(item.akcia.start_date).format("YYYY-MM-DD");
      item.akcia.end_date = dayjs(item.akcia.end_date).format("YYYY-MM-DD");

      const data = item.akcia;

      const res = await this.props.getData("save_edit", data);

      if (res.st === false) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        if (this.myDropzone["files"].length > 0) {
          if (this.myDropzone["files"].length > 0 && this.isInit === false) {
            this.isInit = true;

            this.myDropzone.on("sending", (file, xhr, data) => {
              data.append("name", item.akcia.name);
              data.append("id", item.akcia.id);
              data.append("img_type", "full");
            });

            this.myDropzone.on("queuecomplete", (data) => {
              var check_img = false;

              this.myDropzone["files"].map((item, key) => {
                if (item["status"] == "error") {
                  check_img = true;
                }
              });

              if (check_img) {
                this.setState({
                  openAlert: true,
                  err_status: false,
                  err_text: "Ошибка при загрузке фотографии",
                });

                return;
              } else {
                setTimeout(() => {
                  this.onClose(true);
                }, 1000);
              }

              this.isInit = false;
            });
          }

          this.myDropzone.processQueue();
        } else {
          this.onClose(true);
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }
  }

  onClose(is_reload = false) {
    this.props.onClose(is_reload);
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
          onClose={this.onClose.bind(this, false)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={"xl"}
        >
          <DialogTitle className="button">
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : null}
          </DialogTitle>

          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
          >
            <CloseIcon />
          </IconButton>

          {!this.state.item ? null : (
            <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
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
                  <MyTextInput
                    label="Название акции"
                    value={this.state.item ? this.state.item.akcia.name : ""}
                    func={this.changeItem.bind(this, "name")}
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
                    label="Город"
                    data={this.state.item ? this.state.item.cities : []}
                    value={this.state.item ? this.state.item.akcia.city_id : ""}
                    func={this.changeItem.bind(this, "city_id")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата старта"
                    value={this.state.item ? dayjs(this.state.item.akcia.start_date) : ""}
                    func={this.changeDateRange.bind(this, "start_date")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата окончания"
                    value={this.state.item ? dayjs(this.state.item.akcia.end_date) : ""}
                    func={this.changeDateRange.bind(this, "end_date")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: this.props.mark === "editAction" ? 10 : 12,
                  }}
                >
                  <MyAutocomplite
                    label="Товары участвующие в акции"
                    multiple={true}
                    data={
                      this.state.item
                        ? this.state.item.all_items
                          ? this.state.item.all_items
                          : this.state.item.items
                        : []
                    }
                    value={this.state.item ? this.state.item.akcia_items : []}
                    func={this.changeAutocomplite.bind(this, "akcia_items")}
                  />
                </Grid>

                {this.props.mark === "editAction" ? (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <MyCheckBox
                      label="Активность"
                      value={
                        this.state.item
                          ? parseInt(this.state.item.akcia.is_show) == 1
                            ? true
                            : false
                          : false
                      }
                      func={this.changeItemChecked.bind(this, "is_show")}
                    />
                  </Grid>
                ) : null}

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h6"
                  >
                    Картинка соотношением 1:1 (например: 750x750) только JPG
                  </Typography>

                  {!this.state.item || this.state.item.akcia.img_new.length == 0 ? null : (
                    <img
                      style={{ maxHeight: 150 }}
                      src={`https://storage.yandexcloud.net/site-aktii/${this.state.item.akcia.img_new}750х750.jpg`}
                    />
                  )}

                  <div
                    className="dropzone"
                    id="for_img_edit"
                    style={{ width: "100%", minHeight: 150 }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Заголовок акции"
                    value={this.state.item ? this.state.item.akcia.promo_title : ""}
                    func={this.changeItem.bind(this, "promo_title")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Промокод"
                    value={this.state.item ? this.state.item.akcia.promo : ""}
                    func={this.changeItem.bind(this, "promo")}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TextEditor
                    value={this.state.item ? this.state.item.akcia.text : ""}
                    func={this.changeItemText.bind(this, "text")}
                  />
                </Grid>
              </Grid>
            </DialogContent>
          )}
          <DialogActions>
            <Button
              variant="contained"
              onClick={
                this.props.mark == "editAction" ? this.saveEdit.bind(this) : this.saveNew.bind(this)
              }
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class SiteAktii_ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "site_aktii",
      module_name: "",
      is_load: false,

      cities: [],
      city: {
        id: "-1",
        name: "Все города",
      },

      active: [],
      non_active: [],

      openAlert: false,
      err_status: true,
      err_text: "",

      fullScreen: false,

      modalDialog: false,
      method: "",
      mark: "",
      item: null,
      itemName: "",

      itemNew: {
        promo_title: "",
        city_id: "",
        type: "1",
        start_date: formatDate(new Date()),
        end_date: formatDate(new Date()),
        format: "2",
        name: "",
        text: "",
        promo: "",
        img_new: "",
      },
    };
  }

  async componentDidMount() {
    const city = {
      city_id: this.state.city.id,
    };

    const data = await this.getData("get_all", city);

    this.setState({
      active: data.active,
      cities: data.cities,
      non_active: data.non_active,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch("https://jacochef.ru/api/index_new.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == "redir") {
          window.location.pathname = "/";
          return;
        }

        if (json.st === false && json.type == "auth") {
          window.location.pathname = "/auth";
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

  changeCity(event, value) {
    this.setState({
      city: value,
    });

    setTimeout(() => {
      this.update();
    }, 300);
  }

  copyLink(item) {
    const link = `https://jacofood.ru/${item.link}/akcii?act_${item.id}`;

    navigator.clipboard
      .writeText(link)
      .then(() => {
        this.setState({
          openAlert: true,
          err_status: true,
          err_text: "Ссылка успешно скопирована!",
        });
      })
      .catch((err) => {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: `Ошибка: ${err}`,
        });
      });
  }

  async changeSort(data, status, it, event) {
    if (status === "active") {
      const active = this.state.active;

      active.forEach((item) => {
        if (item.id === it.id) {
          item[data] = event.target.value;
        }
      });
      this.setState({
        active,
      });
    }

    if (status === "nonActive") {
      const non_active = this.state.non_active;

      non_active.forEach((item) => {
        if (item.id === it.id) {
          item[data] = event.target.value;
        }
      });
      this.setState({
        non_active,
      });
    }

    const item = {
      id: it.id,
      sort: event.target.value,
      is_show: it.is_show,
    };

    await this.getData("save_sort", item);

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async changeChecked(data, status, it, event) {
    if (status === "active") {
      const active = this.state.active;

      active.forEach((item) => {
        if (item.id === it.id) {
          item[data] = event.target.checked === true ? 1 : 0;
        }
      });
      this.setState({
        active,
      });
    }

    if (status === "nonActive") {
      const non_active = this.state.non_active;

      non_active.forEach((item) => {
        if (item.id === it.id) {
          item[data] = event.target.checked === true ? 1 : 0;
        }
      });
      this.setState({
        non_active,
      });
    }

    const item = {
      id: it.id,
      sort: it.sort,
      is_show: event.target.checked === true ? 1 : 0,
    };

    await this.getData("save_sort", item);

    setTimeout(() => {
      this.update();
    }, 300);
  }

  async openModal(mark, method, id) {
    this.handleResize();

    if (mark === "newAсtion") {
      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData("get_all_for_new");

      item.akcia = itemNew;

      item.akcia_items = [];

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === "editAction") {
      const data = {
        id,
      };

      const item = await this.getData("get_one", data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.akcia.name,
      });
    }
  }

  async update() {
    const city = {
      city_id: this.state.city.id,
    };

    const data = await this.getData("get_all", city);

    this.setState({
      active: data.active,
      non_active: data.non_active,
    });
  }

  onCloseModal(is_reload = false) {
    this.setState({
      modalDialog: false,
      itemName: "",
    });

    if (is_reload) {
      this.update();
    }
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
        <SiteAktii_Modal
          open={this.state.modalDialog}
          onClose={this.onCloseModal.bind(this)}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          getData={this.getData.bind(this)}
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
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Город"
              multiple={false}
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
            <Button
              onClick={this.openModal.bind(this, "newAсtion", "Новая акция")}
              variant="contained"
            >
              Добавить акцию
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "5%" }}>#</TableCell>
                    <TableCell style={{ width: "20%" }}>Название</TableCell>
                    <TableCell style={{ width: "5%" }}></TableCell>
                    <TableCell style={{ width: "10%" }}>Сорт</TableCell>
                    <TableCell style={{ width: "15%" }}>Город</TableCell>
                    <TableCell style={{ width: "15%" }}>Дата старта</TableCell>
                    <TableCell style={{ width: "15%" }}>Дата окончания</TableCell>
                    <TableCell style={{ width: "15%" }}>Активность</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.active.map((item, key) => (
                    <TableRow
                      key={key}
                      hover
                    >
                      <TableCell>{key + 1}</TableCell>
                      <TableCell
                        onClick={this.openModal.bind(
                          this,
                          "editAction",
                          "Редактирование акции",
                          item.id,
                        )}
                        style={{ fontWeight: 700, cursor: "pointer" }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <ContentCopyIcon
                          onClick={this.copyLink.bind(this, item)}
                          style={{ cursor: "pointer" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                          }}
                        >
                          <MyTextInput
                            value={item.sort}
                            func={this.changeSort.bind(this, "sort", "active", item)}
                          />
                        </Grid>
                      </TableCell>
                      <TableCell>{item.city_name}</TableCell>
                      <TableCell>{item.start_date}</TableCell>
                      <TableCell>{item.end_date}</TableCell>
                      <TableCell>
                        <MyCheckBox
                          value={parseInt(item.is_show) == 1 ? true : false}
                          func={this.changeChecked.bind(this, "is_show", "active", item)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid
            style={{ marginBottom: "40px" }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{ fontWeight: 700 }}>Законченные</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ width: "100%", overflow: "scroll" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "5%" }}>#</TableCell>
                      <TableCell style={{ width: "20%" }}>Название</TableCell>
                      <TableCell style={{ width: "5%" }}></TableCell>
                      <TableCell style={{ width: "10%" }}>Сорт</TableCell>
                      <TableCell style={{ width: "15%" }}>Город</TableCell>
                      <TableCell style={{ width: "15%" }}>Дата старта</TableCell>
                      <TableCell style={{ width: "15%" }}>Дата окончания</TableCell>
                      <TableCell style={{ width: "15%" }}>Активность</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.non_active.map((item, key) => (
                      <TableRow
                        key={key}
                        hover
                      >
                        <TableCell>{key + 1}</TableCell>
                        <TableCell
                          onClick={this.openModal.bind(
                            this,
                            "editAction",
                            "Редактирование акции",
                            item.id,
                          )}
                          style={{ fontWeight: 700, cursor: "pointer" }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <ContentCopyIcon
                            onClick={this.copyLink.bind(this, item)}
                            style={{ cursor: "pointer" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Grid
                            size={{
                              xs: 12,
                              sm: 6,
                            }}
                          >
                            <MyTextInput
                              value={item.sort}
                              func={this.changeSort.bind(this, "sort", "nonActive", item)}
                            />
                          </Grid>
                        </TableCell>
                        <TableCell>{item.city_name}</TableCell>
                        <TableCell>{item.start_date}</TableCell>
                        <TableCell>{item.end_date}</TableCell>
                        <TableCell>
                          <MyCheckBox
                            value={parseInt(item.is_show) == 1 ? true : false}
                            func={this.changeChecked.bind(this, "is_show", "nonActive", item)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SiteAktii() {
  return <SiteAktii_ />;
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
