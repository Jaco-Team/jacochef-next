"use client";

import { create } from "zustand";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { useSiteSettingStore } from "../useSiteSettingStore";

export const useSocialStore = create((set) => ({
  moduleName: "",
  isLoading: false,
  dataInfo: [],

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setDataInfo: (dataInfo) => set({ dataInfo }),

  // fetching data
  getData: async (method, data = {}) => {
    const { setIsLoad } = useSiteSettingStore.getState();
    setIsLoad(true);
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "social";
      const result = await api_laravel(parentModule, method, data);
      return result.data;
    } catch (e) {
      throw e;
    } finally {
      setIsLoad(false);
    }
  },
}));
