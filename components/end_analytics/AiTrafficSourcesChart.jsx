"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const COLORS = [0x3975ea, 0x2eaf6d, 0x5dd2ba, 0x8b5cf6, 0xf59e0b, 0xef5350, 0x64748b];

export default function AiTrafficSourcesChart({ items = [] }) {
  const chartRef = useRef(null);
  const data = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .map((item) => ({
          name: String(item?.name || "Неизвестный источник"),
          value: Number(item?.value) || 0,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [items],
  );

  useLayoutEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    let root;
    let disposed = false;

    const initChart = async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5percent = await import("@amcharts/amcharts5/percent");
      const am5themes_Animated = await import("@amcharts/amcharts5/themes/Animated");
      const am5locales_ru_RU = await import("@amcharts/amcharts5/locales/ru_RU");

      if (disposed || !chartRef.current) return;

      root = am5.Root.new(chartRef.current);
      root.locale = am5locales_ru_RU.default;
      root.setThemes([am5themes_Animated.default.new(root)]);
      root.numberFormatter.setAll({
        numberFormat: "#,###.##",
        bigNumberPrefixes: [
          { number: 1e3, suffix: "K" },
          { number: 1e6, suffix: "M" },
        ],
      });

      const chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.horizontalLayout,
          innerRadius: am5.percent(65),
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 0,
          paddingRight: 0,
        }),
      );

      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          name: "Источники",
          valueField: "value",
          categoryField: "name",
          alignLabels: false,
          legendLabelText: "{category}\n[fontSize:10 #9ca3af]{value.formatNumber('#,###.##')} ₽[/]",
          legendValueText: "{valuePercentTotal.formatNumber('0.0')}%",
          tooltip: am5.Tooltip.new(root, {
            labelText:
              "[bold]{category}[/]\nРасходы: [bold]{value.formatNumber('#,###.##')} ₽[/]\nДоля: {valuePercentTotal.formatNumber('0.0')}%",
          }),
        }),
      );

      series.get("colors").set(
        "colors",
        COLORS.map((color) => am5.color(color)),
      );
      series.labels.template.set("forceHidden", true);
      series.ticks.template.set("forceHidden", true);
      series.slices.template.setAll({
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
        cornerRadius: 4,
        toggleKey: "none",
        cursorOverStyle: "pointer",
      });
      series.slices.template.states.create("hover", {
        scale: 1.04,
      });

      series.data.setAll(data);

      const total = data.reduce((sum, item) => sum + item.value, 0);
      const centerContainer = series.children.push(
        am5.Container.new(root, {
          centerX: am5.p50,
          centerY: am5.p50,
          x: am5.p50,
          y: am5.p50,
          layout: root.verticalLayout,
        }),
      );
      centerContainer.children.push(
        am5.Label.new(root, {
          text: `${Math.round(total).toLocaleString("ru-RU")} ₽`,
          centerX: am5.p50,
          x: am5.p50,
          fontSize: 16,
          fontWeight: "700",
          fill: am5.color(0x1f2937),
        }),
      );
      centerContainer.children.push(
        am5.Label.new(root, {
          text: "Всего расходов",
          centerX: am5.p50,
          x: am5.p50,
          fontSize: 11,
          fill: am5.color(0x6b7280),
        }),
      );

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerY: am5.p50,
          y: am5.p50,
          width: am5.percent(48),
          marginLeft: 12,
          layout: root.verticalLayout,
          clickTarget: "itemContainer",
        }),
      );
      legend.labels.template.setAll({
        fontSize: 11,
        fill: am5.color(0x374151),
        maxWidth: 130,
        oversizedBehavior: "truncate",
        lineHeight: 16,
      });
      legend.valueLabels.template.setAll({
        fontSize: 11,
        fontWeight: "600",
        fill: am5.color(0x374151),
      });
      legend.markers.template.setAll({ width: 10, height: 10 });
      legend.data.setAll(series.dataItems);

      series.appear(700, 100);
    };

    initChart();

    return () => {
      disposed = true;
      root?.dispose();
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <Box sx={{ minHeight: 260, display: "grid", placeItems: "center" }}>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          Нет расходов по источникам для построения графика
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={chartRef}
      sx={{ width: "100%", height: { xs: 320, md: 380 } }}
    />
  );
}
