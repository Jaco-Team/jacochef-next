import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import useMyAlert from "@/src/hooks/useMyAlert";
import {
  buildFilterPayload,
  getDefaultFilters,
  normalizeBootstrap,
  normalizeDashboard,
  normalizeIncidentDetail,
  normalizeList,
  normalizeReview,
  normalizeReviewDetail,
  normalizeIncident,
} from "./cafeReviewsNormalizers";
import useCafeReviewsApi from "./useCafeReviewsApi";

const DEFAULT_PAGE_SIZE = 20;

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.data?.text ||
    error?.response?.data?.text ||
    error?.data?.data?.text ||
    error?.data?.text ||
    error?.text ||
    error?.message ||
    fallback
  );
}

function ensureSuccess(response, fallback) {
  if (response == null) {
    throw new Error(fallback);
  }
  if (response?.st === false) {
    throw new Error(response?.text || fallback);
  }
  return response;
}

function isConflict(error) {
  return Number(error?.response?.status ?? error?.status) === 409;
}

function getInitialSection(access) {
  const { userCan } = handleUserAccess(access);
  if (userCan("view", "reviews")) return "overview";
  if (userCan("view", "incidents")) return "incidents";
  if (userCan("view", "links")) return "links";
  return null;
}

export default function useCafeReviewsPage() {
  const api = useCafeReviewsApi();
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const showAlertRef = useRef(showAlert);
  showAlertRef.current = showAlert;
  const listRequestRef = useRef(0);
  const detailRequestRef = useRef(0);
  const dashboardRequestRef = useRef(0);
  const bootstrapRequestRef = useRef(0);

  const [section, setSection] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState("");
  const [contentError, setContentError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [moduleInfo, setModuleInfo] = useState({});
  const [access, setAccess] = useState({});
  const [points, setPoints] = useState([]);
  const [cities, setCities] = useState([]);
  const [dictionaries, setDictionaries] = useState({
    statuses: [],
    review_statuses: [],
    incident_statuses: [],
    severities: [],
    issues: [],
  });
  const [draftFilters, setDraftFilters] = useState(() => getDefaultFilters("reviews"));
  const [filters, setFilters] = useState(() => getDefaultFilters("reviews"));
  const [dashboard, setDashboard] = useState(() => normalizeDashboard({}));
  const [reviews, setReviews] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: DEFAULT_PAGE_SIZE,
    total: 0,
    total_pages: 1,
  });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const accessApi = useMemo(() => handleUserAccess(access), [access]);
  const canView = useCallback((key) => accessApi.userCan("view", key), [accessApi]);
  const canEdit = useCallback((key) => accessApi.userCan("edit", key), [accessApi]);
  const canAccess = useCallback((key) => accessApi.userCan("access", key), [accessApi]);
  const changeSection = useCallback((nextSection) => {
    const nextFilters = getDefaultFilters(nextSection === "incidents" ? "incidents" : "reviews");
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
    setPagination((current) => ({ ...current, page: 1 }));
    setSection(nextSection);
  }, []);

  const loadBootstrap = useCallback(async () => {
    const requestId = ++bootstrapRequestRef.current;
    setBootstrapLoading(true);
    setBootstrapReady(false);
    setBootstrapError("");
    try {
      const response = ensureSuccess(await api.getBootstrap(), "Не удалось загрузить модуль");
      if (requestId !== bootstrapRequestRef.current) return null;
      const normalized = normalizeBootstrap(response);
      const initialSection = getInitialSection(normalized.access);
      setModuleInfo(normalized.module_info);
      setAccess(normalized.access);
      setPoints(normalized.points);
      setCities(normalized.cities);
      setDictionaries(normalized.dictionaries);
      changeSection(initialSection);
      setBootstrapReady(true);
      return normalized;
    } catch (error) {
      if (requestId !== bootstrapRequestRef.current) return null;
      const message = getErrorMessage(error, "Не удалось загрузить модуль");
      setBootstrapError(message);
      showAlertRef.current(message);
      return null;
    } finally {
      if (requestId === bootstrapRequestRef.current) setBootstrapLoading(false);
    }
  }, [api, changeSection]);

  useEffect(() => {
    loadBootstrap();
    return () => {
      bootstrapRequestRef.current += 1;
      dashboardRequestRef.current += 1;
      listRequestRef.current += 1;
      detailRequestRef.current += 1;
    };
  }, [loadBootstrap]);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!canView("reviews")) return null;
      const requestId = ++dashboardRequestRef.current;
      if (!silent) setContentLoading(true);
      if (!silent) setContentError("");
      try {
        const response = ensureSuccess(
          await api.getDashboard(buildFilterPayload(filters, "overview")),
          "Не удалось загрузить обзор",
        );
        if (requestId !== dashboardRequestRef.current) return null;
        const normalized = normalizeDashboard(response);
        setDashboard(normalized);
        return normalized;
      } catch (error) {
        if (requestId !== dashboardRequestRef.current) return null;
        const message = getErrorMessage(error, "Не удалось загрузить обзор");
        if (!silent) setContentError(message);
        showAlertRef.current(message);
        return null;
      } finally {
        if (!silent && requestId === dashboardRequestRef.current) setContentLoading(false);
      }
    },
    [api, canView, filters],
  );

  const loadList = useCallback(
    async ({ page = 1, silent = false } = {}) => {
      const requestSection = section;
      const isIncidents = requestSection === "incidents";
      const accessKey = isIncidents ? "incidents" : "reviews";
      if (!requestSection || !canView(accessKey)) return null;
      const requestId = ++listRequestRef.current;
      if (!silent) setContentLoading(true);
      if (!silent) setContentError("");

      try {
        const payload = {
          ...buildFilterPayload(filters, requestSection),
          page,
          per_page: pagination.per_page || DEFAULT_PAGE_SIZE,
        };
        const response = ensureSuccess(
          isIncidents ? await api.getIncidents(payload) : await api.getReviews(payload),
          isIncidents ? "Не удалось загрузить инциденты" : "Не удалось загрузить отзывы",
        );

        if (requestId !== listRequestRef.current) return null;

        const normalized = isIncidents
          ? normalizeList(response, "incidents", normalizeIncident)
          : normalizeList(response, "reviews", normalizeReview);

        if (isIncidents) {
          setIncidents(normalized.items);
        } else {
          setReviews(normalized.items);
        }
        setPagination(normalized.pagination);
        return normalized;
      } catch (error) {
        if (requestId === listRequestRef.current) {
          showAlertRef.current(
            getErrorMessage(
              error,
              isIncidents ? "Не удалось загрузить инциденты" : "Не удалось загрузить отзывы",
            ),
          );
          if (!silent) {
            setContentError(
              getErrorMessage(
                error,
                isIncidents ? "Не удалось загрузить инциденты" : "Не удалось загрузить отзывы",
              ),
            );
          }
        }
        return null;
      } finally {
        if (!silent && requestId === listRequestRef.current) setContentLoading(false);
      }
    },
    [api, canView, filters, pagination.per_page, section],
  );

  const loadLinks = useCallback(
    async ({ silent = false } = {}) => {
      if (!canView("links")) return null;
      const requestId = ++listRequestRef.current;
      if (!silent) setContentLoading(true);
      if (!silent) setContentError("");

      try {
        const response = ensureSuccess(
          await api.getLinks({ active: true }),
          "Не удалось загрузить QR-ссылки",
        );
        if (requestId !== listRequestRef.current) return null;
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.links)
            ? response.links
            : Array.isArray(response?.items)
              ? response.items
              : [];
        setLinks(items);
        return items;
      } catch (error) {
        if (requestId === listRequestRef.current) {
          const message = getErrorMessage(error, "Не удалось загрузить QR-ссылки");
          if (!silent) setContentError(message);
          showAlertRef.current(message);
        }
        return null;
      } finally {
        if (!silent && requestId === listRequestRef.current) setContentLoading(false);
      }
    },
    [api, canView],
  );

  useEffect(() => {
    if (!bootstrapReady || !section) return;
    dashboardRequestRef.current += 1;
    listRequestRef.current += 1;
    detailRequestRef.current += 1;
    setSelected(null);
    setDetail(null);
    setDetailError("");
    setDetailOpen(false);
    setPagination((current) => ({ ...current, page: 1 }));

    if (section === "overview" && canView("reviews")) {
      loadDashboard();
    } else if (section === "reviews" && canView("reviews")) {
      loadList({ page: 1 });
    } else if (section === "incidents" && canView("incidents")) {
      loadList({ page: 1 });
    } else if (section === "links" && canView("links")) {
      loadLinks();
    }
  }, [bootstrapReady, canView, filters, loadDashboard, loadLinks, loadList, section]);

  const loadDetail = useCallback(
    async (target, { silent = false } = {}) => {
      if (!target?.id) return null;
      const accessKey = target.kind === "incident" ? "incidents" : "reviews";
      if (!canView(accessKey)) return null;
      const requestId = ++detailRequestRef.current;
      if (!silent) setDetailLoading(true);
      setDetailError("");

      try {
        const response = ensureSuccess(
          target.kind === "incident"
            ? await api.getIncident(target.id)
            : await api.getReview(target.id),
          "Не удалось загрузить детали",
        );
        if (requestId !== detailRequestRef.current) return null;

        const normalized =
          target.kind === "incident"
            ? normalizeIncidentDetail(response)
            : normalizeReviewDetail(response);
        setDetail(normalized);
        return normalized;
      } catch (error) {
        if (requestId === detailRequestRef.current) {
          const message = getErrorMessage(error, "Не удалось загрузить детали");
          setDetailError(message);
          showAlertRef.current(message);
        }
        return null;
      } finally {
        if (!silent && requestId === detailRequestRef.current) setDetailLoading(false);
      }
    },
    [api, canView],
  );

  const openDetail = useCallback(
    (kind, id) => {
      const target = { kind, id };
      setSelected(target);
      setDetail(null);
      setDetailOpen(true);
      loadDetail(target);
    },
    [loadDetail],
  );

  const closeDetail = useCallback(() => {
    detailRequestRef.current += 1;
    setDetailOpen(false);
    setDetailLoading(false);
  }, []);

  const activeDraftFilters = useMemo(
    () => ({
      ...draftFilters,
      status: section === "incidents" ? draftFilters.incident_status : draftFilters.review_status,
    }),
    [draftFilters, section],
  );

  const applyFilters = useCallback(() => {
    setFilters({
      ...draftFilters,
      point_ids: (draftFilters.point_ids || []).filter((pointId) =>
        points.some((point) => String(point.id) === String(pointId)),
      ),
    });
    setFiltersOpen(false);
  }, [draftFilters, points]);

  const resetFilters = useCallback(() => {
    const defaults = getDefaultFilters(section === "incidents" ? "incidents" : "reviews");
    setDraftFilters(defaults);
    setFilters(defaults);
    setFiltersOpen(false);
  }, [section]);

  const updateDraftFilter = useCallback(
    (key, value) => {
      setDraftFilters((current) => {
        const targetKey =
          key === "status" ? (section === "incidents" ? "incident_status" : "review_status") : key;
        const next = { ...current, [targetKey]: value };
        if (key === "city_id") {
          next.point_id = "";
          next.point_ids = [];
        }
        return next;
      });
    },
    [section],
  );

  const updateSort = useCallback((sort) => {
    setFilters((current) => {
      const direction = current.sort === sort && current.direction === "desc" ? "asc" : "desc";
      return { ...current, sort, direction };
    });
    setDraftFilters((current) => {
      const direction = current.sort === sort && current.direction === "desc" ? "asc" : "desc";
      return { ...current, sort, direction };
    });
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const refreshAfterMutation = useCallback(
    async (incidentId) => {
      const target = { kind: "incident", id: incidentId };
      const requests = [];
      if (canView("incidents")) {
        requests.push(loadDetail(target, { silent: true }));
      }
      if (canView("reviews")) {
        requests.push(loadDashboard({ silent: true }));
      }
      if (
        (section === "incidents" && canView("incidents")) ||
        (section === "reviews" && canView("reviews"))
      ) {
        requests.push(loadList({ page: pagination.page, silent: true }));
      }
      await Promise.all(requests);
    },
    [canView, loadDashboard, loadDetail, loadList, pagination.page, section],
  );

  const updateIncident = useCallback(
    async (payload, attachment = null) => {
      if (!canEdit("incidents")) return false;
      setMutationLoading(true);
      try {
        const response = ensureSuccess(
          await api.updateIncident(payload, attachment),
          "Не удалось обновить инцидент",
        );
        await refreshAfterMutation(payload.id);
        showAlertRef.current(response?.text || "Инцидент обновлён", true);
        return true;
      } catch (error) {
        const message = getErrorMessage(error, "Не удалось обновить инцидент");
        if (isConflict(error)) await refreshAfterMutation(payload.id);
        showAlertRef.current(message);
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [api, canEdit, refreshAfterMutation],
  );

  const markReviewIncident = useCallback(
    async (reviewId) => {
      if (!canEdit("incidents")) return false;
      setMutationLoading(true);
      try {
        const response = ensureSuccess(
          await api.markReviewIncident(reviewId),
          "Не удалось отметить отзыв как инцидент",
        );
        await loadDetail({ kind: "review", id: reviewId }, { silent: true });
        if (section === "reviews" && canView("reviews")) {
          await Promise.all([
            loadList({ page: pagination.page, silent: true }),
            loadDashboard({ silent: true }),
          ]);
        }
        showAlertRef.current(response?.text || "Отзыв отмечен как инцидент", true);
        return true;
      } catch (error) {
        showAlertRef.current(getErrorMessage(error, "Не удалось отметить отзыв как инцидент"));
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [api, canEdit, canView, loadDashboard, loadDetail, loadList, pagination.page, section],
  );

  const decideAi = useCallback(
    async ({ id, ai_analysis_id, decision, expected_lock_version }) => {
      if (!canEdit("incidents") || !canAccess("ai")) return false;
      setMutationLoading(true);
      try {
        const response = ensureSuccess(
          await api.decideAi({
            id,
            ai_analysis_id,
            decision,
            expected_lock_version,
          }),
          "Не удалось сохранить решение по рекомендации",
        );
        await refreshAfterMutation(id);
        showAlertRef.current(response?.text || "Решение сохранено", true);
        return true;
      } catch (error) {
        const message = getErrorMessage(error, "Не удалось сохранить решение по рекомендации");
        if (isConflict(error)) await refreshAfterMutation(id);
        showAlertRef.current(message);
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [api, canAccess, canEdit, refreshAfterMutation],
  );

  const changePage = useCallback(
    (_, nextPage) => {
      loadList({ page: nextPage });
    },
    [loadList],
  );

  const refresh = useCallback(() => {
    if (section === "overview" && canView("reviews")) return loadDashboard();
    if (section === "reviews" && canView("reviews")) {
      return loadList({ page: pagination.page });
    }
    if (section === "incidents" && canView("incidents")) {
      return loadList({ page: pagination.page });
    }
    if (section === "links" && canView("links")) return loadLinks();
    return null;
  }, [canView, loadDashboard, loadLinks, loadList, pagination.page, section]);

  const generateLink = useCallback(
    async (payload) => {
      if (!canEdit("links")) return false;
      setMutationLoading(true);
      try {
        const response = ensureSuccess(
          await api.generateLink(payload),
          "Не удалось создать QR-ссылку",
        );
        await loadLinks();
        showAlertRef.current(response?.text || "QR-ссылка создана", true);
        return true;
      } catch (error) {
        showAlertRef.current(getErrorMessage(error, "Не удалось создать QR-ссылку"));
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [api, canEdit, loadLinks],
  );

  const revokeLink = useCallback(
    async (payload) => {
      if (!canEdit("links")) return false;
      setMutationLoading(true);
      try {
        const response = ensureSuccess(
          await api.revokeLink(payload),
          "Не удалось отозвать QR-ссылку",
        );
        await loadLinks();
        showAlertRef.current(response?.text || "QR-ссылка отозвана", true);
        return true;
      } catch (error) {
        showAlertRef.current(getErrorMessage(error, "Не удалось отозвать QR-ссылку"));
        return false;
      } finally {
        setMutationLoading(false);
      }
    },
    [api, canEdit, loadLinks],
  );

  const retryDetail = useCallback(() => {
    if (selected) loadDetail(selected);
  }, [loadDetail, selected]);

  return {
    access,
    activeDraftFilters,
    alertMessage,
    alertStatus,
    applyFilters,
    bootstrapLoading,
    bootstrapReady,
    bootstrapError,
    canAccess,
    canEdit,
    canView,
    changePage,
    cities,
    closeAlert,
    closeDetail,
    contentLoading,
    contentError,
    dashboard,
    decideAi,
    detail,
    detailError,
    detailLoading,
    detailOpen,
    dictionaries,
    draftFilters,
    filters,
    filtersOpen,
    incidents,
    links,
    isAlert,
    loadBootstrap,
    loading: bootstrapLoading || contentLoading || mutationLoading,
    moduleInfo,
    mutationLoading,
    openDetail,
    pagination,
    points,
    refresh,
    generateLink,
    revokeLink,
    retryDetail,
    resetFilters,
    reviews,
    section,
    selected,
    setDetailOpen,
    setFiltersOpen,
    setSection: changeSection,
    updateDraftFilter,
    updateSort,
    updateIncident,
    markReviewIncident,
    getPhoto: api.getPhoto,
  };
}
