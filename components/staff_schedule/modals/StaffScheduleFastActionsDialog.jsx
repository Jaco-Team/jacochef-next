import { useEffect, useMemo, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { JacoAlert, JacoButton, JacoPeriodSwitch, useJacoConfirm } from "@/design-system/shared/ui";
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
import StaffScheduleMobileSelectField from "./StaffScheduleMobileSelectField";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

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

function BulkUsersField({ count, onOpen }) {
  return (
    <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", p: 1.5 }}>
      <Typography sx={{ ...staffScheduleModalTypography.fieldLabel, mb: 1 }}>
        Список сотрудников
      </Typography>
      <Box
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
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
          cursor: "pointer",
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

function getBulkScheduleDraftValue(draft, scheduleScope, pendingScheduleType) {
  return {
    ...draft,
    scheduleScope,
    scheduleType: Number(pendingScheduleType),
  };
}

function InlineActions({ cancelLabel = "Отмена", onCancel, doneLabel, onDone, doneDisabled }) {
  return (
    <Stack
      data-testid="fast-actions-buttons"
      direction="row"
      justifyContent="space-between"
      spacing={1.5}
      sx={{ width: "100%", justifyContent: "space-between !important" }}
    >
      <JacoButton
        compact
        tone="secondary"
        onClick={onCancel}
        sx={{
          minWidth: 120,
          minHeight: 44,
          borderRadius: "12px",
          color: "#666666",
          fontWeight: 500,
        }}
      >
        {cancelLabel}
      </JacoButton>
      <JacoButton
        compact
        onClick={onDone}
        disabled={doneDisabled}
        startIcon={<CheckRoundedIcon />}
        sx={{
          minWidth: 122,
          minHeight: 44,
          borderRadius: "12px",
          fontWeight: 500,
          "&.Mui-disabled": {
            backgroundColor: "#CFCFCF",
            color: "#666666",
          },
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
}) {
  const user = state?.user;
  const users = state?.users ?? [];
  const isBulk = state?.mode === "bulk";
  const screen = state?.screen || "hub";
  const draft = state?.draft;
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
  const [isBulkUsersOpen, setIsBulkUsersOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const { confirm, ConfirmDialog } = useJacoConfirm();

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
    setPendingUsers(users);
  }, [canAccess, context.pointLabel, draft, isBulk, selectedPart, state?.open, user]);

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
  const hasBulkUserChanges = isBulk && pendingUsers.length !== users.length;
  const hasChanges = isBulk
    ? Boolean(draft?.scheduleType && draft?.scheduleScope) || hasBulkUserChanges
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
  const bulkSaveDisabled = !pendingUsers.length || (!pendingScheduleType && !hasBulkUserChanges);

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
    });

    if (!accepted) {
      return;
    }

    setPendingUsers((prev) => prev.filter((item) => String(item?.id) !== String(targetUser?.id)));
  };

  const handleRequestClose = async () => {
    if (!hasChanges) {
      onClose?.();
      return;
    }

    const shouldSave = await confirm({
      message: (
        <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
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

  let modalTitle = "";
  let content = null;
  let actions = null;

  if (isBulk && screen === "schedule") {
    modalTitle = monthId ? `Смена часов ${formatMonthLabel(monthId)}` : "Смена часов";
  }

  if (screen === "hub") {
    content = (
      <Stack spacing={3.25}>
        <Typography sx={{ ...staffScheduleModalTypography.sectionHeading, mb: -1 }}>
          Что изменить?
        </Typography>

        {saveError ? (
          <JacoAlert
            severity="error"
            sx={{ mb: 1.5 }}
          >
            {saveError}
          </JacoAlert>
        ) : null}

        {canMonth || canWeek ? (
          <EditSummaryRow
            label="Часы"
            value={isBulk ? "Изменить для выбранных сотрудников" : scheduleLabel}
            actionLabel="Изменить"
            onAction={onOpenSchedule}
          />
        ) : null}

        {!isBulk && canShift ? (
          <EditSummaryRow
            label="Смена"
            value={smenaLabel}
            actionLabel="Изменить"
            onAction={onOpenShift}
          />
        ) : null}

        {!isBulk && canPoint ? (
          <EditSummaryRow
            label="Кафе"
            value={currentPointLabel}
            actionLabel="Изменить"
            onAction={onOpenPoint}
          />
        ) : null}
      </Stack>
    );
    actions = (
      <InlineActions
        cancelLabel="Отменить"
        onCancel={handleRequestClose}
        doneLabel="Сохранить изменения"
        onDone={onSaveChanges}
        doneDisabled={!hasChanges}
      />
    );
  }

  if (screen === "schedule") {
    if (isBulk) {
      content = (
        <Stack spacing={2.5}>
          <Typography sx={staffScheduleModalTypography.title}>Для выбранных сотрудников</Typography>
          <BulkUsersField
            count={pendingUsers.length}
            onOpen={() => setIsBulkUsersOpen(true)}
          />
          <Stack spacing={1.25}>
            <Typography
              sx={{
                fontSize: 16,
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#B1B1B1",
                textTransform: "uppercase",
              }}
            >
              Смена часов
            </Typography>
            {canMonth && canWeek ? (
              <JacoPeriodSwitch
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
            <StaffScheduleMobileSelectField
              options={scheduleOptions}
              value={pendingScheduleType}
              onChange={(event) => setPendingScheduleType(String(event.target.value))}
              label="Часы"
              pickerTitle="Выбери часы"
              allowNone={false}
            />
          </Stack>
        </Stack>
      );
      actions = (
        <InlineActions
          onCancel={handleRequestClose}
          doneLabel="Сохранить"
          doneDisabled={bulkSaveDisabled}
          onDone={() =>
            onSaveChanges(
              getBulkScheduleDraftValue(draft, scheduleScope, pendingScheduleType),
              pendingUsers,
            )
          }
        />
      );
    } else {
      content = (
        <Stack>
          <SubScreenPanel title="СМЕНА ЧАСОВ">
            {canMonth && canWeek ? (
              <JacoPeriodSwitch
                data-testid="fast-actions-scope-tabs"
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
              />
            </Box>
          </SubScreenPanel>
        </Stack>
      );
      actions = (
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
      );
    }
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
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
    actions = (
      <InlineActions
        onCancel={onBackToHub}
        doneLabel="Готово"
        doneDisabled={shiftDoneDisabled}
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
            <StaffScheduleMobileSelectField
              options={filteredPointOptions}
              value={pendingPointId || "current"}
              onChange={(event) => {
                const nextValue = String(event.target.value);

                setPendingPointId(nextValue === "current" ? "" : nextValue);
              }}
              label="Кафе"
              pickerTitle="Выбери кафе"
              allowNone={false}
            />
          </Box>
        </SubScreenPanel>
      </Stack>
    );
    actions = (
      <InlineActions
        onCancel={onBackToHub}
        doneLabel="Готово"
        doneDisabled={pointDoneDisabled}
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
        open={Boolean(state?.open)}
        onClose={handleRequestClose}
        title={
          isBulk ? (
            modalTitle
          ) : (
            <FastActionsModalTitle
              context={context}
              onBack={screen === "hub" ? null : onBackToHub}
            />
          )
        }
        maxWidth="md"
        actions={actions}
        titleSx={isBulk ? undefined : { width: "100%" }}
        titleContainerSx={isBulk ? undefined : { height: "auto", minHeight: 68, py: 1.25 }}
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
      <StaffScheduleResponsiveModal
        open={isBulkUsersOpen}
        onClose={() => setIsBulkUsersOpen(false)}
        title="Сотрудники смены"
        maxWidth="sm"
        contentSx={{ px: 0, pt: 1.5, pb: 0 }}
        mobileContentSx={{ px: 0, pt: 1.5, pb: 0 }}
      >
        <Box sx={{ px: 2, pb: 1.5 }}>
          {pendingUsers.map((item) => (
            <Stack
              key={String(item?.id)}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{ py: 1.5, borderBottom: "1px solid #E5E5E5" }}
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
