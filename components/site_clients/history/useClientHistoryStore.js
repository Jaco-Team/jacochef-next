import { create } from "zustand";

export const useClientHistoryStore = create((set) => ({
  refreshToken: false,
  clientHistory: [],

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
