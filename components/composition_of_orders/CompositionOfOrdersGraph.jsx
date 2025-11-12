"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";

export default function CompositionOfOrdersGraph({ data, rowName, metrics, step }) {
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
        layout: root.verticalLayout,
      }),
    );

    const isWeekly = step === "week";
    const baseInterval = isWeekly ? { timeUnit: "week", count: 1 } : { timeUnit: "day", count: 1 };

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval,
        groupData: true,
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 60 }),
        tooltip: am5.Tooltip.new(root, { pointerOrientation: "horizontal" }),
      }),
    );
    xAxis.get("tooltip").label.setAll({
      text: isWeekly ? "{value.formatDate('dd MMM')} неделя" : "{value.formatDate('dd MMM')}",
    });

    const countAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        numberFormat: "#,###",
        min: 0,
      }),
    );

    const priceAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
        numberFormat: "#,###",
        min: 0,
      }),
    );

    const percentAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: "#'%'",
      }),
    );

    const axisMap = {
      count: countAxis,
      price: priceAxis,
      count_percent: percentAxis,
      price_percent: percentAxis,
    };

    const seriesData = data?.map((d) => {
      const cat = d.categories.find((c) => c.name === rowName);
      return {
        date: new Date(d.date).getTime(),
        count: cat?.count ?? 0,
        price: cat?.price ?? 0,
        count_percent: cat?.count_percent ?? 0,
        price_percent: cat?.price_percent ?? 0,
      };
    });

    metrics.forEach(({ key, label, color }) => {
      const isPercent = key.includes("percent");

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
            labelText: isPercent
              ? "{name}: {valueY.formatNumber('#.##')}%"
              : "{name}: {valueY.formatNumber('#,###')}",
          }),
        }),
      );

      // Line style
      series.strokes.template.setAll({ strokeWidth: 2, stroke: am5.color(color) });

      // Optional point bullets
      series.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: am5.color(color),
            strokeWidth: 1,
            stroke: root.interfaceColors.get("background"),
          }),
        }),
      );

      series.data.setAll(seriesData);
    });

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.snapToSeries = chart.series.values;
    cursor.lineY.set("visible", false);

    chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));

    return () => root.dispose();
  }, [data, rowName, metrics, step]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: 400 }}
    />
  );
}
