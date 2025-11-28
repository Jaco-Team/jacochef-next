"use client";

import { Backdrop, Grid } from "@mui/material";
import usePfPlanStore from "./usePfPlanStore";
import { api_laravel } from "@/src/api_new";
import { useEffect } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import dayjs from "dayjs";

export default function PfPlan() {
  const { module, isLoading, allPoints, point, dateStart, dateEnd } = usePfPlanStore();
  const setState = usePfPlanStore.setState;

  const { alertStatus, alertMessage, showAlert, closeAlert, isAlert } = useMyAlert();

  const getData = async (method, data = {}) => {
    try {
      setState({ isLoading: true });
      const response = await api_laravel(module, method, { data });
      if (!response?.data) throw new Error(`Server returned: ${response?.text || "UNKNOWN ERROR"}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setState({ isLoading: false });
    }
  };

  const getBaseData = async () => {
    try {
      const data = await getData("get_all");
      if (!data?.st) {
        return showAlert(res?.text || "Ошибка загрузки основных параметров");
      }
      document.title = data?.module_info?.name;
      setState({ allPoints: data.points, access: data.access });
    } catch (e) {
      showAlert(e.message || "Ошибка сервера");
    }
  };

  useEffect(() => {
    getBaseData();
  }, []);

  return (
    <>
      <Backdrop open={isLoading} />
      <MyAlert
        open={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        message={alertMessage}
      />
      <Grid
        container
        spacing={2}
        className="container_first_child"
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <MyAutocomplite
            data={allPoints}
            multiple={false}
            disableCloseOnSelect={false}
            value={point}
            func={(_, v) => setState({ point: v })}
            label="Кафе"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Дата от"
            value={dateStart}
            func={(v) => setState({ dateStart: dayjs(v) })}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 3,
          }}
        >
          <MyDatePickerNew
            label="Дата до"
            value={dateEnd}
            func={(v) => setState({ dateEnd: dayjs(v) })}
          />
        </Grid>
      </Grid>
    </>
  );
}
