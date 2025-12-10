"use client";

import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import dayjs from "dayjs";
import { formatNumber } from "@/src/helpers/utils/i18n";
import { useEffect, useState } from "react";
import DialogUser from "../DialogUser";
import ModalOrder from "../ModalOrder";
import useSortTable from "@/src/hooks/useSortTable";
import { Close } from "@mui/icons-material";

export default function RecursiveOrdersTab({ getData, showAlert }) {
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
  const {
    order: sortOrder,
    orderBy,
    handleSort,
    sortedRows,
  } = useSortTable(orders_recursive, "count");

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
    <Grid
      container
      spacing={3}
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

      {!sortedRows?.length ? (
        orders_recursive !== null && <Typography variant="h6">Нет совпадений</Typography>
      ) : (
        <Grid size={12}>
          <TableContainer sx={{ maxHeight: "60dvh" }}>
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
        </Grid>
      )}
    </Grid>
  );
}
