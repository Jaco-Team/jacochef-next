import { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { AddTimeIcon, HistoryFileIcon } from "@/design-system/shared/icons";
import {
  JacoAlert,
  JacoAutocomplete,
  JacoButton,
  JacoIconButton,
  JacoTimeRangePicker,
  uiColors,
  uiRadii,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import { formatHourRangeLabel } from "../staffScheduleHourPresets";
import {
  buildDaySavePayload,
  findInvalidTimeRangeIds,
  findOverlappingTimeRangeIds,
  getTimeRangeValidationError,
  timeRangesOverlap,
} from "../staffScheduleModalCore.mjs";
import StaffScheduleMobileSelectField from "./StaffScheduleMobileSelectField";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

const TEMPERATURE_SUGGESTIONS = ["36.0", "36,6", "37.0"];

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

function DayModalTitle({ data }) {
  return (
    <Box
      component="span"
      data-testid="employee-day-title"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, md: 1.5 },
        minWidth: 0,
        width: "100%",
      }}
    >
      <Box
        component="span"
        sx={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}
      >
        <Typography
          component="span"
          noWrap
          sx={staffScheduleModalTypography.personName}
        >
          {data?.personName || data?.title || "—"}
        </Typography>
        <Typography
          component="span"
          noWrap
          sx={{ ...staffScheduleModalTypography.personMeta, fontSize: 14 }}
        >
          {data?.positionName || data?.subtitle || "—"}
        </Typography>
      </Box>
      <Typography
        component="span"
        noWrap
        sx={{
          ...staffScheduleModalTypography.periodValue,
          ml: "auto",
          flexShrink: 0,
          fontSize: { xs: 13, md: staffScheduleModalTypography.periodValue.fontSize },
        }}
      >
        {data?.dateLabel || "—"}
      </Typography>
    </Box>
  );
}

function DayPersonSummary({ data, onHistoryOpen }) {
  return (
    <Stack
      sx={{
        pb: 2.5,
        borderBottom: "1px solid #E5E5E5",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Stack
          spacing={0.5}
          sx={{ minWidth: 0, flex: "1 1 auto" }}
        >
          <Typography sx={{ fontSize: "16px !important", lineHeight: 1.25, color: "#666666" }}>
            Нагрузка: {data?.loadTime || "—"}
          </Typography>
          <Typography sx={{ fontSize: "16px !important", lineHeight: 1.25, color: "#666666" }}>
            Средняя нагрузка: {data?.averageLoadTime || "—"}
          </Typography>
          <Typography sx={{ fontSize: "16px !important", lineHeight: 1.25, color: "#666666" }}>
            Бонус: {data?.bonusValue || 0}
          </Typography>
        </Stack>
        <JacoButton
          compact
          tone="secondary"
          startIcon={<HistoryFileIcon sx={{ fontSize: "16px !important" }} />}
          onClick={onHistoryOpen}
          disabled={!data?.history?.length}
          sx={{
            mt: 0.25,
            minWidth: 120,
            minHeight: 44,
            px: 2,
            border: "none",
            borderRadius: "12px",
            backgroundColor: "#E5E5E5",
            color: "#666666",
            fontSize: "16px !important",
            fontWeight: 500,
            "&:hover": { border: "none", backgroundColor: "#DCDCDC" },
            "&.Mui-disabled": {
              backgroundColor: "#E5E5E5",
              color: "#A6A6A6",
            },
          }}
        >
          История
        </JacoButton>
      </Stack>
    </Stack>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 16,
        lineHeight: 1.25,
        fontWeight: 700,
        color: "#A6A6A6",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

function normalizeTemperatureValue(value) {
  return String(value ?? "")
    .replace(/\./g, ",")
    .replace(/[^\d,]/g, "")
    .replace(/(,.*),/g, "$1")
    .slice(0, 4);
}

function TimeRow({ item, onRemove, hasConflict = false }) {
  return (
    <Box
      aria-invalid={hasConflict || undefined}
      sx={{
        minHeight: 44,
        border: `1px solid ${hasConflict ? uiColors.warning : "#E5E5E5"}`,
        borderRadius: "12px",
        px: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        backgroundColor: hasConflict ? uiColors.warningSoft : "transparent",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ minWidth: 0, alignItems: "center" }}
      >
        <ScheduleIcon sx={{ fontSize: 20, color: "#A6A6A6" }} />
        <Typography sx={{ fontSize: 16, color: "#666666", lineHeight: 1.25 }}>
          {formatHourRangeLabel(item.time_start, item.time_end)}
        </Typography>
      </Stack>
      <JacoIconButton
        aria-label="Удалить время"
        onClick={onRemove}
        disabled={!onRemove}
        sx={{
          width: 32,
          height: 32,
          border: "none",
          backgroundColor: "transparent",
          color: "#BABABA",
          "&:hover": { backgroundColor: "#F2F2F2" },
          "&.Mui-disabled": {
            opacity: 0.38,
            pointerEvents: "none",
          },
        }}
      >
        <CloseIcon />
      </JacoIconButton>
    </Box>
  );
}

function HistoryDialog({ open, history, onClose }) {
  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="История редактирования"
      maxWidth="md"
      paperSx={{ maxWidth: 760 }}
      contentSx={{ px: { xs: 1.5, sm: 2.5 }, pt: 2.5, pb: 2.5, minHeight: 292 }}
    >
      {history.length ? (
        <TableContainer
          data-testid="staff-schedule-history-table"
          sx={{
            maxHeight: 420,
            border: `1px solid ${uiColors.border}`,
            borderRadius: uiRadii.md,
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="История редактирования сотрудника"
            sx={{ tableLayout: "fixed", minWidth: { xs: 0, sm: 620 } }}
          >
            <TableHead>
              <TableRow>
                {[
                  ["Дата изменения", "24%"],
                  ["Автор", "24%"],
                  ["Рабочее время", "26%"],
                  ["Должность", "26%"],
                ].map(([label, width]) => (
                  <TableCell
                    key={label}
                    sx={{
                      width,
                      px: { xs: 1, sm: 1.5 },
                      py: 1.25,
                      backgroundColor: uiColors.surfaceMuted,
                      color: uiColors.textStrong,
                      fontSize: { xs: 12, sm: 14 },
                      lineHeight: 1.2,
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {history.flatMap((historyItem) => {
                const items = historyItem.items?.length
                  ? historyItem.items
                  : [{ id: `${historyItem.id}-empty`, label: "—", appName: "—" }];

                return items.map((item, itemIndex) => (
                  <TableRow
                    key={`${historyItem.id}-${item.id}`}
                    sx={{
                      verticalAlign: "top",
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    {itemIndex === 0 ? (
                      <TableCell
                        rowSpan={items.length}
                        sx={{
                          px: { xs: 1, sm: 1.5 },
                          py: 1.5,
                          color: uiColors.text,
                          fontSize: { xs: 12, sm: 14 },
                          lineHeight: 1.35,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {historyItem.createdAt || historyItem.title?.split(" - ")[0] || "—"}
                      </TableCell>
                    ) : null}
                    {itemIndex === 0 ? (
                      <TableCell
                        rowSpan={items.length}
                        sx={{
                          px: { xs: 1, sm: 1.5 },
                          py: 1.5,
                          color: uiColors.text,
                          fontSize: { xs: 12, sm: 14 },
                          lineHeight: 1.35,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {historyItem.actorName || "—"}
                      </TableCell>
                    ) : null}
                    <TableCell
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        py: 1.5,
                        color: uiColors.text,
                        fontSize: { xs: 12, sm: 14 },
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.label || "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        py: 1.5,
                        color: uiColors.text,
                        fontSize: { xs: 12, sm: 14 },
                        lineHeight: 1.35,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.appName || "—"}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: uiColors.textMuted, fontSize: 14 }}>
          История изменений пока пуста
        </Typography>
      )}
    </StaffScheduleResponsiveModal>
  );
}

function AddTimeDialog({
  open,
  start,
  end,
  existingHours,
  onChangeStart,
  onChangeEnd,
  onClose,
  onSubmit,
}) {
  const validationError = useMemo(
    () => (start && end ? getTimeRangeValidationError({ time_start: start, time_end: end }) : ""),
    [end, start],
  );
  const conflictingHour = useMemo(
    () =>
      validationError
        ? null
        : existingHours.find((item) =>
            timeRangesOverlap(item, { time_start: start, time_end: end }),
          ),
    [end, existingHours, start, validationError],
  );
  const minEndTime = useMemo(() => {
    const parsedStart = dayjs(`2026-01-01T${start}`);
    return parsedStart.isValid() ? parsedStart.add(1, "minute") : undefined;
  }, [start]);
  const maxEndTime = useMemo(() => dayjs("2026-01-01T23:59"), []);
  const canSubmit = Boolean(start && end && !validationError && !conflictingHour);

  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="Добавление рабочего времени"
      maxWidth="sm"
      paperSx={{ maxWidth: 600 }}
      contentSx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
      actionsSx={{ px: 2.5, pt: 0, pb: 2.5, borderTop: "none" }}
      actions={
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            compact
            tone="secondary"
            onClick={onClose}
            sx={{
              minWidth: 108,
              minHeight: 44,
              borderRadius: uiRadii.md,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Отменить
          </JacoButton>
          <JacoButton
            compact
            tone="primary"
            onClick={onSubmit}
            disabled={!canSubmit}
            startIcon={<AddTimeIcon sx={{ fontSize: 18 }} />}
            sx={{
              minWidth: 130,
              minHeight: 44,
              borderRadius: uiRadii.md,
              fontSize: 16,
            }}
          >
            Добавить
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        <JacoTimeRangePicker
          startValue={start}
          endValue={end}
          onStartChange={onChangeStart}
          onEndChange={onChangeEnd}
          showDuration={!validationError}
          endPickerProps={{ minTime: minEndTime, maxTime: maxEndTime }}
        />
        {validationError ? <JacoAlert severity="warning">{validationError}</JacoAlert> : null}
        {!validationError && conflictingHour ? (
          <JacoAlert severity="warning">
            Интервал {formatHourRangeLabel(start, end)} пересекается с уже добавленным временем{" "}
            {formatHourRangeLabel(conflictingHour.time_start, conflictingHour.time_end)}. Измените
            время или удалите существующий интервал.
          </JacoAlert>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}

export default function StaffScheduleDayModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = useState(() => buildDraft(modal.data));
  const initialDraftRef = useRef(buildDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);
  const [newTimeStart, setNewTimeStart] = useState("");
  const [newTimeEnd, setNewTimeEnd] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { confirm, withConfirm, ConfirmDialog } = useJacoConfirm();

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    const nextDraft = buildDraft(modal.data);

    initialDraftRef.current = nextDraft;
    setDraft(nextDraft);
    setSaveError("");
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
    setIsHistoryOpen(false);
  }, [modal.open, modal.data]);

  const hasData = !modal.loading && modal.data;
  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraftRef.current),
    [draft],
  );
  const appOptions = useMemo(() => modal.data?.otherApps ?? [], [modal.data?.otherApps]);
  const healthOptions = useMemo(() => modal.data?.healthOptions ?? [], [modal.data?.healthOptions]);
  const mentorOptions = useMemo(() => modal.data?.mentorList ?? [], [modal.data?.mentorList]);
  const canEditHours = Boolean(modal.data?.canEditHours);
  const canEditAssignment = Boolean(modal.data?.canEditAssignment);
  const canEditHealth = Boolean(modal.data?.canEditHealth);
  const canSave = canEditHours || canEditAssignment || canEditHealth;
  const invalidHourIds = useMemo(() => findInvalidTimeRangeIds(draft.hours), [draft.hours]);
  const overlappingHourIds = useMemo(() => findOverlappingTimeRangeIds(draft.hours), [draft.hours]);
  const hasInvalidHours = invalidHourIds.size > 0;
  const hasHourConflicts = overlappingHourIds.size > 0;
  const hasHourErrors = hasInvalidHours || hasHourConflicts;
  const hasBlockingHourErrors = canEditHours && hasHourErrors;

  const removeHour = (index) => {
    setSaveError("");
    setDraft((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const requestRemoveHour = (item, index) =>
    withConfirm(() => removeHour(index), {
      message: (
        <Typography sx={{ color: "#666666", fontSize: 20, textAlign: "center", lineHeight: 1.25 }}>
          Вы действительно хотите удалить
          <br />
          время работы{" "}
          <Box
            component="span"
            sx={{ fontWeight: 700 }}
          >
            {formatHourRangeLabel(item.time_start, item.time_end)}
          </Box>
          ?
        </Typography>
      ),
      confirmLabel: "Да, удалить",
    });

  const openAddTimeDialog = () => {
    setNewTimeStart("10:00");
    setNewTimeEnd("22:00");
    setIsAddTimeOpen(true);
  };

  const closeAddTimeDialog = () => {
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
  };

  const addHour = () => {
    const validationError = getTimeRangeValidationError({
      time_start: newTimeStart,
      time_end: newTimeEnd,
    });
    const hasConflict = draft.hours.some((item) =>
      timeRangesOverlap(item, { time_start: newTimeStart, time_end: newTimeEnd }),
    );

    if (!newTimeStart || !newTimeEnd || validationError || hasConflict) {
      return;
    }

    setSaveError("");
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
    closeAddTimeDialog();
  };

  const handleSave = async () => {
    if (!onSave || !modal.request) {
      return;
    }

    if (canEditHours && hasInvalidHours) {
      setSaveError("Время окончания должно быть позже начала. Переход через полночь недоступен.");
      return;
    }

    if (canEditHours && hasHourConflicts) {
      setSaveError(
        "Рабочие интервалы пересекаются. Удалите или измените один из них перед сохранением.",
      );
      return;
    }

    setSaveError("");

    try {
      await onSave(
        buildDaySavePayload(
          {
            ...modal.request,
            canEditAssignment,
            canEditHours,
            canEditHealth,
          },
          draft,
        ),
      );
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить день");
    }
  };

  const handleRequestClose = async () => {
    if (!hasChanges) {
      onClose?.();
      return;
    }

    const shouldSave = await confirm({
      message: (
        <Typography sx={{ color: "#666666", fontSize: 20, textAlign: "center", lineHeight: 1.25 }}>
          Данные были изменены.
          <br />
          Сохранить изменения?
        </Typography>
      ),
      confirmLabel: "Да, сохранить",
    });

    if (shouldSave) {
      await handleSave();
      return;
    }

    onClose?.();
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ width: "100%", justifyContent: "flex-end" }}
      >
        <JacoButton
          compact
          tone="secondary"
          onClick={handleRequestClose}
          sx={{
            minWidth: 108,
            minHeight: 44,
            borderRadius: "12px",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Отменить
        </JacoButton>
        <JacoButton
          compact
          tone="primary"
          onClick={handleSave}
          disabled={!canSave || hasBlockingHourErrors}
          sx={{ minWidth: 112, minHeight: 44, borderRadius: "12px", fontSize: 16 }}
        >
          Сохранить
        </JacoButton>
      </Stack>
    );

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={handleRequestClose}
        title={<DayModalTitle data={modal.data} />}
        maxWidth="md"
        actions={actions}
        titleSx={{ width: "100%" }}
        titleContainerSx={{ height: "auto", minHeight: 68, py: 1.25 }}
        contentSx={{ px: 2.5, pt: 3.25, pb: 1.5 }}
        actionsSx={{ px: 2.5, pt: 1, pb: 3 }}
        paperSx={{ maxWidth: 800 }}
      >
        <Stack spacing={2.5}>
          {modal.error ? <JacoAlert severity="error">{modal.error}</JacoAlert> : null}
          {saveError ? <JacoAlert severity="error">{saveError}</JacoAlert> : null}

          {hasData ? (
            <>
              <DayPersonSummary
                data={modal.data}
                onHistoryOpen={() => setIsHistoryOpen(true)}
              />

              {appOptions.length ? (
                <StaffScheduleMobileSelectField
                  options={appOptions}
                  value={draft.newApp}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      newApp: event.target.value,
                    }))
                  }
                  label="Кем работает"
                  pickerTitle="Кем работает"
                  allowNone={false}
                  disabled={!canEditAssignment}
                />
              ) : null}

              {mentorOptions.length ? (
                <StaffScheduleMobileSelectField
                  options={mentorOptions}
                  value={draft.mentorId}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      mentorId: event.target.value,
                    }))
                  }
                  label="Наставник"
                  pickerTitle="Наставник"
                  disabled={!canEditAssignment}
                />
              ) : null}

              <Stack spacing={1}>
                <SectionTitle>Дневник здоровья</SectionTitle>
                <Grid
                  container
                  spacing={1.25}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <JacoAutocomplete
                      freeSolo
                      forcePopupIcon
                      clearOnBlur={false}
                      selectOnFocus
                      options={TEMPERATURE_SUGGESTIONS}
                      value={draft.userTemp}
                      inputValue={draft.userTemp ?? ""}
                      onChange={(_event, nextValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          userTemp: normalizeTemperatureValue(nextValue),
                        }))
                      }
                      onInputChange={(_event, nextValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          userTemp: normalizeTemperatureValue(nextValue),
                        }))
                      }
                      label="Температура"
                      placeholder="Введите или выберите"
                      disabled={!canEditHealth}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StaffScheduleMobileSelectField
                      options={healthOptions}
                      value={draft.typeHealf}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          typeHealf: event.target.value,
                        }))
                      }
                      label="Здоровье"
                      pickerTitle="Здоровье"
                      allowNone={false}
                      disabled={!canEditHealth}
                    />
                  </Grid>
                </Grid>
              </Stack>

              <Stack spacing={1}>
                <SectionTitle>Время работы</SectionTitle>
                {canEditHours && hasInvalidHours ? (
                  <JacoAlert severity="warning">
                    Время окончания должно быть позже начала. Смена не может переходить через
                    полночь. Удалите некорректный интервал.
                  </JacoAlert>
                ) : null}
                {canEditHours && hasHourConflicts ? (
                  <JacoAlert severity="warning">
                    Рабочие интервалы пересекаются. Удалите или измените один из них — система не
                    будет автоматически выбирать, какой интервал сохранить.
                  </JacoAlert>
                ) : null}
                <Grid
                  container
                  spacing={1.25}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                      {draft.hours.map((item, index) => (
                        <TimeRow
                          key={item.id}
                          item={item}
                          hasConflict={
                            invalidHourIds.has(item.id) || overlappingHourIds.has(item.id)
                          }
                          onRemove={canEditHours ? requestRemoveHour(item, index) : undefined}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <JacoButton
                      fullWidth
                      tone="secondary"
                      startIcon={<AddTimeIcon sx={{ fontSize: 18 }} />}
                      onClick={openAddTimeDialog}
                      disabled={!canEditHours}
                      sx={{
                        minHeight: 44,
                        border: "none",
                        borderRadius: "12px",
                        backgroundColor: "#E5E5E5",
                        color: "#666666",
                        fontSize: 16,
                        fontWeight: 500,
                        "&:hover": { border: "none", backgroundColor: "#DCDCDC" },
                      }}
                    >
                      Добавить время
                    </JacoButton>
                  </Grid>
                </Grid>
              </Stack>
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>

      <HistoryDialog
        open={isHistoryOpen}
        history={modal.data?.history ?? []}
        onClose={() => setIsHistoryOpen(false)}
      />
      <AddTimeDialog
        open={isAddTimeOpen}
        start={newTimeStart}
        end={newTimeEnd}
        existingHours={draft.hours}
        onChangeStart={setNewTimeStart}
        onChangeEnd={setNewTimeEnd}
        onClose={closeAddTimeDialog}
        onSubmit={addHour}
      />
      <ConfirmDialog />
    </>
  );
}
