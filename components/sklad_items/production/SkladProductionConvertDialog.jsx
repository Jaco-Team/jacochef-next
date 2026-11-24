"use client";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Stack, Typography } from "@mui/material";

import { JacoButton, JacoModal } from "@/design-system/shared/ui";

import { getEntitySingleLabel } from "./production.helpers";

export default function SkladProductionConvertDialog({
  open,
  loading = false,
  row,
  entityType,
  onClose,
  onConfirm,
}) {
  const targetType = entityType === "recipe" ? "semi_finished" : "recipe";
  const sourceLabel = getEntitySingleLabel(entityType).toLowerCase();
  const targetLabel = getEntitySingleLabel(targetType).toLowerCase();

  return (
    <JacoModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={`Преобразовать ${sourceLabel} в ${targetLabel}?`}
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
            startIcon={<SwapHorizIcon />}
            onClick={onConfirm}
            loading={loading}
          >
            Преобразовать
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        <Typography>
          Запись «{row?.name || ""}» будет перенесена в тип «{getEntitySingleLabel(targetType)}».
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          Состав и основные настройки сохранятся. Преобразование недоступно для записи, которая уже
          используется в других данных.
        </Typography>
      </Stack>
    </JacoModal>
  );
}
