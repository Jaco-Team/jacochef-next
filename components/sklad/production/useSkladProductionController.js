"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import SkladDeleteDialog from "../SkladDeleteDialog";
import { useSkladStore } from "../useSkladStore";
import { useSkladHistoryStore, HISTORY_INITIAL_STATE } from "../history/useSkladHistoryStore";
import { getVisibleSkladTabs } from "../skladTabs";
import SkladProductionConvertDialog from "./SkladProductionConvertDialog";
import SkladProductionEditorDialog from "./SkladProductionEditorDialog";
import SkladProductionViewDialog from "./SkladProductionViewDialog";
import {
  PRODUCTION_ARCHIVE_MODE_OPTIONS,
  PRODUCTION_ENTITY_OPTIONS,
  useSkladProductionStore,
} from "./useSkladProductionStore";

function getEntityAccessKey(entityType) {
  return entityType === "recipe" ? "recipes" : "semi_finished";
}

function getEntityLabel(entityType) {
  return entityType === "recipe" ? "Рецепт" : "Полуфабрикат";
}

function getEntityFlagApi(api, entityType) {
  return entityType === "recipe" ? api.saveRecipeFlag : api.saveSemiFinishedFlag;
}

function getEntitySaveApi(api, entityType, mode) {
  if (entityType === "recipe") {
    return mode === "create" ? api.createRecipe : api.updateRecipe;
  }

  return mode === "create" ? api.createSemiFinished : api.updateSemiFinished;
}

function getProductionVisibleState(row) {
  return Number(row?.is_show ?? 0) === 1;
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

function getDeleteError(response) {
  const usage = response?.usage ?? {};
  const activeCount = Array.isArray(usage?.active_relations) ? usage.active_relations.length : 0;
  const historyCount = Array.isArray(usage?.history_relations) ? usage.history_relations.length : 0;
  const counts = [];

  if (activeCount) {
    counts.push(`активные связи: ${activeCount}`);
  }

  if (historyCount) {
    counts.push(`история: ${historyCount}`);
  }

  return counts.length
    ? `${response?.text || "Удаление запрещено"} (${counts.join(", ")})`
    : response?.text || "Удаление запрещено";
}

function formatCategories(categories) {
  if (!Array.isArray(categories) || !categories.length) {
    return "-";
  }

  const names = categories.map((item) => item?.name ?? "").filter(Boolean);

  return names.length ? names.join(", ") : "-";
}

function formatDateRangeCell(row) {
  if (!row?.date_start && !row?.date_end) {
    return "—";
  }

  return `${row?.date_start || "—"} - ${row?.date_end || "—"}`;
}

function getStatusChips(row) {
  const chips = [];

  if (Number(row?.is_archived) === 1) {
    chips.push({ key: "archived", label: "Архив", color: "default" });
  }

  if (getProductionVisibleState(row)) {
    chips.push({ key: "active", label: "Активен", color: "success" });
  }

  if (Number(row?.show_in_rev) === 1) {
    chips.push({ key: "show_in_rev", label: "В ревизии", color: "primary" });
  }

  if (Number(row?.two_user) === 1) {
    chips.push({ key: "two_user", label: "2 сотрудника", color: "secondary" });
  }

  return chips;
}

function getRowKey(entityType, row, index) {
  return [
    entityType,
    row?.id ?? "no-id",
    row?.date_start ?? "no-start",
    row?.date_end ?? "no-end",
    index,
  ].join("-");
}

function createEmptyProductionDraft() {
  return {
    id: null,
    name: "",
    shelf_life: "",
    date_start: "",
    date_end: "",
    ed_izmer_id: "",
    structure: "",
    show_in_rev: 0,
    two_user: 0,
    is_active: 1,
    is_archived: 0,
    categories: [],
    items: [],
    allergens: [],
    allergens_possible: [],
    allergens_derived: [],
    allergens_possible_derived: [],
    storages: [],
    apps: [],
    units: [],
  };
}

function normalizeProductionSavePayload(draft) {
  return {
    id: draft?.id ?? null,
    name: String(draft?.name || "").trim(),
    shelf_life: draft?.shelf_life ?? "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    ed_izmer_id: draft?.ed_izmer_id ? Number(draft.ed_izmer_id) : null,
    structure: draft?.structure ?? "",
    show_in_rev: draft?.show_in_rev ? 1 : 0,
    two_user: draft?.two_user ? 1 : 0,
    allergens: Array.isArray(draft?.allergens) ? draft.allergens : [],
    allergens_possible: Array.isArray(draft?.allergens_possible) ? draft.allergens_possible : [],
    categories: Array.isArray(draft?.categories) ? draft.categories : [],
    storages: Array.isArray(draft?.storages) ? draft.storages : [],
    apps: Array.isArray(draft?.apps) ? draft.apps : [],
    items: Array.isArray(draft?.items) ? draft.items : [],
  };
}

function validateProductionDraft(draft) {
  if (!String(draft?.name || "").trim()) {
    return "Название обязательно";
  }

  if (!String(draft?.date_start || "").trim()) {
    return "Дата начала обязательна";
  }

  if (draft?.date_end && draft?.date_start && String(draft.date_end) < String(draft.date_start)) {
    return "Дата окончания не может быть раньше даты начала";
  }

  return null;
}

export default function useSkladProductionController({ showAlert }) {
  const api = useSkladApi();
  const { canEdit, canExecute } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const shellSections = useSkladStore((state) => state.sections);
  const shellAccess = useSkladStore((state) => state.access);
  const categories = useSkladStore((state) => state.categories);
  const setHistoryState = useSkladHistoryStore((state) => state.setState);

  const entityType = useSkladProductionStore((state) => state.entityType);
  const rows = useSkladProductionStore((state) => state.rows);
  const search = useSkladProductionStore((state) => state.search);
  const categoryId = useSkladProductionStore((state) => state.categoryId);
  const archiveMode = useSkladProductionStore((state) => state.archiveMode);
  const modal = useSkladProductionStore((state) => state.modal);
  const detail = useSkladProductionStore((state) => state.detail);
  const draft = useSkladProductionStore((state) => state.draft);
  const archiveDialog = useSkladProductionStore((state) => state.archiveDialog);
  const deleteDialog = useSkladProductionStore((state) => state.deleteDialog);
  const setState = useSkladProductionStore((state) => state.setState);

  const accessKey = getEntityAccessKey(entityType);
  const canCreateOrEdit = canEdit(accessKey);
  const canConvert = canExecute("recipes") || canExecute("semi_finished");

  const categoryOptions = useMemo(() => {
    const sourceAwareCategories = (categories || []).filter(
      (item) => item?.source_type === "semi_finished" && Number(item?.is_archived) !== 1,
    );

    return [{ id: "", name: "Все категории" }].concat(
      sourceAwareCategories.map((item) => ({
        id: String(item.id),
        name: item.name,
      })),
    );
  }, [categories]);

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const payload = {
        search: String(search || "").trim(),
        category_id: categoryId ? Number(categoryId) : null,
        archive_mode: archiveMode,
      };

      const response =
        entityType === "recipe"
          ? await api.getRecipes(payload)
          : await api.getSemiFinished(payload);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки списка");
      }

      setState({ rows: Array.isArray(response?.list) ? response.list : [] });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки списка", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, archiveMode, categoryId, entityType, search, setShellState, setState, showAlert]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((left, right) =>
      String(left?.name || "").localeCompare(String(right?.name || ""), "ru"),
    );
  }, [rows]);

  const openHistoryTab = useCallback(
    (row) => {
      if (!row?.id) {
        showAlert("Не удалось определить сущность для открытия истории", false);
        return;
      }

      const visibleTabs = getVisibleSkladTabs({
        sections: shellSections,
        access: shellAccess,
      });
      const historyTabIndex = visibleTabs.findIndex((item) => item.key === "history");

      if (historyTabIndex === -1) {
        showAlert("Вкладка истории недоступна по текущим section/access", false);
        return;
      }

      setHistoryState({
        entityType,
        entityId: String(row.id),
        ...HISTORY_INITIAL_STATE,
      });
      setShellState({ tab: historyTabIndex });
    },
    [entityType, setHistoryState, setShellState, shellAccess, shellSections, showAlert],
  );

  const closeModal = useCallback(() => {
    setState({
      modal: {
        open: false,
        mode: "view",
        loading: false,
        tab: "main",
      },
      detail: null,
      draft: null,
    });
  }, [setState]);

  const closeDeleteDialog = useCallback(() => {
    setState({
      deleteDialog: {
        open: false,
        loading: false,
        row: null,
      },
    });
  }, [setState]);

  const closeArchiveDialog = useCallback(() => {
    setState({
      archiveDialog: {
        open: false,
        loading: false,
        row: null,
      },
    });
  }, [setState]);

  const openArchiveDialog = useCallback(
    (row) => {
      if (!row?.id) {
        return;
      }

      setState({
        archiveDialog: {
          open: true,
          loading: false,
          row,
        },
      });
    },
    [setState],
  );

  const openDeleteDialog = useCallback(
    (row) => {
      if (!row?.id) {
        return;
      }

      setState({
        deleteDialog: {
          open: true,
          loading: false,
          row,
        },
      });
    },
    [setState],
  );

  const confirmDelete = useCallback(async () => {
    const row = deleteDialog?.row;

    if (!row?.id) {
      return;
    }

    setState({
      deleteDialog: {
        open: true,
        loading: true,
        row,
      },
    });
    setShellState({ isLoading: true });

    try {
      const response = await api.deleteEntity({
        data: {
          entity_type: entityType,
          id: row.id,
        },
      });

      if (!response?.st) {
        throw new Error(getDeleteError(response));
      }

      closeDeleteDialog();
      showAlert(response?.text || "Успешное удаление", true);
      await loadRows();
    } catch (error) {
      setState({
        deleteDialog: {
          open: true,
          loading: false,
          row,
        },
      });
      showAlert(error?.message || "Ошибка удаления", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    api,
    closeDeleteDialog,
    deleteDialog?.row,
    entityType,
    loadRows,
    setShellState,
    setState,
    showAlert,
  ]);

  const confirmArchive = useCallback(async () => {
    const row = archiveDialog?.row;

    if (!row?.id) {
      return;
    }

    const nextArchived = Number(row?.is_archived) === 1 ? 0 : 1;

    setState({
      archiveDialog: {
        open: true,
        loading: true,
        row,
      },
    });
    setShellState({ isLoading: true });

    try {
      const response = await api.archiveEntity({
        data: {
          entity_type: entityType,
          id: row.id,
          is_archived: nextArchived,
        },
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка изменения архива");
      }

      closeArchiveDialog();
      showAlert(response?.text || "Успешно сохранено", true);
      await loadRows();
    } catch (error) {
      setState({
        archiveDialog: {
          open: true,
          loading: false,
          row,
        },
      });
      showAlert(error?.message || "Ошибка изменения архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    api,
    archiveDialog?.row,
    closeArchiveDialog,
    entityType,
    loadRows,
    setShellState,
    setState,
    showAlert,
  ]);

  const toggleFlag = useCallback(
    async (row, type) => {
      if (!row?.id || !type) {
        return;
      }

      const currentValue =
        type === "is_show"
          ? getProductionVisibleState(row)
            ? 1
            : 0
          : Number(row?.[type] ?? 0) === 1
            ? 1
            : 0;
      const nextValue = currentValue === 1 ? 0 : 1;
      const saveFlag = getEntityFlagApi(api, entityType);

      setShellState({ isLoading: true });

      try {
        const response = await saveFlag({
          data: {
            id: row.id,
            type,
            value: nextValue,
          },
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка изменения флага");
        }

        showAlert(response?.text || "Успешно сохранено", true);
        await loadRows();
      } catch (error) {
        showAlert(error?.message || "Ошибка изменения флага", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, entityType, loadRows, setShellState, showAlert],
  );

  const openCreate = useCallback(() => {
    setState({
      modal: {
        open: true,
        mode: "create",
        loading: false,
        tab: "main",
      },
      detail: null,
      draft: {
        ...createEmptyProductionDraft(),
        units: [],
      },
    });
  }, [setState]);

  const submitDraft = useCallback(
    async (nextDraft) => {
      const validationError = validateProductionDraft(nextDraft);

      if (validationError) {
        showAlert(validationError, false);
        return;
      }

      const saveMode = modal.mode === "create" ? "create" : "edit";
      const saveEntity = getEntitySaveApi(api, entityType, saveMode);
      const payload = normalizeProductionSavePayload(nextDraft);

      setState({
        modal: {
          ...modal,
          loading: true,
        },
        draft: nextDraft,
      });
      setShellState({ isLoading: true });

      try {
        const response = await saveEntity({
          data: payload,
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка сохранения");
        }

        showAlert(response?.text || "Успешно сохранено", true);
        closeModal();
        await loadRows();
      } catch (error) {
        setState({
          modal: {
            ...modal,
            loading: false,
          },
          draft: nextDraft,
        });
        showAlert(error?.message || "Ошибка сохранения", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, closeModal, entityType, loadRows, modal, setShellState, setState, showAlert],
  );

  const loadEntityDetail = useCallback(
    async (row) => {
      if (!row?.id) {
        return null;
      }

      const response =
        entityType === "recipe"
          ? await api.getRecipe(row.id)
          : await api.getSemiFinishedOne(row.id);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки карточки");
      }

      const entity = response?.entity || {};
      const units = Array.isArray(response?.units) ? response.units : [];

      return {
        ...entity,
        unit_name:
          units.find((item) => String(item?.id) === String(entity?.ed_izmer_id))?.name ?? "",
        units,
        categories: Array.isArray(entity?.categories) ? entity.categories : [],
        allergens: Array.isArray(entity?.allergens) ? entity.allergens : [],
        allergens_possible: Array.isArray(entity?.allergens_possible)
          ? entity.allergens_possible
          : [],
        allergens_derived: Array.isArray(entity?.allergens_derived) ? entity.allergens_derived : [],
        allergens_possible_derived: Array.isArray(entity?.allergens_possible_derived)
          ? entity.allergens_possible_derived
          : [],
        storages: Array.isArray(entity?.storages) ? entity.storages : [],
        apps: Array.isArray(entity?.apps) ? entity.apps : [],
        items: Array.isArray(entity?.items) ? entity.items : [],
      };
    },
    [api, entityType],
  );

  const openView = useCallback(
    async (row, tab = "main") => {
      setState({
        modal: {
          open: true,
          mode: "view",
          loading: true,
          tab,
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "view",
            loading: false,
            tab,
          },
          detail: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const openEdit = useCallback(
    async (row) => {
      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: true,
          tab: "main",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "edit",
            loading: false,
            tab: "main",
          },
          detail: entity,
          draft: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const openConvert = useCallback(
    async (row) => {
      setState({
        modal: {
          open: true,
          mode: "convert",
          loading: true,
          tab: "main",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "convert",
            loading: false,
            tab: "main",
          },
          detail: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки для конвертации", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            value={entityType}
            onChange={(_, value) => {
              if (!value) {
                return;
              }

              setState({
                entityType: value,
                rows: [],
                categoryId: "",
              });
            }}
            size="small"
            color="primary"
            sx={{ alignSelf: "flex-start", flexWrap: "wrap" }}
          >
            {PRODUCTION_ENTITY_OPTIONS.map((option) => (
              <ToggleButton
                key={option.id}
                value={option.id}
              >
                {option.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", xl: "center" }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <MyTextInput
                label="Поиск"
                placeholder={`Название ${getEntityLabel(entityType).toLowerCase()}а`}
                value={search}
                func={(event) => setState({ search: event.target.value })}
              />

              <MySelect
                label="Категория"
                data={categoryOptions}
                is_none={false}
                value={categoryId}
                func={(event) => setState({ categoryId: event.target.value })}
              />

              <MySelect
                label="Показать"
                data={PRODUCTION_ARCHIVE_MODE_OPTIONS}
                is_none={false}
                value={archiveMode}
                func={(event) => setState({ archiveMode: event.target.value })}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent={{ xs: "flex-start", xl: "flex-end" }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateOrEdit}
                onClick={openCreate}
              >
                Добавить {getEntityLabel(entityType).toLowerCase()}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3 }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            divider={
              <Divider
                flexItem
                orientation="vertical"
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            <Stack
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Текущий тип
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{getEntityLabel(entityType)}</Typography>
            </Stack>
            <Stack
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Найдено позиций
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{sortedRows.length}</Typography>
            </Stack>
            <Stack
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Доступные действия
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {canCreateOrEdit ? "Просмотр, создание, редактирование" : "Просмотр"}
              </Typography>
            </Stack>
            <Stack
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                История и конвертация
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {canConvert ? "История и сценарий конвертации доступны" : "История доступна"}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <TableContainer>
          <Table
            size="small"
            stickyHeader
            sx={{
              "& th": {
                whiteSpace: "nowrap",
                fontWeight: 700,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Категории</TableCell>
                <TableCell>Срок годности</TableCell>
                <TableCell sx={{ width: 220 }}>Действует</TableCell>
                <TableCell sx={{ minWidth: 260 }}>Статус</TableCell>
                <TableCell
                  align="right"
                  sx={{ width: 240 }}
                >
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRows.map((row, index) => {
                const canDelete = Boolean(row?.delete_usage?.can_delete);
                const statusChips = getStatusChips(row);

                return (
                  <TableRow
                    key={getRowKey(entityType, row, index)}
                    hover
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                    </TableCell>

                    <TableCell>{formatCategories(row?.categories)}</TableCell>
                    <TableCell>{row?.shelf_life || "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 12, lineHeight: 1.35 }}
                      >
                        {formatDateRangeCell(row)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="column"
                        spacing={1}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {statusChips.length
                            ? statusChips.map((chip) => (
                                <Chip
                                  key={chip.key}
                                  label={chip.label}
                                  size="small"
                                  color={chip.color}
                                  variant={chip.color === "default" ? "outlined" : "filled"}
                                />
                              ))
                            : "-"}
                        </Stack>
                        {canCreateOrEdit ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                          >
                            <Chip
                              size="small"
                              clickable
                              color={getProductionVisibleState(row) ? "success" : "default"}
                              label={getProductionVisibleState(row) ? "Активен" : "Скрыт"}
                              onClick={() => toggleFlag(row, "is_show")}
                            />
                            <Chip
                              size="small"
                              clickable
                              color={Number(row?.show_in_rev) === 1 ? "primary" : "default"}
                              label={Number(row?.show_in_rev) === 1 ? "В ревизии" : "Без ревизии"}
                              onClick={() => toggleFlag(row, "show_in_rev")}
                            />
                            <Chip
                              size="small"
                              clickable
                              color={Number(row?.two_user) === 1 ? "secondary" : "default"}
                              label={Number(row?.two_user) === 1 ? "2 сотрудника" : "1 сотрудник"}
                              onClick={() => toggleFlag(row, "two_user")}
                            />
                          </Stack>
                        ) : null}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Открыть карточку">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Просмотр"
                              onClick={() => openView(row, "main")}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canCreateOrEdit ? "Открыть редактор" : "Недостаточно прав"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canCreateOrEdit}
                              aria-label="Редактировать"
                              onClick={() => openEdit(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            canConvert
                              ? "Открыть staged shell конвертации"
                              : "Недостаточно прав; доступен только staged shell без выполнения"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Открыть сценарий конвертации"
                              onClick={() => openConvert(row)}
                            >
                              <SwapHorizIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть unified History tab">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Открыть историю"
                              onClick={() => openHistoryTab(row)}
                            >
                              <HistoryOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={Number(row?.is_archived) === 1 ? "Вернуть из архива" : "В архив"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canCreateOrEdit}
                              onClick={() => openArchiveDialog(row)}
                            >
                              {Number(row?.is_archived) === 1 ? (
                                <UnarchiveOutlinedIcon fontSize="small" />
                              ) : (
                                <ArchiveOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canDelete ? (
                          <Tooltip title="Удалить">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={!canCreateOrEdit}
                                onClick={() => openDeleteDialog(row)}
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
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      Ничего не найдено. Измените фильтры или режим показа.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );

  return {
    entityType,
    search,
    categoryId,
    archiveMode,
    loadRows,
    content: (
      <>
        {content}
        <SkladProductionViewDialog
          open={modal.open && modal.mode === "view"}
          loading={modal.loading}
          tab={modal.tab}
          onTabChange={(tab) =>
            setState({
              modal: {
                ...modal,
                tab,
              },
            })
          }
          detail={detail}
          entityLabel={getEntityLabel(entityType)}
          onClose={closeModal}
        />
        <SkladProductionEditorDialog
          open={modal.open && (modal.mode === "edit" || modal.mode === "create")}
          loading={modal.loading}
          mode={detail?.id ? "edit" : "create"}
          entityLabel={getEntityLabel(entityType)}
          draft={draft}
          categories={categories}
          units={draft?.units || detail?.units || []}
          isEditable={canCreateOrEdit}
          onSubmit={submitDraft}
          onClose={closeModal}
        />
        <SkladProductionConvertDialog
          open={modal.open && modal.mode === "convert"}
          detail={detail}
          entityType={entityType}
          canConvert={canConvert}
          onClose={closeModal}
        />
        <SkladDeleteDialog
          open={deleteDialog.open}
          loading={deleteDialog.loading}
          title={`Удалить ${getEntityLabel(entityType).toLowerCase()}?`}
          description={`Запись "${deleteDialog?.row?.name || ""}" будет удалена без возможности восстановления.`}
          warning="Backend повторно проверит usage relations в момент удаления и вернет причину отказа, если запись уже использовалась."
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
        <SkladDeleteDialog
          open={archiveDialog.open}
          loading={archiveDialog.loading}
          title={
            Number(archiveDialog?.row?.is_archived) === 1
              ? `Вернуть ${getEntityLabel(entityType).toLowerCase()} из архива?`
              : `Отправить ${getEntityLabel(entityType).toLowerCase()} в архив?`
          }
          description={`Запись "${archiveDialog?.row?.name || ""}" будет ${
            Number(archiveDialog?.row?.is_archived) === 1
              ? "снова показана в активных списках"
              : "убрана из активных списков"
          }.`}
          warning="Backend создаст новую history revision и изменит archive state через canonical entities/archive."
          confirmLabel={Number(archiveDialog?.row?.is_archived) === 1 ? "Вернуть" : "В архив"}
          onClose={closeArchiveDialog}
          onConfirm={confirmArchive}
        />
      </>
    ),
  };
}
