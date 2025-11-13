"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";
import { create } from "zustand";

const initialState = {
  module: "composition_of_orders",
  module_name: "",
  is_load: false,

  openAlert: false,
  err_status: true,
  err_text: "",

  date_start: formatDate(new Date()),
  date_end: formatDate(new Date()),

  points: [],
  point: [],

  allItems: [],
  items: [],

  dows: [
    { id: 1, name: "Пн" },
    { id: 2, name: "Вт" },
    { id: 3, name: "Ср" },
    { id: 4, name: "Чт" },
    { id: 5, name: "Пт" },
    { id: 6, name: "Сб" },
    { id: 7, name: "Вс" },
  ],
  dow: [],

  pays: [
    { id: 1, name: "Доставка - Нал." },
    { id: 2, name: "Доставка - Безнал." },
    { id: 3, name: "Самовывоз - Нал." },
    { id: 4, name: "Самовывоз - Безнал." },
    { id: 5, name: "Зал - Нал." },
    { id: 6, name: "Зал - Безнал." },
    { id: 7, name: "Зал с собой - Нал." },
    { id: 8, name: "Зал с собой - Безнал." },
  ],
  pay: [],

  fullScreen: false,

  stat: [],

  now_time: 1,
  pred_time: 1,

  all_price: 0,
  all_count: 0,

  sort_count: "asc",
  sort_count_percent: "asc",
  sort_price_percent: "desc",
  sort_price: "asc",

  openRows: {},

  graph: null,
  graphModal: false,
  graphRowName: null,
  groupGraph: null,
  groupGraphModal: false,
  groupGraphRowName: null,

  currentTab: 0, // 0|1|2

  itemsTabAll: {
    graph: [],
    totals: {},
  },
  itemsTabNotAll: {
    graph: [],
    totals: {},
  },
};

const useCompositionOfOrdersStore = create((set, get) => ({
  ...initialState,

  setState: (part) =>
    set((state) => {
      for (const k in part) if (state[k] !== part[k]) return { ...state, ...part };
      return state;
    }),

  toggleRow: (rowName) =>
    set((prev) => ({
      ...prev,
      openRows: {
        ...prev.openRows,
        [rowName]: !prev.openRows[rowName],
      },
    })),

  resetOpenRows() {
    const openRows = get().stat?.reduce((res, row) => {
      res[row.name] = false;
      return res;
    }, {});

    set({ openRows });
  },

  setPage(rowName, newPage) {
    const newStat = get().stat.map((i) => (i.name === rowName ? { ...i, page: newPage } : i));
    set({ stat: newStat });
  },

  setRowsPerPage(rowName, newPerPage) {
    const newStat = get().stat.map((i) => (i.name === rowName ? { ...i, perPage: newPerPage } : i));
    set({ stat: newStat });
  },
  sort(type) {
    const { stat, sort_count, sort_count_percent, sort_price_percent, sort_price } = get();

    const getNewTypeSort = (active) => (active === "asc" ? "desc" : "asc");

    // Defensive copy so original array isn’t mutated in place
    const sorted = [...stat];
    const next = {};

    switch (type) {
      case "sort_count": {
        const dir = getNewTypeSort(sort_count === "none" ? "asc" : sort_count);
        next.sort_count = dir;
        next.sort_count_percent = "asc";
        next.sort_price_percent = "asc";
        next.sort_price = "asc";
        next.stat =
          dir === "asc"
            ? sorted.sort((a, b) => parseInt(a.count) - parseInt(b.count))
            : sorted.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        break;
      }

      case "sort_count_percent": {
        const dir = getNewTypeSort(sort_count_percent === "none" ? "asc" : sort_count_percent);
        next.sort_count = "asc";
        next.sort_count_percent = dir;
        next.sort_price_percent = "asc";
        next.sort_price = "asc";
        next.stat =
          dir === "asc"
            ? sorted.sort((a, b) => parseInt(a.count_percent) - parseInt(b.count_percent))
            : sorted.sort((a, b) => parseInt(b.count_percent) - parseInt(a.count_percent));
        break;
      }

      case "sort_price_percent": {
        const dir = getNewTypeSort(sort_price_percent === "none" ? "asc" : sort_price_percent);
        next.sort_count = "asc";
        next.sort_count_percent = "asc";
        next.sort_price_percent = dir;
        next.sort_price = "asc";
        next.stat =
          dir === "asc"
            ? sorted.sort((a, b) => parseInt(a.price_percent) - parseInt(b.price_percent))
            : sorted.sort((a, b) => parseInt(b.price_percent) - parseInt(a.price_percent));
        break;
      }

      case "sort_price": {
        const dir = getNewTypeSort(sort_price === "none" ? "asc" : sort_price);
        next.sort_count = "asc";
        next.sort_count_percent = "asc";
        next.sort_price_percent = "asc";
        next.sort_price = dir;
        next.stat =
          dir === "asc"
            ? sorted.sort((a, b) => parseInt(a.price) - parseInt(b.price))
            : sorted.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        break;
      }

      default:
        return;
    }

    set(next);
  },

  /** Reset everything to initial */
  reset: () => set({ ...initialState }),
}));

export default useCompositionOfOrdersStore;
