"use client";

import { useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";

export default function useSkladApi() {
  const { api_laravel } = useApi("sklad_items");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(() => {
    const request = (method, payload = {}, options = {}) =>
      apiRef.current(method, payload, options);

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
      getSemiFinished: (payload = {}) => request("semi-finished/list", payload),
      getSemiFinishedOne: (id) => request("semi-finished/get_one", { id }),
      getSiteItems: (payload = {}) => request("site-items/list", payload),
      getSiteItem: (id) => request("site-items/get_one", { id }),
      getHistoryList: (payload = {}) => request("history/list", payload),
      getHistoryOne: (payload = {}) => request("history/get_one", payload),
      getHistoryCompare: (payload = {}) => request("history/compare", payload),
      historyList: (payload = {}) => request("history/list", payload),
      historyGetOne: (payload = {}) => request("history/get_one", payload),
      historyCompare: (payload = {}) => request("history/compare", payload),
      getArchiveList: (payload = {}) => request("entities/archive_list", payload),
      archiveList: (payload = {}) => request("entities/archive_list", payload),
    };
  }, []);
}
