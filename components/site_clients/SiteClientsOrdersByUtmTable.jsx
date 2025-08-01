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

export default function SiteClientsOrdersByUtmTable({ rows }) {
  return (
    <TableContainer sx={{ maxHeight: { xs: 'none', sm: '70dvh' }, marginTop: '1em' }} component={Paper}>
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
          {rows.map( (item, key) =>
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
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
