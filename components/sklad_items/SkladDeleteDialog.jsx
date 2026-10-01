"use client";

import { Stack, Typography } from "@mui/material";

import { JacoButton, JacoModal } from "@/design-system/shared/ui";

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
    <JacoModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1}
        >
          <JacoButton
            tone="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </JacoButton>
          <JacoButton
            tone="danger"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        {description ? <Typography>{description}</Typography> : null}
        {warning ? (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {warning}
          </Typography>
        ) : null}
      </Stack>
    </JacoModal>
  );
}
