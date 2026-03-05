import { create } from "zustand";

const statusColorMap = {
  connected: "success",
  oauth_required: "warning",
  refresh_failed: "error",
  disabled: "default",
};

function isOauthRequired(status) {
  return (
    status === "oauth_required" ||
    status === "refresh_failed" ||
    status === "active" ||
    status === null
  );
}

export const useAdsStore = create((set) => ({
  module: "ads",
  tab: 0,

  refreshToken: null,

  connections: [],
  moduleName: "DEFAULT",
  access: [],

  loading: false,

  isAddOpen: false,
  oauthModal: { open: false, connection: null },
  syncModal: { open: false, connection: null },

  date_start: null,
  date_end: null,
  stats: null,

  statusColorMap,
  isOauthRequired,

  refreshAll: () => set({ refreshToken: Date.now() }),

  setTab: (tab) => set({ tab }),
  setLoading: (loading) => set({ loading }),

  setAll: (updates) =>
    set((state) => ({
      ...state,
      ...updates,
    })),
  setAddOpen: (isAddOpen) => set({ isAddOpen }),
  setOauthModal: (next) => set({ oauthModal: next }),
  setSyncModal: (next) => set({ syncModal: next }),

  setDates: (patch) => set(patch),
  setStats: (stats) => set({ stats }),
}));
