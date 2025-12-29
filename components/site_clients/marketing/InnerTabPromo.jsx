"use client";

import { useDebounce } from "@/src/hooks/useDebounce";
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import useMarketingTabStore from "./useMarketingTabStore";
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
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import ShowOrdersButton from "./ShowOrdersButton";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ExcelIcon from "@/ui/ExcelIcon";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { COL_WIDTHS, StatsRow } from "./StatsRow";
import { formatRUR } from "@/src/helpers/utils/i18n";
import { MyTextInput } from "@/ui/Forms";

const InnerTabPromo = ({ getData, showAlert, canExport }) => {
  const { resetFilters, setOrders, refreshToken } = useMarketingTabStore();

  const [promoStats, setPromoStats] = useState(null);
  const [promoTree, setPromoTree] = useState(null);

  // export
  const exportXLSX = useXLSExport();

  // search & filter
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sort, setSort] = useState({ key: "orders", dir: "desc" });
  const handleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  }, []);

  const filteredSortedTree = useMemo(() => {
    if (!promoTree) return [];

    const q = deferredSearch.trim().toLowerCase();

    let nodes = Object.values(promoTree);

    if (q.length >= 2) {
      nodes = nodes.filter((node) => String(node._key).toLowerCase().includes(q));
    }

    nodes.sort((a, b) => {
      const av =
        sort.key === "avg"
          ? a._stats.orders
            ? a._stats.sum / a._stats.orders
            : 0
          : (a._stats?.[sort.key] ?? 0);

      const bv =
        sort.key === "avg"
          ? b._stats.orders
            ? b._stats.sum / b._stats.orders
            : 0
          : (b._stats?.[sort.key] ?? 0);

      return sort.dir === "asc" ? av - bv : bv - av;
    });

    return nodes;
  }, [promoTree, deferredSearch, sort]);

  const getPromoStats = async () => {
    const { points_marketing, date_start_marketing, date_end_marketing } =
      useSiteClientsStore.getState();
    if (!points_marketing.length || !date_start_marketing || !date_end_marketing) {
      showAlert("Пожалуйста, выберите кафе и даты", false);
      return;
    }
    const resData = await getData("get_marketing_promo_stats", {
      points: points_marketing,
      date_start: dayjs(date_start_marketing).format("YYYY-MM-DD"),
      date_end: dayjs(date_end_marketing).format("YYYY-MM-DD"),
    });

    if (!resData?.st) {
      showAlert(resData?.text || "За период нет статистики", false);
      return;
    }
    setOrders(null);
    resetFilters();
    setPromoStats(resData.promo_stats);
    setPromoTree(resData.promo_tree);
  };

  const totalStats = useMemo(() => {
    if (!promoTree) {
      return { orders: 0, sum: 0, avg: 0 };
    }
    const acc = Object.values(promoTree).reduce(
      (res, node) => {
        res.orders += node?._stats?.orders || 0;
        res.sum += node?._stats?.sum || 0;
        return res;
      },
      { orders: 0, sum: 0 },
    );

    acc.avg = acc.orders ? acc.sum / acc.orders : 0;
    return acc;
  }, [promoTree]);

  const [expanded, setExpanded] = useState({});
  const toggle = useCallback((path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  }, []);

  useEffect(() => {
    getPromoStats();
  }, [refreshToken]);

  return promoTree ? (
    <>
      <Stack
        direction="row"
        spacing={2}
        justifyContent={"space-between"}
      >
        <MyTextInput
          type="search"
          size="small"
          value={search}
          func={(e) => setSearch(e.target.value)}
          placeholder="Найти промик…"
          sx={{ width: 300 }}
        />
        {canExport && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              style={{ cursor: "pointer", padding: 10 }}
              onClick={() => exportXLSX(promoStats?.sources, promoStatsColumns, "promo-stats.xlsx")}
              title="Экспортировать в Excel"
            >
              <ExcelIcon />
            </IconButton>
          </Box>
        )}
      </Stack>

      <TableContainer
        sx={{
          maxHeight: "55dvh",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: COL_WIDTHS.label }}>Промокод</TableCell>
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
            {filteredSortedTree?.map((node) => (
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
          </TableBody>
        </Table>

        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            zIndex: 3,
          }}
        >
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: COL_WIDTHS.label }}>
                  Новые клиенты:
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.orders }}>
                  <ShowOrdersButton
                    orders={promoStats.new?.order_ids}
                    modalTitle={`Новые клиенты`}
                  />
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.sum }}>
                  {formatRUR(promoStats.new?.sum)}
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.avg }}>
                  {formatRUR(promoStats.new?.avg)}
                </TableCell>
              </TableRow>
              <TableRow
                sx={{
                  fontWeight: "bold",
                }}
              >
                <TableCell sx={{ fontWeight: "bold", width: COL_WIDTHS.label }}>
                  Постоянные клиенты:
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.orders }}>
                  <ShowOrdersButton
                    orders={promoStats.existing?.order_ids}
                    modalTitle={`Постоянные клиенты`}
                  />
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.sum }}>
                  {formatRUR(promoStats.existing?.sum)}
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.avg }}>
                  {formatRUR(promoStats.existing?.avg)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ textAlign: "right" }}>Всего:</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ pl: 2 }}
                  >
                    {totalStats.orders}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: COL_WIDTHS.sum }}>{formatRUR(totalStats.sum)}</TableCell>
                <TableCell sx={{ width: COL_WIDTHS.avg }}>{formatRUR(totalStats.avg)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
      {/* <TablePagination
        rowsPerPageOptions={[10, 50, 100, 300]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        labelRowsPerPage="Строк на странице:"
        component="div"
        count={promoStats?.length ?? 0}
        rowsPerPage={perPage}
        page={page - 1}
        onPageChange={(_, newPage) => {
          setPage(newPage + 1);
        }}
        onRowsPerPageChange={(event) => {
          const newPerPage = parseInt(event.target.value, 10);
          setPerPage(newPerPage);
          setPage(1);
        }}
      /> */}
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
};
export default memo(InnerTabPromo);

const promoStatsColumns = [
  { label: "Промокод", key: "promo_name" },
  { label: "Заказов", key: "orders" },
  { label: "Новые", key: "new" },
  { label: "Повторные", key: "old" },
  { label: "Кафе", key: "cafe" },
  { label: "КЦ", key: "cc" },
  { label: "Сайт", key: "site" },
];
