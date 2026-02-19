"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Grid,
  Backdrop,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from "@mui/material";

import { api_laravel, api_laravel_local } from "@/src/api_new";
import dayjs from "dayjs";

import SiteClients_Modal_Comment_Action from "@/components/site_clients/_SiteClientsModalCommentAction";
import SiteClients_Modal_Client_Order from "@/components/site_clients/_SiteClientsModalClientOrder";
import SiteClients_Modal_Client from "@/components/site_clients/_SiteClientsModalClient";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import SiteClientsMarketingTab from "@/components/site_clients/marketing/SiteClientsMarketingTab";
import TestAccess from "@/ui/TestAccess";

import MyAlert from "@/ui/MyAlert";
import useMyAlert from "@/src/hooks/useMyAlert";
import { useSiteClientsStore } from "./useSiteClientsStore";
import Clients from "./clients/Clients";
import Client from "./client/Client";
import { DAYS, MONTHS } from "./config";
import OrdersMore from "./orders_more/OrdersMore";
import Orders from "./orders/Orders";
import AddressOrders from "./address/AddressOrders";
import OrdersTraffic from "./traffic/OrdersTraffic";
import RecursiveOrdersTab from "./recursive/RecursiveOrdersTab";
import ClientHistory from "./history/ClientHistory";

export default function SiteClients() {
  const {
    access,
    module,
    module_name,

    keepParams,

    date_start_addr,
    date_end_addr,
    city_id_addr,
    address_list,
    date_start_traffic,
    date_end_traffic,
    city_id_traffic,
    is_load,

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

    update, // store setter
    hydrate,
  } = useSiteClientsStore();

  const accessApi = useMemo(() => handleUserAccess(access), [access]);

  const canAccess = (property) => accessApi?.userCan("access", property);

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

  const getData = async (method, data = {}, dop_type = {}) => {
    try {
      update({ is_load: true });

      const res = await api_laravel(module, method, data, dop_type);
      if (!res) throw new Error("Пустой ответ сервера");
      const result = method === "export_file_xls" ? res : res.data;
      return result;
    } catch (e) {
      showAlert(e.message || "Ошибка");
    } finally {
      update({ is_load: false });
    }
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
    setActiveTab(val);
  };

  // const changeSearch = (data, e) => {
  //   if (data === "clear") {
  //     update({
  //       [data]: "",
  //       clients: [],
  //     });
  //   } else {
  //     let login = e?.target?.value;

  //     update({
  //       [data]: login,
  //     });
  //   }
  // };

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

  const openClientOrder = async (order_id, point_id) => {
    try {
      update({ is_load: true });

      const data = {
        order_id,
        point_id,
      };

      const res = await getData("get_one_order", data);
      if (!res) throw new Error(res?.text || "Ошибка получения заказа");
      update({
        showOrder: res,
        modalDialog_order: true,
      });
    } catch (e) {
      return showAlert(e.message, false);
    } finally {
      update({ is_load: false });
    }
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

  const getDataAddress = async () => {
    const city_id = city_id_addr;

    const start = date_start_addr ? dayjs(date_start_addr) : null;
    const end = date_end_addr ? dayjs(date_end_addr) : null;

    if (!start || !end) {
      return showAlert("Необходимо указать даты", false);
    }

    if (start && end && end.isBefore(start, "day")) {
      return showAlert("Дата окончания не может быть меньше даты начала", false);
    }

    if (start && end && end.diff(start, "day") > 31) {
      return showAlert("Эти инструменты не для экспорта базы! 31 день максимум.", false);
    }

    if (!city_id.length) {
      return showAlert("Необходимо выбрать город", false);
    }

    if (!address_list) {
      return showAlert("Необходимо указать адреса", false);
    }

    const data = {
      city_id,
      date_start: start?.format("YYYY-MM-DD"),
      date_end: end?.format("YYYY-MM-DD"),
      addresses: address_list,
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

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const TAB_CONFIG = [
    {
      key: "search_clients",
      name: "Поиск клиентов",
      component: (
        <Clients
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
    {
      key: "find_clients",
      name: "Поиск клиента",
      component: (
        <Client
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
    {
      key: "search_orders",
      name: "Поиск заказов",
      component: (
        <Orders
          getOrders={getOrders}
          canAccess={canAccess}
          downLoad={downLoad}
          openClientOrder={openClientOrder}
        />
      ),
    },
    {
      key: "find_orders_more",
      name: "Поиск заказов расширенный",
      component: (
        <OrdersMore
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
    {
      key: "search_address",
      name: "Заказы по адресам",
      component: (
        <AddressOrders
          getData={getDataAddress}
          canAccess={canAccess}
          openClientOrder={openClientOrder}
        />
      ),
    },
    {
      key: "source_traffic",
      name: "Аналитика по оформленным заказам",
      component: <OrdersTraffic getData={getDataTraffic} />,
    },
    {
      key: "marketing_data",
      name: "Маркетинговая аналитика",
      component: (
        <SiteClientsMarketingTab
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
    {
      key: "recursive_orders",
      name: "Повторные заказы",
      component: (
        <RecursiveOrdersTab
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
    {
      key: "client_history",
      name: "История клиента",
      component: (
        <ClientHistory
          getData={getData}
          showAlert={showAlert}
          canAccess={canAccess}
        />
      ),
    },
  ];

  const tabs = useMemo(() => TAB_CONFIG.filter((tab) => canAccess(tab.key)), [canAccess]);

  const [activeTab, setActiveTab] = useState(0);
  const tabsIdx = useMemo(() => {
    const m = {};
    tabs.forEach((t, i) => canAccess(t.key) && (m[t.key] = i));
    return m;
  }, [tabs]);

  useEffect(() => {
    if (!tabs.length) return;
    if (activeTab < 0 || activeTab >= tabs.length) setActiveTab(0);
  }, [tabs, activeTab]);

  useEffect(() => {
    hydrate();
    initData();
  }, []);

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
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
        days={DAYS}
        months={MONTHS}
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
        mb={1}
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
          sx={{ display: "flex", alignItems: "flex-end", gap: 1, py: 2 }}
        >
          <FormControlLabel
            sx={{
              m: 0,
              ml: "auto",
              "& .MuiFormControlLabel-label": {
                fontSize: 13,
              },
              gap: 1,
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
          sx={{ pb: 2 }}
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

        {tabsIdx &&
          Object.keys(tabsIdx).map((key, index) => {
            const TabComponent = tabs.find((t) => t.key === key)?.component;
            return (
              <Grid
                style={{ padding: 0 }}
                size={12}
                key={key}
              >
                <TabPanel
                  value={activeTab}
                  index={index}
                  id={key}
                >
                  {TabComponent}
                </TabPanel>
              </Grid>
            );
          })}
      </Grid>
    </>
  );
}
