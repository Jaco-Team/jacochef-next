import { useEffect, useRef, useState } from "react";
import { Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoResponsiveModalShell,
  JacoTextInput,
} from "@/design-system/shared/ui";
import HistoryLog from "@/ui/history/HistoryLog";
import { ACCOUNTING_CORRECTION_NOTICE, isIncomeCorrectionPreview } from "./incomeCorrection.mjs";

export default function IncomeCorrectionDialog({ context, canAdd, getData, onClose, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const generation = useRef(0);
  const submitLock = useRef(false);

  useEffect(() => {
    const request = ++generation.current;
    setPreview(null);
    setError("");
    setComment("");
    setSubmitting(false);
    submitLock.current = false;
    setLoading(Boolean(context && canAdd));
    if (!context || !canAdd) return;

    getData("preview_online_income_correction", context)
      .then((response) => {
        if (request !== generation.current) return;
        if (!response?.st || !isIncomeCorrectionPreview(response.preview, context)) {
          setError(response?.text || "Не удалось получить актуальные данные учётной коррекции");
          return;
        }
        setPreview(response.preview);
      })
      .catch(() => {
        if (request === generation.current)
          setError("Не удалось загрузить данные. Попробуйте снова.");
      })
      .finally(() => {
        if (request === generation.current) setLoading(false);
      });

    return () => {
      generation.current += 1;
    };
  }, [context, canAdd, getData]);

  const close = () => {
    if (!submitLock.current) onClose();
  };

  const submit = async () => {
    if (submitLock.current || loading || !canAdd || !isIncomeCorrectionPreview(preview, context))
      return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    const request = generation.current;
    try {
      const response = await getData("add_online_income_correction", {
        ...context,
        version: preview.version,
        confirmed: true,
        comment,
      });
      if (request !== generation.current) return;
      if (!response?.st || response.accounting_only !== true) {
        setPreview(null);
        setError(
          response?.text || "Запись не подтверждена. Закройте окно и проверьте данные повторно.",
        );
        return;
      }
      await onSuccess(response);
    } catch {
      if (request === generation.current) {
        setPreview(null);
        setError(
          "Не удалось подтвердить сохранение. Закройте окно и обновите проверку перед повторной попыткой.",
        );
      }
    } finally {
      if (request === generation.current) {
        submitLock.current = false;
        setSubmitting(false);
      }
    }
  };

  if (!context || !canAdd) return null;
  const validPreview = isIncomeCorrectionPreview(preview, context);

  return (
    <JacoResponsiveModalShell
      open={Boolean(context && canAdd)}
      onClose={close}
      title="Учётная коррекция прихода"
      maxWidth="sm"
      actions={
        <>
          <JacoButton
            tone="secondary"
            compact
            disabled={submitting}
            onClick={close}
          >
            Отмена
          </JacoButton>
          <JacoButton
            compact
            loading={submitting}
            disabled={loading || !validPreview}
            onClick={submit}
          >
            Добавить запись
          </JacoButton>
        </>
      }
    >
      <Stack spacing={2}>
        <JacoAlert severity="warning">{ACCOUNTING_CORRECTION_NOTICE}</JacoAlert>
        {loading && <Typography>Проверяем заказ и существующие записи…</Typography>}
        {error && <JacoAlert severity="error">{error}</JacoAlert>}
        {validPreview && (
          <>
            <Stack spacing={0.5}>
              <Typography>Заказ: {preview.order_id}</Typography>
              <Typography>Кафе: {context.point.name}</Typography>
              <Typography>Дата заказа: {preview.order_date}</Typography>
              <Typography>
                Сумма:{" "}
                {new Intl.NumberFormat("ru-RU", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(preview.amount)}{" "}
                ₽
              </Typography>
              <Typography>
                Касса: {preview.kassa} · Смена: {preview.smena}
              </Typography>
            </Stack>
            <JacoTextInput
              label="Комментарий (необязательно)"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={submitting}
              multiline
              minRows={2}
            />
            <HistoryLog
              history={preview.history ?? []}
              title="История учётных коррекций заказа"
            />
          </>
        )}
      </Stack>
    </JacoResponsiveModalShell>
  );
}
