import { Box, Typography } from "@mui/material";
import { V2Button } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

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
          <V2Button
            tone="secondary"
            compact
            onClick={onClose}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            Отмена
          </V2Button>
          <V2Button
            compact
            onClick={onConfirm}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            {confirmLabel}
          </V2Button>
        </Box>
      }
    >
      <Typography sx={{ color: "text.secondary", fontSize: 15 }}>{message}</Typography>
    </StaffScheduleResponsiveModal>
  );
}
