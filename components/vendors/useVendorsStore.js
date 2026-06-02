"use client";

import { create } from "zustand";
import { normalizeVendorList } from "./vendorFormUtils";

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
  vendorsLoadedCity: null,
  modalOpen: false,
  isLoading: false,
};

const useVendorsStore = create((set) => ({
  ...defaultState,

  setBootstrap(payload = {}) {
    set((state) => ({
      module_name: payload.module_name ?? "",
      access: payload.access ?? {},
      cities: payload.cities ?? [],
      allPoints: payload.allPoints ?? [],
      allDeclarations: payload.allDeclarations ?? [],
      allItems: payload.allItems ?? [],
      vendors: payload.vendors ? normalizeVendorList(payload.vendors) : state.vendors,
      vendorsLoadedCity: payload.vendorsLoadedCity ?? state.vendorsLoadedCity,
      city: payload.city ?? -1,
    }));
  },

  setSharedBootstrap(payload = {}) {
    set((state) => ({
      access: payload.access ?? state.access,
      allPoints: payload.allPoints ?? state.allPoints,
      allDeclarations: payload.allDeclarations ?? state.allDeclarations,
      allItems: payload.allItems ?? state.allItems,
    }));
  },

  setVendors(vendors = [], city = null) {
    set((state) => ({
      vendors: normalizeVendorList(vendors),
      vendorsLoadedCity: city ?? state.vendorsLoadedCity,
    }));
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
