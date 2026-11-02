import dayjs from "dayjs";
import "dayjs/locale/ru.js";

export const RATE_HISTORY_STATUS = {
  applied: { label: "Применено", color: "#1F7A3A", background: "#E6F4EA" },
  planned: { label: "Запланировано", color: "#8A5A00", background: "#FFF4D6" },
  deleted: { label: "Удалено", color: "#6B7280", background: "#F3F4F6" },
};

export function formatRatesPeriodLabel(period) {
  const start = dayjs(period?.value);
  const end = dayjs(period?.end_date);
  if (!start.isValid() || !end.isValid()) {
    return String(period?.value ?? "");
  }

  return `с ${start.date()} по ${end.locale("ru").format("D MMMM YYYY")} г.`;
}

export function normalizeDecimalInput(value) {
  return String(value ?? "")
    .replace(",", ".")
    .trim();
}

export function isValidMoneyInput(value) {
  const normalized = normalizeDecimalInput(value);
  return normalized === "" || (/^\d+(\.\d{1,2})?$/.test(normalized) && Number(normalized) >= 0);
}

export function buildRatesSavePayload({ dateStart, points, positions, coefficients }) {
  return {
    date_start: dateStart,
    points: (points ?? []).map((point) => Number(point?.id ?? point)).filter((id) => id > 0),
    positions: (positions ?? []).map((position) => ({
      app_id: Number(position.app_id),
      price: normalizeDecimalInput(position.price),
    })),
    k_rolls: normalizeDecimalInput(coefficients?.k_rolls),
    k_pizza: normalizeDecimalInput(coefficients?.k_pizza),
  };
}

export const POSITION_GRAPH_FILTERS = [
  { id: "all", label: "Все" },
  { id: "graph", label: "В графике работы" },
  { id: "no_graph", label: "Без графика" },
];

export function isPositionInGraph(position) {
  return Number(position?.is_graph) === 1;
}

/**
 * Группы по отделам в порядке, пришедшем с бэка; должности без отдела — в группе «Без отдела».
 */
export function groupPositionsByUnit(positions = [], graphFilter = "all") {
  const groups = new Map();
  for (const position of positions) {
    const inGraph = isPositionInGraph(position);
    if ((graphFilter === "graph" && !inGraph) || (graphFilter === "no_graph" && inGraph)) {
      continue;
    }
    const unitId = Number(position.unit_id) || 0;
    if (!groups.has(unitId)) {
      groups.set(unitId, {
        unitId,
        unitName: position.unit_name || "Без отдела",
        positions: [],
        filledCount: 0,
        inGraphCount: 0,
      });
    }
    const group = groups.get(unitId);
    group.positions.push(position);
    if (normalizeDecimalInput(position.price) !== "") group.filledCount += 1;
    if (inGraph) group.inGraphCount += 1;
  }
  return [...groups.values()];
}

export function getDefaultExpandedUnitIds(positions = []) {
  return groupPositionsByUnit(positions)
    .filter((group) => group.inGraphCount > 0 || group.filledCount > 0)
    .map((group) => group.unitId);
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : "—";
}

export function formatChange(oldValue, newValue) {
  return oldValue === null || oldValue === undefined
    ? formatMoney(newValue)
    : `${formatMoney(oldValue)} → ${formatMoney(newValue)}`;
}

export function formatLegacyPrices(position) {
  if (!position?.has_legacy_spread) {
    return "";
  }
  const { min, avg, max } = position.legacy_prices ?? {};
  return `В старом app_per_h три ставки: ${formatMoney(min)} / ${formatMoney(avg)} / ${formatMoney(max)}`;
}

export function formatDateTime(value) {
  const date = dayjs(value);
  return value && date.isValid() ? date.format("DD.MM.YYYY HH:mm") : "";
}

export function formatDate(value) {
  const date = dayjs(value);
  return value && date.isValid() ? date.format("DD.MM.YYYY") : "";
}
