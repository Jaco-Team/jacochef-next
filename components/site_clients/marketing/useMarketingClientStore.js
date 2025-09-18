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

  setClientInfoProp: (key, value) => {
    set((state) => ({
      client: {
        ...state.client,
        info: {
          ...state.client.info,
          [key]: value,
        },
      },
    }));
  },
  setClientLoginSms: (record) => {
    set((state) => ({
      client: {
        ...state.client,
        client_login_sms: [...state.client.client_login_sms, record],
      },
    }));
  },
  /**
   * update bd by part
   * @param {'day'|'month'} part
   * @param {number} value
   */
  setClientBd: (part, value) => {
    let newDateBir = null;
    console.log(`BD ${part} setting to ${value}`);
    if (part) {
      const oldBdParts = (get().client?.client_info?.date_bir ?? "1970-00-00").split("-");
      console.log(`BD was ${oldBdParts.join('-')}`)
      const newBdParts = [...oldBdParts];
      newBdParts[part === "day" ? 2 : 1] = String(value ?? 0).padStart(2, "0");
      console.log(`BD is now ${newBdParts.join('-')}`);
      newDateBir = newBdParts.join("-");
    }

    set((state) => ({
      client: {
        ...state.client,
        client_info: {
          ...state.client.client_info,
          date_bir: newDateBir,
        },
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
