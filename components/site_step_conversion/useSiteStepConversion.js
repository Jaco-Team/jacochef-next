"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import useApi from "@/src/hooks/useApi";
import { DEMO_AUTH, DEMO_BOOTSTRAP, DEMO_FLOWS, DEMO_PAYMENTS } from "./demoData";

const MODULE = "site_step_conversion";

const EMPTY_FILTERS = {
  period: "14d",
  date_start: null,
  date_end: null,
  city_id: "all",
  client: "all",
  scenario: "all",
  point_id: "all",
  payment_method: "all",
};

function withAll(options, allItem) {
  const list = Array.isArray(options) ? options : [];
  const normalized = list.map((item) => ({
    ...item,
    id: String(item?.id ?? ""),
    name: item?.name || item?.label || String(item?.id ?? ""),
  }));
  if (normalized.some((item) => item.id === "all")) return normalized;
  return [{ ...allItem, id: "all" }, ...normalized];
}

function normalizeBootstrap(res) {
  return {
    moduleName: res?.module_info?.name || "Метрики сайта",
    cities: withAll(res?.cities, { name: "Все города" }),
    points: withAll(res?.points, { name: "Все точки", city_id: "all" }),
    clients: withAll(res?.clients, { name: "Сайт и приложение" }),
    scenarios: withAll(res?.scenarios, { name: "Все сценарии" }),
    paymentMethods: withAll(res?.payment_methods, { name: "Карта и СБП" }),
    filters: {
      ...EMPTY_FILTERS,
      period: res?.defaults?.period || "14d",
      date_start: res?.defaults?.date_start || null,
      date_end: res?.defaults?.date_end || null,
      city_id: String(res?.defaults?.city_id ?? "all"),
      client: String(res?.defaults?.client ?? "all"),
      scenario: String(res?.defaults?.scenario ?? "all"),
      point_id: String(res?.defaults?.point_id ?? "all"),
      payment_method: String(res?.defaults?.payment_method ?? "all"),
    },
  };
}

export function buildPeriodRange(filters) {
  const end = dayjs().startOf("day");
  if (filters.period === "today") {
    const day = end.format("YYYY-MM-DD");
    return { date_start: day, date_end: day };
  }
  if (filters.period === "30d") {
    return {
      date_start: end.subtract(29, "day").format("YYYY-MM-DD"),
      date_end: end.format("YYYY-MM-DD"),
    };
  }
  if (filters.period === "custom") {
    return {
      date_start: filters.date_start || null,
      date_end: filters.date_end || null,
    };
  }
  return {
    date_start: end.subtract(13, "day").format("YYYY-MM-DD"),
    date_end: end.format("YYYY-MM-DD"),
  };
}

function buildPayload(filters, tab) {
  const range = buildPeriodRange(filters);
  const common = {
    period: filters.period,
    date_start: range.date_start,
    date_end: range.date_end,
    city_id: filters.city_id,
  };
  if (tab === "payments") {
    return {
      ...common,
      point_id: filters.point_id,
      payment_method: filters.payment_method,
    };
  }
  return {
    ...common,
    client: filters.client,
    scenario: filters.scenario,
  };
}

export default function useSiteStepConversion() {
  const { api_laravel } = useApi(MODULE);
  const loadedKeyRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [moduleName, setModuleName] = useState("Метрики сайта");
  const [tab, setTab] = useState("auth");
  const [cities, setCities] = useState([]);
  const [points, setPoints] = useState([]);
  const [clients, setClients] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [screens, setScreens] = useState({ auth: null, payments: null });
  const [alert, setAlert] = useState({ open: false, text: "", status: false });
  const [flow, setFlow] = useState({ open: false, loading: false, title: "", steps: [] });

  const applyBootstrap = useCallback((boot, nextScreens) => {
    setModuleName(boot.moduleName);
    setCities(boot.cities);
    setPoints(boot.points);
    setClients(boot.clients);
    setScenarios(boot.scenarios);
    setPaymentMethods(boot.paymentMethods);
    setFilters(boot.filters);
    if (nextScreens) setScreens(nextScreens);
    document.title = boot.moduleName;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await api_laravel("get_all");
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки модуля");
        if (cancelled) return;
        applyBootstrap(normalizeBootstrap(res));
        setDemoMode(false);
        setReady(true);
      } catch (error) {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) return;
        applyBootstrap(normalizeBootstrap(DEMO_BOOTSTRAP), {
          auth: DEMO_AUTH,
          payments: DEMO_PAYMENTS,
        });
        setDemoMode(true);
        setReady(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [api_laravel, applyBootstrap]);

  useEffect(() => {
    if (!ready || demoMode || (tab !== "auth" && tab !== "payments")) return undefined;
    const payload = buildPayload(filters, tab);
    if (filters.period === "custom" && (!payload.date_start || !payload.date_end)) return undefined;

    const key = JSON.stringify(payload);
    if (loadedKeyRef.current[tab] === key && screens[tab]) return undefined;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await api_laravel(tab === "payments" ? "get_payments" : "get_auth", payload);
        if (!res?.st) throw new Error(res?.text || "Ошибка загрузки данных");
        if (cancelled) return;
        loadedKeyRef.current[tab] = key;
        setScreens((prev) => ({ ...prev, [tab]: res }));
      } catch (error) {
        if (!cancelled) {
          setAlert({
            open: true,
            status: false,
            text: error?.message || "Ошибка загрузки данных",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [api_laravel, demoMode, filters, ready, screens, tab]);

  const pointOptions = useMemo(() => {
    if (filters.city_id === "all") return points;
    return points.filter(
      (item) => item.id === "all" || String(item.city_id) === String(filters.city_id),
    );
  }, [filters.city_id, points]);

  const updateFilters = useCallback(
    (patch) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        if (patch.city_id && patch.city_id !== "all" && next.point_id !== "all") {
          const point = points.find((item) => item.id === String(next.point_id));
          if (point && String(point.city_id) !== String(next.city_id)) next.point_id = "all";
        }
        return next;
      });
      loadedKeyRef.current = {};
    },
    [points],
  );

  const openFlow = useCallback(
    async (row, kind) => {
      const id = kind === "payments" ? row?.payment_flow_id : row?.flow_id;
      if (!id) return;
      setFlow({ open: true, loading: true, title: "События попытки", steps: [] });

      if (demoMode) {
        const local = DEMO_FLOWS[id];
        setFlow({
          open: true,
          loading: false,
          title: local?.title || "События попытки",
          steps: local?.steps || [],
        });
        return;
      }

      try {
        const res = await api_laravel(
          kind === "payments" ? "get_payment_flow" : "get_auth_flow",
          kind === "payments" ? { payment_flow_id: id } : { flow_id: id },
        );
        if (!res?.st) throw new Error(res?.text || "Не удалось загрузить попытку");
        setFlow({
          open: true,
          loading: false,
          title: res.title || "События попытки",
          steps: res.steps || [],
        });
      } catch (error) {
        setFlow({ open: false, loading: false, title: "", steps: [] });
        setAlert({
          open: true,
          status: false,
          text: error?.message || "Не удалось загрузить попытку",
        });
      }
    },
    [api_laravel, demoMode],
  );

  const isDemo =
    demoMode || Boolean(screens.auth?.meta?.is_demo) || Boolean(screens.payments?.meta?.is_demo);

  return {
    loading,
    moduleName,
    tab,
    setTab,
    filters,
    updateFilters,
    cities,
    pointOptions,
    clients,
    scenarios,
    paymentMethods,
    screens,
    alert,
    closeAlert: () => setAlert((prev) => ({ ...prev, open: false })),
    flow,
    closeFlow: () => setFlow((prev) => ({ ...prev, open: false })),
    openFlow,
    isDemo,
  };
}
