"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import CheckIcon from "@mui/icons-material/Check";
import ModalOrderWithFeedback from "../ModalOrderWithFeedback";
import ModalOrder from "../ModalOrder";
import { useSiteClientsStore } from "../useSiteClientsStore";
import TestAccess from "@/ui/TestAccess";
import { IconButton, Stack } from "@mui/material";
import { Close } from "@mui/icons-material";

const LS_KEY_OM = "site_clients_orders_more";

export default function OrdersMore({ getData, showAlert, canAccess }) {
  const { points, all_items, keepParams } = useSiteClientsStore();
  // const { access, update } = useSiteClientsStore();

  const [orders, setOrders] = useState([]);
  const [url, setUrl] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openModalOrder, setOpenModalOrder] = useState(false);
  const [order, setOrder] = useState({});
  const typeParam = [
    { id: "all", name: "Найти всех" },
    { id: "new", name: "Только новые" },
    {
      id: "current",
      name: "Только текущих",
    },
  ];

  const DEFAULT_FORM_DATA = {
    date_start_true: null,
    date_end_true: null,
    date_start_false: null,
    date_end_false: null,
    is_show_claim: false,
    count_orders_min: 0,
    count_orders_max: 0,
    is_show_claim_last: false,
    min_summ: 0,
    max_summ: 0,
    promo: "",
    no_promo: false,
    param: { id: "all", name: "Найти всех" },
    is_show_marketing: false,
    point: [],
    preset: "",
    item: [],
    number: null,
  };
  const [formData, setFormDataRaw] = useState(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (!keepParams) {
      setFormDataRaw(DEFAULT_FORM_DATA);
      localStorage.removeItem(LS_KEY_OM);
      return;
    }

    const raw = localStorage.getItem(LS_KEY_OM);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setFormDataRaw({ ...DEFAULT_FORM_DATA, ...parsed });
    } catch {}
  }, [keepParams]);

  const setFormData = (arg1, arg2) => {
    setFormDataRaw((prev) => {
      let patch;

      // setFormData(prev => ({ ... }))
      if (typeof arg1 === "function") {
        patch = arg1(prev);
      }
      // setFormData({ a: 1 })
      else if (typeof arg1 === "object" && arg1 !== null) {
        patch = arg1;
      }
      // setFormData("a", 1)
      else if (typeof arg1 === "string") {
        patch = { [arg1]: arg2 };
      } else {
        return prev;
      }

      if (!patch || typeof patch !== "object") return prev;

      const next = { ...prev, ...patch };

      if (keepParams) {
        localStorage.setItem(LS_KEY_OM, JSON.stringify(next));
      }

      return next;
    });
  };

  const openOrder = async (point_id, order_id) => {
    try {
      const res = await getData("get_order_orders", { point_id, order_id });
      if (!res) throw new Error("Получен пустой ответ");
      setOrder(res);
      setOpenModalOrder(true);
    } catch (e) {
      showAlert(e.message || "Ошибка загрузки заказа");
    }
  };

  const fixFormDates = (formData) => {
    if (!formData) return {};
    return (
      {
        ...formData,
        date_start_true: dayjs(formData.date_start_true).format("YYYY-MM-DD"),
        date_end_true: dayjs(formData.date_end_true).format("YYYY-MM-DD"),
        date_start_false: dayjs(formData.date_start_false).format("YYYY-MM-DD"),
        date_end_false: dayjs(formData.date_end_false).format("YYYY-MM-DD"),
      } || {}
    );
  };

  const handleChange = (e, name) => {
    let value = null;
    if (
      name === "date_start_true" ||
      name === "date_end_true" ||
      name === "date_start_false" ||
      name === "date_end_false" ||
      name === "point" ||
      name === "item" ||
      name === "param"
    ) {
      value = e;
    } else if (
      name === "is_show_claim" ||
      name === "is_show_claim_last" ||
      name === "is_show_marketing" ||
      name === "no_promo"
    ) {
      value = e.target.checked;
    } else if (name === "number") {
      value = e?.target?.value?.replace(/\D/g, "") || "";
    } else {
      value = e?.target?.value || "";
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData.no_promo) {
      setFormData((prev) => ({
        ...prev,
        promo: "",
      }));
    }

    if (formData.promo) {
      setFormData((prev) => ({
        ...prev,
        no_promo: 0,
      }));
    }
  }, [formData.promo, formData.no_promo]);

  useEffect(() => {
    if (formData.param.id === "new") {
      setFormData((prev) => ({
        ...prev,
        date_start_false: null,
        date_end_false: null,
      }));
    }
  }, [formData.param]);

  const getOrders = async (customPage = null, customPerPage = null) => {
    try {
      const currentPage = customPage && typeof customPage === "number" ? customPage : page;
      const currentPerPage =
        customPerPage && typeof customPerPage === "number" ? customPerPage : rowsPerPage;

      if (formData?.number?.length && formData?.number?.length < 4)
        throw new Error("Минимум 4 цифры в телефоне");

      const res = await getData("get_orders_more", {
        ...fixFormDates(formData),
        page: currentPage + 1,
        perPage: currentPerPage,
      });
      if (!res?.orders) {
        throw new Error(res?.text || "Не найдено заказов");
      }
      setOrders(res.orders);
      setTotal(res.total);
      setUrl(res.url);
    } catch (e) {
      showAlert(e.message || "Ошибка получения данных");
    }
  };

  const getFileLinks = async () => {
    if (url) {
      return { url };
    }
    try {
      const data = await getData("get_orders_more_files", {
        ...fixFormDates(formData),
      });
      if (!data?.url) throw new Error("Ссылка для скачивания недоступна");
      setUrl(data.url);
      return { url: data.url };
    } catch (error) {
      console.error("Error getting file url", error);
    }
  };

  const onDownload = async (e) => {
    e.preventDefault();
    const { url } = await getFileLinks();
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <>
      {/* <TestAccess
          access={access}
          setAccess={(access) => update({ access })}
      /> */}
      {canAccess("send_feedback") ? (
        <ModalOrderWithFeedback
          getData={getData}
          showAlert={showAlert}
          open={openModalOrder}
          onClose={() => setOpenModalOrder(false)}
          order={order}
          openOrder={openOrder}
        />
      ) : (
        <ModalOrder
          open={openModalOrder}
          onClose={() => setOpenModalOrder(false)}
          order={order}
        />
      )}
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "lg", mb: 2 }}
      >
        {/* <Grid
          size={{ xs: 12, sm: 8 }}
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
          }}
        >

        </Grid> */}

        <Grid
          container
          size={{ xs: 12, sm: 8 }}
          spacing={3}
        >
          <Grid size={6}>
            <MyDatePickerNew
              label="Делал заказ от"
              value={formData.date_start_true}
              func={(e) => handleChange(e, "date_start_true")}
            />
          </Grid>
          <Grid size={6}>
            <MyDatePickerNew
              label="Делал заказ до"
              value={formData.date_end_true}
              func={(e) => handleChange(e, "date_end_true")}
            />
          </Grid>

          <Grid size={6}>
            <MyDatePickerNew
              label="Не заказывал от"
              disabled={formData.param.id === "new"}
              value={formData.date_start_false}
              func={(e) => handleChange(e, "date_start_false")}
            />
          </Grid>
          <Grid size={6}>
            <MyDatePickerNew
              label="Не заказывал до"
              disabled={formData.param.id === "new"}
              value={formData.date_end_false}
              func={(e) => handleChange(e, "date_end_false")}
            />
          </Grid>

          <Grid size={6}>
            <MyTextInput
              label="Количество заказов от"
              type="number"
              min={0}
              value={formData.count_orders_min}
              func={(e) => handleChange(e, "count_orders_min")}
            />
          </Grid>
          <Grid size={6}>
            <MyTextInput
              label="Количество заказов до"
              type="number"
              min={0}
              value={formData.count_orders_max}
              func={(e) => handleChange(e, "count_orders_max")}
            />
          </Grid>

          <Grid size={6}>
            <MyAutocomplite
              label="Пользователи"
              disableClearable
              data={typeParam}
              value={formData.param}
              func={(_, v) => handleChange(v, "param")}
            />
          </Grid>
          <Grid size={6}>
            <MyAutocomplite
              label="Позиции в заказе"
              multiple={true}
              data={all_items}
              value={formData.item}
              func={(_, v) => handleChange(v, "item")}
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <MyAutocomplite
              label="Точки"
              multiple
              data={points}
              value={formData.point}
              func={(_, v) => handleChange(v, "point")}
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <MyTextInput
              label="Телефон"
              type="text"
              value={formData.number}
              slotProps={{
                input: {
                  endAdornment: (formData.number ?? true) && (
                    <IconButton onClick={() => handleChange("", "number")}>
                      <Close />
                    </IconButton>
                  ),
                },
              }}
              func={(e) => handleChange(e, "number")}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <MyTextInput
              label="Промокод"
              value={formData.promo}
              func={(e) => handleChange(e, "promo")}
              disabled={!!formData.no_promo}
              slotProps={{
                input: {
                  endAdornment: (formData.promo ?? true) && (
                    <IconButton onClick={() => handleChange("", "promo")}>
                      <Close />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <MyCheckBox
              label="Заказ без промокода"
              value={formData.no_promo}
              func={(e) => handleChange(e, "no_promo")}
            />
          </Grid>
        </Grid>

        <Grid
          container
          size={{ xs: 12, sm: 4 }}
          spacing={2}
        >
          <Grid
            size={12}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              alignItems: { sm: "flex-start", xs: "normal" },
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                setFormData((p) => ({
                  ...p,
                  date_start_true: dayjs().subtract(91, "day"),
                  date_end_true: dayjs().subtract(1, "day"),
                  date_start_false: dayjs().subtract(6, "month"),
                  date_end_false: dayjs().subtract(92, "day"),
                  count_orders_min: 1,
                }));
              }}
            >
              Вернувшиеся
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setFormData((p) => ({
                  ...p,
                  date_start_false: dayjs().subtract(91, "day"),
                  date_end_false: dayjs().subtract(1, "day"),
                  date_start_true: dayjs().subtract(6, "month"),
                  date_end_true: dayjs().subtract(92, "day"),
                  count_orders_min: 1,
                }));
              }}
            >
              Не делал заказ 90 дней
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                setFormData((p) => ({
                  ...p,
                  date_start_true: dayjs().subtract(8, "day"),
                  date_end_true: dayjs().subtract(1, "day"),
                  date_start_false: null,
                  date_end_false: null,
                }));
              }}
            >
              Новые за неделю
            </Button>
            <MyCheckBox
              label="Была оформлена ошибка на заказ"
              value={formData.is_show_claim}
              func={(e) => handleChange(e, "is_show_claim")}
            />
            <MyCheckBox
              label="Была оформлена ошибка на последний заказ"
              value={formData.is_show_claim_last}
              func={(e) => handleChange(e, "is_show_claim_last")}
            />
            <MyCheckBox
              label="Подписка на рекламную рассылку"
              value={formData.is_show_marketing}
              func={(e) => handleChange(e, "is_show_marketing")}
            />
            <Stack
              sx={{
                mt: 2,
                gap: 1,
                alignSelf: { xs: "center", sm: "flex-end" },
                alignItems: "center",
                flexDirection: { xs: "row-reverse", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                onClick={getOrders}
              >
                Получить список заказов
              </Button>
              {canAccess("export_items") && (
                <Button
                  variant="contained"
                  disabled={!orders.length}
                  onClick={onDownload}
                  sx={{ backgroundColor: url ? "#3cb623ff" : "#ffcc00" }}
                >
                  <DownloadIcon />
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Grid>

      {!orders.length ? null : (
        <>
          <Grid
            container
            justifyContent="center"
          >
            <Grid
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
                      <TableCell>Заказ</TableCell>
                      <TableCell>Точка</TableCell>
                      <TableCell>Источник трафика</TableCell>
                      {canAccess("send_feedback") && <TableCell>Оценка заказа</TableCell>}
                      <TableCell>Оформил</TableCell>
                      <TableCell>Номер клиента</TableCell>
                      <TableCell>Адрес доставки</TableCell>
                      <TableCell>Время открытия заказа</TableCell>
                      <TableCell>Ко времени</TableCell>
                      <TableCell>Закрыт на кухне</TableCell>
                      <TableCell>Получен клиентом</TableCell>
                      <TableCell>Время обещ</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Оплата</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {orders.map((item, key) => (
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
                        onClick={() => openOrder(item.point_id, item.id)}
                      >
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {page * rowsPerPage + key + 1}
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
                          {item.source}
                        </TableCell>
                        {canAccess("send_feedback") && (
                          <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                            {item.feedback_id ? <CheckIcon style={{ color: "green" }} /> : null}
                          </TableCell>
                        )}
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
                          {item.order_price}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_pay}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 50, 100]}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                labelRowsPerPage="Записей на странице:"
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => {
                  setPage(newPage);
                  getOrders(newPage);
                }}
                onRowsPerPageChange={(event) => {
                  const newPerPage = parseInt(event.target.value, 10);
                  setRowPerPage(newPerPage);
                  setPage(0);
                  getOrders(0, newPerPage);
                }}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}
