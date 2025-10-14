"use client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function SiteClientsTrafficBySourceTable({ rows }) {
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
      </Table>
    </TableContainer>
  );
}
