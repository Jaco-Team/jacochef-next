"use client";

import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useMarketingTabStore from "./useMarketingTabStore";
import { useDebounce } from "@/src/hooks/useDebounce";
import dayjs from "dayjs";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ExcelIcon from "@/ui/ExcelIcon";
import { useSiteClientsStore } from "../useSiteClientsStore";
import { formatRUR } from "@/src/helpers/utils/i18n";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { COL_WIDTHS, StatsRow, utmStatsColumns } from "./StatsRow";
import ShowOrdersButton from "./ShowOrdersButton";

function InnerTabUtm({ getData, showAlert, canExport }) {
  const { date_start_marketing, date_end_marketing } = useSiteClientsStore();
  const { setPage, refreshToken } = useMarketingTabStore();

  const [utmTree, setUtmTree] = useState(null);
  const [utmStats, setUtmStats] = useState(null);

  const exportXLSX = useXLSExport();

  // stats sorting state
  const [sort, setSort] = useState({ key: "orders", dir: "desc" });
  const handleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  }, []);

  const sortedTree = useMemo(() => {
    if (!utmTree) return [];

    let nodes = Object.values(utmTree);

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
  }, [sort, utmTree]);

  const getUtmStats = async () => {
    const { points_marketing, date_start_marketing, date_end_marketing } =
      useSiteClientsStore.getState();
    if (!points_marketing.length || !date_start_marketing || !date_end_marketing) {
      return;
    }
    try {
      const resData = await getData("get_marketing_source_orders", {
        points: points_marketing,
        date_start: dayjs(date_start_marketing).format("YYYY-MM-DD"),
        date_end: dayjs(date_end_marketing).format("YYYY-MM-DD"),
      });

      if (!resData?.st) {
        showAlert(resData?.text || "За период нет статистики utm", false);
        return;
      }
      setPage(1);
      setUtmTree(resData.tree);
      setUtmStats(resData.stat);
    } catch (e) {
      showAlert(`Ошибка при загрузке статистики utm: ${e.message}`, false);
    }
  };

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

  // expanding rows
  const [expanded, setExpanded] = useState({});
  const toggle = (path) => {
    setExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // update on form change
  const debouncedGetOrdersStats = useDebounce(getUtmStats, 500);
  useEffect(() => {
    debouncedGetOrdersStats();
  }, [refreshToken]);

  return sortedTree ? (
    <>
      {canExport && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            style={{ cursor: "pointer", padding: 10 }}
            onClick={() =>
              exportXLSX(
                utmStats.sources,
                utmStatsColumns,
                "utm-stats.xlsx",
                `Источники заказов с ${formatYMD(date_start_marketing)} по ${formatYMD(date_end_marketing)}`,
              )
            }
            title="Экспортировать в Excel"
          >
            <ExcelIcon />
          </IconButton>
        </Box>
      )}
      <TableContainer
      // sx={{
      //   maxHeight: "70dvh",
      // }}
      >
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
            {sortedTree.map((node) => (
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
        {utmStats && (
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
                      orders={utmStats.new?.order_ids}
                      modalTitle={`Новые клиенты`}
                    />
                  </TableCell>
                  <TableCell sx={{ width: COL_WIDTHS.sum }}>
                    {formatRUR(utmStats.new?.sum)}
                  </TableCell>
                  <TableCell sx={{ width: COL_WIDTHS.avg }}>
                    {formatRUR(utmStats.new?.avg)}
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
                      orders={utmStats?.existing?.order_ids}
                      modalTitle={`Постоянные клиенты`}
                    />
                  </TableCell>
                  <TableCell sx={{ width: COL_WIDTHS.sum }}>
                    {formatRUR(utmStats.existing?.sum)}
                  </TableCell>
                  <TableCell sx={{ width: COL_WIDTHS.avg }}>
                    {formatRUR(utmStats.existing?.avg)}
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
        )}
      </TableContainer>
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
}

export default memo(InnerTabUtm);
