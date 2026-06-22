import { useMemo, useRef } from "react";
import axios from "axios";
import queryString from "query-string";
import useApi from "@/src/hooks/useApi";

export default function useStaffScheduleApi() {
  const { api_laravel } = useApi("staff_schedule");
  const apiRef = useRef(api_laravel);
  apiRef.current = api_laravel;

  return useMemo(() => {
    const unwrapPayload = (payload) => {
      if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
        return payload.data;
      }

      return payload;
    };

    const buildLegacyBody = (method, payload = {}) =>
      queryString.stringify({
        method,
        module: "work_schedule",
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(payload),
      });

    const parseErrorText = (error) =>
      error?.response?.data?.text ||
      error?.response?.data?.message ||
      `HTTP ${error?.response?.status || 500}`;

    const shouldUseLegacyFallback = (response) => {
      const text = String(response?.text || "").toLowerCase();

      return (
        response?.status === 403 ||
        response?.status === 500 ||
        text.includes("forbidden") ||
        text.includes("http 403") ||
        text.includes("http 500")
      );
    };

    const requestCurrent = async (method, payload = {}) => {
      try {
        const response = await apiRef.current(method, payload);
        return { ...unwrapPayload(response), __source: "staff_schedule" };
      } catch (error) {
        return {
          st: false,
          status: error?.response?.status || 500,
          text: parseErrorText(error),
        };
      }
    };

    const requestLegacy = async (method, payload = {}) => {
      try {
        const response = await axios.post(
          "https://jacochef.ru/api/index_new.php",
          buildLegacyBody(method, payload),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        if (typeof response?.data === "string") {
          return { st: false, text: response.data, status: response?.status || 200 };
        }

        return { ...unwrapPayload(response?.data), __source: "work_schedule_fallback" };
      } catch (error) {
        return {
          st: false,
          status: error?.response?.status || 500,
          text: parseErrorText(error),
        };
      }
    };

    const request = async (method, payload = {}, options = {}) => {
      const response = await requestCurrent(method, payload);

      if (response?.st || !options.allowLegacyFallback || !shouldUseLegacyFallback(response)) {
        return response;
      }

      return requestLegacy(method, payload);
    };

    return {
      getAll: () => requestCurrent("get_all"),
      getGraph: (payload) => request("get_graph", payload, { allowLegacyFallback: true }),
      getUserDay: (payload) => request("get_user_day", payload, { allowLegacyFallback: true }),
      getUserMonth: (payload) => request("get_user_month", payload, { allowLegacyFallback: true }),
      getAllForNewSmena: (payload) =>
        request("get_all_for_new_smena", payload, { allowLegacyFallback: true }),
      getOneSmena: (payload) => request("get_one_smena", payload, { allowLegacyFallback: true }),
    };
  }, []);
}
