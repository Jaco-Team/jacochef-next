"use client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";

export default function SiteClientsOrdersByUtmTable({ rows }) {
  const totalOrders = useMemo(() => rows?.reduce((a, r) => a + Number(r.orders), 0) || 0, [rows]);
  return (
    <TableContainer
      sx={{ maxHeight: { xs: "none", sm: "70dvh" }, marginTop: "1em" }}
      component={Paper}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Источник (source)</TableCell>
            <TableCell>Канал (medium)</TableCell>
            <TableCell>Кампания (campaign)</TableCell>
            <TableCell>Заказов</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item, key) => (
            <TableRow
              hover
              key={key}
            >
              <TableCell>{key + 1}</TableCell>
              <TableCell>{item.utm_source}</TableCell>
              <TableCell>{item.utm_medium}</TableCell>
              <TableCell>{item.utm_campaign}</TableCell>
              <TableCell>{item.orders}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter sx={{ position: "sticky", bottom: 0, backgroundColor: "background.paper" }}>
          <TableRow>
            <TableCell
              colSpan={4}
              sx={{ textAlign: "right" }}
            >
              Всего:
            </TableCell>
            <TableCell>{totalOrders}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
