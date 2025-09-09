"use client";

import { memo, useEffect, useState } from "react";
import useMarketingTabStore from "./useMarketingTabStore";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import vocabulary from "./vocabulary";
import { useDebounce } from "@/src/hooks/useDebounce";
import ShowOrdersButton from "./ShowOrdersButton";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ExcelIcon from "@/ui/ExcelIcon";

const InnerTabSources = ({ getData, showAlert }) => {
  const { dateStart, dateEnd, points, setPage } = useMarketingTabStore();
  const [srcStats, setSrcStats] = useState(null);

  // sorting
  const [sortBy, setSortBy] = useState(sourceStatsColumns[0].key); // by sourceStatsColumns.key
  const [sortDir, setSortDir] = useState("asc");
  const sortSourceStats = (data, sortBy, sortDir) => {
    return data.slice().sort((a, b) => {
      let valA, valB;
      if (["orders", "new", "old", "promo"].includes(sortBy)) {
        const format = sourceStatsColumns.find(col => col.key === sortBy).format;
        valA = format(a);
        valB = format(b);
      } else {
        valA = (a[sortBy] || "").toString().toLowerCase();
        valB = (b[sortBy] || "").toString().toLowerCase();
      }

      if (valA === valB) return 0;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      return sortDir === "asc" ? 1 : -1;
    });
  };

  const handleSortClick = (columnKey) => {
    const isAsc = sortBy === columnKey && sortDir === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    setSortBy(columnKey);
    setSortDir(newOrder);

    // compute filtered arrays per row for sorting columns if needed
    const sorted = sortSourceStats(srcStats.sources, columnKey, newOrder);
    setSrcStats((old) => ({ ...old, sources: sorted }));
  };
  // /sorting

  // export
  const exportXLSX = useXLSExport();
  // /export

  const getSourcesOrdersStats = async () => {
    if (!points.length || !dateStart || !dateEnd) {
      return;
    }
    try {
      const resData = await getData("get_marketing_source_orders", {
        points: points,
        date_start: dayjs(dateStart).format("YYYY-MM-DD"),
        date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
      });

      if (!resData?.st) {
        showAlert(resData?.text || "За период нет источников", false);
        return;
      }
      setPage(1);
      setSrcStats(resData || null);
    } catch (e) {
      showAlert(`Ошибка при загрузке источников: ${e.message}`, false);
    }
  };

  const debouncedGetOrdersStats = useDebounce(getSourcesOrdersStats, 500);
  useEffect(() => {
    debouncedGetOrdersStats();
  }, [dateStart, dateEnd, points]);

  return srcStats ? (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton
          style={{ cursor: "pointer", padding: 20 }}
          onClick={() => exportXLSX(srcStats.sources, sourceStatsColumns, "sources-stats.xlsx")}
          title="Экспортировать в Excel"
        >
          <ExcelIcon />
        </IconButton>
      </Box>
      <TableContainer
        wfull
        sx={{
          maxHeight: "70dvh",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {sourceStatsColumns.map((col) => (
                <TableCell key={col.key}>
                  <TableSortLabel
                    active={sortBy === col.key}
                    direction={sortBy === col.key ? sortDir : "asc"}
                    onClick={() => handleSortClick(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {srcStats?.sources?.map((row) => {
              const { source, medium, orders } = row;
              const newOrders = orders?.filter((o) => o.is_new);
              const oldOrders = orders?.filter((o) => !o.is_new);
              const withPromo = orders?.filter((o) => o.promo_id);
              return (
                <TableRow key={`${medium}-${source}`}>
                  <TableCell>{vocabulary(source)}</TableCell>
                  <TableCell>{vocabulary(medium)}</TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={orders}
                      modalTitle={`Все ${vocabulary(medium)} - ${vocabulary(source)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={newOrders}
                      modalTitle={`Новые ${vocabulary(medium)} - ${vocabulary(source)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={oldOrders}
                      modalTitle={`Повторные ${vocabulary(medium)} - ${vocabulary(source)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={withPromo}
                      modalTitle={`с Промо ${vocabulary(medium)} - ${vocabulary(source)}`}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
};
export default memo(InnerTabSources);

const sourceStatsColumns = [
  { label: "Источник", key: "source" },
  { label: "Тип (medium)", key: "medium" },
  { label: "Заказов", key: "orders", format: (row) => row.orders.length ?? 0 },
  { label: "Новые", key: "new", format: (row) => row.orders.filter((o) => o.is_new).length ?? 0 },
  {
    label: "Повторные",
    key: "old",
    format: (row) => row.orders.filter((o) => !o.is_new).length ?? 0,
  },
  {
    label: "Промокоды",
    key: "promo",
    format: (row) => row.orders.filter((o) => o.promo_id).length ?? 0,
  },
];
