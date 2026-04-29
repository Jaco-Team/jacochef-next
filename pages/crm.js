import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSiteClientsStore } from "@/components/site_clients/useSiteClientsStore";
import { useClientHistoryStore } from "@/components/site_clients/history/useClientHistoryStore";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { delivery_types, order_types_all } from "@/components/site_clients/config";
import { formatRUR } from "@/src/helpers/utils/i18n";
import dayjs from "dayjs";
import useXLSExport from "@/src/hooks/useXLSXExport";
import { LoadingProvider } from "@/components/site_clients/useClientsLoadingContext";
import HistoryClientModal from "@/components/site_clients/history/HistoryClientModal";
import ModalOrder from "@/components/site_clients/ModalOrder";
import {
  MyAutoCompleteWithAll,
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MyTextInput,
} from "@/ui/Forms";
import { Clear, Download } from "@mui/icons-material";
import ClientHistoryTable from "@/components/site_clients/history/ClientHistoryTable";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import HistoryClientModalCrm from "@/components/crm/HistoryClientModalCrm";
import MyAlert from "@/ui/MyAlert";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { ClientsTab } from "@/components/crm/ClientsTab";
import { SegmentTab } from "@/components/crm/SegmentTab";

export default function CrmPage() {
  const {
    is_load,
    all_items,
    points,
    updateMain: updateMain,
    hydrate,
    module_name,
  } = useSiteClientsStore((s) => ({
    is_load: s.is_load,
    all_items: s.all_items,
    points: s.points,
    points_history: s.points_history,
    updateMain: s.update,
    hydrate: s.hydrate,
    module_name: s.module_name,
  }));
  const { access } = useSiteClientsStore();

  const canAccess = (property) => accessApi?.userCan("access", property);
  const accessApi = useMemo(() => handleUserAccess(access), [access]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [segments, setSegments] = useState([]);

  // State для активного таба
  const [activeTab, setActiveTab] = useState(0);

  // localizing form state for speed
  const initialForm = useSiteClientsStore.getState();

  const [form, setForm] = useState(() => ({
    points_history: initialForm.points_history,
    promo: initialForm.promo,
    promo_dr: initialForm.promo_dr,
    order_types: order_types_all,
    delivery_type: delivery_types,
    items: initialForm.items,
    number: initialForm.number,
    date_start: initialForm.date_start,
    date_end: initialForm.date_end,
    gender: initialForm.gender,
    day_last: initialForm.day_last,
    categories: initialForm.categories,
    orders_count: initialForm.orders_count,
    order_utm: initialForm.order_utm,
  }));
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const getData = async (method, data = {}, dop_type = {}) => {
    try {
      updateMain({ is_load: true });

      const res = await api_laravel("crm", method, data, dop_type);
      if (!res) throw new Error("Пустой ответ сервера");
      const result = method === "export_file_xls" ? res : res.data;
      return result;
    } catch (e) {
      showAlert(e.message || "Ошибка");
    } finally {
      updateMain({ is_load: false });
    }
  };
  //

  //// submodule store
  const {
    refresh,
    refreshToken,
    clientHistory,
    order,
    setOrder,
    clientModalOpened,
    setClientModalOpened,
    isOrderModalOpen,
    setIsOrderModalOpen,
    update,
  } = useClientHistoryStore((s) => ({
    refresh: s.refresh,
    refreshToken: s.refreshToken,
    clientHistory: s.clientHistory,
    order: s.order,
    setOrder: s.setOrder,
    clientModalOpened: s.clientModalOpened,
    setClientModalOpened: s.setClientModalOpened,
    isOrderModalOpen: s.isOrderModalOpen,
    setIsOrderModalOpen: s.setIsOrderModalOpen,
    update: s.update,
  }));
  //

  const getPointAddress = useCallback(
    (point_id) => {
      const point = points.find((p) => p.id === point_id);
      return point ? point.name : point_id;
    },
    [points],
  );

  useEffect(() => {
    hydrate();
    initData();
  }, []);

  const openOrder = useCallback(async (point_id, order_id) => {
    try {
      setOrder(null);
      updateMain({ is_load: true });
      const resData = await getData("get_order", { point_id, order_id });
      console.log(resData);
      if (!resData?.st) {
        return showAlert(resData?.text || "Ошибка запроса заказа", false);
      }
      setOrder(resData);
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      updateMain({ is_load: false });
    }
  }, []);

  const openClient = useCallback(async (login) => {
    if (!login) return;
    const { setClientLogin, setClientModalOpened } = useClientHistoryStore.getState();
    updateMain({ is_load: true });
    setClientLogin(login);
    setClientModalOpened(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "number",
        label: "Клиент",
        format: (v) => (
          <Button
            variant="text"
            onClick={() => openClient(v)}
          >
            {v}
          </Button>
        ),
        formatRaw: (value) => String(value).replace(/^8/, "+7"),
      },
      {
        key: "client_name",
        label: "Имя",
        format: (value) => value || "-",
        formatRaw: (value) => value,
      },
      {
        key: "gender",
        label: "Пол",
        format: (value) => value || "-",
        formatRaw: (value) => value,
      },
      {
        key: "client_mail",
        label: "E-mail",
        format: (value) => value || "-",
        formatRaw: (value) => value,
      },
      {
        key: "total_sum_all_time",
        label: "Сумма заказов за всё время",
        format: (value) => formatRUR(value),
        numeric: true,
        formatRaw: (value) => value,
      },
      { key: "total_orders_all_time", label: "Заказов за всё время", numeric: true },
      {
        key: "avg_check_all_time",
        label: "Средний чек за всё время",
        format: (value) => formatRUR(value),
        numeric: true,
        formatRaw: (value) => value,
      },
      {
        key: "date_time_order",
        label: "Дата посл.заказа",
        format: (value) => <div style={{ fontSize: "1rem" }}>{formatYMD(value)}</div>,
        formatRaw: (value) => value,
      },
      { key: "days_from_first", label: "Дней с первого заказа", numeric: true },
      { key: "days_from_last", label: "Дней с последнего заказа", numeric: true },
    ],
    [getPointAddress, openClient],
  );

  const saveSegment = async (data) => {
    const res = await getData("save_segment", data);
    getSegments();
  };

  const handleDelete = async (data) => {
    const res = await getData("delete_segment", data);
    getSegments();
  };

  const updateSegment = async (data) => {
    const res = await getData("update_segment", data);
    getSegments();
  };

  const initData = async () => {
    const data = await getData("get_all");

    if (data) {
      setCategories(data.category);
      setCities(data.cities);
      updateMain({
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

  const getClientHistory = async () => {
    const {
      date_start,
      date_end,
      number,
      promo,
      promo_dr,
      order_types,
      delivery_type,
      items,
      orders_count,
      order_utm,
      points_history,
      gender,
      day_last,
      categories,
    } = useSiteClientsStore.getState();

    const refreshToken = useClientHistoryStore.getState().refreshToken;

    // validate
    if (!date_start) {
      showAlert("Укажите дату начала", false);
      return;
    }

    if (!date_end) {
      showAlert("Укажите дату окончания", false);
      return;
    }

    if (!order_types?.length) {
      showAlert("Укажите кто оформил", false);
      return;
    }

    const resData = await getData("get_client_history", {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      number,
      promo,
      promo_dr,
      order_types,
      delivery_type,
      items,
      orders_count,
      order_utm,
      points: points_history,
      gender,
      day_last,
      categories,
    });

    if (!resData?.st) {
      return showAlert(resData?.text || "За период нет данных", false);
    }
    update({ clientHistory: resData.history, page: 0 });
  };

  const applyRequest = () => {
    if (!form.date_start || !form.date_end) {
      return showAlert("Пожалуйста, выберите обе даты", false);
    }
    updateMain(form);
    refresh();
    getClientHistory();
  };

  const exportXLSX = useXLSExport();

  // Обработчик смены таба
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      getSegments();
    }
  };

  const getSegments = async () => {
    const res = await getData("get_segments");
    setSegments(res.segments);
  };

  const handleUpdateSegment = (updatedData) => {
    // Здесь ваш API запрос на обновление
    console.log("Обновленный сегмент:", updatedData);
    // Обновите список segments
  };

  return (
    <LoadingProvider
      isLoading={is_load}
      setIsLoading={(is_load) => updateMain({ is_load })}
    >
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={is_load}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {clientModalOpened && (
        <HistoryClientModalCrm
          canAccess={canAccess}
          showAlert={showAlert}
          openOrder={openOrder}
          open={clientModalOpened}
          onClose={() => setClientModalOpened(false)}
        />
      )}
      <ModalOrder
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={order}
      />

      <Grid
        container
        className="container_first_child"
        spacing={2}
      >
        <Grid
          size={12}
          sx={{ mb: 2 }}
        >
          <h1>{module_name}</h1>
        </Grid>

        {/* Табы */}
        <Grid size={12}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 2 }}
          >
            <Tab label="Клиенты" />
            {canAccess("segment") ? <Tab label="Сегмент" /> : null}
          </Tabs>
        </Grid>

        {/* Контент табов */}
        <Grid size={12}>
          {activeTab === 0 && (
            <ClientsTab
              form={form}
              setField={setField}
              points={points}
              categories={categories}
              all_items={all_items}
              clientHistory={clientHistory}
              columns={columns}
              is_load={is_load}
              applyRequest={applyRequest}
              exportXLSX={exportXLSX}
              canAccess={canAccess}
            />
          )}
          {activeTab === 1 && canAccess("segment") && (
            <SegmentTab
              categories={categories}
              points={points}
              handleDelete={handleDelete}
              canAccess={canAccess}
              segments={segments}
              updateSegment={updateSegment}
              saveSegment={saveSegment}
              cities={cities}
            />
          )}
        </Grid>
      </Grid>
    </LoadingProvider>
  );
}

export async function getServerSideProps({ res }) {
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
