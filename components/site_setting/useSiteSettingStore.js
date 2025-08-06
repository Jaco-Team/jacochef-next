import { api_laravel } from "@/src/api_new";
import { modalClasses } from "@mui/material";
import { create } from "zustand";

export const useSiteSettingStore = create((set, get) => ({
  module: "site_setting",
  module_name: "",
  is_load: false,

  cities: [],
  city_id: 0,

  data: null,
  // for modal wrapper
  fullScreen: false,
  modalDialog: false,
  modalContent: null,
  modalTitle: "",
  customModalActions: null,
  // for alert wrapper
  openAlert: false,
  err_status: true,
  err_text: "",

  setModuleName: (module_name) => set({ module_name }),
  setIsLoad: (is_load) => set({ is_load }),
  setCities: (cities) => set({ cities }),
  setCityId: (city_id) => set({ city_id }),
  setFullScreen: (fullScreen) => set({ fullScreen }),
  setData: (data) => set({ data }),

  setModalDialog: (modalDialog) => set({ modalDialog }),
  setModalContent: (modalContent) => set({ modalContent }),
  setModalTitle: (modalTitle) => set({ modalTitle }),
  setModalActions: (customModalActions) => set({ customModalActions }),

  setOpenAlert: (openAlert) => set({ openAlert }),
  setErrStatus: (err_status) => set({ err_status }),
  setErrText: (err_text) => set({ err_text }),

  getData: async (method, data = {}) => {
    set({ is_load: true });
    try {
      const module = get().module;
      const result = await api_laravel(module, method, data);
      set({ is_load: false });
      return result.data;
    } catch (error) {
      set({ is_load: false });
      throw error;
    }
  },

  createModal: (content, title, customActions = null) => {
    set({ modalDialog: true, modalContent: content, modalTitle: title, customModalActions: customActions });
  },

  closeModal: () => set({ modalDialog: false, modalContent: null, customModalActions: null }),

  changeCity: (city_id) => set({ city_id, dataInfo: null }),

  handleResize: () => {
    if (window.innerWidth < 601) {
      set({ fullScreen: true });
    } else {
      set({ fullScreen: false });
    }
  },

  showAlert: (text = 'No text', status = 'error') => {
    set({ openAlert: true, err_status: status, err_text: text });
    setTimeout(() => {
      set({ openAlert: false });
    }, 3000);
  },
}));
