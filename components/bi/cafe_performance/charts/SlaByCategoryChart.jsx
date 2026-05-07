"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";
import { getSlaColor } from "../config";
import { CP_CHART_HEIGHT } from "../layout";

export default function SlaByCategoryChart({ data = [] }) {
  const chartRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return undefined;

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
      }),
    );

    const chartData = [...data]
      .map((item) => ({
        category: item.category_name,
        sla: Number(item.sla || 0),
        sample: Number(item.sample_size || 0),
        full: 100,
      }))
      .sort((a, b) => b.sla - a.sla);

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          minGridDistance: 20,
        }),
      }),
    );
    yAxis.get("renderer").labels.template.setAll({
      interactive: true,
      cursorOverStyle: "pointer",
      populateText: true,
      tooltipText: "SLA: {sla.formatNumber('#.0')}%",
      tooltip: am5.Tooltip.new(root, {
        labelText: "SLA: {sla.formatNumber('#.0')}%",
      }),
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        clustered: false,
        valueXField: "sla",
        categoryYField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText: "SLA: {valueX.formatNumber('#.0')}%",
        }),
      }),
    );
    const backgroundSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        clustered: false,
        valueXField: "full",
        categoryYField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText: "SLA: {sla.formatNumber('#.0')}%",
        }),
      }),
    );

    backgroundSeries.columns.template.setAll({
      cornerRadiusTR: 10,
      cornerRadiusBR: 10,
      strokeOpacity: 0,
      fill: am5.color(0x000000),
      fillOpacity: 0.06,
      height: am5.percent(70),
      tooltipText: "SLA: {sla.formatNumber('#.0')}%",
      interactive: true,
      cursorOverStyle: "pointer",
    });

    series.columns.template.setAll({
      cornerRadiusTR: 10,
      cornerRadiusBR: 10,
      strokeOpacity: 0,
      height: am5.percent(70),
      tooltipText: "SLA: {valueX.formatNumber('#.0')}%",
      interactive: true,
      cursorOverStyle: "pointer",
    });
    series.columns.template.adapters.add("fill", (fill, target) => {
      const value = target.dataItem?.dataContext?.sla;
      return am5.Color.fromString(getSlaColor(value));
    });
    series.columns.template.adapters.add("stroke", (stroke, target) => {
      const value = target.dataItem?.dataContext?.sla;
      return am5.Color.fromString(getSlaColor(value));
    });

    yAxis.data.setAll(chartData);
    backgroundSeries.data.setAll(chartData);
    series.data.setAll(chartData);

    return () => {
      root.dispose();
      rootRef.current = null;
    };
  }, [data]);

  if (!data.length) return <EmptyState />;

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: CP_CHART_HEIGHT.compact }}
    />
  );
}
