"use client";

import {
  Backdrop,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import usePfPlanStore from "./usePfPlanStore";
import { api_laravel } from "@/src/api_new";
import { useEffect, useMemo } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import dayjs from "dayjs";

export default function PfPlan() {
  const { module, module_name, isLoading, allPoints, point, dateStart, dateEnd, stats, allPfs } =
    usePfPlanStore();
  const setState = usePfPlanStore.setState;

  const { alertStatus, alertMessage, showAlert, closeAlert, isAlert } = useMyAlert();

  const weekDays = useMemo(() => {
    if (!stats?.week_start) return [];
    return [
      stats.week_start,
      ...Array.from({ length: 6 }, (_, i) =>
        dayjs(stats.week_start)
          .add(i + 1, "day")
          .format("YYYY-MM-DD"),
      ),
    ];
  }, [stats]);

  const getData = async (method, payload = {}) => {
    try {
      setState({ isLoading: true });
      const response = await api_laravel(module, method, payload);
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
        return showAlert(data?.text || "Ошибка загрузки основных параметров");
      }
      const module_name = data?.module_info?.name || "";
      document.title = module_name;
      setState({ allPoints: data.points, access: data.access, module_name });
    } catch (e) {
      showAlert(e.message || "Ошибка сервера");
    }
  };

  const getPfPlanData = async () => {
    try {
      const payload = {
        point,
        date_start: dayjs("2025-11-01").format("YYYY-MM-DD"),
        date_end: dayjs("2025-11-07").format("YYYY-MM-DD"),
        // date_start: dayjs(dateStart).format("YYYY-MM-DD"),
        // date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
      };
      const data = await getData("get_data", payload);
      if (!data?.st) {
        return showAlert(data?.text || "Ошибка загрузки данных плана");
      }
      setState({ stats: data.stats, allPfs: data.all_pf });
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
        <Grid size={12}>
          <Typography variant="h4">{module_name}</Typography>
        </Grid>

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
        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={getPfPlanData}
          >
            Показать
          </Button>
        </Grid>
        <Grid size={12}>
          <Typography variant="h6">Данные плана по кафе {point?.name || ""}</Typography>
          <TableContainer sx={{ maxHeight: "65dvh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ПФ</TableCell>
                  <TableCell>Пн.</TableCell>
                  <TableCell>Вт.</TableCell>
                  <TableCell>Ср.</TableCell>
                  <TableCell>Чт.</TableCell>
                  <TableCell>Пт.</TableCell>
                  <TableCell>Сб.</TableCell>
                  <TableCell>Вс.</TableCell>
                  <TableCell>Неделя</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {stats?.forecast &&
                  Object.entries(stats.forecast).map(([pfId, f]) => {
                    const pf = allPfs?.find((p) => +p.id === +pfId);
                    const a = stats.actual[pfId]; // may be undefined

                    return (
                      <TableRow key={pfId}>
                        <TableCell>
                          {pf?.name ?? ""}({pf?.id})
                        </TableCell>

                        {weekDays.map((date) => {
                          const fv = f.daily[date] ?? 0;
                          const av = a?.daily?.[date];

                          return (
                            <TableCell key={date}>
                              {fv}
                              {av !== undefined && (
                                <span style={{ color: "#8a8a8a", marginLeft: 4 }}>({av})</span>
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell>
                          {f.weekly_total}
                          {a?.weekly_total !== undefined && (
                            <span style={{ color: "#8a8a8a", marginLeft: 4 }}>
                              ({a.weekly_total})
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
