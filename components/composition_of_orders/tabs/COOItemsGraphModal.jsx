"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Grid,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import useCompositionOfOrdersStore from "../store/useCompositionOfOrdersStore";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";
import { MyAutoCompleteWithAll } from "@/ui/Forms";

//  helpers
const colorForId = (rawId) => {
  const id = String(rawId);
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `#${hslToHex(hue, 70, 55)}`;
};
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)]
    .map((x) =>
      Math.round(255 * x)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

function groupByStep(data, step) {
  if (step === "day") return data;
  const map = new Map();
  const keyOf = (iso) => {
    const d = new Date(iso);
    if (step === "week") {
      const year = d.getFullYear();
      const firstJan = new Date(year, 0, 1);
      const w = Math.ceil(((d - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
      return `${year}-W${w}`;
    }
    if (step === "month") return `${d.getFullYear()}-${d.getMonth() + 1}`;
    return iso;
  };
  for (const r of data) {
    const key = `${keyOf(r.date)}::${r.id}`;
    const prev = map.get(key) || { date: r.date, id: r.id, name: r.name, qty: 0, sum: 0 };
    prev.qty += r.qty;
    prev.sum += r.sum;
    map.set(key, prev);
  }
  return Array.from(map.values());
}

//  component
export default function COOItemsGraphModal({
  data,
  open,
  onClose,
  itemId,
  title,
  combined = false,
}) {
  const { graph = [], totals = {} } = data || {};

  // normalize
  const normalizedGraph = useMemo(() => {
    const norm = graph.map((g) => ({
      date: g.date,
      id: g.item_id,
      name: g.item_name,
      qty: g.qty,
      sum: g.sum,
    }));

    return norm;
  }, [graph]);

  const itemsList = useMemo(() => {
    const m = new Map();
    normalizedGraph.forEach((r) => m.set(r.id, r.name));
    (totals.items || []).forEach((t) => m.set(t.item_id, t.item_name));
    return Array.from(m, ([id, name]) => ({ id, name }));
  }, [normalizedGraph, totals, combined]);

  const colorMap = useMemo(() => {
    const map = {};
    for (const it of itemsList) map[it.id] = colorForId(it.id);
    return map;
  }, [itemsList]);

  const [step, setStep] = useState("day");
  const [metric, setMetric] = useState("qty");
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!itemsList.length) return;

    if (itemId && !combined) {
      const match = itemsList.find((x) => x.id === itemId);
      if (match) setSelectedItems([match]);
    } else {
      setSelectedItems(itemsList);
    }
  }, [itemId, itemsList, combined]);

  // dataset switch
  const baseData = normalizedGraph;
  const filtered = useMemo(() => {
    const ids = selectedItems.map((i) => i.id);
    const rows = baseData.filter((g) => ids.includes(g.id));
    return groupByStep(rows, step);
  }, [baseData, selectedItems, step]);

  //  amCharts
  const chartRef = useRef(null);
  const chartRootRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !open) return;
    if (chartRootRef.current) {
      chartRootRef.current.dispose();
      chartRootRef.current = null;
    }
    if (!filtered.length) return;

    const root = am5.Root.new(chartRef.current);
    chartRootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);
    root.locale = am5locales_ru_RU;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    const baseInterval =
      step === "week"
        ? { timeUnit: "week", count: 1 }
        : step === "month"
          ? { timeUnit: "month", count: 1 }
          : { timeUnit: "day", count: 1 };

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval,
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
        tooltip: am5.Tooltip.new(root, { pointerOrientation: "horizontal" }),
      }),
    );
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        numberFormat: "#,###",
        min: 0,
      }),
    );

    // build chart data
    const grouped = {};
    for (const r of filtered) {
      const ts = new Date(r.date).getTime();
      if (!grouped[ts]) grouped[ts] = { date: ts };
      grouped[ts][`${metric}_${r.id}`] = r[metric];
    }
    const chartData = Object.values(grouped).sort((a, b) => a.date - b.date);

    const addSeries = (id, name, color) => {
      const c = am5.color(color || "#999");
      const s = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: `${metric}_${id}`,
          valueXField: "date",
          stroke: c,
          tension: 0.3,
          tooltip: am5.Tooltip.new(root, {
            labelText: `{name}: {valueY.formatNumber('#,###')}`,
          }),
        }),
      );
      s.strokes.template.setAll({ strokeWidth: 2, stroke: c });
      s.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: c,
            strokeWidth: 1,
            stroke: root.interfaceColors.get("background"),
          }),
        }),
      );
      s.data.setAll(chartData);
    };

    selectedItems.forEach((it) => addSeries(it.id, it.name, colorMap[it.id]));

    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));

    return () => {
      chartRootRef.current?.dispose();
      chartRootRef.current = null;
    };
  }, [filtered, step, metric, selectedItems, colorMap, open]);

  //  render
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        {title || (combined ? "Динамика продаж (все позиции)" : "Динамика продаж по позициям")}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ mb: 2, py: 1 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <ToggleButtonGroup
              value={step}
              exclusive
              onChange={(_, v) => v && setStep(v)}
              size="small"
            >
              <ToggleButton value="day">День</ToggleButton>
              <ToggleButton value="week">Неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={metric}
              exclusive
              onChange={(_, v) => v && setMetric(v)}
              size="small"
              sx={{ pl: 1 }}
            >
              <ToggleButton value="qty">Количество</ToggleButton>
              <ToggleButton value="sum">Сумма</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MyAutoCompleteWithAll
              label="Позиции для отображения"
              options={itemsList}
              value={selectedItems}
              onChange={(vals) => setSelectedItems(vals)}
              withAll
              withAllSelected={!!combined}
              keepOrder
            />
          </Grid>
        </Grid>

        <Box
          ref={chartRef}
          sx={{ width: "100%", height: 420, borderRadius: 2, overflow: "hidden", mt: 2 }}
        />
      </DialogContent>
    </Dialog>
  );
}
