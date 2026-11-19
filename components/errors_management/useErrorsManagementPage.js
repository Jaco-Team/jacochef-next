import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import useOrderDetailsModal from "@/components/shared/order/useOrderDetailsModal";
import { journalFilterDefaults, orderFilterDefaults, statisticsFilterDefaults } from "./constants";
import {
  availableTabs,
  normalizePermissions,
  orderForViewer,
  resolveTab,
} from "./errorsManagementPermissions.mjs";
import { orderId, pointId } from "./errorsManagementViewModel.mjs";
import { journalOrderFilters, orderSearchPeriod } from "./orderSearchModel.mjs";
import { requestErrorText } from "./requestErrors.mjs";
import useErrorsManagementApi from "./useErrorsManagementApi";

const SCOPE_FIELDS = ["cityId", "pointId"];
const DATE_FIELDS = ["dateFrom", "dateTo"];

function selectOptions(items = []) {
  return (Array.isArray(items) ? items : []).filter(Boolean).map((item) => ({
    id: String(item.id),
    name: item.name || item.addr || String(item.id),
    addr: item.addr || item.name || "",
    city_id: String(item.city_id ?? ""),
  }));
}

function namedOptions(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.id !== undefined && item?.id !== null)
    .map((item) => ({
      id: String(item.id),
      name: item.name || String(item.id),
      ...(item.description ? { description: item.description } : {}),
    }));
}

function treeData(payload) {
  return {
    errCats: Array.isArray(payload?.err_cats) ? payload.err_cats : [],
    siteCategories: namedOptions(payload?.site_cats),
    stages: namedOptions(payload?.all_stages),
    solutions: namedOptions(payload?.solutions),
  };
}

function cafesOf(points, cityId) {
  return points.filter((item) => !cityId || item.city_id === String(cityId));
}

function payloadOf(response) {
  return response?.data ?? response;
}

export default function useErrorsManagementPage() {
  const api = useErrorsManagementApi();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down(667), { noSsr: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("Регистрация ошибок");
  const [cities, setCities] = useState([]);
  const [points, setPoints] = useState([]);
  const [tree, setTree] = useState(() => treeData(null));
  const [permissions, setPermissions] = useState(() => normalizePermissions(null));
  const [tab, setTabState] = useState(null);
  const [ready, setReady] = useState(false);

  const [journalDraft, setJournalDraft] = useState(() => journalFilterDefaults());
  const [journalApplied, setJournalApplied] = useState(() => journalFilterDefaults());
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoaded, setComplaintsLoaded] = useState(false);
  const [complaintsPage, setComplaintsPage] = useState(0);
  const [complaintsPerPage, setComplaintsPerPage] = useState(25);
  const [complaintsTotal, setComplaintsTotal] = useState(0);
  const [complaintsSort, setComplaintsSort] = useState({ by: "created_at", direction: "desc" });
  const complaintsRequestRef = useRef(0);

  const [orderDraft, setOrderDraft] = useState(() => orderFilterDefaults());
  const [orderApplied, setOrderApplied] = useState(() => orderFilterDefaults());
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const ordersRequestRef = useRef(0);

  const [statisticsDraft, setStatisticsDraft] = useState(() => statisticsFilterDefaults());
  const [statisticsApplied, setStatisticsApplied] = useState(() => statisticsFilterDefaults());
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoaded, setStatisticsLoaded] = useState(false);


  const [selected, setSelected] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const tabs = useMemo(() => availableTabs(permissions), [permissions]);
  const canSeePhone = permissions.tel;

  const withLoading = useCallback(async (operation) => {
    setLoading(true);
    try {
      return await operation();
    } finally {
      setLoading(false);
    }
  }, []);

  const orderDetails = useOrderDetailsModal({
    getOrder: api.getOrder,
    onError: setMessage,
    setLoading,
  });
  const openOrderDetails = useCallback(
    (row) => orderDetails.openOrder({ point_id: pointId(row), order_id: orderId(row) }),
    [orderDetails.openOrder],
  );
  const visibleOrderDetails = useMemo(
    () => ({ ...orderDetails, order: orderForViewer(orderDetails.order, canSeePhone) }),
    [canSeePhone, orderDetails],
  );

  const loadOrders = useCallback(
    async (nextFilters) => {
      const requestId = ordersRequestRef.current + 1;
      ordersRequestRef.current = requestId;
      setOrdersLoaded(false);
      setMessage("");
      const orderNumber = String(nextFilters.orderNumber || "").trim();
      const phone = canSeePhone ? String(nextFilters.phone || "").trim() : "";
      const response = await withLoading(() =>
        api.listOrders({
          city_id: nextFilters.cityId || "",
          point_id: nextFilters.pointId || 0,
          type_order: nextFilters.orderType || 0,
          order_id: orderNumber,
          number_order: orderNumber,
          sum_from: nextFilters.amountFrom || "",
          sum_to: nextFilters.amountTo || "",
          ...orderSearchPeriod(nextFilters),
          phone,
          number: phone,
          order_source: nextFilters.orderSource || "",
          order_stages: nextFilters.orderStages || [],
          time_from: nextFilters.timeFrom || "",
          time_to: nextFilters.timeTo || "",
        }),
      );
      if (ordersRequestRef.current !== requestId) return;
      const payload = payloadOf(response);
      setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
      setOrdersLoaded(true);
    },
    [api, canSeePhone, withLoading],
  );

  const loadComplaints = useCallback(
    async (
      nextFilters,
      page = complaintsPage,
      perPage = complaintsPerPage,
      sort = complaintsSort,
    ) => {
      const requestId = complaintsRequestRef.current + 1;
      complaintsRequestRef.current = requestId;
      setComplaintsLoaded(false);
      setMessage("");
      const response = await withLoading(() =>
        api.listComplaints({
          page: page + 1,
          per_page: perPage,
          sort_by: sort.by,
          sort_direction: sort.direction,
          filters: {
            city_id: nextFilters.cityId || null,
            point_id: nextFilters.pointId || null,
            ...journalOrderFilters(nextFilters),
            order_source: nextFilters.orderSource || null,
            registration_source: nextFilters.registrationSource || null,
            statuses: nextFilters.complaintStatuses || [],
          },
        }),
      );
      if (complaintsRequestRef.current !== requestId) return;
      const payload = payloadOf(response);
      setComplaints(Array.isArray(payload?.items) ? payload.items : []);
      setComplaintsTotal(Number(payload?.total || 0));
      setComplaintsLoaded(true);
    },
    [api, complaintsPage, complaintsPerPage, complaintsSort, withLoading],
  );

  const loadStatistics = useCallback(
    async (nextFilters) => {
      setStatisticsLoaded(false);
      setMessage("");
      const response = await withLoading(() =>
        api.getStatistics({
          filters: {
            city_id: nextFilters.cityId || null,
            point_id: nextFilters.pointId || null,
            date_from: nextFilters.dateFrom || null,
            date_to: nextFilters.dateTo || null,
            source: nextFilters.orderSource || null,
            employee_id: nextFilters.employeeId || null,
          },
        }),
      );
      setStatistics(payloadOf(response) ?? null);
      setStatisticsLoaded(true);
    },
    [api, withLoading],
  );

  const bootstrap = useCallback(async () => {
    setReady(false);
    setMessage("");
    try {
      const response = await withLoading(() => api.bootstrap());
      const payload = payloadOf(response);
      const nextCities = selectOptions(payload?.cities);
      const nextPoints = selectOptions(payload?.points);
      const cityId = String(payload?.city_id || nextCities[0]?.id || "");
      const firstCafe = nextPoints.find((point) => point.city_id === cityId) || nextPoints[0];
      const scope = { cityId, pointId: firstCafe?.id || "" };
      const nextPermissions = normalizePermissions(payload?.permissions);
      setTitle(payload?.module_info?.name || "Регистрация ошибок");
      setCities(nextCities);
      setPoints(nextPoints);
      setTree(treeData(payload));
      setPermissions(nextPermissions);
      setTabState((current) => resolveTab(current, availableTabs(nextPermissions)));
      setJournalDraft(journalFilterDefaults(scope));
      setJournalApplied(journalFilterDefaults(scope));
      setOrderDraft(orderFilterDefaults(scope));
      setOrderApplied(orderFilterDefaults(scope));
      setStatisticsDraft(statisticsFilterDefaults(scope));
      setStatisticsApplied(statisticsFilterDefaults(scope));
      setReady(true);
    } catch (error) {
      setMessage(requestErrorText(error, "Не удалось загрузить модуль."));
    }
  }, [api, withLoading]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
  useEffect(() => {
    document.title = title;
  }, [title]);
  useEffect(() => {
    if (!ready || tab !== "journal") return;
    loadComplaints(journalApplied, complaintsPage, complaintsPerPage, complaintsSort).catch(
      (error) => setMessage(requestErrorText(error, "Не удалось загрузить журнал.")),
    );
  }, [
    complaintsPage,
    complaintsPerPage,
    complaintsSort,
    journalApplied,
    loadComplaints,
    ready,
    tab,
  ]);
  useEffect(() => {
    if (!ready || tab !== "registration") return;
    loadOrders(orderApplied).catch((error) =>
      setMessage(requestErrorText(error, "Не удалось загрузить заказы.")),
    );
  }, [loadOrders, orderApplied, ready, tab]);
  useEffect(() => {
    if (!ready || tab !== "statistics") return;
    loadStatistics(statisticsApplied).catch((error) =>
      setMessage(requestErrorText(error, "Не удалось загрузить статистику.")),
    );
  }, [loadStatistics, ready, statisticsApplied, tab]);

  const scopePatch = useCallback(
    (field, value) => {
      if (field !== "cityId") return { [field]: value };
      const cityPoint = points.find((point) => point.city_id === String(value));
      return { cityId: value, pointId: cityPoint?.id || "" };
    },
    [points],
  );

  const setters = { journal: setJournalDraft, orders: setOrderDraft, statistics: setStatisticsDraft };
  const updateFilters = (target, field, value) => {
    const patch = scopePatch(field, value);
    setters[target]((previous) => ({ ...previous, ...patch }));
    Object.entries(setters).forEach(([key, setDraft]) => {
      if (key === target) return;
      const syncScope = SCOPE_FIELDS.includes(field);
      const syncDates =
        DATE_FIELDS.includes(field) && [target, key].every((item) => item !== "orders");
      if (syncScope || syncDates) setDraft((previous) => ({ ...previous, ...patch }));
    });
  };

  const setTab = useCallback(
    (value) => {
      if (tabs.some((item) => item.id === value)) setTabState(value);
    },
    [tabs],
  );

  const listTarget = tab === "registration" ? "orders" : "journal";
  const listFilters = listTarget === "orders" ? orderDraft : journalDraft;
  const listCafes = useMemo(
    () => cafesOf(points, listFilters.cityId),
    [listFilters.cityId, points],
  );
  const applyList = () => {
    setMessage("");
    if (listTarget === "orders") {
      setOrdersLoaded(false);
      setOrderApplied({ ...orderDraft });
      return;
    }
    setComplaintsLoaded(false);
    setComplaintsPage(0);
    setJournalApplied({ ...journalDraft });
  };
  const changeComplaintsSort = (by) => {
    setComplaintsLoaded(false);
    setComplaintsPage(0);
    setComplaintsSort((current) => ({
      by,
      direction: current.by === by && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const statisticsCafes = useMemo(
    () => cafesOf(points, statisticsDraft.cityId),
    [points, statisticsDraft.cityId],
  );
  const applyStatistics = () => {
    setStatisticsLoaded(false);
    setStatisticsApplied({ ...statisticsDraft });
  };
  const reloadTree = useCallback(async () => {
    const response = await api.bootstrap();
    setTree(treeData(payloadOf(response)));
  }, [api]);

  const openComplaint = useCallback((complaint) => setSelectedComplaint(complaint), []);
  const openRegistration = useCallback((order) => setSelected(order), []);
  const refreshJournal = useCallback(
    () =>
      loadComplaints(journalApplied).catch((error) =>
        setMessage(requestErrorText(error, "Не удалось обновить журнал.")),
      ),
    [journalApplied, loadComplaints],
  );
  const registrationSaved = useCallback(
    (detail) => {
      setNotice(detail?.id ? `Жалоба №${detail.id} зарегистрирована.` : "Жалоба зарегистрирована.");
      loadOrders(orderApplied).catch((error) =>
        setMessage(requestErrorText(error, "Не удалось обновить заказы.")),
      );
    },
    [loadOrders, orderApplied],
  );

  return {
    shell: {
      loading,
      message,
      notice,
      closeNotice: () => setNotice(""),
      mobile,
      ready,
      tab,
      tabs,
      title,
      setTab,
    },
    complaintList: {
      apply: applyList,
      cafes: listCafes,
      canRegister: tabs.some((item) => item.id === "registration"),
      canSeePhone,
      changeComplaintsSort,
      cities,
      complaintsPage,
      complaintsPerPage,
      complaintsSort,
      complaintsTotal,
      filters: listFilters,
      mobile,
      mode: tab,
      openOrderDetails,
      points,
      resultsLoaded: listTarget === "orders" ? ordersLoaded : complaintsLoaded,
      rows: listTarget === "orders" ? orders : complaints,
      setComplaintsPage,
      setComplaintsPerPage,
      setSelected: openRegistration,
      setSelectedComplaint: openComplaint,
      update: (field, value) => updateFilters(listTarget, field, value),
      openRegistration: () => setTab("registration"),
    },
    statisticsSection: {
      applyStatistics,
      cities,
      mobile,
      statistics,
      statisticsCafes,
      statisticsDraft,
      statisticsLoaded,
      updateStatistics: (field, value) => updateFilters("statistics", field, value),
    },
    settingsSection: {
      api,
      canEdit: permissions.settings_edit,
      errCats: tree.errCats,
      reloadTree,
      siteCategories: tree.siteCategories,
      solutions: tree.solutions,
      stages: tree.stages,
      withLoading,
    },
    complaintDrawer: {
      api,
      cities,
      complaint: selectedComplaint,
      permissions,
      points,
      close: () => setSelectedComplaint(null),
      openOrder: openOrderDetails,
      refresh: refreshJournal,
      withLoading,
    },
    registrationDrawer: {
      api,
      cities,
      points,
      selected,
      close: () => setSelected(null),
      saved: registrationSaved,
      withLoading,
    },
    orderDetails: visibleOrderDetails,
  };
}
