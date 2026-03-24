"use client";

import { useLayoutEffect, useRef } from "react";
import { Box, DialogContent } from "@mui/material";

export default function StatsChart({ data = [] }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !data?.length) return;

    let isDisposed = false;
    let root;

    const renderChart = async () => {
      try {
        const am5 = await import("@amcharts/amcharts5");
        const am5xy = await import("@amcharts/amcharts5/xy");
        const am5themesAnimated = await import("@amcharts/amcharts5/themes/Animated");
        const am5localesRu = await import("@amcharts/amcharts5/locales/ru_RU");

        if (isDisposed || !chartRef.current) return;

        root = am5.Root.new(chartRef.current);
        root.setThemes([am5themesAnimated.default.new(root)]);
        root.locale = am5localesRu.default;

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
      } catch (error) {
        console.error("Ошибка загрузки amCharts:", error);
      }
    };

    renderChart();

    return () => {
      isDisposed = true;
      root?.dispose();
    };
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
