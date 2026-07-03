import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { V2Alert, V2Button, V2MonthGridCalendar } from "@/ui/v2";
import { toNumber } from "../staffScheduleHelpers";
import {
  buildHourSlotId,
  formatHourRangeLabel,
  formatWorkedHours,
  getHourPresetByType,
  isCustomHourRange,
} from "../staffScheduleHourPresets";
import {
  buildMonthModalDraft,
  buildMonthSavePayload,
  MONTH_TYPE_PRESETS,
} from "../staffScheduleModalViewModel";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

dayjs.locale("ru");

const CUSTOM_HOUR_COLORS = ["#D92D5F", "#4CC5EA", "#FFB800"];

function formatCurrency(value) {
  return `${new Intl.NumberFormat("ru-RU").format(toNumber(value))} ₽`;
}

function buildOverviewCards(summary = {}) {
  return [
    { key: "rate", label: "СТАВКА / 1Ч", value: formatCurrency(summary.ratePerHour) },
    { key: "extra", label: "ДОПЛАТА / 1Ч", value: formatCurrency(summary.ratePerHourExtra) },
    { key: "hours", label: "ЗА ЧАСЫ", value: formatCurrency(summary.hoursTotal) },
    { key: "errors", label: "ОШИБКИ", value: formatCurrency(summary.errors) },
    { key: "withheld", label: "УДЕРЖАНО", value: formatCurrency(summary.withheld) },
    { key: "pay", label: "К ВЫПЛАТЕ", value: formatCurrency(summary.toPay) },
    { key: "bonus", label: "БОНУСЫ", value: formatCurrency(summary.bonuses) },
    { key: "total", label: "ВСЕГО", value: formatCurrency(summary.total) },
    { key: "givenCash", label: "ВЫДАНО", value: formatCurrency(summary.givenCash) },
    { key: "transferred", label: "ПЕРЕЧИСЛЕНО", value: formatCurrency(summary.transferred) },
    { key: "premium", label: "ПРЕМИЯ", value: formatCurrency(summary.premiumSheet) },
  ];
}

function buildPresetSlots() {
  return MONTH_TYPE_PRESETS.slice(0, 3).map((preset) => ({
    id: `preset-${preset.type}`,
    type: preset.type,
    label: preset.label,
    time_start: preset.time_start,
    time_end: preset.time_end,
    color: preset.color,
    textColor: preset.textColor,
    isCustom: false,
  }));
}

function buildCustomSlots(dates = []) {
  const slotMap = new Map();

  dates.forEach((item) => {
    if (!isCustomHourRange(item)) {
      return;
    }

    const slotId = `custom-${buildHourSlotId(item)}`;

    if (!slotMap.has(slotId)) {
      const preset = getHourPresetByType(item.type);

      slotMap.set(slotId, {
        id: slotId,
        type: Number(item.type ?? 3),
        label: formatHourRangeLabel(item.time_start, item.time_end),
        time_start: item.time_start ?? "",
        time_end: item.time_end ?? "",
        color: preset.color,
        textColor: preset.textColor,
        isCustom: true,
      });
    }
  });

  return Array.from(slotMap.values());
}

function applySlotToDraft(draft, date, slot) {
  const existing = draft.dates.find((item) => item.date === date);

  if (!existing) {
    return {
      ...draft,
      dates: [
        ...draft.dates,
        {
          date,
          type: slot.type,
          time_start: slot.time_start,
          time_end: slot.time_end,
        },
      ],
    };
  }

  if (
    Number(existing.type) === Number(slot.type) &&
    String(existing.time_start ?? "") === String(slot.time_start ?? "") &&
    String(existing.time_end ?? "") === String(slot.time_end ?? "")
  ) {
    return {
      ...draft,
      dates: draft.dates.filter((item) => item.date !== date),
    };
  }

  return {
    ...draft,
    dates: draft.dates.map((item) =>
      item.date === date
        ? {
            ...item,
            type: slot.type,
            time_start: slot.time_start,
            time_end: slot.time_end,
          }
        : item,
    ),
  };
}

function SummaryCard({ label, value }) {
  return (
    <Box
      sx={{
        minHeight: 46,
        px: 1.25,
        py: 0.75,
        borderRadius: "10px",
        backgroundColor: "#EAEAEA",
      }}
    >
      <Typography
        sx={{ fontSize: 12, lineHeight: 1.2, color: "#7A7A7A", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ mt: 0.5, fontSize: 16, lineHeight: 1.2, fontWeight: 700, color: "#5E5E5E" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function MonthOverviewStrip({ days }) {
  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Box sx={{ display: "inline-flex", minWidth: "100%", gap: 0.25 }}>
        {days.map((item) => {
          const preset = getHourPresetByType(item.type);
          const hasHours = Boolean(item.hoursLabel || item.time_start || item.time_end);
          const backgroundColor = item.backgroundColor || (hasHours ? preset.color : "#FFFFFF");
          const textColor = item.textColor || (hasHours ? preset.textColor : "#666666");

          return (
            <Box
              key={item.id}
              sx={{
                width: 52,
                flex: "0 0 auto",
                border: "1px solid #ECECEC",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  px: 0.25,
                  py: 0.625,
                  backgroundColor: item.isWeekend ? "#FFE9BD" : "#FFFFFF",
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: 12, lineHeight: 1, color: "#666666" }}>
                  {item.weekdayShort}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: 1, color: "#666666" }}>
                  {item.dayNumber}
                </Typography>
              </Box>
              <Box
                sx={{
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor,
                  color: textColor,
                }}
              >
                <Typography sx={{ fontSize: 14, lineHeight: 1, fontWeight: 500 }}>
                  {hasHours
                    ? item.hoursLabel || formatWorkedHours(item.time_start, item.time_end) || ""
                    : ""}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function HourSlotCard({ slot, selected, onClick, onRemove = null }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
    >
      <Box
        onClick={onClick}
        sx={{
          minHeight: 36,
          flex: 1,
          minWidth: 0,
          px: 1,
          borderRadius: "10px",
          border: selected ? `1px solid ${slot.color}` : "1px solid #E5E5E5",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "4px",
            backgroundColor: slot.color,
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: 14, color: "#666666", lineHeight: 1.2 }}>
          {formatHourRangeLabel(slot.time_start, slot.time_end)}
        </Typography>
      </Box>
      {onRemove ? (
        <Box
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#A6A6A6",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </Box>
      ) : null}
    </Stack>
  );
}

function timeToPickerValue(value) {
  const parsed = dayjs(`2026-01-01T${value || "00:00"}`);
  return parsed.isValid() ? parsed : null;
}

function TimePickerField({ label, value, onChange }) {
  return (
    <TimePicker
      ampm={false}
      label={label}
      value={timeToPickerValue(value)}
      onChange={(nextValue) => {
        if (nextValue?.isValid?.()) {
          onChange(nextValue.format("HH:mm"));
        }
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          size: "small",
          sx: {
            "& .MuiOutlinedInput-root": {
              minHeight: 44,
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
            },
          },
        },
      }}
    />
  );
}

function CustomTimeDialog({ open, value, onChange, onClose, onSubmit }) {
  const canSubmit = Boolean(value.time_start && value.time_end);

  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="Добавление нового временного промежутка"
      maxWidth="sm"
      paperSx={{ maxWidth: 620 }}
      contentSx={{ px: 2.5, pt: 2.5, pb: 2.5 }}
      actionsSx={{ px: 2.5, pt: 0, pb: 2.5, borderTop: "none" }}
      actions={
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.25}
          sx={{ width: "100%" }}
        >
          <V2Button
            compact
            tone="secondary"
            onClick={onClose}
            sx={{ minHeight: 44, minWidth: 96 }}
          >
            Сброс
          </V2Button>
          <V2Button
            compact
            tone="primary"
            onClick={onSubmit}
            disabled={!canSubmit}
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{ minHeight: 44, minWidth: 132 }}
          >
            Добавить
          </V2Button>
        </Stack>
      }
    >
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <Stack spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              border: "1px solid #ECECEC",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Typography sx={{ mb: 1, fontSize: 16, color: "#666666" }}>Выбери цвет</Typography>
            <Stack
              direction="row"
              spacing={0}
              sx={{ borderRadius: "8px", overflow: "hidden" }}
            >
              {CUSTOM_HOUR_COLORS.map((color) => {
                const selected = value.color === color;

                return (
                  <Box
                    key={color}
                    onClick={() => onChange((prev) => ({ ...prev, color }))}
                    sx={{
                      flex: 1,
                      minHeight: 32,
                      border: selected ? "2px solid #EE2737" : "2px solid transparent",
                      backgroundColor: color,
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              border: "1px solid #ECECEC",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Typography sx={{ mb: 1, fontSize: 16, color: "#666666" }}>Выбери время</Typography>
            <Grid
              container
              spacing={1.25}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <TimePickerField
                  label="c"
                  value={value.time_start}
                  onChange={(nextValue) =>
                    onChange((prev) => ({
                      ...prev,
                      time_start: nextValue,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TimePickerField
                  label="до"
                  value={value.time_end}
                  onChange={(nextValue) =>
                    onChange((prev) => ({
                      ...prev,
                      time_end: nextValue,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              border: "1px solid #ECECEC",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Typography sx={{ mb: 1, fontSize: 16, color: "#666666" }}>
              Новый временной промежуток
            </Typography>
            <HourSlotCard
              slot={{
                type: 3,
                time_start: value.time_start,
                time_end: value.time_end,
                color: value.color,
              }}
              selected
              onClick={() => {}}
            />
          </Box>
        </Stack>
      </LocalizationProvider>
    </StaffScheduleResponsiveModal>
  );
}

function AssignmentDialog({
  open,
  monthValue,
  draft,
  customSlots,
  activeSlotId,
  personName,
  positionName,
  onSelectSlot,
  onDayClick,
  onOpenCustomTime,
  onDeleteCustomSlot,
  onClose,
  onSave,
  saving,
}) {
  const allSlots = [...buildPresetSlots(), ...customSlots];
  const daysMap = new Map(draft.dates.map((item) => [item.date, item]));

  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="Заполнение часов"
      maxWidth="md"
      paperSx={{ width: "100%", maxWidth: 620 }}
      contentSx={{ px: 2.5, pt: 2.5, pb: 2.5 }}
      actionsSx={{ px: 2.5, pt: 0, pb: 2.5, borderTop: "none" }}
      actions={
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.25}
          sx={{ width: "100%" }}
        >
          <V2Button
            compact
            tone="secondary"
            onClick={onClose}
            disabled={saving}
            sx={{ minHeight: 44, minWidth: 106 }}
          >
            Отменить
          </V2Button>
          <V2Button
            compact
            tone="primary"
            onClick={onSave}
            disabled={saving}
            sx={{ minHeight: 44, minWidth: 114 }}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </V2Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#666666", lineHeight: 1.2 }}>
            {personName || "—"}
          </Typography>
          <Typography sx={{ fontSize: 17, color: "#666666", lineHeight: 1.2 }}>
            {positionName || "—"}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "194px 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              <Typography
                sx={{ fontSize: 16, fontWeight: 700, color: "#B1B1B1", textTransform: "uppercase" }}
              >
                Часовой промежуток
              </Typography>
              <Stack spacing={0.75}>
                {allSlots.map((slot) => (
                  <HourSlotCard
                    key={slot.id}
                    slot={slot}
                    selected={slot.id === activeSlotId}
                    onClick={() => onSelectSlot(slot.id)}
                    onRemove={slot.isCustom ? () => onDeleteCustomSlot?.(slot.id) : null}
                  />
                ))}
              </Stack>
              <V2Button
                tone="secondary"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={onOpenCustomTime}
                sx={{
                  alignSelf: "flex-start",
                  minHeight: 36,
                  px: 1.5,
                  borderRadius: "10px",
                  backgroundColor: "#E5E5E5",
                  color: "#8A8A8A",
                  "&:hover": { backgroundColor: "#DADADA" },
                }}
              >
                Часы
              </V2Button>
            </Stack>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Stack
              spacing={0}
              sx={{ minWidth: 0 }}
            >
              <V2MonthGridCalendar
                monthId={monthValue}
                title="Часы в календаре"
                size={40}
                previousDisabled
                nextDisabled
                getDayMeta={(date) => {
                  const item = daysMap.get(date);

                  if (!item) {
                    return {};
                  }

                  const customSlot =
                    Number(item.type) === 3
                      ? customSlots.find(
                          (slot) =>
                            String(slot.time_start ?? "") === String(item.time_start ?? "") &&
                            String(slot.time_end ?? "") === String(item.time_end ?? ""),
                        )
                      : null;
                  const preset = customSlot || getHourPresetByType(item.type);

                  return {
                    selected: true,
                    backgroundColor: preset.color,
                    color: preset.textColor,
                    border: "none",
                  };
                }}
                onDayClick={onDayClick}
              />
            </Stack>
          </Box>
        </Box>
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}

export default function StaffScheduleMonthModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [editorCustomSlots, setEditorCustomSlots] = useState([]);
  const [activeSlotId, setActiveSlotId] = useState("preset-0");
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [customTimeDraft, setCustomTimeDraft] = useState({
    type: 3,
    color: CUSTOM_HOUR_COLORS[0],
    time_start: "11:00",
    time_end: "17:00",
  });

  const monthValue = modal.request?.date || "";
  const overviewCards = useMemo(
    () => buildOverviewCards(modal.data?.summary),
    [modal.data?.summary],
  );
  const monthDays = useMemo(() => modal.data?.overviewDays ?? [], [modal.data?.overviewDays]);

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    const nextDraft = buildMonthModalDraft(modal.data);
    setDraft(nextDraft);
    setEditorDraft(nextDraft);
    setEditorCustomSlots(buildCustomSlots(nextDraft.dates));
    setActiveSlotId("preset-0");
    setSaveError("");
    setIsSaving(false);
    setIsAssignmentOpen(false);
    setIsCustomTimeOpen(false);
  }, [modal.open, modal.data]);

  const canEditMonth = Boolean(modal.data?.canEditMonth);
  const allEditorSlots = useMemo(
    () => [...buildPresetSlots(), ...editorCustomSlots],
    [editorCustomSlots],
  );
  const activeSlot = useMemo(
    () => allEditorSlots.find((item) => item.id === activeSlotId) || allEditorSlots[0] || null,
    [activeSlotId, allEditorSlots],
  );

  const handleSave = async (nextDraft = draft, shouldClose = false) => {
    if (!onSave || !modal.request) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(buildMonthSavePayload(modal.request, nextDraft));
      setDraft(nextDraft);

      if (shouldClose) {
        onClose?.();
      }
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить месяц");
      setIsSaving(false);
      return;
    }

    if (!shouldClose) {
      setIsSaving(false);
    }
  };

  const handleRequestClose = async () => {
    if (isSaving) {
      return;
    }

    onClose?.();
  };

  const openAssignmentDialog = () => {
    setEditorDraft(draft);
    setEditorCustomSlots(buildCustomSlots(draft.dates));
    setActiveSlotId("preset-0");
    setCustomTimeDraft({
      type: 3,
      color: CUSTOM_HOUR_COLORS[0],
      time_start: "11:00",
      time_end: "17:00",
    });
    setIsAssignmentOpen(true);
  };

  const closeAssignmentDialog = () => {
    setIsAssignmentOpen(false);
    setIsCustomTimeOpen(false);
  };

  const handleEditorDayClick = (date) => {
    if (!canEditMonth || !activeSlot) {
      return;
    }

    setEditorDraft((prev) => applySlotToDraft(prev, date, activeSlot));
  };

  const handleSubmitCustomTime = () => {
    const nextSlot = {
      id: `custom-${buildHourSlotId(customTimeDraft)}`,
      type: Number(customTimeDraft.type ?? 3),
      label: formatHourRangeLabel(customTimeDraft.time_start, customTimeDraft.time_end),
      time_start: customTimeDraft.time_start,
      time_end: customTimeDraft.time_end,
      color: customTimeDraft.color,
      textColor: "#FFFFFF",
      isCustom: true,
    };

    setEditorCustomSlots((prev) =>
      prev.some((item) => item.id === nextSlot.id) ? prev : [...prev, nextSlot],
    );
    setActiveSlotId(nextSlot.id);
    setIsCustomTimeOpen(false);
  };

  const handleDeleteCustomSlot = (slotId) => {
    const slot = editorCustomSlots.find((item) => item.id === slotId);

    if (!slot) {
      return;
    }

    setEditorCustomSlots((prev) => prev.filter((item) => item.id !== slotId));
    setEditorDraft((prev) => ({
      ...prev,
      dates: prev.dates.filter(
        (item) =>
          !(
            Number(item.type) === Number(slot.type) &&
            String(item.time_start ?? "") === String(slot.time_start ?? "") &&
            String(item.time_end ?? "") === String(slot.time_end ?? "")
          ),
      ),
    }));

    if (activeSlotId === slotId) {
      setActiveSlotId("preset-0");
    }
  };

  const handleSaveAssignment = async () => {
    await handleSave(editorDraft, true);
  };

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={handleRequestClose}
        title="Данные сотрудника"
        maxWidth="md"
        paperSx={{ maxWidth: 840 }}
        contentSx={{ px: 2.5, pt: 3, pb: 2 }}
      >
        <Stack spacing={2.25}>
          {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
          {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

          {!modal.loading && modal.data ? (
            <>
              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#666666" }}>
                  {modal.data.personName || "—"}
                </Typography>
                <Typography sx={{ fontSize: 17, color: "#666666" }}>
                  {modal.data.positionName || "—"}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#A6A6A6",
                    textTransform: "uppercase",
                  }}
                >
                  График
                </Typography>
                {monthDays.length ? <MonthOverviewStrip days={monthDays} /> : null}
              </Stack>

              <Stack spacing={1}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#A6A6A6",
                    textTransform: "uppercase",
                  }}
                >
                  Расчёт
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(1, minmax(0, 1fr))",
                      sm: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 0.5,
                  }}
                >
                  {overviewCards.map((card) => (
                    <SummaryCard
                      key={card.key}
                      label={card.label}
                      value={card.value}
                    />
                  ))}
                </Box>
              </Stack>

              <Stack
                direction="row"
                justifyContent="flex-end"
              >
                <V2Button
                  tone="primary"
                  startIcon={<CheckRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={openAssignmentDialog}
                  disabled={!canEditMonth || isSaving}
                  sx={{ minHeight: 38, px: 2.5, borderRadius: "14px", fontSize: 16 }}
                >
                  Заполнить часы
                </V2Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>

      <AssignmentDialog
        open={isAssignmentOpen}
        monthValue={monthValue}
        draft={editorDraft}
        customSlots={editorCustomSlots}
        activeSlotId={activeSlotId}
        personName={modal.data?.personName}
        positionName={modal.data?.positionName}
        onSelectSlot={setActiveSlotId}
        onDayClick={handleEditorDayClick}
        onOpenCustomTime={() => setIsCustomTimeOpen(true)}
        onDeleteCustomSlot={handleDeleteCustomSlot}
        onClose={closeAssignmentDialog}
        onSave={handleSaveAssignment}
        saving={isSaving}
      />

      <CustomTimeDialog
        open={isCustomTimeOpen}
        value={customTimeDraft}
        onChange={setCustomTimeDraft}
        onClose={() => setIsCustomTimeOpen(false)}
        onSubmit={handleSubmitCustomTime}
      />
    </>
  );
}
