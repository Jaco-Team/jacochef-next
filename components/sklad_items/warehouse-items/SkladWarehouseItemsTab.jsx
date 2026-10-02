"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  JacoButton,
  JacoIconButton,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
} from "@/design-system/shared/ui";

import SkladAutocomplete from "../ui/SkladAutocomplete";
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
    canViewWarehouseItemsHistory,
    canUseWarehouseItemPastDate,
    canDelete,
  } = useSkladAccess();
  const categories = useSkladStore((state) => state.categories);
  const setShellState = useSkladStore((state) => state.setState);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [groupPages, setGroupPages] = useState({});
  const [groupSizes, setGroupSizes] = useState({});
  const [expandedGroups, setExpandedGroups] = useState([]);
  const appliedFilterRef = useRef("");
  const revealFilterRef = useRef(false);
  const [editor, setEditor] = useState({ open: false, detail: null, loading: false });
  const [remove, setRemove] = useState({ open: false, row: null, loading: false });
  const [categoryManager, setCategoryManager] = useState({
    open: false,
    loading: false,
    categories: [],
  });

  const warehouseCatalog = useMemo(() => {
    const entries = (categories || []).filter((row) => row?.source_type === "warehouse_item");
    const catalog = new Map(entries.map((row) => [String(row.id), row]));
    for (const row of entries) {
      const parentId = Number(row.parent_id);
      const parentName = String(row.parent_name ?? "").trim();
      if (
        parentId > 0 &&
        parentId !== Number(row.id) &&
        parentName &&
        !catalog.has(String(parentId))
      ) {
        catalog.set(String(parentId), {
          id: parentId,
          name: parentName,
          parent_id: null,
          is_group: true,
          source_type: "warehouse_item",
        });
      }
    }
    return Array.from(catalog.values());
  }, [categories]);
  const warehouseCategories = useMemo(
    () =>
      warehouseCatalog.filter(
        (row) =>
          row?.source_type === "warehouse_item" && !row?.is_group && Number(row?.is_archived) !== 1,
      ),
    [warehouseCatalog],
  );
  const categoryOptions = useMemo(
    () => [
      { id: "", name: "Все категории" },
      ...warehouseCategories.map((row) => ({
        id: row.category_key || `warehouse_item:${row.id}`,
        name: (() => {
          const names = [row.name],
            seen = new Set([String(row.id)]);
          let parent = warehouseCatalog.find((item) => Number(item.id) === Number(row.parent_id));
          if (!parent && row.parent_name) names.unshift(row.parent_name);
          while (parent && !seen.has(String(parent.id))) {
            names.unshift(parent.name);
            seen.add(String(parent.id));
            parent = warehouseCatalog.find((item) => Number(item.id) === Number(parent.parent_id));
          }
          return names.join(" / ");
        })(),
      })),
    ],
    [warehouseCatalog, warehouseCategories],
  );

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });
    try {
      const response = await api.getWarehouseItems({
        search: search.trim(),
        category_key: categoryKey || null,
      });
      if (!response?.st) throw new Error(response?.text || "Ошибка загрузки товаров склада");
      const filter = JSON.stringify([search.trim(), categoryKey]);
      revealFilterRef.current = appliedFilterRef.current !== filter;
      appliedFilterRef.current = filter;
      setRows(Array.isArray(response?.list) ? response.list : []);
      setGroupPages({});
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
  const groupedRows = useMemo(() => {
    const catalog = new Map(warehouseCatalog.map((row) => [String(row.id), row]));
    const groups = new Map();
    const ensureGroup = (id, row = {}) => {
      const key = id === null ? "uncategorized" : `warehouse_item:${id}`;
      if (!groups.has(key)) {
        const category = id === null ? null : catalog.get(String(id));
        groups.set(key, {
          key,
          id,
          parentId: Number(category?.parent_id) || null,
          name:
            id === null
              ? "Без категории"
              : category?.name || row.category_name || `Категория №${id}`,
          items: [],
          children: [],
          count: 0,
        });
      }
      return groups.get(key);
    };
    for (const row of filteredRows) {
      const id = Number(row.category_id) || null;
      ensureGroup(id, row).items.push(row);
      const seen = new Set([String(id)]);
      let parentId = Number(catalog.get(String(id))?.parent_id);
      while (parentId > 0 && catalog.has(String(parentId)) && !seen.has(String(parentId))) {
        seen.add(String(parentId));
        ensureGroup(parentId);
        parentId = Number(catalog.get(String(parentId))?.parent_id);
      }
    }
    const roots = [];
    for (const group of groups.values()) {
      let parentId = group.parentId;
      const seen = new Set([String(group.id)]);
      let cyclic = false;
      while (parentId > 0 && catalog.has(String(parentId))) {
        if (seen.has(String(parentId))) {
          cyclic = true;
          break;
        }
        seen.add(String(parentId));
        parentId = Number(catalog.get(String(parentId))?.parent_id);
      }
      const parent = groups.get(`warehouse_item:${group.parentId}`);
      if (parent && !cyclic) parent.children.push(group);
      else roots.push(group);
    }
    const count = (group) => {
      group.count =
        group.items.length + group.children.reduce((sum, child) => sum + count(child), 0);
      return group.count;
    };
    roots.forEach(count);
    return roots.filter((group) => group.count > 0);
  }, [warehouseCatalog, filteredRows]);
  const groupKeys = useMemo(() => {
    const keys = [];
    const visit = (group) => {
      keys.push(group.key);
      group.children.forEach(visit);
    };
    groupedRows.forEach(visit);
    return keys;
  }, [groupedRows]);

  useEffect(() => {
    const keys = groupKeys;
    const reveal =
      revealFilterRef.current && (search.trim() || categoryKey || stateFilter !== "all");
    revealFilterRef.current = false;
    setExpandedGroups((current) => (reveal ? keys : current.filter((key) => keys.includes(key))));
  }, [groupKeys, rows]);

  const allExpanded =
    groupKeys.length > 0 && groupKeys.every((key) => expandedGroups.includes(key));

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

  const renderGroup = (group) => {
    const rowsPerPage = groupSizes[group.key] || 25;
    const page = Math.min(
      groupPages[group.key] || 0,
      Math.max(0, Math.ceil(group.items.length / rowsPerPage) - 1),
    );
    const visibleRows = group.items.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    return (
      <Accordion
        key={group.key}
        data-testid={`warehouse-category-${group.id ?? "none"}`}
        expanded={expandedGroups.includes(group.key)}
        onChange={(_, expanded) =>
          setExpandedGroups((current) =>
            expanded ? [...current, group.key] : current.filter((key) => key !== group.key),
          )
        }
        disableGutters
        elevation={0}
        slotProps={{ transition: { unmountOnExit: true } }}
        sx={{
          border: `1px solid ${uiColors.border}`,
          borderRadius: `${uiRadii.md} !important`,
          overflow: "hidden",
          "&::before": { display: "none" },
          "&.Mui-expanded": { m: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-label={`${group.name}. ${group.id === null ? "Без категории" : `Категория ${group.id}`}. Товаров: ${group.count}`}
          sx={{
            minHeight: 56,
            "&.Mui-expanded": { minHeight: 56 },
            "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.25, minWidth: 0 },
          }}
        >
          <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{group.name}</Typography>
          <Chip
            size="small"
            label={group.count}
            sx={{ bgcolor: uiColors.surfaceMuted, flexShrink: 0 }}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {group.items.length > 0 ? (
            <>
              <TableContainer sx={{ maxHeight: "55dvh", overflow: "auto" }}>
                <Table
                  size="small"
                  stickyHeader
                  sx={{ minWidth: 960, "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
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
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Редактировать">
                              <span>
                                <JacoIconButton
                                  disabled={!canManageWarehouseItems}
                                  onClick={() => openEditor(row)}
                                >
                                  <EditIcon fontSize="small" />
                                </JacoIconButton>
                              </span>
                            </Tooltip>
                            {canViewWarehouseItemsHistory ? (
                              <Tooltip title="История">
                                <JacoIconButton onClick={() => openEditor(row, true)}>
                                  <HistoryOutlinedIcon fontSize="small" />
                                </JacoIconButton>
                              </Tooltip>
                            ) : null}
                            <Tooltip title="Удалить">
                              <span>
                                <JacoIconButton
                                  sx={{ color: "error.main" }}
                                  disabled={!canDelete("item") || row?.delete_state === "blocked"}
                                  onClick={() => setRemove({ open: true, row, loading: false })}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </JacoIconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={group.items.length}
                page={page}
                onPageChange={(_, value) =>
                  setGroupPages((current) => ({ ...current, [group.key]: value }))
                }
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setGroupSizes((current) => ({
                    ...current,
                    [group.key]: Number(event.target.value),
                  }));
                  setGroupPages((current) => ({ ...current, [group.key]: 0 }));
                }}
                rowsPerPageOptions={[25, 50, 100]}
                labelRowsPerPage="Строк на странице:"
                sx={{
                  "& .MuiTablePagination-toolbar": { flexWrap: "wrap", px: 1 },
                  "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
                }}
              />
            </>
          ) : null}
          {group.children.length ? (
            <Stack
              spacing={1.25}
              sx={{ p: { xs: 1, sm: 1.5 }, pt: group.items.length ? 1.5 : 0 }}
            >
              {group.children.map(renderGroup)}
            </Stack>
          ) : null}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <JacoSurface sx={{ p: { xs: 1.5, md: 2 }, minWidth: 0 }}>
        <Stack spacing={2}>
          <Grid
            container
            spacing={1.5}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <JacoTextInput
                label="Поиск"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
              >
                <SkladAutocomplete
                  label="Категория"
                  value={categoryOptions.find((option) => option.id === categoryKey) || null}
                  onChange={(_, option) => setCategoryKey(option?.id || "")}
                  options={categoryOptions}
                  getOptionLabel={(option) => option.name}
                  getOptionKey={(option) => option.id}
                  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                  freeSolo={false}
                  autocompleteSx={{ flex: 1, minWidth: 0 }}
                />
                <Tooltip title="Управление категориями">
                  <JacoIconButton onClick={openCategoryManager}>
                    <SettingsOutlinedIcon />
                  </JacoIconButton>
                </Tooltip>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <JacoSelect
                label="Показать"
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value);
                  revealFilterRef.current = true;
                  setGroupPages({});
                }}
                allowNone={false}
                options={STATE_OPTIONS.map(([id, name]) => ({ id, name }))}
              />
            </Grid>
            <Grid size={12}>
              <JacoButton
                startIcon={<AddIcon />}
                disabled={!canCreateWarehouseItem}
                onClick={() => openEditor()}
              >
                Добавить товар
              </JacoButton>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Typography color="text.secondary">
              {new Set(filteredRows.map((row) => Number(row.category_id) || null)).size} категорий ·{" "}
              {filteredRows.length} товаров
            </Typography>
            <JacoButton
              compact
              tone="secondary"
              disabled={!groupedRows.length}
              startIcon={allExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
              onClick={() => setExpandedGroups(allExpanded ? [] : groupKeys)}
            >
              {allExpanded ? "Свернуть все" : "Развернуть все"}
            </JacoButton>
          </Stack>
          {groupedRows.map(renderGroup)}
          {!groupedRows.length ? (
            <Typography
              color="text.secondary"
              align="center"
              sx={{ py: 4 }}
            >
              Товары не найдены
            </Typography>
          ) : null}
        </Stack>
      </JacoSurface>

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
