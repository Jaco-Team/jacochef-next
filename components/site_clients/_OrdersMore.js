import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { api_laravel, api_laravel_local } from "@/src/api_new";
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
import ModalOrderWithFeedback from "./ModalOrderWithFeedback";
import ModalOrder from "./ModalOrder";
import MyAlert from "@/ui/MyAlert";

export default function OrdersMore() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [points, setPoints] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [acces, setAcces] = useState({});
  const [url, setUrl] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openAlert, setOpenAlert] = useState(false);
  const [openModalOrder, setOpenModalOrder] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [order, setOrder] = useState({});
  const typeParam = [
    { id: "all", name: "Найти всех" },
    { id: "new", name: "Только новые" },
    {
      id: "current",
      name: "Только текущих",
    },
  ];
  const [formData, setFormData] = useState({
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
  });

  const openOrder = (point_id, order_id) => {
    getData("get_order", { point_id, order_id }).then((data) => {
      setOrder(data);
      setOpenModalOrder(true);
    });
  };

  const showAlert = (status, message) => {
    setErrStatus(status);
    setErrText(message);
    setOpenAlert(true);
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
    } else {
      value = e.target.value;
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

  const getOrders = (customPage = null, customPerPage = null) => {
    const currentPage = customPage && typeof customPage === "number" ? customPage : page;
    const currentPerPage =
      customPerPage && typeof customPerPage === "number" ? customPerPage : rowsPerPage;

    getData("get_orders_more", {
      ...fixFormDates(formData),
      page: currentPage + 1,
      perPage: currentPerPage,
    }).then((data) => {
      if (data.orders) {
        setOrders(data.orders);
        setTotal(data.total);
        setUrl(data.url);
      } else {
        showAlert(data.st, data.text);
      }
    });
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

  useEffect(() => {
    getData("get_all").then((data) => {
      setModule(data.module_info);
      setPoints(data.points);
      setItems(data.items);
      setAcces(data.acces);
    });
  }, []);
  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const result = await api_laravel("site_clients", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  return (
    <>
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      {parseInt(acces.send_feedback_access) === 1 ? (
        <ModalOrderWithFeedback
          getData={getData}
          openOrder={openOrder}
          open={openModalOrder}
          onClose={() => setOpenModalOrder(false)}
          order={order.order}
          order_items={order.order_items}
          err_order={order.err_order}
          feedback_forms={order.feedback_forms}
        />
      ) : (
        <ModalOrder
          getData={getData}
          openOrder={openOrder}
          open={openModalOrder}
          onClose={() => setOpenModalOrder(false)}
          order={order.order}
          order_items={order.order_items}
          err_order={order.err_order}
          feedback_forms={order.feedback_forms}
        />
      )}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{
          flexDirection: {
            sm: "row",
            xs: "column-reverse",
          },
        }}
        style={{ marginBottom: "24px" }}
      >
        <Grid
          container
          spacing={2}
          justifyContent="center"
          mb={3}
          mt={0}
        >
          <Grid
            size={{
              xs: 12,
              sm: 9,
            }}
          >
            <Button
              variant="contained"
              style={{ marginLeft: "20px", whiteSpace: "nowrap" }}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
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
              style={{ marginLeft: "20px", whiteSpace: "nowrap" }}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
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
              style={{ whiteSpace: "nowrap", marginLeft: "8px" }}
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  date_start_true: dayjs().subtract(8, "day"),
                  date_end_true: dayjs().subtract(1, "day"),
                }));
              }}
            >
              Новые за неделю
            </Button>
          </Grid>
        </Grid>

        <Grid
          sx={{ order: { sm: 0, xs: 1 } }}
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Делал заказ от"
            value={formData.date_start_true}
            func={(e) => handleChange(e, "date_start_true")}
          />
        </Grid>

        <Grid
          sx={{ order: { sm: 1, xs: 0 } }}
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Делал заказ до"
            value={formData.date_end_true}
            func={(e) => handleChange(e, "date_end_true")}
          />
        </Grid>

        <Grid
          sx={{ order: { sm: 2, xs: 2 } }}
          display="flex"
          flexDirection="row"
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <Grid>
            <Button
              variant="contained"
              style={{ whiteSpace: "nowrap" }}
              onClick={getOrders}
            >
              Получить список заказов
            </Button>
          </Grid>

          <Grid>
            <Button
              variant="contained"
              style={{ marginLeft: 10, backgroundColor: !!url ? "#3cb623ff" : "#ffcc00" }}
              disabled={!orders.length}
              onClick={onDownload}
            >
              <DownloadIcon />
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Не заказывал от"
            value={formData.date_start_false}
            disabled={formData.param.id === "new"}
            func={(e) => handleChange(e, "date_start_false")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Не заказывал до"
            disabled={formData.param.id === "new"}
            value={formData.date_end_false}
            func={(e) => handleChange(e, "date_end_false")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyCheckBox
            label="Была оформлена ошибка на заказ"
            value={formData.is_show_claim}
            func={(e) => handleChange(e, "is_show_claim")}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            label="Количество заказов от"
            value={formData.count_orders_min}
            type="number"
            func={(e) => handleChange(e, "count_orders_min")}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            label="Количество заказов до"
            value={formData.count_orders_max}
            type="number"
            func={(e) => handleChange(e, "count_orders_max")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyCheckBox
            label="Была оформлена ошибка на последний заказ"
            value={formData.is_show_claim_last}
            func={(e) => handleChange(e, "is_show_claim_last")}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            label="От суммы"
            value={formData.min_summ}
            type="number"
            func={(e) => handleChange(e, "min_summ")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            label="До суммы"
            value={formData.max_summ}
            type="number"
            func={(e) => handleChange(e, "max_summ")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyCheckBox
            label="Подписка на рекламную рассылку"
            value={formData.is_show_marketing}
            func={(e) => handleChange(e, "is_show_marketing")}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyAutocomplite
            label="Точки"
            multiple={true}
            data={points}
            value={formData.point}
            func={(event, value) => handleChange(value, "point")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyAutocomplite
            label="Позиции в заказе"
            multiple={true}
            data={items}
            value={formData.item}
            func={(event, value) => handleChange(value, "item")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyAutocomplite
            label="Пользователи"
            disableClearable={true}
            data={typeParam}
            value={formData.param}
            func={(event, value) => handleChange(value, "param")}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        mt={2}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyTextInput
            label="Промокод"
            value={formData.promo}
            func={(e) => handleChange(e, "promo")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <MyCheckBox
            label="Заказ без промокода"
            value={formData.no_promo}
            func={(e) => handleChange(e, "no_promo")}
          />
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
                        {acces?.send_feedback_access && <TableCell>Оценка заказа</TableCell>}
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
                          {acces?.send_feedback_access && (
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
      </Grid>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 1,
          }}
        ></Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        ></Grid>
      </Grid>
    </>
  );
}
