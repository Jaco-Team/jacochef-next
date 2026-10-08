"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  JacoButton,
  JacoResponsiveModalShell,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { ComplaintErrorEditor } from "./ComplaintErrorEditor";
import { classifierDraft, validComplaintError } from "../complaintClassifier.mjs";
import { orderId, pointId } from "../errorsManagementViewModel.mjs";

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
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setConfirmClose(false);
    setSaving(false);
    setContext(null);
    setErrors([]);
    setComment("");
    setMessage("");
    withLoading(() =>
      api.getRegistrationContext({ point_id: pointId(selected), order_id: orderId(selected) }),
    )
      .then((result) => setContext(result?.data ?? result))
      .catch(() => setMessage("Не удалось загрузить данные заказа."));
  }, [api, selected, withLoading]);

  const addError = (position) => {
    setErrors((previous) => [
      ...previous,
      classifierDraft(context?.catalog || [], position.type, position.position_key),
    ]);
  };
  const addOrderError = () => {
    setErrors((previous) => [...previous, classifierDraft(context?.catalog || [], "order")]);
  };
  const requestClose = () => {
    if (saving) return;
    if (errors.length > 0 || comment.trim()) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };
  const save = async () => {
    setMessage("");
    setSaving(true);
    try {
      await withLoading(() =>
        api.createComplaint(
          {
            point_id: pointId(selected),
            order_id: orderId(selected),
            errors,
            common_comment: comment,
          },
          { throwErrors: true, suppressAuthRedirect: true },
        ),
      );
      onSaved();
      onClose();
    } catch {
      setMessage("Не удалось зарегистрировать жалобу. Проверьте обязательные поля.");
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
      disabled={!canSave}
      onClick={save}
    >
      Зарегистрировать жалобу
    </JacoButton>
  );

  return (
    <>
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
          {message ? <Alert severity="error">{message}</Alert> : null}
          {confirmClose ? (
            <Alert severity="warning">Несохранённые ошибки и комментарий будут потеряны.</Alert>
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
                      error.position_key === position.position_key ? (
                        <ComplaintErrorEditor
                          key={`${error.position_key}-${index}`}
                          value={error}
                          positions={context.positions || []}
                          positionNumber={positionIndex + 1}
                          catalog={context.catalog || []}
                          solutions={context.solutions || []}
                          stages={context.stages || []}
                          onChange={(next) =>
                            setErrors((previous) =>
                              previous.map((item, itemIndex) =>
                                itemIndex === index ? next : item,
                              ),
                            )
                          }
                          onRemove={() =>
                            setErrors((previous) =>
                              previous.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                        />
                      ) : null,
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
                {errors.map((error, index) =>
                  !error.position_key ? (
                    <ComplaintErrorEditor
                      key={`order-${index}`}
                      value={error}
                      positions={context.positions || []}
                      positionNumber={0}
                      catalog={context.catalog || []}
                      solutions={context.solutions || []}
                      stages={context.stages || []}
                      onChange={(next) =>
                        setErrors((previous) =>
                          previous.map((item, itemIndex) => (itemIndex === index ? next : item)),
                        )
                      }
                      onRemove={() =>
                        setErrors((previous) =>
                          previous.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  ) : null,
                )}
              </Stack>
              {!canSave ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {errors.length === 0
                    ? "Добавьте ошибку блюда или заказа."
                    : "Для каждой ошибки выберите категорию, тип, ошибку и этап. Если требуется, укажите продукт из состава."}
                </Typography>
              ) : null}
              <JacoTextInput
                fullWidth
                multiline
                minRows={3}
                label="Общий комментарий"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </>
          ) : null}
        </Stack>
      </JacoResponsiveModalShell>
    </>
  );
}
