"use client";

import { create } from "zustand";

const defaultState = {
  module: "vendors",
  module_name: "",
  cities: [],
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
      cities: payload.cities ?? [],
      vendors: payload.vendors ?? [],
      city: payload.city ?? -1,
    });
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
