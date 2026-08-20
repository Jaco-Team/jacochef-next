import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WbIncandescentOutlinedIcon from "@mui/icons-material/WbIncandescentOutlined";
import { MyDatePickerNewViews, MySelect } from "@/ui/Forms";
import { useConfirm } from "@/src/hooks/useConfirm";
import { CleaningsLampActivityDialog, CleaningsLampDialog } from "./CleaningsLampDialogs";
import useCleaningsApi from "./useCleaningsApi";
import { getLocationName, isSameId } from "./helpers";

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  lineHeight: "20px",
  whiteSpace: "nowrap",
};

function monthValue(value) {
  return dayjs(value).format("YYYY-MM");
}

function activityCells(day, lampId) {
  return day?.lamps?.find((lamp) => isSameId(lamp.lamp_id, lampId)) || null;
}

function MobileDayCard({ day, lamps, onEditActivity, onAddActivity }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: "10px", overflow: "hidden" }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{day.date || "—"}</Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Подпись менеджера: {day.manager || "—"}
          </Typography>
        </Box>
        <ScheduleOutlinedIcon
          color="action"
          fontSize="small"
        />
      </Box>

      <Box sx={{ p: 1.25, display: "grid", gap: 1 }}>
        {lamps.map((lamp) => {
          const activity = activityCells(day, lamp.id);
          const hasActivity = Boolean(activity?.id);

          return (
            <Box
              key={lamp.id}
              sx={{
                p: 1.25,
                borderRadius: "8px",
                bgcolor: "action.hover",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 0.75,
                alignItems: "center",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{lamp.place}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {lamp.name} ·{" "}
                  {hasActivity
                    ? `${activity.only_time_start}–${activity.only_time_end}`
                    : "Нет активации"}
                </Typography>
              </Box>
              <Button
                size="small"
                variant={hasActivity ? "text" : "outlined"}
                onClick={() => (hasActivity ? onEditActivity(activity) : onAddActivity(lamp))}
                sx={{ minWidth: 0, whiteSpace: "nowrap" }}
              >
                {hasActivity ? activity.diff || "Изменить" : "Добавить"}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default function CleaningsLampsView({
  locations = [],
  canEdit = false,
  canExport = false,
  showAlert,
}) {
  const cleaningsApi = useCleaningsApi();
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const { withConfirm, ConfirmDialog } = useConfirm();
  const initialLocationId = locations[0]?.id ?? "";
  const [locationId, setLocationId] = useState(initialLocationId);
  const [dateFrom, setDateFrom] = useState(dayjs().startOf("month"));
  const [dateTo, setDateTo] = useState(dayjs().startOf("month"));
  const [lamps, setLamps] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lampDialogOpen, setLampDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [lampEdit, setLampEdit] = useState(null);
  const [activityEdit, setActivityEdit] = useState(null);
  const [activityType, setActivityType] = useState(null);

  const locationOptions = useMemo(
    () => locations.map((location) => ({ id: location.id, name: getLocationName(location) })),
    [locations],
  );

  useEffect(() => {
    if (locations.some((location) => isSameId(location.id, locationId))) return;
    setLocationId(initialLocationId);
  }, [initialLocationId, locationId, locations]);

  const loadLamps = useCallback(async () => {
    if (!locationId) return;

    setLoading(true);
    try {
      const response = await cleaningsApi.getLamps({
        pointId: locationId,
        dateFrom: monthValue(dateFrom),
        dateTo: monthValue(dateTo),
      });
      if (!response?.st) throw new Error(response?.text || "Ошибка загрузки журнала ламп");
      setLamps(Array.isArray(response.list) ? response.list : []);
      setDays(Array.isArray(response.active_lamp) ? response.active_lamp : []);
    } catch (error) {
      setLamps([]);
      setDays([]);
      showAlert(error?.message || "Ошибка загрузки журнала ламп");
    } finally {
      setLoading(false);
    }
  }, [cleaningsApi, dateFrom, dateTo, locationId, showAlert]);

  useEffect(() => {
    loadLamps();
  }, [loadLamps]);

  const closeLampDialog = useCallback(() => {
    setLampDialogOpen(false);
    setLampEdit(null);
  }, []);

  const closeActivityDialog = useCallback(() => {
    setActivityDialogOpen(false);
    setActivityEdit(null);
    setActivityType(null);
  }, []);

  const saveLamp = useCallback(
    async (payload) => {
      const response = await cleaningsApi.saveLamp({ ...payload, pointId: locationId });
      if (!response?.st) return showAlert(response?.text || "Ошибка сохранения лампы");
      showAlert("Лампа сохранена", true);
      closeLampDialog();
      loadLamps();
    },
    [cleaningsApi, closeLampDialog, loadLamps, locationId, showAlert],
  );

  const saveActivity = useCallback(
    async (payload) => {
      const response = await cleaningsApi.saveLampActivity({ ...payload, pointId: locationId });
      if (!response?.st) return showAlert(response?.text || "Ошибка сохранения активности");
      showAlert("Активация сохранена", true);
      closeActivityDialog();
      loadLamps();
    },
    [cleaningsApi, closeActivityDialog, loadLamps, locationId, showAlert],
  );

  const replaceLamp = useCallback(
    async (payload) => {
      const response = await cleaningsApi.replaceLamp({ ...payload, pointId: locationId });
      if (!response?.st) return showAlert(response?.text || "Ошибка замены лампы");
      showAlert("Лампа заменена", true);
      closeActivityDialog();
      loadLamps();
    },
    [cleaningsApi, closeActivityDialog, loadLamps, locationId, showAlert],
  );

  const download = useCallback(async () => {
    try {
      const file = await cleaningsApi.exportLamps({
        pointId: locationId,
        dateFrom: monthValue(dateFrom),
        dateTo: monthValue(dateTo),
      });
      const url = window.URL.createObjectURL(new Blob([file]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Журнал ламп ${monthValue(dateFrom)}_${monthValue(dateTo)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert(error?.message || "Ошибка экспорта журнала ламп");
    }
  }, [cleaningsApi, dateFrom, dateTo, locationId, showAlert]);

  const openNewActivity = (lamp) => {
    setActivityEdit(lamp);
    setActivityType("new");
    setActivityDialogOpen(true);
  };

  const openEditActivity = (activity) => {
    const lamp = lamps.find((item) => isSameId(item.id, activity.lamp_id));
    setActivityEdit({ ...activity, name: lamp?.name || "" });
    setActivityType("edit");
    setActivityDialogOpen(true);
  };

  return (
    <Grid
      container
      spacing={2.5}
    >
      <Grid size={12}>
        <Paper
          variant="outlined"
          sx={{ borderRadius: "8px", overflow: "hidden" }}
        >
          <Grid
            container
            spacing={1.5}
            sx={{ p: 1.5 }}
            alignItems="center"
          >
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={dateFrom}
                func={setDateFrom}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={dateTo}
                func={setDateTo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <MySelect
                label="Точка"
                data={locationOptions}
                value={locationId}
                func={(event) => setLocationId(event.target.value)}
                is_none={false}
                disabled={locationOptions.length <= 1}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "stretch", md: "flex-end" },
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadLamps}
                  disabled={loading}
                  sx={actionButtonSx}
                >
                  Обновить
                </Button>
                {canEdit ? (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setLampDialogOpen(true)}
                    sx={actionButtonSx}
                  >
                    Добавить лампу
                  </Button>
                ) : null}
                {canExport ? (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={download}
                    sx={actionButtonSx}
                  >
                    XLS
                  </Button>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.5 }}>
          {days.map((day) => (
            <MobileDayCard
              key={day.date}
              day={day}
              lamps={lamps}
              onEditActivity={openEditActivity}
              onAddActivity={openNewActivity}
            />
          ))}
          {!days.length ? (
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: "10px" }}
            >
              <Typography color="text.secondary">За выбранный период данных нет.</Typography>
            </Paper>
          ) : null}
        </Box>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ display: { xs: "none", md: "block" }, borderRadius: "10px", overflowX: "auto" }}
        >
          <Table
            sx={{
              minWidth: 860,
              borderCollapse: "separate",
              borderSpacing: 0,
              "& th, & td": {
                borderRight: "1px solid",
                borderBottom: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                verticalAlign: "middle",
              },
              "& tbody tr:last-of-type td": { borderBottom: 0 },
              "& th": { bgcolor: "action.hover" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{ width: 150 }}
                >
                  Дата проверки
                </TableCell>
                {lamps.map((lamp) => (
                  <TableCell
                    key={lamp.id}
                    colSpan={3}
                    sx={{ p: 1.25 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        <Tooltip title="Размещение">
                          <PlaceOutlinedIcon
                            sx={{ color: "text.primary" }}
                            fontSize="small"
                          />
                        </Tooltip>
                        <Typography sx={{ fontWeight: 800 }}>{lamp.place || "—"}</Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        №{lamp.number}
                      </Typography>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        <Tooltip title="Модель">
                          <WbIncandescentOutlinedIcon
                            sx={{ color: "text.primary" }}
                            fontSize="small"
                          />
                        </Tooltip>
                        <Typography sx={{ fontWeight: 800 }}>{lamp.name || "—"}</Typography>
                      </Box>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        <Tooltip title="Ресурс">
                          <TimerOutlinedIcon
                            sx={{ color: "text.primary" }}
                            fontSize="small"
                          />
                        </Tooltip>
                        <Typography color="text.secondary">{lamp.resource || 0} ч</Typography>
                      </Box>
                      {canEdit ? (
                        <Tooltip title="Редактировать лампу">
                          <IconButton
                            color="primary"
                            size="small"
                            aria-label="Редактировать лампу"
                            onClick={() => {
                              setLampEdit(lamp);
                              setLampDialogOpen(true);
                            }}
                            sx={{
                              ml: 2,
                              border: 1,
                              borderColor: "primary.main",
                              color: "primary.main",
                              borderRadius: 1.5,
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Box>
                  </TableCell>
                ))}
                <TableCell
                  rowSpan={2}
                  sx={{ width: 190 }}
                >
                  Подпись менеджера смены
                </TableCell>
              </TableRow>
              <TableRow>
                {lamps.map((lamp) => (
                  <Fragment key={lamp.id}>
                    <TableCell sx={{ p: 0.75 }}>Включение</TableCell>
                    <TableCell sx={{ p: 0.75 }}>Выключение</TableCell>
                    <TableCell sx={{ p: 0.75 }}>Время работы</TableCell>
                  </Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {days.map((day) => {
                const rowActivities = lamps.map((lamp) => activityCells(day, lamp.id));
                const rowActivity = rowActivities.find((activity) => activity?.id);
                const isInteractive = Boolean(rowActivity?.id && canEdit);

                return (
                  <TableRow
                    key={day.date}
                    hover={isInteractive}
                    tabIndex={isInteractive ? 0 : undefined}
                    onClick={(event) => {
                      if (isInteractive) {
                        event.currentTarget.blur();
                        openEditActivity(rowActivity);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (isInteractive && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        event.currentTarget.blur();
                        openEditActivity(rowActivity);
                      }
                    }}
                    sx={{
                      cursor: isInteractive ? "pointer" : "default",
                      "&:focus-visible": isInteractive
                        ? { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 }
                        : undefined,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{day.date}</TableCell>
                    {lamps.map((lamp, lampIndex) => {
                      const activity = rowActivities[lampIndex];
                      return (
                        <Fragment key={lamp.id}>
                          <TableCell>{activity?.only_time_start || "—"}</TableCell>
                          <TableCell>{activity?.only_time_end || "—"}</TableCell>
                          <TableCell>{activity?.diff || "—"}</TableCell>
                        </Fragment>
                      );
                    })}
                    <TableCell sx={{ color: day.manager ? "text.primary" : "text.disabled" }}>
                      {day.manager || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {canEdit ? (
                <TableRow>
                  <TableCell sx={{ p: 1 }}>Добавить</TableCell>
                  {lamps.map((lamp) => (
                    <TableCell
                      key={lamp.id}
                      colSpan={3}
                      sx={{ p: 0.75 }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openNewActivity(lamp)}
                      >
                        Добавить активацию
                      </Button>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              ) : null}
              <TableRow>
                <TableCell sx={{ p: 1, fontWeight: 800 }}>Отработано часов</TableCell>
                {lamps.map((lamp) => (
                  <Fragment key={lamp.id}>
                    <TableCell />
                    <TableCell />
                    <TableCell>{lamp.svod || "0:00"}</TableCell>
                  </Fragment>
                ))}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <CleaningsLampDialog
        open={lampDialogOpen}
        lamp={lampEdit}
        onClose={closeLampDialog}
        onSave={saveLamp}
        fullScreen={isMobile}
      />
      <CleaningsLampActivityDialog
        open={activityDialogOpen}
        activity={activityEdit}
        mode={activityType}
        lamp={
          activityType === "new"
            ? activityEdit
            : lamps.find((item) => isSameId(item.id, activityEdit?.lamp_id))
        }
        onClose={closeActivityDialog}
        onSave={saveActivity}
        onReplace={withConfirm(replaceLamp, "Точно заменить выбранную лампу?")}
        fullScreen={isMobile}
      />
      <ConfirmDialog />
    </Grid>
  );
}
