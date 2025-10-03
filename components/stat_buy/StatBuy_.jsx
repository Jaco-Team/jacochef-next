"use client";

import React from "react";

import { Grid, Button, TableCell, Box, Tab, Backdrop, CircularProgress } from "@mui/material";

import { MyAutocomplite, MyDatePickerNew } from "@/components/shared/Forms";

import { TabContext, TabList } from "@mui/lab";
import Stat_buy_Table_ from "./StatBuyTable_";

import dayjs from "dayjs";
import { api_laravel } from "@/src/api_new";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import { formatNumber } from "@/src/helpers/utils/i18n";
import MyAlert from "@/components/shared/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";

dayjs.locale("ru");

export default class Stat_buy_ extends React.Component {
  constructor(props) {
    super(props);

    const data = props.initialData?.data || null;
    // console.log("SSR DATA: ", data)

    this.state = {
      module: "stat_buy",
      module_name: data?.module_info?.name || "",
      access: data?.access || null,
      is_load: false,

      points: data?.points || [],
      point: [],

      cats: data?.cats || [],
      cat: null,

      catsData: [],
      unic_date: [],
      items: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      ItemTab: "1",

      url: null,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    if (!this.props.initialData) {
      console.log("SSR failed, refetching");
      const data = await this.getData("get_all");

      this.setState({
        cats: data?.cats,
        cat: data?.cats?.[0],
        points: data?.points,
        access: data.access,
        module_name: data?.module_info?.name,
      });
    }

    document.title = this.state.module_name;
  }

  showAlert = (message, status = false) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: message,
    });
    setTimeout(() => {
      this.setState({
        openAlert: false,
      });
    }, 3000);
  };

  async getData(method, data = {}) {
    this.setState({
      is_load: true,
    });
    try {
      const response = await api_laravel(this.state.module, method, data);
      return response?.data ?? null;
    } catch (e) {
      this.showAlert(e.message || "Ошибка");
    } finally {
      this.setState({
        is_load: false,
      });
    }
  }

  changeCat(data, _, value) {
    this.setState({
      [data]: value,
    });
  }

  changePoint(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });
  }

  async getItems() {
    const points = this.state.point;

    if (!points.length) {
      this.showAlert("Выберите точку!");
      return;
    }
    if (!this.state.cat) {
      this.showAlert("Выберите категорию!");
      return;
    }

    const data = {
      cat: this.state.cat,
      points,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("get_items", data);
    if (!res?.st) {
      this.showAlert(res?.text || "Ошибка");
      return;
    }

    if (!res?.counts?.unic_date?.length) {
      this.showAlert("Данные за указанный период отсутствуют!");
      return;
    }

    res.counts.unic_date.sort((a, b) => new Date(a.date) - new Date(b.date));

    this.setState({
      url: res.url,
      catsData: res.cats,
      unic_date: res.counts.unic_date,
      items: res.counts.items,
    });
  }

  getDataCell(id, date, key) {
    const items = this.state.items;

    const ItemTab = this.state.ItemTab;

    const item = items.find((item) => item.item_id === id && item.date === date);
    const values = [item?.count, item?.price, item?.avg_price];
    const value = values[ItemTab - 1] ?? null;

    return item ? (
      <TableCell key={key}>{formatNumber(value)}</TableCell>
    ) : (
      <TableCell key={key}></TableCell>
    );
  }

  onDownload() {
    const url = this.state.url;

    const link = document.createElement("a");
    link.href = url;
    link.click();
  }

  canAccess = (key) => handleUserAccess(this.state.access)?.userCan("access", key);

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

        <Grid
          container
          spacing={3}
          style={{ marginTop: "64px", marginBottom: "24px" }}
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
            <MyAutocomplite
              label="Кафе"
              multiple={true}
              data={this.state.points || []}
              value={this.state.point || []}
              func={this.changePoint.bind(this, "point")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              label="Категория"
              multiple={false}
              disableCloseOnSelect={false}
              data={this.state.cats || []}
              value={this.state.cat}
              func={this.changeCat.bind(this, "cat")}
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
              sm: 2,
            }}
          >
            <Button
              onClick={this.getItems.bind(this)}
              variant="contained"
            >
              Обновить
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button
              color="success"
              variant="contained"
              onClick={this.onDownload.bind(this)}
              disabled={!this.state.url}
            >
              Скачать
            </Button>
          </Grid>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
          style={{ padding: "0 24px", marginTop: "24px" }}
        >
          <TabContext value={this.state.ItemTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={this.changeTab.bind(this)}
                variant="fullWidth"
              >
                <Tab
                  label="Количество"
                  value="1"
                />
                <Tab
                  label="Сумма"
                  value="2"
                />
                <Tab
                  label="Средняя цена"
                  value="3"
                />
              </TabList>
            </Box>

            <Stat_buy_Table_
              ItemTab={this.state.ItemTab}
              unic_date={this.state.unic_date}
              catsData={this.state.catsData}
              getDataCell={this.getDataCell.bind(this)}
            />
          </TabContext>
        </Grid>
      </>
    );
  }
}
