import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel } from "@/src/api_new";

export const useSocialStore = create((set) => ({
  moduleName: "",
  isLoading: false,
  dataInfo: [],

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setDataInfo: (dataInfo) => set({ dataInfo }),

  // fetching data
  getData: async (method, data = {}) => {
    set({ isLoading: true });
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "seo";
      const result = await api_laravel(parentModule, method, data);
      return result.data;
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
