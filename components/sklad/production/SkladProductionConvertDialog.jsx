"use client";

import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

function getTargetType(entityType) {
  return entityType === "recipe" ? "semi_finished" : "recipe";
}

function getTypeLabel(entityType) {
  return entityType === "recipe" ? "Рецепт" : "Полуфабрикат";
}

function InfoCard({ title, description, children }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export default function SkladProductionConvertDialog({
  open,
  detail,
  entityType,
  canConvert = false,
  onClose,
}) {
  const sourceType = entityType || "semi_finished";
  const targetType = getTargetType(sourceType);
  const sourceLabel = getTypeLabel(sourceType);
  const targetLabel = getTypeLabel(targetType);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pr: 7 }}>
        Конвертация: {detail?.name || sourceLabel}
        <IconButton
          onClick={onClose}
          aria-label="Закрыть"
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert
            severity="warning"
            sx={{ borderRadius: 2 }}
          >
            Этот экран уже показывает реальный canonical contract конвертации, но запуск действия в
            новом FE пока оставлен staged и отключен.
          </Alert>

          {!canConvert ? (
            <Alert
              severity="info"
              sx={{ borderRadius: 2 }}
            >
              По текущим правам можно только посмотреть сценарий конвертации.
            </Alert>
          ) : null}

          <InfoCard
            title="Направление"
            description="Новый production flow использует canonical business action `entities/convert_type`."
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Typography sx={{ fontWeight: 600 }}>{sourceLabel}</Typography>
              <SwapHorizIcon
                fontSize="small"
                color="action"
              />
              <Typography sx={{ fontWeight: 600 }}>{targetLabel}</Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Будет создана новая сущность типа "{targetLabel.toLowerCase()}", а исходная карточка
              удаляется только если backend подтверждает, что связанные контуры не пострадают.
            </Typography>
          </InfoCard>

          <InfoCard
            title="Что подтверждено контрактом"
            description="Только documented semantics, без speculative FE checks."
          >
            <Stack spacing={1}>
              <Typography variant="body2">
                {"`semi_finished -> recipe` переносит состав в рецепт как item-компоненты."}
              </Typography>
              <Typography variant="body2">
                {"`recipe -> semi_finished` допустима только для item-based рецептов."}
              </Typography>
              <Typography variant="body2">
                Если сущность используется сейчас или участвовала в связанных контурах, backend
                должен вернуть отказ вместо конвертации.
              </Typography>
            </Stack>
          </InfoCard>

          <InfoCard
            title="Почему выполнение еще выключено"
            description="Эта оболочка нужна, чтобы показать честный destructive flow до полного backend-ready pass."
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Перед live-запуском здесь должны появиться подтверждение destructive action,
              предзагрузка ограничений по использованию и обработка результата с `new_id`,
              `new_type` и `history_id`.
            </Typography>
          </InfoCard>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          variant="contained"
          color="warning"
          disabled
        >
          Конвертировать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
