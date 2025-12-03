"use client";

import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import usePfPlanStore from "./usePfPlanStore";
import { api_laravel } from "@/src/api_new";
import { useEffect, useMemo, useState } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MyWeekPicker } from "@/ui/Forms";
import dayjs from "dayjs";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function PfPlan() {
  const { module, module_name, isLoading, allPoints, point, week, stats, stats2, allPfs } =
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
    const { point, week } = usePfPlanStore.getState();
    if (!point) return showAlert("Не выбрано кафе");
    if (!week) return showAlert("Выбери неделю");
    try {
      const payload = {
        point,
        // date_start: dayjs("2025-11-01").format("YYYY-MM-DD"),
        // date_end: dayjs("2025-11-07").format("YYYY-MM-DD"),
        date_start: dayjs(week?.weekStart).format("YYYY-MM-DD"),
        date_end: dayjs(week?.weekEnd).format("YYYY-MM-DD"),
      };
      const data = await getData("get_data", payload);
      if (!data?.st) {
        return showAlert(data?.text || "Ошибка загрузки данных плана");
      }
      setState({ stats: data.stats, stats2: data.stats2, allPfs: data.all_pf });
      // showAlert("Данные успешно загружены", true);
    } catch (e) {
      showAlert(e.message || "Ошибка сервера");
    }
  };

  const [statType, setStatType] = useState("MA");
  const currentStat = useMemo(() => (statType === "MA" ? stats : stats2), [statType, stats]);

  useEffect(() => {
    getBaseData();
  }, []);

  return (
    <>
      <Backdrop
        open={isLoading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
      >
        <CircularProgress />
      </Backdrop>
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
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
          <MyWeekPicker
            value={week?.weekStart || null}
            onChange={(r) => {
              setState({
                week: {
                  weekStart: r.weekStart,
                  weekEnd: r.weekEnd,
                  weekNumber: r.weekNumber,
                },
              });
            }}
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
          <ToggleButtonGroup>
            <ToggleButton
              value="MA"
              selected={statType === "MA"}
              onChange={() => setStatType("MA")}
            >
              Плавающее среднее
            </ToggleButton>
            <ToggleButton
              value="BA"
              selected={statType === "BA"}
              onChange={() => setStatType("BA")}
            >
              АППГ + тренд
            </ToggleButton>
          </ToggleButtonGroup>
          <TableContainer sx={{ maxHeight: "65dvh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ minWidth: "25%" }}>ПФ</TableCell>
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
                {currentStat?.forecast &&
                  currentStat.forecast.map((f) => {
                    const pfId = f.id;
                    const pf = allPfs?.find((p) => +p.id === +pfId);
                    const a = currentStat?.actual?.find((item) => +item.id === +pfId);

                    return (
                      <TableRow key={pfId}>
                        <TableCell>
                          {pf?.name ?? "НЕТ НАЗВАНИЯ"} {`, ${pf?.ed_izmer_name}`}
                        </TableCell>

                        {weekDays.map((date) => {
                          const fv = f.daily[date] ?? 0;
                          const av = a?.daily?.[date];

                          return (
                            <TableCell key={date}>
                              {formatNumber(fv, 0, 2)}
                              {av !== undefined && (
                                <span style={{ color: "#8a8a8a", marginLeft: 4 }}>
                                  ({formatNumber(av, 0, 2)})
                                </span>
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell>
                          {formatNumber(f.weekly_total, 0, 2)}
                          {a?.weekly_total !== undefined && (
                            <span style={{ color: "#8a8a8a", marginLeft: 4 }}>
                              ({formatNumber(a.weekly_total, 0, 2)})
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
