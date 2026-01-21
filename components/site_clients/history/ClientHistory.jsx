"use client";

import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import {
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { useClientHistoryStore } from "./useClientHistoryStore";
import { Clear, Download } from "@mui/icons-material";
import dayjs from "dayjs";
import { memo, useEffect, useMemo, useState } from "react";
import { formatRUR } from "@/src/helpers/utils/i18n";
import ModalOrder from "../ModalOrder";
import { LoadingProvider } from "../useClientsLoadingContext";
import HistoryClientModal from "./HistoryClientModal";

const delivery_types = [
  { id: 1, name: "Доставка" },
  { id: 2, name: "Самовывоз" },
  { id: 3, name: "В зале" },
  { id: 4, name: "На вынос" },
];

const order_types_all = [
  { id: 0, name: "Кафе" },
  { id: 1, name: "КЦ" },
  { id: 2, name: "Сайт" },
];

function ClientHistory({ getData, showAlert, canAccess }) {
  const columns = [
    // { key: "order_id", label: "Заказ" },
    {
      key: "date_time_order",
      label: "Дата",
      format: (value) => <div style={{ fontSize: 10 }}>{value}</div>,
    },
    { key: "number", label: "Клиент" },
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
      key: "promo_name",
      label: "Промокод",
      format: (value) => value || "-",
    },
    { key: "point_id", label: "Кафе", format: (value) => getPointAddress(value) },
    { key: "order_sum", label: "Сумма", format: (value) => formatRUR(value), numeric: true },
    { key: "total_orders", label: "Всего заказов", numeric: true },
    { key: "avg_check", label: "Средний чек", format: (value) => formatRUR(value), numeric: true },
    { key: "days_from_first", label: "Дней с первого", numeric: true },
    { key: "days_from_last", label: "Дней с последнего", numeric: true },
  ];

  const {
    is_load,
    promo,
    promo_dr,
    order_types,
    all_items,
    points,
    items,
    number,
    date_start,
    date_end,
    orders_count,
    order_utm,
    update: updateMain,
  } = useSiteClientsStore();

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
  } = useClientHistoryStore();

  const getPointAddress = (point_id) => {
    const point = points.find((p) => p.id === point_id);
    return point ? point.name : point_id;
  };

  // sorting and pagination
  const [orderBy, setOrderBy] = useState("date_time_order");
  const [orderDir, setOrderDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const sortedRows = useMemo(() => {
    const rows = [...clientHistory];
    rows.sort((a, b) => {
      const av = a[orderBy];
      const bv = b[orderBy];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return orderDir === "asc" ? av - bv : bv - av;
      }

      return orderDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [clientHistory, orderBy, orderDir]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, page, rowsPerPage]);

  const onSort = (key) => {
    if (orderBy === key) {
      setOrderDir((v) => (v === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(key);
      setOrderDir("asc");
    }
  };

  //
  const getClientHistory = async () => {
    const { refreshToken } = useClientHistoryStore.getState();
    if (!date_start || !date_end || !order_types?.length || !refreshToken) {
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
      items,
      orders_count,
      order_utm,
    });

    if (!resData?.st) {
      return showAlert(resData?.text || "За период нет данных", false);
    }
    update({ clientHistory: resData.history });
    setPage(0);
  };

  const applyRequest = () => {
    if (!date_start || !date_end) {
      return showAlert("Пожалуйста, выберите обе даты", false);
    }
    refresh();
  };

  const openOrder = async (point_id, order_id) => {
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
  };

  const openClient = async (login) => {
    if (!login) return;
    const { setClientLogin, setClientModalOpened } = useClientHistoryStore.getState();
    updateMain({ is_load: true });
    setClientLogin(login);
    setClientModalOpened(true);
  };

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
            sm: 6,
          }}
        >
          <MyDatePickerNew
            label="Дата от"
            customActions={true}
            value={dayjs(date_start)}
            maxDate={dayjs(date_end) ?? dayjs()}
            func={(e) => updateMain({ date_start: e })}
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
            minDate={dayjs(date_start)}
            maxDate={dayjs()}
            func={(e) => updateMain({ date_end: e })}
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
            value={orders_count}
            func={({ target }) => updateMain({ orders_count: target?.value })}
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
            value={promo}
            func={({ target }) => updateMain({ promo: target?.value })}
            inputAdornment={
              !promo ? null : (
                <IconButton>
                  <Clear onClick={() => updateMain({ promo: "" })} />
                </IconButton>
              )
            }
            sx={{ width: "55%" }}
          />
          <MyCheckBox
            value={promo_dr}
            func={({ target }) => updateMain({ promo_dr: Number(target?.checked) })}
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
            value={order_utm}
            func={({ target }) => updateMain({ order_utm: target?.value })}
            inputAdornment={
              !order_utm ? null : (
                <IconButton>
                  <Clear onClick={() => updateMain({ order_utm: "" })} />
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
          <MyAutocomplite
            label="Кто оформил"
            multiple={true}
            data={order_types_all}
            value={order_types}
            func={(_, e) => updateMain({ order_types: e })}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <MyAutocomplite
            label="Позиции в заказе"
            multiple={true}
            data={all_items}
            value={items}
            func={(_, v) => updateMain({ items: v })}
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
                  onClick={() => alert("Download")}
                >
                  <Download />
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <TableContainer
        component={Paper}
        sx={{ mt: 3, maxHeight: "50dvh" }}
      >
        <Table
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.numeric ? "right" : "left"}
                >
                  <TableSortLabel
                    active={orderBy === c.key}
                    direction={orderBy === c.key ? orderDir : "asc"}
                    onClick={() => onSort(c.key)}
                  >
                    {c.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedRows.map((row) => (
              <TableRow
                key={row.order_id}
                hover
              >
                {columns.map((c) => {
                  return c.key === "number" ? (
                    <TableCell
                      key={c.key}
                      align={c.numeric ? "right" : "left"}
                    >
                      <Button
                        // size="small"
                        variant="text"
                        onClick={() => openClient(row[c.key])}
                      >
                        {row[c.key]}
                      </Button>
                    </TableCell>
                  ) : (
                    <TableCell
                      key={c.key}
                      align={c.numeric ? "right" : "left"}
                    >
                      {c.format ? c.format(row[c.key]) : (row[c.key] ?? "-")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        labelRowsPerPage="Строк на странице:"
        count={sortedRows.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </LoadingProvider>
  );
}
export default memo(ClientHistory);
