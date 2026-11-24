import { useMemo, useRef } from "react";

import useApi from "@/src/hooks/useApi";

import { createKitchenQueueApi } from "./kitchenQueueApi";

export default function useKitchenQueueApi() {
  const { api_laravel } = useApi("kitchen_queue_settings");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(
    () => createKitchenQueueApi((method, payload = {}) => apiRef.current(method, payload)),
    [],
  );
}
