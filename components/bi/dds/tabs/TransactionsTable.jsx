"use client";

import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";

export default function TransactionsTable() {
  const [articles, transactions] = useDDSStore((s) => [s.articles, s.transactions]);
  const rowsWithArticles = useMemo(() =>
    transactions.map((t) => ({ ...t, article: articles.find((a) => a.id === t.article_id)?.name })),
  );

  const [selected, setSelected] = useState([]);
  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    if (selected.length === transactions.length) setSelected([]);
    else setSelected(transactions.map((r) => r.id));
  };

  const totalIncome = transactions.reduce((a, b) => a + (b.income || 0), 0);
  const totalExpense = transactions.reduce((a, b) => a + (b.expense || 0), 0);

  const { withConfirm, ConfirmDialog } = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <Paper sx={{ p: 2 }}>
        <Box sx={{ p: 1 }}>
          <Button
            variant="text"
            size="small"
            disabled={!selected.length}
            startIcon={<Typography fontSize={14}>🏷️</Typography>}
            onClick={withConfirm((e) => console.log(e), "Точно нажать?", 5)}
          >
            Присвоить статью ({selected.length})
          </Button>
        </Box>

        {/* Table */}
        <TableContainer sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === transactions.length}
                    indeterminate={selected.length > 0 && selected.length < transactions.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>№</TableCell>
                <TableCell>Поступление</TableCell>
                <TableCell>Списание</TableCell>
                <TableCell>Контрагент</TableCell>
                <TableCell>Назначение</TableCell>
                <TableCell>Статья ДДС</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rowsWithArticles.map((r) => {
                const checked = selected.includes(r.id);
                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    title="Изменить"
                    // onClick={() => toggleSelect(r.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.number}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                      {r.income ? `${r.income.toLocaleString()} ₽` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "error.main", fontWeight: 500 }}>
                      {r.expense ? `${r.expense.toLocaleString()} ₽` : "—"}
                    </TableCell>
                    <TableCell>{r.contractor}</TableCell>
                    <TableCell>{r.purpose}</TableCell>
                    <TableCell>
                      {r.article ? (
                        r.article
                      ) : (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label="Требует классификации"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditOutlined fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Summary row */}
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell colSpan={2}>
                  <Typography fontWeight={600}>Итого:</Typography>
                </TableCell>
                <TableCell />
                <TableCell sx={{ color: "success.main", fontWeight: 600 }}>
                  {totalIncome.toLocaleString()} ₽
                </TableCell>
                <TableCell sx={{ color: "error.main", fontWeight: 600 }}>
                  {totalExpense.toLocaleString()} ₽
                </TableCell>
                <TableCell
                  colSpan={4}
                  sx={{ fontWeight: 600, color: "success.main" }}
                >
                  Баланс: {(totalIncome - totalExpense).toLocaleString()} ₽
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
