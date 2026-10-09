import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoMonthGridCalendar,
  JacoTimePicker,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import { toNumber } from "../staffScheduleHelpers";
import {
  buildHourSlotId,
  buildCustomHourSlots,
  formatHourRangeLabel,
  formatWorkedHours,
  getHiddenRecentHourSlotsKey,
  getHourPresetByType,
  normalizeTimeLabel,
  readHiddenRecentHourSlots,
  writeHiddenRecentHourSlots,
} from "../staffScheduleHourPresets";
import {
  buildMonthModalDraft,
  buildMonthSavePayload,
  canEditMonthByRole,
  isEditableMonthDay,
  MONTH_TYPE_PRESETS,
} from "../staffScheduleModalViewModel";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

const CUSTOM_HOUR_COLORS = ["#D92D5F", "#4CC5EA", "#FFB800"];
const CALENDAR_WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

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
    normalizeTimeLabel(existing.time_start) === normalizeTimeLabel(slot.time_start) &&
    normalizeTimeLabel(existing.time_end) === normalizeTimeLabel(slot.time_end)
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
        minHeight: 56,
        px: 1.25,
        py: 1,
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
        sx={{ mt: 0.5, fontSize: 15, lineHeight: 1.2, fontWeight: 700, color: "#5E5E5E" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function hasMonthDraftChanges(left, right) {
  return JSON.stringify(left) !== JSON.stringify(right);
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

function HourSlotCard({ slot, selected, onClick, onRemove = null, maxWidth = "none" }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ width: "fit-content", maxWidth, alignItems: "center" }}
    >
      <Box
        onClick={onClick}
        sx={{
          minHeight: 36,
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
        <Typography sx={{ fontSize: 14, color: "#666666", lineHeight: 1.2, whiteSpace: "nowrap" }}>
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

function TimePickerField({ label, value, onChange }) {
  return (
    <JacoTimePicker
      picker
      label={label}
      value={value}
      onChange={onChange}
      sx={{
        "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
          borderRadius: "12px",
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
          spacing={1.25}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            compact
            tone="danger"
            onClick={onClose}
            sx={{ minHeight: 44, minWidth: 96 }}
          >
            Отмена
          </JacoButton>
          <JacoButton
            compact
            tone="success"
            onClick={onSubmit}
            disabled={!canSubmit}
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{ minHeight: 44, minWidth: 132 }}
          >
            Добавить
          </JacoButton>
        </Stack>
      }
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
  onNavigateMonth,
  canEditMonth,
  loading,
  error,
  onClose,
  onSave,
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrowPhone = useMediaQuery("(max-width: 359px)");
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const allSlots = [...buildPresetSlots(), ...customSlots];
  const daysMap = new Map(draft.dates.map((item) => [item.date, item]));
  const calendarSize = isNarrowPhone ? 34 : isXs ? 40 : isDesktop ? 68 : 56;
  const calendarDayHeight = isXs ? 60 : isDesktop ? 76 : 68;
  const calendarGap = isNarrowPhone ? 3 : isXs ? 4 : 8;
  const customChipMaxWidth = isXs ? 150 : 172;
  const hasPastDays = Boolean(monthValue && dayjs(`${monthValue}-01`).isBefore(dayjs(), "day"));

  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title={
        <Box
          component="span"
          sx={{ display: "inline-flex", flexDirection: "column", minWidth: 0, maxWidth: "100%" }}
        >
          <Box component="span">Заполнение часов</Box>
          <Box
            component="span"
            sx={{ fontSize: 14, lineHeight: 1.3, color: "#666666" }}
          >
            {[personName, positionName].filter(Boolean).join(" · ") || "—"}
          </Box>
        </Box>
      }
      titleContainerSx={{ height: "auto", minHeight: 64, py: 1 }}
      mobileTitleContainerSx={{ minHeight: 72 }}
      maxWidth="lg"
      paperSx={{ width: "100%", maxWidth: 900 }}
      contentSx={{ px: { xs: 1.5, sm: 2.5 }, pt: 2.5, pb: 2.5 }}
      actionsSx={{ px: 2.5, pt: 0, pb: 2.5, borderTop: "none" }}
      actions={
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            compact
            tone="danger"
            onClick={onClose}
            sx={{ minHeight: 44, minWidth: 106 }}
          >
            Отменить
          </JacoButton>
          <JacoButton
            compact
            tone="success"
            onClick={onSave}
            disabled={!canEditMonth || loading}
            sx={{ minHeight: 44, minWidth: 114 }}
          >
            Сохранить
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {error ? <JacoAlert severity="error">{error}</JacoAlert> : null}
        {loading ? <JacoAlert severity="info">Загружаем месяц…</JacoAlert> : null}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "200px minmax(0, 1fr)" },
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
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                {allSlots.map((slot) => (
                  <HourSlotCard
                    key={slot.id}
                    slot={slot}
                    selected={slot.id === activeSlotId}
                    onClick={() => onSelectSlot(slot.id)}
                    onRemove={
                      !loading && slot.isCustom && (slot.isRecentOnly || canEditMonth)
                        ? () => onDeleteCustomSlot?.(slot.id)
                        : null
                    }
                    maxWidth={slot.isCustom ? customChipMaxWidth : "none"}
                  />
                ))}
                <JacoButton
                  tone="secondary"
                  aria-label="Добавить временной промежуток"
                  onClick={onOpenCustomTime}
                  disabled={!canEditMonth || loading}
                  sx={{
                    alignSelf: "flex-start",
                    width: 40,
                    minWidth: 40,
                    minHeight: 40,
                    p: 0,
                    borderRadius: "10px",
                    backgroundColor: "#E5E5E5",
                    color: "#8A8A8A",
                    "&:hover": {
                      backgroundColor: "#DADADA",
                    },
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 22 }} />
                </JacoButton>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ minWidth: 0, display: "flex", justifyContent: "center" }}>
            <Stack
              spacing={0}
              sx={{ minWidth: 0, alignItems: "center" }}
            >
              <JacoMonthGridCalendar
                monthId={monthValue}
                title="Часы в календаре"
                onPreviousMonth={onNavigateMonth ? () => onNavigateMonth(-1) : undefined}
                onNextMonth={onNavigateMonth ? () => onNavigateMonth(1) : undefined}
                previousDisabled={loading}
                nextDisabled={loading}
                showMonthChevron={false}
                weekdayLabels={CALENDAR_WEEKDAY_LABELS}
                highlightWeekendHeaders
                size={calendarSize}
                dayHeight={calendarDayHeight}
                gap={calendarGap}
                padding={isXs ? 8 : 20}
                controlsGap={isXs ? 6 : 12}
                monthButtonMinWidth={isNarrowPhone ? 88 : isXs ? 96 : 118}
                navButtonSize={isNarrowPhone ? 32 : isXs ? 36 : 44}
                containerSx={{
                  width: "fit-content",
                  maxWidth: "100%",
                  mx: "auto",
                }}
                getDayMeta={(date) => {
                  const item = daysMap.get(date);
                  const isPastDay = !isEditableMonthDay(date);

                  if (!item) {
                    return {
                      disabled: isPastDay,
                      title: isPastDay ? "Прошедший день — только просмотр" : undefined,
                      ariaLabel: isPastDay ? `${date}: прошедший день, только просмотр` : date,
                    };
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
                    disabled: isPastDay,
                    title: isPastDay ? "Прошедший день — только просмотр" : undefined,
                    backgroundColor: preset.color,
                    color: preset.textColor,
                    border: "none",
                    timeStart: normalizeTimeLabel(item.time_start),
                    timeEnd: normalizeTimeLabel(item.time_end),
                    ariaLabel: `${date}: с ${normalizeTimeLabel(item.time_start)} до ${normalizeTimeLabel(item.time_end)}${isPastDay ? ", только просмотр" : ""}`,
                  };
                }}
                renderDayContent={(day, meta) => (
                  <Stack
                    spacing={0}
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: isXs ? 14 : 16,
                        fontWeight: meta.selected ? 700 : 500,
                        lineHeight: 1.1,
                      }}
                    >
                      {day.date()}
                    </Typography>
                    {meta.timeStart && meta.timeEnd ? (
                      <Stack
                        spacing={0}
                        sx={{ alignItems: "center", mt: 0.25, maxWidth: "100%" }}
                      >
                        <Typography
                          component="span"
                          sx={{ fontSize: isXs ? 9.5 : 11, lineHeight: 1.1, whiteSpace: "nowrap" }}
                        >
                          {meta.timeStart}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: isXs ? 9.5 : 11, lineHeight: 1.1, whiteSpace: "nowrap" }}
                        >
                          {meta.timeEnd}
                        </Typography>
                      </Stack>
                    ) : null}
                  </Stack>
                )}
                onDayClick={canEditMonth && !loading ? onDayClick : undefined}
              />
              {hasPastDays ? (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mt: 1, alignItems: "center", alignSelf: "flex-start", color: "#777777" }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 15 }} />
                  <Typography sx={{ fontSize: 12, lineHeight: 1.3 }}>
                    Прошедшие дни — только просмотр
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}

export default function StaffScheduleMonthModal({ modal, onClose, onSave, onNavigateMonth }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { withConfirm, ConfirmDialog } = useJacoConfirm();
  const [draft, setDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [editorCustomSlots, setEditorCustomSlots] = useState([]);
  const [hiddenRecentSlotIds, setHiddenRecentSlotIds] = useState([]);
  const [activeSlotId, setActiveSlotId] = useState("preset-0");
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [customTimeDraft, setCustomTimeDraft] = useState({
    type: 3,
    color: CUSTOM_HOUR_COLORS[0],
    time_start: "11:00",
    time_end: "17:00",
  });

  const monthValue = modal.request?.date || "";
  const hiddenRecentSlotsKey = getHiddenRecentHourSlotsKey(
    modal.request?.user_id,
    modal.request?.app_id,
  );

  useEffect(() => {
    setHiddenRecentSlotIds(readHiddenRecentHourSlots(getBrowserStorage(), hiddenRecentSlotsKey));
  }, [hiddenRecentSlotsKey]);
  const overviewCards = useMemo(
    () => buildOverviewCards(modal.data?.summary),
    [modal.data?.summary],
  );
  const monthDays = useMemo(() => modal.data?.overviewDays ?? [], [modal.data?.overviewDays]);

  useEffect(() => {
    if (!modal.open) {
      setIsAssignmentOpen(false);
      setIsCustomTimeOpen(false);
      return;
    }

    if (modal.loading || !modal.data) {
      return;
    }

    const nextDraft = buildMonthModalDraft(modal.data);
    setDraft(nextDraft);
    setEditorDraft(nextDraft);
    setEditorCustomSlots(buildCustomHourSlots(nextDraft.dates, modal.data?.recentCustomHours));
    setActiveSlotId("preset-0");
    setSaveError("");
    setIsCustomTimeOpen(false);
  }, [modal.open, modal.loading, modal.data]);

  const canEditMonth =
    Boolean(modal.data?.canEditMonth) && canEditMonthByRole({ monthId: monthValue });
  const allEditorSlots = useMemo(
    () => [...buildPresetSlots(), ...editorCustomSlots],
    [editorCustomSlots],
  );
  const activeSlot = useMemo(
    () => allEditorSlots.find((item) => item.id === activeSlotId) || allEditorSlots[0] || null,
    [activeSlotId, allEditorSlots],
  );
  const initialMonthDraft = useMemo(() => buildMonthModalDraft(modal.data), [modal.data]);
  const baselineCustomSlots = useMemo(
    () => buildCustomHourSlots(draft.dates, modal.data?.recentCustomHours),
    [draft.dates, modal.data?.recentCustomHours],
  );
  const hasMonthChanges = useMemo(
    () => hasMonthDraftChanges(draft, initialMonthDraft),
    [draft, initialMonthDraft],
  );
  const hasAssignmentChanges = useMemo(
    () =>
      hasMonthDraftChanges(editorDraft, draft) ||
      JSON.stringify(editorCustomSlots) !== JSON.stringify(baselineCustomSlots),
    [baselineCustomSlots, draft, editorCustomSlots, editorDraft],
  );

  const handleSave = async (nextDraft = draft, shouldClose = false) => {
    if (!onSave || !modal.request || !canEditMonth || modal.loading) {
      return;
    }

    setSaveError("");

    try {
      await onSave(buildMonthSavePayload(modal.request, nextDraft));
      setDraft(nextDraft);

      if (shouldClose) {
        onClose?.();
      }
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить месяц");
      return;
    }
  };

  const handleRequestClose = async () => {
    if (!hasMonthChanges) {
      onClose?.();
      return;
    }

    withConfirm(() => onClose?.(), {
      message: (
        <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
          Данные были изменены.
          <br />
          Закрыть без сохранения?
        </Typography>
      ),
      confirmLabel: "Да, закрыть",
      confirmTone: "danger",
      cancelTone: "danger",
    })();
  };

  const openAssignmentDialog = () => {
    setEditorDraft(draft);
    setEditorCustomSlots(buildCustomHourSlots(draft.dates, modal.data?.recentCustomHours));
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
    if (!hasAssignmentChanges) {
      setIsAssignmentOpen(false);
      setIsCustomTimeOpen(false);
      return;
    }

    withConfirm(
      () => {
        setIsAssignmentOpen(false);
        setIsCustomTimeOpen(false);
      },
      {
        message: (
          <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
            Данные были изменены.
            <br />
            Закрыть без сохранения?
          </Typography>
        ),
        confirmLabel: "Да, закрыть",
        confirmTone: "danger",
        cancelTone: "danger",
      },
    )();
  };

  const handleEditorDayClick = (date) => {
    if (!canEditMonth || modal.loading || !activeSlot || !isEditableMonthDay(date)) {
      return;
    }

    setEditorDraft((prev) => applySlotToDraft(prev, date, activeSlot));
  };

  const handleSubmitCustomTime = () => {
    if (!canEditMonth || modal.loading) {
      return;
    }

    const timeStart = normalizeTimeLabel(customTimeDraft.time_start);
    const timeEnd = normalizeTimeLabel(customTimeDraft.time_end);
    const nextSlot = {
      id: `custom-${buildHourSlotId({ time_start: timeStart, time_end: timeEnd })}`,
      type: Number(customTimeDraft.type ?? 3),
      label: formatHourRangeLabel(timeStart, timeEnd),
      time_start: timeStart,
      time_end: timeEnd,
      color: customTimeDraft.color,
      textColor: "#FFFFFF",
      isCustom: true,
    };

    setEditorCustomSlots((prev) =>
      prev.some((item) => item.id === nextSlot.id) ? prev : [...prev, nextSlot],
    );
    if (hiddenRecentSlotIds.includes(nextSlot.id)) {
      const nextHiddenIds = hiddenRecentSlotIds.filter((id) => id !== nextSlot.id);
      writeHiddenRecentHourSlots(getBrowserStorage(), hiddenRecentSlotsKey, nextHiddenIds);
      setHiddenRecentSlotIds(nextHiddenIds);
    }
    setActiveSlotId(nextSlot.id);
    setIsCustomTimeOpen(false);
  };

  const handleDeleteCustomSlot = (slotId) => {
    const slot = editorCustomSlots.find((item) => item.id === slotId);

    if (!slot) {
      return;
    }

    if (slot.isRecentOnly) {
      withConfirm(
        () => {
          const nextHiddenIds = [...new Set([...hiddenRecentSlotIds, slotId])];
          writeHiddenRecentHourSlots(getBrowserStorage(), hiddenRecentSlotsKey, nextHiddenIds);
          setHiddenRecentSlotIds(nextHiddenIds);
          if (activeSlotId === slotId) {
            setActiveSlotId("preset-0");
          }
        },
        {
          title: "Скрыть быстрый вариант",
          message: (
            <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
              Скрыть {formatHourRangeLabel(slot.time_start, slot.time_end)} из быстрых вариантов?
              <br />
              Сохранённые часы не изменятся.
            </Typography>
          ),
          confirmLabel: "Скрыть",
          confirmTone: "danger",
          cancelTone: "danger",
        },
      )();
      return;
    }

    if (!canEditMonth) {
      return;
    }

    withConfirm(
      () => {
        setEditorCustomSlots((prev) => prev.filter((item) => item.id !== slotId));
        setEditorDraft((prev) => ({
          ...prev,
          dates: prev.dates.filter((item) => {
            const matchesSlot =
              normalizeTimeLabel(item.time_start) === slot.time_start &&
              normalizeTimeLabel(item.time_end) === slot.time_end;
            const wasAlreadySaved = draft.dates.some(
              (saved) =>
                saved.date === item.date &&
                normalizeTimeLabel(saved.time_start) === slot.time_start &&
                normalizeTimeLabel(saved.time_end) === slot.time_end,
            );

            return (
              !isEditableMonthDay(item.date) ||
              !matchesSlot ||
              (slot.isRecentOnly && wasAlreadySaved)
            );
          }),
        }));

        if (activeSlotId === slotId) {
          setActiveSlotId("preset-0");
        }
      },
      {
        title: "Предупреждение",
        message: (
          <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
            Вы действительно хотите удалить
            <br />
            время работы{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700 }}
            >
              {formatHourRangeLabel(slot.time_start, slot.time_end)}
            </Box>
            ?
          </Typography>
        ),
        confirmLabel: "Да, удалить",
        confirmTone: "danger",
        cancelTone: "danger",
      },
    )();
  };

  const handleSaveAssignment = async () => {
    await handleSave(editorDraft, true);
  };

  const handleNavigateAssignmentMonth = (offset) => {
    if (!onNavigateMonth || modal.loading || !/^\d{4}-\d{2}$/.test(monthValue)) {
      return;
    }

    const targetMonth = dayjs(`${monthValue}-01`).add(offset, "month").format("YYYY-MM");
    const navigate = () => onNavigateMonth(targetMonth);

    if (hasAssignmentChanges || hasMonthChanges) {
      withConfirm(navigate, {
        title: "Несохранённые изменения",
        message: "Изменения текущего месяца не сохранены. Перейти в другой месяц?",
        confirmLabel: "Да, перейти",
        confirmTone: "danger",
        cancelTone: "danger",
      })();
      return;
    }

    navigate();
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
          {modal.error ? <JacoAlert severity="error">{modal.error}</JacoAlert> : null}
          {saveError ? <JacoAlert severity="error">{saveError}</JacoAlert> : null}

          {!modal.loading && modal.data ? (
            <>
              <Stack spacing={1.25}>
                <Typography sx={staffScheduleModalTypography.personName}>
                  {modal.data.personName || "—"}
                </Typography>
                <Typography sx={staffScheduleModalTypography.personMeta}>
                  {modal.data.positionName || "—"}
                </Typography>
              </Stack>

              {modal.data.hasPeriodSummary ? (
                <>
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
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 0.5,
                      }}
                    >
                      {overviewCards.map((card) => (
                        <Box
                          key={card.key}
                          sx={
                            card.key === "premium"
                              ? { gridColumn: { xs: "1 / -1", sm: "span 2" } }
                              : null
                          }
                        >
                          <SummaryCard
                            label={card.label}
                            value={card.value}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </>
              ) : null}

              <Stack
                direction="row"
                sx={{ justifyContent: "flex-end" }}
              >
                <JacoButton
                  tone="primary"
                  startIcon={<CheckRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={openAssignmentDialog}
                  disabled={!canEditMonth}
                  sx={{
                    minHeight: 38,
                    px: 2.5,
                    borderRadius: "14px",
                    fontSize: 16,
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Заполнить часы
                </JacoButton>
              </Stack>
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>

      <AssignmentDialog
        open={isAssignmentOpen}
        monthValue={monthValue}
        draft={editorDraft}
        customSlots={editorCustomSlots.filter(
          (slot) => !slot.isRecentOnly || !hiddenRecentSlotIds.includes(slot.id),
        )}
        activeSlotId={activeSlotId}
        personName={modal.data?.personName}
        positionName={modal.data?.positionName}
        onSelectSlot={setActiveSlotId}
        onDayClick={handleEditorDayClick}
        onOpenCustomTime={() => setIsCustomTimeOpen(true)}
        onDeleteCustomSlot={handleDeleteCustomSlot}
        onNavigateMonth={handleNavigateAssignmentMonth}
        canEditMonth={canEditMonth}
        loading={modal.loading}
        error={modal.error}
        onClose={closeAssignmentDialog}
        onSave={handleSaveAssignment}
      />

      <CustomTimeDialog
        open={isCustomTimeOpen}
        value={customTimeDraft}
        onChange={setCustomTimeDraft}
        onClose={() => setIsCustomTimeOpen(false)}
        onSubmit={handleSubmitCustomTime}
      />
      <ConfirmDialog />
    </>
  );
}
