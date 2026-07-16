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
    };
  }, []);
}
