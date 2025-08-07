import { api_laravel } from "@/src/api_new";
import { modalClasses } from "@mui/material";
import { create } from "zustand";

const defaultSubmodules = {
  social: { component: "SiteSettingSocial", title: "" },
  banners: { component: "SiteSettingBanners", title: "" },
  seo: { component: "SiteSettingSocial", title: "" },
  category: { component: "SiteSettingSocial", title: "" },
};

export const useSiteSettingStore = create((set, get) => ({
  // core
  module: "site_setting",
  module_name: "",
  is_load: false,
  data: null,
  setModule: (module) => set({ module }),
  setModuleName: (module_name) => set({ module_name }),
  setIsLoad: (is_load) => set({ is_load }),
  setData: (data) => set({ data }),

  // subModules
  subModules: defaultSubmodules,
  // setSubmodules: (subModules) =>
  //   set({
  //     subModules:
  //       subModules && Object.keys(subModules)?.length
  //         ? subModules
  //         : {},
  //   }),
  getSubmodule: (key) => get().subModules[key] || null,
  setSubmoduleTitle: (key, title) =>
    set((state) => ({
      subModules: {
        ...state.subModules,
        [key]: {
          ...state.subModules[key],
          title,
        },
      },
    })),

  // change city
  cities: [],
  city_id: -1,
  setCities: (cities) => set({ cities }),
  setCityId: (city_id) => set({ city_id }),

  // for modal wrapper
  fullScreen: false,
  modalDialog: false,
  modalContent: null,
  modalTitle: "",
  customModalActions: null,
  setModalTitle: (modalTitle) => set({ modalTitle }),
  setModalActions: (customModalActions) => set({ customModalActions }),
  createModal: (content, title, customActions = null) => {
    set({
      modalDialog: true,
      modalContent: content,
      modalTitle: title,
      customModalActions: customActions,
    });
    set({ fullScreen: window.innerWidth < 601 });
  },
  closeModal: () => set({ modalDialog: false, modalContent: null, customModalActions: null }),

  // alert wrapper
  openAlert: false,
  err_status: true,
  err_text: "",
  setOpenAlert: (openAlert) => set({ openAlert }),
  setErrStatus: (err_status) => set({ err_status }),
  setErrText: (err_text) => set({ err_text }),
  // status = false means 'error' by default
  showAlert: (text = "No text", status = false) => {
    set({ openAlert: true, err_status: status, err_text: text });
    setTimeout(() => {
      set({ openAlert: false });
    }, 3000);
  },

  // tabs
  activeTab: 0,
  setActiveTab: (activeTab) => set({ activeTab }),

  getData: async (method, data = {}) => {
    set({ is_load: true });
    try {
      const result = await api_laravel(get().module, method, data);
      return result.data;
    } catch (error) {
      throw error;
    } finally {
      set({ is_load: false });
    }
  },
}));
