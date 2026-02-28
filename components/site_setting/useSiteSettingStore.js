"use client";

import { api_laravel, api_laravel_local } from "@/src/api_new";
import { create } from "zustand";

const defaultSubmodules = [
  { key: "social", title: "Социальные сети" },
  { key: "banners", title: "Баннеры и Акции" },
  { key: "seo", title: "Тексты на сайте (SEO)" },
  { key: "category", title: "Категории сайта" },
];

export const useSiteSettingStore = create((set, get) => ({
  // core
  module: "site_setting",
  module_name: "",
  is_load: false,
  access: {},
  data: null,
  setModule: (module) => set({ module }),
  setAccess: (access) => set({ access }),
  setModuleName: (module_name) => set({ module_name }),
  setIsLoad: (is_load) => set({ is_load }),
  setData: (data) => set({ data }),

  // subModules
  subModules: defaultSubmodules,
  setSubModules: (subModules) =>
    set({
      subModules: Array.isArray(subModules) && subModules.length ? subModules : [],
    }),
  getSubModule: (key) => get().subModules.find((s) => s.key === key) || null,
  setSubModuleTitle: (key, newTitle) =>
    set((state) => {
      state.subModules = state.subModules.map((s) =>
        s.key === key ? { ...s, title: newTitle } : s,
      );
    }),

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
  onCloseModalHook: () => null,
  setModalTitle: (modalTitle) => set({ modalTitle }),
  setModalActions: (customModalActions) => set({ customModalActions }),
  createModal: (content, title, customActions = null, onCloseHook = () => null) => {
    set({
      modalDialog: true,
      modalContent: content,
      modalTitle: title,
      customModalActions: customActions,
      onCloseModalHook: onCloseHook,
    });
    set({ fullScreen: window.innerWidth < 601 });
  },
  closeModal: () => {
    get().onCloseModalHook();
    set({ modalDialog: false, modalContent: null, customModalActions: null });
  },

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
  setActiveTab: (event, activeTab) => set({ activeTab }),

  getData: async (method, data = {}) => {
    set({ is_load: true });
    try {
      const result = await api_laravel(get().module, method, data);
      if (!result?.data) throw new Error("Api call failed");
      return result.data;
    } catch (e) {
      console.log(e);
    } finally {
      set({ is_load: false });
    }
  },
}));
