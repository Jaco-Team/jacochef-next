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
import { Category, EditOutlined } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function TransactionsTable() {
  const [articles, transactions] = useDDSStore((s) => [s.articles, s.transactions]);
  const setState = useDDSStore.setState;

  const rowsWithArticles = useMemo(() => {
    const aMap = new Map((articles || []).map((a) => [a.id, a.name]));
    return (transactions || []).map((t, i) => ({
      id: i + 1, // fallback if no ID provided
      ...t,
      article: t.article_id ? aMap.get(t.article_id) : null,
      contractor: (t.income || 0) > 0 ? t.payer : t.receiver,
      purpose: t.payment_description || "—",
    }));
  }, [articles, transactions]);

  const { withConfirm, ConfirmDialog } = useConfirm();

  const [selected, setSelected] = useState([]);
  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected(
      selected.length === rowsWithArticles.length ? [] : rowsWithArticles.map((r) => r.id),
    );

  const totalIncome = rowsWithArticles.reduce((a, b) => a + (b.income || 0), 0);
  const totalExpense = rowsWithArticles.reduce((a, b) => a + (b.expense || 0), 0);
  const balance = totalIncome - totalExpense;

  const assignGroupArticle = () => {
    const selectedTx = selected.map((id) => rowsWithArticles.find((r) => r.id === id));
    setState({ selectedTx, isModalArticleTxOpen: true });
  };
  return (
    <>
      <ConfirmDialog />
      <Paper sx={{ p: 2 }}>
        <Box sx={{ p: 1 }}>
          <Button
            variant="text"
            size="small"
            disabled={!selected.length}
            startIcon={<Category />}
            onClick={assignGroupArticle}
          >
            Присвоить статью ({selected.length})
          </Button>
        </Box>

        <TableContainer sx={{ borderRadius: 2 }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selected.length === rowsWithArticles.length && rowsWithArticles.length > 0
                    }
                    indeterminate={selected.length > 0 && selected.length < rowsWithArticles.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>№</TableCell>
                <TableCell
                  sx={{
                    minWidth: 100,
                  }}
                >
                  Поступление
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 100,
                  }}
                >
                  Списание
                </TableCell>
                <TableCell>Контрагент</TableCell>
                <TableCell>Назначение платежа</TableCell>
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
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </TableCell>
                    <TableCell>{r.date || "—"}</TableCell>
                    <TableCell>{r.number || "—"}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                      {r.income ? `${formatNumber(r.income, 2, 2)} ₽` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "secondary.main", fontWeight: 500 }}>
                      {r.expense ? `-${formatNumber(r.expense, 2, 2)} ₽` : "—"}
                    </TableCell>
                    <TableCell>{r.contractor || "—"}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 360,
                      }}
                    >
                      {r.purpose}
                    </TableCell>
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
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                      >
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
                  {formatNumber(totalIncome, 2, 2)} ₽
                </TableCell>
                <TableCell sx={{ color: "secondary.main", fontWeight: 600 }}>
                  -{formatNumber(totalExpense, 2, 2)} ₽
                </TableCell>
                <TableCell
                  colSpan={4}
                  align="right"
                >
                  <Typography
                    fontWeight={600}
                    sx={{
                      color:
                        balance > 0
                          ? "success.main"
                          : balance < 0
                            ? "secondary.main"
                            : "text.primary",
                    }}
                  >
                    Баланс: {formatNumber(balance, 2, 2)} ₽
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
