"use client";

import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Box } from "@mui/material";
import EmptyState from "../components/EmptyState";

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
        label: buildReasonLabel(item),
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
