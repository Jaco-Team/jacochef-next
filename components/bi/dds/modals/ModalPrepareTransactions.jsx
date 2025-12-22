"use client";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TableContainer,
  Grid,
  Button,
  Stack,
  IconButton,
  Tooltip,
  TableSortLabel,
  TextField,
  Box,
  TablePagination,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Clear, FilterAlt } from "@mui/icons-material";
import { useEffect, useState } from "react";

import useDDSStore from "../useDDSStore";
import useDDSParserStore from "../useDDSParserStore";
import MyModal from "@/ui/MyModal";
import useApi from "@/src/hooks/useApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import { MySelect } from "@/ui/Forms";

export default function ModalPrepareTransactions({ open, onClose, showAlert }) {
  const { api_laravel } = useApi(useDDSStore.getState().module);

  const { parsedData, total, currentPage, perPage, sortBy, sortDir, query, updateState } =
    useDDSParserStore();

  const [selected, setSelected] = useState([]);

  const [importPoint, setImportPoint] = useState(null);
  const points = useDDSStore((s) => s.points);

  const loadParsedData = async (override = {}) => {
    const snap = useDDSParserStore.getState();

    const sessionId = snap.sessionId;
    if (!sessionId) {
      console.log("No session ID found");
      return;
    }

    const page = override.page ?? snap.currentPage;
    const perpage = override.perpage ?? snap.perPage;
    const sort_by = override.sort_by ?? snap.sortBy;
    const sort_dir = override.sort_dir ?? snap.sortDir;
    const q = override.q ?? snap.query;

    useDDSStore.setState({ is_load: true });

    const res = await api_laravel("parser/get", {
      session_id: sessionId,
      page: page + 1,
      perpage,
      sort_by,
      sort_dir,
      q,
    });

    useDDSStore.setState({ is_load: false });

    if (res?.st) {
      updateState({
        parsedData: res.transactions,
        total: res.total,
      });
      setSelected([]);
    }
  };

  useEffect(() => {
    if (open) loadParsedData();
  }, [open, currentPage, sortBy, sortDir, query, perPage]);

  const onSave = async () => {
    if (!importPoint || importPoint === "none") {
      return showAlert("Выберите Кафе, это обязательно", false);
    }
    const sessionId = useDDSParserStore.getState().sessionId;
    const res = await api_laravel("parser/save", {
      session_id: sessionId,
      point_id: importPoint,
    });

    if (!res?.st) return showAlert("Ошибка сохранения", false);
    updateState({ parsedData: res.skipped });
    showAlert(`Сохранено ${res.inserted} транзакций`, true);
    onClose?.();
  };

  const debouncedSearch = useDebounce(
    (v) => updateState({ query: v.toLowerCase(), currentPage: 0 }),
    350,
  );

  const onSearch = (e) => debouncedSearch(e.target.value);

  const onSort = (col) => {
    if (sortBy === col) {
      updateState({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateState({ sortBy: col, sortDir: "asc" });
    }
  };

  const toggleSelected = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleAll = (e) => {
    setSelected(e.target.checked ? parsedData.map((r) => r.number) : []);
  };

  const removeByIds = async (ids) => {
    const sessionId = useDDSParserStore.getState().sessionId;

    if (!sessionId) {
      console.log("No session ID found");
      return;
    }

    const res = await api_laravel("parser/remove", {
      session_id: sessionId,
      ids,
    });

    if (!res?.st) return showAlert("Ошибка удаления", false);

    await loadParsedData();
    setSelected([]);
    showAlert("Удалено", true);
  };

  const removeOne = (id) => removeByIds([id]);
  const removeMany = () => removeByIds(selected);

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Подготовка транзакций"
    >
      <Paper sx={{ p: 2 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 1, gap: 2 }}
            >
              <MySelect
                label="Кафе"
                data={points}
                value={importPoint}
                func={(e) => setImportPoint(e.target.value)}
                size="small"
                is_none={false}
              />

              <TextField
                size="small"
                placeholder="Фильтр…"
                onChange={onSearch}
                slotProps={{
                  input: {
                    startAdornment: <FilterAlt sx={{ mr: 1, color: "text.disabled" }} />,
                    endAdornment: query ? (
                      <IconButton onClick={() => updateState({ query: "", currentPage: 0 })}>
                        <Clear fontSize="small" />
                      </IconButton>
                    ) : null,
                  },
                }}
              />

              <Button
                variant="contained"
                disabled={!selected.length}
                onClick={removeMany}
                sx={{ minWidth: 200 }}
              >
                Удалить выбранные
              </Button>
            </Stack>
          </Grid>

          <Grid size={12}>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.length === parsedData.length && parsedData.length > 0}
                        indeterminate={selected.length > 0 && selected.length < parsedData.length}
                        onChange={toggleAll}
                      />
                    </TableCell>

                    {[
                      ["date", "Дата"],
                      ["number", "№"],
                      ["payer", "Плательщик"],
                      ["receiver", "Получатель"],
                      ["income", "Поступление"],
                      ["expense", "Списание"],
                      ["naznachenie_platezha", "Назначение"],
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

                    <TableCell />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parsedData.map((t) => (
                    <TableRow
                      key={t.id}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(t.id)}
                          onChange={() => toggleSelected(t.id)}
                        />
                      </TableCell>

                      <TableCell>{t.date}</TableCell>
                      <TableCell>{t.number}</TableCell>
                      <TableCell>{t.payer}</TableCell>
                      <TableCell>{t.receiver}</TableCell>

                      <TableCell
                        align="right"
                        sx={{ color: "success.main" }}
                      >
                        {+t.income > 0 ? `${Number(t.income).toFixed(2)} ₽` : "—"}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{ color: "secondary.main" }}
                      >
                        {+t.expense > 0 ? `-${Number(t.expense).toFixed(2)} ₽` : "—"}
                      </TableCell>

                      <TableCell sx={{ width: "30%", wordBreak: "break-word" }}>
                        <Box sx={{ fontSize: "0.85rem", lineHeight: 1.15 }}>
                          {t.naznachenie_platezha}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => removeOne(t.id)}
                          >
                            <DeleteIcon
                              fontSize="small"
                              color="primary"
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              rowsPerPageOptions={[30, 100, 500]}
              labelRowsPerPage="Записей на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
              page={currentPage}
              rowsPerPage={perPage}
              count={total ?? 0}
              onPageChange={async (_, newPage) => {
                updateState({ currentPage: newPage });
                await loadParsedData({ page: newPage });
                document
                  .querySelector("#prepare-table-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              onRowsPerPageChange={async (e) => {
                const newPerPage = Number(e.target.value);
                updateState({ perPage: newPerPage, currentPage: 0 });
                await loadParsedData({ page: 0, perpage: newPerPage });
                document
                  .querySelector("#prepare-table-top")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </Grid>

          <Grid size={12}>
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={2}
            >
              <Button
                variant="outlined"
                onClick={onClose}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={onSave}
              >
                Сохранить
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </MyModal>
  );
}
