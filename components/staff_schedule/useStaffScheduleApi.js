import { useMemo, useRef } from "react";
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

    const parseErrorText = (error) =>
      error?.code === "ECONNABORTED"
        ? "Request timeout"
        : error?.response?.data?.text ||
          error?.response?.data?.message ||
          `HTTP ${error?.response?.status || 500}`;

    const request = async (method, payload = {}, options = {}) => {
      try {
        const response = await apiRef.current(method, payload, options);
        return { ...unwrapPayload(response), __source: "staff_schedule" };
      } catch (error) {
        return {
          st: false,
          status: error?.code === "ECONNABORTED" ? 504 : error?.response?.status || 500,
          text: parseErrorText(error),
        };
      }
    };

    return {
      getAll: () => request("get_all", {}, { timeout: 4000 }),
      getGraph: (payload) => request("get_graph", payload, { timeout: 4000 }),
      getUserDay: (payload) => request("get_user_day", payload, { timeout: 4000 }),
      getUserMonth: (payload) => request("get_user_month", payload, { timeout: 4000 }),
      getAllForNewSmena: (payload) => request("get_all_for_new_smena", payload, { timeout: 4000 }),
      getOneSmena: (payload) => request("get_one_smena", payload, { timeout: 4000 }),
      saveFastSmena: (payload) => request("save_fastSmena", payload),
      saveUserDay: (payload) => request("save_user_day", payload),
      saveUserMonth: (payload) => request("save_user_month", payload),
      saveNewSmena: (payload) => request("saveNewSmena", payload),
      saveEditSmena: (payload) => request("saveEditSmena", payload),
      deleteSmena: (payload) => request("deleteSmena", payload),
      saveFastPoint: (payload) => request("save_fastPoint", payload),
      saveFastTime: (payload) => request("save_fastTime", payload),
      saveFastTimeWeekOne: (payload) => request("save_fastTimeWeekOne", payload),
      saveUserPriceH: (payload) => request("save_userPriceH", payload),
      saveDirLv: (payload) => request("save_dir_lv", payload),
      saveDopBonus: (payload) => request("save_dop_bonus", payload),
      deleteDopBonusUser: (payload) => request("del_dop_bonus_user", payload),
      saveUserGivePrice: (payload) => request("save_user_give_price", payload),
      saveUserGiveCartPrice: (payload) => request("save_user_give_cart_price", payload),
      saveUserWithheld: (payload) => request("save_user_withheld", payload),
      saveDirBonus: (payload) => request("save_dirBonus", payload),
      downloadWS: (payload) => request("downloadWS", payload, { timeout: 15000 }),
      downloadHJ: (payload) => request("downloadHJ", payload, { timeout: 15000 }),
    };
  }, []);
}
