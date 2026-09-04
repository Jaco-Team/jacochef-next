"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SkladDeleteDialog from "../SkladDeleteDialog";
import { formatDateRU } from "../formatDateRangeRU";
import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import SkladWarehouseItemEditorDialog from "./SkladWarehouseItemEditorDialog";
import SkladProductionCategoryManagerDialog from "../production/SkladProductionCategoryManagerDialog";

const STATE_OPTIONS = [
  ["all", "Все"],
  ["active", "Активные"],
  ["inactive", "Неактивные"],
  ["scheduled", "Запланированные"],
  ["expired", "Период завершён"],
];

function stateOf(row) {
  if (row?.revision_status === "scheduled") return "scheduled";
  if (row?.revision_status === "expired") return "expired";
  return Number(row?.is_active ?? row?.is_show) === 1 ? "active" : "inactive";
}

function StatusChip({ row }) {
  const state = stateOf(row);
  const config = {
    active: ["Активен", "success"],
    inactive: ["Неактивен", "default"],
    scheduled: ["Запланирован", "info"],
    expired: ["Период завершён", "warning"],
  }[state];
  return (
    <Chip
      size="small"
      label={config[0]}
      color={config[1]}
      variant={state === "inactive" ? "outlined" : "filled"}
    />
  );
}

export default function SkladWarehouseItemsTab({ showAlert, refreshToken }) {
  const api = useSkladApi();
  const {
    access,
    canCreateWarehouseItem,
    canManageWarehouseItems,
    canUseWarehouseItemPastDate,
    canDelete,
  } = useSkladAccess();
  const categories = useSkladStore((state) => state.categories);
  const setShellState = useSkladStore((state) => state.setState);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [editor, setEditor] = useState({ open: false, detail: null, loading: false });
  const [remove, setRemove] = useState({ open: false, row: null, loading: false });
  const [categoryManager, setCategoryManager] = useState({
    open: false,
    loading: false,
    categories: [],
  });

  const warehouseCategories = useMemo(
    () =>
      (categories || []).filter(
        (row) =>
          row?.source_type === "warehouse_item" && !row?.is_group && Number(row?.is_archived) !== 1,
      ),
    [categories],
  );

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });
    try {
      const response = await api.getWarehouseItems({
        search: search.trim(),
        category_key: categoryKey || null,
      });
      if (!response?.st) throw new Error(response?.text || "Ошибка загрузки товаров склада");
      setRows(Array.isArray(response?.list) ? response.list : []);
      setPage(0);
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки товаров склада", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, categoryKey, search, setShellState, showAlert]);

  const loadRowsRef = useRef(loadRows);

  useEffect(() => {
    loadRowsRef.current = loadRows;
  }, [loadRows]);

  useEffect(() => {
    const timer = setTimeout(() => loadRowsRef.current(), 250);
    return () => clearTimeout(timer);
  }, [categoryKey, refreshToken, search]);

  const filteredRows = useMemo(
    () => rows.filter((row) => stateFilter === "all" || stateOf(row) === stateFilter),
    [rows, stateFilter],
  );
  const visibleRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openEditor = async (row = null, history = false) => {
    setEditor({ open: true, detail: null, loading: true });
    setShellState({ isLoading: true });
    try {
      const response = row
        ? await api.getWarehouseItem(row.id)
        : await api.getWarehouseItemBootstrap();
      if (!response?.st) throw new Error(response?.text || "Ошибка загрузки карточки товара");
      setEditor({
        open: true,
        detail: { ...response, initialHistoryTab: history },
        loading: false,
      });
    } catch (error) {
      setEditor({ open: false, detail: null, loading: false });
      showAlert(error?.message || "Ошибка загрузки карточки товара", false);
    } finally {
      setShellState({ isLoading: false });
    }
  };

  const save = async (draft) => {
    setEditor((current) => ({ ...current, loading: true }));
    setShellState({ isLoading: true });
    try {
      const response = draft?.id
        ? await api.updateWarehouseItem(draft)
        : await api.createWarehouseItem(draft);
      if (!response?.st) throw new Error(response?.text || "Ошибка сохранения товара склада");
      showAlert(response?.text || "Товар склада сохранён", true);
      setEditor({ open: false, detail: null, loading: false });
      await loadRows();
    } catch (error) {
      setEditor((current) => ({ ...current, loading: false }));
      showAlert(error?.message || "Ошибка сохранения товара склада", false);
    } finally {
      setShellState({ isLoading: false });
    }
  };

  const confirmDelete = async () => {
    setRemove((current) => ({ ...current, loading: true }));
    try {
      const response = await api.deleteWarehouseItem(remove.row.id);
      if (!response?.st)
        throw new Error(response?.text || "Товар используется и не может быть удалён");
      showAlert(response?.text || "Товар склада удалён", true);
      setRemove({ open: false, row: null, loading: false });
      await loadRows();
    } catch (error) {
      setRemove((current) => ({ ...current, loading: false }));
      showAlert(error?.message || "Ошибка удаления товара", false);
    }
  };

  const refreshCategories = async () => {
    const response = await api.getCategories();
    if (!response?.st) throw new Error(response?.text || "Ошибка загрузки категорий");
    const next = Array.isArray(response?.list) ? response.list : [];
    setShellState({ categories: next });
    setCategoryManager({ open: true, loading: false, categories: next });
  };

  const openCategoryManager = async () => {
    setCategoryManager({ open: true, loading: true, categories: [] });
    try {
      await refreshCategories();
    } catch (error) {
      setCategoryManager({ open: false, loading: false, categories: [] });
      showAlert(error?.message || "Ошибка загрузки категорий", false);
    }
  };

  const mutateCategory = async (operation, successText) => {
    setCategoryManager((current) => ({ ...current, loading: true }));
    try {
      const response = await operation();
      if (!response?.st) throw new Error(response?.text || "Ошибка сохранения категории");
      await refreshCategories();
      await loadRows();
      showAlert(response?.text || successText, true);
      return true;
    } catch (error) {
      setCategoryManager((current) => ({ ...current, loading: false }));
      showAlert(error?.message || "Ошибка сохранения категории", false);
      return false;
    }
  };

  return (
    <>
      <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Grid
            container
            spacing={1.5}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Поиск"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  select
                  fullWidth
                  label="Категория"
                  value={categoryKey}
                  onChange={(event) => setCategoryKey(event.target.value)}
                >
                  <MenuItem value="">Все категории</MenuItem>
                  {warehouseCategories.map((row) => (
                    <MenuItem
                      key={row.category_key || row.id}
                      value={row.category_key || `warehouse_item:${row.id}`}
                    >
                      {row.parent_name ? `${row.parent_name} / ${row.name}` : row.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Tooltip title="Управление категориями">
                  <IconButton onClick={openCategoryManager}>
                    <SettingsOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                size="small"
                select
                fullWidth
                label="Показать"
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value);
                  setPage(0);
                }}
              >
                {STATE_OPTIONS.map(([value, label]) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateWarehouseItem}
                onClick={() => openEditor()}
              >
                Добавить товар
              </Button>
            </Grid>
          </Grid>

          <TableContainer sx={{ maxHeight: "55dvh", overflow: "auto" }}>
            <Table
              size="small"
              stickyHeader
              sx={{ minWidth: 1080, "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Единица</TableCell>
                  <TableCell>Действует с</TableCell>
                  <TableCell>Действует по</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Заявка</TableCell>
                  <TableCell>Ревизия</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                    <TableCell>{row.category_name || "—"}</TableCell>
                    <TableCell>{row.ed_izmer_name || "—"}</TableCell>
                    <TableCell>
                      {formatDateRU(row.effective_date_start || row.date_start) || "—"}
                    </TableCell>
                    <TableCell>
                      {formatDateRU(row.effective_date_end || row.date_end) || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusChip row={row} />
                    </TableCell>
                    <TableCell>{Number(row.show_in_order) ? "Да" : "Нет"}</TableCell>
                    <TableCell>{Number(row.show_in_rev) ? "Да" : "Нет"}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="Редактировать">
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canManageWarehouseItems}
                              onClick={() => openEditor(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="История">
                          <IconButton
                            size="small"
                            onClick={() => openEditor(row, true)}
                          >
                            <HistoryOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!canDelete("item") || row?.delete_state === "blocked"}
                              onClick={() => setRemove({ open: true, row, loading: false })}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!visibleRows.length ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography
                        align="center"
                        sx={{
                          color: "text.secondary",
                          py: 4,
                        }}
                      >
                        Товары не найдены
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, value) => setPage(value)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="Строк на странице:"
          />
        </Stack>
      </Paper>
      <SkladWarehouseItemEditorDialog
        open={editor.open}
        loading={editor.loading}
        detail={editor.detail}
        access={access}
        allowPastDate={canUseWarehouseItemPastDate}
        onClose={() => setEditor({ open: false, detail: null, loading: false })}
        onSave={save}
      />
      <SkladDeleteDialog
        open={remove.open}
        loading={remove.loading}
        title="Удалить товар склада?"
        description={remove.row?.name || ""}
        warning="Удаление возможно только при отсутствии текущих, исторических и запланированных зависимостей."
        onClose={() => setRemove({ open: false, row: null, loading: false })}
        onConfirm={confirmDelete}
      />
      <SkladProductionCategoryManagerDialog
        open={categoryManager.open}
        loading={categoryManager.loading}
        categories={categoryManager.categories}
        canCreate={false}
        canEdit={false}
        canDelete={false}
        access={access}
        onClose={() => setCategoryManager({ open: false, loading: false, categories: [] })}
        onCreate={(name, sourceType, parentId) =>
          mutateCategory(
            () => api.createCategory({ name, source_type: sourceType, parent_id: parentId }),
            "Категория создана",
          )
        }
        onSave={(category, name) =>
          mutateCategory(
            () =>
              api.updateCategory({
                id: category.id,
                name,
                source_type: category.source_type,
                parent_id: category.parent_id || 0,
              }),
            "Категория сохранена",
          )
        }
        onDelete={(category) =>
          mutateCategory(
            () => api.deleteCategory({ id: category.id, source_type: category.source_type }),
            "Категория удалена",
          )
        }
      />
    </>
  );
}
