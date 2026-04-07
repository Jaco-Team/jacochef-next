import { create } from "zustand";

export const competitorStatusColorMap = {
  completed: "success",
  completed_with_errors: "warning",
  failed: "error",
};

export const useCompetitorParsersStore = create((set) => ({
  module: "competitor_parsers",
  moduleName: "Competitor Parsers",
  loading: false,
  refreshToken: 0,
  access: null,
  filters: {
    enabled_only: true,
    search: "",
  },
  sources: [],
  itemsModal: {
    open: false,
    loading: false,
    source: null,
    run: null,
    items: [],
  },

  setLoading: (loading) => set({ loading }),
  setFilters: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    })),
  setData: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),
  setItemsModal: (patch) =>
    set((state) => ({
      itemsModal: {
        ...state.itemsModal,
        ...patch,
      },
    })),
  refreshAll: () => set({ refreshToken: Date.now() }),
}));
