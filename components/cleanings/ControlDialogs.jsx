import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import { JacoTextInput } from "@/design-system/shared/ui";
import { usePendingAction } from "./shared";

const DELETE_REASON_MIN_LENGTH = 3;

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
};

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

function ConfirmActionButton({ meta, disabled, loading, onClick }) {
  return (
    <Button
      size="small"
      variant="contained"
      startIcon={meta.icon}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      loadingPosition="start"
      sx={{
        ...actionButtonSx,
        bgcolor: meta.bgcolor,
        color: "#fff",
        "&:hover": { bgcolor: meta.hoverBgcolor },
        "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
      }}
    >
      {meta.button}
    </Button>
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
      bgcolor: "#16a34a",
      hoverBgcolor: "#15803d",
    },
    return: {
      title: "Вернуть уборку?",
      text: `Уборка «${cleaningName}»${employeeSuffix} будет возвращена в процесс.`,
      button: "Вернуть",
      icon: <ReplayIcon />,
      bgcolor: "#f59e0b",
      hoverBgcolor: "#d97706",
    },
    detach: {
      title: "Снять уборку?",
      text: `Уборка «${cleaningName}» будет переведена в активные. Сотрудник и время начала будут очищены.`,
      button: "Снять",
      icon: <ReplayIcon />,
      bgcolor: "#f59e0b",
      hoverBgcolor: "#d97706",
    },
    delete: {
      title: "Удалить запись?",
      text: `Запись «${cleaningName}»${employeeSuffix} будет удалена из проверки.`,
      button: "Удалить",
      icon: <DeleteOutlineIcon />,
      bgcolor: "primary.main",
      hoverBgcolor: "primary.dark",
    },
  };
  const meta = actionMeta[action?.type] || actionMeta.delete;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{meta.title}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{meta.text}</Typography>
        {isDelete ? (
          <DeleteReasonField
            value={reason}
            onChange={setReason}
          />
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <ConfirmActionButton
          meta={meta}
          disabled={!isReasonValid}
          loading={isPending}
          onClick={() => runPending(() => onConfirm(confirmReason))}
        />
      </DialogActions>
    </Dialog>
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
      bgcolor: "#16a34a",
      hoverBgcolor: "#15803d",
    },
    delete: {
      title: "Удалить заготовку?",
      text: `Заготовка «${item?.name || "Заготовка"}» будет удалена из проверки.`,
      button: "Удалить",
      icon: <DeleteOutlineIcon />,
      bgcolor: "primary.main",
      hoverBgcolor: "primary.dark",
    },
  };
  const meta = actionMeta[action?.type] || actionMeta.approve;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{meta.title}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{meta.text}</Typography>
        {isDelete ? (
          <DeleteReasonField
            value={reason}
            onChange={setReason}
          />
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <ConfirmActionButton
          meta={meta}
          disabled={!isReasonValid}
          loading={isPending}
          onClick={() => runPending(() => onConfirm(confirmReason))}
        />
      </DialogActions>
    </Dialog>
  );
}
