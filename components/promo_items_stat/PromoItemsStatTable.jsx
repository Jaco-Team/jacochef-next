"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import usePromoItemsStatStore from "./usePromoItemsStatStore";
import { formatPromoItemsPercent, formatPromoItemsSum } from "./promoItemsStatUtils";
import PromoItemsStatEmptyState from "./PromoItemsStatEmptyState";
import PromoItemsStatHeaderCell from "./PromoItemsStatHeaderCell";
import PromoItemsStatCompoundCell from "./PromoItemsStatCompoundCell";
import PromoItemsStatActivationsModal from "./PromoItemsStatActivationsModal";

const promoColumns = [
  {
    key: "promo_name",
    label: "Промокод",
    helpTitle: "Название промокода",
    helpText: "Название промокода в текущей выборке.",
    value: (item) => item?.promo_name || "—",
  },
  {
    key: "total_activations",
    label: "Активации",
    helpTitle: "Всего активаций",
    helpText:
      "Общее количество заказов с этим промокодом в выбранном периоде, по выбранным точкам и фильтрам.",
    value: (item) => item?.total_activations ?? 0,
  },
  {
    key: "sum_amount",
    label: "Сумма",
    helpTitle: "Сумма заказа",
    helpText: "Сумма заказов до применения скидки.",
    chipHelpText: "В метке ниже показана сумма заказов после применения скидки.",
    render: (item) => ({
      primary: formatPromoItemsSum(item?.sum_before_discount),
      secondary: formatPromoItemsSum(item?.sum_after_discount),
      direction: "column",
    }),
  },
  {
    key: "discount_label",
    label: "Сумма и % скидки",
    helpTitle: "Сумма и процент скидки",
    helpText: "Разница между суммой заказов до применения скидки и после применения скидки.",
    chipHelpText: "В метке ниже показан процент скидки.",
    render: (item) => {
      const labelParts =
        typeof item?.discount_label === "string" ? item.discount_label.split("|") : [];

      return {
        primary: labelParts[0]?.trim() || formatPromoItemsSum(item?.discount_value),
        secondary: labelParts[1]?.trim() || formatPromoItemsPercent(item?.discount_percent),
        direction: "column",
      };
    },
  },
  {
    key: "avg_check_label",
    label: "Средний чек",
    helpTitle: "Средний чек",
    helpText: "Средний чек до скидки и после скидки",
    render: (item) => {
      const primary =
        item?.avg_check_label?.split("|")?.[0]?.trim() ||
        formatPromoItemsSum(item?.avg_check_before_discount);
      const secondary =
        item?.avg_check_label?.split("|")?.[1]?.trim() ||
        formatPromoItemsSum(item?.avg_check_after_discount);

      return {
        primary,
        secondary,
      };
    },
  },
  {
    key: "active_client_activations",
    label: "Действующие клиенты",
    helpTitle: "Активации промокода действующими клиентами",
    helpText: "Количество активаций промокода действующими клиентами.",
    chipHelpText:
      "В метке показана доля действующих клиентов, использовавших промокод, из всех действующих клиентов в выборке.",
    render: (item) => ({
      primary: item?.active_client_activations ?? 0,
      secondary: formatPromoItemsPercent(item?.active_client_share),
      direction: "row",
    }),
  },
  {
    key: "new_client_activations",
    label: "Новые клиенты",
    helpTitle: "Активации новыми клиентами",
    helpText: "Количество активаций промокода первыми заказами.",
    chipHelpText:
      "В метке показана доля новых клиентов, использовавших промокод, из всех новых клиентов в выборке.",
    render: (item) => ({
      primary: item?.new_client_activations ?? 0,
      secondary: formatPromoItemsPercent(item?.new_client_share),
      direction: "row",
    }),
  },
  {
    key: "unique_clients_count",
    label: "Уникальные",
    helpTitle: "Уникальные клиенты",
    helpText:
      "Количество уникальных клиентов, которые хотя бы один раз активировали этот промокод.",
    chipHelpText:
      "В метке показана доля уникальных клиентов с промокодом от всех активных клиентов выборки.",
    render: (item) => ({
      primary: item?.unique_clients_count ?? 0,
      secondary: formatPromoItemsPercent(item?.unique_clients_share),
      direction: "row",
    }),
  },
  {
    key: "usage_places",
    label: "Источники",
    helpTitle: "По какому каналу использовался промокод",
    helpText:
      "Список каналов, где промокод использовался в заказах. Возможные значения: Кафе, Сайт, КЦ. Если промокод использовался в нескольких каналах, они показываются вместе, например: Кафе + Сайт + КЦ.",
    value: (item) =>
      Array.isArray(item?.usage_places) && item.usage_places.length
        ? item.usage_places.join(" + ")
        : "—",
  },
];

function formatPromoItemsDate(value) {
  const date = dayjs(value);

  return date.isValid() ? date.format("DD.MM.YYYY") : "—";
}

export default function PromoItemsStatTable({ type = "promo", onRefresh }) {
  const stats = usePromoItemsStatStore((state) => state.stats);
  const promoTable = usePromoItemsStatStore((state) => state.promoTable);
  const promoTablePagination = usePromoItemsStatStore((state) => state.promoTablePagination);
  const date_start = usePromoItemsStatStore((state) => state.date_start);
  const date_end = usePromoItemsStatStore((state) => state.date_end);
  const [activationDetailsItem, setActivationDetailsItem] = useState(null);
  const dateRange = `${formatPromoItemsDate(date_start)}-${formatPromoItemsDate(date_end)}`;

  if (type === "promo") {
    if (!promoTable.length) {
      return <PromoItemsStatEmptyState />;
    }

    return (
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: { xs: "none", md: "55dvh" } }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {promoColumns.map((column) => (
                  <TableCell key={column.key}>
                    <PromoItemsStatHeaderCell column={column} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {promoTable.map((item, index) => (
                <TableRow
                  key={`${item?.promo_id || item?.promo_name || "promo"}-${index}`}
                  hover
                >
                  {promoColumns.map((column) => {
                    if (column.render) {
                      const compoundValue = column.render(item);

                      return (
                        <TableCell key={column.key}>
                          <PromoItemsStatCompoundCell {...compoundValue} />
                        </TableCell>
                      );
                    }

                    if (column.key === "total_activations") {
                      return (
                        <TableCell key={column.key}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setActivationDetailsItem(item)}
                            sx={{ minWidth: 0, p: 0, fontWeight: 600 }}
                          >
                            {column.value(item)}
                          </Button>
                        </TableCell>
                      );
                    }

                    return <TableCell key={column.key}>{column.value(item)}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <PromoItemsStatActivationsModal
          item={activationDetailsItem}
          dateRange={dateRange}
          onClose={() => setActivationDetailsItem(null)}
        />
        <TablePagination
          component="div"
          rowsPerPageOptions={[50, 100, 500]}
          labelRowsPerPage="Записей на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          page={promoTablePagination.page}
          rowsPerPage={promoTablePagination.perpage}
          count={promoTablePagination.total ?? 0}
          onPageChange={(_, page) => onRefresh?.({ page })}
          onRowsPerPageChange={(event) => {
            onRefresh?.({ page: 0, perpage: Number(event.target.value) });
          }}
        />
      </Paper>
    );
  }

  const hasSumColumn = stats.some((item) => item?.summ !== undefined);

  if (!stats.length) {
    return <PromoItemsStatEmptyState />;
  }

  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: { xs: "none", md: "65dvh" } }}>
        <Table
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Клиентов</TableCell>
              {hasSumColumn ? <TableCell>Сумма</TableCell> : null}
            </TableRow>
          </TableHead>

          <TableBody>
            {stats.map((item, index) => (
              <TableRow
                key={`${item?.name || "promo"}-${index}`}
                hover
              >
                <TableCell>{item?.name || "—"}</TableCell>
                <TableCell>{item?.count ?? 0}</TableCell>
                {hasSumColumn ? <TableCell>{formatPromoItemsSum(item?.summ)}</TableCell> : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
