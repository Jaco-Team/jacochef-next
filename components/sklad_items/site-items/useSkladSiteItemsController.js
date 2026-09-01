"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import SkladSiteItemsContent from "./SkladSiteItemsContent";
import SkladSiteCategoryDialog from "./SkladSiteCategoryDialog";
import useSkladTableSort from "../table/useSkladTableSort";
import {
  getDeleteError,
  normalizeSiteItemDraft,
  normalizeSiteItemSavePayload,
  validateSiteItemDraft,
} from "./siteItems.helpers";
import { dedupeSelectOptions } from "./siteItemEditor.helpers";
import { useSkladSiteItemsStore } from "./useSkladSiteItemsStore";
import {
  SITE_ITEMS_MODAL_FIELD_KEYS,
  canEditAccess,
  canViewAccess,
  hasAccessValue,
} from "./skladSiteItemsAccess";

function prepareLegacyDetail(response, fallbackCategories = [], fallbackTags = []) {
  const itemsStage = response?.items_stage || { stage_1: [], stage_2: [], stage_3: [], all: [] };
  const stageOptions = new Map(
    (itemsStage?.all || []).map((item) => [`${item?.type}:${item?.id}`, item]),
  );
  const normalizeStageRows = (rows = []) =>
    rows.map((item) => {
      const itemId =
        item?.type === "rec"
          ? item?.rec_id
          : item?.type === "item"
            ? item?.warehouse_item_id
            : item?.pf_id;
      const option = stageOptions.get(`${item?.type}:${itemId}`);

      return {
        ...item,
        type_id: option
          ? { id: option.id, name: option.name }
          : { id: itemId || "", name: item?.name || "" },
      };
    });
  const itemItems = response?.item_items || { this_items: [], all_items: [] };
  const itemOptions = new Map((itemItems?.all_items || []).map((item) => [String(item?.id), item]));

  return {
    ...response,
    item: {
      ...(response?.item || {}),
      tags_all: response?.tags_all || fallbackTags,
    },
    cat_list: response?.cat_list || fallbackCategories,
    tags_all: response?.tags_all || fallbackTags,
    items_stage: {
      ...itemsStage,
      stage_1: normalizeStageRows(itemsStage?.stage_1),
      stage_2: normalizeStageRows(itemsStage?.stage_2),
      stage_3: normalizeStageRows(itemsStage?.stage_3),
      not_stage: [],
    },
    item_items: {
      ...itemItems,
      this_items: (itemItems?.this_items || []).map((item) => {
        const itemId = typeof item?.item_id === "object" ? item.item_id?.id : item?.item_id;
        const option = itemOptions.get(String(itemId));

        return {
          ...item,
          item_id: option
            ? { id: option.id, name: option.name }
            : { id: itemId || "", name: item?.name || "" },
        };
      }),
    },
  };
}

function legacySavePayload(draft) {
  const item = JSON.parse(JSON.stringify(draft || {}));
  const itemItems = item?.item_items || { this_items: [] };
  const itemsStage = item?.items_stage || { stage_1: [], stage_2: [], stage_3: [] };
  const stageRows = (stage, type) =>
    (itemsStage?.[stage] || [])
      .filter((row) => row?.type === type)
      .map((row) => ({
        ...row,
        [type === "pf" ? "pf_id" : type === "rec" ? "rec_id" : "warehouse_item_id"]:
          typeof row?.type_id === "object" ? Number(row.type_id?.id) : Number(row?.type_id),
      }));

  return {
    ...item,
    item_items: {
      ...itemItems,
      this_items: (itemItems?.this_items || []).map((row) => ({
        ...row,
        item_id: typeof row?.item_id === "object" ? Number(row.item_id?.id) : Number(row?.item_id),
      })),
    },
    pf_stage_1: stageRows("stage_1", "pf"),
    pf_stage_2: stageRows("stage_2", "pf"),
    pf_stage_3: stageRows("stage_3", "pf"),
    rec_stage_1: stageRows("stage_1", "rec"),
    rec_stage_2: stageRows("stage_2", "rec"),
    rec_stage_3: stageRows("stage_3", "rec"),
    item_stage_1: stageRows("stage_1", "item"),
    item_stage_2: stageRows("stage_2", "item"),
    item_stage_3: stageRows("stage_3", "item"),
  };
}

export default function useSkladSiteItemsController({ showAlert }) {
  const api = useSkladApi();
  const {
    access,
    canArchiveSiteItems,
    canDelete,
    canCreateSiteItem,
    canManageSiteItems,
    canUseSiteItemPastDate,
    canViewSiteItemsHistory,
  } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);

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
  const [categoryDialog, setCategoryDialog] = useState({ open: false, loading: false });

  const canViewSiteItemForm = SITE_ITEMS_MODAL_FIELD_KEYS.some((field) =>
    canViewAccess(access, field, false),
  );
  const canEditSiteItemForm = SITE_ITEMS_MODAL_FIELD_KEYS.some((field) =>
    canEditAccess(access, field, false),
  );
  const isEditable = canEditSiteItemForm || canManageSiteItems;
  const canCreate = canCreateSiteItem;
  const canDeleteAction = canDelete("site_item");
  const canEditActivity = canEditAccess(access, "is_show", false);
  const canEditCash =
    hasAccessValue(access?.kassa_edit) || canEditAccess(access, "show_program", false);
  const canEditSort = canEditAccess(access, "sort", false);
  const canManageTags =
    hasAccessValue(access?.change_tag_access) && canEditAccess(access, "tags", false);

  const loadRows = useCallback(
    async ({ resetPage = false } = {}) => {
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItems({
          search: String(search || "").trim(),
          archive_mode: "all",
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
    [api, search, setShellState, setState, showAlert],
  );

  const categoryOptions = useMemo(
    () =>
      [{ id: "", name: "Все категории" }].concat(
        (categories || [])
          .filter((item) => item?.id != null && item?.id !== "")
          .map((item) => ({
            id: String(item.id),
            name: item?.name || String(item.id),
            items_count: item?.items_count,
          })),
      ),
    [categories],
  );

  const parentOptions = useMemo(
    () =>
      dedupeSelectOptions(
        (categories || []).map((item) => ({
          id: String(item?.id ?? ""),
          name: item?.name || String(item?.id || ""),
        })),
      ),
    [categories],
  );

  const openCategoryDialog = useCallback(() => {
    if (canCreate) {
      setCategoryDialog({ open: true, loading: false });
    }
  }, [canCreate]);

  const closeCategoryDialog = useCallback(() => {
    setCategoryDialog({ open: false, loading: false });
  }, []);

  const createCategory = useCallback(
    async (payload) => {
      setCategoryDialog({ open: true, loading: true });

      try {
        const response = await api.createSiteCategory(payload);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка создания категории");
        }

        await loadRows();
        closeCategoryDialog();
        showAlert(response?.text || "Категория создана", true);
      } catch (error) {
        setCategoryDialog({ open: true, loading: false });
        showAlert(error?.message || "Ошибка создания категории", false);
      }
    },
    [api, closeCategoryDialog, loadRows, showAlert],
  );

  const tagOptions = useMemo(
    () =>
      dedupeSelectOptions(
        [{ id: "", name: "Все теги" }].concat(
          (tags || []).map((item) => ({
            id: String(item?.id ?? ""),
            name: item?.name || String(item?.id || ""),
          })),
        ),
      ),
    [tags],
  );

  const visibleRows = useMemo(
    () =>
      rows.filter((row) =>
        archiveMode === "archive" ? Number(row?.is_archived) === 1 : Number(row?.is_archived) !== 1,
      ),
    [archiveMode, rows],
  );

  const siteItemSort = useSkladTableSort(visibleRows, {
    name: (row) => row?.name,
    category: (row) => row?.category_name,
    kkal: (row) => row?.kkal_preview ?? row?.kkal,
    dateStart: (row) => row?.date_start,
    dateEnd: (row) => row?.date_end,
  });

  const paginatedRows = siteItemSort.sortedRows;

  useEffect(() => {
    const maxPage = visibleRows.length
      ? Math.max(0, Math.ceil(visibleRows.length / rowsPerPage) - 1)
      : 0;

    if (page > maxPage) {
      setState({ page: maxPage });
    }
  }, [page, rowsPerPage, setState, visibleRows.length]);

  const saveQuickField = useCallback(
    async (row, type, value) => {
      const permission = {
        is_show: canEditAccess(access, "is_show", false),
        show_program:
          hasAccessValue(access?.kassa_edit) || canEditAccess(access, "show_program", false),
        sort: canEditAccess(access, "sort", false),
      }[type];

      if (!row?.id || !permission) {
        return;
      }

      setShellState({ isLoading: true });

      try {
        const response = await api.saveSiteItemFlag({
          id: Number(row.id),
          type,
          value,
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка сохранения");
        }

        await loadRows();
      } catch (error) {
        showAlert(error?.message || "Ошибка сохранения", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [access, api, loadRows, setShellState, showAlert],
  );

  const closeModal = useCallback(() => {
    setState({
      modal: {
        open: false,
        mode: "edit",
        loading: false,
        section: "main",
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
      if (!row?.id || !canArchiveSiteItems) {
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
    [canArchiveSiteItems, setState],
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

    if (!row?.id || !canDelete("site_item")) {
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
  }, [
    api,
    canDelete,
    closeDeleteDialog,
    deleteDialog?.row,
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
        entity_type: "site_item",
        id: row.id,
        value: nextArchived,
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
    canArchiveSiteItems,
    closeArchiveDialog,
    loadRows,
    setShellState,
    setState,
    showAlert,
  ]);

  const openCreate = useCallback(() => {
    setState({
      modal: {
        open: true,
        mode: "create",
        loading: true,
        section: "main",
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
        const legacyDetail = prepareLegacyDetail(response, categories, tags);

        setState({
          categories: response?.cat_list || categories,
          tags: response?.tags_all || tags,
          modal: {
            open: true,
            mode: "create",
            loading: false,
            section: "main",
          },
          detail: legacyDetail,
          draft: normalizedDraft,
        });
      })
      .catch((error) => {
        setState({
          modal: {
            open: false,
            mode: "edit",
            loading: false,
            section: "main",
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

  const persistSiteItem = useCallback(
    async (payload, pendingImageFile = null) => {
      const saveItem = modal.mode === "create" ? api.createSiteItem : api.updateSiteItem;

      setState({
        modal: {
          ...modal,
          loading: true,
        },
      });
      setShellState({ isLoading: true });

      try {
        const response = await saveItem(payload);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка сохранения");
        }

        if (pendingImageFile) {
          const itemId = Number(response?.item_id || response?.id || payload?.id || 0);

          if (!itemId) {
            throw new Error("Карточка сохранена, но не удалось определить товар для изображения");
          }

          const imageResponse = await api.uploadSiteItemImage(pendingImageFile, {
            id: itemId,
            slot: "main",
            revision_key:
              response?.revision_status === "scheduled"
                ? response?.revision_key || response?.history_id
                : undefined,
          });

          if (!imageResponse?.st) {
            throw new Error(
              imageResponse?.text || "Карточка сохранена, но изображение загрузить не удалось",
            );
          }
        }

        showAlert(
          pendingImageFile
            ? "Карточка и изображение сохранены"
            : response?.text || "Успешно сохранено",
          true,
        );
        closeModal();
        await loadRows();
        return response;
      } catch (error) {
        setState({
          modal: {
            ...modal,
            loading: false,
          },
        });
        showAlert(error?.message || "Ошибка сохранения", false);
        return { st: false, text: error?.message || "Ошибка сохранения" };
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, closeModal, loadRows, modal, setShellState, setState, showAlert],
  );

  const submitDraft = useCallback(
    async (nextDraft, pendingImageFile = null) => {
      const validationError = validateSiteItemDraft(nextDraft);

      if (validationError) {
        showAlert(validationError, false);
        return { st: false, text: validationError };
      }

      return persistSiteItem(normalizeSiteItemSavePayload(nextDraft), pendingImageFile);
    },
    [persistSiteItem, showAlert],
  );

  const submitLegacyDraft = useCallback(
    async (nextDraft, pendingImageFile = null) =>
      persistSiteItem(legacySavePayload(nextDraft), pendingImageFile),
    [persistSiteItem],
  );

  const openEdit = useCallback(
    async (row, section = "main") => {
      if (!row?.id || (section !== "history" && !canViewSiteItemForm && !isEditable)) {
        return;
      }

      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: true,
          section,
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

        let normalizedDraft = normalizeSiteItemDraft(response, categories);
        let legacyDetail = prepareLegacyDetail(response, categories, tags);
        if (Number(row?.is_scheduled) === 1 && Number(row?.is_active) !== 1) {
          const revisionResponse = await api.historyGetOne({
            entity_type: "site_item",
            entity_id: row.id,
            revision_key: row.scheduled_revision_key,
          });
          if (!revisionResponse?.st) {
            throw new Error(revisionResponse?.text || "Ошибка загрузки запланированной версии");
          }
          const snapshot = revisionResponse?.revision?.snapshot;
          if (snapshot) {
            const scheduledResponse = {
              ...response,
              item: { ...snapshot, revision_key: row.scheduled_revision_key },
              item_items: snapshot.item_items,
              items_stage: snapshot.items_stage,
              composition_source: snapshot.composition_source,
              composition_derived: snapshot.composition_derived,
            };
            normalizedDraft = normalizeSiteItemDraft(scheduledResponse, categories);
            legacyDetail = prepareLegacyDetail(scheduledResponse, categories, tags);
          }
        }

        setState({
          modal: {
            open: true,
            mode: "edit",
            loading: false,
            section,
          },
          detail: legacyDetail,
          draft: normalizedDraft,
        });
      } catch (error) {
        setState({
          modal: {
            open: false,
            mode: "edit",
            loading: false,
            section: "main",
          },
          detail: null,
          draft: null,
        });
        showAlert(error?.message || "Ошибка загрузки товара", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, canViewSiteItemForm, categories, isEditable, setShellState, setState, showAlert, tags],
  );

  const refreshOpenDetail = useCallback(
    async (id, section = "main", revisionKey = null) => {
      if (!id) {
        return;
      }

      const response = await api.getSiteItem(id);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки товара");
      }

      let normalizedDraft = normalizeSiteItemDraft(response, categories);
      if (revisionKey) {
        const revisionResponse = await api.historyGetOne({
          entity_type: "site_item",
          entity_id: id,
          revision_key: revisionKey,
        });
        if (!revisionResponse?.st) {
          throw new Error(revisionResponse?.text || "Ошибка загрузки запланированной версии");
        }
        const snapshot = revisionResponse?.revision?.snapshot;
        if (snapshot) {
          normalizedDraft = normalizeSiteItemDraft(
            {
              ...response,
              item: { ...snapshot, revision_key: revisionKey },
              item_items: snapshot.item_items,
              items_stage: snapshot.items_stage,
              composition_source: snapshot.composition_source,
              composition_derived: snapshot.composition_derived,
            },
            categories,
          );
        }
      }

      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: false,
          section,
        },
        detail: prepareLegacyDetail(response, categories, tags),
        draft: normalizedDraft,
      });
    },
    [api, categories, setState, tags],
  );

  const handleRestoreImage = useCallback(
    async (row, historyId, section = "history") => {
      if (!row?.id || !historyId) {
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
        const response = await api.restoreSiteItemImage({
          id: row.id,
          history_id: historyId,
          slot: "main",
        });

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка восстановления изображения");
        }

        await refreshOpenDetail(row.id, section);
        showAlert(response?.text || "Изображение восстановлено", true);
        await loadRows();
      } catch (error) {
        setState({
          modal: {
            ...modal,
            loading: false,
            section,
          },
        });
        showAlert(error?.message || "Ошибка восстановления изображения", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, loadRows, modal, refreshOpenDetail, setShellState, setState, showAlert],
  );

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
      await loadRows();

      return {
        tags: nextTags,
        createdTag:
          nextTags.find((tag) => String(tag?.id) === String(response?.id)) ||
          nextTags.find((tag) => String(tag?.name || "").trim() === trimmedName) ||
          null,
        text: response?.text || "Тег создан",
      };
    },
    [api, loadRows, setState],
  );

  const handleRenameTag = useCallback(
    async (tagIdValue, name) => {
      const normalizedTagId = tagIdValue ? Number(tagIdValue) : null;
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
      await loadRows();

      return {
        tags: nextTags,
        text: response?.text || "Тег обновлен",
      };
    },
    [api, loadRows, setState],
  );

  return {
    search,
    categoryId,
    tagId,
    archiveMode,
    loadRows,
    content: (
      <>
        <SkladSiteItemsContent
          search={search}
          categoryId={categoryId}
          tagId={tagId}
          archiveMode={archiveMode}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
          rows={rows}
          paginatedRows={paginatedRows}
          sortBy={siteItemSort.sortBy}
          sortDirection={siteItemSort.sortDirection}
          onSort={siteItemSort.requestSort}
          page={page}
          rowsPerPage={rowsPerPage}
          modal={modal}
          detail={detail}
          draft={draft}
          access={access}
          categories={categories}
          tags={tags}
          deleteDialog={deleteDialog}
          archiveDialog={archiveDialog}
          isEditable={isEditable}
          canCreate={canCreate}
          canManageTags={canManageTags}
          canArchiveAction={canArchiveSiteItems}
          canDeleteAction={canDeleteAction}
          canEditActivity={canEditActivity}
          canEditCash={canEditCash}
          canEditSort={canEditSort}
          canViewHistory={canViewSiteItemsHistory}
          canCreateCategory={canCreate}
          allowPastDate={canUseSiteItemPastDate}
          showAlert={showAlert}
          setState={setState}
          loadRows={loadRows}
          onSaveQuickField={saveQuickField}
          openCreate={openCreate}
          onCreateCategory={openCategoryDialog}
          openEdit={openEdit}
          handleRestoreImage={handleRestoreImage}
          openArchiveDialog={openArchiveDialog}
          openDeleteDialog={openDeleteDialog}
          closeModal={closeModal}
          closeDeleteDialog={closeDeleteDialog}
          closeArchiveDialog={closeArchiveDialog}
          confirmDelete={confirmDelete}
          confirmArchive={confirmArchive}
          handleCreateTag={handleCreateTag}
          handleRenameTag={handleRenameTag}
          submitDraft={submitDraft}
          submitLegacyDraft={submitLegacyDraft}
        />
        <SkladSiteCategoryDialog
          open={categoryDialog.open}
          loading={categoryDialog.loading}
          parentOptions={parentOptions}
          onClose={closeCategoryDialog}
          onSubmit={createCategory}
        />
      </>
    ),
  };
}
