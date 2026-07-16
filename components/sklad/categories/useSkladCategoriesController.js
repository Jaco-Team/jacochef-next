"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Alert,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { useConfirm } from "@/src/hooks/useConfirm";
import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import SkladCategoryDialog from "./SkladCategoryDialog";
import {
  CATEGORY_ARCHIVE_MODE_OPTIONS,
  CATEGORY_SOURCE_OPTIONS,
  getDefaultCategoryDraft,
  useSkladCategoriesStore,
} from "./useSkladCategoriesStore";

function normalizeNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategoryDraft(draft) {
  const sourceType = draft?.source_type || "semi_finished";
  const parentId =
    draft?.parent_id === "" || draft?.parent_id === null
      ? null
      : normalizeNumber(draft?.parent_id, null);

  return {
    id: draft?.id ?? null,
    category_key: draft?.category_key || "",
    name: String(draft?.name || "").trim(),
    source_type: sourceType,
    parent_id: sourceType === "warehouse_item" ? parentId : null,
  };
}

function buildCategorySavePayload(draft) {
  const normalizedDraft = normalizeCategoryDraft(draft);
  const payload = {
    source_type: normalizedDraft.source_type,
    name: normalizedDraft.name,
  };

  if (normalizedDraft.source_type === "warehouse_item") {
    payload.parent_id = normalizedDraft.parent_id;
  }

  return payload;
}

function getCategorySourceMeta(sourceType) {
  if (sourceType === "warehouse_item") {
    return {
      label: "Склад",
      icon: <Inventory2OutlinedIcon fontSize="small" />,
    };
  }

  return {
    label: "Полуфабрикаты и рецепты",
    icon: <FolderOutlinedIcon fontSize="small" />,
  };
}

function getDeleteHint(row) {
  const activeCount = row?.delete_usage?.active_relations?.length || 0;
  const historyCount = row?.delete_usage?.history_relations?.length || 0;
  const parts = [];

  if (activeCount) {
    parts.push(`активные связи: ${activeCount}`);
  }

  if (historyCount) {
    parts.push(`история: ${historyCount}`);
  }

  return parts.length ? `Удаление заблокировано, ${parts.join(", ")}` : "Удаление заблокировано";
}

export default function useSkladCategoriesController({ showAlert }) {
  const api = useSkladApi();
  const { canEdit } = useSkladAccess();
  const { ConfirmDialog, withConfirm } = useConfirm();

  const setShellState = useSkladStore((state) => state.setState);
  const rows = useSkladCategoriesStore((state) => state.rows);
  const search = useSkladCategoriesStore((state) => state.search);
  const archiveMode = useSkladCategoriesStore((state) => state.archiveMode);
  const modal = useSkladCategoriesStore((state) => state.modal);
  const draft = useSkladCategoriesStore((state) => state.draft);
  const setState = useSkladCategoriesStore((state) => state.setState);
  const setDraft = useSkladCategoriesStore((state) => state.setDraft);
  const resetDraft = useSkladCategoriesStore((state) => state.resetDraft);

  const isEditable = canEdit("categories");

  const loadCategories = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.getCategories({
        search: "",
        archive_mode: archiveMode,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки категорий");
      }

      const list = response?.list || [];

      setState({ rows: list });
      setShellState({ categories: list });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки категорий", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, archiveMode, setShellState, setState, showAlert]);

  const openCreate = useCallback(() => {
    setState({
      draft: getDefaultCategoryDraft(),
      modal: {
        open: true,
        mode: "create",
      },
    });
  }, [setState]);

  const openEdit = useCallback(
    (row) => {
      setState({
        draft: {
          id: row?.id ?? null,
          category_key: row?.category_key || "",
          name: row?.name || "",
          source_type: row?.source_type || "semi_finished",
          parent_id: row?.parent_id ?? "",
          parent_name: row?.parent_name || "",
        },
        modal: {
          open: true,
          mode: "edit",
        },
      });
    },
    [setState],
  );

  const closeModal = useCallback(() => {
    resetDraft();
  }, [resetDraft]);

  const saveCategory = useCallback(async () => {
    const normalizedDraft = normalizeCategoryDraft(draft);

    if (!normalizedDraft.name) {
      showAlert("Заполните название категории", false);
      return;
    }

    if (
      normalizedDraft.source_type === "warehouse_item" &&
      modal.mode === "create" &&
      !normalizedDraft.parent_id
    ) {
      showAlert("Для складской категории выберите родительскую категорию", false);
      return;
    }

    setShellState({ isLoading: true });

    try {
      const payload = buildCategorySavePayload(normalizedDraft);
      const response =
        modal.mode === "edit"
          ? await api.updateCategory({ id: normalizedDraft.id, ...payload })
          : await api.createCategory(payload);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка сохранения категории");
      }

      closeModal();
      showAlert("Категория сохранена", true);
      await loadCategories();
    } catch (error) {
      showAlert(error?.message || "Ошибка сохранения категории", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, closeModal, draft, loadCategories, modal.mode, setShellState, showAlert]);

  const deleteCategory = useCallback(
    async (row) => {
      if (!row?.id) {
        return;
      }

      setShellState({ isLoading: true });

      try {
        const response = await api.deleteCategory(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка удаления категории");
        }

        showAlert("Категория удалена", true);
        await loadCategories();
      } catch (error) {
        showAlert(error?.message || "Ошибка удаления категории", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, loadCategories, setShellState, showAlert],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [row?.name, row?.parent_name, row?.source_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      const sourceCompare = String(left?.source_type || "").localeCompare(
        String(right?.source_type || ""),
        "ru",
      );

      if (sourceCompare !== 0) {
        return sourceCompare;
      }

      const leftParent = left?.parent_name || left?.name || "";
      const rightParent = right?.parent_name || right?.name || "";
      const parentCompare = leftParent.localeCompare(rightParent, "ru");

      if (parentCompare !== 0) {
        return parentCompare;
      }

      return String(left?.name || "").localeCompare(String(right?.name || ""), "ru");
    });
  }, [filteredRows]);

  const warehouseRootOptions = useMemo(() => {
    return rows
      .filter((row) => row?.source_type === "warehouse_item" && !row?.parent_id)
      .map((row) => ({
        id: String(row.id),
        name: row.name,
      }));
  }, [rows]);

  const parentOptions = useMemo(() => {
    const normalizedDraft = normalizeCategoryDraft(draft);

    if (normalizedDraft.source_type !== "warehouse_item") {
      return [
        { id: "", name: modal.mode === "edit" ? "Корневая категория" : "Выберите категорию" },
      ];
    }

    return warehouseRootOptions.filter(
      (option) => Number(option.id) !== Number(normalizedDraft.id),
    );
  }, [draft, warehouseRootOptions]);

  const isParentDisabled = draft?.source_type !== "warehouse_item";
  const isSaveDisabled =
    !String(draft?.name || "").trim() ||
    (draft?.source_type === "warehouse_item" && modal.mode === "create" && !draft?.parent_id);

  const content = (
    <>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <MyTextInput
                label="Поиск"
                value={search}
                func={(event) => setState({ search: event.target.value })}
              />

              <MySelect
                label="Показать"
                data={CATEGORY_ARCHIVE_MODE_OPTIONS}
                is_none={false}
                value={archiveMode}
                func={(event) => setState({ archiveMode: event.target.value })}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent={{ xs: "flex-start", lg: "flex-end" }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                disabled={!isEditable}
              >
                Новая категория
              </Button>
            </Stack>
          </Stack>

          <Alert
            severity="info"
            sx={{ borderRadius: 2 }}
          >
            Категории рецептов входят в семейство полуфабрикатов. Отдельной recipe-category сущности
            в новом модуле нет.
          </Alert>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Категория</TableCell>
                  <TableCell>Семейство</TableCell>
                  <TableCell>Родитель</TableCell>
                  <TableCell align="center">Использование</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedRows.map((row) => {
                  const sourceMeta = getCategorySourceMeta(row?.source_type);
                  const canDelete = Boolean(row?.delete_usage?.can_delete);
                  const usageCount = row?.total_usage_count ?? 0;

                  return (
                    <TableRow
                      key={row?.category_key || row?.id}
                      hover
                    >
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                          {row?.is_archived ? (
                            <Chip
                              label="Архив"
                              size="small"
                              color="default"
                            />
                          ) : null}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={sourceMeta.icon}
                          label={sourceMeta.label}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>{row?.parent_name || "-"}</TableCell>
                      <TableCell align="center">{usageCount}</TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title={isEditable ? "Редактировать" : "Недостаточно прав"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => openEdit(row)}
                                disabled={!isEditable}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {canDelete ? (
                            <Tooltip title={isEditable ? "Удалить" : "Недостаточно прав"}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    withConfirm({
                                      title: "Удалить категорию?",
                                      text: `Категория «${row?.name || ""}» будет удалена без возможности восстановления.`,
                                      onConfirm: () => deleteCategory(row),
                                    })
                                  }
                                  disabled={!isEditable}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title={getDeleteHint(row)}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {sortedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        Категории не найдены. Измените поиск или режим показа.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      <SkladCategoryDialog
        open={modal.open}
        mode={modal.mode}
        draft={draft}
        sourceOptions={CATEGORY_SOURCE_OPTIONS}
        parentOptions={parentOptions}
        isParentDisabled={isParentDisabled}
        isSaveDisabled={isSaveDisabled}
        onClose={closeModal}
        onFieldChange={(field, value) => {
          if (field === "source_type") {
            setDraft({
              source_type: value,
              parent_id: "",
            });
            return;
          }

          setDraft({ [field]: value });
        }}
        onSave={saveCategory}
      />

      <ConfirmDialog />
    </>
  );

  return {
    loadCategories,
    content,
  };
}
