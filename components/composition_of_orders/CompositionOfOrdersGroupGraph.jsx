"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";

export default function CompositionOfOrdersGroupGraph({ data, metrics }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    root.locale = am5locales_ru_RU;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    // X axis
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );
    const xTip = am5.Tooltip.new(root, { pointerOrientation: "horizontal" });
    xTip.label.setAll({ text: "{value.formatDate('dd MMM')}" });
    xAxis.set("tooltip", xTip);

    // Y axis for numeric values
    const valueAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        numberFormat: "#,###",
        min: 0,
      })
    );

    // Y axis for percents
    const percentAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: "#'%'",
      })
    );

    const axisMap = {
      group_count: valueAxis,
      group_sum: valueAxis,
      count_percent: percentAxis,
      sum_percent: percentAxis,
    };

    // Leave raw values as-is (no normalization)
    const seriesData = data?.map((d) => ({
      date: new Date(d.date).getTime(),
      group_count: d.group_count,
      group_sum: d.group_sum,
      count_percent: d.count_percent,
      sum_percent: d.sum_percent,
    }));

    metrics.forEach(({ key, label, color }) => {
      const series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: label,
          xAxis,
          yAxis: axisMap[key],
          valueYField: key,
          valueXField: "date",
          stroke: am5.color(color),
          tension: 0.3,
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: {valueY.formatNumber('#.##')}",
          }),
        })
      );

      series.strokes.template.setAll({ strokeWidth: 2 });
      series.data.setAll(seriesData);
    });

    // Cursor and legend
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.snapToSeries = chart.series.values;
    cursor.lineY.set("visible", false);

    chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));

    return () => root.dispose();
  }, [data, metrics]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: 400 }}
    />
  );
}
