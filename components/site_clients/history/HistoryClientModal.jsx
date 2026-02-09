"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { api_laravel } from "@/src/api_new";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Typography,
} from "@mui/material";
import { Clear, Close } from "@mui/icons-material";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import { useDebounce } from "@/src/hooks/useDebounce";
import dayjs from "dayjs";
import ExcelIcon from "@/ui/ExcelIcon";
import useXLSExport from "@/src/hooks/useXLSXExport";
import formatPrice from "@/src/helpers/ui/formatPrice";
import { useLoading } from "../useClientsLoadingContext";
import { useClientHistoryStore } from "./useClientHistoryStore";
import { delivery_types, order_types_all } from "../config";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import { useSiteClientsStore } from "../useSiteClientsStore";
import useFullScreen from "@/src/hooks/useFullScreen";
import { formatPlural, formatRUR } from "@/src/helpers/utils/i18n";

dayjs.locale("ru");

function HistoryClientModal({ canAccess, showAlert, openOrder, open, onClose }) {
  const { client, clientLogin, clientLoading, setClientModalOpened } = useClientHistoryStore();
  const clientInfo = client?.client_info;

  // global isLoading
  const { isLoading, setIsLoading } = useLoading();

  const exportXLSX = useXLSExport();

  // sorting & filtering
  const [sortBy, setSortBy] = useState("date_time");
  const [sortDir, setSortDir] = useState("desc");

  const initialForm = useSiteClientsStore.getState();
  const [form, setForm] = useState(() => ({
    points_history: [],
    promo: "",
    order_types: [],
    delivery_type: [],
    items: [],
    date_start: null,
    date_end: null,
    order_utm: "",
  }));
  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const clientPoints = useMemo(() => {
    const orders = client?.client_orders;
    if (!orders?.length) return [];
    const usedIds = new Set(orders.map((o) => o.point_id).filter((id) => id != null));
    return initialForm.points.filter((p) => usedIds.has(p.id));
  }, [client?.client_orders, initialForm?.points]);

  const clientItems = useMemo(() => {
    const orders = client?.client_orders;
    if (!orders?.length) return [];
    const usedIds = new Set(
      orders.flatMap((o) => (Array.isArray(o.items) ? o.items.map((it) => it.id) : [])),
    );
    return initialForm.all_items.filter((it) => usedIds.has(it.id));
  }, [client?.client_orders, initialForm.all_items]);

  const sortedFilteredOrders = useMemo(() => {
    if (!client?.client_orders) return [];

    let rows = [...client.client_orders];

    if (form.promo) {
      const v = form.promo.toLowerCase();
      rows = rows.filter((r) => String(r.promo_name).toLowerCase().includes(v));
    }

    if (form.order_utm) {
      const v = form.order_utm.toLowerCase();
      rows = rows.filter((r) => String(r.utm).toLowerCase().includes(v));
    }

    if (form.date_start) {
      const start = form.date_start.startOf("day").valueOf();
      rows = rows.filter((r) => dayjs(r.date_time).valueOf() >= start);
    }

    if (form.date_end) {
      const end = form.date_end.endOf("day").valueOf();
      rows = rows.filter((r) => dayjs(r.date_time).valueOf() <= end);
    }

    if (form.items?.length) {
      const ids = form.items.map((i) => i.id);
      rows = rows.filter((r) => ids.every((id) => r.items?.some((it) => it.id === id)));
    }

    if (form.order_types?.length) {
      const ids = form.order_types.map((i) => i.id);
      rows = rows.filter((r) => ids.includes(r.is_client));
    }

    if (form.delivery_type?.length) {
      const ids = form.delivery_type.map((i) => i.id);
      rows = rows.filter((r) => ids.includes(r.new_type_order));
    }

    if (form.points_history.length) {
      const ids = form.points_history.map((i) => i.id);
      rows = rows.filter((r) => ids.includes(r.point_id));
    }

    rows.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return rows;
  }, [client?.client_orders, sortBy, sortDir, form]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((v) => (v === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // tabs
  const [activeTab, setActiveTab] = useState(0);

  const getData = async (method, data = {}, dop_type = {}) => {
    try {
      const res = await api_laravel("site_clients", method, data, dop_type);
      if (!res) {
        throw new Error("Ошибка при получении данных");
      }
      const result = res.data || null;
      return result;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getClient = async () => {
    const { clientLogin, setClient, setClientLoading } = useClientHistoryStore.getState();
    try {
      setClientLoading(true);
      setIsLoading(true);
      setClient(null);
      const res = await getData("get_one_client_history", { login: clientLogin });
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка загрузки данных клиента");
      }
      setClient(res);
    } catch (error) {
      showAlert(`Error fetching client data: ${error.message}`, false);
    } finally {
      setClientLoading(false);
      setIsLoading(false);
    }
  };

  const debouncedGetClient = useDebounce(getClient, 300);
  useEffect(() => {
    debouncedGetClient();
  }, [clientLogin]);

  useEffect(() => {
    const range = getDateRangeFromOrders(client?.client_orders);
    if (!range) return;

    setForm((f) => ({
      ...f,
      date_start: f.date_start ?? range.start,
      date_end: f.date_end ?? range.end,
    }));
  }, [client?.client_orders]);

  // fullscreen hook
  const fullScreen = useFullScreen();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"xl"}
        sx={{ opacity: isLoading ? 0 : 1 }}
      >
        <DialogTitle>
          <Grid
            container
            spacing={0}
            mb={1}
          >
            <Grid
              mb={2}
              size={12}
            >
              Информация о клиенте с номером телефона
              {!!clientLogin && `: ${clientLogin}`}
              <IconButton
                onClick={() => setClientModalOpened(false)}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  padding: 20,
                }}
              >
                <Close />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        {clientLoading ? (
          <CircularProgress sx={{ padding: 20 }} />
        ) : (
          <DialogContent>
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Paper>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  centered
                  variant="fullWidth"
                >
                  <Tab
                    label="Профиль"
                    {...a11yProps(0)}
                  />
                  <Tab
                    label="История заказов"
                    {...a11yProps(1)}
                  />
                </Tabs>
              </Paper>
            </Grid>

            {/* О клиенте */}
            <Grid size={12}>
              <TabPanel
                value={activeTab}
                index={0}
                id="client"
              >
                <Paper style={{ padding: 24 }}>
                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={12}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>Имя:</Typography>
                    <Typography>{clientInfo?.name || "Не указано"}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Телефон:
                    </Typography>
                    <Typography>
                      {clientLogin ? <a href={`tel:${clientLogin}`}>{clientLogin}</a> : "Не указан"}
                    </Typography>
                  </Grid>

                  <Grid
                    mb={3}
                    className="mail_box"
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography
                      style={{ fontWeight: "bold", paddingRight: 10, whiteSpace: "nowrap" }}
                    >
                      Эл почта:
                    </Typography>
                    <Typography>{clientInfo?.mail ?? "Не указана"}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Зарегистрирован:
                    </Typography>
                    <Typography>
                      {(clientInfo?.date_reg &&
                        dayjs(clientInfo?.date_reg).format("DD MMMM YYYY")) ??
                        "Не указано"}
                    </Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Источник первого заказа:
                    </Typography>
                    <Typography>
                      {clientInfo?.source || clientInfo?.medium
                        ? `${clientInfo?.source || "n/a"}: ${clientInfo?.medium || "n/a"}`
                        : "Не указан"}
                    </Typography>
                  </Grid>

                  <Grid
                    mb={3}
                    className="select_box"
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography
                      style={{ fontWeight: "bold", paddingRight: 10, whiteSpace: "nowrap" }}
                    >
                      Дата рождения:
                    </Typography>
                    <Typography>
                      {(clientInfo?.date_bir && dayjs(clientInfo?.date_bir).format("DD MMMM")) ??
                        "Не указана"}
                    </Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Заказов:
                    </Typography>
                    <Typography>
                      {`${clientInfo?.all_count_order} / ${formatPrice(clientInfo?.summ, true)}`}
                    </Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Доставок:
                    </Typography>
                    <Typography>{`${clientInfo?.count_dev} / ${formatPrice(
                      clientInfo?.summ_dev,
                      true,
                    )}`}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Самовывозов:
                    </Typography>
                    <Typography>{`${clientInfo?.count_pic} / ${formatPrice(
                      clientInfo?.summ_pic,
                      true,
                    )}`}</Typography>
                  </Grid>

                  <Grid
                    style={{ display: "flex" }}
                    mb={3}
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography style={{ fontWeight: "bold", paddingRight: 10 }}>
                      Средний чек:
                    </Typography>
                    <Typography>
                      {formatPrice(+clientInfo?.summ / +clientInfo?.all_count_order || 0, true)}
                    </Typography>
                  </Grid>
                </Paper>
              </TabPanel>
            </Grid>
            {/* /О клиенте */}

            {/* История */}
            {canAccess("view_orders") && (
              <Grid
                size={12}
                sx={{ mt: 2 }}
              >
                <TabPanel
                  value={activeTab}
                  index={1}
                  id="history"
                >
                  <Grid
                    container
                    spacing={1}
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
                        data={clientPoints}
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
                        sm: 4,
                      }}
                    >
                      <MyAutocomplite
                        label="Кто оформил"
                        multiple={true}
                        data={order_types_all}
                        value={form.order_types}
                        func={(_, v) => setField("order_types", v)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 4,
                      }}
                    >
                      <MyAutocomplite
                        label="Тип доставки"
                        multiple={true}
                        data={delivery_types}
                        value={form.delivery_type}
                        func={(_, v) => setField("delivery_type", v)}
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
                        data={clientItems}
                        value={form.items}
                        func={(_, v) => setField("items", v)}
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
                      size={12}
                      sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                    >
                      {canAccess("export_items") && (
                        <Box>
                          <IconButton
                            style={{ cursor: "pointer", padding: 10 }}
                            onClick={() =>
                              exportXLSX(
                                sortedFilteredOrders,
                                ordersColumns,
                                `client-orders-history-${clientLogin}.xlsx`,
                              )
                            }
                            title="Экспортировать в Excel"
                          >
                            <ExcelIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <TableContainer
                    sx={{ maxHeight: { xs: "none", sm: "45dvh" } }}
                    component={Paper}
                  >
                    <Table
                      size="small"
                      stickyHeader
                    >
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell>#</TableCell>

                          {ordersColumns.map((col) => (
                            <TableCell
                              key={col.key}
                              align={col.numeric ? "right" : "left"}
                            >
                              <TableSortLabel
                                active={sortBy === col.key}
                                direction={sortBy === col.key ? sortDir : "asc"}
                                onClick={() => handleSort(col.key)}
                              >
                                {col.label}
                              </TableSortLabel>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedFilteredOrders.map((item, idx) => (
                          <TableRow
                            hover
                            key={item.order_id || idx}
                            onClick={() => openOrder(item.point_id, item.order_id)}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: Number(item.is_delete)
                                ? "rgb(204, 0, 51)"
                                : undefined,
                              "& td": { color: Number(item.is_delete) ? "#fff" : "#000" },
                            }}
                          >
                            <TableCell>{idx + 1}</TableCell>

                            {ordersColumns.map((col) => (
                              <TableCell
                                key={col.key}
                                align={col.numeric ? "right" : "left"}
                              >
                                {col.format ? col.format(item[col.key]) : (item[col.key] ?? "-")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Stack
                    direction={"row"}
                    justifyContent={"flex-end"}
                    sx={{ mt: 1 }}
                  >
                    Всего:{" "}
                    {formatPlural(sortedFilteredOrders.length, ["заказ", "заказа", "заказов"])} на
                    сумму{" "}
                    {formatRUR(sortedFilteredOrders.reduce((res, o) => res + Number(o.summ), 0))}
                  </Stack>
                </TabPanel>
              </Grid>
            )}
            {/* /История */}
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setClientModalOpened(false)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(HistoryClientModal);

const ordersColumns = [
  {
    label: "Дата заказа",
    key: "date_time",
    format: (v) => formatYMD(v),
  },
  {
    label: "ID заказа",
    key: "order_id",
    format: (v) => `#${v}`,
  },
  {
    label: "Кафе",
    key: "point_addr",
  },
  {
    label: "Тип заказа",
    key: "new_type_order",
    format: (v) => delivery_types.find((t) => t.id === Number(v))?.name || "Неизвестно",
  },
  {
    label: "Источник",
    key: "is_client",
    format: (v) => order_types_all.find((t) => t.id === Number(v))?.name || "Неизвестно",
  },
  {
    label: "UTM",
    key: "utm",
  },
  {
    label: "Прокод",
    key: "promo_name",
  },
  {
    label: "Позиции",
    key: "items",
    format: (v) =>
      (
        <div style={{ fontSize: ".7rem" }}>
          {v.reduce((acc, item) => `${acc} ${item.name}: ${item.count};`, "")}
        </div>
      ) || "",
    formatRaw: (v) => v.reduce((acc, item) => `${acc} ${item.name}: ${item.count};`, "") || "",
  },

  {
    label: "Сумма",
    key: "summ",
    numeric: true,
    format: (v) => `${v} р.`,
  },
];

const getDateRangeFromOrders = (orders) => {
  if (!Array.isArray(orders) || !orders.length) return null;

  let min;
  let max;

  for (const { date_time } of orders) {
    const d = dayjs(date_time);
    if (!d.isValid()) continue;

    if (!min || d.isBefore(min)) min = d;
    if (!max || d.isAfter(max)) max = d;
  }

  if (!min || !max) return null;

  return {
    start: min.startOf("day"),
    end: max.endOf("day"),
  };
};
