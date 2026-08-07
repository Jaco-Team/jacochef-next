import { useMemo } from "react";

import useApi from "@/src/hooks/useApi";

import { createCloseBuyApi } from "./closeBuyApi";

export default function useCloseBuyApi() {
  const { api_laravel } = useApi("close_buy");

  return useMemo(
    () => createCloseBuyApi((method, payload = {}) => api_laravel(method, payload)),
    [api_laravel],
  );
}
