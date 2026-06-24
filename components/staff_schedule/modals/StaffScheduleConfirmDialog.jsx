import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  textTransform: "none",
};

export default function StaffScheduleConfirmDialog({
  open,
  title = "Подтвердите действие",
  message = "",
  confirmLabel = "Подтвердить",
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={actionButtonSx}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={actionButtonSx}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
