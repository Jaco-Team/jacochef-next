import { EMPTY_PERIOD, STAFF_SCHEDULE_SOURCE_MODES } from "./staffScheduleConstants";
import { buildShiftGroups, getVisibleSummaryColumns, toArray } from "./staffScheduleHelpers";

export function hasBootstrapPayload(response) {
  return Boolean(response?.module_info || response?.point_list || response?.months);
}

export function hasGraphPayload(response) {
  return Boolean(
    response?.date?.one ||
    response?.date?.two ||
    Array.isArray(response?.one) ||
    Array.isArray(response?.two),
  );
}

export function getModuleTitle(response) {
  const source = response?.__source ?? STAFF_SCHEDULE_SOURCE_MODES.STAFF_SCHEDULE;
  const responseName = response?.module_info?.name;

  if (source !== STAFF_SCHEDULE_SOURCE_MODES.STAFF_SCHEDULE && responseName === "Модуль работы") {
    return "График работы";
  }

  return responseName || "График работы";
}

export function buildGraphState(response) {
  return {
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
  };
}

export function buildPeriodTabs(graph) {
  return [
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
  ];
}

export function buildPageStats(activePeriod) {
  const activeErrors = activePeriod?.errors ?? { orders: [], cam: [] };

  return {
    ordersErrorCount: toArray(activeErrors.orders).length,
    camErrorCount: toArray(activeErrors.cam).length,
    daysCount: toArray(activePeriod?.meta?.days).length,
    rowsCount: toArray(activePeriod?.rows).length,
  };
}

function buildShiftOptions(rows) {
  return [
    { id: "all", name: "Все смены" },
    ...buildShiftGroups(rows).map((group) => ({
      id: group.id,
      name: group.label,
    })),
  ];
}

function buildVisibleRows(rows, selectedShiftId, collapsedShiftIds = []) {
  const groups = buildShiftGroups(rows);
  const filteredGroups =
    selectedShiftId && selectedShiftId !== "all"
      ? groups.filter((group) => group.id === selectedShiftId)
      : groups;

  return {
    shiftCount: filteredGroups.length,
    rows: filteredGroups.flatMap((group) =>
      collapsedShiftIds.includes(group.id)
        ? [{ ...group.header, __shiftId: group.id }]
        : [{ ...group.header, __shiftId: group.id }, ...group.rows],
    ),
  };
}

export function buildPageViewModel({
  moduleName,
  access,
  graph,
  selectedPart,
  selectedShiftId = "all",
  collapsedShiftIds = [],
}) {
  const periodTabs = buildPeriodTabs(graph);
  const activePeriod = periodTabs[selectedPart] ?? periodTabs[0];
  const visibleRows = buildVisibleRows(
    activePeriod?.rows ?? [],
    selectedShiftId,
    collapsedShiftIds,
  );

  return {
    moduleName,
    periodTabs,
    activePeriod,
    visibleRows: visibleRows.rows,
    shiftOptions: buildShiftOptions(activePeriod?.rows ?? []),
    shownShiftCount: visibleRows.shiftCount,
    summaryColumns: getVisibleSummaryColumns(access),
    graphKind: graph.kind,
    stats: buildPageStats(activePeriod),
  };
}
