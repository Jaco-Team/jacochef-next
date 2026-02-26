"use client";

import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel } from "@/src/api_new";

export const useCategoryStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  categories: [],
  history: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCategories: (categories) => set({ categories }),
  setHistory: (history) => set({ history }),

  setItem: (item) => set({ item }),
  setItemName: (itemName) => set({ itemName }),

  changeAutoComplete: (key, _, value) => {
    console.log(`Autocomplete ${key} = ${value}`);
    set((state) => ({ item: { ...state.item, [key]: value?.id || null } }));
  },

  changeItemProp: (key, event) => {
    const value = event?.target?.value;
    const item = get().item;
    if (!item) return;
    set((state) => ({ item: { ...state.item, [key]: value } }));
  },

  changeSort: (id, event) => {
    const value = event?.target?.value;
    const newCategories = get()
      .categories.map((cat) => (cat.id === id ? { ...cat, sort: value } : cat))
      .sort((a, b) => +a.sort - +b.sort);
    set({ categories: newCategories });
  },
}));
