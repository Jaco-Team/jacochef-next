"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Button,
  Chip,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import SkladDeleteDialog from "../SkladDeleteDialog";

function categoryUsageLabel(category) {
  if (category?.source_type === "warehouse_item") {
    if (category?.is_group) {
      return `Группа складских категорий · Подкатегорий: ${Number(category?.delete_usage?.active?.find?.((entry) => entry?.source === "items_cat.parent_id")?.count) || 0}`;
    }

    return `${category?.parent_name || "Некорректная legacy-группа"} · Товары: ${Number(category?.warehouse_items_count) || 0}`;
  }
  const recipes = Number(category?.recipes_count) || 0;
  const semiFinished = Number(category?.semi_finished_count) || 0;

  if (!recipes && !semiFinished) {
    return "Категория не используется";
  }

  return [`Рецепты: ${recipes}`, `Полуфабрикаты: ${semiFinished}`].join(" · ");
}

export default function SkladProductionCategoryManagerDialog({
  open,
  loading = false,
  categories = [],
  canCreate = false,
  canEdit = false,
  canDelete = false,
  onClose,
  onCreate,
  onSave,
  onDelete,
  access = {},
}) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [sourceType, setSourceType] = useState("semi_finished");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setName("");
      setNewCategoryName("");
      setDeleteCategory(null);
      setSourceType("semi_finished");
      setParentId("");
    }
  }, [open]);

  const startEditing = (category) => {
    setEditingId(category.id);
    setName(category.name || "");
  };

  const stopEditing = () => {
    setEditingId(null);
    setName("");
  };

  const save = async (category) => {
    const normalizedName = name.trim();

    if (!normalizedName || normalizedName === category.name) {
      stopEditing();
      return;
    }

    const saved = await onSave(category, normalizedName);
    if (saved !== false) {
      stopEditing();
    }
  };

  const confirmDelete = async () => {
    const deleted = await onDelete(deleteCategory);
    if (deleted !== false) {
      setDeleteCategory(null);
    }
  };

  const create = async () => {
    const normalizedName = newCategoryName.trim();

    if (loading || !normalizedName) {
      return;
    }

    const created = await onCreate(normalizedName, sourceType, Number(parentId || 0));
    if (created !== false) {
      setNewCategoryName("");
    }
  };

  const visibleCategories = categories.filter((category) => category?.source_type === sourceType);
  const warehouseParents = Array.from(
    new Map(
      categories
        .filter((category) => category?.source_type === "warehouse_item" && category?.is_group)
        .map((category) => [Number(category.id), category.name]),
    ),
  );
  const canCreateSource =
    sourceType === "warehouse_item" ? Number(access?.warehouse_items_create) === 1 : canCreate;
  const canEditCategory = (category) =>
    category?.source_type === "warehouse_item"
      ? !category?.is_group && Number(access?.warehouse_items_categories_edit) === 1
      : canEdit;
  const canDeleteCategory = (category) =>
    category?.source_type === "warehouse_item"
      ? Number(access?.warehouse_items_delete) === 1
      : canDelete;

  return (
    <>
      <MyModal
        open={open}
        onClose={loading ? undefined : onClose}
        title="Категории"
        maxWidth="md"
      >
        <DialogContent>
          <Stack spacing={1.25}>
            <Tabs
              value={sourceType}
              onChange={(_, value) => setSourceType(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                value="semi_finished"
                label="Рецепты и полуфабрикаты"
              />
              <Tab
                value="warehouse_item"
                label="Товары склада"
              />
            </Tabs>
            {canCreateSource ? (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <MyTextInput
                    label="Новая категория"
                    value={newCategoryName}
                    disabled={loading}
                    func={(event) => setNewCategoryName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        create();
                      }
                    }}
                  />
                  {sourceType === "warehouse_item" ? (
                    <TextField
                      select
                      size="small"
                      label="Группа"
                      value={parentId}
                      onChange={(event) => setParentId(event.target.value)}
                      sx={{ minWidth: 220 }}
                    >
                      {warehouseParents.map(([id, label]) => (
                        <MenuItem
                          key={id}
                          value={id}
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : null}
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={create}
                    disabled={
                      loading ||
                      !newCategoryName.trim() ||
                      (sourceType === "warehouse_item" && !parentId)
                    }
                    sx={{ flexShrink: 0 }}
                  >
                    Добавить
                  </Button>
                </Stack>
              </Paper>
            ) : null}

            {visibleCategories.map((category) => {
              const isEditing = editingId === category.id;
              const isEmpty = category?.delete_state === "allowed";
              const count =
                Number(category?.total_usage_count) || Number(category?.items_count) || 0;

              return (
                <Paper
                  key={category.category_key || category.id}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Stack
                      spacing={0.25}
                      sx={{ minWidth: 0, flex: 1 }}
                    >
                      {isEditing ? (
                        <MyTextInput
                          label="Название категории"
                          value={name}
                          disabled={loading}
                          func={(event) => setName(event.target.value)}
                          autoFocus
                        />
                      ) : (
                        <>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              fontWeight={600}
                              noWrap
                            >
                              {category.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={count}
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {categoryUsageLabel(category)}
                            {category?.is_group ? " · Группа" : ""}
                            {category?.is_legacy_invalid ? " · Некорректный legacy-родитель" : ""}
                          </Typography>
                        </>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      {isEditing ? (
                        <>
                          <Tooltip title="Сохранить">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => save(category)}
                                disabled={loading || !name.trim()}
                                aria-label={`Сохранить категорию ${category.name}`}
                              >
                                <SaveOutlinedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Отмена">
                            <span>
                              <IconButton
                                onClick={stopEditing}
                                disabled={loading}
                                aria-label="Отменить переименование"
                              >
                                <CloseIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {canEditCategory(category) ? (
                            <Tooltip title="Переименовать">
                              <span>
                                <IconButton
                                  onClick={() => startEditing(category)}
                                  disabled={loading}
                                  aria-label={`Переименовать категорию ${category.name}`}
                                >
                                  <EditOutlinedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : null}
                          {canDeleteCategory(category) ? (
                            <Tooltip
                              title={
                                isEmpty
                                  ? "Удалить категорию"
                                  : "Удаление доступно только для пустой категории"
                              }
                            >
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => setDeleteCategory(category)}
                                  disabled={loading || !isEmpty}
                                  aria-label={`Удалить категорию ${category.name}`}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : null}
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}

            {!loading && !visibleCategories.length ? (
              <Typography color="text.secondary">Категории не найдены.</Typography>
            ) : null}

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Удалить можно только категорию без связанных рецептов, полуфабрикатов и записей
              истории.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            disabled={loading}
          >
            Закрыть
          </Button>
        </DialogActions>
      </MyModal>

      <SkladDeleteDialog
        open={Boolean(deleteCategory)}
        loading={loading}
        title="Удалить категорию?"
        description={`Категория «${deleteCategory?.name || ""}» будет удалена без возможности восстановления.`}
        warning="Удаление будет выполнено только если категория действительно пустая."
        onClose={() => setDeleteCategory(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
