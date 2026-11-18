"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";

import { uiColors } from "@/design-system/shared/ui";

import { calculateYAxisBounds } from "../utils";
import { formatMetric } from "./dashboardFormat";

const CURRENT_COLOR = 0xdd1a32;
const PREV_COLOR = 0x9ca3af;

function axisFormat(metric) {
  if (metric === "revenue") return "#.#a";
  if (metric === "orders_per_client") return "#.00";
  return "#,###";
}

export function TrendLegend({ currentLabel, prevLabel }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 18px",
        fontSize: 13,
        color: uiColors.text,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 18, height: 3, borderRadius: 2, backgroundColor: uiColors.primary }} />
        {currentLabel}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 18, borderTop: "2px dashed #9CA3AF" }} />
        {prevLabel}
      </Box>
    </Box>
  );
}

const toNumber = (value) => (value === null || value === undefined ? null : Number(value));
const toText = (metric, value) => (value === null || value === undefined ? "—" : formatMetric(metric, value));

/**
 * Линии «выбранный период» и «тот же период прошлого года» по выбранной метрике.
 * source: "total" — все направления, иначе ключ направления из point.by_source (site, cafe, kc).
 */
export default function DashboardTrendChart({ points, metric, source = "total", currentName, prevName }) {
  const chartRef = useRef(null);

  const data = useMemo(
    () =>
      (points ?? []).map((point) => {
        const values = source === "total" ? point : point.by_source?.[source];
        const current = values?.current?.[metric];
        const prev = values?.prev_year?.[metric];

        return {
          label: point.label,
          current: toNumber(current),
          prev: toNumber(prev),
          currentText: toText(metric, current),
          prevText: toText(metric, prev),
        };
      }),
    [points, metric, source],
  );
  const hasValues = data.some((item) => item.current !== null || item.prev !== null);

  useLayoutEffect(() => {
    if (!chartRef.current || !hasValues) return undefined;

    let root;
    let disposed = false;

    const initChart = async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5xy = await import("@amcharts/amcharts5/xy");
      const am5locales_ru_RU = await import("@amcharts/amcharts5/locales/ru_RU");

      if (disposed || !chartRef.current) return;

      root = am5.Root.new(chartRef.current);
      root.locale = am5locales_ru_RU.default;
      root.numberFormatter.setAll({
        numberFormat: "#,###",
        bigNumberPrefixes: [
          { number: 1e3, suffix: " тыс" },
          { number: 1e6, suffix: " млн" },
        ],
      });

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          paddingTop: 8,
          paddingRight: 8,
          paddingBottom: 0,
          paddingLeft: 0,
        }),
      );

      const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 48 });
      xRenderer.grid.template.setAll({ stroke: am5.color(0xe8ebf0), strokeOpacity: 0 });
      xRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(0x5e5e5e),
        paddingTop: 8,
      });
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, { categoryField: "label", renderer: xRenderer }),
      );
      xAxis.data.setAll(data);

      const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 40 });
      yRenderer.grid.template.setAll({ stroke: am5.color(0xe8ebf0), strokeOpacity: 1 });
      yRenderer.labels.template.setAll({ fontSize: 12, fill: am5.color(0x5e5e5e), paddingRight: 8 });
      // Ось по данным, как в «Динамике продаж»: без пустого места под линиями.
      const bounds = calculateYAxisBounds([
        { values: data.map((item) => item.current) },
        { values: data.map((item) => item.prev) },
      ]);
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: bounds.min,
          max: bounds.max,
          strictMinMax: true,
          numberFormat: axisFormat(metric),
          renderer: yRenderer,
        }),
      );

      const createSeries = ({ name, field, textField, color, dashed }) => {
        const tooltip = am5.Tooltip.new(root, {
          getFillFromSprite: false,
          autoTextColor: false,
          labelText: `[bold]{categoryX}[/]\n${name}: [bold]{${textField}}[/]`,
        });
        tooltip.get("background").setAll({
          fill: am5.color(0x1f2937),
          fillOpacity: 0.95,
          stroke: am5.color(color),
          strokeWidth: 2,
          cornerRadius: 8,
        });
        tooltip.label.setAll({ fill: am5.color(0xffffff), fontSize: 12 });

        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name,
            xAxis,
            yAxis,
            categoryXField: "label",
            valueYField: field,
            stroke: am5.color(color),
            fill: am5.color(color),
            tooltip,
          }),
        );
        series.strokes.template.setAll({
          strokeWidth: dashed ? 2 : 2.5,
          strokeDasharray: dashed ? [6, 5] : undefined,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        });
        if (!dashed && data.length <= 62) {
          series.bullets.push(() =>
            am5.Bullet.new(root, {
              sprite: am5.Circle.new(root, {
                radius: data.length > 31 ? 2.5 : 4,
                fill: am5.color(color),
                stroke: am5.color(0xffffff),
                strokeWidth: 1.5,
              }),
            }),
          );
        }
        series.data.setAll(data);
        series.appear(400);
        return series;
      };

      const prevSeries = createSeries({
        name: prevName,
        field: "prev",
        textField: "prevText",
        color: PREV_COLOR,
        dashed: true,
      });
      const currentSeries = createSeries({
        name: currentName,
        field: "current",
        textField: "currentText",
        color: CURRENT_COLOR,
        dashed: false,
      });

      const cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
          xAxis,
          snapToSeries: [currentSeries, prevSeries],
        }),
      );
      cursor.lineY.set("visible", false);
      cursor.lineX.setAll({ stroke: am5.color(0x9ca3af), strokeDasharray: [4, 4] });

      chart.appear(400, 50);
    };

    initChart();

    return () => {
      disposed = true;
      root?.dispose();
    };
  }, [data, hasValues, metric, currentName, prevName]);

  if (!hasValues) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 14,
          color: uiColors.text,
        }}
      >
        По этому направлению показатель не считается
      </Box>
    );
  }

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: 300 }}
    />
  );
}
