"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";

import { formatNumber, formatRUR } from "@/src/helpers/utils/i18n";

const TABLE_COLUMNS_STORAGE_KEY = "orders_extended:columns:v1";

const TABLE_COLUMNS = [
  { field: "source", label: "Источник трафика", minWidth: 170, defaultVisible: true },
  { field: "type_user", label: "Оформил", minWidth: 130, defaultVisible: true },
  { field: "address", label: "Адрес доставки", minWidth: 240, defaultVisible: true },
  { field: "type_order", label: "Тип", minWidth: 130, defaultVisible: true },
  { field: "client_status", label: "Тип клиента", minWidth: 150, defaultVisible: true },
  { field: "has_error", label: "Ошибка", minWidth: 110, defaultVisible: true },
  {
    field: "delivery_status",
    label: "Срок доставки",
    minWidth: 170,
    defaultVisible: true,
  },
  { field: "order_price", label: "Сумма", minWidth: 130, defaultVisible: true },
  { field: "avg_check", label: "Средний чек", minWidth: 150, defaultVisible: true },
  { field: "promo_name", label: "Промокод", minWidth: 140, defaultVisible: true },
  { field: "type_pay", label: "Оплата", minWidth: 120, defaultVisible: true },
  { field: "status", label: "Статус", minWidth: 150, defaultVisible: false },
  { field: "driver", label: "Водитель", minWidth: 180, defaultVisible: false },
];

const DEFAULT_VISIBLE_COLUMN_KEYS = TABLE_COLUMNS.filter((column) => column.defaultVisible).map(
  (column) => column.field,
);

const CLIENT_STATUS_LABELS = {
  new: "Новый",
  current: "Действующий",
};

const DELIVERY_STATUS_LABELS = {
  on_time: "Успели",
  late: "Не успели",
};

const isEmptyValue = (value) => value === null || value === undefined || value === "";

const formatText = (value) => (isEmptyValue(value) ? "—" : value);

const formatCurrency = (value) => (isEmptyValue(value) ? "—" : formatRUR(value, false));

const formatBoolean = (value) => {
  if (isEmptyValue(value)) return "—";
  return value === true || value === 1 || value === "1" ? "Да" : "Нет";
};

const formatCellValue = (item, field) => {
  if (field === "order_price" || field === "avg_check") {
    return formatCurrency(item[field]);
  }

  if (field === "client_status") {
    return CLIENT_STATUS_LABELS[item[field]] ?? "—";
  }

  if (field === "has_error") {
    return formatBoolean(item[field]);
  }

  if (field === "delivery_status") {
    return DELIVERY_STATUS_LABELS[item[field]] ?? "—";
  }

  return formatText(item[field]);
};

export default function OrdersExtendedTable({
  rows,
  totals,
  total,
  page,
  perPage,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnsHydrated, setColumnsHydrated] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(DEFAULT_VISIBLE_COLUMN_KEYS);

  useEffect(() => {
    try {
      const savedColumns = JSON.parse(window.localStorage.getItem(TABLE_COLUMNS_STORAGE_KEY));

      if (Array.isArray(savedColumns)) {
        const availableKeys = new Set(TABLE_COLUMNS.map((column) => column.field));
        setVisibleColumnKeys(savedColumns.filter((field) => availableKeys.has(field)));
      }
    } catch (_) {}

    setColumnsHydrated(true);
  }, []);

  useEffect(() => {
    if (!columnsHydrated) return;
    try {
      window.localStorage.setItem(TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumnKeys));
    } catch (_) {}
  }, [columnsHydrated, visibleColumnKeys]);

  const visibleColumns = useMemo(
    () => TABLE_COLUMNS.filter((column) => visibleColumnKeys.includes(column.field)),
    [visibleColumnKeys],
  );

  const minTableWidth = useMemo(
    () => 72 + visibleColumns.reduce((width, column) => width + column.minWidth, 0),
    [visibleColumns],
  );

  const toggleColumn = (field) => {
    setVisibleColumnKeys((currentColumns) =>
      currentColumns.includes(field)
        ? currentColumns.filter((columnField) => columnField !== field)
        : [...currentColumns, field],
    );
  };

  if (!rows.length) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{ mb: 1 }}
      >
        <Tooltip title="Настройка вида таблицы">
          <IconButton
            type="button"
            color="primary"
            onClick={() => setSettingsOpen(true)}
            aria-label="Настроить колонки таблицы"
          >
            <Settings />
          </IconButton>
        </Tooltip>
      </Stack>

      <TableContainer sx={{ maxHeight: { xs: "65vh", md: "70vh" }, overflow: "auto" }}>
        <Table
          stickyHeader
          sx={{ minWidth: minTableWidth }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 72 }}>#</TableCell>
              {visibleColumns.map(({ field, label, minWidth }) => (
                <TableCell
                  key={field}
                  sortDirection={sortBy === field ? sortDir : false}
                  sx={{ minWidth, whiteSpace: "nowrap" }}
                >
                  <TableSortLabel
                    active={sortBy === field}
                    direction={sortBy === field ? sortDir : "asc"}
                    onClick={() => onSort(field)}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item, index) => (
              <TableRow
                key={`${item.point_id ?? "point"}-${item.id ?? index}`}
                hover
                onClick={() => onRowClick(item)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{page * perPage + index + 1}</TableCell>
                {visibleColumns.map(({ field }) => (
                  <TableCell key={field}>{formatCellValue(item, field)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <strong>Итого: {formatNumber(totals.count, 0, 0)}</strong>
              </TableCell>
              {visibleColumns.map(({ field }) => (
                <TableCell key={field}>
                  {field === "order_price" ? (
                    <strong>{formatCurrency(totals.order_price_sum)}</strong>
                  ) : null}
                  {field === "avg_check" ? (
                    <strong>{formatCurrency(totals.avg_check_avg)}</strong>
                  ) : null}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100, 300]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        labelRowsPerPage="Записей на странице:"
        component="div"
        count={total}
        rowsPerPage={perPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Настройка вида таблицы</DialogTitle>
        <DialogContent dividers>
          <Stack>
            <FormControlLabel
              disabled
              control={<Checkbox checked />}
              label="Номер строки"
            />
            {TABLE_COLUMNS.map(({ field, label }) => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={visibleColumnKeys.includes(field)}
                    onChange={() => toggleColumn(field)}
                  />
                }
                label={label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisibleColumnKeys(DEFAULT_VISIBLE_COLUMN_KEYS)}>
            Сбросить
          </Button>
          <Button
            variant="contained"
            onClick={() => setSettingsOpen(false)}
          >
            Готово
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
