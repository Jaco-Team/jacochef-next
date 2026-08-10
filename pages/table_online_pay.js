import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { MyDatePickerNew, MySelect } from "@/ui/Forms";

import queryString from "query-string";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";

class TableOnlinePay_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "table_online_pay",
      module_name: "",
      is_load: false,

      points: [],
      point_id: 0,

      orders: [],
      date: formatDate(new Date()),
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      points: data.points,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      //this.getWorks();
    }, 300);
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

  changeApp(event) {
    this.setState({
      app_id: event.target.value,
    });

    setTimeout(() => {
      this.getWorks();
    }, 300);
  }

  async getWorks() {
    let data = {
      point_id: this.state.point_id,
      date: dayjs(this.state.date).format("YYYY-MM-DD"),
    };

    let res = await this.getData("get_works", data);

    console.log(res);

    this.setState({
      orders: res.orders.orders,
    });
  }

  checkList() {
    let allList = this.state.allList;
    let thisList = this.state.thisList;

    thisList.map((Titem) => {
      let newArr = [];

      allList.map((Aitem) => {
        if (parseInt(Aitem.id) != parseInt(Titem.id)) {
          newArr.push(Aitem);
        }
      });

      allList = newArr;
    });

    this.setState({
      allListRender: allList,
    });
  }

  add(id, name) {
    let thisList = this.state.thisList;
    let allList = this.state.allList;

    let check = thisList.find((item, key) => parseInt(item["id"]) == parseInt(id));
    let thisItem = allList.find((item, key) => parseInt(item["id"]) == parseInt(id));

    if (!check) {
      thisList.push({ id: id, name: name, dop_time: 0, time_min: thisItem.time_min });
    }

    this.setState({
      thisList: thisList,
    });

    setTimeout(() => {
      this.checkList();
    }, 300);
  }

  del(id, name) {
    let new_arr = [];
    let thisList = this.state.thisList;

    thisList.map(function (item, key) {
      if (parseInt(item["id"]) != parseInt(id)) {
        new_arr.push(item);
      }
    });

    this.setState({
      thisList: new_arr,
    });

    setTimeout(() => {
      this.checkList();
    }, 300);
  }

  async getInfo(id) {
    let data = {
      point_id: this.state.point_id,
      id: id,
    };

    let res = await this.getData("get_info", data);

    console.log(res);

    //alert(res.text)
  }

  async returnPay(id) {
    var nameUser = prompt("", "");

    if (nameUser == "ОТМЕНИТЬ") {
      let data = {
        point_id: this.state.point_id,
        id: id,
      };

      let res = "";

      //let res = await this.getData('return_pay', data);

      console.log(res);

      alert(res.text);
    }
  }

  changeDopTime(key, event) {
    let data = event.target.value;
    let list = this.state.thisList;

    if (!isNaN(data) || data == "") {
      list[key]["dop_time"] = data == "" ? "" : parseInt(data);

      this.setState({
        thisList: list,
      });
    }
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
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
            <MySelect
              data={this.state.points}
              value={this.state.point_id}
              func={(event) => {
                this.setState({ point_id: event.target.value });
              }}
              label="Точка"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата"
              value={this.state.date}
              func={this.changeDateRange.bind(this, "date")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              variant="contained"
              onClick={this.getWorks.bind(this)}
            >
              Обновить данные
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell></TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Дата оплаты</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.orders.map((item, key) => (
                  <TableRow
                    key={key}
                    style={{
                      backgroundColor: item.is_return === true ? "red" : "#fff",
                      color: item.is_return === true ? "#fff" : "#000",
                    }}
                  >
                    <TableCell style={{ color: "inherit" }}>{item.metadata.order_id}</TableCell>
                    <TableCell style={{ color: "inherit" }}>{item.description}</TableCell>
                    <TableCell style={{ color: "inherit" }}>{item.date_create}</TableCell>
                    <TableCell style={{ color: "inherit" }}>{item.date_pay}</TableCell>

                    <TableCell>
                      {item.is_return === true || item.paid === false ? (
                        false
                      ) : (
                        <Button
                          variant="contained"
                          onClick={this.returnPay.bind(this, item.id)}
                        >
                          Отменить
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function TableOnlinePay() {
  return <TableOnlinePay_ />;
}
