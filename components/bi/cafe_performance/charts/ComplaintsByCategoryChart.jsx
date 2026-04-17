"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";
import { CP_CHART_HEIGHT } from "../layout";

export default function ComplaintsByCategoryChart({ data = [] }) {
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
        paddingLeft: 0,
      }),
    );

    const chartData = [...data]
      .map((item) => ({
        category: item.category_name,
        value: Number(item.complaints_per_100_items || 0),
        complaints: Number(item.complaints_count || 0),
        items: Number(item.item_count || 0),
      }))
      .sort((a, b) => b.value - a.value);

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          minGridDistance: 20,
        }),
      }),
    );

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        valueXField: "value",
        categoryYField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText:
            "{category}: {valueX.formatNumber('#.0')} / 100\nЖалоб: {complaints} из {items}",
        }),
      }),
    );

    series.columns.template.setAll({
      cornerRadiusTR: 10,
      cornerRadiusBR: 10,
      strokeOpacity: 0,
      fill: am5.color(0xef6c00),
      height: am5.percent(65),
    });

    yAxis.data.setAll(chartData);
    series.data.setAll(chartData);

    return () => {
      root.dispose();
    };
  }, [data]);

  if (!data.length) return <EmptyState />;

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: CP_CHART_HEIGHT.regular }}
    />
  );
}
