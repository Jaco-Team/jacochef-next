"use client";

import { useCallback, useEffect, useMemo } from "react";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import { useSkladHistoryStore, HISTORY_INITIAL_STATE } from "../history/useSkladHistoryStore";
import { getVisibleSkladTabs } from "../skladTabs";
import SkladProductionContent from "./SkladProductionContent";
import {
  createEmptyProductionDraft,
  ENTITY_TYPES,
  getDeleteError,
  getEntityDetailApi,
  getEntityLoadApi,
  getEntitySaveApi,
  normalizeProductionDraft,
  normalizeProductionSavePayload,
  validateProductionDraft,
} from "./production.helpers";
import { PRODUCTION_ENTITY_OPTIONS, useSkladProductionStore } from "./useSkladProductionStore";

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
  const entityFilter = useSkladProductionStore((state) => state.entityFilter);
  const categoryId = useSkladProductionStore((state) => state.categoryId);
  const archiveMode = useSkladProductionStore((state) => state.archiveMode);
  const page = useSkladProductionStore((state) => state.page);
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

  const mergedRows = useMemo(() => {
    return ENTITY_TYPES.flatMap((entityType) => {
      const rows = Array.isArray(rowsByType?.[entityType]) ? rowsByType[entityType] : [];

      return rows.map((row) => ({
        ...row,
        entityType,
      }));
    })
      .filter((row) => !entityFilter || row?.entityType === entityFilter)
      .sort((left, right) =>
        String(left?.name || "").localeCompare(String(right?.name || ""), "ru"),
      );
  }, [entityFilter, rowsByType]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return mergedRows.slice(start, start + rowsPerPage);
  }, [mergedRows, page, rowsPerPage]);

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
          ...(resetPage ? { page: 0 } : {}),
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
    const maxPage = mergedRows.length
      ? Math.max(0, Math.ceil(mergedRows.length / rowsPerPage) - 1)
      : 0;

    if (page > maxPage) {
      setState({ page: maxPage });
    }
  }, [mergedRows.length, page, rowsPerPage, setState]);

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

  return {
    activeEntityType,
    search,
    entityFilter,
    categoryId,
    archiveMode,
    loadRows,
    content: (
      <SkladProductionContent
        activeEntityType={activeEntityType}
        search={search}
        entityFilter={entityFilter}
        entityOptions={PRODUCTION_ENTITY_OPTIONS}
        categoryId={categoryId}
        archiveMode={archiveMode}
        categoryOptions={categoryOptions}
        mergedRows={mergedRows}
        paginatedRows={paginatedRows}
        page={page}
        rowsPerPage={rowsPerPage}
        modal={modal}
        detail={detail}
        draft={draft}
        deleteDialog={deleteDialog}
        archiveDialog={archiveDialog}
        shellUnits={shellUnits}
        categories={categories}
        shellAllergens={shellAllergens}
        shellStorages={shellStorages}
        shellApps={shellApps}
        canDeleteAction={canDeleteAction}
        canManageProduction={canManageProduction}
        setState={setState}
        openCreate={openCreate}
        openView={openView}
        openEdit={openEdit}
        openHistoryTab={openHistoryTab}
        openArchiveDialog={openArchiveDialog}
        openDeleteDialog={openDeleteDialog}
        closeModal={closeModal}
        closeDeleteDialog={closeDeleteDialog}
        closeArchiveDialog={closeArchiveDialog}
        submitDraft={submitDraft}
        confirmDelete={confirmDelete}
        confirmArchive={confirmArchive}
      />
    ),
  };
}
