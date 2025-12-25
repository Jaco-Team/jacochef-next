import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
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

import ModalOrder from "../ModalOrder";
import { useSiteClientsStore } from "../useSiteClientsStore";
import DialogUser from "../DialogUser";

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
};

const LS_KEY_CS = "site_clients_clients";

export default function Clients({ getData, showAlert, canAccess }) {
  const { points, items } = useSiteClientsStore();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState([]);
  const [url, setUrl] = useState("");
  const [urlCsv, setUrlCsv] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModalUser, setOpenModalUser] = useState(false);
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

  // form and persist
  const [formData, setFormDataRaw] = useState(DEFAULT_FORM_DATA);

  const { keepParams } = useSiteClientsStore();

  useEffect(() => {
    if (!keepParams) {
      setFormDataRaw(DEFAULT_FORM_DATA);
      localStorage.removeItem(LS_KEY_CS);
      return;
    }

    const raw = localStorage.getItem(LS_KEY_CS);
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
        localStorage.setItem(LS_KEY_CS, JSON.stringify(next));
      }

      return next;
    });
  };

  // const router = useRouter();

  const openUser = async (number) => {
    try {
      console.log("Opening user modal for number", number);
      const res = await getData("get_one", { number });
      if (!res) throw new Error(res?.text || "Ошибка получения клиента");
      setUser(res);
      setOpenModalUser(true);
    } catch (error) {
      showAlert(error.message || "Ошибка запроса клиента");
    }
  };

  const openOrder = async (point_id, order_id) => {
    try {
      const res = await getData("get_order", { point_id, order_id });
      if (!res?.order) throw new Error(res?.text || "Ошибка получения заказа");
      setOrder(res);
      setOpenModalOrder(true);
    } catch (error) {
      showAlert(error.message || "Ошибка запроса заказа");
    }
  };

  const handleChange = (e, name) => {
    let value;
    const directValueFields = [
      "date_start_true",
      "date_end_true",
      "date_start_false",
      "date_end_false",
      "point",
      "item",
      "param",
    ];
    const checkedFields = ["is_show_claim", "is_show_claim_last", "is_show_marketing", "no_promo"];

    if (directValueFields.includes(name)) {
      value = e;
    } else if (checkedFields.includes(name)) {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    setFormData((prev) => {
      if (name === "promo") {
        return {
          ...prev,
          promo: value,
          no_promo: value ? 0 : prev.no_promo, // clear checkbox if promo set
        };
      }

      if (name === "no_promo") {
        return {
          ...prev,
          no_promo: value,
          promo: value ? "" : prev.promo, // clear promo if checkbox set
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const getUsers = (customPage = null, customPerPage = null) => {
    const currentPage = customPage || page;
    const currentPerPage = customPerPage || rowsPerPage;
    getData("get_users", {
      ...formData,
      date_start_true: dayjs(formData.date_start_true).format("YYYY-MM-DD"),
      date_end_true: dayjs(formData.date_end_true).format("YYYY-MM-DD"),
      date_start_false: dayjs(formData.date_start_false).format("YYYY-MM-DD"),
      date_end_false: dayjs(formData.date_end_false).format("YYYY-MM-DD"),
      page: currentPage + 1,
      perPage: currentPerPage,
    }).then((data) => {
      if (data?.users) {
        setUsers(data.users);
        setTotal(data.total);
        setUrl(data.url);
        setUrlCsv(data.urlCsv);
      } else {
        showAlert(data?.text || "Ошибка получения данных");
      }
    });
  };

  const getFileLinks = async (format) => {
    if (url && urlCsv) {
      return { url, urlCsv };
    }
    try {
      console.log(formData);
      const data = await getData("get_clients_files", {
        ...formData,
        date_start_true: dayjs(formData.date_start_true).format("YYYY-MM-DD"),
        date_end_true: dayjs(formData.date_end_true).format("YYYY-MM-DD"),
        date_start_false: dayjs(formData.date_start_false).format("YYYY-MM-DD"),
        date_end_false: dayjs(formData.date_end_false).format("YYYY-MM-DD"),
      });
      if (!data?.url || !data.urlCsv) throw new Error("Ссылка для скачивания недоступна");
      setUrl(data.url);
      setUrlCsv(data.urlCsv);

      return { url: data.url, urlCsv: data.urlCsv };
    } catch (error) {
      showAlert(error.message || "Ошибка получения файлов", false);
    }
  };

  const onDownload = async (e) => {
    e.preventDefault();
    const res = await getFileLinks();
    if (!res?.url) return;
    const link = document.createElement("a");
    link.href = res.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const onDownloadCsv = async (e) => {
    e.preventDefault();
    const res = await getFileLinks();
    if (!res?.urlCsv) return;
    const link = document.createElement("a");
    link.href = res.urlCsv;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  useEffect(() => {
    if (formData.param.id === "new") {
      setFormData((prev) => ({
        ...prev,
        date_start_false: null,
        date_end_false: null,
      }));
    }
  }, [formData.param]);

  return (
    <>
      <DialogUser
        open={openModalUser}
        onClose={() => setOpenModalUser(false)}
        user={user}
        openOrder={openOrder}
      />
      <ModalOrder
        getData={getData}
        openOrder={openOrder}
        open={openModalOrder}
        onClose={() => setOpenModalOrder(false)}
        order={order}
      />
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "lg" }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Делал заказ от"
            value={formData.date_start_true}
            func={(e) => handleChange(e, "date_start_true")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Делал заказ до"
            value={formData.date_end_true}
            func={(e) => handleChange(e, "date_end_true")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Button
            variant="contained"
            style={{ whiteSpace: "nowrap" }}
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

        <Grid
          size={{
            xs: 12,
            sm: 4,
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
            sm: 4,
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
            sm: 4,
          }}
        >
          <Button
            variant="contained"
            style={{ whiteSpace: "nowrap" }}
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
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="Количество заказов от"
            value={formData.count_orders_min}
            type="number"
            min={0}
            func={(e) => handleChange(e, "count_orders_min")}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="Количество заказов до"
            value={formData.count_orders_max}
            type="number"
            min={0}
            func={(e) => handleChange(e, "count_orders_max")}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyCheckBox
            label="Была оформлена ошибка на заказ"
            value={formData.is_show_claim}
            func={(e) => handleChange(e, "is_show_claim")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="От суммы"
            value={formData.min_summ}
            type="number"
            min={0}
            step={100}
            func={(e) => handleChange(e, "min_summ")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="До суммы"
            value={formData.max_summ}
            type="number"
            min={0}
            step={100}
            func={(e) => handleChange(e, "max_summ")}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyCheckBox
            label="Была оформлена ошибка на последний заказ"
            value={formData.is_show_claim_last}
            func={(e) => handleChange(e, "is_show_claim_last")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Точки"
            multiple={true}
            data={points || []}
            value={formData.point || ""}
            func={(event, value) => handleChange(value, "point")}
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
            data={items || []}
            value={formData.item || ""}
            func={(event, value) => handleChange(value, "item")}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyCheckBox
            label="Подписка на рекламную рассылку"
            value={formData.is_show_marketing}
            func={(e) => handleChange(e, "is_show_marketing")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Пользователи"
            disableClearable={true}
            data={typeParam || []}
            value={formData.param || ""}
            func={(event, value) => handleChange(value, "param")}
          />
        </Grid>

        <Grid
          size={{
            xs: 8,
            sm: 4,
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
            xs: 4,
            sm: 4,
          }}
        >
          <MyCheckBox
            label="Заказ без промокода"
            value={formData.no_promo}
            func={(e) => handleChange(e, "no_promo")}
          />
        </Grid>

        {/* ACTION */}
        <Grid
          // sx={{ order: { sm: 2, xs: 2 } }}
          display="flex"
          flexDirection="row"
          justifyContent="center"
          size={12}
        >
          <Button
            variant="contained"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => getUsers()}
          >
            Получить список клиентов
          </Button>

          <Button
            variant="contained"
            style={{ marginLeft: 10, backgroundColor: !!url ? "#3cb623ff" : "#ffcc00" }}
            disabled={!users.length || !canAccess("export_items")}
            onClick={onDownload}
          >
            <DownloadIcon />
            Excel
          </Button>
          <Button
            variant="contained"
            style={{
              marginLeft: 10,
              backgroundColor: !!urlCsv ? "#3cb62388" : "rgba(215,184,111,0.55)",
            }}
            disabled={!users.length || !canAccess("export_items")}
            onClick={onDownloadCsv}
          >
            <DownloadIcon />
            CSV
          </Button>
        </Grid>
      </Grid>
      {!users.length ? null : (
        <Grid
          container
          justifyContent="center"
          mt={3}
        >
          <Grid
            size={{
              xs: 12,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Последний комментарий</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.map((item, i) => (
                    <TableRow
                      key={i + 1}
                      style={{ cursor: "pointer" }}
                      onClick={() => openUser(item.login)}
                    >
                      <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                      <TableCell>
                        {item.name}
                        {item.number_new_active ? (
                          <span style={{ color: "red", fontWeight: "bold" }}> Новый!</span>
                        ) : (
                          ""
                        )}
                      </TableCell>
                      <TableCell>{item.login}</TableCell>
                      <TableCell
                        dangerouslySetInnerHTML={{ __html: item?.last_comment }}
                      ></TableCell>
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
                getUsers(newPage);
              }}
              onRowsPerPageChange={(event) => {
                const newPerPage = parseInt(event.target.value, 10);
                setRowsPerPage(newPerPage);
                setPage(0);
                getUsers(0, newPerPage);
              }}
            />
          </Grid>
        </Grid>
      )}
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
