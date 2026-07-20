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
      createUnit: (payload) => request("units/save_new", payload),
      updateUnit: (payload) => request("units/save_edit", payload),
      deleteUnit: (id) => request("units/delete", { id }),
      getCategories: (payload = {}) => request("categories/list", payload),
      createCategory: (payload) => request("categories/save_new", payload),
      updateCategory: (payload) => request("categories/save_edit", payload),
      deleteCategory: (id) => request("categories/delete", { id }),
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
      getSiteItems: (payload = {}) => request("site-items/list", payload),
      getSiteItemBootstrap: () => request("site-items/get_all_for_new"),
      getSiteItem: (id) => request("site-items/get_one", { id }),
      createSiteItem: (payload) => request("site-items/save_new", payload),
      updateSiteItem: (payload) => request("site-items/save_edit", payload),
      saveSiteItemFlag: (payload) => request("site-items/save_flag", payload),
      createSiteItemTag: (payload) => request("site-items/tags/save_new", payload),
      updateSiteItemTag: (payload) => request("site-items/tags/save_edit", payload),
      syncSiteItemsVk: () => request("site-items/sync_vk", {}),
      uploadSiteItemImage: (file, payload) => upload("site-items/upload_image", file, payload),
      getHistoryList: (payload = {}) => request("history/list", payload),
      getHistoryOne: (payload = {}) => request("history/get_one", payload),
      getHistoryCompare: (payload = {}) => request("history/compare", payload),
      historyList: (payload = {}) => request("history/list", payload),
      historyGetOne: (payload = {}) => request("history/get_one", payload),
      historyCompare: (payload = {}) => request("history/compare", payload),
      getArchiveList: (payload = {}) => request("entities/archive_list", payload),
      archiveList: (payload = {}) => request("entities/archive_list", payload),
      archiveEntity: (payload) => request("entities/archive", payload),
      deleteEntity: (payload) => request("entities/delete", payload),
    };
  }, []);
}
