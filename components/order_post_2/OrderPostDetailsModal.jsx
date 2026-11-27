"use client";

import { Box, Stack, Typography } from "@mui/material";
import {
  JacoButton,
  JacoModal,
  JacoStatusChip,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";
import {
  KIND_COPY,
  formatDate,
  formatDateTime,
  getStatusChipProps,
  hasEmailChanged,
} from "./orderPostUtils";

const ERROR_STATUSES = new Set([3, 4, 5]);

const labelSx = {
  ...uiTypography.label,
  color: uiColors.textMuted,
  fontWeight: 500,
};

const valueSx = {
  ...uiTypography.body,
  color: uiColors.textStrong,
  wordBreak: "break-word",
};

function DetailsField({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={labelSx}>{label}</Typography>
      {typeof children === "string" || typeof children === "number" ? (
        <Typography sx={valueSx}>{children}</Typography>
      ) : (
        children
      )}
    </Box>
  );
}

function DetailsSection({ title, children }) {
  return (
    <Box>
      <Typography sx={{ ...uiTypography.sectionTitle, color: uiColors.textStrong, mb: 1.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function OrderPostDetailsModal({ row, onClose }) {
  const isErrorStatus = row ? ERROR_STATUSES.has(Number(row.status)) : false;

  return (
    <JacoModal
      open={Boolean(row)}
      onClose={onClose}
      maxWidth="sm"
      title={row ? `Письмо №${row.id}` : ""}
      actions={
        <JacoButton
          tone="secondary"
          onClick={onClose}
        >
          Закрыть
        </JacoButton>
      }
    >
      {row ? (
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <JacoStatusChip
              label={row.status_name}
              {...getStatusChipProps(row.status)}
            />
            <JacoStatusChip
              label={row.kind_name || row.kind}
              tone={row.kind === KIND_COPY ? "neutral" : "success"}
              variant="outlined"
            />
            {row.is_test ? (
              <JacoStatusChip
                label="Тест"
                tone="warning"
                variant="soft"
              />
            ) : null}
          </Stack>

          {row.error ? (
            <DetailsField label={isErrorStatus ? "Ошибка" : "Примечание"}>
              <Typography
                sx={{
                  ...valueSx,
                  color: isErrorStatus ? uiColors.dangerHover : uiColors.text,
                }}
              >
                {row.error}
              </Typography>
            </DetailsField>
          ) : null}

          <DetailsSection title="Письмо">
            <DetailsField label="Тема">{row.subject || "—"}</DetailsField>
            <DetailsField label="Получатель">{row.email_sent || "—"}</DetailsField>
            {hasEmailChanged(row) ? (
              <DetailsField label="Исходный адрес">{row.email_original}</DetailsField>
            ) : null}
            <DetailsField label="Message ID">{row.message_id || "—"}</DetailsField>
          </DetailsSection>

          <DetailsSection title="Отправка">
            <DetailsField label="Попыток">{String(row.attempts ?? 0)}</DetailsField>
            <DetailsField label="Следующая попытка">{formatDateTime(row.next_try_at)}</DetailsField>
            <DetailsField label="Создано">{formatDateTime(row.created_at)}</DetailsField>
            <DetailsField label="Отправлено">{formatDateTime(row.sent_at)}</DetailsField>
            {row.delivery_status ? (
              <DetailsField label="Статус доставки">{String(row.delivery_status)}</DetailsField>
            ) : null}
            {row.delivery_checked_at ? (
              <DetailsField label="Доставка проверена">
                {formatDateTime(row.delivery_checked_at)}
              </DetailsField>
            ) : null}
          </DetailsSection>

          <DetailsSection title="Заявка">
            <DetailsField label="Поставщик">{row.vendor_name || "—"}</DetailsField>
            <DetailsField label="Точка">{row.point_name || "—"}</DetailsField>
            <DetailsField label="Задача">{`№${row.task_id} от ${formatDate(row.task_date)}`}</DetailsField>
            <DetailsField label="Статус задачи">
              {Number(row.task_status) === 1 ? "Завершена" : "Открыта"}
            </DetailsField>
          </DetailsSection>
        </Stack>
      ) : null}
    </JacoModal>
  );
}
