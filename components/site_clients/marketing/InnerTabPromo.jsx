"use client";

import { useDebounce } from "@/src/hooks/useDebounce";
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
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import ShowOrdersButton from "./ShowOrdersButton";
import useXLSExport from "@/src/hooks/useXLSXExport";
import ExcelIcon from "@/ui/ExcelIcon";

const InnerTabPromo = ({ getData, showAlert, canExport }) => {
  const { dateStart, dateEnd, points, resetFilters, setOrders } = useMarketingTabStore();

  const [promoStats, setPromoStats] = useState(null);

  // export
  const exportXLSX = useXLSExport();

  // stats sorting state
  const [sortBy, setSortBy] = useState("orders"); // by promoStatsColumns.key
  const [sortDir, setSortDir] = useState("desc");

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const sortPromoStats = (data, sortBy, sortDir) => {
    return data?.slice().sort((a, b) => {
      let valA, valB;

      // Columns that are arrays → sort by length
      if (["orders", "new", "old"].includes(sortBy)) {
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
    const sorted = sortPromoStats(promoStats, columnKey, newOrder);
    setPromoStats(sorted);
  }

  const getPromoStats = async () => {
    if (!points.length || !dateStart || !dateEnd) {
      showAlert("Пожалуйста, выберите кафе и даты", false);
      return;
    }
    const resData = await getData("get_marketing_promo_stats", {
      points: points,
      date_start: dayjs(dateStart).format("YYYY-MM-DD"),
      date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
    });

    if (!resData?.st) {
      showAlert(resData?.text || "За период нет статистики", false);
      return;
    }
    setOrders(null);
    resetFilters();
    setPromoStats(sortPromoStats(resData.promo_stats, sortBy, sortDir));
  };

  const debouncedGetStats = useDebounce(getPromoStats, 500);
  useEffect(() => debouncedGetStats(), [points, dateStart, dateEnd]);

  return promoStats ? (
    <>
      {canExport && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            style={{ cursor: "pointer", padding: 10 }}
            onClick={() => exportXLSX(promoStats, promoStatsColumns, "promo-stats.xlsx")}
            title="Экспортировать в Excel"
          >
            <ExcelIcon />
          </IconButton>
        </Box>
      )}

      <TableContainer
        hfull
        sx={{
          maxHeight: "55dvh",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {promoStatsColumns.map((col) => (
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
            {promoStats?.slice((page - 1) * perPage, page * perPage).map((promo, key) => (
              <TableRow key={+promo || key}>
                <TableCell>{promo.promo_name}</TableCell>
                <TableCell>
                  <ShowOrdersButton
                    orders={promo.orders}
                    modalTitle={`Все с промокодом ${promo.promo_name}`}
                  />
                </TableCell>
                <TableCell>
                  <ShowOrdersButton
                    orders={promo.new}
                    modalTitle={`Новые с промокодом ${promo.promo_name}`}
                  />
                </TableCell>
                <TableCell>
                  <ShowOrdersButton
                    orders={promo.old}
                    modalTitle={`Повторные с промокодом ${promo.promo_name}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
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
      />
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
};
export default memo(InnerTabPromo);

const promoStatsColumns = [
  { label: "Название промика", key: "promo_name" },
  { label: "Заказов", key: "orders", format: (row) => row.orders.length ?? 0 },
  { label: "Новые", key: "new", format: (row) => row.new.length ?? 0 },
  { label: "Повторные", key: "old", format: (row) => row.old.length ?? 0 },
];
