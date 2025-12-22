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
  Chip,
  Button,
  TableSortLabel,
  TextField,
  Stack,
  TablePagination,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  Category,
  Clear,
  Delete,
  DeleteOutline,
  EditOutlined,
  FilterAlt,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import { formatNumber } from "@/src/helpers/utils/i18n";
import useApi from "@/src/hooks/useApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { MyAutoCompleteWithAll } from "@/ui/Forms";

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
    txArticlesSet,
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
    s.txArticlesSet,
  ]);
  const { api_laravel } = useApi(module);
  const setState = useDDSStore.setState;

  const { withConfirm, ConfirmDialog } = useConfirm();

  const [selected, setSelected] = useState([]);
  const toggleSelect = (tx) =>
    setSelected((prev) =>
      prev.some((x) => x.id === tx.id)
        ? prev.filter((x) => x.id !== tx.id && !tx.is_order)
        : [...prev, tx],
    );

  const toggleAll = () => {
    if (
      selected.filter((tx) => !tx.is_order).length ===
      transactions.filter((tx) => !tx.is_order).length
    )
      setSelected([]);
    else setSelected([...transactions.filter((tx) => !tx.is_order)]); // full objects
  };

  const handleEdit = (tx) => {
    // setState({ selectedTx: [tx], isModalArticleTxOpen: true });
    setState({ selectedTx: [tx], isModalEditTxOpen: true });
  };

  const handleTypeFilter = (_, v) => {
    setState((s) => {
      const next = { ...s.filters };
      if (v === null) {
        delete next.type; // <-- remove key completely
      } else {
        next.type = v; // <-- set new value
      }
      return { filters: next };
    });
  };
  const handleArticleIdsFilter = (v) => {
    setState((s) => {
      const next = { ...s.filters };
      if (v === null) {
        delete next.article_ids; // <-- remove key completely
      } else {
        next.article_ids = v; // <-- set new value
      }
      return { filters: next, txPage: 1 };
    });
  };

  const assignGroupArticle = () => {
    setState({ selectedTx: selected, isModalArticleTxOpen: true });
    // console.log("Selected transactions for article assignment:", selected);
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
      const filtersDTO = { ...filters };
      if (filters.article_ids?.length) {
        filtersDTO.article_ids = [...filters.article_ids].map((a) => a.id);
      }
      const request = {
        date_start: formatYMD(date_start),
        date_end: formatYMD(date_end),
        points: point,
        page: txPage,
        perpage: txPerPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        filters: filtersDTO,
        q: searchQuery,
      };
      const res = await api_laravel("get_paginated_transactions", request);
      if (!res?.st) {
        throw new Error("Ошибка сервера");
      }
      const { transactions, meta } = res;
      setState({
        txArticlesSet: res.articles_set,
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

  const article_idsFilterItems = useMemo(() => {
    // console.log(`Articles ${articles?.length}, article_ids set: ${txArticlesSet}`);
    return articles?.filter((a) => txArticlesSet?.includes(a.id)) || [];
  }, [txArticlesSet, articles]);

  const article_ids = useMemo(() => filters?.article_ids, [filters, article_idsFilterItems]);

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
      setState({ refreshToken: Date.now() });
      showAlert("Транзакции успешно удалены", true);
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

  const filterRef = useRef(null);
  const onSearch = useDebounce(() => {
    const value = filterRef?.current?.value.trim()?.toLowerCase() || "";
    setState({ searchQuery: value });
  }, 350);

  useEffect(() => {
    getPaginatedTransactions();
  }, [refreshToken, txPage, txPerPage, sortBy, sortDir, filters, searchQuery]);

  return (
    <>
      <ConfirmDialog />
      <Paper sx={{ p: 2 }}>
        <Stack
          sx={{ p: 1, gap: 1, flexDirection: { sm: "column", md: "row" }, alignItems: "center" }}
        >
          <Button
            variant="text"
            size="small"
            disabled={!selected?.length}
            startIcon={<Category />}
            onClick={assignGroupArticle}
          >
            Присвоить статью ({selected?.length})
          </Button>
          <Button
            variant="text"
            size="small"
            disabled={!selected?.length}
            startIcon={<DeleteOutline />}
            onClick={withConfirm(() => {
              setState({
                selectedTx: transactions?.filter((r) => selected?.includes(r.id)),
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
            inputRef={filterRef}
            slotProps={{
              input: {
                startAdornment: <FilterAlt sx={{ mr: 1, color: "text.disabled" }} />,
                endAdornment: filterRef.current?.value ? (
                  <IconButton
                    onClick={() => {
                      filterRef.current.value = "";
                      setState({ searchQuery: "", page: 0 });
                    }}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                ) : null,
              },
            }}
          />
          <ToggleButtonGroup
            value={filters.type}
            exclusive
            onChange={handleTypeFilter}
            size="small"
          >
            <ToggleButton value={"income"}>Поступления</ToggleButton>
            <ToggleButton value={"expense"}>Платежи</ToggleButton>
            <ToggleButton
              value={null}
              selected={!filters.type}
            >
              Все
            </ToggleButton>
          </ToggleButtonGroup>
          <MyAutoCompleteWithAll
            options={[
              { id: null, name: "Требует классификации (не указана)" },
              ...(article_idsFilterItems || []),
            ]}
            value={article_ids || []}
            onChange={handleArticleIdsFilter}
            // withAll
            // withAllSelected
            label="Только статьи..."
            sx={{ minWidth: 200, width: 300 }}
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
                    checked={
                      selected?.filter((tx) => !tx.is_order)?.length ===
                        transactions.filter((tx) => !tx.is_order)?.length &&
                      transactions.filter((tx) => !tx.is_order)?.length > 0
                    }
                    indeterminate={
                      selected?.filter((tx) => !tx.is_order)?.length > 0 &&
                      selected.filter((tx) => !tx.is_order)?.length <
                        transactions.filter((tx) => !tx.is_order)?.length
                    }
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
                const article = articles?.find((a) => +a.id === +r.article_id) || null;
                return (
                  <TableRow
                    key={r.id || r.order_id}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Tooltip title="Выбрать">
                        <span>
                          <Checkbox
                            checked={checked}
                            title="Выбрать"
                            onChange={() => toggleSelect(r)}
                            sx={{ p: 1 }}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{r.date || "—"}</TableCell>
                    <TableCell>{r.number || "—"}</TableCell>
                    <TableCell>{points?.find((p) => p.id === r.point_id)?.name || "—"}</TableCell>
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
                      {!r.is_order && (
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
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[50, 100, 500]}
          labelRowsPerPage="Транзакций на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          page={txPage - 1}
          rowsPerPage={txPerPage}
          count={txTotal ?? 0}
          onPageChange={(_, newPage) => {
            setState({ txPage: newPage + 1 });
            // getPaginatedTransactions();
            document.querySelector("#prepare-table-top")?.scrollIntoView({ behavior: "smooth" });
          }}
          onRowsPerPageChange={(e) => {
            const newPerPage = Number(e.target.value);
            setState({ txPerPage: newPerPage, txPage: 1 }); // mui 0-based, all other 1-based
            // getPaginatedTransactions();
            document.querySelector("#prepare-table-top")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </Paper>
    </>
  );
}
