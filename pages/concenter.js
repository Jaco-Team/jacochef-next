import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import TableCell from "@mui/material/TableCell";

const Table = dynamic(() => import("@mui/material/Table"), { ssr: true });
const TableBody = dynamic(() => import("@mui/material/TableBody"), { ssr: true });
const TableHead = dynamic(() => import("@mui/material/TableHead"), { ssr: true });
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { api, api_laravel, api_laravel_local } from "@/src/api_new";

import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Checkbox from "@mui/material/Checkbox";
import { formatDate } from "@/src/helpers/ui/formatDate";
import DriversMap from "@/ui/DriversMap/DriversMap";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import { styled, Switch } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { ModalProblems } from "@/components/concenter/ModalProblems";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const IOSSwitch = styled((props) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 42,
  height: 26,
  marginRight: 5,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#e82d2d",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#ec1919",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#ec1919",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

class Concenter_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "concenter",
      module_name: "",
      is_load: false,
      acces: {},
      err_info: {},
      sort: false,
      modalDialogProblem: false,
      modalDialog: false,
      modalDialogDel: false,
      modalDialogDriver: false,
      modalDialogDelDriver: false,
      confirmDialog: false,
      confirmDialogDel: false,
      checkedKey: {},
      current_name: "",
      problem_arr: [],
      checkedDiffOrder: false,
      checkAddress: false,
      orderDiff: "",
      positions: [],
      address: "",
      comment: "",
      point: {},
      cities: [],
      city_id: "",
      text: "",
      date: formatDate(new Date()),
      point_list: [],
      need_point_list: [],
      point_id: 0,
      indexTab: 0,

      orders: [],
      ordersRender: [],
      showOrder: null,
      checkedError: false,

      radiogroup_options: [
        { id: "0", label: "Решили отредактировать заказ", value: 0 },
        { id: "1", label: "Не устраивает время ожидания", value: 0 },
        { id: "2", label: "Изменились планы", value: 0 },
        { id: "3", label: "Недостаточно средств", value: 0 },
        { id: "4", label: "Другое", value: 0 },
      ],
      textDel: "",
      typeDel: -1,

      number: "",
      addr: "",
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");
    const checked = localStorage.getItem("checkedError");
    console.log(checked === "1");
    this.setState({
      checkedError: checked === "1",
    });

    let need_points = data.points.filter(
      (item) => parseInt(item.city_id) == parseInt(data.cities[0].id),
    );

    this.setState({
      module_name: data.module_info.name,
      cities: data.cities,
      checkedKey: {},
      point_list: data.points,
      need_point_list: need_points,
      point_id: parseInt(need_points[0].id),
      acces: data.acces,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      this.getOrders();
    }, 300);
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
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

  changeCity(event) {
    this.setState({
      number: "",
      addr: "",
    });

    let data = event.target.value;

    let need_points = this.state.point_list?.filter(
      (item, key) => parseInt(item.city_id) == parseInt(data),
    );

    this.setState({
      city_id: data,
      need_point_list: need_points,
      point_id: parseInt(need_points[0]?.id),
      indexTab: 0,
    });

    setTimeout(() => {
      this.getOrders();
    }, 300);
  }

  async changePoint(point_id, index) {
    //let point_id = event.target.id;
    //point_id = point_id.split('-')[2]

    this.setState({
      point_id: point_id,
      indexTab: index,
    });

    setTimeout(() => {
      this.getOrders();
    }, 300);
  }

  async getOrders() {
    let data = {
      point_id: this.state.point_id,
      date: dayjs(this.state.date).format("YYYY-MM-DD"),
      sort: this.state.sort,
    };

    let res = await this.getData("get_orders", data);

    // console.log( res )

    this.setState({
      orders: res.orders,
      err_info: res.err_info,
    });

    setTimeout(() => {
      this.filterNumber();
    }, 300);
  }

  btnGetOrders() {
    this.setState({
      number: "",
      addr: "",
    });

    this.getOrders();
  }

  async showOrder(order_id) {
    let data = {
      point_id: this.state.point_id,
      order_id: order_id,
    };

    let res = await this.getData("get_order_new", data);

    // console.log( res )

    this.setState({
      modalDialog: true,
      showOrder: res,
    });
  }

  closeOrder() {
    this.setState({ modalDialogDel: true });
  }

  closeDriver() {
    this.setState({ modalDialogDelDriver: true });
  }

  async closeOrderTrue() {
    let deltype = this.state.radiogroup_options.find((item) => item.id == this.state.typeDel);

    let data = {
      typeCreate: "center",
      order_id: this.state.showOrder.order.order_id,
      point_id: this.state.showOrder.order.point_id,
      ans: parseInt(deltype.id) == 4 ? this.state.textDel : deltype.label,
    };

    let res = await this.getData("close_order_center", data);

    //setTimeout(() => {
    if (res["st"] === true) {
      this.setState({
        modalDialogDel: false,
        modalDialog: false,
      });

      await this.getOrders();
    } else {
      alert(res["text"]);
    }
    //}, 300);
  }

  async closeDriverTrue() {
    let data = {
      order_id: this.state.showOrder.order.order_id,
      point_id: this.state.showOrder.order.point_id,
    };

    let res = await this.getData("close_order_driver", data);

    if (res["st"] === true) {
      this.setState({
        modalDialogDelDriver: false,
      });

      await this.showOrder(this.state.showOrder.order.order_id);
    } else {
      this.setState({
        modalDialogDelDriver: false,
      });
      alert(res["text"]);
    }
  }

  async fakeUser() {
    let type_check = 0;
    let text = this.state.text;
    if (parseInt(this.state.showOrder.order.check_pos) >= 0) {
      if (parseInt(this.state.showOrder.order.check_pos) <= 100) {
        type_check = 1;
      } else {
        type_check = 2;
      }
    } else {
      type_check = 0;
    }

    //0 - не активно
    //1 - сразу
    //2 - уточнить

    if (parseInt(type_check) == 0) {
      alert("Создать обращение не возможно");
      return;
    }

    if (parseInt(type_check) == 1) {
      if (text) {
        let data = {
          text: text,
          point_id: parseInt(this.state.showOrder.order.point_id),
          order_id: parseInt(this.state.showOrder.order.order_id),
        };

        let res = await this.getData("fake_user", data);

        if (res["st"] == true) {
          alert("Обращение зафиксировано");
          this.setState({ modalDialog: false });
        } else {
          alert(res["text"]);
        }
      } else {
        alert("надо указать комментарий");
      }
    }

    if (parseInt(type_check) == 2) {
      if (text) {
        let data = {
          text: text,
          point_id: parseInt(this.state.showOrder.order.point_id),
          order_id: parseInt(this.state.showOrder.order.order_id),
        };

        let res = await this.getData("fake_user", data);

        if (res["st"] == true) {
          alert("Обращение зафиксировано");
          this.setState({ modalDialog: false });
        } else {
          alert(res["text"]);
        }
      } else {
        alert("надо указать комментарий");
      }
    }
  }

  changeText(event) {
    this.setState({ textDel: event.target.value });
  }

  changeAddr = (event) => {
    this.setState({
      typeDel: event.target.value,
    });
  };

  changeDate(val) {
    this.setState({
      number: "",
      addr: "",
    });

    this.setState({
      date: val,
    });

    setTimeout(() => {
      this.getOrders();
    }, 300);
  }

  changeNumber(event) {
    let value = event.target.value;

    if (isNaN(value)) {
      return;
    }

    this.setState({ number: value });

    setTimeout(() => {
      this.filterNumber();
    }, 300);
  }

  changeAddrSt(event) {
    let value = event.target.value;

    this.setState({ addr: value });

    setTimeout(() => {
      this.filterNumber();
    }, 300);
  }

  filterNumber() {
    let renderOrders = this.state.orders;

    if (this.state.number.length > 0) {
      renderOrders = renderOrders.filter((item) => item.number.indexOf(this.state.number) !== -1);
    }

    if (this.state.addr.length > 0) {
      renderOrders = renderOrders.filter(
        (item) =>
          (item.street + " " + item.home).toLowerCase().indexOf(this.state.addr.toLowerCase()) !==
          -1,
      );
    }

    this.setState({
      ordersRender: renderOrders,
    });
  }

  hasAccess = (flag) => flag === "1" || flag === 1;

  onError = () => {
    const checked = !this.state.checkedError === true ? "1" : "0";
    localStorage.setItem("checkedError", checked);
    this.setState({
      checkedError: !this.state.checkedError,
    });
  };

  openProblems = () => {
    const positions = [];
    this.state.showOrder.order_items_for.map((item, key) => {
      if (this.state.checkedKey[key]) {
        positions.push(item);
      }
    });
    this.setState({ positions: positions, modalDialogProblem: true });
  };

  saveProblems = (solutions) => {
    const positions = this.state.positions;
    const problem_arr = [...this.state.problem_arr];
    positions.map((pos) => {
      problem_arr.push({
        ...pos,
        problem_name: solutions.value,
        problem_comment: solutions.comment,
        problem_solution: solutions.solution,
        previewUrl: solutions.previewUrl,
      });
    });

    this.setState({ problem_arr: problem_arr, modalDialogProblem: false, checkedKey: {} });
  };

  render() {
    const { acces, err_info } = this.state;
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {!this.state.showOrder ? null : (
          <Dialog
            open={!!this.state.modalDialog}
            onClose={() => {
              this.setState({ modalDialog: false, checkedKey: {} });
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="lg"
            fullWidth={true}
          >
            <DialogTitle style={{ textAlign: "center" }}>
              <span
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "8px",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  marginRight: "28px",
                }}
              >
                Заказ #{this.state.showOrder.order.order_id}
              </span>
            </DialogTitle>
            {this.hasAccess(acces?.err_order_mod_access) ? (
              <div
                style={{
                  backgroundColor: "#f5f5f8",
                  margin: "10px",
                  display: "flex",
                  borderRadius: "12px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f5f5f8",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ReportProblemOutlinedIcon
                    style={{ marginLeft: "10px", marginRight: "10px", color: "red" }}
                  />
                  <span>Режим описания ошибок</span>
                </div>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      onClick={this.onError}
                      checked={this.state.checkedError}
                      color="secondary"
                      size="medium"
                    />
                  }
                  labelPlacement="right"
                  style={{ marginLeft: "auto" }}
                />
              </div>
            ) : null}
            {this.state.checkedError && this.hasAccess(acces?.err_order_mod_access) ? (
              <Grid
                container
                spacing={0}
                style={{ padding: "12px" }}
              >
                <Grid
                  style={{ marginBottom: "12px" }}
                  size={{
                    xs: 12,
                  }}
                >
                  <MyCheckBox
                    label="Привезли другой заказ"
                    value={this.state.checkedDiffOrder}
                    func={() => this.setState({ checkedDiffOrder: !this.state.checkedDiffOrder })}
                  />
                  {this.state.checkedDiffOrder ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <MyTextInput
                        placeholder={"Введите номер привезенного заказа"}
                        label=""
                        value={this.state.orderDiff}
                        func={(e) => this.setState({ orderDiff: e.target.value })}
                      />
                      <Button
                        variant="contained"
                        style={{ marginLeft: "12px" }}
                      >
                        Сохранить
                      </Button>
                    </div>
                  ) : null}
                </Grid>
              </Grid>
            ) : null}
            <DialogContent>
              <Grid
                container
                spacing={0}
              >
                <Grid size={{ xs: 5 }}>
                  <Grid
                    style={{ marginBottom: "12px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <span>
                      <b>{this.state.showOrder.order.type_order}</b> <br />{" "}
                      {this.state.showOrder.order.type_order_addr_new}
                    </span>
                  </Grid>
                  {parseInt(this.state.showOrder.order.type_order_) == 1 ? (
                    parseInt(this.state.showOrder.order.fake_dom) == 0 ? (
                      <Grid
                        style={{ marginBottom: "12px" }}
                        size={{
                          xs: 12,
                        }}
                      >
                        <b style={{ color: "red", fontWeight: 900 }}>Домофон не работает</b>
                      </Grid>
                    ) : (
                      <Grid
                        style={{ marginBottom: "12px" }}
                        size={{
                          xs: 12,
                        }}
                      >
                        <b style={{ color: "green", fontWeight: 900 }}>Домофон работает</b>
                      </Grid>
                    )
                  ) : null}
                  <Grid
                    style={{ marginBottom: "12px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <span>
                      <b>{this.state.showOrder.order.time_order_name}</b>
                      <br /> {this.state.showOrder.order.time_order}
                    </span>
                  </Grid>

                  {this.state.showOrder.order.number.length > 1 &&
                  this.hasAccess(acces?.tel_access) ? (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Телефон </b> <br />
                      <span>{this.state.showOrder.order.number}</span>
                    </Grid>
                  ) : null}

                  {this.state.showOrder.order.delete_reason.length > 0 ? (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <span style={{ color: "red" }}>
                        <b>Удален</b>
                        <br /> {this.state.showOrder.order.date_time_delete}
                      </span>
                    </Grid>
                  ) : null}
                  {this.state.showOrder.order.delete_reason.length > 0 ? (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <span style={{ color: "red" }}>
                        {this.state.showOrder.order.delete_reason}
                      </span>
                    </Grid>
                  ) : null}

                  {parseInt(this.state.showOrder.order.is_preorder) == 1 ? null : (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <span>
                        {this.state.showOrder.order.text_time}
                        {this.state.showOrder.order.time_to_client}
                      </span>
                    </Grid>
                  )}

                  <Grid
                    style={{ marginBottom: "12px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <span>{this.state.showOrder.order.textTime}</span>
                  </Grid>

                  {this.state.showOrder.order.promo_name == null ||
                  this.state.showOrder.order.promo_name.length == 0 ? null : (
                    <>
                      <Grid
                        style={{ marginBottom: "12px" }}
                        size={{
                          xs: 12,
                        }}
                      >
                        <b>Промокод</b> <br />
                        <span>{this.state.showOrder.order.promo_name}</span>
                      </Grid>
                      <Grid
                        style={{ marginBottom: "12px" }}
                        size={{
                          xs: 12,
                        }}
                      >
                        <span className="noSpace">{this.state.showOrder.order.promo_text}</span>
                      </Grid>
                    </>
                  )}

                  {this.state.showOrder.order.comment == null ||
                  this.state.showOrder.order.comment.length == 0 ? null : (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Комментарий </b>
                      <br />
                      <span>{this.state.showOrder.order.comment}</span>
                    </Grid>
                  )}

                  {this.state.showOrder.order.sdacha == null ||
                  parseInt(this.state.showOrder.order.sdacha) == 0 ? null : (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Сдача </b>
                      <br />
                      <span>{this.state.showOrder.order.sdacha}</span>
                    </Grid>
                  )}

                  {this.state.showOrder.order.client_name && (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Клиент</b> <br />
                      <span> {this.state.showOrder.order.client_name}</span>
                    </Grid>
                  )}

                  {this.state.showOrder.order.driver_name && (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Курьер</b> <br />
                      <span> {this.state.showOrder.order.driver_name}</span>
                    </Grid>
                  )}

                  {this.state.showOrder.order.type_pay &&
                    this.hasAccess(acces?.type_order_access) && (
                      <Grid
                        style={{ marginBottom: "12px" }}
                        size={{
                          xs: 12,
                        }}
                      >
                        <b>Тип оплаты</b> <br />
                        <span> {this.state.showOrder.order.type_pay}</span>
                      </Grid>
                    )}

                  <Grid
                    style={{ marginBottom: "12px" }}
                    size={{
                      xs: 12,
                    }}
                  >
                    <b>Сумма заказа </b>
                    <br />
                    <span style={{ marginBottom: "12px" }}>
                      {this.state.showOrder.order.sum_order} р
                    </span>
                  </Grid>

                  {this.state.showOrder.order.check_pos_drive == null ||
                  !this.state.showOrder.order.check_pos_drive ? null : (
                    <Grid
                      style={{ marginBottom: "12px" }}
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Довоз оформлен </b>
                      <br />
                      <span>{this.state.showOrder.order.check_pos_drive.comment}</span>
                    </Grid>
                  )}
                </Grid>
                <ModalProblems
                  positions={this.state.positions}
                  problem_arr={this.state.problem_arr}
                  open={this.state.modalDialogProblem}
                  current_name={this.state.current_name}
                  onClose={() => this.setState({ modalDialogProblem: false })}
                  title={`Проблема с ${Object.entries(this.state.checkedKey).length} позициями`}
                  save={this.saveProblems}
                />
                <Grid
                  size={{
                    xs: 7,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <h3>Состав заказа</h3>
                    {Object.entries(this.state.checkedKey).filter((item) => item[1]).length ? (
                      <Button
                        variant="contained"
                        onClick={this.openProblems}
                      >
                        Проблема для{" "}
                        {Object.entries(this.state.checkedKey).filter((item) => item[1]).length}{" "}
                        позиций
                      </Button>
                    ) : null}
                  </div>
                  <div>
                    {!this.state.checkedError ? (
                      <Table
                        size={"small"}
                        style={{
                          marginTop: 15,
                          borderSpacing: "0 6px",
                          borderCollapse: "separate",
                        }}
                      >
                        <TableBody>
                          {this.state.showOrder.order_items.map((item, key) => (
                            <TableRow
                              key={key}
                              style={{
                                border: "none",
                                backgroundColor: "#f6f6f6",
                                borderRadius: "12px",
                              }}
                            >
                              <TableCell
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  border: "none",
                                  marginBottom: "10px",
                                  height: "32px",
                                }}
                              >
                                <span>{item.name}</span>
                              </TableCell>
                              <TableCell
                                style={{ border: "none", marginBottom: "10px", height: "32px" }}
                              >
                                {item.count}
                              </TableCell>
                              <TableCell
                                style={{
                                  borderRadius: "0  10px 10px 0",
                                  border: "none",
                                  marginBottom: "10px",
                                  height: "32px",
                                }}
                              >
                                {item.price} р
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell
                              style={{
                                fontWeight: "bold",
                                color: "#000",
                                border: "none",
                                float: "right",
                              }}
                            >
                              Сумма закза
                            </TableCell>
                            <TableCell
                              style={{
                                border: "none",
                              }}
                            ></TableCell>
                            <TableCell
                              style={{
                                color: "#000",
                                border: "none",
                              }}
                            >
                              {this.state.showOrder.order.sum_order} р
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    ) : (
                      <Table
                        size={"small"}
                        style={{
                          marginTop: 15,
                          borderSpacing: "0 6px",
                          borderCollapse: "separate",
                        }}
                      >
                        <TableBody>
                          {this.state.showOrder.order_items_for.map((item, key) => (
                            <TableRow
                              key={key}
                              style={{
                                border: "none",
                                backgroundColor: "#f6f6f6",
                                borderRadius: "12px",
                              }}
                            >
                              <TableCell
                                style={{
                                  borderRadius: "10px 0 0 10px",
                                  border: "none",
                                  marginBottom: "10px",
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center" }}>
                                  {this.state.checkedError ? (
                                    <span>
                                      <MyCheckBox
                                        value={this.state.checkedKey[key] === true}
                                        func={(e) =>
                                          this.setState({
                                            checkedKey: {
                                              ...this.state.checkedKey,
                                              [key]: e.target.checked,
                                              current_name: "",
                                            },
                                          })
                                        }
                                        style={{ padding: 0.5 }}
                                      />
                                    </span>
                                  ) : null}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "flex-start",
                                    }}
                                  >
                                    <span
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        this.setState(
                                          {
                                            checkedKey: {
                                              ...{},
                                              [key]: true,
                                            },
                                            current_name: item.id,
                                          },
                                          () => {
                                            this.openProblems();
                                          },
                                        );
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                    {this.state.problem_arr.find((it) => it?.id === item.id)
                                      ?.problem_name ? (
                                      <span
                                        style={{
                                          color: "#fff",
                                          border: "1px solid red",
                                          borderRadius: "12px",
                                          backgroundColor: "#e12a58",
                                          padding: "2px 10px",
                                          width: "max-content",
                                        }}
                                        className="special-badge"
                                      >
                                        {
                                          this.state.problem_arr.find((it) => it?.id === item.id)
                                            ?.problem_name
                                        }
                                      </span>
                                    ) : null}
                                  </div>
                                </span>
                              </TableCell>
                              <TableCell
                                onClick={() => {
                                  this.setState(
                                    {
                                      checkedKey: {
                                        ...{},
                                        [key]: true,
                                      },
                                    },
                                    () => {
                                      this.openProblems();
                                    },
                                  );
                                }}
                                style={{
                                  borderRadius: "0  10px 10px 0",
                                  border: "none",
                                  marginBottom: "10px",
                                  cursor: "pointer",
                                  height: "32px",
                                }}
                              >
                                {item.price} р.
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {this.hasAccess(acces?.disband_access) && !this.state.checkedError && (
                      <Accordion
                        style={{
                          width: "98%",
                          borderRadius: "16px",
                          marginTop: "10px",
                          boxShadow: "none",
                          border: "2px solid #d4d4d4",
                        }}
                        sx={{
                          "& .MuiAccordionSummary-root": {
                            minHeight: "30px",
                            padding: "0 12px",
                          },
                          "& .MuiAccordionSummary-content": {
                            margin: "8px 0",
                          },
                          "& .MuiAccordionDetails-root": {
                            padding: "8px 16px",
                          },
                          ":before": {
                            height: 0,
                          },
                        }}
                      >
                        <AccordionSummary
                          sx={{
                            margin: "0",
                            "& .MuiAccordionSummary-content": {
                              margin: "0 !important",
                            },
                          }}
                          expandIcon={<ExpandMoreIcon />}
                        >
                          <Typography>Расформировка</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Table
                            size={"small"}
                            style={{ marginTop: 15 }}
                          >
                            <TableBody>
                              {this.state.showOrder.order_items_.map((item, key) => (
                                <TableRow key={key}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell
                                    style={{
                                      backgroundColor:
                                        parseInt(item.ready) > 0 ? "#6ab04c" : "#eb4d4b",
                                    }}
                                  ></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </div>

                  {this.hasAccess(acces?.list_driver_access) &&
                    this.state.showOrder.order.type_order_ === 1 &&
                    this.state.showOrder.driver_stat.length > 0 && (
                      <Accordion style={{ width: "100%" }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Курьеры</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Table
                            size={"small"}
                            style={{ marginTop: 15 }}
                          >
                            <TableBody>
                              {this.state.showOrder.driver_stat.map((item, key) => (
                                <TableRow key={key}>
                                  <TableCell>{item.date_time}</TableCell>
                                  <TableCell>{item.type}</TableCell>
                                  <TableCell>{item.driver}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionDetails>
                      </Accordion>
                    )}
                </Grid>
                {this.state.problem_arr.length &&
                this.state.problem_arr.find((item) => item?.problem_id === 3)?.problem_id ? (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <MyCheckBox
                      label="На тот же адрес"
                      value={this.state.checkAddress}
                      func={() => {
                        if (!this.state.checkAddress === true) {
                          this.setState({
                            checkAddress: true,
                            address: this.state.showOrder.order.type_order_addr_new,
                          });
                        } else {
                          this.setState({
                            checkAddress: false,
                            address: "",
                          });
                        }
                      }}
                    />
                    <MyAutocomplite
                      multiple={false}
                      data={this.state.point_list}
                      value={this.state.point}
                      func={(e, value) => this.setState({ point: e })}
                      style={{ marginBottom: "12px" }}
                      label="Выбрать кафе"
                    />
                    <MyTextInput
                      style={{ marginBottom: "12px" }}
                      placeholder={"Введите номер привезенного заказа"}
                      label="Или введите адрес"
                      value={this.state.address}
                    />
                    <MyTextInput
                      multiline={true}
                      rows={4}
                      style={{ marginBottom: "12px" }}
                      value={this.state.comment}
                      func={(e) => this.setState({ comment: e.target.value })}
                      label={"Комментарий ко всему заказу"}
                    />
                    <Button
                      variant="contained"
                      style={{ marginTop: "12px" }}
                    >
                      Сохранить
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </DialogContent>

            {parseInt(this.state.showOrder.order.is_delete) == 0 &&
            parseInt(this.state.showOrder.order.status_order) !== 6 &&
            parseInt(acces?.del_ord_access) ? (
              <DialogActions
                style={{ justifyContent: "center", padding: "15px 0px", marginLeft: "40px" }}
              >
                <ButtonGroup
                  disableElevation={true}
                  disableRipple={true}
                  variant="contained"
                  className="BtnBorderOther"
                  style={{ marginRight: 24 }}
                >
                  <Button
                    style={{ borderRadius: "12px" }}
                    variant="contained"
                    className="BtnCardMain CardInCardItem"
                    onClick={this.closeOrder.bind(this)}
                  >
                    Отменить заказ
                  </Button>
                </ButtonGroup>
              </DialogActions>
            ) : null}

            {parseInt(this.state.showOrder.order.is_delete) == 0 &&
            parseInt(this.state.showOrder.order.driver_id) &&
            parseInt(acces?.withdraw_an_order_access) &&
            parseInt(this.state.showOrder.order.status_order) !== 6 ? (
              <DialogActions style={{ justifyContent: "flex-end", padding: "15px 0px" }}>
                <ButtonGroup
                  disableElevation={true}
                  disableRipple={true}
                  variant="contained"
                  className="BtnBorderOther"
                  style={{ marginRight: 24 }}
                >
                  <Button
                    variant="contained"
                    className="BtnCardMain CardInCardItem"
                    onClick={this.closeDriver.bind(this)}
                  >
                    Снять заказ с курьера
                  </Button>
                </ButtonGroup>
              </DialogActions>
            ) : null}

            {parseInt(this.state.showOrder.order.type_order_) == 1 &&
            parseInt(this.state.showOrder.order.status_order) > 4 &&
            parseInt(this.state.showOrder.order.check_pos) >= 0 &&
            parseInt(acces?.client_not_access) ? (
              <DialogActions style={{ justifyContent: "flex-end", padding: "15px 0px" }}>
                <ButtonGroup
                  disableElevation={true}
                  disableRipple={true}
                  variant="contained"
                  className="BtnBorderOther"
                  style={{ marginRight: 24 }}
                >
                  <Button
                    variant="contained"
                    className="BtnCardMain CardInCardItemYellow"
                    onClick={() => this.setState({ confirmDialog: true })}
                  >
                    Клиент не вышел на связь
                  </Button>
                </ButtonGroup>
              </DialogActions>
            ) : null}
          </Dialog>
        )}
        {!this.state.showOrder ? null : (
          <Dialog
            open={!!this.state.modalDialogDel}
            onClose={() => {
              this.setState({ modalDialogDel: false });
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle style={{ textAlign: "center" }}>
              Отмена заказа {this.state.showOrder.order.order_id}
            </DialogTitle>
            <DialogContent>
              <FormControl component="fieldset">
                <RadioGroup
                  name="typeDel"
                  value={this.state.typeDel}
                  onChange={this.changeAddr}
                >
                  {this.state.radiogroup_options.map((item, key) => (
                    <FormControlLabel
                      key={key}
                      value={item.id}
                      control={<Radio />}
                      label={item.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <TextField
                //autoFocus
                onFocus={() => {
                  this.setState({ typeDel: "4" });
                }}
                value={this.state.textDel}
                onChange={this.changeText.bind(this)}
                margin="dense"
                id="name"
                label="Причина отмены"
                type="text"
                fullWidth
              />
            </DialogContent>

            <DialogActions style={{ paddingBottom: 24 }}>
              <ButtonGroup
                disableElevation={true}
                disableRipple={true}
                variant="contained"
                className="BtnBorderOther"
                style={{ marginRight: 24 }}
              >
                <Button
                  variant="contained"
                  className="BtnCardMain CardInCardItem"
                  onClick={() => {
                    this.setState({ delOrder: false });
                  }}
                >
                  К заказу
                </Button>
              </ButtonGroup>

              <ButtonGroup
                disableElevation={true}
                disableRipple={true}
                variant="contained"
                className="BtnBorderOther"
                style={{ marginRight: 24 }}
              >
                <Button
                  variant="contained"
                  className="BtnCardMain CardInCardItem"
                  onClick={() => this.setState({ confirmDialogDel: true })}
                >
                  Отменить заказ
                </Button>
              </ButtonGroup>
            </DialogActions>
          </Dialog>
        )}
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="xs"
          open={!!this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            <p style={{ marginBottom: 20 }}>
              Курьер, предположительно, находиться далеко от клиента, точно оформить довоз?
            </p>

            <MyTextInput
              label="Причина"
              value={this.state.text}
              multiline={true}
              maxRows={5}
              func={(event) => {
                this.setState({ text: event.target.value });
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.fakeUser.bind(this)}>Подтвердить</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="xs"
          open={!!this.state.confirmDialogDel}
          onClose={() => this.setState({ confirmDialogDel: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            <p style={{ marginBottom: 20 }}>
              "Отменить заказ #{this.state.showOrder?.order?.order_id}?
            </p>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialogDel: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.closeOrderTrue.bind(this)}>Подтвердить</Button>
          </DialogActions>
        </Dialog>
        {!this.state.showOrder ? null : (
          <Dialog
            open={this.state.modalDialogDelDriver}
            onClose={() => {
              this.setState({ modalDialogDelDriver: false });
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle style={{ textAlign: "center" }}>
              Снять с курьера заказ {this.state.showOrder.order.order_id}
            </DialogTitle>
            <DialogContent>
              Снять с курьера заказ {this.state.showOrder.order.order_id}
            </DialogContent>

            <DialogActions style={{ paddingBottom: 24 }}>
              <ButtonGroup
                disableElevation={true}
                disableRipple={true}
                variant="contained"
                className="BtnBorderOther"
                style={{ marginRight: 24 }}
              >
                <Button
                  variant="contained"
                  className="BtnCardMain CardInCardItem"
                  onClick={() => {
                    this.setState({ modalDialogDelDriver: false });
                  }}
                >
                  Отмена
                </Button>
              </ButtonGroup>

              <ButtonGroup
                disableElevation={true}
                disableRipple={true}
                variant="contained"
                className="BtnBorderOther"
                style={{ marginRight: 24 }}
              >
                <Button
                  variant="contained"
                  className="BtnCardMain CardInCardItem"
                  onClick={this.closeDriverTrue.bind(this)}
                >
                  Да
                </Button>
              </ButtonGroup>
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
              sm: 3,
            }}
          >
            <MySelect
              data={this.state.cities}
              value={this.state.city_id}
              func={this.changeCity.bind(this)}
              label="Город"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label={"Дата"}
              value={this.state.date}
              func={this.changeDate.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label={"Номер телефона"}
              value={this.state.number}
              func={this.changeNumber.bind(this)}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label={"Адрес"}
              value={this.state.addr}
              func={this.changeAddrSt.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  edge="end"
                  onChange={() =>
                    this.setState({ sort: !this.state.sort }, () => this.btnGetOrders.bind(this))
                  }
                  checked={this.state.sort}
                  sx={{ marginRight: "2px" }}
                />
              }
              sx={{ marginRight: "22px" }}
              label="Сортировать по времени выхода на стол"
            />
            <Button
              variant="contained"
              onClick={this.btnGetOrders.bind(this)}
            >
              Обновить данные
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            {err_info.all_green ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Тип</TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "yellow" }}
                      ></TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "green" }}
                      ></TableCell>
                      <TableCell
                        align="center"
                        sx={{ backgroundColor: "red" }}
                      ></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Кухня</TableCell>
                      <TableCell align="center">{err_info.yellow_cook}</TableCell>
                      <TableCell align="center">{err_info.green_cook}</TableCell>
                      <TableCell align="center">{err_info.red_cook}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Курьеры</TableCell>
                      <TableCell align="center">{err_info.yellow_dev}</TableCell>
                      <TableCell align="center">{err_info.green_dev}</TableCell>
                      <TableCell align="center">{err_info.red_dev}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Тип</TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        Вовремя клиенту
                      </TableCell>
                      <TableCell
                        align="center"
                        colSpan={2}
                        sx={{ fontWeight: "bold" }}
                      >
                        Опоздали клиенту
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Отчет</TableCell>
                      <TableCell align="center">{err_info.all_green}</TableCell>
                      <TableCell
                        align="center"
                        colSpan={2}
                      >
                        {err_info.all_red}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </Grid>

          {this.hasAccess(acces?.show_map_access) && this.state.orders.length > 0 && (
            <Grid
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Accordion>
                <AccordionSummary>
                  <Typography>Курьеры на карте</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DriversMap
                    pointId={this.state.point_id}
                    onShowOrder={async (id) => await this.showOrder(id)}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <Tabs value={this.state.indexTab}>
              {this.state.need_point_list.map((item, key) => (
                <Tab
                  key={key}
                  label={item.name}
                  onClick={this.changePoint.bind(this, item.id, key)}
                  {...a11yProps(parseInt(item.id))}
                />
              ))}
            </Tabs>
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            {this.state.ordersRender.length ? (
              <Table size={"small"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Заказ</TableCell>
                    {this.hasAccess(acces?.issuedd_access) && <TableCell>Оформил</TableCell>}
                    {this.hasAccess(acces?.num_client_access) && (
                      <TableCell>Номер клиента</TableCell>
                    )}
                    {this.hasAccess(acces?.address_access) && <TableCell>Адрес доставки</TableCell>}
                    <TableCell>Время открытия заказа</TableCell>
                    {this.hasAccess(acces?.start_stol_access) && (
                      <TableCell>Время выхода на стол</TableCell>
                    )}

                    <TableCell>Ко времени</TableCell>
                    <TableCell>Закрыт на кухне</TableCell>
                    {this.hasAccess(acces?.cook_time_access) && (
                      <TableCell>Время на готовку</TableCell>
                    )}
                    <TableCell>Получен клиентом</TableCell>
                    {this.hasAccess(acces?.delay_access) && <TableCell>До просрочки</TableCell>}
                    {this.hasAccess(acces?.dif_access) && <TableCell>Разница</TableCell>}
                    {this.hasAccess(acces?.diff2_access) && <TableCell>Готовки</TableCell>}
                    {this.hasAccess(acces?.time_promise_access) && (
                      <TableCell>Время обещ</TableCell>
                    )}
                    {this.hasAccess(acces?.time_dev_text_access) && (
                      <TableCell>Время по проге/Реал время ДОСТАВКИ</TableCell>
                    )}

                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>

                    {this.hasAccess(acces?.summ_access) && <TableCell>Сумма</TableCell>}
                    {this.hasAccess(acces?.payment_access) && <TableCell>Оплата</TableCell>}
                    {this.hasAccess(acces?.driver_access) && <TableCell>Водитель</TableCell>}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.ordersRender.map((item, key) => (
                    <TableRow
                      key={key}
                      style={
                        parseInt(item.is_delete) == 1 && this.hasAccess(acces?.late_access)
                          ? {
                              backgroundColor: "red",
                              color: "#fff",
                              fontWeight: "bold",
                            }
                          : {}
                      }
                    >
                      <TableCell
                        style={
                          parseInt(item.dist) >= 0
                            ? {
                                backgroundColor: "yellow",
                                color: "#000",
                                cursor: "pointer",
                                fontWeight: "inherit",
                              }
                            : {
                                color: "inherit",
                                cursor: "pointer",
                                fontWeight: "inherit",
                              }
                        }
                        onClick={this.showOrder.bind(this, item.id)}
                      >
                        {item.id}
                      </TableCell>
                      {this.hasAccess(acces?.issuedd_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_user}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.num_client_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.number}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.address_access) && (
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                          }}
                        >
                          {item.street} {item.home}
                        </TableCell>
                      )}
                      <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                        {item.date_time_order}
                      </TableCell>
                      {this.hasAccess(acces?.start_stol_access) && (
                        <TableCell>{item.start_stol}</TableCell>
                      )}

                      <TableCell
                        style={{
                          color: "inherit",
                          fontWeight: "inherit",
                          backgroundColor: this.hasAccess(item.is_preorder) ? "#bababa" : "inherit",
                        }}
                      >
                        {item.need_time}
                      </TableCell>
                      <TableCell
                        style={{
                          color: "inherit",
                          fontWeight: "inherit",
                          backgroundColor: this.hasAccess(acces?.late_access)
                            ? item.cook_color
                            : "",
                        }}
                      >
                        {item.give_data_time == "00:00:00" ? "" : item.give_data_time}
                      </TableCell>
                      {this.hasAccess(acces?.cook_time_access) && (
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                            backgroundColor: this.hasAccess(acces?.cook_time_access)
                              ? item.cook_color
                              : "",
                          }}
                        >
                          {item.cook_time}
                        </TableCell>
                      )}
                      <TableCell
                        style={{
                          color: "inherit",
                          fontWeight: "inherit",
                          backgroundColor: this.hasAccess(acces?.late_access) ? item.all_color : "",
                        }}
                      >
                        {item.close_order}
                      </TableCell>
                      {this.hasAccess(acces?.delay_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.to_time}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.dif_access) && (
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                            backgroundColor: this.hasAccess(acces?.dif_access)
                              ? item.all_color
                              : "",
                          }}
                        >
                          {item.dif}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.diff2_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.diff2}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.time_promise_access) && (
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                          }}
                        >
                          {item.unix_time_to_client == "0" ||
                          this.hasAccess(item.is_preorder_access) == 1
                            ? ""
                            : item.unix_time_to_client}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.time_dev_text_access) && (
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                            backgroundColor: this.hasAccess(acces?.time_dev_text_access)
                              ? item.dev_color
                              : "",
                          }}
                        >
                          {item.time_dev_text}
                        </TableCell>
                      )}

                      <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                        {item.type_order}
                      </TableCell>
                      <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                        {item.status}
                      </TableCell>

                      {this.hasAccess(acces?.summ_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.order_price}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.payment_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_pay}
                        </TableCell>
                      )}
                      {this.hasAccess(acces?.driver_access) && (
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.driver}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Concenter() {
  return <Concenter_ />;
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
