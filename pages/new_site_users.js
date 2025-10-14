import React from "react";

import Script from "next/script";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@mui/material/Typography";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { MyAutocomplite, MyDatePickerNew, TextEditor22 } from "@/ui/Forms";

import dayjs from "dayjs";
import queryString from "query-string";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";

import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MyAlert from "@/ui/MyAlert";
import { formatDate } from "@/src/helpers/ui/formatDate";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

class CatWork_ extends React.Component {
  chartordersD = null;
  click = false;

  constructor(props) {
    super(props);

    this.myRef = React.createRef();
    this.myRef_action = React.createRef();

    this.state = {
      module: "new_site_users",
      module_name: "",
      is_load: false,

      cats: [],
      modalDialog: false,

      nameCat: "",
      editText: "",

      nameCatNew: "",
      editTextNew: "",

      config: {
        readonly: false, // all options from https://xdsoft.net/jodit/doc/
      },

      showCat: null,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      points: [],
      point: [],
      svod: [],
      modalDialogNew: false,
      user_info: null,
      user_orders: [],
      openNumber: "",
      comments: [],
      textComment: "",

      openAlert: false,
      alertStatus: false,
      alertText: "",

      openOrder: false,
      showOrder: null,

      errOrder: null,

      modalDialogAction: false,
      comment_id: null,

      stat_open: [],
      raiting: 0,
      type_sale: 0,

      modalDialogNewShowComments: false,
      show_my_orders: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      points: data.points,
    });

    document.title = data.module_info.name;
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

  changeDate(type, val) {
    this.setState({
      [type]: val,
    });
  }

  changePoint(event, point) {
    this.setState({
      point: point,
    });
  }

  async show() {
    let data = {
      point_id: this.state.point,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    let res = await this.getData("show", data);

    if (res.st) {
      this.setState({
        svod: res.svod,
        stat_open: res.stat_open,
      });

      this.renderGraphOrdersD(res.svod);
    } else {
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: res.text,
      });
    }
  }

  async get_user_info(number) {
    let data = {
      number,
    };

    const res = await this.getData("get_one", data);

    this.setState({
      modalDialogNew: true,
      user_info: res.info,
      user_orders: res.orders,
      comments: res.comments,
      openNumber: number,
    });
  }

  renderGraphOrdersD(MyData) {
    if (this.chartordersD) {
      this.chartordersD.dispose();
    }

    var root = am5.Root.new("chartordersD");

    this.chartordersD = root;

    root.setThemes([am5themes_Animated.new(root)]);

    root.dateFormatter.setAll({
      dateFormat: "yyyy-MM-dd",
      dateFields: ["valueX", "openValueX"],
    });

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }),
    );

    var data_all = [];
    // var data_pic = [];
    // var data_dev = [];
    // var data_hall = [];

    MyData.map((item) => {
      let date = item.date.split("-");

      data_all.push({
        date: new Date(date[0], parseInt(date[1]) - 1, parseInt(date[2])).getTime(),
        value: parseInt(item.count),
      });
    });

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    var yAxis2 = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, { inversed: true }),
        //tooltip: am5.Tooltip.new(root, {
        //    themeTags: ["axis"],
        //    animationDuration: 200
        //})
      }),
    );

    // Create series правка 4 Заказы по дням
    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          strokeWidth: 5,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        }),
      );

      series.strokes.template.set("strokeWidth", 2);

      if (name == "Всего") {
        series.strokes.template.set("strokeWidth", 8);
      }

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill"),
          }),
        });
      });

      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}");
      series.data.setAll(data);
    }

    createSeries("Всего", "value", data_all);

    // Add cursor
    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomXY",
        xAxis: xAxis,
      }),
    );

    xAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );

    yAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );
  }

  changeText(data) {
    this.setState({
      textComment: data,
    });
  }

  async saveComment() {
    if (this.myRef.current) {
      if (this.myRef.current.getContent().length == 0) {
        this.setState({
          openAlert: true,
          alertStatus: false,
          alertText: "Комментарий пустой",
        });

        return;
      }
    } else {
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: "Комментарий пустой",
      });

      return;
    }

    if (this.click === true) {
      return;
    } else {
      this.click = true;
    }

    let data = {
      number: this.state.openNumber,
      text: this.myRef.current.getContent(),
    };

    let res = await this.getData("save_comment", data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: res.text,
      });
    } else {
      this.myRef.current.setContent("");

      this.setState({
        openAlert: true,
        alertStatus: true,
        alertText: "Успешно сохранено",
        comments: res.comments,
      });

      this.show();
    }

    setTimeout(() => {
      this.click = false;
    }, 500);
  }

  async savePromo(percent) {
    const number = this.state.openNumber;

    const data = {
      number,
      percent,
    };

    const res = await this.getData("save_promo", data);

    /*if(res.st){

      this.setState({
        openAlert: true,
        alertStatus: true,
        alertText: res.text,
        modalDialogAction: false,
      })

      this.saveCommentAction();
      
    } else {
      
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: res.text,
        modalDialogAction: false,
      });

    }*/
  }

  async orderOpen(order_id, point_id) {
    let data = {
      order_id,
      point_id,
    };

    let res = await this.getData("get_order", data);

    this.setState({
      showOrder: res,
      errOrder: res?.err_order ?? null,
      openOrder: true,
    });
  }

  async saveCommentAction() {
    if (!this.myRef_action.current || this.myRef_action.current.getContent().length === 0) {
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: "В описании пусто",
      });

      return;
    }

    if (this.click) {
      return;
    } else {
      this.click = true;
    }

    let data;

    /*if(parseInt(type) === 1) {
      data = {
        type,
        comment_id: this.state.comment_id,
        description: "Выписан промокод на скидку 10%",
        number: this.state.openNumber,
        raiting: this.state.raiting,
        type_sale: this.state.raiting,
      };
    }

    if(parseInt(type) === 2) {
      data = {
        type,
        comment_id: this.state.comment_id,
        description: "Выписан промокод на скидку 20%",
        number: this.state.openNumber,
      };
    }*/

    //if(parseInt(type) === 3) {
    data = {
      comment_id: this.state.comment_id,
      description: this.myRef_action.current.getContent(),
      number: this.state.openNumber,
      raiting: this.state.raiting,
      type_sale: this.state.type_sale,
    };
    //}

    if (parseInt(this.state.type_sale) > 0) {
      this.savePromo(this.state.type_sale);
    }

    const res = await this.getData("save_action", data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        alertStatus: false,
        alertText: res.text,
        modalDialogAction: false,
      });
    } else {
      //if(parseInt(type) === 3) {
      this.myRef_action.current.setContent("");
      //}

      this.setState({
        openAlert: true,
        alertStatus: true,
        alertText: "Успешно сохранено",
        modalDialogAction: false,
        comments: res.comments,
      });

      this.show();
    }

    setTimeout(() => {
      this.click = false;
    }, 500);
  }

  showMyComments(users) {
    this.setState({
      modalDialogNewShowComments: true,
      show_my_orders: users,
    });
  }

  render() {
    return (
      <>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => {
            this.setState({ openAlert: false });
          }}
          status={this.state.alertStatus}
          text={this.state.alertText}
        />
        {!this.state.showOrder ? null : (
          <Dialog
            open={this.state.openOrder}
            onClose={() => {
              this.setState({ openOrder: false });
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth={true}
            maxWidth={"md"}
          >
            <DialogTitle style={{ textAlign: "center" }}>
              Заказ #{this.state.showOrder.order.order_id}
              <IconButton
                onClick={() => {
                  this.setState({ openOrder: false });
                }}
                style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                spacing={0}
              >
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <span>
                    {this.state.showOrder.order.type_order}:{" "}
                    {this.state.showOrder.order.type_order_addr_new}
                  </span>
                </Grid>

                {parseInt(this.state.showOrder.order.type_order_) == 1 ? (
                  parseInt(this.state.showOrder.order.fake_dom) == 0 ? (
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <b style={{ color: "red", fontWeight: 900 }}>Домофон не работает</b>
                    </Grid>
                  ) : (
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <b style={{ color: "green", fontWeight: 900 }}>Домофон работает</b>
                    </Grid>
                  )
                ) : null}
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <span>
                    {this.state.showOrder.order.time_order_name}:{" "}
                    {this.state.showOrder.order.time_order}
                  </span>
                </Grid>

                {this.state.showOrder.order.number.length > 1 ? (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <b>Телефон: </b>
                    <span>{this.state.showOrder.order.number}</span>
                  </Grid>
                ) : null}

                {this.state.showOrder.order.delete_reason.length > 0 ? (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <span style={{ color: "red" }}>
                      Удален: {this.state.showOrder.order.date_time_delete}
                    </span>
                  </Grid>
                ) : null}
                {this.state.showOrder.order.delete_reason.length > 0 ? (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <span style={{ color: "red" }}>{this.state.showOrder.order.delete_reason}</span>
                  </Grid>
                ) : null}

                {parseInt(this.state.showOrder.order.is_preorder) == 1 ? null : (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <span>
                      {"Обещали: " + this.state.showOrder.order.time_to_client + " / "}
                      {this.state.showOrder.order.text_time}
                      {this.state.showOrder.order.time}
                    </span>
                  </Grid>
                )}

                {this.state.showOrder.order.promo_name == null ||
                this.state.showOrder.order.promo_name.length == 0 ? null : (
                  <>
                    <Grid
                      size={{
                        xs: 12,
                      }}
                    >
                      <b>Промокод: </b>
                      <span>{this.state.showOrder.order.promo_name}</span>
                    </Grid>
                    <Grid
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
                    size={{
                      xs: 12,
                    }}
                  >
                    <b>Комментарий: </b>
                    <span>{this.state.showOrder.order.comment}</span>
                  </Grid>
                )}

                {this.state.showOrder.order.sdacha == null ||
                parseInt(this.state.showOrder.order.sdacha) == 0 ? null : (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <b>Сдача: </b>
                    <span>{this.state.showOrder.order.sdacha}</span>
                  </Grid>
                )}

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <b>Сумма заказа: </b>
                  <span>{this.state.showOrder.order.sum_order} р</span>
                </Grid>

                {this.state.showOrder.order.check_pos_drive == null ||
                !this.state.showOrder.order.check_pos_drive ? null : (
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <b>Довоз оформлен: </b>
                    <span>{this.state.showOrder.order.check_pos_drive.comment}</span>
                  </Grid>
                )}

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <Table
                    size={"small"}
                    style={{ marginTop: 15 }}
                  >
                    <TableBody>
                      {this.state.showOrder.order_items.map((item, key) => (
                        <TableRow key={key}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.price} р</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                          Сумма заказа
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell style={{ fontWeight: "bold", color: "#000" }}>
                          {this.state.showOrder.order.sum_order} р
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </Grid>

                {!this.state.errOrder ? null : (
                  <Grid
                    mt={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography style={{ fontWeight: "bold" }}>Ошибка</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: "20%" }}>Дата создания</TableCell>
                              <TableCell style={{ width: "30%" }}>Проблема</TableCell>
                              <TableCell style={{ width: "30%" }}>Решение</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow hover>
                              <TableCell>{this.state.errOrder.date_time_desc}</TableCell>
                              <TableCell>{this.state.errOrder.order_desc}</TableCell>
                              <TableCell>{this.state.errOrder.text_win}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </Dialog>
        )}
        <Dialog
          open={this.state.modalDialogNew}
          onClose={() => {
            this.setState({ modalDialogNew: false });
          }}
          fullWidth={true}
          maxWidth={"lg"}
        >
          <DialogTitle>
            Информация о клиенте
            <IconButton
              onClick={() => {
                this.setState({ modalDialogNew: false });
              }}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <Grid container>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Телефон: </span>
                    <span>{this.state.openNumber}</span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Имя: </span>
                    <span>{this.state.user_info?.name}</span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Регистрация: </span>
                    <span>{this.state.user_info?.date_reg}</span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>День рождения: </span>
                    <span>{this.state.user_info?.date_bir}</span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Заказов: </span>
                    <span>
                      {this.state.user_info?.all_count_order} / {this.state.user_info?.summ} р.
                    </span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Доставок: </span>
                    <span>
                      {this.state.user_info?.count_dev} / {this.state.user_info?.summ_dev} р.
                    </span>
                  </Grid>
                  <Grid
                    style={{ paddingTop: 12 }}
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <span>Самовывозов: </span>
                    <span>
                      {this.state.user_info?.count_pic} / {this.state.user_info?.summ_pic} р.
                    </span>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 8,
                }}
              >
                <Accordion style={{ width: "100%" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Заказы</Typography>
                  </AccordionSummary>
                  <AccordionDetails style={{ maxHeight: 300, overflow: "scroll" }}>
                    <Table>
                      <TableBody>
                        {this.state.user_orders.map((item, key) => (
                          <TableRow
                            key={key}
                            onClick={this.orderOpen.bind(this, item.order_id, item.point_id)}
                            hover
                            style={{ cursor: "pointer" }}
                          >
                            <TableCell>{item.point}</TableCell>
                            <TableCell>{item.new_type_order}</TableCell>
                            <TableCell>{item.date_time}</TableCell>
                            <TableCell>#{item.order_id}</TableCell>
                            <TableCell>{item.summ}р.</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                {this.state.comments.map((item, key) => (
                  <Paper
                    key={key}
                    style={{ padding: 15, marginBottom: 15 }}
                    elevation={3}
                  >
                    <b>{item?.description ? "Обращение:" : "Комментарий:"}</b>
                    <span dangerouslySetInnerHTML={{ __html: item.comment }} />

                    <div
                      style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
                    >
                      <div>
                        <span style={{ marginRight: 20 }}>{item.date_add}</span>
                        <span>{item.name}</span>
                      </div>
                    </div>

                    <hr />

                    <b>{item?.description ? "Действие:" : null}</b>

                    <p dangerouslySetInnerHTML={{ __html: item?.description }} />

                    <p>
                      <b>
                        {parseInt(item.raiting) > 0
                          ? parseInt(item.raiting) == 1
                            ? "Положительный отзыв"
                            : parseInt(item.raiting) == 2
                              ? "Средний отзыв"
                              : "Отрицательный отзыв"
                          : ""}
                      </b>
                      {(parseInt(item.raiting) > 0) & (parseInt(item.sale) > 0) ? " / " : ""}
                      <b>{parseInt(item.sale) > 0 ? "Выписана скидка " + item.sale + "%" : ""}</b>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: item?.description ? "flex-end" : "space-between",
                        alignItems: "center",
                      }}
                    >
                      {item?.description ? null : (
                        <>
                          <Button
                            color="primary"
                            variant="contained"
                            onClick={() => {
                              this.setState({ modalDialogAction: true, comment_id: item.id });
                            }}
                          >
                            Действие
                          </Button>
                        </>
                      )}
                      <div>
                        <span style={{ marginRight: 20 }}>{item.date_time}</span>
                        <span>{item.name_close}</span>
                      </div>
                    </div>
                  </Paper>
                ))}
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TextEditor22
                  id="EditorNew"
                  value={""}
                  refs_={this.myRef}
                  toolbar={true}
                  menubar={true}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={this.saveComment.bind(this)}
            >
              Добавить новый комментарий
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modalDialogNewShowComments}
          onClose={() => {
            this.setState({ modalDialogNewShowComments: false });
          }}
          fullWidth={true}
          maxWidth={"lg"}
        >
          <DialogTitle>
            Оформленные обращения
            <IconButton
              onClick={() => {
                this.setState({ modalDialogNewShowComments: false });
              }}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер телефона</TableCell>
                      <TableCell>Комментарий</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.show_my_orders.map((it, k) => (
                      <TableRow
                        key={k}
                        style={{ cursor: "pointer" }}
                        onClick={this.get_user_info.bind(this, it.user_number)}
                      >
                        <TableCell>{it.user_number}</TableCell>
                        <TableCell
                          style={{ maxWidth: "50%", padding: 0 }}
                          dangerouslySetInnerHTML={{ __html: it.comment }}
                        ></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.modalDialogAction}
          onClose={() => {
            this.setState({ modalDialogAction: false });
          }}
          fullWidth={true}
          maxWidth={"lg"}
        >
          <DialogTitle>
            Описание ситуации
            <IconButton
              onClick={() => {
                this.setState({ modalDialogAction: false });
              }}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingTop: 10 }}>
            <Grid
              style={{ justifyContent: "center", display: "flex", marginBottom: 20 }}
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <ToggleButtonGroup
                value={this.state.raiting}
                exclusive
                size="small"
                onChange={(event, data) => {
                  this.setState({ raiting: data ?? 0 });
                }}
              >
                <ToggleButton
                  value="1"
                  style={{
                    backgroundColor: parseInt(this.state.raiting) == 1 ? "#dd1a32" : "#fff",
                    borderRightWidth: 2,
                  }}
                >
                  <span
                    style={{
                      color: parseInt(this.state.raiting) == 1 ? "#fff" : "#333",
                      padding: "0 20px",
                    }}
                  >
                    Положительный отзыв
                  </span>
                </ToggleButton>
                <ToggleButton
                  value="2"
                  style={{
                    backgroundColor: parseInt(this.state.raiting) == 2 ? "#dd1a32" : "#fff",
                    borderRightWidth: 2,
                  }}
                >
                  <span
                    style={{
                      color: parseInt(this.state.raiting) == 2 ? "#fff" : "#333",
                      padding: "0 20px",
                    }}
                  >
                    Средний отзыв
                  </span>
                </ToggleButton>
                <ToggleButton
                  value="3"
                  style={{
                    backgroundColor: parseInt(this.state.raiting) == 3 ? "#dd1a32" : "#fff",
                  }}
                >
                  <span
                    style={{
                      color: parseInt(this.state.raiting) == 3 ? "#fff" : "#333",
                      padding: "0 20px",
                    }}
                  >
                    Отрицательный отзыв
                  </span>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid
              style={{ justifyContent: "center", display: "flex", marginBottom: 20 }}
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <ToggleButtonGroup
                value={this.state.type_sale}
                exclusive
                size="small"
                onChange={(event, data) => {
                  this.setState({ type_sale: data ?? 0 });
                }}
              >
                <ToggleButton
                  value="10"
                  style={{
                    backgroundColor: parseInt(this.state.type_sale) == 10 ? "#dd1a32" : "#fff",
                    borderRightWidth: 2,
                  }}
                >
                  <span
                    style={{
                      color: parseInt(this.state.type_sale) == 10 ? "#fff" : "#333",
                      padding: "0 20px",
                    }}
                  >
                    Скидка 10%
                  </span>
                </ToggleButton>
                <ToggleButton
                  value="20"
                  style={{
                    backgroundColor: parseInt(this.state.type_sale) == 20 ? "#dd1a32" : "#fff",
                  }}
                >
                  <span
                    style={{
                      color: parseInt(this.state.type_sale) == 20 ? "#fff" : "#333",
                      padding: "0 20px",
                    }}
                  >
                    Скидка 20%
                  </span>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <TextEditor22
                id="EditorNew"
                value={""}
                refs_={this.myRef_action}
                toolbar={true}
                menubar={true}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={this.saveCommentAction.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
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
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              minDate={formatDate("2023-01-01")}
              label={"Дата от"}
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
              minDate={formatDate("2023-01-01")}
              label={"Дата до"}
              value={this.state.date_end}
              func={this.changeDate.bind(this, "date_end")}
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
              color="primary"
              onClick={this.show.bind(this)}
            >
              Показать
            </Button>
          </Grid>

          <Grid
            style={{ marginBottom: 100 }}
            size={{
              xs: 12,
            }}
          >
            {this.state.stat_open.map((item, key) => (
              <Accordion
                style={{ width: "100%" }}
                key={key}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Статистика обращений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ФИО</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Комментариев</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Закрытых обращений</TableCell>

                        <TableCell style={{ textAlign: "center" }}>Скидка 10%</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Скидка 20%</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Положительный отзыв</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Средний отзыв</TableCell>
                        <TableCell style={{ textAlign: "center" }}>Отрицательный отзыв</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.stat_open.map((it, k) => (
                        <TableRow
                          key={k}
                          style={{ cursor: "pointer" }}
                          onClick={this.showMyComments.bind(this, it?.users)}
                        >
                          <TableCell>{it.short_name}</TableCell>
                          <TableCell style={{ textAlign: "center" }}>{it.count_open}</TableCell>
                          <TableCell style={{ textAlign: "center" }}>{it.count_close}</TableCell>

                          <TableCell style={{ textAlign: "center" }}>
                            {it.stat?.type_10 ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {it.stat?.type_20 ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {it.stat?.type_1 ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {it.stat?.type_2 ?? 0}
                          </TableCell>
                          <TableCell style={{ textAlign: "center" }}>
                            {it.stat?.type_3 ?? 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            <h2 style={{ textAlign: "center" }}>Новые клиенты по дням</h2>
            <div
              id="chartordersD"
              style={{ width: "100%", height: "500px" }}
            />
          </Grid>

          <Grid
            style={{ marginBottom: 100 }}
            size={{
              xs: 12,
            }}
          >
            {this.state.svod.map((item, key) => (
              <Accordion
                style={{ width: "100%" }}
                key={key}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {item.date} ({item.count})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List style={{ width: "100%" }}>
                    {item.users.map((it, k) => (
                      <ListItemButton
                        key={k}
                        onClick={this.get_user_info.bind(this, it.number)}
                        style={{
                          backgroundColor:
                            parseInt(it.check_comment) == 1
                              ? "#fff"
                              : parseInt(it.count) == 1
                                ? "#ffba00"
                                : "#90ee90",
                        }}
                      >
                        <ListItemText primary={it.number + " / заказов - " + it.count} />
                        <span
                          style={{ maxWidth: "50%" }}
                          dangerouslySetInnerHTML={{ __html: it.last_comment }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function NewSiteUsers() {
  return <CatWork_ />;
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
