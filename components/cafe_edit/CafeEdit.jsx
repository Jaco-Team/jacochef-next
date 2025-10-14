"use client";

import { useEffect } from "react";

import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { MyAutocomplite } from "@/components/shared/Forms";

// import {api_laravel_local as api_laravel} from "@/src/api_new";
import { api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import CafeEdit_Modal_Kkt_Info_Add from "@/components/cafe_edit/CafeEdit_Modal_Kkt_Info_Add";
import CafeEdit_Modal_Kkt_Info from "@/components/cafe_edit/CafeEdit_Modal_Kkt_Info";
import CafeEdit_Modal_Close_Cafe from "@/components/cafe_edit/CafeEdit_Modal_Close_Cafe";
import CafeEdit_Modal_History from "@/components/cafe_edit/CafeEdit_Modal_History";
import CafeEdit_Modal_Edit from "@/components/cafe_edit/CafeEdit_Modal_Edit";
import CafeEdit_Modal_New from "@/components/cafe_edit/CafeEdit_Modal_New";
import CafeEdit_Modal_Zone from "@/components/cafe_edit/CafeEdit_Modal_Zone";
import TabPanel from "@/components/shared/TabPanel/TabPanel";
import a11yProps from "@/components/shared/TabPanel/a11yProps";
import CafeEdit_ZonesMap from "@/components/cafe_edit/CafeEdit_ZonesMap";
import deepEqual from "@/src/helpers/utils/deepEqual";
import TestAccess from "@/components/shared/TestAccess";
import useCafeEditStore from "@/components/cafe_edit/useCafeEditStore";
import useCafeEditModalsStore from "@/components/cafe_edit/useCafeEditModalsStore";
import useFullScreen from "@/src/hooks/useFullScreen";
import CafeEditTabInfo from "@/components/cafe_edit/tabs/CafeEditTabInfo";
import MyAlert from "@/components/shared/MyAlert";
import useMyAlert from "@/src/hooks/useMyAlert";
import CafeEditTabRates from "@/components/cafe_edit/tabs/CafeEditTabRates";
import CafeEditTabPay from "@/components/cafe_edit/tabs/CafeEditTabPay";
import CafeEditTabSettings from "@/components/cafe_edit/tabs/CafeEditTabSettings";
import CafeEditTabDrivers from "@/components/cafe_edit/tabs/CafeEditTabDrivers";
import CafeEditTabKKT from "@/components/cafe_edit/tabs/CafeEditTabKKT";
import HistDropDownTable from "@/components/cafe_edit/HistDropDownTable";

export default function CafeEdit({ initialData, initialPointData }) {
  const {
    module,
    module_name,
    is_load,
    acces,
    points,
    point,
    cities,
    activeTab,
    point_info,
    zone,
    other_zones,
    point_zone_hist,
    index_info,
    index_rate,
    index_pay,
    index_sett,
    index_zone,
    index_driver,
    index_kkt,
    tabs_data,
    confirmDialog,
    nextTab,
  } = useCafeEditStore();

  const {
    modalDialog,
    modalDialog_zone,
    one_zone,
    modalDialog_edit,
    mark,
    modalDialog_close,
    modalDialogView,
    itemView,
    type_modal,
    date_edit,
    modalDialog_kkt,
    kkt_update,
    pointModal,
    modalDialog_kkt_add,
  } = useCafeEditModalsStore();

  const setModalsStateKey = useCafeEditModalsStore((s) => s.setModalsStateKey);
  const setModalsState = useCafeEditModalsStore.setState;
  const setStateKey = useCafeEditStore((s) => s.setStateKey);
  const setState = useCafeEditStore.setState;

  const fullScreen = useFullScreen();

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const getBaseData = async () => {
    const data = await getData("get_all");
    if (!data) {
      showAlert("Ошибка получения данных");
      return;
    }

    setState({
      acces: data.acces,
      points: data.points,
      point: data.points[0],
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;

    setTimeout(() => {
      getTabIndex();
    }, 100);

    setTimeout(async () => {
      await getDataPoint();
    }, 200);
  };

  const getData = async (method, data = {}) => {
    setStateKey("is_load", true);

    const res = api_laravel(module, method, data)
      .then((result) => result.data)
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setTimeout(() => {
          setStateKey("is_load", false);
        }, 500);
      });

    return res;
  };

  const changePoint = async (_, value) => {
    value && setStateKey("point", value);

    setTimeout(async () => {
      await getDataPoint();
    }, 100);
  };

  const changeTab = async (_, value) => {
    const { point_info, point_info_copy } = useCafeEditStore.getState();
    const hasChanges = !deepEqual(point_info, point_info_copy);

    if (hasChanges) {
      setStateKey("confirmDialog", true);
      setStateKey("nextTab", value);
      return;
    }

    // setStateKey("is_load", true);

    // const index_zone = index_zone;
    // if(value === index_zone) {
    //   const zone = zone;
    //   const other_zones = other_zones;

    //   if(zone.length && other_zones.length) {
    //     setTimeout(() => {
    //       getZones(zone, other_zones);
    //     }, 300);
    //   } else {
    //     setTimeout(() => {
    //       map?.geoObjects?.removeAll();
    //     }, 300);
    //   }

    // } else {
    //   map = null;
    // }

    setStateKey("activeTab", value);
    // await getDataPoint();
  };

  const confirmTabChange = async () => {
    setStateKey("is_load", true);
    setStateKey("activeTab", nextTab);
    setStateKey("confirmDialog", false);
    setStateKey("nextTab", null);
    await getDataPoint();
  };

  const getTabIndex = () => {
    if (!acces) return;
    const tabs_data = Object.keys(acces)?.reduce((tabs, key) => {
      if (key.match(/_(access|view|edit)$/)) return tabs;
      if (!canAccess(key)) return tabs;

      if (key === "active_point" || key === "organization_point" || key === "telephone_point") {
        const infoName = "Информация о точке";
        const exists = tabs.find((item) => item.name === infoName);

        if (!exists) {
          tabs.push({ key: "active_point", name: infoName });
        }
      }

      if (key === "rate_point") {
        tabs.push({ key: "rate_point", name: "Коэффициенты" });
      }

      if (key === "pay_point") {
        tabs.push({ key: "pay_point", name: "Зарплата" });
      }

      if (key === "settings_point") {
        tabs.push({ key: "settings_point", name: "Настройки точки" });
      }

      if (key === "zone_point") {
        tabs.push({ key: "zone_point", name: "Зоны доставки" });
      }

      if (key === "settings_driver") {
        tabs.push({ key: "settings_driver", name: "Настройки курьеров" });
      }

      if (key === "kkt_info") {
        tabs.push({ key: "kkt_info", name: "Информация о кассах" });
      }
      return tabs;
    }, []);

    tabs_data.forEach((item, index) => {
      if (
        item.key === "active_point" ||
        item.key === "organization_point" ||
        item.key === "telephone_point"
      ) {
        setStateKey("index_info", index);
      }

      if (item.key === "rate_point") {
        setStateKey("index_rate", index);
      }

      if (item.key === "pay_point") {
        setStateKey("index_pay", index);
      }

      if (item.key === "settings_point") {
        setStateKey("index_sett", index);
      }

      if (item.key === "zone_point") {
        setStateKey("index_zone", index);
      }

      if (item.key === "settings_driver") {
        setStateKey("index_driver", index);
      }

      if (item.key === "kkt_info") {
        setStateKey("index_kkt", index);
      }
    });
    setStateKey("tabs_data", tabs_data);
  };

  const getDataPoint = async () => {
    const { point } = useCafeEditStore.getState();
    const data = {
      point_id: point.id,
      city_id: point.city_id,
    };

    const res = await getData("get_one", data);
    if (!res) {
      showAlert("Не удалось получить данные");
      return;
    }

    setPointStateFromData(res);

    // if(res.zone.length && res.other_zones.length) {
    //   setTimeout(() => {
    //     getZones(res.zone, res.other_zones);
    //   }, 300);
    // } else {
    //   setTimeout(() => {
    //     map?.geoObjects?.removeAll();
    //   }, 300);
    // }
  };

  const setPointStateFromData = (pointData) => {
    // console.log(`raw point data`, pointData);
    pointData.point_info.manager_id = {
      id: pointData.point_info.manager_id,
      name: pointData.point_info.manager_name,
    };
    const upr = pointData.upr_list.find(
      (upr) => parseInt(upr.id) === parseInt(pointData.point_info?.manager_id?.id)
    );
    if (!upr) pointData.upr_list.push(pointData.point_info?.manager_id);
    const today = dayjs();

    const kkt_info_active = pointData.kkt_info_active.map((item) => {
      const newItem = { ...item };

      if (item.date_end) {
        const diffEnd = dayjs(item.date_end).diff(today, "day");
        newItem.days_left_end = diffEnd <= 0 ? "!" : diffEnd;
      }

      if (item.date_license) {
        const diffLic = dayjs(item.date_license).diff(today, "day");
        newItem.days_left_license = diffLic <= 0 ? "!" : diffLic;
      }

      return newItem;
    });

    setState({
      upr_list: pointData.upr_list,
      cities: pointData.cities,
      point_info: pointData.point_info,
      point_info_copy: JSON.parse(JSON.stringify(pointData.point_info)),
      other_zones: pointData.other_zones,
      zone: pointData.zone,
      point_info_hist: pointData.point_info_hist,
      point_rate_hist: pointData.point_rate_hist,
      point_pay_hist: pointData.point_pay_hist,
      point_sett_hist: pointData.point_sett_hist,
      point_zone_hist: pointData.point_zone_hist,
      point_sett_driver_hist: pointData.point_sett_driver_hist,
      kkt_info_active: kkt_info_active,
      kkt_info_none_active: pointData.kkt_info_none_active,
      kkt_info_hist: pointData.kkt_info_hist,
    });
    setModalsState({
      reason_list: pointData.reason_list,
    });
  };

  const changeItemChecked = (key, event) => {
    const value = event.target.checked ? 1 : 0;
    if (key === "is_сlosed_technic") {
      setModalsState({
        show_comment: !!value,
        is_сlosed_overload: 0,
        is_сlosed_technic: value,
        chooseReason: null,
      });
    }

    if (key === "is_сlosed_overload") {
      setModalsState({
        show_comment: false,
        is_сlosed_overload: value,
        is_сlosed_technic: 0,
        chooseReason: null,
      });
    }
    setState((state) => ({
      ...state,
      point_info: { ...state.point_info, [key]: value },
    }));
  };

  const close_modal_cafe = () => {
    setModalsState({
      modalDialog_close: false,
    });

    const { chooseReason, is_сlosed_overload, is_сlosed_technic } =
      useCafeEditModalsStore.getState();

    if (!is_сlosed_overload && !is_сlosed_technic && !chooseReason) {
      setState((s) => ({ ...s, point_info: { ...s.point_info, cafe_handle_close: 1 } }));
    }

    setModalsState({
      is_сlosed_overload: 0,
      is_сlosed_technic: 0,
      chooseReason: null,
      show_comment: false,
    });
  };

  const stop_cafe = async () => {
    const point_id = point.id;
    const { chooseReason, is_сlosed_overload, is_сlosed_technic } =
      useCafeEditModalsStore.getState();

    const data = {
      point_id,
      is_сlosed_overload: is_сlosed_overload ? 1 : 0,
      is_сlosed_technic: is_сlosed_technic ? 1 : 0,
      comment: chooseReason,
      point_info,
    };
    const res = await getData("stop_cafe", data);

    showAlert(res?.text, res?.st);
    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
  };

  const open_new_point = () => {
    const { activePointNew = {} } = useCafeEditModalsStore.getState();
    const { cities } = useCafeEditStore.getState();
    const itemNew = JSON.parse(JSON.stringify(activePointNew));
    itemNew.cities = [...cities];
    setModalsState({
      modalDialog: true,
      activePoint: itemNew,
    });
  };

  const save_new_point = async (item) => {
    const data = {
      addr: item.addr,
      city_id: item.city_id,
    };

    const res = await getData("save_new_point", data);

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text, res?.st);
  };

  const save_edit_point_info = async () => {
    let data = point_info;

    data.point_id = data.id;

    if (!data.city_id) {
      showAlert("Необходимо выбрать город");
      return;
    }

    if (!data.addr) {
      showAlert("Необходимо указать адрес");
      return;
    }

    if (!data.raion) {
      showAlert("Необходимо указать район");
      return;
    }

    if (!data.organization) {
      showAlert("Необходимо указать организацию");
      return;
    }

    if (!data.inn) {
      showAlert("Необходимо указать ИНН");
      return;
    }

    if (!data.ogrn) {
      showAlert("Необходимо указать ОГРН");
      return;
    }

    if (!data.kpp || parseInt(data.kpp) === 0) {
      showAlert("Необходимо указать КПП");
      return;
    }

    if (!data.full_addr) {
      showAlert("Необходимо указать полный адрес");
      return;
    }

    const res = await getData("save_edit_point_info", data);

    showAlert(res?.text || "Ошибка сохранения", res?.st);

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
  };

  const save_edit_point = async (date) => {
    const data = useCafeEditStore.getState().point_info;

    data.point_id = data.id;

    data.date_start = date;

    let res;

    if (mark === "rate") {
      res = await getData("save_edit_point_rate", data);
    } else {
      res = await getData("save_edit_point_pay", data);
    }

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text, res?.st);
  };

  const save_edit_point_sett_driver = async () => {
    const data = useCafeEditStore.getState().point_info;

    data.point_id = data.id;

    const res = await getData("save_edit_point_sett_driver", data);

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text, res?.st);
  };

  const save_edit_point_sett = async () => {
    const data = useCafeEditStore.getState().point_info;

    data.point_id = data.id;

    const res = await getData("save_edit_point_sett", data);

    if (!res?.st) {
      showAlert(res?.text || "Не удалось сохранить данные");
    } else {
      showAlert(res?.text || "Данные успешно сохранены");
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
  };

  const save_active_zone = async () => {
    const { zone, point } = useCafeEditStore.getState();
    const data = {
      zone_list: zone,
      point_id: point.id,
    };

    const res = await getData("stop_zone", data);

    if (!res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text || "Неизвестный статус", !!res?.st);
  };

  const openZone = (index) => {
    const { zone } = useCafeEditStore.getState();
    if (zone[index]) {
      setModalsState({
        modalDialog_zone: true,
        one_zone: zone[index],
      });
    }
  };

  const open_hist_view = (index, type_modal) => {
    const {
      point_info_hist,
      point_rate_hist,
      point_pay_hist,
      point_sett_hist,
      point_sett_driver_hist,
    } = useCafeEditStore.getState();

    let histData;

    if (type_modal === "info") {
      histData = point_info_hist;
    }

    if (type_modal === "rate") {
      histData = point_rate_hist;
    }

    if (type_modal === "pay") {
      histData = point_pay_hist;
      console.log(point_pay_hist);
    }

    if (type_modal === "sett") {
      histData = point_sett_hist;
    }

    if (type_modal === "driver") {
      histData = point_sett_driver_hist;
    }

    let itemView = JSON.parse(JSON.stringify(histData[index]));
    if (type_modal === "info") {
      itemView.is_active = parseInt(itemView.is_active) ? "Активна" : "Не активна";
    }

    if (type_modal === "sett") {
      itemView.priority_pizza = parseInt(itemView.priority_pizza) ? "Да" : "Нет";
      itemView.priority_order = parseInt(itemView.priority_order) ? "Да" : "Нет";
      itemView.rolls_pizza_dif = parseInt(itemView.rolls_pizza_dif) ? "Да" : "Нет";
      itemView.cook_common_stol = parseInt(itemView.cook_common_stol) ? "Да" : "Нет";
      itemView.cafe_handle_close =
        parseInt(itemView.cafe_handle_close) === 1 ? "Работает" : "На стопе";
    }

    if (parseInt(index) !== 0) {
      let itemView_old = JSON.parse(JSON.stringify(histData[index - 1]));

      if (type_modal === "info") {
        itemView_old.is_active = parseInt(itemView_old.is_active) ? "Активна" : "Не активна";
      }

      if (type_modal === "sett") {
        itemView_old.priority_pizza = parseInt(itemView_old.priority_pizza) ? "Да" : "Нет";
        itemView_old.priority_order = parseInt(itemView_old.priority_order) ? "Да" : "Нет";
        itemView_old.rolls_pizza_dif = parseInt(itemView_old.rolls_pizza_dif) ? "Да" : "Нет";
        itemView_old.cook_common_stol = parseInt(itemView_old.cook_common_stol) ? "Да" : "Нет";
        itemView_old.cafe_handle_close =
          parseInt(itemView_old.cafe_handle_close) === 1 ? "Работает" : "На стопе";
      }

      for (let key in itemView) {
        if (itemView[key] !== itemView_old[key]) {
          if (key === "city_id") {
            const name = cities.find((item) => item.id === itemView.city_id)?.name;
            itemView[key] = { key: name, color: "true" };
          } else if (key === "manager_id") {
            const name = itemView.manager_name ?? "";
            itemView[key] = { key: name, color: "true" };
          } else {
            itemView[key] = { key: itemView[key], color: "true" };
          }
        } else {
          if (key === "city_id") {
            itemView.city_id = cities.find((item) => item.id === itemView.city_id)?.name ?? "";
          }

          if (key === "manager_id") {
            itemView.manager_id = itemView.manager_name ?? "";
          }
        }
      }
    } else {
      itemView.city_id = cities.find((item) => item.id === itemView.city_id)?.name ?? "";

      itemView.manager_id = itemView.manager_name ?? "";
    }

    let date_edit = null;

    if (type_modal === "rate" || type_modal === "pay") {
      if (itemView?.date_start?.key) {
        date_edit = itemView?.date_start?.key;
      } else {
        date_edit = itemView?.date_start ?? null;
      }
    }

    setModalsState({
      modalDialogView: true,
      itemView,
      type_modal,
      date_edit,
    });
  };

  const open_hist_kkt = (id, kkt_id, type_modal) => {
    const kkt_info_hist = useCafeEditStore.getState().kkt_info_hist;

    const kkt_list = kkt_info_hist
      .filter((kkt) => parseInt(kkt.kkt_id) === parseInt(kkt_id))
      .sort((a, b) => new Date(b.date_time_update) - new Date(a.date_time_update));

    const index = kkt_list.findIndex((kkt) => parseInt(kkt.id) === parseInt(id));

    let itemView = { ...kkt_list[index] };

    itemView.is_active = parseInt(itemView.is_active) ? "Да" : "Нет";

    let itemView_old = null;

    if (index > 0) {
      itemView_old = { ...kkt_list[index - 1] };
      itemView_old.is_active = parseInt(itemView_old.is_active) ? "Да" : "Нет";

      Object.keys(itemView).forEach((key) => {
        if (itemView[key] !== itemView_old[key]) {
          itemView[key] = { key: itemView[key], color: "true" };
        }
      });
    }

    setModalsState({
      modalDialogView: true,
      itemView,
      type_modal,
    });
  };

  const open_hist_view_zone = (index, type_modal) => {
    const item = useCafeEditStore.getState().point_zone_hist;

    let itemView = JSON.parse(JSON.stringify(item[index]));

    itemView.is_active = parseInt(itemView.is_active) ? "включена" : "отключена";

    setModalsState({
      modalDialogView: true,
      itemView,
      type_modal,
    });
  };

  const add_new_fn = async (new_fn, start, end) => {
    const kkt = useCafeEditModalsStore.getState().kkt_update;

    const date_start = dayjs(start).format("YYYY-MM-DD");
    const date_end = dayjs(end).format("YYYY-MM-DD");

    const data = {
      date_start,
      date_end,
      fn: new_fn,
      rn_kkt: kkt.rn_kkt,
      kassa: kkt.kassa,
      dop_kassa: kkt.dop_kassa,
      base: kkt.base,
      is_active: kkt.is_active,
      date_license: kkt.date_license,
      point_id: point?.id,
    };

    const res = await getData("save_new_kkt", data);

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text, res?.st);
  };

  const save_kkt = async (data) => {
    const type_modal = type_modal;

    data.point_id = point?.id;

    let res;

    if (type_modal === "add_kkt") {
      res = await getData("save_new_kkt", data);
    } else {
      const kkt = kkt_update;
      data.id = kkt.id;
      res = await getData("save_edit_kkt", data);
    }

    if (res?.st) {
      setTimeout(async () => {
        await getDataPoint();
      }, 300);
    }
    showAlert(res?.text, res?.st);
  };

  const canView = (key) => {
    const { userCan } = handleUserAccess(acces);
    return userCan("view", key);
  };

  const canEdit = (key) => {
    const { userCan } = handleUserAccess(acces);
    return userCan("edit", key);
  };

  const canAccess = (key) => {
    const { userCan } = handleUserAccess(acces);
    return userCan("access", key);
  };

  useEffect(() => {
    if (initialData) {
      setState({
        acces: initialData.acces,
        points: initialData.points,
        point: initialData.points?.[0],
        module_name: initialData.module_info?.name,
      });
      if (initialPointData) {
        setPointStateFromData(initialPointData);
      } else {
        getDataPoint();
      }
      document.title = initialData.module_info?.name || "Cafe Edit";
    } else {
      getBaseData();
    }
  }, []);

  useEffect(() => {
    getTabIndex();
  }, [acces]);

  return (
    <>
      <Backdrop
        style={{ zIndex: 999 }}
        open={is_load}
      >
        <CircularProgress />
      </Backdrop>
      {/* <TestAccess
        access={acces}
        setAccess={(acces) => setStateKey("acces", { ...acces })}
      /> */}
      <Dialog
        open={confirmDialog}
        onClose={() => setState({ confirmDialog: false })}
        maxWidth="sm"
      >
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          <Typography>Есть несохраненные изменения. Перейти на другую вкладку?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState({ confirmDialog: false })}>Отмена</Button>
          <Button onClick={confirmTabChange}>Перейти</Button>
        </DialogActions>
      </Dialog>

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <CafeEdit_Modal_Kkt_Info
        type={type_modal}
        open={modalDialog_kkt}
        pointModal={pointModal}
        kkt={kkt_update}
        onClose={() => setModalsStateKey("modalDialog_kkt", false)}
        fullScreen={fullScreen}
        save_kkt={save_kkt}
        acces={acces}
        canEdit={(key) => canEdit(key)}
      />

      <CafeEdit_Modal_Kkt_Info_Add
        open={modalDialog_kkt_add}
        onClose={() => setModalsStateKey("modalDialog_kkt_add", false)}
        fullScreen={fullScreen}
        addFN={add_new_fn}
      />

      <CafeEdit_Modal_Close_Cafe
        open={modalDialog_close}
        onClose={close_modal_cafe}
        changeItemChecked={changeItemChecked}
        fullScreen={fullScreen}
        stop_cafe={stop_cafe}
      />

      <CafeEdit_Modal_New
        open={modalDialog}
        onClose={() => setModalsState({ modalDialog: false, mark: "" })}
        save={save_new_point}
        fullScreen={fullScreen}
      />

      <CafeEdit_Modal_Zone
        open={modalDialog_zone}
        onClose={() => setModalsState({ modalDialog_zone: false, one_zone: null })}
        zone={one_zone}
        save={save_active_zone}
        fullScreen={fullScreen}
      />

      <CafeEdit_Modal_Edit
        open={modalDialog_edit}
        onClose={() => setModalsState({ modalDialog_edit: false })}
        save={save_edit_point}
        fullScreen={fullScreen}
      />

      <CafeEdit_Modal_History
        open={modalDialogView}
        onClose={() =>
          setModalsState({
            modalDialogView: false,
            itemView: null,
            type_modal: null,
            date_edit: null,
          })
        }
        itemView={itemView}
        fullScreen={fullScreen}
        type_modal={type_modal}
        date_edit={date_edit}
      />

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <h1>{module_name}</h1>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <MyAutocomplite
            label="Кафе"
            multiple={false}
            data={points}
            value={point}
            func={changePoint}
            disableCloseOnSelect={false}
          />
        </Grid>

        {canEdit("organization_point") && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              onClick={open_new_point}
              variant="contained"
            >
              Добавить кафе
            </Button>
          </Grid>
        )}

        <Grid // tabs
          size={12}
        >
          <Paper>
            <Tabs
              value={activeTab}
              onChange={changeTab}
              variant="scrollable"
              scrollButtons={false}
            >
              {tabs_data?.map((item, index) => {
                return (
                  <Tab
                    label={item.name}
                    {...a11yProps(index)}
                    key={index}
                    sx={{ minWidth: "fit-content", flex: 1 }}
                  />
                );
              })}
            </Tabs>
          </Paper>
        </Grid>
        {activeTab === index_info && (
          <Grid size={12}>
            <TabPanel
              value={activeTab}
              index={index_info}
              id="info"
            >
              <CafeEditTabInfo
                saveData={save_edit_point_info}
                openHistModal={(index) => open_hist_view(index, "info")}
                canView={canView}
                canEdit={canEdit}
              />
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_rate && (
          <Grid size={12}>
            <TabPanel
              value={activeTab}
              index={index_rate}
              id="rate"
            >
              <CafeEditTabRates
                openHistModal={(index) => open_hist_view(index, "rate")}
                canView={canView}
                canEdit={canEdit}
              />
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_pay && (
          <Grid size={12}>
            <TabPanel
              value={activeTab}
              index={index_pay}
              id="pay"
            >
              <CafeEditTabPay
                openHistModal={(index) => open_hist_view(index, "pay")}
                canView={canView}
                canEdit={canEdit}
              />
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_sett && (
          <Grid
            size={12}
            style={{ paddingTop: 0 }}
          >
            <TabPanel
              value={activeTab}
              index={index_sett}
              id="sett"
            >
              <CafeEditTabSettings
                canView={canView}
                canEdit={canEdit}
                openHistModal={(index) => open_hist_view(index, "sett")}
                saveSettings={save_edit_point_sett}
              />
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_zone && (
          <Grid size={12}>
            <TabPanel
              value={activeTab}
              index={index_zone}
              id="zone"
            >
              <Grid
                size={12}
                mb={3}
              >
                <CafeEdit_ZonesMap
                  zones={zone}
                  otherZones={other_zones}
                  clickCallback={openZone}
                  readonly={!canAccess("zone_point")}
                />
              </Grid>

              {point_zone_hist.length > 0 && (
                <Grid
                  size={12}
                  mb={5}
                >
                  <HistDropDownTable
                    histData={point_zone_hist}
                    openHistModal={(index) => open_hist_view_zone(index, "zone")}
                  />
                </Grid>
              )}
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_driver && (
          <Grid
            size={12}
          >
            <TabPanel
              value={activeTab}
              index={index_driver}
              id="driver"
            >
              <CafeEditTabDrivers
                canView={canView}
                canEdit={canEdit}
                openHistModal={(index) => open_hist_view(index, "sett")}
                saveSettings={save_edit_point_sett_driver}
              />
            </TabPanel>
          </Grid>
        )}
        {activeTab === index_kkt && (
          <Grid size={12}>
            <TabPanel
              value={activeTab}
              index={index_kkt}
              id="kkt"
            >
              <CafeEditTabKKT
                openHistModal={(itemId, kktId) => open_hist_kkt(itemId, kktId, "kkt")}
                canAccess={canAccess}
                canView={canView}
                canEdit={canEdit}
              />
            </TabPanel>
          </Grid>
        )}
      </Grid>
    </>
  );
}
