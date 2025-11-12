"use client";

import { create } from "zustand";

const useDDSStore = create((set) => ({
  module: "bi_dds",
  module_name: "Анализ бизнеса: статьи ДДС",
  access: [],
  points: [],
  point: [],
  is_load: false,

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
