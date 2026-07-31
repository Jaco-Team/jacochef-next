"use client";

import { create } from "zustand";

export const PARAM_OPTIONS = [
  { id: "all", name: "Найти всех" },
  { id: "new", name: "Только новые" },
  { id: "current", name: "Только текущих" },
  { id: "lost", name: "Ушедшие" },
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
  avg_check_min: 0,
  avg_check_max: 0,
  promo: "",
  no_promo: false,
  with_promo: false,
  param: PARAM_OPTIONS[0],
  point: [],
  item: [],
  category_ids: [],
  source_ids: [],
  order_type_ids: [],
  payment_type_ids: [],
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
  categories: [],
  sources: [],
  orderTypes: [],
  paymentTypes: [],
  filters: DEFAULT_FILTERS,
  rows: [],
  total: 0,
  totals: {
    count: 0,
    order_price_sum: 0,
    avg_check_avg: 0,
  },
  page: 0,
  perPage: 10,
  sortBy: "id",
  sortDir: "desc",
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
  orderModal: {
    open: false,
    order: null,
    row: null,
  },
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
      categories: payload.categories ?? [],
      sources: payload.sources ?? [],
      orderTypes: payload.order_types ?? [],
      paymentTypes: payload.payment_types ?? [],
      filters: {
        ...state.filters,
        point: state.filters.point,
        item: state.filters.item,
        category_ids: state.filters.category_ids,
        source_ids: state.filters.source_ids,
        order_type_ids: state.filters.order_type_ids,
        payment_type_ids: state.filters.payment_type_ids,
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
      totals: payload.totals ?? state.totals,
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
    set({
      rows: [],
      total: 0,
      totals: { count: 0, order_price_sum: 0, avg_check_avg: 0 },
      exportUrl: "",
    });
  },

  setPage(page) {
    set({ page });
  },

  setPerPage(perPage) {
    set({ perPage });
  },

  setSort(sortBy, sortDir) {
    set({ sortBy, sortDir });
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

  openOrderModal(row) {
    set((state) => ({
      orderModal: {
        ...state.orderModal,
        open: true,
        row: row ?? null,
      },
    }));
  },

  setOrderModalOrder(order) {
    set((state) => ({
      orderModal: {
        ...state.orderModal,
        order: order ?? null,
      },
    }));
  },

  closeOrderModal() {
    set({
      orderModal: {
        open: false,
        order: null,
        row: null,
      },
    });
  },
}));
