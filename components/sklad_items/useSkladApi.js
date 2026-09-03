"use client";

import { useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";

export default function useSkladApi() {
  const { api_laravel, api_upload } = useApi("sklad_items");
  const apiRef = useRef(api_laravel);
  const uploadRef = useRef(api_upload);
  apiRef.current = api_laravel;
  uploadRef.current = api_upload;

  return useMemo(() => {
    const request = (method, payload = {}, options = {}) =>
      apiRef.current(method, payload, options);
    const upload = (method, file, payload = {}) => uploadRef.current(method, file, payload);

    return {
      getBootstrap: (payload = {}) => request("get_all", payload),
      getUnits: () => request("units/list"),
      getCategories: (sourceType) => request("categories/list", { source_type: sourceType }),
      createCategory: (payload) => request("categories/save_new", payload),
      updateCategory: (payload) => request("categories/save_edit", payload),
      deleteCategory: (payload) => request("categories/delete", payload),
      createProductionCategory: (name) =>
        request("categories/save_new", { source_type: "semi_finished", name }),
      updateProductionCategory: (id, name) =>
        request("categories/save_edit", { id, source_type: "semi_finished", name }),
      deleteProductionCategory: (id) =>
        request("categories/delete", { id, source_type: "semi_finished" }),
      createSiteCategory: (payload) => request("site-items/categories/save_new", payload),
      createUnit: (payload) => request("units/save_new", payload),
      updateUnit: (payload) => request("units/save_edit", payload),
      deleteUnit: (id) => request("units/delete", { id }),
      getRecipes: (payload = {}) => request("recipes/list", payload),
      getRecipe: (id) => request("recipes/get_one", { id }),
      createRecipe: (payload) => request("recipes/save_new", payload),
      updateRecipe: (payload) => request("recipes/save_edit", payload),
      saveRecipeFlag: (payload) => request("recipes/save_flag", payload),
      getSemiFinished: (payload = {}) => request("semi-finished/list", payload),
      getSemiFinishedOne: (id) => request("semi-finished/get_one", { id }),
      createSemiFinished: (payload) => request("semi-finished/save_new", payload),
      updateSemiFinished: (payload) => request("semi-finished/save_edit", payload),
      saveSemiFinishedFlag: (payload) => request("semi-finished/save_flag", payload),
      getWarehouseItems: (payload = {}) => request("items/list", payload),
      getWarehouseItemBootstrap: () => request("items/get_all_for_new"),
      getWarehouseItem: (id) => request("items/get_one", { id }),
      createWarehouseItem: (payload) => request("items/save_new", payload),
      updateWarehouseItem: (payload) => request("items/save_edit", payload),
      saveWarehouseItemFlag: (payload) => request("items/save_flag", payload),
      checkWarehouseItemArt: (payload) => request("items/check_art", payload),
      deleteWarehouseItem: (id) => request("items/delete", { id }),
      convertProductionEntity: (payload) => request("entities/convert_type", payload),
      getSiteItems: (payload = {}) => request("site-items/list", payload),
      getSiteItemBootstrap: () => request("site-items/get_all_for_new"),
      getSiteItem: (id) => request("site-items/get_one", { id }),
      createSiteItem: (payload) => request("site-items/save_new", payload),
      updateSiteItem: (payload) => request("site-items/save_edit", payload),
      saveSiteItemFlag: (payload) => request("site-items/save_flag", payload),
      createSiteItemTag: (payload) => request("site-items/tags/save_new", payload),
      updateSiteItemTag: (payload) => request("site-items/tags/save_edit", payload),
      uploadSiteItemImage: (file, payload) => upload("site-items/upload_image", file, payload),
      restoreSiteItemImage: (payload) => request("site-items/restore_image", payload),
      historyList: (payload = {}) => request("history/list", payload),
      historyGetOne: (payload = {}) => request("history/get_one", payload),
      historyCompare: (payload = {}) => request("history/compare", payload),
      historyResolve: (payload = {}) => request("history/resolve", payload),
      cancelScheduledHistory: (payload = {}) => request("history/schedule/cancel", payload),
      getArchiveList: (payload = {}) => request("entities/archive_list", payload),
      archiveEntity: (payload) => request("entities/archive", payload),
      deleteEntity: (payload) => request("entities/delete", payload),
    };
  }, []);
}
