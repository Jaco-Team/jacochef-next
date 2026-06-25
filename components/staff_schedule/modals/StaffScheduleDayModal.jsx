import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { V2Alert, V2Autocomplete, V2Button, V2Select, V2TimePicker } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

function buildDraft(data) {
  return {
    newApp: data?.newApp ?? "",
    mentorId: data?.mentorId ?? "",
    userTemp: data?.userTemp ?? "",
    typeHealf: data?.typeHealf ?? 2,
    hours: Array.isArray(data?.hours)
      ? data.hours.map((item, index) => ({
          id: item?.id || `hour-${index}`,
          time_start: item?.time_start ?? "",
          time_end: item?.time_end ?? "",
          appName: item?.appName ?? "",
        }))
      : [],
  };
}

function buildSavePayload(request, draft) {
  return {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    point_id: request?.point_id,
    new_app: draft.newApp || "",
    mentor_id: draft.mentorId || "",
    user_temp: draft.userTemp || "",
    type_healf: draft.typeHealf || "",
    hours: draft.hours.map((item) => ({
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    })),
  };
}

function SummaryCard({ modal }) {
  if (!modal?.data?.loadLabel && !modal?.data?.bonusLabel) {
    return null;
  }

  return (
    <Box
      sx={{
        border: "1px solid #E5E5E5",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
      >
        {modal.data.loadLabel ? (
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>
              Нагрузка / средняя нагрузка
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{modal.data.loadLabel}</Typography>
          </Box>
        ) : null}
        {modal.data.bonusLabel ? (
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>Бонус</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{modal.data.bonusLabel}</Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

export default function StaffScheduleDayModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = useState(() => buildDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);
  const [newTimeStart, setNewTimeStart] = useState("");
  const [newTimeEnd, setNewTimeEnd] = useState("");

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setDraft(buildDraft(modal.data));
    setSaveError("");
    setIsSaving(false);
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
  }, [modal.open, modal.data]);

  const temperatureOptions = useMemo(() => [{ id: 1, name: "36,6" }], []);

  const changeHour = (index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      hours: prev.hours.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const removeHour = (index) => {
    setDraft((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addHour = () => {
    if (!newTimeStart || !newTimeEnd) {
      return;
    }

    const hasDuplicate = draft.hours.some(
      (item) => item.time_start === newTimeStart && item.time_end === newTimeEnd,
    );

    if (hasDuplicate) {
      setIsAddTimeOpen(false);
      setNewTimeStart("");
      setNewTimeEnd("");
      return;
    }

    setDraft((prev) => ({
      ...prev,
      hours: [
        ...prev.hours,
        {
          id: `hour-${Date.now()}`,
          time_start: newTimeStart,
          time_end: newTimeEnd,
          appName: "",
        },
      ],
    }));
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
  };

  const handleSave = async () => {
    if (!onSave || !modal.request) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(buildSavePayload(modal.request, draft));
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить день");
      setIsSaving(false);
    }
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ pt: 2 }}
      >
        <V2Button
          compact
          tone="success"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </V2Button>
        <V2Button
          compact
          tone="danger"
          onClick={onClose}
          disabled={isSaving}
        >
          Отмена
        </V2Button>
      </Stack>
    );

  return (
    <StaffScheduleResponsiveModal
      open={modal.open}
      onClose={onClose}
      title={modal.data?.title || "Смена за день"}
      maxWidth="md"
      actions={actions}
    >
      <Stack spacing={2}>
        {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
        {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

        {!modal.loading && modal.data ? (
          <>
            {modal.data.subtitle ? (
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {modal.data.subtitle}
              </Typography>
            ) : null}

            <SummaryCard modal={modal} />

            <Grid
              container
              spacing={2}
            >
              {modal.data.otherApps.length ? (
                <Grid size={12}>
                  <V2Select
                    data={modal.data.otherApps}
                    value={draft.newApp}
                    func={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        newApp: event.target.value,
                      }))
                    }
                    label="Кем работает"
                  />
                </Grid>
              ) : null}

              {modal.data.mentorList.length ? (
                <Grid size={12}>
                  <V2Select
                    data={modal.data.mentorList}
                    value={draft.mentorId}
                    func={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        mentorId: event.target.value,
                      }))
                    }
                    label="Наставник"
                  />
                </Grid>
              ) : null}

              <Grid size={{ xs: 12, sm: 6 }}>
                <V2Autocomplete
                  data={temperatureOptions}
                  value={draft.userTemp}
                  freeSolo
                  func={(_, value) =>
                    setDraft((prev) => ({
                      ...prev,
                      userTemp: typeof value === "string" ? value : value?.name || "",
                    }))
                  }
                  onBlur={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      userTemp: event.target.value,
                    }))
                  }
                  label="Температура"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <V2Select
                  data={modal.data.healthOptions}
                  value={draft.typeHealf}
                  func={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      typeHealf: event.target.value,
                    }))
                  }
                  label="Здоровье"
                  is_none={false}
                />
              </Grid>

              <Grid size={12}>
                <Accordion
                  expanded={isAddTimeOpen}
                  onChange={() => setIsAddTimeOpen((prev) => !prev)}
                >
                  <AccordionSummary expandIcon={<AddIcon />}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <AccessTimeIcon fontSize="small" />
                      <Typography>Добавить время</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid
                      container
                      spacing={1.5}
                    >
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <V2TimePicker
                          value={newTimeStart}
                          func={(event) => setNewTimeStart(event.target.value)}
                          label="Время начала работы"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <V2TimePicker
                          value={newTimeEnd}
                          func={(event) => setNewTimeEnd(event.target.value)}
                          label="Время окончания работы"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <V2Button
                          fullWidth
                          tone="danger"
                          onClick={addHour}
                          sx={{ height: "100%" }}
                        >
                          Добавить
                        </V2Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {draft.hours.map((item, index) => (
                  <Accordion key={item.id}>
                    <AccordionSummary
                      expandIcon={
                        <CloseIcon
                          onClick={(event) => {
                            event.stopPropagation();
                            removeHour(index);
                          }}
                        />
                      }
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <AccessTimeIcon fontSize="small" />
                        <Typography>
                          {[item.time_start, item.time_end].filter(Boolean).join(" - ") || "—"}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid
                        container
                        spacing={1.5}
                      >
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <V2TimePicker
                            value={item.time_start}
                            func={(event) => changeHour(index, "time_start", event.target.value)}
                            label="Время начала работы"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <V2TimePicker
                            value={item.time_end}
                            func={(event) => changeHour(index, "time_end", event.target.value)}
                            label="Время окончания работы"
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>

              <Grid size={12}>
                {modal.data.history.length ? (
                  <>
                    <Accordion disabled>
                      <AccordionSummary>
                        <Typography>История</Typography>
                      </AccordionSummary>
                    </Accordion>

                    {modal.data.history.map((historyItem) => (
                      <Accordion key={historyItem.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{historyItem.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1}>
                            {historyItem.items.map((item) => (
                              <Typography
                                key={item.id}
                                sx={{ fontSize: 14 }}
                              >
                                {[item.label, item.appName].filter(Boolean).join(" - ")}
                              </Typography>
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                ) : null}
              </Grid>
            </Grid>
          </>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
