import React from "react";

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

import { MySelect, MyDatePickerNew, MyTextInput } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import TestAccess from "@/ui/TestAccess";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import MyAlert from "@/ui/MyAlert";

class TableBrak_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "table_brak",
      module_name: "",
      is_load: false,

      points: [],
      point: "",

      date_start: dayjs(),
      date_end: dayjs(),

      items: [],
      itemsCopy: [],

      openAlert: false,
      err_status: true,
      err_text: "",

      searchItem: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      access: data.access,
    });

    document.title = data.module_info.name;
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

  changePoint(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  changeDateRange = (field, newDate) => {
    this.setState({ [field]: newDate });
  };

  async getStat() {
    this.setState({
      searchItem: "",
    });

    let { point, points, date_start, date_end } = this.state;

    if (!date_start || !date_end) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо указать все даты",
      });

      return;
    }

    date_start = dayjs(date_start).format("YYYY-MM-DD");
    date_end = dayjs(date_end).format("YYYY-MM-DD");
    const point_id = points.find((item) => parseInt(item.id) === parseInt(point));

    const data = {
      date_start,
      date_end,
      point_id,
    };

    const res = await this.getData("get_stat", data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res.text,
      });
    } else {
      this.setState({
        items: res.items,
        itemsCopy: res.items,
      });
    }
  }

  onDownload = async () => {
    let { point, points, date_start, date_end } = this.state;

    if (!date_start || !date_end) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо указать все даты",
      });

      return;
    }

    const d_start = dayjs(date_start);
    const d_end = dayjs(date_end);
    const diffDays = d_end.diff(d_start, "day");

    if (diffDays > 7) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Нельзя выбрать больше 7 дней",
      });

      return;
    }

    date_start = d_start.format("YYYY-MM-DD");
    date_end = d_end.format("YYYY-MM-DD");
    const point_id = points.find((item) => parseInt(item.id) === parseInt(point));

    const data = {
      date_start,
      date_end,
      point_id,
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
      `Журнал бракеража точки ${point_id.name} за период ${date_start}_${date_end}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  search = (event) => {
    const searchItem = event.target.value.trim();
    this.setState({ searchItem });

    if (!searchItem) {
      this.setState({ items: this.state.itemsCopy });
      return;
    }

    const search = searchItem.toLowerCase();

    const filterItems = this.state.itemsCopy.filter((item) => {
      const order_str = String(item.order_id).toLowerCase();
      return order_str.includes(search);
    });

    this.setState({ items: filterItems });
  };

  canAccess(key) {
    const { userCan } = handleUserAccess(this.state.access);
    return userCan("access", key);
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
        {/* <TestAccess access={this.state.access} setAccess={(access) => this.setState({access})} /> */}
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
          }}
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
            <MySelect
              is_none={false}
              label="Точка"
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, "point")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.getStat.bind(this)}
              variant="contained"
            >
              Обновить
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyTextInput
              type="number"
              label="Поиск по номеру заказа"
              value={this.state.searchItem}
              func={this.search.bind(this)}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            {this.canAccess("export") && (
              <Button
                variant={this.state.items.length ? "contained" : "outlined"}
                color="success"
                onClick={this.onDownload.bind(this)}
                disabled={!this.state.items.length}
              >
                Скачать Excel
              </Button>
            )}
          </Grid>

          {/* таблица */}
          {!this.state.items.length ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mt: 5,
                mb: 5,
              }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                      <TableCell>Номер заказа</TableCell>
                      <TableCell>Дата и час изготовления блюда</TableCell>
                      <TableCell>Время снятия бракеража</TableCell>
                      <TableCell>Наименование блюда, кулинарного изделия</TableCell>
                      <TableCell>Результаты органолептической оценки</TableCell>
                      <TableCell>Разрешение к реалезации блюда, кулинарного изделия</TableCell>
                      <TableCell>ФИО лица, проводившего бракераж</TableCell>
                      <TableCell>ФИО повара</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.items.map((item, key) => (
                      <TableRow
                        hover
                        key={key}
                      >
                        <TableCell>{item.order_id}</TableCell>
                        <TableCell>{item.povar_time}</TableCell>
                        <TableCell>{item.manager_time}</TableCell>
                        <TableCell>{item.pos_name}</TableCell>
                        <TableCell>Внешний вид, вкус и запах - свойственны данному блюду</TableCell>
                        <TableCell>Разрешено к реалезиции</TableCell>
                        <TableCell>{item.manager_name}</TableCell>
                        <TableCell>{item.povar_name}</TableCell>
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

export default function TableBrak() {
  return <TableBrak_ />;
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
