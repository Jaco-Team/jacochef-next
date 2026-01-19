"use client";

import { create } from "zustand";

const useMarketingClientStore = create((set) => ({
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

  setClientLoginSms: (record) => {
    set((state) => ({
      client: {
        ...state.client,
        client_login_sms: [...state.client.client_login_sms, record],
      },
    }));
  },

  setClientHistory: (history) => {
    set((state) => ({
      client: {
        ...state.client,
        history,
      },
    }));
  },
}));

export default useMarketingClientStore;
