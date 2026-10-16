import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import useOrderDetailsModal from "@/components/shared/order/useOrderDetailsModal";
import { DEFAULT_FILTERS } from "./constants";
import { orderId, pointId } from "./errorsManagementViewModel.mjs";
import useErrorsManagementApi from "./useErrorsManagementApi";

function selectOptions(items = []) {
  return items.filter(Boolean).map((item) => ({
    id: String(item.id),
    name: item.name || item.addr || String(item.id),
    addr: item.addr || item.name || "",
    city_id: String(item.city_id ?? ""),
  }));
}

export default function useErrorsManagementPage() {
  const api = useErrorsManagementApi();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down(667), { noSsr: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Регистрация ошибок");
  const [cities, setCities] = useState([]);
  const [points, setPoints] = useState([]);
  const [access, setAccess] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoaded, setComplaintsLoaded] = useState(false);
  const [complaintsPage, setComplaintsPage] = useState(0);
  const [complaintsPerPage, setComplaintsPerPage] = useState(25);
  const [complaintsTotal, setComplaintsTotal] = useState(0);
  const [complaintsSort, setComplaintsSort] = useState({ by: "created_at", direction: "desc" });
  const [selected, setSelected] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tableOrderIdSearch, setTableOrderIdSearch] = useState("");
  const [tab, setTab] = useState("journal");
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoaded, setStatisticsLoaded] = useState(false);
  const [statisticsDraft, setStatisticsDraft] = useState(DEFAULT_FILTERS);
  const [statisticsApplied, setStatisticsApplied] = useState(DEFAULT_FILTERS);
  const [ready, setReady] = useState(false);
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
  const loadOrders = useCallback(
    async (nextFilters) => {
      setOrdersLoaded(false);
      setMessage("");
      const orderNumber = nextFilters.orderNumber.trim();
      const response = await withLoading(() =>
        api.listOrders({
          city_id: nextFilters.cityId || "",
          point_id: nextFilters.pointId || 0,
          type_order: nextFilters.orderType || 0,
          order_id: orderNumber,
          number_order: orderNumber,
          sum_from: nextFilters.amountFrom || "",
          sum_to: nextFilters.amountTo || "",
          date_from: orderNumber ? "" : nextFilters.dateFrom || "",
          date_to: orderNumber ? "" : nextFilters.dateTo || "",
          phone: nextFilters.phone || "",
          order_source: nextFilters.orderSource || "",
          order_stages: nextFilters.orderStages || [],
          number: nextFilters.phone || "",
          time_from: "",
          time_to: "",
        }),
      );
      const payload = response?.data ?? response;
      setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
      setOrdersLoaded(true);
    },
    [api, withLoading],
  );
  const loadComplaints = useCallback(
    async (
      nextFilters,
      page = complaintsPage,
      perPage = complaintsPerPage,
      sort = complaintsSort,
    ) => {
      setComplaintsLoaded(false);
      setMessage("");
      const orderNumber = nextFilters.orderNumber.trim();
      const response = await withLoading(() =>
        api.listComplaints({
          page: page + 1,
          per_page: perPage,
          sort_by: sort.by,
          sort_direction: sort.direction,
          filters: {
            city_id: nextFilters.cityId || null,
            point_id: nextFilters.pointId || null,
            order_id: orderNumber || null,
            date_from: orderNumber ? null : nextFilters.dateFrom || null,
            date_to: orderNumber ? null : nextFilters.dateTo || null,
            source: nextFilters.orderSource || null,
            statuses: nextFilters.complaintStatuses || [],
          },
        }),
      );
      const payload = response?.data ?? response;
      setComplaints(Array.isArray(payload?.items) ? payload.items : []);
      setComplaintsTotal(Number(payload?.total || 0));
      setComplaintsLoaded(true);
    },
    [api, complaintsPage, complaintsPerPage, complaintsSort, withLoading],
  );

  const bootstrap = useCallback(async () => {
    setReady(false);
    setMessage("");
    try {
      const response = await withLoading(() => api.bootstrap());
      const payload = response?.data ?? response;
      const nextCities = selectOptions(payload?.cities);
      const nextPoints = selectOptions(payload?.points);
      const cityId = String(payload?.city_id || nextCities[0]?.id || "");
      const firstCafe = nextPoints.find((point) => point.city_id === cityId) || nextPoints[0];
      const nextFilters = { ...DEFAULT_FILTERS, cityId, pointId: firstCafe?.id || "" };
      setTitle(payload?.module_info?.name || "Регистрация ошибок");
      setCities(nextCities);
      setPoints(nextPoints);
      setAccess(payload?.acces || {});
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setStatisticsDraft(nextFilters);
      setStatisticsApplied(nextFilters);
      setReady(true);
    } catch {
      setMessage("Не удалось загрузить модуль.");
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
    loadComplaints(appliedFilters, complaintsPage, complaintsPerPage, complaintsSort).catch(() =>
      setMessage("Не удалось загрузить журнал."),
    );
  }, [
    appliedFilters,
    complaintsPage,
    complaintsPerPage,
    complaintsSort,
    loadComplaints,
    ready,
    tab,
  ]);
  useEffect(() => {
    if (!ready || tab !== "registration") return;
    loadOrders(appliedFilters).catch(() => setMessage("Не удалось загрузить заказы."));
  }, [appliedFilters, loadOrders, ready, tab]);
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
      setStatistics(response?.data ?? response ?? null);
      setStatisticsLoaded(true);
    },
    [api, withLoading],
  );
  useEffect(() => {
    if (!ready || tab !== "statistics") return;
    loadStatistics(statisticsApplied).catch(() => setMessage("Не удалось загрузить статистику."));
  }, [loadStatistics, ready, statisticsApplied, tab]);
  const cafes = useMemo(
    () => points.filter((item) => !filters.cityId || item.city_id === filters.cityId),
    [filters.cityId, points],
  );
  const update = (field, value) => {
    const cityPoint =
      field === "cityId" ? points.find((point) => String(point.city_id) === String(value)) : null;
    const next = {
      [field]: value,
      ...(field === "cityId" ? { pointId: cityPoint?.id || "" } : {}),
    };
    setFilters((previous) => ({ ...previous, ...next }));
    if (["cityId", "pointId", "dateFrom", "dateTo"].includes(field)) {
      setStatisticsDraft((previous) => ({ ...previous, ...next }));
    }
  };
  const apply = () => {
    setMessage("");
    setComplaintsLoaded(false);
    setOrdersLoaded(false);
    setComplaintsPage(0);
    setAppliedFilters({ ...filters });
  };
  const changeComplaintsSort = (by) => {
    setComplaintsLoaded(false);
    setComplaintsPage(0);
    setComplaintsSort((current) => ({
      by,
      direction: current.by === by && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const rows = tab === "journal" ? complaints : orders;
  const resultsLoaded = tab === "journal" ? complaintsLoaded : ordersLoaded;
  const visibleRows = useMemo(() => {
    const query = tableOrderIdSearch.trim();
    if (!query) return rows;
    return rows.filter((row) => String(orderId(row)).includes(query));
  }, [rows, tableOrderIdSearch]);
  const statisticsCafes = useMemo(
    () =>
      points.filter((item) => !statisticsDraft.cityId || item.city_id === statisticsDraft.cityId),
    [points, statisticsDraft.cityId],
  );
  const updateStatistics = (field, value) => {
    const cityPoint =
      field === "cityId" ? points.find((point) => String(point.city_id) === String(value)) : null;
    const next = {
      [field]: value,
      ...(field === "cityId" ? { pointId: cityPoint?.id || "" } : {}),
    };
    setStatisticsDraft((previous) => ({ ...previous, ...next }));
    if (["cityId", "pointId", "dateFrom", "dateTo"].includes(field)) {
      setFilters((previous) => ({ ...previous, ...next }));
    }
  };
  const applyStatistics = () => {
    setStatisticsLoaded(false);
    setStatisticsApplied({ ...statisticsDraft });
  };
  const openComplaint = useCallback((complaint) => {
    setSelectedComplaint(complaint);
  }, []);
  const openRegistration = useCallback((order) => {
    setSelected(order);
  }, []);

  return {
    shell: { loading, message, mobile, tab, title, setTab, withLoading },
    complaintList: {
      apply,
      cafes,
      changeComplaintsSort,
      cities,
      complaintsPage,
      complaintsPerPage,
      complaintsSort,
      complaintsTotal,
      filters,
      mobile,
      mode: tab,
      openOrderDetails,
      points,
      resultsLoaded,
      rows,
      setComplaintsPage,
      setComplaintsPerPage,
      setSelected: openRegistration,
      setSelectedComplaint: openComplaint,
      setTableOrderIdSearch,
      tableOrderIdSearch,
      update,
      visibleRows,
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
      updateStatistics,
    },
    settingsSection: { access, api, cafes, cities, filters, update, withLoading },
    complaintDrawer: {
      api,
      cities,
      complaint: selectedComplaint,
      points,
      close: () => setSelectedComplaint(null),
      openOrder: openOrderDetails,
      refresh: () => loadComplaints(appliedFilters),
      withLoading,
    },
    registrationDrawer: {
      api,
      cities,
      points,
      selected,
      close: () => setSelected(null),
      saved: apply,
      withLoading,
    },
    orderDetails,
  };
}
