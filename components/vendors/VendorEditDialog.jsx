"use client";

import { Button, DialogActions, DialogContent, Stack } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MyModal from "@/ui/MyModal";

export default function VendorEditDialog({
  open,
  onClose,
  onSubmit,
  title,
  children,
  isSubmitting,
  submitLabel = "Сохранить",
  isSubmitDisabled = false,
  maxWidth = "md",
}) {
  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
    >
      <DialogContent sx={{ pb: 2 }}>
        <Stack spacing={3}>{children}</Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={onSubmit}
          disabled={isSubmitting || isSubmitDisabled}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </MyModal>
  );
}
