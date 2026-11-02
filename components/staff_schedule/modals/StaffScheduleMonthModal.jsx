import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { alpha, Box, ButtonBase, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
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
import StaffSchedulePayoutHistoryList, { usePayoutHistory } from "./StaffSchedulePayoutHistoryList";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

const CUSTOM_HOUR_COLORS = ["#926EAE", "#4CC5EA", "#FFB800"];
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
    { key: "opening", label: "ОСТАТОК НА НАЧАЛО", value: formatCurrency(summary.openingBalance) },
    { key: "difference", label: "РАЗНИЦА", value: formatCurrency(summary.difference) },
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

const FINANCE_GROUP_TITLES = { accrual: "Начисления", payout: "Выплаты" };

function FinanceRow({ item, onEdit, isLast }) {
  const canEdit = item.editable && Boolean(item.action);
  const rowSx = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto 20px",
    alignItems: "center",
    columnGap: 1,
    boxSizing: "border-box",
    width: "100%",
    minHeight: 44,
    m: 0,
    px: 1.5,
    py: 0.75,
    textAlign: "left",
    borderBottom: isLast ? "none" : "1px solid #F0F0F0",
    backgroundColor: "#FFFFFF",
  };
  const content = (
    <>
      <Typography component="span" sx={{ display: "block", m: 0, fontSize: 14, lineHeight: 1.3, color: "#374151" }}>
        {item.label}
      </Typography>
      <Typography
        component="span"
        sx={{
          display: "block",
          m: 0,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          color: item.negative ? "#D92D20" : "#111827",
        }}
      >
        {item.value}
      </Typography>
      <Box component="span" sx={{ display: "flex", justifyContent: "center" }}>
        {canEdit ? <EditOutlinedIcon aria-hidden="true" sx={{ fontSize: 16, color: "#6B7280" }} /> : null}
      </Box>
    </>
  );

  if (!canEdit) {
    return <Box sx={rowSx}>{content}</Box>;
  }

  return (
    <ButtonBase
      onClick={() => onEdit?.(item)}
      aria-label={`Изменить: ${item.label}`}
      sx={{
        ...rowSx,
        "&:hover": { backgroundColor: "#F7F7F7" },
        "&.Mui-focusVisible": { outline: "2px solid #CC0033", outlineOffset: -2 },
      }}
    >
      {content}
    </ButtonBase>
  );
}

function FinanceSection({ finance, onEdit, loadPayoutHistory }) {
  const history = usePayoutHistory({
    enabled: Boolean(finance.historyRequest),
    request: finance.historyRequest,
    load: loadPayoutHistory,
    reloadKey: finance.historyKey,
  });

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#A6A6A6", textTransform: "uppercase" }}>
        Расчёт{finance.periodLabel ? ` · ${finance.periodLabel}` : ""}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.5,
          alignItems: "start",
        }}
      >
        {["accrual", "payout"].map((group) => {
          const items = finance.items.filter((item) => item.group === group);
          if (!items.length) return null;
          return (
            <Box
              key={group}
              sx={{ border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}
            >
              <Typography
                sx={{
                  px: 1.5,
                  py: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#374151",
                  backgroundColor: "#F9FAFB",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                {FINANCE_GROUP_TITLES[group]}
              </Typography>
              {items.map((item, index) => (
                <FinanceRow
                  key={item.key}
                  item={item}
                  onEdit={onEdit}
                  isLast={index === items.length - 1}
                />
              ))}
            </Box>
          );
        })}
      </Box>
      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
        Строки с карандашом можно изменить.
      </Typography>
      <StaffSchedulePayoutHistoryList
        state={history}
        title="История выплат за период"
        emptyText="Выплат за период ещё не было"
        showType
      />
    </Stack>
  );
}

function hasMonthDraftChanges(left, right) {
  return JSON.stringify(left) !== JSON.stringify(right);
}

const CALENDAR_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const CALENDAR_WEEKEND = new Set(["Пт", "Сб", "Вс"]);

function buildCalendarWeeks(days) {
  const firstDate = dayjs(days[0]?.date);
  const offset = firstDate.isValid() ? (firstDate.day() + 6) % 7 : 0;
  const cells = [...Array(offset).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

function MonthOverviewCalendar({ days }) {
  const weeks = useMemo(() => buildCalendarWeeks(days), [days]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 0.5,
      }}
    >
      {CALENDAR_WEEKDAYS.map((weekday) => (
        <Typography
          key={weekday}
          sx={{
            py: 0.5,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            color: CALENDAR_WEEKEND.has(weekday) ? "#B54708" : "#6B7280",
          }}
        >
          {weekday}
        </Typography>
      ))}
      {weeks.flat().map((item, index) => {
        if (!item) {
          return <Box key={`empty-${index}`} />;
        }

        const hours = item.hoursLabel || "";
        const hasHours = Boolean(hours);

        return (
          <Box
            key={item.id}
            sx={{
              position: "relative",
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: hasHours ? "transparent" : "#ECECEC",
              backgroundColor: hasHours ? item.backgroundColor || "#E5E7EB" : item.isWeekend ? "#FFF8EB" : "#FFFFFF",
              color: hasHours ? item.textColor || "#111827" : "#9CA3AF",
            }}
          >
            <Typography
              component="span"
              sx={{ position: "absolute", top: 3, left: 6, fontSize: 11, lineHeight: 1, color: "inherit", opacity: 0.75 }}
            >
              {item.dayNumber}
            </Typography>
            <Typography
              component="span"
              sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1, color: "inherit" }}
            >
              {hours}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function HourSlotCard({ slot, selected, onClick, onRemove = null }) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ width: "100%", alignItems: "center" }}
    >
      <ButtonBase
        role="radio"
        aria-checked={selected}
        onClick={onClick}
        sx={{
          flex: "1 1 auto",
          minHeight: 40,
          minWidth: 0,
          px: 1,
          justifyContent: "flex-start",
          borderRadius: "10px",
          // Рамка всегда 1px, выделение — тенью, чтобы размер карточки не менялся.
          border: `1px solid ${selected ? slot.color : "#E5E5E5"}`,
          backgroundColor: selected ? alpha(slot.color, 0.16) : "#FFFFFF",
          boxShadow: selected
            ? `inset 0 0 0 1px ${slot.color}, 0 0 0 3px ${alpha(slot.color, 0.18)}`
            : "none",
          display: "flex",
          alignItems: "center",
          gap: 1,
          transition: "background-color 120ms ease, box-shadow 120ms ease",
          "&:hover": { backgroundColor: selected ? alpha(slot.color, 0.22) : "#F7F7F7" },
          "&.Mui-focusVisible": { outline: `2px solid ${slot.color}`, outlineOffset: 2 },
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
        <Typography
          noWrap
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
            textAlign: "left",
            fontSize: 14,
            lineHeight: 1.2,
            color: selected ? "#111827" : "#666666",
            fontWeight: selected ? 700 : 400,
          }}
        >
          {formatHourRangeLabel(slot.time_start, slot.time_end)}
        </Typography>
        <CheckRoundedIcon
          aria-hidden="true"
          sx={{ fontSize: 18, color: "#111827", flexShrink: 0, visibility: selected ? "visible" : "hidden" }}
        />
      </ButtonBase>
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
  onShowOverview = null,
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrowPhone = useMediaQuery("(max-width: 359px)");
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const allSlots = [...buildPresetSlots(), ...customSlots];
  const activeSlot = allSlots.find((slot) => slot.id === activeSlotId) ?? null;
  const daysMap = new Map(draft.dates.map((item) => [item.date, item]));
  const calendarSize = isNarrowPhone ? 34 : isXs ? 40 : isDesktop ? 68 : 56;
  const calendarDayHeight = isXs ? 60 : isDesktop ? 76 : 68;
  const calendarGap = isNarrowPhone ? 3 : isXs ? 4 : 8;
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
          sx={{ width: "100%", justifyContent: "flex-end", alignItems: "center" }}
        >
          {onShowOverview ? (
            <JacoButton
              compact
              tone="secondary"
              onClick={onShowOverview}
              disabled={loading}
              sx={{ minHeight: 44, mr: "auto !important" }}
            >
              Обзор и расчёт
            </JacoButton>
          ) : null}
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
                role="radiogroup"
                aria-label="Часовой промежуток"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  width: "100%",
                  maxWidth: { xs: 320, md: "none" },
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
                  />
                ))}
              </Box>
              <JacoButton
                tone="secondary"
                onClick={onOpenCustomTime}
                disabled={!canEditMonth || loading}
                startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
                sx={{
                  width: "100%",
                  maxWidth: { xs: 320, md: "none" },
                  minHeight: 40,
                  justifyContent: "flex-start",
                  px: 1.25,
                  borderRadius: "10px",
                  border: "1px dashed #C8C8C8",
                  backgroundColor: "transparent",
                  color: "#666666",
                  fontSize: 14,
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "#F5F5F5", border: "1px dashed #A6A6A6" },
                }}
              >
                Свой промежуток
              </JacoButton>
              {activeSlot && canEditMonth ? (
                <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: "#666666" }}>
                  Выбрано:{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}
                  >
                    {formatHourRangeLabel(activeSlot.time_start, activeSlot.time_end)}
                  </Box>
                  . Нажмите на день в календаре, чтобы поставить эти часы.
                </Typography>
              ) : null}
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

export default function StaffScheduleMonthModal({
  modal,
  onClose,
  onSave,
  onNavigateMonth,
  finance = null,
  onEditFinance,
  loadPayoutHistory,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { withConfirm, ConfirmDialog } = useJacoConfirm();
  const [draft, setDraft] = useState(() => buildMonthModalDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  // Клик по сотруднику сразу открывает заполнение часов; обзор месяца — по кнопке внутри.
  const [isOverviewMode, setIsOverviewMode] = useState(false);
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
      setIsOverviewMode(false);
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

  const isFillMode = modal.open && !isOverviewMode;

  const confirmDiscardAssignment = (action) => {
    if (!hasAssignmentChanges) {
      action();
      return;
    }

    withConfirm(action, {
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

  const showOverview = () =>
    confirmDiscardAssignment(() => {
      setIsCustomTimeOpen(false);
      setIsOverviewMode(true);
    });

  const closeAssignmentDialog = () =>
    confirmDiscardAssignment(() => {
      setIsCustomTimeOpen(false);
      if (isFillMode) {
        onClose?.();
      } else {
        setIsAssignmentOpen(false);
      }
    });


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
        open={modal.open && isOverviewMode}
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

              <Stack spacing={1}>
                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={1}
                  sx={{ alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between" }}
                >
                  {modal.data.hasPeriodSummary ? (
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#A6A6A6",
                        textTransform: "uppercase",
                      }}
                    >
                      График{finance?.periodLabel ? ` · ${finance.periodLabel}` : ""}
                    </Typography>
                  ) : (
                    <Box />
                  )}
                  <JacoButton
                    tone="secondary"
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
                {modal.data.hasPeriodSummary && monthDays.length ? <MonthOverviewCalendar days={monthDays} /> : null}
              </Stack>

              {modal.data.hasPeriodSummary && finance?.items?.length ? (
                <FinanceSection
                  finance={finance}
                  onEdit={onEditFinance}
                  loadPayoutHistory={loadPayoutHistory}
                />
              ) : modal.data.hasPeriodSummary ? (
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
                      <Box key={card.key}>
                        <SummaryCard
                          label={card.label}
                          value={card.value}
                        />
                      </Box>
                    ))}
                  </Box>
                </Stack>
              ) : null}
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>

      <AssignmentDialog
        open={isAssignmentOpen || isFillMode}
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
        onShowOverview={isFillMode ? showOverview : null}
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
