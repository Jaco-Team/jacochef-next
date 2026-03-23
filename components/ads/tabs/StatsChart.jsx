"use client";

import { useLayoutEffect, useRef } from "react";
import { Box, DialogContent } from "@mui/material";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";

export default function StatsChart({ data = [] }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !data?.length) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    root.locale = am5locales_ru_RU;

    const prepared = data.map((d) => ({
      ...d,
      date: new Date(d.date).getTime(),
    }));

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        layout: root.verticalLayout,
      }),
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      }),
    );

    const yAxisMain = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const yAxisSpend = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
      }),
    );

    function createSeries(name, field, axis, color) {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name,
          xAxis,
          yAxis: axis,
          valueYField: field,
          valueXField: "date",
          stroke: am5.color(color),
          fill: am5.color(color),
          tooltip: am5.Tooltip.new(root, {
            labelText:
              "{name}: {valueY}\nCTR: {ctr.formatNumber('#.##')}%\nCPC: {cpc.formatNumber('#.##')}",
          }),
        }),
      );

      series.strokes.template.setAll({ strokeWidth: 2 });

      series.data.setAll(prepared);

      return series;
    }

    createSeries("Показы", "impressions", yAxisMain, 0x3b82f6);
    createSeries("Клики", "clicks", yAxisMain, 0x22c55e);
    createSeries("Конверсии", "conversions", yAxisMain, 0xf59e0b);
    createSeries("Расход", "spend", yAxisSpend, 0xef4444);

    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis,
        behavior: "zoomX",
      }),
    );

    const legend = chart.children.push(
      am5.Legend.new(root, {
        x: am5.percent(100),
        centerX: am5.percent(100),
        layout: root.horizontalLayout,
      }),
    );

    legend.data.setAll(chart.series.values);

    legend.itemContainers.template.setAll({
      cursorOverStyle: "pointer",
    });

    legend.itemContainers.template.events.on("click", function (ev) {
      const series = ev.target.dataItem.dataContext;
      series.set("visible", !series.get("visible"));
    });

    return () => root.dispose();
  }, [data]);

  return (
    <DialogContent
      dividers
      sx={{ pt: 4 }}
    >
      <Box
        ref={chartRef}
        sx={{ width: "100%", height: 420 }}
      />
    </DialogContent>
  );
}
