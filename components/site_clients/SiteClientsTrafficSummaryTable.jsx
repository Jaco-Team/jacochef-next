"use client";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

export default function SiteClientsTrafficSummaryTable({ data }) {
  return (
    <TableContainer sx={{ maxHeight: { xs: 'none', sm: 570 }, marginTop: '1em' }} component={Paper}>
      <Table>
        <TableBody>
          <TableRow hover>
            <TableCell>Всего визитов</TableCell>
            <TableCell>{data.visits}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Уникальных посетителей</TableCell>
            <TableCell>{data.unique_visitors}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Новых визитов</TableCell>
            <TableCell>{data.new_visits}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Повторных визитов</TableCell>
            <TableCell>{data.returning_visits}</TableCell>
          </TableRow>
          <TableRow hover>
            <TableCell>Среднее визитов на посетителя</TableCell>
            <TableCell>{data.avg_sessions_per_visitor}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
