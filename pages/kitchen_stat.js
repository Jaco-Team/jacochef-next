import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyAutocomplite, MyDatePickerNew } from "@/components/shared/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";

import dayjs from "dayjs";

import StatTableAccordeon from "@/components/kitchen_stat/StatTableAccordeon";
import ExcelIcon from "@/ui/ExcelIcon";
import DownloadButton from "@/components/shared/DownloadButton";
import { Box, Stack } from "@mui/material";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import TestAccess from "@/components/shared/TestAccess";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/components/shared/MyAlert";

const statPartsNames = [
  "orders_by_h",
  "fake_orders",
  "stat_all_items",
  "type_stat_new",
  "status_stat",
  "stat_items_checkout",
  "stat_items_checkout_all",
  "stat_cat",
  "all_items_all",
  "promo_stat",
];

class KitchenStat_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "kitchen_stat",
      module_name: "",
      is_load: false,
      is_load_parts: {},

      points: [],
      point: [],

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      arrayOrdersByH: null,
      data: null,
      statAllItemsCount: null,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      points: data?.points,
      module_name: data?.module_info.name,
      access: data?.access,
    });

    document.title = data?.module_info.name;
  }

  async componentWillUnmount() {
    this.activeControllers?.forEach((c) => c.abort());
    this.activeControllers = [];
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

  getDataSilent = async (method, data = {}) => {
    try {
      const controller = new AbortController();
      this.activeControllers.push(controller);
      const res = await api_laravel(this.state.module, method, data, { signal: controller.signal });
      const result = { ...res?.data, controller };
      return result;
    } catch (e) {
      if (e.name === "CanceledError" || e.name === "AbortError") {
        console.log(`${method} request aborted`);
      } else {
        console.error(`${method} failed:`, e);
      }
    }
  };

  changePoint(data, _, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  getCurrentPointsList() {
    const point = this.state.point;

    if (!point.length) {
      console.log("Нет выбранных точек");
      return false;
    }

    const point_list = point.reduce((list, item) => {
      list.push({ id: item.id, base: item.base });
      return list;
    }, []);

    return point_list;
  }

  // deprecated
  async getStat() {
    const point = this.state.point;

    if (!point.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Выберите точку!",
      });

      return;
    }

    const date_start = this.state.date_start;
    const date_end = this.state.date_end;

    const point_list = point.reduce((list, item) => {
      list.push({ id: item.id, base: item.base });
      return list;
    }, []);

    const data = {
      start_date: dayjs(date_start).format("YYYY-MM-DD"),
      end_date: dayjs(date_end).format("YYYY-MM-DD"),
      point_list,
    };

    const res = await this.getData("get_this_stat", data);

    const arrayOrdersByH = Object.entries(res.orders_by_h)
      .reduce((data, [key, value]) => {
        if (!isNaN(Number(key))) {
          if (key.startsWith("0")) {
            key = key.substring(1);
          }

          value = { ...{ h: key }, ...value };
          data = [...data, ...[value]];
        }

        return data;
      }, [])
      .sort((a, b) => a.h - b.h);

    const statAllItemsCount = res.stat_all_items.reduce(
      (count, item) => count + Number(item.count),
      0
    );
    const statItemsCheckoutCount = [
      ...res.stat_items_checkout.cash,
      ...res.stat_items_checkout.callcenter,
      ...res.stat_items_checkout.client,
    ].reduce((total, item) => total + Number(item.count), 0);

    this.setState({
      data: res,
      arrayOrdersByH,
      statAllItemsCount,
      statItemsCheckoutCount,
    });
  }

  async getStatParts() {
    const date_start = this.state.date_start;
    const date_end = this.state.date_end;
    const point_list = this.getCurrentPointsList();
    if (!point_list) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Выберите точку!",
      });
      return;
    }

    const data = {
      start_date: dayjs(date_start).format("YYYY-MM-DD"),
      end_date: dayjs(date_end).format("YYYY-MM-DD"),
      point_list,
    };

    // abort previous requests if any
    this.activeControllers?.forEach((c) => c.abort());
    this.activeControllers = [];

    const partPromise = async (key) => {
      try {
        const result = await this.getDataSilent(`get_stat/${key}`, data);
        const keyResult = result[key];
        if (!keyResult) return;
        if (key === "orders_by_h") {
          const arrayOrdersByH = Object.entries(keyResult)
            .reduce((data, [k, value]) => {
              if (Number(k)) {
                if (k.startsWith("0")) {
                  // backend adds leading zero
                  k = k.substring(1);
                }

                value = { ...value, h: k };
                data = [...data, value];
              }
              return data;
            }, [])
            .sort((a, b) => a.h - b.h);
          this.setState({ arrayOrdersByH });
        }
        if (key === "stat_all_items") {
          const statAllItemsCount = keyResult.reduce(
            (count, item) => count + Number(item.count),
            0
          );
          this.setState({ statAllItemsCount });
        }
        if (key === "stat_items_checkout") {
          const { cash, callcenter, client } = keyResult;
          if (!!cash && !!callcenter && !!client) {
            const statItemsCheckoutCount = [...cash, ...callcenter, ...client].reduce(
              (total, item) => total + Number(item.count),
              0
            );
            this.setState({ statItemsCheckoutCount });
          }
        }

        this.setState((state) => ({
          ...state,
          is_load: false,
          data: { ...state.data, [key]: keyResult },
          is_load_parts: {
            ...(state.is_load_parts || {}),
            [key]: false,
          },
        }));
      } catch (e) {
        console.log(`${key} fetch failed: `, e);
        this.setState({ is_load: false });
      }
    };

    this.setState({
      data: {},
      is_load: true,
      is_load_parts: statPartsNames.reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      arrayOrdersByH: null,
      statAllItemsCount: null,
      statItemsCheckoutCount: null,
    });
    const partPromises = statPartsNames.map((key) => partPromise(key));
    await Promise.all(partPromises);
  }

  isEmptyCheckoutStats(key) {
    const group = this.state.data[key];
    const isEmpty = !group?.cash || !group?.callcenter || !group?.client;
    return isEmpty;
  }

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
        {/* <TestAccess
          access={this.state.access}
          setAccess={(access) => this.setState({ access })}
        /> */}
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
        >
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <MyAutocomplite
              label="Точки"
              multiple={true}
              data={this.state.points}
              value={this.state.point}
              func={this.changePoint.bind(this, "point")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2
            }}>
            <Button
              onClick={this.getStatParts.bind(this)}
              variant="contained"
            >
              Обновить
            </Button>
          </Grid>
        </Grid>
        <Grid
          container
          pt={1}
          spacing={3}
          sx={{paddingInline: "24px"}}
        >

          {/* таблица Оформленные заказы по часам */}
          {(this.state.arrayOrdersByH?.length || this.state.is_load_parts?.orders_by_h) && (
            <Grid
              mt={5}
              size={{
                xs: 12,
                sm: 12
              }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={`${this.state.arrayOrdersByH?.length}` + 2}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "1em",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { sm: "center", xs: "left" },
                          }}
                        >
                          <h2>Оформленные заказы по часам</h2>
                          {this.state.is_load_parts?.orders_by_h && <CircularProgress size={24} />}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {this.state.arrayOrdersByH?.length > 0 && (
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell sx={{ minWidth: 100 }}>Тип</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell
                            key={key}
                            sx={{ minWidth: 50 }}
                          >
                            {item.h}
                          </TableCell>
                        ))}
                        <TableCell sx={{ minWidth: 100 }}>Всего</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  {this.state.arrayOrdersByH?.length > 0 && (
                    <TableBody>
                      <TableRow hover>
                        <TableCell>Роллы</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.count_rolls}</TableCell>
                        ))}
                        <TableCell>{this.state.data?.orders_by_h?.sv_r}</TableCell>
                      </TableRow>

                      <TableRow hover>
                        <TableCell>готовые Роллы</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.ready_rolls}</TableCell>
                        ))}
                        <TableCell></TableCell>
                      </TableRow>

                      <TableRow hover>
                        <TableCell>Пицца</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.count_pizza}</TableCell>
                        ))}
                        <TableCell>{this.state.data?.orders_by_h?.sv_p}</TableCell>
                      </TableRow>

                      <TableRow hover>
                        <TableCell>готовая Пицца</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.ready_pizza}</TableCell>
                        ))}
                        <TableCell></TableCell>
                      </TableRow>

                      <TableRow hover>
                        <TableCell>Заказы</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.count_orders}</TableCell>
                        ))}
                        <TableCell>{this.state.data?.orders_by_h?.sv_o}</TableCell>
                      </TableRow>

                      <TableRow hover>
                        <TableCell>Доставки</TableCell>
                        {this.state.arrayOrdersByH.map((item, key) => (
                          <TableCell key={key}>{item.count_div}</TableCell>
                        ))}
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица Завершенные заказы по типу */}
          {(this.state.data?.type_stat_new?.length || this.state.is_load_parts?.type_stat_new) && (
            <Grid
              mt={5}
              size={{
                xs: 12,
                sm: 6
              }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "1em",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { sm: "center", xs: "left" },
                          }}
                        >
                          <h2>Завершенные заказы по типу</h2>
                          {this.state.is_load_parts?.type_stat_new && (
                            <CircularProgress size={24} />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {this.state.data?.type_stat_new?.length > 0 && (
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>Тип заказа</TableCell>
                        <TableCell>Количество</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  {this.state.data?.type_stat_new?.length > 0 && (
                    <TableBody>
                      {this.state.data?.type_stat_new?.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                        >
                          <TableCell>{item.type_order}</TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица Заказы по статусу */}
          {(this.state.data?.status_stat?.length || this.state.is_load_parts?.status_stat) && (
            <Grid
              mt={5}
              size={{
                xs: 12,
                sm: 6
              }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "1em",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { sm: "center", xs: "left" },
                          }}
                        >
                          <h2>Заказы по статусу</h2>
                          {this.state.is_load_parts?.status_stat && <CircularProgress size={24} />}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {this.state.data?.status_stat?.length > 0 && (
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>Статус заказа</TableCell>
                        <TableCell>Количество</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  {this.state.data?.status_stat?.length > 0 && (
                    <TableBody>
                      {this.state.data?.status_stat?.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                        >
                          <TableCell>{item.status_order}</TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* таблица Не завершенные заказы */}
          {(this.state.data?.fake_orders?.length || this.state.is_load_parts?.fake_orders) && (
            <Grid
              mt={5}
              size={{
                xs: 12,
                sm: 12
              }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "1em",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { sm: "center", xs: "left" },
                          }}
                        >
                          <h2>Не завершенные заказы</h2>
                          {this.state.is_load_parts?.fake_orders && <CircularProgress size={24} />}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {this.state.data?.fake_orders?.length > 0 && (
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell sx={{ minWidth: 100 }}>№</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Дата</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Тип</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Статус</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Сборщик</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Курьер</TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  {this.state.data?.fake_orders?.length > 0 && (
                    <TableBody>
                      {this.state.data?.fake_orders?.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                        >
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.date_time_order}</TableCell>
                          <TableCell>{item.type_order}</TableCell>
                          <TableCell>{item.status_order}</TableCell>
                          <TableCell>{item.kassir}</TableCell>
                          <TableCell>{item.driver}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* аккордион Проданные позиции (разбивка сетов, без допов) */}
          {(this.state.statAllItemsCount > 0 || this.state.is_load_parts?.stat_all_items) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid
                    sx={{
                      display: "flex",
                      flexDirection: { sm: "row", xs: "column" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        marginRight: { sm: 3, xs: 0 },
                        marginBottom: { sm: 0, xs: 3 },
                      }}
                    >
                      Проданные позиции (разбивка сетов, без допов)
                    </Typography>
                    {this.state.is_load_parts?.stat_all_items && <CircularProgress size={24} />}
                    {this.state.data?.stat_all_items?.length > 0 && (
                      <Typography sx={{ fontWeight: "bold" }}>
                        Всего: {this.state.statAllItemsCount}
                      </Typography>
                    )}
                  </Grid>
                </AccordionSummary>
                {this.state.data?.stat_all_items?.length > 0 && (
                  <AccordionDetails style={{ overflow: "hidden" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "70%" }}>Название</TableCell>
                          <TableCell style={{ width: "30%" }}>Кол-во</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.data?.stat_all_items?.map((item, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow
                          hover
                          sx={{ "& td": { fontWeight: "bold" } }}
                        >
                          <TableCell>Всего</TableCell>
                          <TableCell>{this.state.statAllItemsCount}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}

          {/* аккордион Проданные позиции (все) */}
          {(this.state.data?.all_items_all || this.state.is_load_parts?.all_items_all) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography sx={{ fontWeight: "bold" }}>Проданные позиции (все)</Typography>
                    {this.state.is_load_parts?.all_items_all && <CircularProgress size={24} />}
                  </Box>
                </AccordionSummary>
                {this.state.data?.all_items_all?.length > 0 && (
                  <AccordionDetails style={{ overflow: "hidden" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "70%" }}>Название</TableCell>
                          <TableCell style={{ width: "30%" }}>Кол-во</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.data?.all_items_all?.map((item, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}

          {/* аккордион Проданные позиции (разбивка сетов, без допов) по типу оформления */}
          {((this.state.statItemsCheckoutCount > 0 &&
            !this.isEmptyCheckoutStats("stat_items_checkout")) ||
            this.state.is_load_parts?.stat_items_checkout) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1em",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center", xs: "left" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        flexGrow: 1,
                        width: { sm: "auto", xs: "100%" },
                      }}
                    >
                      Проданные позиции (разбивка сетов, без допов) по типу оформления
                    </Typography>
                    {this.state.is_load_parts?.stat_items_checkout && (
                      <CircularProgress
                        size={24}
                        sx={{ minWidth: 24 }}
                      />
                    )}
                    {this.state.statItemsCheckoutCount > 0 && (
                      <Typography sx={{ fontWeight: "bold" }}>
                        Всего: {this.state.statItemsCheckoutCount}
                      </Typography>
                    )}
                    {this.canAccess("export_items") &&
                      this.state.data?.stat_items_checkout?.excel_link && (
                        <DownloadButton
                          url={this.state.data?.stat_items_checkout?.excel_link}
                          sx={{ marginRight: "1em" }}
                        >
                          <ExcelIcon />
                          {/* <DownloadIcon/> */}
                        </DownloadButton>
                      )}
                  </Box>
                </AccordionSummary>
                {this.state.data?.stat_items_checkout && this.state.statItemsCheckoutCount > 0 && (
                  <AccordionDetails>
                    <Grid
                      container
                      spacing={3}
                    >
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout?.cash}
                          title={"Касса"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout?.callcenter}
                          title={"Колл-центр"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout?.client}
                          title={"Клиент"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}

          {/* аккордион Проданные позиции (все) по типу оформления */}
          {((this.state.data?.stat_items_checkout_all &&
            !this.isEmptyCheckoutStats("stat_items_checkout_all")) ||
            this.state.is_load_parts?.stat_items_checkout_all) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1em",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center", xs: "left" },
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      Проданные позиции (все) по типу оформления
                    </Typography>
                    {this.state.is_load_parts?.stat_items_checkout_all && (
                      <CircularProgress size={24} />
                    )}
                    {this.canAccess("export_items") &&
                      this.state.data?.stat_items_checkout_all?.excel_link && (
                        <DownloadButton
                          url={this.state.data?.stat_items_checkout_all?.excel_link}
                          ml="auto"
                        >
                          <ExcelIcon />
                        </DownloadButton>
                      )}
                  </Box>
                </AccordionSummary>
                {this.state.data?.stat_items_checkout_all && (
                  <AccordionDetails>
                    <Grid
                      container
                      spacing={3}
                    >
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout_all?.cash}
                          title={"Касса"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout_all?.callcenter}
                          title={"Колл-центр"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12
                        }}>
                        <StatTableAccordeon
                          data={this.state.data?.stat_items_checkout_all?.client}
                          title={"Клиент"}
                          canExport={this.canAccess("export_items")}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}

          {/* аккордион Проданные позиции по категориям */}
          {(this.state.data?.stat_cat?.length || this.state.is_load_parts?.stat_cat) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ display: "flex", gap: "1em" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1em",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center", xs: "left" },
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      Проданные позиции по категориям
                    </Typography>
                    {this.state.is_load_parts?.stat_cat && <CircularProgress size={24} />}
                  </Box>
                </AccordionSummary>
                {this.state.data?.stat_cat?.length > 0 && (
                  <AccordionDetails style={{ overflow: "hidden" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "70%" }}>Позиция</TableCell>
                          <TableCell style={{ width: "30%" }}>Кол-во</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.data?.stat_cat?.map((item, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{item?.name ?? item.cat_name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}

          {/* аккордион Использованные промокоды */}
          {(this.state.data?.promo_stat?.length || this.state.is_load_parts?.promo_stat) && (
            <Grid
              mt={3}
              size={{
                xs: 12,
                sm: 6
              }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ display: "flex", gap: "1em" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1em",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center", xs: "left" },
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>Использованные промокоды</Typography>
                    {this.state.is_load_parts?.promo_stat && <CircularProgress size={24} />}
                  </Box>
                </AccordionSummary>
                {this.state.data?.promo_stat?.length > 0 && (
                  <AccordionDetails style={{ overflow: "hidden" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell style={{ width: "70%" }}>Промокод</TableCell>
                          <TableCell style={{ width: "30%" }}>Кол-во</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {this.state.data?.promo_stat?.map((item, key) => (
                          <TableRow
                            key={key}
                            hover
                          >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                )}
              </Accordion>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function KitchenStat() {
  return <KitchenStat_ />;
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
