import { useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";

export default function useCleaningsApi() {
  const { api_laravel } = useApi("cleanings");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(() => {
    const request = (method, payload = {}, options = {}) =>
      apiRef.current(method, payload, options);

    return {
      getBootstrap: () => request("get_all"),
      getLampsBootstrap: () => request("lamps/bootstrap"),
      getLamps: (payload) => request("lamps", payload),
      getLampHistory: (payload) => request("lamps/history", payload),
      saveLamp: (payload) => request("lamps/save", payload),
      saveLampActivity: (payload) => request("lamps/activity/save", payload),
      replaceLamp: (payload) => request("lamps/replace", payload),
      exportLamps: (payload) => request("lamps/export", payload, { responseType: "blob" }),
      getTemplates: () => request("templates"),
      getCategories: () => request("categories"),
      getCafes: (payload) => request("cafes", payload),
      getControl: (payload) => request("control", payload),
      createTemplate: (payload) => request("templates/save_new", payload),
      updateTemplate: (id, payload) => request("templates/save_edit", { ...payload, id }),
      updateTemplateStatus: (id, status) =>
        request("templates/save_status", {
          id,
          type: "is_active",
          value: status === "archive" ? 0 : 1,
        }),
      deleteTemplate: (id) => request("templates/delete", { id }),
      createCategory: (payload) => request("categories/save_new", payload),
      updateCategory: (id, payload) => request("categories/save_edit", { ...payload, id }),
      deleteCategory: (id) => request("categories/delete", { id }),
      saveCategoryTemplates: (id, templateIds) =>
        request("categories/templates/save", { id, templateIds }),
      assignTemplateToCafe: (locationId, templateId, dopTime = 0) =>
        request("cafes/assign", { locationId, templateId, dop_time: dopTime }),
      removeTemplateFromCafe: (locationId, templateId) =>
        request("cafes/remove", { locationId, templateId }),
      saveCafeDopTimes: (locationId, items) =>
        request("cafes/save_dop_time", { locationId, items }),
      addManualCleaning: (locationId, templateId) =>
        request("control/manual_add", { locationId, templateId }),
      approveControlCleaning: (locationId, id) => request("control/approve", { locationId, id }),
      returnControlCleaning: (locationId, id) => request("control/return", { locationId, id }),
      detachControlCleaning: (locationId, id) => request("control/detach", { locationId, id }),
      deleteControlCleaning: (locationId, id, text = "") =>
        request("control/delete", { locationId, id, text }),
      getPreparationEditContext: (payload) => request("control/get_edit_work", payload),
      savePreparationEdit: (payload) => request("control/save_edit", payload),
      approvePreparation: (locationId, id) =>
        request("control/approve_preparation", { locationId, id }),
      deletePreparation: (locationId, id, text = "") =>
        request("control/delete_preparation", { locationId, id, text }),
      getTemplateHistory: (id) => request("history/template", { id }),
      getCategoryHistory: (id) => request("history/category", { id }),
      getCafeHistory: (locationId) => request("history/cafe", { locationId }),
      getControlHistory: (locationId, id, type) =>
        request("control/history", { locationId, id, type }),
    };
  }, []);
}
