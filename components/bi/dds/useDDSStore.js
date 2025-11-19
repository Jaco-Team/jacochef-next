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

  // for ArticlesTable
  articlesStats: [
    {
      id: null,
      name: null,
      count: 0,
      balance: 0,
      artTx: [],
      artTxPage: 0,
      artTxPerPage: 30,
    },
  ],

  // for TransactionsTable
  transactions: [],
  txPage: 1,
  txPerPage: 50,
  txTotal: 0,
  sortBy: "date",
  sortDir: "desc",
  searchQuery: "",
  filters: {},

  // modal set article to transaction
  selectedTx: [],
  isModalArticleTxOpen: false,

  // parsed but not added
  sessionId: null,
  parsedTransactions: [],
  setParsedTransactions: (transactions) => set({ parsedTransactions: transactions }),

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
