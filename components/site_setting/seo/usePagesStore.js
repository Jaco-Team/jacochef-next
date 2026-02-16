"use client";

import { create } from "zustand";
import { translit } from "./pageTextUtils";

export const usePagesStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  error: {},
  pages: [],
  categories: [],
  filteredPages: [],
  history: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPages: (pages) => set({ pages, filteredPages: pages }),
  setFilteredPages: (filteredPages) => set({ filteredPages }),
  setCategories: (categories) => set({ categories }),
  setHistory: (history) => set({ history }),

  setItem: (item) => set({ item }),
  setItemName: (itemName) => set({ itemName }),

  changeItemText: (key, value) => {
    set((state) => ({ item: { ...state.item, [key]: value } }));
  },

  changeAutoComplete: (key, _, value) => {
    console.log(`Autocomplete ${key} = ${value}`);
    set((state) => ({ item: { ...state.item, [key]: value?.id || null } }));
  },

  makeAlias: () => {
    const { page_name } = get().item;
    const alias = translit(page_name);
    console.log(`Made alias '${alias}' from title '${page_name}'`);
    set((state) => ({ item: { ...state.item, link: alias } }));
  },

  changeItemProp: (key, event) => {
    const value = event?.target?.value;
    const item = get().item;
    if (!item) return;
    set((state) => ({ item: { ...state.item, [key]: value } }));
    if (key === "page_name" && item.isNew) {
      get().makeAlias();
    }
  },
}));
