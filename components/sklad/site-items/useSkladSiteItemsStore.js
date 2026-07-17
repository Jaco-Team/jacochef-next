"use client";

import { create } from "zustand";

export const SITE_ITEMS_ARCHIVE_MODE_OPTIONS = [
  { id: "active", name: "Активные" },
  { id: "all", name: "Все" },
  { id: "archive", name: "Архив" },
];

export const useSkladSiteItemsStore = create((set) => ({
  rows: [],
  categories: [],
  tags: [],
  search: "",
  categoryId: "",
  tagId: "",
  archiveMode: "active",

  setState(payload = {}) {
    set(payload);
  },
}));
