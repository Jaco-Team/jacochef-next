"use client";

import { create } from "zustand";

const useCafeEditModalsStore = create((set, get) => ({
  modalDialog: false,
  activePoint: null,

  activePointNew: {
    addr: "",
    city_id: "",
  },

  modalDialog_zone: false,
  one_zone: null,

  modalDialog_edit: false,
  mark: "",

  modalDialog_close: false,
  show_comment: false,
  is_сlosed_overload: 0,
  is_сlosed_technic: 0,
  reason_list: [],
  chooseReason: null,

  modalDialogView: false,
  itemView: null,
  type_modal: null,
  date_edit: null,

  modalDialog_kkt: false,
  kkt_update: null,
  pointModal: "",

  modalDialog_kkt_add: false,

  setModalsStateKey: (key, value) => {
    set({ [key]: value });
  },
}));

export default useCafeEditModalsStore;
