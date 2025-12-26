"use client";

import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import {
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  // TableSortLabel,
  Typography,
} from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import dayjs from "dayjs";
import { formatRUR } from "@/src/helpers/utils/i18n";
import { memo, useEffect, useMemo, useState } from "react";
import DialogUser from "../DialogUser";
import ModalOrder from "../ModalOrder";
// import useSortTable from "@/src/hooks/useSortTable";
import { Close } from "@mui/icons-material";

const BUCKETS = [
  { key: "2", label: "2", match: (n) => n === 2 },
  { key: "3", label: "3", match: (n) => n === 3 },
  { key: "4", label: "4", match: (n) => n === 4 },
  { key: "5+", label: "5+", match: (n) => n >= 5 },
];
const COLUMNS = [
  { key: "orders", label: "Заказов", align: "left" },
  { key: "clients", label: "Клиентов", align: "right" },
  { key: "sum", label: "Сумма", align: "right" },
];

const RecursiveOrdersTab = ({ getData, showAlert }) => {
  const {
    update,
    points,
    all_items,
    items_recursive,
    promo_recursive,
    points_recursive,
    date_start_recur,
    date_end_recur,
    orders_recursive,
  } = useSiteClientsStore();

  // user modal
  const [user, setUser] = useState([]);
  const [openModalUser, setOpenModalUser] = useState(false);
  const openUser = async (number) => {
    try {
      const res = await getData("get_one", { number });
      if (!res) throw new Error(res?.text || "Ошибка получения клиента");

      setUser(res);
      setOpenModalUser(true);
    } catch (error) {
      showAlert(error.message || "Ошибка запроса клиента");
    }
  };

  // order modal
  const [order, setOrder] = useState({});
  const [openModalOrder, setOpenModalOrder] = useState(false);
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

  const getOrders = async () => {
    const points = points_recursive;
    const date_start = dayjs(date_start_recur)?.format("YYYY-MM-DD") || "";
    const date_end = dayjs(date_end_recur)?.format("YYYY-MM-DD") || "";

    if (!points?.length) {
      return showAlert("Необходимо выбрать кафе", false);
    }
    if (!date_start || !date_end) {
      return showAlert("Необходимо указать обе даты", false);
    }

    const data = {
      points,
      date_start,
      date_end,
      promo_name: promo_recursive,
      items: items_recursive,
    };

    const res = await getData("get_orders_recursive", data);

    if (res?.st) {
      update({
        orders_recursive: res.orders,
      });
    } else {
      showAlert(res?.text || "Ошибка получения повторных заказов", false);
    }
  };

  // sorting
  // const {
  //   order: sortOrder,
  //   orderBy,
  //   handleSort,
  //   sortedRows,
  // } = useSortTable(orders_recursive, "count");

  const buildBuckets = (rows) => {
    if (!rows?.length) return [];

    const acc = Object.fromEntries(
      BUCKETS.map((b) => [b.key, { orders: b.label, clients: 0, sum: 0 }]),
    );

    let total = { orders: "Всего", clients: 0, sum: 0 };

    for (const { orders_count, sum_order } of rows) {
      const bucket = BUCKETS.find((b) => b.match(orders_count));
      if (!bucket) continue;

      acc[bucket.key].clients += 1;
      acc[bucket.key].sum += sum_order;

      total.clients += 1;
      total.sum += sum_order;
    }

    return [...Object.values(acc), total];
  };
  const allBuckets = useMemo(() => buildBuckets(orders_recursive), [orders_recursive]);

  const newBuckets = useMemo(
    () => buildBuckets(orders_recursive?.filter((r) => r.is_new === 1)),
    [orders_recursive],
  );

  useEffect(() => {
    if (promo_recursive && items_recursive?.length > 0) {
      update({ items_recursive: [] });
    }

    if (!promo_recursive && items_recursive?.length > 0) {
      return;
    }
  }, [promo_recursive]);

  useEffect(() => {
    if (items_recursive?.length > 0 && promo_recursive) {
      update({ promo_recursive: "" });
    }
  }, [items_recursive]);

  return (
    <>
      <Grid
        container
        spacing={3}
        maxWidth="lg"
      >
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
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Кафе"
            multiple={true}
            data={points}
            value={points_recursive}
            func={(_, v) => update({ points_recursive: v })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Grid
            container
            spacing={2}
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
                value={dayjs(date_start_recur)}
                func={(v) => update({ date_start_recur: v })}
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
                value={dayjs(date_end_recur)}
                func={(v) => update({ date_end_recur: v })}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyAutocomplite
                label="Позиции"
                multiple={true}
                data={all_items}
                value={items_recursive}
                func={(_, v) => update({ items_recursive: v })}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyTextInput
                label="Промокод"
                value={promo_recursive}
                func={({ target }) => update({ promo_recursive: target?.value || "" })}
                type="text"
                slotProps={{
                  input: {
                    endAdornment: promo_recursive ? (
                      <Close
                        sx={{ cursor: "pointer" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => update({ promo_recursive: "" })}
                      />
                    ) : null,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <Button
            onClick={getOrders}
            variant="contained"
          >
            Показать
          </Button>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <OrdersTable
            title="Всего заказов"
            rows={allBuckets}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <OrdersTable
            title="Новые клиенты"
            rows={newBuckets}
          />
        </Grid>
      </Grid>

      {/* {!sortedRows?.length ? (
        orders_recursive !== null && <Typography variant="h6">Нет совпадений</Typography>
      ) : (
        <TableContainer sx={{ maxHeight: "60dvh", mt: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === "number" ? sortOrder : false}>
                  <TableSortLabel
                    active={orderBy === "number"}
                    direction={orderBy === "number" ? sortOrder : "asc"}
                    onClick={() => handleSort("number")}
                  >
                    Клиент
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === "count" ? sortOrder : false}>
                  <TableSortLabel
                    active={orderBy === "count"}
                    direction={orderBy === "count" ? sortOrder : "asc"}
                    onClick={() => handleSort("count")}
                  >
                    Количество заказов
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === "sum_order" ? sortOrder : false}>
                  <TableSortLabel
                    active={orderBy === "sum_order"}
                    direction={orderBy === "sum_order" ? sortOrder : "asc"}
                    onClick={() => handleSort("sum_order")}
                  >
                    Сумма
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((client) => (
                <TableRow
                  key={client.number}
                  style={{ cursor: "pointer" }}
                  onClick={() => openUser(client.number)}
                >
                  <TableCell>{client.number}</TableCell>
                  <TableCell>{client.count}</TableCell>
                  <TableCell>{formatNumber(client.sum_order)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )} */}
    </>
  );
};

const OrdersTable = ({ title, rows }) => (
  <TableContainer
    sx={{ mt: 4 }}
    component={Paper}
    variant="outlined"
  >
    <Typography
      variant="subtitle2"
      sx={{ p: 2 }}
    >
      {title}
    </Typography>

    <Table
      stickyHeader
      size="small"
    >
      <TableHead>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableCell
              key={col.key}
              align={col.align}
            >
              {col.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.orders}
            hover
          >
            <TableCell>{row.orders}</TableCell>
            <TableCell align="right">{row.clients}</TableCell>
            <TableCell align="right">{formatRUR(row.sum)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default memo(RecursiveOrdersTab);
