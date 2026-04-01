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

  // localizing form state for speed
  const initialForm = useSiteClientsStore.getState();

  const [form, setForm] = useState(() => ({
    points_history: initialForm.points_history,
    promo: initialForm.promo,
    promo_dr: initialForm.promo_dr,
    order_types: initialForm.order_types,
    delivery_type: initialForm.delivery_type,
    items: initialForm.items,
    number: initialForm.number,
    date_start: initialForm.date_start,
    date_end: initialForm.date_end,
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
      // { key: "order_id", label: "Заказ" },
      {
        key: "number",
        label: "Клиент",
        format: (v) => (
          <Button
            // size="small"
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

  const initData = async () => {
    const data = await getData("get_all");

    if (data) {
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
    } = useSiteClientsStore.getState();

    const refreshToken = useClientHistoryStore.getState().refreshToken;

    // validate
    if (!date_start || !date_end || !order_types?.length || !refreshToken) {
      console.log("Skipping fetch client history due to missing params");
      return;
    }
    // TODO more variants to skip

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
  };

  const exportXLSX = useXLSExport();

  useEffect(() => {
    getClientHistory();
  }, [refreshToken]);

  return (
    <LoadingProvider
      isLoading={is_load}
      setIsLoading={(is_load) => updateMain({ is_load })}
    >
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
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Кафе"
            multiple={true}
            data={points}
            value={form.points_history}
            func={(_, v) => setField("points_history", v)}
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
            value={dayjs(form.date_start)}
            maxDate={dayjs(form.date_end) ?? dayjs()}
            func={(e) => setField("date_start", e)}
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
            value={dayjs(form.date_end)}
            minDate={dayjs(form.date_start)}
            maxDate={dayjs()}
            func={(e) => setField("date_end", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            type="number"
            label="Заказов за период, от"
            value={form.orders_count}
            func={({ target }) => setField("orders_count", target?.value)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 5,
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MyTextInput
            type="text"
            className="input_promo"
            label="Промокод содержит"
            value={form.promo}
            func={({ target }) => setField("promo", target?.value)}
            inputAdornment={
              !form.promo ? null : (
                <IconButton>
                  <Clear onClick={() => setField("promo", "")} />
                </IconButton>
              )
            }
            sx={{ width: "55%" }}
          />
          <MyCheckBox
            value={form.promo_dr}
            func={({ target }) => setField("promo_dr", Number(target?.checked) || 0)}
            label="Промик на ДР"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            type="text"
            label="UTM содержит"
            value={form.order_utm}
            func={({ target }) => setField("order_utm", target?.value)}
            inputAdornment={
              !form.order_utm ? null : (
                <IconButton>
                  <Clear onClick={() => setField("order_utm", "")} />
                </IconButton>
              )
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyAutoCompleteWithAll
            withAll={true}
            label="Кто оформил"
            multiple={true}
            options={order_types_all}
            value={form.order_types}
            onChange={(e) => setField("order_types", e)}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyAutoCompleteWithAll
            withAll={true}
            label="Тип доставки"
            multiple={true}
            options={delivery_types}
            value={form.delivery_type}
            onChange={(e) => setField("delivery_type", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Позиции в заказе"
            multiple={true}
            data={all_items}
            value={form.items}
            func={(_, v) => setField("items", v)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: { xs: "flex-end", sm: "space-evenly" },
          }}
        >
          <Button
            onClick={() => applyRequest()}
            variant="contained"
          >
            Показать
          </Button>

          {canAccess("download_file") && clientHistory?.length > 0 && (
            <Tooltip title={<Typography>{"Скачать таблицу в Excel"}</Typography>}>
              <span>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#3cb623ff" }}
                  onClick={() =>
                    exportXLSX(
                      clientHistory,
                      columns,
                      `client_history_${formatYMD(form.date_start)}-${formatYMD(form.date_end)}.xlsx`,
                    )
                  }
                >
                  <Download />
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      {!!clientHistory.length ? (
        <div style={{ padding: "24px" }}>
          <ClientHistoryTable
            columns={columns}
            rows={clientHistory}
          />
        </div>
      ) : (
        <Typography sx={{ mt: 3, mx: "auto" }}>Нет данных</Typography>
      )}
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
