import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { MySelect } from "@/ui/Forms";
import { canAccess } from "../staffScheduleHelpers";
import {
  buildEditDialogContext,
  buildPointOptions,
  buildScheduleOptions,
  buildSmenaOptions,
  EDIT_SCHEDULE_SCOPE,
  getDefaultScheduleScope,
  getPointLabel,
  getScheduleLabel,
  getSmenaLabel,
  hasEditDraftChanges,
} from "../staffScheduleEditViewModel";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  textTransform: "none",
};

const editRowButtonSx = {
  minHeight: 36,
  px: 1.5,
  borderRadius: "8px",
  fontWeight: 600,
  textTransform: "none",
  color: "#EE2737",
  borderColor: "#EE2737",
  "&:hover": {
    borderColor: "#D91E2D",
    backgroundColor: "rgba(238, 39, 55, 0.04)",
  },
};

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
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          disabled={disabled}
          sx={editRowButtonSx}
        >
          {actionLabel}
        </Button>
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

    setScheduleScope(draft?.scheduleScope || getDefaultScheduleScope(access, canAccess));
    setPendingScheduleType(draft?.scheduleType ? String(draft.scheduleType) : "");
    setPendingSmenaId(draft?.smenaId ? String(draft.smenaId) : String(user?.smena_id ?? ""));
    setPendingPointId(draft?.point ? `${draft.point.point_id}-${draft.point.smena_id}` : "");
  }, [access, draft, state?.open, user?.smena_id]);

  const scheduleOptions = useMemo(
    () => buildScheduleOptions(scheduleScope, selectedPart),
    [scheduleScope, selectedPart],
  );
  const smenaOptions = useMemo(() => buildSmenaOptions(user), [user]);
  const pointOptions = useMemo(() => buildPointOptions(user), [user]);

  const scheduleLabel = getScheduleLabel(draft, selectedPart) || context.scheduleLabel;
  const smenaLabel = getSmenaLabel(draft, user, context);
  const currentPointLabel = getPointLabel(draft, context);
  const hasChanges = hasEditDraftChanges(draft, user);

  const scheduleDoneDisabled =
    !pendingScheduleType ||
    (String(pendingScheduleType) === String(draft?.scheduleType ?? "") &&
      scheduleScope === (draft?.scheduleScope || scheduleScope));
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
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
          >
            {saveError}
          </Alert>
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
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSaving}
          sx={actionButtonSx}
        >
          Отменить
        </Button>
        <Button
          variant="contained"
          onClick={onSaveChanges}
          disabled={!hasChanges || isSaving}
          sx={{
            ...actionButtonSx,
            backgroundColor: "#EE2737",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#D91E2D",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              backgroundColor: "#E5E7EB",
              color: "#9CA3AF",
            },
          }}
        >
          {isSaving ? (
            <CircularProgress
              size={18}
              color="inherit"
            />
          ) : (
            "Сохранить изменения"
          )}
        </Button>
      </Box>
    );
  }

  if (screen === "schedule") {
    modalTitle = "СМЕНА ЧАСОВ";
    onBack = onBackToHub;

    content = (
      <Stack spacing={2}>
        {canMonth && canWeek ? (
          <Tabs
            value={scheduleScope}
            onChange={(_, value) => {
              setScheduleScope(value);
              setPendingScheduleType("");
            }}
            variant="fullWidth"
            sx={{
              minHeight: 40,
              "& .MuiTabs-indicator": {
                backgroundColor: "#EE2737",
                height: 2,
              },
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 14,
                color: "#666666",
              },
              "& .Mui-selected": {
                color: "#EE2737",
              },
            }}
          >
            <Tab
              value={EDIT_SCHEDULE_SCOPE.month}
              label="На месяц"
            />
            <Tab
              value={EDIT_SCHEDULE_SCOPE.week}
              label="На 2 недели"
            />
          </Tabs>
        ) : null}

        <MySelect
          data={scheduleOptions}
          value={pendingScheduleType}
          func={(event) => setPendingScheduleType(String(event.target.value))}
          label="Выберите часовой график"
          unifiedPopup
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
        <Button
          variant="outlined"
          onClick={onBackToHub}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={scheduleDoneDisabled}
          onClick={() =>
            onApplyScheduleDraft({
              scheduleScope,
              scheduleType: Number(pendingScheduleType),
            })
          }
          sx={{
            ...actionButtonSx,
            backgroundColor: scheduleDoneDisabled ? "#E5E7EB" : "#EE2737",
            color: scheduleDoneDisabled ? "#9CA3AF" : "#FFFFFF",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: scheduleDoneDisabled ? "#E5E7EB" : "#D91E2D",
              boxShadow: "none",
            },
          }}
        >
          Готово
        </Button>
      </Box>
    );
  }

  if (screen === "shift") {
    modalTitle = "ИЗМЕНЕНИЕ СМЕНЫ";
    onBack = onBackToHub;

    content = (
      <MySelect
        data={smenaOptions}
        value={pendingSmenaId}
        func={(event) => setPendingSmenaId(String(event.target.value))}
        label="Выбери смену"
        unifiedPopup
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
        <Button
          variant="outlined"
          onClick={onBackToHub}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={shiftDoneDisabled}
          onClick={() => onApplyShiftDraft(pendingSmenaId)}
          sx={{
            ...actionButtonSx,
            backgroundColor: shiftDoneDisabled ? "#E5E7EB" : "#EE2737",
            color: shiftDoneDisabled ? "#9CA3AF" : "#FFFFFF",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: shiftDoneDisabled ? "#E5E7EB" : "#D91E2D",
              boxShadow: "none",
            },
          }}
        >
          Готово
        </Button>
      </Box>
    );
  }

  if (screen === "point") {
    modalTitle = "СМЕНА ТОЧКИ";
    onBack = onBackToHub;

    content = (
      <MySelect
        data={pointOptions}
        value={pendingPointId}
        func={(event) => setPendingPointId(String(event.target.value))}
        label="Выберите точку"
        unifiedPopup
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
        <Button
          variant="outlined"
          onClick={onBackToHub}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={pointDoneDisabled}
          onClick={() => {
            const selected = pointOptions.find(
              (item) => String(item.id) === String(pendingPointId),
            );
            onApplyPointDraft(selected || null);
          }}
          sx={{
            ...actionButtonSx,
            backgroundColor: pointDoneDisabled ? "#E5E7EB" : "#EE2737",
            color: pointDoneDisabled ? "#9CA3AF" : "#FFFFFF",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: pointDoneDisabled ? "#E5E7EB" : "#D91E2D",
              boxShadow: "none",
            },
          }}
        >
          Готово
        </Button>
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
