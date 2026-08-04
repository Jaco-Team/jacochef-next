import { create } from "zustand";
import dayjs from "dayjs";

import {
  CLOSE_BUY_TABS,
  filterCategoryItems,
  getReadableError,
  getVisibleSelectedCategory,
} from "./closeBuyUtils";

const defaultPagination = {
  page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
};

const getDefaultHistoryFilters = () => ({
  category_id: "all",
  date_from: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
  date_to: dayjs().format("YYYY-MM-DD"),
  search: "",
  action: "all",
  author: "",
});

const defaultSheets = {
  categoryActions: { open: false, categoryId: null },
  closeConfirmation: { open: false, categoryId: null, nextIsActive: null },
};

export const useCloseBuyStore = create((set, get) => ({
  module: "close_buy",
  moduleName: "Управление товарами",
  access: {},
  points: [],
  selectedPointId: "",
  activeTab: CLOSE_BUY_TABS.management,
  search: "",
  statusFilter: "all",
  categories: [],
  summary: null,
  selectedCategoryId: null,
  loading: {
    bootstrap: false,
    management: false,
    history: false,
    itemSaveId: null,
    categorySaveId: null,
  },
  errors: {
    bootstrap: "",
    management: "",
    history: "",
  },
  history: [],
  historyPagination: defaultPagination,
  historyFilters: getDefaultHistoryFilters(),
  sheets: defaultSheets,
  successMessage: "",
  requestIds: {
    bootstrap: 0,
    management: 0,
    history: 0,
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setHistoryPage: (page) =>
    set((state) => ({
      historyPagination: {
        ...state.historyPagination,
        page,
      },
    })),
  setHistoryPerPage: (per_page) =>
    set((state) => ({
      historyPagination: {
        ...state.historyPagination,
        per_page,
        page: 1,
      },
    })),
  setHistoryFilters: (patch) =>
    set((state) => ({
      historyFilters: {
        ...state.historyFilters,
        ...patch,
      },
      historyPagination: {
        ...state.historyPagination,
        page: 1,
      },
    })),
  openCategoryActions: (categoryId) =>
    set((state) => ({
      sheets: {
        ...state.sheets,
        categoryActions: { open: true, categoryId },
      },
    })),
  closeCategoryActions: () =>
    set((state) => ({
      sheets: {
        ...state.sheets,
        categoryActions: { open: false, categoryId: null },
      },
    })),
  openCloseConfirmation: (categoryId, nextIsActive) =>
    set((state) => ({
      sheets: {
        ...state.sheets,
        closeConfirmation: { open: true, categoryId, nextIsActive },
      },
    })),
  closeCloseConfirmation: () =>
    set((state) => ({
      sheets: {
        ...state.sheets,
        closeConfirmation: { open: false, categoryId: null, nextIsActive: null },
      },
    })),
  clearSuccessMessage: () => set({ successMessage: "" }),
  clearError: (key) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [key]: "",
      },
    })),

  getSelectedCategory: () => {
    const state = get();
    return getVisibleSelectedCategory(state.categories, state.selectedCategoryId);
  },

  getVisibleCategoryItems: () => {
    const state = get();
    const category = get().getSelectedCategory();
    return category ? filterCategoryItems(category.items, state.search) : [];
  },

  bootstrap: async (api) => {
    const requestId = get().requestIds.bootstrap + 1;
    set((state) => ({
      loading: { ...state.loading, bootstrap: true },
      errors: { ...state.errors, bootstrap: "" },
      requestIds: { ...state.requestIds, bootstrap: requestId },
    }));

    try {
      const response = await api.getAll();
      if (get().requestIds.bootstrap !== requestId) return;

      const selectedPointId =
        String(get().selectedPointId || "") || String(response.points?.[0]?.id || "");

      set((state) => ({
        moduleName: response.moduleName,
        access: response.access,
        points: response.points,
        selectedPointId,
        loading: { ...state.loading, bootstrap: false },
      }));

      if (response.moduleName) document.title = response.moduleName;
    } catch (error) {
      if (get().requestIds.bootstrap !== requestId) return;

      set((state) => ({
        loading: { ...state.loading, bootstrap: false },
        errors: {
          ...state.errors,
          bootstrap: getReadableError(error, "Не удалось загрузить Close Buy"),
        },
      }));
    }
  },

  changePoint: async (pointId) => {
    const nextPointId = String(pointId || "");
    set((state) => ({
      selectedPointId: nextPointId,
      selectedCategoryId: null,
      search: "",
      categories: [],
      summary: null,
      history: [],
      historyFilters: getDefaultHistoryFilters(),
      historyPagination: defaultPagination,
      sheets: defaultSheets,
      errors: { ...state.errors, management: "", history: "" },
    }));

    if (!nextPointId) return;
  },

  loadManagement: async (api, options = {}) => {
    const pointId = Number(get().selectedPointId);
    if (!pointId) return;

    const requestId = get().requestIds.management + 1;
    const { categoryId, search, statusFilter } = get();

    set((state) => ({
      loading: { ...state.loading, management: true },
      errors: { ...state.errors, management: "" },
      requestIds: { ...state.requestIds, management: requestId },
    }));

    try {
      const response = await api.getItems({
        point_id: pointId,
        category_id: options.categoryId ?? undefined,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      if (
        get().requestIds.management !== requestId ||
        String(response.point_id) !== String(get().selectedPointId)
      ) {
        return;
      }

      const visibleCategory = getVisibleSelectedCategory(
        response.categories,
        options.resetSelection ? null : get().selectedCategoryId,
      );

      set((state) => ({
        categories: response.categories,
        summary: response.summary,
        selectedCategoryId: visibleCategory?.id ?? null,
        loading: { ...state.loading, management: false },
      }));
    } catch (error) {
      if (get().requestIds.management !== requestId) return;

      set((state) => ({
        loading: { ...state.loading, management: false },
        errors: {
          ...state.errors,
          management: getReadableError(error, "Не удалось загрузить категории"),
        },
      }));
    }
  },

  loadHistory: async (api) => {
    const pointId = Number(get().selectedPointId);
    if (!pointId) return;

    const requestId = get().requestIds.history + 1;
    const { historyFilters, historyPagination } = get();

    set((state) => ({
      loading: { ...state.loading, history: true },
      errors: { ...state.errors, history: "" },
      requestIds: { ...state.requestIds, history: requestId },
    }));

    try {
      const response = await api.getHistory({
        point_id: pointId,
        category_id:
          historyFilters.category_id && historyFilters.category_id !== "all"
            ? Number(historyFilters.category_id)
            : undefined,
        date_from: historyFilters.date_from || undefined,
        date_to: historyFilters.date_to || undefined,
        search: historyFilters.search.trim() || undefined,
        action: historyFilters.action !== "all" ? historyFilters.action : undefined,
        author: historyFilters.author.trim() || undefined,
        page: historyPagination.page,
        per_page: historyPagination.per_page,
      });

      if (get().requestIds.history !== requestId) return;

      set((state) => ({
        history: response.history,
        historyPagination: response.pagination,
        loading: { ...state.loading, history: false },
      }));
    } catch (error) {
      if (get().requestIds.history !== requestId) return;

      set((state) => ({
        loading: { ...state.loading, history: false },
        errors: {
          ...state.errors,
          history: getReadableError(error, "Не удалось загрузить историю"),
        },
      }));
    }
  },

  saveItem: async ({ itemId, isActive, categoryId }, api) => {
    if (get().loading.itemSaveId === itemId || !get().selectedPointId) return;

    set((state) => ({
      loading: { ...state.loading, itemSaveId: itemId },
      successMessage: "",
    }));

    try {
      await api.saveItem({
        point_id: Number(get().selectedPointId),
        item_id: Number(itemId),
        is_active: Number(isActive) === 1 ? 1 : 0,
      });

      await get().loadManagement(api);
      set((state) => ({
        loading: { ...state.loading, itemSaveId: null },
        successMessage: "Состояние товара обновлено",
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, itemSaveId: null },
        errors: {
          ...state.errors,
          management: getReadableError(error, "Не удалось сохранить товар"),
        },
      }));
    }
  },

  saveCategory: async ({ categoryId, isActive }, api) => {
    if (get().loading.categorySaveId === categoryId || !get().selectedPointId) return;

    set((state) => ({
      loading: { ...state.loading, categorySaveId: categoryId },
      successMessage: "",
    }));

    try {
      await api.saveCategory({
        point_id: Number(get().selectedPointId),
        category_id: Number(categoryId),
        is_active: Number(isActive) === 1 ? 1 : 0,
      });

      set((state) => ({
        sheets: defaultSheets,
      }));

      await get().loadManagement(api);

      if (get().activeTab === CLOSE_BUY_TABS.history) {
        await get().loadHistory(api);
      }

      set((state) => ({
        loading: { ...state.loading, categorySaveId: null },
        successMessage: "Состояние категории обновлено",
      }));
    } catch (error) {
      set((state) => ({
        loading: { ...state.loading, categorySaveId: null },
        errors: {
          ...state.errors,
          management: getReadableError(error, "Не удалось сохранить категорию"),
        },
      }));
    }
  },
}));
