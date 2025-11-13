"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  TableSortLabel,
  IconButton,
  Box,
} from "@mui/material";
import { formatNumber } from "@/src/helpers/utils/i18n";
import COOItemsGraphModal from "./COOItemsGraphModal";
import { QueryStats } from "@mui/icons-material";

const SortableTable = ({ data, modalTitle }) => {
  if (!data?.totals?.items?.length) {
    return <Box sx={{ textAlign: "center", py: 2 }}>По выбранным позициям нет данных</Box>;
  }
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("item_name");

  const [graphOpened, setGraphOpened] = useState(false);
  const [graphItemId, setGraphItemId] = useState(null);

  const [combinedGraph, setCombinedGraph] = useState(false);

  const openGraphModal = (itemId) => {
    setCombinedGraph(false);
    setGraphItemId(itemId);
    setGraphOpened(true);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedItems = [...data?.totals?.items]?.sort((a, b) => {
    if (order === "asc") {
      return a[orderBy] < b[orderBy] ? -1 : 1;
    }
    return a[orderBy] > b[orderBy] ? -1 : 1;
  });

  return (
    <>
      <COOItemsGraphModal
        data={data}
        open={graphOpened}
        onClose={() => setGraphOpened(false)}
        itemId={graphItemId}
        title={modalTitle}
        combined={combinedGraph}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "qty" ? order : false}>
                <TableSortLabel
                  active={orderBy === "item_name"}
                  direction={orderBy === "item_name" ? order : "asc"}
                  onClick={() => handleSort("item_name")}
                >
                  Позиция меню
                </TableSortLabel>
                <IconButton
                  onClick={() => {
                    setGraphItemId(null);
                    setGraphOpened(true);
                    setCombinedGraph(true);
                  }}
                >
                  <QueryStats />
                </IconButton>
              </TableCell>
              <TableCell sortDirection={orderBy === "qty" ? order : false}>
                <TableSortLabel
                  active={orderBy === "qty"}
                  direction={orderBy === "qty" ? order : "asc"}
                  onClick={() => handleSort("qty")}
                >
                  Заказов, шт.
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "qty_share" ? order : false}>
                <TableSortLabel
                  active={orderBy === "qty_share"}
                  direction={orderBy === "qty_share" ? order : "asc"}
                  onClick={() => handleSort("qty_share")}
                >
                  Доля в заказах
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "sum" ? order : false}>
                <TableSortLabel
                  active={orderBy === "sum"}
                  direction={orderBy === "sum" ? order : "asc"}
                  onClick={() => handleSort("sum")}
                >
                  Выручка, руб.
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "sum_share" ? order : false}>
                <TableSortLabel
                  active={orderBy === "sum_share"}
                  direction={orderBy === "sum_share" ? order : "asc"}
                  onClick={() => handleSort("sum_share")}
                >
                  Доля в выручке
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell>
                  {item.item_name}
                  <IconButton onClick={() => openGraphModal(item.item_id)}>
                    <QueryStats />
                  </IconButton>
                </TableCell>
                <TableCell>{formatNumber(item.qty, 0, 0)}</TableCell>
                <TableCell>{item.qty_share}%</TableCell>
                <TableCell>{formatNumber(item.sum)}</TableCell>
                <TableCell>{item.sum_share}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Итого</TableCell>
              <TableCell>{formatNumber(data.totals.total_orders, 0, 0)}</TableCell>
              <TableCell>100%</TableCell>
              <TableCell>{formatNumber(data.totals.total_sum)}</TableCell>
              <TableCell>100%</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default SortableTable;
