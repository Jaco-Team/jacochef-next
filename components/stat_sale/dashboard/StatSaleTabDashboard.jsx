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
import { CHART_PALETTE, OTHER_COLOR, pluralRu } from "./dashboardFormat";

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

  const salesTabConfig = SALES_TABS.find((tab) => tab.id === salesTab) ?? SALES_TABS[0];
  const salesRows = useMemo(() => {
    const list = sales.data?.[salesTabConfig.id] ?? [];
    // Цвет по месту в рейтинге: самая крупная строка — основной красный, точки таблицы совпадают с кольцом.
    const rankByIndex = new Map(
      list
        .map((row, index) => ({ index, count: Number(row.count) || 0 }))
        .sort((a, b) => b.count - a.count)
        .map((item, rank) => [item.index, rank]),
    );
    return list.map((row, index) => {
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
        mom: row.mom,
        yoy: row.yoy,
      };
    });
  }, [sales.data, salesTabConfig.id]);

  const salesDonutItems = useMemo(() => {
    const items = salesRows.map((row) => ({
      key: row.key,
      name: row.name,
      detail: row.hint,
      share: row.share,
      count: row.count,
      color: row.color,
    }));
    if (salesTabConfig.id === "items" && sales.data?.items_other) {
      items.push({
        key: "items-other",
        name: "Остальные товары",
        share: sales.data.items_other.share,
        count: sales.data.items_other.count,
        color: OTHER_COLOR,
        last: true,
      });
    }
    return items;
  }, [salesRows, salesTabConfig.id, sales.data]);

  const hoursData = hours.data?.metrics?.[hoursMetric];
  const daypartItems = (hoursData?.dayparts ?? []).map((part) => ({
    key: part.key,
    name: part.name,
    hint: part.hours,
    share: part.share,
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
              loading={overview.loading}
              error={overview.error}
              hasData={Boolean(overviewData?.chart?.points?.length)}
              minHeight={300}
            >
              <DashboardTrendChart
                points={overviewData?.chart?.points}
                metric={metricKey}
                currentName={periodLabel}
                prevName={prevYearLabel}
              />
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <DashboardBlock
              title="Эффективность кафе"
              subtitle={
                selectedCard
                  ? `${selectedCard.title} · ${ratingByEfficiency ? "факт к цели, %" : "г/г, %"}`
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
                  ? "Цель кафе — равная доля цели сети. Черта — 100%."
                  : "Для показателей без цели — изменение к тому же периоду прошлого года."}
                {overviewData?.cafes?.some((cafe) => cafe.selected)
                  ? " Показаны кафе города, выбранное выделено."
                  : ""}
              </Typography>
            </DashboardBlock>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <DashboardBlock
              title="Продажи по категориям и блюдам"
              subtitle={SALES_NOTES[salesTabConfig.id]}
              actions={
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
              actions={
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
