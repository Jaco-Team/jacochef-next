"use client";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Button, DialogActions, DialogContent, Stack, Typography } from "@mui/material";

import MyModal from "@/ui/MyModal";

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
    <MyModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={`Преобразовать ${sourceLabel} в ${targetLabel}?`}
      maxWidth="sm"
    >
      <DialogContent>
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
            Состав и основные настройки сохранятся. Преобразование недоступно для записи, которая
            уже используется в других данных.
          </Typography>
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
          startIcon={<SwapHorizIcon />}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Преобразуем..." : "Преобразовать"}
        </Button>
      </DialogActions>
    </MyModal>
  );
}
