"use client";

import { create } from "zustand";

export const PRODUCTION_ENTITY_OPTIONS = [
  { id: "semi_finished", name: "Заготовки" },
  { id: "recipe", name: "Рецепты" },
];

export const PRODUCTION_ARCHIVE_MODE_OPTIONS = [
  { id: "active", name: "Активные" },
  { id: "all", name: "Все" },
  { id: "archive", name: "Архив" },
];

export const useSkladProductionStore = create((set) => ({
  activeEntityType: "semi_finished",
  rowsByType: {
    semi_finished: [],
    recipe: [],
  },
  search: "",
  categoryId: "",
  archiveMode: "active",
  pageByType: {
    semi_finished: 0,
    recipe: 0,
  },
  rowsPerPage: 25,
  modal: {
    open: false,
    mode: "view",
    loading: false,
    tab: "main",
  },
  detail: null,
  draft: null,
  archiveDialog: {
    open: false,
    loading: false,
    row: null,
  },
  deleteDialog: {
    open: false,
    loading: false,
    row: null,
  },

  setState(payload = {}) {
    set(payload);
  },
}));
