import { useCallback, useMemo, useRef } from "react";
import useApi from "@/src/hooks/useApi";
import { MODULE_NAME } from "./constants";
import { domainError } from "./requestErrors.mjs";

export default function useErrorsManagementApi() {
  const { api_laravel: apiLaravel, api_upload: apiUpload } = useApi(MODULE_NAME);
  const apiRef = useRef(apiLaravel);
  const uploadRef = useRef(apiUpload);
  apiRef.current = apiLaravel;
  uploadRef.current = apiUpload;

  const call = useCallback(async (method, data = {}) => {
    const response = await apiRef.current(method, data);
    if (response?.st === false) {
      throw domainError(response);
    }
    return response;
  }, []);

  const upload = useCallback(async (method, file, data = {}) => {
    const response = await uploadRef.current(method, file, data);
    if (!response || response.st === false) {
      throw domainError(response ?? {}, "Не удалось загрузить файл.");
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
      uploadPhoto: (file, data) => upload("v2/photos/upload", file, data),
      addTreeNode: (cat) => call("add_cat", { cat }),
      updateTreeNode: (cat) => call("update_cat", { cat }),
      setTreeNodeActive: (id, isActive) => call("set_active_cat", { id, is_active: isActive }),
      deleteTreeNode: (id) => call("delete_cat", { id }),
    }),
    [call, upload],
  );
}
