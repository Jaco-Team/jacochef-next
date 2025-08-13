"use client";

import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel } from "@/src/api_new";
import { translit } from "./pageTextUtils";

let timer = null;
const debounceDelay = 300;

export const usePagesStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  error: {},
  pages: [],
  categories: [],
  filteredPages: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPages: (pages) => set({ pages, filteredPages: pages }),
  setCategories: (categories) => set({ categories }),
  // if search will come up
  filterPages: (query) => {
    clearTimeout(timer);
    if (!query?.length < 3) {
      set({ filteredPages: get().pages });
      return;
    }
    timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = get().pages.filter((p) =>
        [p.title, p.description, p.content].some((val) => val.toLowerCase().includes(q))
      );
      set({ filteredPages: filtered });
    }, debounceDelay);
  },
  setItem: (item) => set({ item }),
  setItemName: (itemName) => set({ itemName }),

  // fetching data
  getData: async (method, data = {}) => {
    const { setIsLoad } = useSiteSettingStore.getState();
    setIsLoad(true);
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "seo";
      const result = await api_laravel(parentModule, method, data);
      return result.data;
    } catch (e) {
      throw e;
    } finally {
      setIsLoad(false);
    }
  },

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
