"use client";

import { create } from "zustand";

const emptyScreenMap = {
  dashboard: null,
  kitchen: null,
  leaders: null,
  quality: null,
  delivery: null,
};

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
  filters: {
    period_type: "day",
    date_start: null,
    date_end: null,
    period_label: "",
    point_list: [],
    category_ids: [],
    stage_type: "",
  },
  metaByScreen: emptyScreenMap,
  dashboardData: null,
  kitchenData: null,
  leadersData: null,
  qualityData: null,
  deliveryData: null,

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
      filters: payload.filters,
      moduleName: payload.moduleName || "Эффективность кафе",
    }),
  setFilters: (nextFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...nextFilters,
      },
    })),
  setScreenData: (screenKey, payload) =>
    set((state) => ({
      [`${screenKey}Data`]: payload,
      metaByScreen: {
        ...state.metaByScreen,
        [screenKey]: payload?.meta || null,
      },
    })),
}));

export default useCafePerformanceStore;
