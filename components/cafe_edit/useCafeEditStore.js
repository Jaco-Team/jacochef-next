"use client";

import { create } from "zustand";

const useCafeEditStore = create((set) => ({
  module: "cafe_edit",
  module_name: "",
  is_load: false,

  acces: null,

  points: [],
  point: "",
  cities: [],

  activeTab: 0,

  zone: [],
  other_zones: [],

  point_info_hist: [],
  point_rate_hist: [],
  point_pay_hist: [],
  point_sett_hist: [],
  point_zone_hist: [],
  point_sett_driver_hist: [],
  kkt_info_hist: [],

  index_info: -1,
  index_rate: -1,
  index_pay: -1,
  index_sett: -1,
  index_zone: -1,
  index_driver: -1,
  index_kkt: -1,
  tabs_data: [],

  upr_list: [],

  confirmDialog: false,
  nextTab: null,

  kkt_info_active: [],
  kkt_info_none_active: [],

  setStateKey: (key, value) => {
    set({
      [key]: value,
    });
  },
  changePointInfoData: (key, e) => {
    set((state) => ({
      ...state,
      point_info: { ...state.point_info, [key]: e?.target?.value || e },
    }));
  },
  changePointInfoDataText: (key, e) => {
    set((state) => ({
      ...state,
      point_info: { ...state.point_info, [key]: e?.target?.value },
    }));
  },
  changeItemChecked: (key, event) => {
    const value = event.target.checked ? 1 : 0;
    set((state) => ({
      ...state,
      point_info: { ...state.point_info, [key]: value },
    }));
  },
}));

export default useCafeEditStore;
