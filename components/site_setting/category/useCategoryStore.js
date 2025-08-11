import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { sort } from "mathjs";

export const useCategoryStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  categories: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCategories: (categories) => set({ categories }),

  setItem: (item) => set({ item }),
  setItemName: (itemName) => set({ itemName }),

  // fetching data
  getData: async (method, data = {}) => {
    set({ isLoading: true });
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "category";
      const result = await api_laravel_local(parentModule, method, data);
      return result.data;
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

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
    const newCategories = get().categories.map((cat) =>
      cat.id === id ? { ...cat, sort: value } : cat
    ).sort((a, b) => +a.sort - +b.sort);
    set({ categories: newCategories });
  },
}));
