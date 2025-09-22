"use client";

import dayjs from "dayjs";
import { create } from "zustand";

const defaultSlices = {
  new_old: null,
  online_offline: null,
  promo_nopromo: null,
};

export const defaultFilters = {
  status: null,
  id: null,
  number: null,
  is_new: null,
  type_order: null,
  point_addr: null,
  promo_name: null,
  /**
   * Сортировка
   * @type {'date_time_origin' | 'id' | 'client_id' | 'type_order' | 'promo_name' | 'order_price' | 'point_addr' | null}
   */
  sortBy: null,
  sortDir: "desc",
};

const useMarketingTabStore = create((set, get) => ({
  points: [],
  dateStart: dayjs(),
  dateEnd: dayjs(),
  isModalOpen: false,
  orderIds: null,
  orders: [],
  stats: null,
  page: 1,
  perPage: 30,
  total: 0,
  filters: defaultFilters,
  slices: defaultSlices,
  subtitle: "",

  setPoints: (points) => set({ points }),
  setDateStart: (dateStart) => set({ dateStart }),
  setDateEnd: (dateEnd) => set({ dateEnd }),
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
  setOrderIds: (orderIds) => set({ orderIds }),
  setOrders: (orders) => set({ orders }),
  setStats: (stats) => set({ stats }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setTotal: (total) => set({ total }),
  resetFilters: () => set({ filters: defaultFilters }),
  setSubtitle: (subtitle) => set({ subtitle }),

  setFiltersItem: (key, value) => {
    Object.keys(defaultFilters).includes(key) &&
      set((state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      }));
  },
  slicePromo: (type = "promo") =>
    set(() => ({
      slices: {
        ...defaultSlices,
        promo_nopromo: type === "promo" ? "promo" : "nopromo",
      },
      filters: defaultFilters,
      subtitle: type === "promo" ? "с Промо" : "без промо",
      page: 1,
    })),
  sliceOnline: (type = "online") =>
    set(() => ({
      slices: {
        ...defaultSlices,
        online_offline: type === "online" ? "online" : "offline",
      },
      filters: defaultFilters,
      subtitle: type === "online" ? "Онлайн" : "Офлайн",
      page: 1,
    })),
  sliceNew: (type = "new") =>
    set(() => ({
      slices: {
        ...defaultSlices,
        new_old: type === "new" ? "new" : "old",
      },
      filters: defaultFilters,
      subtitle: type === "new" ? "Новые клиенты" : "Постоянные клиенты",
      page: 1,
    })),
  sliceReset: () =>
    set(() => ({
      slices: defaultSlices,
      filters: defaultFilters,
      subtitle: "Все",
      page: 1,
    })),
  toggleSortDir: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortDir: state.filters.sortDir === "asc" ? "desc" : "asc",
      },
    })),
}));

export default useMarketingTabStore;
