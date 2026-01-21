import { create } from "zustand";

export const useClientHistoryStore = create((set) => ({
  refreshToken: false,
  clientHistory: [],
  page: 1,
  perPage: 50,
  total: 0,

  clientLogin: null,
  client: null,
  clientLoading: false,
  clientModalOpened: false,

  isOrderModalOpen: false,

  order: null,

  setClientLogin: (clientLogin) => set({ clientLogin }),
  setClient: (client) => set({ client }),
  setClientLoading: (clientLoading) => set({ clientLoading }),
  setClientModalOpened: (clientModalOpened) => set({ clientModalOpened }),

  setIsOrderModalOpen: (isOrderModalOpen) => set({ isOrderModalOpen }),

  setOrder: (order) => set({ order }),

  update: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),

  refresh: () =>
    set({
      refreshToken: Date.now(),
    }),
}));
