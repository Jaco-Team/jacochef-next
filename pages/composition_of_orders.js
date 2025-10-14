import React from "react";

import dynamic from "next/dynamic"

import {
  MyCheckBox,
  MyDatePickerNew,
  MyAutoCompleteWithAll,
  MyAutocomplite,
} from "@/components/shared/Forms";

import {
  Grid,
  Button,
  Backdrop,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
} from "@mui/material";

import { api_laravel } from "@/src/api_new";
// import { api_laravel_local as api_laravel } from '@/src/api_new';
import dayjs from "dayjs";
import MyAlert from "@/components/shared/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";
import CityCafeAutocomplete2 from "@/components/shared/CityCafeAutocomplete2";
import CompositionOfOrdersTooltip from "@/components/composition_of_orders/CompositionOfOrdersToolTip";
import CompositionOfOrdersIconSort from "@/components/composition_of_orders/CompositionOfOrdersIconSort";
import CompositionOfOrdersRow from "@/components/composition_of_orders/CompositionOfOrdersRow";
import { formatNumber } from "@/src/helpers/utils/i18n";

const CompositionOfOrdersGraphModal = dynamic(
  () =>
    import(
      "@/components/composition_of_orders/CompositionOfOrdersGraphModal"
    ),
  { ssr: false }
);

class CompositionOfOrders_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "composition_of_orders",
      module_name: "",
      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      points: [],
      point: [],

      allItems: [],
      items: [],

      dows: [
        { id: 1, name: "Пн" },
        { id: 2, name: "Вт" },
        { id: 3, name: "Ср" },
        { id: 4, name: "Чт" },
        { id: 5, name: "Пт" },
        { id: 6, name: "Сб" },
        { id: 7, name: "Вс" },
      ],
      dow: [],

      pays: [
        { id: 1, name: "Доставка - Нал." },
        { id: 2, name: "Доставка - Безнал." },
        { id: 3, name: "Самовывоз - Нал." },
        { id: 4, name: "Самовывоз - Безнал." },
        { id: 5, name: "Зал - Нал." },
        { id: 6, name: "Зал - Безнал." },
        { id: 7, name: "Зал с собой - Нал." },
        { id: 8, name: "Зал с собой - Безнал." },
      ],
      pay: [],

      fullScreen: false,
      activeTab: 0,

      stat: [],

      now_time: 1,
      pred_time: 1,

      all_price: 0,
      all_count: 0,

      sort_count: "asc",
      sort_count_percent: "asc",
      sort_price_percent: "desc",
      sort_price: "asc",

      openRows: {},

      graph: null,
      graphModal: false,
      graphRowName: null
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      points: data.points,
      module_name: data.module_info.name,
      allItems: data.items ?? [],
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    const res = api_laravel(this.state.module, method, data)
      .then((result) => result?.data)
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

  changeAutocomplite(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeItemChecked(data, event) {
    this.setState({
      [data]: event.target.checked === true ? 1 : 0,
    });
  }

  async get_stat_orders() {
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = this.state;

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать точки",
      });

      return;
    }

    const data = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      item_ids: this.state.items?.map((i) => i.id),
    };

    let res = await this.getData("get_stat_orders", data);

    this.setState({
      stat: res?.res,
      all_price: res?.all_price,
      all_count: res?.all_count,

      sort_count: "asc",
      sort_count_percent: "asc",
      sort_price_percent: "desc",
      sort_price: "asc",
      graph: null
    });

    this.resetOpenRows();
  }

  async getDataRow(row_name, page = null, perPage = null) {
    const { point, dow, date_start, date_end, pay, now_time, pred_time, stat } = this.state;
    const row = this.state.stat.find((i) => i.name === row_name) || {};
    // page ?? this.setPage(row_name, page);
    // perPage ?? this.setRowsPerPage(row_name, perPage);
    const data = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      row_name,
      page: (page ?? 0) + 1,
      perPage: perPage ?? 30,
      item_ids: this.state.items?.map((i) => i.id),
    };

    const res = await this.getData("get_stat_orders_row", data);

    const newStat = [...stat].map((item) => {
      if (item.name === row_name) {
        console.log(
          `page: ${res.pagination.page}, perPage: ${res.pagination.perPage}, total: ${res.pagination.total}`
        );
      }
      return item.name === row_name
        ? {
            ...item,
            arr_main: res?.array.slice(0, 20),
            arr_dop: res?.array.slice(20),
            arr: res?.array,
            total: res?.pagination?.total,
            page: res?.pagination?.page > 0 ? res?.pagination?.page - 1 : 0,
            perPage: res?.pagination?.perPage > 0 ? res?.pagination?.perPage : 30,
            loading: false,
          }
        : item;
    });

    this.setState({ stat: newStat });
  }

  async getGraphData() {

    if(this.state.graph) return;

    const { point, dow, date_start, date_end, pay, now_time, pred_time } = this.state;

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать точки",
      });

      return;
    }

    const data = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      item_ids: this.state.items?.map((i) => i.id),
    };

    const res = await this.getData("get_stat_graph", data);
    if(!res?.graph) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Ошибка получения данных графика",
      });
      return;
    }
    this.setState({
      graph: res?.graph,
    });
  }

  openGraphModal() {
    this.setState({ graphModal: true });
  }

  get_new_type_sort(active) {
    if (active == "none") {
      return "desc";
    }

    if (active == "asc") {
      return "desc";
    } else {
      return "asc";
    }
  }

  sort(type) {
    // console.log( 'sort', type )

    if (type == "sort_count") {
      let type_sort = this.get_new_type_sort(this.state.sort_count);

      this.setState({
        sort_count: type_sort,
        sort_count_percent: "asc",
        sort_price_percent: "asc",
        sort_price: "asc",

        stat:
          type_sort == "asc"
            ? this.state.stat.sort((a, b) => parseInt(a.count) - parseInt(b.count))
            : this.state.stat.sort((a, b) => parseInt(b.count) - parseInt(a.count)),
      });
    }

    if (type == "sort_count_percent") {
      let type_sort = this.get_new_type_sort(this.state.sort_count_percent);

      this.setState({
        sort_count: "asc",
        sort_count_percent: type_sort,
        sort_price_percent: "asc",
        sort_price: "asc",

        stat:
          type_sort == "asc"
            ? this.state.stat.sort((a, b) => parseInt(a.count_percent) - parseInt(b.count_percent))
            : this.state.stat.sort((a, b) => parseInt(b.count_percent) - parseInt(a.count_percent)),
      });
    }

    if (type == "sort_price_percent") {
      let type_sort = this.get_new_type_sort(this.state.sort_price_percent);

      this.setState({
        sort_count: "asc",
        sort_count_percent: "asc",
        sort_price_percent: type_sort,
        sort_price: "asc",

        stat:
          type_sort == "asc"
            ? this.state.stat.sort((a, b) => parseInt(a.price_percent) - parseInt(b.price_percent))
            : this.state.stat.sort((a, b) => parseInt(b.price_percent) - parseInt(a.price_percent)),
      });
    }

    if (type == "sort_price") {
      let type_sort = this.get_new_type_sort(this.state.sort_price);

      this.setState({
        sort_count: "asc",
        sort_count_percent: "asc",
        sort_price_percent: "asc",
        sort_price: type_sort,

        stat:
          type_sort == "asc"
            ? this.state.stat.sort((a, b) => parseInt(a.price) - parseInt(b.price))
            : this.state.stat.sort((a, b) => parseInt(b.price) - parseInt(a.price)),
      });
    }
  }

  resetOpenRows = () => {
    const openRows = {};

    this.state.stat?.forEach((row) => {
      openRows[row.name] = false;
    });

    this.setState({ openRows });
  };

  setPage(rowName, newPage) {
    const newStat = this.state.stat.map((i) => (i.name === rowName ? { ...i, page: newPage } : i));
    this.setState({ stat: newStat });
  }

  setRowsPerPage(rowName, newPerPage) {
    const newStat = this.state.stat.map((i) =>
      i.name === rowName ? { ...i, perPage: newPerPage } : i
    );
    this.setState({ stat: newStat });
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
        <CompositionOfOrdersGraphModal
          open={this.state.graphModal}
          rowName={this.state.graphRowName}
          onClose={() => this.setState({ graphModal: false })}
          data={this.state.graph}
        />
        <Grid
          container
          spacing={3}
          mb={3}
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
            <CityCafeAutocomplete2
              label="Кафе"
              points={this.state.points}
              value={this.state.point}
              onChange={(v) => {
                this.setState({ point: v });
              }}
              withAll
              withAllSelected
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
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
              sm: 4,
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
              sm: 4,
            }}
          >
            <MyAutoCompleteWithAll
              label="День недели"
              options={this.state.dows}
              value={this.state.dow}
              onChange={(v) => {
                this.setState({ dow: v });
              }}
              withAll
              withAllSelected
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyAutoCompleteWithAll
              label="Способ оплаты"
              options={this.state.pays}
              value={this.state.pay}
              onChange={(v) => {
                this.setState({ pay: v });
              }}
              withAll
              withAllSelected
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyAutocomplite
              label="Товар"
              multiple={true}
              data={this.state.allItems || []}
              value={this.state.items || []}
              func={(_, v) => {
                this.setState({ items: v });
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <MyCheckBox
              defa
              label="Оформлен на ближайшее время"
              value={parseInt(this.state.now_time) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, "now_time")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <MyCheckBox
              label="Оформлен предзаказ"
              value={parseInt(this.state.pred_time) == 1 ? true : false}
              func={this.changeItemChecked.bind(this, "pred_time")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              onClick={this.get_stat_orders.bind(this)}
              variant="contained"
              disableElevation
            >
              Показать
            </Button>
          </Grid>

          <Grid
            style={{ marginBottom: 100 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Table aria-label="collapsible table">
              <TableHead style={{ backgroundColor: "#e6e6e6" }}>
                <TableRow>
                  <TableCell />
                  <TableCell>
                    Позиция меню
                    <CompositionOfOrdersTooltip
                      title={
                        "Берутся к учёту только те заказы, в которых есть то, что написано ниже списком. Блюда берутся в единственном и множественном числе."
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={this.sort.bind(this, "sort_count")}
                    >
                      <CompositionOfOrdersIconSort type={this.state.sort_count} />
                    </span>
                    Заказов, шт.
                    <CompositionOfOrdersTooltip title={"Общее количество таких заказов"} />
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={this.sort.bind(this, "sort_count_percent")}
                    >
                      <CompositionOfOrdersIconSort type={this.state.sort_count_percent} />
                    </span>
                    Доля в заказах
                    <CompositionOfOrdersTooltip title={"% от общего количества таких заказов"} />
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={this.sort.bind(this, "sort_price")}
                    >
                      <CompositionOfOrdersIconSort type={this.state.sort_price} />
                    </span>
                    Выручка, руб.
                    <CompositionOfOrdersTooltip title={"Общая выручка таких заказов в руб."} />
                  </TableCell>
                  <TableCell align="right">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={this.sort.bind(this, "sort_price_percent")}
                    >
                      <CompositionOfOrdersIconSort type={this.state.sort_price_percent} />
                    </span>
                    Доля в выручке, руб.
                    <CompositionOfOrdersTooltip title={"% от общей суммы выручки таких заказов"} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.stat?.map((row) => (
                  <CompositionOfOrdersRow
                    key={row.name}
                    row={row}
                    open={this.state.openRows[row.name] || false}
                    getDataRow={this.getDataRow.bind(this)}
                    setPage={this.setPage.bind(this)}
                    setRowsPerPage={this.setRowsPerPage.bind(this)}
                    onToggle={(rowName) => {
                      this.setState((prevState) => ({
                        openRows: {
                          ...prevState.openRows,
                          [rowName]: !prevState.openRows[rowName],
                        },
                      }));
                    }}
                    openGraphModal={async() => {
                      await this.getGraphData();
                      this.setState({
                        graphRowName: row.name,
                        graphModal: true
                      })
                    }}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell style={{ borderBottom: 0 }}></TableCell>
                  <TableCell style={{ borderBottom: 0 }}>Итого</TableCell>
                  <TableCell
                    align="right"
                    style={{ paddingRight: 10, borderBottom: 0 }}
                  >
                    {formatNumber(parseInt(this.state.all_count))}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ paddingRight: 10, borderBottom: 0 }}
                  >
                    100%
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ paddingRight: 10, borderBottom: 0 }}
                  >
                    {formatNumber(parseInt(this.state.all_price))}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ paddingRight: 10, borderBottom: 0 }}
                  >
                    100%
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function CompositionOfOrders() {
  return <CompositionOfOrders_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
