"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";

const months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const formatValue = (value) =>
  Number(value || 0)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const buildSharedTooltip = ({ month, seriesItems, valueSuffix }) => {
  const rows = seriesItems
    .map((item) => ({
      ...item,
      value: item.values[month.index],
    }))
    .filter((item) => item.value !== null && item.value !== undefined);

  return [
    `[bold]${month.fullName}[/]`,
    ...rows.map(
      (item) =>
        `[#${item.color.replace("#", "")}]●[/] ${item.name}: [bold]${formatValue(item.value)}[/] ${valueSuffix}`,
    ),
  ].join("\n");
};

export default function StatSaleMonthlyLineChart({
  title,
  series = [],
  valueSuffix = "шт",
  emptyText = "Нет данных для отображения",
  height = 560,
}) {
  const chartRef = useRef(null);

  const chartSeries = useMemo(
    () =>
      series
        .filter((item) => item?.values?.some((value) => value !== null && value !== undefined))
        .map((item) => ({
          ...item,
          color: item.color || "#000000",
          values: months.map((_, index) => item.values[index] ?? null),
        })),
    [series],
  );

  useLayoutEffect(() => {
    if (!chartRef.current || !chartSeries.length) return;

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
      root.numberFormatter.setAll({
        numberFormat: "#,###",
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
          layout: root.verticalLayout,
          paddingTop: 8,
          paddingRight: 18,
          paddingBottom: 0,
          paddingLeft: 0,
        }),
      );

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 40,
        strokeOpacity: 0.5,
      });
      xRenderer.labels.template.setAll({
        fontSize: 13,
        fontWeight: "600",
        fill: am5.color(0x5f5f5f),
        paddingTop: 10,
      });
      xRenderer.grid.template.setAll({
        stroke: am5.color(0xf0f0f0),
        strokeOpacity: 0.8,
      });

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "month",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {
            labelText: "{monthFull}",
          }),
        }),
      );
      xAxis.data.setAll(months.map((month, index) => ({ month, monthFull: monthNames[index] })));

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0,
      });
      yRenderer.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(0x5f5f5f),
        paddingRight: 10,
      });
      yRenderer.grid.template.setAll({
        stroke: am5.color(0xe0e0e0),
        strokeOpacity: 0.85,
      });
      yRenderer.axisFills.template.setAll({
        fill: am5.color(0xf5f5f5),
        fillOpacity: 0.7,
        visible: true,
      });

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          extraMax: 0.08,
          renderer: yRenderer,
          numberFormat: "#,###",
        }),
      );

      const cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
          xAxis,
          yAxis,
        }),
      );
      cursor.lineY.set("visible", false);
      cursor.lineX.setAll({
        stroke: am5.color(0x999999),
        strokeDasharray: [4, 4],
        strokeOpacity: 0.65,
      });

      const createTooltip = () => {
        const tooltipFill = am5.color(0x6f6f6f);
        const tooltip = am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{tooltipText}",
          getFillFromSprite: false,
          getStrokeFromSprite: false,
          autoTextColor: false,
        });
        tooltip.get("background").setAll({
          fill: tooltipFill,
          fillOpacity: 0.92,
          stroke: tooltipFill,
          strokeOpacity: 0.92,
        });
        tooltip.get("background").adapters.add("fill", () => tooltipFill);
        tooltip.get("background").adapters.add("stroke", () => tooltipFill);
        tooltip.label.setAll({
          fill: am5.color(0xffffff),
          fontSize: 13,
          fontWeight: "600",
        });
        return tooltip;
      };

      const buildSeriesData = (item, tooltipSeriesItems) =>
        months.map((month, index) => ({
          month,
          value: item.values[index],
          tooltipText: buildSharedTooltip({
            month: { name: month, fullName: monthNames[index], index },
            seriesItems: tooltipSeriesItems,
            valueSuffix,
          }),
        }));

      const createdSeries = [];
      const isEntryVisible = (entry) => entry.series.get("visible") !== false;

      const createSeries = (item) => {
        const itemSeries = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: item.name,
            xAxis,
            yAxis,
            categoryXField: "month",
            valueYField: "value",
            stroke: am5.color(item.color),
            fill: am5.color(item.color),
            connect: false,
            tooltip: createTooltip(),
            legendLabelText: item.isMain ? `[bold]${item.name}[/]` : "{name}",
          }),
        );

        itemSeries.strokes.template.setAll({
          strokeWidth: item.isMain ? 6 : 2.5,
          strokeOpacity: item.isMain ? 0.95 : 0.9,
        });

        itemSeries.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: item.isMain ? 5.5 : 4.5,
              fill: am5.color(item.color),
              stroke: am5.color(0xffffff),
              strokeWidth: item.isMain ? 3 : 2,
            }),
          }),
        );

        itemSeries.data.setAll(buildSeriesData(item, chartSeries));
        itemSeries.appear(500);
        createdSeries.push({ item, series: itemSeries });
        return itemSeries;
      };

      const mainSeries = chartSeries.find((item) => item.isMain);
      if (mainSeries) {
        createSeries(mainSeries);
      }
      chartSeries
        .filter((item) => !item.isMain)
        .forEach((item) => {
          createSeries(item);
        });

      const createdMainSeries = chart.series.values.find(
        (item) => item.get("name") === mainSeries?.name,
      );
      createdMainSeries?.toFront();

      const updateAverageSeries = () => {
        const mainEntry = createdSeries.find((entry) => entry.item.isMain);
        const yearEntries = createdSeries.filter((entry) => !entry.item.isMain);
        if (!mainEntry) return;

        const visibleYearEntries = yearEntries.filter(isEntryVisible);
        const averageEntries = visibleYearEntries.filter(
          (entry) => entry.item.includedInAverage !== false,
        );
        const averageValues = months.map((_, index) => {
          let sum = 0;
          let count = 0;

          averageEntries.forEach((entry) => {
            const value = entry.item.values[index];
            if (value !== null && value !== undefined) {
              sum += Number(value);
              count += 1;
            }
          });

          return count > 0 ? sum / count : null;
        });
        const averageItem = {
          ...mainEntry.item,
          values: averageValues,
        };
        const tooltipSeriesItems = [
          ...(isEntryVisible(mainEntry) ? [averageItem] : []),
          ...visibleYearEntries.map((entry) => entry.item),
        ];

        mainEntry.series.data.setAll(buildSeriesData(averageItem, tooltipSeriesItems));
        yearEntries.forEach((entry) => {
          entry.series.data.setAll(buildSeriesData(entry.item, tooltipSeriesItems));
        });
      };
      createdSeries.forEach((entry) => {
        entry.series.on("visible", () => {
          root.events.once("frameended", updateAverageSeries);
        });
      });

      cursor.set("snapToSeries", chart.series.values);

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 14,
          marginBottom: 0,
          layout: root.horizontalLayout,
          clickTarget: "itemContainer",
        }),
      );
      legend.labels.template.setAll({
        fontSize: 13,
        fontWeight: "600",
        fill: am5.color(0x222222),
      });
      legend.labels.template.adapters.add("fontWeight", (fontWeight, target) => {
        const context = target.dataItem?.dataContext;
        const name = typeof context?.get === "function" ? context.get("name") : context?.name;
        return name === mainSeries?.name ? "700" : fontWeight;
      });
      legend.markers.template.setAll({
        width: 14,
        height: 14,
      });
      legend.data.setAll(chart.series.values);

      chart.appear(600, 100);
    };

    initChart();

    return () => {
      disposed = true;
      root?.dispose();
    };
  }, [chartSeries, valueSuffix]);

  if (!chartSeries.length) {
    return (
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3, textAlign: "center" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ textAlign: "center", mb: 3 }}
        >
          {title}
        </Typography>
        <Typography color="textSecondary">{emptyText}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          textAlign: "center",
          mb: 2,
          fontWeight: 600,
          color: "#333",
        }}
      >
        {title}
      </Typography>
      <Box
        ref={chartRef}
        sx={{
          width: "100%",
          height,
        }}
      />
    </Box>
  );
}
