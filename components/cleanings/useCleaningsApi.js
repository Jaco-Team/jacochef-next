import { useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";

export default function useCleaningsApi() {
  const { api_laravel } = useApi("cleanings");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(() => {
    const request = (method, payload = {}) => apiRef.current(method, payload);

    return {
      getBootstrap: () => request("get_all"),
      getTemplates: () => request("templates"),
      getCategories: () => request("categories"),
      getCafes: (payload) => request("cafes", payload),
      getControl: (payload) => request("control", payload),
      createTemplate: (payload) => request("templates/save_new", payload),
      updateTemplate: (id, payload) => request("templates/save_edit", { ...payload, id }),
      updateTemplateStatus: (id, status) => request("templates/save_status", { id, status }),
      deleteTemplate: (id) => request("templates/delete", { id }),
      createCategory: (payload) => request("categories/save_new", payload),
      updateCategory: (id, payload) => request("categories/save_edit", { ...payload, id }),
      deleteCategory: (id) => request("categories/delete", { id }),
      saveCafeAssignments: (payload) => request("assignments/save", payload),
      assignTemplateToCafe: (locationId, templateId) =>
        request(`cafes/${locationId}/templates/${templateId}/assign`),
      removeTemplateFromCafe: (locationId, templateId) =>
        request(`cafes/${locationId}/templates/${templateId}/delete`),
      addManualCleaning: (payload) => request("control/manual-cleanings", payload),
      approveControlCleaning: (id) => request(`control/cleanings/${id}/approve`),
      returnControlCleaning: (id) => request(`control/cleanings/${id}/return`),
      detachControlCleaning: (id) => request(`control/cleanings/${id}/detach`),
      deleteControlCleaning: (id, reason = "") =>
        request(`control/cleanings/${id}/delete`, { reason }),
      getPreparationEditContext: (payload) => request("control/get_edit_work", payload),
      savePreparationEdit: (payload) => request("control/save_edit", payload),
      approvePreparation: (id) => request(`control/preparations/${id}/approve`),
      deletePreparation: (id, reason = "") =>
        request(`control/preparations/${id}/delete`, { reason }),
      getTemplateHistory: (id) => request("history/template", { id }),
      getCategoryHistory: (id) => request("history/category", { id }),
    };
  }, []);
}
