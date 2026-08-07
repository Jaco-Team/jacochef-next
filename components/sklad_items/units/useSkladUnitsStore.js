"use client";

import { create } from "zustand";

const defaultDraft = {
  id: null,
  name: "",
  con_id: 0,
  main_count: 1,
  con_count: 1,
};

const defaultModal = {
  open: false,
  mode: "create",
};

export const useSkladUnitsStore = create((set) => ({
  rows: [],
  search: "",
  modal: defaultModal,
  draft: defaultDraft,

  setState(payload = {}) {
    set(payload);
  },

  setModal(payload = {}) {
    set((state) => ({
      modal: {
        ...state.modal,
        ...payload,
      },
    }));
  },

  setDraft(payload = {}) {
    set((state) => ({
      draft: {
        ...state.draft,
        ...payload,
      },
    }));
  },

  resetDraft() {
    set({
      draft: { ...defaultDraft },
      modal: { ...defaultModal },
    });
  },
}));

export function getDefaultUnitDraft() {
  return { ...defaultDraft };
}
