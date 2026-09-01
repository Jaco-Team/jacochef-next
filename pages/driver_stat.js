import React from "react";

import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";

import { MySelect, MyTextInput, MyDatePickerNew } from "@/ui/Forms";

import dayjs from "dayjs";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import MyAlert from "@/ui/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";
import { Close } from "@mui/icons-material";

const toCashNumber = (value) => Number(value) || 0;

const getCashAnalytics = (value = {}) => {
  const sdacha = toCashNumber(value.sdacha);
  const giveByDate = toCashNumber(value.give_by_date);
  const ostCash = toCashNumber(value.ost_cash);
  const balanceChange =
    value.balance_change === null || value.balance_change === undefined
      ? sdacha - giveByDate
      : toCashNumber(value.balance_change);
  const openingCash =
    value.opening_cash === null || value.opening_cash === undefined
      ? ostCash - balanceChange
      : toCashNumber(value.opening_cash);

  return {
    sdacha,
    giveByDate,
    ostCash,
    openingCash,
    balanceChange,
    result:
      ostCash < 0
        ? "Пересдал"
        : balanceChange > 0
          ? "Остаток вырос"
          : balanceChange < 0
            ? "Остаток снизился"
            : "Без изменений",
  };
};

const getDayAnalytics = (data, date) => {
  if (data.analytics?.[date]) {
    return data.analytics[date];
  }

  return data.drivers.reduce(
    (result, driver) => {
      const analytics = getCashAnalytics(driver.values?.[date]);

      if (analytics.balanceChange > 0) {
        result.increased++;
      } else if (analytics.balanceChange < 0) {
        result.decreased++;
      } else {
        result.unchanged++;
      }

      if (analytics.ostCash < 0) {
        result.overpaid++;
      }

      return result;
    },
    { increased: 0, decreased: 0, unchanged: 0, overpaid: 0 },
  );
};

const formatSignedCash = (value) => {
  const number = toCashNumber(value);
  return number > 0 ? `+${number}` : number;
};

const getBalanceStatus = (value) => {
  if (value < 0) return "Пересдал";
  if (value > 0) return "На руках";
  return "Закрыто";
};

const getDailyCashStatus = (data) => {
  const discrepancy = data.ostCash - data.openingCash - data.balanceChange;

  if (discrepancy !== 0) return `Расхождение ${formatSignedCash(discrepancy)}`;
  if (data.ostCash < 0) return "Пересдал";
  if (data.ostCash === 0) return "Закрыто";
  if (data.sdacha > 0 && data.giveByDate === 0) return "Не сдавал";
  if (data.giveByDate > 0 && data.ostCash > 0) return "Сдал частично";
  if (data.balanceChange === 0) return "Остаток без изменений";
  return data.balanceChange > 0 ? "Остаток вырос" : "Остаток снизился";
};

const formatCashDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD.MM.YYYY") : "—";

const formatCashDateTime = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD.MM.YYYY HH:mm") : "—";

const getDriverCashSummary = (driver, dates = []) => {
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const firstValue = getCashAnalytics(driver?.values?.[firstDate]);
  const lastValue = getCashAnalytics(driver?.values?.[lastDate]);
  const fallbackChange = dates.reduce(
    (sum, date) => sum + getCashAnalytics(driver?.values?.[date]).balanceChange,
    0,
  );

  return {
    opening_cash: driver?.summary?.opening_cash ?? firstValue.openingCash,
    balance_change: driver?.summary?.balance_change ?? fallbackChange,
    ost_cash: driver?.summary?.ost_cash ?? lastValue.ostCash,
    balance_open_since: driver?.summary?.balance_open_since ?? null,
    last_give_at: driver?.summary?.last_give_at ?? null,
    last_give_amount: driver?.summary?.last_give_amount ?? 0,
    last_cash_at: driver?.summary?.last_cash_at ?? null,
    top_growth_days: driver?.summary?.top_growth_days ?? [],
  };
};

const CashAnalyticsTooltip = ({ data }) => (
  <div>
    <div>Остаток на начало: {data.openingCash}</div>
    <div>К сдаче: {data.sdacha}</div>
    <div>Сдал: {data.giveByDate}</div>
    <div>Изменение: {formatSignedCash(data.balanceChange)}</div>
    <div>Остаток на конец: {data.ostCash}</div>
    <div>Результат: {getDailyCashStatus(data)}</div>
  </div>
);

class DriverStat_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "driver_stat",
      module_name: "",
      access: null,
      is_load: false,

      points: [],
      point: "0",

      date_start: formatDate(),
      date_end: formatDate(),
      // rangeDate: [formatDate(new Date()), formatDate(new Date())],

      modalGetCash: false,

      drive_stat_full: [],
      drive_stat_date: null,
      driver_cash_by_date: null,
      driverCashDetails: null,
      summ: 0,
      choose_driver_id: 0,
      check_cash: 0,

      giveSumm: 0,
      modalGiveCash: false,
      giveCashDriver: null,
      giveCashComment: "",

      modalDialogStatSumm: false,
      modalDialogStatSummMain: false,
      statSumm: [],
      statSummMain: [],
      openAlert: false,
      err_status: false,
      err_text: "",

      show_dop: 0,
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    //console.log( data )

    this.setState({
      points: data.points,
      point: data.points[0].id,
      module_name: data.module_info.name,
      access: data.access,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.updateData();
    }, 50);
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  async updateData() {
    let data = {
      point_id: this.state.point,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    let res = await this.getData("get_data", data);

    if (res?.st) {
      this.setState({
        show_dop: parseInt(res.user.kind) < 3 ? 1 : 0,
        drive_stat_full: res.drive_stat_full,
        drive_stat_date: res.stat_drive_date,
        driver_cash_by_date: res.driver_cash_by_date ?? null,
      });
    } else {
      this.showAlert(res?.text || "Ошибка");
    }
  }

  changeDate(key, value) {
    if (!this.canAccess("dates")) {
      let { date_start, date_end } = this.state;
      if (key === "date_start") {
        date_start = value;
      } else {
        date_end = value;
      }
      if (date_end.diff(date_start, "day") > 62) {
        this.showAlert("Выберите диапазон дат не более 62 дней");
        return;
      }
    }
    this.setState({
      [key]: value,
    });
  }

  changePoint(event) {
    let data = event.target.value;

    this.setState({
      point: data,
    });
  }

  changeSumm(event) {
    this.setState({
      summ: event.target.value,
    });
  }

  getCash(driver_id, check_cash) {
    this.setState({
      modalGetCash: true,
      choose_driver_id: driver_id,
      check_cash: check_cash,
    });
  }

  async saveGetCash() {
    if (this.click) {
      return;
    }

    this.click = true;

    if (parseInt(this.state.summ) > parseInt(this.state.check_cash)) {
      alert("Нельзя сдать денег больше, чем есть у курьера");
      setTimeout(() => {
        this.click = false;
      }, 300);
      return;
    }

    const data = {
      point_id: this.state.point,
      price: this.state.summ,
      driver_id: this.state.choose_driver_id,
    };

    const res = await this.getData("save_give", data);

    // console.log( res )

    if (res?.st) {
      this.setState({
        modalGetCash: false,
        check_cash: 0,
        choose_driver_id: 0,
        summ: 0,
      });

      this.updateData();
    } else {
      this.showAlert(res?.text || "Ошибка");
    }

    setTimeout(() => {
      this.click = false;
    }, 300);
  }

  giveCash(driver) {
    this.setState({
      modalGiveCash: true,
      giveSumm: 0,
      giveCashDriver: driver,
      giveCashComment: "",
    });
  }

  async saveGiveCash() {
    if (this.click) {
      return;
    }

    this.click = true;

    if (parseInt(this.state.giveSumm) > 1000) {
      alert("Нельзя выдать больше 1000р за раз");
      setTimeout(() => {
        this.click = false;
      }, 300);
      return;
    }

    let data = {
      point_id: this.state.point,
      price: this.state.giveSumm,
      driver_id: this.state.giveCashDriver.driver_id,
      comment: this.state.giveCashComment,
    };

    const res = await this.getData("save_get", data);

    // console.log( res )

    if (res?.st) {
      this.setState({
        modalGiveCash: false,
        giveSumm: 0,
        giveCashDriver: null,
        giveCashComment: "",
      });

      this.updateData();
    } else {
      this.showAlert(res?.text || "Ошибка");
    }

    setTimeout(() => {
      this.click = false;
    }, 300);
  }

  async getStatDop(driver) {
    const data = {
      point_id: this.state.point,
      driver_id: driver.driver_id,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("get_stat_dop", data);

    if (!res) {
      this.showAlert("Ошибка");
      return;
    }

    // console.log( res )

    this.setState({
      modalDialogStatSumm: true,
      statSumm: res,
      giveCashDriver: driver,
    });
  }

  async getStatDopMain(driver) {
    const data = {
      point_id: this.state.point,
      driver_id: driver.driver_id,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("get_stat_dop_main", data);

    if (!res) {
      this.showAlert("Ошибка");
      return;
    }

    // console.log( res )

    this.setState({
      modalDialogStatSummMain: true,
      statSummMain: res?.stat,
      show_dop: parseInt(res.my.kind) < 3 ? 1 : 0,
      giveCashDriver: driver,
    });
  }

  canAccess(key) {
    const { userCan } = handleUserAccess(this.state?.access);
    return userCan("edit", key);
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
    }, 2000);
  };

  render() {
    const driverCashDetails = this.state.driverCashDetails;
    const driverCashSummary = driverCashDetails
      ? getDriverCashSummary(driverCashDetails, this.state.driver_cash_by_date?.dates)
      : null;
    const driverCashDiscrepancy = driverCashSummary
      ? toCashNumber(driverCashSummary.ost_cash) -
        toCashNumber(driverCashSummary.opening_cash) -
        toCashNumber(driverCashSummary.balance_change)
      : 0;

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
        <Dialog
          open={this.state.modalGetCash}
          onClose={() => {
            this.setState({ modalGetCash: false, check_cash: 0, choose_driver_id: 0, summ: 0 });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>
            Какую сумму сдает курьер
            <IconButton
              onClick={() =>
                this.setState({ modalGetCash: false, check_cash: 0, choose_driver_id: 0, summ: 0 })
              }
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <MyTextInput
              label=""
              value={this.state.summ}
              func={this.changeSumm.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={this.saveGetCash.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modalGiveCash}
          onClose={() => {
            this.setState({ modalGiveCash: false });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle>
            Дополнительная выплата курьеру "{this.state.giveCashDriver?.name || ""}"
            <IconButton
              onClick={() => this.setState({ modalGiveCash: false })}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
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
                  type="number"
                  value={this.state.giveSumm}
                  func={(event) => {
                    this.setState({ giveSumm: event.target.value });
                  }}
                  label="Сумма"
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  maxRows={2}
                  value={this.state.giveCashComment}
                  func={(event) => {
                    this.setState({ giveCashComment: event.target.value });
                  }}
                  label="Комментарий"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={this.saveGiveCash.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modalDialogStatSumm}
          onClose={() => {
            this.setState({ modalDialogStatSumm: false, giveCashDriver: null });
          }}
          fullWidth={true}
          maxWidth={"md"}
        >
          <DialogTitle>
            Доп выплаты "{this.state.giveCashDriver ? this.state.giveCashDriver.name : ""}"
            <IconButton
              onClick={() => this.setState({ modalDialogStatSumm: false, giveCashDriver: null })}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Table size={"small"}>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Кто назначил</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell>Тип</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.statSumm.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>{item.date_time}</TableCell>
                    <TableCell>{item.user_name}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.comment}</TableCell>
                    <TableCell>{parseInt(item.order_id) > 0 ? "Довоз" : "Доп выплата"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.modalDialogStatSummMain}
          onClose={() => {
            this.setState({ modalDialogStatSummMain: false, giveCashDriver: null });
          }}
          fullWidth={true}
          maxWidth={"md"}
        >
          <DialogTitle>
            Выплаты "{this.state.giveCashDriver ? this.state.giveCashDriver.name : ""}"
            <IconButton
              onClick={() =>
                this.setState({ modalDialogStatSummMain: false, giveCashDriver: null })
              }
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Table size={"small"}>
              <TableHead>
                <TableRow>
                  <TableCell>Заказ</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Тип</TableCell>
                  {this.state.show_dop == 0 ? false : <TableCell>Дистанция</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.statSummMain.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>{parseInt(item.order_id) == 0 ? "" : item.order_id}</TableCell>
                    <TableCell>{item.date_time}</TableCell>
                    <TableCell>{parseInt(item.my_cash) == 0 ? item.give : item.my_cash}</TableCell>
                    <TableCell>{parseInt(item.order_id) == 0 ? item.user_name : ""}</TableCell>
                    <TableCell>{parseInt(item.order_id) == 0 ? "Сдал" : "С заказа"}</TableCell>
                    {this.state.show_dop == 0 ? false : <TableCell>{item.dist}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(driverCashDetails)}
          onClose={() => this.setState({ driverCashDetails: null })}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle style={{ paddingRight: 64 }}>
            Движение наличных — {driverCashDetails?.name || ""}
            <IconButton
              onClick={() => this.setState({ driverCashDetails: null })}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 24, paddingTop: 10 }}>
            <Grid
              container
              spacing={2}
            >
              {[
                ["На начало периода", driverCashSummary?.opening_cash ?? 0],
                ["Изменение за период", formatSignedCash(driverCashSummary?.balance_change ?? 0)],
                ["Сейчас на руках", driverCashSummary?.ost_cash ?? 0],
              ].map(([label, value]) => (
                <Grid
                  key={label}
                  size={{ xs: 12, sm: 4 }}
                  style={{ height: "max-content" }}
                >
                  <Paper
                    variant="outlined"
                    style={{ height: "100%", padding: 16 }}
                  >
                    <div style={{ color: "#666", fontSize: 13 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{value}</div>
                  </Paper>
                </Grid>
              ))}

              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  style={{ padding: 16 }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {driverCashSummary?.opening_cash ?? 0} {" + "}
                    {formatSignedCash(driverCashSummary?.balance_change ?? 0)} {" = "}
                    {toCashNumber(driverCashSummary?.opening_cash) +
                      toCashNumber(driverCashSummary?.balance_change)}
                  </div>
                  <div
                    style={{
                      color: driverCashDiscrepancy === 0 ? "#2e7d32" : "#d32f2f",
                      fontSize: 13,
                      marginTop: 6,
                    }}
                  >
                    {driverCashDiscrepancy === 0
                      ? "Расчёт сходится с текущим остатком"
                      : `Расхождение с текущим остатком: ${formatSignedCash(driverCashDiscrepancy)}`}
                  </div>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <div style={{ color: "#666", fontSize: 13 }}>Остаток не закрыт с</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>
                  {toCashNumber(driverCashSummary?.ost_cash) > 0
                    ? formatCashDate(driverCashSummary?.balance_open_since)
                    : "Остаток закрыт"}
                </div>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <div style={{ color: "#666", fontSize: 13 }}>Последняя сдача</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>
                  {formatCashDateTime(driverCashSummary?.last_give_at)}
                </div>
                <div style={{ fontSize: 13, marginTop: 2 }}>
                  Сумма: {driverCashSummary?.last_give_amount ?? 0}
                </div>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <div style={{ color: "#666", fontSize: 13 }}>Последнее поступление наличных</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>
                  {formatCashDateTime(driverCashSummary?.last_cash_at)}
                </div>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  Дни максимального роста остатка за всё время до конца выбранного периода
                </div>
                {driverCashSummary?.top_growth_days?.length ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Дата</TableCell>
                          <TableCell align="right">Изменение</TableCell>
                          <TableCell align="right">Остаток на конец</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {driverCashSummary.top_growth_days.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell>{formatCashDate(day.date)}</TableCell>
                            <TableCell align="right">
                              {formatSignedCash(day.balance_change)}
                            </TableCell>
                            <TableCell align="right">{day.ending_balance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <div style={{ color: "#666" }}>Дней с ростом остатка нет</div>
                )}
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
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
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDate.bind(this, "date_start")}
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
              func={this.changeDate.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
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
              xs: 12,
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
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Вся сумма</TableCell>
                    <TableCell>Сумма (нал.)</TableCell>
                    <TableCell>Инкассация</TableCell>
                    <TableCell>Сумма (безнал.)</TableCell>
                    <TableCell>Кол-во (нал.)</TableCell>
                    <TableCell>Кол-во (безнал.)</TableCell>
                    <TableCell>К сдаче</TableCell>

                    <TableCell>Сдал за период</TableCell>

                    {this.state.show_dop == 0 ? false : <TableCell>Кол-во в радиусе</TableCell>}

                    <TableCell>Довозы</TableCell>
                    <TableCell style={{ display: "none" }}>Ошибки</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Заказы</TableCell>
                    <TableCell>Заработал</TableCell>
                    <TableCell>Наличных на руках</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.drive_stat_full.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.full_sum}</TableCell>
                      <TableCell>{item.full_cash}</TableCell>
                      <TableCell>{item.cash_fiskal}</TableCell>
                      <TableCell>{item.full_bank}</TableCell>
                      <TableCell>{item.count_cash}</TableCell>
                      <TableCell>{item.count_bank}</TableCell>
                      <TableCell>{item.sdacha}</TableCell>

                      <TableCell>{item.give_by_date}</TableCell>

                      {this.state.show_dop == 0 ? (
                        false
                      ) : (
                        <TableCell>{item.count_true_dist}</TableCell>
                      )}

                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={this.getStatDop.bind(this, item)}
                          style={{ fontWeight: "bolder" }}
                        >
                          {item.dop_price ? item.dop_price : 0}
                        </Button>
                      </TableCell>

                      <TableCell style={{ display: "none" }}>{item.err_summ}</TableCell>
                      <TableCell>{item.my_price ? item.my_price : 0}</TableCell>

                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={this.getStatDopMain.bind(this, item)}
                          style={{ fontWeight: "bolder" }}
                        >
                          {item.my_orders ? item.my_orders : 0}
                        </Button>
                      </TableCell>

                      <TableCell>{item.my}</TableCell>
                      <TableCell>{item.ost_cash}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          disabled={!this.canAccess("get_cash")}
                          onClick={this.getCash.bind(this, item.driver_id, item.ost_cash)}
                        >
                          Сдать
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          disabled={!this.canAccess("give_cash")}
                          onClick={this.giveCash.bind(this, item)}
                        >
                          Доп. выплата
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {this.state.driver_cash_by_date?.dates?.length ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <h2>Временная таблица: наличные по датам</h2>

              <TableContainer
                component={Paper}
                style={{ overflowX: "auto", paddingBottom: 8, scrollbarGutter: "stable" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{
                          backgroundColor: "#fff",
                          boxShadow: "2px 0 4px rgba(0, 0, 0, 0.08)",
                          left: 0,
                          minWidth: 340,
                          position: "sticky",
                          zIndex: 3,
                        }}
                      >
                        Курьер
                      </TableCell>

                      {this.state.driver_cash_by_date.dates.map((date) => {
                        const analytics = getDayAnalytics(this.state.driver_cash_by_date, date);

                        return (
                          <TableCell
                            key={date}
                            colSpan={4}
                            style={{ borderLeft: "1px solid #eee", textAlign: "center" }}
                          >
                            <div>{dayjs(date).format("DD.MM.YYYY")}</div>
                            <div
                              style={{
                                color: "#666",
                                fontSize: 11,
                                fontWeight: 400,
                                marginTop: 4,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Вырос: {analytics.increased} · Снизился: {analytics.decreased} · Без
                              изменений: {analytics.unchanged} · Пересдали: {analytics.overpaid}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{
                          backgroundColor: "#fff",
                          boxShadow: "2px 0 4px rgba(0, 0, 0, 0.08)",
                          left: 0,
                          minWidth: 340,
                          position: "sticky",
                          zIndex: 3,
                        }}
                      ></TableCell>

                      {this.state.driver_cash_by_date.dates.map((date) => (
                        <React.Fragment key={date}>
                          <TableCell
                            style={{
                              borderLeft: "1px solid #eee",
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            К сдаче
                          </TableCell>
                          <TableCell style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            Сдал за период
                          </TableCell>
                          <TableCell style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            Наличных на руках
                          </TableCell>
                          <TableCell style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            Изменение остатка
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.driver_cash_by_date.drivers.map((driver) => {
                      const summary = getDriverCashSummary(
                        driver,
                        this.state.driver_cash_by_date.dates,
                      );
                      const summaryDiscrepancy =
                        toCashNumber(summary.ost_cash) -
                        toCashNumber(summary.opening_cash) -
                        toCashNumber(summary.balance_change);

                      return (
                        <TableRow key={driver.driver_id}>
                          <TableCell
                            style={{
                              backgroundColor: "#fff",
                              boxShadow: "2px 0 4px rgba(0, 0, 0, 0.08)",
                              left: 0,
                              minWidth: 340,
                              position: "sticky",
                              zIndex: 1,
                            }}
                          >
                            <Button
                              variant="text"
                              onClick={() => this.setState({ driverCashDetails: driver })}
                              style={{
                                alignItems: "flex-start",
                                color: "inherit",
                                display: "flex",
                                flexDirection: "column",
                                padding: 0,
                                textAlign: "left",
                                textTransform: "none",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{driver.name}</span>
                              <span style={{ color: "#666", fontSize: 11, marginTop: 3 }}>
                                Было: {summary.opening_cash} · Изм.:{" "}
                                {formatSignedCash(summary.balance_change)} · Сейчас:{" "}
                                {summary.ost_cash}
                              </span>
                              <span style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
                                {toCashNumber(summary.ost_cash) > 0
                                  ? `Не закрыт с: ${formatCashDate(summary.balance_open_since)}`
                                  : getBalanceStatus(toCashNumber(summary.ost_cash))}
                              </span>
                              {summaryDiscrepancy !== 0 ? (
                                <span style={{ color: "#d32f2f", fontSize: 11, marginTop: 2 }}>
                                  Расхождение: {formatSignedCash(summaryDiscrepancy)}
                                </span>
                              ) : null}
                            </Button>
                          </TableCell>

                          {this.state.driver_cash_by_date.dates.map((date) => {
                            const analytics = getCashAnalytics(driver.values?.[date]);
                            const dailyDiscrepancy =
                              analytics.ostCash - analytics.openingCash - analytics.balanceChange;
                            const changeBackgroundColor =
                              dailyDiscrepancy !== 0
                                ? "#fff3e0"
                                : analytics.balanceChange > 0
                                  ? "#ffebee"
                                  : analytics.balanceChange < 0
                                    ? "#e8f5e9"
                                    : "#f5f5f5";
                            const balanceBackgroundColor =
                              analytics.ostCash < 0
                                ? "#e3f2fd"
                                : analytics.ostCash > 0
                                  ? "#fff8e1"
                                  : "#e8f5e9";

                            return (
                              <React.Fragment key={date}>
                                <TableCell
                                  style={{ borderLeft: "1px solid #eee", textAlign: "center" }}
                                >
                                  {analytics.sdacha}
                                </TableCell>
                                <TableCell style={{ textAlign: "center" }}>
                                  {analytics.giveByDate}
                                </TableCell>
                                <TableCell
                                  style={{
                                    backgroundColor: balanceBackgroundColor,
                                    textAlign: "center",
                                  }}
                                >
                                  <Tooltip
                                    arrow
                                    title={<CashAnalyticsTooltip data={analytics} />}
                                  >
                                    <div style={{ cursor: "help" }}>
                                      <div style={{ fontWeight: 600 }}>{analytics.ostCash}</div>
                                      <div style={{ fontSize: 11, marginTop: 2 }}>
                                        {getBalanceStatus(analytics.ostCash)}
                                      </div>
                                    </div>
                                  </Tooltip>
                                </TableCell>
                                <TableCell
                                  style={{
                                    backgroundColor: changeBackgroundColor,
                                    fontWeight: 600,
                                    textAlign: "center",
                                  }}
                                >
                                  <Tooltip
                                    arrow
                                    title={<CashAnalyticsTooltip data={analytics} />}
                                  >
                                    <div style={{ cursor: "help" }}>
                                      <div>{formatSignedCash(analytics.balanceChange)}</div>
                                      <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>
                                        {getDailyCashStatus(analytics)}
                                      </div>
                                    </div>
                                  </Tooltip>
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>

                  <TableFooter>
                    <TableRow>
                      <TableCell
                        style={{
                          backgroundColor: "#fafafa",
                          boxShadow: "2px 0 4px rgba(0, 0, 0, 0.08)",
                          fontWeight: 600,
                          left: 0,
                          minWidth: 340,
                          position: "sticky",
                          whiteSpace: "nowrap",
                          zIndex: 2,
                        }}
                      >
                        Итого
                      </TableCell>

                      {this.state.driver_cash_by_date.dates.map((date) => (
                        <React.Fragment key={date}>
                          <TableCell style={{ borderLeft: "1px solid #eee", textAlign: "center" }}>
                            {this.state.driver_cash_by_date.totals?.[date]?.sdacha ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {this.state.driver_cash_by_date.totals?.[date]?.give_by_date ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {this.state.driver_cash_by_date.totals?.[date]?.ost_cash ?? 0}
                          </TableCell>
                          <TableCell style={{ fontWeight: 600, textAlign: "center" }}>
                            {formatSignedCash(
                              this.state.driver_cash_by_date.totals?.[date]?.balance_change ??
                                toCashNumber(
                                  this.state.driver_cash_by_date.totals?.[date]?.sdacha,
                                ) -
                                  toCashNumber(
                                    this.state.driver_cash_by_date.totals?.[date]?.give_by_date,
                                  ),
                            )}
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Grid>
          ) : null}

          {this.state.drive_stat_date == null ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Курьер</TableCell>

                      {this.state.drive_stat_date.orders.map((item, key) => (
                        <TableCell
                          key={key}
                          colSpan={4}
                          style={{ textAlign: "center" }}
                        >
                          {item.date}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>

                      {this.state.drive_stat_date.orders.map((item, key) => (
                        <React.Fragment key={key}>
                          <TableCell style={{ textAlign: "center" }}>Наличка</TableCell>
                          <TableCell style={{ textAlign: "center" }}>Безнал</TableCell>
                          <TableCell style={{ textAlign: "center" }}>Сдача</TableCell>
                          <TableCell style={{ textAlign: "center" }}>Заработал</TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.drive_stat_date.unic_users.map((item, key) => (
                      <TableRow key={key}>
                        <TableCell style={{ borderRight: "1px solid #eee" }}>
                          {item.short_name}
                        </TableCell>

                        {this.state.drive_stat_date.orders.map(function (order, order_k) {
                          let check = false,
                            data = {};

                          order["new_users"].map(function (it, k) {
                            if (
                              parseInt(it["driver_id"]) == parseInt(item["driver_id"]) &&
                              it["date"] == order["date"]
                            ) {
                              check = true;
                              data = it;
                            }
                          });

                          if (check == false) {
                            return (
                              <TableCell
                                key={order_k}
                                colSpan={4}
                                style={{ borderRight: "1px solid #eee" }}
                              ></TableCell>
                            );
                          } else {
                            return (
                              <React.Fragment key={order_k}>
                                <TableCell style={{ textAlign: "center" }}>
                                  {data.full_cash}
                                </TableCell>
                                <TableCell style={{ textAlign: "center" }}>
                                  {data.full_bank}
                                </TableCell>
                                <TableCell style={{ textAlign: "center" }}>{data.sdacha}</TableCell>
                                <TableCell
                                  style={{ borderRight: "1px solid #eee", textAlign: "center" }}
                                >
                                  {data.my}
                                </TableCell>
                              </React.Fragment>
                            );
                          }
                        })}
                      </TableRow>
                    ))}
                  </TableBody>

                  <TableFooter>
                    <TableRow>
                      <TableCell style={{ borderRight: "1px solid #eee" }}></TableCell>

                      {this.state.drive_stat_date.orders.map((item, key) => (
                        <React.Fragment key={key}>
                          <TableCell
                            key={key + "_1"}
                            style={{ textAlign: "center" }}
                          >
                            {item.full_cash}
                          </TableCell>
                          <TableCell
                            key={key + "_2"}
                            style={{ textAlign: "center" }}
                          >
                            {item.full_bank}
                          </TableCell>
                          <TableCell
                            key={key + "_3"}
                            style={{ textAlign: "center" }}
                          >
                            {item.sdacha}
                          </TableCell>
                          <TableCell
                            key={key + "_4"}
                            style={{ borderRight: "1px solid #eee", textAlign: "center" }}
                          >
                            {item.my}
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function DriverStat() {
  return <DriverStat_ />;
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
