"use client";

import {
  Box,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import usePromoItemsStatStore from "./usePromoItemsStatStore";
import { formatPromoItemsPercent, formatPromoItemsSum } from "./promoItemsStatUtils";
import SmallFont from "@/ui/SmallFont";

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
    key: "repeat_activations",
    label: "2+ активаций",
    helpTitle: "Повторные заказы",
    helpText:
      "Количество клиентов, которые использовали этот промокод 2 или более раз в текущей выборке.",
    value: (item) => item?.repeat_activations ?? 0,
  },
  {
    key: "sum_before_discount",
    label: "До скидки",
    helpTitle: "Сумма без скидки",
    helpText: "Агрегированная сумма заказов до применения скидки по этому промокоду.",
    value: (item) => formatPromoItemsSum(item?.sum_before_discount),
  },
  {
    key: "sum_after_discount",
    label: "После скидки",
    helpTitle: "Сумма со скидкой",
    helpText: "Агрегированная сумма заказов после применения скидки по этому промокоду.",
    value: (item) => formatPromoItemsSum(item?.sum_after_discount),
  },
  {
    key: "discount_label",
    label: "Сумма и % скидки",
    helpTitle: "Сумма и процент скидки",
    helpText: "Разница между суммой без скидки и суммой со скидкой. Формат: 100 ₽ и ниже 1%.",
    render: (item) => {
      const primary =
        item?.discount_label?.split("|")?.[0]?.trim() || formatPromoItemsSum(item?.discount_value);
      const secondary =
        item?.discount_label?.split("|")?.[1]?.trim() ||
        formatPromoItemsPercent(item?.discount_percent);

      return {
        primary,
        secondary,
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
    value: (item) => item?.active_client_activations ?? 0,
  },
  {
    key: "active_client_share",
    label: "% действ.",
    helpTitle: "Доля действующих клиентов",
    helpText:
      "Доля действующих клиентов, использовавших промокод, из всех действующих. Формула: число действующих клиентов, применивших промокод, деленное на всех действующих клиентов в выборке, умножить на 100%.",
    value: (item) => formatPromoItemsPercent(item?.active_client_share),
  },
  {
    key: "new_client_activations",
    label: "Новые клиенты",
    helpTitle: "Активации новыми клиентами",
    helpText:
      "Количество активаций промокода первыми заказами. Новый клиент: клиент с ID клиента больше 0, у которого ID первого заказа совпадает с ID заказа в текущей строке.",
    value: (item) => item?.new_client_activations ?? 0,
  },
  {
    key: "new_client_share",
    label: "% новых",
    helpTitle: "Доля новых клиентов, %",
    helpText:
      "Доля новых клиентов, использовавших промокод. Формула: число новых клиентов, применивших промокод, деленное на всех новых клиентов в выборке, умножить на 100.",
    value: (item) => formatPromoItemsPercent(item?.new_client_share),
  },
  {
    key: "unique_clients_count",
    label: "Уникальные",
    helpTitle: "Уникальные клиенты",
    helpText:
      "Количество уникальных клиентов, которые хотя бы один раз активировали этот промокод.",
    value: (item) => item?.unique_clients_count ?? 0,
  },
  {
    key: "unique_clients_share",
    label: "% уникальных",
    helpTitle: "Доля от всех клиентов",
    helpText:
      "Доля уникальных клиентов, активировавших промокод, от всех уникальных клиентов в выборке. Формула: уникальные клиенты с промокодом, деленные на всех активных клиентов выборки, умножить на 100.",
    value: (item) => formatPromoItemsPercent(item?.unique_clients_share),
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

function PromoItemsStatHeaderCell({ column }) {
  const hasCompoundValue = Boolean(column?.render);

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        component="span"
        variant="inherit"
      >
        {column.label}
      </Typography>
      <Tooltip
        arrow
        placement="top"
        title={
          <Box sx={{ maxWidth: 360 }}>
            <Typography
              component="div"
              variant="subtitle2"
              sx={{ mb: 0.5 }}
            >
              {column.helpTitle}
            </Typography>
            <Typography
              component="div"
              variant="body2"
            >
              {column.helpText}
            </Typography>
            {hasCompoundValue ? (
              <Typography
                component="div"
                variant="caption"
                sx={{ mt: 0.75, display: "block" }}
              >
                Основное значение сверху, вторичное ниже в отдельной метке.
              </Typography>
            ) : null}
          </Box>
        }
      >
        <IconButton
          aria-label={column.helpTitle}
          size="small"
          sx={{ p: 0, color: "text.secondary" }}
        >
          <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function PromoItemsStatCompoundCell({ primary, secondary }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 500, lineHeight: 1.2 }}
      >
        {primary}
      </Typography>
      <Chip
        size="small"
        color="info"
        variant="outlined"
        sx={{ alignSelf: "flex-start", height: 22 }}
        label={<SmallFont size="0.6rem">{secondary}</SmallFont>}
      />
    </Box>
  );
}

export default function PromoItemsStatTable({ type = "promo", onRefresh }) {
  const stats = usePromoItemsStatStore((state) => state.stats);
  const promoTable = usePromoItemsStatStore((state) => state.promoTable);
  const promoTablePagination = usePromoItemsStatStore((state) => state.promoTablePagination);

  if (type === "promo") {
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
              {!promoTable.length ? (
                <TableRow>
                  <TableCell
                    colSpan={promoColumns.length}
                    sx={{ py: 6, textAlign: "center" }}
                  >
                    <Typography color="text.secondary">Нет данных за выбранный период</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                promoTable.map((item, index) => (
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

                      return <TableCell key={column.key}>{column.value(item)}</TableCell>;
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
            {!stats.length ? (
              <TableRow>
                <TableCell
                  colSpan={hasSumColumn ? 3 : 2}
                  sx={{ py: 6, textAlign: "center" }}
                >
                  <Typography color="text.secondary">Нет данных за выбранный период</Typography>
                </TableCell>
              </TableRow>
            ) : (
              stats.map((item, index) => (
                <TableRow
                  key={`${item?.name || "promo"}-${index}`}
                  hover
                >
                  <TableCell>{item?.name || "—"}</TableCell>
                  <TableCell>{item?.count ?? 0}</TableCell>
                  {hasSumColumn ? <TableCell>{formatPromoItemsSum(item?.summ)}</TableCell> : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
