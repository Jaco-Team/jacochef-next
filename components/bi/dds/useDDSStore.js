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
  stats: null,
  statsRefreshToken: 0, // trigger stats reload

  // for TransactionsTable
  refreshToken: 0, // is used to trigger updates from deep levels
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

  setStatsArticleTx: (articleId, txs) =>
    set((state) => {
      const newStats = [...state.stats];
      if (!newStats) return;
      const article = newStats.find((a) => a.article_id === articleId);
      if (article) {
        article = { ...article, transactions: txs ?? [] };
      }
      return { stats: [...newStats] };
    }),

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
