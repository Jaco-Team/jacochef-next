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
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { MyTextInput } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";
import SkladDeleteDialog from "../SkladDeleteDialog";

function categoryUsageLabel(category) {
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
}) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(null);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setName("");
      setNewCategoryName("");
      setDeleteCategory(null);
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

    const created = await onCreate(normalizedName);
    if (created !== false) {
      setNewCategoryName("");
    }
  };

  return (
    <>
      <MyModal
        open={open}
        onClose={loading ? undefined : onClose}
        title="Категории рецептов и полуфабрикатов"
        maxWidth="md"
      >
        <DialogContent>
          <Stack spacing={1.25}>
            {canCreate ? (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: "stretch", sm: "center" },
                  }}
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
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={create}
                    disabled={loading || !newCategoryName.trim()}
                    sx={{ flexShrink: 0 }}
                  >
                    Добавить
                  </Button>
                </Stack>
              </Paper>
            ) : null}

            {categories.map((category) => {
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
                    sx={{
                      alignItems: { xs: "stretch", sm: "center" },
                    }}
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
                            sx={{
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              noWrap
                              sx={{
                                fontWeight: 600,
                              }}
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
                            sx={{
                              color: "text.secondary",
                            }}
                          >
                            {categoryUsageLabel(category)}
                          </Typography>
                        </>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        justifyContent: "flex-end",
                      }}
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
                          {canEdit ? (
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
                          {canDelete ? (
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

            {!loading && !categories.length ? (
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Категории не найдены.
              </Typography>
            ) : null}

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
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
