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

export default function SiteClientsTrafficBySourceTable({ rows }) {
  const totalVisits = useMemo(() => rows?.reduce((a, r) => a + Number(r.visits), 0), [rows]);
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
            <TableCell>Визиты</TableCell>
            <TableCell>Процентная доля</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item, key) => (
            <TableRow
              hover
              key={key}
            >
              <TableCell>{key + 1}</TableCell>
              <TableCell>{item.source}</TableCell>
              <TableCell>{item.medium}</TableCell>
              <TableCell>{item.visits}</TableCell>
              <TableCell>{item.share_pct}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter sx={{ position: "sticky", bottom: 0, backgroundColor: "background.paper" }}>
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ textAlign: "right" }}
            >
              Всего:
            </TableCell>
            <TableCell>{totalVisits}</TableCell>
            <TableCell>100%</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
