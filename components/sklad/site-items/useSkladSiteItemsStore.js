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
  page: 0,
  rowsPerPage: 25,
  modal: {
    open: false,
    mode: "edit",
    loading: false,
    section: "main",
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
