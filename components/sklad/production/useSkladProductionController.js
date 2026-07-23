"use client";

import { useCallback, useEffect, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { MySearchInput, MySelect } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { formatDateRangeRU } from "../formatDateRangeRU";
import SkladDeleteDialog from "../SkladDeleteDialog";
import { useSkladStore } from "../useSkladStore";
import { useSkladHistoryStore, HISTORY_INITIAL_STATE } from "../history/useSkladHistoryStore";
import { getVisibleSkladTabs } from "../skladTabs";
import SkladProductionConvertDialog from "./SkladProductionConvertDialog";
import SkladProductionEditorDialog from "./SkladProductionEditorDialog";
import SkladProductionViewDialog from "./SkladProductionViewDialog";
import {
  PRODUCTION_ARCHIVE_MODE_OPTIONS,
  useSkladProductionStore,
} from "./useSkladProductionStore";

const ENTITY_TYPES = ["recipe", "semi_finished"];

function getEntityLabel(entityType) {
  return entityType === "recipe" ? "Рецепты" : "Заготовки";
}

function getEntitySingleLabel(entityType) {
  return entityType === "recipe" ? "Рецепт" : "Заготовка";
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

function getEntityLoadApi(api, entityType) {
  return entityType === "recipe" ? api.getRecipes : api.getSemiFinished;
}

function getEntityDetailApi(api, entityType) {
  return entityType === "recipe" ? api.getRecipe : api.getSemiFinishedOne;
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
  return formatDateRangeRU(row?.date_start, row?.date_end);
}

function getPrimaryStatusChip(row) {
  if (Number(row?.is_archived) === 1) {
    return { key: "archived", label: "Архив", color: "default" };
  }

  if (getProductionVisibleState(row)) {
    return { key: "active", label: "Активен", color: "success" };
  }

  return { key: "hidden", label: "Скрыт", color: "default" };
}

function getSecondaryStatusChips(row) {
  return [
    Number(row?.show_in_rev) === 1
      ? { key: "show_in_rev", label: "В ревизии", color: "primary" }
      : null,
    Number(row?.two_user) === 1
      ? { key: "two_user", label: "2 сотрудника", color: "secondary" }
      : null,
  ].filter(Boolean);
}

function getRowKey(entityType, row) {
  if (row?.id !== null && row?.id !== undefined && row?.id !== "") {
    return [entityType, row.id].join("-");
  }

  return [
    entityType,
    row?.name ?? "no-name",
    row?.date_start ?? "no-start",
    row?.date_end ?? "no-end",
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
    all_w: "",
    all_w_brutto: "",
    all_w_netto: "",
    time_min: "",
    time_min_dop: "",
    structure: "",
    show_in_rev: 0,
    two_user: 0,
    is_show: 1,
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

function normalizeRelationIds(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item) => item?.id ?? item)
    .filter((id) => id !== null && id !== undefined && id !== "")
    .map((id) => ({ id }));
}

function normalizeCompositionItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    item_id: item?.item_id ?? item?.nomenclature_id ?? item?.id ?? "",
    type_rec: item?.type_rec ?? item?.type ?? "item",
    brutto: item?.brutto ?? "",
    pr_1: item?.pr_1 ?? item?.loss ?? item?.waste ?? item?.proc_loss ?? item?.loss_percent ?? "",
    netto: item?.netto ?? "",
    pr_2: item?.pr_2 ?? "",
    res: item?.res ?? item?.output ?? item?.all_w ?? item?.weight_out ?? "",
  }));
}

function normalizeProductionDraft(entity, response = {}) {
  const units = Array.isArray(response?.units) ? response.units : [];

  return {
    ...createEmptyProductionDraft(),
    ...entity,
    unit_name:
      units.find((item) => String(item?.id) === String(entity?.ed_izmer_id))?.name ??
      entity?.unit_name ??
      "",
    units,
    categories: Array.isArray(entity?.categories) ? entity.categories : [],
    allergens: Array.isArray(entity?.allergens) ? entity.allergens : [],
    allergens_possible: Array.isArray(entity?.allergens_possible) ? entity.allergens_possible : [],
    allergens_derived: Array.isArray(entity?.allergens_derived) ? entity.allergens_derived : [],
    allergens_possible_derived: Array.isArray(entity?.allergens_possible_derived)
      ? entity.allergens_possible_derived
      : [],
    storages: Array.isArray(entity?.storages) ? entity.storages : [],
    apps: Array.isArray(entity?.apps) ? entity.apps : [],
    items: Array.isArray(entity?.items) ? entity.items : [],
    all_storages: Array.isArray(response?.all_storages) ? response.all_storages : [],
    all_items_list: Array.isArray(response?.all_items_list) ? response.all_items_list : [],
    ref_allergens: Array.isArray(response?.allergens) ? response.allergens : [],
    ref_categories: Array.isArray(response?.categories) ? response.categories : [],
    ref_apps: Array.isArray(response?.apps) ? response.apps : [],
  };
}

function normalizeProductionSavePayload(draft) {
  const payload = {
    name: String(draft?.name || "").trim(),
    shelf_life: draft?.shelf_life ?? "",
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    ed_izmer_id: draft?.ed_izmer_id ? Number(draft.ed_izmer_id) : null,
    all_w: draft?.all_w ?? "",
    all_w_brutto: draft?.all_w_brutto ?? "",
    all_w_netto: draft?.all_w_netto ?? "",
    time_min: draft?.time_min ?? "",
    time_min_dop: draft?.time_min_dop ?? "",
    structure: draft?.structure ?? "",
    show_in_rev: draft?.show_in_rev ? 1 : 0,
    two_user: draft?.two_user ? 1 : 0,
    is_show: draft?.is_show ? 1 : 0,
    allergens: normalizeRelationIds(draft?.allergens),
    allergens_possible: normalizeRelationIds(draft?.allergens_possible),
    categories: normalizeRelationIds(draft?.categories),
    storages: normalizeRelationIds(draft?.storages),
    apps: normalizeRelationIds(draft?.apps),
    items: normalizeCompositionItems(draft?.items),
  };

  if (draft?.id !== null && draft?.id !== undefined && draft?.id !== "") {
    payload.id = draft.id;
  }

  return payload;
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
  const { canDelete, canManageProduction } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const shellSections = useSkladStore((state) => state.sections);
  const shellAccess = useSkladStore((state) => state.access);
  const shellUnits = useSkladStore((state) => state.units);
  const categories = useSkladStore((state) => state.categories);
  const shellAllergens = useSkladStore((state) => state.allergens);
  const shellStorages = useSkladStore((state) => state.storages);
  const shellApps = useSkladStore((state) => state.apps);
  const setHistoryState = useSkladHistoryStore((state) => state.setState);

  const activeEntityType = useSkladProductionStore((state) => state.activeEntityType);
  const rowsByType = useSkladProductionStore((state) => state.rowsByType);
  const search = useSkladProductionStore((state) => state.search);
  const categoryId = useSkladProductionStore((state) => state.categoryId);
  const archiveMode = useSkladProductionStore((state) => state.archiveMode);
  const pageByType = useSkladProductionStore((state) => state.pageByType);
  const rowsPerPage = useSkladProductionStore((state) => state.rowsPerPage);
  const modal = useSkladProductionStore((state) => state.modal);
  const detail = useSkladProductionStore((state) => state.detail);
  const draft = useSkladProductionStore((state) => state.draft);
  const archiveDialog = useSkladProductionStore((state) => state.archiveDialog);
  const deleteDialog = useSkladProductionStore((state) => state.deleteDialog);
  const setState = useSkladProductionStore((state) => state.setState);

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

  const countsByType = useMemo(() => {
    return ENTITY_TYPES.reduce((accumulator, entityType) => {
      const rows = Array.isArray(rowsByType?.[entityType]) ? rowsByType[entityType] : [];
      accumulator[entityType] = [...rows].sort((left, right) =>
        String(left?.name || "").localeCompare(String(right?.name || ""), "ru"),
      );
      return accumulator;
    }, {});
  }, [rowsByType]);

  const paginatedRowsByType = useMemo(() => {
    return ENTITY_TYPES.reduce((accumulator, entityType) => {
      const sortedRows = countsByType[entityType] || [];
      const page = pageByType?.[entityType] || 0;
      const start = page * rowsPerPage;

      accumulator[entityType] = sortedRows.slice(start, start + rowsPerPage);
      return accumulator;
    }, {});
  }, [countsByType, pageByType, rowsPerPage]);

  const canConvert = canManageProduction("recipe") || canManageProduction("semi_finished");
  const canDeleteAction = canDelete("production");

  const loadRows = useCallback(
    async ({ resetPage = false } = {}) => {
      setShellState({ isLoading: true });

      try {
        const payload = {
          search: String(search || "").trim(),
          category_id: categoryId ? Number(categoryId) : null,
          archive_mode: archiveMode,
        };

        const [recipesResponse, semiFinishedResponse] = await Promise.all([
          getEntityLoadApi(api, "recipe")(payload),
          getEntityLoadApi(api, "semi_finished")(payload),
        ]);

        if (!recipesResponse?.st) {
          throw new Error(recipesResponse?.text || "Ошибка загрузки списка рецептов");
        }

        if (!semiFinishedResponse?.st) {
          throw new Error(semiFinishedResponse?.text || "Ошибка загрузки списка заготовок");
        }

        setState({
          rowsByType: {
            recipe: Array.isArray(recipesResponse?.list) ? recipesResponse.list : [],
            semi_finished: Array.isArray(semiFinishedResponse?.list)
              ? semiFinishedResponse.list
              : [],
          },
          ...(resetPage
            ? {
                pageByType: {
                  recipe: 0,
                  semi_finished: 0,
                },
              }
            : {}),
        });
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки списка", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, archiveMode, categoryId, search, setShellState, setState, showAlert],
  );

  useEffect(() => {
    const nextPageByType = { ...pageByType };
    let changed = false;

    ENTITY_TYPES.forEach((entityType) => {
      const sortedRows = countsByType[entityType] || [];
      const currentPage = pageByType?.[entityType] || 0;
      const maxPage = sortedRows.length
        ? Math.max(0, Math.ceil(sortedRows.length / rowsPerPage) - 1)
        : 0;

      if (currentPage > maxPage) {
        nextPageByType[entityType] = maxPage;
        changed = true;
      }
    });

    if (changed) {
      setState({ pageByType: nextPageByType });
    }
  }, [countsByType, pageByType, rowsPerPage, setState]);

  const openHistoryTab = useCallback(
    (entityType, row) => {
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
    [setHistoryState, setShellState, shellAccess, shellSections, showAlert],
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
        entityType: null,
      },
    });
  }, [setState]);

  const closeArchiveDialog = useCallback(() => {
    setState({
      archiveDialog: {
        open: false,
        loading: false,
        row: null,
        entityType: null,
      },
    });
  }, [setState]);

  const openArchiveDialog = useCallback(
    (entityType, row) => {
      if (!row?.id) {
        return;
      }

      setState({
        activeEntityType: entityType,
        archiveDialog: {
          open: true,
          loading: false,
          row,
          entityType,
        },
      });
    },
    [setState],
  );

  const openDeleteDialog = useCallback(
    (entityType, row) => {
      if (!row?.id || !canDeleteAction) {
        return;
      }

      setState({
        activeEntityType: entityType,
        deleteDialog: {
          open: true,
          loading: false,
          row,
          entityType,
        },
      });
    },
    [canDeleteAction, setState],
  );

  const confirmDelete = useCallback(async () => {
    const row = deleteDialog?.row;
    const entityType = deleteDialog?.entityType || activeEntityType;

    if (!row?.id || !entityType) {
      return;
    }

    setState({
      deleteDialog: {
        open: true,
        loading: true,
        row,
        entityType,
      },
    });
    setShellState({ isLoading: true });

    try {
      const response = await api.deleteEntity({
        entity_type: entityType,
        id: row.id,
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
          entityType,
        },
      });
      showAlert(error?.message || "Ошибка удаления", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    activeEntityType,
    api,
    closeDeleteDialog,
    deleteDialog?.entityType,
    deleteDialog?.row,
    loadRows,
    setShellState,
    setState,
    showAlert,
  ]);

  const confirmArchive = useCallback(async () => {
    const row = archiveDialog?.row;
    const entityType = archiveDialog?.entityType || activeEntityType;

    if (!row?.id || !entityType) {
      return;
    }

    const nextArchived = Number(row?.is_archived) === 1 ? 0 : 1;

    setState({
      archiveDialog: {
        open: true,
        loading: true,
        row,
        entityType,
      },
    });
    setShellState({ isLoading: true });

    try {
      const response = await api.archiveEntity({
        entity_type: entityType,
        id: row.id,
        is_archived: nextArchived,
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
          entityType,
        },
      });
      showAlert(error?.message || "Ошибка изменения архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    activeEntityType,
    api,
    archiveDialog?.entityType,
    archiveDialog?.row,
    closeArchiveDialog,
    loadRows,
    setShellState,
    setState,
    showAlert,
  ]);

  const openCreate = useCallback(
    (entityType) => {
      setState({
        activeEntityType: entityType,
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
    },
    [setState],
  );

  const submitDraft = useCallback(
    async (nextDraft) => {
      const validationError = validateProductionDraft(nextDraft);

      if (validationError) {
        showAlert(validationError, false);
        return;
      }

      const saveMode = modal.mode === "create" ? "create" : "edit";
      const saveEntity = getEntitySaveApi(api, activeEntityType, saveMode);
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
        const response = await saveEntity(payload);

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
    [activeEntityType, api, closeModal, loadRows, modal, setShellState, setState, showAlert],
  );

  const loadEntityDetail = useCallback(
    async (entityType, row) => {
      if (!row?.id) {
        return null;
      }

      const response = await getEntityDetailApi(api, entityType)(row.id);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки карточки");
      }

      return normalizeProductionDraft(response?.entity || {}, response);
    },
    [api],
  );

  const openView = useCallback(
    async (entityType, row, tab = "main") => {
      setState({
        activeEntityType: entityType,
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
        const entity = await loadEntityDetail(entityType, row);
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
    async (entityType, row) => {
      setState({
        activeEntityType: entityType,
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
        const entity = await loadEntityDetail(entityType, row);
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
    async (entityType, row) => {
      setState({
        activeEntityType: entityType,
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
        const entity = await loadEntityDetail(entityType, row);
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

  const renderSection = (entityType) => {
    const canCreateOrEdit = canManageProduction(entityType);
    const sortedRows = countsByType[entityType] || [];
    const paginatedRows = paginatedRowsByType[entityType] || [];
    const currentPage = pageByType?.[entityType] || 0;

    return (
      <Accordion
        key={entityType}
        defaultExpanded
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ width: "100%" }}
          >
            <Typography sx={{ fontWeight: 700 }}>{getEntityLabel(entityType)}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {sortedRows.length}
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="flex-start"
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateOrEdit}
                onClick={() => openCreate(entityType)}
              >
                Добавить {getEntitySingleLabel(entityType).toLowerCase()}
              </Button>
            </Stack>

            <TableContainer sx={{ maxHeight: "50dvh", overflow: "auto" }}>
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
                    <TableCell sx={{ minWidth: 220 }}>Статус</TableCell>
                    <TableCell
                      align="right"
                      sx={{ width: 220 }}
                    >
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRows.map((row) => {
                    const canDelete = Boolean(row?.delete_usage?.can_delete);
                    const primaryStatusChip = getPrimaryStatusChip(row);
                    const secondaryStatusChips = getSecondaryStatusChips(row);

                    return (
                      <TableRow
                        key={getRowKey(entityType, row)}
                        hover
                      >
                        <TableCell
                          onClick={() => openView(entityType, row, "main")}
                          sx={{ cursor: "pointer" }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                        </TableCell>

                        <TableCell>{formatCategories(row?.categories)}</TableCell>
                        <TableCell>{row?.shelf_life || "-"}</TableCell>
                        <TableCell>{formatDateRangeCell(row)}</TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            useFlexGap
                            flexWrap="wrap"
                            alignItems="center"
                          >
                            <Chip
                              key={primaryStatusChip.key}
                              label={primaryStatusChip.label}
                              size="small"
                              color={primaryStatusChip.color}
                              variant={
                                primaryStatusChip.color === "default" ? "outlined" : "filled"
                              }
                            />
                            {secondaryStatusChips.map((chip) => (
                              <Chip
                                key={chip.key}
                                label={chip.label}
                                size="small"
                                color={chip.color}
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip
                              title={canCreateOrEdit ? "Открыть редактор" : "Недостаточно прав"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!canCreateOrEdit}
                                  aria-label="Редактировать"
                                  onClick={() => openEdit(entityType, row)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={canConvert ? "Открыть конвертацию" : "Недостаточно прав"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!canConvert}
                                  aria-label="Открыть сценарий конвертации"
                                  onClick={() => openConvert(entityType, row)}
                                >
                                  <SwapHorizIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Открыть историю">
                              <span>
                                <IconButton
                                  size="small"
                                  aria-label="Открыть историю"
                                  onClick={() => openHistoryTab(entityType, row)}
                                >
                                  <HistoryOutlinedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={
                                Number(row?.is_archived) === 1 ? "Вернуть из архива" : "В архив"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!canCreateOrEdit}
                                  onClick={() => openArchiveDialog(entityType, row)}
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
                                    disabled={!canCreateOrEdit || !canDeleteAction}
                                    onClick={() => openDeleteDialog(entityType, row)}
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

            <TablePagination
              component="div"
              count={sortedRows.length}
              page={currentPage}
              onPageChange={(_, nextPage) =>
                setState({
                  pageByType: {
                    ...pageByType,
                    [entityType]: nextPage,
                  },
                })
              }
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) =>
                setState({
                  rowsPerPage: Number(event.target.value) || 25,
                  pageByType: {
                    recipe: 0,
                    semi_finished: 0,
                  },
                })
              }
              rowsPerPageOptions={[25, 50, 100]}
              labelRowsPerPage="Строк на странице:"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
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
            <MySearchInput
              label="Поиск"
              placeholder="Название рецепта или заготовки"
              value={search}
              onValueChange={(nextValue) =>
                setState({
                  search: nextValue,
                  pageByType: {
                    recipe: 0,
                    semi_finished: 0,
                  },
                })
              }
            />

            <MySelect
              label="Категория"
              data={categoryOptions}
              is_none={false}
              value={categoryId}
              func={(event) =>
                setState({
                  categoryId: event.target.value,
                  pageByType: {
                    recipe: 0,
                    semi_finished: 0,
                  },
                })
              }
            />

            <MySelect
              label="Показать"
              data={PRODUCTION_ARCHIVE_MODE_OPTIONS}
              is_none={false}
              value={archiveMode}
              func={(event) =>
                setState({
                  archiveMode: event.target.value,
                  pageByType: {
                    recipe: 0,
                    semi_finished: 0,
                  },
                })
              }
            />
          </Stack>
        </Stack>

        {ENTITY_TYPES.map(renderSection)}
      </Stack>
    </Paper>
  );

  return {
    activeEntityType,
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
          entityLabel={getEntitySingleLabel(activeEntityType)}
          onClose={closeModal}
        />
        <SkladProductionEditorDialog
          open={modal.open && (modal.mode === "edit" || modal.mode === "create")}
          loading={modal.loading}
          mode={modal.mode === "edit" ? "edit" : "create"}
          entityLabel={getEntitySingleLabel(activeEntityType)}
          draft={draft}
          units={
            draft?.units?.length ? draft.units : detail?.units?.length ? detail.units : shellUnits
          }
          categories={detail?.ref_categories?.length ? detail.ref_categories : categories}
          allergens={detail?.ref_allergens?.length ? detail.ref_allergens : shellAllergens}
          storages={detail?.all_storages?.length ? detail.all_storages : shellStorages}
          apps={detail?.ref_apps?.length ? detail.ref_apps : shellApps}
          allItemsList={detail?.all_items_list || draft?.all_items_list || []}
          isEditable={canManageProduction(activeEntityType)}
          onSubmit={submitDraft}
          onClose={closeModal}
        />
        <SkladProductionConvertDialog
          open={modal.open && modal.mode === "convert"}
          detail={detail}
          entityType={activeEntityType}
          canConvert={canConvert}
          onClose={closeModal}
        />
        <SkladDeleteDialog
          open={deleteDialog.open}
          loading={deleteDialog.loading}
          title={`Удалить ${getEntitySingleLabel(deleteDialog?.entityType || activeEntityType).toLowerCase()}?`}
          description={`Запись "${deleteDialog?.row?.name || ""}" будет удалена без возможности восстановления.`}
          warning="Если запись уже использовалась, удаление будет недоступно."
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
        <SkladDeleteDialog
          open={archiveDialog.open}
          loading={archiveDialog.loading}
          title={
            Number(archiveDialog?.row?.is_archived) === 1
              ? `Вернуть ${getEntitySingleLabel(archiveDialog?.entityType || activeEntityType).toLowerCase()} из архива?`
              : `Отправить ${getEntitySingleLabel(archiveDialog?.entityType || activeEntityType).toLowerCase()} в архив?`
          }
          description={`Запись "${archiveDialog?.row?.name || ""}" будет ${
            Number(archiveDialog?.row?.is_archived) === 1
              ? "снова показана в активных списках"
              : "убрана из активных списков"
          }.`}
          warning="Изменение будет отражено в истории."
          confirmLabel={Number(archiveDialog?.row?.is_archived) === 1 ? "Вернуть" : "В архив"}
          onClose={closeArchiveDialog}
          onConfirm={confirmArchive}
        />
      </>
    ),
  };
}
