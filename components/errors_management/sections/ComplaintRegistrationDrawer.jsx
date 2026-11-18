"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  JacoAlert,
  JacoButton,
  JacoResponsiveModalShell,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { ComplaintErrorEditor } from "./ComplaintErrorEditor";
import {
  classifierDraft,
  complaintErrorsPayload,
  newClientRequestId,
  validComplaintError,
} from "../complaintClassifier.mjs";
import { orderId, pointId } from "../errorsManagementViewModel.mjs";
import { fieldErrorsWithPrefix, requestErrorText, requestFieldErrors } from "../requestErrors.mjs";

export default function ComplaintRegistrationDrawer({
  selected,
  onClose,
  api,
  onSaved,
  cities,
  points,
  withLoading,
}) {
  const [context, setContext] = useState(null);
  const [errors, setErrors] = useState([]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const requestRef = useRef(0);
  const clientRequestIdRef = useRef(null);

  useEffect(() => {
    requestRef.current += 1;
    if (!selected) return;
    const requestId = requestRef.current;
    clientRequestIdRef.current = newClientRequestId();
    setConfirmClose(false);
    setSaving(false);
    setContext(null);
    setErrors([]);
    setComment("");
    setMessage("");
    setFieldErrors({});
    withLoading(() =>
      api.getRegistrationContext({ point_id: pointId(selected), order_id: orderId(selected) }),
    )
      .then((result) => {
        if (requestRef.current === requestId) setContext(result?.data ?? result);
      })
      .catch((error) => {
        if (requestRef.current === requestId) {
          setMessage(requestErrorText(error, "Не удалось загрузить данные заказа."));
        }
      });
  }, [api, selected, withLoading]);

  const changeStructure = (update) => {
    setFieldErrors({});
    setErrors(update);
  };
  const addError = (position) =>
    changeStructure((previous) => [
      ...previous,
      classifierDraft(context?.catalog || [], position.type, position.position_key),
    ]);
  const addOrderError = () =>
    changeStructure((previous) => [...previous, classifierDraft(context?.catalog || [], "order")]);
  const updateError = (index, next) =>
    setErrors((previous) => previous.map((item, itemIndex) => (itemIndex === index ? next : item)));
  const removeError = (index) =>
    changeStructure((previous) => previous.filter((_, itemIndex) => itemIndex !== index));

  const requestClose = () => {
    if (saving) return;
    if (errors.length > 0 || comment.trim()) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };
  const save = async () => {
    const requestId = requestRef.current;
    setMessage("");
    setFieldErrors({});
    setSaving(true);
    try {
      const response = await withLoading(() =>
        api.createComplaint({
          point_id: pointId(selected),
          order_id: orderId(selected),
          client_request_id: clientRequestIdRef.current,
          errors: complaintErrorsPayload(errors),
          common_comment: comment,
        }),
      );
      if (requestRef.current !== requestId) return;
      onSaved?.(response?.data ?? response);
      onClose();
    } catch (error) {
      if (requestRef.current !== requestId) return;
      setMessage(
        requestErrorText(
          error,
          "Не удалось зарегистрировать жалобу. Проверьте соединение и повторите попытку.",
        ),
      );
      setFieldErrors(requestFieldErrors(error));
    } finally {
      setSaving(false);
    }
  };
  const cafeContext = useMemo(() => {
    const point = points.find((item) => String(item.id) === String(context?.order?.point_id));
    const city = cities.find((item) => String(item.id) === String(context?.order?.city_id));
    return (
      [city?.name, point?.addr || point?.name].filter(Boolean).join(" · ") || "Кафе не определено"
    );
  }, [cities, context?.order?.city_id, context?.order?.point_id, points]);

  const canSave =
    errors.length > 0 &&
    errors.every((error) =>
      validComplaintError(
        error,
        context?.catalog || [],
        context?.positions || [],
        context?.stages || [],
      ),
    );
  const editorFor = (error, index, positionNumber) => (
    <ComplaintErrorEditor
      key={`${error.position_key || "order"}-${index}`}
      value={error}
      positions={context.positions || []}
      positionNumber={positionNumber}
      catalog={context.catalog || []}
      solutions={context.solutions || []}
      stages={context.stages || []}
      serverErrors={fieldErrorsWithPrefix(fieldErrors, `errors.${index}.`)}
      onChange={(next) => updateError(index, next)}
      onRemove={() => removeError(index)}
    />
  );
  const actions = !context ? null : confirmClose ? (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ width: "100%" }}
    >
      <JacoButton
        fullWidth
        tone="outlinePrimary"
        onClick={() => setConfirmClose(false)}
      >
        Продолжить
      </JacoButton>
      <JacoButton
        fullWidth
        onClick={onClose}
      >
        Закрыть без сохранения
      </JacoButton>
    </Stack>
  ) : (
    <JacoButton
      fullWidth
      loading={saving}
      disabled={!canSave}
      onClick={save}
    >
      Зарегистрировать жалобу
    </JacoButton>
  );

  return (
    <JacoResponsiveModalShell
      open={Boolean(selected)}
      onClose={requestClose}
      title="Регистрация жалобы"
      maxWidth="md"
      actions={actions}
      mobilePaperSx={{ height: "100vh", maxHeight: "100vh", borderRadius: 0 }}
      mobileContentSx={{ px: 2, py: 2.5 }}
      mobileActionsSx={{ px: 2, pt: 1.5, pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      <Stack spacing={2.5}>
        {!context && message ? <JacoAlert severity="error">{message}</JacoAlert> : null}
        {confirmClose ? (
          <JacoAlert severity="warning">Несохранённые ошибки и комментарий будут потеряны.</JacoAlert>
        ) : null}
        {context ? (
          <>
            <JacoSurface sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Заказ №{orderId(selected)}
              </Typography>
              <Typography
                fontWeight={700}
                mt={0.5}
              >
                Кафе: {cafeContext}
              </Typography>
            </JacoSurface>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Позиции заказа</Typography>
              {context.positions?.map((position, positionIndex) => (
                <Stack
                  key={position.position_key}
                  spacing={1.5}
                >
                  <JacoSurface sx={{ p: 1.5 }}>
                    <Stack
                      direction="row"
                      gap={1}
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Box>
                        <Typography fontWeight={600}>
                          Позиция №{positionIndex + 1}: {position.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {position.total_count} шт.
                        </Typography>
                      </Box>
                      <JacoButton
                        compact
                        tone="outlinePrimary"
                        startIcon={<AddIcon />}
                        onClick={() => addError(position)}
                      >
                        Ошибка
                      </JacoButton>
                    </Stack>
                  </JacoSurface>
                  {errors.map((error, index) =>
                    error.position_key === position.position_key
                      ? editorFor(error, index, positionIndex + 1)
                      : null,
                  )}
                </Stack>
              ))}
            </Stack>
            <Stack spacing={1.5}>
              <JacoButton
                tone="outlinePrimary"
                startIcon={<AddIcon />}
                onClick={addOrderError}
              >
                Добавить ошибку заказа
              </JacoButton>
              {errors.map((error, index) => (!error.position_key ? editorFor(error, index, 0) : null))}
            </Stack>
            {!canSave ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {errors.length === 0
                  ? "Добавьте ошибку блюда или заказа."
                  : "Для каждой ошибки выберите категорию, тип, ошибку и этап. Если требуется, укажите продукт из состава и количество."}
              </Typography>
            ) : null}
            <JacoTextInput
              fullWidth
              multiline
              minRows={3}
              label="Общий комментарий"
              value={comment}
              error={Boolean(fieldErrors.common_comment)}
              helperText={fieldErrors.common_comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {message ? <JacoAlert severity="error">{message}</JacoAlert> : null}
          </>
        ) : null}
      </Stack>
    </JacoResponsiveModalShell>
  );
}
