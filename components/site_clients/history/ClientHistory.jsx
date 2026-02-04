"use client";

import {
  MyAutoCompleteWithAll,
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MyTextInput,
} from "@/ui/Forms";
import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { useClientHistoryStore } from "./useClientHistoryStore";
import { Clear, Download } from "@mui/icons-material";
import dayjs from "dayjs";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { formatRUR } from "@/src/helpers/utils/i18n";
import ModalOrder from "../ModalOrder";
import { LoadingProvider } from "../useClientsLoadingContext";
import HistoryClientModal from "./HistoryClientModal";
import { delivery_types, order_types_all } from "../config";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ClientHistoryTable from "./ClientHistoryTable";

function ClientHistory({ getData, showAlert, canAccess }) {
  //// bind to main module store
  const {
    is_load,
    all_items,
    points,
    points_history,
    update: updateMain,
  } = useSiteClientsStore((s) => ({
    is_load: s.is_load,
    all_items: s.all_items,
    points: s.points,
    points_history: s.points_history,
    update: s.update,
  }));

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

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
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
        key: "date_time_order",
        label: "Дата",
        format: (value) => <div style={{ fontSize: ".7rem" }}>{formatYMD(value)}</div>,
        formatRaw: (value) => value,
      },
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
        key: "type_order",
        label: "Тип",
        format: (value) => delivery_types.find((t) => t.id === value)?.name || value,
      },
      {
        key: "is_client",
        label: "Источник",
        format: (value) => order_types_all.find((t) => t.id === value)?.name || value,
      },
      {
        key: "utm",
        label: "UTM",
        format: (value) => value || "-",
      },
      {
        key: "promo_name",
        label: "Промокод",
        format: (value) => value || "-",
      },
      { key: "point_id", label: "Кафе", format: (value) => getPointAddress(value) },
      {
        key: "order_sum",
        label: "Сумма",
        format: (value) => formatRUR(value),
        numeric: true,
        formatRaw: (value) => value,
      },
      { key: "total_orders_range", label: "Заказов за период", numeric: true },
      { key: "total_orders", label: "Всего заказов", numeric: true },
      {
        key: "avg_check",
        label: "Средний чек",
        format: (value) => formatRUR(value),
        numeric: true,
        formatRaw: (value) => value,
      },
      { key: "days_from_first", label: "Дней с первого", numeric: true },
      { key: "days_from_last", label: "Дней с последнего", numeric: true },
    ],
    [getPointAddress, openClient],
  );

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
      {clientModalOpened && (
        <HistoryClientModal
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
        spacing={3}
        maxWidth={"lg"}
      >
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
        <ClientHistoryTable
          columns={columns}
          rows={clientHistory}
        />
      ) : (
        <Typography sx={{ mt: 3, mx: "auto" }}>Нет данных</Typography>
      )}
    </LoadingProvider>
  );
}
export default memo(ClientHistory);
