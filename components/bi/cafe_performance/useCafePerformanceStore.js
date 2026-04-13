"use client";

import { create } from "zustand";

export const EMPTY_FILTERS = {
  period_type: "day",
  date_start: null,
  date_end: null,
  period_label: "",
  point_list: [],
  category_ids: [],
  stage_type: "",
};

const createEmptyScreen = () => ({
  data: null,
  meta: null,
  queryKey: "",
});

const createEmptyScreens = () => ({
  dashboard: createEmptyScreen(),
  kitchen: createEmptyScreen(),
  leaders: createEmptyScreen(),
  quality: createEmptyScreen(),
  delivery: createEmptyScreen(),
});

const useCafePerformanceStore = create((set) => ({
  module: "cafe_performance",
  moduleName: "Эффективность кафе",
  access: [],
  loading: false,
  bootstrapped: false,
  tab: 0,
  points: [],
  stageTypes: [],
  orderTypes: [],
  categories: [],
  defaults: {},
  filters: EMPTY_FILTERS,
  appliedFilters: EMPTY_FILTERS,
  screens: createEmptyScreens(),

  setLoading: (loading) => set({ loading }),
  setTab: (tab) => set({ tab }),
  setBootstrap: (payload) =>
    set({
      bootstrapped: true,
      access: payload.access || [],
      points: payload.points || [],
      stageTypes: payload.stageTypes || [],
      orderTypes: payload.orderTypes || [],
      categories: payload.categories || [],
      defaults: payload.defaults || {},
      filters: payload.filters || EMPTY_FILTERS,
      appliedFilters: payload.appliedFilters || payload.filters || EMPTY_FILTERS,
      moduleName: payload.moduleName || "Эффективность кафе",
    }),
  setFilters: (nextFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...nextFilters,
      },
    })),
  setAppliedFilters: (nextFilters) =>
    set((state) => ({
      appliedFilters: {
        ...state.appliedFilters,
        ...nextFilters,
      },
    })),
  setScreenResult: (screenKey, payload, queryKey) =>
    set((state) => ({
      screens: {
        ...state.screens,
        [screenKey]: {
          data: payload || null,
          meta: payload?.meta || null,
          queryKey: queryKey || "",
        },
      },
    })),
  resetScreens: (screenKeys) =>
    set((state) => {
      const nextScreens = { ...state.screens };
      screenKeys.forEach((screenKey) => {
        nextScreens[screenKey] = createEmptyScreen();
      });
      return { screens: nextScreens };
    }),
}));

export default useCafePerformanceStore;
