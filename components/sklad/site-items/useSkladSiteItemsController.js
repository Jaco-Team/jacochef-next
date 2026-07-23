"use client";

import { useCallback, useEffect, useMemo } from "react";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import { getVisibleSkladTabs } from "../skladTabs";
import { HISTORY_INITIAL_STATE, useSkladHistoryStore } from "../history/useSkladHistoryStore";
import SkladSiteItemsContent from "./SkladSiteItemsContent";
import {
  dedupeSelectOptions,
  getDeleteError,
  normalizeSiteItemDraft,
  normalizeSiteItemSavePayload,
  validateSiteItemDraft,
} from "./siteItems.helpers";
import { useSkladSiteItemsStore } from "./useSkladSiteItemsStore";

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

  const categoryOptions = useMemo(
    () =>
      dedupeSelectOptions(
        [{ id: "", name: "Все категории" }].concat(
          (categories || []).map((item) => ({
            id: String(item?.id ?? ""),
            name: item?.name || String(item?.id || ""),
          })),
        ),
      ),
    [categories],
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

      return {
        tags: nextTags,
        text: response?.text || "Тег обновлен",
      };
    },
    [api, setState],
  );

  return {
    search,
    categoryId,
    tagId,
    archiveMode,
    loadRows,
    content: (
      <SkladSiteItemsContent
        search={search}
        categoryId={categoryId}
        tagId={tagId}
        archiveMode={archiveMode}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        rows={rows}
        paginatedRows={paginatedRows}
        page={page}
        rowsPerPage={rowsPerPage}
        modal={modal}
        detail={detail}
        draft={draft}
        categories={categories}
        tags={tags}
        deleteDialog={deleteDialog}
        archiveDialog={archiveDialog}
        isEditable={isEditable}
        canDeleteAction={canDeleteAction}
        showAlert={showAlert}
        setState={setState}
        loadRows={loadRows}
        openCreate={openCreate}
        openView={openView}
        openEdit={openEdit}
        openHistoryTab={openHistoryTab}
        openArchiveDialog={openArchiveDialog}
        openDeleteDialog={openDeleteDialog}
        closeModal={closeModal}
        closeDeleteDialog={closeDeleteDialog}
        closeArchiveDialog={closeArchiveDialog}
        confirmDelete={confirmDelete}
        confirmArchive={confirmArchive}
        handleUploadImage={handleUploadImage}
        handleSyncVk={handleSyncVk}
        handleCreateTag={handleCreateTag}
        handleRenameTag={handleRenameTag}
        submitDraft={submitDraft}
      />
    ),
  };
}
