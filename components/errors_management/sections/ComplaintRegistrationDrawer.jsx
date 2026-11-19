"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoResponsiveModalShell,
  JacoStatusChip,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { ComplaintErrorEditor } from "./ComplaintErrorEditor";
import {
  acceptPhotoFiles,
  buildLeaves,
  errorsCountLabel,
  newClientRequestId,
  positionSiteCategory,
  treeErrorDraft,
  treeErrorIssues,
  treeErrorPayload,
} from "../complaintTree.mjs";
import { ORDER_TYPE_OPTIONS } from "../constants";
import { moveFocusInto } from "../focusModel.mjs";
import { orderId, pointId } from "../errorsManagementViewModel.mjs";
import { fieldErrorsWithPrefix, requestErrorText, requestFieldErrors } from "../requestErrors.mjs";

function positionCaption(position, siteCategories) {
  if (position.type === "delivery") return "Доставка заказа";
  const categoryId = positionSiteCategory(position);
  const category = siteCategories.find((item) => Number(item.id) === categoryId);
  return category?.name || (position.type === "extra" ? "Допы" : "Блюдо");
}

function PositionRow({ title, caption, count, addLabel, onAdd, children }) {
  return (
    <JacoSurface sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
              useFlexGap
            >
              <Typography>{title}</Typography>
              {count > 1 ? (
                <JacoStatusChip
                  label={`× ${count}`}
                  tone="neutral"
                  variant="soft"
                />
              ) : null}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {caption}
            </Typography>
          </Box>
          <JacoButton
            compact
            tone="outlinePrimary"
            onClick={onAdd}
            sx={{ flexShrink: 0 }}
          >
            {addLabel}
          </JacoButton>
        </Stack>
        {children}
      </Stack>
    </JacoSurface>
  );
}

let photoCounter = 0;

export default function ComplaintRegistrationDrawer({
  selected,
  onClose,
  api,
  onSaved,
  cities,
  points,
  siteCategories = [],
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
  const contentRef = useRef(null);

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

  useEffect(() => {
    if (!selected) return undefined;
    const frame = window.requestAnimationFrame(() => moveFocusInto(contentRef.current));
    return () => window.cancelAnimationFrame(frame);
  }, [context, selected]);

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
    changeStructure((previous) => [
      ...previous,
      { ...treeErrorDraft(position.type, position), auto_open: true },
    ]);
  const addOrderError = () =>
    changeStructure((previous) => [...previous, { ...treeErrorDraft("order", null), auto_open: true }]);
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

  const orderType = ORDER_TYPE_OPTIONS.find(
    (option) => String(option.id) === String(context?.order?.type_order),
  )?.name;
  const editorFor = (error, index, position) => (
    <ComplaintErrorEditor
      key={error.uid}
      value={error}
      position={position}
      issues={issues[index] || []}
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
      {errors.length
        ? `Зарегистрировать жалобу · ${errorsCountLabel(errors.length)}`
        : "Добавьте ошибку к позиции или заказу"}
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
      <Stack
        ref={contentRef}
        tabIndex={-1}
        aria-label="Регистрация жалобы"
        spacing={2.5}
        sx={{ outline: "none" }}
      >
        {!context && message ? <JacoAlert severity="error">{message}</JacoAlert> : null}
        {confirmClose ? (
          <JacoAlert severity="warning">Несохранённые ошибки и комментарий будут потеряны.</JacoAlert>
        ) : null}
        {context ? (
          <>
            <JacoSurface
              variant="outlined"
              sx={{ px: 2, py: 1.5 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {[`Заказ №${orderId(selected)}`, `Кафе: ${cafeContext}`, orderType]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </JacoSurface>
            <Typography fontWeight={500}>Позиции заказа</Typography>
            <Stack spacing={1.5}>
              {positions.map((position) => (
                <PositionRow
                  key={position.position_key}
                  title={position.name || position.position_name || "Позиция"}
                  caption={positionCaption(position, siteCategories)}
                  count={Number(position.total_count) || 1}
                  addLabel="+ Ошибка"
                  onAdd={() => addError(position)}
                >
                  {errors.map((error, index) =>
                    error.position_key === position.position_key
                      ? editorFor(error, index, position)
                      : null,
                  )}
                </PositionRow>
              ))}
              <PositionRow
                title="Весь заказ"
                caption="Ошибка без позиции: ожидание, общение, термосумка"
                count={1}
                addLabel="+ Ошибка заказа"
                onAdd={addOrderError}
              >
                {errors.map((error, index) =>
                  !error.position_key ? editorFor(error, index, null) : null,
                )}
              </PositionRow>
            </Stack>
            <JacoTextInput
              fullWidth
              multiline
              minRows={3}
              label="Общий комментарий к жалобе"
              placeholder="Что сказал клиент"
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
