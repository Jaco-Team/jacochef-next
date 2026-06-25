import { useEffect, useMemo, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import { Box, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import {
  V2Alert,
  V2Button,
  V2DatePickerGraph,
  V2Select,
  V2SelectableList,
  V2SelectableListItem,
} from "@/ui/v2";
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

  const handleReset = () => {
    setDraft(buildMonthModalDraft(modal.data));
    setSaveError("");
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
        selected={false}
        aria-selected={false}
        onClick={() => handleDayClick(date)}
        sx={{
          backgroundColor: dayItem ? typeMeta.color : "#ffffff",
          color: dayItem ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
          fontWeight: dayItem ? 700 : 400,
          cursor: "pointer",
          "&.Mui-selected, &.Mui-focusVisible, &:focus": {
            backgroundColor: dayItem ? typeMeta.color : "#ffffff",
          },
          "&.Mui-selected:hover, &:hover": {
            backgroundColor: dayItem ? typeMeta.color : "rgba(0, 0, 0, 0.04)",
          },
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
      title={modal.data?.title || "Месячные часы"}
      maxWidth="md"
      actions={actions}
    >
      <Stack spacing={2}>
        {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
        {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

        {!modal.loading && modal.data ? (
          <Grid
            container
            spacing={2}
          >
            {modal.data.otherApps?.length ? (
              <Grid size={12}>
                <V2Select
                  options={modal.data.otherApps}
                  value={draft.newApp}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      newApp: event.target.value,
                    }))
                  }
                  label="Кем работает"
                />
              </Grid>
            ) : null}

            {modal.data.mentorList?.length ? (
              <Grid size={12}>
                <V2Select
                  options={modal.data.mentorList}
                  value={draft.mentorId}
                  onChange={(event) =>
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
              <V2SelectableList sx={{ borderRadius: "12px", overflow: "hidden" }}>
                {MONTH_TYPE_PRESETS.map((preset) => (
                  <V2SelectableListItem
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
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{preset.label}</Typography>
                    {draft.selectedType === preset.type ? <SendIcon fontSize="small" /> : null}
                  </V2SelectableListItem>
                ))}
              </V2SelectableList>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {monthValue ? (
                <Box
                  sx={{
                    border: "1px solid #E5E5E5",
                    borderRadius: 2,
                    overflow: "hidden",
                    "& .MuiPickersLayout-root": { minWidth: 0 },
                    "& .MuiDayCalendar-header": { px: 1 },
                    "& .MuiPickersDay-root": { borderRadius: 1.5 },
                  }}
                >
                  <V2DatePickerGraph
                    year={monthValue}
                    renderWeekPickerDay={renderWeekPickerDay}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5, pt: 0 }}>
                    <V2Button
                      compact
                      tone="secondary"
                      onClick={handleReset}
                      disabled={isSaving}
                    >
                      Сбросить
                    </V2Button>
                  </Box>
                </Box>
              ) : null}
            </Grid>
          </Grid>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
