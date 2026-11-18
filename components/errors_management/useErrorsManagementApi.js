import { useCallback, useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";
import { MODULE_NAME } from "./constants";
import { domainError } from "./requestErrors.mjs";

export default function useErrorsManagementApi() {
  const { api_laravel: apiLaravel } = useApi(MODULE_NAME);
  const apiRef = useRef(apiLaravel);
  apiRef.current = apiLaravel;

  const call = useCallback(async (method, data = {}) => {
    const response = await apiRef.current(method, data);
    if (response?.st === false) {
      throw domainError(response);
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
      createComplaint: (data) => call("v2/create", data),
      getComplaint: (data) => call("v2/detail", data),
      transitionComplaint: (data) => call("v2/transition", data),
      removeComplaintError: (data) => call("v2/errors/remove", data),
      getSettings: (data) => call("v2/settings", data),
      saveSetting: (data) => call("v2/settings/save", data),
      getSettingHistory: (data) => call("v2/settings/history", data),
    }),
    [call],
  );
}
