"use client";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { memo, useMemo, useState } from "react";
import { useClientHistoryStore } from "./useClientHistoryStore";

const ClientHistoryTable = ({ columns, rows }) => {
  const [orderBy, setOrderBy] = useState("date_time_order"); // one of column keys
  const [orderDir, setOrderDir] = useState("desc");

  const { page, perPage, update } = useClientHistoryStore((s) => ({
    page: s.page,
    perPage: s.perPage,
    update: s.update,
  }));
  const sortedRows = useMemo(() => {
    const rowsCopy = [...rows];
    rowsCopy.sort((a, b) => {
      const av = a[orderBy];
      const bv = b[orderBy];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return orderDir === "asc" ? av - bv : bv - av;
      }

      return orderDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rowsCopy;
  }, [rows, orderBy, orderDir]);

  const pagedRows = useMemo(() => {
    const start = page * perPage;
    return sortedRows.slice(start, start + perPage);
  }, [sortedRows, page, perPage]);

  const onSort = (key) => {
    if (orderBy === key) {
      setOrderDir((v) => (v === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(key);
      setOrderDir("asc");
    }
  };
  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ mt: 3, maxHeight: "45dvh" }}
      >
        <Table
          size="small"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  align={c.numeric ? "right" : "left"}
                >
                  <TableSortLabel
                    active={orderBy === c.key}
                    direction={orderBy === c.key ? orderDir : "asc"}
                    onClick={() => onSort(c.key)}
                  >
                    {c.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedRows.map((row) => (
              <TableRow
                key={row.order_id}
                hover
              >
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    align={c.numeric ? "right" : "left"}
                  >
                    {c.format ? c.format(row[c.key]) : (row[c.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        labelRowsPerPage="Строк на странице:"
        count={sortedRows.length}
        page={page}
        onPageChange={(_, page) => update({ page })}
        rowsPerPage={perPage}
        onRowsPerPageChange={(e) => {
          update({ perPage: +e.target.value, page: 0 });
        }}
        rowsPerPageOptions={[10, 50, 300]}
      />
    </>
  );
};

export default memo(ClientHistoryTable);
