"use client";

import { TablePagination } from "@mui/material";

export default function ComplaintPagination({ pagination, compact = false }) {
  return (
    <TablePagination
      component="div"
      count={pagination.total}
      page={pagination.page}
      rowsPerPage={pagination.perPage}
      rowsPerPageOptions={[25, 50, 100]}
      labelRowsPerPage={compact ? "Строк" : "Строк на странице"}
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
      onPageChange={(_, page) => pagination.onPageChange(page)}
      onRowsPerPageChange={(event) => pagination.onPerPageChange(Number(event.target.value))}
      sx={compact ? { "& .MuiTablePagination-toolbar": { px: 0 } } : undefined}
    />
  );
}
