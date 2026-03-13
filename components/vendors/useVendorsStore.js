"use client";
import { create } from "zustand";
// lightweight id generator to avoid extra deps
function genId() {
  return String(Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
}

const defaultState = {
  cities: [],
  cityFilter: "all",
  city: null,
  modalOpen: false,
  module: "vendors",
  moduleName: null,
  isLoading: false,
  vendors: [
    {
      id: "v1",
      name: "Coffee & Co",
      city: "Moscow",
      address: "Lenina 12",
      active: true,
      itemsCount: 24,
    },
    {
      id: "v2",
      name: "Bakery House",
      city: "Saint Petersburg",
      address: "Nevsky 45",
      active: false,
      itemsCount: 8,
    },
    {
      id: "v3",
      name: "Green Salads",
      city: "Moscow",
      address: "Tverskaya 3",
      active: true,
      itemsCount: 12,
    },
  ],
};

export const useVendorsStore = create((set) => ({
  ...defaultState,

  // actions
  setCity(city) {
    set({ city });
  },

  openModal() {
    set({ modalOpen: true });
  },
  closeModal() {
    set({ modalOpen: false });
  },

  addVendor(payload) {
    const vendor = {
      id: genId(),
      name: payload.name || "Unnamed",
      city: payload.city || "",
      address: payload.address || "",
      active: payload.active ?? true,
      itemsCount: payload.itemsCount || 0,
    };
    set((s) => ({ vendors: [vendor, ...s.vendors], modalOpen: false }));
  },

  toggleActive(id) {
    set((s) => ({
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, active: !v.active } : v)),
    }));
  },
}));

export default useVendorsStore;
