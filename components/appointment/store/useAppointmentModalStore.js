"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAppointmentModalStore = create(
  immer((set, get) => ({
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
        if (!features?.length && !features_cat?.length) {
          return;
        }
        const table_data = [];
        const accordion_data = [];
        features?.forEach((param, index) => {
          table_data.push({ ...param, index });
        });
        features_cat?.forEach((param, index) => {
          accordion_data.push({ ...param, index });
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

    changeParamFlag: (key, categoryIndex, featureIndex, event) => {
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

          // on view off - edit off
          if (key === "view" && value === 0) {
            features[fi] = { ...features[fi], edit: 0 };
          }
          // on edit on - view on
          if (key === "edit" && value === 1) {
            features[fi] = { ...features[fi], view: 1 };
          }
        };

        if (ci > -1) {
          updateFeature(parent.features_cat[ci]?.features);
        } else {
          updateFeature(parent.features);
        }
      });
    },

    massToggleParamFlag: (key, categoryIndex = -1) => {
      // console.log(`try toggle ${key} ${categoryIndex}`);
      set((state) => {
        const ci = +categoryIndex;
        const { full_menu, main_key, parent_key } = state;
        const parent = full_menu[main_key]?.chaild[parent_key];
        if (!parent) {
          // console.error(`Parent not found for main_key: ${main_key}, parent_key: ${parent_key}`);
          return;
        }

        const updateFeatures = (features) => {
          if (!features) return;

          const values = features.map((f) => f[key]);
          const defined = values.filter((v) => v !== null && v !== undefined);

          if (defined.length === 0) return;

          const allOnes = defined.every((v) => v === 1);
          const newValue = allOnes ? 0 : 1;

          features.forEach((f) => {
            if (f[key] === null || f[key] === undefined) return; // keep as is
            f[key] = newValue;

            // view off - edit off
            if (key === "view" && newValue === 0 && f.edit) {
              f.edit = 0;
            }
            // edit on - view on
            if (key === "edit" && newValue === 1 && f.view) {
              f.view = 1;
            }
          });
        };

        if (ci > -1) {
          updateFeatures(parent.features_cat[ci]?.features);
        } else {
          updateFeatures(parent.features);
        }
      });
    },

    massParamIsChecked: (key, catIndex) => {
      const ci = +catIndex;
      const { full_menu, main_key, parent_key } = get();
      const parent = full_menu[main_key]?.chaild[parent_key];
      if (!parent) {
        return;
      }
      const features =
        ci > -1 ? (parent.features_cat[ci]?.features ?? []) : (parent.features ?? []);

      return features?.every((f) => (f[key] ?? 1) === 1);
    },

    massCheckboxShow: (key, catIndex) => {
      const ci = +catIndex;
      const { full_menu, main_key, parent_key } = get();
      const parent = full_menu[main_key]?.chaild[parent_key];
      if (!parent) {
        return;
      }
      const features =
        ci > -1 ? (parent.features_cat[ci]?.features ?? []) : (parent.features ?? []);

      if (!features.length) return false;

      const allEmpty = features.every((f) => f[key] === null || f[key] === undefined);

      return !allEmpty;
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
  })),
);
