import { useMemo, useRef } from "react";

import useApi from "@/src/hooks/useApi";

import { createCloseBuyApi } from "./closeBuyApi";

export default function useCloseBuyApi(module = "close_buy") {
  const { api_laravel } = useApi(module);
  const apiRef = useRef(api_laravel);

  apiRef.current = api_laravel;

  return useMemo(
    () => createCloseBuyApi((method, payload = {}) => apiRef.current(method, payload)),
    [],
  );
}
