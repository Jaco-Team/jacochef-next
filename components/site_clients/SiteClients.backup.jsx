"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Grid,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  TextareaAutosize,
  Switch,
  FormControlLabel,
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { MyTextInput, MyAutocomplite, MyDatePickerNew, MyCheckBox } from "@/ui/Forms";

import { ExlIcon } from "@/ui/icons";

import { api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import SiteClientsOrdersByUtmTable from "@/components/site_clients/traffic/SiteClientsOrdersByUtmTable";
import SiteClientsOrdersBySourceTable from "@/components/site_clients/traffic/SiteClientsOrdersBySourceTable";
import SiteClientsTrafficBySourceTable from "@/components/site_clients/traffic/SiteClientsTrafficBySourceTable";
import SiteClientsTrafficSummaryTable from "@/components/site_clients/traffic/SiteClientsTrafficSummaryTable";

import SiteClients_Modal_Comment_Action from "@/components/site_clients/_SiteClientsModalCommentAction";
import SiteClients_Modal_Client_Order from "@/components/site_clients/_SiteClientsModalClientOrder";
import SiteClients_Modal_Client from "@/components/site_clients/_SiteClientsModalClient";
import OrdersMore from "@/components/site_clients/_OrdersMore";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import SiteClientsMarketingTab from "@/components/site_clients/marketing/SiteClientsMarketingTab";
import TestAccess from "@/ui/TestAccess";

import MyAlert from "@/ui/MyAlert";
import useMyAlert from "@/src/hooks/useMyAlert";
import { useSiteClientsStore } from "./useSiteClientsStore";
import Clients from "./clients/Clients";

const months = [
  { id: 1, name: "января" },
  { id: 2, name: "февраля" },
  { id: 3, name: "марта" },
  { id: 4, name: "апреля" },
  { id: 5, name: "мая" },
  { id: 6, name: "июня" },
  { id: 7, name: "июля" },
  { id: 8, name: "августа" },
  { id: 9, name: "сентября" },
  { id: 10, name: "октября" },
  { id: 11, name: "ноября" },
  { id: 12, name: "декабря" },
];

const days = Array.from({ length: 31 }, (_, i) => ({ id: i + 1, name: i + 1 }));

export default function SiteClients() {
  const {
    access,
    module,
    module_name,
    cities,
    city_id,
    number,
    order,
    keepParams,

    activeTab_address = 0,

    search,
    search_orders,

    promo,
    promo_dr,
    addr,

    created,
    all_created,

    date_start,
    date_end,
    date_start_addr,
    date_end_addr,
    city_id_addr,
    address_list,
    date_start_traffic,
    date_end_traffic,
    city_id_traffic,
    select_toggle,
    clients,
    points,
    point_id,
    is_load,
    orders_list,
    orders_list_addr,
    traffic_stats,
    traffic_sources,
    orders_by_source,
    orders_by_utm,
    fullScreen,

    modalDialog,
    modalDialog_order,
    modalDialogAction,
    client,
    client_login,
    login_yandex,

    showOrder,
    comments,
    comment_id,
    orders,
    err_orders,
    login_sms,
    items,
    all_items,

    update, // store setter
    hydrate,
  } = useSiteClientsStore();

  const TABS_MAP = [
    { key: "client", label: "Поиск клиента", component: <div>client</div> },
    { key: "orders", label: "Поиск заказов", component: <div>search_orders</div> },
    {
      key: "orders_more",
      label: "Поиск заказов расширенный",
      component: <div>find_orders_more</div>,
    },
    { key: "clients", label: "Поиск клиентов", component: <div>find_clients</div> },
    { key: "address", label: "Заказы по адресам", component: <div>search_address</div> },
    {
      key: "traffic",
      label: "Аналитика по оформленным заказам",
      component: <div>source_traffic</div>,
    },
    {
      key: "marketing_data",
      label: "Маркетинговая аналитика",
      component: <div>marketing_data</div>,
    },
  ];

  const canAccess = (property) => handleUserAccess(access)?.userCan("access", property);
  // const canView = (property) => handleUserAccess(access)?.userCan("view", property);
  // const canEdit = (property) => handleUserAccess(access)?.userCan("edit", property);

  const buildRequest = () => {
    const s = useSiteClientsStore.getState();

    // --- validation helpers
    const isEmpty = (v) => !v || (Array.isArray(v) && v.length === 0);
    const hasSearchFields =
      s.number.length || s.order.length || s.items.length || s.addr.length || s.promo.length;

    if (s.select_toggle === "city" && isEmpty(s.city_id)) {
      return showAlert("Необходимо выбрать город", false);
    }

    if (s.select_toggle === "point") {
      if (isEmpty(s.point_id)) {
        return showAlert("Необходимо выбрать точку", false);
      }
    }

    const point_id =
      s.select_toggle === "point"
        ? s.point_id.map((item) => {
            const parts = item.name.split(",");
            return {
              ...item,
              addr: parts.slice(1).join(",").trim() || item.name,
            };
          })
        : s.point_id;

    const date_start = s.date_start ? dayjs(s.date_start).format("YYYY-MM-DD") : "";
    const date_end = s.date_end ? dayjs(s.date_end).format("YYYY-MM-DD") : "";

    const dateMissing = !date_start || !date_end;

    if (dateMissing && !hasSearchFields) {
      return showAlert("Необходимо указать дату или что-то кроме нее", false);
    }

    return {
      number: s.number,
      city_id: s.city_id,
      date_start,
      date_end,
      order: s.order,
      items: s.items,
      addr: s.addr,
      promo: s.promo,
      point_id,
      type: s.select_toggle,
      promo_dr: s.promo_dr ? 1 : 0,
      created: s.created,
    };
  };

  const tabs = useMemo(() => TABS_MAP.filter((t) => canAccess(t.key)), [access]);
  const [activeTab, setActiveTab] = useState(0);
  const tabsIdx = useMemo(() => {
    const m = {};
    tabs.forEach((t, i) => (m[t.key] = i));
    return m;
  }, [tabs]);

  useEffect(() => {
    if (!tabs.length) return;
    if (activeTab < 0 || activeTab >= tabs.length) setActiveTab(0);
  }, [tabs, activeTab]);

  const getData = async (method, data = {}, dop_type = {}) => {
    update({ is_load: true });

    const res = api_laravel(module, method, data, dop_type)
      .then((result) => (method === "export_file_xls" ? result : result?.data))
      .finally(() => {
        setTimeout(() => update({ is_load: false }), 500);
      });
    return res;
  };

  const handleResize = () => {
    if (window.innerWidth < 601) {
      update({
        fullScreen: true,
      });
    } else {
      update({
        fullScreen: false,
      });
    }
  };

  const initData = async () => {
    const data = await getData("get_all");

    if (data) {
      update({
        all_items: data.all_items,
        cities: data.cities,
        points: data.points,
        access: data.acces,
        module_name: data.module_info?.name,
      });

      document.title = data.module_info.name;

      handleResize();
    }
  };

  const changeTab = (_, val) => {
    update({
      activeTab: val,
    });
  };

  const changeTab_address = (_, val) => {
    update({
      activeTab_address: val,
    });

    getDataAddress();
  };

  const changeInput = (data, type, event) => {
    if (type === "clear") {
      update({
        [data]: "",
      });
    } else {
      update({
        [data]: event?.target?.value || "",
      });
    }
  };

  const changeSearch = (data, e) => {
    if (data === "clear") {
      update({
        [data]: "",
        clients: [],
      });
    } else {
      let login = e?.target?.value;

      update({
        [data]: login,
      });
    }
  };

  const changeAutocomplite = (data, _, value) => {
    update({
      [data]: value,
    });
  };

  const changeDateRange = (data, event) => {
    update({
      [data]: event ? dayjs(event).format("YYYY-MM-DD") : null,
    });
  };

  const downLoad = async () => {
    const data = buildRequest();

    if (!data) return;

    const dop_type = {
      responseType: "blob",
    };

    const res = await getData("export_file_xls", data, dop_type);

    if (!res) return showAlert("Ошибка при формировании файла", false);

    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Таблица с заказами.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getClients = async () => {
    const search = useSiteClientsStore.getState().search;

    if (search?.length < 4) {
      return showAlert("Необходимо указать минимум 4 цифры из номера телефона", false);
    }

    const data = {
      search,
    };

    const res = await getData("get_clients", data);

    if (res?.st) {
      if (!res.clients?.length) {
        showAlert("Клиенты с таким номером не найдены", false);
        update({
          clients: [],
        });
        return;
      }
      update({
        clients: res.clients,
      });
    } else {
      return showAlert(res?.text || "Error", false);
    }
  };

  const getOrders = async () => {
    const data = buildRequest();

    if (!data) return;

    const res = await getData("get_orders", data);

    if (res?.search_orders?.length) {
      update({
        search_orders: res.search_orders,
      });
    } else {
      showAlert("Заказы с заданными параметрами не найдены", false);
      update({
        search_orders: [],
      });
    }
  };

  const openModalClient = async (login, type) => {
    handleResize();

    const res = await getData("get_one_client", { login });

    // TODO: alert on error

    if (res?.client_info.date_bir) {
      const date = res.client_info.date_bir.split("-");

      const day = days.find((it) => parseInt(it.id) == parseInt(date[2]));
      const month = months.find((it) => parseInt(it.id) == parseInt(date[1]));

      if (day) {
        res.client_info.day = day.id;
      }

      if (month) {
        res.client_info.month = month.id;
      }
    }

    if (type === "open") {
      update({
        modalDialog: true,
      });
    }

    update({
      client_id: res.client_info.id,
      client_login: login,
      client: res.client_info,
      orders: res.client_orders,
      err_orders: res.err_orders,
      comments: res.client_comments,
      login_sms: res.client_login_sms,
      login_yandex: res.client_login_yandex,
      days,
    });
  };

  const openClientOrder = async (order_id, point_id) => {
    handleResize();

    const data = {
      order_id,
      point_id,
    };

    const res = await getData("get_one_order", data);

    update({
      showOrder: res,
      modalDialog_order: true,
    });
  };

  const openSaveAction = (comment_id) => {
    update({
      modalDialogAction: true,
      comment_id,
    });
  };

  const saveEdit = async (data) => {
    const res = await getData("save_edit_client", data);

    if (res?.st) {
      const login = client_login;

      showAlert(res.text, res.st);

      openModalClient(login, "update");
    } else {
      showAlert(res?.text || "Error", false);
    }
  };

  const saveComment = async (data) => {
    const res = await getData("save_comment", data);

    if (res?.st) {
      showAlert(res.text, res.st);
      update({
        comments: res.client_comments,
      });
    } else {
      showAlert(res?.text || "Error", false);
    }
  };

  const saveCommentAction = async (data) => {
    const res = await getData("save_action", data);

    if (res?.st) {
      showAlert(res.text, res.st);
      update({
        comments: res.client_comments,
        modalDialogAction: false,
      });
    } else {
      showAlert(res?.text || "Error", false);
    }
  };

  const savePromo = async (percent) => {
    const number = client_login;

    const data = {
      number,
      percent,
    };

    await getData("save_promo", data);
  };

  const sendCode = async () => {
    const number = client_login;
    const user_id = client_id;

    const data = {
      number,
      user_id,
    };

    const res = await getData("get_code", data);

    if (res?.st) {
      showAlert(res.text, res.st);
      update({
        login_sms: res.client_login_sms,
      });
    } else {
      showAlert(res?.text || "Error", false);
    }
  };

  const changeAddressList = (type, event) => {
    const value = event.target.value;

    update({
      [type]: value,
    });
  };

  const getDataAddress = async () => {
    const city_id = city_id_addr;
    let date_start = date_start_addr;
    let date_end = date_end_addr;
    let addresses = address_list;

    date_start = date_start ? dayjs(date_start).format("YYYY-MM-DD") : "";
    date_end = date_end ? dayjs(date_end).format("YYYY-MM-DD") : "";

    if (!city_id.length) {
      return showAlert("Необходимо выбрать город", false);
    }

    if (!date_start || !date_end) {
      return showAlert("Необходимо указать даты", false);
    }

    if (!addresses) {
      return showAlert("Необходимо указать адреса", false);
    }

    const data = {
      city_id,
      date_start,
      date_end,
      addresses,
    };

    const res = await getData("get_data_address", data);

    if (res?.orders?.length || res?.addresses?.length) {
      update({
        orders_list: res.orders,
        orders_list_addr: res.addresses,
      });
    } else {
      update({
        search_orders: [],
      });
      showAlert("Заказы с заданными параметрами не найдены", false);
    }
  };

  const getDataTraffic = async () => {
    const city_id = city_id_traffic.map((c) => c.id);
    const date_start = dayjs(date_start_traffic)?.format("YYYY-MM-DD") || "";
    const date_end = dayjs(date_end_traffic)?.format("YYYY-MM-DD") || "";

    if (!city_id?.length) {
      return showAlert("Необходимо выбрать город", false);
    }
    if (!date_start || !date_end) {
      return showAlert("Необходимо указать обе даты", false);
    }

    const data = {
      city_id,
      date_start,
      date_end,
    };

    const res = await getData("get_traffic", data);

    if (res?.st) {
      update({
        traffic_stats: res.stats,
        traffic_sources: res.sources,
        orders_by_source: res.orders_by_source,
        orders_by_utm: res.orders_by_utm,
      });
    } else {
      showAlert("За период нет статистики", false);
    }
  };

  const openAccordionAdrress = (id) => {
    const next = [...orders_list_addr].forEach((item) => {
      if (parseInt(item.id) === parseInt(id)) {
        item.is_open = !item.is_open;
      } else {
        item.is_open = false;
      }
    });

    update({
      orders_list_addr: next,
    });
  };

  const handleToggleChange = (_, newSelection) => {
    if (newSelection !== null) {
      update({
        select_toggle: newSelection,
      });

      if (newSelection === "city") {
        update({
          point_id: [],
        });
      }

      if (newSelection === "point") {
        update({
          city_id: [],
        });
      }
    }
  };

  const changeDataCheck = (type, event) => {
    update({
      [type]: event.target.checked,
    });
  };

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  useEffect(() => {
    hydrate();
    initData();
  }, []);

  return (
    <>
      <Backdrop
        style={{ zIndex: 99 }}
        open={is_load}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* <TestAccess
          access={access}
          setAccess={(access) => update({ access })}
        /> */}
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <SiteClients_Modal_Client
        open={modalDialog}
        onClose={() => update({ modalDialog: false, client: null, client_login: "" })}
        item={client}
        fullScreen={fullScreen}
        item_login={client_login}
        acces={access}
        days={days}
        months={months}
        orders={orders}
        err_orders={err_orders}
        saveEdit={saveEdit}
        saveComment={saveComment}
        openClientOrder={openClientOrder}
        openSaveAction={openSaveAction}
        comments={comments}
        login_sms={login_sms}
        login_yandex={login_yandex}
        sendCode={sendCode}
      />
      <SiteClients_Modal_Client_Order
        open={modalDialog_order}
        onClose={() => update({ modalDialog_order: false })}
        showOrder={showOrder}
        fullScreen={fullScreen}
      />
      <SiteClients_Modal_Comment_Action
        open={modalDialogAction}
        onClose={() => update({ modalDialogAction: false, comment_id: null })}
        comment_id={comment_id}
        fullScreen={fullScreen}
        savePromo={savePromo}
        saveCommentAction={saveCommentAction}
        client_login={client_login}
      />
      <Grid
        container
        spacing={0}
        mb={3}
        className="container_first_child"
      >
        <Grid
          size={12}
          sx={{ mb: 2 }}
        >
          <h1>{module_name}</h1>
        </Grid>

        <Grid
          size={12}
          sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}
        >
          <FormControlLabel
            sx={{
              m: 0,
              ml: "auto",
              "& .MuiFormControlLabel-label": {
                fontSize: 13,
              },
            }}
            label="Хранить параметры форм"
            control={
              <Switch
                size="small"
                checked={keepParams}
                onChange={(e) => update({ keepParams: e.target.checked })}
                color="primary"
                sx={{
                  // when off → grey
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "primary.main",
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "grey.400",
                    opacity: 1,
                  },
                }}
              />
            }
          />
        </Grid>

        <Grid
          sx={{ pb: 5 }}
          size={12}
        >
          <Paper>
            <Tabs
              value={activeTab}
              onChange={changeTab}
              variant="scrollable"
              scrollButtons={"auto"}
            >
              {tabs?.map((item, index) => {
                return (
                  <Tab
                    label={item.name}
                    {...a11yProps(index)}
                    key={item.key}
                    sx={{
                      minWidth: "fit-content",
                      flex: 1,
                    }}
                  />
                );
              })}
            </Tabs>
          </Paper>
        </Grid>

        {/* Поиск клиента */}
        {tabsIdx.search_clients && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.search_clients}
              id="clients"
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    type="number"
                    className="input_login"
                    label="Поиск по номеру телефона"
                    value={search}
                    func={(e) => changeSearch("search", e)}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!search ? null : (
                            <InputAdornment position="end">
                              <IconButton>
                                <ClearIcon onClick={(e) => changeSearch("clear", e)} />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <Button
                    onClick={getClients}
                    variant="contained"
                  >
                    Показать
                  </Button>
                </Grid>

                <Grid
                  mt={5}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TableContainer
                    sx={{ maxHeight: { xs: "none", sm: 570 } }}
                    component={Paper}
                  >
                    <Table
                      stickyHeader
                      size="small"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Имя</TableCell>
                          <TableCell>Номер телефона</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clients.map((item, key) => (
                          <TableRow
                            hover
                            key={key}
                            style={{ cursor: "pointer" }}
                            onClick={() => openModalClient(item.login, "open")}
                          >
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.login}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
        )}
        {/* Поиск клиента */}

        {/* Поиск заказов */}
        {tabsIdx.search_orders && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.search_orders}
              id="orders"
            >
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
                  <ToggleButtonGroup
                    value={select_toggle}
                    exclusive
                    onChange={handleToggleChange}
                    sx={{
                      display: "flex",
                      "& .MuiToggleButton-root": {
                        fontSize: 16,
                        textTransform: "none",
                        borderRadius: 0,
                        px: 3,
                        py: 0.5,
                      },
                      "& .MuiToggleButton-root:first-of-type": {
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                      },
                      "& .MuiToggleButton-root:last-of-type": {
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                      },
                      "& .MuiToggleButton-root.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      },
                    }}
                  >
                    <ToggleButton value="city">Город</ToggleButton>
                    <ToggleButton value="point">Точка</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  {select_toggle === "city" ? (
                    <MyAutocomplite
                      label="Город"
                      multiple={true}
                      data={cities}
                      value={city_id}
                      func={(e) => changeAutocomplite("city_id", e)}
                    />
                  ) : (
                    <MyAutocomplite
                      label="Точка"
                      multiple={true}
                      data={points}
                      value={point_id}
                      func={(e) => changeAutocomplite("point_id", e)}
                    />
                  )}
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата от"
                    customActions={true}
                    value={dayjs(date_start)}
                    func={(e) => changeDateRange("date_start", e)}
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
                    customActions={true}
                    value={dayjs(date_end)}
                    func={(e) => changeDateRange("date_end", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    type="number"
                    className="input_login"
                    label="Номер заказа"
                    value={order}
                    func={(e) => changeInput("order", "edit", e)}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!order ? null : (
                            <InputAdornment position="end">
                              <IconButton>
                                <ClearIcon onClick={(e) => changeInput("order", "clear", e)} />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <MyTextInput
                    type="number"
                    className="input_login"
                    label="Номер телефона"
                    value={number}
                    func={(e) => changeInput("number", "edit", e)}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!number ? null : (
                            <InputAdornment position="end">
                              <IconButton>
                                <ClearIcon onClick={(e) => changeInput("number", "clear", e)} />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <MyTextInput
                    type="text"
                    className="input_promo"
                    label="Промокод"
                    value={promo}
                    func={(e) => changeInput("promo", "edit", e)}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!number ? null : (
                            <InputAdornment position="end">
                              <IconButton>
                                <ClearIcon onClick={(e) => changeInput("promo", "clear", e)} />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
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
                    value={promo_dr}
                    func={(e) => changeDataCheck("promo_dr", e)}
                    label="Промик на ДР"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <MyTextInput
                    className="input_login"
                    label="Адрес клиента"
                    value={addr}
                    func={(e) => changeInput("addr", "edit", e)}
                    inputAdornment={{
                      endAdornment: (
                        <>
                          {!addr ? null : (
                            <InputAdornment position="end">
                              <IconButton>
                                <ClearIcon onClick={(e) => changeInput("addr", "clear", e)} />
                              </IconButton>
                            </InputAdornment>
                          )}
                        </>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 3,
                  }}
                >
                  <MyAutocomplite
                    label="Кто оформил"
                    multiple={true}
                    data={all_created}
                    value={created}
                    func={(e) => changeAutocomplite("created", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 5,
                  }}
                >
                  <MyAutocomplite
                    label="Товары в заказе"
                    multiple={true}
                    data={all_items}
                    value={items}
                    func={(e) => changeAutocomplite("items", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <Button
                    onClick={getOrders}
                    variant="contained"
                  >
                    Показать
                  </Button>
                </Grid>

                {canAccess("download_file") && search_orders?.length > 0 && (
                  <Grid
                    x={{ display: "flex", alignItems: "center" }}
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <Tooltip
                      title={<Typography color="inherit">{"Скачать таблицу в Excel"}</Typography>}
                    >
                      <IconButton
                        disableRipple
                        sx={{ padding: 0 }}
                        onClick={downLoad}
                      >
                        <ExlIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>

              <Grid
                mt={5}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TableContainer
                  sx={{ maxHeight: { xs: "none", sm: 570 } }}
                  component={Paper}
                >
                  <Table
                    size={"small"}
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Заказ</TableCell>
                        <TableCell>Точка</TableCell>
                        <TableCell>Оформил</TableCell>
                        <TableCell>Номер клиента</TableCell>
                        <TableCell>Адрес доставки</TableCell>
                        <TableCell>Время открытия заказа</TableCell>
                        <TableCell>Ко времени</TableCell>
                        <TableCell>Закрыт на кухне</TableCell>
                        <TableCell>Получен клиентом</TableCell>
                        <TableCell>Время обещ</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Оплата</TableCell>
                        <TableCell>Водитель</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {search_orders.map((item, key) => (
                        <TableRow
                          hover
                          key={key}
                          style={
                            parseInt(item.is_delete) == 1
                              ? {
                                  backgroundColor: "red",
                                  color: "#fff",
                                  fontWeight: "bold",
                                }
                              : {}
                          }
                          sx={{ cursor: "pointer" }}
                          onClick={(e) => openClientOrder(item.id, item.point_id, e)}
                        >
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {key + 1}
                          </TableCell>
                          <TableCell
                            style={
                              parseInt(item.dist) >= 0
                                ? {
                                    backgroundColor: "yellow",
                                    color: "#000",
                                    cursor: "pointer",
                                    fontWeight: "inherit",
                                  }
                                : { color: "inherit", cursor: "pointer", fontWeight: "inherit" }
                            }
                          >
                            {item.id}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.point_addr}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.type_user}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.number}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "inherit",
                              fontWeight: "inherit",
                            }}
                          >
                            {item.street} {item.home}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "inherit",
                              fontWeight: "inherit",
                            }}
                          >
                            {item.date_time_order}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "inherit",
                              fontWeight: "inherit",
                              backgroundColor:
                                parseInt(item.is_preorder) == 1 ? "#bababa" : "inherit",
                            }}
                          >
                            {item.need_time}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.give_data_time == "00:00:00" ? "" : item.give_data_time}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.close_order}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.unix_time_to_client == "0" || parseInt(item.is_preorder) == 1
                              ? ""
                              : item.unix_time_to_client}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.type_order}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.status}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.order_price}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.type_pay}
                          </TableCell>
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.driver}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {search_orders.length ? (
                  <Box
                    sx={{
                      backgroundColor: "#f5f5f5",
                      padding: "10px",
                      borderTop: "1px solid #ddd",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      textAlign: "center",
                      position: "sticky",
                      bottom: 0,
                    }}
                  >
                    <span
                      style={{
                        marginRight: "24px",
                        marginLeft: "10px",
                      }}
                    >
                      Кол-во заказов: {search_orders.length}
                    </span>
                    {access?.count_complete_order_access && (
                      <>
                        <span style={{ color: "green", marginRight: "24px" }}>
                          Кол-во завершенных заказов:{" "}
                          {search_orders.filter((src) => src.status_order === 6)?.length}
                        </span>
                        <span style={{ color: "blue" }}>
                          Сумма завершенных заказов:{" "}
                          {search_orders
                            .filter((src) => src.status_order === 6)
                            .reduce((sum, order) => sum + (parseFloat(order.order_price) || 0), 0)
                            .toLocaleString("ru-RU", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                          руб.
                        </span>
                      </>
                    )}
                  </Box>
                ) : null}
              </Grid>
            </TabPanel>
          </Grid>
        )}
        {/* Поиск заказов */}

        {/* Заказы по адресам */}
        {tabsIdx.search_address && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.search_address}
              id="orders_address"
            >
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
                  <MyAutocomplite
                    label="Город"
                    multiple={true}
                    data={cities}
                    value={city_id_addr}
                    func={(e) => changeAutocomplite("city_id_addr", e)}
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
                    customActions={true}
                    value={dayjs(date_start_addr)}
                    func={(e) => changeDateRange("date_start_addr", e)}
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
                    customActions={true}
                    value={dayjs(date_end_addr)}
                    func={(e) => changeDateRange("date_end_addr", e)}
                  />
                </Grid>

                <Grid
                  style={{ paddingRight: "20px" }}
                  size={{
                    xs: 12,
                    sm: 8,
                  }}
                >
                  <TextareaAutosize
                    aria-label="empty textarea"
                    placeholder=""
                    minRows={8}
                    value={address_list}
                    onChange={(e) => changeAddressList("address_list", e)}
                    label="Список адресов"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "16px",
                      borderRadius: "4px",
                      borderColor: "#ccc",
                      maxWidth: "100%",
                      resize: "vertical",
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <Button
                    onClick={getDataAddress}
                    variant="contained"
                  >
                    Показать
                  </Button>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <Paper>
                    <Tabs
                      value={activeTab_address}
                      onChange={changeTab_address}
                      centered
                      variant="fullWidth"
                    >
                      <Tab
                        label="Список заказов"
                        {...a11yProps(0)}
                      />
                      <Tab
                        label="Список адресов"
                        {...a11yProps(1)}
                      />
                    </Tabs>
                  </Paper>
                </Grid>

                {/* Список заказов */}
                <Grid
                  style={{ paddingTop: 0 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TabPanel
                    value={activeTab_address}
                    index={0}
                    id="clients"
                  >
                    <Grid
                      container
                      spacing={3}
                    >
                      <Grid
                        mt={3}
                        mb={5}
                        size={{
                          xs: 12,
                          sm: 12,
                        }}
                      >
                        <TableContainer
                          sx={{ maxHeight: { xs: "none", sm: 570 } }}
                          component={Paper}
                        >
                          <Table
                            size={"small"}
                            stickyHeader
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>ИД заказа</TableCell>
                                <TableCell>Точка</TableCell>
                                <TableCell>Номер клиента</TableCell>
                                <TableCell>Адрес заказа</TableCell>
                                <TableCell>Сумма заказа</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {orders_list.map((item, key) => (
                                <TableRow
                                  hover
                                  key={key}
                                  sx={{
                                    cursor: "pointer",
                                    backgroundColor: item.is_new ? "#ffcc00" : "inherit",
                                  }}
                                  onClick={() => openClientOrder(item.id, item.point_id)}
                                >
                                  <TableCell>{key + 1}</TableCell>
                                  <TableCell>{item.id}</TableCell>
                                  <TableCell>{item.point_addr}</TableCell>
                                  <TableCell>{item.number}</TableCell>
                                  <TableCell>{item.addr}</TableCell>
                                  <TableCell>
                                    {new Intl.NumberFormat("ru-RU").format(item.order_price ?? 0)} ₽
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </TabPanel>
                </Grid>
                {/* Список заказов */}

                {/* Список адресов */}
                <Grid
                  style={{ paddingTop: 0 }}
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <TabPanel
                    value={activeTab_address}
                    index={1}
                    id="clients"
                  >
                    <Grid
                      container
                      spacing={3}
                    >
                      <Grid
                        mt={3}
                        mb={5}
                        size={{
                          xs: 12,
                          sm: 12,
                        }}
                      >
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Адрес</TableCell>
                                <TableCell>Количество заказов</TableCell>
                                <TableCell>Сумма заказов</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {orders_list_addr.map((item, key) => (
                                <React.Fragment key={key}>
                                  <TableRow
                                    hover
                                    onClick={(e) => openAccordionAdrress(item.id, e)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <TableCell>{key + 1}</TableCell>
                                    <TableCell>{item.address}</TableCell>
                                    <TableCell>{item.orders_count}</TableCell>
                                    <TableCell>
                                      {new Intl.NumberFormat("ru-RU").format(
                                        item.total_amount ?? 0,
                                      )}{" "}
                                      ₽
                                    </TableCell>
                                    <TableCell>
                                      <Tooltip
                                        title={
                                          <Typography color="inherit">
                                            Все заказы по этому адресу
                                          </Typography>
                                        }
                                      >
                                        <ExpandMoreIcon
                                          style={{
                                            display: "flex",
                                            transform: item.is_open
                                              ? "rotate(180deg)"
                                              : "rotate(0deg)",
                                          }}
                                        />
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell
                                      style={{ padding: 0 }}
                                      colSpan={10}
                                    >
                                      <Collapse
                                        in={item.is_open}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Box sx={{ margin: "8px 0" }}>
                                          <Table
                                            size={"small"}
                                            stickyHeader
                                          >
                                            <TableHead>
                                              <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>ИД заказа</TableCell>
                                                <TableCell>Точка</TableCell>
                                                <TableCell>Номер клиента</TableCell>
                                                <TableCell>Адрес заказа</TableCell>
                                                <TableCell>Сумма заказа</TableCell>
                                              </TableRow>
                                            </TableHead>

                                            <TableBody>
                                              {item.orders.map((it, k) => (
                                                <TableRow
                                                  hover
                                                  key={k}
                                                  sx={{
                                                    cursor: "pointer",
                                                    backgroundColor: it.is_new
                                                      ? "#ffcc00"
                                                      : "inherit",
                                                  }}
                                                  onClick={() =>
                                                    openClientOrder(it.id, it.point_id)
                                                  }
                                                >
                                                  <TableCell>{key + 1}</TableCell>
                                                  <TableCell>{it.id}</TableCell>
                                                  <TableCell>{it.point_addr}</TableCell>
                                                  <TableCell>{it.number}</TableCell>
                                                  <TableCell>{it.addr}</TableCell>
                                                  <TableCell>
                                                    {new Intl.NumberFormat("ru-RU").format(
                                                      it.order_price ?? 0,
                                                    )}{" "}
                                                    ₽
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </TabPanel>
                </Grid>
                {/* Список адресов */}
              </Grid>
            </TabPanel>
          </Grid>
        )}
        {/* Заказы по адресам */}

        {/* Поиск клиентов */}
        {tabsIdx.find_clients && (
          <Grid
            style={{ padding: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.find_clients}
              id="find_clients"
            >
              <Clients
                getData={getData}
                showAlert={showAlert}
                canAccess={canAccess}
              />
            </TabPanel>
          </Grid>
        )}
        {/* Поиск клиентов */}

        {/* Поиск заказов расширенный */}
        {tabsIdx.find_orders_more && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.find_orders_more}
              id="orders_more"
            >
              <OrdersMore />
            </TabPanel>
          </Grid>
        )}
        {/* Поиск заказов расширенный */}

        {/* Аналитика по заказам */}
        {tabsIdx.source_traffic && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.source_traffic}
              id="traffic"
            >
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
                  <MyAutocomplite
                    label="Город"
                    multiple={true}
                    data={cities}
                    value={city_id_traffic}
                    func={(e) => changeAutocomplite("city_id_traffic", e)}
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
                    customActions={true}
                    value={dayjs(date_start_traffic)}
                    func={(e) => changeDateRange("date_start_traffic", e)}
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
                    customActions={true}
                    value={dayjs(date_end_traffic)}
                    func={(e) => changeDateRange("date_end_traffic", e)}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <Button
                    onClick={getDataTraffic}
                    variant="contained"
                  >
                    Показать
                  </Button>
                </Grid>

                {/* Визиты статистика */}
                {traffic_stats?.length > 0 && (
                  <Grid
                    mt={3}
                    mb={5}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Typography variant="h4">Визиты все</Typography>
                    <SiteClientsTrafficSummaryTable data={traffic_stats[0]} />
                  </Grid>
                )}
                {/* Визиты статистика */}

                {/* Визиты по источнику */}
                {traffic_sources?.length > 0 && (
                  <Grid
                    mt={3}
                    mb={5}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Typography variant="h4">Источники трафика</Typography>
                    <SiteClientsTrafficBySourceTable rows={traffic_sources} />
                  </Grid>
                )}
                {/* Визиты по источнику */}

                {/* Заказы по источнику */}
                {orders_by_source?.length > 0 && (
                  <Grid
                    mt={3}
                    mb={5}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Typography variant="h4">Источники заказов</Typography>
                    <SiteClientsOrdersBySourceTable rows={orders_by_source} />
                  </Grid>
                )}
                {/* Заказы по источнику */}

                {/* Заказы по utm */}
                {orders_by_utm?.length > 0 && (
                  <Grid
                    mt={3}
                    mb={5}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Typography variant="h4">Заказы по UTM</Typography>
                    <SiteClientsOrdersByUtmTable rows={orders_by_utm} />
                  </Grid>
                )}
                {/* Заказы по utm */}
              </Grid>
            </TabPanel>
          </Grid>
        )}
        {/* Аналитика по заказам */}

        {/* Маркетинговая Аналитика */}
        {tabsIdx.marketing_data && (
          <Grid
            style={{ paddingTop: 0 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <TabPanel
              value={activeTab}
              index={tabsIdx.marketing_data}
              id="marketing"
            >
              <SiteClientsMarketingTab
                points={points}
                getData={getData}
                showAlert={showAlert}
                canAccess={canAccess}
                isLoading={is_load}
                setIsLoading={(loading) => update({ is_load: loading })}
              />
            </TabPanel>
          </Grid>
        )}
        {/* Маркетинговая Аналитика */}
      </Grid>
    </>
  );
}
