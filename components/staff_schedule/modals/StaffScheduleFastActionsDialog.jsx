import { useEffect, useMemo, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoAutocomplete,
  JacoButton,
  JacoPeriodSwitch,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import {
  createStaffScheduleAccess,
  formatEmployeeCount,
  getScheduleRowFocusKey,
} from "../staffScheduleHelpers";
import {
  buildEditDialogContext,
  buildPointOptions,
  buildScheduleOptions,
  EDIT_SCHEDULE_SCOPE,
  getCurrentScheduleType,
  getDefaultScheduleScope,
  getPointLabel,
  getScheduleLabel,
  getSmenaLabel,
  inferScheduleScopeFromUser,
} from "../staffScheduleEditViewModel";
import {
  buildCommonFastActionOptions,
  buildFastActionRequests,
  canEditFastHoursPeriod,
  hasFastActionDraftChanges,
} from "../staffScheduleFastActionsCore.mjs";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import StaffScheduleMobileSelectField from "./StaffScheduleMobileSelectField";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

const fastActionsGridPadding = { xs: 2, md: 2.5 };

function EditSummaryRow({ label, value, actionLabel, onAction, disabled }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        gap: 1,
        py: 0,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          minHeight: 44,
          border: "1px solid #E5E5E5",
          borderRadius: "12px",
          px: 1.25,
          py: 0.5,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography sx={staffScheduleModalTypography.fieldLabel}>{label}</Typography>
        <Typography sx={{ ...staffScheduleModalTypography.fieldValue, wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      </Box>
      {onAction ? (
        <JacoButton
          compact
          tone="secondary"
          size="small"
          onClick={onAction}
          disabled={disabled}
          style={{ fontSize: 16 }}
          sx={{
            minWidth: 106,
            minHeight: 44,
            border: "none",
            borderRadius: "12px",
            color: "#666666",
            backgroundColor: "#E5E5E5",
            fontSize: 16,
            fontWeight: 500,
            "&:hover": { backgroundColor: "#DCDCDC" },
          }}
        >
          {actionLabel}
        </JacoButton>
      ) : null}
    </Box>
  );
}

const RUSSIAN_MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function formatMonthLabel(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ""));

  if (!match) {
    return value || "—";
  }

  const monthIndex = Number(match[2]) - 1;

  if (monthIndex < 0 || monthIndex >= RUSSIAN_MONTHS.length) {
    return value;
  }

  return `${RUSSIAN_MONTHS[monthIndex]} ${match[1]}`;
}

function FastActionsModalTitle({ context, onBack }) {
  return (
    <Box
      component="span"
      data-testid="fast-actions-title"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, md: 1.5 },
        minWidth: 0,
        width: "100%",
      }}
    >
      {onBack ? (
        <IconButton
          aria-label="Назад"
          data-testid="fast-actions-back"
          onClick={onBack}
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: "10px",
            color: "#A6A6A6",
          }}
        >
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ) : null}
      <Box
        component="span"
        sx={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}
      >
        <Typography
          component="span"
          noWrap
          sx={staffScheduleModalTypography.personName}
        >
          {context.userName || "—"}
        </Typography>
        <Typography
          component="span"
          noWrap
          sx={{ ...staffScheduleModalTypography.personMeta, fontSize: 14 }}
        >
          {context.roleName || "—"}
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
        {formatMonthLabel(context.periodLabel)}
      </Typography>
    </Box>
  );
}

function BulkUsersField({ count, onOpen, disabled }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ ...staffScheduleModalTypography.fieldLabel, mb: 1 }}>
        Список сотрудников
      </Typography>
      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={Boolean(disabled)}
        onClick={disabled ? undefined : onOpen}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onOpen?.();
          }
        }}
        sx={{
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2,
          py: 1,
          border: "1px solid #E5E5E5",
          borderRadius: "18px",
          backgroundColor: "#FFFFFF",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <Typography sx={staffScheduleModalTypography.fieldValue}>{`${count} человек`}</Typography>
        <ArrowBackIosNewRoundedIcon
          sx={{ color: "#7A7A7A", fontSize: 18, transform: "rotate(180deg)", flexShrink: 0 }}
        />
      </Box>
    </Box>
  );
}

function InlineActions({
  cancelLabel = "Отмена",
  onCancel,
  doneLabel,
  onDone,
  doneDisabled,
  busy,
}) {
  return (
    <Stack
      data-testid="fast-actions-buttons"
      direction="row"
      spacing={1.5}
      sx={{ width: "100%", minWidth: 0, justifyContent: "space-between" }}
    >
      <JacoButton
        compact
        tone="danger"
        onClick={onCancel}
        disabled={busy}
        sx={{
          minWidth: { xs: 0, md: 120 },
          minHeight: 44,
          borderRadius: "12px",
          fontWeight: 500,
        }}
      >
        {cancelLabel}
      </JacoButton>
      <JacoButton
        compact
        tone="success"
        onClick={onDone}
        disabled={doneDisabled || busy}
        startIcon={<CheckRoundedIcon />}
        sx={{
          minWidth: { xs: 0, md: 122 },
          whiteSpace: { xs: "normal", md: "nowrap" },
          textAlign: "center",
          minHeight: 44,
          borderRadius: "12px",
          fontWeight: 500,
        }}
      >
        {doneLabel}
      </JacoButton>
    </Stack>
  );
}

function SubScreenPanel({ title, children }) {
  return (
    <Box
      data-testid="fast-actions-panel"
      sx={{
        backgroundColor: "#FFFFFF",
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#666666" }}>{title}</Typography>
        {children}
      </Stack>
    </Box>
  );
}

function withCurrentSmenaOption(smenaOptions, currentLabel, pendingSmenaId) {
  if (pendingSmenaId || !currentLabel || currentLabel === "—") {
    return smenaOptions;
  }

  if (smenaOptions.some((item) => item.name === currentLabel)) {
    return smenaOptions;
  }

  return [
    {
      id: "current",
      name: currentLabel,
    },
    ...smenaOptions,
  ];
}

function getPointCity(name = "") {
  const [city] = String(name).split(",");

  return city.trim();
}

function buildCityOptions(pointOptions, currentPointLabel) {
  const cityNames = new Set();
  const currentCity = getPointCity(currentPointLabel);

  if (currentCity) {
    cityNames.add(currentCity);
  }

  pointOptions.forEach((item) => {
    const city = getPointCity(item.name);

    if (city) {
      cityNames.add(city);
    }
  });

  return Array.from(cityNames).map((city) => ({
    id: city,
    name: city,
  }));
}

function withCurrentPointOption(pointOptions, currentPointLabel, pendingPointId) {
  if (pendingPointId || !currentPointLabel || currentPointLabel === "—") {
    return pointOptions;
  }

  if (pointOptions.some((item) => item.name === currentPointLabel)) {
    return pointOptions;
  }

  return [
    {
      id: "current",
      name: currentPointLabel,
    },
    ...pointOptions,
  ];
}

export default function StaffScheduleFastActionsDialog({
  state,
  access,
  selectedPart,
  monthId,
  pointLabel,
  shiftLabel,
  onClose,
  onBackToHub,
  onOpenSchedule,
  onOpenShift,
  onOpenPoint,
  onApplyScheduleDraft,
  onApplyShiftDraft,
  onApplyPointDraft,
  onSaveChanges,
  onUsersChange,
}) {
  const user = state?.user;
  const users = state?.users ?? [];
  const isBulk = state?.mode === "bulk";
  const requestedScreen = state?.screen || "hub";
  const draft = state?.draft;
  const saveError = state?.error || "";
  const { canAccess } = useMemo(() => createStaffScheduleAccess(access), [access]);

  const context = useMemo(() => {
    if (isBulk) {
      return {
        userName: formatEmployeeCount(users.length),
        roleName: "Быстрые действия",
        periodLabel: monthId ?? "",
        shiftLabel: "—",
        pointLabel: pointLabel || "—",
        scheduleLabel: "—",
      };
    }

    return buildEditDialogContext({
      user,
      monthId,
      pointLabel,
      shiftLabel,
    });
  }, [isBulk, monthId, pointLabel, shiftLabel, user, users.length]);

  const canMonth = canAccess("fast_hours");
  const canWeek = canMonth;
  const canShift = canAccess("fast_smena");
  const canPoint = canAccess("fast_point");
  const hasAccess = canMonth || canShift || canPoint;
  const screen =
    (requestedScreen === "schedule" && !(canMonth || canWeek)) ||
    (requestedScreen === "shift" && !canShift) ||
    (requestedScreen === "point" && !canPoint)
      ? "hub"
      : requestedScreen;
  const busy = Boolean(state?.saving);
  const pendingUsers = isBulk ? users : user ? [user] : [];

  const [scheduleScope, setScheduleScope] = useState(() => getDefaultScheduleScope(canAccess));
  const [pendingScheduleType, setPendingScheduleType] = useState("");
  const [pendingSmenaId, setPendingSmenaId] = useState("");
  const [pendingPointId, setPendingPointId] = useState("");
  const [pendingPointCity, setPendingPointCity] = useState("");
  const [isBulkUsersOpen, setIsBulkUsersOpen] = useState(false);
  const { confirm, ConfirmDialog } = useJacoConfirm();

  useEffect(() => {
    if (!state?.open) {
      return;
    }

    const preferredScope =
      draft?.scheduleScope ||
      (!isBulk && inferScheduleScopeFromUser(user, selectedPart)) ||
      getDefaultScheduleScope(canAccess);
    const nextScope =
      (preferredScope === EDIT_SCHEDULE_SCOPE.month && canMonth) ||
      (preferredScope === EDIT_SCHEDULE_SCOPE.week && canWeek)
        ? preferredScope
        : getDefaultScheduleScope(canAccess);

    setScheduleScope(nextScope);
    setPendingScheduleType(
      isBulk
        ? draft?.scheduleType
          ? String(draft.scheduleType)
          : ""
        : draft?.scheduleType
          ? String(draft.scheduleType)
          : String(getCurrentScheduleType(user, selectedPart, nextScope) ?? ""),
    );
    setPendingSmenaId(draft?.smenaId ? String(draft.smenaId) : "");
    const nextPointId = draft?.point ? `${draft.point.point_id}-${draft.point.smena_id}` : "";
    const nextPoint = buildPointOptions(user).find((item) => String(item.id) === nextPointId);

    setPendingPointId(nextPointId);
    setPendingPointCity(getPointCity(nextPoint?.name || context.pointLabel));
    setIsBulkUsersOpen(false);
  }, [
    canAccess,
    canMonth,
    canWeek,
    context.pointLabel,
    draft,
    isBulk,
    requestedScreen,
    selectedPart,
    state?.open,
    user,
  ]);

  const scheduleOptions = useMemo(
    () => buildScheduleOptions(scheduleScope, selectedPart),
    [scheduleScope, selectedPart],
  );
  const { smenaOptions, pointOptions } = useMemo(
    () => buildCommonFastActionOptions(isBulk ? users : user ? [user] : []),
    [isBulk, user, users],
  );
  const cityOptions = useMemo(
    () => buildCityOptions(pointOptions, context.pointLabel),
    [context.pointLabel, pointOptions],
  );
  const filteredPointOptions = useMemo(() => {
    if (!pendingPointCity) {
      return withCurrentPointOption(pointOptions, context.pointLabel, pendingPointId);
    }

    const nextOptions = pointOptions.filter((item) => getPointCity(item.name) === pendingPointCity);

    return withCurrentPointOption(nextOptions, context.pointLabel, pendingPointId);
  }, [context.pointLabel, pendingPointCity, pendingPointId, pointOptions]);

  const scheduleLabel =
    getScheduleLabel(draft, selectedPart, isBulk ? null : user) || context.scheduleLabel;
  const smenaLabel = isBulk
    ? smenaOptions.find((item) => String(item.id) === String(draft?.smenaId))?.name || "—"
    : getSmenaLabel(draft, user, context);
  const currentPointLabel = getPointLabel(draft, context);
  const displayedSmenaOptions = useMemo(
    () => withCurrentSmenaOption(smenaOptions, smenaLabel, pendingSmenaId),
    [pendingSmenaId, smenaLabel, smenaOptions],
  );
  const hasChanges = hasFastActionDraftChanges(draft, pendingUsers);
  const validateDraft = (nextDraft) => {
    try {
      return (
        buildFastActionRequests({
          draft: nextDraft,
          users: pendingUsers,
          mode: state?.mode,
          access,
          monthId,
          selectedPart,
        }).length > 0
      );
    } catch {
      return false;
    }
  };
  const saveDisabled = !hasChanges || !validateDraft(draft);

  const scheduleBaselineType = draft?.scheduleType
    ? String(draft.scheduleType)
    : String(getCurrentScheduleType(user, selectedPart, scheduleScope) ?? "");
  const scheduleBaselineScope = draft?.scheduleScope || scheduleScope;

  const scheduleDoneDisabled =
    !canEditFastHoursPeriod(monthId, scheduleScope, selectedPart) ||
    !pendingScheduleType ||
    !scheduleOptions.some((item) => String(item.type) === String(pendingScheduleType)) ||
    (!isBulk &&
      String(pendingScheduleType) === scheduleBaselineType &&
      scheduleScope === scheduleBaselineScope);
  const shiftDoneDisabled =
    !pendingSmenaId ||
    !pendingUsers.some((item) => String(item.smena_id) !== String(pendingSmenaId)) ||
    !smenaOptions.some((item) => String(item.id) === String(pendingSmenaId));
  const pointDoneDisabled = !pointOptions.some(
    (item) => String(item.id) === String(pendingPointId),
  );

  const pendingScreenDraft =
    screen === "schedule" && !scheduleDoneDisabled
      ? { ...draft, scheduleScope, scheduleType: Number(pendingScheduleType) }
      : screen === "shift" && !shiftDoneDisabled
        ? { ...draft, smenaId: pendingSmenaId }
        : screen === "point" && !pointDoneDisabled
          ? {
              ...draft,
              point: pointOptions.find((item) => String(item.id) === String(pendingPointId)),
            }
          : draft;
  const hasScreenChanges = JSON.stringify(pendingScreenDraft) !== JSON.stringify(draft);
  const handleBack = async () => {
    if (busy) return;
    if (
      hasScreenChanges &&
      !(await confirm({
        message: "Вернуться без применения выбранного значения?",
        confirmLabel: "Да, вернуться",
        confirmTone: "danger",
        cancelTone: "danger",
      }))
    )
      return;
    onBackToHub?.();
  };

  const requestRemoveBulkUser = (targetUser) => async () => {
    const accepted = await confirm({
      title: "Предупреждение",
      message: (
        <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
          Вы действительно хотите удалить из списка{" "}
          <Box
            component="span"
            sx={{ fontWeight: 700 }}
          >
            {[targetUser?.user_name, targetUser?.app_name].filter(Boolean).join(" ") ||
              "сотрудника"}
          </Box>
          ?
        </Typography>
      ),
      confirmLabel: "Да, удалить",
      confirmTone: "danger",
      cancelTone: "danger",
    });

    if (!accepted) {
      return;
    }

    const targetKey = getScheduleRowFocusKey(targetUser);
    onUsersChange?.(pendingUsers.filter((item) => getScheduleRowFocusKey(item) !== targetKey));
  };

  const handleRequestClose = async () => {
    if (busy) return;
    if (!hasChanges && !hasScreenChanges) {
      onClose?.();
      return;
    }

    const canSavePending = validateDraft(pendingScreenDraft);
    const shouldSave = await confirm({
      message: (
        <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
          Данные были изменены.
          <br />
          {canSavePending ? "Сохранить изменения?" : "Закрыть без сохранения?"}
        </Typography>
      ),
      confirmLabel: canSavePending ? "Да, сохранить" : "Закрыть",
      confirmTone: canSavePending ? "success" : "danger",
      cancelTone: "danger",
    });

    if (shouldSave) {
      if (canSavePending) await onSaveChanges?.(pendingScreenDraft, pendingUsers);
      else onClose?.();
      return;
    }

    if (canSavePending) onClose?.();
  };

  let content = null;
  let actions = null;

  if (screen === "hub") {
    content = (
      <Stack spacing={2.5}>
        <Typography sx={staffScheduleModalTypography.sectionHeading}>Что изменить?</Typography>

        {saveError ? (
          <JacoAlert
            severity="error"
            sx={{ mb: 1.5 }}
          >
            {saveError}
          </JacoAlert>
        ) : null}

        {isBulk ? (
          <BulkUsersField
            count={pendingUsers.length}
            onOpen={() => setIsBulkUsersOpen(true)}
            disabled={busy}
          />
        ) : null}
        {!(canMonth || canWeek || canShift || canPoint) ? (
          <JacoAlert severity="info">Нет доступных быстрых действий</JacoAlert>
        ) : null}
        {hasChanges && saveDisabled && !saveError ? (
          <JacoAlert severity="warning">
            Выбранные действия недоступны для текущего списка сотрудников. Проверьте выбор смены и
            кафе.
          </JacoAlert>
        ) : null}
        {canMonth || canWeek ? (
          <EditSummaryRow
            label="Часы"
            value={scheduleLabel === "—" && isBulk ? "Для выбранных сотрудников" : scheduleLabel}
            actionLabel="Изменить"
            onAction={onOpenSchedule}
            disabled={busy || !pendingUsers.length}
          />
        ) : null}

        {canShift ? (
          <EditSummaryRow
            label="Смена"
            value={smenaLabel}
            actionLabel="Изменить"
            onAction={onOpenShift}
            disabled={busy || !smenaOptions.length}
          />
        ) : null}

        {canPoint ? (
          <EditSummaryRow
            label="Кафе"
            value={currentPointLabel}
            actionLabel="Изменить"
            onAction={onOpenPoint}
            disabled={busy || !pointOptions.length}
          />
        ) : null}
      </Stack>
    );
    actions = (
      <InlineActions
        cancelLabel="Отменить"
        onCancel={handleRequestClose}
        doneLabel="Сохранить изменения"
        onDone={() => onSaveChanges(draft, pendingUsers)}
        doneDisabled={saveDisabled}
        busy={busy}
      />
    );
  }

  if (screen === "schedule") {
    content = (
      <Stack>
        <SubScreenPanel title="СМЕНА ЧАСОВ">
          <JacoAlert severity="info">
            Часы изменятся только с сегодняшнего дня. Прошедшие дни сохранятся без изменений.
          </JacoAlert>
          {canMonth && canWeek ? (
            <JacoPeriodSwitch
              data-testid="fast-actions-scope-tabs"
              value={scheduleScope}
              onChange={(_, value) => {
                setScheduleScope(value);
                setPendingScheduleType(
                  isBulk ? "" : String(getCurrentScheduleType(user, selectedPart, value) ?? ""),
                );
              }}
              items={[
                { id: EDIT_SCHEDULE_SCOPE.month, label: "На месяц" },
                { id: EDIT_SCHEDULE_SCOPE.week, label: "На 2 недели" },
              ]}
            />
          ) : null}

          <Box>
            <Typography sx={{ ...staffScheduleModalTypography.fieldValue, mb: 2 }}>
              Выбери часовой график
            </Typography>
            <StaffScheduleMobileSelectField
              options={scheduleOptions}
              value={pendingScheduleType}
              onChange={(event) => setPendingScheduleType(String(event.target.value))}
              label="Часы"
              pickerTitle="Выбери часовой график"
              allowNone={false}
              disabled={
                busy ||
                !pendingUsers.length ||
                !canEditFastHoursPeriod(monthId, scheduleScope, selectedPart)
              }
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
    actions = (
      <InlineActions
        onCancel={handleBack}
        doneLabel="Готово"
        doneDisabled={scheduleDoneDisabled}
        busy={busy}
        onDone={() =>
          onApplyScheduleDraft({
            scheduleScope,
            scheduleType: Number(pendingScheduleType),
          })
        }
      />
    );
  }

  if (screen === "shift") {
    content = (
      <Stack>
        <SubScreenPanel title="ИЗМЕНЕНИЕ СМЕНЫ">
          <Box>
            <Typography sx={{ ...staffScheduleModalTypography.fieldValue, mb: 1 }}>
              Выбери смену
            </Typography>
            <StaffScheduleMobileSelectField
              options={displayedSmenaOptions}
              value={pendingSmenaId || "current"}
              onChange={(event) => {
                const nextValue = String(event.target.value);

                setPendingSmenaId(nextValue === "current" ? "" : nextValue);
              }}
              label="Смена"
              pickerTitle="Выбери смену"
              allowNone={false}
              disabled={busy || !smenaOptions.length}
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
    actions = (
      <InlineActions
        onCancel={handleBack}
        doneLabel="Готово"
        doneDisabled={shiftDoneDisabled}
        busy={busy}
        onDone={() => onApplyShiftDraft(pendingSmenaId)}
      />
    );
  }

  if (screen === "point") {
    content = (
      <Stack>
        <SubScreenPanel title="ИЗМЕНЕНИЕ КАФЕ">
          <JacoPeriodSwitch
            value={pendingPointCity}
            onChange={(_, value) => {
              const nextCity = String(value);

              if (nextCity === pendingPointCity) {
                return;
              }

              setPendingPointCity(nextCity);
              setPendingPointId("");
            }}
            items={cityOptions}
            sx={{ borderRadius: "10px", minHeight: 40 }}
            tabSx={{ minHeight: 32, borderRadius: "8px", fontSize: 16 }}
          />
          <Box>
            <Typography sx={{ ...staffScheduleModalTypography.fieldValue, mb: 1.25 }}>
              Выбери кафе
            </Typography>
            <JacoAutocomplete
              disableClearable
              selectAppearance
              freeSolo={false}
              multiple={false}
              options={filteredPointOptions}
              value={
                filteredPointOptions.find(
                  (item) => String(item.id) === (pendingPointId || "current"),
                ) || null
              }
              isOptionEqualToValue={(option, selected) => String(option.id) === String(selected.id)}
              getOptionKey={(option) => String(option.id)}
              onChange={(_event, option) => {
                if (!option) return;
                const nextValue = String(option.id);

                setPendingPointId(nextValue === "current" ? "" : nextValue);
              }}
              label="Кафе"
              placeholder="Введите название кафе"
              disabled={busy || !pointOptions.length}
              autocompleteSx={{ width: "100%", minWidth: 0 }}
              slotProps={{
                popper: { allowAdaptivePlacement: true },
                listbox: {
                  sx: {
                    maxHeight: "min(280px, calc(100dvh - 160px))",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  },
                },
              }}
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
    actions = (
      <InlineActions
        onCancel={handleBack}
        doneLabel="Готово"
        doneDisabled={pointDoneDisabled}
        busy={busy}
        onDone={() => {
          const selected = pointOptions.find((item) => String(item.id) === String(pendingPointId));
          onApplyPointDraft(selected || null);
        }}
      />
    );
  }

  return (
    <>
      <StaffScheduleResponsiveModal
        open={Boolean(state?.open) && hasAccess}
        onClose={handleRequestClose}
        title={
          <FastActionsModalTitle
            context={context}
            onBack={screen === "hub" || busy ? null : handleBack}
          />
        }
        maxWidth="md"
        actions={actions}
        titleSx={{ width: "100%" }}
        titleContainerSx={{ height: "auto", minHeight: 68, px: fastActionsGridPadding, py: 1.25 }}
        mobileTitleSx={{ maxWidth: "none", textAlign: "left", pr: 4 }}
        contentSx={{
          "&&": {
            px: fastActionsGridPadding,
            pt: 2.5,
            pb: 2,
          },
        }}
        actionsSx={{ px: fastActionsGridPadding }}
      >
        {content}
      </StaffScheduleResponsiveModal>
      <StaffScheduleResponsiveModal
        open={isBulkUsersOpen && Boolean(state?.open) && hasAccess}
        onClose={() => setIsBulkUsersOpen(false)}
        title="Сотрудники смены"
        maxWidth="sm"
        titleContainerSx={{ px: fastActionsGridPadding }}
        contentSx={{ px: fastActionsGridPadding, pt: 1.5, pb: 1.5 }}
        mobileContentSx={{ px: fastActionsGridPadding, pt: 1.5, pb: 1.5 }}
      >
        <Box>
          {pendingUsers.map((item) => (
            <Stack
              key={getScheduleRowFocusKey(item)}
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.5,
                borderBottom: "1px solid #E5E5E5",
              }}
            >
              <Typography sx={staffScheduleModalTypography.fieldValue}>
                {[item?.user_name, item?.app_name].filter(Boolean).join(", ") || "—"}
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={requestRemoveBulkUser(item)}
                sx={{
                  p: 0,
                  width: 28,
                  height: 28,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#BABABA",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Stack>
          ))}
        </Box>
      </StaffScheduleResponsiveModal>
      <ConfirmDialog />
    </>
  );
}
