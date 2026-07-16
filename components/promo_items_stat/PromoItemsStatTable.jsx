"use client";

import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
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
      primary:
        item?.sum_before_discount !== undefined && item?.sum_before_discount !== null
          ? formatPromoItemsSum(item?.sum_before_discount)
          : "",
      secondary:
        item?.sum_after_discount !== undefined && item?.sum_after_discount !== null
          ? formatPromoItemsSum(item?.sum_after_discount)
          : "",
      direction: "column",
    }),
  },
  {
    key: "discount_label",
    label: "Сумма и % скидки",
    helpTitle: "Сумма и процент скидки",
    helpText: "Разница между суммой заказов до применения скидки и после применения скидки.",
    chipHelpText: "В метке ниже показан процент скидки.",
    render: (item) => ({
      primary:
        item?.discount_value !== undefined && item?.discount_value !== null
          ? formatPromoItemsSum(item?.discount_value)
          : "",
      secondary:
        item?.discount_percent !== undefined && item?.discount_percent !== null
          ? formatPromoItemsPercent(item?.discount_percent)
          : "",
      direction: "column",
    }),
  },
  {
    key: "avg_check_label",
    label: "Средний чек",
    helpTitle: "Средний чек",
    helpText: "Средний чек до скидки и после скидки",
    render: (item) => ({
      primary:
        item?.avg_check_before_discount !== undefined && item?.avg_check_before_discount !== null
          ? formatPromoItemsSum(item?.avg_check_before_discount)
          : "",
      secondary:
        item?.avg_check_after_discount !== undefined && item?.avg_check_after_discount !== null
          ? formatPromoItemsSum(item?.avg_check_after_discount)
          : "",
    }),
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

export default function PromoItemsStatTable({ type = "promo", onRefresh, onLoadPromoItems }) {
  const stats = usePromoItemsStatStore((state) => state.stats);
  const promoTable = usePromoItemsStatStore((state) => state.promoTable);
  const promoTableTotals = usePromoItemsStatStore((state) => state.promoTableTotals);
  const promoTableGroups = usePromoItemsStatStore((state) => state.promoTableGroups);
  const promoTablePagination = usePromoItemsStatStore((state) => state.promoTablePagination);
  const promoItemDetails = usePromoItemsStatStore((state) => state.promoItemDetails);
  const promoItemDetailsLoading = usePromoItemsStatStore((state) => state.promoItemDetailsLoading);
  const date_start = usePromoItemsStatStore((state) => state.date_start);
  const date_end = usePromoItemsStatStore((state) => state.date_end);
  const [activationDetailsItem, setActivationDetailsItem] = useState(null);
  const [expandedPromoKeys, setExpandedPromoKeys] = useState(new Set());
  const dateRange = `${formatPromoItemsDate(date_start)}-${formatPromoItemsDate(date_end)}`;

  useEffect(() => {
    setExpandedPromoKeys(new Set());
  }, [promoTable]);

  const getPromoKey = (item) => item?.promo_key || String(item?.promo_id || "");

  const togglePromoItems = (item) => {
    const promoKey = getPromoKey(item);

    if (!promoKey) {
      return;
    }

    setExpandedPromoKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);
      const isOpening = !nextKeys.has(promoKey);

      if (isOpening) {
        nextKeys.add(promoKey);
        onLoadPromoItems?.(item);
      } else {
        nextKeys.delete(promoKey);
      }

      return nextKeys;
    });
  };

  const renderPromoTotalsCell = (column, totals, label) => {
    if (column.key === "promo_name") {
      return (
        <TableCell key={column.key}>
          <strong>{label}</strong>
        </TableCell>
      );
    }

    if (column.key === "total_activations") {
      return <TableCell key={column.key}>{totals?.total_activations ?? 0}</TableCell>;
    }

    if (column.key === "sum_amount") {
      return (
        <TableCell key={column.key}>
          <PromoItemsStatCompoundCell
            primary={formatPromoItemsSum(totals?.sum_before_discount)}
            secondary={formatPromoItemsSum(totals?.sum_after_discount)}
            direction="column"
          />
        </TableCell>
      );
    }

    if (column.key === "discount_label") {
      return (
        <TableCell key={column.key}>
          <PromoItemsStatCompoundCell
            primary={formatPromoItemsSum(totals?.discount_value)}
            secondary={formatPromoItemsPercent(totals?.discount_percent)}
            direction="column"
          />
        </TableCell>
      );
    }

    if (column.key === "avg_check_label" || column.key === "usage_places") {
      return <TableCell key={column.key}>—</TableCell>;
    }

    if (column.key === "active_client_activations") {
      return <TableCell key={column.key}>{totals?.active_client_activations ?? 0}</TableCell>;
    }

    if (column.key === "new_client_activations") {
      return <TableCell key={column.key}>{totals?.new_client_activations ?? 0}</TableCell>;
    }

    if (column.key === "unique_clients_count") {
      return <TableCell key={column.key}>{totals?.unique_clients_count ?? 0}</TableCell>;
    }

    return <TableCell key={column.key}>—</TableCell>;
  };

  const renderPromoItemsRow = (item, index) => {
    const promoKey = getPromoKey(item);
    const isExpanded = expandedPromoKeys.has(promoKey);
    const isLoadingItems = Boolean(promoItemDetailsLoading[promoKey]);
    const items = promoItemDetails[promoKey] || [];
    const itemsTotals = items.reduce(
      (totals, promoItem) => ({
        quantity: totals.quantity + Number(promoItem?.quantity || 0),
        sum: totals.sum + Number(promoItem?.sum_before_discount || 0),
        discount: totals.discount + Number(promoItem?.discount_value || 0),
      }),
      { quantity: 0, sum: 0, discount: 0 },
    );

    return (
      <Fragment key={promoKey || `${item?.promo_name || "promo"}-${index}`}>
        <TableRow
          hover
          sx={
            isExpanded
              ? {
                  "& > td": {
                    backgroundColor: "action.selected",
                    borderBottom: 0,
                  },
                }
              : undefined
          }
        >
          {promoColumns.map((column) => {
            if (column.key === "promo_name") {
              return (
                <TableCell key={column.key}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      aria-label={isExpanded ? "Скрыть позиции" : "Показать позиции"}
                      onClick={() => togglePromoItems(item)}
                    >
                      {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                    {column.value(item)}
                  </Box>
                </TableCell>
              );
            }

            if (column.render) {
              return (
                <TableCell key={column.key}>
                  <PromoItemsStatCompoundCell {...column.render(item)} />
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
        <TableRow>
          <TableCell
            colSpan={promoColumns.length}
            sx={{
              p: 0,
              borderBottom: isExpanded ? undefined : 0,
              backgroundColor: "grey.50",
            }}
          >
            <Collapse
              in={isExpanded}
              timeout="auto"
              unmountOnExit
            >
              <Box
                sx={{
                  my: 1,
                  mx: { xs: 1, md: 3 },
                  width: { xs: "calc(100% - 16px)", md: 720 },
                  maxWidth: { xs: "calc(100% - 16px)", md: "calc(100% - 48px)" },
                  border: 1,
                  borderColor: "divider",
                  borderLeft: 3,
                  borderLeftColor: "primary.main",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  backgroundColor: "background.paper",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 0.75,
                    borderBottom: 1,
                    borderColor: "divider",
                    backgroundColor: "grey.50",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Inventory2OutlinedIcon
                      color="action"
                      fontSize="small"
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700 }}
                    >
                      Проданные позиции
                    </Typography>
                  </Box>
                  {!isLoadingItems ? (
                    <Chip
                      size="small"
                      label={`${items.length} поз.`}
                      sx={{ ml: 0.5, height: 22 }}
                    />
                  ) : null}
                </Box>
                {isLoadingItems ? (
                  <Box
                    sx={{
                      minHeight: 96,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : items.length ? (
                  <TableContainer>
                    <Table
                      size="small"
                      sx={{
                        tableLayout: "fixed",
                        "& th": {
                          py: 0.6,
                          px: 1.25,
                          color: "text.secondary",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        },
                        "& td": {
                          py: 0.65,
                          px: 1.25,
                          fontSize: "0.8rem",
                        },
                      }}
                    >
                      <colgroup>
                        <col />
                        <col style={{ width: 90 }} />
                        <col style={{ width: 110 }} />
                        <col style={{ width: 125 }} />
                      </colgroup>
                      <TableHead>
                        <TableRow>
                          <TableCell>Позиция</TableCell>
                          <TableCell align="right">Количество</TableCell>
                          <TableCell align="right">Сумма</TableCell>
                          <TableCell align="right">Сумма скидки</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((promoItem, itemIndex) => (
                          <TableRow
                            key={promoItem.item_id}
                            hover
                            sx={{
                              backgroundColor: itemIndex % 2 === 0 ? "background.paper" : "grey.50",
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{promoItem.item_name}</TableCell>
                            <TableCell align="right">
                              {new Intl.NumberFormat("ru-RU").format(promoItem.quantity || 0)}
                            </TableCell>
                            <TableCell align="right">
                              {formatPromoItemsSum(promoItem.sum_before_discount)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color:
                                  promoItem.discount_value > 0 ? "error.main" : "text.secondary",
                              }}
                            >
                              {formatPromoItemsSum(promoItem.discount_value)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow
                          sx={{
                            "& td": {
                              borderTop: 2,
                              borderColor: "divider",
                              backgroundColor: "grey.100",
                              fontWeight: 700,
                            },
                          }}
                        >
                          <TableCell>Итого по позициям</TableCell>
                          <TableCell align="right">
                            {new Intl.NumberFormat("ru-RU").format(itemsTotals.quantity)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPromoItemsSum(itemsTotals.sum)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPromoItemsSum(itemsTotals.discount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">Нет проданных позиций</Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  };

  if (type === "promo") {
    if (!promoTable.length) {
      return <PromoItemsStatEmptyState />;
    }

    const rowsByGroup = promoTable.reduce((groups, item) => {
      const groupKey = item?.promo_group_key || "other";
      groups[groupKey] = [...(groups[groupKey] || []), item];
      return groups;
    }, {});
    const groupMetaByKey = promoTableGroups.reduce((groups, group) => {
      groups[group.key] = group;
      return groups;
    }, {});
    const visibleGroupKeys = [
      ...promoTableGroups.map((group) => group.key).filter((key) => rowsByGroup[key]),
      ...Object.keys(rowsByGroup).filter((key) => !groupMetaByKey[key]),
    ];
    const visibleGroups = visibleGroupKeys.map((groupKey) => {
      const group = groupMetaByKey[groupKey];
      const rows = rowsByGroup[groupKey];

      return {
        key: groupKey,
        label: group?.label || rows[0]?.promo_group_label || "Прочие",
        rows,
        totals: group?.totals,
      };
    });

    return (
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: { xs: "none", md: "46dvh" } }}>
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
              {visibleGroups.map((group) => (
                <Fragment key={group.key}>
                  <TableRow>
                    <TableCell
                      colSpan={promoColumns.length}
                      sx={{ backgroundColor: "action.hover", fontWeight: 700 }}
                    >
                      {group.label}
                    </TableCell>
                  </TableRow>
                  {group.rows.map(renderPromoItemsRow)}
                  <TableRow>
                    {promoColumns.map((column) =>
                      renderPromoTotalsCell(column, group.totals, "Итого по группе"),
                    )}
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
            <TableFooter
              sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 2,
                "& td": {
                  backgroundColor: "background.paper",
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              <TableRow hover={false}>
                {promoColumns.map((column) =>
                  renderPromoTotalsCell(column, promoTableTotals, "Итого"),
                )}
              </TableRow>
            </TableFooter>
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
