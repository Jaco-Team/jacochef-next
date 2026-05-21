"use client";

import { create } from "zustand";

export const useBannersStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  error: {},
  active: [],
  non_active: [],

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setBanner: (banner) => set({ banner }),
  setError: (error) => set({ error }),

  setActiveBanners: (active) => set({ active }),
  setNonActiveBanners: (non_active) => set({ non_active }),

  // table row actions
  setActive: (id, value) =>
    set((state) => ({
      active: state.active.map((item) => (item.id === id ? { ...item, is_active: value } : item)),
    })),

  setSort: (id, e) =>
    set((state) => ({
      active: state.active.map((item) =>
        item.id === id
          ? { ...item, sort: +e.target.value, old_sort: item.old_sort ?? item.sort }
          : item,
      ),
    })),
}));
