"use client";
import useXLSExport from "@/src/hooks/useXLSXExport";
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { COL_WIDTHS, StatsRow } from "./StatsRow";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { formatRUR } from "@/src/helpers/utils/i18n";
import useMarketingTabStore from "./useMarketingTabStore";
import { checkDates, formatYMD } from "@/src/helpers/ui/formatDate";
import dayjs from "dayjs";
import ExcelIcon from "@/ui/ExcelIcon";
import ShowOrdersButton from "./ShowOrdersButton";
import { MyTextInput } from "@/ui/Forms";

function SiteClientsMarketingOrdersTree({ canExport, getData, showAlert }) {
  const [utmTree, setUtmTree] = useState(null);
  const [newStat, setNewStat] = useState(null);

  const { refreshToken, date_start_marketing, date_end_marketing, slices } = useMarketingTabStore();
  const exportXLSX = useXLSExport();

  // sorting & filtering
  const [sort, setSort] = useState({ key: "orders", dir: "desc" });
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const handleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  }, []);

  const sortedEntries = useMemo(() => {
    if (!utmTree) return [];

    const q = deferredSearch.trim().toLowerCase();

    let entries = Object.values(utmTree);

    if (q.length >= 2) {
      entries = entries.filter((node) =>
        String(node?._key ?? "")
          .toLowerCase()
          .includes(q),
      );
    }

    return entries.sort((a, b) => {
      const av = a?._stats?.[sort.key] ?? 0;
      const bv = b?._stats?.[sort.key] ?? 0;
      return sort.dir === "asc" ? av - bv : bv - av;
    });
  }, [utmTree, sort, deferredSearch]);

  // expanding rows
  const [expanded, setExpanded] = useState({});
  const toggle = useCallback((path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  }, []);

  const getOrdersTree = async () => {
    const { points_marketing, date_start_marketing, date_end_marketing, update } =
      useSiteClientsStore.getState();
    const { orderIds, filters, slices } = useMarketingTabStore.getState();
    try {
      if (!points_marketing.length || !date_start_marketing || !date_end_marketing) {
        return;
      }
      if (!checkDates(date_start_marketing, date_end_marketing)) {
        showAlert("Дата начала должна быть перед датой окончания", false);
        return;
      }
      update({ is_load: true });
      const resData = await getData("get_marketing_orders_tree", {
        points: points_marketing,
        date_start: dayjs(date_start_marketing).format("YYYY-MM-DD"),
        date_end: dayjs(date_end_marketing).format("YYYY-MM-DD"),
        ids: orderIds,
        filters,
        slices,
      });

      if (!resData?.st) {
        showAlert(resData?.text || "За период нет заказов", false);
        return;
      }

      setUtmTree(resData?.tree || null);
      setNewStat(resData?.stat || null);
    } catch (e) {
      showAlert(`Ошибка при загрузке заказов: ${e.message}`, false);
    } finally {
      update({ is_load: false });
    }
  };

  const exportColumns = useMemo(() => {
    const { origin, promo_nopromo } = slices;
    const basicColumns = [
      { label: "Тип клиента", key: "client_type" },
      { label: "Количество заказов", key: "orders" },
      { label: "Сумма заказов", key: "sum" },
      { label: "Средний чек", key: "avg" },
    ];
    switch (origin) {
      case "cafe":
        return [{ label: "Кафе", key: "cafe_name" }, ...basicColumns];
      case "cc":
        return [
          { label: "Номер телефона", key: "number" },
          { label: "Кафе", key: "cafe_name" },
          ...basicColumns,
        ];
      case "site":
        return [
          { label: "utm_medium", key: "utm_medium" },
          { label: "utm_source", key: "utm_source" },
          { label: "utm_campaign", key: "utm_campaign" },
          { label: "utm_term", key: "utm_term" },
          { label: "utm_content", key: "utm_content" },
          ...basicColumns,
        ];
    }
    if (promo_nopromo === "promo") {
      return [
        { label: "Промик", key: "promo" },
        { label: "Источник", key: "source" },
        { label: "Кафе", key: "cafe_name" },
        ...basicColumns,
      ];
    }
    return basicColumns;
  }, [slices]);

  const totalStats = useMemo(() => {
    if (!utmTree) {
      return { orders: 0, sum: 0, avg: 0 };
    }

    const acc = Object.values(utmTree).reduce(
      (res, node) => {
        res.orders += node?._stats?.orders || 0;
        res.sum += node?._stats?.sum || 0;
        return res;
      },
      { orders: 0, sum: 0 },
    );

    acc.avg = acc.orders ? acc.sum / acc.orders : 0;
    return acc;
  }, [utmTree]);

  useEffect(() => {
    getOrdersTree();
  }, [refreshToken]);

  if (!utmTree) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        mb={2}
      >
        <Box sx={{ mb: 1 }}>
          <MyTextInput
            type="search"
            value={search}
            func={(e) => setSearch(e.target.value)}
            placeholder="Поиск…"
            sx={{ width: 300 }}
          />
        </Box>
        {canExport && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              style={{ cursor: "pointer", padding: 10 }}
              onClick={() =>
                exportXLSX(
                  newStat.sources,
                  exportColumns,
                  "orders-stats.xlsx",
                  `Источники заказов с ${formatYMD(date_start_marketing)} по ${formatYMD(date_end_marketing)}`,
                )
              }
              title="Экспортировать в Excel"
            >
              <ExcelIcon />
            </IconButton>
          </Box>
        )}
      </Stack>
      <TableContainer sx={{ maxHeight: "60dvh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: COL_WIDTHS.label }}>Источник</TableCell>
              <TableCell sx={{ width: COL_WIDTHS.orders }}>
                <TableSortLabel
                  active={sort.key === "orders"}
                  direction={sort.key === "orders" ? sort.dir : "asc"}
                  onClick={() => handleSort("orders")}
                >
                  Заказов
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: COL_WIDTHS.sum }}>
                {" "}
                <TableSortLabel
                  active={sort.key === "sum"}
                  direction={sort.key === "sum" ? sort.dir : "asc"}
                  onClick={() => handleSort("sum")}
                >
                  Сумма
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: COL_WIDTHS.avg }}>
                <TableSortLabel
                  active={sort.key === "avg"}
                  direction={sort.key === "avg" ? sort.dir : "asc"}
                  onClick={() => handleSort("avg")}
                >
                  Средний чек
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEntries.map((node) => (
              <StatsRow
                key={node._key}
                label={node._key}
                node={node}
                depth={0}
                path={node._key}
                expanded={expanded}
                toggle={toggle}
              />
            ))}
            {newStat && (
              <>
                <TableRow
                  sx={{
                    borderTop: "2px solid",
                    borderColor: "divider",
                    fontWeight: "bold",
                  }}
                >
                  <TableCell sx={{ fontWeight: "bold" }}>Новые клиенты:</TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={newStat.new?.order_ids}
                      modalTitle={`Новые клиенты`}
                    />
                  </TableCell>
                  <TableCell>{formatRUR(newStat.new?.sum)}</TableCell>
                  <TableCell>{formatRUR(newStat.new?.avg)}</TableCell>
                </TableRow>
                <TableRow
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  <TableCell sx={{ fontWeight: "bold" }}>Постоянные клиенты:</TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={newStat.existing?.order_ids}
                      modalTitle={`Постоянные клиенты`}
                    />
                  </TableCell>
                  <TableCell>{formatRUR(newStat.existing?.sum)}</TableCell>
                  <TableCell>{formatRUR(newStat.existing?.avg)}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
          <TableFooter>
            <TableRow
              sx={{
                backgroundColor: "background.paper",
                borderTop: "2px solid",
                borderColor: "divider",
                fontWeight: "bold",
              }}
            >
              <TableCell sx={{ textAlign: "right" }}>Всего:</TableCell>
              <TableCell>{totalStats.orders}</TableCell>
              <TableCell>{formatRUR(totalStats.sum)}</TableCell>
              <TableCell>{formatRUR(totalStats.avg)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
}

export default memo(SiteClientsMarketingOrdersTree);
