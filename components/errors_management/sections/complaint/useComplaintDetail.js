"use client";

import { useEffect, useMemo, useState } from "react";

export default function useComplaintDetail({
  complaint,
  api,
  cities,
  points,
  onChanged,
  withLoading,
}) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [pendingCommand, setPendingCommand] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [resolutions, setResolutions] = useState([]);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!complaint) return;
    setDetail(null);
    setError("");
    setPendingCommand(null);
    setResolutions([]);
    setPromoCode("");
    withLoading(() =>
      api.getComplaint({ complaint_id: complaint.id, point_id: complaint.point_id }),
    )
      .then((response) => setDetail(response?.data ?? response ?? null))
      .catch(() => setError("Не удалось загрузить жалобу."));
  }, [api, complaint, withLoading]);

  useEffect(() => {
    setResolutions(
      (detail?.errors || []).map((item) => ({
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
    (resolutions.length === (detail?.errors || []).length &&
      resolutions.every((item) => Boolean(item.solution_id)));
  const cafeContext = useMemo(() => {
    const point = points.find((item) => String(item.id) === String(detail?.point_id));
    const city = cities.find((item) => String(item.id) === String(detail?.city_id));
    return (
      [city?.name, point?.addr || point?.name].filter(Boolean).join(" · ") ||
      "указанное в заказе кафе"
    );
  }, [cities, detail?.city_id, detail?.point_id, points]);

  const executeTransition = async () => {
    if (!pendingCommand || !detail) return;
    setTransitioning(true);
    setError("");
    try {
      const response = await withLoading(() =>
        api.transitionComplaint(
          {
            complaint_id: detail.id,
            point_id: detail.point_id,
            lock_version: detail.lock_version,
            command: pendingCommand,
            ...(pendingCommand === "resolve"
              ? { resolution_errors: resolutions, resolution_promo_code: promoCode }
              : {}),
          },
          { throwErrors: true, suppressAuthRedirect: true },
        ),
      );
      setDetail(response?.data ?? response ?? null);
      setPendingCommand(null);
      onChanged?.();
    } catch {
      setError("Не удалось изменить статус жалобы. Обновите детали и повторите действие.");
    } finally {
      setTransitioning(false);
    }
  };

  return {
    detail,
    error,
    pendingCommand,
    setPendingCommand,
    transitioning,
    resolutions,
    setResolutions,
    promoCode,
    setPromoCode,
    solutions,
    canResolve,
    cafeContext,
    executeTransition,
  };
}
