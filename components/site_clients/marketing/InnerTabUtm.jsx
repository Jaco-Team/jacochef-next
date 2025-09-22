"use client";

import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { memo, useEffect, useState } from "react";
import ShowOrdersButton from "./ShowOrdersButton";
import useMarketingTabStore from "./useMarketingTabStore";
import { useDebounce } from "@/src/hooks/useDebounce";
import dayjs from "dayjs";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ExcelIcon from "@/ui/ExcelIcon";

function InnerTabUtm({ getData, showAlert, canExport }) {
  const { dateStart, dateEnd, points, setPage } = useMarketingTabStore();

  const [utmStats, setUtmStats] = useState(null);

  const exportXLSX = useXLSExport();

  // stats sorting state
  const [sortBy, setSortBy] = useState("orders"); // by utmStatsColumns.key
  const [sortDir, setSortDir] = useState("desc");

  const getUtmStats = async () => {
    if (!points.length || !dateStart || !dateEnd) {
      return;
    }
    try {
      const resData = await getData("get_marketing_utm_orders", {
        points: points,
        date_start: dayjs(dateStart).format("YYYY-MM-DD"),
        date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
      });

      if (!resData?.st) {
        showAlert(resData?.text || "За период нет статистики utm", false);
        return;
      }
      setPage(1);
      setUtmStats(sortUtmStats(resData.stats, sortBy, sortDir));
    } catch (e) {
      showAlert(`Ошибка при загрузке статистики utm: ${e.message}`, false);
    }
  };

  const sortUtmStats = (data, sortBy, sortDir) => {
    return data?.slice().sort((a, b) => {
      let valA, valB;

      // Columns that are arrays → sort by length
      if (["orders", "new", "old", "promo"].includes(sortBy)) {
        valA = (a[sortBy] || []).length;
        valB = (b[sortBy] || []).length;
      } else {
        valA = (a[sortBy] || "").toString().toLowerCase();
        valB = (b[sortBy] || "").toString().toLowerCase();
      }

      if (valA === valB) return 0;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      return sortDir === "asc" ? 1 : -1;
    });
  };

  function handleSortClick(columnKey) {
    const isAsc = sortBy === columnKey && sortDir === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    setSortBy(columnKey);
    setSortDir(newOrder);

    // compute filtered arrays per row for sorting columns if needed
    const sorted = sortUtmStats(utmStats, columnKey, newOrder);
    setUtmStats(sorted);
  }

  // pagination
  const [page, setLocalPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const debouncedGetOrdersStats = useDebounce(getUtmStats, 500);
  useEffect(() => {
    debouncedGetOrdersStats();
  }, [dateStart, dateEnd, points]);

  return utmStats ? (
    <>
      {canExport && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            style={{ cursor: "pointer", padding: 10 }}
            onClick={() => exportXLSX(utmStats, utmStatsColumns, "utm-stats.xlsx")}
            title="Экспортировать в Excel"
          >
            <ExcelIcon />
          </IconButton>
        </Box>
      )}
      <TableContainer
        sx={{
          maxHeight: "70dvh",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {utmStatsColumns.map((col) => (
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
            {utmStats?.slice((page - 1) * perPage, page * perPage)?.map((group, key) => {
              const orders = group["orders"] || [];
              const newOrders = orders?.filter((o) => o.is_new);
              const oldOrders = orders?.filter((o) => !o.is_new);
              const withPromo = orders?.filter((o) => o.promo_id);
              return (
                <TableRow key={key}>
                  <TableCell>{group.utm_source}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        maxWidth: 150,
                        // overflow: "hidden",
                        // textOverflow: "ellipsis",
                        wordBreak: "break-all",
                      }}
                      title={group.utm_medium}
                    >
                      {group.utm_medium}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        maxWidth: 150,
                        // overflow: "hidden",
                        // textOverflow: "ellipsis",
                        wordBreak: "break-all",
                      }}
                      title={group.utm_campaign}
                    >
                      {group.utm_campaign}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        maxWidth: 150,
                        // overflow: "hidden",
                        // textOverflow: "ellipsis",
                        wordBreak: "break-all",
                      }}
                      title={group.utm_content}
                    >
                      {group.utm_content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      // noWrap
                      sx={{
                        maxWidth: 200,
                        wordBreak: "break-all",
                      }}
                      title={group.utm_term}
                    >
                      {group.utm_term}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={orders}
                      modalTitle={`Все ${group.utm_source}/${group.utm_medium}/${group.utm_campaign}/${group.utm_content}/${group.utm_term}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={newOrders}
                      modalTitle={`Новые ${group.utm_source}/${group.utm_medium}/${group.utm_campaign}/${group.utm_content}/${group.utm_term}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={oldOrders}
                      modalTitle={`Повторные ${group.utm_source}/${group.utm_medium}/${group.utm_campaign}/${group.utm_content}/${group.utm_term}`}
                    />
                  </TableCell>
                  <TableCell>
                    <ShowOrdersButton
                      orders={withPromo}
                      modalTitle={`с Промо ${group.utm_source}/${group.utm_medium}/${group.utm_campaign}/${group.utm_content}/${group.utm_term}`}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 50, 100, 300]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        labelRowsPerPage="Строк на странице:"
        component="div"
        count={utmStats?.length ?? 0}
        rowsPerPage={perPage}
        page={page - 1}
        onPageChange={(_, newPage) => {
          setLocalPage(newPage + 1);
        }}
        onRowsPerPageChange={(event) => {
          const newPerPage = parseInt(event.target.value, 10);
          setPerPage(newPerPage);
          setLocalPage(1);
        }}
      />
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
}

export default memo(InnerTabUtm);

// config
const utmStatsColumns = [
  { label: "Источник (utm_source)", key: "utm_source" },
  { label: "Тип (utm_medium)", key: "utm_medium" },
  { label: "Кампания (utm_campaign)", key: "utm_campaign" },
  { label: "ID (utm_content)", key: "utm_content" },
  { label: "Ключевое слово (utm_term)", key: "utm_term" },
  {
    key: "orders",
    label: "Все заказы",
    format: (row) => (row.orders ? row.orders.length : 0),
  },
  {
    key: "new",
    label: "Новые",
    format: (row) => (row.orders ? row.orders.filter((o) => o.is_new).length : 0),
  },
  {
    key: "old",
    label: "Повторные",
    format: (row) => (row.orders ? row.orders.filter((o) => !o.is_new).length : 0),
  },
  {
    key: "promo",
    label: "С промо",
    format: (row) => (row.orders ? row.orders.filter((o) => o.promo_id).length : 0),
  },
];
