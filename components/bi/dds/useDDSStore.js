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
  articlesRefreshToken: null,
  parsedArticles: null,

  // for ArticlesTable
  stats: null,
  statsRefreshToken: null, // trigger stats reload

  // for TransactionsTable
  refreshToken: null, // is used to trigger updates from deep levels
  transactions: [],
  txPage: 1,
  txPerPage: 50,
  txTotal: 0,
  sortBy: "date",
  sortDir: "desc",
  searchQuery: "",
  filters: {},
  txArticlesSet: [],

  // modal set article to transaction
  selectedTx: [],
  isModalArticleTxOpen: false,

  setStatsArticleTx: (articleId, txs, page, total) =>
    set((state) => {
      return {
        stats: state.stats.map((a) =>
          a.article_id === articleId
            ? {
                ...a, // new identity
                transactions: [...txs], // new identity
                page,
                total,
              }
            : a,
        ),
      };
    }),

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
