"use client";

import { Alert, Typography } from "@mui/material";
import HistoryLog from "@/ui/history/HistoryLog";
import { revisionSavedAt } from "./revisionSavedAt.mjs";

export default function SkladHistoryChangeSummary({ row, changes, hasPrevious, ready }) {
  if (!ready) return null;
  if (!hasPrevious) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Для самой ранней доступной версии сравнение отсутствует.
      </Typography>
    );
  }
  if (!changes.length) {
    return <Alert severity="info">В доступных полях изменений не найдено.</Alert>;
  }
  const diff = Object.fromEntries(changes.map(({ label, from, to }) => [label, { from, to }]));
  return (
    <HistoryLog
      title="Изменения выбранной версии"
      defaultExpanded
      dateLabel="Время сохранения"
      history={[
        {
          id: row?.revision_key || row?.history_id,
          created_at: revisionSavedAt(row),
          actor_name: row?.changed_by || "Неизвестно",
          diff_json: diff,
        },
      ]}
    />
  );
}
