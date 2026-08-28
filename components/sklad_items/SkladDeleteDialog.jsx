"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

export default function SkladDeleteDialog({
  open,
  loading = false,
  title = "Удалить запись?",
  description = "",
  warning = "",
  confirmLabel = "Удалить",
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={1.5}>
          {description ? <Typography>{description}</Typography> : null}
          {warning ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {warning}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Удаляем..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
