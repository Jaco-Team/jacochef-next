"use client";

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
const yearColors = {
  2026: "#e53935",
  2025: "#1e88e5",
  2024: "#43a047",
  2023: "#fdd835",
  2022: "#8e24aa",
  2021: "#fb8c00",
};

const groupByYear = (data) => {
  if (!data || Object.keys(data).length === 0) return {};
  const grouped = {};
  Object.keys(data).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (!grouped[year]) grouped[year] = {};
    grouped[year][month] = data[key];
  });
  return grouped;
};

const calculateMonthlyAverage = (groupedData) => {
  const monthlySums = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  Object.values(groupedData).forEach((yearData) => {
    for (let month = 1; month <= 12; month++) {
      const val = yearData[month];
      if (val !== null && val !== undefined) {
        monthlySums[month - 1] += val;
        monthlyCounts[month - 1] += 1;
      }
    }
  });
  return monthlySums.map((sum, idx) => (monthlyCounts[idx] > 0 ? sum / monthlyCounts[idx] : null));
};

export default function StatSaleYearlyLineChart({ rawData, title }) {
  const chartRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [modules, setModules] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadAmCharts = async () => {
      try {
        const am5 = await import("@amcharts/amcharts5");
        const am5xy = await import("@amcharts/amcharts5/xy");
        const am5themes_Animated = await import("@amcharts/amcharts5/themes/Animated");
        setModules({ am5, am5xy, am5themes_Animated });
      } catch (error) {
        console.error("Failed to load amCharts:", error);
      }
    };

    loadAmCharts();
  }, [isClient]);

  useLayoutEffect(() => {
    if (!isClient || !modules || !rawData || Object.keys(rawData).length === 0) return;

    const { am5, am5xy, am5themes_Animated } = modules;

    const groupedData = groupByYear(rawData);
    const years = Object.keys(groupedData).sort();
    if (years.length === 0) return;

    const averageValues = calculateMonthlyAverage(groupedData);
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.default.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        background: am5.Rectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0,
        }),
      }),
    );

    // Сначала создаем оси
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "month",
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
          minorGridEnabled: true,
          stroke: am5.color(0xdddddd),
          strokeWidth: 1,
        }),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{category}",
        }),
      }),
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          stroke: am5.color(0xdddddd),
          strokeWidth: 1,
        }),
        min: 0,
        extraMin: 0.05,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    // Теперь создаем курсор (после создания осей)
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
        xAxis: xAxis,
        yAxis: yAxis,
        lineX: am5.Line.new(root, {
          stroke: am5.color(0x000000),
          strokeWidth: 1,
          strokeDasharray: [4, 4],
        }),
        lineY: am5.Line.new(root, {
          stroke: am5.color(0x000000),
          strokeWidth: 1,
          strokeDasharray: [4, 4],
        }),
      }),
    );
    cursor.lineY.set("visible", false);

    const xData = months.map((m, idx) => ({ month: m, monthIndex: idx }));
    xAxis.data.setAll(xData);

    // Функция создания серии
    const createSeries = (year, dataMap, color, isAverage = false) => {
      const seriesData = months
        .map((_, idx) => {
          const monthNum = idx + 1;
          const value = isAverage ? averageValues[idx] : (dataMap?.[monthNum] ?? null);
          return { month: months[idx], value: value, monthIndex: idx };
        })
        .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

      // Фильтруем null значения для плавной линии
      const filteredData = seriesData.filter((item) => item.value !== null);

      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: isAverage ? "Среднее значение" : year.toString(),
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "month",
          stroke: am5.color(color),
          fill: am5.color(color),
          fillOpacity: 0.05,
          strokeWidth: 3,
          strokeDasharray: isAverage ? [8, 4] : [0],
          tension: 0.3,
          tooltip: am5.Tooltip.new(root, {
            labelText: isAverage
              ? `[bold]{name}[/]\nСреднее: [bold]{valueY.formatNumber('#.0')}[/] шт`
              : `[bold]{name}[/]\n{categoryX}: [bold]{valueY.formatNumber('#.0')}[/] шт`,
            background: am5.RoundedRectangle.new(root, {
              fill: am5.color(0x000000),
              fillOpacity: 0.85,
              cornerRadiusTL: 6,
              cornerRadiusTR: 6,
              cornerRadiusBL: 6,
              cornerRadiusBR: 6,
            }),
            label: {
              fill: am5.color(0xffffff),
              fontSize: 12,
              fontWeight: "500",
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 12,
              paddingRight: 12,
            },
          }),
        }),
      );

      // Устанавливаем данные только с не-null значениями
      series.data.setAll(filteredData);

      // Добавляем маркеры только на точки с данными
      series.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(color),
            stroke: am5.color(0xffffff),
            strokeWidth: 2,
            visible: true,
          }),
        });
      });

      // Добавляем эффект при наведении
      series.strokes.template.adapters.add("strokeWidth", (width, target) => {
        if (target.get("isHover")) {
          return 4;
        }
        return width;
      });

      // Анимация при появлении
      series.appear(1000, 100);

      return series;
    };

    // Добавляем серии для каждого года
    years.forEach((year) => {
      const color = yearColors[year] || "#000000";
      createSeries(year, groupedData[year], color, false);
    });

    // Добавляем серию среднего значения
    const hasAnyAverage = averageValues.some((v) => v !== null);
    if (hasAnyAverage) {
      createSeries(null, null, "#9e9e9e", true);
    }

    // Улучшенная легенда
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        layout: root.horizontalLayout,
        marginTop: 10,
        marginBottom: 10,
        background: am5.RoundedRectangle.new(root, {
          fillOpacity: 0,
        }),
      }),
    );

    // Стилизация элементов легенды
    legend.labels.template.setAll({
      fontSize: 12,
      fontWeight: "500",
    });

    legend.markers.template.setAll({
      width: 15,
      height: 15,
      cornerRadiusTR: 3,
      cornerRadiusBR: 3,
      cornerRadiusTL: 3,
      cornerRadiusBL: 3,
    });

    legend.data.setAll(chart.series.values);

    // Отключаем скрытие серий
    chart.series.values.forEach((series) => {
      series.set("hidden", false);
      series.events.disableType("click");
    });

    legend.itemContainers.template.events.on("click", (e) => e.stopPropagation());

    // Настройка осей
    xAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      fontWeight: "600",
      fill: am5.color(0x666666),
    });

    xAxis.get("renderer").grid.template.setAll({
      stroke: am5.color(0xf0f0f0),
      strokeWidth: 1,
    });

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 11,
      fill: am5.color(0x666666),
    });

    yAxis.get("renderer").grid.template.setAll({
      stroke: am5.color(0xf0f0f0),
      strokeWidth: 1,
      strokeDasharray: [4, 4],
    });

    // Добавляем подписи значений на оси Y
    yAxis.get("renderer").labels.template.adapters.remove("text");
    yAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
      // Получаем значение из dataItem
      const dataItem = target.dataItem;
      if (dataItem) {
        const value = dataItem.get("value");
        if (value !== undefined && !isNaN(value)) {
          // Форматируем число в зависимости от размера
          if (value >= 10000) {
            return Math.round(value / 1000) + "K";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
          }
          return Math.round(value).toString();
        }
      }
      return text;
    });

    // ИЛИ более простой способ - использовать numberFormatter
    yAxis.set(
      "numberFormatter",
      am5.NumberFormatter.new(root, {
        numberFormat: "#,###",
        bigNumberPrefixes: [
          { number: 1e3, suffix: "K" },
          { number: 1e6, suffix: "M" },
          { number: 1e9, suffix: "B" },
        ],
      }),
    );

    // Добавляем заголовки осей
    const xTitle = am5.Label.new(root, {
      text: "",
      fontSize: 12,
      fontWeight: "500",
      fill: am5.color(0x999999),
      centerX: am5.p50,
      centerY: am5.p100,
      y: 20,
    });

    const yTitle = am5.Label.new(root, {
      text: "Количество продаж",
      fontSize: 12,
      fontWeight: "500",
      fill: am5.color(0x999999),
      rotation: -90,
      centerX: am5.p0,
      centerY: am5.p50,
      x: -35,
    });

    chart.children.push(xTitle);
    chart.children.push(yTitle);

    return () => {
      root.dispose();
    };
  }, [rawData, modules, isClient]);

  if (!rawData || Object.keys(rawData).length === 0) {
    return (
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3, textAlign: "center" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ textAlign: "center", mb: 3 }}
        >
          {title}
        </Typography>
        <Typography color="textSecondary">Нет данных для отображения</Typography>
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
          mb: 3,
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
          height: 750,
          "& .am5-legend": {
            justifyContent: "center",
          },
        }}
      />
    </Box>
  );
}
