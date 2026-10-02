import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Grid, Paper, Typography } from "@mui/material";
import { useConfirm } from "@/src/hooks/useConfirm";
import {
  CleaningsLampActivityDialog,
  CleaningsLampDialog,
  CleaningsLampReplacementDialog,
} from "./CleaningsLampDialogs";
import CleaningHistoryDialog from "./CleaningHistoryDialog";
import CleaningsLampLifecycle, { fallbackLampGroups } from "./CleaningsLampSections";
import CleaningsLampFilters from "./CleaningsLampFilters";
import useCleaningsApi from "./useCleaningsApi";
import { getLocationName, isSameId } from "./helpers";

function monthValue(value) {
  return dayjs(value).format("YYYY-MM");
}

export default function CleaningsLampsView({
  locations = [],
  canEdit = false,
  canExport = false,
  showAlert,
}) {
  const cleaningsApi = useCleaningsApi();
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
        <CleaningsLampFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          locationId={locationId}
          locationOptions={locationOptions}
          loading={loading}
          canEdit={canEdit}
          canExport={canExport}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onLocationChange={(event) => setLocationId(event.target.value)}
          onRefresh={loadLamps}
          onAddLamp={() => setLampDialogOpen(true)}
          onExport={download}
        />
      </Grid>

      <Grid size={12}>
        {lampGroups.length ? (
          lampGroups.map((group, index) => (
            <CleaningsLampLifecycle
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
      />
      <CleaningsLampReplacementDialog
        open={replacementDialogOpen}
        lamp={replacementLamp}
        onClose={closeReplacementDialog}
        onSave={withConfirm(
          (payload) => replaceLamp(payload),
          "Точно заменить выбранную лампу с указанной причиной?",
        )}
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
