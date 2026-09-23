export const SALES_SOURCE_TABS = [
  { id: "total", label: "Тотал" },
  { id: "site", label: "Сайт" },
  { id: "cafe", label: "Кафе" },
  { id: "kc", label: "КЦ" },
];

export const SALES_SOURCE_KEYS = SALES_SOURCE_TABS.filter((item) => item.id !== "total").map(
  (item) => item.id,
);

export const SALES_SOURCE_LABELS = SALES_SOURCE_TABS.reduce((labels, item) => {
  labels[item.id] = item.label;
  return labels;
}, {});

const PIZZA_CAPACITY = 24000;
const ROLLY_CAPACITY = 200000;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calcPercent = (numerator, denominator) => {
  const safeDenominator = toNumber(denominator);
  if (!safeDenominator) return 0;
  return (toNumber(numerator) / safeDenominator) * 100;
};

const getFirstDefinedPercent = (...values) => {
  const value = values.find((item) => item !== null && item !== undefined);
  return value !== undefined ? toNumber(value) : null;
};

const getPlanLoad = (value, plan, capacity) => {
  if (value !== null && value !== undefined) return toNumber(value);
  return calcPercent(plan, capacity);
};

const getFactYoYPercent = (current, previousYear, backendValue) => {
  const value = getFirstDefinedPercent(backendValue);
  if (value !== null) return value;
  return calcPercent(toNumber(current) - toNumber(previousYear), previousYear);
};

export const getPeriodIndex = (year, month) => Number(year) * 12 + Number(month) - 1;

const getEntries = (monthMap) =>
  Object.entries(monthMap ?? {})
    .map(([key, value]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        key,
        value,
        year,
        month,
        periodIndex: getPeriodIndex(year, month),
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.year) &&
        Number.isFinite(item.month) &&
        item.month >= 1 &&
        item.month <= 12,
    )
    .sort((a, b) => a.periodIndex - b.periodIndex);

const getAnnualPlanTotal = (entries, currentYear, includesCurrentYear, getValue) => {
  if (!includesCurrentYear) return null;

  const monthlyPlans = new Map();
  entries.forEach((item) => {
    if (item.year !== currentYear) return;
    const value = getValue(item.value);
    if (value === null || value === undefined || value === "") return;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) monthlyPlans.set(item.month, parsed);
  });

  if (monthlyPlans.size !== 12) return null;
  return [...monthlyPlans.values()].reduce((sum, value) => sum + value, 0);
};

export const buildDynamicSaleView = ({
  monthMap,
  selectedStartIndex,
  selectedEndIndex,
  currentYear,
  includesCurrentYear,
}) => {
  const pizza = [];
  const rolly = [];
  const orders = [];
  const accounts = [];
  const entries = getEntries(monthMap);

  entries.forEach((entry, index) => {
    const { key, value, year, month, periodIndex } = entry;
    const previous = entries[index - 1]?.value;
    const isVisible = periodIndex >= selectedStartIndex && periodIndex <= selectedEndIndex;
    if (!isVisible || !previous) return;

    pizza.push({
      periodKey: key,
      year: String(year),
      monthNumber: month,
      month: value.month_name,
      planQty: value.pizza_plan,
      planLoad: getPlanLoad(value.pizza_plan_load, value.pizza_plan, PIZZA_CAPACITY),
      factQty: value.pizza,
      planFact:
        getFirstDefinedPercent(value.pizza_plan_fact) ?? calcPercent(value.pizza, value.pizza_plan),
      factYoYPct: getFactYoYPercent(value.pizza, value.pizza_fact_prev_year, value.pizza_fact_yoy),
      factYoYQty:
        value.pizza_fact_yoy_delta !== null && value.pizza_fact_yoy_delta !== undefined
          ? toNumber(value.pizza_fact_yoy_delta)
          : toNumber(value.pizza) - toNumber(value.pizza_fact_prev_year),
      factDynPct: calcPercent(toNumber(value.pizza) - toNumber(previous.pizza), previous.pizza),
      factDynQty: toNumber(value.pizza) - toNumber(previous.pizza),
      factLoad:
        getFirstDefinedPercent(value.pizza_fact_load) ?? calcPercent(value.pizza, PIZZA_CAPACITY),
    });

    rolly.push({
      periodKey: key,
      year: String(year),
      monthNumber: month,
      month: value.month_name,
      planQty: value.rolly_plan,
      planLoad: getPlanLoad(value.rolly_plan_load, value.rolly_plan, ROLLY_CAPACITY),
      factQty: value.rolly,
      planFact:
        getFirstDefinedPercent(value.rolly_plan_fact) ?? calcPercent(value.rolly, value.rolly_plan),
      factYoYPct: getFactYoYPercent(value.rolly, value.rolly_fact_prev_year, value.rolly_fact_yoy),
      factYoYQty:
        value.rolly_fact_yoy_delta !== null && value.rolly_fact_yoy_delta !== undefined
          ? toNumber(value.rolly_fact_yoy_delta)
          : toNumber(value.rolly) - toNumber(value.rolly_fact_prev_year),
      factDynPct: calcPercent(toNumber(value.rolly) - toNumber(previous.rolly), previous.rolly),
      factDynQty: toNumber(value.rolly) - toNumber(previous.rolly),
      factLoad:
        getFirstDefinedPercent(value.rolly_fact_load) ?? calcPercent(value.rolly, ROLLY_CAPACITY),
    });

    orders.push({
      periodKey: key,
      year: String(year),
      monthNumber: month,
      month: value.month_name,
      planQty: value.orders_plan ?? value.order_plan,
      planLoad:
        getFirstDefinedPercent(
          value.orders_plan_fact,
          value.order_plan_fact,
          value.orders_fact_plan,
          value.order_fact_plan,
        ) ?? calcPercent(value.orders, value.orders_plan ?? value.order_plan),
      factQty: value.orders,
      factYoYPct: getFactYoYPercent(
        value.orders,
        value.orders_fact_prev_year ?? value.order_fact_prev_year,
        value.orders_fact_yoy ?? value.order_fact_yoy,
      ),
      factYoYQty:
        value.orders_fact_yoy_delta !== null && value.orders_fact_yoy_delta !== undefined
          ? toNumber(value.orders_fact_yoy_delta)
          : toNumber(value.order_fact_yoy_delta) ||
            toNumber(value.orders) -
              toNumber(value.orders_fact_prev_year ?? value.order_fact_prev_year),
      factDynPct: calcPercent(toNumber(value.orders) - toNumber(previous.orders), previous.orders),
      factDynQty: toNumber(value.orders) - toNumber(previous.orders),
      factLoad: calcPercent(value.orders, previous.orders),
    });

    accounts.push({
      periodKey: key,
      year: String(year),
      monthNumber: month,
      month: value.month_name,
      planQty: value.active_plan,
      planLoad: calcPercent(value.active, value.active_plan),
      factQty: value.active,
      factDynPct: calcPercent(toNumber(value.active) - toNumber(previous.active), previous.active),
      factDynQty: toNumber(value.active) - toNumber(previous.active),
      factLoad: calcPercent(value.active, previous.active),
    });
  });

  return {
    pizza,
    rolly,
    orders,
    accounts,
    annualPlanTotals: {
      orders: getAnnualPlanTotal(
        entries,
        currentYear,
        includesCurrentYear,
        (value) => value.orders_plan ?? value.order_plan,
      ),
      rolly: getAnnualPlanTotal(
        entries,
        currentYear,
        includesCurrentYear,
        (value) => value.rolly_plan,
      ),
      pizza: getAnnualPlanTotal(
        entries,
        currentYear,
        includesCurrentYear,
        (value) => value.pizza_plan,
      ),
    },
  };
};

export const indexRowsByPeriod = (rows = []) =>
  rows.reduce((result, row) => {
    if (row?.periodKey) result[row.periodKey] = row;
    return result;
  }, {});
