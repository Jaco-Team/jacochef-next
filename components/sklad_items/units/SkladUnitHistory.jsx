"use client";

import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { JacoButton } from "@/design-system/shared/ui";
import { uiRadii } from "@/design-system/shared/tokens";

const fieldLabels = {
  id: "ID",
  name: "Название",
  con_id: "Базовая единица",
  main_count: "Базовое количество",
  con_count: "Количество в связке",
};

function readDiff(value) {
  try {
    const diff = typeof value === "string" ? JSON.parse(value) : value;
    return diff && typeof diff === "object" && !Array.isArray(diff) ? diff : null;
  } catch {
    return null;
  }
}

function formatValue(field, value, recordedNames) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "con_id") {
    if (String(value) === "0") return "Без привязки";
    return recordedNames?.[String(value)] || `Единица #${value}`;
  }
  return String(value);
}

export default function SkladUnitHistory({ history, loading, error, onRetry }) {
  return (
    <Stack
      spacing={1.5}
      sx={{ mt: 2 }}
    >
      <Typography sx={{ fontWeight: 600 }}>История изменений</Typography>
      {loading ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center" }}
          role="status"
        >
          <CircularProgress size={18} />
          <Typography variant="body2">Загрузка истории…</Typography>
        </Stack>
      ) : error ? (
        <Stack spacing={1}>
          <Alert severity="error">{error}</Alert>
          <JacoButton
            tone="secondary"
            onClick={onRetry}
            sx={{ alignSelf: "flex-start" }}
          >
            Повторить загрузку
          </JacoButton>
        </Stack>
      ) : !history.length ? (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          История изменений пока отсутствует. Для старых записей автор создания неизвестен.
        </Typography>
      ) : (
        <Stack
          component="ol"
          aria-label="История изменений"
          spacing={1.5}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {history.map((entry) => {
            const diff = readDiff(entry.diff_json);
            const recordedNames = readDiff(entry.meta_json)?.unit_names;
            const fields = diff
              ? Object.keys(fieldLabels).filter(
                  (field) => diff[field] && typeof diff[field] === "object",
                )
              : [];
            const date = dayjs(entry.created_at);
            return (
              <Box
                component="li"
                key={entry.id}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: uiRadii.md,
                  overflowWrap: "anywhere",
                }}
              >
                <Stack spacing={0.75}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    {entry.event_type === "create" ? "Создание" : "Редактирование"} ·{" "}
                    {entry.created_at && date.isValid()
                      ? date.format("DD.MM.YYYY HH:mm:ss")
                      : "Дата не указана"}
                  </Typography>
                  <Typography variant="body2">
                    {entry.actor_name ||
                      (entry.actor_id ? `Пользователь #${entry.actor_id}` : "Автор не указан")}
                  </Typography>
                  {!diff ? (
                    <Typography
                      variant="body2"
                      color="error"
                    >
                      Данные изменений недоступны.
                    </Typography>
                  ) : fields.length ? (
                    fields.map((field) => (
                      <Typography
                        key={field}
                        variant="body2"
                        color="text.secondary"
                      >
                        {fieldLabels[field]}: {formatValue(field, diff[field].from, recordedNames)}{" "}
                        → {formatValue(field, diff[field].to, recordedNames)}
                      </Typography>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Изменений полей нет.
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
