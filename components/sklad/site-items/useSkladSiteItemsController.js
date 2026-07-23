"use client";

import { useCallback, useEffect, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { formatDateRangeRU } from "../formatDateRangeRU";
import SkladDeleteDialog from "../SkladDeleteDialog";
import { useSkladStore } from "../useSkladStore";
import { getVisibleSkladTabs } from "../skladTabs";
import { HISTORY_INITIAL_STATE, useSkladHistoryStore } from "../history/useSkladHistoryStore";
import SkladSiteItemEditorDialog from "./SkladSiteItemEditorDialog";
import SkladSiteItemViewDialog from "./SkladSiteItemViewDialog";
import { SITE_ITEMS_ARCHIVE_MODE_OPTIONS, useSkladSiteItemsStore } from "./useSkladSiteItemsStore";

function formatDateRange(row) {
  return formatDateRangeRU(row?.date_start, row?.date_end);
}

function formatBju(row) {
  const parts = [
    row?.protein !== undefined && row?.protein !== null && row?.protein !== ""
      ? String(row.protein)
      : null,
    row?.fat !== undefined && row?.fat !== null && row?.fat !== "" ? String(row.fat) : null,
    row?.carbohydrates !== undefined && row?.carbohydrates !== null && row?.carbohydrates !== ""
      ? String(row.carbohydrates)
      : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "-";
}

function getCategoryName(row, categories) {
  const categoryId = row?.category_id ?? null;
  const directName = row?.category_name || "";

  if (directName) {
    return directName;
  }

  if (categoryId === null || categoryId === undefined || categoryId === "") {
    return "-";
  }

  const matched = categories.find((item) => String(item?.id) === String(categoryId));
  return matched?.name || String(categoryId);
}

function getTagNames(row, tags) {
  if (Array.isArray(row?.tags) && row.tags.length) {
    return row.tags.map((item) => item?.name).filter(Boolean);
  }

  return [];
}

function dedupeChips(chips) {
  const seen = new Set();

  return chips.filter((chip) => {
    const key = `${chip?.label || ""}-${chip?.color || ""}`;

    if (!chip?.label || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getPrimaryStatusChip(row) {
  if (Number(row?.is_archived) === 1) {
    return { key: "archived", label: "Архив", color: "default" };
  }

  if (Number(row?.is_show ?? 0) === 1) {
    return { key: "active", label: "Активен", color: "success" };
  }

  return { key: "hidden", label: "Скрыт", color: "default" };
}

function getSecondaryStatusChips(row) {
  return dedupeChips(
    [
      Number(row?.show_site) === 1 ? { key: "show_site", label: "Сайт", color: "primary" } : null,
      Number(row?.show_program) === 1
        ? { key: "show_program", label: "Касса", color: "secondary" }
        : null,
      Number(row?.is_hit) === 1 ? { key: "hit", label: "Хит", color: "warning" } : null,
      Number(row?.is_new) === 1 ? { key: "new", label: "Новинка", color: "info" } : null,
    ].filter(Boolean),
  );
}

function getArchiveModeLabel(value) {
  return SITE_ITEMS_ARCHIVE_MODE_OPTIONS.find((item) => item.id === value)?.name || "Активные";
}

function getDeleteTooltip(row, isEditable, canDeleteAction) {
  if (!isEditable || !canDeleteAction) {
    return "Недостаточно прав для удаления";
  }

  if (row?.can_delete === false) {
    return "Удаление заблокировано связями";
  }

  return "Удалить";
}

function dedupeSelectOptions(options) {
  const seen = new Set();

  return options.filter((option) => {
    const key = String(option?.id ?? "");

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function createEmptySiteItemRelations() {
  return {
    item_items: {
      this_items: [],
      all_items: [],
    },
    items_stage: {
      stage_1: [],
      stage_2: [],
      stage_3: [],
      all: [],
    },
    composition_source: {
      pf: [],
      recipes: [],
    },
    composition_derived: {
      pf_total: [],
    },
  };
}

function normalizeSiteItemDraft(response, fallbackCategories = []) {
  const item = response?.item ?? {};
  const emptyRelations = createEmptySiteItemRelations();

  return {
    ...item,
    category_name:
      item?.category_name ||
      fallbackCategories.find((category) => String(category?.id) === String(item?.category_id))
        ?.name ||
      "",
    tags: Array.isArray(item?.tags) ? item.tags : [],
    composition_source: response?.composition_source ?? emptyRelations.composition_source,
    composition_derived: response?.composition_derived ?? emptyRelations.composition_derived,
    allergens_derived: Array.isArray(response?.allergens_derived) ? response.allergens_derived : [],
    possible_allergens_derived: Array.isArray(response?.possible_allergens_derived)
      ? response.possible_allergens_derived
      : [],
    image: response?.image ?? null,
    marking: response?.marking ?? {},
    can_delete: typeof response?.can_delete === "boolean" ? response.can_delete : null,
    delete_usage: response?.delete_usage ?? null,
    item_items: response?.item_items ?? emptyRelations.item_items,
    items_stage: response?.items_stage ?? emptyRelations.items_stage,
  };
}

function normalizeSiteItemSavePayload(draft) {
  const marking = draft?.marking || {};
  const stageRows = draft?.items_stage || {};
  const toStagePayload = (rows, type) =>
    (Array.isArray(rows) ? rows : [])
      .filter((item) => String(item?.type ?? "") === type)
      .map((item) => ({
        ...(type === "pf"
          ? {
              pf_id: item?.pf_id
                ? Number(item.pf_id)
                : Number(String(item?.selected_id || "").split("-")[0] || 0),
            }
          : {
              rec_id: item?.rec_id
                ? Number(item.rec_id)
                : Number(String(item?.selected_id || "").split("-")[0] || 0),
            }),
        brutto: item?.brutto ?? "",
        pr_1: item?.pr_1 ?? "",
        netto: item?.netto ?? "",
        pr_2: item?.pr_2 ?? "",
        res: item?.res ?? "",
      }))
      .filter((item) => Number(item?.pf_id ?? item?.rec_id ?? 0) > 0);

  return {
    id: draft?.id ?? null,
    name: String(draft?.name || "").trim(),
    short_name: String(draft?.short_name || "").trim(),
    category_id: draft?.category_id ? Number(draft.category_id) : null,
    date_start: draft?.date_start ?? "",
    date_end: draft?.date_end ?? "",
    art: draft?.art ?? "",
    stol: draft?.stol ?? "",
    count_part: draft?.count_part ?? "",
    weight: draft?.weight ?? "",
    protein: draft?.protein ?? "",
    fat: draft?.fat ?? "",
    carbohydrates: draft?.carbohydrates ?? "",
    kkal: draft?.kkal ?? "",
    tmp_desc: draft?.tmp_desc ?? "",
    marc_desc: draft?.marc_desc ?? "",
    marc_desc_full: draft?.marc_desc_full ?? "",
    tags: Array.isArray(draft?.tags) ? draft.tags : [],
    image: draft?.image ?? null,
    marking: {
      ...marking,
      is_mark: draft?.is_mark ? Number(draft.is_mark) : 0,
      mark_code: draft?.mark_code ?? "",
      series: draft?.series ?? "",
      is_akchis: draft?.is_akchis ? 1 : 0,
    },
    show_site: draft?.show_site ? 1 : 0,
    show_program: draft?.show_program ? 1 : 0,
    is_show: draft?.is_show ? 1 : 0,
    is_hit: draft?.is_hit ? 1 : 0,
    is_new: draft?.is_new ? 1 : 0,
    time_stage_1: draft?.time_stage_1 ?? "",
    time_stage_2: draft?.time_stage_2 ?? "",
    time_stage_3: draft?.time_stage_3 ?? "",
    pf_stage_1: toStagePayload(stageRows?.stage_1, "pf"),
    pf_stage_2: toStagePayload(stageRows?.stage_2, "pf"),
    pf_stage_3: toStagePayload(stageRows?.stage_3, "pf"),
    rec_stage_1: toStagePayload(stageRows?.stage_1, "rec"),
    rec_stage_2: toStagePayload(stageRows?.stage_2, "rec"),
    rec_stage_3: toStagePayload(stageRows?.stage_3, "rec"),
    composition_source:
      draft?.composition_source || createEmptySiteItemRelations().composition_source,
    composition_derived:
      draft?.composition_derived || createEmptySiteItemRelations().composition_derived,
    item_items: {
      ...(draft?.item_items || createEmptySiteItemRelations().item_items),
      this_items: Array.isArray(draft?.item_items?.this_items)
        ? draft.item_items.this_items
            .map((item) => ({
              ...item,
              item_id: item?.item_id ? Number(item.item_id) : null,
            }))
            .filter((item) => Number(item?.item_id) > 0)
        : [],
    },
    items_stage: draft?.items_stage || createEmptySiteItemRelations().items_stage,
  };
}

function validateSiteItemDraft(draft) {
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

export default function useSkladSiteItemsController({ showAlert }) {
  const api = useSkladApi();
  const { canDelete, canManageSiteItems } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const shellSections = useSkladStore((state) => state.sections);
  const shellAccess = useSkladStore((state) => state.access);
  const setHistoryState = useSkladHistoryStore((state) => state.setState);

  const rows = useSkladSiteItemsStore((state) => state.rows);
  const categories = useSkladSiteItemsStore((state) => state.categories);
  const tags = useSkladSiteItemsStore((state) => state.tags);
  const search = useSkladSiteItemsStore((state) => state.search);
  const categoryId = useSkladSiteItemsStore((state) => state.categoryId);
  const tagId = useSkladSiteItemsStore((state) => state.tagId);
  const archiveMode = useSkladSiteItemsStore((state) => state.archiveMode);
  const page = useSkladSiteItemsStore((state) => state.page);
  const rowsPerPage = useSkladSiteItemsStore((state) => state.rowsPerPage);
  const modal = useSkladSiteItemsStore((state) => state.modal);
  const detail = useSkladSiteItemsStore((state) => state.detail);
  const draft = useSkladSiteItemsStore((state) => state.draft);
  const archiveDialog = useSkladSiteItemsStore((state) => state.archiveDialog);
  const deleteDialog = useSkladSiteItemsStore((state) => state.deleteDialog);
  const setState = useSkladSiteItemsStore((state) => state.setState);

  const isEditable = canManageSiteItems();
  const canDeleteAction = canDelete("site_item");
  const loadRows = useCallback(
    async ({ resetPage = false } = {}) => {
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItems({
          search: String(search || "").trim(),
          category_id: categoryId ? Number(categoryId) : null,
          tag_id: tagId ? Number(tagId) : null,
          archive_mode: archiveMode,
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки товаров сайта");
        }

        setState({
          rows: Array.isArray(response?.list) ? response.list : [],
          categories: Array.isArray(response?.categories) ? response.categories : [],
          tags: Array.isArray(response?.tags) ? response.tags : [],
          ...(resetPage ? { page: 0 } : {}),
        });
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки товаров сайта", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, archiveMode, categoryId, search, setShellState, setState, showAlert, tagId],
  );

  const categoryOptions = useMemo(() => {
    return dedupeSelectOptions(
      [{ id: "", name: "Все категории" }].concat(
        (categories || []).map((item) => ({
          id: String(item?.id ?? ""),
          name: item?.name || String(item?.id || ""),
        })),
      ),
    );
  }, [categories]);

  const tagOptions = useMemo(() => {
    return dedupeSelectOptions(
      [{ id: "", name: "Все теги" }].concat(
        (tags || []).map((item) => ({
          id: String(item?.id ?? ""),
          name: item?.name || String(item?.id || ""),
        })),
      ),
    );
  }, [tags]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  useEffect(() => {
    const maxPage = rows.length ? Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1) : 0;

    if (page > maxPage) {
      setState({ page: maxPage });
    }
  }, [page, rows.length, rowsPerPage, setState]);

  const openHistoryTab = useCallback(
    (row, focusArea = "") => {
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
        entityType: "site_item",
        entityId: String(row.id),
        focusArea,
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
        section: "tech",
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
      if (!row?.id || !canDeleteAction) {
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
    [canDeleteAction, setState],
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
        entity_type: "site_item",
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
        },
      });
      showAlert(error?.message || "Ошибка удаления", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, closeDeleteDialog, deleteDialog?.row, loadRows, setShellState, setState, showAlert]);

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
        entity_type: "site_item",
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
        },
      });
      showAlert(error?.message || "Ошибка изменения архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, archiveDialog?.row, closeArchiveDialog, loadRows, setShellState, setState, showAlert]);

  const toggleFlag = useCallback(
    async (row, type) => {
      if (!row?.id || !type || !isEditable) {
        return;
      }

      const currentSourceValue = type === "is_show" ? (row?.is_show ?? 0) : (row?.[type] ?? 0);
      const nextValue = Number(currentSourceValue) === 1 ? 0 : 1;

      setShellState({ isLoading: true });

      try {
        const response = await api.saveSiteItemFlag({
          id: row.id,
          type,
          value: nextValue,
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
    [api, isEditable, loadRows, setShellState, showAlert],
  );

  const openCreate = useCallback(() => {
    setState({
      modal: {
        open: true,
        mode: "create",
        loading: true,
        section: "tech",
      },
      detail: null,
      draft: null,
    });
    setShellState({ isLoading: true });

    api
      .getSiteItemBootstrap()
      .then((response) => {
        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки формы");
        }

        const normalizedDraft = normalizeSiteItemDraft(response, response?.cat_list || categories);

        setState({
          categories: response?.cat_list || categories,
          tags: response?.tags_all || tags,
          modal: {
            open: true,
            mode: "create",
            loading: false,
            section: "tech",
          },
          detail: normalizedDraft,
          draft: normalizedDraft,
        });
      })
      .catch((error) => {
        setState({
          modal: {
            open: false,
            mode: "view",
            loading: false,
            section: "tech",
          },
          detail: null,
          draft: null,
        });
        showAlert(error?.message || "Ошибка загрузки формы", false);
      })
      .finally(() => {
        setShellState({ isLoading: false });
      });
  }, [api, categories, setShellState, setState, showAlert, tags]);

  const submitDraft = useCallback(
    async (nextDraft) => {
      const validationError = validateSiteItemDraft(nextDraft);

      if (validationError) {
        showAlert(validationError, false);
        return;
      }

      const saveItem = modal.mode === "create" ? api.createSiteItem : api.updateSiteItem;
      const payload = normalizeSiteItemSavePayload(nextDraft);

      setState({
        modal: {
          ...modal,
          loading: true,
        },
        draft: nextDraft,
      });
      setShellState({ isLoading: true });

      try {
        const response = await saveItem(payload);

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
    [api, closeModal, loadRows, modal, setShellState, setState, showAlert],
  );

  const openEdit = useCallback(
    async (row) => {
      if (!row?.id) {
        return;
      }

      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: true,
          section: "tech",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItem(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки товара");
        }

        const normalizedDraft = normalizeSiteItemDraft(response, categories);

        setState({
          modal: {
            open: true,
            mode: "edit",
            loading: false,
            section: "tech",
          },
          detail: normalizedDraft,
          draft: normalizedDraft,
        });
      } catch (error) {
        setState({
          modal: {
            open: false,
            mode: "view",
            loading: false,
            section: "tech",
          },
          detail: null,
          draft: null,
        });
        showAlert(error?.message || "Ошибка загрузки товара", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, categories, setShellState, setState, showAlert],
  );

  const openView = useCallback(
    async (row, section = "tech") => {
      if (!row?.id) {
        return;
      }

      setState({
        modal: {
          open: true,
          mode: "view",
          loading: true,
          section,
        },
        detail: null,
      });
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItem(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки товара");
        }

        setState({
          modal: {
            open: true,
            mode: "view",
            loading: false,
            section,
          },
          detail: normalizeSiteItemDraft(response, categories),
        });
      } catch (error) {
        setState({
          modal: {
            open: false,
            mode: "view",
            loading: false,
            section: "tech",
          },
          detail: null,
        });
        showAlert(error?.message || "Ошибка загрузки товара", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, categories, setShellState, setState, showAlert],
  );

  const refreshOpenDetail = useCallback(
    async (id, section = "tech") => {
      if (!id) {
        return;
      }

      const response = await api.getSiteItem(id);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки товара");
      }

      setState({
        modal: {
          open: true,
          mode: "view",
          loading: false,
          section,
        },
        detail: normalizeSiteItemDraft(response, categories),
      });
    },
    [api, categories, setState],
  );

  const handleUploadImage = useCallback(
    async (row, file, section = "image") => {
      if (!row?.id || !file) {
        return;
      }

      setState({
        modal: {
          ...modal,
          loading: true,
          section,
        },
      });
      setShellState({ isLoading: true });

      try {
        const response = await api.uploadSiteItemImage(file, {
          id: row.id,
          slot: "main",
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки изображения");
        }

        await refreshOpenDetail(row.id, section);
        showAlert(response?.text || "Изображение загружено", true);
        await loadRows();
      } catch (error) {
        setState({
          modal: {
            ...modal,
            loading: false,
            section,
          },
        });
        showAlert(error?.message || "Ошибка загрузки изображения", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, loadRows, modal, refreshOpenDetail, setShellState, setState, showAlert],
  );

  const handleSyncVk = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.syncSiteItemsVk();

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка синхронизации VK");
      }

      showAlert(response?.text || "Синхронизация VK запущена", true);
    } catch (error) {
      showAlert(error?.message || "Ошибка синхронизации VK", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, setShellState, showAlert]);

  const handleCreateTag = useCallback(
    async (name) => {
      const trimmedName = String(name || "").trim();

      if (!trimmedName) {
        throw new Error("Название тега обязательно");
      }

      const response = await api.createSiteItemTag({
        name: trimmedName,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка создания тега");
      }

      const nextTags = response?.tags_all || [];
      setState({ tags: nextTags });

      return {
        tags: nextTags,
        createdTag:
          nextTags.find((tag) => String(tag?.id) === String(response?.id)) ||
          nextTags.find((tag) => String(tag?.name || "").trim() === trimmedName) ||
          null,
        text: response?.text || "Тег создан",
      };
    },
    [api, setState],
  );

  const handleRenameTag = useCallback(
    async (tagId, name) => {
      const normalizedTagId = tagId ? Number(tagId) : null;
      const trimmedName = String(name || "").trim();

      if (!normalizedTagId) {
        throw new Error("Выберите тег");
      }

      if (!trimmedName) {
        throw new Error("Название тега обязательно");
      }

      const response = await api.updateSiteItemTag({
        tag_id: normalizedTagId,
        name: trimmedName,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка изменения тега");
      }

      const nextTags = response?.tags_all || [];
      setState({ tags: nextTags });

      return {
        tags: nextTags,
        text: response?.text || "Тег обновлен",
      };
    },
    [api, setState],
  );

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
            <MyTextInput
              label="Поиск"
              placeholder="Название или короткое название"
              value={search}
              func={(event) => setState({ search: event.target.value, page: 0 })}
            />

            <MySelect
              label="Категория"
              data={categoryOptions}
              is_none={false}
              value={categoryId}
              func={(event) => setState({ categoryId: event.target.value, page: 0 })}
            />

            <MySelect
              label="Тег"
              data={tagOptions}
              is_none={false}
              value={tagId}
              func={(event) => setState({ tagId: event.target.value, page: 0 })}
            />

            <MySelect
              label="Показать"
              data={SITE_ITEMS_ARCHIVE_MODE_OPTIONS}
              is_none={false}
              value={archiveMode}
              func={(event) => setState({ archiveMode: event.target.value, page: 0 })}
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
              disabled={!isEditable}
              onClick={openCreate}
            >
              Добавить товар
            </Button>
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Режим выборки
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{getArchiveModeLabel(archiveMode)}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Найдено позиций
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{rows.length}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Активные фильтры
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {[search, categoryId, tagId].filter(Boolean).length || "Нет"}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Доступные действия
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {isEditable ? "Просмотр, создание, редактирование и история" : "Просмотр и история"}
              </Typography>
            </Box>
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
                <TableCell>Категория</TableCell>
                <TableCell sx={{ width: 128 }}>Б/Ж/У</TableCell>
                <TableCell sx={{ width: 84 }}>Ккал</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Теги</TableCell>
                <TableCell sx={{ width: 188 }}>Действует</TableCell>
                <TableCell sx={{ minWidth: 240 }}>Статус</TableCell>
                <TableCell
                  align="right"
                  sx={{ width: 248 }}
                >
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row) => {
                const rowTagNames = getTagNames(row, tags);
                const primaryStatusChip = getPrimaryStatusChip(row);
                const secondaryStatusChips = getSecondaryStatusChips(row);

                return (
                  <TableRow
                    key={`site-item-${row?.id}`}
                    hover
                    onClick={() => openView(row)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                        {row?.short_name ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {row.short_name}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>

                    <TableCell>{getCategoryName(row, categories)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 12, lineHeight: 1.35, fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatBju(row)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row?.kkal_preview ?? row?.kkal ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color={rowTagNames.length ? "text.primary" : "text.secondary"}
                        sx={{ fontSize: 12, lineHeight: 1.35 }}
                      >
                        {rowTagNames.length ? rowTagNames.join(", ") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateRange(row)}</TableCell>

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
                          variant={primaryStatusChip.color === "default" ? "outlined" : "filled"}
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
                        <Tooltip title="Открыть карточку">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Открыть карточку"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "tech");
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={isEditable ? "Открыть редактор" : "Недостаточно прав"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={!isEditable}
                              aria-label="Редактировать"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(row);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку маркировки">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Маркировка"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "marking");
                              }}
                            >
                              <LocalOfferOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку изображения">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Изображения"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "image");
                              }}
                            >
                              <PhotoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку истории">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="История"
                              onClick={(event) => {
                                event.stopPropagation();
                                openHistoryTab(row);
                              }}
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
                              disabled={!isEditable}
                              aria-label="Архив"
                              onClick={(event) => {
                                event.stopPropagation();
                                openArchiveDialog(row);
                              }}
                            >
                              {Number(row?.is_archived) === 1 ? (
                                <UnarchiveOutlinedIcon fontSize="small" />
                              ) : (
                                <ArchiveOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={getDeleteTooltip(row, isEditable, canDeleteAction)}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={
                                !isEditable || !canDeleteAction || row?.can_delete === false
                              }
                              aria-label="Удалить"
                              onClick={(event) => {
                                event.stopPropagation();
                                openDeleteDialog(row);
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Stack
                      spacing={1.5}
                      sx={{ py: 2 }}
                    >
                      <Typography color="text.secondary">
                        Ничего не найдено. Измените фильтры или режим показа.
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setState({
                              search: "",
                              categoryId: "",
                              tagId: "",
                              archiveMode: "active",
                              page: 0,
                            })
                          }
                        >
                          Сбросить фильтры
                        </Button>
                        <Button
                          variant="text"
                          onClick={loadRows}
                        >
                          Обновить список
                        </Button>
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, nextPage) => setState({ page: nextPage })}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) =>
            setState({
              page: 0,
              rowsPerPage: Number(event.target.value) || 25,
            })
          }
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
        />

        <SkladSiteItemViewDialog
          open={modal.open && modal.mode === "view"}
          loading={modal.loading}
          section={modal.section}
          onSectionChange={(section) =>
            setState({
              modal: {
                ...modal,
                section,
              },
            })
          }
          detail={detail}
          isEditable={isEditable}
          onEdit={() => (detail?.id ? openEdit(detail) : null)}
          onOpenHistory={() => (detail?.id ? openHistoryTab(detail) : null)}
          onOpenImageHistory={() => (detail?.id ? openHistoryTab(detail, "image") : null)}
          onUploadImage={(file) => handleUploadImage(detail, file, "image")}
          onSyncVk={handleSyncVk}
          onClose={closeModal}
        />

        <SkladSiteItemEditorDialog
          open={modal.open && (modal.mode === "edit" || modal.mode === "create")}
          mode={modal.mode}
          draft={draft}
          categories={categories}
          tags={tags}
          loading={modal.loading}
          isEditable={isEditable}
          onUploadImage={(file) => handleUploadImage(draft, file, modal.section || "tech")}
          onSubmit={submitDraft}
          onCreateTag={handleCreateTag}
          onRenameTag={handleRenameTag}
          showAlert={showAlert}
          onClose={closeModal}
        />
        <SkladDeleteDialog
          open={deleteDialog.open}
          loading={deleteDialog.loading}
          title="Удалить товар сайта?"
          description={`Запись "${deleteDialog?.row?.name || ""}" будет удалена без возможности восстановления.`}
          warning="Если товар уже использовался, удаление будет недоступно."
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
        <SkladDeleteDialog
          open={archiveDialog.open}
          loading={archiveDialog.loading}
          title={
            Number(archiveDialog?.row?.is_archived) === 1
              ? "Вернуть товар сайта из архива?"
              : "Отправить товар сайта в архив?"
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
      </Stack>
    </Paper>
  );

  return {
    search,
    categoryId,
    tagId,
    archiveMode,
    loadRows,
    content,
  };
}
