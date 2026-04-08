"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";

export default function ReasonsBreakdownChart({ data = [] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return undefined;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "count",
        categoryField: "label",
        legendValueText: "{valuePercentTotal.formatNumber('#.0')}%",
      }),
    );

    series.slices.template.setAll({
      tooltipText: "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
      strokeWidth: 1,
      stroke: am5.color(0xffffff),
    });

    series.labels.template.setAll({
      text: "{category}",
      oversizedBehavior: "truncate",
      maxWidth: 140,
    });

    series.data.setAll(
      data.map((item) => ({
        label: item.reason_code === "UNKNOWN" ? "Без причины" : item.reason_code,
        count: Number(item.count || 0),
      })),
    );

    chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));

    return () => {
      root.dispose();
    };
  }, [data]);

  if (!data.length) return <EmptyState />;

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: 360 }}
    />
  );
}
