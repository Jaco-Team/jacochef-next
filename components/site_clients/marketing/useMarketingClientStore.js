"use client";

import { create } from "zustand";

const useMarketingClientStore = create((set, get) => ({
  clientLogin: null,
  client: null,
  clientLoading: false,
  clientModalOpened: false,

  setClientLogin: (clientLogin) => set({ clientLogin }),
  setClient: (client) => set({ client }),
  setClientLoading: (clientLoading) => set({ clientLoading }),
  setClientModalOpened: (clientModalOpened) => set({ clientModalOpened }),

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

const months = [
  { id: 1, name: "января" },
  { id: 2, name: "февраля" },
  { id: 3, name: "марта" },
  { id: 4, name: "апреля" },
  { id: 5, name: "мая" },
  { id: 6, name: "июня" },
  { id: 7, name: "июля" },
  { id: 8, name: "августа" },
  { id: 9, name: "сентября" },
  { id: 10, name: "октября" },
  { id: 11, name: "ноября" },
  { id: 12, name: "декабря" },
];
