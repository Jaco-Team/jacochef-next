"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

import { api_laravel } from "@/src/api_new";
import {
  JacoButton,
  JacoCityCafe,
  JacoDatePicker,
  JacoSegmentedTabs,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";

import DashboardBlock from "./DashboardBlock";
import DashboardCafeRating from "./DashboardCafeRating";
import DashboardDonut from "./DashboardDonut";
import DashboardHoursHeatmap from "./DashboardHoursHeatmap";
import DashboardKpiCards from "./DashboardKpiCards";
import DashboardSalesTable from "./DashboardSalesTable";
import DashboardTrendChart, { TrendLegend } from "./DashboardTrendChart";
import { CHART_PALETTE, formatDecimal, formatInt, OTHER_COLOR, pluralRu, roundShares } from "./dashboardFormat";

const MODULE = "stat_sale";
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const SALES_TABS = [
  { id: "categories", label: "Категории", header: "Категория" },
  { id: "subcategories", label: "Подкатегории", header: "Подкатегория" },
  { id: "items", label: "Товары", header: "Товар" },
];

const SALES_NOTES = {
  categories: "Доля в количестве. Роллы и Пицца — те же цифры, что в карточках. Блюда — без соусов и напитков.",
  subcategories: "Доля в количестве. Позиции меню как на сайте, сет считается одной позицией.",
  items: "Топ-10 по количеству, без соусов. Доля — от всех проданных позиций.",
};

const HOURS_TABS = [
  { id: "orders", label: "Заказы" },
  { id: "rolls", label: "Роллы" },
  { id: "pizza", label: "Пицца" },
];

const CHART_SOURCE_TABS = [
  { id: "total", label: "Общие" },
  { id: "site", label: "Сайт" },
  { id: "cafe", label: "Кафе" },
  { id: "kc", label: "КЦ" },
];

// Цвета закреплены за направлениями, чтобы не менялись при переключении карточек.
const SOURCE_COLORS = {
  site: CHART_PALETTE[0],
  cafe: CHART_PALETTE[1],
  kc: CHART_PALETTE[2],
};

// Метрики-суммы: по ним считается доля направления. У средних доли нет, в кольце — доля заказов.
const ADDITIVE_METRICS = ["orders", "rolls", "pizza", "revenue"];

const COUNT_COLUMN = { header: "Кол-во, шт", format: formatInt };
const SOURCE_VALUE_COLUMNS = {
  revenue: { header: "Выручка, ₽", format: formatInt },
  avg_check: { header: "Ср. чек, ₽", format: formatInt },
  orders_per_client: { header: "Ср. заказ на акт. акк.", format: (value) => formatDecimal(value, 2) },
};

function sourceUnit(metric, count) {
  if (metric === "orders") return pluralRu(count, ["заказ", "заказа", "заказов"]);
  return metric === "revenue" ? "₽" : "шт";
}

const DAYPART_COLORS = {
  morning: "#F7B8C0",
  day: "#DD1A32",
  evening: "#8E1020",
  night: "#B9BEC6",
};

const GRANULARITY_LABELS = {
  day: "По дням",
  week: "По неделям",
  month: "По месяцам",
};

const emptyBlock = { data: null, loading: false, error: "" };

function defaultPeriod() {
  const end = dayjs().subtract(1, "day");
  return { start: end.startOf("month").format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
}

function dateLabel(value) {
  const date = dayjs(value);
  return `${date.date()} ${MONTHS[date.month()]} ${date.year()}`;
}

function rangeLabel(period) {
  if (!period?.date_start) return "";
  const start = dayjs(period.date_start);
  const end = dayjs(period.date_end);
  if (start.isSame(end, "month")) {
    return `${start.date()}–${end.date()} ${MONTHS[start.month()]} ${start.year()}`;
  }
  return `${dateLabel(period.date_start)} – ${dateLabel(period.date_end)}`;
}

async function requestBlock(method, payload) {
  const response = await api_laravel(MODULE, method, payload);
  const data = response?.data;
  if (!data?.st) {
    throw new Error(data?.text || "Не удалось загрузить данные");
  }
  return data;
}

const fieldBoxSx = { flex: "1 1 180px", minWidth: 160, maxWidth: { sm: 220 } };

// Без CssBaseline у Tabs content-box: лишний отступ снизу и обрезанная тень выбранного таба.
const segmentedSx = (width) => ({
  width: { xs: "100%", sm: width },
  boxSizing: "border-box",
  overflow: "visible",
  "& .MuiTabs-scroller": { overflow: "visible !important" },
});

export default function StatSaleTabDashboard({ points, openAlert }) {
  const initial = useMemo(defaultPeriod, []);
  const [selectedPoints, setSelectedPoints] = useState(points ?? []);
  const [dateStart, setDateStart] = useState(initial.start);
  const [dateEnd, setDateEnd] = useState(initial.end);
  const [metric, setMetric] = useState("orders");
  const [salesTab, setSalesTab] = useState("categories");
  const [hoursMetric, setHoursMetric] = useState("orders");
  const [chartSource, setChartSource] = useState("total");
  const [overview, setOverview] = useState(emptyBlock);
  const [sales, setSales] = useState(emptyBlock);
  const [hours, setHours] = useState(emptyBlock);
  const requestId = useRef(0);
  const loadedOnce = useRef(false);

  const load = useCallback(
    (pointList, start, end) => {
      if (!pointList?.length) {
        openAlert?.(false, "Выберите кафе");
        return;
      }
      if (!start || !end || dayjs(end).isBefore(dayjs(start))) {
        openAlert?.(false, "Проверьте период: дата «до» раньше даты «от»");
        return;
      }

      const id = ++requestId.current;
      const payload = {
        points: pointList.map((point) => ({ id: point.id })),
        date_start: start,
        date_end: end,
      };
      let alerted = false;

      const run = (method, setBlock) => {
        setBlock((prev) => ({ ...prev, loading: true, error: "" }));
        requestBlock(method, payload)
          .then((data) => {
            if (id === requestId.current) setBlock({ data, loading: false, error: "" });
          })
          .catch((error) => {
            if (id !== requestId.current) return;
            setBlock({ data: null, loading: false, error: error.message });
            if (!alerted) {
              alerted = true;
              openAlert?.(false, error.message);
            }
          });
      };

      run("get_dashboard", setOverview);
      run("get_dashboard_sales", setSales);
      run("get_dashboard_hours", setHours);
    },
    [openAlert],
  );

  useEffect(() => {
    if (loadedOnce.current || !points?.length) return;
    loadedOnce.current = true;
    setSelectedPoints(points);
    load(points, initial.start, initial.end);
  }, [points, load, initial]);

  const overviewData = overview.data;
  const cards = overviewData?.cards ?? [];
  const selectedCard = cards.find((card) => card.key === metric) ?? cards[0];
  const metricKey = selectedCard?.key ?? metric;
  const periodLabel = rangeLabel(overviewData?.period);
  const prevYearLabel = rangeLabel(overviewData?.period?.yoy);
  const ratingByEfficiency = selectedCard?.rating_by === "efficiency";
  const anyLoading = overview.loading || sales.loading || hours.loading;

  // Блок «Продажи по направлениям» следует за выбранной карточкой.
  const sourceView = useMemo(() => {
    const list = overviewData?.sources ?? [];
    const additive = ADDITIVE_METRICS.includes(metricKey);
    const shareMetric = additive ? metricKey : "orders";
    const tableShares = additive ? roundShares(list.map((source) => source.metrics?.[metricKey]?.share)) : [];
    const donutShares = roundShares(list.map((source) => source.metrics?.[shareMetric]?.share));

    return {
      additive,
      column: SOURCE_VALUE_COLUMNS[metricKey] ?? COUNT_COLUMN,
      rows: list.map((source, index) => {
        const values = source.metrics?.[metricKey] ?? {};
        return {
          key: `source-${source.key}`,
          name: source.name,
          color: SOURCE_COLORS[source.key] ?? OTHER_COLOR,
          count: values.fact,
          share: additive ? values.share : null,
          shareRounded: additive ? tableShares[index] : null,
          mom: values.mom,
          yoy: values.yoy,
        };
      }),
      donutItems: list.map((source, index) => {
        const values = source.metrics?.[shareMetric] ?? {};
        return {
          key: `source-${source.key}`,
          name: source.name,
          color: SOURCE_COLORS[source.key] ?? OTHER_COLOR,
          share: values.share ?? 0,
          shareRounded: donutShares[index],
          count: values.fact,
          unit: sourceUnit(shareMetric, values.fact),
        };
      }),
    };
  }, [overviewData, metricKey]);

  const salesTabConfig = SALES_TABS.find((tab) => tab.id === salesTab) ?? SALES_TABS[0];
  const { salesRows, salesOther } = useMemo(() => {
    const list = sales.data?.[salesTabConfig.id] ?? [];
    const other = salesTabConfig.id === "items" ? (sales.data?.items_other ?? null) : null;
    // Целые доли считаются по всему списку сразу, вместе с «Остальными», чтобы сумма оставалась 100.
    const shares = roundShares([...list.map((row) => row.share), ...(other ? [other.share] : [])]);
    // Цвет по месту в рейтинге: самая крупная строка — основной красный, точки таблицы совпадают с кольцом.
    const rankByIndex = new Map(
      list
        .map((row, index) => ({ index, count: Number(row.count) || 0 }))
        .sort((a, b) => b.count - a.count)
        .map((item, rank) => [item.index, rank]),
    );
    const rows = list.map((row, index) => {
      let hint;
      if (salesTabConfig.id === "items") hint = row.category_name;
      if (salesTabConfig.id === "subcategories" && row.parent_name !== row.name) hint = row.parent_name;
      return {
        key: `${salesTabConfig.id}-${row.key ?? row.id}`,
        name: row.name,
        hint,
        color: CHART_PALETTE[rankByIndex.get(index) % CHART_PALETTE.length],
        count: row.count,
        share: row.share,
        shareRounded: shares[index],
        mom: row.mom,
        yoy: row.yoy,
      };
    });

    return {
      salesRows: rows,
      salesOther: other ? { ...other, shareRounded: shares[list.length] } : null,
    };
  }, [sales.data, salesTabConfig.id]);

  const salesDonutItems = useMemo(() => {
    const items = salesRows.map((row) => ({
      key: row.key,
      name: row.name,
      detail: row.hint,
      share: row.share,
      shareRounded: row.shareRounded,
      count: row.count,
      color: row.color,
    }));
    if (salesOther) {
      items.push({
        key: "items-other",
        name: "Остальные товары",
        share: salesOther.share,
        shareRounded: salesOther.shareRounded,
        count: salesOther.count,
        color: OTHER_COLOR,
        last: true,
      });
    }
    return items;
  }, [salesRows, salesOther]);

  const hoursData = hours.data?.metrics?.[hoursMetric];
  const dayparts = hoursData?.dayparts ?? [];
  const daypartShares = roundShares(dayparts.map((part) => part.share));
  const daypartItems = dayparts.map((part, index) => ({
    key: part.key,
    name: part.name,
    hint: part.hours,
    share: part.share,
    shareRounded: daypartShares[index],
    count: part.count,
    unit: hoursMetric === "orders" ? pluralRu(part.count, ["заказ", "заказа", "заказов"]) : "шт",
    color: DAYPART_COLORS[part.key] ?? OTHER_COLOR,
  }));
  const hoursMetricLabel = HOURS_TABS.find((tab) => tab.id === hoursMetric)?.label ?? "";

  return (
    <Grid
      size={{ xs: 12 }}
      sx={{ pt: 0 }}
    >
      <Box
        className="v2-module"
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, fontSize: 14 }}
      >
        <JacoSurface
          component="section"
          aria-label="Фильтры дашборда"
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          <Box sx={{ flex: "1 1 280px", maxWidth: 440, minWidth: 0 }}>
            <JacoCityCafe
              label="Кафе"
              placeholder="Выберите кафе"
              withAll
              withOrganizationMode={false}
              points={points ?? []}
              value={selectedPoints}
              onChange={(value) => setSelectedPoints(value || [])}
            />
          </Box>
          <Box sx={fieldBoxSx}>
            <JacoDatePicker
              label="Период от"
              value={dateStart}
              maxDate={dateEnd || undefined}
              onChange={(value) => setDateStart(value?.format?.("YYYY-MM-DD") || "")}
            />
          </Box>
          <Box sx={fieldBoxSx}>
            <JacoDatePicker
              label="до"
              value={dateEnd}
              minDate={dateStart || undefined}
              onChange={(value) => setDateEnd(value?.format?.("YYYY-MM-DD") || "")}
            />
          </Box>
          <JacoButton
            loading={anyLoading}
            onClick={() => load(selectedPoints, dateStart, dateEnd)}
            sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }}
          >
            Показать
          </JacoButton>
        </JacoSurface>

        <DashboardKpiCards
          cards={cards}
          selected={metricKey}
          onSelect={setMetric}
          loading={overview.loading}
        />

        <Grid
          container
          spacing={2.5}
        >
          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardBlock
              title={`Динамика · ${selectedCard?.title ?? "Заказы"}`}
              subtitle={
                overviewData
                  ? `${GRANULARITY_LABELS[overviewData.chart?.granularity] ?? ""} · выбранный период и тот же период прошлого года`
                  : undefined
              }
              actions={
                overviewData ? (
                  <TrendLegend
                    currentLabel={periodLabel}
                    prevLabel={prevYearLabel}
                  />
                ) : null
              }
              toolbar={
                <JacoSegmentedTabs
                  size="compact"
                  items={CHART_SOURCE_TABS}
                  value={chartSource}
                  onChange={(_, value) => setChartSource(value)}
                  sx={segmentedSx(420)}
                />
              }
              loading={overview.loading}
              error={overview.error}
              hasData={Boolean(overviewData?.chart?.points?.length)}
              minHeight={300}
            >
              <DashboardTrendChart
                points={overviewData?.chart?.points}
                metric={metricKey}
                source={chartSource}
                currentName={periodLabel}
                prevName={prevYearLabel}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardBlock
              title="Выполнение плана по кафе"
              subtitle={
                selectedCard
                  ? `${selectedCard.title} · ${ratingByEfficiency ? "факт к плану, %" : "г/г, %"}`
                  : undefined
              }
              loading={overview.loading}
              error={overview.error}
              hasData={Boolean(overviewData?.cafes?.length)}
              minHeight={300}
            >
              <DashboardCafeRating
                cafes={overviewData?.cafes}
                metric={metricKey}
                ratingBy={selectedCard?.rating_by}
              />
              <Typography component="div" sx={{ mt: 2, fontSize: 12, lineHeight: 1.45, color: uiColors.text }}>
                {ratingByEfficiency
                  ? "Черта показывает 100% доли кафе в месячном плане сети за выбранные дни."
                  : "Для показателей без цели — изменение к тому же периоду прошлого года."}
              </Typography>
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardBlock
              title="Продажи по направлениям"
              subtitle={
                selectedCard
                  ? `${selectedCard.title} · ${sourceView.additive ? "сайт, кафе и колл-центр" : "доля для средних показателей не считается"}`
                  : undefined
              }
              loading={overview.loading}
              error={overview.error}
              hasData={sourceView.rows.length > 0}
              minHeight={160}
            >
              <DashboardSalesTable
                key={`sources-${metricKey}`}
                rows={sourceView.rows}
                nameHeader="Направление"
                valueHeader={sourceView.column.header}
                formatValue={sourceView.column.format}
                defaultSort={null}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardBlock
              title="Структура по направлениям"
              subtitle={
                selectedCard ? (sourceView.additive ? `Доля · ${selectedCard.title}` : "Доля заказов") : undefined
              }
              loading={overview.loading}
              error={overview.error}
              hasData={sourceView.donutItems.length > 0}
              minHeight={160}
            >
              <DashboardDonut
                items={sourceView.donutItems}
                ariaLabel="Структура продаж по направлениям"
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardBlock
              title="Продажи по категориям и блюдам"
              subtitle={SALES_NOTES[salesTabConfig.id]}
              toolbar={
                <JacoSegmentedTabs
                  size="compact"
                  items={SALES_TABS}
                  value={salesTabConfig.id}
                  onChange={(_, value) => setSalesTab(value)}
                  sx={segmentedSx(420)}
                />
              }
              loading={sales.loading}
              error={sales.error}
              hasData={salesRows.length > 0}
              minHeight={220}
            >
              <DashboardSalesTable
                key={salesTabConfig.id}
                rows={salesRows}
                nameHeader={salesTabConfig.header}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardBlock
              title="Структура продаж"
              subtitle={`Доля в количестве · ${salesTabConfig.label}`}
              loading={sales.loading}
              error={sales.error}
              hasData={salesDonutItems.length > 0}
              minHeight={220}
            >
              <DashboardDonut
                items={salesDonutItems}
                ariaLabel={`Структура продаж: ${salesTabConfig.label}`}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardBlock
              title="Продажи по дням недели и часам, г/г"
              subtitle={
                hours.data
                  ? `Изменение к тем же дням недели прошлого года, % · ${rangeLabel(hours.data.period)} к ${rangeLabel(hours.data.prev_period)}`
                  : undefined
              }
              toolbar={
                <JacoSegmentedTabs
                  size="compact"
                  items={HOURS_TABS}
                  value={hoursMetric}
                  onChange={(_, value) => setHoursMetric(value)}
                  sx={segmentedSx(320)}
                />
              }
              loading={hours.loading}
              error={hours.error}
              hasData={Boolean(hoursData?.grid?.length)}
              minHeight={340}
            >
              <DashboardHoursHeatmap
                grid={hoursData?.grid ?? []}
                slots={hours.data?.slots ?? []}
                colors={hours.data?.colors ?? []}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardBlock
              title="Доля по времени суток"
              subtitle={`${hoursMetricLabel} · доля объёма выбранного периода`}
              loading={hours.loading}
              error={hours.error}
              hasData={daypartItems.length > 0}
              minHeight={220}
            >
              <DashboardDonut
                items={daypartItems}
                ariaLabel={`Доля по времени суток: ${hoursMetricLabel}`}
              />
            </DashboardBlock>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}
