"use client";

import { create } from "zustand";

const defaultState = {
  module: "sklad_items",
  moduleName: "",
  isLoading: false,
  listLoading: {
    "warehouse-items": { pending: true, id: 0 },
    production: { pending: true, id: 0 },
    units: { pending: true, id: 0 },
  },
  refreshToken: 0,
  access: {},
  linkedModules: {},
  summary: {},
  units: [],
  categories: [],
  allergens: [],
  storages: [],
  apps: [],
  tags: [],
  accountingSystems: [],
  tab: 0,
};

export const useSkladStore = create((set) => ({
  ...defaultState,

  setState(payload = {}) {
    set(payload);
  },

  beginListLoad(section) {
    let requestId;
    set((state) => {
      requestId = (state.listLoading[section]?.id ?? 0) + 1;
      return { listLoading: { ...state.listLoading, [section]: { pending: true, id: requestId } } };
    });
    return requestId;
  },

  finishListLoad(section, requestId) {
    set((state) =>
      state.listLoading[section]?.id === requestId
        ? { listLoading: { ...state.listLoading, [section]: { pending: false, id: requestId } } }
        : {},
    );
  },

  requestRefresh() {
    set((state) => ({ refreshToken: state.refreshToken + 1 }));
  },

  setBootstrap(payload = {}) {
    set({
      moduleName: payload.moduleName ?? "",
      access: payload.access ?? {},
      linkedModules: payload.linkedModules ?? {},
      summary: payload.summary ?? {},
      units: payload.units ?? [],
      categories: payload.categories ?? [],
      allergens: payload.allergens ?? [],
      storages: payload.storages ?? [],
      apps: payload.apps ?? [],
      tags: payload.tags ?? [],
      accountingSystems: payload.accountingSystems ?? [],
    });
  },
}));
