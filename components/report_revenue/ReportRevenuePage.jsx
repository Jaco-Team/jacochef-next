import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyDatePickerNew, MyAutocomplite } from "@/ui/Forms";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import ReportRevenueTable from "@/components/report_revenue/ReportRevenueTable";

// import { api_laravel_local as api_laravel } from '@/src/api_new';
import { api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import "dayjs/locale/ru";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import TestAccess from "@/ui/TestAccess";
import MyAlert from "@/ui/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";
dayjs.locale("ru");

class ReportRevenue_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "report_revenue",
      module_name: "",
      is_load: false,

      points: [],
      point: [],

      openAlert: false,
      err_status: false,
      err_text: "",

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      cats: [],
      cat: [],

      months: [],
      reportCats: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      points: data.points,
      cats: data.cats,
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

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  changePoints = (key, event, value) => {
    this.setState({
      [key]: value,
    });
  };

  changeDateRange = (key, newDate) => {
    this.setState({
      [key]: formatDate(newDate),
    });
  };

  changeCategory = (event, newValue) => {
    const oldValue = this.state.cat;

    const hadAllBefore = oldValue.some((item) => item.id === -1);
    const hasAllNow = newValue.some((item) => item.id === -1);

    if (!hadAllBefore && hasAllNow) {
      newValue = newValue.filter((item) => item.id === -1);
    } else if (hadAllBefore && hasAllNow) {
      newValue = newValue.filter((item) => item.id !== -1);
    }

    this.setState({ cat: newValue });
  };

  get_report = async () => {
    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, "Необходимо выбрать город или кафе");
      return;
    }

    if (!cat.length) {
      this.openAlert(false, "Необходимо выбрать категорию");
      return;
    }

    const data = {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      points: point,
      cats: cat.map((item) => item.id),
    };

    const res = await this.getData("get_report", data);

    if (res.st) {
      this.setState({
        months: res.months,
        reportCats: res.cats,
      });
    } else {
      this.openAlert(false, res.text);

      this.setState({
        months: [],
        reportCats: [],
        total: {},
      });
    }
  };

  downLoad = async () => {
    let { point, date_start, date_end, cat } = this.state;

    if (!point.length) {
      this.openAlert(false, "Необходимо выбрать город или кафе");
      return;
    }

    if (!cat.length) {
      this.openAlert(false, "Необходимо выбрать категорию");
      return;
    }

    date_start = dayjs(date_start).format("YYYY-MM-DD");
    date_end = dayjs(date_end).format("YYYY-MM-DD");

    const data = {
      date_start,
      date_end,
      points: point,
      cats: cat.map((item) => item.id),
    };

    const dop_type = {
      responseType: "blob",
    };

    const res = await this.getData("export_file_xls", data, dop_type);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Отчет о выручке за период ${date_start}_${date_end}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  canAccess(key) {
    const { userCan } = handleUserAccess(this.state.access);
    return userCan("access", key);
  }

  render() {
    const {
      is_load,
      openAlert,
      err_status,
      err_text,
      module_name,
      date_start,
      date_end,
      points,
      point,
      cats,
      cat,
      months,
      reportCats,
    } = this.state;

    return (
      <>
        <Backdrop
          style={{ zIndex: 999 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {/* <TestAccess access={this.state.access} setAccess={(access) => this.setState({access})} /> */}
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
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Дата от"
              value={date_start}
              func={(newDate) => this.changeDateRange("date_start", newDate)}
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
              func={(newDate) => this.changeDateRange("date_end", newDate)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <CityCafeAutocomplete2
              label="Кафе"
              points={points}
              value={point}
              onChange={(value) => this.changePoints("point", null, value)}
              singleCityOnly
              withOrganizationMode={false}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              label="Категории"
              multiple={true}
              data={cats}
              value={cat}
              func={this.changeCategory}
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
              onClick={this.get_report}
            >
              Показать
            </Button>
          </Grid>
          {this.canAccess("export_items") && (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Button
                variant={!(months.length && reportCats.length) ? "outlined" : "contained"}
                onClick={this.downLoad}
                disabled={!(months.length && reportCats.length)}
              >
                Скачать таблицу в XLS
              </Button>
            </Grid>
          )}

          {months.length && reportCats.length ? (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mt: 3,
              }}
            >
              <ReportRevenueTable
                months={months}
                cats={reportCats}
              />
            </Grid>
          ) : null}
        </Grid>
      </>
    );
  }
}

export default function ReportRevenuePage() {
  return <ReportRevenue_ />;
}
