"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";
import { create } from "zustand";

const useDDSStore = create((set) => ({
  module: "bi_dds",
  module_name: "Анализ бизнеса: статьи ДДС",
  access: [],
  points: [],
  point: [],
  is_load: false,
  date_start: formatDate(),
  date_end: formatDate(),

  articles: [],
  transactions: [],

  selectedTx: [],
  isModalArticleTxOpen: false,

  // parsed but not added
  sessionId: null,
  parsedTransactions: [],
  setParsedTransactions: (transactions) => set({ parsedTransactions: transactions }),

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
