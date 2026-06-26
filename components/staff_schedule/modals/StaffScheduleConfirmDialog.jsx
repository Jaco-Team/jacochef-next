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
      titleContainerSx={{
        py: 1.25,
        backgroundColor: "#FF3333",
        borderBottom: "none",
      }}
      titleSx={{ color: "#FFFFFF", fontWeight: 700 }}
      closeButtonSx={{ color: "#FFFFFF" }}
      contentSx={{ py: 2.5 }}
      actionsSx={{ justifyContent: "center", pt: 0, pb: 2.5 }}
      actions={
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <V2Button
            tone="secondary"
            compact
            onClick={onClose}
            sx={{ minWidth: 86, borderRadius: "8px", fontWeight: 500 }}
          >
            Нет
          </V2Button>
          <V2Button
            compact
            onClick={onConfirm}
            tone="secondary"
            sx={{
              minWidth: 112,
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#E5E5E5",
              color: "#666666",
              fontWeight: 500,
              "&:hover": { backgroundColor: "#DCDCDC" },
            }}
          >
            {confirmLabel}
          </V2Button>
        </Box>
      }
    >
      <Typography sx={{ color: "#666666", fontSize: 16, textAlign: "center", lineHeight: 1.25 }}>
        {message}
      </Typography>
    </StaffScheduleResponsiveModal>
  );
}
