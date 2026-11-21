import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  JacoButton,
  JacoModal,
  JacoTextInput,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";
import { usePendingAction } from "./shared";

const DELETE_REASON_MIN_LENGTH = 3;

function useDeleteReason(open, action) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open, action?.id, action?.type]);

  const isDelete = action?.type === "delete";
  const trimmedReason = reason.trim();
  const isReasonValid = !isDelete || trimmedReason.length >= DELETE_REASON_MIN_LENGTH;

  return {
    reason,
    setReason,
    isDelete,
    isReasonValid,
    confirmReason: isDelete ? trimmedReason : "",
  };
}

function getEmployeeSuffix(employee) {
  const name = String(employee || "").trim();
  return name ? ` сотрудника ${name}` : "";
}

function getReturnTarget(employee) {
  const name = String(employee || "").trim();
  return name ? `сотруднику ${name}` : "сотруднику";
}

function DeleteReasonField({ value, onChange }) {
  return (
    <JacoTextInput
      label="Причина удаления"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      helperText={`Не менее ${DELETE_REASON_MIN_LENGTH} символов`}
      required
      autoFocus
      multiline
      minRows={2}
    />
  );
}

// Confirm dialog shared by cleaning and preparation actions; the tone carries the action meaning.
function ActionConfirmModal({ open, meta, isDelete, reason, onReasonChange, isReasonValid, isPending, onClose, onConfirm }) {
  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={meta.title}
      maxWidth="xs"
      actions={
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            tone={meta.tone}
            compact
            startIcon={meta.icon}
            disabled={!isReasonValid}
            loading={isPending}
            onClick={onConfirm}
          >
            {meta.button}
          </JacoButton>
        </Box>
      }
    >
      <Box sx={{ display: "grid", gap: 2 }}>
        <Typography sx={{ ...uiTypography.body, color: uiColors.text }}>{meta.text}</Typography>
        {isDelete ? (
          <DeleteReasonField
            value={reason}
            onChange={onReasonChange}
          />
        ) : null}
      </Box>
    </JacoModal>
  );
}

export function ControlActionConfirmDialog({ open, action, item, cleaning, onClose, onConfirm }) {
  const { reason, setReason, isDelete, isReasonValid, confirmReason } = useDeleteReason(
    open,
    action,
  );
  const { isPending, runPending } = usePendingAction();
  const cleaningName = cleaning?.name || "Уборка";
  const employeeSuffix = getEmployeeSuffix(item?.employee);
  const actionMeta = {
    approve: {
      title: "Подтвердить уборку?",
      text: `Уборка «${cleaningName}»${employeeSuffix} будет отмечена как подтверждённая.`,
      button: "Подтвердить",
      icon: <CheckCircleOutlineIcon />,
      tone: "success",
    },
    return: {
      title: "Вернуть на доработку?",
      text: `Уборка «${cleaningName}» вернётся ${getReturnTarget(item?.employee)} на доработку: время окончания будет сброшено.`,
      button: "Вернуть",
      icon: <ReplayIcon />,
      tone: "warning",
    },
    detach: {
      title: "Снять с сотрудника?",
      text: `Уборка «${cleaningName}» станет свободной: сотрудник и время начала будут очищены. Если у уборки уже прошло время удаления, система удалит её в течение 5 минут.`,
      button: "Снять",
      icon: <PersonRemoveOutlinedIcon />,
      tone: "warning",
    },
    delete: {
      title: "Удалить запись?",
      text: `Запись «${cleaningName}»${employeeSuffix} будет удалена из проверки.`,
      button: "Удалить",
      icon: <DeleteOutlineIcon />,
      tone: "danger",
    },
  };
  const meta = actionMeta[action?.type] || actionMeta.delete;

  return (
    <ActionConfirmModal
      open={open}
      meta={meta}
      isDelete={isDelete}
      reason={reason}
      onReasonChange={setReason}
      isReasonValid={isReasonValid}
      isPending={isPending}
      onClose={onClose}
      onConfirm={() => runPending(() => onConfirm(confirmReason))}
    />
  );
}

export function PreparationActionConfirmDialog({ open, action, item, onClose, onConfirm }) {
  const { reason, setReason, isDelete, isReasonValid, confirmReason } = useDeleteReason(
    open,
    action,
  );
  const { isPending, runPending } = usePendingAction();
  const actionMeta = {
    approve: {
      title: "Подтвердить заготовку?",
      text: `Заготовка «${item?.name || "Заготовка"}» будет отмечена как подтверждённая.`,
      button: "Подтвердить",
      icon: <CheckCircleOutlineIcon />,
      tone: "success",
    },
    delete: {
      title: "Удалить заготовку?",
      text: `Заготовка «${item?.name || "Заготовка"}» будет удалена из проверки.`,
      button: "Удалить",
      icon: <DeleteOutlineIcon />,
      tone: "danger",
    },
  };
  const meta = actionMeta[action?.type] || actionMeta.approve;

  return (
    <ActionConfirmModal
      open={open}
      meta={meta}
      isDelete={isDelete}
      reason={reason}
      onReasonChange={setReason}
      isReasonValid={isReasonValid}
      isPending={isPending}
      onClose={onClose}
      onConfirm={() => runPending(() => onConfirm(confirmReason))}
    />
  );
}
