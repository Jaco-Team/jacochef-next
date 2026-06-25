import { useEffect, useMemo, useState } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { V2Alert, V2Button, V2CompactTabs, V2Select } from "@/ui/v2";
import { canAccess } from "../staffScheduleHelpers";
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
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, color: "#666666", mb: 0.5 }}>{label}</Typography>
        <Typography
          sx={{ fontSize: 15, color: "#111827", lineHeight: 1.35, wordBreak: "break-word" }}
        >
          {value || "—"}
        </Typography>
      </Box>
      {onAction ? (
        <V2Button
          compact
          tone="outlinePrimary"
          size="small"
          onClick={onAction}
          disabled={disabled}
          sx={{ minHeight: 36, px: 1.5, borderRadius: "8px", fontWeight: 600 }}
        >
          {actionLabel}
        </V2Button>
      ) : null}
    </Box>
  );
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
  const screen = state?.screen || "hub";
  const draft = state?.draft;
  const isSaving = Boolean(state?.saving);
  const saveError = state?.error || "";

  const context = useMemo(
    () =>
      buildEditDialogContext({
        user,
        monthId,
        pointLabel,
        shiftLabel,
      }),
    [monthId, pointLabel, shiftLabel, user],
  );

  const canMonth = canAccess(access, "fast_month");
  const canWeek = canAccess(access, "fast_2_week");
  const canShift = canAccess(access, "fast_smena");
  const canPoint = canAccess(access, "fast_point");

  const [scheduleScope, setScheduleScope] = useState(() =>
    getDefaultScheduleScope(access, canAccess),
  );
  const [pendingScheduleType, setPendingScheduleType] = useState("");
  const [pendingSmenaId, setPendingSmenaId] = useState("");
  const [pendingPointId, setPendingPointId] = useState("");

  useEffect(() => {
    if (!state?.open) {
      return;
    }

    const nextScope =
      draft?.scheduleScope ||
      inferScheduleScopeFromUser(user, selectedPart) ||
      getDefaultScheduleScope(access, canAccess);

    setScheduleScope(nextScope);
    setPendingScheduleType(
      draft?.scheduleType
        ? String(draft.scheduleType)
        : String(getCurrentScheduleType(user, selectedPart, nextScope) ?? ""),
    );
    setPendingSmenaId(draft?.smenaId ? String(draft.smenaId) : String(user?.smena_id ?? ""));
    setPendingPointId(draft?.point ? `${draft.point.point_id}-${draft.point.smena_id}` : "");
  }, [access, draft, selectedPart, state?.open, user]);

  const scheduleOptions = useMemo(
    () => buildScheduleOptions(scheduleScope, selectedPart),
    [scheduleScope, selectedPart],
  );
  const smenaOptions = useMemo(() => buildSmenaOptions(user), [user]);
  const pointOptions = useMemo(() => buildPointOptions(user), [user]);

  const scheduleLabel = getScheduleLabel(draft, selectedPart, user) || context.scheduleLabel;
  const smenaLabel = getSmenaLabel(draft, user, context);
  const currentPointLabel = getPointLabel(draft, context);
  const hasChanges = hasEditDraftChanges(draft, user, selectedPart);

  const scheduleBaselineType = draft?.scheduleType
    ? String(draft.scheduleType)
    : String(getCurrentScheduleType(user, selectedPart, scheduleScope) ?? "");
  const scheduleBaselineScope = draft?.scheduleScope || scheduleScope;

  const scheduleDoneDisabled =
    !pendingScheduleType ||
    (String(pendingScheduleType) === scheduleBaselineType &&
      scheduleScope === scheduleBaselineScope);
  const shiftDoneDisabled =
    !pendingSmenaId || String(pendingSmenaId) === String(user?.smena_id ?? "");
  const pointDoneDisabled = !pendingPointId;

  let modalTitle = "Редактирование";
  let onBack = null;
  let content = null;
  let actions = null;

  if (screen === "hub") {
    content = (
      <Stack spacing={0}>
        <Box sx={{ pb: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", mb: 0.5 }}>
            {context.userName || "—"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#666666" }}>
            {[context.roleName, context.periodLabel].filter(Boolean).join(" · ")}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827", mb: 0.5 }}>
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
            label="График"
            value={scheduleLabel}
            actionLabel="Изменить"
            onAction={onOpenSchedule}
            disabled={isSaving}
          />
        ) : null}

        {canShift ? (
          <>
            {canMonth || canWeek ? <Divider /> : null}
            <EditSummaryRow
              label="Смена"
              value={smenaLabel}
              actionLabel="Изменить"
              onAction={onOpenShift}
              disabled={isSaving}
            />
          </>
        ) : null}

        {canPoint ? (
          <>
            {canMonth || canWeek || canShift ? <Divider /> : null}
            <EditSummaryRow
              label="Точка"
              value={currentPointLabel}
              actionLabel="Изменить"
              onAction={onOpenPoint}
              disabled={isSaving}
            />
          </>
        ) : null}
      </Stack>
    );

    actions = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <V2Button
          compact
          tone="secondary"
          onClick={onClose}
          disabled={isSaving}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Отменить
        </V2Button>
        <V2Button
          compact
          onClick={onSaveChanges}
          disabled={!hasChanges}
          loading={isSaving}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Сохранить изменения
        </V2Button>
      </Box>
    );
  }

  if (screen === "schedule") {
    modalTitle = "СМЕНА ЧАСОВ";
    onBack = onBackToHub;

    content = (
      <Stack spacing={2}>
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
          />
        ) : null}

        <V2Select
          options={scheduleOptions}
          value={pendingScheduleType}
          onChange={(event) => setPendingScheduleType(String(event.target.value))}
          label="Выберите часовой график"
        />
      </Stack>
    );

    actions = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <V2Button
          compact
          tone="secondary"
          onClick={onBackToHub}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Отмена
        </V2Button>
        <V2Button
          compact
          disabled={scheduleDoneDisabled}
          onClick={() =>
            onApplyScheduleDraft({
              scheduleScope,
              scheduleType: Number(pendingScheduleType),
            })
          }
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Готово
        </V2Button>
      </Box>
    );
  }

  if (screen === "shift") {
    modalTitle = "ИЗМЕНЕНИЕ СМЕНЫ";
    onBack = onBackToHub;

    content = (
      <V2Select
        options={smenaOptions}
        value={pendingSmenaId}
        onChange={(event) => setPendingSmenaId(String(event.target.value))}
        label="Выбери смену"
      />
    );

    actions = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <V2Button
          compact
          tone="secondary"
          onClick={onBackToHub}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Отмена
        </V2Button>
        <V2Button
          compact
          disabled={shiftDoneDisabled}
          onClick={() => onApplyShiftDraft(pendingSmenaId)}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Готово
        </V2Button>
      </Box>
    );
  }

  if (screen === "point") {
    modalTitle = "СМЕНА ТОЧКИ";
    onBack = onBackToHub;

    content = (
      <V2Select
        options={pointOptions}
        value={pendingPointId}
        onChange={(event) => setPendingPointId(String(event.target.value))}
        label="Выберите точку"
      />
    );

    actions = (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <V2Button
          compact
          tone="secondary"
          onClick={onBackToHub}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Отмена
        </V2Button>
        <V2Button
          compact
          disabled={pointDoneDisabled}
          onClick={() => {
            const selected = pointOptions.find(
              (item) => String(item.id) === String(pendingPointId),
            );
            onApplyPointDraft(selected || null);
          }}
          sx={{ minWidth: 112, borderRadius: "8px" }}
        >
          Готово
        </V2Button>
      </Box>
    );
  }

  return (
    <StaffScheduleResponsiveModal
      open={Boolean(state?.open)}
      onClose={onClose}
      title={modalTitle}
      onBack={onBack}
      maxWidth="sm"
      actions={actions}
    >
      {content}
    </StaffScheduleResponsiveModal>
  );
}
