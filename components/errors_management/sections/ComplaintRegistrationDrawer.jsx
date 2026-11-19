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
  acceptPhotoFiles,
  buildLeaves,
  newClientRequestId,
  treeErrorDraft,
  treeErrorIssues,
  treeErrorPayload,
} from "../complaintTree.mjs";
import { orderId, pointId } from "../errorsManagementViewModel.mjs";
import { fieldErrorsWithPrefix, requestErrorText, requestFieldErrors } from "../requestErrors.mjs";

const ISSUE_HINTS = {
  leaf: "выберите вариант ошибки до конца дерева",
  stage: "выберите этап",
  solution: "выберите решение из списка",
  quantity: "укажите количество",
  photos_pending: "дождитесь загрузки фото",
  photos_limit: "оставьте не больше 5 фото",
  photos_required: "добавьте фото",
};

let photoCounter = 0;

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
  const previewUrlsRef = useRef(new Set());

  const revokePreviews = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  };

  useEffect(() => () => revokePreviews(), []);

  useEffect(() => {
    requestRef.current += 1;
    if (!selected) return;
    const requestId = requestRef.current;
    revokePreviews();
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

  const leaves = useMemo(() => buildLeaves(context?.tree), [context?.tree]);
  const positions = useMemo(() => context?.positions || [], [context?.positions]);
  const stages = context?.stages || [];
  const solutions = context?.solutions || [];

  const changeStructure = (update) => {
    setFieldErrors({});
    setErrors(update);
  };
  const updateError = (uid, update) =>
    setErrors((previous) =>
      previous.map((item) => (item.uid === uid ? update(item) : item)),
    );
  const addError = (position) =>
    changeStructure((previous) => [...previous, treeErrorDraft(leaves, position.type, position)]);
  const addOrderError = () =>
    changeStructure((previous) => [...previous, treeErrorDraft(leaves, "order", null)]);
  const removeError = (uid) =>
    changeStructure((previous) => {
      previous
        .find((item) => item.uid === uid)
        ?.photos?.forEach((photo) => {
          if (photo.previewUrl) {
            URL.revokeObjectURL(photo.previewUrl);
            previewUrlsRef.current.delete(photo.previewUrl);
          }
        });
      return previous.filter((item) => item.uid !== uid);
    });

  const uploadPhoto = async (uid, entry, file, requestId) => {
    try {
      const response = await api.uploadPhoto(file, { point_id: pointId(selected) });
      const photo = response?.photo;
      if (requestRef.current !== requestId) return;
      if (!photo?.id) throw new Error("photo");
      updateError(uid, (item) => ({
        ...item,
        photos: item.photos.map((current) =>
          current.key === entry.key
            ? { ...current, status: "done", id: Number(photo.id), url: photo.url || "" }
            : current,
        ),
      }));
    } catch (error) {
      if (requestRef.current !== requestId) return;
      const fields = requestFieldErrors(error);
      const text = fields.file || requestErrorText(error, "Не удалось загрузить фото.");
      updateError(uid, (item) => ({
        ...item,
        photos: item.photos.map((current) =>
          current.key === entry.key ? { ...current, status: "error", error: text } : current,
        ),
      }));
    }
  };

  const addPhotos = (uid, files) => {
    const draft = errors.find((item) => item.uid === uid);
    if (!draft) return;
    const activeCount = (draft.photos || []).filter((photo) => photo.status !== "error").length;
    const { accepted, rejected } = acceptPhotoFiles(files, activeCount);
    const entries = accepted.map((file) => {
      photoCounter += 1;
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return { key: `photo-${photoCounter}`, name: file.name, previewUrl, status: "uploading" };
    });
    const rejectedEntries = rejected.map(({ file, error }) => {
      photoCounter += 1;
      return { key: `photo-${photoCounter}`, name: file?.name, status: "error", error };
    });
    updateError(uid, (item) => ({
      ...item,
      photos: [...(item.photos || []), ...entries, ...rejectedEntries],
    }));
    const requestId = requestRef.current;
    entries.forEach((entry, index) => uploadPhoto(uid, entry, accepted[index], requestId));
  };

  const removePhoto = (uid, key) =>
    updateError(uid, (item) => {
      const photo = item.photos.find((current) => current.key === key);
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
        previewUrlsRef.current.delete(photo.previewUrl);
      }
      return { ...item, photos: item.photos.filter((current) => current.key !== key) };
    });

  const requestClose = () => {
    if (saving) return;
    if (errors.length > 0 || comment.trim()) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };
  const issues = errors.map((error) => treeErrorIssues(error, { leaves, positions }));
  const canSave = errors.length > 0 && issues.every((list) => list.length === 0);
  const firstIssues = issues.find((list) => list.length) || [];
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
          errors: errors.map((error) => treeErrorPayload(error, leaves, positions)),
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

  const editorFor = (error, index, position, positionNumber) => (
    <ComplaintErrorEditor
      key={error.uid}
      value={error}
      position={position}
      positionNumber={positionNumber}
      leaves={leaves}
      solutions={solutions}
      stages={stages}
      serverErrors={fieldErrorsWithPrefix(fieldErrors, `errors.${index}.`)}
      onChange={(next) => updateError(error.uid, () => next)}
      onRemove={() => removeError(error.uid)}
      onAddPhotos={(files) => addPhotos(error.uid, files)}
      onRemovePhoto={(key) => removePhoto(error.uid, key)}
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
              {positions.map((position, positionIndex) => (
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
                      ? editorFor(error, index, position, positionIndex + 1)
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
              {errors.map((error, index) =>
                !error.position_key ? editorFor(error, index, null, 0) : null,
              )}
            </Stack>
            {!canSave ? (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {errors.length === 0
                  ? "Добавьте ошибку позиции или заказа."
                  : `Чтобы зарегистрировать жалобу: ${firstIssues
                      .map((issue) => ISSUE_HINTS[issue])
                      .filter(Boolean)
                      .join(", ")}.`}
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
