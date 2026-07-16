"use client";

import { create } from "zustand";

export const PRODUCTION_ENTITY_OPTIONS = [
  { id: "semi_finished", name: "Полуфабрикаты" },
  { id: "recipe", name: "Рецепты" },
];

export const PRODUCTION_ARCHIVE_MODE_OPTIONS = [
  { id: "active", name: "Активные" },
  { id: "all", name: "Все" },
  { id: "archive", name: "Архив" },
];

export const useSkladProductionStore = create((set) => ({
  entityType: "semi_finished",
  rows: [],
  search: "",
  categoryId: "",
  archiveMode: "active",

  setState(payload = {}) {
    set(payload);
  },
}));
