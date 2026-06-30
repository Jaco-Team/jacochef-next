import { useEffect, useMemo, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Box, Stack, Typography } from "@mui/material";
import { V2Alert, V2Button, V2CompactTabs, V2Select, useConfirm } from "@/ui/v2";
import { createStaffScheduleAccess } from "../staffScheduleHelpers";
import {
  buildEditDialogContext,
  buildPointOptions,
  buildScheduleOptions,
  buildSmenaOptions,
  EDIT_SCHEDULE_SCOPE,
  getCurrentScheduleType,
  getDefaultScheduleScope,
  getPointLabel,
  getScheduleLabel,
  getSmenaLabel,
  hasEditDraftChanges,
  inferScheduleScopeFromUser,
} from "../staffScheduleEditViewModel";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

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
        <Typography sx={{ fontSize: 14, color: "#A6A6A6", lineHeight: 1.05 }}>{label}</Typography>
        <Typography
          sx={{ fontSize: 16, color: "#666666", lineHeight: 1.2, wordBreak: "break-word" }}
        >
          {value || "—"}
        </Typography>
      </Box>
      {onAction ? (
        <V2Button
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
        </V2Button>
      ) : null}
    </Box>
  );
}

function PersonHeader({ context }) {
  return (
    <Box sx={{ pb: 2.25, borderBottom: "1px solid #E5E5E5" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}
            sx={{ color: "#666666" }}
          >
            {context.userName || "—"}
          </Typography>
          <Typography
            style={{ fontSize: 20, lineHeight: 1.25 }}
            sx={{ color: "#666666" }}
          >
            {context.roleName || "—"}
          </Typography>
        </Box>
        <Typography
          style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25 }}
          sx={{ color: "#666666" }}
        >
          {context.periodLabel}
        </Typography>
      </Stack>
    </Box>
  );
}

function InlineActions({
  cancelLabel = "Отмена",
  onCancel,
  doneLabel,
  onDone,
  doneDisabled,
  saving,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{ pt: 2 }}
    >
      <V2Button
        compact
        tone="secondary"
        onClick={onCancel}
        disabled={saving}
        sx={{
          minWidth: 120,
          borderRadius: "12px",
          color: "#666666",
          fontWeight: 500,
        }}
      >
        {cancelLabel}
      </V2Button>
      <V2Button
        compact
        onClick={onDone}
        disabled={doneDisabled}
        loading={saving}
        startIcon={!saving ? <CheckRoundedIcon /> : null}
        sx={{
          minWidth: 122,
          borderRadius: "12px",
          fontWeight: 500,
          "&.Mui-disabled": {
            backgroundColor: "#CFCFCF",
            color: "#666666",
          },
        }}
      >
        {doneLabel}
      </V2Button>
    </Stack>
  );
}

function SubScreenPanel({ title, onBack, children, actions }) {
  return (
    <Box
      sx={{
        backgroundColor: "#F2F2F2",
        borderRadius: "12px",
        p: 1.5,
        minHeight: 288,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <V2Button
            aria-label="Назад"
            tone="secondary"
            onClick={onBack}
            sx={{
              minWidth: 44,
              width: 44,
              height: 44,
              p: 0,
              border: "none",
              borderRadius: "10px",
              color: "#A6A6A6",
              backgroundColor: "#FFFFFF",
              "&:hover": { backgroundColor: "#FFFFFF" },
            }}
          >
            <ArrowBackIosNewRoundedIcon />
          </V2Button>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#666666" }}>{title}</Typography>
        </Stack>
        {children}
        {actions}
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
}) {
  const user = state?.user;
  const users = state?.users ?? [];
  const isBulk = state?.mode === "bulk";
  const screen = state?.screen || "hub";
  const draft = state?.draft;
  const isSaving = Boolean(state?.saving);
  const saveError = state?.error || "";
  const { canAccess } = useMemo(() => createStaffScheduleAccess(access), [access]);

  const context = useMemo(() => {
    if (isBulk) {
      return {
        userName: `${users.length} сотрудников`,
        roleName: "Массовое изменение графика",
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

  const canMonth = canAccess("fast_month");
  const canWeek = canAccess("fast_2_week");
  const canShift = canAccess("fast_smena");
  const canPoint = canAccess("fast_point");

  const [scheduleScope, setScheduleScope] = useState(() => getDefaultScheduleScope(canAccess));
  const [pendingScheduleType, setPendingScheduleType] = useState("");
  const [pendingSmenaId, setPendingSmenaId] = useState("");
  const [pendingPointId, setPendingPointId] = useState("");
  const [pendingPointCity, setPendingPointCity] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!state?.open) {
      return;
    }

    const nextScope =
      draft?.scheduleScope ||
      inferScheduleScopeFromUser(user, selectedPart) ||
      getDefaultScheduleScope(canAccess);

    setScheduleScope(nextScope);
    setPendingScheduleType(
      draft?.scheduleType
        ? String(draft.scheduleType)
        : String(getCurrentScheduleType(user, selectedPart, nextScope) ?? ""),
    );
    setPendingSmenaId(draft?.smenaId ? String(draft.smenaId) : "");
    const nextPointId = draft?.point ? `${draft.point.point_id}-${draft.point.smena_id}` : "";
    const nextPoint = buildPointOptions(user).find((item) => String(item.id) === nextPointId);

    setPendingPointId(nextPointId);
    setPendingPointCity(getPointCity(nextPoint?.name || context.pointLabel));
  }, [canAccess, context.pointLabel, draft, selectedPart, state?.open, user]);

  const scheduleOptions = useMemo(
    () => buildScheduleOptions(scheduleScope, selectedPart),
    [scheduleScope, selectedPart],
  );
  const smenaOptions = useMemo(() => buildSmenaOptions(user), [user]);
  const pointOptions = useMemo(() => buildPointOptions(user), [user]);
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

  const scheduleLabel = getScheduleLabel(draft, selectedPart, user) || context.scheduleLabel;
  const smenaLabel = getSmenaLabel(draft, user, context);
  const currentPointLabel = getPointLabel(draft, context);
  const displayedSmenaOptions = useMemo(
    () => withCurrentSmenaOption(smenaOptions, smenaLabel, pendingSmenaId),
    [pendingSmenaId, smenaLabel, smenaOptions],
  );
  const hasChanges = isBulk
    ? Boolean(draft?.scheduleType && draft?.scheduleScope)
    : hasEditDraftChanges(draft, user, selectedPart);

  const scheduleBaselineType = draft?.scheduleType
    ? String(draft.scheduleType)
    : String(getCurrentScheduleType(user, selectedPart, scheduleScope) ?? "");
  const scheduleBaselineScope = draft?.scheduleScope || scheduleScope;

  const scheduleDoneDisabled = isBulk
    ? !pendingScheduleType
    : !pendingScheduleType ||
      (String(pendingScheduleType) === scheduleBaselineType &&
        scheduleScope === scheduleBaselineScope);
  const shiftDoneDisabled =
    !pendingSmenaId || String(pendingSmenaId) === String(user?.smena_id ?? "");
  const pointDoneDisabled = !pendingPointId;

  const handleRequestClose = async () => {
    if (isSaving) {
      return;
    }

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
      await onSaveChanges?.();
      return;
    }

    onClose?.();
  };

  let modalTitle = "Редактирование";
  let content = null;
  let actions = null;

  if (screen === "hub") {
    content = (
      <Stack spacing={3.25}>
        <PersonHeader context={context} />

        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#666666", mb: -1 }}>
          Что изменить?
        </Typography>

        {saveError ? (
          <V2Alert
            severity="error"
            sx={{ mb: 1.5 }}
          >
            {saveError}
          </V2Alert>
        ) : null}

        {canMonth || canWeek ? (
          <EditSummaryRow
            label="Часы"
            value={isBulk ? "Изменить для выбранных сотрудников" : scheduleLabel}
            actionLabel="Изменить"
            onAction={onOpenSchedule}
            disabled={isSaving}
          />
        ) : null}

        {!isBulk && canShift ? (
          <EditSummaryRow
            label="Смена"
            value={smenaLabel}
            actionLabel="Изменить"
            onAction={onOpenShift}
            disabled={isSaving}
          />
        ) : null}

        {!isBulk && canPoint ? (
          <EditSummaryRow
            label="Кафе"
            value={currentPointLabel}
            actionLabel="Изменить"
            onAction={onOpenPoint}
            disabled={isSaving}
          />
        ) : null}

        <InlineActions
          cancelLabel="Отменить"
          onCancel={handleRequestClose}
          doneLabel="Сохранить изменения"
          onDone={onSaveChanges}
          doneDisabled={!hasChanges}
          saving={isSaving}
        />
      </Stack>
    );
  }

  if (screen === "schedule") {
    content = (
      <Stack spacing={2}>
        <PersonHeader context={context} />
        <SubScreenPanel
          title="СМЕНА ЧАСОВ"
          onBack={onBackToHub}
          actions={
            <InlineActions
              onCancel={onBackToHub}
              doneLabel="Готово"
              doneDisabled={scheduleDoneDisabled}
              onDone={() =>
                onApplyScheduleDraft({
                  scheduleScope,
                  scheduleType: Number(pendingScheduleType),
                })
              }
            />
          }
        >
          {canMonth && canWeek ? (
            <V2CompactTabs
              value={scheduleScope}
              onChange={(_, value) => {
                setScheduleScope(value);
                setPendingScheduleType(
                  String(getCurrentScheduleType(user, selectedPart, value) ?? ""),
                );
              }}
              items={[
                { id: EDIT_SCHEDULE_SCOPE.month, label: "На месяц" },
                { id: EDIT_SCHEDULE_SCOPE.week, label: "На 2 недели" },
              ]}
              sx={{
                backgroundColor: "#E5E5E5",
                borderRadius: "12px",
                p: 0.5,
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  minHeight: 46,
                  borderRadius: "8px",
                  fontSize: 18,
                  fontWeight: 500,
                  textTransform: "none",
                  color: "#666666",
                },
                "& .Mui-selected": {
                  backgroundColor: "#FFFFFF",
                  color: "#EE2737",
                },
              }}
            />
          ) : null}

          <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", p: 1.5 }}>
            <Typography sx={{ color: "#666666", fontSize: 16, mb: 1 }}>
              Выбери часовой график
            </Typography>
            <V2Select
              options={scheduleOptions}
              value={pendingScheduleType}
              onChange={(event) => setPendingScheduleType(String(event.target.value))}
              label="Часы"
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
  }

  if (screen === "shift") {
    content = (
      <Stack spacing={2}>
        <PersonHeader context={context} />
        <SubScreenPanel
          title="ИЗМЕНЕНИЕ СМЕНЫ"
          onBack={onBackToHub}
          actions={
            <InlineActions
              onCancel={onBackToHub}
              doneLabel="Готово"
              doneDisabled={shiftDoneDisabled}
              onDone={() => onApplyShiftDraft(pendingSmenaId)}
            />
          }
        >
          <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", p: 1.5 }}>
            <Typography sx={{ color: "#666666", fontSize: 16, mb: 1 }}>Выбери смену</Typography>
            <V2Select
              options={displayedSmenaOptions}
              value={pendingSmenaId || "current"}
              onChange={(event) => {
                const nextValue = String(event.target.value);

                setPendingSmenaId(nextValue === "current" ? "" : nextValue);
              }}
              label="Смена"
              allowNone={false}
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
  }

  if (screen === "point") {
    content = (
      <Stack spacing={2}>
        <PersonHeader context={context} />
        <SubScreenPanel
          title="ИЗМЕНЕНИЕ КАФЕ"
          onBack={onBackToHub}
          actions={
            <InlineActions
              onCancel={onBackToHub}
              doneLabel="Готово"
              doneDisabled={pointDoneDisabled}
              onDone={() => {
                const selected = pointOptions.find(
                  (item) => String(item.id) === String(pendingPointId),
                );
                onApplyPointDraft(selected || null);
              }}
            />
          }
        >
          <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", p: 1.5 }}>
            <Typography sx={{ color: "#666666", fontSize: 16, mb: 1 }}>Выбери город</Typography>
            <V2Select
              options={cityOptions}
              value={pendingPointCity}
              onChange={(event) => {
                const nextCity = String(event.target.value);

                setPendingPointCity(nextCity);
                setPendingPointId("");
              }}
              label="Смена"
              allowNone={false}
            />
          </Box>
          <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", p: 1.5 }}>
            <Typography sx={{ color: "#666666", fontSize: 16, mb: 1 }}>Выбери кафе</Typography>
            <V2Select
              options={filteredPointOptions}
              value={pendingPointId || "current"}
              onChange={(event) => {
                const nextValue = String(event.target.value);

                setPendingPointId(nextValue === "current" ? "" : nextValue);
              }}
              label="Смена"
              allowNone={false}
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
  }

  return (
    <>
      <StaffScheduleResponsiveModal
        open={Boolean(state?.open)}
        onClose={handleRequestClose}
        title={modalTitle}
        maxWidth="md"
        actions={actions}
        contentSx={{
          "&&": {
            px: 2.5,
            pt: 3.25,
            pb: 2,
          },
        }}
      >
        {content}
      </StaffScheduleResponsiveModal>
      <ConfirmDialog />
    </>
  );
}
