import { useCallback, useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";
import { MODULE_NAME } from "./constants";

export default function useErrorsManagementApi() {
  const { api_laravel: apiLaravel } = useApi(MODULE_NAME);
  const apiRef = useRef(apiLaravel);
  apiRef.current = apiLaravel;

  const call = useCallback(async (method, data = {}, config = {}) => {
    const response = await apiRef.current(method, data, config);
    if (response?.st === false) {
      throw new Error(response.text || "Не удалось выполнить запрос.");
    }
    return response;
  }, []);

  return useMemo(
    () => ({
      bootstrap: () => call("get_all"),
      listOrders: (data) => call("get_orders", data),
      getOrder: (data) => call("get_order_new", data),
      listComplaints: (data) => call("v2/journal", data),
      getStatistics: (data) => call("v2/statistics", data),
      getRegistrationContext: (data) => call("v2/context", data),
      createComplaint: (data, config) => call("v2/create", data, config),
      getComplaint: (data) => call("v2/detail", data),
      transitionComplaint: (data, config) => call("v2/transition", data, config),
      getSettings: (data) => call("v2/settings", data),
      saveSetting: (data, config) => call("v2/settings/save", data, config),
      getSettingHistory: (data) => call("v2/settings/history", data),
    }),
    [call],
  );
}
