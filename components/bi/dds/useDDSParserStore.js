import { create } from "zustand";

const useDDSParserStore = create((set) => ({
  sessionId: "4f502b33-a286-40d5-935c-a30bb280f016",
  parsedData: [],
  query: "",
  sortBy: "date",
  sortDir: "asc",
  currentPage: 0,
  perPage: 30,

  updateState: (updates) => set((state) => ({ ...state, ...updates })),

  setParsedData: (data) => set({ parsedData: data, currentPage: 0 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPerPage: (count) => set({ perPage: count }),
}));

export default useDDSParserStore;
