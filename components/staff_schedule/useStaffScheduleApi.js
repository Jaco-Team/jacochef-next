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
      getAll: () => request("get_all"),
      getGraph: (payload) => request("get_graph", payload),
      getUserDay: (payload) => request("get_user_day", payload),
      getUserMonth: (payload) => request("get_user_month", payload),
      getAllForNewSmena: (payload) => request("get_all_for_new_smena", payload),
      getOneSmena: (payload) => request("get_one_smena", payload),
      saveFastSmena: (payload) => request("save_fastSmena", payload),
      saveUserDay: (payload) => request("save_user_day", payload),
      saveUserMonth: (payload) => request("save_user_month", payload),
      saveNewSmena: (payload) => request("saveNewSmena", payload),
      saveEditSmena: (payload) => request("saveEditSmena", payload),
      deleteSmena: (payload) => request("deleteSmena", payload),
      saveFastPoint: (payload) => request("save_fastPoint", payload),
      saveFastTime: (payload) => request("save_fastTime", payload),
      saveFastTimeWeekOne: (payload) => request("save_fastTimeWeekOne", payload),
      saveFastTimeArrMounth: (payload) => request("save_fastTime_arr_mounth", payload),
      saveFastTimeArrTwoWeek: (payload) => request("save_fastTime_arr_two_week", payload),
      saveUserPriceH: (payload) => request("save_userPriceH", payload),
      saveDirLv: (payload) => request("save_dir_lv", payload),
      saveDopBonus: (payload) => request("save_dop_bonus", payload),
      deleteDopBonusUser: (payload) => request("del_dop_bonus_user", payload),
      saveUserGivePrice: (payload) => request("save_user_give_price", payload),
      saveUserGiveCartPrice: (payload) => request("save_user_give_cart_price", payload),
      saveUserWithheld: (payload) => request("save_user_withheld", payload),
      saveDirBonus: (payload) => request("save_dirBonus", payload),
      getMyErrOrder: (payload) => request("get_my_err_order", payload),
      getMyErrCam: (payload) => request("get_my_err_cam", payload),
      saveFakeOrders: (payload) => request("save_fake_orders", payload),
      saveFakeCam: (payload) => request("save_fake_cam", payload),
      downloadWS: (payload) => request("downloadWS", payload),
      downloadHJ: (payload) => request("downloadHJ", payload),
    };
  }, []);
}
