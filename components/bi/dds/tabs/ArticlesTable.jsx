"use client";

import { Visibility } from "@mui/icons-material";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function ArticlesTable({ rows }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Статья ДДС</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Сумма за период</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Доля %</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Операций</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow
              key={i}
              hover
            >
              <TableCell>{r.name}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{r.amount}</TableCell>
              <TableCell>{r.percent}</TableCell>
              <TableCell>{r.ops}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<Visibility fontSize="small" />}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 400,
                    px: 1,
                    color: "text.primary",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  Расшифровка
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
