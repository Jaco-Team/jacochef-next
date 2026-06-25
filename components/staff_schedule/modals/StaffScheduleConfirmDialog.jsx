import { Box, Button, Typography } from "@mui/material";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

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
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            width: "100%",
          }}
        >
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
        </Box>
      }
    >
      <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{message}</Typography>
    </StaffScheduleResponsiveModal>
  );
}
