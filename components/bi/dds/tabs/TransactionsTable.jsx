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
  TableSortLabel,
  TextField,
  Stack,
  TablePagination,
} from "@mui/material";
import {
  Category,
  Clear,
  Delete,
  DeleteOutline,
  EditOutlined,
  FilterAlt,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import { formatNumber } from "@/src/helpers/utils/i18n";
import useApi from "@/src/hooks/useApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import { formatYMD } from "@/src/helpers/ui/formatDate";

export default function TransactionsTable({ showAlert }) {
  const [
    articles, // TODO: remove article_name from api response, get it from this list by id
    transactions,
    refreshToken,
    points,
    module,
    txPage,
    txPerPage,
    txTotal,
    sortBy,
    sortDir,
    filters,
    searchQuery,
  ] = useDDSStore((s) => [
    s.articles,
    s.transactions,
    s.refreshToken,
    s.points,
    s.module,
    s.txPage,
    s.txPerPage,
    s.txTotal,
    s.sortBy,
    s.sortDir,
    s.filters,
    s.searchQuery,
  ]);
  const { api_laravel } = useApi(module);
  const setState = useDDSStore.setState;

  const { withConfirm, ConfirmDialog } = useConfirm();

  const [selected, setSelected] = useState([]);
  const toggleSelect = (tx) =>
    setSelected((prev) =>
      prev.some((x) => x.id === tx.id) ? prev.filter((x) => x.id !== tx.id) : [...prev, tx],
    );

  const toggleAll = () => {
    if (selected.length === transactions.length) setSelected([]);
    else setSelected([...transactions]); // full objects
  };

  const handleEdit = (tx) => {
    setState({ selectedTx: [tx], isModalArticleTxOpen: true });
  };

  const assignGroupArticle = () => {
    setState({ selectedTx: selected, isModalArticleTxOpen: true });
    console.log("Selected transactions for article assignment:", selected);
  };

  const getPaginatedTransactions = async () => {
    try {
      setState({ is_load: true });
      const {
        date_start,
        date_end,
        point,
        txPage,
        txPerPage,
        sortBy,
        sortDir,
        filters,
        searchQuery,
      } = useDDSStore.getState();
      const request = {
        date_start: formatYMD(date_start),
        date_end: formatYMD(date_end),
        points: point,
        page: txPage,
        perpage: txPerPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        filters: filters,
        q: searchQuery,
      };
      const res = await api_laravel("get_paginated_transactions", request);
      if (!res?.st) {
        throw new Error("Ошибка сервера");
      }
      const { transactions, meta } = res;
      setState({
        transactions,
        txTotal: meta?.total || 0,
      });
      setSelected([]);
    } catch (e) {
      showAlert(e.message || "Ошибка получения транзакций");
    } finally {
      setState({
        is_load: false,
      });
    }
  };

  const removeTransactions = async (ids = null) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      console.log("Invalid IDs provided");
      return;
    }
    try {
      setState({ is_load: true });
      const res = await api_laravel("remove_transactions", { ids });
      if (!res?.st) {
        throw new Error("Ошибка сервера");
      }
      showAlert("Транзакции успешно удалены");
    } catch (e) {
      showAlert(e.message || "Ошибка удаления транзакций");
    } finally {
      setState({ is_load: false });
    }
  };

  const removeOneTransaction = async (id) => {
    await removeTransactions([id]);
  };

  const onSort = (col) => {
    if (sortBy === col) {
      setState({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setState({ sortBy: col, sortDir: "asc" });
    }
  };

  const onSearch = useDebounce(
    (e) => setState({ searchQuery: e?.target?.value?.toLowerCase() || "" }),
    350,
  );

  useEffect(() => {
    getPaginatedTransactions();
  }, [refreshToken, txPage, txPerPage, sortBy, sortDir, filters, searchQuery]);

  return (
    <>
      <ConfirmDialog />
      <Paper sx={{ p: 2 }}>
        <Stack sx={{ p: 1, gap: 1, flexDirection: "row" }}>
          <Button
            variant="text"
            size="small"
            disabled={!selected.length}
            startIcon={<Category />}
            onClick={assignGroupArticle}
          >
            Присвоить статью ({selected.length})
          </Button>
          <Button
            variant="text"
            size="small"
            disabled={!selected.length}
            startIcon={<DeleteOutline />}
            onClick={withConfirm(() => {
              setState({
                selectedTx: transactions.filter((r) => selected.includes(r.id)),
                isModalArticleTxOpen: true,
              });
            })}
          >
            Удалить выбранные ({selected.length})
          </Button>
          <TextField
            size="small"
            placeholder="Фильтр…"
            onChange={onSearch}
            slotProps={{
              input: {
                startAdornment: <FilterAlt sx={{ mr: 1, color: "text.disabled" }} />,
                endAdornment: searchQuery ? (
                  <IconButton onClick={() => setState({ searchQuery: "", page: 0 })}>
                    <Clear fontSize="small" />
                  </IconButton>
                ) : null,
              },
            }}
          />
        </Stack>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === transactions.length && transactions.length > 0}
                    indeterminate={selected.length > 0 && selected.length < transactions.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                {[
                  ["date", "Дата"],
                  ["number", "№"],
                  ["point", "Кафе"],
                  ["contractor", "Контрагент"],
                  ["income", "Поступление"],
                  ["expense", "Списание"],
                  ["purpose", "Назначение"],
                ].map(([k, lbl]) => (
                  <TableCell key={k}>
                    <TableSortLabel
                      active={sortBy === k}
                      direction={sortBy === k ? sortDir : "asc"}
                      onClick={() => onSort(k)}
                    >
                      {lbl}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell>Статья</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {transactions.map((r) => {
                const checked = selected.some((s) => s.id === r.id);
                const article = articles?.find((a) => a.id === r.article_id) || null;
                return (
                  <TableRow
                    key={r.id}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleSelect(r)}
                      />
                    </TableCell>
                    <TableCell>{r.date || "—"}</TableCell>
                    <TableCell>{r.number || "—"}</TableCell>
                    <TableCell>{points?.find((p) => p.id === r.point_id) || "—"}</TableCell>
                    <TableCell>{r.contractor || "—"}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                      {r.income ? `${formatNumber(r.income, 2, 2)} ₽` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "secondary.main", fontWeight: 500 }}>
                      {r.expense ? `-${formatNumber(r.expense, 2, 2)} ₽` : "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 360,
                      }}
                    >
                      {r.purpose}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          article ? (article.group === 1 ? "success" : "secondary") : "warning"
                        }
                        variant="outlined"
                        label={article ? article.name : "Требует классификации"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(r)}
                        >
                          <EditOutlined fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={withConfirm(
                            () => removeOneTransaction(r.id),
                            "Вы уверены, что хотите удалить эту транзакцию?",
                          )}
                        >
                          <Delete
                            size="small"
                            color="secondary"
                          />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Summary row */}
              {/* <TableRow sx={{ backgroundColor: "action.hover" }}>
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
              </TableRow> */}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[50, 100, 500]}
          labelRowsPerPage="Транзакций на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          page={txPage - 1 || 0}
          rowsPerPage={txPerPage}
          count={txTotal ?? 0}
          onPageChange={(_, newPage) => {
            setState({ txPage: newPage });
            getPaginatedTransactions();
            document.querySelector("#prepare-table-top")?.scrollIntoView({ behavior: "smooth" });
          }}
          onRowsPerPageChange={(e) => {
            const newPerPage = Number(e.target.value);
            setState({ txPerPage: newPerPage, txPage: 0 });
            getPaginatedTransactions();
            document.querySelector("#prepare-table-top")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </Paper>
    </>
  );
}
