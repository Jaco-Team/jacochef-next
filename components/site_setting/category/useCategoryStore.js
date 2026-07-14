"use client";

import { create } from "zustand";

export const useCategoryStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  categories: [],
  itemsNew: [],
  history: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCategories: (categories) => set({ categories }),
  setItemsNew: (itemsNew) => set({ itemsNew }),
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

  addCategoryItem: () => {
    const item = get().item;
    if (!item) return;

    set((state) => ({
      item: {
        ...state.item,
        items: [...(state.item.items || []), { item_id: null, count: 1 }],
      },
    }));
  },

  changeCategoryItem: (index, _, value) => {
    const item = get().item;
    if (!item) return;

    set((state) => ({
      item: {
        ...state.item,
        items: (state.item.items || []).map((categoryItem, itemIndex) =>
          itemIndex === index ? { ...categoryItem, item_id: value?.id || null } : categoryItem,
        ),
      },
    }));
  },

  changeCategoryItemCount: (index, event) => {
    const item = get().item;
    if (!item) return;

    const count = event?.target?.value;
    set((state) => ({
      item: {
        ...state.item,
        items: (state.item.items || []).map((categoryItem, itemIndex) =>
          itemIndex === index ? { ...categoryItem, count } : categoryItem,
        ),
      },
    }));
  },

  deleteCategoryItem: (index) => {
    const item = get().item;
    if (!item) return;

    set((state) => ({
      item: {
        ...state.item,
        items: (state.item.items || []).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  },

  changeSort: (id, event) => {
    const value = event?.target?.value;
    const newCategories = get()
      .categories.map((cat) => (cat.id === id ? { ...cat, sort: value } : cat))
      .sort((a, b) => +a.sort - +b.sort);
    set({ categories: newCategories });
  },
}));
