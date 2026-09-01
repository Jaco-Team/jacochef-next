"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import SkladProductionContent from "./SkladProductionContent";
import SkladProductionCategoryManagerDialog from "./SkladProductionCategoryManagerDialog";
import SkladProductionConvertDialog from "./SkladProductionConvertDialog";
import useSkladTableSort from "../table/useSkladTableSort";
import {
  createEmptyProductionDraft,
  ENTITY_TYPES,
  getDeleteError,
  getEntityDetailApi,
  getEntitySingleLabel,
  getEntityLoadApi,
  getEntitySaveApi,
  normalizeProductionDraft,
  normalizeProductionSavePayload,
  validateProductionDraft,
} from "./production.helpers";
import { PRODUCTION_RECIPE_CATEGORY_ID, useSkladProductionStore } from "./useSkladProductionStore";

export default function useSkladProductionController({ showAlert }) {
  const api = useSkladApi();
  const {
    canArchive,
    canDelete,
    canCreateProduction,
    canManageProduction,
    canUseProductionPastDate,
    canViewHistory,
  } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const summary = useSkladStore((state) => state.summary);
  const shellUnits = useSkladStore((state) => state.units);
  const categories = useSkladStore((state) => state.categories);
  const shellAllergens = useSkladStore((state) => state.allergens);
  const shellStorages = useSkladStore((state) => state.storages);
  const shellApps = useSkladStore((state) => state.apps);

  const activeEntityType = useSkladProductionStore((state) => state.activeEntityType);
  const rowsByType = useSkladProductionStore((state) => state.rowsByType);
  const search = useSkladProductionStore((state) => state.search);
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
  const [categoryManagerDialog, setCategoryManagerDialog] = useState({
    open: false,
    loading: false,
    categories: [],
  });
  const [convertDialog, setConvertDialog] = useState({
    open: false,
    loading: false,
    row: null,
    entityType: null,
  });

  const categoryOptions = useMemo(() => {
    const sourceAwareCategories = (categories || []).filter(
      (item) => item?.source_type === "semi_finished" && Number(item?.is_archived) !== 1,
    );

    return [
      { id: "", name: "Все категории" },
      ...sourceAwareCategories.map((item) => ({
        id: String(item.id),
        name: item.name,
        items_count: item?.items_count,
        recipes_count: item?.recipes_count,
        semi_finished_count: item?.semi_finished_count,
      })),
      {
        id: PRODUCTION_RECIPE_CATEGORY_ID,
        name: "Рецепты",
        items_count: Number(summary?.recipes_active || 0),
      },
    ];
  }, [categories, summary?.recipes_active]);

  const filteredRows = useMemo(() => {
    return ENTITY_TYPES.flatMap((entityType) => {
      const rows = Array.isArray(rowsByType?.[entityType]) ? rowsByType[entityType] : [];

      return rows.map((row) => ({
        ...row,
        entityType,
      }));
    }).filter((row) => {
      if (categoryId === PRODUCTION_RECIPE_CATEGORY_ID) {
        return row?.entityType === "recipe";
      }

      return true;
    });
  }, [categoryId, rowsByType]);

  const productionSort = useSkladTableSort(filteredRows, {
    name: (row) => row?.name,
    categories: (row) =>
      row?.entityType === "recipe"
        ? "Рецепты"
        : (row?.categories || []).map((item) => item?.name).join(", "),
    shelfLife: (row) => row?.shelf_life,
    dateStart: (row) => row?.date_start,
    dateEnd: (row) => row?.date_end,
  });
  const mergedRows = productionSort.sortedRows;

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return mergedRows.slice(start, start + rowsPerPage);
  }, [mergedRows, page, rowsPerPage]);

  const canDeleteAction = canDelete("recipe");
  const canManageCategories = canCreateProduction || canManageProduction || canDeleteAction;

  const refreshProductionCategories = useCallback(async () => {
    const response = await api.getCategories("semi_finished");

    if (!response?.st) {
      throw new Error(response?.text || "Ошибка обновления категорий");
    }

    const nextCategories = (Array.isArray(response?.list) ? response.list : []).filter(
      (item) => item?.source_type === "semi_finished",
    );
    setShellState({
      categories: [
        ...(categories || []).filter((item) => item?.source_type !== "semi_finished"),
        ...nextCategories,
      ],
    });

    return nextCategories;
  }, [api, categories, setShellState]);

  const openCategoryManagerDialog = useCallback(async () => {
    if (!canManageCategories) {
      return;
    }

    setCategoryManagerDialog({ open: true, loading: true, categories: [] });

    try {
      const response = await api.getCategories("semi_finished");

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки категорий");
      }

      setCategoryManagerDialog({
        open: true,
        loading: false,
        categories: (Array.isArray(response?.list) ? response.list : []).filter(
          (item) => item?.source_type === "semi_finished",
        ),
      });
    } catch (error) {
      setCategoryManagerDialog({ open: false, loading: false, categories: [] });
      showAlert(error?.message || "Ошибка загрузки категорий", false);
    }
  }, [api, canManageCategories, showAlert]);

  const closeCategoryManagerDialog = useCallback(() => {
    setCategoryManagerDialog({ open: false, loading: false, categories: [] });
  }, []);

  const createCategory = useCallback(
    async (name) => {
      setCategoryManagerDialog((current) => ({ ...current, loading: true }));
      setShellState({ isLoading: true });

      try {
        const response = await api.createProductionCategory(name);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка создания категории");
        }

        const nextCategories = await refreshProductionCategories();
        setCategoryManagerDialog({ open: true, loading: false, categories: nextCategories });
        showAlert(response?.text || "Категория создана", true);
        return true;
      } catch (error) {
        setCategoryManagerDialog((current) => ({ ...current, loading: false }));
        showAlert(error?.message || "Ошибка создания категории", false);
        return false;
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, refreshProductionCategories, setShellState, showAlert],
  );

  const loadRows = useCallback(
    async ({ resetPage = false, categoryIdOverride } = {}) => {
      setShellState({ isLoading: true });

      try {
        const selectedCategoryId =
          categoryIdOverride === undefined ? categoryId : categoryIdOverride;
        const isRecipeCategory = selectedCategoryId === PRODUCTION_RECIPE_CATEGORY_ID;
        const payload = {
          search: String(search || "").trim(),
          category_id: selectedCategoryId && !isRecipeCategory ? Number(selectedCategoryId) : null,
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
          throw new Error(semiFinishedResponse?.text || "Ошибка загрузки списка полуфабрикатов");
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

  const saveCategory = useCallback(
    async (category, name) => {
      setCategoryManagerDialog((current) => ({ ...current, loading: true }));
      setShellState({ isLoading: true });

      try {
        const response = await api.updateProductionCategory(category.id, name);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка переименования категории");
        }

        const nextCategories = await refreshProductionCategories();
        setCategoryManagerDialog({ open: true, loading: false, categories: nextCategories });
        await loadRows();
        showAlert(response?.text || "Категория переименована", true);
        return true;
      } catch (error) {
        setCategoryManagerDialog((current) => ({ ...current, loading: false }));
        showAlert(error?.message || "Ошибка переименования категории", false);
        return false;
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, loadRows, refreshProductionCategories, setShellState, showAlert],
  );

  const deleteCategory = useCallback(
    async (category) => {
      setCategoryManagerDialog((current) => ({ ...current, loading: true }));
      setShellState({ isLoading: true });

      try {
        const response = await api.deleteProductionCategory(category.id);

        if (!response?.st) {
          throw new Error(getDeleteError(response));
        }

        const nextCategories = await refreshProductionCategories();
        const shouldResetCategory = String(categoryId) === String(category.id);

        if (shouldResetCategory) {
          setState({ categoryId: "", page: 0 });
        }

        setCategoryManagerDialog({ open: true, loading: false, categories: nextCategories });
        await loadRows({
          resetPage: shouldResetCategory,
          categoryIdOverride: shouldResetCategory ? "" : categoryId,
        });
        showAlert(response?.text || "Категория удалена", true);
        return true;
      } catch (error) {
        setCategoryManagerDialog((current) => ({ ...current, loading: false }));
        showAlert(error?.message || "Ошибка удаления категории", false);
        return false;
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, categoryId, loadRows, refreshProductionCategories, setShellState, setState, showAlert],
  );

  useEffect(() => {
    const maxPage = mergedRows.length
      ? Math.max(0, Math.ceil(mergedRows.length / rowsPerPage) - 1)
      : 0;

    if (page > maxPage) {
      setState({ page: maxPage });
    }
  }, [mergedRows.length, page, rowsPerPage, setState]);

  const closeModal = useCallback(() => {
    setState({
      modal: {
        open: false,
        mode: "edit",
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

  const closeConvertDialog = useCallback(() => {
    setConvertDialog({ open: false, loading: false, row: null, entityType: null });
  }, []);

  const openConvertDialog = useCallback(
    (entityType, row) => {
      if (!canManageProduction || !row?.id || Number(row?.is_archived) === 1) {
        return;
      }

      setConvertDialog({ open: true, loading: false, row, entityType });
    },
    [canManageProduction],
  );

  const confirmConvert = useCallback(async () => {
    const row = convertDialog.row;
    const entityType = convertDialog.entityType;

    if (!canManageProduction || !row?.id || !ENTITY_TYPES.includes(entityType)) {
      return;
    }

    const targetType = entityType === "recipe" ? "semi_finished" : "recipe";
    setConvertDialog((current) => ({ ...current, loading: true }));
    setShellState({ isLoading: true });

    try {
      const response = await api.convertProductionEntity({
        id: row.id,
        from_type: entityType,
        to_type: targetType,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка преобразования");
      }

      closeConvertDialog();
      showAlert(
        `${getEntitySingleLabel(entityType)} преобразован в ${getEntitySingleLabel(targetType).toLowerCase()}`,
        true,
      );
      await loadRows({ resetPage: true });
    } catch (error) {
      setConvertDialog((current) => ({ ...current, loading: false }));
      showAlert(error?.message || "Ошибка преобразования", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    api,
    canManageProduction,
    closeConvertDialog,
    convertDialog.entityType,
    convertDialog.row,
    loadRows,
    setShellState,
    showAlert,
  ]);

  const openArchiveDialog = useCallback(
    (entityType, row) => {
      if (!row?.id || !canArchive) {
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
    [canArchive, setState],
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

    if (!row?.id || !entityType || !canDelete(entityType)) {
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
    canDelete,
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
    canArchive,
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

      if (Number(row?.is_scheduled) === 1 && Number(row?.is_active) !== 1) {
        const revisionResponse = await api.historyGetOne({
          entity_type: entityType,
          entity_id: row.id,
          revision_key: row.scheduled_revision_key,
        });
        if (!revisionResponse?.st) {
          throw new Error(revisionResponse?.text || "Ошибка загрузки запланированной версии");
        }
        const revision = revisionResponse?.revision;
        if (revision?.snapshot) {
          return normalizeProductionDraft(
            { ...revision.snapshot, revision_key: row.scheduled_revision_key },
            response,
          );
        }
      }

      return normalizeProductionDraft(response?.entity || {}, response);
    },
    [api],
  );

  const openEdit = useCallback(
    async (entityType, row, tab = "main") => {
      setState({
        activeEntityType: entityType,
        modal: {
          open: true,
          mode: "edit",
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
            mode: "edit",
            loading: false,
            tab,
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
    categoryId,
    archiveMode,
    loadRows,
    content: (
      <>
        <SkladProductionContent
          activeEntityType={activeEntityType}
          search={search}
          categoryId={categoryId}
          archiveMode={archiveMode}
          categoryOptions={categoryOptions}
          mergedRows={mergedRows}
          paginatedRows={paginatedRows}
          sortBy={productionSort.sortBy}
          sortDirection={productionSort.sortDirection}
          onSort={productionSort.requestSort}
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
          canArchiveAction={canArchive}
          canDeleteAction={canDeleteAction}
          canCreateProduction={canCreateProduction}
          canManageProduction={canManageProduction}
          canViewHistory={canViewHistory}
          canCreateCategory={canCreateProduction}
          allowPastDate={canUseProductionPastDate}
          canManageCategories={canManageCategories}
          onCreateCategory={openCategoryManagerDialog}
          onManageCategories={openCategoryManagerDialog}
          setState={setState}
          openCreate={openCreate}
          openEdit={openEdit}
          openArchiveDialog={openArchiveDialog}
          openDeleteDialog={openDeleteDialog}
          openConvertDialog={openConvertDialog}
          closeModal={closeModal}
          closeDeleteDialog={closeDeleteDialog}
          closeArchiveDialog={closeArchiveDialog}
          submitDraft={submitDraft}
          confirmDelete={confirmDelete}
          confirmArchive={confirmArchive}
        />
        <SkladProductionCategoryManagerDialog
          open={categoryManagerDialog.open}
          loading={categoryManagerDialog.loading}
          categories={categoryManagerDialog.categories}
          canCreate={canCreateProduction}
          canEdit={canManageProduction}
          canDelete={canDeleteAction}
          onClose={closeCategoryManagerDialog}
          onCreate={createCategory}
          onSave={saveCategory}
          onDelete={deleteCategory}
        />
        <SkladProductionConvertDialog
          open={convertDialog.open}
          loading={convertDialog.loading}
          row={convertDialog.row}
          entityType={convertDialog.entityType}
          onClose={closeConvertDialog}
          onConfirm={confirmConvert}
        />
      </>
    ),
  };
}
