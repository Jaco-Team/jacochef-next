"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import dayjs from "dayjs";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";
import { getOrderTypeColor, getOrderTypeLabel, sortByOrderTypes } from "../config";

export default function DeliveryTrendChart({ data = [], orderTypes = [], orderTypeNameMap = {} }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return undefined;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
      }),
    );

    const rows = data
      .map((item) => ({
        date: dayjs(item.date).valueOf(),
        order_type: item.order_type,
        p50: Math.max(0, Number(item.p50 || 0)),
      }))
      .filter((item) => Number.isFinite(item.date) && Number.isFinite(item.p50))
      .sort((a, b) => a.date - b.date);

    const trendOrderTypes = sortByOrderTypes(
      [...new Set(rows.map((item) => item.order_type))].map((orderType) => ({
        order_type: orderType,
      })),
      orderTypes,
    ).map((item) => item.order_type);

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      }),
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    trendOrderTypes.forEach((orderType, index) => {
      const color = getOrderTypeColor(orderType, index);
      const series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: getOrderTypeLabel(orderType, orderTypeNameMap),
          xAxis,
          yAxis,
          valueYField: "p50",
          valueXField: "date",
          stroke: am5.color(color),
          fill: am5.color(color),
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}\n{valueX.formatDate('dd.MM.yyyy')}: {valueY}",
          }),
        }),
      );

      series.strokes.template.setAll({ strokeWidth: 3 });
      series.data.setAll(rows.filter((item) => item.order_type === orderType));
      series.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: am5.color(color),
            stroke: am5.color(0xffffff),
            strokeWidth: 2,
          }),
        }),
      );
    });

    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));
    legend.data.setAll(chart.series.values);

    return () => {
      root.dispose();
    };
  }, [data, orderTypeNameMap, orderTypes]);

  if (!data.length) return <EmptyState />;

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: 360 }}
    />
  );
}
