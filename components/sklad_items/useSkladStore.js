"use client";

import { create } from "zustand";

const defaultState = {
  module: "sklad_items",
  moduleName: "",
  isLoading: false,
  refreshToken: 0,
  access: {},
  summary: {},
  sections: [],
  plannedSections: [],
  units: [],
  categories: [],
  allergens: [],
  storages: [],
  apps: [],
  tags: [],
  accountingSystems: [],
  uiMeta: {},
  businessMeta: {},
  capabilities: {},
  tab: 0,
};

export const useSkladStore = create((set) => ({
  ...defaultState,

  setState(payload = {}) {
    set(payload);
  },

  requestRefresh() {
    set((state) => ({ refreshToken: state.refreshToken + 1 }));
  },

  setBootstrap(payload = {}) {
    set({
      moduleName: payload.moduleName ?? "",
      access: payload.access ?? {},
      summary: payload.summary ?? {},
      sections: payload.sections ?? [],
      plannedSections: payload.plannedSections ?? [],
      units: payload.units ?? [],
      categories: payload.categories ?? [],
      allergens: payload.allergens ?? [],
      storages: payload.storages ?? [],
      apps: payload.apps ?? [],
      tags: payload.tags ?? [],
      accountingSystems: payload.accountingSystems ?? [],
      uiMeta: payload.uiMeta ?? {},
      businessMeta: payload.businessMeta ?? {},
      capabilities: payload.capabilities ?? {},
      tab: payload.tab ?? defaultState.tab,
    });
  },
}));
