"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allowedCommands, isRemovedError } from "../../errorsManagementPermissions.mjs";
import { requestErrorText, requestFieldErrors } from "../../requestErrors.mjs";

const NO_ERROR = { text: "", fields: {} };

function payloadOf(response) {
  return response?.data ?? response ?? null;
}

export default function useComplaintDetail({
  complaint,
  api,
  cities,
  points,
  permissions,
  onChanged,
  withLoading,
}) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [pendingCommand, setPendingCommandState] = useState(null);
  const [commandError, setCommandError] = useState(NO_ERROR);
  const [transitioning, setTransitioning] = useState(false);
  const [resolutions, setResolutions] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [removal, setRemoval] = useState(null);
  const requestRef = useRef(0);

  const load = useCallback(() => {
    requestRef.current += 1;
    const requestId = requestRef.current;
    if (!complaint) return;
    setError("");
    withLoading(() =>
      api.getComplaint({ complaint_id: complaint.id, point_id: complaint.point_id }),
    )
      .then((response) => {
        if (requestRef.current === requestId) setDetail(payloadOf(response));
      })
      .catch((loadError) => {
        if (requestRef.current === requestId) {
          setError(requestErrorText(loadError, "Не удалось загрузить жалобу."));
        }
      });
  }, [api, complaint, withLoading]);

  useEffect(() => {
    setDetail(null);
    setError("");
    setPendingCommandState(null);
    setCommandError(NO_ERROR);
    setRemoval(null);
    setResolutions([]);
    setPromoCode("");
    load();
  }, [load]);

  const activeErrors = useMemo(
    () => (detail?.errors || []).filter((item) => !isRemovedError(item)),
    [detail?.errors],
  );

  useEffect(() => {
    setResolutions(
      activeErrors.map((item) => ({
        id: item.id,
        solution_id: item.solution_id ? String(item.solution_id) : "",
        changed_amount: item.changed_amount ?? "",
      })),
    );
  }, [detail?.id, detail?.lock_version]);

  useEffect(
    () => setPromoCode(detail?.resolution_promo_code || ""),
    [detail?.id, detail?.lock_version, detail?.resolution_promo_code],
  );

  const solutions = detail?.resolution_solutions || [];
  const canResolve =
    solutions.length === 0 ||
    (resolutions.length === activeErrors.length &&
      resolutions.every((item) => Boolean(item.solution_id)));
  const commands = useMemo(() => allowedCommands(detail, permissions), [detail, permissions]);
  const cafeContext = useMemo(() => {
    const point = points.find((item) => String(item.id) === String(detail?.point_id));
    const city = cities.find((item) => String(item.id) === String(detail?.city_id));
    return (
      [city?.name, point?.addr || point?.name].filter(Boolean).join(" · ") ||
      "указанное в заказе кафе"
    );
  }, [cities, detail?.city_id, detail?.point_id, points]);

  const setPendingCommand = (command) => {
    setCommandError(NO_ERROR);
    setPendingCommandState(command);
  };

  const executeTransition = async () => {
    if (!pendingCommand || !detail) return;
    const command = pendingCommand;
    setTransitioning(true);
    setCommandError(NO_ERROR);
    try {
      const response = await withLoading(() =>
        api.transitionComplaint({
          complaint_id: detail.id,
          point_id: detail.point_id,
          lock_version: detail.lock_version,
          command,
          ...(command === "resolve"
            ? { resolution_errors: resolutions, resolution_promo_code: promoCode }
            : {}),
        }),
      );
      setDetail(payloadOf(response));
      setPendingCommandState(null);
      onChanged?.();
    } catch (transitionError) {
      setCommandError({
        text: requestErrorText(
          transitionError,
          "Не удалось изменить статус жалобы. Обновите детали и повторите действие.",
        ),
        fields: requestFieldErrors(transitionError),
      });
    } finally {
      setTransitioning(false);
    }
  };

  const openRemoval = (item) =>
    setRemoval({ error: item, comment: "", text: "", fields: {}, saving: false });
  const changeRemovalComment = (comment) =>
    setRemoval((current) => (current ? { ...current, comment } : current));
  const closeRemoval = () => setRemoval((current) => (current?.saving ? current : null));
  const confirmRemoval = async () => {
    if (!removal || !detail) return;
    const target = removal;
    setRemoval({ ...target, saving: true, text: "", fields: {} });
    try {
      const response = await withLoading(() =>
        api.removeComplaintError({
          complaint_id: detail.id,
          point_id: detail.point_id,
          lock_version: detail.lock_version,
          error_id: target.error.id,
          comment: target.comment.trim(),
        }),
      );
      setDetail(payloadOf(response));
      setRemoval(null);
      onChanged?.();
    } catch (removeError) {
      setRemoval((current) =>
        current
          ? {
              ...current,
              saving: false,
              text: requestErrorText(removeError, "Не удалось снять ошибку."),
              fields: requestFieldErrors(removeError),
            }
          : current,
      );
    }
  };

  return {
    detail,
    error,
    reload: load,
    commands,
    pendingCommand,
    setPendingCommand,
    commandError,
    transitioning,
    activeErrors,
    resolutions,
    setResolutions,
    promoCode,
    setPromoCode,
    solutions,
    canResolve,
    cafeContext,
    executeTransition,
    removal,
    openRemoval,
    changeRemovalComment,
    closeRemoval,
    confirmRemoval,
  };
}
