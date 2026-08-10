"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

const SERIES_CONFIG = [
  {
    key: "spend",
    name: "Расходы",
    color: 0x3975ea,
    suffix: " ₽",
    numberFormat: "#,###.##",
    axis: "spend",
  },
  {
    key: "conversions",
    name: "Конверсии",
    color: 0x2eaf6d,
    suffix: "",
    numberFormat: "#,###",
    axis: "conversions",
  },
  {
    key: "cpa",
    name: "CPA",
    color: 0x8b5cf6,
    suffix: " ₽",
    numberFormat: "#,###.##",
    axis: "cpa",
  },
  {
    key: "ctr",
    name: "CTR",
    color: 0xf59e0b,
    suffix: "%",
    numberFormat: "#,###.##",
    axis: "ctr",
  },
];

export default function AiDailyMetricsChart({ items = [] }) {
  const chartRef = useRef(null);
  const data = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .filter((item) => item?.date && dayjs(item.date).isValid())
        .map((item) => ({
          date: dayjs(item.date).startOf("day").valueOf(),
          spend: Number.isFinite(Number(item.spend)) ? Number(item.spend) : null,
          conversions: Number.isFinite(Number(item.conversions)) ? Number(item.conversions) : null,
          cpa: Number.isFinite(Number(item.cpa)) ? Number(item.cpa) : null,
          ctr: Number.isFinite(Number(item.ctr)) ? Number(item.ctr) : null,
        }))
        .sort((a, b) => a.date - b.date),
    [items],
  );

  useLayoutEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    let root;
    let disposed = false;

    const initChart = async () => {
      const am5 = await import("@amcharts/amcharts5");
      const am5xy = await import("@amcharts/amcharts5/xy");
      const am5themes_Animated = await import("@amcharts/amcharts5/themes/Animated");
      const am5locales_ru_RU = await import("@amcharts/amcharts5/locales/ru_RU");

      if (disposed || !chartRef.current) return;

      root = am5.Root.new(chartRef.current);
      root.locale = am5locales_ru_RU.default;
      root.setThemes([am5themes_Animated.default.new(root)]);
      root.dateFormatter.setAll({
        dateFormat: "dd MMM",
        dateFields: ["valueX"],
      });
      root.numberFormatter.setAll({
        numberFormat: "#,###.##",
        bigNumberPrefixes: [
          { number: 1e3, suffix: "K" },
          { number: 1e6, suffix: "M" },
        ],
      });

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          paddingTop: 6,
          paddingRight: 4,
          paddingBottom: 0,
          paddingLeft: 4,
          layout: root.verticalLayout,
        }),
      );

      const legend = chart.children.push(
        am5.Legend.new(root, {
          width: am5.percent(100),
          centerX: am5.p50,
          x: am5.p50,
          layout: root.horizontalLayout,
          marginBottom: 12,
        }),
      );
      legend.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(0x4b5563),
      });
      legend.valueLabels.template.set("forceHidden", true);
      legend.markers.template.setAll({ width: 10, height: 10 });

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 55,
      });
      xRenderer.grid.template.setAll({
        stroke: am5.color(0xe8ebf0),
        strokeOpacity: 0.7,
      });
      xRenderer.labels.template.setAll({
        fontSize: 11,
        fill: am5.color(0x6b7280),
        paddingTop: 8,
      });

      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: "day", count: 1 },
          renderer: xRenderer,
          tooltipDateFormat: "dd MMMM yyyy",
          dateFormats: {
            day: "dd MMM",
          },
          periodChangeDateFormats: {
            day: "dd MMM",
          },
        }),
      );

      const createValueAxis = ({ opposite = false, visible = true, numberFormat }) => {
        const renderer = am5xy.AxisRendererY.new(root, {
          opposite,
          minGridDistance: 32,
        });
        renderer.grid.template.setAll({
          stroke: am5.color(0xe8ebf0),
          strokeOpacity: visible ? 0.75 : 0,
        });
        renderer.labels.template.setAll({
          visible,
          fontSize: 11,
          fill: am5.color(0x6b7280),
          paddingLeft: opposite ? 8 : 0,
          paddingRight: opposite ? 0 : 8,
        });
        renderer.ticks.template.set("visible", false);

        return chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            min: 0,
            extraMax: 0.12,
            renderer,
            numberFormat,
          }),
        );
      };

      const axes = {
        spend: createValueAxis({ numberFormat: "#.#a ₽" }),
        conversions: createValueAxis({
          opposite: true,
          numberFormat: "#,###",
        }),
        cpa: createValueAxis({
          opposite: true,
          visible: false,
          numberFormat: "#.#a ₽",
        }),
        ctr: createValueAxis({
          opposite: true,
          visible: false,
          numberFormat: "#.##'%'",
        }),
      };

      const createdSeries = SERIES_CONFIG.map((config) => {
        const color = am5.color(config.color);
        const tooltip = am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          getFillFromSprite: false,
          getStrokeFromSprite: false,
          autoTextColor: false,
          labelText: `[bold]{valueX.formatDate('dd MMMM yyyy')}[/]\n${config.name}: [bold]{valueY.formatNumber('${config.numberFormat}')}[/]${config.suffix}`,
        });
        tooltip.get("background").setAll({
          fill: am5.color(0x1f2937),
          fillOpacity: 0.95,
          stroke: color,
          strokeWidth: 2,
          cornerRadius: 8,
        });
        tooltip.label.setAll({
          fill: am5.color(0xffffff),
          fontSize: 12,
        });

        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: config.name,
            xAxis,
            yAxis: axes[config.axis],
            valueXField: "date",
            valueYField: config.key,
            stroke: color,
            fill: color,
            connect: false,
            tooltip,
          }),
        );

        series.strokes.template.setAll({
          strokeWidth: 2.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        });
        series.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 3.5,
              fill: color,
              stroke: am5.color(0xffffff),
              strokeWidth: 1.5,
            }),
          }),
        );
        series.data.setAll(data);
        series.appear(500);
        return series;
      });

      legend.data.setAll(createdSeries);

      const cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
          xAxis,
          snapToSeries: createdSeries,
        }),
      );
      cursor.lineY.set("visible", false);
      cursor.lineX.setAll({
        stroke: am5.color(0x9ca3af),
        strokeDasharray: [4, 4],
        strokeOpacity: 0.8,
      });

      chart.appear(600, 100);
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
        >
          Нет данных по дням для построения графика
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
