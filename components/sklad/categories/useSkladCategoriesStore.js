"use client";

import { create } from "zustand";

const defaultDraft = {
  id: null,
  category_key: "",
  name: "",
  source_type: "semi_finished",
  parent_id: "",
  parent_name: "",
};

const defaultModal = {
  open: false,
  mode: "create",
};

export const CATEGORY_SOURCE_OPTIONS = [
  { id: "semi_finished", name: "Заготовки и рецепты" },
  { id: "warehouse_item", name: "Складские категории" },
];

export const CATEGORY_ARCHIVE_MODE_OPTIONS = [
  { id: "active", name: "Активные" },
  { id: "all", name: "Все" },
  { id: "archive", name: "Архив" },
];

export const useSkladCategoriesStore = create((set) => ({
  rows: [],
  search: "",
  archiveMode: "active",
  page: 0,
  rowsPerPage: 25,
  modal: defaultModal,
  draft: defaultDraft,

  setState(payload = {}) {
    set(payload);
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

export function getDefaultCategoryDraft() {
  return { ...defaultDraft };
}
