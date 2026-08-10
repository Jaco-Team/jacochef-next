import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MySelect, MyCheckBox } from "@/ui/Forms";

import queryString from "query-string";

class LiveOrders_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "live_orders",
      module_name: "",
      is_load: false,

      points: [],
      point: "0",
      showReady: false,
      read: [],
      onstol: [],
      ordersQueue: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      points: data.point_list,
      point: data.point_list[0].id,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.updateData();
    }, 100);
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
          window.location.pathname = "/auth";
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

  changePoint(event) {
    let data = event.target.value;

    this.setState({
      point: data,
    });

    setTimeout(() => {
      this.updateData();
    }, 50);
  }

  changeCheckOrders(event) {
    let data = event.target.checked;

    this.setState({
      showReady: data,
    });
  }

  async updateData() {
    let data = {
      point_id: this.state.point,
      showReady: this.state.showReady === true ? 1 : 0,
    };

    let res = await this.getData("get_orders", data);

    this.setState({
      read: res.read,
      onstol: res.onstol,
      ordersQueue: res.prestol_new,
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
              xs: 6,
              sm: 6,
            }}
          >
            <MySelect
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={this.updateData.bind(this)}
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
            <MyCheckBox
              value={this.state.showReady}
              func={this.changeCheckOrders.bind(this)}
              label="Показывать готовые"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TableContainer component={Paper}>
              <Table aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Время заказа</TableCell>
                    <TableCell>Время предзакза</TableCell>

                    <TableCell>Время выхода на стол</TableCell>
                    <TableCell>Во сколько собрали</TableCell>
                    <TableCell>Закрыли</TableCell>

                    <TableCell>Приготовили</TableCell>
                    <TableCell>Отдали</TableCell>
                    <TableCell>Обещали</TableCell>

                    <TableCell>Статус</TableCell>
                    <TableCell>Стол</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.read.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.type_order}</TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 1 ? "" : item.date_time_order}
                      </TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 1 ? item.date_time_preorder_ : ""}
                      </TableCell>

                      <TableCell>{item.unix_start_stol_or}</TableCell>
                      <TableCell>{item.give_data_time_}</TableCell>
                      <TableCell>{item.close_date_time_order}</TableCell>

                      <TableCell
                        style={{ backgroundColor: parseInt(item.type_) == 1 ? "" : item.color }}
                      >
                        {item.time_}
                      </TableCell>
                      <TableCell
                        style={{ backgroundColor: parseInt(item.type_) != 1 ? "" : item.color }}
                      >
                        {item.test_time}
                      </TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 0 ? item.unix_time_to_client : ""}
                      </TableCell>

                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.stol_sborki}</TableCell>
                    </TableRow>
                  ))}

                  {this.state.onstol.map((item, key) => (
                    <TableRow
                      key={key}
                      style={{ backgroundColor: "yellow" }}
                    >
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.type_order}</TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 1 ? "" : item.date_time_order}
                      </TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 1 ? item.date_time_preorder_ : ""}
                      </TableCell>

                      <TableCell>{item.unix_start_stol_or}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>

                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        {parseInt(item.preorder) == 0 ? item.unix_time_to_client : ""}
                      </TableCell>

                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.stol_sborki}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper}>
              <Table aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Пред</TableCell>
                    <TableCell>Время оформления</TableCell>
                    <TableCell>Время выхода на стол</TableCell>
                    <TableCell>Время закрытия</TableCell>
                    <TableCell>Обещали</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.ordersQueue.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        {parseInt(item.is_preorder) == 1 ? item.date_time_preorder : ""}
                      </TableCell>
                      <TableCell>
                        {parseInt(item.is_preorder) == 0 ? item.date_time_order : ""}
                      </TableCell>

                      <TableCell>{item.time_start_order}</TableCell>
                      <TableCell>{item.time_end_order}</TableCell>

                      <TableCell>
                        {parseInt(item.is_preorder) == 0 ? item.unix_time_to_client : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function LiveOrders() {
  return <LiveOrders_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  //res.setHeader('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=1');
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
