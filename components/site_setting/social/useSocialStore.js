"use client";

import { create } from "zustand";

export const useSocialStore = create((set) => ({
  moduleName: "",
  isLoading: false,
  dataInfo: [],
  history: [],

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setDataInfo: (dataInfo) => set({ dataInfo }),
  setHistory: (history) => set({ history }),
}));
