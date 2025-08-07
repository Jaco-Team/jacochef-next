import { create } from "zustand";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { api_laravel } from "@/src/api_new";

const newPage = {
  page_name: "",
  city_id: -1,
  page_h: "",
  title: "",
  description: "",
  link: "",
  content: "",
  category_id: { id: 0, name: "Без категории" },
};

export const usePagesStore = create((set, get) => ({
  moduleName: "",
  isLoading: false,
  error: {},
  pages: [],
  filteredPages: [],

  item: null,
  itemName: "",

  setModuleName: (moduleName) => set({ moduleName }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPages: (pages) => set({ pages, filteredPages: pages }),
  filterPages: (query) => {
    const q = query.toLowerCase();
    const filtered = get().pages.filter((p) =>
      [p.title, p.description, p.content].some((val) => val.toLowerCase().includes(q))
    );
    set({ filteredPages: filtered });
  },
  setItem: (item) => set({ item }),
  setItemName: (itemName) => set({ itemName }),

  // fetching data
  getData: async (method, data = {}) => {
    set({ isLoading: true });
    try {
      const parentModule = useSiteSettingStore.getState().module;
      // inject submodule type
      data.submodule = "seo";
      const result = await api_laravel(parentModule, method, data);
      setTimeout(() => set({ isLoading: false }), 500);
      return result.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
