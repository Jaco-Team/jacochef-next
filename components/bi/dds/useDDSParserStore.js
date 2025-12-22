import { create } from "zustand";

const useDDSParserStore = create((set) => ({
  sessionId: "175fdf3b-45e9-42ae-aefb-41be69b7464c",
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
