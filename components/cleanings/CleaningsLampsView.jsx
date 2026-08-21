import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Chip,
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WbIncandescentOutlinedIcon from "@mui/icons-material/WbIncandescentOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MyDatePickerNewViews, MySelect } from "@/ui/Forms";
import { useConfirm } from "@/src/hooks/useConfirm";
import {
  CleaningsLampActivityDialog,
  CleaningsLampDialog,
  CleaningsLampReplacementDialog,
} from "./CleaningsLampDialogs";
import CleaningHistoryDialog from "./CleaningHistoryDialog";
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

function fallbackLampGroups(lamps) {
  const predecessorById = new Map();
  lamps.forEach((lamp) => {
    if (lamp.replaced_by_lamp_id) predecessorById.set(String(lamp.replaced_by_lamp_id), lamp);
  });

  const grouped = new Set();
  const groups = [];
  lamps
    .filter((lamp) => Number(lamp.is_active) === 1)
    .forEach((active) => {
      const inactive = [];
      let previous = predecessorById.get(String(active.id));
      while (previous && !grouped.has(String(previous.id))) {
        inactive.push(previous);
        grouped.add(String(previous.id));
        previous = predecessorById.get(String(previous.id));
      }
      grouped.add(String(active.id));
      groups.push({ active, inactive });
    });
  lamps
    .filter((lamp) => !grouped.has(String(lamp.id)))
    .forEach((lamp) => {
      grouped.add(String(lamp.id));
      groups.push({ active: null, inactive: [lamp] });
    });
  return groups;
}

function lampPeriodRows(lamp, days) {
  return days.filter((day) => Boolean(activityCells(day, lamp.id)?.id));
}

function LampSummary({
  lamp,
  historical,
  canEdit,
  onEdit,
  onHistory,
  onReplace,
  showActions = true,
  compact = false,
}) {
  const replacementDate = lamp.removed_at
    ? dayjs(lamp.removed_at).format("DD.MM.YYYY")
    : "дата не указана";

  return (
    <Box
      sx={{
        p: compact ? 0 : { xs: 1.25, md: 1.5 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
        <Chip
          size="small"
          color={historical ? "default" : "primary"}
          label={historical ? `Заменена: ${replacementDate}` : "Текущая лампа"}
        />
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <PlaceOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.place || "—"}</Typography>
        </Box>
        <Typography variant="body2">№{lamp.number}</Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <WbIncandescentOutlinedIcon fontSize="small" />
          <Typography sx={{ fontWeight: 800 }}>{lamp.name || "—"}</Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          ID {lamp.id}
        </Typography>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <TimerOutlinedIcon fontSize="small" />
          <Typography color="text.secondary">
            {lamp.total_svod || "0:00"} / {lamp.resource || 0} ч
          </Typography>
        </Box>
      </Box>
      {showActions ? (
        <Box sx={{ display: "flex", gap: 0.75 }}>
          {canEdit && !historical ? (
            <Tooltip title="Редактировать реквизиты лампы">
              <IconButton
                color="primary"
                size="small"
                aria-label="Редактировать реквизиты лампы"
                onClick={() => onEdit(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {canEdit && !historical ? (
            <Tooltip title="Заменить лампу">
              <IconButton
                color="primary"
                size="small"
                aria-label="Заменить лампу"
                onClick={() => onReplace(lamp)}
                sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
              >
                <WbIncandescentOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="История лампы">
            <IconButton
              color="primary"
              size="small"
              aria-label="История лампы"
              onClick={() => onHistory(lamp)}
              sx={{ border: 1, borderColor: "primary.main", borderRadius: 1.5 }}
            >
              <HistoryOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
    </Box>
  );
}

function LampActivityTable({ lamp, days, canEdit, historical, onEditActivity, onAddActivity }) {
  const rows = lampPeriodRows(lamp, days);
  const periodTotal = lamp.svod || "0:00";

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        sx={{
          minWidth: 650,
          "& th, & td": {
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            textAlign: "center",
            verticalAlign: "middle",
          },
          "& th": { bgcolor: "action.hover" },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Дата проверки</TableCell>
            <TableCell>Включение</TableCell>
            <TableCell>Выключение</TableCell>
            <TableCell>Время работы</TableCell>
            <TableCell>Подпись менеджера смены</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((day) => {
            const activity = activityCells(day, lamp.id);
            const isInteractive = Boolean(activity?.id && canEdit && !historical);
            return (
              <TableRow
                key={`${lamp.id}-${day.date}`}
                hover={isInteractive}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={() => isInteractive && onEditActivity(activity)}
                onKeyDown={(event) => {
                  if (isInteractive && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onEditActivity(activity);
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
                <TableCell>{activity?.only_time_start || "—"}</TableCell>
                <TableCell>{activity?.only_time_end || "—"}</TableCell>
                <TableCell>{activity?.diff || "—"}</TableCell>
                <TableCell sx={{ color: day.manager ? "text.primary" : "text.disabled" }}>
                  {day.manager || "—"}
                </TableCell>
              </TableRow>
            );
          })}
          {!rows.length ? (
            <TableRow>
              <TableCell
                colSpan={5}
                sx={{ color: "text.secondary" }}
              >
                За выбранный период активности нет.
              </TableCell>
            </TableRow>
          ) : null}
          {canEdit && !historical ? (
            <TableRow>
              <TableCell>Добавить</TableCell>
              <TableCell colSpan={4}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onAddActivity(lamp)}
                >
                  Добавить активацию
                </Button>
              </TableCell>
            </TableRow>
          ) : null}
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ fontWeight: 800 }}
            >
              Отработано часов
            </TableCell>
            <TableCell sx={{ fontWeight: 800 }}>{periodTotal}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function LampLifecycleSection({
  group,
  days,
  canEdit,
  onEditLamp,
  onHistory,
  onReplace,
  onEditActivity,
  onAddActivity,
}) {
  const active = group.active;
  return (
    <Box sx={{ display: "grid", gap: 1.25, pb: 2 }}>
      {active ? (
        <Paper
          variant="outlined"
          sx={{ overflow: "hidden", borderRadius: "10px" }}
        >
          <LampSummary
            lamp={active}
            canEdit={canEdit}
            onEdit={onEditLamp}
            onHistory={onHistory}
            onReplace={onReplace}
          />
          <LampActivityTable
            lamp={active}
            days={days}
            canEdit={canEdit}
            onEditActivity={onEditActivity}
            onAddActivity={onAddActivity}
          />
        </Paper>
      ) : null}
      {group.inactive.map((lamp) => (
        <Accordion
          key={lamp.id}
          disableGutters
          variant="outlined"
          sx={{ borderRadius: "10px !important", overflow: "hidden" }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: { xs: 1.25, md: 1.5 },
              "& .MuiAccordionSummary-content": { my: 1.5, minWidth: 0 },
            }}
          >
            <LampSummary
              lamp={lamp}
              historical
              canEdit={false}
              compact
              onEdit={() => {}}
              onHistory={onHistory}
              onReplace={() => {}}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <LampActivityTable
              lamp={lamp}
              days={days}
              historical
              canEdit={false}
              onEditActivity={onEditActivity}
              onAddActivity={onAddActivity}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
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
  const [lampGroups, setLampGroups] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lampDialogOpen, setLampDialogOpen] = useState(false);
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [lampEdit, setLampEdit] = useState(null);
  const [replacementLamp, setReplacementLamp] = useState(null);
  const [activityEdit, setActivityEdit] = useState(null);
  const [activityType, setActivityType] = useState(null);
  const [historyLamp, setHistoryLamp] = useState(null);
  const [lampHistory, setLampHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      setLampGroups(
        Array.isArray(response.lamp_groups)
          ? response.lamp_groups
          : fallbackLampGroups(Array.isArray(response.list) ? response.list : []),
      );
      setDays(Array.isArray(response.active_lamp) ? response.active_lamp : []);
    } catch (error) {
      setLamps([]);
      setLampGroups([]);
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

  const closeReplacementDialog = useCallback(() => {
    setReplacementDialogOpen(false);
    setReplacementLamp(null);
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
      closeReplacementDialog();
      loadLamps();
    },
    [cleaningsApi, closeActivityDialog, closeReplacementDialog, loadLamps, locationId, showAlert],
  );

  const openReplacementDialog = useCallback(
    (lamp) => {
      const selectedLamp =
        lamps.find((item) => isSameId(item.id, lamp?.lamp_id || lamp?.id)) || lamp;
      closeActivityDialog();
      setReplacementLamp(selectedLamp);
      setReplacementDialogOpen(true);
    },
    [closeActivityDialog, lamps],
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

  const openLampHistory = useCallback(
    async (lamp) => {
      setHistoryLamp(lamp);
      setLampHistory([]);
      setHistoryLoading(true);
      try {
        const response = await cleaningsApi.getLampHistory({
          pointId: locationId,
          lamp_id: lamp.id,
          limit: 100,
        });
        if (!response?.st) throw new Error(response?.text || "Ошибка загрузки истории лампы");
        setLampHistory(Array.isArray(response.history) ? response.history : []);
      } catch (error) {
        showAlert(error?.message || "Ошибка загрузки истории лампы");
      } finally {
        setHistoryLoading(false);
      }
    },
    [cleaningsApi, locationId, showAlert],
  );

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
        {lampGroups.length ? (
          lampGroups.map((group, index) => (
            <LampLifecycleSection
              key={group.active?.id || group.inactive?.[0]?.id || index}
              group={group}
              days={days}
              canEdit={canEdit}
              onEditLamp={(lamp) => {
                setLampEdit(lamp);
                setLampDialogOpen(true);
              }}
              onHistory={openLampHistory}
              onReplace={() => openReplacementDialog(group.active)}
              onEditActivity={openEditActivity}
              onAddActivity={openNewActivity}
            />
          ))
        ) : (
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: "10px" }}
          >
            <Typography color="text.secondary">За выбранный период данных нет.</Typography>
          </Paper>
        )}
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
        onReplace={openReplacementDialog}
        fullScreen={isMobile}
      />
      <CleaningsLampReplacementDialog
        open={replacementDialogOpen}
        lamp={replacementLamp}
        onClose={closeReplacementDialog}
        onSave={withConfirm(
          (payload) => replaceLamp(payload),
          "Точно заменить выбранную лампу с указанной причиной?",
        )}
        fullScreen={isMobile}
      />
      <CleaningHistoryDialog
        open={Boolean(historyLamp)}
        item={historyLamp}
        history={lampHistory}
        loading={historyLoading}
        hiddenFields={["created_at", "updated_at"]}
        onClose={() => {
          setHistoryLamp(null);
          setLampHistory([]);
        }}
      />
      <ConfirmDialog />
    </Grid>
  );
}
