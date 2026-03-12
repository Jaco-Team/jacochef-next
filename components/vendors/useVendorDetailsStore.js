"use client";

import { create } from "zustand";

const initialState = {
  vendor: null,
  vendorCities: [],
  allCities: [],
  mails: [],
  allPoints: [],
  allDeclarations: [],
  vendorItems: [],
  allItems: [],
  selectedItemId: null,
  bindDeclarationId: "",
  isDocModalOpen: false,
  docModalItemId: "",
  docModalFile: null,
  isEditing: false,
};

const useVendorDetailsStore = create((set) => ({
  ...initialState,

  setState: (part) => set((state) => ({ ...state, ...part })),
  reset: () => set({ ...initialState }),
  setVendor: (vendor) =>
    set((state) => ({
      vendor: typeof vendor === "function" ? vendor(state.vendor) : vendor,
    })),
  setVendorField: (field, value) =>
    set((state) => ({
      vendor: state.vendor ? { ...state.vendor, [field]: value } : state.vendor,
    })),
  toggleVendorField: (field) =>
    set((state) => ({
      vendor: state.vendor
        ? {
            ...state.vendor,
            [field]: Number(state.vendor[field]) ? 0 : 1,
          }
        : state.vendor,
    })),
  setVendorCities: (vendorCities) =>
    set((state) => ({
      vendorCities:
        typeof vendorCities === "function" ? vendorCities(state.vendorCities) : vendorCities,
    })),
  toggleCity: (city) =>
    set((state) => {
      if (!city?.id) {
        return state;
      }

      const cityId = Number(city.id);
      const exists = state.vendorCities.some((entry) => Number(entry.id) === cityId);

      return {
        vendorCities: exists
          ? state.vendorCities.filter((entry) => Number(entry.id) !== cityId)
          : [...state.vendorCities, city],
      };
    }),
  setAllCities: (allCities) =>
    set((state) => ({
      allCities: typeof allCities === "function" ? allCities(state.allCities) : allCities,
    })),
  setMails: (mails) =>
    set((state) => ({
      mails: typeof mails === "function" ? mails(state.mails) : mails,
    })),
  updateMail: (index, field, value) =>
    set((state) => ({
      mails: state.mails.map((mail, mailIndex) =>
        mailIndex === index ? { ...mail, [field]: value } : mail,
      ),
    })),
  addMail: (mail) =>
    set((state) => ({
      mails: [...state.mails, mail],
    })),
  removeMail: (index) =>
    set((state) => ({
      mails: state.mails.filter((_, mailIndex) => mailIndex !== index),
    })),
  setAllPoints: (allPoints) =>
    set((state) => ({
      allPoints: typeof allPoints === "function" ? allPoints(state.allPoints) : allPoints,
    })),
  setAllDeclarations: (allDeclarations) =>
    set((state) => ({
      allDeclarations:
        typeof allDeclarations === "function"
          ? allDeclarations(state.allDeclarations)
          : allDeclarations,
    })),
  setVendorItems: (vendorItems) =>
    set((state) => ({
      vendorItems: typeof vendorItems === "function" ? vendorItems(state.vendorItems) : vendorItems,
    })),
  setAllItems: (allItems) =>
    set((state) => ({
      allItems: typeof allItems === "function" ? allItems(state.allItems) : allItems,
    })),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  setBindDeclarationId: (bindDeclarationId) => set({ bindDeclarationId }),
  setIsDocModalOpen: (isDocModalOpen) => set({ isDocModalOpen }),
  setDocModalItemId: (docModalItemId) => set({ docModalItemId }),
  setDocModalFile: (docModalFile) => set({ docModalFile }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));

export default useVendorDetailsStore;
