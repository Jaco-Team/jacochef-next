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
  Tooltip,
  // TableSortLabel,
  Typography,
} from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { useSiteClientsStore } from "../useSiteClientsStore";
import dayjs from "dayjs";
import { formatRUR } from "@/src/helpers/utils/i18n";
import { memo, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
// import useSortTable from "@/src/hooks/useSortTable";

const BUCKETS = [
  { key: "1", label: "1", match: (n) => n === 1 },
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

const RecursiveOrdersTab = ({ getData, showAlert, canAccess }) => {
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

  const exportStatsXlsx = () => {
    if (!allBuckets?.length && !newBuckets?.length) {
      return showAlert("Нет данных для экспорта", false);
    }

    const wb = XLSX.utils.book_new();

    const mapRows = (rows) =>
      rows?.map((r) => ({
        Заказов: r.orders,
        Клиентов: r.clients,
        Сумма: r.sum,
      })) || [];

    if (allBuckets?.length) {
      const wsAll = XLSX.utils.json_to_sheet(mapRows(allBuckets));
      XLSX.utils.book_append_sheet(wb, wsAll, "Всего заказов");
    }

    if (newBuckets?.length) {
      const wsNew = XLSX.utils.json_to_sheet(mapRows(newBuckets));
      XLSX.utils.book_append_sheet(wb, wsNew, "Новые клиенты");
    }

    const name = `recursive_stats_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;
    XLSX.writeFile(wb, name);
  };

  const getOrders = async () => {
    const points = points_recursive;
    const date_start = dayjs(date_start_recur)?.format("YYYY-MM-DD") || "";
    const date_end = dayjs(date_end_recur)?.format("YYYY-MM-DD") || "";
    update({
      orders_recursive: [],
    });
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
                maxDate={dayjs(date_end_recur) ?? dayjs()}
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
                minDate={dayjs(date_start_recur)}
                maxDate={dayjs()}
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
          sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}
        >
          <Button
            onClick={getOrders}
            variant="contained"
          >
            Показать
          </Button>
          {canAccess("download_file") && (
            <Tooltip title={<Typography>{"Скачать таблицу в Excel"}</Typography>}>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  disabled={!allBuckets?.length}
                  onClick={() => exportStatsXlsx()}
                >
                  <Download />
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
      >
        {allBuckets?.length > 0 && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <OrdersTable
              title="Всего заказов"
              rows={allBuckets}
            />
          </Grid>
        )}

        {newBuckets?.length > 0 && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <OrdersTable
              title="Новые клиенты"
              rows={newBuckets}
            />
          </Grid>
        )}
      </Grid>
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
