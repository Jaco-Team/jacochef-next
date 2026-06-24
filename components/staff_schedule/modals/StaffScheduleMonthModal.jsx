import { useEffect, useMemo, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { MyDatePickerGraph, MySelect } from "@/ui/Forms";
import {
  buildMonthModalDraft,
  buildMonthSavePayload,
  MONTH_TYPE_PRESETS,
  toggleMonthDay,
} from "../staffScheduleModalViewModel";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

function getTypeMeta(type) {
  return MONTH_TYPE_PRESETS.find((item) => item.type === Number(type)) || MONTH_TYPE_PRESETS[0];
}

export default function StaffScheduleMonthModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const monthValue = modal.request?.date || "";
  const daysMap = useMemo(
    () => new Map(draft.dates.map((item) => [item.date, item])),
    [draft.dates],
  );

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setDraft(buildMonthModalDraft(modal.data));
    setSaveError("");
    setIsSaving(false);
  }, [modal.open, modal.data]);

  const handleDayClick = (date) => {
    setDraft((prev) => toggleMonthDay(prev, date, prev.selectedType));
  };

  const handleSave = async () => {
    if (!onSave || !modal.request) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(buildMonthSavePayload(modal.request, draft));
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить месяц");
      setIsSaving(false);
    }
  };

  const renderWeekPickerDay = (pickerDay) => {
    const date = dayjs(pickerDay.day).format("YYYY-MM-DD");
    const dayItem = daysMap.get(date);
    const typeMeta = getTypeMeta(dayItem?.type);

    return (
      <PickersDay
        {...pickerDay}
        day={pickerDay.day}
        onClick={() => handleDayClick(date)}
        sx={{
          backgroundColor: dayItem ? typeMeta.color : "#ffffff",
          color: dayItem ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
          fontWeight: dayItem ? 700 : 400,
          cursor: "pointer",
        }}
      />
    );
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ pt: 1, width: "100%" }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ minHeight: 40, textTransform: "none", fontWeight: 700 }}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          disabled={isSaving}
          sx={{ minHeight: 40, textTransform: "none", fontWeight: 700 }}
        >
          Отмена
        </Button>
      </Stack>
    );

  return (
    <StaffScheduleResponsiveModal
      open={modal.open}
      onClose={onClose}
      title={modal.data?.title || "Месячные часы"}
      maxWidth="md"
      actions={actions}
    >
      <Stack spacing={2}>
        {modal.error ? <Alert severity="error">{modal.error}</Alert> : null}
        {saveError ? <Alert severity="error">{saveError}</Alert> : null}

        {modal.loading ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CircularProgress
              size={28}
              sx={{ mb: 1.5 }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Загрузка месячных часов...
            </Typography>
          </Box>
        ) : null}

        {!modal.loading && modal.data ? (
          <Grid
            container
            spacing={2}
          >
            {modal.data.otherApps?.length ? (
              <Grid size={12}>
                <MySelect
                  data={modal.data.otherApps}
                  value={draft.newApp}
                  func={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      newApp: event.target.value,
                    }))
                  }
                  label="Кем работает"
                  unifiedPopup
                />
              </Grid>
            ) : null}

            {modal.data.mentorList?.length ? (
              <Grid size={12}>
                <MySelect
                  data={modal.data.mentorList}
                  value={draft.mentorId}
                  func={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      mentorId: event.target.value,
                    }))
                  }
                  label="Наставник"
                  unifiedPopup
                />
              </Grid>
            ) : null}

            <Grid size={{ xs: 12, sm: 6 }}>
              <List
                dense
                sx={{ borderRadius: "12px", overflow: "hidden" }}
              >
                {MONTH_TYPE_PRESETS.map((preset) => (
                  <ListItemButton
                    key={preset.type}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        selectedType: preset.type,
                      }))
                    }
                    sx={{
                      backgroundColor: preset.color,
                      color: "#ffffff",
                      mb: 0.5,
                      borderRadius: "8px",
                    }}
                  >
                    <ListItemText primary={preset.label} />
                    {draft.selectedType === preset.type ? <SendIcon fontSize="small" /> : null}
                  </ListItemButton>
                ))}
              </List>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {monthValue ? (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    "& .MuiPickersLayout-root": { minWidth: 0 },
                    "& .MuiDayCalendar-header": { px: 1 },
                    "& .MuiPickersDay-root": { borderRadius: 1.5 },
                  }}
                >
                  <MyDatePickerGraph
                    year={monthValue}
                    renderWeekPickerDay={renderWeekPickerDay}
                  />
                </Paper>
              ) : null}
            </Grid>

            <Grid size={12}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, p: 2 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  useFlexGap
                  flexWrap="wrap"
                >
                  {MONTH_TYPE_PRESETS.map((preset) => (
                    <Stack
                      key={preset.type}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 1,
                          backgroundColor: preset.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        {preset.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
