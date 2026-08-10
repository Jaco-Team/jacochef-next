import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Dropzone from "dropzone";

import { MyTextInput, MySelect } from "@/ui/Forms";

import queryString from "query-string";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

class ItemsPr_TableStat extends React.Component {
  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={3}>
              <h2>Статистика</h2>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Разыграно</TableCell>
            <TableCell>Осталось</TableCell>
            <TableCell>Воспользовалось</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell style={{ width: "33%" }}>{this.props.stat.prize}</TableCell>
            <TableCell style={{ width: "33%" }}>{this.props.stat.no_prize}</TableCell>
            <TableCell style={{ width: "33%" }}>{this.props.stat.count_promo}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}

class AppWorkTable extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.items;
    var array2 = this.props.items;

    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      });

    return !is_same;
  }

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>
              <h2>Призы</h2>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Наименование</TableCell>
            <TableCell>Компания</TableCell>
            <TableCell>Сертификат</TableCell>
            <TableCell>Победитель</TableCell>
            {/* <TableCell>Фото</TableCell>
            <TableCell>%</TableCell> */}
          </TableRow>
        </TableHead>

        <TableBody>
          {this.props.items.map((item, key) => (
            <TableRow key={key}>
              <TableCell
                onClick={this.props.openWork.bind(this, item.id)}
                style={{ color: "#c03", cursor: "pointer", fontWeight: "bold", width: "15%" }}
              >
                {item.name}
              </TableCell>
              <TableCell style={{ width: "30%" }}>{item.company}</TableCell>
              <TableCell style={{ width: "35%" }}>{item.about}</TableCell>
              <TableCell style={{ width: "20%" }}>{item.login}</TableCell>
              {/* <TableCell>
              <img 
                  src={"https://storage.yandexcloud.net/site-other-data/"+item.logo_src+"_512x512.jpg"} 
                  style={{ width: 100, height: 'auto' }}
                />
              </TableCell>
              <TableCell>{item.percent}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

class ItemsPr_ extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://jacochef.ru/src/img/site_img/upload_img_other.php",
  };
  myDropzoneNew = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "items_pr",
      module_name: "",
      is_load: false,

      items: [],
      items_min: [],
      modalDialog: false,
      modalDialogNew: false,

      itemsEdit: null,
      nameWork: "",

      itemsNew: null,

      stat: null,
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      items: data.items,
      stat: data.stat,
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
        this.setState({
          is_load: false,
        });
      });
  };

  async saveEdit() {
    let itemsEdit = this.state.itemsEdit;

    let data = {
      item: itemsEdit.item,
    };

    let res = await this.getData("save_edit", data);

    console.log(res);

    if (res.st === false) {
      alert(res.text);
    } else {
      if (this.myDropzoneNew["files"].length > 0) {
        if (this.myDropzoneNew["files"].length > 0) {
          let name = this.state.itemsEdit.item.name,
            id = res.id,
            type = "new";

          this.myDropzoneNew.on("sending", (file, xhr, data) => {
            let file_type = file.name.split(".");
            file_type = file_type[file_type.length - 1];
            file_type = file_type.toLowerCase();

            data.append("typeFile", type);
            data.append("name", name);
            data.append("id", id);
          });

          this.myDropzoneNew.on("queuecomplete", (data) => {
            var check_img = false;

            this.myDropzoneNew["files"].map((item, key) => {
              if (item["status"] == "error") {
                check_img = true;
              }

              if (item["status"] == "success") {
                this.setState({
                  modalDialog: false,
                  itemsEdit: null,
                  nameWork: "",
                });

                this.getItems();
              }
            });

            if (check_img) {
              alert("Ошибка при загрузке фотографии " + type);
            }
          });
        }

        this.myDropzoneNew.processQueue();
      } else {
        this.setState({
          modalDialog: false,
          itemsEdit: null,
          nameWork: "",
        });

        this.getItems();
      }
    }
  }

  async getItems() {
    let data = await this.getData("get_all");

    this.setState({
      items: data.items,
    });
  }

  async openWork(id) {
    let data = {
      id: id,
    };

    let res = await this.getData("get_one", data);

    this.setState({
      itemsEdit: res,
      modalDialog: true,
      nameWork: res.item.name,
    });

    setTimeout(() => {
      this.myDropzoneNew = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
    }, 300);
  }

  async openNewWork() {
    let data = {
      id: 0,
    };

    let res = await this.getData("get_one", data);

    this.setState({
      itemsEdit: res,
      modalDialog: true,
      nameWork: res.item.name,
    });

    setTimeout(() => {
      this.myDropzoneNew = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
    }, 300);
  }

  chengeItem(type, event) {
    let data = event.target.value;
    let item = this.state.itemsEdit;

    item.item[[type]] = data;

    this.setState({
      itemsEdit: item,
    });
  }

  async changeCheck(key, type, event) {
    let items = this.state.items;

    items[key][[type]] = event.target.checked ? 1 : 0;

    let data = {
      type: type,
      value: event.target.checked ? 1 : 0,
      id: items[key].id,
    };

    let res = await this.getData("save_check", data);

    this.setState({
      items: items,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {!this.state.itemsEdit ? null : (
          <Dialog
            open={this.state.modalDialog}
            maxWidth={"md"}
            onClose={() => {
              this.setState({
                modalDialog: false,
                itemsEdit: null,
                nameWork: "",
              });
            }}
          >
            <DialogTitle>
              {parseInt(this.state.itemsEdit.item.id) == 0
                ? "Создание приза"
                : "Приз " + this.state.nameWork}
              <IconButton
                onClick={() => {
                  this.setState({
                    modalDialog: false,
                    itemsEdit: null,
                    nameWork: "",
                  });
                }}
                style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent style={{ paddingTop: 10 }}>
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
                  <MyTextInput
                    value={this.state.itemsEdit.item.name}
                    func={this.chengeItem.bind(this, "name")}
                    label="Название приза (для внутреннего использования)"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <MyTextInput
                    value={this.state.itemsEdit.item.about}
                    func={this.chengeItem.bind(this, "about")}
                    label="На что сертификат"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    value={this.state.itemsEdit.item.company}
                    func={this.chengeItem.bind(this, "company")}
                    label="Название компании"
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
                    data={this.state.itemsEdit.city_list}
                    value={this.state.itemsEdit.item.city_id}
                    func={this.chengeItem.bind(this, "city_id")}
                    label="Город"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    value={this.state.itemsEdit.item.date_end}
                    func={this.chengeItem.bind(this, "date_end")}
                    label="Действует до"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    value={this.state.itemsEdit.item.promo}
                    func={this.chengeItem.bind(this, "promo")}
                    label="Промокод"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    type="number"
                    value={this.state.itemsEdit.item.percent}
                    func={this.chengeItem.bind(this, "percent")}
                    label="Процент выйгрыша"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <span>Картинка соотношением сторон (1:1) (пример: 512х512) только JPG</span>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      {this.state.itemsEdit.item.logo_src.length > 0 ? (
                        <img
                          src={
                            "https://storage.yandexcloud.net/site-other-data/" +
                            this.state.itemsEdit.item.logo_src +
                            "_512x512.jpg"
                          }
                          style={{ width: 300, height: "auto" }}
                        />
                      ) : (
                        <div style={{ maxWidth: 300, maxHeight: 300 }} />
                      )}
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <div
                        className="dropzone"
                        id="for_img_edit_new"
                        style={{ width: "100%", minHeight: 150 }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={this.saveEdit.bind(this)}
              >
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        )}
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
            <Button
              variant="contained"
              color="primary"
              onClick={this.openNewWork.bind(this)}
            >
              Добавить приз
            </Button>
          </Grid>

          {/* таблица_статистика */}
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{
              mb: 5,
            }}
          >
            {!this.state.stat ? null : <ItemsPr_TableStat stat={this.state.stat} />}
          </Grid>

          {/* таблица_призы */}
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            {this.state.items.length > 0 ? (
              <AppWorkTable
                items={this.state.items}
                openWork={this.openWork.bind(this)}
                changeCheck={this.changeCheck.bind(this)}
              />
            ) : null}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function ItemsPr() {
  return <ItemsPr_ />;
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
