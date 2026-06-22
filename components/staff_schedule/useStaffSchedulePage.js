import { useCallback, useEffect, useMemo, useState } from "react";
import useStaffScheduleApi from "./useStaffScheduleApi";
import { getActiveMonthId, getVisibleSummaryColumns, toArray } from "./staffScheduleHelpers";

const EMPTY_PERIOD = {
  days: [],
  bonus: [],
  other_summ: {},
  order_stat: [],
  bonus_other: 0,
};

const hasBootstrapPayload = (response) =>
  Boolean(response?.module_info || response?.point_list || response?.mounths);

const hasGraphPayload = (response) =>
  Boolean(
    response?.date?.one ||
    response?.date?.two ||
    Array.isArray(response?.one) ||
    Array.isArray(response?.two),
  );

export default function useStaffSchedulePage() {
  const api = useStaffScheduleApi();

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [error, setError] = useState("");
  const [moduleName, setModuleName] = useState("График работы");
  const [points, setPoints] = useState([]);
  const [months, setMonths] = useState([]);
  const [pointId, setPointId] = useState("");
  const [monthId, setMonthId] = useState("");
  const [access, setAccess] = useState({});
  const [dataSource, setDataSource] = useState("staff_schedule");
  const [graph, setGraph] = useState({
    oneMeta: EMPTY_PERIOD,
    twoMeta: EMPTY_PERIOD,
    oneRows: [],
    twoRows: [],
    part: 1,
    kind: "",
    show_zp_one: 0,
    show_zp_two: 0,
    errors: {
      one: { orders: [], cam: [] },
      two: { orders: [], cam: [] },
    },
  });
  const [selectedPart, setSelectedPart] = useState(0);

  const loadGraph = useCallback(
    async (nextPointId, nextMonthId) => {
      if (!nextPointId || !nextMonthId) {
        return;
      }

      setIsGraphLoading(true);
      setError("");

      try {
        const response = await api.getGraph({
          point_id: nextPointId,
          mounth: nextMonthId,
        });

        if (response?.st === false || !hasGraphPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить график");
        }

        setGraph({
          oneMeta: response?.date?.one ?? EMPTY_PERIOD,
          twoMeta: response?.date?.two ?? EMPTY_PERIOD,
          oneRows: toArray(response?.one),
          twoRows: toArray(response?.two),
          part: Number(response?.part || 1),
          kind: response?.kind ?? "",
          show_zp_one: response?.show_zp_one ?? 0,
          show_zp_two: response?.show_zp_two ?? 0,
          errors: {
            one: {
              orders: toArray(response?.err?.one?.orders),
              cam: toArray(response?.err?.one?.cam),
            },
            two: {
              orders: toArray(response?.err?.two?.orders),
              cam: toArray(response?.err?.two?.cam),
            },
          },
        });
        setAccess(response?.access ?? {});
        setDataSource(response?.__source ?? "staff_schedule");
        setSelectedPart(Math.max(Number(response?.part || 1) - 1, 0));
      } catch (requestError) {
        setError(requestError?.message || "Не удалось загрузить график");
      } finally {
        setIsGraphLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setError("");

      try {
        const response = await api.getAll();

        if (response?.st === false || !hasBootstrapPayload(response)) {
          throw new Error(response?.text || "Не удалось загрузить модуль");
        }

        if (!isMounted) {
          return;
        }

        const nextPoints = toArray(response?.point_list);
        const nextMonths = toArray(response?.mounths);
        const nextPointId = nextPoints[0]?.id ?? "";
        const nextMonthId = getActiveMonthId(nextMonths);

        setModuleName(response?.module_info?.name || "График работы");
        setPoints(nextPoints);
        setMonths(nextMonths);
        setPointId(nextPointId);
        setMonthId(nextMonthId);
        setAccess(response?.access ?? {});
        setDataSource(response?.__source ?? "staff_schedule");

        if (nextPointId && nextMonthId) {
          await loadGraph(nextPointId, nextMonthId);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || "Не удалось загрузить модуль");
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [api, loadGraph]);

  useEffect(() => {
    document.title = moduleName;
  }, [moduleName]);

  const periodTabs = useMemo(
    () => [
      {
        id: "part-1",
        label: "1-15",
        rows: graph.oneRows,
        meta: graph.oneMeta,
        showZp: graph.show_zp_one,
        errors: graph.errors.one,
      },
      {
        id: "part-2",
        label: "16-конец",
        rows: graph.twoRows,
        meta: graph.twoMeta,
        showZp: graph.show_zp_two,
        errors: graph.errors.two,
      },
    ],
    [graph],
  );

  const activePeriod = periodTabs[selectedPart] ?? periodTabs[0];

  const summaryColumns = useMemo(() => getVisibleSummaryColumns(access), [access]);

  const handlePointChange = useCallback(
    async (event) => {
      const nextPointId = event.target.value;
      setPointId(nextPointId);
      await loadGraph(nextPointId, monthId);
    },
    [loadGraph, monthId],
  );

  const handleMonthChange = useCallback(
    async (event) => {
      const nextMonthId = event.target.value;
      setMonthId(nextMonthId);
      await loadGraph(pointId, nextMonthId);
    },
    [loadGraph, pointId],
  );

  const handleReload = useCallback(async () => {
    await loadGraph(pointId, monthId);
  }, [loadGraph, monthId, pointId]);

  return {
    moduleName,
    isBootstrapping,
    isGraphLoading,
    error,
    points,
    months,
    pointId,
    monthId,
    access,
    dataSource,
    periodTabs,
    activePeriod,
    selectedPart,
    summaryColumns,
    graphKind: graph.kind,
    activeDaysCount: activePeriod?.meta?.days?.length ?? 0,
    activeRowsCount: activePeriod?.rows?.length ?? 0,
    setSelectedPart,
    handlePointChange,
    handleMonthChange,
    handleReload,
  };
}
