import { create } from "zustand";

export const useClientHistoryStore = create((set) => ({
  refreshToken: Date.now(),

  refresh: () =>
    set({
      refreshToken: Date.now(),
    }),
}));
