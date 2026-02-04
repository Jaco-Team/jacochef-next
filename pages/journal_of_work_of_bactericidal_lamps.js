import React, { Fragment } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyDatePickerNewViews } from "@/ui/Forms";

import { api_laravel } from "@/src/api_new";
// import { api_laravel_local as api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import "dayjs/locale/ru"; // импортируем русскую локаль
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import TestAccess from "@/ui/TestAccess";
import MyAlert from "@/ui/MyAlert";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import Lamps_Modal_Add_Active from "@/components/journal_of_work_of_bactericidal_lamps/Lamps_Modal_Add_Active";
import Lamps_Modal_Add from "@/components/journal_of_work_of_bactericidal_lamps/Lamps_Modal_Add";
import { Paper } from "@mui/material";

class Journal_of_work_of_bactericidal_lamps_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "journal_of_work_of_bactericidal_lamps",
      module_name: "",
      access: null,
      is_load: false,

      points: [],
      point: "0",

      type: "",
      pointModal: "",
      fullScreen: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      modalAddLamp: false,
      modalAddActiveLamp: false,
      lampList: [],
      lampListActive: [],
      itemEdit: null,
      lampEdit: null,

      typeActive: null,

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
      access: data.access,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  getData = (method, data = {}, dop_type = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data, dop_type)
      .then((result) => {
        if (method === "export_file_xls") {
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

  changePoint(event) {
    const data = event.target.value;

    this.setState({
      point: data,
    });

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  async getLamps() {
    const data = {
      point_id: this.state.point,
      date_start: dayjs(this.state.date_start).format("YYYY-MM"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM"),
    };

    const res = await this.getData("get_lamps", data);

    if (!res?.st) {
      return this.showAlert(res.text);
    }
    this.setState({
      lampList: res.list,
      lampListActive: res.active_lamp,
    });
  }

  async add(data) {
    data.point_id = this.state.point;

    const res = await this.getData("add_lamp", data);

    if (!res?.st) {
      return this.showAlert(res.text);
    }
    this.showAlert("Успешно сохранено!", true);
    this.setState({
      modalAddLamp: false,
    });

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  async addActive(data) {
    data.point_id = this.state.point;

    const res = await this.getData("add_lamp_active", data);

    if (!res?.st) {
      return this.showAlert(res.text);
    }
    this.showAlert("Успешно сохранено!", true);
    this.setState({
      modalAddActiveLamp: false,
    });

    setTimeout(() => {
      this.getLamps();
    }, 500);
  }

  openModalAddLamp() {
    this.setState({
      modalAddLamp: true,
    });
  }

  editLamp(item) {
    this.setState({
      modalAddLamp: true,
      lampEdit: item,
    });
  }

  openModalAddActiveLamp(item, typeActive) {
    this.setState({
      modalAddActiveLamp: true,
      itemEdit: item,
      typeActive,
    });
  }

  editActiveLamp(item, typeActive) {
    const name =
      this.state.lampList.find((lamp) => parseInt(lamp.id) === parseInt(item.lamp_id))?.name ?? "";

    item.name = name;

    this.setState({
      modalAddActiveLamp: true,
      itemEdit: item,
      typeActive,
    });
  }

  async download() {
    const date_start = dayjs(this.state.date_start).format("YYYY-MM");
    const date_end = dayjs(this.state.date_end).format("YYYY-MM");

    let data = {
      date_start,
      date_end,
      point_id: this.state.point,
    };

    const dop_type = {
      responseType: "blob",
    };

    const res = await this.getData("export_file_xls", data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Журнал учета работы бактерицидных ламп ${date_start}_${date_end}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: data,
    });
  }

  showAlert(err_text, err_status = false) {
    this.setState({
      openAlert: true,
      err_status,
      err_text,
    });
  }

  async changeLamp(data) {
    data.point_id = this.state.point;

    const res = await this.getData("changeLamp", data);

    if (res.st) {
      this.showAlert("Успешно сохранено!", true);
      this.setState({
        modalAddActiveLamp: false,
      });

      setTimeout(() => {
        this.getLamps();
      }, 500);
    } else {
      this.showAlert(res.text);
    }
  }

  canAccess(key) {
    const { userCan } = handleUserAccess(this.state.access);
    return userCan("access", key);
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
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {/* <TestAccess 
          access={this.state.access} 
          setAccess={(access) => this.setState({access})} 
        /> */}
        <Lamps_Modal_Add
          open={this.state.modalAddLamp}
          add={this.add.bind(this)}
          onClose={() => this.setState({ modalAddLamp: false, lampEdit: null })}
          fullScreen={this.state.fullScreen}
          lampEdit={this.state.lampEdit}
        />
        <Lamps_Modal_Add_Active
          open={this.state.modalAddActiveLamp}
          add={this.addActive.bind(this)}
          onClose={() =>
            this.setState({ modalAddActiveLamp: false, itemEdit: null, typeActive: null })
          }
          fullScreen={this.state.fullScreen}
          lampList={this.state.lampList}
          itemEdit={this.state.itemEdit}
          changeLamp={this.changeLamp.bind(this)}
          typeActive={this.state.typeActive}
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
              sm: 6,
            }}
          >
            <MyDatePickerNewViews
              label="Дата от"
              views={["month", "year"]}
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNewViews
              label="Дата до"
              views={["month", "year"]}
              value={this.state.date_end}
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
              id="select_point"
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
              onClick={this.getLamps.bind(this)}
            >
              Обновить данные
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={this.openModalAddLamp.bind(this)}
            >
              Добавить лампу
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            {this.canAccess("export_excel") && (
              <Button
                variant="contained"
                onClick={this.download.bind(this)}
              >
                Скачать файл XLS
              </Button>
            )}
          </Grid>

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
              component={Paper}
              sx={{ borderRadius: 2 }}
            >
              <Table
                sx={{
                  borderCollapse: "collapse", // classic grid
                  "& th, & td": {
                    border: "1px solid #e5e5e5",
                    textAlign: "center",
                    verticalAlign: "middle",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={5}>Дата проверки</TableCell>
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map((item, key) => (
                      <TableCell
                        key={key}
                        colSpan={3}
                        style={{ textAlign: "center" }}
                      >
                        Размещение: {item.place}
                      </TableCell>
                    ))}

                    <TableCell rowSpan={5}>Подпись менеджера смены</TableCell>
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map((item, key) => (
                      <TableCell
                        key={key}
                        colSpan={3}
                        style={{
                          textAlign: "center",
                          cursor: "pointer",
                          color: "red",
                        }}
                        onClick={this.editLamp.bind(this, item)}
                      >
                        Модель: {item.name}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map((item, key) => (
                      <TableCell
                        key={key}
                        colSpan={3}
                        style={{ textAlign: "center" }}
                      >
                        Ресурс лампы: {item.resource}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {this.state.lampList.map((item, key) => (
                      <Fragment key={item.id || key}>
                        <TableCell style={{ textAlign: "center" }}>Включение</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Выключение</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Время работы</TableCell>
                      </Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.lampListActive.map((item, key) => (
                    <TableRow
                      key={key}
                      style={{ cursor: "pointer" }}
                      hover
                    >
                      <TableCell>{item.date}</TableCell>

                      {item.lamps.map((lamp, k) => (
                        <Fragment key={k}>
                          <TableCell
                            style={{
                              textAlign: "center",
                              color: "red",
                            }}
                            onClick={
                              lamp.id == ""
                                ? () => {}
                                : this.editActiveLamp.bind(this, lamp, "edit")
                            }
                          >
                            {lamp.only_time_start}
                          </TableCell>
                          <TableCell
                            style={{ textAlign: "center", color: "red" }}
                            onClick={
                              lamp.id == ""
                                ? () => {}
                                : this.editActiveLamp.bind(this, lamp, "edit")
                            }
                          >
                            {lamp.only_time_end}
                          </TableCell>
                          <TableCell
                            style={{
                              textAlign: "center",
                              color: "red",
                            }}
                            onClick={
                              lamp.id == ""
                                ? () => {}
                                : this.editActiveLamp.bind(this, lamp, "edit")
                            }
                          >
                            {lamp.diff}
                          </TableCell>
                        </Fragment>
                      ))}

                      <TableCell>{item.manager}</TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell />
                    {this.state.lampList.map((item, key) => (
                      <TableCell
                        colSpan={3}
                        key={key}
                        style={{ textAlign: "center" }}
                      >
                        <Button
                          variant="contained"
                          onClick={this.openModalAddActiveLamp.bind(this, item, "new")}
                          sx={{ w: "100%" }}
                        >
                          Добавить активацию
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell>Отработано часов</TableCell>

                    {this.state.lampList.map((lamp, k) => (
                      <Fragment key={k}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>{lamp.svod}</TableCell>
                      </Fragment>
                    ))}

                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Journal_of_work_of_bactericidal_lamps() {
  return <Journal_of_work_of_bactericidal_lamps_ />;
}

export async function getServerSideProps({ res }) {
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
