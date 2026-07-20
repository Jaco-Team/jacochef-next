"use client";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MyModal from "@/ui/MyModal";

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
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={`Конвертация: ${detail?.name || sourceLabel}`}
    >
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert
            severity="warning"
            sx={{ borderRadius: 2 }}
          >
            Экран показывает сценарий конвертации, но запуск действия в текущем интерфейсе пока
            отключен.
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
            description="Конвертация выполняется отдельным backend-действием `entities/convert_type`."
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
            description="Здесь показаны только подтвержденные правила без дополнительных FE-допущений."
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
            description="Экран подготовлен для полного сценария, но выполнение еще не доведено до рабочего состояния."
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
    </MyModal>
  );
}
