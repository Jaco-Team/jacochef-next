"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";

import { formatNumber, formatRUR } from "@/src/helpers/utils/i18n";

const TABLE_COLUMNS = [
  ["source", "Источник трафика"],
  ["type_user", "Оформил"],
  ["address", "Адрес доставки"],
  ["type_order", "Тип"],
  ["status", "Статус"],
  ["order_price", "Сумма"],
  ["avg_check", "Средний чек"],
  ["promo_name", "Промокод"],
  ["type_pay", "Оплата"],
  ["driver", "Курьер"],
];

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
  if (!rows.length) {
    return null;
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {TABLE_COLUMNS.map(([field, label]) => (
                <TableCell
                  key={field}
                  sortDirection={sortBy === field ? sortDir : false}
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
                key={`${item.source ?? "source"}-${item.driver ?? "driver"}-${index}`}
                hover
                onClick={() => onRowClick(item)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{page * perPage + index + 1}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>{item.type_user}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell>{item.type_order}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{formatRUR(item.order_price, false)}</TableCell>
                <TableCell>{formatRUR(item.avg_check, false)}</TableCell>
                <TableCell>{item.promo_name}</TableCell>
                <TableCell>{item.type_pay}</TableCell>
                <TableCell>{item.driver}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <strong>Итого: {formatNumber(totals.count, 0, 0)}</strong>
              </TableCell>
              <TableCell colSpan={5} />
              <TableCell>
                <strong>{formatRUR(totals.order_price_sum, false)}</strong>
              </TableCell>
              <TableCell>
                <strong>{formatRUR(totals.avg_check_avg, false)}</strong>
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 50, 100]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        labelRowsPerPage="Записей на странице:"
        component="div"
        count={total}
        rowsPerPage={perPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}
