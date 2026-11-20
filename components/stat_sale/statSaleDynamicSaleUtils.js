export const SALES_SOURCE_TABS = [
  { id: "total", label: "Общие данные" },
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

const METRIC_LINE_FIELDS = {
  orders: "orders",
  rolly: "rolly",
  pizza: "pizza",
};

export const buildMetricLineMap = (monthMap, metric) => {
  const field = METRIC_LINE_FIELDS[metric];
  if (!field || !monthMap || typeof monthMap !== "object") return {};

  return Object.entries(monthMap).reduce((line, [key, value]) => {
    const raw = value?.[field];
    if (raw === null || raw === undefined || raw === "") return line;

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) line[key] = parsed;
    return line;
  }, {});
};

export const mergeLineMaps = (primary, fallback) => ({
  ...(fallback && typeof fallback === "object" ? fallback : {}),
  ...(primary && typeof primary === "object" ? primary : {}),
});

const MONTH_NAMES_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const DYNAMICS_SOURCE_FIELDS = {
  site: "res_site",
  cafe: "res_cafe",
  kc: "res_kc",
};

const SALE_SOURCE_BY_PARAMETER = {
  сайт: "site",
  кафе: "cafe",
  кц: "kc",
  "контакт-центр": "kc",
  "контакт центр": "kc",
  тотал: "total",
  итого: "total",
  все: "total",
  "все кафе": "total",
};

const readNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const roundMetric = (value, decimals) => {
  const parsed = readNumber(value);
  if (parsed === null) return null;
  const factor = 10 ** decimals;
  return Math.round(parsed * factor) / factor;
};

const parseMonthKey = (value) => {
  const match = String(value ?? "").match(/^(\d{4})-(\d{1,2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;

  return { year, month, key: `${year}-${month}` };
};

const emptySourceMaps = () => ({ site: {}, cafe: {}, kc: {} });

const mapMonthFacts = (monthMap, getMetric) => {
  const result = {};

  Object.entries(monthMap ?? {}).forEach(([key, value]) => {
    const period = parseMonthKey(key);
    if (!period || !value || typeof value !== "object") return;

    const metric = getMetric(value);
    if (!metric || metric.fact === undefined) return;

    result[period.key] = {
      fact: metric.fact,
      plan: metric.plan ?? null,
      month_name: value.month_name || MONTH_NAMES_RU[period.month - 1],
    };
  });

  return result;
};

const firstMetricMap = (...maps) => {
  const result = {};

  maps.forEach((map) => {
    Object.entries(map ?? {}).forEach(([key, value]) => {
      if (result[key] || value?.fact === undefined) return;
      result[key] = value;
    });
  });

  return result;
};

const explicitOrdersPerActive = (value) => {
  const fact = readNumber(value?.orders_per_active);
  if (fact === null) return null;

  return {
    fact,
    plan: readNumber(value?.orders_per_active_plan),
  };
};

const derivedOrdersPerActive = (value) => {
  const orders = readNumber(value?.orders ?? value?.order);
  const activeAccounts = readNumber(value?.active ?? value?.register ?? value?.registred);
  if (orders === null || !activeAccounts) return null;

  return {
    fact: roundMetric(orders / activeAccounts, 2),
    plan: null,
  };
};

const ordersPerActiveMetric = (value) => {
  if (value?.orders_per_active === null || readNumber(value?.orders ?? value?.order) === 0) {
    return { fact: null };
  }
  return explicitOrdersPerActive(value) ?? derivedOrdersPerActive(value);
};

const efficiencyMetric = (value) => {
  const fact = readNumber(value?.percent_fact ?? value?.effect);
  if (fact !== null) {
    return {
      fact,
      plan: readNumber(value?.effect_plan ?? value?.percent_fact_plan),
    };
  }

  const orderFact = readNumber(value?.orders ?? value?.order);
  const orderPlan = readNumber(value?.orders_plan ?? value?.order_plan);
  if (orderFact === null || !orderPlan) return null;

  return {
    fact: roundMetric(calcPercent(orderFact, orderPlan), 2),
    plan: 100,
  };
};

const revenueMetric = (value) => {
  const fact = readNumber(value?.summ);
  if (fact === null) return null;

  return {
    fact,
    plan: readNumber(value?.summ_plan),
  };
};

const averageCheckMetric = (value) => {
  const explicit = readNumber(value?.average_check);
  if (explicit !== null) {
    return {
      fact: explicit,
      plan: readNumber(value?.average_check_plan),
    };
  }

  const summ = readNumber(value?.summ);
  const orders = readNumber(value?.orders ?? value?.order);
  if (summ === null || !orders) return null;

  return {
    fact: roundMetric(summ / orders, 0),
    plan: null,
  };
};

const buildClientsMetricMaps = (dataList) => {
  const buckets = {};
  const tables = Array.isArray(dataList) ? dataList : [];

  tables.forEach((table) => {
    if (!Array.isArray(table)) return;

    const pointItems = table.filter((item) => item?.point_id);
    const sourceItems = pointItems.length ? pointItems : table;

    sourceItems.forEach((item) => {
      const period = parseMonthKey(item?.month);
      if (!period) return;

      if (!buckets[period.key]) {
        buckets[period.key] = {
          orders: 0,
          summ: 0,
          hasOrders: false,
          hasSumm: false,
        };
      }

      const bucket = buckets[period.key];
      const orders = readNumber(item?.orders);
      const summ = readNumber(item?.summ);

      if (orders !== null) {
        bucket.orders += orders;
        bucket.hasOrders = true;
      }
      if (summ !== null) {
        bucket.summ += summ;
        bucket.hasSumm = true;
      }
    });
  });

  const revenue = {};
  const averageCheck = {};

  Object.entries(buckets).forEach(([key, bucket]) => {
    const period = parseMonthKey(key);
    if (!period) return;

    const month_name = MONTH_NAMES_RU[period.month - 1];

    if (bucket.hasSumm) {
      revenue[key] = { fact: bucket.summ, plan: null, month_name };
    }
    if (bucket.hasSumm && bucket.hasOrders && bucket.orders) {
      averageCheck[key] = {
        fact: roundMetric(bucket.summ / bucket.orders, 0),
        plan: null,
        month_name,
      };
    }
  });

  return { revenue, averageCheck };
};

const buildSaleEfficiencyMaps = (saleList) => {
  const maps = { total: {}, ...emptySourceMaps() };
  const rows = Array.isArray(saleList?.rows) ? saleList.rows : [];

  rows.forEach((row) => {
    const label = String(row?.parameter ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const source = SALE_SOURCE_BY_PARAMETER[label];
    if (!source || !row?.data || typeof row.data !== "object") return;

    Object.entries(row.data).forEach(([rawMonth, cell]) => {
      const period = parseMonthKey(rawMonth);
      const fact = readNumber(cell?.percent_fact);
      if (!period || fact === null) return;

      maps[source][period.key] = {
        fact,
        plan: null,
        month_name: MONTH_NAMES_RU[period.month - 1],
      };
    });
  });

  return maps;
};

const paySourceMaps = (payRes, getMetric) => ({
  total: mapMonthFacts(payRes?.res, getMetric),
  sources: SALES_SOURCE_KEYS.reduce((sources, source) => {
    sources[source] = mapMonthFacts(payRes?.res_by_source?.[source], getMetric);
    return sources;
  }, emptySourceMaps()),
});

const dynamicsSourceMaps = (dynamicsRes, getMetric) => {
  if (!dynamicsRes?.st) {
    return { total: {}, sources: emptySourceMaps() };
  }

  return {
    total: mapMonthFacts(dynamicsRes.res, getMetric),
    sources: SALES_SOURCE_KEYS.reduce((sources, source) => {
      sources[source] = mapMonthFacts(dynamicsRes[DYNAMICS_SOURCE_FIELDS[source]], getMetric);
      return sources;
    }, emptySourceMaps()),
  };
};

export const buildScalarMetricView = ({ monthMap, selectedStartIndex, selectedEndIndex }) => {
  const rows = [];
  const entries = getEntries(monthMap);
  const byPeriod = new Map(entries.map((entry) => [entry.periodIndex, entry]));

  entries.forEach((entry) => {
    const { key, value, year, month, periodIndex } = entry;
    if (periodIndex < selectedStartIndex || periodIndex > selectedEndIndex) return;

    const fact = readNumber(value?.fact);
    const plan = readNumber(value?.plan);
    const previous = byPeriod.get(periodIndex - 1);
    const previousYear = byPeriod.get(periodIndex - 12);
    const prevFact = previous ? readNumber(previous.value?.fact) : null;
    const prevYearFact = previousYear ? readNumber(previousYear.value?.fact) : null;
    const monthDelta = fact !== null && prevFact !== null ? fact - prevFact : null;
    const yearDelta = fact !== null && prevYearFact !== null ? fact - prevYearFact : null;
    const planPercent = fact !== null && plan ? calcPercent(fact, plan) : null;

    rows.push({
      periodKey: key,
      year: String(year),
      monthNumber: month,
      month: value?.month_name || MONTH_NAMES_RU[month - 1],
      planQty: plan,
      planLoad: planPercent,
      factQty: fact,
      planFact: planPercent,
      factYoYPct: yearDelta === null ? null : calcPercent(yearDelta, prevYearFact),
      factYoYQty: yearDelta,
      factDynPct: monthDelta === null ? null : calcPercent(monthDelta, prevFact),
      factDynQty: monthDelta,
      factLoad: planPercent,
    });
  });

  return rows;
};

export const rowsToLineMap = (rows = []) =>
  rows.reduce((line, row) => {
    const fact = readNumber(row?.factQty);
    if (row?.periodKey && fact !== null) line[row.periodKey] = fact;
    return line;
  }, {});

const viewPair = (totalMap, sourceMaps, selectedStartIndex, selectedEndIndex) => ({
  total: buildScalarMetricView({ monthMap: totalMap, selectedStartIndex, selectedEndIndex }),
  sources: SALES_SOURCE_KEYS.reduce((sources, source) => {
    sources[source] = buildScalarMetricView({
      monthMap: sourceMaps?.[source],
      selectedStartIndex,
      selectedEndIndex,
    });
    return sources;
  }, {}),
});

const linePair = (rows) => ({
  total: rowsToLineMap(rows.total),
  sources: SALES_SOURCE_KEYS.reduce((sources, source) => {
    sources[source] = rowsToLineMap(rows.sources[source]);
    return sources;
  }, {}),
});

export const assembleExtraSaleMetrics = ({
  payRes,
  clientsRes,
  saleRes,
  dynamicsRes,
  selectedStartIndex,
  selectedEndIndex,
}) => {
  const clients = buildClientsMetricMaps(clientsRes?.st ? clientsRes.data_list : null);
  const monthlyAverages = clientsRes?.st ? clientsRes.orders_per_active_by_month : null;
  // Сохраняем строки таблицы даже при отсутствии значения за месяц.
  const totalOrdersPerActive = mapMonthFacts(payRes?.res, () => ({ fact: null }));
  for (const [month, average] of Object.entries(monthlyAverages ?? {})) {
    const period = parseMonthKey(month);
    if (period) totalOrdersPerActive[period.key] = { fact: readNumber(average) };
  }
  const ordersPerActiveBySource = {};
  for (const source of SALES_SOURCE_KEYS) {
    const dynamicsMonths = dynamicsRes?.st ? dynamicsRes[DYNAMICS_SOURCE_FIELDS[source]] : null;
    ordersPerActiveBySource[source] = firstMetricMap(
      mapMonthFacts(payRes?.res_by_source?.[source], ordersPerActiveMetric),
      mapMonthFacts(dynamicsMonths, ordersPerActiveMetric),
    );
  }
  const sale = saleRes?.st
    ? buildSaleEfficiencyMaps(saleRes.data_sale_list)
    : { total: {}, ...emptySourceMaps() };
  const payEfficiency = paySourceMaps(payRes, efficiencyMetric);
  const payRevenue = paySourceMaps(payRes, revenueMetric);
  const payAverageCheck = paySourceMaps(payRes, averageCheckMetric);
  const dynamicsEfficiency = dynamicsSourceMaps(dynamicsRes, efficiencyMetric);
  const dynamicsRevenue = dynamicsSourceMaps(dynamicsRes, revenueMetric);
  const dynamicsAverageCheck = dynamicsSourceMaps(dynamicsRes, averageCheckMetric);

  const metrics = {
    ordersPerActive: viewPair(
      totalOrdersPerActive,
      ordersPerActiveBySource,
      selectedStartIndex,
      selectedEndIndex,
    ),
    efficiency: viewPair(
      firstMetricMap(sale.total, payEfficiency.total, dynamicsEfficiency.total),
      {
        site: firstMetricMap(
          sale.site,
          payEfficiency.sources.site,
          dynamicsEfficiency.sources.site,
        ),
        cafe: firstMetricMap(
          sale.cafe,
          payEfficiency.sources.cafe,
          dynamicsEfficiency.sources.cafe,
        ),
        kc: firstMetricMap(sale.kc, payEfficiency.sources.kc, dynamicsEfficiency.sources.kc),
      },
      selectedStartIndex,
      selectedEndIndex,
    ),
    revenue: viewPair(
      firstMetricMap(clients.revenue, payRevenue.total, dynamicsRevenue.total),
      {
        site: firstMetricMap(payRevenue.sources.site, dynamicsRevenue.sources.site),
        cafe: firstMetricMap(payRevenue.sources.cafe, dynamicsRevenue.sources.cafe),
        kc: firstMetricMap(payRevenue.sources.kc, dynamicsRevenue.sources.kc),
      },
      selectedStartIndex,
      selectedEndIndex,
    ),
    averageCheck: viewPair(
      firstMetricMap(clients.averageCheck, payAverageCheck.total, dynamicsAverageCheck.total),
      {
        site: firstMetricMap(payAverageCheck.sources.site, dynamicsAverageCheck.sources.site),
        cafe: firstMetricMap(payAverageCheck.sources.cafe, dynamicsAverageCheck.sources.cafe),
        kc: firstMetricMap(payAverageCheck.sources.kc, dynamicsAverageCheck.sources.kc),
      },
      selectedStartIndex,
      selectedEndIndex,
    ),
  };

  return {
    rows: metrics,
    lines: Object.keys(metrics).reduce((lines, metric) => {
      lines[metric] = linePair(metrics[metric]);
      return lines;
    }, {}),
  };
};
