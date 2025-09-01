"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAppointmentModalStore = create(
  immer((set) => ({
    item: null,
    name: "",
    short_name: "",
    bonus: "",
    paramModal: false,
    method: "",
    paramMethod: "",
    params: null,
    main_key: null,
    parent_key: null,
    type: "",
    full_menu: null,

    setItem: (item) =>
      set((state) => {
        state.item = item;
      }),
    setItemField: (key, value) =>
      set((state) => {
        state.item[key] = value;
      }),
    setFullMenu: (menu) =>
      set((state) => {
        state.full_menu = menu;
      }),
    setName: (name) =>
      set((state) => {
        state.name = name;
      }),
    setShortName: (short) =>
      set((state) => {
        state.short_name = short;
      }),
    setBonus: (bonus) =>
      set((state) => {
        state.bonus = bonus;
      }),
    setDialogParam: (flag) =>
      set((state) => {
        state.modalDialog_param = flag;
      }),
    setMethod: (method) =>
      set((state) => {
        state.method = method;
      }),
    setParamMethod: (method) =>
      set((state) => {
        state.paramMethod = method;
      }),
    setUiParams: () =>
      set((state) => {
        const { main_key, parent_key } = state;
        if (main_key === null || parent_key === null) {
          return;
        }
        const features = state.full_menu[main_key]?.chaild[parent_key]?.features || [];
        const features_cat = state.full_menu[main_key]?.chaild[parent_key]?.features_cat || [];
        const data = [...features, ...features_cat];
        if (!data?.length) {
          return;
        }
        const table_data = [];
        const accordion_data = [];
        data?.forEach((param, index) => {
          if (param.category) {
            accordion_data.push({ ...param, index });
          } else {
            table_data.push({ ...param, index });
          }
        });
        state.params = {
          table: [...table_data],
          accordion: [...accordion_data],
        };
      }),

    setParams: (params) =>
      set((state) => {
        state.params = params;
      }),
    setParamModal: (flag) =>
      set((state) => {
        state.paramModal = flag;
      }),
    setMainKey: (key) =>
      set((state) => {
        state.main_key = key;
      }),
    setParentKey: (key) =>
      set((state) => {
        state.parent_key = key;
      }),
    setType: (type) =>
      set((state) => {
        state.type = type;
      }),

    changeActiveFeature: (featureIndex, categoryIndex, event) => {
      get().changeParamFlag("is_active", featureIndex, categoryIndex, event);
    },

    changeParamFlag: (key, featureIndex, categoryIndex, event) => {
      set((state) => {
        const ci = +categoryIndex;
        const fi = +featureIndex;
        const { full_menu, main_key, parent_key } = state;
        const parent = full_menu[main_key]?.chaild[parent_key];
        if (!parent) {
          return;
        }
        const value =
          event?.target?.checked !== undefined
            ? event.target.checked
              ? 1
              : 0
            : event?.target?.value;

        const updateFeature = (features) => {
          if (!features?.[fi]) {
            return;
          }
          features[fi] = { ...features[fi], [key]: value };
          if(key === 'edit') {
            features[fi] = { ...features[fi], view: value };
          }
        };

        if (ci > -1) {
          updateFeature(parent.features_cat[ci]?.features);
        } else {
          updateFeature(parent.features);
        }
      });
    },

    changeActiveModule: (mainKey, parentKey, event) =>
      set((state) => {
        const fullMenu = state.full_menu;
        const parent = fullMenu[mainKey]?.chaild[parentKey];
        if (!parent) return;
        const value =
          event?.target?.checked !== undefined
            ? event.target.checked
              ? 1
              : 0
            : event?.target?.value;
        parent.is_active = value;
      }),

    reset: () =>
      set((state) => {
        state.item = null;
        state.full_menu = null;
        state.name = "";
        state.short_name = "";
        state.bonus = "";
        state.modalDialog_param = false;
        state.method = "";
        state.params = null;
        state.main_key = "";
        state.parent_key = "";
        state.type = "";
      }),
  }))
);
