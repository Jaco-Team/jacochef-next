"use client";

import { create } from "zustand";

const defaultState = {
  module: "vendors",
  module_name: "",
  access: {},
  cities: [],
  allPoints: [],
  allDeclarations: [],
  allItems: [],
  city: -1,
  vendors: [],
  modalOpen: false,
  isLoading: false,
};

const useVendorsStore = create((set) => ({
  ...defaultState,

  setBootstrap(payload = {}) {
    set({
      module_name: payload.module_name ?? "",
      access: payload.access ?? {},
      cities: payload.cities ?? [],
      allPoints: payload.allPoints ?? [],
      allDeclarations: payload.allDeclarations ?? [],
      allItems: payload.allItems ?? [],
      vendors: payload.vendors ?? [],
      city: payload.city ?? -1,
    });
  },

  setSharedBootstrap(payload = {}) {
    set((state) => ({
      access: payload.access ?? state.access,
      allPoints: payload.allPoints ?? state.allPoints,
      allDeclarations: payload.allDeclarations ?? state.allDeclarations,
      allItems: payload.allItems ?? state.allItems,
    }));
  },

  setVendors(vendors = []) {
    set({ vendors });
  },

  setCity(city) {
    set({ city });
  },

  openModal() {
    set({ modalOpen: true });
  },

  closeModal() {
    set({ modalOpen: false });
  },

  setLoading(isLoading) {
    set({ isLoading: Boolean(isLoading) });
  },
}));

export default useVendorsStore;
