import { create } from "zustand";
import { getDefaultPromoItemsStatState } from "./promoItemsStatUtils";

const defaultState = getDefaultPromoItemsStatState();

const usePromoItemsStatStore = create((set) => ({
  ...defaultState,

  setIsLoad(isLoad) {
    set({ isLoad: Boolean(isLoad) });
  },

  setTab(tab) {
    set({ tab });
  },

  setBootstrap(payload = {}) {
    set((state) => ({
      ...state,
      isBootstrapLoaded: true,
      moduleName: payload.moduleName ?? "",
      pointList: payload.pointList ?? [],
      selectedPoints: state.selectedPoints.length
        ? state.selectedPoints
        : (payload.pointList ?? []),
      stats: payload.stats ?? [],
      promoTable: payload.promoTable ?? [],
      promoTablePagination: payload.promoTablePagination ?? state.promoTablePagination,
      itemList: payload.itemList ?? [],
      typeOrderList: payload.typeOrderList ?? [],
    }));
  },

  setFilters(patch = {}) {
    set((state) => ({
      ...state,
      ...patch,
    }));
  },

  setPromoList(promoList = []) {
    set({ promoList });
  },

  setPromoListRequestKey(promoListRequestKey) {
    set({ promoListRequestKey });
  },

  setSelectedPoints(selectedPoints = []) {
    set({ selectedPoints });
  },

  setSelectedPromos(selectedPromos = []) {
    set({ selectedPromos });
  },

  setSelectedItem(selectedItem) {
    set({ selectedItem });
  },

  setTypeOrder(typeOrder) {
    set({ typeOrder });
  },

  setStats(stats = []) {
    set({ stats });
  },

  setPromoTable(promoTable = []) {
    set({ promoTable });
  },

  setPromoTablePagination(promoTablePagination = {}) {
    set((state) => ({
      promoTablePagination: {
        ...state.promoTablePagination,
        ...promoTablePagination,
      },
    }));
  },
}));

export default usePromoItemsStatStore;
