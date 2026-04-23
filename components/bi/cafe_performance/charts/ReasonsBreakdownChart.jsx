"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";
import { CP_CHART_HEIGHT } from "../layout";

const normalizeReasonLabel = (reason) => {
  if (reason == null) return "";
  if (typeof reason === "string") return reason.trim();
  if (typeof reason === "object") {
    return String(
      reason.name || reason.label || reason.reason_name || reason.reason_code || "",
    ).trim();
  }
  return String(reason).trim();
};

const buildReasonLabel = (item) => {
  const singleLabel = normalizeReasonLabel(
    item?.reason_name || item?.label || item?.reason || item?.reason_code,
  );

  const groupedReasons = [
    ...(Array.isArray(item?.reasons) ? item.reasons : []),
    ...(Array.isArray(item?.reason_list) ? item.reason_list : []),
    ...(Array.isArray(item?.reason_names) ? item.reason_names : []),
  ]
    .map(normalizeReasonLabel)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  if (groupedReasons.length > 1) {
    return `${groupedReasons[0]} и еще ${groupedReasons.length - 1}`;
  }

  if (groupedReasons.length === 1) {
    return groupedReasons[0];
  }

  return singleLabel || "—";
};

const PALETTE = ["#1565C0", "#2E7D32", "#EF6C00", "#8E24AA", "#D81B60", "#00838F", "#6D4C41"];

export default function ReasonsBreakdownChart({ data = [] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return undefined;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.horizontalLayout,
        innerRadius: am5.percent(55),
      }),
    );

    chart.seriesContainer.setAll({
      width: am5.percent(40),
      minWidth: 240,
    });

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "count",
        categoryField: "label",
        legendValueText: "{valuePercentTotal.formatNumber('#.0')}%",
        legendLabelText: "{category}",
      }),
    );

    series.slices.template.setAll({
      tooltipText: "{category}: {value} ({valuePercentTotal.formatNumber('#.0')}%)",
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
    });

    series.labels.template.set("forceHidden", true);
    series.ticks.template.set("forceHidden", true);

    series.get("colors").set(
      "colors",
      PALETTE.map((color) => am5.color(color)),
    );

    series.data.setAll(
      data.map((item) => ({
        label: buildReasonLabel(item),
        count: Number(item.count || 0),
      })),
    );

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerY: am5.p50,
        y: am5.p50,
        layout: root.verticalLayout,
        marginLeft: 24,
        width: am5.percent(60),
        useDefaultMarker: true,
      }),
    );

    legend.markers.template.setAll({ width: 10, height: 10 });
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      cornerRadiusBL: 5,
      cornerRadiusBR: 5,
    });
    legend.labels.template.setAll({
      fontSize: 13,
      fill: am5.color(0x1f2937),
      oversizedBehavior: "wrap",
      maxWidth: 280,
    });
    legend.valueLabels.template.setAll({
      fontSize: 13,
      fontWeight: "600",
      fill: am5.color(0x1f2937),
    });

    legend.data.setAll(series.dataItems);

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
