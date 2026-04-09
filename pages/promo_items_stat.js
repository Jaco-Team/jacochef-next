import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyDatePickerNew, MyTextInput, MyAutocomplite } from "@/ui/Forms";

import queryString from "query-string";

import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import { api_laravel, api_laravel_local } from "@/src/api_new";

class PromoItemsStat_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "promo_items_stat",
      module_name: "",
      is_load: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      point_list: [],
      choosePoint: [],

      stats: [],

      chooseItem: null,
      items_list: [],
      promoName: "",
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      point_list: data.points,
      stats: data.stats,
      items_list: data.items,
    });

    document.title = data.module_info.name;
  }

  getData = async (method, data = {}) => {
    this.setState({ is_load: true });

    try {
      const result = await api_laravel(this.state.module, method, data);
      return result?.data;
    } catch (error) {
      return { st: false, text: error.message || "Ошибка запроса" };
    } finally {
      setTimeout(() => {
        this.setState({ is_load: false });
      }, 500);
    }
  };

  async getStat() {
    let data = {
      choosePoint: this.state.choosePoint,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
      promoName: this.state.promoName,
      chooseItem: this.state.chooseItem,
    };

    let res = await this.getData("get_all", data);

    this.setState({
      stats: res.stats,
    });
  }

  choosePoint(event, data) {
    this.setState({
      choosePoint: data,
    });
  }

  chooseData(data, val, val2) {
    this.setState({
      [data]: data != "promoName" && data != "chooseItem" ? val : data == "chooseItem" ? val2 : val,
    });
  }

  chooseDataNew(data, val, val2) {
    if (data == "promoName") {
      this.setState({
        [data]: val.target.value,
        chooseItem: val.target.value.length > 0 ? null : this.state.chooseItem,
      });
    }

    if (data == "chooseItem") {
      this.setState({
        [data]: val2,
        promoName: val2 ? "" : this.state.promoName,
      });
    }
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
              xs: 12,
              sm: 4,
            }}
          >
            <MyAutocomplite
              data={this.state.point_list}
              value={this.state.choosePoint}
              func={this.choosePoint.bind(this)}
              multiple={true}
              label="Точка"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyDatePickerNew
              label={"Дата от"}
              value={this.state.date_start}
              func={this.chooseData.bind(this, "date_start")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyDatePickerNew
              label={"Дата до"}
              value={this.state.date_end}
              func={this.chooseData.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyTextInput
              value={this.state.promoName}
              func={this.chooseDataNew.bind(this, "promoName")}
              label="Промокод"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              data={this.state.items_list}
              value={this.state.chooseItem}
              func={this.chooseDataNew.bind(this, "chooseItem")}
              multiple={false}
              label="Товар"
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
              onClick={this.getStat.bind(this)}
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
            <Table size={"small"}>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Клиентов</TableCell>
                  {this.state.stats && this.state.stats[0]?.summ !== undefined ? (
                    <TableCell>Сумма</TableCell>
                  ) : null}
                </TableRow>
              </TableHead>

              <TableBody>
                {!this.state.stats
                  ? null
                  : this.state.stats.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell style={{ textAlign: "left" }}>{item.name} </TableCell>
                        <TableCell style={{ textAlign: "left" }}>{item.count} </TableCell>
                        {this.state.stats && this.state.stats[0]?.summ !== undefined ? (
                          <TableCell style={{ textAlign: "left" }}>
                            {new Intl.NumberFormat("ru-RU").format(item.summ || 0)} ₽
                          </TableCell>
                        ) : null}
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

export default function PromoItemsStat() {
  return <PromoItemsStat_ />;
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
