"use client";

import { create } from "zustand";

export const HISTORY_ENTITY_OPTIONS = [
  { id: "recipe", name: "Рецепт" },
  { id: "semi_finished", name: "Заготовка" },
  { id: "site_item", name: "Товар сайта" },
  { id: "item", name: "Складская позиция" },
];

export const HISTORY_INITIAL_STATE = {
  rows: [],
  page: 0,
  rowsPerPage: 25,
  focusArea: "",
  selectedRevisionKey: "",
  selectedRevision: null,
  compareLeftKey: "",
  compareRightKey: "",
  compareResult: null,
};

export const useSkladHistoryStore = create((set) => ({
  entityType: "recipe",
  entityId: "",
  ...HISTORY_INITIAL_STATE,

  setState(payload = {}) {
    set(payload);
  },
}));
