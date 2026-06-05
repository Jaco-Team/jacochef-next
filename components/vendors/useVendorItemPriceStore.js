"use client";

import { create } from "zustand";
import { calcUnitPrice, createEmptyAddDraft } from "./vendorItemPriceUtils";

const initialState = {
  cities: [],
  city: "",
  items: [],
  vendorCities: [],
  selectedVendorCities: [],
  isLoading: false,
  isCityModalOpen: false,
  expandedItemId: null,
  editingItemId: null,
  isAddModalOpen: false,
  editDraft: null,
  addDraft: createEmptyAddDraft(),
};

const useVendorItemPriceStore = create((set) => ({
  ...initialState,

  reset: () => set({ ...initialState }),

  setIsLoading: (isLoading) => set({ isLoading: Boolean(isLoading) }),

  setBootstrap: (cities = []) => set({ cities }),

  setCity: (city) =>
    set({
      city,
      items: [],
      vendorCities: [],
      selectedVendorCities: [],
      expandedItemId: null,
      editingItemId: null,
      editDraft: null,
    }),

  setVendorItems: ({ items = [], vendorCities = [], selectedVendorCities = [] }) =>
    set({
      items,
      vendorCities,
      selectedVendorCities,
      expandedItemId: null,
      editingItemId: null,
      editDraft: null,
    }),

  setSelectedVendorCities: (selectedVendorCities) => set({ selectedVendorCities }),

  setIsCityModalOpen: (isCityModalOpen) => set({ isCityModalOpen: Boolean(isCityModalOpen) }),

  setExpandedItemId: (expandedItemId) => set({ expandedItemId }),

  setEditingItemId: (editingItemId) => set({ editingItemId }),

  setIsAddModalOpen: (isAddModalOpen) => set({ isAddModalOpen: Boolean(isAddModalOpen) }),

  setEditDraft: (editDraft) => set({ editDraft }),

  setAddDraft: (addDraft) => set({ addDraft: addDraft || createEmptyAddDraft() }),

  resetAddDraft: () => set({ addDraft: createEmptyAddDraft() }),

  patchAddDraft: (field, value) =>
    set((state) => {
      const nextDraft = { ...state.addDraft, [field]: value };
      nextDraft.price = calcUnitPrice(nextDraft.full_price, nextDraft.rec_pq);
      return { addDraft: nextDraft };
    }),

  clearEditState: () =>
    set({
      expandedItemId: null,
      editingItemId: null,
      editDraft: null,
    }),

  patchEditDraft: (field, value) =>
    set((state) => {
      if (!state.editDraft) {
        return state;
      }

      const nextDraft = { ...state.editDraft, [field]: value };
      nextDraft.price = calcUnitPrice(nextDraft.full_price, nextDraft.rec_pq);

      return { editDraft: nextDraft };
    }),

  replaceItem: (itemId, nextItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        Number(item.item_id) === Number(itemId) ? { ...item, ...nextItem } : item,
      ),
    })),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => Number(item.item_id) !== Number(itemId)),
    })),
}));

export default useVendorItemPriceStore;
