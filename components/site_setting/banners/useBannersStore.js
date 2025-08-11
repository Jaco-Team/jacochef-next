import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel, api_laravel_local } from "@/src/api_new";

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

  setSort: (id, value) =>
    set((state) => ({
      active: state.active.map((item) => (item.id === id ? { ...item, sort: value } : item)),
    })),

  // fetching data
  getData: async (method, data = {}) => {
    set({ isLoading: true });
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "banners";
      const result = await api_laravel_local(parentModule, method, data);
      setTimeout(() => set({ isLoading: false }), 500);
      return result.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));
