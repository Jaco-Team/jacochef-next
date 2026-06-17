import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReplayIcon from "@mui/icons-material/Replay";

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

export function ControlActionConfirmDialog({ open, action, item, cleaning, onClose, onConfirm }) {
  const actionMeta = {
    approve: {
      title: "Подтвердить уборку?",
      text: `Уборка «${cleaning?.name || "Уборка"}» сотрудника ${item?.employee || ""} будет отмечена как подтверждённая.`,
      button: "Подтвердить",
      icon: <CheckCircleOutlineIcon />,
      bgcolor: "#16a34a",
      hoverBgcolor: "#15803d",
    },
    return: {
      title: "Вернуть уборку?",
      text: `Уборка «${cleaning?.name || "Уборка"}» сотрудника ${item?.employee || ""} будет возвращена в процесс.`,
      button: "Вернуть",
      icon: <ReplayIcon />,
      bgcolor: "#f59e0b",
      hoverBgcolor: "#d97706",
    },
    detach: {
      title: "Снять уборку?",
      text: `Уборка «${cleaning?.name || "Уборка"}» будет переведена в активные. Сотрудник и время начала будут очищены.`,
      button: "Снять",
      icon: <ReplayIcon />,
      bgcolor: "#f59e0b",
      hoverBgcolor: "#d97706",
    },
    delete: {
      title: "Удалить запись?",
      text: `Запись «${cleaning?.name || "Уборка"}» сотрудника ${item?.employee || ""} будет удалена из контроля.`,
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
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{meta.title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{meta.text}</Typography>
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
        <Button
          size="small"
          variant="contained"
          startIcon={meta.icon}
          onClick={onConfirm}
          sx={{
            ...actionButtonSx,
            bgcolor: meta.bgcolor,
            color: "#fff",
            "&:hover": { bgcolor: meta.hoverBgcolor },
          }}
        >
          {meta.button}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PreparationActionConfirmDialog({ open, action, item, onClose, onConfirm }) {
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
      text: `Заготовка «${item?.name || "Заготовка"}» будет удалена из контроля.`,
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
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{meta.title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{meta.text}</Typography>
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
        <Button
          size="small"
          variant="contained"
          startIcon={meta.icon}
          onClick={onConfirm}
          sx={{
            ...actionButtonSx,
            bgcolor: meta.bgcolor,
            color: "#fff",
            "&:hover": { bgcolor: meta.hoverBgcolor },
          }}
        >
          {meta.button}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
