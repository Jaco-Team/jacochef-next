"use client";

import { create } from "zustand";

export const PARAM_OPTIONS = [
  { id: "all", name: "Найти всех" },
  { id: "new", name: "Только новые" },
  { id: "current", name: "Только текущих" },
];

export const DEFAULT_FILTERS = {
  date_start_true: null,
  date_end_true: null,
  date_start_false: null,
  date_end_false: null,
  is_show_claim: false,
  is_show_claim_last: false,
  is_show_marketing: false,
  count_orders_min: 0,
  count_orders_max: 0,
  min_summ: 0,
  max_summ: 0,
  promo: "",
  no_promo: false,
  param: PARAM_OPTIONS[0],
  point: [],
  item: [],
  number: "",
  preset: "",
};

const DEFAULT_STATE = {
  module: "orders_extended",
  moduleName: "",
  rawAccess: null,
  points: [],
  allItems: [],
  items: [],
  filters: DEFAULT_FILTERS,
  rows: [],
  total: 0,
  page: 0,
  perPage: 10,
  loading: {
    bootstrap: false,
    search: false,
    export: false,
  },
  requestState: {
    bootstrapLoaded: false,
    lastSearchRequestId: 0,
    lastResolvedSearchRequestId: 0,
  },
  exportUrl: "",
};

export const useOrdersExtendedStore = create((set) => ({
  ...DEFAULT_STATE,

  setLoading(key, value) {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: Boolean(value),
      },
    }));
  },

  setBootstrap(payload = {}) {
    set((state) => ({
      moduleName: payload.module_info?.name ?? "",
      rawAccess: payload.acces ?? null,
      points: payload.points ?? [],
      allItems: payload.all_items ?? [],
      items: payload.items ?? [],
      filters: {
        ...state.filters,
        point: state.filters.point,
        item: state.filters.item,
        param: state.filters.param ?? PARAM_OPTIONS[0],
      },
      requestState: {
        ...state.requestState,
        bootstrapLoaded: true,
      },
    }));
  },

  setFilters(patch = {}) {
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    }));
  },

  resetFilters() {
    set({ filters: DEFAULT_FILTERS });
  },

  setReport(payload = {}) {
    set((state) => ({
      rows: payload.rows ?? [],
      total: Number(payload.total ?? 0),
      exportUrl: payload.exportUrl ?? state.exportUrl ?? "",
      page: payload.page ?? state.page,
      perPage: payload.perPage ?? state.perPage,
      requestState: {
        ...state.requestState,
        lastResolvedSearchRequestId:
          payload.requestId ?? state.requestState.lastResolvedSearchRequestId,
      },
    }));
  },

  clearReport() {
    set({ rows: [], total: 0, exportUrl: "" });
  },

  setPage(page) {
    set({ page });
  },

  setPerPage(perPage) {
    set({ perPage });
  },

  setExportUrl(exportUrl = "") {
    set({ exportUrl });
  },

  setSearchRequestId(requestId) {
    set((state) => ({
      requestState: {
        ...state.requestState,
        lastSearchRequestId: requestId,
      },
    }));
  },
}));
